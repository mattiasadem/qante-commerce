"use client";

import { useState } from "react";
import { parseCouponFromNote } from "@/components/ui-coupon-parse";

/** Merchant Siparişler row: applied checkout coupon with copy CTA. */
export function MerchantCouponLine({ note }: { note?: string }) {
  const p = parseCouponFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!p) return null;

  async function copyKupon() {
    try {
      await navigator.clipboard.writeText(p.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-coupon" style={{ marginTop: 4 }}>
      Kupon · {p.label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-coupon-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyKupon()}
      >
        {copied ? "kopyalandı" : "Kuponu kopyala"}
      </button>
    </div>
  );
}
