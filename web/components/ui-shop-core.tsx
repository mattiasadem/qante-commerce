"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/core";
import { money } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell";
import { CompareButton } from "@/components/ui-compare";

const FAV_KEY = "qante_favorites";

export function readFavorites(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeFavorites(ids: string[]) {
  try {
    localStorage.setItem(FAV_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("qante-favorites"));
  } catch {
    /* ignore */
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readFavorites());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-favorites", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-favorites", sync);
    };
  }, []);
  const toggle = useCallback((id: string) => {
    const prev = readFavorites();
    const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
    writeFavorites(next);
    setIds(next);
  }, []);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const clear = useCallback(() => {
    writeFavorites([]);
    setIds([]);
  }, []);
  return { ids, has, toggle, clear };
}

export function FavoriteButton({
  productId,
  className = "btn",
  compact,
}: {
  productId: string;
  className?: string;
  compact?: boolean;
}) {
  const { has, toggle } = useFavorites();
  const on = has(productId);
  return (
    <button
      className={className}
      type="button"
      aria-pressed={on}
      data-cta="favorite"
      title={on ? "Favoriden çıkar" : "Favoriye ekle"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
    >
      {compact ? (on ? "♥" : "♡") : on ? "Favoride" : "Favoriye ekle"}
    </button>
  );
}


/** PDP share: copy absolute product URL to clipboard. */
export function ShareButton({ productId, className = "btn" }: { productId: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={className}
      type="button"
      data-cta="share"
      title="Ürün linkini kopyala"
      onClick={async () => {
        const url = `${window.location.origin}/urun/${encodeURIComponent(productId)}`;
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(url);
          } else {
            const ta = document.createElement("textarea");
            ta.value = url;
            ta.setAttribute("readonly", "");
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
          }
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? "Kopyalandı" : "Paylaş"}
    </button>
  );
}

const RECENT_KEY = "qante_recent_views";
const RECENT_MAX = 8;

export function readRecent(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as string[];
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeRecent(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(ids.slice(0, RECENT_MAX)));
    window.dispatchEvent(new CustomEvent("qante-recent"));
  } catch {
    /* ignore */
  }
}

/** Record a PDP view — newest first, deduped, capped. */
export function pushRecent(id: string) {
  const prev = readRecent().filter((x) => x !== id);
  writeRecent([id, ...prev]);
}

export function clearRecent() {
  writeRecent([]);
}

export function useRecentViews() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readRecent());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-recent", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-recent", sync);
    };
  }, []);
  return { ids, clear: clearRecent };
}

export function AddButton({ productId, disabled, qty = 1 }: { productId: string; disabled?: boolean; qty?: number }) {
  const { add } = useCart();
  const n = Math.max(1, qty);
  return (
    <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => void add(productId, n)}>
      {n > 1 ? `Sepete ekle · ${n}` : "Sepete ekle"}
    </button>
  );
}

/** PDP buy-now: clear cart, add qty, checkout → /siparis (local ledger). */
export function BuyNowButton({ productId, disabled, qty = 1 }: { productId: string; disabled?: boolean; qty?: number }) {
  const { clear, add, checkout } = useCart();
  const { setCartOpen } = useAsk();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const n = Math.max(1, qty);
  return (
    <button
      className="btn"
      type="button"
      disabled={disabled || busy}
      data-cta="buy-now"
      onClick={async () => {
        setBusy(true);
        try {
          await clear();
          await add(productId, n);
          const order = await checkout();
          if (!order) return;
          setCartOpen(false);
          router.push(`/siparis?id=${encodeURIComponent(order.order_id)}`);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "yazılıyor" : n > 1 ? `Hemen al · ${n}` : "Hemen al"}
    </button>
  );
}

const RESTOCK_KEY = "qante_restock_watch";

export function readRestockWatch(): string[] {
  try {
    const raw = JSON.parse(localStorage.getItem(RESTOCK_KEY) || "[]") as string[];
    return Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeRestockWatch(ids: string[]) {
  try {
    localStorage.setItem(RESTOCK_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("qante-restock"));
  } catch {
    /* ignore */
  }
}

export function addRestockWatch(id: string) {
  const prev = readRestockWatch();
  if (prev.includes(id)) return prev;
  const next = [...prev, id];
  writeRestockWatch(next);
  return next;
}

export function clearRestockWatch() {
  writeRestockWatch([]);
}

/** OOS waitlist hook — same localStorage key NotifyRestockButton writes. */
export function useRestockWatch() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readRestockWatch());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-restock", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-restock", sync);
    };
  }, []);
  const remove = useCallback((id: string) => {
    const next = readRestockWatch().filter((x) => x !== id);
    writeRestockWatch(next);
    setIds(next);
  }, []);
  const clear = useCallback(() => {
    clearRestockWatch();
    setIds([]);
  }, []);
  return { ids, remove, clear };
}

/** OOS waitlist: localStorage + open ask rail (demo, no email). */
export function NotifyRestockButton({ product, className = "btn" }: { product: Product; className?: string }) {
  const { requestAsk } = useAsk();
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(readRestockWatch().includes(product.id));
  }, [product.id]);
  return (
    <button
      className={className}
      type="button"
      disabled={done}
      data-cta="notify-restock"
      onClick={() => {
        addRestockWatch(product.id);
        requestAsk(`${product.name} gelince haber ver`, product.id);
        setDone(true);
      }}
    >
      {done ? "Kaydedildi" : "Gelince haber ver"}
    </button>
  );
}


/** Low stock urgency: in stock but at most LOW_STOCK_MAX units. */
export const LOW_STOCK_MAX = 5;
export function isLowStock(stock: number) {
  return stock > 0 && stock <= LOW_STOCK_MAX;
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const out = product.stock <= 0;
  const low = isLowStock(product.stock);
  return (
    <article className="card">
      <Link href={`/urun/${product.id}`} className="thumb-wrap" style={{ position: "relative" }}>
        <img className="thumb" src={product.image} alt={product.name} />
        {out ? <div className="sold-overlay">tükendi</div> : null}
        {low ? (
          <span
            className="chip on"
            data-badge="low-stock"
            style={{
              position: "absolute",
              left: 8,
              bottom: 8,
              zIndex: 2,
              margin: 0,
              fontSize: 11,
              pointerEvents: "none",
            }}
          >
            Son {product.stock}
          </span>
        ) : null}
        <span style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}>
          <FavoriteButton productId={product.id} className="btn quick" compact />
        </span>
      </Link>
      <div className="card-body">
        <p className="faint" style={{ margin: "0 0 4px" }}>
          {product.category}
          {low ? ` · son ${product.stock}` : ""}
        </p>
        <h3>
          <Link href={`/urun/${product.id}`}>{product.name}</Link>
        </h3>
        <div>
          <span className="price">{money(product.price)}</span>
          {product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {out ? (
            <NotifyRestockButton product={product} className="btn quick" />
          ) : (
            <button className="btn btn-primary quick" type="button" onClick={() => void add(product.id)}>
              Ekle
            </button>
          )}
          <CompareButton product={product} className="btn quick" compact />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <div className="empty">
        <div className="mark" />
        <h3>Bu süzgeçte parça yok</h3>
        <p>Başka bir kategori veya arama dene.</p>
      </div>
    );
  }
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export type SortId = "default" | "price_asc" | "price_desc" | "stock";

export const SORTS: { id: SortId; label: string }[] = [
  { id: "default", label: "Önerilen" },
  { id: "price_asc", label: "Fiyat ↑" },
  { id: "price_desc", label: "Fiyat ↓" },
  { id: "stock", label: "Stokta önce" },
];
