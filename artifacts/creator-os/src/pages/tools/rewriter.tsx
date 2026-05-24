import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { ToolLockGate } from "@/components/tools/ToolLockGate";
import { useToolAccess } from "@/hooks/useToolAccess";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, RefreshCw, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

export default function Rewriter() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("professional");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("rewriter");

  const handleGenerate = async () => {
    if (!input.trim()) { toast({ title: "Content required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 8))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai/rewrite-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input, style }),
      });
      const data = await res.json() as { variants?: string[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResults(data.variants ?? []);
      addXp(15);
      toast({ title: "Content rewritten!" });
    } catch {
      toast({ title: "Rewrite failed", variant: "destructive" });
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
    <ToolLockGate toolId="rewriter" toolName="Content Rewriter">
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-5 h-5 text-orange-400" />
            <h1 className="text-2xl font-black">Content Rewriter / Paraphraser</h1>
          </div>
          <p className="text-muted-foreground text-sm">Rewrite any content in a fresh style while keeping the original meaning.</p>
        </div>

        <Card className="p-5 border-white/8 card-premium space-y-4">
          <div className="space-y-2">
            <Label>Original Content</Label>
            <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Paste your text here to rewrite it..." rows={6} className="resize-none" />
            <p className="text-xs text-muted-foreground/50">{input.length} characters</p>
          </div>
          <div className="space-y-2">
            <Label>Rewrite Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual & Conversational</SelectItem>
                <SelectItem value="creative">Creative & Engaging</SelectItem>
                <SelectItem value="concise">Concise & Direct</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="storytelling">Storytelling</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Rewriting...</> : <><Zap className="w-4 h-4" />Rewrite Content — 8 Credits</>}
          </Button>
        </Card>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <h2 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Rewritten Versions</h2>
              {results.map((r, i) => (
                <Card key={i} className="p-5 border-white/8 card-premium">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-bold text-primary/70">Version {i + 1}</span>
                    <Button size="sm" variant="ghost" onClick={() => copy(r, i)} className="gap-1.5 h-7 text-xs">
                      {copiedIndex === i ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{r}</p>
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLockGate>
  );
}
