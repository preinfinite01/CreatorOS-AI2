import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useUserStore } from "@/store/userStore";
import { useAdStore } from "@/store/adStore";
import { Crown, Sparkles, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID as string | undefined;
const AD_SLOT_MODAL = import.meta.env.VITE_ADSENSE_SLOT_MODAL as string | undefined;

const UPGRADE_NUDGES = [
  { headline: "Remove all ads instantly.", sub: "Pro users enjoy a completely ad-free experience with unlimited AI credits.", cta: "Upgrade to Pro" },
  { headline: "Generate faster with Pro.", sub: "Pro unlocks priority AI access — no queues, no limits, no interruptions.", cta: "Get Pro Access" },
  { headline: "Unlock unlimited generations.", sub: "Stop counting credits. Pro gives you infinite AI power every month.", cta: "Go Unlimited" },
  { headline: "Your audience won't wait. Neither should you.", sub: "Pro creators move fast. Upgrade and never slow down for ads again.", cta: "Upgrade Now" },
];

function AdsenseUnit({ slot }: { slot?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!PUBLISHER_ID || !slot || initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // AdSense not loaded
    }
  }, [slot]);

  if (!PUBLISHER_ID || !slot) {
    return (
      <div className="w-full h-[200px] rounded-xl bg-white/3 border border-dashed border-white/10 flex items-center justify-center">
        <p className="text-xs text-muted-foreground/30">Advertisement</p>
      </div>
    );
  }

  return (
    <div ref={adRef} className="w-full overflow-hidden rounded-xl">
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format="rectangle"
        data-full-width-responsive="true"
      />
    </div>
  );
}

export function GenerationAdModal() {
  const { plan } = useUserStore();
  const { sessionGenerations, shouldShowPostGenAd, markAdShown, clearPendingAd, pendingAd } = useAdStore();
  const [open, setOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [nudgeIndex] = useState(() => Math.floor(Math.random() * UPGRADE_NUDGES.length));

  useEffect(() => {
    if (pendingAd && shouldShowPostGenAd(plan)) {
      setOpen(true);
      setCountdown(5);
    }
  }, [pendingAd, plan, shouldShowPostGenAd, sessionGenerations]);

  useEffect(() => {
    if (!open) return;
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [open, countdown]);

  const handleClose = () => {
    setOpen(false);
    markAdShown();
  };

  if (plan === "pro") return null;

  const nudge = UPGRADE_NUDGES[nudgeIndex % UPGRADE_NUDGES.length];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.7)" }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-sm bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-white/5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Sponsored</p>
                  <AdsenseUnit slot={AD_SLOT_MODAL} />
                </div>
              </div>
            </div>

            {/* Upgrade Nudge */}
            <div className="px-5 py-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <Crown className="w-4.5 h-4.5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-bold text-sm leading-tight mb-1">{nudge.headline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{nudge.sub}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link href="/pricing">
                  <Button
                    className="w-full h-9 text-xs font-bold bg-primary hover:bg-primary/90"
                    onClick={handleClose}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {nudge.cta}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full h-9 text-xs text-muted-foreground border border-white/8 hover:bg-white/5"
                  onClick={handleClose}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full border border-white/20 text-[10px] flex items-center justify-center font-mono">
                        {countdown}
                      </span>
                      Skip Ad
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <X className="w-3.5 h-3.5" /> Close
                    </span>
                  )}
                </Button>
              </div>

              {plan === "free" && (
                <p className="text-center text-[10px] text-muted-foreground/40 mt-3">
                  Ads support the free tier · Pro users see no ads
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
