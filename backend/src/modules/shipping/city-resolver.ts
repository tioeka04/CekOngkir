import { logger } from '../../lib/logger';
import type { Destination, RajaOngkirClient } from './rajaongkir.client';

export interface ResolvedCity {
  id: number;
  name: string;
}

/** Common abbreviations / nicknames → [search term sent to the API, display name]. */
const CITY_ALIASES: Record<string, [search: string, display: string]> = {
  jkt: ['Jakarta Pusat', 'Jakarta'],
  jakarta: ['Jakarta Pusat', 'Jakarta'],
  sby: ['Surabaya', 'Surabaya'],
  bdg: ['Bandung', 'Bandung'],
  bndng: ['Bandung', 'Bandung'],
  smg: ['Semarang', 'Semarang'],
  jogja: ['Yogyakarta', 'Yogyakarta'],
  yogya: ['Yogyakarta', 'Yogyakarta'],
  solo: ['Surakarta', 'Surakarta'],
  mdn: ['Medan', 'Medan'],
  mksr: ['Makassar', 'Makassar'],
  plg: ['Palembang', 'Palembang'],
  pkb: ['Pekanbaru', 'Pekanbaru'],
  pku: ['Pekanbaru', 'Pekanbaru'],
  bali: ['Denpasar', 'Denpasar'],
  dpsr: ['Denpasar', 'Denpasar'],
  mlg: ['Malang', 'Malang'],
  mlng: ['Malang', 'Malang'],
  bpn: ['Balikpapan', 'Balikpapan'],
  ponti: ['Pontianak', 'Pontianak'],
  bjm: ['Banjarmasin', 'Banjarmasin'],
  lampung: ['Bandar Lampung', 'Bandar Lampung'],
};

const CACHE_TTL_MS = 60 * 60 * 1000;
const lower = (value: string) => value.toLowerCase().trim();

/** The API returns names in capitals ("SURABAYA"); show them as "Surabaya". */
export const toTitleCase = (value: string) =>
  value.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

/**
 * Picks the most relevant destination for a search term:
 * exact city match → city starting with the term (shortest first) → any partial match.
 * Returns null when nothing matches, instead of guessing a wrong city.
 */
export function pickBestDestination(destinations: Destination[], term: string): Destination | null {
  const needle = lower(term);
  if (!needle) return null;

  const exact = destinations.find((d) => lower(d.cityName) === needle);
  if (exact) return exact;

  const prefixed = destinations
    .filter((d) => lower(d.cityName).startsWith(needle))
    .sort((a, b) => a.cityName.length - b.cityName.length);
  if (prefixed[0]) return prefixed[0];

  return (
    destinations.find((d) =>
      [d.cityName, d.districtName, d.subdistrictName].some((field) => lower(field).includes(needle)),
    ) ?? null
  );
}

/** Turns free-text city names ("sby", "Kota Surabaya") into RajaOngkir destination ids. */
export class CityResolver {
  private readonly cache = new Map<string, { value: ResolvedCity | null; expiresAt: number }>();

  constructor(private readonly client: Pick<RajaOngkirClient, 'searchDestinations'>) {}

  async resolve(cityName: string): Promise<ResolvedCity | null> {
    const key = lower(cityName.replace(/\b(kota|kabupaten|kab\.)\s*/gi, ''));
    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    const alias = CITY_ALIASES[key];
    const searchTerm = alias ? alias[0] : key;

    const destinations = await this.client.searchDestinations(searchTerm);
    const match = pickBestDestination(destinations, searchTerm);
    const value = match ? { id: match.id, name: alias ? alias[1] : toTitleCase(match.cityName) } : null;

    logger.debug({ input: cityName, resolved: value }, 'City resolved');
    this.cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  }
}
