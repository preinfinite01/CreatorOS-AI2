import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  plan: text("plan").notNull().default("free"),
  credits: integer("credits").notNull().default(100),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  niche: text("niche"),
  platforms: jsonb("platforms").$type<string[]>().default([]),
  goals: jsonb("goals").$type<string[]>().default([]),
  contentStyle: text("content_style"),
  onboardingCompleted: integer("onboarding_completed").notNull().default(0),
  preferredCurrency: text("preferred_currency").default("USD"),
  preferredCountry: text("preferred_country").default("US"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
