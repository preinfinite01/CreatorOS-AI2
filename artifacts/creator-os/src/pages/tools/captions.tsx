import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, MessageSquare, Check, Zap, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Captions() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("engaging");
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: "Topic required", description: "Enter what your content is about.", variant: "destructive" });
      return;
    }
    if (!(await deductCredits(user?.id ?? '', 5))) {
      toast({ title: "Not enough credits", description: "Upgrade your plan to continue.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResults([]);
    try {
      const res = await apiFetch("/api/ai/generate-captions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, niche, platform, tone, count: 4 }),
      });
      const data = await res.json() as { captions?: string[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Generation failed");
      setResults(data.captions ?? []);
      addXp(10);
      toast({ title: "Captions generated!" });
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
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center shrink-0">
          <MessageSquare className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Caption Writer</h1>
          <p className="text-muted-foreground text-sm mt-1">Platform-native captions that drive comments, shares, and saves. Crafted by AI trained on viral content.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-5 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Topic</Label>
            <Input
              placeholder="e.g. morning workout routine for beginners"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="bg-background/60 border-white/10 focus:border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Niche (optional)</Label>
            <Input
              placeholder="e.g. fitness, finance, travel..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="bg-background/60 border-white/10 focus:border-primary/40"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</Label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-background/60 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="twitter">X / Twitter</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-background/60 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="engaging">Engaging</SelectItem>
                <SelectItem value="educational">Educational</SelectItem>
                <SelectItem value="motivational">Motivational</SelectItem>
                <SelectItem value="humorous">Humorous</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="storytelling">Storytelling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11"
          >
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Captions</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> 5 credits per generation
          </p>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {isLoading && Array(4).fill(0).map((_, i) => (
            <Card key={i} className="glass p-5 border-white/8">
              <Skeleton className="h-4 w-1/3 mb-3" />
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}

          <AnimatePresence>
            {results.map((caption, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass p-5 border-white/8 hover:border-white/15 transition-colors group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Caption {i + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => copy(caption, i)}
                    >
                      {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{caption}</p>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {results.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-green-400/50" />
              </div>
              <p className="text-muted-foreground text-sm">Enter your topic and click generate to create captions</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
