import { Router } from "express";
import { aiGenerationLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/video/generate", aiGenerationLimiter, async (req, res) => {
  const { prompt, style = "cinematic" } = req.body as { prompt?: string; style?: string };
  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }

  const HF_KEY = process.env["HUGGINGFACE_API_KEY"];
  if (!HF_KEY) { res.status(401).json({ error: "HuggingFace API key not configured." }); return; }

  const styledPrompt = `${prompt}, ${style} style, high quality, smooth motion`;

  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/damo-vilab/text-to-video-ms-1.7b",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_KEY}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true",
        },
        body: JSON.stringify({ inputs: styledPrompt }),
        signal: AbortSignal.timeout(120_000),
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      req.log.error({ status: hfRes.status, errText }, "HuggingFace video error");
      res.status(502).json({ error: "Video generation failed. Model may be loading — try again in 60s." });
      return;
    }

    const videoBuffer = await hfRes.arrayBuffer();
    res.set("Content-Type", "video/mp4");
    res.set("Content-Disposition", `attachment; filename="creatoros-${Date.now()}.mp4"`);
    res.send(Buffer.from(videoBuffer));
  } catch (err) {
    req.log.error({ err }, "Error generating video");
    res.status(500).json({ error: "Failed to generate video. Please try again." });
  }
});

export default router;
