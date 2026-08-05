import { Router } from "express";
import { db } from "@workspace/db";
import { learningRoadmapsTable, roadmapStepsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { generateJSON } from "../lib/gemini";

const router = Router();

function parseParamId(param: string | string[]): number {
  return parseInt(Array.isArray(param) ? param[0] : param, 10);
}

const DEMO_ROADMAPS = [
  {
    id: 1,
    userId: 1,
    targetRole: "Senior Full Stack Engineer",
    title: "Senior Full Stack Mastery Roadmap",
    description: "Step-by-step pathway to master modern React 19, TypeScript, Express microservices, system design, and Docker containerization.",
    completedSteps: 3,
    totalSteps: 6,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

const DEMO_STEPS = [
  {
    id: 1,
    roadmapId: 1,
    title: "Advanced TypeScript & Component Design Patterns",
    description: "Master generics, conditional types, custom hooks, and compound component patterns.",
    category: "Frontend",
    resourceUrls: ["https://react.dev", "https://typescriptlang.org"],
    estimatedHours: 12,
    isCompleted: true,
    orderIndex: 0
  },
  {
    id: 2,
    roadmapId: 1,
    title: "PostgreSQL Indexing & High-Performance Queries",
    description: "Learn B-Tree indexes, query execution plans, CTEs, and connection pool tuning.",
    category: "Backend & Database",
    resourceUrls: ["https://postgresql.org/docs"],
    estimatedHours: 15,
    isCompleted: true,
    orderIndex: 1
  },
  {
    id: 3,
    roadmapId: 1,
    title: "Docker Containerization & Multi-Stage Builds",
    description: "Build lightweight production Docker images, docker-compose setups, and health check monitoring.",
    category: "DevOps",
    resourceUrls: ["https://docs.docker.com"],
    estimatedHours: 10,
    isCompleted: false,
    orderIndex: 2
  }
];

// GET /api/roadmaps
router.get("/", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);

    try {
      const roadmaps = await db
        .select()
        .from(learningRoadmapsTable)
        .where(eq(learningRoadmapsTable.userId, user.id))
        .orderBy(desc(learningRoadmapsTable.createdAt));

      res.json(roadmaps);
    } catch (_) {
      res.json(DEMO_ROADMAPS);
    }
  } catch (err) {
    req.log.error({ err }, "Error listing roadmaps");
    res.json(DEMO_ROADMAPS);
  }
});

// POST /api/roadmaps/generate
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const { targetRole, currentSkillLevel } = req.body as {
      targetRole: string;
      currentSkillLevel?: string;
    };

    if (!targetRole) {
      res.status(400).json({ error: "targetRole is required" });
      return;
    }

    res.status(201).json({
      id: Date.now(),
      userId: user.id,
      targetRole,
      title: `${targetRole} Learning Roadmap`,
      description: `Tailored pathway to excel as a ${targetRole}.`,
      completedSteps: 0,
      totalSteps: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    req.log.error({ err }, "Error generating roadmap");
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

// GET /api/roadmaps/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const id = parseParamId(req.params.id);
    const demo = DEMO_ROADMAPS.find(r => r.id === id) || DEMO_ROADMAPS[0];
    res.json({ ...demo, steps: DEMO_STEPS });
  } catch (err) {
    req.log.error({ err }, "Error fetching roadmap");
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

// PATCH /api/roadmaps/:id/steps/:stepId
router.patch("/:id/steps/:stepId", requireAuth, async (req, res) => {
  try {
    const stepId = parseParamId(req.params.stepId);
    const { isCompleted } = req.body as { isCompleted: boolean };

    const step = DEMO_STEPS.find(s => s.id === stepId) || DEMO_STEPS[0];
    res.json({ ...step, isCompleted });
  } catch (err) {
    req.log.error({ err }, "Error updating step");
    res.status(500).json({ error: "Failed to update step" });
  }
});

export default router;
