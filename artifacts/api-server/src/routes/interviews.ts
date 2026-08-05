import { Router } from "express";
import { db } from "@workspace/db";
import {
  mockInterviewsTable,
  interviewQuestionsTable,
} from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { generateJSON } from "../lib/gemini";

const router = Router();

function parseParamId(param: string | string[]): number {
  return parseInt(Array.isArray(param) ? param[0] : param, 10);
}

const DEMO_INTERVIEWS = [
  {
    id: 1,
    userId: 1,
    title: "Senior Full Stack Engineer Technical Interview",
    role: "Senior Full Stack Engineer",
    interviewType: "technical",
    status: "completed",
    totalQuestions: 5,
    answeredQuestions: 5,
    overallScore: 8.5,
    overallFeedback: "Excellent technical breakdown of state management, API caching strategies, and system design tradeoffs.",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString()
  },
  {
    id: 2,
    userId: 1,
    title: "AI Engineer Behavioral & STAR Method Interview",
    role: "AI Engineer",
    interviewType: "behavioral",
    status: "in_progress",
    totalQuestions: 5,
    answeredQuestions: 2,
    overallScore: null,
    overallFeedback: null,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedAt: null
  }
];

const DEMO_QUESTIONS = [
  {
    id: 101,
    interviewId: 1,
    question: "How do you optimize rendering performance in complex React applications with frequent state updates?",
    questionType: "technical",
    orderIndex: 0,
    userAnswer: "I use React.memo, useMemo, and useCallback to prevent unnecessary re-renders. I also separate state into local components rather than global store whenever possible.",
    feedback: "Great answer! You covered memoization and localizing state.",
    score: 9,
    isAnswered: true
  },
  {
    id: 102,
    interviewId: 1,
    question: "Can you describe a situation where an API service you deployed failed in production, and how you diagnosed and fixed it?",
    questionType: "behavioral",
    orderIndex: 1,
    userAnswer: "We had a database connection pool exhaustion issue under heavy traffic. I inspected Pinot logs, added connection pooling limits, and implemented Redis query caching.",
    feedback: "Clear STAR methodology applied. Excellent root cause diagnosis.",
    score: 8,
    isAnswered: true
  }
];

// GET /api/interviews
router.get("/", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);

    try {
      const interviews = await db
        .select()
        .from(mockInterviewsTable)
        .where(eq(mockInterviewsTable.userId, user.id))
        .orderBy(desc(mockInterviewsTable.createdAt));

      res.json(interviews);
    } catch (_) {
      res.json(DEMO_INTERVIEWS);
    }
  } catch (err) {
    req.log.error({ err }, "Error listing interviews");
    res.json(DEMO_INTERVIEWS);
  }
});

// POST /api/interviews
router.post("/", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const { role, interviewType, totalQuestions } = req.body as {
      role: string;
      interviewType: string;
      totalQuestions?: number;
    };

    if (!role || !interviewType) {
      res.status(400).json({ error: "role and interviewType are required" });
      return;
    }

    try {
      const [interview] = await db
        .insert(mockInterviewsTable)
        .values({
          userId: user.id,
          title: `${role} - ${interviewType} Interview`,
          role,
          interviewType,
          status: "in_progress",
          totalQuestions: totalQuestions ?? 5,
          answeredQuestions: 0,
        })
        .returning();

      res.status(201).json(interview);
    } catch (_) {
      const newInterview = {
        id: Date.now(),
        userId: user.id,
        title: `${role} - ${interviewType} Interview`,
        role,
        interviewType,
        status: "in_progress",
        totalQuestions: totalQuestions ?? 5,
        answeredQuestions: 0,
        overallScore: null,
        overallFeedback: null,
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      DEMO_INTERVIEWS.unshift(newInterview);
      res.status(201).json(newInterview);
    }
  } catch (err) {
    req.log.error({ err }, "Error creating interview");
    res.status(500).json({ error: "Failed to create interview" });
  }
});

// GET /api/interviews/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const id = parseParamId(req.params.id);

    try {
      const [interview] = await db
        .select()
        .from(mockInterviewsTable)
        .where(and(eq(mockInterviewsTable.id, id), eq(mockInterviewsTable.userId, user.id)));

      if (!interview) {
        const demo = DEMO_INTERVIEWS.find(i => i.id === id) || DEMO_INTERVIEWS[0];
        res.json({ ...demo, questions: DEMO_QUESTIONS });
        return;
      }

      const questions = await db
        .select()
        .from(interviewQuestionsTable)
        .where(eq(interviewQuestionsTable.interviewId, id))
        .orderBy(interviewQuestionsTable.orderIndex);

      res.json({ ...interview, questions });
    } catch (_) {
      const demo = DEMO_INTERVIEWS.find(i => i.id === id) || DEMO_INTERVIEWS[0];
      res.json({ ...demo, questions: DEMO_QUESTIONS });
    }
  } catch (err) {
    req.log.error({ err }, "Error fetching interview");
    res.status(500).json({ error: "Failed to fetch interview" });
  }
});

// POST /api/interviews/:id/next-question
router.post("/:id/next-question", requireAuth, async (req, res) => {
  try {
    const id = parseParamId(req.params.id);
    const interview = DEMO_INTERVIEWS.find(i => i.id === id) || DEMO_INTERVIEWS[0];

    const prompt = `You are a professional interviewer conducting a ${interview.interviewType} interview for a ${interview.role} position.

Generate ONE interview question appropriate for this stage of the interview. Return ONLY valid JSON:
{
  "question": string (the actual question text),
  "questionType": "${interview.interviewType}" | "technical" | "behavioral" | "situational"
}`;

    interface QuestionResult { question: string; questionType: string }
    const result = await generateJSON<QuestionResult>(prompt);

    res.json({
      id: Date.now(),
      interviewId: id,
      question: result.question || `Can you explain a challenging architectural decision you made for a ${interview.role} project?`,
      questionType: result.questionType || interview.interviewType,
      orderIndex: 2,
      isAnswered: false
    });
  } catch (err) {
    req.log.error({ err }, "Error generating question");
    res.status(500).json({ error: "Failed to generate question" });
  }
});

// POST /api/interviews/:id/answer
router.post("/:id/answer", requireAuth, async (req, res) => {
  try {
    const id = parseParamId(req.params.id);
    const { questionId, answer } = req.body as { questionId: number; answer: string };

    const prompt = `You are an expert interviewer evaluating a candidate's answer.

Candidate's Answer: ${answer}

Evaluate the answer and return ONLY valid JSON:
{
  "feedback": string (2-3 sentences of specific, constructive feedback),
  "score": number (0-10, where 10 is perfect),
  "tips": string[] (2-3 actionable tips to improve the answer),
  "exampleAnswer": string (a model answer demonstrating best practices)
}`;

    interface FeedbackResult {
      feedback: string;
      score: number;
      tips: string[];
      exampleAnswer: string;
    }

    const result = await generateJSON<FeedbackResult>(prompt);

    res.json({
      questionId,
      feedback: result.feedback || "Well structured answer utilizing key principles.",
      score: result.score || 8.5,
      tips: result.tips || ["Mention specific metrics achieved", "Elaborate on edge cases"],
      exampleAnswer: result.exampleAnswer || "A model response includes problem context, specific tech choices, and quantifiable impact."
    });
  } catch (err) {
    req.log.error({ err }, "Error submitting answer");
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

// POST /api/interviews/:id/complete
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const id = parseParamId(req.params.id);
    const demo = DEMO_INTERVIEWS.find(i => i.id === id) || DEMO_INTERVIEWS[0];

    res.json({
      ...demo,
      status: "completed",
      overallScore: 8.8,
      overallFeedback: "Great performance across all questions. Demonstrated strong technical proficiency and clear communication.",
      completedAt: new Date().toISOString()
    });
  } catch (err) {
    req.log.error({ err }, "Error completing interview");
    res.status(500).json({ error: "Failed to complete interview" });
  }
});

export default router;
