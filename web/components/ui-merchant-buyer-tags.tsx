"use client";

import { parseBuyerPrefChips } from "@/lib/buyer-prefs";

export { compactBuyerNote, parseBuyerPrefChips } from "@/lib/buyer-prefs";

/** Merchant Siparişler row: chips for checkout preference tags. */
export function BuyerPrefChips({ note }: { note?: string }) {
  const chips = parseBuyerPrefChips(note);
  if (!chips.length) {
    const plain = (note ?? "").trim();
    if (!plain) return null;
    return (
      <div className="faint" data-cta="merchant-buyer-note" style={{ marginTop: 4 }}>
        Not · {plain.slice(0, 120)}
      </div>
    );
  }
  return (
    <div
      className="chips"
      data-cta="merchant-buyer-prefs"
      role="list"
      aria-label="Alıcı tercihleri"
      style={{ marginTop: 6, flexWrap: "wrap", gap: 6 }}
    >
      {chips.map((c) => (
        <span key={c.key + ":" + c.label} className="tag accent" role="listitem" style={{ fontWeight: 500 }}>
          {c.label}
        </span>
      ))}
    </div>
  );
}
