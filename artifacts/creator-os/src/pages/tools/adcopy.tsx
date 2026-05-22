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
import { Loader2, Megaphone, Copy, Check, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AdItem {
  primaryText: string;
  headline: string;
  cta: string;
  framework: string;
}

export default function AdCopy() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [platform, setPlatform] = useState("facebook");
  const [goal, setGoal] = useState("conversions");
  const [tone, setTone] = useState("persuasive");
  const [results, setResults] = useState<AdItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!product.trim()) { toast({ title: "Product/content required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? '', 8))) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setIsLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/generate-adcopy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, audience, platform, goal, tone, count: 3 }),
      });
      const data = await res.json() as { ads?: AdItem[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setResults(data.ads ?? []);
      addXp(15);
      toast({ title: "Ad copy generated!" });
      triggerPostGenAd();
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copy = (item: AdItem, i: number) => {
    navigator.clipboard.writeText(`${item.headline}\n\n${item.primaryText}\n\n${item.cta}`);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Ad copy copied!" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Megaphone className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Ad Copy Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">High-conversion ad copy for any platform. Built on AIDA, PAS, and other proven direct response frameworks.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-4 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product / Offer</Label>
            <Input placeholder="e.g. my YouTube course, online coaching, app..." value={product} onChange={(e) => setProduct(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Audience</Label>
            <Input placeholder="e.g. beginner content creators 18-30" value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">X / Twitter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="awareness">Brand Awareness</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="leads">Lead Gen</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="persuasive">Persuasive</SelectItem>
                <SelectItem value="urgency">Urgency-driven</SelectItem>
                <SelectItem value="storytelling">Storytelling</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Ad Copy</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> 8 credits · 3 variations</p>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {isLoading && Array(3).fill(0).map((_, i) => <Card key={i} className="glass p-5 border-white/8 space-y-3"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-32 w-full" /></Card>)}
          <AnimatePresence>
            {results.map((ad, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass p-5 border-white/8 hover:border-white/15 transition-colors group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Ad {i + 1}</span>
                      {ad.framework && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">{ad.framework}</span>}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copy(ad, i)}>
                      {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/3 border border-white/5">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Headline</p>
                      <p className="font-bold text-sm">{ad.headline}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Primary Text</p>
                      <p className="text-sm leading-relaxed text-foreground/85">{ad.primaryText}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CTA:</p>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{ad.cta}</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {results.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4"><Megaphone className="w-7 h-7 text-purple-400/50" /></div>
              <p className="text-muted-foreground text-sm">Describe your product and generate high-converting ad variations</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
