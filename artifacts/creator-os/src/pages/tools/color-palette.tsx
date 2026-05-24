import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Palette, Zap, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface ColorPalette { name: string; colors: { hex: string; name: string; usage: string }[]; mood: string; }

export default function ColorPaletteGenerator() {
  const [prompt, setPrompt] = useState("");
  const [palettes, setPalettes] = useState<ColorPalette[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast({ title: "Describe your brand/style", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 5))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai/generate-color-palette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json() as { palettes?: ColorPalette[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setPalettes(data.palettes ?? []);
      addXp(10);
      toast({ title: "Palettes generated!" });
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
    toast({ title: `Copied ${hex}` });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Palette className="w-5 h-5 text-pink-400" />
          <h1 className="text-2xl font-black">Color Palette Generator</h1>
        </div>
        <p className="text-muted-foreground text-sm">Generate brand-perfect color palettes from a description or mood.</p>
      </div>
      <Card className="p-5 border-white/8 card-premium space-y-4">
        <div className="space-y-2">
          <Label>Describe Your Brand / Style / Mood</Label>
          <Input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. luxury tech startup, earthy wellness brand, bold Gen-Z fashion..." />
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Zap className="w-4 h-4" />Generate Palettes — 5 Credits</>}
        </Button>
      </Card>

      <AnimatePresence>
        {palettes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {palettes.map((p, pi) => (
              <Card key={pi} className="p-5 border-white/8 card-premium space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.mood}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {p.colors.map((c, ci) => (
                    <div key={ci} className="flex-1 space-y-2">
                      <button
                        onClick={() => copyHex(c.hex)}
                        className="w-full h-16 rounded-xl border border-white/10 transition-transform hover:scale-105 relative group"
                        style={{ backgroundColor: c.hex }}
                        title={c.hex}
                      >
                        <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          {copiedColor === c.hex ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                      <p className="text-[10px] font-mono text-center text-muted-foreground">{c.hex}</p>
                      <p className="text-[10px] text-center text-muted-foreground/60 leading-tight">{c.name}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {p.colors.map((c, ci) => (
                    <div key={ci} className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                      <span className="font-semibold text-foreground/80">{c.name}:</span> {c.usage}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
