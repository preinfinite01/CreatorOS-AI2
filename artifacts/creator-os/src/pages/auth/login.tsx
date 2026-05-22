import { useState } from "react";
import { useLocation, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setLocation("/dashboard");
    }
    
    setIsLoading(false);
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your CreatorOS workspace">
      <form onSubmit={handleLogin} className="space-y-4">
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
          <div className="flex justify-between items-center">
            <Label htmlFor="password">Password</Label>
          </div>
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
          Sign In
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account? <Link href="/signup" className="text-primary hover:text-primary/80 font-medium">Sign up</Link>
      </div>
    </AuthLayout>
  );
}
