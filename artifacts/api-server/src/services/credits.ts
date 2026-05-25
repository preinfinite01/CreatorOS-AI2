/**
 * Credit management service.
 *
 * Rules:
 *   - Initial signup: 70 credits (set when profile is created)
 *   - Daily refresh: +10 credits at midnight UTC (12am), once per calendar day
 *   - Monthly cap: max 300 credits granted via daily refresh per calendar month
 *   - Free/Basic plan only — Pro plan has unlimited credits (skip all checks)
 *   - Credits are stored in PostgreSQL, so server restarts and page refreshes
 *     NEVER cause re-grants. The grant fires at most once per UTC calendar day.
 */
import { db, profilesTable } from "@workspace/db";
import { eq, lt } from "drizzle-orm";
import type { Profile } from "@workspace/db";

export const DAILY_GRANT     = 10;
export const MONTHLY_CAP     = 300;   // 30 days × 10
export const INITIAL_CREDITS = 70;

/** Returns today as "YYYY-MM-DD" in UTC — avoids timezone drift. */
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
 *
 * Safe to call on every profile fetch — it is a no-op when:
 *   a) lastCreditRefreshDate already equals today (most common case), OR
 *   b) plan === "pro" (unlimited)
 *
 * Credits are ONLY added once per UTC calendar day (midnight = day boundary).
 * Page refreshes and server restarts do not cause re-grants because the date
 * check is against the value stored in Postgres, not in memory.
 */
export async function applyDailyCredits(profile: Profile): Promise<Profile> {
  if (profile.plan === "pro") return profile;

  const today     = todayUTC();
  const thisMonth = thisMonthUTC();

  // Already refreshed today — nothing to do (most requests hit this path)
  if (profile.lastCreditRefreshDate === today) return profile;

  // Reset monthly counter when entering a new month
  const monthlyGranted =
    profile.creditsMonthYear === thisMonth
      ? (profile.monthlyCreditsGranted ?? 0)
      : 0;

  // Monthly cap reached — stamp the date so we don't re-check every request
  if (monthlyGranted >= MONTHLY_CAP) {
    await db
      .update(profilesTable)
      .set({ lastCreditRefreshDate: today, updatedAt: new Date() })
      .where(eq(profilesTable.id, profile.id));
    return { ...profile, lastCreditRefreshDate: today };
  }

  const toGrant    = Math.min(DAILY_GRANT, MONTHLY_CAP - monthlyGranted);
  const newCredits = profile.credits + toGrant;
  const newMonthly = monthlyGranted + toGrant;
  const now        = new Date();

  await db
    .update(profilesTable)
    .set({
      credits:               newCredits,
      lastCreditRefreshDate: today,
      creditsMonthYear:      thisMonth,
      monthlyCreditsGranted: newMonthly,
      updatedAt:             now,
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
 * One-time startup sync: bump any existing free/basic profiles that were
 * created before the 70-credit policy to exactly 70 credits.
 * Safe to call every startup — the WHERE clause is a no-op once all rows
 * have been updated.
 */
export async function syncInitialCredits(): Promise<void> {
  await db
    .update(profilesTable)
    .set({ credits: INITIAL_CREDITS, updatedAt: new Date() })
    .where(lt(profilesTable.credits, INITIAL_CREDITS));
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
