/** Formats rupiah with dot thousand separators, e.g. 25000 becomes "Rp 25.000". */
export function formatCurrency(amount: number): string {
  const digits = Math.round(amount).toString();
  return `Rp ${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
