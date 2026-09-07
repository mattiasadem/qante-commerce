import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const GROUPS: { title: string; items: { href: string; label: string }[] }[] = [
  {
    title: "Operasyon",
    items: [
      { href: "/merchant", label: "Özet" },
      { href: "/merchant/sohbet", label: "Sohbet" },
      { href: "/merchant/bekleyen", label: "Bekleyen" },
    ],
  },
  {
    title: "Katalog",
    items: [
      { href: "/merchant/katalog", label: "Katalog" },
      { href: "/merchant/stok", label: "Stok" },
      { href: "/merchant/siparisler", label: "Siparişler" },
    ],
  },
];

const TITLES: Record<string, string> = {
  "/merchant": "Özet",
  "/merchant/sohbet": "Sohbet",
  "/merchant/bekleyen": "Bekleyen",
  "/merchant/katalog": "Katalog",
  "/merchant/stok": "Stok",
  "/merchant/siparisler": "Siparişler",
};

export function MerchantShell({
  children,
  current,
}: {
  children: ReactNode;
  current: string;
}) {
  const title = TITLES[current] ?? "Operatör";
  return (
    <div className="portal" data-surface="merchant-ops">
      <nav className="sidenav" aria-label="Operatör">
        <div className="mark">
          <Logo size={20} />
          QANTE OPS
        </div>
        {GROUPS.map((g) => (
          <div key={g.title}>
            <div className="nav-group">{g.title}</div>
            {g.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={item.href === current ? "active" : ""}
                aria-current={item.href === current ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ))}
        <div className="nav-foot">
          <Link href="/" className="faint">
            ← Vitrine dön
          </Link>
          <p className="note">Seed veri · onay yerel deftere yazar · ikas kapalı</p>
        </div>
      </nav>
      <div className="ops-frame">
        <header className="ops-topbar">
          <div className="crumb">
            Operatör <span aria-hidden>/</span> <strong>{title}</strong>
          </div>
          <div className="spacer" />
          <span className="pill">yerel defter · ikas off</span>
        </header>
        <div className="main">{children}</div>
      </div>
    </div>
  );
}
