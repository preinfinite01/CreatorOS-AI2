import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Crown, Star, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useSubscriptionStore, CURRENCY_SYMBOLS, type SupportedCurrency } from '@/store/subscriptionStore'
import { Link, useLocation } from 'wouter'
import { CurrencySelector } from '@/components/CurrencySelector'
import { useToast } from '@/hooks/use-toast'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    usdMonthly: 0,
    usdYearly: 0,
    description: 'Get started with AI-powered content creation.',
    credits: '100 credits / month',
    highlight: false,
    badge: null,
    features: [
      '100 AI credits per month',
      'Title & hook generator',
      'Idea brainstorming',
      'Basic script generator',
      'Community support',
    ],
    cta: 'Current Plan',
    ctaActive: 'Get Started',
  },
  {
    key: 'basic',
    name: 'Basic',
    usdMonthly: 20,
    usdYearly: 240,
    description: 'For creators serious about consistent growth.',
    credits: '2,000 credits / month',
    highlight: false,
    badge: null,
    features: [
      '2,000 AI credits per month',
      'Full workflow pipeline',
      'Advanced script options',
      'Priority AI processing',
      'Project management',
      'Email support',
    ],
    cta: 'Upgrade to Basic',
    ctaActive: 'Get Started',
  },
  {
    key: 'pro',
    name: 'Pro',
    usdMonthly: 50,
    usdYearly: 600,
    description: 'Unlimited creative power for top creators.',
    credits: 'Unlimited credits',
    highlight: true,
    badge: 'Most Popular',
    features: [
      'Unlimited AI credits',
      'Full workflow pipeline',
      'All script lengths & styles',
      'Priority AI processing',
      'Advanced analytics',
      'Project management',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Upgrade to Pro',
    ctaActive: 'Get Started',
  },
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const { user } = useAuthStore()
  const { plan: currentPlan } = useUserStore()
  const { currency, formatPrice, loadRates, convertPrice } = useSubscriptionStore()
  const [, navigate] = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    loadRates()
  }, [loadRates])

  const getPrice = (plan: typeof PLANS[0]) => {
    if (plan.usdMonthly === 0) return formatPrice(0)
    const usd = billingCycle === 'yearly' ? plan.usdYearly / 12 : plan.usdMonthly
    return formatPrice(usd)
  }

  const getYearlySavings = (plan: typeof PLANS[0]) => {
    if (plan.usdMonthly === 0) return 0
    const monthlyTotal = plan.usdMonthly * 12
    const yearlyTotal = plan.usdYearly
    const savingsUSD = monthlyTotal - yearlyTotal
    return convertPrice(savingsUSD)
  }

  const handleUpgrade = async (plan: typeof PLANS[0]) => {
    if (plan.key === 'free') return
    if (!user) {
      navigate('/signup')
      return
    }

    setProcessingPlan(plan.key)
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          plan: plan.key,
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Invest in Your Creative Future
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every plan includes our full AI toolkit. Upgrade anytime as your channel grows.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Yearly
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${billingCycle === 'yearly' ? 'bg-white/20 text-white' : 'bg-green-500/20 text-green-400'}`}>
                Save 20%
              </span>
            </button>
          </div>

          <CurrencySelector />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 flex flex-col transition-all ${
                plan.highlight
                  ? 'bg-gradient-to-br from-primary/20 via-primary/10 to-purple-900/20 border-primary/50 shadow-2xl shadow-primary/20 scale-105'
                  : 'bg-card/50 glass border-white/10 hover:border-white/20'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-primary/40 flex items-center gap-1.5">
                    <Crown className="w-3 h-3" /> {plan.badge}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {plan.key === 'free' && <Zap className="w-5 h-5 text-muted-foreground" />}
                  {plan.key === 'basic' && <Zap className="w-5 h-5 text-primary" />}
                  {plan.key === 'pro' && <Crown className="w-5 h-5 text-yellow-400" />}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{plan.description}</p>

                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.usdMonthly === 0 ? `${CURRENCY_SYMBOLS[currency]}0` : getPrice(plan)}
                  </span>
                  <span className="text-muted-foreground mb-1">/mo</span>
                </div>

                {billingCycle === 'yearly' && plan.usdMonthly > 0 && (
                  <p className="text-xs text-green-400 font-medium">
                    Save {CURRENCY_SYMBOLS[currency]}{getYearlySavings(plan).toLocaleString()} per year
                  </p>
                )}
                {billingCycle === 'monthly' && plan.usdMonthly > 0 && (
                  <p className="text-xs text-muted-foreground">billed monthly</p>
                )}

                <div className="mt-4 px-3 py-2 bg-white/5 rounded-lg inline-flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-medium text-muted-foreground">{plan.credits}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? 'text-primary' : 'text-green-400/80'}`} />
                    <span className="text-foreground/80">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleUpgrade(plan)}
                disabled={
                  (plan.key === 'free' && currentPlan === 'free') ||
                  (plan.key === currentPlan && currentPlan !== 'free') ||
                  processingPlan !== null
                }
                className={`w-full font-semibold h-11 ${
                  plan.highlight
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30'
                    : plan.key === 'free'
                    ? 'bg-white/5 border border-white/10 text-muted-foreground cursor-default hover:bg-white/5'
                    : 'bg-white/10 border border-white/15 hover:bg-white/15 text-foreground'
                }`}
              >
                {processingPlan === plan.key ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                ) : currentPlan === plan.key ? (
                  'Current Plan'
                ) : (
                  user ? plan.cta : plan.ctaActive
                )}
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center space-y-3"
        >
          <p className="text-sm text-muted-foreground">
            All plans include a 30-day money-back guarantee. No questions asked.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Prices shown in {currency}. Payments processed securely by Paystack.
            {billingCycle === 'yearly' ? ' Billed annually.' : ' Billed monthly. Cancel anytime.'}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
