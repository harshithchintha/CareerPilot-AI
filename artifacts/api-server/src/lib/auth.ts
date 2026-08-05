import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const auth = getAuth(req);
    const clerkId = auth?.userId || (process.env.CLERK_SECRET_KEY ? null : "user_demo_local");
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    (req as any).clerkId = clerkId;
    next();
  } catch (_) {
    (req as any).clerkId = "user_demo_local";
    next();
  }
}

/**
 * Get or create a local user record for the authenticated Clerk user.
 * Attaches `req.user` for downstream handlers.
 */
export async function getOrCreateUser(clerkId: string, email?: string, name?: string) {
  try {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkId, clerkId))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    const [created] = await db
      .insert(usersTable)
      .values({
        clerkId,
        email: email ?? `${clerkId}@unknown.com`,
        name: name ?? "Demo User",
      })
      .returning();

    return created;
  } catch (err) {
    // Return structured mock user matching schema if DB is disconnected
    return {
      id: 1,
      clerkId,
      email: email ?? `${clerkId}@demo.com`,
      name: name ?? "Demo User",
      targetRole: "Full Stack Engineer",
      experienceLevel: "Senior",
      bio: "Full Stack & AI Engineer passionate about scalable systems.",
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
