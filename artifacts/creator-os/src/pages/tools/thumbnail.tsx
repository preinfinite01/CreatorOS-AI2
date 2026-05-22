import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image, Copy, Check, Zap, Sparkles, Palette } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ThumbnailConcept {
  title: string;
  visual: string;
  colors: string[];
  textOverlay: string;
  psychologicalHook: string;
  imagePrompt: string;
}

export default function Thumbnail() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("youtube");
  const [style, setStyle] = useState("bold");
  const [niche, setNiche] = useState("");
  const [results, setResults] = useState<ThumbnailConcept[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) { toast({ title: "Topic required", variant: "destructive" }); return; }
    if (!deductCredits(8)) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setIsLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/generate-thumbnail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platform, style, niche }),
      });
      const data = await res.json() as { concepts?: ThumbnailConcept[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setResults(data.concepts ?? []);
      addXp(15);
      toast({ title: "Thumbnail concepts generated!" });
      triggerPostGenAd();
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "AI prompt copied!" });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0">
          <Image className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Thumbnail AI</h1>
          <p className="text-muted-foreground text-sm mt-1">AI-generated thumbnail concepts with visual descriptions, color palettes, and ready-to-use Midjourney/DALL-E prompts.</p>
        </div>
      </div>

      <Card className="glass p-6 border-white/8">
        <div className="grid sm:grid-cols-4 gap-4 mb-4">
          <div className="sm:col-span-2 space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Video Topic</Label>
            <Input placeholder="e.g. How I made $10k in 30 days" value={topic} onChange={(e) => setTopic(e.target.value)} className="bg-background/60 border-white/10 focus:border-primary/40" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bold">Bold & Dramatic</SelectItem>
                <SelectItem value="minimal">Clean & Minimal</SelectItem>
                <SelectItem value="emotional">Emotional</SelectItem>
                <SelectItem value="curiosity">Curiosity Gap</SelectItem>
                <SelectItem value="luxury">Luxury & Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleGenerate} disabled={isLoading} className="bg-primary hover:bg-primary/90 text-white font-semibold h-10 px-6">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate Concepts</>}
          </Button>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-400" /> 8 credits · 3 concepts</span>
        </div>
      </Card>

      {isLoading && (
        <div className="grid md:grid-cols-3 gap-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="glass p-5 border-white/8 space-y-3">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-8 w-full" />
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-5">
            {results.map((concept, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass p-5 border-white/8 flex flex-col h-full hover:border-white/15 transition-colors group">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm text-primary">{concept.title}</h3>
                    <span className="text-xs text-muted-foreground font-medium">#{i + 1}</span>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Visual</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{concept.visual}</p>
                    </div>

                    {concept.colors?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Color Palette</p>
                        <div className="flex items-center gap-1.5">
                          {concept.colors.slice(0, 4).map((color, ci) => (
                            <div key={ci} title={color} className="w-6 h-6 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: color }} />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">{concept.colors[0]}</span>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Text Overlay</p>
                      <p className="text-xs font-bold text-foreground">{concept.textOverlay}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Why It Works</p>
                      <p className="text-xs text-foreground/70 leading-relaxed">{concept.psychologicalHook}</p>
                    </div>
                  </div>

                  {concept.imagePrompt && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Image Prompt</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(concept.imagePrompt, i)}>
                          {copiedIndex === i ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{concept.imagePrompt}</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {results.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-4">
            <Palette className="w-7 h-7 text-cyan-400/50" />
          </div>
          <p className="text-muted-foreground text-sm">Enter your video topic to generate thumbnail concepts with color palettes and AI prompts</p>
        </div>
      )}
    </div>
  );
}
