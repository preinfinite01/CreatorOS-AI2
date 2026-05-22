import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSubscriptionStore, CURRENCY_SYMBOLS, COUNTRY_TO_CURRENCY, type SupportedCurrency } from '@/store/subscriptionStore'
import { useAuthStore } from '@/store/authStore'

const COUNTRY_NAMES: Record<string, string> = {
  NG: 'Nigeria', GH: 'Ghana', ZA: 'South Africa', KE: 'Kenya',
  GB: 'United Kingdom', CA: 'Canada', DE: 'Germany', FR: 'France',
  NL: 'Netherlands', IT: 'Italy', ES: 'Spain', US: 'United States',
  AU: 'Australia', NZ: 'New Zealand', IN: 'India', SG: 'Singapore', AE: 'UAE',
}

const CURRENCIES: { code: SupportedCurrency; flag: string; label: string }[] = [
  { code: 'USD', flag: '🇺🇸', label: 'US Dollar' },
  { code: 'NGN', flag: '🇳🇬', label: 'Nigerian Naira' },
  { code: 'GHS', flag: '🇬🇭', label: 'Ghanaian Cedi' },
  { code: 'ZAR', flag: '🇿🇦', label: 'South African Rand' },
  { code: 'KES', flag: '🇰🇪', label: 'Kenyan Shilling' },
  { code: 'GBP', flag: '🇬🇧', label: 'British Pound' },
  { code: 'CAD', flag: '🇨🇦', label: 'Canadian Dollar' },
  { code: 'EUR', flag: '🇪🇺', label: 'Euro' },
]

export function CountryDetector() {
  const { countryDetected, setCountryDetected, setCurrency, setCountry, loadRates } = useSubscriptionStore()
  const { user } = useAuthStore()
  const [show, setShow] = useState(false)
  const [detectedCountry, setDetectedCountry] = useState<string>('US')
  const [selectedCurrency, setSelectedCurrency] = useState<SupportedCurrency>('USD')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (countryDetected) return
    // use ipapi.co (free, no key required) for country detection
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((data: { country_code?: string }) => {
        const code = data.country_code ?? 'US'
        const currency = COUNTRY_TO_CURRENCY[code] ?? 'USD'
        setDetectedCountry(code)
        setSelectedCurrency(currency)
        setShow(true)
      })
      .catch(() => {
        setShow(true)
      })
  }, [countryDetected])

  const handleConfirm = async () => {
    setSaving(true)
    setCurrency(selectedCurrency)
    setCountry(detectedCountry)
    setCountryDetected(true)
    setShow(false)
    await loadRates()

    if (user?.id) {
      try {
        await fetch('/api/payments/update-currency', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, currency: selectedCurrency, country: detectedCountry }),
        })
      } catch {
        // silent
      }
    }
    setSaving(false)
  }

  const countryName = COUNTRY_NAMES[detectedCountry] ?? detectedCountry
  const selected = CURRENCIES.find((c) => c.code === selectedCurrency) ?? CURRENCIES[0]

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="w-full max-w-sm bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="h-1 bg-gradient-to-r from-primary via-purple-400 to-primary" />

            <div className="p-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Globe className="w-6 h-6 text-primary" />
              </div>

              <h2 className="text-xl font-bold mb-1">Welcome from {countryName}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We detected your location and set your preferred currency. You can change this anytime.
              </p>

              <div className="relative mb-6">
                <label className="text-xs font-medium text-muted-foreground block mb-2 uppercase tracking-wider">
                  Preferred Currency
                </label>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-background/60 border border-white/10 rounded-xl hover:border-white/20 transition-colors"
                >
                  <span className="text-xl">{selected.flag}</span>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-sm">{selected.code}</p>
                    <p className="text-xs text-muted-foreground">{selected.label}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{CURRENCY_SYMBOLS[selectedCurrency]}</span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute top-full mt-1 left-0 right-0 z-10 bg-card border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                    {CURRENCIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => { setSelectedCurrency(c.code); setDropdownOpen(false) }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${c.code === selectedCurrency ? 'bg-primary/10 text-primary' : ''}`}
                      >
                        <span>{c.flag}</span>
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground text-xs">{c.label}</span>
                        {c.code === selectedCurrency && <Check className="w-4 h-4 ml-auto text-primary" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 border border-white/10 bg-white/5 hover:bg-white/10"
                  onClick={() => { setCountryDetected(true); setShow(false) }}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30"
                  onClick={handleConfirm}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Confirm'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
