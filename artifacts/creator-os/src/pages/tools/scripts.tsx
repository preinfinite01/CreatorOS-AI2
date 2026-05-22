import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import { useGenerateScript } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Copy, Check, FileText, Zap } from "lucide-react";
import { ScriptGeneratorInputPlatform, ScriptGeneratorInputDuration } from "@workspace/api-client-react/src/generated/api.schemas";

export default function Scripts() {
  const [topic, setTopic] = useState("");
  const [hook, setHook] = useState("");
  const [platform, setPlatform] = useState<ScriptGeneratorInputPlatform>("youtube");
  const [duration, setDuration] = useState<ScriptGeneratorInputDuration>("medium");
  const [tone, setTone] = useState("Engaging");
  
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  
  const { deductCredits, addXp } = useUserStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const generateScript = useGenerateScript();

  const handleGenerate = () => {
    if (!topic) {
      toast({ title: "Topic required", variant: "destructive" });
      return;
    }
    
    if (!deductCredits(20)) {
      toast({ title: "Not enough credits", description: "Script generation costs 20 credits.", variant: "destructive" });
      return;
    }

    generateScript.mutate({
      data: {
        topic,
        hook: hook || undefined,
        platform,
        duration,
        tone,
      }
    }, {
      onSuccess: (data) => {
        setResult(data);
        addXp(40);
        toast({ title: "Script generated successfully!" });
      },
      onError: () => {
        toast({ title: "Failed to generate script", variant: "destructive" });
      }
    });
  };

  const copyToClipboard = () => {
    if (!result) return;
    const fullText = `HOOK: ${result.hook}\n\nSCRIPT:\n${result.script}\n\nCTA: ${result.cta}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied entire script to clipboard" });
  };

  const saveToProjects = async () => {
    if (!user || !result) return;
    try {
      await supabase.from('projects').insert({
        user_id: user.id,
        title: topic,
        type: 'script',
        content: result,
        platform,
      });
      toast({ title: "Saved to projects" });
    } catch (e) {
      toast({ title: "Failed to save project", variant: "destructive" });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Script Writer</h1>
        <p className="text-muted-foreground">Draft complete, structured scripts with pacing cues and strong calls to action.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass p-6 space-y-6 border-white/10">
            <div className="space-y-2">
              <Label>Core Topic or Concept</Label>
              <Textarea 
                placeholder="Describe what the video is about in detail..." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-background/50 min-h-[100px] resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Specific Hook (Optional)</Label>
              <Input 
                placeholder="Paste a hook if you have one..." 
                value={hook}
                onChange={(e) => setHook(e.target.value)}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platform} onValueChange={(v) => setPlatform(v as ScriptGeneratorInputPlatform)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube Longform</SelectItem>
                    <SelectItem value="youtube_shorts">YT Shorts</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram Reels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Target Duration</Label>
                <Select value={duration} onValueChange={(v) => setDuration(v as ScriptGeneratorInputDuration)}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (&lt; 30s)</SelectItem>
                    <SelectItem value="medium">Medium (1-3m)</SelectItem>
                    <SelectItem value="long">Long (3m+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone/Vibe</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engaging">Engaging & Fast-paced</SelectItem>
                    <SelectItem value="Educational">Educational & Clear</SelectItem>
                    <SelectItem value="Storytelling">Storytelling Narrative</SelectItem>
                    <SelectItem value="Conversational">Casual & Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-white" 
              onClick={handleGenerate}
              disabled={generateScript.isPending || !topic}
            >
              {generateScript.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><FileText className="w-4 h-4 mr-2" /> Draft Script</>
              )}
            </Button>
            <p className="text-center text-xs font-medium text-muted-foreground flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 text-yellow-400" /> Costs 20 Credits
            </p>
          </Card>
        </div>

        <div className="lg:col-span-8">
          {generateScript.isPending ? (
            <Card className="glass p-8 space-y-6">
              <Skeleton className="h-8 w-1/3 bg-white/5" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-4 w-[95%] bg-white/5" />
                <Skeleton className="h-4 w-[98%] bg-white/5" />
              </div>
              <Skeleton className="h-32 w-full bg-white/5 mt-8" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-[90%] bg-white/5" />
                <Skeleton className="h-4 w-full bg-white/5" />
              </div>
            </Card>
          ) : result ? (
            <Card className="glass overflow-hidden flex flex-col border-white/10 h-full max-h-[800px]">
              <div className="p-4 border-b border-white/5 bg-background/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded">
                    Est. Duration: {result.estimatedDuration}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8">
                    {copied ? <Check className="w-4 h-4 mr-1.5 text-green-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
                    {copied ? "Copied" : "Copy All"}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={saveToProjects} className="h-8 bg-white/10 hover:bg-white/20">
                    <Save className="w-4 h-4 mr-1.5" /> Save
                  </Button>
                </div>
              </div>
              
              <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold tracking-wider text-purple-400 uppercase">THE HOOK (0:00 - 0:05)</h3>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-lg font-medium">
                    {result.hook}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold tracking-wider text-blue-400 uppercase">THE SCRIPT</h3>
                  <div className="prose prose-invert max-w-none text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {result.script}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">CALL TO ACTION</h3>
                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-medium text-emerald-100">
                    {result.cta}
                  </div>
                </div>
              </div>
            </Card>
          ) : (
             <Card className="glass p-12 flex flex-col items-center justify-center text-center border-dashed h-full min-h-[500px]">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-medium text-lg mb-1">Blank Canvas</h3>
              <p className="text-muted-foreground text-sm max-w-sm">Provide your topic and constraints, and we'll write a complete, structured script ready for the teleprompter.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
