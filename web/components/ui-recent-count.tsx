"use client";
import { useEffect, useState } from "react";

export const RECENT_KEY = "qante_recent_views";

/** Header/dock badge for Son bakılanlar (localStorage). */
export function useRecentCount() {
  const [n, setN] = useState(0);
  useEffect(() => {
    const sync = () => {
      try {
        const raw = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as unknown;
        setN(Array.isArray(raw) ? raw.filter((x) => typeof x === "string").length : 0);
      } catch {
        setN(0);
      }
    };
    sync();
    window.addEventListener("qante-recent", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qante-recent", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return n;
}
