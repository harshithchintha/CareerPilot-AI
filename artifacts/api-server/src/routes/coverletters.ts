import { Router } from "express";
import { db } from "@workspace/db";
import { coverLettersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { generateText } from "../lib/gemini";

const router = Router();

const DEMO_COVER_LETTERS = [
  {
    id: 1,
    userId: 1,
    resumeId: 1,
    jobId: 1,
    title: "Cover Letter - Senior Full Stack Engineer (Acme Cloud Tech)",
    content: "Dear Hiring Team at Acme Cloud Tech,\n\nI am writing to express my enthusiastic interest in the Senior Full Stack Engineer position. With extensive experience architecting high-throughput React & Node.js microservices and optimizing PostgreSQL database queries, I am confident in my ability to immediately deliver value to your SaaS platform.\n\nIn my previous roles, I led the development of cloud applications processing over 1 million daily requests while maintaining 99.99% uptime. My core expertise in TypeScript, Docker, and REST API design directly aligns with your requirements.\n\nThank you for considering my application. I look forward to discussing how my technical background can contribute to Acme Cloud Tech's growth.\n\nSincerely,\nCandidate",
    tone: "professional and enthusiastic",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// GET /api/cover-letters
router.get("/", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);

    try {
      const letters = await db
        .select()
        .from(coverLettersTable)
        .where(eq(coverLettersTable.userId, user.id))
        .orderBy(desc(coverLettersTable.createdAt));

      res.json(letters);
    } catch (_) {
      res.json(DEMO_COVER_LETTERS);
    }
  } catch (err) {
    req.log.error({ err }, "Error listing cover letters");
    res.json(DEMO_COVER_LETTERS);
  }
});

const handleGenerateCoverLetter = async (req: any, res: any) => {
  try {
    const clerkId = req.clerkId;
    const user = await getOrCreateUser(clerkId);
    const { jobTitle, company, tone, resumeText } = req.body as {
      jobTitle?: string;
      company?: string;
      tone?: string;
      resumeText?: string;
    };

    const prompt = `Write a compelling, professional cover letter tailored for a candidate applying to the position of "${jobTitle || "Software Engineer"}" at "${company || "Target Company"}". Tone: ${tone || "Professional and persuasive"}.\nCandidate Experience:\n${resumeText || "Full-stack web application development with React, Node.js, and Cloud Infrastructure."}`;

    const letterContent = await generateText(prompt);
    const title = `Cover Letter - ${jobTitle || "Role"} (${company || "Company"})`;

    try {
      const [letter] = await db
        .insert(coverLettersTable)
        .values({
          userId: user.id,
          title,
          content: letterContent
        })
        .returning();

      res.status(201).json(letter);
    } catch (_) {
      const newLetter = {
        id: Date.now(),
        userId: user.id,
        resumeId: 1,
        jobId: 1,
        title,
        content: letterContent,
        tone: tone || "Professional",
        createdAt: new Date().toISOString()
      };
      DEMO_COVER_LETTERS.unshift(newLetter);
      res.status(201).json(newLetter);
    }
  } catch (err) {
    req.log.error({ err }, "Error generating cover letter");
    res.status(500).json({ error: "Failed to generate cover letter" });
  }
};

// Both POST /api/cover-letters and POST /api/cover-letters/generate
router.post("/", requireAuth, handleGenerateCoverLetter);
router.post("/generate", requireAuth, handleGenerateCoverLetter);

export default router;
