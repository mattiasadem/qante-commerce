import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/merchant", label: "Özet" },
  { href: "/merchant/sohbet", label: "Sohbet" },
  { href: "/merchant/bekleyen", label: "Bekleyen" },
];

export function MerchantShell({
  children,
  current,
}: {
  children: ReactNode;
  current: string;
}) {
  return (
    <div className="portal">
      <nav className="sidenav" aria-label="Operatör">
        <div className="mark" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Logo size={22} />
          QANTE
        </div>
        {NAV.map((item) => (
          <Link key={item.href} href={item.href} className={item.href === current ? "active" : ""}>
            {item.label}
          </Link>
        ))}
        <Link href="/" className="faint" style={{ marginTop: 18 }}>
          Vitrine dön
        </Link>
      </nav>
      <div className="main">{children}</div>
    </div>
  );
}
