"use client";
import Link from "next/link";
import { useState } from "react";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell-providers";

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

/** Cart line: Favorilere taşı + sepetten çıkar. */
export function LineList({ extra }: { extra?: boolean }) {
  const { cart, update, remove } = useCart();
  return (
    <>
      {cart.items.map((line) => (
        <div key={line.product_id} className="mini-product">
          <img src={line.product?.image} alt="" />
          <div>
            {extra ? <Link href={`/urun/${line.product_id}`}>{line.product?.name}</Link> : <div>{line.product?.name}</div>}
            <div className="faint">{money(line.line_total)}</div>
            <div className="stepper" style={{ marginTop: 8 }}>
              <button type="button" aria-label="Azalt" onClick={() => void update(line.product_id, line.qty - 1)}>−</button>
              <span>{line.qty}</span>
              <button type="button" aria-label="Artır" onClick={() => void update(line.product_id, line.qty + 1)}>+</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <button
              className="chip"
              type="button"
              data-cta="save-for-later"
              title="Favorilere taşı, sepetten çıkar"
              onClick={() => { addFavoriteId(line.product_id); void remove(line.product_id); }}
            >
              Sonra al
            </button>
            <button className="chip" type="button" onClick={() => void remove(line.product_id)}>Sil</button>
          </div>
        </div>
      ))}
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
