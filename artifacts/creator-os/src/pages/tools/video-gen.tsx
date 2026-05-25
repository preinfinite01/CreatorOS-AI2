import { useState, useEffect, useRef } from "react";
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
import { Loader2, Video, Zap, Download, Clock, Play, Pause, ChevronLeft, ChevronRight, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface VideoFramesResponse {
  frames: string[];
  frameCount: number;
  prompt: string;
  style: string;
}

const STYLES = [
  { value: "cinematic", label: "Cinematic" },
  { value: "realistic", label: "Realistic" },
  { value: "animated", label: "Animated" },
  { value: "abstract", label: "Abstract / Artistic" },
  { value: "dark fantasy", label: "Dark Fantasy" },
  { value: "studio photo", label: "Studio Photo" },
];

const LOADING_STEPS = [
  "Composing your scene...",
  "Generating frame 1 of 4...",
  "Generating frame 2 of 4...",
  "Generating frame 3 of 4...",
  "Generating frame 4 of 4...",
  "Assembling sequence...",
];

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"sequence" | "grid">("sequence");
  const playInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("video-gen");

  useEffect(() => {
    if (playing && frames.length > 0) {
      playInterval.current = setInterval(() => {
        setCurrentFrame(f => (f + 1) % frames.length);
      }, 1800);
    } else {
      if (playInterval.current) clearInterval(playInterval.current);
    }
    return () => { if (playInterval.current) clearInterval(playInterval.current); };
  }, [playing, frames.length]);

  const handleGenerate = async () => {
    if (!prompt.trim()) { toast({ title: "Prompt required", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 30))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    setFrames([]);
    setCurrentFrame(0);
    setPlaying(false);
    setElapsed(0);
    setLoadingStep(0);

    const timer = setInterval(() => setElapsed(p => p + 1), 1000);
    const stepTimer = setInterval(() => setLoadingStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 8000);

    try {
      const res = await apiFetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed");
      }
      const data = await res.json() as VideoFramesResponse;
      setFrames(data.frames);
      setCurrentFrame(0);
      setPlaying(true);
      addXp(60);
      toast({ title: `✨ ${data.frameCount} frames generated!`, description: "Your visual sequence is ready." });
    } catch (e) {
      toast({ title: "Generation failed", description: String(e), variant: "destructive" });
    } finally {
      clearInterval(timer);
      clearInterval(stepTimer);
      setLoading(false);
    }
  };

  const downloadFrame = (index: number) => {
    const link = document.createElement("a");
    link.href = frames[index];
    link.download = `creatoros-frame-${index + 1}.jpg`;
    link.click();
  };

  const downloadAll = () => {
    frames.forEach((_, i) => setTimeout(() => downloadFrame(i), i * 300));
  };

  return (
    <ToolLockGate toolId="video-gen" toolName="AI Video Sequence Generator">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Film className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">AI Video Sequence Generator</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Generate a 4-frame cinematic visual sequence from your text prompt. Each frame is a high-quality AI render.
            </p>
          </div>
        </div>

        <div className="px-4 py-3 rounded-xl bg-yellow-400/8 border border-yellow-400/20 text-sm text-yellow-400/90 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span><span className="font-semibold">Generation takes 30–60 seconds</span> — 4 frames rendered in parallel using FLUX AI.</span>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <Card className="lg:col-span-2 p-5 border-white/8 space-y-4 h-fit">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scene Prompt</Label>
              <Textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. A futuristic city at sunset with flying cars and neon lights, ultra cinematic..."
                rows={5}
                className="resize-none bg-background/60 border-white/10 focus:border-primary/40 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visual Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="border-white/10 bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full gap-2 font-bold bg-red-600 hover:bg-red-500 text-white h-12 shadow-lg shadow-red-900/30"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Rendering... {elapsed}s</>
                : <><Zap className="w-4 h-4" />Generate Sequence — 30 Credits</>
              }
            </Button>
          </Card>

          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-h-[400px] rounded-2xl border border-red-500/15 bg-red-500/3 flex flex-col items-center justify-center gap-6 p-8"
                >
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                      <Film className="w-8 h-8 text-red-400" />
                    </div>
                    <div className="absolute -inset-2 rounded-3xl border border-red-500/20 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="font-bold text-lg">{LOADING_STEPS[loadingStep]}</p>
                    <p className="text-sm text-muted-foreground">{elapsed}s elapsed · 4 frames in parallel</p>
                  </div>
                  <div className="w-full max-w-xs bg-white/5 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-1000"
                      style={{ width: `${Math.min(elapsed * 1.8, 95)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          loadingStep > i ? "bg-red-500" : loadingStep === i ? "bg-red-500/60 animate-pulse" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {frames.length > 0 && !loading && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/8 w-fit">
                    <button
                      onClick={() => setActiveTab("sequence")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "sequence" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Play className="w-3 h-3 inline mr-1.5" />Sequence
                    </button>
                    <button
                      onClick={() => setActiveTab("grid")}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === "grid" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <Film className="w-3 h-3 inline mr-1.5" />All Frames
                    </button>
                  </div>

                  {activeTab === "sequence" && (
                    <div className="space-y-3">
                      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 aspect-video bg-black">
                        <AnimatePresence mode="crossfade">
                          <motion.img
                            key={currentFrame}
                            src={frames[currentFrame]}
                            alt={`Frame ${currentFrame + 1}`}
                            className="w-full h-full object-cover"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6 }}
                          />
                        </AnimatePresence>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/70 border border-white/10">
                            <Film className="w-2.5 h-2.5 text-red-400" />
                            Frame {currentFrame + 1} / {frames.length}
                          </div>
                          <button
                            onClick={() => downloadFrame(currentFrame)}
                            className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/70 border border-white/10 hover:bg-black/80 transition-colors flex items-center gap-1"
                          >
                            <Download className="w-2.5 h-2.5" /> Save
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setCurrentFrame(f => (f - 1 + frames.length) % frames.length)}
                          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPlaying(p => !p)}
                          className="flex-1 h-8 rounded-lg bg-red-600/20 border border-red-500/20 flex items-center justify-center gap-2 text-xs font-semibold text-red-400 hover:bg-red-600/30 transition-colors"
                        >
                          {playing ? <><Pause className="w-3.5 h-3.5" />Pause</> : <><Play className="w-3.5 h-3.5" />Play Sequence</>}
                        </button>
                        <button
                          onClick={() => setCurrentFrame(f => (f + 1) % frames.length)}
                          className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2">
                        {frames.map((frame, i) => (
                          <button
                            key={i}
                            onClick={() => { setCurrentFrame(i); setPlaying(false); }}
                            className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${currentFrame === i ? "border-red-500 scale-105" : "border-white/10 hover:border-white/30"}`}
                          >
                            <img src={frame} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white/70 bg-black/50 px-1 rounded">{i + 1}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === "grid" && (
                    <div className="grid grid-cols-2 gap-3">
                      {frames.map((frame, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden border border-white/10 group aspect-video">
                          <img src={frame} alt={`Frame ${i + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-bold text-white/80">Frame {i + 1}</div>
                          <button
                            onClick={() => downloadFrame(i)}
                            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-lg bg-black/70 text-[10px] font-semibold text-white border border-white/15 hover:bg-black/90 transition-all flex items-center gap-1"
                          >
                            <Download className="w-2.5 h-2.5" /> Save
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button onClick={downloadAll} variant="outline" className="w-full gap-2 font-bold border-white/10 bg-white/5 hover:bg-white/10 h-10">
                    <Download className="w-4 h-4" /> Download All 4 Frames
                  </Button>
                </motion.div>
              )}

              {frames.length === 0 && !loading && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="min-h-[400px] rounded-2xl border border-white/8 border-dashed bg-card/20 flex flex-col items-center justify-center gap-5 text-center p-8"
                >
                  <div className="w-24 h-24 rounded-3xl bg-red-500/6 border border-red-500/15 flex items-center justify-center">
                    <Film className="w-10 h-10 text-red-400/30" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-bold text-foreground/60">Your visual sequence will appear here</p>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      4 cinematic frames rendered in parallel — play as a slideshow or download individually.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Cinematic", "Story arc", "4K quality", "Downloadable"].map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </ToolLockGate>
  );
}
