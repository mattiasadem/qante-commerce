"use client";

import { useCart } from "@/lib/cart-client";

export function AddButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const { add } = useCart();
  return (
    <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => void add(productId)}>
      Sepete ekle
    </button>
  );
}
