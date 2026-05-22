import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useUserStore } from "@/store/userStore";
import { Crown, X } from "lucide-react";
import { useState } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const PUBLISHER_ID = import.meta.env.VITE_ADSENSE_PUBLISHER_ID as string | undefined;
const AD_SLOT_BANNER = import.meta.env.VITE_ADSENSE_SLOT_BANNER as string | undefined;

function AdsenseUnit({ slot, format = "auto", className = "" }: { slot?: string; format?: string; className?: string }) {
  const adRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!PUBLISHER_ID || !slot || initialized.current) return;
    initialized.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // AdSense not loaded yet
    }
  }, [slot]);

  if (!PUBLISHER_ID || !slot) {
    return <PlaceholderAd />;
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={PUBLISHER_ID}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}

function PlaceholderAd() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-white/3 rounded-lg border border-dashed border-white/10">
      <div className="text-center px-4">
        <p className="text-xs text-muted-foreground/40">Advertisement</p>
      </div>
    </div>
  );
}

export function AdBanner() {
  const { plan } = useUserStore();
  const [dismissed, setDismissed] = useState(false);

  if (plan === "pro") return null;
  if (dismissed && plan !== "free") return null;

  const isFree = plan === "free";

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        border-t border-white/8
        backdrop-blur-xl
        transition-all duration-300
        ${isFree
          ? "bg-background/95 py-2 px-4 h-[72px]"
          : "bg-background/80 py-1.5 px-4 h-[52px]"
        }
      `}
      style={{ contain: "layout" }}
    >
      <div className="max-w-screen-xl mx-auto flex items-center gap-3 h-full">
        {!isFree && (
          <button
            onClick={() => setDismissed(true)}
            className="shrink-0 w-5 h-5 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-muted-foreground" />
          </button>
        )}

        <div className="flex-1 min-w-0 overflow-hidden">
          <AdsenseUnit slot={AD_SLOT_BANNER} format="horizontal" />
        </div>

        {isFree && (
          <Link href="/pricing" className="shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer whitespace-nowrap">
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-semibold text-primary">Go Pro — No Ads</span>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
