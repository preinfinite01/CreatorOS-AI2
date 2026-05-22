import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "May 19, 2026";
const COMPANY = "CreatorOS AI";
const EMAIL = "trust@creatorosai.com";

export default function AcceptableUse() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">Acceptable Use Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Purpose</h2>
            <p>This Acceptable Use Policy ("AUP") defines the standards of conduct expected from all users of {COMPANY}. By using the Platform, you agree to comply with this policy. Violations may result in immediate account termination without refund.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Permitted Uses</h2>
            <p>You may use {COMPANY} to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Generate original content for your social media channels, brand, or business</li>
              <li>Create scripts, captions, hooks, titles, and other creative materials</li>
              <li>Generate images for personal or commercial use within platform terms</li>
              <li>Build and manage your content creation workflow</li>
              <li>Experiment with AI tools for legitimate creative purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Strictly Prohibited Content</h2>
            <p>You may NOT generate, store, or distribute content that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Is sexually explicit involving minors (CSAM) — zero tolerance, law enforcement will be notified</li>
              <li>Incites violence, terrorism, or harm against individuals or groups</li>
              <li>Constitutes defamation, harassment, or targeted abuse of real individuals</li>
              <li>Spreads demonstrably false information designed to deceive at scale</li>
              <li>Infringes third-party intellectual property rights</li>
              <li>Promotes illegal activities, controlled substances, or financial fraud</li>
              <li>Contains hate speech targeting race, ethnicity, religion, gender, or sexual orientation</li>
              <li>Violates any applicable local, national, or international law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Prohibited Technical Use</h2>
            <p>You may NOT:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Use automated bots, scrapers, or scripts to access the Platform without written permission</li>
              <li>Attempt to reverse-engineer, decompile, or extract Platform code or AI models</li>
              <li>Circumvent rate limits, credit systems, or access controls</li>
              <li>Share account credentials to gain unauthorized multi-user access</li>
              <li>Attempt to inject malicious code, exploits, or SQL into the Platform</li>
              <li>Interfere with the Platform's normal operation or other users' access</li>
              <li>Resell Platform access or generated content under a competing service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. AI Ethics and Responsible Use</h2>
            <p>When using AI generation features, you agree to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Not use generated content to impersonate real individuals without consent</li>
              <li>Not create deepfake-style content designed to deceive</li>
              <li>Not use AI outputs to spam, manipulate, or mislead audiences at scale</li>
              <li>Review and take responsibility for all content before publishing</li>
              <li>Disclose AI involvement where required by platform policies or law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Content Moderation</h2>
            <p>We reserve the right to review, remove, or block content that violates this AUP. Our AI systems include safety filters designed to prevent harmful outputs. Attempts to circumvent these filters are a direct violation of this policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Rate Limits and Fair Use</h2>
            <p>To ensure platform availability for all users, we enforce rate limits on API requests and generation volume. Excessive usage beyond plan limits or attempts to artificially inflate usage may result in throttling or account review.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Enforcement</h2>
            <p>Violations of this AUP may result in:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Temporary account suspension pending investigation</li>
              <li>Permanent account termination without refund</li>
              <li>Reporting to relevant law enforcement agencies</li>
              <li>Legal action for damages caused by violations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Reporting Violations</h2>
            <p>If you become aware of a violation of this AUP, please report it to <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>. We investigate all credible reports and take appropriate action.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
