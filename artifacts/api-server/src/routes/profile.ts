import { Router } from "express";
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { applyDailyCredits, ensureProfile, deductCredits, DAILY_GRANT, MONTHLY_CAP } from "../services/credits.js";

const router = Router();

/**
 * GET /profile/:userId
 * Fetch a user's profile. Applies daily credit grant if due.
 */
router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const raw = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, userId),
    });

    if (!raw) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const profile = await applyDailyCredits(raw);
    res.json({ status: true, data: { profile } });
  } catch (err) {
    req.log.error({ err }, "Error fetching profile");
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

/**
 * POST /profile
 * Create or ensure a profile exists (called on Supabase signup/first login).
 */
router.post("/profile", async (req, res) => {
  const { userId, email, plan } = req.body as {
    userId?: string;
    email?: string;
    plan?: string;
  };

  if (!userId || !email) {
    res.status(400).json({ error: "userId and email are required" });
    return;
  }

  try {
    const profile = await ensureProfile(userId, email, plan ?? "free");
    res.status(201).json({ status: true, data: { profile } });
  } catch (err) {
    req.log.error({ err }, "Error ensuring profile");
    res.status(500).json({ error: "Failed to create profile" });
  }
});

/**
 * POST /profile/:userId/deduct
 * Deduct credits after a successful AI generation.
 */
router.post("/profile/:userId/deduct", async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body as { amount?: number };

  if (!amount || amount < 0) {
    res.status(400).json({ error: "amount must be a positive number" });
    return;
  }

  try {
    const raw = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, userId),
    });

    if (!raw) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const result = await deductCredits(raw, amount);
    if (!result.success) {
      res.status(402).json({ error: "Insufficient credits", remaining: result.remaining });
      return;
    }

    res.json({ status: true, data: { remaining: result.remaining } });
  } catch (err) {
    req.log.error({ err }, "Error deducting credits");
    res.status(500).json({ error: "Failed to deduct credits" });
  }
});

/**
 * PATCH /profile/:userId
 * Update niche, platforms, goals, contentStyle, onboarding status.
 */
router.patch("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  const allowed = ["niche", "platforms", "goals", "contentStyle", "onboardingCompleted", "streak"] as const;

  const updates: {
    niche?: string | null;
    platforms?: string[];
    goals?: string[];
    contentStyle?: string | null;
    onboardingCompleted?: number;
    streak?: number;
  } = {};

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updates as Record<string, any>)[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  try {
    const [profile] = await db
      .update(profilesTable)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(profilesTable.id, userId))
      .returning();

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.json({ status: true, data: { profile } });
  } catch (err) {
    req.log.error({ err }, "Error updating profile");
    res.status(500).json({ error: "Failed to update profile" });
  }
});

/**
 * GET /profile/:userId/credit-status
 * Returns credit balance, next refresh time (midnight UTC), and monthly usage.
 */
router.get("/profile/:userId/credit-status", async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await db.query.profilesTable.findFirst({
      where: eq(profilesTable.id, userId),
    });

    if (!profile) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    const now          = new Date();
    const tomorrow     = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    const thisMonth = now.toISOString().slice(0, 7);
    const monthlyGranted =
      profile.creditsMonthYear === thisMonth
        ? (profile.monthlyCreditsGranted ?? 0)
        : 0;

    res.json({
      status: true,
      data: {
        credits:           profile.credits,
        plan:              profile.plan,
        nextRefreshMs:     msUntilMidnight,
        nextRefreshAt:     tomorrow.toISOString(),
        monthlyGranted,
        monthlyRemaining:  Math.max(0, MONTHLY_CAP - monthlyGranted),
        monthlyCapReached: monthlyGranted >= MONTHLY_CAP,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Error fetching credit status");
    res.status(500).json({ error: "Failed to fetch credit status" });
  }
});

export default router;
