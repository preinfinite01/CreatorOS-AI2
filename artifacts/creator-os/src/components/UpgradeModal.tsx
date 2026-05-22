import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, Check, Zap, Loader2, Star } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSubscriptionStore, CURRENCY_SYMBOLS, type SupportedCurrency } from '@/store/subscriptionStore'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'wouter'

const PLANS = [
  {
    key: 'basic',
    name: 'Basic',
    usdMonthly: 20,
    usdYearly: 240,
    credits: '2,000 credits / mo',
    features: ['2,000 AI credits', 'Full workflow pipeline', 'Advanced scripts', 'Priority AI'],
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Pro',
    usdMonthly: 50,
    usdYearly: 600,
    credits: 'Unlimited credits',
    features: ['Unlimited AI credits', 'All features', 'Advanced analytics', 'Priority support'],
    highlight: true,
  },
]

export function UpgradeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { currency, formatPrice, loadRates } = useSubscriptionStore()
  const { toast } = useToast()

  useEffect(() => {
    if (open) loadRates()
  }, [open, loadRates])

  const handleUpgrade = async (planKey: string) => {
    if (!user) {
      onOpenChange(false)
      return
    }
    const plan = PLANS.find((p) => p.key === planKey)
    if (!plan) return

    setProcessingPlan(planKey)
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          plan: planKey,
          billingCycle,
          currency,
        }),
      })
      const json = await res.json() as { status: boolean; data?: { authorizationUrl: string }; message?: string }
      if (json.status && json.data?.authorizationUrl) {
        window.location.href = json.data.authorizationUrl
      } else {
        toast({ title: 'Payment Error', description: json.message ?? 'Could not initialize payment', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network Error', description: 'Please try again', variant: 'destructive' })
    } finally {
      setProcessingPlan(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-card/95 backdrop-blur-xl border-white/10 p-0 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary via-purple-400 to-primary" />
        <div className="p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Crown className="w-6 h-6 text-yellow-400" /> Unlock More Creative Power
            </DialogTitle>
            <p className="text-sm text-muted-foreground pt-1">
              You've hit your plan limit. Upgrade to keep creating without interruption.
            </p>
          </DialogHeader>

          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 mb-5 w-fit mx-auto">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'bg-primary text-white' : 'text-muted-foreground'}`}
            >
              Yearly <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${billingCycle === 'yearly' ? 'bg-white/20' : 'bg-green-500/20 text-green-400'}`}>-20%</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {PLANS.map((plan) => {
              const usd = billingCycle === 'yearly' ? plan.usdYearly / 12 : plan.usdMonthly
              const price = formatPrice(usd)
              return (
                <div
                  key={plan.key}
                  className={`relative rounded-xl border p-5 flex flex-col ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-primary/20 to-purple-900/20 border-primary/40 shadow-lg shadow-primary/10'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5" /> Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-3">
                    <h3 className="font-bold">{plan.name}</h3>
                    <div className="flex items-end gap-1 mt-1">
                      <span className="text-2xl font-bold">{price}</span>
                      <span className="text-xs text-muted-foreground mb-0.5">/mo</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{plan.credits}</p>
                  </div>
                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1.5 text-xs text-foreground/80">
                        <Check className="w-3 h-3 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade(plan.key)}
                    disabled={processingPlan !== null}
                    className={`w-full text-sm ${plan.highlight ? 'bg-primary hover:bg-primary/90 text-white' : 'bg-white/10 hover:bg-white/15'}`}
                  >
                    {processingPlan === plan.key ? (
                      <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Processing...</>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </Button>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Prices in {currency} · Secured by Paystack
            </p>
            <Link href="/pricing" onClick={() => onOpenChange(false)}>
              <button className="text-xs text-primary hover:underline">View full plans</button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
