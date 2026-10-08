const LOGOS: [keyword: string, file: string][] = [
  ['anteraja', '/logos/anteraja.jpg'],
  ['jne', '/logos/jne.jpg'],
  ['jnt', '/logos/jnt.png'],
  ['jt', '/logos/jnt.png'], // "J&T" loses the & when normalized
  ['pos', '/logos/pos.png'],
  ['sicepat', '/logos/sicepat.jpg'],
  ['tiki', '/logos/tiki.jpg'],
];

/** Returns the bundled logo for a courier name, or null when we do not have one. */
export function getCourierLogo(courierName: string): string | null {
  const normalized = courierName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return LOGOS.find(([keyword]) => normalized.includes(keyword))?.[1] ?? null;
}
