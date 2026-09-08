"use client";
import { useCallback, useMemo, useState } from "react";
import type { Alert, Issue, StagedChange } from "@/lib/core";
import { getProduct, suggestPriceCut, suggestRestockQty } from "@/lib/core";
import { alertKey, type OzetFilterId } from "@/components/ui-merchant-metrics-filters";

export function useOzetAlertActions(alerts: Alert[], issues: Issue[], filter: OzetFilterId) {
  const [busy, setBusy] = useState<string | null>(null);
  const [gone, setGone] = useState<Set<string>>(() => new Set());
  const [flash, setFlash] = useState<string | null>(null);
  const [flashHref, setFlashHref] = useState("/merchant/siparisler");

  const visibleAlerts = useMemo(
    () => alerts.filter((a) => !gone.has(alertKey(a))),
    [alerts, gone],
  );
  const visibleIssues = useMemo(
    () => issues.filter((i) => !gone.has(i.order_id)),
    [issues, gone],
  );

  // filtered views applied in UI; ids from filtered rows passed in
  const act = useCallback(async (orderId: string, action: string) => {
    setBusy(orderId);
    setFlash(null);
    setFlashHref("/merchant/siparisler");
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, action }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İşlem yapılamadı");
        return;
      }
      setGone((s) => new Set(s).add(orderId));
      setFlash(`${data.order.id} · yerel defter güncellendi`);
    } finally {
      setBusy(null);
    }
  }, []);

  const bulkOrders = useCallback(async (action: string, ids: string[], label: string) => {
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    setFlashHref("/merchant/siparisler");
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      const data = await res.json() as { count?: number; error?: string };
      if (!res.ok) {
        setFlash(data.error ?? "Toplu yazılamadı");
        return;
      }
      setGone((s) => {
        const n = new Set(s);
        for (const id of ids) n.add(id);
        return n;
      });
      setFlash(`${data.count ?? ids.length} ${label} · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }, []);

  const stageRestock = useCallback(async (a: Alert) => {
    const key = alertKey(a);
    setBusy(key);
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const target = suggestRestockQty(a.stock);
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "stock", product_id: a.product_id, target_qty: target }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      setGone((s) => new Set(s).add(key));
      setFlash(`${data.change.product_name} · ${data.change.before.stok} → ${data.change.after.stok} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }, []);

  const stagePrice = useCallback(async (a: Alert) => {
    const key = alertKey(a);
    setBusy(key);
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const product = getProduct(a.product_id);
      if (!product) {
        setFlash("Ürün bulunamadı");
        return;
      }
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "price", product_id: a.product_id, target_price: suggestPriceCut(product) }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "Kuyruğa yazılamadı");
        return;
      }
      setGone((s) => new Set(s).add(key));
      setFlash(`${data.change.product_name} · ${data.change.before.fiyat} → ${data.change.after.fiyat} Bekleyen'e eklendi`);
    } finally {
      setBusy(null);
    }
  }, []);

  const stageRestockAll = useCallback(async (restockIds: string[], visible: Alert[]) => {
    if (!restockIds.length) return;
    setBusy("bulk");
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restock_all", kind: "stock", product_ids: restockIds }),
      });
      const data = await res.json() as { count?: number; error?: string };
      if (!res.ok) {
        setFlash(data.error ?? "Toplu yenile yazılamadı");
        return;
      }
      setGone((s) => {
        const n = new Set(s);
        for (const a of visible) {
          if (a.kind === "low_stock" || a.kind === "out_of_stock") n.add(alertKey(a));
        }
        return n;
      });
      setFlash(`${data.count ?? restockIds.length} stok yenile Bekleyen'e · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }, []);

  const stagePriceAll = useCallback(async (discountIds: string[], visible: Alert[]) => {
    if (!discountIds.length) return;
    setBusy("bulk");
    setFlash(null);
    setFlashHref("/merchant/bekleyen");
    try {
      const res = await fetch("/api/merchant/stage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "price_all", kind: "price", product_ids: discountIds }),
      });
      const data = await res.json() as { count?: number; error?: string };
      if (!res.ok) {
        setFlash(data.error ?? "Toplu indirim yazılamadı");
        return;
      }
      setGone((s) => {
        const n = new Set(s);
        for (const a of visible) {
          if (a.kind === "slow_mover") n.add(alertKey(a));
        }
        return n;
      });
      setFlash(`${data.count ?? discountIds.length} indirim Bekleyen'e · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }, []);

  return {
    busy, flash, flashHref, visibleAlerts, visibleIssues,
    act, bulkOrders, stageRestock, stagePrice, stageRestockAll, stagePriceAll,
  };
}
