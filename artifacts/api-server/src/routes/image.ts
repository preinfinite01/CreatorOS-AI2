import { Router } from "express";

const imageRouter = Router();

imageRouter.post("/image", async (req, res) => {
  try {
    const { prompt, style, aspectRatio } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "HUGGINGFACE_API_KEY is not configured",
      });
    }

    const fullPrompt = [
      prompt,
      style ? `${style} style` : "",
      aspectRatio ? `aspect ratio ${aspectRatio}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const hfRes = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: fullPrompt }),
      }
    );

    if (!hfRes.ok) {
      const text = await hfRes.text();
      return res.status(hfRes.status).json({
        error: text,
      });
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", hfRes.headers.get("content-type") || "image/jpeg");

    return res.send(buffer);
  } catch (err) {
    return res.status(500).json({
      error: String(err),
    });
  }
});

export default imageRouter;
