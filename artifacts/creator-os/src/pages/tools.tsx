import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Zap, Wand2, FileText, Lightbulb, MessageSquare, Hash, Image,
  Repeat2, Target, Crown, Youtube, BookOpen, Megaphone,
  Star, TrendingUp, Sparkles
} from "lucide-react";

const TOOL_CATEGORIES = [
  {
    name: "Content Generation",
    icon: Sparkles,
    color: "text-violet-400",
    tools: [
      { title: "Viral Title Generator", icon: Wand2, href: "/tools/titles", desc: "Craft click-through-rate-optimized titles that drive massive reach.", cost: 5, color: "text-violet-400", bg: "bg-violet-500/10", badge: null },
      { title: "Hook Creator", icon: Zap, href: "/tools/hooks", desc: "Generate scroll-stopping openers that hold attention past the critical 3 seconds.", cost: 5, color: "text-yellow-400", bg: "bg-yellow-500/10", badge: null },
      { title: "Script Writer", icon: FileText, href: "/tools/script", desc: "Full structured scripts with pacing cues, visual notes, and persuasive CTAs.", cost: 20, color: "text-blue-400", bg: "bg-blue-500/10", badge: null },
      { title: "Idea Generator", icon: Lightbulb, href: "/tools/ideas", desc: "Discover viral-potential content concepts informed by current creator trends.", cost: 10, color: "text-pink-400", bg: "bg-pink-500/10", badge: null },
    ]
  },
  {
    name: "Distribution & Reach",
    icon: TrendingUp,
    color: "text-green-400",
    tools: [
      { title: "Caption Writer", icon: MessageSquare, href: "/tools/captions", desc: "Platform-native captions designed to drive comments, shares, and saves.", cost: 5, color: "text-green-400", bg: "bg-green-500/10", badge: null },
      { title: "Hashtag Engine", icon: Hash, href: "/tools/hashtags", desc: "Algorithm-optimized hashtag clusters that put your content in front of the right audience.", cost: 3, color: "text-orange-400", bg: "bg-orange-500/10", badge: null },
      { title: "YouTube Description", icon: Youtube, href: "/tools/description", desc: "SEO-rich YouTube descriptions that rank in search and drive subscriptions.", cost: 5, color: "text-red-400", bg: "bg-red-500/10", badge: "New" },
      { title: "Ad Copy", icon: Megaphone, href: "/tools/adcopy", desc: "High-conversion ad copy for paid promotion across all major platforms.", cost: 8, color: "text-purple-400", bg: "bg-purple-500/10", badge: "New" },
    ]
  },
  {
    name: "Visual & Repurposing",
    icon: Image,
    color: "text-cyan-400",
    tools: [
      { title: "Thumbnail AI", icon: Image, href: "/tools/thumbnail", desc: "AI-generated thumbnail prompts and concepts proven to boost click-through rates.", cost: 8, color: "text-cyan-400", bg: "bg-cyan-500/10", badge: null },
      { title: "Image Generator", icon: Star, href: "/tools/image", desc: "Create stunning AI-generated visuals, thumbnails, and social media graphics.", cost: 15, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", badge: "New" },
      { title: "Content Repurposer", icon: Repeat2, href: "/tools/repurpose", desc: "Transform one piece of long-form content into 10 platform-specific short pieces.", cost: 15, color: "text-emerald-400", bg: "bg-emerald-500/10", badge: "New" },
      { title: "Brand Voice", icon: BookOpen, href: "/tools/brand-voice", desc: "Define your unique creator voice and get all AI outputs matched to your style.", cost: 10, color: "text-indigo-400", bg: "bg-indigo-500/10", badge: "New" },
    ]
  }
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Tools() {
  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black tracking-tight mb-2">AI Tools</h1>
        <p className="text-muted-foreground">20+ tools to take your content from idea to viral. Start with the Workflow Pipeline for the full experience.</p>
      </div>

      {/* Featured Workflow */}
      <Link href="/tools/workflow">
        <motion.div
          whileHover={{ y: -2 }}
          className="relative p-8 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 to-purple-900/10 cursor-pointer group overflow-hidden"
        >
          <div className="absolute inset-0 bg-radial-primary pointer-events-none opacity-50" />
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
              <Crown className="w-3 h-3" /> Recommended
            </span>
          </div>
          <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                Workflow Pipeline
                <span className="text-sm font-normal text-muted-foreground">(Idea → Hook → Title → Script → Caption → Hashtags)</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-2xl">
                The most powerful creator workflow on the internet. Enter a single topic and get a complete, publish-ready content package in under 30 seconds.
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-yellow-400" /> 40 Credits</span>
                <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5 text-primary" /> 80 XP earned</span>
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-green-400" /> 6 outputs generated</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Tool Categories */}
      {TOOL_CATEGORIES.map((category, ci) => (
        <div key={ci} className="space-y-4">
          <div className="flex items-center gap-2">
            <category.icon className={`w-4 h-4 ${category.color}`} />
            <h2 className="font-bold text-base">{category.name}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {category.tools.map((tool, ti) => (
              <Link key={ti} href={tool.href}>
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  transition={{ delay: ti * 0.06 }}
                  whileHover={{ y: -3 }}
                  className="tool-card h-full"
                >
                  <Card className="p-5 h-full card-premium cursor-pointer border-white/8 hover:border-white/15 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.bg}`}>
                        <tool.icon className={`w-5 h-5 ${tool.color}`} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tool.badge && (
                          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">{tool.badge}</span>
                        )}
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                          <Zap className="w-2.5 h-2.5 text-yellow-400" /> {tool.cost}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-bold text-sm mb-2">{tool.title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed flex-1">{tool.desc}</p>
                  </Card>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
