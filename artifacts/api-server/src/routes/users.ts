import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "../lib/auth";
import { getAuth } from "@clerk/express";

const router = Router();

// GET /api/users/me
router.get("/me", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const auth = getAuth(req);
    const user = await getOrCreateUser(clerkId, auth?.sessionClaims?.email as string | undefined);

    res.json({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      targetRole: user.targetRole,
      experienceLevel: user.experienceLevel,
      bio: user.bio,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching user profile");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PUT /api/users/me
router.put("/me", requireAuth, async (req, res) => {
  try {
    const clerkId = (req as any).clerkId;
    const user = await getOrCreateUser(clerkId);

    const { name, targetRole, experienceLevel, bio } = req.body as {
      name?: string;
      targetRole?: string;
      experienceLevel?: string;
      bio?: string;
    };

    const [updated] = await db
      .update(usersTable)
      .set({
        ...(name !== undefined && { name }),
        ...(targetRole !== undefined && { targetRole }),
        ...(experienceLevel !== undefined && { experienceLevel }),
        ...(bio !== undefined && { bio }),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, user.id))
      .returning();

    res.json({
      id: updated.id,
      clerkId: updated.clerkId,
      email: updated.email,
      name: updated.name,
      targetRole: updated.targetRole,
      experienceLevel: updated.experienceLevel,
      bio: updated.bio,
      createdAt: updated.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
