import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Crown, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'wouter'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useSubscriptionStore } from '@/store/subscriptionStore'

type VerifyState = 'loading' | 'success' | 'error' | 'already-verified'

export default function PaymentSuccess() {
  const [status, setStatus] = useState<VerifyState>('loading')
  const [plan, setPlan] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState('')
  const { user } = useAuthStore()
  const { } = useUserStore()
  const { loadSubscription } = useSubscriptionStore()
  const [location] = useLocation()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('reference') ?? params.get('trxref')

    if (!ref) {
      setStatus('error')
      setErrorMsg('No payment reference found.')
      return
    }

    fetch(`/api/payments/verify/${encodeURIComponent(ref)}`)
      .then((r) => r.json())
      .then(async (json: { status: boolean; data?: { plan: string; alreadyVerified?: boolean }; message?: string }) => {
        if (json.status) {
          setPlan(json.data?.plan ?? '')
          setStatus(json.data?.alreadyVerified ? 'already-verified' : 'success')
          if (user?.id) {
            await loadSubscription(user.id)
          }
        } else {
          setStatus('error')
          setErrorMsg(json.message ?? 'Verification failed')
        }
      })
      .catch(() => {
        setStatus('error')
        setErrorMsg('Network error. Please contact support.')
      })
  }, [])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {status === 'loading' && (
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-bold">Verifying Payment</h2>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </div>
        )}

        {(status === 'success' || status === 'already-verified') && (
          <div className="bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400" />
            <div className="p-8 text-center space-y-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-green-400" />
              </motion.div>

              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {status === 'already-verified' ? 'Already Activated' : 'Payment Successful!'}
                </h2>
                <p className="text-muted-foreground">
                  {status === 'already-verified'
                    ? 'Your subscription is already active.'
                    : `Your ${plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : ''} plan is now active.`}
                </p>
              </div>

              <div className="p-4 bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/30 rounded-xl flex items-center gap-3">
                {plan === 'pro' ? (
                  <Crown className="w-6 h-6 text-yellow-400 shrink-0" />
                ) : (
                  <Zap className="w-6 h-6 text-primary shrink-0" />
                )}
                <div className="text-left">
                  <p className="font-bold text-sm capitalize">{plan} Plan Active</p>
                  <p className="text-xs text-muted-foreground">
                    {plan === 'pro' ? 'Unlimited AI credits unlocked' : '2,000 credits added to your account'}
                  </p>
                </div>
              </div>

              <Link href="/dashboard">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white h-11">
                  Start Creating <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-card border border-red-500/20 rounded-2xl overflow-hidden shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />
            <div className="p-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10 text-red-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
                <p className="text-muted-foreground text-sm">{errorMsg}</p>
              </div>
              <div className="flex gap-3">
                <Link href="/pricing" className="flex-1">
                  <Button variant="outline" className="w-full border-white/10">Try Again</Button>
                </Link>
                <Link href="/dashboard" className="flex-1">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white">Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
