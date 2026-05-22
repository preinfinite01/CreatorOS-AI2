/**
 * Credit management service.
 *
 * Rules:
 *   - Initial signup: 100 credits (set when profile is created)
 *   - Daily refresh: +50 credits at midnight (real-world clock), once per calendar day
 *   - Monthly cap: max 700 credits granted via daily refresh per calendar month
 *   - Free plan only — Pro plan has unlimited credits (skip all checks)
 *   - Credits are stored in PostgreSQL, so server restarts never cause re-grants
 */
import { db, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import type { Profile } from "@workspace/db";

const DAILY_GRANT      = 50;
const MONTHLY_CAP      = 700;
const INITIAL_CREDITS  = 100;

/** Returns today as "YYYY-MM-DD" in UTC (avoids timezone drift). */
function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns current month as "YYYY-MM" in UTC. */
function thisMonthUTC(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Check whether the profile is due for a daily credit grant and apply it.
 * Returns the (potentially updated) profile.
 * Safe to call on every profile fetch — it's a no-op when no grant is needed.
 */
export async function applyDailyCredits(profile: Profile): Promise<Profile> {
  // Pro plan = unlimited, no credit tracking needed
  if (profile.plan === "pro") return profile;

  const today     = todayUTC();
  const thisMonth = thisMonthUTC();

  // Already refreshed today — nothing to do
  if (profile.lastCreditRefreshDate === today) return profile;

  // Reset monthly counter when entering a new month
  const monthlyGranted =
    profile.creditsMonthYear === thisMonth
      ? (profile.monthlyCreditsGranted ?? 0)
      : 0;

  // Monthly cap reached — skip until next month
  if (monthlyGranted >= MONTHLY_CAP) {
    // Still update lastCreditRefreshDate so we don't re-check every request
    await db
      .update(profilesTable)
      .set({ lastCreditRefreshDate: today, updatedAt: new Date() })
      .where(eq(profilesTable.id, profile.id));
    return { ...profile, lastCreditRefreshDate: today };
  }

  const toGrant     = Math.min(DAILY_GRANT, MONTHLY_CAP - monthlyGranted);
  const newCredits  = profile.credits + toGrant;
  const newMonthly  = monthlyGranted + toGrant;
  const now         = new Date();

  await db
    .update(profilesTable)
    .set({
      credits:              newCredits,
      lastCreditRefreshDate: today,
      creditsMonthYear:     thisMonth,
      monthlyCreditsGranted: newMonthly,
      updatedAt:            now,
    })
    .where(eq(profilesTable.id, profile.id));

  return {
    ...profile,
    credits:               newCredits,
    lastCreditRefreshDate: today,
    creditsMonthYear:      thisMonth,
    monthlyCreditsGranted: newMonthly,
  };
}

/**
 * Create a brand-new profile for a Supabase user on first sign-up.
 * Safe to call multiple times — uses INSERT ... ON CONFLICT DO NOTHING.
 */
export async function ensureProfile(
  userId: string,
  email: string,
  plan = "free",
): Promise<Profile> {
  const today     = todayUTC();
  const thisMonth = thisMonthUTC();

  await db
    .insert(profilesTable)
    .values({
      id:                    userId,
      email,
      plan,
      credits:               INITIAL_CREDITS,
      lastCreditRefreshDate: today,
      creditsMonthYear:      thisMonth,
      monthlyCreditsGranted: 0,
    })
    .onConflictDoNothing();

  const profile = await db.query.profilesTable.findFirst({
    where: eq(profilesTable.id, userId),
  });

  if (!profile) throw new Error(`Profile not found for ${userId}`);
  return profile;
}

/**
 * Deduct credits from a profile. Returns false if insufficient credits.
 * Pro plan always returns true (unlimited).
 */
export async function deductCredits(
  profile: Profile,
  amount: number,
): Promise<{ success: boolean; remaining: number }> {
  if (profile.plan === "pro") return { success: true, remaining: 999999 };

  if (profile.credits < amount) {
    return { success: false, remaining: profile.credits };
  }

  const newCredits = profile.credits - amount;
  await db
    .update(profilesTable)
    .set({ credits: newCredits, updatedAt: new Date() })
    .where(eq(profilesTable.id, profile.id));

  return { success: true, remaining: newCredits };
}
