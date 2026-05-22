import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Zap, Sparkles, TrendingUp, ChevronRight, Star, Check, 
  ArrowRight, Play, Youtube, Instagram, Twitter,
  FileText, Hash, Image, Layers, Wand2, BookOpen,
  MessageSquare, Target, BarChart3, Crown, Users, Repeat2,
  ChevronDown, Flame, Globe
} from "lucide-react";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Tools", href: "#tools" },
  { label: "Pricing", href: "/pricing" },
];

const STATS = [
  { value: "47,000+", label: "Active Creators" },
  { value: "12M+", label: "Pieces Generated" },
  { value: "20+", label: "AI Tools" },
  { value: "4.9/5", label: "Creator Rating" },
];

const TOOLS_SHOWCASE = [
  { icon: Wand2, name: "Viral Title Generator", desc: "Click-through rates up to 3x", color: "text-violet-400", bg: "bg-violet-500/10" },
  { icon: Zap, name: "Hook Creator", desc: "Stop the scroll instantly", color: "text-yellow-400", bg: "bg-yellow-500/10" },
  { icon: FileText, name: "Script Writer", desc: "Full scripts in 30 seconds", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: Sparkles, name: "Idea Generator", desc: "Never run out of ideas", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Hash, name: "Hashtag Engine", desc: "Algorithm-optimized tags", color: "text-green-400", bg: "bg-green-500/10" },
  { icon: MessageSquare, name: "Caption Writer", desc: "Captions that drive action", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Image, name: "Thumbnail AI", desc: "Visual prompts that convert", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Repeat2, name: "Content Repurposer", desc: "1 idea → 10 pieces of content", color: "text-emerald-400", bg: "bg-emerald-500/10" },
];

const FEATURES = [
  {
    icon: Layers,
    title: "One Platform. Every Content Need.",
    desc: "From idea to published post — titles, hooks, scripts, captions, hashtags, and thumbnails. All in one intelligent workspace.",
    badge: "Workflow Pipeline"
  },
  {
    icon: Target,
    title: "Platform-Native Intelligence",
    desc: "Every output is trained on what actually performs on YouTube, TikTok, and Instagram. Not generic AI — creator-tuned AI.",
    badge: "Algorithm-Aware"
  },
  {
    icon: BarChart3,
    title: "Grow With Your Creator Level",
    desc: "Earn XP, level up, and unlock more powerful generation capabilities as your creative output grows.",
    badge: "Gamified Productivity"
  },
];

const TESTIMONIALS = [
  {
    name: "Jordan K.",
    role: "YouTube Creator — 820K subs",
    avatar: "JK",
    rating: 5,
    text: "CreatorOS completely changed my content game. I used to spend 3 hours scripting one video. Now it takes 15 minutes. My watch time is up 40%."
  },
  {
    name: "Amara O.",
    role: "TikTok Creator — 2.1M followers",
    avatar: "AO",
    rating: 5,
    text: "The hook generator alone is worth every penny. My average view duration went from 28% to 67% after I started using CreatorOS hooks."
  },
  {
    name: "Marcus T.",
    role: "Instagram & YouTube Creator",
    avatar: "MT",
    rating: 5,
    text: "I've tried every AI tool on the market. This is the only one that actually understands content creation. The workflow pipeline is absolutely insane."
  },
];

const FAQ = [
  {
    q: "How is CreatorOS different from ChatGPT?",
    a: "ChatGPT is a general-purpose AI. CreatorOS is purpose-built for content creators with trained models specifically optimized for viral content, platform algorithms, and creator workflows. Every tool is tuned for real results."
  },
  {
    q: "Which platforms does CreatorOS support?",
    a: "CreatorOS generates content optimized for YouTube (long-form & Shorts), TikTok, Instagram Reels, and more. You select your platform and the AI adapts its output accordingly."
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes. Cancel at any time with no penalties. Your plan stays active until the end of your billing period."
  },
  {
    q: "What are credits and how do they work?",
    a: "Credits are used each time you generate content. Free users get 100 credits per month. Basic gets 2,000. Pro users get unlimited credits with no caps."
  },
  {
    q: "Is there a free trial?",
    a: "Yes — our Free plan includes 100 credits with access to all core tools. No credit card required. Upgrade when you're ready to scale."
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
};

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">CreatorOS <span className="text-gradient-primary font-black">AI</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <span className="hidden sm:block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Sign In</span>
            </Link>
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 h-9 text-sm font-semibold shadow-lg shadow-primary/25">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6 text-center overflow-hidden bg-grid">
        <div className="absolute inset-0 bg-radial-primary pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-8"
          >
            <Flame className="w-3.5 h-3.5" />
            The #1 AI Operating System for Content Creators
          </motion.div>

          <motion.h1
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.55, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[0.9]"
          >
            <span className="text-gradient">Create viral content.</span>
            <br />
            <span className="text-gradient-primary">10x faster</span>
            <span className="text-gradient"> with AI.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Stop staring at a blank page. Generate scroll-stopping hooks, scripts, titles, captions, and hashtags — all optimized for YouTube, TikTok, and Instagram — in seconds.
          </motion.p>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Link href="/signup">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-9 h-14 text-base font-bold shadow-2xl shadow-primary/30 group">
                Start Creating for Free
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#tools">
              <Button size="lg" variant="ghost" className="rounded-full px-9 h-14 text-base border border-white/10 hover:bg-white/5">
                <Play className="mr-2 w-4 h-4" /> Explore Tools
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp} initial="hidden" animate="show" transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground"
          >
            {["Free to start", "No credit card", "Cancel anytime", "20+ AI tools"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-green-400" /> {t}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats Ribbon ────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-card/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-black text-gradient-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tools Showcase ───────────────────────────────────────── */}
      <section id="tools" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}>
              <span className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 block">20+ AI Tools</span>
              <h2 className="text-4xl md:text-5xl font-black text-gradient mb-4">Every tool a creator needs</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">One platform replaces 10 different subscriptions. Everything you need to create, grow, and monetize.</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TOOLS_SHOWCASE.map((tool, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                className="tool-card p-5 rounded-2xl card-premium cursor-pointer group"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${tool.bg} group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                </div>
                <h3 className="font-bold text-sm mb-1">{tool.name}</h3>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="text-center mt-10"
          >
            <Link href="/signup">
              <Button className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 h-11">
                Explore All Tools <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 bg-card/20 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 block">Creator Workflow</span>
            <h2 className="text-4xl md:text-5xl font-black text-gradient mb-4">From blank page to viral content</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">Our AI Workflow Pipeline chains every step of content creation into one seamless flow.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Enter Your Topic", desc: "Give CreatorOS a niche, topic, or keyword. Our AI understands context, platform, and your creator style.", icon: Sparkles },
              { step: "02", title: "AI Generates Everything", desc: "In seconds, get your viral idea, hook, title, full script, caption, hashtags, and thumbnail prompt.", icon: Zap },
              { step: "03", title: "Film. Post. Go Viral.", desc: "Copy-paste your content, go film, and post. CreatorOS handles the strategy so you can focus on creation.", icon: TrendingUp },
            ].map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 relative">
                  <step.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center">{step.step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl card-premium"
              >
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    {feat.badge}
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <feat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Support ─────────────────────────────────────── */}
      <section className="py-16 px-6 bg-card/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold mb-8">Optimized for the world's biggest creator platforms</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { Icon: Youtube, name: "YouTube", color: "text-red-500" },
              { Icon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.2a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.23 8.23 0 0 0 4.81 1.54V6.79a4.85 4.85 0 0 1-1.04-.1z"/>
                </svg>
              ), name: "TikTok", color: "text-white" },
              { Icon: Instagram, name: "Instagram", color: "text-pink-500" },
              { Icon: Twitter, name: "X / Twitter", color: "text-sky-400" },
              { Icon: Globe, name: "Any Platform", color: "text-green-400" },
            ].map(({ Icon, name, color }, i) => (
              <div key={i} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Icon className={`w-6 h-6 ${color}`} />
                <span className="font-semibold text-sm">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 block">Creator Stories</span>
            <h2 className="text-4xl md:text-5xl font-black text-gradient mb-4">Creators love CreatorOS</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl card-premium flex flex-col"
              >
                <div className="flex mb-3">
                  {Array(t.rating).fill(0).map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed flex-1 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">{t.avatar}</div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ───────────────────────────────────────── */}
      <section className="py-28 px-6 bg-card/20 border-y border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-primary font-semibold text-sm uppercase tracking-widest mb-4 block">Simple Pricing</span>
          <h2 className="text-4xl md:text-5xl font-black text-gradient mb-6">Start free. Scale as you grow.</h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">Every plan gives you access to all core AI tools. Upgrade for more credits and advanced capabilities.</p>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { name: "Free", price: "$0", period: "forever", features: ["100 credits/mo", "All core tools", "Community support"], cta: "Start Free", highlight: false },
              { name: "Basic", price: "$20", period: "/month", features: ["2,000 credits/mo", "Priority AI", "Full workflow pipeline"], cta: "Get Basic", highlight: false },
              { name: "Pro", price: "$50", period: "/month", features: ["Unlimited credits", "All tools unlocked", "Priority support"], cta: "Go Pro", highlight: true },
            ].map((plan, i) => (
              <div key={i} className={`p-6 rounded-2xl border text-left relative ${plan.highlight ? 'bg-primary/10 border-primary/40' : 'card-premium border-white/8'}`}>
                {plan.highlight && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-white text-xs font-bold rounded-full flex items-center gap-1"><Crown className="w-3 h-3" /> Most Popular</div>}
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-3xl font-black">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-0.5">{plan.period}</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className={`w-full ${plan.highlight ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-white/5 hover:bg-white/10 border border-white/10'}`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>

          <Link href="/pricing">
            <span className="text-sm text-primary hover:underline cursor-pointer">View full pricing with currency options →</span>
          </Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-gradient mb-4">Questions? We have answers.</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-white/8 overflow-hidden card-premium"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold hover:bg-white/3 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 ml-4 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                    {item.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden text-center p-12 md:p-20 border border-primary/20"
            style={{ background: 'linear-gradient(135deg, hsl(263 80% 60% / 0.12) 0%, hsl(240 12% 6%) 60%)' }}
          >
            <div className="absolute inset-0 bg-radial-primary pointer-events-none" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-gradient mb-6">
                Your next viral video<br />starts here.
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                Join 47,000+ creators who use CreatorOS AI to produce more content, grow faster, and spend less time writing.
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-10 h-14 text-base font-bold shadow-2xl shadow-primary/30 group">
                  Start for Free — No Card Required
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-14">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">CreatorOS <span className="text-gradient-primary font-black">AI</span></span>
              </div>
              <p className="text-sm text-muted-foreground/70 max-w-xs">The AI operating system for world-class content creators.</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Product</p>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <Link href="/pricing"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Pricing</span></Link>
                <Link href="/login"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Sign In</span></Link>
                <Link href="/signup"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Get Started</span></Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Legal</p>
              <div className="space-y-2">
                <Link href="/terms"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></Link>
                <Link href="/privacy"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></Link>
                <Link href="/refund-policy"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Refund Policy</span></Link>
                <Link href="/acceptable-use"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Acceptable Use</span></Link>
                <Link href="/cookies"><span className="block text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">Cookie Policy</span></Link>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 mb-3">Support</p>
              <div className="space-y-2">
                <a href="mailto:support@creatorosai.com" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact Support</a>
                <a href="mailto:billing@creatorosai.com" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Billing</a>
                <a href="mailto:trust@creatorosai.com" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Trust & Safety</a>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground/40">© {new Date().getFullYear()} CreatorOS AI. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/40">
              <Link href="/privacy"><span className="hover:text-muted-foreground transition-colors cursor-pointer">Privacy</span></Link>
              <Link href="/terms"><span className="hover:text-muted-foreground transition-colors cursor-pointer">Terms</span></Link>
              <Link href="/cookies"><span className="hover:text-muted-foreground transition-colors cursor-pointer">Cookies</span></Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
