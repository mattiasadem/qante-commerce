"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useAsk, useCart } from "@/components/ui-shell-providers";
import { CompareTray } from "@/components/ui-compare";
import { Logo } from "@/components/ui-shell-chrome";
import {
  CartDrawer,
} from "@/components/ui-cart-with-slot";
import {
  useFavCount,
  useWatchCount,
} from "@/components/ui-cart-slot-pay";

export function StoreShell({ children }: { children: ReactNode }) {
  const { count, badgePop } = useCart();
  const { requestAsk, setSheetOpen, setCartOpen } = useAsk();
  const [q, setQ] = useState("");
  const router = useRouter();
  const path = usePathname();
  const search = useSearchParams();
  const favCount = useFavCount();
  const watchCount = useWatchCount();
  const favOn = path === "/" && (search.get("fav") === "1" || search.get("fav") === "true");
  const watchOn = path === "/" && (search.get("watch") === "1" || search.get("watch") === "true") && !favOn;
  return (
    <>
      <header className="header">
        <Link href="/" className="brand" aria-label="Qante"><Logo /><span>QANTE</span></Link>
        <form style={{ flex: 1, display: "flex", justifyContent: "center" }} onSubmit={(e) => {
          e.preventDefault();
          const query = q.trim();
          if (query) { requestAsk(query); router.push(`/?q=${encodeURIComponent(query)}`); }
          else router.push("/");
        }}>
          <input className="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ne arıyorsun" aria-label="Ara" />
        </form>
        <div className="header-actions">
          <Link href="/?fav=1" className={`icon-btn ${favOn ? "on" : ""}`} data-cta="nav-favorites" aria-label="Favoriler">
            Favoriler{favCount > 0 ? <span className="badge">{favCount}</span> : null}
          </Link>
          <Link
            href="/?watch=1"
            className={`icon-btn ${watchOn ? "on" : ""}`}
            data-cta="nav-restock-watch"
            aria-label="Beklediklerim"
          >
            Takip{watchCount > 0 ? <span className="badge">{watchCount}</span> : null}
          </Link>
          <Link href="/siparislerim" className={`icon-btn ${path.startsWith("/siparislerim") ? "on" : ""}`} data-cta="my-orders">Siparişlerim</Link>
          <Link href="/merchant" className="icon-btn">Operatör</Link>
          <button className="icon-btn" type="button" onClick={() => setCartOpen(true)} aria-label="Sepet">
            Sepet{count > 0 ? <span className={`badge ${badgePop ? "ac-pop" : ""}`}>{count}</span> : null}
          </button>
        </div>
      </header>
      <CartDrawer />
      <CompareTray />
      {children}
      <nav className="dock" aria-label="Mobil">
        <Link href="/" className={path === "/" && !favOn && !watchOn ? "on" : ""}>Mağaza</Link>
        <Link href="/?fav=1" className={favOn ? "on" : ""} data-cta="dock-favorites">Favori{favCount > 0 ? ` ${favCount}` : ""}</Link>
        <Link href="/?watch=1" className={watchOn ? "on" : ""} data-cta="dock-restock-watch">Takip{watchCount > 0 ? ` ${watchCount}` : ""}</Link>
        <Link href="/siparislerim" className={path.startsWith("/siparislerim") ? "on" : ""}>Sipariş</Link>
        <button type="button" onClick={() => setSheetOpen(true)}>Asistan</button>
        <button type="button" className={path === "/sepet" ? "on" : ""} onClick={() => setCartOpen(true)}>
          Sepet{count > 0 ? ` ${count}` : ""}
        </button>
      </nav>
    </>
  );
}

export function ShopFrame({ children }: { children: ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/merchant")) return <>{children}</>;
  return <StoreShell>{children}</StoreShell>;
}
