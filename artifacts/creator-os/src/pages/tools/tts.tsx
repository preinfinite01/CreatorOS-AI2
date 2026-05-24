import { useState, useRef } from "react";
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
import { Loader2, Play, Download, Volume2, Zap, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "@/lib/api";

const VOICES = [
  { id: "en_US-amy-medium", label: "Amy (US Female, Medium)" },
  { id: "en_US-ryan-high", label: "Ryan (US Male, High)" },
  { id: "en_GB-semaine-medium", label: "Semaine (UK, Medium)" },
  { id: "en_US-lessac-medium", label: "Lessac (US Neutral)" },
  { id: "en_US-joe-medium", label: "Joe (US Male)" },
  { id: "en_US-kathleen-low", label: "Kathleen (US Female, Low)" },
];

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("en_US-amy-medium");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const { markTrialUsed } = useToolAccess("tts");

  const handleGenerate = async () => {
    if (!text.trim()) { toast({ title: "Text required", variant: "destructive" }); return; }
    if (text.length > 500) { toast({ title: "Max 500 characters", variant: "destructive" }); return; }
    if (!(await deductCredits(user?.id ?? "", 10))) {
      toast({ title: "Not enough credits", variant: "destructive" }); return;
    }
    markTrialUsed();
    setLoading(true);
    setAudioUrl(null);
    try {
      const res = await apiFetch("/api/ai/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) { const d = await res.json() as { error?: string }; throw new Error(d.error ?? "Failed"); }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      addXp(15);
      toast({ title: "Audio generated!" });
    } catch (e) {
      toast({ title: "Generation failed", description: String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const download = () => {
    if (!audioUrl) return;
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = "creatoros-tts.flac";
    link.click();
    toast({ title: "Audio downloaded!" });
  };

  return (
    <ToolLockGate toolId="tts" toolName="Text-to-Speech">
      <div className="max-w-2xl mx-auto space-y-6 pb-16">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Volume2 className="w-5 h-5 text-purple-400" />
            <h1 className="text-2xl font-black">Text-to-Speech</h1>
          </div>
          <p className="text-muted-foreground text-sm">Convert your scripts and captions into natural-sounding voiceovers.</p>
        </div>

        <Card className="p-5 border-white/8 card-premium space-y-4">
          <div className="space-y-2">
            <Label>Text <span className="text-muted-foreground/50 text-xs">({text.length}/500)</span></Label>
            <Textarea value={text} onChange={e => setText(e.target.value.slice(0, 500))} placeholder="Enter your script or text to convert..." rows={5} className="resize-none" />
          </div>
          <div className="space-y-2">
            <Label>Voice</Label>
            <Select value={voice} onValueChange={setVoice}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VOICES.map(v => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full gap-2 font-bold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating audio...</> : <><Zap className="w-4 h-4" />Generate Speech — 10 Credits</>}
          </Button>
        </Card>

        <AnimatePresence>
          {audioUrl && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 border-white/8 card-premium space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Volume2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-bold">Audio Ready</p>
                    <p className="text-xs text-muted-foreground">{VOICES.find(v => v.id === voice)?.label}</p>
                  </div>
                </div>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setPlaying(false)}
                  className="hidden"
                />
                <div className="flex gap-3">
                  <Button onClick={togglePlay} variant="outline" className="gap-2 flex-1 font-bold">
                    {playing ? <><Square className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Play</>}
                  </Button>
                  <Button onClick={download} variant="outline" className="gap-2 font-bold">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLockGate>
  );
}
