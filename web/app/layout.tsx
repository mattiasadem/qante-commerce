import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AskProvider, CartProvider, CartToastHost, ShopFrame } from "@/components/ui-shell";
import "./globals.css";
import "./genui.css";
import "./merchant.css";
import "./merchant-fallbacks.css";
const inter = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-inter", display: "swap" });
export const metadata: Metadata = { title: "Qante", description: "Qante mağaza ve operatör demosu" };
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} ${inter.className} grain`}>
        <div className="app">
          <CartProvider>
            <AskProvider>
              <CartToastHost />
              <ShopFrame>{children}</ShopFrame>
            </AskProvider>
          </CartProvider>
        </div>
      </body>
    </html>
  );
}
