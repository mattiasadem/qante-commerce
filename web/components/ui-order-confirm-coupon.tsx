"use client";

import { parseCouponFromNote } from "@/components/ui-coupon-parse";

/** /siparis confirm: coupon from checkout note. */
export function OrderConfirmCouponSummary({ note }: { note?: string }) {
  const coupon = parseCouponFromNote(note);
  if (!coupon) return null;
  return (
    <p className="muted" data-cta="coupon-summary" style={{ marginTop: 6 }}>
      Kupon · {coupon.label}
    </p>
  );
}
