import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { eq, desc } from "drizzle-orm";

const router = Router();

// GET /openai/conversations
router.get("/", async (req, res) => {
  try {
    const allConversations = await db
      .select()
      .from(conversations)
      .orderBy(desc(conversations.createdAt));
    res.json(allConversations);
  } catch (err) {
    req.log.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "Failed to list conversations" });
  }
});

// POST /openai/conversations
router.post("/", async (req, res) => {
  try {
    const { title } = req.body as { title: string };
    if (!title) {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const [conv] = await db
      .insert(conversations)
      .values({ title })
      .returning();
    res.status(201).json(conv);
  } catch (err) {
    req.log.error({ err }, "Failed to create conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /openai/conversations/:id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json({ ...conv, messages: msgs });
  } catch (err) {
    req.log.error({ err }, "Failed to get conversation");
    res.status(500).json({ error: "Failed to get conversation" });
  }
});

// DELETE /openai/conversations/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    await db.delete(conversations).where(eq(conversations.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete conversation");
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

// GET /openai/conversations/:id/messages
router.get("/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const msgs = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);
    res.json(msgs);
  } catch (err) {
    req.log.error({ err }, "Failed to list messages");
    res.status(500).json({ error: "Failed to list messages" });
  }
});

// POST /openai/conversations/:id/messages
router.post("/:id/messages", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { content } = req.body as { content: string };

    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    // Check conversation exists
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id));
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }

    // Save the user message
    await db.insert(messages).values({
      conversationId: id,
      role: "user",
      content,
    });

    // Get conversation history for context
    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, id))
      .orderBy(messages.createdAt);

    // Build messages array for OpenAI
    const chatMessages = [
      {
        role: "system" as const,
        content: `You are Mentora AI, a personalized learning and mentoring assistant for students. You are patient, encouraging, and adapt your explanations to the student's level. You help students understand concepts in Physics, Chemistry, Mathematics, Computer Science and other subjects. When explaining concepts, be clear and use examples. Keep responses focused and educational.`,
      },
      ...history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
    ];

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";

    const stream = await openai.chat.completions.create({
      model: "gpt-5.2",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        fullResponse += text;
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    // Save assistant message
    await db.insert(messages).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "Failed to send message");
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send message" });
    }
  }
});

export default router;
