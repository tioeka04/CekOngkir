import type { ShippingOption, ShippingPreference } from '../../types/domain';

const UNKNOWN_DAYS = 999;
const RESULT_LIMIT = {
  cheapest: 5,
  fastest: 5,
  best_value: 3,
} as const;
/** Share of the best-value score that comes from price (the rest comes from speed). */
const PRICE_WEIGHT = 0.6;

/** Extracts the fastest day count from strings such as "2-3 hari" or "1 day". */
export function parseEtdDays(etd: string | null | undefined): number {
  const match = String(etd ?? '').match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : UNKNOWN_DAYS;
}

const byCost = (a: ShippingOption, b: ShippingOption) => a.cost - b.cost;
const byDays = (a: ShippingOption, b: ShippingOption) => parseEtdDays(a.etd) - parseEtdDays(b.etd);

/** Scales values to 0..1 (0 = best/lowest). Returns 0 for every value when they are all equal. */
function normalize(values: number[]): number[] {
  const min = Math.min(...values);
  const range = Math.max(...values) - min;
  return values.map((value) => (range === 0 ? 0 : (value - min) / range));
}

function rankByValue(options: ShippingOption[]): ShippingOption[] {
  const prices = normalize(options.map((option) => option.cost));
  const days = normalize(options.map((option) => parseEtdDays(option.etd)));
  return options
    .map((option, index) => ({
      option,
      score: PRICE_WEIGHT * (prices[index] ?? 0) + (1 - PRICE_WEIGHT) * (days[index] ?? 0),
    }))
    .sort((a, b) => a.score - b.score)
    .map(({ option }) => option);
}

/** Orders (and trims) shipping options according to what the user cares about. */
export function sortByPreference(
  options: ShippingOption[],
  preference: ShippingPreference,
): ShippingOption[] {
  if (options.length === 0) return [];

  switch (preference) {
    case 'cheapest':
      return [...options].sort(byCost).slice(0, RESULT_LIMIT.cheapest);
    case 'fastest':
      return [...options].sort(byDays).slice(0, RESULT_LIMIT.fastest);
    case 'best_value':
      return rankByValue(options).slice(0, RESULT_LIMIT.best_value);
    case 'all':
      return [...options].sort(byCost);
  }
}
