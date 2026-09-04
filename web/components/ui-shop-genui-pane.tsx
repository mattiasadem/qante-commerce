"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/core";
import { CATEGORIES, RETURN_DAYS, SHIP_FREE, money } from "@/lib/core";
import { CheckoutNote, LineList, PayButton, ShipBar, ShopFooter, useAsk, useCart } from "@/components/ui-shell";
import { Suggestions } from "web-shared";
import { ActivityLine, GenerativeBlock } from "@/components/generative";
import { useAgentStream } from "@/lib/use-agent-stream";

export function AddButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const { add } = useCart();
  return <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => void add(productId)}>Sepete ekle</button>;
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const out = product.stock <= 0;
  return (
    <article className="card">
      <Link href={`/urun/${product.id}`} className="thumb-wrap">
        <img className="thumb" src={product.image} alt={product.name} />
        {out ? <div className="sold-overlay">tükendi</div> : null}
      </Link>
      <div className="card-body">
        <p className="faint" style={{ margin: "0 0 4px" }}>{product.category}</p>
        <h3><Link href={`/urun/${product.id}`}>{product.name}</Link></h3>
        <div><span className="price">{money(product.price)}</span>{product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}</div>
        <button className="btn btn-primary quick" type="button" disabled={out} onClick={() => void add(product.id)}>Ekle</button>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div className="empty"><div className="mark" /><h3>Bu süzgeçte parça yok</h3><p>Başka bir kategori veya arama dene.</p></div>;
  }
  return <div className="grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}

const STARTERS = ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı", "Bunu sepete ekle"];

export function AssistantPane({ productId, prefill }: { productId?: string; prefill?: string }) {
  const { ask } = useAsk();
  const { applyCart } = useCart();
  const onCartUpdate = useCallback((cart: Parameters<typeof applyCart>[0]) => applyCart(cart), [applyCart]);
  const { messages, busy, activity, submit } = useAgentStream({ endpoint: "/api/chat", onCartUpdate });
  const [input, setInput] = useState(prefill ?? "");
  const seen = useRef(0);

  useEffect(() => {
    if (ask && ask.n !== seen.current) {
      seen.current = ask.n;
      void submit(ask.message, ask.productId ?? productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);

  return (
    <>
      <div className="rail-head"><span>Qante Asistan</span><span className="faint">generative</span></div>
      <div className="rail-log">
        {messages.length === 0 ? (
          <>
            <div className="turn">Merhaba. Ne arıyorsun — keten, ev, yün. Kartlar akışla gelir.</div>
            <Suggestions suggestions={STARTERS} onPick={(s) => void submit(s, productId)} disabled={busy} />
          </>
        ) : null}
        {messages.map((m, i) => (
          <div key={i} data-turn={i}>
            {m.role === "user" ? (
              <div className="turn user">{m.text}</div>
            ) : (
              <>
                {m.text ? <div className="turn">{m.text}</div> : null}
                {m.slots.map((slot) => (
                  <GenerativeBlock key={slot.stream_id} slot={slot} onAsk={(t) => void submit(t, productId)} />
                ))}
                {m.pending ? <ActivityLine label={activity || "Ürünleri arıyorum…"} /> : null}
                {!m.pending && m.suggestions?.length ? (
                  <Suggestions suggestions={m.suggestions.slice(0, 3)} onPick={(s) => void submit(s, productId)} disabled={busy} />
                ) : null}
              </>
            )}
          </div>
        ))}
      </div>
      {busy && !messages.some((m) => m.role === "assistant" && m.pending) ? (
        <ActivityLine label={activity || "Ürünleri arıyorum…"} />
      ) : null}
      <form className="composer" onSubmit={(e) => { e.preventDefault(); void submit(input, productId); setInput(""); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="ne arıyorsun" aria-label="Asistan" />
        <button className="btn btn-primary" type="submit" disabled={busy}>Gönder</button>
      </form>
    </>
  );
}

export function AssistantRail({ productId }: { productId?: string }) {
  return (
    <aside className="rail" role="complementary" aria-label="Qante Asistan" data-component="AssistantRail">
      <AssistantPane productId={productId} />
    </aside>
  );
}

export function AssistantSheet({ productId }: { productId?: string }) {
  const { sheetOpen, setSheetOpen } = useAsk();
  if (!sheetOpen) return null;
  return (
    <div className="sheet" role="dialog" aria-label="Qante Asistan">
      <div className="drawer-head">
        <strong>Qante Asistan</strong>
        <button className="icon-btn" type="button" onClick={() => setSheetOpen(false)} aria-label="Kapat">Kapat</button>
      </div>
      <AssistantPane productId={productId} />
    </div>
  );
}
