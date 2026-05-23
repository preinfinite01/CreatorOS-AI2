import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, Copy, Check, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BrandVoiceResult {
  characteristics: string[];
  toneModifiers: { casual: string; professional: string };
  vocabulary: { use: string[]; avoid: string[] };
  patterns: string;
  sample: string;
  voicePrompt: string;
}

export default function BrandVoice() {
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [niche, setNiche] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<BrandVoiceResult | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) { toast({ title: "Description required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? '', 10))) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setIsLoading(true);
    setResult(null);
    try {
      const res = await apiFetch("/api/ai/generate-brand-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, examples, niche, audience }),
      });
      const data = await res.json() as BrandVoiceResult & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setResult(data);
      addXp(15);
      toast({ title: "Brand voice generated!" });
      triggerPostGenAd();
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = () => {
    if (!result?.voicePrompt) return;
    navigator.clipboard.writeText(result.voicePrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
    toast({ title: "Voice prompt copied!" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">AI Brand Voice Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">Define your unique creator voice so every piece of AI-generated content sounds exactly like you — consistently.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-4 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Describe Your Creator Style</Label>
            <Textarea
              placeholder="e.g. I'm an authentic, direct creator who teaches finance in plain English. I'm relatable, use real examples, and never talk down to my audience..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="bg-background/60 border-white/10 focus:border-primary/40 resize-none text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Example Content (optional)</Label>
            <Textarea
              placeholder="Paste 1-2 examples of your best captions, scripts, or posts..."
              value={examples}
              onChange={(e) => setExamples(e.target.value)}
              rows={4}
              className="bg-background/60 border-white/10 focus:border-primary/40 resize-none text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Niche</Label>
              <Input placeholder="finance, fitness..." value={niche} onChange={(e) => setNiche(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience</Label>
              <Input placeholder="young professionals..." value={audience} onChange={(e) => setAudience(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" />Define My Brand Voice</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> 10 credits</p>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {isLoading && Array(4).fill(0).map((_, i) => <Card key={i} className="glass p-5 border-white/8"><Skeleton className="h-4 w-1/3 mb-3" /><Skeleton className="h-16 w-full" /></Card>)}

          <AnimatePresence>
            {result && !isLoading && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <Card className="glass p-5 border-white/8">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Voice Characteristics</p>
                  <div className="flex flex-wrap gap-2">
                    {(result.characteristics ?? []).map((char, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">{char}</span>
                    ))}
                  </div>
                </Card>

                {result.toneModifiers && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(result.toneModifiers).map(([ctx, desc]) => (
                      <Card key={ctx} className="glass p-4 border-white/8">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 capitalize">{ctx} Tone</p>
                        <p className="text-xs text-foreground/80 leading-relaxed">{desc}</p>
                      </Card>
                    ))}
                  </div>
                )}

                {result.vocabulary && (
                  <Card className="glass p-5 border-white/8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Vocabulary Guide</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-green-400 mb-2">Use These Words</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(result.vocabulary.use ?? []).map((w, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs bg-green-500/10 text-green-300 border border-green-500/20">{w}</span>)}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-red-400 mb-2">Avoid These Words</p>
                        <div className="flex flex-wrap gap-1.5">
                          {(result.vocabulary.avoid ?? []).map((w, i) => <span key={i} className="px-2 py-1 rounded-lg text-xs bg-red-500/10 text-red-300 border border-red-500/20">{w}</span>)}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {result.sample && (
                  <Card className="glass p-5 border-white/8">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Sample In Your Voice</p>
                    <p className="text-sm leading-relaxed text-foreground/85 italic">"{result.sample}"</p>
                  </Card>
                )}

                {result.voicePrompt && (
                  <Card className="glass p-5 border-primary/20 bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-primary uppercase tracking-wider">AI Voice Prompt — Copy & Use in Any Tool</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={copyPrompt}>
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                    <p className="text-xs text-foreground/80 leading-relaxed">{result.voicePrompt}</p>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!result && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4"><BookOpen className="w-7 h-7 text-indigo-400/50" /></div>
              <p className="text-muted-foreground text-sm">Describe your creator style and we'll build your complete brand voice guide</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
