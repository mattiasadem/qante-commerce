/** Known demo coupons — keep in sync with ui-coupon COUPONS labels. */
const LABELS: Record<string, string> = {
  QANTE10: "QANTE10 · %10 indirim",
  HOSGELDIN: "HOSGELDIN · 100 ₺ indirim",
  KARGO: "KARGO · Ücretsiz kargo",
};

/** Read [kupon:CODE] from checkout note for /siparis summary. */
export function parseCouponFromNote(note?: string): { code: string; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[kupon:([A-Za-z0-9_-]+)\]/i);
  if (!m) return null;
  const code = m[1].toUpperCase();
  const label = LABELS[code] ?? code;
  return { code, label };
}
