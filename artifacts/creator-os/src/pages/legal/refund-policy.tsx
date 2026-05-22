import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "May 19, 2026";
const COMPANY = "CreatorOS AI";
const EMAIL = "billing@creatorosai.com";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Our Refund Philosophy</h2>
            <p>{COMPANY} strives to provide exceptional value. We handle refund requests on a case-by-case basis and aim to be fair and transparent. This policy outlines the specific circumstances under which refunds are issued.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Subscription Refunds</h2>
            <p><strong>14-Day Money-Back Guarantee:</strong> New subscribers are eligible for a full refund within 14 days of their first paid subscription, provided they have not consumed more than 20% of their monthly credit allowance.</p>
            <p className="mt-3"><strong>Monthly Subscriptions:</strong> After the 14-day window, monthly subscriptions are non-refundable. You may cancel at any time to prevent future charges.</p>
            <p className="mt-3"><strong>Annual Subscriptions:</strong> Annual subscriptions are eligible for a pro-rated refund within the first 30 days. After 30 days, annual subscriptions are non-refundable.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Service Outages</h2>
            <p>If the Platform experiences significant downtime (more than 4 hours in a single billing period) due to our infrastructure failures, you may be eligible for a credit to your account equivalent to the proportion of downtime. Credits are applied at our discretion and are not automatically issued.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Credit Refunds</h2>
            <p>AI generation credits are consumed upon successful generation. Credits are non-refundable once used. If a generation fails due to a platform error, credits will be automatically restored to your account within 24 hours.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Non-Refundable Circumstances</h2>
            <p>Refunds will not be issued in the following cases:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Dissatisfaction with AI-generated content quality (subjective preference)</li>
              <li>Account termination due to Terms of Service violations</li>
              <li>Failure to cancel before the renewal date</li>
              <li>Requests made after the eligible refund window</li>
              <li>Partial-month usage on monthly plans</li>
              <li>Promotional or discounted subscriptions (unless required by law)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. How to Request a Refund</h2>
            <p>To request a refund, email us at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a> with:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Your registered email address</li>
              <li>The reason for your refund request</li>
              <li>Your payment transaction ID or date of charge</li>
            </ul>
            <p className="mt-3">We aim to respond within 2 business days. Approved refunds are processed within 5–10 business days, depending on your payment provider.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Cancellation Policy</h2>
            <p>You may cancel your subscription at any time from your account Settings page. Cancellation takes effect at the end of your current billing period. You will retain access to paid features until your subscription expires. We do not pro-rate cancellations for partial months.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Disputes</h2>
            <p>If you believe you have been incorrectly charged, contact us immediately at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>. We will investigate and respond within 5 business days. Initiating a chargeback without first contacting us may result in account suspension.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Legal Rights</h2>
            <p>This policy does not limit your statutory rights. In jurisdictions where mandatory refund rights apply (such as the EU's 14-day cooling-off period for digital services), those rights take precedence.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
