import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { generateJSON } from "../lib/gemini";

const router = Router();

// POST /api/questions/generate
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const { role, questionType, count } = req.body as {
      role: string;
      questionType?: string;
      count?: number;
    };

    if (!role) {
      res.status(400).json({ error: "role is required" });
      return;
    }

    const typeStr = questionType ?? "Technical & Behavioral";
    const numQs = count ?? 5;

    const prompt = `You are a principal tech interviewer.
Generate ${numQs} highly targeted interview questions for a "${role}" position, focusing on ${typeStr} competencies.

Return ONLY valid JSON:
{
  "questions": [
    {
      "question": string (the exact question asked),
      "category": string (e.g. "Database Design", "System Architecture", "STAR Behavioral"),
      "difficulty": "Easy" | "Intermediate" | "Hard",
      "modelAnswer": string (a comprehensive 3-4 sentence sample answer),
      "keyPoints": string[] (3-4 bullet points recruiters look for in a top response)
    }
  ]
}`;

    interface QuestionGenResponse {
      questions: Array<{
        question: string;
        category: string;
        difficulty: string;
        modelAnswer: string;
        keyPoints: string[];
      }>;
    }

    const result = await generateJSON<QuestionGenResponse>(prompt);
    res.json({ role, questionType: typeStr, questions: result.questions ?? [] });
  } catch (err) {
    req.log.error({ err }, "Error generating question bank");
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

export default router;
