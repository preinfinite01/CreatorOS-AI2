import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Youtube, Copy, Check, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Description() {
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [keywords, setKeywords] = useState("");
  const [result, setResult] = useState<{ description: string; keywords: string[]; firstLine: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!title.trim()) { toast({ title: "Video title required", variant: "destructive" }); return; }
    if (!deductCredits(5)) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, topic, niche, keywords }),
      });
      const data = await res.json() as { description?: string; keywords?: string[]; firstLine?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setResult({ description: data.description ?? "", keywords: data.keywords ?? [], firstLine: data.firstLine ?? "" });
      addXp(10);
      toast({ title: "Description generated!" });
      triggerPostGenAd();
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Description copied!" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
          <Youtube className="w-6 h-6 text-red-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">YouTube Description Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">SEO-rich YouTube descriptions that rank in search, hook viewers before "Show More", and drive subscriptions.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-4 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video Title</Label>
            <Input placeholder="Your exact video title..." value={title} onChange={(e) => setTitle(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Topic (optional)</Label>
            <Input placeholder="Briefly describe the video..." value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Niche</Label>
            <Input placeholder="e.g. finance, fitness, tech..." value={niche} onChange={(e) => setNiche(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Keywords (optional)</Label>
            <Input placeholder="e.g. passive income, side hustle..." value={keywords} onChange={(e) => setKeywords(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Description</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> 5 credits
          </p>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {isLoading && <Card className="glass p-5 border-white/8 space-y-3"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-64 w-full" /></Card>}
          <AnimatePresence>
            {result && !isLoading && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="glass p-5 border-white/8 group">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Description</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copy}>
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <Textarea value={result.description} readOnly rows={14} className="bg-background/40 border-white/5 text-sm leading-relaxed resize-none text-foreground/85" />
                </Card>
                {result.keywords.length > 0 && (
                  <Card className="glass p-4 border-white/8">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">SEO Keywords Embedded</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.keywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-primary/10 text-primary border border-primary/20">{kw}</span>
                      ))}
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                <Youtube className="w-7 h-7 text-red-400/50" />
              </div>
              <p className="text-muted-foreground text-sm">Enter your video title to generate a full SEO-optimized description</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
