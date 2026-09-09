"use client";
import { useEffect, useState } from "react";

export const RESTOCK_KEY = "qante_restock_watch";

export function useWatchCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(RESTOCK_KEY) || "[]") as unknown;
        setN(Array.isArray(raw) ? raw.filter((x) => typeof x === "string").length : 0);
      } catch {
        setN(0);
      }
    };
    sync();
    window.addEventListener("qante-restock", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qante-restock", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return n;
}
