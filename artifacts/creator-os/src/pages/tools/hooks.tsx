import { useState } from "react";
import { useGenerateHooks } from "@workspace/api-client-react";
import { useUserStore } from "@/store/userStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Save, Sparkles, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { HookGeneratorInputPlatform } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

export default function Hooks() {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<HookGeneratorInputPlatform>("tiktok");
  const [tone, setTone] = useState("Engaging");
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  
  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const generateHooks = useGenerateHooks();

  const handleGenerate = async () => {
    if (!topic) {
      toast({ title: "Topic required", variant: "destructive" });
      return;
    }
    
    if (!(await deductCredits(user?.id ?? '', 5))) {
      toast({ title: "Not enough credits", description: "Please upgrade your plan or wait for refill.", variant: "destructive" });
      return;
    }

    generateHooks.mutate({
      data: {
        topic,
        niche: niche || undefined,
        platform,
        tone,
        count: 4
      }
    }, {
      onSuccess: (data) => {
        setResults(data.hooks);
        addXp(10);
        toast({ title: "Hooks generated successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to generate hooks", variant: "destructive" });
      }
    });
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast({ title: "Copied to clipboard" });
  };

  const saveToProjects = async (hookStr: string) => {
    if (!user) return;
    try {
      await supabase.from('projects').insert({
        user_id: user.id,
        title: hookStr.substring(0, 40) + '...',
        type: 'hook',
        content: { hook: hookStr },
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Hook Creator</h1>
        <p className="text-muted-foreground">Stop the scroll. Generate powerful first 3-second hooks engineered for retention.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <Card className="glass p-6 space-y-6 border-white/10">
            <div className="space-y-2">
              <Label>Video Topic or Core Idea</Label>
              <Input 
                placeholder="e.g. 5 ChatGPT prompts for developers" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Niche (Optional)</Label>
              <Input 
                placeholder="e.g. Software Engineering" 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as HookGeneratorInputPlatform)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube_shorts">YT Shorts</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Hook Style</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engaging">Engaging</SelectItem>
                    <SelectItem value="Curiosity">Curiosity Gap</SelectItem>
                    <SelectItem value="Negative">Negative Hook</SelectItem>
                    <SelectItem value="Story">Story Starter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={handleGenerate}
              disabled={generateHooks.isPending || !topic}
            >
              {generateHooks.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Hooks</>
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
            {generateHooks.isPending && (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl bg-white/5" />
              ))
            )}

            {!generateHooks.isPending && results.length === 0 && (
              <Card className="glass p-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-lg mb-1">No hooks yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm">Enter your topic and let our AI craft the perfect hook to capture your audience.</p>
              </Card>
            )}

            <AnimatePresence>
              {results.map((hook, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-5 glass border-white/10 hover:border-primary/30 transition-colors group">
                    <p className="text-[1.05rem] font-medium leading-relaxed pr-12 text-foreground/90">"{hook}"</p>
                    
                    <div className="mt-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="secondary" size="sm" className="h-8" onClick={() => copyToClipboard(hook, i)}>
                        {copiedIndex === i ? <Check className="w-3.5 h-3.5 mr-1.5" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
                        {copiedIndex === i ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 border-white/10 bg-transparent hover:bg-white/5" onClick={() => saveToProjects(hook)}>
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
