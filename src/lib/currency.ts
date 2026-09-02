import { promises } from "dns";
import { unstable_cache } from "next/cache";
const DEFAULT_EURO_USD_EXCHANGE_RATE = 0.92;

async function fetchExchangeRate(): Promise<number> {
    try {
        const response = await fetch('https://open.er-api.com/v6/latest/EUR', {
            next: { revalidate: 86400 }
        });
        if (!response.ok) return DEFAULT_EURO_USD_EXCHANGE_RATE;

        const data = await response.json();
        return data.rates.USD ?? DEFAULT_EURO_USD_EXCHANGE_RATE;
    } catch (error) {
        return DEFAULT_EURO_USD_EXCHANGE_RATE;
    }
}

export const getEuroToUsdRate = unstable_cache(fetchExchangeRate, ["EUR-USD-RATE"], {
    revalidate: 86400,
});

export function formatUSD(price: number): string {
  return `$${price.toFixed(0)}`;
}
export function formatEUR(price: number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return `€${Math.round(num).toLocaleString("de-DE")}`;
}

export async function formatPriceWithUSD(priceEur:number | string): Promise<string> {
    const num = typeof priceEur === "string" ? parseFloat(priceEur) : priceEur;
    const rate = await getEuroToUsdRate();
    const usd = Math.round(num * rate);

    return `€${Math.round(num).toLocaleString("de-DE")} (~$${usd} USD)`;
}


export function formatPriceWithUSDSync(
  priceEur: number | string,
  rate: number = DEFAULT_EURO_USD_EXCHANGE_RATE
): string {
  const num = typeof priceEur === "string" ? parseFloat(priceEur) : priceEur;
  const usd = Math.round(num * rate);
  return `€${Math.round(num).toLocaleString("de-DE")} (~$${usd} USD)`;
}