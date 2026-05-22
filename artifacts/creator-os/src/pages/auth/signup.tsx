import { useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLocation("/verify-email");
    }
    setIsLoading(false);
  };

  return (
    <AuthLayout title="Start your journey" subtitle="Join serious creators building the future">
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="creator@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background/50 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-background/50 border-white/10"
          />
        </div>
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white mt-6" disabled={isLoading}>
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Create Account
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account? <Link href="/login" className="text-primary hover:text-primary/80 font-medium">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
