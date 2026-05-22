import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useGenerateWorkflow } from "@workspace/api-client-react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Save, Layout, Zap, Flame, Check, PenTool, Hash, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkflowInputPlatform } from "@workspace/api-client-react";

export default function Workflow() {
  const search = useSearch();
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [platform, setPlatform] = useState<WorkflowInputPlatform>("youtube");
  const [tone, setTone] = useState("Engaging");
  
  const [result, setResult] = useState<any>(null);
  const [activeStage, setActiveStage] = useState<string>("idea");
  
  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const generateWorkflow = useGenerateWorkflow();

  // Pre-fill form from URL query params (e.g. when navigating from Ideas page)
  useEffect(() => {
    const params = new URLSearchParams(search);
    const topicParam = params.get("topic");
    const nicheParam = params.get("niche");
    const platformParam = params.get("platform") as WorkflowInputPlatform | null;
    if (topicParam) setTopic(topicParam);
    if (nicheParam) setNiche(nicheParam);
    if (platformParam && ["youtube", "tiktok", "instagram"].includes(platformParam)) {
      setPlatform(platformParam);
    }
  }, [search]);

  const handleGenerate = async () => {
    if (!topic) {
      toast({ title: "Topic required", variant: "destructive" });
      return;
    }
    
    if (!(await deductCredits(user?.id ?? '', 40))) {
      toast({ title: "Not enough credits", description: "Workflow generation costs 40 credits.", variant: "destructive" });
      return;
    }

    generateWorkflow.mutate({
      data: {
        topic,
        niche: niche || undefined,
        platform,
        tone,
      }
    }, {
      onSuccess: (data) => {
        setResult(data);
        setActiveStage("idea");
        addXp(80);
        toast({ title: "Workflow completely generated!" });
      },
      onError: () => {
        toast({ title: "Failed to generate workflow", variant: "destructive" });
      }
    });
  };

  const saveToProjects = async () => {
    if (!user || !result) return;
    try {
      await supabase.from('projects').insert({
        user_id: user.id,
        title: result.title || topic,
        type: 'workflow',
        content: result,
        platform,
        niche
      });
      toast({ title: "Saved complete workflow to projects" });
    } catch (e) {
      toast({ title: "Failed to save project", variant: "destructive" });
    }
  };

  const copyStage = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const stages = [
    { id: "idea", icon: Flame, label: "Core Idea", color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "hook", icon: Zap, label: "The Hook", color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "title", icon: PenTool, label: "Optimized Title", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "script", icon: Layout, label: "Full Script", color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: "metadata", icon: Hash, label: "Caption & Tags", color: "text-pink-500", bg: "bg-pink-500/10" }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 h-[calc(100vh-100px)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Workflow Pipeline</h1>
        <p className="text-muted-foreground">The ultimate creator flow. From vague topic to complete production package in one click.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-3 space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-4">
          <Card className="glass p-5 space-y-4 border-white/10">
            <h3 className="font-bold text-sm tracking-wider uppercase text-muted-foreground mb-4">Pipeline Setup</h3>
            <div className="space-y-2">
              <Label className="text-xs">Raw Topic or Concept</Label>
              <Textarea 
                placeholder="e.g. Why I stopped using productivity apps..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50 min-h-[100px] resize-none text-sm"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Niche</Label>
              <Input 
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="bg-background/50 h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Platform</Label>
              <Select value={platform} onValueChange={(v) => setPlatform(v as WorkflowInputPlatform)}>
                <SelectTrigger className="bg-background/50 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="instagram">Instagram Reels</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white mt-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]" 
              onClick={handleGenerate}
              disabled={generateWorkflow.isPending || !topic}
            >
              {generateWorkflow.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <><Zap className="w-4 h-4 mr-2" /> Run Pipeline</>
              )}
            </Button>
            <div className="text-center text-[10px] text-muted-foreground flex justify-center items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> 40 Credits required
            </div>
          </Card>
        </div>

        <div className="lg:col-span-9 h-full flex flex-col min-h-0">
          {!result && !generateWorkflow.isPending ? (
             <Card className="glass flex-1 flex flex-col items-center justify-center text-center border-dashed border-white/10">
              <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
                <Layout className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="font-medium text-xl mb-2">The Production Pipeline</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                Enter your raw idea on the left. We'll pass it through specialized AI models to generate every piece of content you need to hit publish.
              </p>
            </Card>
          ) : (
            <Card className="glass flex-1 flex flex-col overflow-hidden border-white/10">
              {generateWorkflow.isPending ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                   <div className="relative w-24 h-24 mb-8">
                     <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                     <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin" />
                     <div className="absolute inset-0 flex items-center justify-center">
                       <Zap className="w-8 h-8 text-primary animate-pulse" />
                     </div>
                   </div>
                   <h3 className="text-xl font-bold animate-pulse">Running Pipeline...</h3>
                   <p className="text-muted-foreground mt-2">Connecting idea to hook to script. This takes about 15 seconds.</p>
                </div>
              ) : result ? (
                <div className="flex-1 flex flex-col h-full min-h-0">
                  <div className="flex items-center justify-between p-4 border-b border-white/5 bg-background/50">
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 sm:pb-0">
                      {stages.map(stage => (
                        <button
                          key={stage.id}
                          onClick={() => setActiveStage(stage.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                            activeStage === stage.id 
                              ? `${stage.bg} ${stage.color} border border-${stage.color.split('-')[1]}-500/30` 
                              : 'text-muted-foreground hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <stage.icon className="w-4 h-4" />
                          {stage.label}
                        </button>
                      ))}
                    </div>
                    <Button variant="secondary" size="sm" onClick={saveToProjects} className="shrink-0 bg-white/10 hover:bg-white/20 hidden sm:flex">
                      <Save className="w-4 h-4 mr-2" /> Save Full Project
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-black/20">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStage}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                      >
                        {activeStage === "idea" && (
                          <div className="space-y-4 max-w-3xl">
                            <h2 className="text-2xl font-bold text-orange-500 mb-6">The Core Concept</h2>
                            <div className="p-6 rounded-xl bg-orange-500/5 border border-orange-500/20 text-lg leading-relaxed text-foreground/90">
                              {result.idea}
                            </div>
                            <Button variant="outline" onClick={() => copyStage(result.idea)} className="mt-4 border-white/10">
                              <Copy className="w-4 h-4 mr-2" /> Copy Idea
                            </Button>
                          </div>
                        )}

                        {activeStage === "hook" && (
                          <div className="space-y-4 max-w-3xl">
                            <h2 className="text-2xl font-bold text-purple-500 mb-6">The 3-Second Hook</h2>
                            <div className="p-6 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xl font-medium leading-relaxed">
                              "{result.hook}"
                            </div>
                            <Button variant="outline" onClick={() => copyStage(result.hook)} className="mt-4 border-white/10">
                              <Copy className="w-4 h-4 mr-2" /> Copy Hook
                            </Button>
                          </div>
                        )}

                        {activeStage === "title" && (
                          <div className="space-y-4 max-w-3xl">
                            <h2 className="text-2xl font-bold text-blue-500 mb-6">Optimized Title</h2>
                            <div className="p-6 rounded-xl bg-blue-500/5 border border-blue-500/20 text-2xl font-bold">
                              {result.title}
                            </div>
                            <Button variant="outline" onClick={() => copyStage(result.title)} className="mt-4 border-white/10">
                              <Copy className="w-4 h-4 mr-2" /> Copy Title
                            </Button>
                          </div>
                        )}

                        {activeStage === "script" && (
                          <div className="space-y-4 max-w-4xl">
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-emerald-500">Production Script</h2>
                              <Button variant="outline" size="sm" onClick={() => copyStage(result.script)} className="border-white/10">
                                <Copy className="w-4 h-4 mr-2" /> Copy Script
                              </Button>
                            </div>
                            <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed bg-black/40 p-6 md:p-8 rounded-xl border border-white/5">
                              {result.script}
                            </div>
                            
                            <div className="mt-8">
                              <h3 className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-3">Call to Action</h3>
                              <div className="p-4 rounded-lg bg-white/5 border border-white/10 font-medium">
                                {result.cta}
                              </div>
                            </div>
                          </div>
                        )}

                        {activeStage === "metadata" && (
                          <div className="space-y-8 max-w-3xl">
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-pink-500">Caption</h2>
                                <Button variant="ghost" size="sm" onClick={() => copyStage(result.caption)}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="p-4 rounded-xl bg-pink-500/5 border border-pink-500/20 whitespace-pre-wrap">
                                {result.caption}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-pink-500">Hashtags</h2>
                                <Button variant="ghost" size="sm" onClick={() => copyStage(result.hashtags.join(' '))}>
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {result.hashtags.map((tag: string, i: number) => (
                                  <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-medium">
                                    {tag.startsWith('#') ? tag : `#${tag}`}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              ) : null}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
