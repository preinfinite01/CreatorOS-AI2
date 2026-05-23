import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useAdTrigger } from "@/hooks/useAdTrigger";
import { apiFetch } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Download, Wand2, Zap, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STYLE_PRESETS = [
  { value: "photorealistic", label: "Photorealistic", desc: "Ultra-real photography" },
  { value: "cinematic", label: "Cinematic", desc: "Film-quality visuals" },
  { value: "digital art", label: "Digital Art", desc: "ArtStation quality" },
  { value: "oil painting", label: "Oil Painting", desc: "Classic fine art" },
  { value: "minimalist", label: "Minimalist", desc: "Clean & modern" },
  { value: "anime", label: "Anime", desc: "Japanese animation style" },
  { value: "watercolor", label: "Watercolor", desc: "Soft artistic washes" },
  { value: "dark fantasy", label: "Dark Fantasy", desc: "Epic & dramatic" },
  { value: "studio photo", label: "Studio Photo", desc: "Commercial quality" },
];

const ASPECT_RATIOS = [
  { value: "16:9", label: "16:9", sub: "YouTube / Landscape" },
  { value: "1:1", label: "1:1", sub: "Square / Instagram" },
  { value: "9:16", label: "9:16", sub: "Vertical / Shorts" },
];

const LOADING_MESSAGES = [
  "Painting your vision...",
  "Rendering light and shadow...",
  "Applying cinematic depth...",
  "Perfecting composition...",
  "Adding finishing details...",
];

export default function ImageGen() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { triggerPostGenAd } = useAdTrigger();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt required", description: "Describe the image you want to generate.", variant: "destructive" });
      return;
    }
    if (!(await deductCredits(user?.id ?? '', 15))) {
      toast({ title: "Not enough credits", description: "Upgrade your plan to continue generating.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setImageUrl(null);
    setLoadingMsg(0);

    const msgInterval = setInterval(() => {
      setLoadingMsg((m) => (m + 1) % LOADING_MESSAGES.length);
    }, 3000);

    try {
      const res = await apiFetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text);
      }

      const blob = await res.blob();

      const url = URL.createObjectURL(blob);
      setImageUrl(url);
      setGenerationCount((c) => c + 1);
      addXp(20);
      toast({ title: "✨ Image generated successfully!" });
      triggerPostGenAd();
    } catch (err) {
      toast({ title: "Generation failed", description: String(err), variant: "destructive" });
    } finally {
      clearInterval(msgInterval);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `creatorOS-image-${Date.now()}.png`;
    a.click();
  };

  const selectedStyle = STYLE_PRESETS.find((s) => s.value === style);
  const selectedRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center shrink-0">
          <ImageIcon className="w-6 h-6 text-fuchsia-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">AI Image Generator</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Generate stunning visuals, thumbnails, and social media graphics. Powered by Hugging Face.
          </p>
        </div>
        {generationCount > 0 && (
          <div className="ml-auto hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fuchsia-500/8 border border-fuchsia-500/15 text-xs font-semibold text-fuchsia-400">
            <Sparkles className="w-3.5 h-3.5" />
            {generationCount} generated
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-2 glass p-6 space-y-5 border-white/8 h-fit">
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image Prompt</Label>
            <Textarea
              placeholder="A cinematic thumbnail of a person looking confident at a laptop, dark moody office, neon purple lighting, bokeh background..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="bg-background/60 border-white/10 focus:border-primary/40 resize-none text-sm leading-relaxed"
            />
            <p className="text-xs text-muted-foreground/60">
              Be specific about lighting, mood, colors, and composition.
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Style Preset</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {STYLE_PRESETS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStyle(s.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                    style === s.value
                      ? "bg-primary/20 border border-primary/40 text-primary"
                      : "bg-white/4 border border-white/8 text-muted-foreground hover:bg-white/8 hover:text-foreground"
                  }`}
                >
                  <div className="font-semibold leading-tight">{s.label}</div>
                </button>
              ))}
            </div>
            {selectedStyle && (
              <p className="text-[11px] text-muted-foreground/60">{selectedStyle.desc}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aspect Ratio</Label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setAspectRatio(r.value)}
                  className={`py-2.5 px-2 rounded-lg border transition-all text-center ${
                    aspectRatio === r.value
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-white/4 border-white/8 text-muted-foreground hover:bg-white/8"
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{r.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold h-12 shadow-lg shadow-fuchsia-900/30 transition-all"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
              : <><Wand2 className="w-4 h-4 mr-2" />Generate Image</>
            }
          </Button>
          <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" /> 15 credits per image
          </p>
        </Card>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-h-[440px] rounded-2xl border border-fuchsia-500/15 bg-fuchsia-500/3 flex flex-col items-center justify-center gap-6 p-8"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center">
                    <Wand2 className="w-8 h-8 text-fuchsia-400" />
                  </div>
                  <div className="absolute -inset-2 rounded-3xl border border-fuchsia-500/20 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-bold text-lg">{LOADING_MESSAGES[loadingMsg]}</p>
                  <p className="text-sm text-muted-foreground">
                    Style: <span className="text-fuchsia-400 font-medium">{selectedStyle?.label}</span>
                    {" · "}
                    Ratio: <span className="text-fuchsia-400 font-medium">{selectedRatio?.label}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/50 text-center max-w-xs">
                  High-quality generation typically takes 15–30 seconds
                </p>
              </motion.div>
            )}

            {imageUrl && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 group">
                  <img
                    src={imageUrl}
                    alt="AI generated visual"
                    className="w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      onClick={handleDownload}
                      className="bg-black/70 backdrop-blur-md hover:bg-black/90 border border-white/15 text-white text-xs h-8 shadow-xl"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                    </Button>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-semibold text-white/70 border border-white/10">
                      <Sparkles className="w-2.5 h-2.5 text-fuchsia-400" />
                      Hugging Face · {selectedStyle?.label} · {selectedRatio?.label}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerate}
                    variant="outline"
                    className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 h-10 text-sm"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-2" /> Regenerate
                  </Button>
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-fuchsia-600/80 hover:bg-fuchsia-600 h-10 text-sm"
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> Save Image
                  </Button>
                </div>
              </motion.div>
            )}

            {!imageUrl && !isLoading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-[440px] rounded-2xl border border-white/8 border-dashed bg-card/20 flex flex-col items-center justify-center gap-5 text-center p-8"
              >
                <div className="w-24 h-24 rounded-3xl bg-fuchsia-500/6 border border-fuchsia-500/15 flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-fuchsia-400/30" />
                </div>
                <div className="space-y-1.5">
                  <p className="font-bold text-foreground/60">Your image will appear here</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Choose a style, pick your aspect ratio, and write a detailed prompt to generate stunning visuals.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {["Thumbnail", "Social graphic", "Background", "Portrait", "Product"].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
