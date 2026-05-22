import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Zap, TrendingUp, FolderOpen, Wand2, Lightbulb, Target,
  ArrowRight, Flame, Crown, MessageSquare, Hash, Image,
  ChevronRight, Sparkles, FileText, Repeat2, BarChart3,
  Clock, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const activityData = [
  { day: "Mon", gens: 12 }, { day: "Tue", gens: 19 },
  { day: "Wed", gens: 8 },  { day: "Thu", gens: 25 },
  { day: "Fri", gens: 31 }, { day: "Sat", gens: 18 },
  { day: "Sun", gens: 22 },
];

const QUICK_TOOLS = [
  { title: "Viral Titles", icon: Wand2, href: "/tools/titles", color: "text-violet-400", bg: "bg-violet-500/10", desc: "Boost CTR instantly" },
  { title: "Hook Creator", icon: Zap, href: "/tools/hooks", color: "text-yellow-400", bg: "bg-yellow-500/10", desc: "Stop the scroll" },
  { title: "Script Writer", icon: FileText, href: "/tools/script", color: "text-blue-400", bg: "bg-blue-500/10", desc: "Full scripts in 30s" },
  { title: "Idea Engine", icon: Lightbulb, href: "/tools/ideas", color: "text-pink-400", bg: "bg-pink-500/10", desc: "Never run dry" },
  { title: "Captions", icon: MessageSquare, href: "/tools/captions", color: "text-green-400", bg: "bg-green-500/10", desc: "Drive engagement" },
  { title: "Hashtags", icon: Hash, href: "/tools/hashtags", color: "text-orange-400", bg: "bg-orange-500/10", desc: "Maximize reach" },
  { title: "Image AI", icon: Image, href: "/tools/image", color: "text-cyan-400", bg: "bg-cyan-500/10", desc: "Visual concepts" },
  { title: "Repurpose", icon: Repeat2, href: "/tools/repurpose", color: "text-emerald-400", bg: "bg-emerald-500/10", desc: "1 idea × 10 posts" },
];

const TRENDING = [
  { topic: "AI Productivity Hacks", platform: "YouTube", score: 98, tag: "🔥 Trending" },
  { topic: "Morning Routine 2025", platform: "TikTok", score: 94, tag: "📈 Rising" },
  { topic: "Side Hustles That Actually Work", platform: "Instagram", score: 91, tag: "💰 Hot" },
  { topic: "Budget Travel Secrets", platform: "YouTube", score: 87, tag: "✈️ Viral" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { credits, level, xp, streak, plan } = useUserStore();
  const { formatPrice } = useSubscriptionStore();

  const firstName = user?.email?.split("@")[0] ?? "Creator";
  const xpProgress = (xp % 500) / 5;
  const creditsPercent = plan === "pro" ? 100 : plan === "basic" ? (credits / 2000) * 100 : (credits / 100) * 100;

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Welcome back, <span className="text-gradient-primary capitalize">{firstName}</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">Your AI creator hub. Ready to produce something brilliant?</p>
        </div>
        <div className="flex items-center gap-3">
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-orange-400">{streak} day streak</span>
            </div>
          )}
          <Link href="/tools/workflow">
            <Button className="bg-primary hover:bg-primary/90 text-white rounded-full h-9 px-5 text-sm font-semibold shadow-lg shadow-primary/25">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> New Content
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <motion.div
        variants={fadeUp} initial="hidden" animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Credits */}
        <Card className="glass p-5 col-span-1">
          <div className="flex items-start justify-between mb-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center">
              <Zap className="w-4.5 h-4.5 text-yellow-400" />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan === 'pro' ? 'bg-yellow-400/15 text-yellow-400' : 'bg-white/5 text-muted-foreground'}`}>
              {plan.toUpperCase()}
            </span>
          </div>
          <p className="text-2xl font-black mb-0.5">{plan === "pro" ? "∞" : credits.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">AI Credits</p>
          {plan !== "pro" && (
            <Progress value={creditsPercent} className="h-1 mt-3" />
          )}
        </Card>

        {/* Level */}
        <Card className="glass p-5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <TrendingUp className="w-4.5 h-4.5 text-primary" />
          </div>
          <p className="text-2xl font-black mb-0.5">Level {level}</p>
          <p className="text-xs text-muted-foreground">{xp} XP · {500 - (xp % 500)} to next</p>
          <Progress value={xpProgress} className="h-1 mt-3" />
        </Card>

        {/* Streak */}
        <Card className="glass p-5">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center mb-3">
            <Flame className="w-4.5 h-4.5 text-orange-400" />
          </div>
          <p className="text-2xl font-black mb-0.5">{streak}</p>
          <p className="text-xs text-muted-foreground">Day Creator Streak</p>
          <div className="flex gap-1 mt-3">
            {Array(7).fill(0).map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i < Math.min(streak, 7) ? 'bg-orange-400' : 'bg-white/10'}`} />
            ))}
          </div>
        </Card>

        {/* Projects */}
        <Card className="glass p-5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
            <FolderOpen className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <p className="text-2xl font-black mb-0.5">12</p>
          <p className="text-xs text-muted-foreground">Saved Projects</p>
          <Link href="/projects">
            <p className="text-xs text-primary hover:underline mt-3 cursor-pointer font-medium">View all →</p>
          </Link>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Tools */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg">AI Tools</h2>
            <Link href="/tools">
              <span className="text-xs text-primary hover:underline cursor-pointer font-medium flex items-center gap-1">
                All tools <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_TOOLS.map((tool, i) => (
              <Link key={i} href={tool.href}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="p-4 rounded-2xl card-premium cursor-pointer group transition-all hover:border-white/15"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${tool.bg} group-hover:scale-110 transition-transform`}>
                    <tool.icon className={`w-4.5 h-4.5 ${tool.color}`} />
                  </div>
                  <p className="text-xs font-bold mb-0.5">{tool.title}</p>
                  <p className="text-xs text-muted-foreground">{tool.desc}</p>
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Activity Chart */}
          <Card className="glass p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Generation Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This week's AI outputs</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                <TrendingUp className="w-3.5 h-3.5" /> +24% this week
              </div>
            </div>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 4, right: 0, left: -32, bottom: 0 }}>
                  <defs>
                    <linearGradient id="genGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(263 80% 60%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(263 80% 60%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#555" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#555" tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(240 12% 6%)', border: '1px solid hsl(240 8% 14%)', borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ stroke: 'hsl(263 80% 60% / 0.3)' }}
                  />
                  <Area type="monotone" dataKey="gens" stroke="hsl(263 80% 60%)" strokeWidth={2.5} fill="url(#genGrad)" dot={false} activeDot={{ r: 5, fill: 'hsl(263 80% 60%)' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Trending Topics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Trending Now</h2>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-2">
              {TRENDING.map((item, i) => (
                <Link key={i} href={`/tools/ideas?topic=${encodeURIComponent(item.topic)}`}>
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="p-3.5 rounded-xl card-premium cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-semibold leading-snug group-hover:text-primary transition-colors">{item.topic}</p>
                      <span className="text-xs text-muted-foreground shrink-0">{item.tag}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{item.platform}</span>
                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${item.score}%` }} />
                      </div>
                      <span className="text-xs font-bold text-primary">{item.score}</span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>

          {/* Workflow CTA */}
          <Link href="/tools/workflow">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/25 cursor-pointer hover:border-primary/40 transition-colors group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold mb-1">Full Workflow Pipeline</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">One topic → complete content package. Idea, hook, title, script, caption, hashtags.</p>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-primary font-semibold">
                <Zap className="w-3 h-3" /> 40 Credits · 80 XP
              </div>
            </div>
          </Link>

          {/* Upgrade prompt for free users */}
          {plan === "free" && (
            <Link href="/pricing">
              <div className="p-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 cursor-pointer hover:bg-yellow-400/8 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">Upgrade to Pro</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Unlimited AI credits. Never hit a limit again.</p>
                <div className="text-xs font-bold text-yellow-400 flex items-center gap-1">
                  From {formatPrice(20)}/mo <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
