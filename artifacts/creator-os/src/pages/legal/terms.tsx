import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "May 19, 2026";
const COMPANY = "CreatorOS AI";
const EMAIL = "legal@creatorosai.com";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/">
          <Button variant="ghost" className="mb-8 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-invert max-w-none space-y-8 text-foreground/80 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using {COMPANY} ("the Platform", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Platform. These Terms constitute a legally binding agreement between you and {COMPANY}.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Description of Service</h2>
            <p>{COMPANY} is an AI-powered content creation platform that provides tools for generating video titles, hooks, scripts, ideas, captions, hashtags, images, and other creative content ("Content"). All AI-generated outputs are produced by large language models and image generation systems.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years old to use the Platform. By using the Platform, you represent and warrant that you meet this age requirement and have the legal capacity to enter into these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Account Registration</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. You agree to notify us immediately of any unauthorized access. We reserve the right to terminate accounts that violate these Terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Subscription Plans and Billing</h2>
            <p>The Platform offers Free, Basic, and Pro subscription tiers. Paid subscriptions are billed on a monthly or annual basis. You authorize us to charge your payment method for the applicable fees. All payments are processed securely. Prices are subject to change with 30 days' notice.</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li><strong>Free:</strong> 100 credits per month, limited features, ad-supported</li>
              <li><strong>Basic:</strong> 2,000 credits per month, reduced ads</li>
              <li><strong>Pro:</strong> Unlimited credits, ad-free, priority generation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Credits System</h2>
            <p>Credits are consumed when you use AI generation features. Credits do not roll over between billing periods. Credits have no monetary value and cannot be exchanged or transferred. We reserve the right to modify credit costs with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. AI-Generated Content</h2>
            <p>You acknowledge that:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>AI-generated content may not be accurate, complete, or suitable for all purposes</li>
              <li>You are solely responsible for reviewing and editing AI-generated content before publishing</li>
              <li>AI outputs should not be used for medical, legal, financial, or professional advice</li>
              <li>We do not guarantee any particular quality, virality, or outcome from AI-generated content</li>
              <li>You own the content you generate through the Platform, subject to our usage rights below</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Intellectual Property</h2>
            <p>You retain ownership of content you input into the Platform. You grant {COMPANY} a non-exclusive license to use your inputs for the purpose of providing the service. Content generated through the Platform may be used commercially by you. The Platform's software, design, trademarks, and documentation remain the exclusive property of {COMPANY}.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Prohibited Uses</h2>
            <p>You may not use the Platform to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li>Generate illegal, harmful, abusive, hateful, or defamatory content</li>
              <li>Violate any third-party intellectual property rights</li>
              <li>Distribute spam or unsolicited commercial communications</li>
              <li>Attempt to reverse engineer or circumvent security measures</li>
              <li>Use automated bots or scrapers without written permission</li>
              <li>Resell or sublicense platform access without authorization</li>
              <li>Generate content that sexualizes minors or promotes violence</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, {COMPANY} shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability to you shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Disclaimer of Warranties</h2>
            <p>The Platform is provided "as is" without warranties of any kind. We do not warrant that the Platform will be uninterrupted, error-free, or that AI outputs will meet your specific requirements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">12. Termination</h2>
            <p>We may terminate or suspend your account at any time for violations of these Terms. You may cancel your subscription at any time through your account settings. Upon termination, your right to use the Platform ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">13. Governing Law</h2>
            <p>These Terms are governed by applicable law. Any disputes shall be resolved through binding arbitration, except where prohibited by law. You waive the right to participate in class action lawsuits against {COMPANY}.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">14. Changes to Terms</h2>
            <p>We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance. We will notify you of material changes via email or in-platform notification.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">15. Contact</h2>
            <p>For questions about these Terms, contact us at <a href={`mailto:${EMAIL}`} className="text-primary hover:underline">{EMAIL}</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
