"use client";

import Link from "next/link";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-client";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, update, remove } = useCart();
  if (!open) return null;
  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Sepet">
        <div className="drawer-head">
          <strong>Sepet</strong>
          <button className="icon-btn" type="button" onClick={onClose} aria-label="Kapat">
            Kapat
          </button>
        </div>
        <div className="drawer-body">
          {cart.items.length === 0 ? (
            <p className="muted">Sepet boş.</p>
          ) : (
            cart.items.map((line) => (
              <div key={line.product_id} className="mini-product">
                <img src={line.product?.image} alt="" />
                <div>
                  <div>{line.product?.name}</div>
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
            ))
          )}
        </div>
        <div className="drawer-foot">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span className="muted">Toplam</span>
            <strong>{money(cart.subtotal)}</strong>
          </div>
          <Link className="btn" href="/sepet" onClick={onClose} style={{ display: "block", textAlign: "center", marginBottom: 8 }}>
            Sepete git
          </Link>
          <button className="btn btn-primary" type="button" disabled style={{ width: "100%" }}>
            Ödemeye geç
          </button>
          <p className="faint" style={{ marginTop: 8 }}>
            Checkout ikas hand-off F3. Demo sepeti burada kalır.
          </p>
        </div>
      </aside>
    </>
  );
}
