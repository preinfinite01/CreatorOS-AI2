import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "May 19, 2026";
const COMPANY = "CreatorOS AI";
const EMAIL = "privacy@creatorosai.com";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
            <p>{COMPANY} ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
            <p><strong>Information you provide directly:</strong></p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Account registration data (email, name)</li>
              <li>Payment information (processed securely by Paystack — we do not store card details)</li>
              <li>Content you input into AI generation tools (prompts, topics, scripts)</li>
              <li>Profile preferences (niche, platforms, content style)</li>
            </ul>
            <p className="mt-4"><strong>Information collected automatically:</strong></p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Usage data (features used, generation counts, session duration)</li>
              <li>Device and browser information</li>
              <li>IP address and approximate location (country level)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide, maintain, and improve the Platform</li>
              <li>To process payments and manage subscriptions</li>
              <li>To personalize your experience and AI outputs</li>
              <li>To send service-related communications</li>
              <li>To detect and prevent fraud and abuse</li>
              <li>To comply with legal obligations</li>
              <li>To analyze usage patterns for platform improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. AI Input Data</h2>
            <p>Content you enter into AI tools (prompts, topics, ideas) may be processed by OpenAI's API to generate outputs. We do not use your inputs to train AI models. Inputs are transmitted securely and not retained beyond the generation session unless you explicitly save content to your Projects.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>OpenAI:</strong> For AI content generation (prompts only, no personal identifiers)</li>
              <li><strong>Paystack:</strong> For payment processing</li>
              <li><strong>Supabase:</strong> For authentication and database services</li>
              <li><strong>Analytics providers:</strong> For anonymized usage analysis</li>
              <li><strong>Law enforcement:</strong> When legally required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Data Retention</h2>
            <p>We retain your account data for as long as your account is active. Saved projects are retained until you delete them. You may request deletion of your data at any time by contacting us. Certain data may be retained for legal and compliance purposes after account deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Security</h2>
            <p>We implement industry-standard security measures including encryption in transit (TLS), secure database storage, and access controls. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing</li>
              <li>Data portability</li>
              <li>Lodge a complaint with your local data protection authority</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Cookies</h2>
            <p>We use cookies to maintain your session, remember preferences, and analyze usage. See our <Link href="/cookies" className="text-primary hover:underline">Cookie Policy</Link> for full details.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Children's Privacy</h2>
            <p>The Platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we discover we have collected data from a minor, we will delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or platform notification. Your continued use of the Platform after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Contact Us</h2>
            <p>For privacy inquiries or data requests, contact our Data Protection team at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
