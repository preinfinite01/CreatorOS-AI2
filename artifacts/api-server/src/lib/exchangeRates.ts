export interface ExchangeRates {
  USD: number;
  NGN: number;
  GHS: number;
  ZAR: number;
  KES: number;
  GBP: number;
  CAD: number;
  EUR: number;
}

const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  NGN: 1620,
  GHS: 15.5,
  ZAR: 18.6,
  KES: 129,
  GBP: 0.79,
  CAD: 1.37,
  EUR: 0.92,
};

let cached: { rates: ExchangeRates; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export async function getExchangeRates(): Promise<ExchangeRates> {
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) throw new Error("Exchange rate fetch failed");

    const json = (await res.json()) as { rates: Record<string, number> };
    const r = json.rates;

    const rates: ExchangeRates = {
      USD: 1,
      NGN: r.NGN ?? FALLBACK_RATES.NGN,
      GHS: r.GHS ?? FALLBACK_RATES.GHS,
      ZAR: r.ZAR ?? FALLBACK_RATES.ZAR,
      KES: r.KES ?? FALLBACK_RATES.KES,
      GBP: r.GBP ?? FALLBACK_RATES.GBP,
      CAD: r.CAD ?? FALLBACK_RATES.CAD,
      EUR: r.EUR ?? FALLBACK_RATES.EUR,
    };

    cached = { rates, fetchedAt: Date.now() };
    return rates;
  } catch {
    return cached?.rates ?? FALLBACK_RATES;
  }
}

export function convertPrice(usdAmount: number, currency: keyof ExchangeRates, rates: ExchangeRates): number {
  return Math.round(usdAmount * rates[currency]);
}

export type SupportedCurrency = keyof ExchangeRates;

export const CURRENCY_INFO: Record<SupportedCurrency, { symbol: string; label: string; paystackCode: string; minAmountKobo: number }> = {
  USD: { symbol: "$", label: "USD", paystackCode: "USD", minAmountKobo: 100 },
  NGN: { symbol: "₦", label: "NGN", paystackCode: "NGN", minAmountKobo: 10000 },
  GHS: { symbol: "₵", label: "GHS", paystackCode: "GHS", minAmountKobo: 100 },
  ZAR: { symbol: "R", label: "ZAR", paystackCode: "ZAR", minAmountKobo: 100 },
  KES: { symbol: "KSh", label: "KES", paystackCode: "KES", minAmountKobo: 10000 },
  GBP: { symbol: "£", label: "GBP", paystackCode: "GBP", minAmountKobo: 100 },
  CAD: { symbol: "CA$", label: "CAD", paystackCode: "CAD", minAmountKobo: 100 },
  EUR: { symbol: "€", label: "EUR", paystackCode: "EUR", minAmountKobo: 100 },
};

export const COUNTRY_TO_CURRENCY: Record<string, SupportedCurrency> = {
  NG: "NGN", GH: "GHS", ZA: "ZAR", KE: "KES",
  GB: "GBP", CA: "CAD", DE: "EUR", FR: "EUR",
  NL: "EUR", IT: "EUR", ES: "EUR", BE: "EUR",
  AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR",
  US: "USD", AU: "USD", NZ: "USD", IN: "USD",
  SG: "USD", AE: "USD",
};
