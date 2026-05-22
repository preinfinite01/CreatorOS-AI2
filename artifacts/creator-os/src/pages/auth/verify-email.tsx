import { AuthLayout } from "@/components/layout/AuthLayout";
import { Mail } from "lucide-react";
import { Link } from "wouter";

export default function VerifyEmail() {
  return (
    <AuthLayout title="Check your email" subtitle="We sent you a verification link">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          Please click the link in the email to verify your account and get started.
        </p>
        <Link href="/login" className="text-primary hover:text-primary/80 text-sm font-medium mt-4 block">
          Return to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
