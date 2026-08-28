const IDR = new Intl.NumberFormat("id-ID");

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return jt % 1 === 0 ? `Rp ${jt.toFixed(0)}jt` : `Rp ${jt.toFixed(1)}jt`;
  }
  return `Rp ${IDR.format(amount)}`;
}