"use client";

import { useState } from "react";
import { parseCouponFromNote } from "@/components/ui-coupon-parse";

/** Siparişlerim row: coupon preference from checkout note with copy CTA. */
export function MyOrderKuponLine({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!coupon) return null;

  async function copyKupon() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-kupon" style={{ marginTop: 6 }}>
      Kupon · {coupon.label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-kupon-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyKupon()}
      >
        {copied ? "kopyalandı" : "Kuponu kopyala"}
      </button>
    </div>
  );
}
