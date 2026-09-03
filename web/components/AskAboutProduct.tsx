"use client";

import { useState } from "react";
import type { ChatResponse, Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-client";

const CHIPS = ["Bu ürünü sor", "Bedeni var mı", "İade nasıl", "Benzeri"];

export function AskAboutProduct({ product }: { product: Product }) {
  const [text, setText] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const { add } = useCart();

  async function ask(message: string) {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, productId: product.id }),
    });
    const turn = (await res.json()) as ChatResponse;
    setText(turn.text);
    setItems(turn.ui.find((u) => u.type === "present_products")?.products ?? []);
  }

  return (
    <div style={{ marginTop: 20 }}>
      <div className="chips">
        {CHIPS.map((c) => (
          <button key={c} className="chip" type="button" onClick={() => void ask(c)}>
            {c}
          </button>
        ))}
      </div>
      {text ? <p className="bubble" style={{ marginTop: 12 }}>{text}</p> : null}
      {items.length > 0 ? (
        <div className="mini-products" style={{ marginTop: 8 }}>
          {items.map((p) => (
            <div key={p.id} className="mini-product">
              <img src={p.image} alt={p.name} />
              <div>
                <div>{p.name}</div>
                <div className="faint">{money(p.price)}</div>
              </div>
              <button className="chip" type="button" onClick={() => void add(p.id)}>
                Ekle
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
