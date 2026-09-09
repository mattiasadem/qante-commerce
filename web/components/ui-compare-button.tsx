"use client";
import type { Product } from "@/lib/core";
import { COMPARE_MAX, toSnap, useCompare } from "@/components/ui-compare-model";

export function CompareButton({
  product,
  className = "btn",
  compact,
}: {
  product: Product;
  className?: string;
  compact?: boolean;
}) {
  const { has, toggle, items } = useCompare();
  const on = has(product.id);
  const full = !on && items.length >= COMPARE_MAX;
  return (
    <button
      className={className}
      type="button"
      aria-pressed={on}
      data-cta="compare-toggle"
      title={full ? `En fazla ${COMPARE_MAX} ürün` : on ? "Karşılaştırmadan çıkar" : "Karşılaştırmaya ekle"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(toSnap(product));
      }}
    >
      {compact ? (on ? "⇄✓" : "⇄") : on ? "Karşılaştırmada" : full ? "Liste dolu" : "Karşılaştır"}
    </button>
  );
}
