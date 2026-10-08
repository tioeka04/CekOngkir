import { describe, expect, it } from 'vitest';
import { parseEtdDays, sortByPreference } from '../src/modules/shipping/shipping-sorter';
import type { ShippingOption } from '../src/types/domain';

const option = (courier: string, cost: number, etd: string): ShippingOption => ({
  courier,
  service: 'REG',
  description: '',
  cost,
  etd,
});

const options = [
  option('JNE', 20_000, '2-3 hari'),
  option('SiCepat', 15_000, '3-4 hari'),
  option('TIKI', 40_000, '1 hari'),
  option('POS', 12_000, '5-7 hari'),
  option('AnterAja', 18_000, '2 hari'),
  option('Extra', 50_000, '1 hari'),
];

describe('parseEtdDays', () => {
  it('reads the first number of an ETD string', () => {
    expect(parseEtdDays('2-3 hari')).toBe(2);
    expect(parseEtdDays('1 day')).toBe(1);
  });

  it('treats missing or non-numeric values as very slow', () => {
    expect(parseEtdDays('')).toBe(999);
    expect(parseEtdDays(undefined)).toBe(999);
  });
});

describe('sortByPreference', () => {
  it('cheapest: sorts by price ascending and limits to 5', () => {
    const result = sortByPreference(options, 'cheapest');
    expect(result.map((o) => o.courier)).toEqual(['POS', 'SiCepat', 'AnterAja', 'JNE', 'TIKI']);
  });

  it('fastest: sorts by delivery days ascending', () => {
    const result = sortByPreference(options, 'fastest');
    expect(result[0]?.etd).toBe('1 hari');
    expect(result.at(-1)?.courier).not.toBe('TIKI');
  });

  it('best_value: balances price and speed and returns 3 options', () => {
    const result = sortByPreference(options, 'best_value');
    expect(result).toHaveLength(3);
    expect(result[0]?.courier).toBe('AnterAja'); // cheap AND fast
  });

  it('all: returns everything sorted by price', () => {
    const result = sortByPreference(options, 'all');
    expect(result).toHaveLength(options.length);
    expect(result[0]?.courier).toBe('POS');
  });

  it('does not mutate the input and handles an empty list', () => {
    const copy = [...options];
    sortByPreference(options, 'cheapest');
    expect(options).toEqual(copy);
    expect(sortByPreference([], 'cheapest')).toEqual([]);
  });

  it('best_value copes with identical options', () => {
    const same = [option('A', 10_000, '2 hari'), option('B', 10_000, '2 hari')];
    expect(sortByPreference(same, 'best_value')).toHaveLength(2);
  });
});
