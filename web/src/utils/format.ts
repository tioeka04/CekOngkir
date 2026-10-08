/** 25000 → "Rp 25.000" */
export function formatRupiah(amount: number): string {
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatTime(iso: string | Date, locale = 'id-ID'): string {
  return new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function formatShortDate(iso: string, locale = 'id-ID'): string {
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
