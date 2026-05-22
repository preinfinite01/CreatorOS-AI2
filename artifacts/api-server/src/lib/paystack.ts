import https from "https";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

if (!PAYSTACK_SECRET) {
  console.warn("[Paystack] PAYSTACK_SECRET_KEY not set — payment routes disabled");
}

export function paystackRequest<T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : undefined;
    const options: https.RequestOptions = {
      hostname: "api.paystack.co",
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        "Content-Type": "application/json",
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          const parsed = JSON.parse(raw) as T;
          resolve(parsed);
        } catch {
          reject(new Error(`Paystack parse error: ${raw}`));
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

export interface PaystackResponse<T = unknown> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackVerifyData {
  id: number;
  reference: string;
  status: string;
  amount: number;
  currency: string;
  paid_at: string;
  customer: { id: number; email: string; customer_code: string };
  metadata: Record<string, unknown>;
  subscription?: { subscription_code: string; email_token: string };
}

export interface PaystackPlanData {
  id: number;
  plan_code: string;
  name: string;
  amount: number;
  interval: string;
  currency: string;
}

export interface PaystackSubscriptionData {
  id: number;
  subscription_code: string;
  email_token: string;
  status: string;
  next_payment_date: string;
  plan: { plan_code: string; name: string; amount: number; currency: string };
  customer: { customer_code: string; email: string };
}
