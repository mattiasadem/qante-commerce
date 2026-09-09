"use client";
import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/core";
import { getProduct } from "@/lib/core";

export type CompareSnap = {
  id: string;
  name: string;
  price: number;
  compare_at: number | null;
  stock: number;
  category: string;
  image: string;
  sku: string;
  sizes?: string[];
  colors?: string[];
};

const KEY = "qante_compare";
export const COMPARE_MAX = 3;

export function toSnap(p: Product): CompareSnap {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    compare_at: p.compare_at ?? null,
    stock: p.stock,
    category: p.category,
    image: p.image,
    sku: p.sku,
    sizes: p.sizes,
    colors: p.colors?.map((c) => c.name),
  };
}

export function parseCompareParam(raw?: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,+|]/)) {
    const id = part.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= COMPARE_MAX) break;
  }
  return out;
}

export function compareQstr(ids: string[]): string {
  const clean = parseCompareParam(ids.join(","));
  return clean.length ? `compare=${encodeURIComponent(clean.join(","))}` : "";
}

export function readCompare(): CompareSnap[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]") as unknown;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((x): x is CompareSnap => !!x && typeof x === "object" && typeof (x as CompareSnap).id === "string")
      .slice(0, COMPARE_MAX);
  } catch {
    return [];
  }
}

export function writeCompare(items: CompareSnap[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items.slice(0, COMPARE_MAX)));
    window.dispatchEvent(new CustomEvent("qante-compare"));
  } catch {
    /* ignore */
  }
}

export function snapsFromIds(ids: string[]): CompareSnap[] {
  const out: CompareSnap[] = [];
  for (const id of ids) {
    const p = getProduct(id);
    if (p) out.push(toSnap(p));
  }
  return out.slice(0, COMPARE_MAX);
}

export function useCompare() {
  const [items, setItems] = useState<CompareSnap[]>([]);
  useEffect(() => {
    const sync = () => setItems(readCompare());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-compare", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-compare", sync);
    };
  }, []);
  const has = useCallback((id: string) => items.some((x) => x.id === id), [items]);
  const toggle = useCallback((snap: CompareSnap) => {
    const prev = readCompare();
    const exists = prev.some((x) => x.id === snap.id);
    let next: CompareSnap[];
    if (exists) next = prev.filter((x) => x.id !== snap.id);
    else if (prev.length >= COMPARE_MAX) next = [...prev.slice(1), snap];
    else next = [...prev, snap];
    writeCompare(next);
    setItems(next);
  }, []);
  const remove = useCallback((id: string) => {
    const next = readCompare().filter((x) => x.id !== id);
    writeCompare(next);
    setItems(next);
  }, []);
  const clear = useCallback(() => {
    writeCompare([]);
    setItems([]);
  }, []);
  return { items, has, toggle, remove, clear };
}
