"use client";
import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell-providers";
import { flashCartToast } from "@/components/ui-cart-toast";
import { clearAllVariants, clearLineVariant, formatVariantLabel, getLineVariant } from "@/components/ui-variant";

const FAV_KEY = "qante_favorites";
function addFavoriteId(id: string) {
  try {
    const prev = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
    const list = Array.isArray(prev) ? prev.filter((x) => typeof x === "string") : [];
    if (!list.includes(id)) {
      localStorage.setItem(FAV_KEY, JSON.stringify([...list, id]));
      window.dispatchEvent(new CustomEvent("qante-favorites"));
    }
  } catch { /* ignore */ }
}

function addFavoriteIds(ids: string[]) {
  try {
    const prev = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
    const list = Array.isArray(prev) ? prev.filter((x) => typeof x === "string") : [];
    const set = new Set(list);
    for (const id of ids) if (typeof id === "string" && id) set.add(id);
    localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent("qante-favorites"));
  } catch { /* ignore */ }
}

function shortName(name?: string) {
  const n = (name || "Ürün").trim();
  return n.length > 28 ? `${n.slice(0, 26)}…` : n;
}

/** Cart line: Favorilere taşı + sepetten çıkar + Geri al toast. */
export function LineList({ extra }: { extra?: boolean }) {
  const { cart, update, remove } = useCart();

  async function removeWithUndo(line: (typeof cart.items)[number], kind: "sil" | "sonra") {
    const id = line.product_id;
    const qty = Math.max(1, line.qty);
    const label = shortName(line.product?.name);
    if (kind === "sonra") addFavoriteId(id);
    clearLineVariant(id);
    await remove(id);
    flashCartToast({
      text: kind === "sonra" ? `${label} · favoriye` : `${label} çıkarıldı`,
      action: "undo",
      productId: id,
      qty,
    });
  }

  async function bumpQty(line: (typeof cart.items)[number], next: number) {
    if (next <= 0) {
      await removeWithUndo(line, "sil");
      return;
    }
    await update(line.product_id, next);
  }

  return (
    <>
      {cart.items.map((line) => {
        const vLabel = formatVariantLabel(getLineVariant(line.product_id));
        return (
        <div key={line.product_id} className="mini-product" data-variant={vLabel || undefined}>
          <img src={line.product?.image} alt="" />
          <div>
            {extra ? <Link href={`/urun/${line.product_id}`}>{line.product?.name}</Link> : <div>{line.product?.name}</div>}
            {vLabel ? <div className="faint" data-cta="cart-variant">{vLabel}</div> : null}
            <div className="faint">{money(line.line_total)}</div>
            <div className="stepper" style={{ marginTop: 8 }}>
              <button type="button" aria-label="Azalt" data-cta="cart-qty-dec" onClick={() => void bumpQty(line, line.qty - 1)}>−</button>
              <span>{line.qty}</span>
              <button type="button" aria-label="Artır" data-cta="cart-qty-inc" onClick={() => void bumpQty(line, line.qty + 1)}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <button
              className="chip"
              type="button"
              data-cta="save-for-later"
              title="Favorilere taşı, sepetten çıkar"
              onClick={() => void removeWithUndo(line, "sonra")}
            >
              Sonra al
            </button>
            <button
              className="chip"
              type="button"
              data-cta="cart-remove"
              onClick={() => void removeWithUndo(line, "sil")}
            >
              Sil
            </button>
          </div>
        </div>
      );
      })}
    </>
  );
}

/** Move every cart line into Favoriler, then clear the cart. */
export function SaveAllForLaterButton({ className = "btn" }: { className?: string }) {
  const { cart, clear } = useCart();
  const [busy, setBusy] = useState(false);
  if (cart.items.length === 0) return null;
  return (
    <button
      className={className}
      type="button"
      disabled={busy}
      data-cta="save-all-for-later"
      title="Tüm satırları favorilere taşı, sepeti boşalt"
      onClick={async () => {
        setBusy(true);
        try {
          addFavoriteIds(cart.items.map((l) => l.product_id));
          clearAllVariants();
          await clear();
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "…" : `Tümünü sonra al · ${cart.items.length}`}
    </button>
  );
}
