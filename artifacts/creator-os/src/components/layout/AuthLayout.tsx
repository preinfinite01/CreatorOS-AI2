import { ReactNode } from "react";
import { Zap } from "lucide-react";
import { Link } from "wouter";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode, title: string, subtitle: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-6 cursor-pointer">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="p-8 rounded-2xl glass shadow-2xl relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
