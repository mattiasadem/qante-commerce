"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ChatResponse, Product, UiBlock } from "@/lib/core";
import { CATEGORIES, RETURN_DAYS, SHIP_FREE, money } from "@/lib/core";
import { CheckoutNote, LineList, PayButton, ShipBar, ShopFooter, useAsk, useCart } from "@/components/ui-shell";

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

type Msg = { role: "user" | "assistant"; text: string; ui?: UiBlock[]; suggestions?: string[] };
const STARTERS = ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"];

async function sendChat(message: string, productId?: string): Promise<ChatResponse> {
  const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, productId }) });
  return (await res.json()) as ChatResponse;
}

function ProductUi({ block }: { block: UiBlock }) {
  const { add } = useCart();
  const products = block.products ?? [];
  if (!products.length) return null;
  const wrap = block.type === "present_comparison" ? "compare-grid" : "carousel";
  return (
    <div className={wrap}>
      {products.map((p) => (
        <div key={p.id} className="tile">
          <Link href={`/urun/${p.id}`}><img src={p.image} alt={p.name} /></Link>
          <div className="meta">
            <Link href={`/urun/${p.id}`}>{p.name}</Link>
            <div className="faint">{money(p.price)}{p.stock <= 0 ? " · tükendi" : ""}</div>
            <button className="chip" type="button" disabled={p.stock <= 0} onClick={() => void add(p.id)} style={{ marginTop: 8 }}>Ekle</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AssistantPane({ productId, prefill }: { productId?: string; prefill?: string }) {
  const { ask } = useAsk();
  const [input, setInput] = useState(prefill ?? "");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState("");
  const seen = useRef(0);

  async function submit(text: string, pid?: string) {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setActivity("katalogda bakıyorum");
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    try {
      const turn = await sendChat(message, pid ?? productId);
      setActivity(turn.activity || "katalogda bakıyorum");
      await new Promise((r) => setTimeout(r, 380));
      setMessages((m) => [...m, { role: "assistant", text: turn.text, ui: turn.ui, suggestions: turn.suggestions.slice(0, 3) }]);
    } finally {
      setBusy(false);
      setActivity("");
    }
  }

  useEffect(() => {
    if (ask && ask.n !== seen.current) {
      seen.current = ask.n;
      void submit(ask.message, ask.productId ?? productId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ask]);

  return (
    <>
      <div className="rail-head"><span>Qante Asistan</span><span className="faint">katalog</span></div>
      <div className="rail-log">
        {messages.length === 0 ? (
          <>
            <div className="turn">Merhaba. Ne arıyorsun — keten, ev, yün.</div>
            <div className="chips">{STARTERS.map((s) => <button key={s} className="chip" type="button" onClick={() => void submit(s)}>{s}</button>)}</div>
          </>
        ) : null}
        {messages.map((m, i) => (
          <div key={i}>
            <div className={`turn ${m.role === "user" ? "user" : ""}`}>{m.text}</div>
            {m.ui?.map((b, k) => <ProductUi key={k} block={b} />)}
            {m.suggestions?.length ? <div className="chips" style={{ marginTop: 8 }}>{m.suggestions.slice(0, 3).map((s) => <button key={s} className="chip" type="button" onClick={() => void submit(s)}>{s}</button>)}</div> : null}
          </div>
        ))}
      </div>
      {busy ? <div className="activity" aria-live="polite">{activity || "katalogda bakıyorum"}</div> : null}
      <form className="composer" onSubmit={(e) => { e.preventDefault(); void submit(input); }}>
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

export function HomeView({ products, featured, query, category, greeting, dateLabel }: {
  products: Product[]; featured: Product[]; query?: string; category?: string; greeting: string; dateLabel: string;
}) {
  const { requestAsk } = useAsk();
  const router = useRouter();
  function pick(cat: string) {
    const next = category === cat ? "" : cat;
    requestAsk(next ? `${next} bakıyorum` : "öne çıkanlar");
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (next) params.set("cat", next);
    router.push(params.toString() ? `/?${params}` : "/");
  }
  const filtered = products;
  return (
    <div className="grid-wrap">
      <div className="hero-row">
        <h1>{greeting}</h1>
        <span className="date-line">{dateLabel}</span>
      </div>
      <p className="lede">Bugün raflarda keten, yün ve ev. Asistan sağda; arama hem grid hem rayı doldurur.</p>
      <div className="chips scroll" data-chips="category">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? "on" : ""}`} type="button" aria-pressed={category === c} onClick={() => pick(c)}>{c}</button>
        ))}
      </div>
      {!query && !category && featured.length ? (
        <>
          <div className="section-label">Öne çıkan</div>
          <div className="featured">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </>
      ) : null}
      <div className="section-label">{query ? `${filtered.length} sonuç · ${query}` : category ? category : "Katalog"}</div>
      <ProductGrid products={filtered} />
      <ShopFooter />
    </div>
  );
}

export function AskAboutProduct({ product }: { product: Product }) {
  const { requestAsk } = useAsk();
  const chips = [
    { label: "Bu ürünü sor", msg: `${product.name}` },
    { label: "Bedeni var mı", msg: `${product.name} bedeni var mı` },
    { label: "İade nasıl", msg: "iade nasıl" },
    { label: "Benzeri", msg: `${product.name} benzeri` },
  ];
  return (
    <div className="chips" style={{ marginTop: 18 }}>
      {chips.map((c) => <button key={c.label} className="chip" type="button" onClick={() => requestAsk(c.msg, product.id)}>{c.label}</button>)}
    </div>
  );
}

export function PdpView({ product, related }: { product: Product; related: Product[] }) {
  const [shot, setShot] = useState(0);
  const [color, setColor] = useState(product.colors?.[0]?.id);
  const [size, setSize] = useState(product.sizes?.[1] ?? product.sizes?.[0]);
  const out = product.stock <= 0;
  return (
    <div className="product-page">
      <div className="gallery">
        <div className="hero"><img src={product.gallery[shot] ?? product.image} alt={product.name} /></div>
        <div className="thumbs">
          {product.gallery.map((src, i) => (
            <button key={i} type="button" className={shot === i ? "on" : ""} onClick={() => setShot(i)} aria-label={`Görsel ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="pdp-head">
        <p className="faint">{product.category} · {product.sku}</p>
        <h1>{product.name}</h1>
        <p><span className="price">{money(product.price)}</span>{product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}</p>
        <p className="muted">{product.description}</p>
        {product.colors?.length ? (
          <div className="swatches" role="list">
            {product.colors.map((c) => (
              <button key={c.id} type="button" className={`swatch ${color === c.id ? "on" : ""}`} style={{ background: c.hex }} aria-label={c.name} onClick={() => setColor(c.id)} />
            ))}
          </div>
        ) : null}
        {product.sizes?.length ? (
          <div className="sizes">
            {product.sizes.map((s) => <button key={s} type="button" className={`chip ${size === s ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>)}
          </div>
        ) : null}
        <p className="faint">{out ? "tükendi" : `stok ${product.stock} adet`}</p>
        <p className="policy-line">İade {RETURN_DAYS} gün · {money(SHIP_FREE)} üzeri kargo yok</p>
        <AddButton productId={product.id} disabled={out} />
        <AskAboutProduct product={product} />
        {related.length ? (
          <>
            <div className="section-label">Yakın üç</div>
            <div className="featured" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        ) : null}
        <p style={{ marginTop: 24 }}><Link href="/" className="muted">Mağazaya dön</Link></p>
      </div>
    </div>
  );
}

export function CartPageView() {
  const { cart } = useCart();
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <h1>Sepet</h1>
      {cart.items.length === 0 ? (
        <div className="empty"><div className="mark" /><h3>Sepet henüz boş</h3><p><Link href="/">Mağazaya bak</Link></p></div>
      ) : (
        <>
          <LineList extra />
          <ShipBar subtotal={cart.subtotal} />
          <p>Ara toplam <strong>{money(cart.subtotal)}</strong></p>
          <PayButton />
          <CheckoutNote />
        </>
      )}
      <ShopFooter />
    </div>
  );
}


type DemoOrderView = { order_id: string; items: { product_id: string; name: string; qty: number; price: number; line_total: number }[]; subtotal: number; created_at: string; note?: string };
export function OrderConfirm() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [order, setOrder] = useState<DemoOrderView | null>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) { setMissing(true); return; }
      setOrder(await r.json() as DemoOrderView);
    });
  }, [id]);
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <h1>Sipariş alındı</h1>
      {missing ? (
        <div className="empty"><div className="mark" /><h3>Sipariş bulunamadı</h3><p>Bu oturumun son demo siparişi yok. <Link href="/">Mağazaya dön</Link></p></div>
      ) : !order ? (
        <p className="muted">yazılıyor…</p>
      ) : (
        <>
          <p className="muted">Sipariş no <strong>{order.order_id}</strong></p>
          <p className="faint">{order.note ?? "ikas checkout simüle · yerel defter"}</p>
          <div className="list" style={{ marginTop: 18 }}>
            {order.items.map((l) => (
              <div className="list-row" key={l.product_id}>
                <div>{l.name}<div className="faint">{l.qty} adet</div></div>
                <strong>{money(l.line_total)}</strong>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 16 }}>Toplam <strong>{money(order.subtotal)}</strong></p>
          <p style={{ marginTop: 24 }}><Link href="/" className="btn btn-primary">Mağazaya dön</Link></p>
        </>
      )}
      <ShopFooter />
    </div>
  );
}
