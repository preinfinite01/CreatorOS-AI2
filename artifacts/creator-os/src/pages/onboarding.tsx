import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ArrowRight, Zap, Target, PenTool, Layout } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/authStore";

const steps = [
  { id: 1, title: "Niche", desc: "What's your focus?" },
  { id: 2, title: "Platforms", desc: "Where do you post?" },
  { id: 3, title: "Goals", desc: "What are you aiming for?" },
  { id: 4, title: "Style", desc: "How do you sound?" }
];

const niches = ["Business", "Technology", "Gaming", "Lifestyle", "Education", "Entertainment", "Finance", "Fitness", "Health", "Beauty", "Fashion", "Travel", "Food"];
const platforms = ["YouTube", "YouTube Shorts", "TikTok", "Instagram", "X (Twitter)", "LinkedIn"];
const goals = ["Grow Audience", "Increase Engagement", "Monetize Content", "Build Authority", "Drive Sales", "Educate Followers"];
const styles = ["Professional", "Casual", "Humorous", "Inspirational", "Educational", "Provocative", "Data-driven"];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [style, setStyle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const toggleSelection = (item: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        niche,
        platforms: selectedPlatforms,
        goals: selectedGoals,
        content_style: style,
        onboarding_completed: true
      });
    }
    setIsSubmitting(false);
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-24 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {steps.map((s) => (
              <div key={s.id} className={`flex flex-col items-center gap-2 ${step >= s.id ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step > s.id ? 'bg-primary border-primary text-white' : 
                  step === s.id ? 'border-primary text-primary' : 'border-white/10 text-muted-foreground'
                }`}>
                  {step > s.id ? <Check className="w-5 h-5" /> : s.id}
                </div>
                <span className="text-xs font-medium hidden sm:block">{s.title}</span>
              </div>
            ))}
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full mt-4">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>

        <Card className="glass p-8 relative overflow-hidden min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">{steps[step-1].desc}</h2>
                <p className="text-muted-foreground">This helps CreatorOS tailor its AI to your specific brand.</p>
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {niches.map(n => (
                      <Button
                        key={n}
                        variant="outline"
                        className={`h-auto py-3 px-4 justify-start ${niche === n ? 'border-primary bg-primary/10 text-primary' : 'border-white/10'}`}
                        onClick={() => setNiche(n)}
                      >
                        <Target className="w-4 h-4 mr-2 opacity-50" />
                        {n}
                      </Button>
                    ))}
                  </div>
                  <div className="pt-4">
                    <p className="text-sm text-muted-foreground mb-2">Or type your own:</p>
                    <Input 
                      placeholder="e.g. Vintage Watch Restoration" 
                      value={niche} 
                      onChange={e => setNiche(e.target.value)}
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                  {platforms.map(p => (
                    <Button
                      key={p}
                      variant="outline"
                      className={`h-auto py-4 px-4 justify-start ${selectedPlatforms.includes(p) ? 'border-primary bg-primary/10 text-primary' : 'border-white/10'}`}
                      onClick={() => toggleSelection(p, selectedPlatforms, setSelectedPlatforms)}
                    >
                      <Layout className="w-4 h-4 mr-2 opacity-50" />
                      {p}
                    </Button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  {goals.map(g => (
                    <Button
                      key={g}
                      variant="outline"
                      className={`h-auto py-4 px-4 justify-start ${selectedGoals.includes(g) ? 'border-primary bg-primary/10 text-primary' : 'border-white/10'}`}
                      onClick={() => toggleSelection(g, selectedGoals, setSelectedGoals)}
                    >
                      <Zap className="w-4 h-4 mr-2 opacity-50" />
                      {g}
                    </Button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {styles.map(s => (
                    <Button
                      key={s}
                      variant="outline"
                      className={`h-auto py-3 px-4 justify-start ${style === s ? 'border-primary bg-primary/10 text-primary' : 'border-white/10'}`}
                      onClick={() => setStyle(s)}
                    >
                      <PenTool className="w-4 h-4 mr-2 opacity-50" />
                      {s}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-12 pt-6 border-t border-white/5">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={step === 1}
              className="text-muted-foreground hover:text-foreground"
            >
              Back
            </Button>
            
            {step < 4 ? (
              <Button 
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={
                  (step === 1 && !niche) || 
                  (step === 2 && selectedPlatforms.length === 0) || 
                  (step === 3 && selectedGoals.length === 0)
                }
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete}
                disabled={!style || isSubmitting}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmitting ? "Setting up workspace..." : "Complete Setup"} 
                {!isSubmitting && <Zap className="w-4 h-4 ml-2" />}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
