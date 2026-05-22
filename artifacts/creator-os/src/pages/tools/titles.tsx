import { useState } from "react";
import { useGenerateTitles } from "@workspace/api-client-react";
import { useUserStore } from "@/store/userStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Save, Sparkles, Check, Zap, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TitleGeneratorInputPlatform } from "@workspace/api-client-react/src/generated/api.schemas";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function Titles() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<TitleGeneratorInputPlatform>("youtube");
  const [tone, setTone] = useState("Engaging");
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const generateTitles = useGenerateTitles();

  const handleGenerate = () => {
    if (!topic) {
      toast({ title: "Topic required", variant: "destructive" });
      return;
    }
    
    if (!deductCredits(5)) {
      toast({ title: "Not enough credits", description: "Please upgrade your plan or wait for refill.", variant: "destructive" });
      return;
    }

    generateTitles.mutate({
      data: {
        topic,
        niche: niche || undefined,
        platform,
        tone,
        count: 5
      }
    }, {
      onSuccess: (data) => {
        setResults(data.titles);
        addXp(10);
        toast({ title: "Titles generated successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to generate titles", variant: "destructive" });
      }
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const saveToProjects = async (titleStr: string) => {
    if (!user) return;
    try {
      await supabase.from('projects').insert({
        user_id: user.id,
        title: titleStr,
        type: 'title',
        content: { title: titleStr },
        platform,
        niche
      });
      toast({ title: "Saved to projects" });
    } catch (e) {
      toast({ title: "Failed to save project", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Title Optimizer</h1>
        <p className="text-muted-foreground">Generate click-worthy titles engineered for high CTR on your target platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass p-6 space-y-6 border-white/10">
            <div className="space-y-2">
              <Label>Main Topic or Idea</Label>
              <Input 
                placeholder="e.g. How to start a freelance business" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Niche (Optional)</Label>
              <Input 
                placeholder="e.g. Finance, Tech, Fitness" 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as TitleGeneratorInputPlatform)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="youtube_shorts">YT Shorts</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engaging">Engaging</SelectItem>
                    <SelectItem value="Clickbait">Clickbait</SelectItem>
                    <SelectItem value="Educational">Educational</SelectItem>
                    <SelectItem value="Controversial">Provocative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={handleGenerate}
              disabled={generateTitles.isPending || !topic}
            >
              {generateTitles.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Titles</>
              )}
            </Button>
            <p className="text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> Costs 5 Credits
            </p>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            Generated Results {results.length > 0 && <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">{results.length}</span>}
          </h2>
          
          <div className="space-y-4">
            {generateTitles.isPending && (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl bg-white/5" />
              ))
            )}

            {!generateTitles.isPending && results.length === 0 && (
              <Card className="glass p-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <PenTool className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-lg mb-1">No titles yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">Fill out the details on the left and click generate to get highly-optimized titles.</p>
              </Card>
            )}

            <AnimatePresence>
              {results.map((title, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-5 glass border-white/10 hover:border-primary/30 transition-colors group">
                    <p className="text-lg font-medium leading-tight pr-12">{title}</p>
                    
                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" className="h-8" onClick={() => copyToClipboard(title, i)}>
                        {copiedIndex === i ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                        {copiedIndex === i ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 border-white/10 bg-transparent hover:bg-white/5" onClick={() => saveToProjects(title)}>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
