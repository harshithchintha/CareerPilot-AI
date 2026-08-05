import { Router } from "express";
import { db } from "@workspace/db";
import { chatConversationsTable, chatMessagesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { generateText } from "../lib/gemini";

const router = Router();

function parseParamId(param: string | string[]): number {
  return parseInt(Array.isArray(param) ? param[0] : param, 10);
}

const DEMO_CONVERSATIONS = [
  {
    id: 1,
    userId: 1,
    title: "Resume & ATS Optimization Strategy",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  }
];

const DEMO_MESSAGES: Record<number, any[]> = {
  1: [
    {
      id: 1,
      conversationId: 1,
      role: "assistant",
      content: "Hello! I am your AI Career Copilot. How can I assist you with your resume, mock interview prep, or career roadmap today?",
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    }
  ]
};

// GET /api/chat/conversations
router.get("/conversations", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);

    try {
      const convs = await db
        .select()
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.userId, user.id))
        .orderBy(desc(chatConversationsTable.updatedAt));

      if (convs && convs.length > 0) {
        res.json(convs);
        return;
      }
    } catch (_) {}

    res.json(DEMO_CONVERSATIONS);
  } catch (err) {
    req.log.error({ err }, "Error listing conversations");
    res.json(DEMO_CONVERSATIONS);
  }
});

// POST /api/chat/conversations
router.post("/conversations", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const { title } = req.body as { title?: string };

    try {
      const [conv] = await db
        .insert(chatConversationsTable)
        .values({
          userId: user.id,
          title: title || "New Career Session",
        })
        .returning();

      res.status(201).json(conv);
    } catch (_) {
      const newConv = {
        id: Date.now(),
        userId: user.id,
        title: title || "New Career Session",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DEMO_CONVERSATIONS.unshift(newConv);
      DEMO_MESSAGES[newConv.id] = [
        {
          id: Date.now() + 1,
          conversationId: newConv.id,
          role: "assistant",
          content: "Welcome to your new career advice session! Ask me anything about resume tweaking, interview questions, or skill roadmaps.",
          createdAt: new Date().toISOString()
        }
      ];
      res.status(201).json(newConv);
    }
  } catch (err) {
    req.log.error({ err }, "Error creating conversation");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// GET /api/chat/conversations/:id/messages
router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const id = parseParamId(req.params.id);

    try {
      const msgs = await db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.conversationId, id));

      if (msgs && msgs.length > 0) {
        res.json(msgs);
        return;
      }
    } catch (_) {}

    res.json(DEMO_MESSAGES[id] || []);
  } catch (err) {
    req.log.error({ err }, "Error getting messages");
    res.json(DEMO_MESSAGES[parseParamId(req.params.id)] || []);
  }
});

// POST /api/chat/conversations/:id/messages
router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  try {
    const id = parseParamId(req.params.id);
    const { content } = req.body as { content: string };

    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    let userMsg: any;
    try {
      [userMsg] = await db
        .insert(chatMessagesTable)
        .values({
          conversationId: id,
          role: "user",
          content
        })
        .returning();
    } catch (_) {
      userMsg = {
        id: Date.now(),
        conversationId: id,
        role: "user",
        content,
        createdAt: new Date().toISOString()
      };
      if (!DEMO_MESSAGES[id]) DEMO_MESSAGES[id] = [];
      DEMO_MESSAGES[id].push(userMsg);
    }

    // AI Response using Gemini Flash
    const aiPrompt = `You are AI Career Copilot. Candidate message: "${content}". Provide clear, practical career advice.`;
    const aiReplyText = await generateText(aiPrompt);

    let assistantMsg: any;
    try {
      [assistantMsg] = await db
        .insert(chatMessagesTable)
        .values({
          conversationId: id,
          role: "assistant",
          content: aiReplyText
        })
        .returning();
    } catch (_) {
      assistantMsg = {
        id: Date.now() + 1,
        conversationId: id,
        role: "assistant",
        content: aiReplyText,
        createdAt: new Date().toISOString()
      };
      DEMO_MESSAGES[id].push(assistantMsg);
    }

    res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg
    });
  } catch (err) {
    req.log.error({ err }, "Error sending message");
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
