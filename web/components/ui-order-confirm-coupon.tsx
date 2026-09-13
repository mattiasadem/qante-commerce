"use client";

import { useState } from "react";
import { parseCouponFromNote } from "@/components/ui-coupon-parse";

/** /siparis confirm: coupon from checkout note with copy CTA. */
export function OrderConfirmCouponSummary({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!coupon) return null;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(coupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="coupon-summary" style={{ marginTop: 6 }}>
      Kupon · {coupon.label}
      <button
        className="chip"
        type="button"
        data-cta="coupon-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyCode()}
      >
        {copied ? "kopyalandı" : "Kuponu kopyala"}
      </button>
    </p>
  );
}
