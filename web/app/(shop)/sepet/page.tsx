"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-client";

export default function CartPage() {
  const { cart, update, remove } = useCart();
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <h1>Sepet</h1>
      {cart.items.length === 0 ? (
        <p className="muted">Sepet boş. <Link href="/">Mağazaya dön</Link></p>
      ) : (
        <>
          {cart.items.map((line) => (
            <div key={line.product_id} className="mini-product" style={{ marginBottom: 12 }}>
              <img src={line.product?.image} alt="" />
              <div>
                <Link href={`/urun/${line.product_id}`}>{line.product?.name}</Link>
                <div className="faint">{money(line.line_total)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <button className="chip" type="button" onClick={() => void update(line.product_id, line.qty - 1)}>
                    −
                  </button>
                  <span>{line.qty}</span>
                  <button className="chip" type="button" onClick={() => void update(line.product_id, line.qty + 1)}>
                    +
                  </button>
                </div>
              </div>
              <button className="chip" type="button" onClick={() => void remove(line.product_id)}>
                Sil
              </button>
            </div>
          ))}
          <p>
            Toplam <strong>{money(cart.subtotal)}</strong>
          </p>
          <button className="btn btn-primary" type="button" disabled>
            Ödemeye geç
          </button>
          <p className="faint">Checkout ikas hand-off F3. Demo sepeti burada kalır.</p>
        </>
      )}
    </div>
  );
}
