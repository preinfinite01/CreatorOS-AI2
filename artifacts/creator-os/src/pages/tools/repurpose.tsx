import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Repeat2, Copy, Check, Zap, Sparkles, Twitter, Youtube, Linkedin, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  twitter: Twitter,
  youtube: Youtube,
  linkedin: Linkedin,
  instagram: Instagram,
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "text-sky-400",
  youtube: "text-red-400",
  linkedin: "text-blue-400",
  instagram: "text-pink-400",
};

interface RepurposedItem {
  platform: string;
  content: string;
  notes: string;
}

export default function Repurpose() {
  const [content, setContent] = useState("");
  const [sourceFormat, setSourceFormat] = useState("youtube");
  const [targetPlatforms, setTargetPlatforms] = useState<string[]>(["twitter", "instagram", "linkedin"]);
  const [results, setResults] = useState<RepurposedItem[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const togglePlatform = (p: string) => {
    setTargetPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleGenerate = async () => {
    if (!content.trim()) { toast({ title: "Content required", description: "Paste your original content to repurpose.", variant: "destructive" }); return; }
    if (targetPlatforms.length === 0) { toast({ title: "Select at least one target platform", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? '', 15))) { toast({ title: "Not enough credits", variant: "destructive" }); return; }
    setIsLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/repurpose-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, sourceFormat, targetPlatforms }),
      });
      const data = await res.json() as { repurposed?: RepurposedItem[]; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Failed");
      setResults(data.repurposed ?? []);
      addXp(20);
      toast({ title: "Content repurposed!" });
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
    toast({ title: "Copied!" });
  };

  const PLATFORMS = ["twitter", "instagram", "linkedin", "youtube", "tiktok"];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
          <Repeat2 className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Content Repurposer</h1>
          <p className="text-muted-foreground text-sm mt-1">Transform one piece of content into platform-native pieces for every channel — automatically.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-5 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Original Content</Label>
            <Textarea
              placeholder="Paste your script, blog post, YouTube transcript, or any long-form content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="bg-background/60 border-white/10 focus:border-primary/40 resize-none text-sm"
            />
            <p className="text-xs text-muted-foreground text-right">{content.length} characters</p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Source Format</Label>
            <Select value={sourceFormat} onValueChange={setSourceFormat}>
              <SelectTrigger className="bg-background/60 border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="youtube">YouTube Video Script</SelectItem>
                <SelectItem value="blog">Blog Post</SelectItem>
                <SelectItem value="podcast">Podcast Transcript</SelectItem>
                <SelectItem value="tiktok">TikTok Script</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => {
                const Icon = PLATFORM_ICONS[p];
                const selected = targetPlatforms.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      selected ? "bg-primary/15 text-primary border-primary/30" : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20"
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isLoading || targetPlatforms.length === 0} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-11">
            {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Repurposing...</> : <><Sparkles className="w-4 h-4 mr-2" />Repurpose Content</>}
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> 15 credits per generation
          </p>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {isLoading && Array(3).fill(0).map((_, i) => (
            <Card key={i} className="glass p-5 border-white/8"><Skeleton className="h-4 w-1/3 mb-3" /><Skeleton className="h-24 w-full" /></Card>
          ))}

          <AnimatePresence>
            {results.map((item, i) => {
              const Icon = PLATFORM_ICONS[item.platform];
              const color = PLATFORM_COLORS[item.platform] ?? "text-muted-foreground";
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="glass p-5 border-white/8 hover:border-white/15 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {Icon && <Icon className={`w-4 h-4 ${color}`} />}
                        <span className={`text-sm font-bold ${color} capitalize`}>{item.platform}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copy(item.content, i)}>
                        {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90 mb-3">{item.content}</p>
                    {item.notes && <p className="text-xs text-muted-foreground bg-white/3 rounded-lg px-3 py-2 border border-white/5">{item.notes}</p>}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {results.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                <Repeat2 className="w-7 h-7 text-emerald-400/50" />
              </div>
              <p className="text-muted-foreground text-sm">Paste your content and select target platforms to begin repurposing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
