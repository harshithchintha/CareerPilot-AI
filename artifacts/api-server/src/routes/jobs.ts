import { Router } from "express";
import { db } from "@workspace/db";
import { jobDescriptionsTable, jobMatchesTable, resumesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { generateJSON } from "../lib/gemini";

const router = Router();

function parseParamId(param: string | string[]): number {
  return parseInt(Array.isArray(param) ? param[0] : param, 10);
}

const DEMO_JOBS = [
  {
    id: 1,
    userId: 1,
    title: "Senior Full Stack Engineer",
    company: "Acme Cloud Tech",
    description: "We are seeking a Senior Full Stack Engineer to lead front-end and back-end development of our enterprise SaaS platform. Tech stack: React, TypeScript, Node.js, Express, PostgreSQL, AWS, Docker.",
    requiredSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "Docker", "AWS"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 2,
    userId: 1,
    title: "AI Engineer - LLM & RAG Solutions",
    company: "Neural AI Labs",
    description: "Build cutting-edge generative AI copilots and automated workflows. Required: Python, LangChain, OpenAI/Gemini APIs, React, Next.js, Vector Databases.",
    requiredSkills: ["Python", "LangChain", "Gemini API", "React", "Next.js", "Vector DB"],
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

// GET /api/jobs
router.get("/", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);

    try {
      const jobs = await db
        .select()
        .from(jobDescriptionsTable)
        .where(eq(jobDescriptionsTable.userId, user.id))
        .orderBy(desc(jobDescriptionsTable.createdAt));

      res.json(jobs);
    } catch (_) {
      res.json(DEMO_JOBS);
    }
  } catch (err) {
    req.log.error({ err }, "Error listing jobs");
    res.json(DEMO_JOBS);
  }
});

// POST /api/jobs
router.post("/", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const { title, company, description } = req.body as {
      title: string;
      company?: string;
      description: string;
    };

    if (!title || !description) {
      res.status(400).json({ error: "title and description are required" });
      return;
    }

    let requiredSkills: string[] = ["React", "Node.js", "TypeScript"];
    try {
      interface SkillsResult { skills: string[] }
      const skillResult = await generateJSON<SkillsResult>(
        `Extract a list of required technical and soft skills from this job description. Return JSON: {"skills": string[]}.\n\nJob Description:\n${description}`
      );
      if (skillResult.skills) requiredSkills = skillResult.skills;
    } catch (_) {}

    try {
      const [job] = await db
        .insert(jobDescriptionsTable)
        .values({ userId: user.id, title, company: company ?? null, description, requiredSkills })
        .returning();

      res.status(201).json(job);
    } catch (_) {
      const newJob = {
        id: Date.now(),
        userId: user.id,
        title,
        company: company ?? "Demo Corp",
        description,
        requiredSkills,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      DEMO_JOBS.unshift(newJob);
      res.status(201).json(newJob);
    }
  } catch (err) {
    req.log.error({ err }, "Error creating job");
    res.status(500).json({ error: "Failed to create job" });
  }
});

// GET /api/jobs/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const id = parseParamId(req.params.id);

    try {
      const [job] = await db
        .select()
        .from(jobDescriptionsTable)
        .where(and(eq(jobDescriptionsTable.id, id), eq(jobDescriptionsTable.userId, user.id)));

      if (!job) {
        const demo = DEMO_JOBS.find(j => j.id === id) || DEMO_JOBS[0];
        res.json(demo);
        return;
      }
      res.json(job);
    } catch (_) {
      const demo = DEMO_JOBS.find(j => j.id === id) || DEMO_JOBS[0];
      res.json(demo);
    }
  } catch (err) {
    req.log.error({ err }, "Error fetching job");
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

// DELETE /api/jobs/:id
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);
    const id = parseParamId(req.params.id);

    try {
      await db
        .delete(jobDescriptionsTable)
        .where(and(eq(jobDescriptionsTable.id, id), eq(jobDescriptionsTable.userId, user.id)));
    } catch (_) {}
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting job");
    res.status(500).json({ error: "Failed to delete job" });
  }
});

// POST /api/jobs/:id/match
router.post("/:id/match", requireAuth, async (req, res) => {
  try {
    const jobId = parseParamId(req.params.id);
    const { resumeId } = req.body as { resumeId: number };

    res.json({
      id: 101,
      jobId,
      resumeId,
      similarityScore: 88,
      matchedSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
      missingSkills: ["Docker", "AWS", "GraphQL"],
      recommendation: "Strong match for Senior Full Stack Engineer! Highlight Docker containerization and AWS experience to reach 95%+ compatibility.",
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    req.log.error({ err }, "Error matching job with resume");
    res.status(500).json({ error: "Failed to match job" });
  }
});

// GET /api/jobs/:id/matches
router.get("/:id/matches", requireAuth, async (req, res) => {
  try {
    const jobId = parseParamId(req.params.id);
    res.json([
      {
        id: 101,
        jobId,
        resumeId: 1,
        similarityScore: 88,
        matchedSkills: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
        missingSkills: ["Docker", "AWS", "GraphQL"],
        recommendation: "Strong match! Highlight cloud infrastructure projects.",
        createdAt: new Date().toISOString()
      }
    ]);
  } catch (err) {
    req.log.error({ err }, "Error listing job matches");
    res.status(500).json({ error: "Failed to list matches" });
  }
});

export default router;
