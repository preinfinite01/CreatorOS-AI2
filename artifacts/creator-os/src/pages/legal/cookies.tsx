import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "May 19, 2026";
const COMPANY = "CreatorOS AI";
const EMAIL = "privacy@creatorosai.com";

export default function Cookies() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. What Are Cookies?</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help websites remember information about your visit, improve performance, and provide a personalized experience. {COMPANY} uses cookies and similar technologies including local storage and session storage.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Types of Cookies We Use</h2>

            <div className="mt-4 space-y-4">
              <div className="border border-white/10 rounded-xl p-4 bg-white/3">
                <h3 className="font-semibold text-foreground mb-1">Strictly Necessary Cookies</h3>
                <p className="text-sm">Required for the Platform to function. These cannot be disabled. They include authentication tokens, session identifiers, and security cookies.</p>
                <p className="text-xs text-muted-foreground mt-2">Retention: Session or up to 30 days | Cannot be opted out</p>
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-white/3">
                <h3 className="font-semibold text-foreground mb-1">Preference Cookies</h3>
                <p className="text-sm">Store your preferences such as currency selection, notification settings, and UI preferences to personalize your experience.</p>
                <p className="text-xs text-muted-foreground mt-2">Retention: Up to 12 months | Can be disabled in settings</p>
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-white/3">
                <h3 className="font-semibold text-foreground mb-1">Analytics Cookies</h3>
                <p className="text-sm">Help us understand how you use the Platform — which tools you use most, where you spend time, and how we can improve. Data is anonymized and aggregated.</p>
                <p className="text-xs text-muted-foreground mt-2">Retention: Up to 24 months | Can be opted out</p>
              </div>

              <div className="border border-white/10 rounded-xl p-4 bg-white/3">
                <h3 className="font-semibold text-foreground mb-1">Advertising Cookies</h3>
                <p className="text-sm">Used to serve relevant advertisements to Free and Basic tier users. These help us provide the Platform at a lower price. Pro subscribers are not served ads and these cookies are not used for Pro accounts.</p>
                <p className="text-xs text-muted-foreground mt-2">Retention: Up to 90 days | Disabled automatically for Pro users</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Third-Party Cookies</h2>
            <p>Some cookies are set by third-party services we use:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li><strong>Supabase:</strong> Authentication and session management</li>
              <li><strong>Paystack:</strong> Payment security and fraud prevention</li>
              <li><strong>OpenAI:</strong> No cookies set (API requests only)</li>
              <li><strong>Analytics providers:</strong> Usage analytics (anonymized)</li>
            </ul>
            <p className="mt-3">We do not control third-party cookies. Please review their respective privacy policies for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Local Storage</h2>
            <p>In addition to cookies, we use browser local storage to persist your preferences, authentication state, and application settings. This data is stored only on your device and is not transmitted to our servers unless part of an API request.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Managing Cookies</h2>
            <p>You can control cookies through:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li><strong>Browser settings:</strong> Most browsers allow you to block or delete cookies. Note that disabling necessary cookies will break Platform functionality.</li>
              <li><strong>Account Settings:</strong> Preference and analytics cookies can be managed in your Settings page.</li>
              <li><strong>Opt-out links:</strong> Third-party analytics providers offer their own opt-out mechanisms.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Do Not Track</h2>
            <p>Some browsers send "Do Not Track" (DNT) signals. We currently do not alter our data collection practices in response to DNT signals, but we continue to monitor industry standards and may update this position.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Cookie Retention</h2>
            <p>Session cookies are deleted when you close your browser. Persistent cookies remain until their expiry date or until you delete them. The specific retention periods are listed in Section 2 above.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Changes to This Policy</h2>
            <p>We may update this Cookie Policy as our practices evolve. We will notify you of significant changes. Continued use of the Platform after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Contact</h2>
            <p>For questions about our use of cookies, contact us at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
