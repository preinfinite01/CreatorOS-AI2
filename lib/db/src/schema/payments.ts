import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const paymentsTable = pgTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  subscriptionId: text("subscription_id"),
  paystackReference: text("paystack_reference").notNull().unique(),
  paystackTransactionId: text("paystack_transaction_id"),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull().default("USD"),
  amountInKobo: integer("amount_in_kobo"),
  status: text("status").notNull().default("pending"),
  plan: text("plan").notNull(),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
