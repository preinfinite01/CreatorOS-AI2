import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { ToolLockGate } from "@/components/tools/ToolLockGate";
import { useToolAccess } from "@/hooks/useToolAccess";
import { WatermarkedImage } from "@/components/watermark/WatermarkedImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Video, Zap, Download, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("video-gen");

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast({ title: "Prompt required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 30))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    setVideoUrl(null);
    setElapsed(0);

    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    try {
      const res = await apiFetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; throw new Error(d.error ?? "Failed"); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      addXp(60);
      toast({ title: "Video generated!" });
    } catch (e) {
      toast({ title: "Generation failed", description: String(e), variant: "destructive" });
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const download = () => {
    if (!videoUrl) return;
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "creatoros-video.mp4";
    link.click();
  };

  return (
    <ToolLockGate toolId="video-gen" toolName="AI Video Generator">
      <div className="max-w-3xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Video className="w-5 h-5 text-red-400" />
            <h1 className="text-2xl font-black">AI Video Generator</h1>
          </div>
          <p className="text-muted-foreground text-sm">Generate short 2–4 second AI videos from text prompts via Hugging Face.</p>
        </div>

        <div className="px-4 py-3 rounded-xl bg-yellow-400/8 border border-yellow-400/20 text-sm text-yellow-400/90">
          <Clock className="w-4 h-4 inline mr-1.5" />
          <span className="font-semibold">Generation takes 30–90 seconds.</span> Grab a coffee while the AI renders your video.
        </div>

        <Card className="p-5 border-white/8 card-premium space-y-4">
          <div className="space-y-2">
            <Label>Video Prompt</Label>
            <Textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. A futuristic city at sunset with flying cars and neon lights, cinematic style..." rows={4} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="cinematic">Cinematic</SelectItem>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="animated">Animated</SelectItem>
                <SelectItem value="abstract">Abstract / Artistic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />Rendering... {elapsed}s</>
              : <><Zap className="w-4 h-4" />Generate Video — 30 Credits</>
            }
          </Button>
        </Card>

        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="p-6 border-white/8 card-premium flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                  <Video className="w-8 h-8 text-red-400 animate-pulse" />
                </div>
                <div>
                  <p className="font-bold">AI is rendering your video</p>
                  <p className="text-sm text-muted-foreground mt-1">{elapsed}s elapsed · This usually takes 30–90 seconds</p>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000" style={{ width: `${Math.min(elapsed * 1.5, 95)}%` }} />
                </div>
              </Card>
            </motion.div>
          )}

          {videoUrl && !loading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 border-white/8 card-premium space-y-4">
                <video controls className="w-full rounded-xl border border-white/10" src={videoUrl} />
                <Button onClick={download} variant="outline" className="w-full gap-2 font-bold">
                  <Download className="w-4 h-4" /> Download Video
                </Button>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLockGate>
  );
}
