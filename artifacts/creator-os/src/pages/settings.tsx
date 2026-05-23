import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore, CURRENCY_SYMBOLS } from "@/store/subscriptionStore";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Crown, User, CreditCard, LogOut, CheckCircle,
  AlertCircle, Calendar, RefreshCw, Loader2, ExternalLink
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { CurrencySelector } from "@/components/CurrencySelector";
import { apiFetch } from "@/lib/api";

type Tab = "account" | "billing" | "integrations";

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const { plan, credits, xp, level } = useUserStore();
  const { subscription, currency, loadSubscription, formatPrice } = useSubscriptionStore();
  const [tab, setTab] = useState<Tab>("account");
  const [notifications, setNotifications] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "billing") setTab("billing");
    if (params.get("verified") === "1") {
      setTab("billing");
      toast({ title: "Subscription Activated", description: "Your plan is now active.", });
      if (user?.id) loadSubscription(user.id);
    }
  }, []);

  const handleCancelSubscription = async () => {
    if (!user?.id) return;
    setCancelling(true);
    try {
      const res = await apiFetch("/api/payments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const json = await res.json() as { status: boolean; message?: string };
      if (json.status) {
        toast({ title: "Subscription Cancelled", description: "Your plan will remain active until the end of the billing period." });
        if (user?.id) loadSubscription(user.id);
      } else {
        toast({ title: "Error", description: json.message ?? "Could not cancel", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network Error", description: "Please try again", variant: "destructive" });
    } finally {
      setCancelling(false);
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "account", label: "Account & Profile" },
    { key: "billing", label: "Billing & Plan" },
    { key: "integrations", label: "Integrations" },
  ];

  const periodEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const planBadgeColor: Record<string, string> = {
    free: "bg-white/10 text-white/60 border-white/10",
    basic: "bg-primary/20 border-primary/30 text-primary",
    pro: "bg-yellow-400/20 border-yellow-400/30 text-yellow-400",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, billing, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-1 text-sm font-medium">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`w-full text-left px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                tab === t.key
                  ? "bg-white/5 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="md:col-span-2 space-y-6">
          {tab === "account" && (
            <>
              <Card className="glass p-6 space-y-6 border-white/10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground block mb-1">Email Address</label>
                    <div className="p-3 bg-background/50 border border-white/5 rounded-lg text-foreground/90 font-medium">
                      {user?.email ?? "creator@example.com"}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <h3 className="font-medium mb-4">Creator Level</h3>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Level {level}</span>
                      <span className="text-primary font-bold">{xp} XP</span>
                    </div>
                    <Progress value={(xp % 500) / 5} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2 text-right">{500 - (xp % 500)} XP to next level</p>
                  </div>
                </div>
              </Card>

              <Card className="glass p-6 space-y-6 border-white/10">
                <h2 className="text-xl font-bold">Preferences</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive weekly analytics and product updates.</p>
                  </div>
                  <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
              </Card>

              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 w-full md:w-auto"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </>
          )}

          {tab === "billing" && (
            <>
              <Card className="glass p-6 border-white/10 space-y-5">
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" /> Current Plan
                  </h2>
                  <span className={`px-3 py-1 border text-xs font-bold rounded-full uppercase tracking-wider ${planBadgeColor[plan] ?? planBadgeColor.free}`}>
                    {plan} Plan
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-background/50 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">Credits</span>
                    </div>
                    <p className="text-2xl font-bold">{plan === "pro" ? "∞" : credits.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {plan === "pro" ? "Unlimited" : plan === "basic" ? "of 2,000/mo" : "of 100/mo"}
                    </p>
                  </div>

                  <div className="p-4 bg-background/50 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Renewal</span>
                    </div>
                    <p className="text-sm font-semibold">{periodEnd ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-1 capitalize">
                      {subscription?.billingCycle ?? "—"}
                    </p>
                  </div>
                </div>

                {subscription?.status === "active" && (
                  <div className="flex items-center gap-2 text-xs text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Active subscription · Renews {periodEnd}</span>
                  </div>
                )}
                {subscription?.status === "cancelled" && (
                  <div className="flex items-center gap-2 text-xs text-yellow-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Cancelled · Access until {periodEnd}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Currency:</span>
                    <CurrencySelector />
                  </div>
                  {plan !== "free" && subscription?.status !== "cancelled" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                      onClick={handleCancelSubscription}
                      disabled={cancelling}
                    >
                      {cancelling ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Cancelling...</> : "Cancel Subscription"}
                    </Button>
                  )}
                </div>
              </Card>

              {plan === "free" && (
                <Card className="glass p-6 border-primary/20 bg-gradient-to-br from-primary/10 to-purple-900/10 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-400" /> Upgrade Your Plan
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Unlock unlimited AI credits and advanced features.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <p className="font-bold">Basic</p>
                      <p className="text-2xl font-bold mt-1">{formatPrice(20)}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                      <p className="text-xs text-muted-foreground mt-1">2,000 credits/mo</p>
                    </div>
                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                      <p className="font-bold text-primary">Pro</p>
                      <p className="text-2xl font-bold mt-1">{formatPrice(50)}<span className="text-sm text-muted-foreground font-normal">/mo</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Unlimited credits</p>
                    </div>
                  </div>
                  <Link href="/pricing">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                      View Plans & Pricing <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              )}

              {plan !== "free" && (
                <Card className="glass p-6 border-white/10 space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-primary" /> Change Plan
                  </h3>
                  <p className="text-sm text-muted-foreground">Upgrade or switch your plan at any time.</p>
                  <Link href="/pricing">
                    <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10">
                      View All Plans <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </Card>
              )}
            </>
          )}

          {tab === "integrations" && (
            <Card className="glass p-6 border-white/10">
              <h2 className="text-xl font-bold mb-4">Integrations</h2>
              <p className="text-sm text-muted-foreground">Third-party integrations coming soon.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
