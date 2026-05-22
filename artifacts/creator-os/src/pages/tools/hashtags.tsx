import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Hash, Copy, Check, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HashtagResult {
  hashtags: { mega: string[]; midTier: string[]; niche: string[] };
  topPicks: string[];
}

export default function Hashtags() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [result, setResult] = useState<HashtagResult | null>(null);
  const [copiedGroup, setCopiedGroup] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) { toast({ title: "Topic required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? '', 3))) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate-hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, niche, count: 30 }),
      });
      const data = await res.json() as HashtagResult & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setResult(data);
      addXp(5);
      toast({ title: "Hashtags generated!" });
      triggerPostGenAd();
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyGroup = (tags: string[], groupName: string) => {
    navigator.clipboard.writeText(tags.join(" "));
    setCopiedGroup(groupName);
    setTimeout(() => setCopiedGroup(null), 2000);
    toast({ title: "Copied to clipboard!" });
  };

  const GROUPS = result ? [
    { name: "Top Picks", tags: result.topPicks, desc: "Best mix for maximum reach", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { name: "Mega Tags", tags: result.hashtags?.mega ?? [], desc: "10M+ posts • Broad reach", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
    { name: "Mid-Tier", tags: result.hashtags?.midTier ?? [], desc: "100K-5M posts • Targeted reach", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { name: "Niche Tags", tags: result.hashtags?.niche ?? [], desc: "<100K posts • Highly engaged audience", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <Hash className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Hashtag Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">Algorithm-optimized hashtag clusters that expand your content's reach across tiers.</p>
        </div>
      </div>

      <Card className="glass p-6 border-white/8">
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic</Label>
            <Input placeholder="e.g. morning yoga routine" value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Niche</Label>
            <Input placeholder="e.g. wellness, fitness..." value={niche} onChange={(e) => setNiche(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">X / Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <Button onClick={handleGenerate} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white font-semibold h-10 px-6">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Hashtags</>}
          </Button>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> 3 credits</span>
        </div>
      </Card>

      {isLoading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => <Card key={i} className="glass p-5 border-white/8"><Skeleton className="h-4 w-1/3 mb-3" /><Skeleton className="h-20 w-full" /></Card>)}
        </div>
      )}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid sm:grid-cols-2 gap-4">
            {GROUPS.map((group) => (
              <Card key={group.name} className={`glass p-5 border ${group.border} hover:border-opacity-60 transition-colors group`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`font-bold text-sm ${group.color}`}>{group.name}</h3>
                    <p className="text-xs text-muted-foreground">{group.desc}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyGroup(group.tags, group.name)}>
                    {copiedGroup === group.name ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {group.tags.map((tag, ti) => (
                    <span key={ti} onClick={() => { navigator.clipboard.writeText(tag); toast({ title: "Copied!" }); }} className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${group.bg} ${group.color} hover:opacity-80 transition-opacity`}>
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!result && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4">
            <Hash className="w-7 h-7 text-orange-400/50" />
          </div>
          <p className="text-muted-foreground text-sm">Enter your topic and generate a full hashtag strategy</p>
        </div>
      )}
    </div>
  );
}
