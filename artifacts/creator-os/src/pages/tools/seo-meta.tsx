import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { ToolLockGate } from "@/components/tools/ToolLockGate";
import { useToolAccess } from "@/hooks/useToolAccess";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Search, Zap, Check, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface SeoResult { title: string; description: string; keywords: string[]; slug: string; }

export default function SeoMeta() {
  const [topic, setTopic] = useState("");
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<SeoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("seo-meta");

  const handleGenerate = async () => {
    if (!topic.trim()) { toast({ title: "Topic required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 5))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai/generate-seo-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, url }),
      });
      const data = await res.json() as { results?: SeoResult[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResults(data.results ?? []);
      addXp(10);
      toast({ title: "SEO meta generated!" });
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, i: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied!" });
  };

  return (
    <ToolLockGate toolId="seo-meta" toolName="SEO Meta Generator">
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Search className="w-5 h-5 text-green-400" />
            <h1 className="text-2xl font-black">SEO Meta Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm">Generate ranking-optimized page titles, meta descriptions, and keywords.</p>
        </div>
        <Card className="p-5 border-white/8 card-premium space-y-4">
          <div className="space-y-2">
            <Label>Page Topic / Content</Label>
            <Textarea value={topic} onChange={e => setTopic(e.target.value)} placeholder="Describe your page content, product, or article topic..." rows={3} />
          </div>
          <div className="space-y-2">
            <Label>Target URL / Page Name <span className="text-muted-foreground/50 text-xs">(optional)</span></Label>
            <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="e.g. /blog/grow-youtube-channel" />
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Zap className="w-4 h-4" />Generate SEO Meta — 5 Credits</>}
          </Button>
        </Card>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {results.map((r, i) => (
                <Card key={i} className="p-5 border-white/8 card-premium space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-wider">Variant {i + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => copy(`Title: ${r.title}\nDescription: ${r.description}\nKeywords: ${r.keywords.join(", ")}\nSlug: ${r.slug}`, i)} className="gap-1.5 h-7 text-xs">
                      {copiedIndex === i ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      Copy All
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Title Tag</span>
                      <p className="text-sm font-semibold mt-1">{r.title}</p>
                      <span className="text-[10px] text-muted-foreground/50">{r.title.length} chars</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                      <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Meta Description</span>
                      <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                      <span className="text-[10px] text-muted-foreground/50">{r.description.length} chars</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                      <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Keywords</span>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {r.keywords.map((kw, ki) => (
                          <span key={ki} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-xs text-primary">
                            <Tag className="w-2.5 h-2.5" />{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                    {r.slug && (
                      <div className="p-3 rounded-lg bg-white/3 border border-white/6">
                        <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">URL Slug</span>
                        <p className="text-sm font-mono text-muted-foreground mt-1">{r.slug}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLockGate>
  );
}
