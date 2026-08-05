import { Router } from "express";
import { requireAuth } from "../lib/auth";
import { generateJSON } from "../lib/gemini";

const router = Router();

// POST /api/projects/recommend
router.post("/recommend", requireAuth, async (req, res) => {
  try {
    const { targetRole, missingSkills } = req.body as {
      targetRole: string;
      missingSkills?: string[];
    };

    if (!targetRole) {
      res.status(400).json({ error: "targetRole is required" });
      return;
    }

    const skillsStr = missingSkills?.length
      ? missingSkills.join(", ")
      : "General technical and software architecture skills";

    const prompt = `You are a senior tech lead and engineering career mentor.
Generate 3 distinct, high-impact portfolio project recommendations designed specifically to help a job candidate targeting the role of "${targetRole}" bridge their skill gaps.

Target Skills to Bridge: ${skillsStr}

Return ONLY valid JSON:
{
  "projects": [
    {
      "title": string (engaging project name),
      "description": string (2-3 sentences overview of what the project does),
      "skillsTargeted": string[] (skills this project demonstrates),
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedHours": number,
      "architectureOverview": string (brief explanation of tech stack & data flow),
      "keyFeatures": string[] (3-5 core feature deliverables)
    }
  ]
}`;

    interface ProjectRecResponse {
      projects: Array<{
        title: string;
        description: string;
        skillsTargeted: string[];
        difficulty: string;
        estimatedHours: number;
        architectureOverview: string;
        keyFeatures: string[];
      }>;
    }

    const result = await generateJSON<ProjectRecResponse>(prompt);
    res.json({ targetRole, projects: result.projects ?? [] });
  } catch (err) {
    req.log.error({ err }, "Error recommending projects");
    res.status(500).json({ error: "Failed to generate project recommendations" });
  }
});

export default router;
