import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useSubscriptionStore, CURRENCY_SYMBOLS, type SupportedCurrency } from '@/store/subscriptionStore'
import { useAuthStore } from '@/store/authStore'

const CURRENCIES: { code: SupportedCurrency; flag: string; label: string }[] = [
  { code: 'USD', flag: '🇺🇸', label: 'USD — US Dollar' },
  { code: 'NGN', flag: '🇳🇬', label: 'NGN — Nigerian Naira' },
  { code: 'GHS', flag: '🇬🇭', label: 'GHS — Ghanaian Cedi' },
  { code: 'ZAR', flag: '🇿🇦', label: 'ZAR — South African Rand' },
  { code: 'KES', flag: '🇰🇪', label: 'KES — Kenyan Shilling' },
  { code: 'GBP', flag: '🇬🇧', label: 'GBP — British Pound' },
  { code: 'CAD', flag: '🇨🇦', label: 'CAD — Canadian Dollar' },
  { code: 'EUR', flag: '🇪🇺', label: 'EUR — Euro' },
]

export function CurrencySelector() {
  const { currency, setCurrency, country } = useSubscriptionStore()
  const { user } = useAuthStore()
  const [open, setOpen] = useState(false)

  const selected = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]

  const handleSelect = async (code: SupportedCurrency) => {
    setCurrency(code)
    setOpen(false)
    if (user?.id) {
      try {
        await fetch('/api/payments/update-currency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, currency: code, country }),
        })
      } catch {
        // silent
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
      >
        <span>{selected.flag}</span>
        <span>{CURRENCY_SYMBOLS[currency]} {currency}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-2 right-0 z-50 w-56 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => handleSelect(c.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${
                  c.code === currency ? 'text-primary bg-primary/5' : 'text-foreground/80'
                }`}
              >
                <span>{c.flag}</span>
                <span className="font-medium">{c.code}</span>
                <span className="text-muted-foreground text-xs ml-auto">{CURRENCY_SYMBOLS[c.code]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
