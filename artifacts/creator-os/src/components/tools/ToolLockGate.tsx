import { ReactNode } from "react";
import { Link } from "wouter";
import { Lock, Crown, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToolAccess } from "@/hooks/useToolAccess";

interface ToolLockGateProps {
  toolId: string;
  children: ReactNode;
  toolName: string;
}

export function ToolLockGate({ toolId, children, toolName }: ToolLockGateProps) {
  const { canUse, isLocked, showTrialBadge } = useToolAccess(toolId);

  if (!isLocked) {
    return (
      <>
        {showTrialBadge && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-primary/8 border border-primary/20 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-primary/90 font-medium">
              <span className="font-bold">Free trial</span> — you get 1 free use of this premium tool. Upgrade to Basic or Pro for unlimited access.
            </p>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
        <Lock className="w-8 h-8 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-black mb-2">Free trial used</h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
        You've used your free trial for <span className="text-foreground font-semibold">{toolName}</span>. Upgrade to Basic or Pro to keep generating.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/pricing">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 font-bold px-6">
            <Star className="w-4 h-4" /> Unlock with Basic — $16.99/mo
          </Button>
        </Link>
        <Link href="/pricing">
          <Button variant="outline" className="gap-2 border-yellow-400/30 hover:border-yellow-400/50 text-yellow-400 hover:text-yellow-300 font-bold px-6">
            <Crown className="w-4 h-4" /> Go Pro — $34.99/mo
          </Button>
        </Link>
      </div>
      <p className="text-xs text-muted-foreground/50 mt-4">All 25+ tools · No ads · Unlimited generations</p>
    </motion.div>
  );
}

interface ToolLockOverlayProps {
  toolId: string;
}

export function ToolCardLockBadge({ toolId }: ToolLockOverlayProps) {
  const { isLocked } = useToolAccess(toolId);
  if (!isLocked) return null;
  return (
    <div className="absolute inset-0 rounded-2xl bg-background/70 backdrop-blur-[2px] flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-1.5">
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">Upgrade</span>
      </div>
    </div>
  );
}
