export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    const jt = amount / 1_000_000;
    return jt % 1 === 0 ? `Rp ${jt.toFixed(0)}jt` : `Rp ${jt.toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }
  return `Rp ${amount.toLocaleString("id-ID")}`;
}