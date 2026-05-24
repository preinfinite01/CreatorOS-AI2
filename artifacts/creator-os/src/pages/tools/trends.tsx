import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { ToolLockGate } from "@/components/tools/ToolLockGate";
import { useToolAccess } from "@/hooks/useToolAccess";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Zap, Flame, ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface Trend { topic: string; potential: "🔥 Viral" | "📈 Rising" | "💡 Emerging"; reasoning: string; contentIdeas: string[]; }

export default function Trends() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("trends");

  const handleGenerate = async () => {
    if (!niche.trim()) { toast({ title: "Niche required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 10))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai/detect-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, platform }),
      });
      const data = await res.json() as { trends?: Trend[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setTrends(data.trends ?? []);
      addXp(20);
      toast({ title: "Trends detected!" });
    } catch {
      toast({ title: "Detection failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const potentialColor: Record<string, string> = {
    "🔥 Viral": "text-red-400 bg-red-400/10 border-red-400/20",
    "📈 Rising": "text-orange-400 bg-orange-400/10 border-orange-400/20",
    "💡 Emerging": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  };

  return (
    <ToolLockGate toolId="trends" toolName="Niche Trend Detector">
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <h1 className="text-2xl font-black">Niche Trend Detector</h1>
          </div>
          <p className="text-muted-foreground text-sm">Discover what's trending in your niche before everyone else.</p>
        </div>

        <Card className="p-5 border-white/8 card-premium space-y-4">
          <div className="space-y-2">
            <Label>Your Niche</Label>
            <Input value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. personal finance, fitness, tech reviews, cooking..." />
          </div>
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="twitter">Twitter / X</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Detecting trends...</> : <><Zap className="w-4 h-4" />Detect Trends — 10 Credits</>}
          </Button>
        </Card>

        <AnimatePresence>
          {trends.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {trends.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Card className="p-5 border-white/8 card-premium space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-green-400" />
                        <h3 className="font-bold">{t.topic}</h3>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${potentialColor[t.potential] ?? "text-muted-foreground bg-white/5 border-white/10"}`}>
                        {t.potential}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.reasoning}</p>
                    <div className="space-y-1.5">
                      <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-wider flex items-center gap-1"><Flame className="w-3 h-3" /> Content Ideas</p>
                      {t.contentIdeas.map((idea, ii) => (
                        <div key={ii} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary/60 shrink-0 mt-0.5">→</span>
                          <span>{idea}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLockGate>
  );
}
