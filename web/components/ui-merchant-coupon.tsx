"use client";

import { parseCouponFromNote } from "@/components/ui-coupon-parse";

/** Merchant Siparişler row: highlight applied checkout coupon with full code. */
export function MerchantCouponLine({ note }: { note?: string }) {
  const p = parseCouponFromNote(note);
  if (!p) return null;
  return (
    <div className="faint" data-cta="merchant-coupon" style={{ marginTop: 4 }}>
      Kupon · {p.label}
    </div>
  );
}
