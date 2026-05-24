import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useToolAccess } from "@/hooks/useToolAccess";
import { ToolLockGate } from "@/components/tools/ToolLockGate";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, BookOpen, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

export default function BlogGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("informative");
  const [length, setLength] = useState("medium");
  const [result, setResult] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("blog");

  const handleGenerate = async () => {
    if (!topic.trim()) { toast({ title: "Topic required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 20))) {
      toast({ title: "Not enough credits", description: "Upgrade your plan or wait for refill.", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, tone, length }),
      });
      const data = await res.json() as { title?: string; content?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResult({ title: data.title ?? topic, content: data.content ?? "" });
      addXp(40);
      toast({ title: "Blog post generated!" });
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyAll = () => {
    if (!result) return;
    navigator.clipboard.writeText(`# ${result.title}\n\n${result.content}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <ToolLockGate toolId="blog" toolName="Blog Post Generator">
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h1 className="text-2xl font-black">Blog Post Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm">Full SEO-optimized blog posts in seconds using AI.</p>
        </div>

        <Card className="p-5 border-white/8 card-premium space-y-4">
          <div className="space-y-2">
            <Label>Topic / Title</Label>
            <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. 10 ways to grow your YouTube channel in 2025" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="informative">Informative</SelectItem>
                  <SelectItem value="conversational">Conversational</SelectItem>
                  <SelectItem value="authoritative">Authoritative</SelectItem>
                  <SelectItem value="entertaining">Entertaining</SelectItem>
                  <SelectItem value="persuasive">Persuasive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (~500 words)</SelectItem>
                  <SelectItem value="medium">Medium (~1000 words)</SelectItem>
                  <SelectItem value="long">Long (~1500 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Zap className="w-4 h-4" />Generate Blog Post — 20 Credits</>}
          </Button>
        </Card>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <Skeleton className="h-8 w-2/3" />
              {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </motion.div>
          )}
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-white/8 card-premium space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black">{result.title}</h2>
                  <Button size="sm" variant="ghost" onClick={copyAll} className="shrink-0 gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy All"}
                  </Button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none">
                  {result.content.split("\n").map((line, i) => (
                    <p key={i} className={`text-sm leading-relaxed ${line.startsWith("##") ? "text-base font-bold text-foreground mt-4 mb-2" : "text-muted-foreground"}`}>
                      {line.replace(/^##\s*/, "")}
                    </p>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLockGate>
  );
}
