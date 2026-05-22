import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { subscriptionsTable, paymentsTable, profilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { paystackRequest, type PaystackResponse, type PaystackInitializeData, type PaystackVerifyData } from "../lib/paystack.js";
import { getExchangeRates, convertPrice, CURRENCY_INFO, type SupportedCurrency } from "../lib/exchangeRates.js";

const router = Router();

const USD_PRICES = {
  basic: { monthly: 20, yearly: 240 },
  pro:   { monthly: 50, yearly: 600 },
};

const PLAN_CREDITS = { basic: 2000, pro: -1 };

function generateReference(prefix = "cos") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

router.get("/payments/rates", async (_req, res) => {
  try {
    const rates = await getExchangeRates();
    res.json({ status: true, data: { rates } });
  } catch {
    res.status(500).json({ status: false, message: "Failed to fetch rates" });
  }
});

router.post("/payments/initialize", async (req, res) => {
  const { userId, email, plan, billingCycle = "monthly", currency = "USD" } = req.body as {
    userId: string;
    email: string;
    plan: "basic" | "pro";
    billingCycle?: "monthly" | "yearly";
    currency?: SupportedCurrency;
  };

  if (!userId || !email || !plan) {
    res.status(400).json({ status: false, message: "userId, email, and plan are required" });
    return;
  }

  const usdAmount = USD_PRICES[plan][billingCycle];
  if (!usdAmount) {
    res.status(400).json({ status: false, message: "Invalid plan or billing cycle" });
    return;
  }

  try {
    const rates = await getExchangeRates();
    const currencyInfo = CURRENCY_INFO[currency] ?? CURRENCY_INFO.USD;
    const localAmount = convertPrice(usdAmount, currency as SupportedCurrency, rates);
    const amountInKobo = localAmount * 100;

    const reference = generateReference("cos_pay");

    await db.insert(paymentsTable).values({
      id: reference,
      userId,
      paystackReference: reference,
      amount: usdAmount,
      currency,
      amountInKobo,
      status: "pending",
      plan,
      billingCycle,
      metadata: { usdAmount, localAmount, currency, billingCycle },
    });

    const payload = {
      email,
      amount: amountInKobo,
      currency: currencyInfo.paystackCode,
      reference,
      callback_url: `${process.env.FRONTEND_URL ?? ""}/settings?tab=billing&verified=1`,
      metadata: {
        userId,
        plan,
        billingCycle,
        currency,
        usdAmount,
        custom_fields: [
          { display_name: "Plan", variable_name: "plan", value: `${plan} (${billingCycle})` },
        ],
      },
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
    };

    const result = await paystackRequest<PaystackResponse<PaystackInitializeData>>(
      "POST",
      "/transaction/initialize",
      payload
    );

    if (!result.status) {
      res.status(400).json({ status: false, message: result.message });
      return;
    }

    res.json({
      status: true,
      data: {
        authorizationUrl: result.data.authorization_url,
        reference: result.data.reference,
        accessCode: result.data.access_code,
        amount: localAmount,
        currency,
        symbol: currencyInfo.symbol,
        usdAmount,
      },
    });
  } catch (err) {
    console.error("[Paystack] Initialize error:", err);
    res.status(500).json({ status: false, message: "Payment initialization failed" });
  }
});

router.get("/payments/verify/:reference", async (req, res) => {
  const { reference } = req.params;

  try {
    const result = await paystackRequest<PaystackResponse<PaystackVerifyData>>(
      "GET",
      `/transaction/verify/${encodeURIComponent(reference)}`
    );

    if (!result.status || result.data.status !== "success") {
      res.status(400).json({ status: false, message: result.message ?? "Payment not successful" });
      return;
    }

    const payment = await db.query.paymentsTable.findFirst({
      where: eq(paymentsTable.paystackReference, reference),
    });

    if (!payment) {
      res.status(404).json({ status: false, message: "Payment record not found" });
      return;
    }

    if (payment.status === "success") {
      const profile = await db.query.profilesTable.findFirst({ where: eq(profilesTable.id, payment.userId) });
      const sub = await db.query.subscriptionsTable.findFirst({ where: eq(subscriptionsTable.userId, payment.userId) });
      res.json({ status: true, data: { alreadyVerified: true, plan: payment.plan, profile, subscription: sub } });
      return;
    }

    const now = new Date();
    const periodEnd = new Date(now);
    if (payment.billingCycle === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await db.update(paymentsTable)
      .set({ status: "success", paidAt: now, paystackTransactionId: String(result.data.id), updatedAt: now })
      .where(eq(paymentsTable.paystackReference, reference));

    const existingSub = await db.query.subscriptionsTable.findFirst({
      where: eq(subscriptionsTable.userId, payment.userId),
    });

    const customerCode = result.data.customer?.customer_code;
    const subCode = result.data.subscription?.subscription_code;
    const emailToken = result.data.subscription?.email_token;

    if (existingSub) {
      await db.update(subscriptionsTable)
        .set({
          plan: payment.plan,
          billingCycle: payment.billingCycle,
          status: "active",
          currency: payment.currency,
          amount: payment.amount,
          paystackCustomerCode: customerCode,
          paystackSubscriptionCode: subCode,
          paystackEmailToken: emailToken,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
          updatedAt: now,
        })
        .where(eq(subscriptionsTable.userId, payment.userId));
    } else {
      await db.insert(subscriptionsTable).values({
        id: `sub_${payment.userId}_${Date.now()}`,
        userId: payment.userId,
        plan: payment.plan,
        billingCycle: payment.billingCycle,
        status: "active",
        currency: payment.currency,
        amount: payment.amount,
        paystackCustomerCode: customerCode,
        paystackSubscriptionCode: subCode,
        paystackEmailToken: emailToken,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      });
    }

    const newCredits = PLAN_CREDITS[payment.plan as keyof typeof PLAN_CREDITS] ?? 100;
    await db.update(profilesTable)
      .set({ plan: payment.plan, credits: newCredits < 0 ? 999999 : newCredits, updatedAt: now })
      .where(eq(profilesTable.id, payment.userId));

    const profile = await db.query.profilesTable.findFirst({ where: eq(profilesTable.id, payment.userId) });
    const sub = await db.query.subscriptionsTable.findFirst({ where: eq(subscriptionsTable.userId, payment.userId) });

    res.json({ status: true, data: { plan: payment.plan, profile, subscription: sub } });
  } catch (err) {
    console.error("[Paystack] Verify error:", err);
    res.status(500).json({ status: false, message: "Verification failed" });
  }
});

router.get("/payments/subscription/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const sub = await db.query.subscriptionsTable.findFirst({ where: eq(subscriptionsTable.userId, userId) });
    const profile = await db.query.profilesTable.findFirst({ where: eq(profilesTable.id, userId) });
    res.json({ status: true, data: { subscription: sub ?? null, profile: profile ?? null } });
  } catch (err) {
    console.error("[Paystack] Subscription fetch error:", err);
    res.status(500).json({ status: false, message: "Failed to fetch subscription" });
  }
});

router.post("/payments/cancel", async (req, res) => {
  const { userId } = req.body as { userId: string };
  if (!userId) {
    res.status(400).json({ status: false, message: "userId required" });
    return;
  }

  try {
    const sub = await db.query.subscriptionsTable.findFirst({ where: eq(subscriptionsTable.userId, userId) });

    if (sub?.paystackSubscriptionCode && sub?.paystackEmailToken) {
      await paystackRequest("POST", "/subscription/disable", {
        code: sub.paystackSubscriptionCode,
        token: sub.paystackEmailToken,
      });
    }

    const now = new Date();
    await db.update(subscriptionsTable)
      .set({ status: "cancelled", cancelledAt: now, updatedAt: now })
      .where(eq(subscriptionsTable.userId, userId));

    res.json({ status: true, message: "Subscription cancelled" });
  } catch (err) {
    console.error("[Paystack] Cancel error:", err);
    res.status(500).json({ status: false, message: "Cancellation failed" });
  }
});

router.post("/payments/webhook", async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    res.sendStatus(400);
    return;
  }

  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    res.sendStatus(401);
    return;
  }

  const event = req.body as { event: string; data: Record<string, unknown> };
  console.log("[Paystack Webhook]", event.event);

  try {
    if (event.event === "charge.success") {
      const data = event.data as {
        reference: string;
        status: string;
        id: number;
        customer: { customer_code: string; email: string };
        subscription?: { subscription_code: string; email_token: string };
      };

      const payment = await db.query.paymentsTable.findFirst({
        where: eq(paymentsTable.paystackReference, data.reference),
      });

      if (payment && payment.status !== "success") {
        const now = new Date();
        const periodEnd = new Date(now);
        if (payment.billingCycle === "yearly") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1);
        }

        await db.update(paymentsTable)
          .set({ status: "success", paidAt: now, paystackTransactionId: String(data.id), updatedAt: now })
          .where(eq(paymentsTable.paystackReference, data.reference));

        const existingSub = await db.query.subscriptionsTable.findFirst({
          where: eq(subscriptionsTable.userId, payment.userId),
        });

        const subData = {
          plan: payment.plan,
          billingCycle: payment.billingCycle,
          status: "active",
          currency: payment.currency,
          amount: payment.amount,
          paystackCustomerCode: data.customer?.customer_code,
          paystackSubscriptionCode: data.subscription?.subscription_code,
          paystackEmailToken: data.subscription?.email_token,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          cancelledAt: null,
          updatedAt: now,
        };

        if (existingSub) {
          await db.update(subscriptionsTable).set(subData).where(eq(subscriptionsTable.userId, payment.userId));
        } else {
          await db.insert(subscriptionsTable).values({ id: `sub_${payment.userId}_${Date.now()}`, userId: payment.userId, ...subData });
        }

        const newCredits = PLAN_CREDITS[payment.plan as keyof typeof PLAN_CREDITS] ?? 100;
        await db.update(profilesTable)
          .set({ plan: payment.plan, credits: newCredits < 0 ? 999999 : newCredits, updatedAt: now })
          .where(eq(profilesTable.id, payment.userId));
      }
    }

    if (event.event === "subscription.disable" || event.event === "subscription.not_renew") {
      const data = event.data as { subscription_code: string };
      const sub = await db.query.subscriptionsTable.findFirst({
        where: eq(subscriptionsTable.paystackSubscriptionCode, data.subscription_code),
      });
      if (sub) {
        const now = new Date();
        await db.update(subscriptionsTable)
          .set({ status: "cancelled", cancelledAt: now, updatedAt: now })
          .where(eq(subscriptionsTable.paystackSubscriptionCode, data.subscription_code));
      }
    }
  } catch (err) {
    console.error("[Paystack Webhook] Error:", err);
  }

  res.sendStatus(200);
});

router.post("/payments/update-currency", async (req, res) => {
  const { userId, currency, country } = req.body as { userId: string; currency: string; country: string };
  if (!userId) {
    res.status(400).json({ status: false, message: "userId required" });
    return;
  }
  try {
    await db.update(profilesTable)
      .set({ preferredCurrency: currency, preferredCountry: country, updatedAt: new Date() })
      .where(eq(profilesTable.id, userId));
    res.json({ status: true });
  } catch {
    res.status(500).json({ status: false, message: "Update failed" });
  }
});

export default router;
