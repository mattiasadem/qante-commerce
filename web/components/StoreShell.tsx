"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { Logo } from "@/components/Logo";
import { useCart } from "@/lib/cart-client";

export function StoreShell({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();
  return (
    <>
      <header className="header">
        <Link href="/" className="brand" aria-label="Qante">
          <Logo />
          <span>QANTE</span>
        </Link>
        <form
          style={{ flex: 1, display: "flex", justifyContent: "center" }}
          onSubmit={(e) => {
            e.preventDefault();
            const query = q.trim();
            router.push(query ? `/?q=${encodeURIComponent(query)}` : "/");
          }}
        >
          <input
            className="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ne arıyorsun"
            aria-label="Ara"
          />
        </form>
        <div className="header-actions">
          <Link href="/merchant" className="icon-btn">
            Operatör
          </Link>
          <button className="icon-btn" type="button" onClick={() => setOpen(true)} aria-label="Sepet">
            Sepet
            {count > 0 ? <span className="badge">{count}</span> : null}
          </button>
        </div>
      </header>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
      {children}
    </>
  );
}
