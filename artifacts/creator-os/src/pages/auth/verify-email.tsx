import { useState } from "react";
import { Link, useSearch } from "wouter";
import { supabase } from "@/lib/supabase";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const emailFromState = params.get("email") ?? "";

  const [email, setEmail] = useState(emailFromState);
  const [isResending, setIsResending] = useState(false);
  const { toast } = useToast();

  const handleResend = async () => {
    if (!email) return;
    setIsResending(true);
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) {
      toast({ title: "Failed to resend", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email sent!", description: "Check your inbox for the confirmation link." });
    }
    setIsResending(false);
  };

  return (
    <AuthLayout title="Check your email" subtitle="We sent you a verification link">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground text-sm">
          Please click the link in the email to verify your account and get started.
          {emailFromState && (
            <> We sent it to <span className="text-foreground font-medium">{emailFromState}</span>.</>
          )}
        </p>

        <div className="w-full space-y-3 pt-2">
          {!emailFromState && (
            <div className="space-y-2 text-left">
              <Label htmlFor="resend-email">Email address</Label>
              <Input
                id="resend-email"
                type="email"
                placeholder="creator@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-white/10"
              />
            </div>
          )}
          <Button
            variant="outline"
            className="w-full border-white/10 hover:bg-white/5"
            onClick={handleResend}
            disabled={isResending || !email}
          >
            {isResending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Resend confirmation email
          </Button>
        </div>

        <Link href="/login" className="text-primary hover:text-primary/80 text-sm font-medium">
          Return to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
