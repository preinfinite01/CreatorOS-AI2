import { Router } from "express";
import { aiGenerationLimiter } from "../middleware/rateLimit.js";
import { HUGGINGFACE_API_KEY } from "../lib/env.js";

const router = Router();

const HF_URL = "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell";

async function generateFrame(prompt: string): Promise<string> {
  const res = await fetch(HF_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
    signal: AbortSignal.timeout(60_000),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FLUX error ${res.status}: ${text}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  return `data:image/jpeg;base64,${buffer.toString("base64")}`;
}

router.post("/video/generate", aiGenerationLimiter, async (req, res) => {
  const { prompt, style = "cinematic" } = req.body as { prompt?: string; style?: string };
  if (!prompt) { res.status(400).json({ error: "prompt required" }); return; }

  if (!HUGGINGFACE_API_KEY) {
    res.status(401).json({ error: "HuggingFace API key not configured." });
    return;
  }

  const framePrompts = [
    `${prompt}, ${style} style, establishing wide shot, ultra high quality, 8k`,
    `${prompt}, ${style} style, mid shot with dramatic lighting, cinematic depth of field`,
    `${prompt}, ${style} style, close-up detail shot, vivid colors, professional photography`,
    `${prompt}, ${style} style, atmospheric final frame, golden hour lighting, epic composition`,
  ];

  try {
    const frames = await Promise.all(framePrompts.map(generateFrame));

    res.json({
      frames,
      frameCount: frames.length,
      prompt,
      style,
    });
  } catch (err) {
    req.log.error({ err }, "Error generating video frames");
    res.status(500).json({ error: "Failed to generate video. Please try again." });
  }
});

export default router;
