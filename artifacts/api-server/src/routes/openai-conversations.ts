import { Router } from "express";
import { groq as openai, GROQ_MODEL } from "../lib/groq.js";
import { db, conversations as conversationsTable, messages as messagesTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateOpenaiConversationBody,
  GetOpenaiConversationParams,
  DeleteOpenaiConversationParams,
  ListOpenaiMessagesParams,
  SendOpenaiMessageParams,
  SendOpenaiMessageBody,
  GenerateOpenaiImageBody,
} from "@workspace/api-zod";

const router = Router();

router.get("/openai/conversations", async (req, res) => {
  try {
    const conversations = await db
      .select()
      .from(conversationsTable)
      .orderBy(desc(conversationsTable.createdAt));
    res.json(conversations);
  } catch (err) {
    req.log.error({ err }, "Error listing conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

router.post("/openai/conversations", async (req, res) => {
  const parsed = CreateOpenaiConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  try {
    const [conversation] = await db
      .insert(conversationsTable)
      .values({ title: parsed.data.title })
      .returning();
    res.status(201).json(conversation);
  } catch (err) {
    req.log.error({ err }, "Error creating conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

router.get("/openai/conversations/:id", async (req, res) => {
  const params = GetOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, params.data.id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, params.data.id))
      .orderBy(messagesTable.createdAt);
    res.json({ ...conversation, messages });
  } catch (err) {
    req.log.error({ err }, "Error getting conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

router.delete("/openai/conversations/:id", async (req, res) => {
  const params = DeleteOpenaiConversationParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const deleted = await db
      .delete(conversationsTable)
      .where(eq(conversationsTable.id, params.data.id))
      .returning();
    if (!deleted.length) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

router.get("/openai/conversations/:id/messages", async (req, res) => {
  const params = ListOpenaiMessagesParams.safeParse({ id: Number(req.params.id) });
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, params.data.id))
      .orderBy(messagesTable.createdAt);
    res.json(messages);
  } catch (err) {
    req.log.error({ err }, "Error listing messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

router.post("/openai/conversations/:id/messages", async (req, res) => {
  const params = SendOpenaiMessageParams.safeParse({ id: Number(req.params.id) });
  const body = SendOpenaiMessageBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    const [conversation] = await db
      .select()
      .from(conversationsTable)
      .where(eq(conversationsTable.id, params.data.id));
    if (!conversation) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    await db.insert(messagesTable).values({
      conversationId: params.data.id,
      role: "user",
      content: body.data.content,
    });

    const history = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.conversationId, params.data.id))
      .orderBy(messagesTable.createdAt);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const chatMessages = history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const stream = await openai.chat.completions.create({
      model: GROQ_MODEL,
      max_tokens: 4096,
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI assistant for content creators. You help with strategy, scripts, content ideas, and creator growth.",
        },
        ...chatMessages,
      ],
      stream: true,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(messagesTable).values({
      conversationId: params.data.id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
});

router.post("/openai/generate-image", async (req, res) => {
  res.status(410).json({ error: "Use POST /api/image for image generation (Hugging Face FLUX)" });
});

export default router;
