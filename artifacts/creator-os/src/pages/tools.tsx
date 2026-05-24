import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { ToolCardLockBadge } from "@/components/tools/ToolLockGate";
import { useUserStore } from "@/store/userStore";
import {
  Zap, Wand2, FileText, Lightbulb, MessageSquare, Hash, Image,
  Repeat2, Target, Crown, Youtube, BookOpen, Megaphone,
  Star, TrendingUp, Sparkles, Search, QrCode, Palette,
  BarChart2, Volume2, Video, RefreshCw, Globe, Shuffle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_TOOLS = [
  // Content Generation
  { id: "workflow", title: "Workflow Pipeline", icon: Target, href: "/tools/workflow", desc: "Idea → Hook → Title → Script → Caption → Hashtags in one shot.", cost: 40, color: "text-primary", bg: "bg-primary/10", category: "Content Generation", badge: "⭐ Featured", premium: true },
  { id: "titles", title: "Viral Title Generator", icon: Wand2, href: "/tools/titles", desc: "CTR-optimized titles that drive massive reach.", cost: 5, color: "text-violet-400", bg: "bg-violet-500/10", category: "Content Generation", badge: null, premium: false },
  { id: "hooks", title: "Hook Creator", icon: Zap, href: "/tools/hooks", desc: "Scroll-stopping openers that hold attention past 3 seconds.", cost: 5, color: "text-yellow-400", bg: "bg-yellow-500/10", category: "Content Generation", badge: null, premium: false },
  { id: "script", title: "Script Writer", icon: FileText, href: "/tools/script", desc: "Full structured scripts with pacing cues and CTAs.", cost: 20, color: "text-blue-400", bg: "bg-blue-500/10", category: "Content Generation", badge: null, premium: true },
  { id: "ideas", title: "Idea Generator", icon: Lightbulb, href: "/tools/ideas", desc: "Viral-potential content concepts informed by trends.", cost: 10, color: "text-pink-400", bg: "bg-pink-500/10", category: "Content Generation", badge: null, premium: true },
  { id: "blog", title: "Blog Post Generator", icon: BookOpen, href: "/tools/blog", desc: "Full SEO-optimized blog posts in seconds.", cost: 20, color: "text-indigo-400", bg: "bg-indigo-500/10", category: "Content Generation", badge: "New", premium: true },
  { id: "rewriter", title: "Content Rewriter", icon: RefreshCw, href: "/tools/rewriter", desc: "Paraphrase any content in a fresh, engaging style.", cost: 8, color: "text-orange-400", bg: "bg-orange-500/10", category: "Content Generation", badge: "New", premium: true },

  // Distribution & Reach
  { id: "captions", title: "Caption Writer", icon: MessageSquare, href: "/tools/captions", desc: "Platform-native captions that drive engagement.", cost: 5, color: "text-green-400", bg: "bg-green-500/10", category: "Distribution & Reach", badge: null, premium: false },
  { id: "hashtags", title: "Hashtag Engine", icon: Hash, href: "/tools/hashtags", desc: "Algorithm-optimized hashtag clusters.", cost: 3, color: "text-cyan-400", bg: "bg-cyan-500/10", category: "Distribution & Reach", badge: null, premium: false },
  { id: "description", title: "YouTube Description", icon: Youtube, href: "/tools/description", desc: "SEO-rich YouTube descriptions that rank.", cost: 5, color: "text-red-400", bg: "bg-red-500/10", category: "Distribution & Reach", badge: null, premium: false },
  { id: "adcopy", title: "Ad Copy", icon: Megaphone, href: "/tools/adcopy", desc: "High-conversion ad copy for all major platforms.", cost: 8, color: "text-purple-400", bg: "bg-purple-500/10", category: "Distribution & Reach", badge: null, premium: true },
  { id: "seo-meta", title: "SEO Meta Generator", icon: Globe, href: "/tools/seo-meta", desc: "Optimized title tags, meta descriptions, and keywords.", cost: 5, color: "text-emerald-400", bg: "bg-emerald-500/10", category: "Distribution & Reach", badge: "New", premium: false },
  { id: "trends", title: "Niche Trend Detector", icon: TrendingUp, href: "/tools/trends", desc: "Discover trending topics in your niche before everyone else.", cost: 10, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", category: "Distribution & Reach", badge: "New", premium: true },

  // Visual & Repurposing
  { id: "thumbnail", title: "Thumbnail AI", icon: Image, href: "/tools/thumbnail", desc: "AI-generated thumbnail concepts that boost CTR.", cost: 8, color: "text-sky-400", bg: "bg-sky-500/10", category: "Visual & Repurposing", badge: null, premium: true },
  { id: "image", title: "Image Generator", icon: Star, href: "/tools/image", desc: "Stunning AI-generated visuals via Flux.", cost: 15, color: "text-rose-400", bg: "bg-rose-500/10", category: "Visual & Repurposing", badge: null, premium: true },
  { id: "repurpose", title: "Content Repurposer", icon: Repeat2, href: "/tools/repurpose", desc: "Transform long-form content into 10 platform-specific pieces.", cost: 15, color: "text-lime-400", bg: "bg-lime-500/10", category: "Visual & Repurposing", badge: null, premium: true },
  { id: "brand-voice", title: "Brand Voice", icon: BookOpen, href: "/tools/brand-voice", desc: "Define your creator voice and match all AI outputs to it.", cost: 10, color: "text-amber-400", bg: "bg-amber-500/10", category: "Visual & Repurposing", badge: null, premium: true },
  { id: "color-palette", title: "Color Palette Generator", icon: Palette, href: "/tools/color-palette", desc: "Generate brand-perfect color palettes from a description.", cost: 5, color: "text-pink-400", bg: "bg-pink-500/10", category: "Visual & Repurposing", badge: "New", premium: false },
  { id: "qr-code", title: "QR Code Creator", icon: QrCode, href: "/tools/qr-code", desc: "Custom-branded QR codes for links and campaigns.", cost: 0, color: "text-cyan-400", bg: "bg-cyan-500/10", category: "Visual & Repurposing", badge: "Free", premium: false },

  // Analytics & Growth
  { id: "engagement", title: "Engagement Calculator", icon: BarChart2, href: "/tools/engagement", desc: "Grade your engagement rate with actionable insights.", cost: 0, color: "text-blue-400", bg: "bg-blue-500/10", category: "Analytics & Growth", badge: "Free", premium: false },

  // Audio & Video
  { id: "tts", title: "Text-to-Speech", icon: Volume2, href: "/tools/tts", desc: "Convert scripts into natural voiceovers in 6+ voices.", cost: 10, color: "text-purple-400", bg: "bg-purple-500/10", category: "Audio & Video", badge: "New", premium: true },
  { id: "video-gen", title: "AI Video Generator", icon: Video, href: "/tools/video-gen", desc: "Generate short AI videos from text prompts.", cost: 30, color: "text-red-400", bg: "bg-red-500/10", category: "Audio & Video", badge: "New", premium: true },
];

const CATEGORIES = ["All", "Content Generation", "Distribution & Reach", "Visual & Repurposing", "Audio & Video", "Analytics & Growth"];

const fadeUp = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0 } };

function getRandomTool() {
  const randomIndex = Math.floor(Math.random() * ALL_TOOLS.length);
  return ALL_TOOLS[randomIndex]!;
}

export default function Tools() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { plan } = useUserStore();

  const filtered = useMemo(() => {
    return ALL_TOOLS.filter(t => {
      const matchesQuery = !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase()) || t.category.toLowerCase().includes(query.toLowerCase());
      const matchesCat = activeCategory === "All" || t.category === activeCategory;
      return matchesQuery && matchesCat;
    });
  }, [query, activeCategory]);

  const grouped = useMemo(() => {
    const cats = activeCategory === "All" ? CATEGORIES.slice(1) : [activeCategory];
    return cats.map(cat => ({ cat, tools: filtered.filter(t => t.category === cat) })).filter(g => g.tools.length > 0);
  }, [filtered, activeCategory]);

  const [randomTool, setRandomTool] = useState<typeof ALL_TOOLS[0] | null>(null);

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-1">AI Tools</h1>
          <p className="text-muted-foreground text-sm">{ALL_TOOLS.length} tools · 1 free trial per premium tool · Upgrade for unlimited</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 shrink-0"
          onClick={() => {
            const t = getRandomTool();
            setRandomTool(t);
            window.location.href = t.href;
          }}
        >
          <Shuffle className="w-3.5 h-3.5" /> Random Tool
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search tools... (e.g. hashtag, video, SEO)"
          className="pl-9 bg-white/3 border-white/10 focus:border-primary/40"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeCategory === cat
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-white/5 text-muted-foreground hover:bg-white/8 hover:text-foreground border border-white/8"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Free tier info */}
      {plan === "free" && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/15">
          <Crown className="w-4 h-4 text-yellow-400 shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">Free plan:</span> 1 trial per premium tool, then tools lock. <Link href="/pricing"><span className="text-primary font-semibold cursor-pointer hover:underline">Upgrade to Basic ($16.99/mo) or Pro ($34.99/mo)</span></Link> to unlock everything.
          </p>
        </div>
      )}

      {/* Featured Workflow */}
      {(activeCategory === "All" || activeCategory === "Content Generation") && !query && (
        <Link href="/tools/workflow">
          <motion.div
            whileHover={{ y: -2 }}
            className="relative p-7 rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-purple-900/8 cursor-pointer group overflow-hidden"
          >
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
                <Crown className="w-3 h-3" /> Recommended
              </span>
            </div>
            <div className="flex flex-col md:flex-row gap-5 items-start md:items-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-black mb-1.5">Workflow Pipeline</h2>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                  The most powerful creator workflow on the internet. Idea → Hook → Title → Script → Caption → Hashtags in one shot.
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> 40 Credits</span>
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-primary" /> 80 XP earned</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-green-400" /> 6 outputs</span>
                </div>
              </div>
            </div>
          </motion.div>
        </Link>
      )}

      {/* Tool Groups */}
      {grouped.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p>No tools found for "{query}"</p>
        </div>
      ) : (
        grouped.map(({ cat, tools }) => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary/60" />
              <h2 className="font-bold text-sm text-muted-foreground">{cat}</h2>
              <span className="text-xs text-muted-foreground/40">({tools.length})</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tools.filter(t => t.id !== "workflow").map((tool, ti) => (
                <Link key={tool.id} href={tool.href}>
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    transition={{ delay: ti * 0.05 }}
                    whileHover={{ y: -3 }}
                    className="relative h-full"
                  >
                    <ToolCardLockBadge toolId={tool.id} />
                    <Card className="p-5 h-full card-premium cursor-pointer border-white/8 hover:border-white/15 flex flex-col transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tool.bg}`}>
                          <tool.icon className={`w-5 h-5 ${tool.color}`} />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {tool.badge && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                              tool.badge === "Free"
                                ? "text-green-400 bg-green-400/10 border-green-400/20"
                                : tool.badge === "⭐ Featured"
                                ? "text-primary bg-primary/10 border-primary/20"
                                : "text-primary bg-primary/8 border-primary/15"
                            }`}>{tool.badge}</span>
                          )}
                          {tool.cost > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground">
                              <Zap className="w-2.5 h-2.5 text-yellow-400" /> {tool.cost}
                            </span>
                          )}
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
        ))
      )}
    </div>
  );
}
