import { useAuthStore } from "@/store/authStore";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { AppLayout } from "./AppLayout";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuthStore();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !session) {
      setLocation("/login");
    }
  }, [session, isLoading, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return <AppLayout>{children}</AppLayout>;
}
