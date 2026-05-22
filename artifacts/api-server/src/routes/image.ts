import { Router } from "express";
import { HUGGINGFACE_API_KEY } from "../lib/env.js";

const imageRouter = Router();

imageRouter.post("/image", async (req, res) => {
  if (!HUGGINGFACE_API_KEY) {
    res.status(503).json({ error: "Image generation is not configured (HUGGINGFACE_API_KEY missing)" });
    return;
  }

  const { prompt, style, aspectRatio } = req.body as {
    prompt?: string;
    style?: string;
    aspectRatio?: string;
  };

  if (!prompt) {
    res.status(400).json({ error: "prompt is required" });
    return;
  }

  const fullPrompt = [prompt, style ? `${style} style` : "", aspectRatio ? `aspect ratio ${aspectRatio}` : ""]
    .filter(Boolean)
    .join(", ");

  try {
    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: fullPrompt }),
      },
    );

    if (!hfRes.ok) {
      const text = await hfRes.text();
      req.log.error({ status: hfRes.status, text }, "HuggingFace error");
      res.status(hfRes.status).json({ error: "Image generation failed", detail: text });
      return;
    }

    const buffer = Buffer.from(await hfRes.arrayBuffer());
    res.setHeader("Content-Type", hfRes.headers.get("content-type") ?? "image/jpeg");
    res.send(buffer);
  } catch (err) {
    req.log.error({ err }, "Image generation error");
    res.status(500).json({ error: "Image generation failed" });
  }
});

export default imageRouter;
