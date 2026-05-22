import { useState } from "react";
import { useGenerateIdeas } from "@workspace/api-client-react";
import { useUserStore } from "@/store/userStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Sparkles, Zap, Flame, TrendingUp, ChevronRight, Lightbulb } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { IdeaGeneratorInputPlatform, ContentIdea } from "@workspace/api-client-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";
import { Link } from "wouter";

export default function Ideas() {
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<IdeaGeneratorInputPlatform>("youtube");
  const [tone, setTone] = useState("Trendy");
  const [results, setResults] = useState<ContentIdea[]>([]);
  
  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const generateIdeas = useGenerateIdeas();

  const handleGenerate = async () => {
    if (!niche) {
      toast({ title: "Niche required", variant: "destructive" });
      return;
    }
    
    if (!(await deductCredits(user?.id ?? '', 10))) {
      toast({ title: "Not enough credits", description: "Please upgrade your plan or wait for refill.", variant: "destructive" });
      return;
    }

    generateIdeas.mutate({
      data: {
        niche,
        platform,
        tone,
        count: 4
      }
    }, {
      onSuccess: (data) => {
        setResults(data.ideas);
        addXp(20);
        toast({ title: "Ideas generated successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to generate ideas", variant: "destructive" });
      }
    });
  };

  const saveToProjects = async (idea: ContentIdea) => {
    if (!user) return;
    try {
      await supabase.from('projects').insert({
        user_id: user.id,
        title: idea.title,
        type: 'idea',
        content: idea,
        platform,
        niche
      });
      toast({ title: "Saved to projects" });
    } catch (e) {
      toast({ title: "Failed to save project", variant: "destructive" });
    }
  };

  const getPotentialBadge = (potential: string) => {
    switch(potential) {
      case 'high': return <Badge className="bg-orange-500 hover:bg-orange-600 text-white font-bold"><Flame className="w-3 h-3 mr-1" /> High Viral Potential</Badge>;
      case 'medium': return <Badge className="bg-blue-500 hover:bg-blue-600 text-white"><TrendingUp className="w-3 h-3 mr-1" /> Medium Potential</Badge>;
      case 'low': return <Badge variant="outline" className="border-white/20 text-muted-foreground">Niche Content</Badge>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Content Idea Generator</h1>
        <p className="text-muted-foreground">Discover untapped, high-potential concepts tailored to your specific niche.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass p-6 space-y-6 border-white/10 sticky top-24">
            <div className="space-y-2">
              <Label>Your Niche or Industry</Label>
              <Input 
                placeholder="e.g. Personal Finance, Tech Reviews, Fitness" 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="bg-background/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Target Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as IdeaGeneratorInputPlatform)}>
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
              <Label>Trend Focus</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trendy">Trending Topics</SelectItem>
                  <SelectItem value="Evergreen">Evergreen Content</SelectItem>
                  <SelectItem value="Controversial">Controversial/Debate</SelectItem>
                  <SelectItem value="Educational">Deep Dive / Educational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={handleGenerate}
              disabled={generateIdeas.isPending || !niche}
            >
              {generateIdeas.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Uncover Ideas</>
              )}
            </Button>
            <p className="text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> Costs 10 Credits
            </p>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <div className="space-y-4">
            {generateIdeas.isPending && (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl bg-white/5" />
              ))
            )}

            {!generateIdeas.isPending && results.length === 0 && (
              <Card className="glass p-12 flex flex-col items-center justify-center text-center border-dashed min-h-[400px]">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Lightbulb className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="font-medium text-lg mb-1">Awaiting Inspiration</h3>
                <p className="text-muted-foreground text-sm max-w-sm">Enter your niche to discover fresh content ideas algorithmically optimized for virality.</p>
              </Card>
            )}

            <AnimatePresence>
              {results.map((idea, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6 glass border-white/10 hover:border-primary/30 transition-colors group flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">{idea.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{idea.description}</p>
                      </div>
                      <div className="shrink-0 pt-1">
                        {getPotentialBadge(idea.viralPotential)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {idea.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/5">#{tag}</span>
                      ))}
                    </div>
                    
                    <div className="mt-2 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground" onClick={() => saveToProjects(idea)}>
                        <Save className="w-3.5 h-3.5 mr-1.5" /> Save Idea
                      </Button>
                      <Link href={`/tools/workflow?topic=${encodeURIComponent(idea.title)}&niche=${encodeURIComponent(niche)}&platform=${platform}`}>
                        <Button size="sm" className="h-8 bg-primary/20 text-primary hover:bg-primary hover:text-white border-none">
                          Turn into Script <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
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
