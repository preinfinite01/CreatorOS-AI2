import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SupportedCurrency = 'USD' | 'NGN' | 'GHS' | 'ZAR' | 'KES' | 'GBP' | 'CAD' | 'EUR'

export interface ExchangeRates {
  USD: number; NGN: number; GHS: number; ZAR: number;
  KES: number; GBP: number; CAD: number; EUR: number;
}

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$', NGN: '₦', GHS: '₵', ZAR: 'R', KES: 'KSh', GBP: '£', CAD: 'CA$', EUR: '€',
}

export const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  NG: 'NGN', GH: 'GHS', ZA: 'ZAR', KE: 'KES',
  GB: 'GBP', CA: 'CAD', DE: 'EUR', FR: 'EUR',
  NL: 'EUR', IT: 'EUR', ES: 'EUR', BE: 'EUR',
  AT: 'EUR', PT: 'EUR', IE: 'EUR', FI: 'EUR',
  US: 'USD', AU: 'USD', NZ: 'USD', IN: 'USD', SG: 'USD', AE: 'USD',
}

export const USD_PRICES = {
  basic: { monthly: 20, yearly: 240 },
  pro:   { monthly: 50, yearly: 600 },
}

export const FALLBACK_RATES: ExchangeRates = {
  USD: 1, NGN: 1620, GHS: 15.5, ZAR: 18.6,
  KES: 129, GBP: 0.79, CAD: 1.37, EUR: 0.92,
}

export interface Subscription {
  id: string
  plan: string
  billingCycle: string
  status: string
  currency: string
  amount: number
  currentPeriodEnd: string | null
  cancelledAt: string | null
}

interface SubscriptionState {
  currency: SupportedCurrency
  country: string
  rates: ExchangeRates
  ratesLoadedAt: number | null
  subscription: Subscription | null
  isLoadingRates: boolean
  isLoadingSubscription: boolean
  countryDetected: boolean

  setCurrency: (currency: SupportedCurrency) => void
  setCountry: (country: string) => void
  setRates: (rates: ExchangeRates) => void
  setSubscription: (sub: Subscription | null) => void
  setCountryDetected: (v: boolean) => void
  convertPrice: (usdAmount: number) => number
  formatPrice: (usdAmount: number) => string
  loadRates: () => Promise<void>
  loadSubscription: (userId: string) => Promise<void>
}

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currency: 'USD' as SupportedCurrency,
      country: 'US',
      rates: FALLBACK_RATES,
      ratesLoadedAt: null as number | null,
      subscription: null as Subscription | null,
      isLoadingRates: false,
      isLoadingSubscription: false,
      countryDetected: false,

      setCurrency: (currency: SupportedCurrency) => set({ currency }),
      setCountry: (country: string) => set({ country }),
      setRates: (rates: ExchangeRates) => set({ rates, ratesLoadedAt: Date.now() }),
      setSubscription: (subscription: Subscription | null) => set({ subscription }),
      setCountryDetected: (countryDetected: boolean) => set({ countryDetected }),

      convertPrice: (usdAmount: number) => {
        const { currency, rates } = get()
        return Math.round(usdAmount * rates[currency])
      },

      formatPrice: (usdAmount: number) => {
        const { currency, rates } = get()
        const amount = Math.round(usdAmount * rates[currency])
        const sym = CURRENCY_SYMBOLS[currency]
        return amount >= 1000 ? `${sym}${amount.toLocaleString()}` : `${sym}${amount}`
      },

      loadRates: async () => {
        const { ratesLoadedAt, isLoadingRates } = get()
        const SIX_HOURS = 6 * 60 * 60 * 1000
        if (isLoadingRates) return
        if (ratesLoadedAt && Date.now() - ratesLoadedAt < SIX_HOURS) return

        set({ isLoadingRates: true })
        try {
          const res = await fetch(`${API_BASE}/payments/rates`)
          if (res.ok) {
            const json = (await res.json()) as { status: boolean; data: { rates: ExchangeRates } }
            if (json.status) set({ rates: json.data.rates, ratesLoadedAt: Date.now() })
          }
        } catch { /* keep fallback rates */ } finally {
          set({ isLoadingRates: false })
        }
      },

      loadSubscription: async (userId: string) => {
        set({ isLoadingSubscription: true })
        try {
          const res = await fetch(`${API_BASE}/payments/subscription/${userId}`)
          if (res.ok) {
            const json = (await res.json()) as {
              status: boolean
              data: {
                subscription: Subscription | null
                profile: { plan: string; credits: number; preferredCurrency?: string; preferredCountry?: string } | null
              }
            }
            if (json.status) {
              set({ subscription: json.data.subscription })
              if (json.data.profile?.preferredCurrency) {
                set({ currency: json.data.profile.preferredCurrency as SupportedCurrency })
              }
              if (json.data.profile?.preferredCountry) {
                set({ country: json.data.profile.preferredCountry })
              }
            }
          }
        } catch { /* silent */ } finally {
          set({ isLoadingSubscription: false })
        }
      },
    }),
    {
      name: 'cos-subscription',
      partialize: (state) => ({
        currency: state.currency,
        country: state.country,
        countryDetected: state.countryDetected,
      }),
    }
  )
)
