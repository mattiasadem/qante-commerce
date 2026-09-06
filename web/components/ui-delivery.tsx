"use client";
import { useEffect, useState } from "react";

const DELIVERY_KEY = "qante_delivery";

export type DeliveryInfo = {
  name: string;
  phone: string;
  city: string;
  address: string;
};

const EMPTY: DeliveryInfo = { name: "", phone: "", city: "", address: "" };

export function readDelivery(): DeliveryInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(DELIVERY_KEY) || "null") as Partial<DeliveryInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    return {
      name: typeof raw.name === "string" ? raw.name.slice(0, 60) : "",
      phone: typeof raw.phone === "string" ? raw.phone.slice(0, 24) : "",
      city: typeof raw.city === "string" ? raw.city.slice(0, 40) : "",
      address: typeof raw.address === "string" ? raw.address.slice(0, 120) : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeDelivery(info: DeliveryInfo) {
  try {
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-delivery"));
  } catch {
    /* ignore */
  }
}

export function clearDelivery() {
  try {
    localStorage.removeItem(DELIVERY_KEY);
    window.dispatchEvent(new CustomEvent("qante-delivery"));
  } catch {
    /* ignore */
  }
}

/** Compact tag for order note (fits checkout note budget). */
export function formatDeliveryTag(info: DeliveryInfo = readDelivery()): string | null {
  const name = info.name.trim();
  const phone = info.phone.trim();
  const city = info.city.trim();
  const address = info.address.trim();
  if (!name && !phone && !city && !address) return null;
  const parts = [name, phone, city, address].filter(Boolean);
  return `[teslimat:${parts.join("|")}]`;
}

export function parseDeliveryFromNote(note?: string): DeliveryInfo | null {
  if (!note) return null;
  const m = note.match(/\[teslimat:([^\]]+)\]/i);
  if (!m?.[1]) return null;
  const [name = "", phone = "", city = "", address = ""] = m[1].split("|");
  if (!name && !phone && !city && !address) return null;
  return { name, phone, city, address };
}

/** Cart /sepet + drawer: demo delivery contact, localStorage only. */
export function DeliveryField() {
  const [info, setInfo] = useState<DeliveryInfo>({ ...EMPTY });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = readDelivery();
      setInfo(next);
      if (next.name || next.phone || next.city || next.address) setOpen(true);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-delivery", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-delivery", sync);
    };
  }, []);

  function patch(partial: Partial<DeliveryInfo>) {
    const next = { ...info, ...partial };
    setInfo(next);
    writeDelivery(next);
  }

  const filled = Boolean(info.name || info.phone || info.city || info.address);
  const summary = [info.name, info.city, info.phone].filter(Boolean).join(" · ");

  return (
    <div style={{ marginBottom: 12 }} data-cta="delivery-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: open ? 8 : 0 }}>
        <button
          className={`chip ${filled || open ? "on" : ""}`}
          type="button"
          data-cta="delivery-toggle"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          Teslimat{filled && !open && summary ? ` · ${summary}` : ""}
        </button>
        {filled ? (
          <button
            className="chip"
            type="button"
            data-cta="delivery-clear"
            onClick={() => {
              clearDelivery();
              setInfo({ ...EMPTY });
            }}
          >
            Temizle
          </button>
        ) : null}
      </div>
      {open ? (
        <div style={{ display: "grid", gap: 8 }} data-cta="delivery-form">
          <label style={{ display: "block" }}>
            <span className="faint" style={{ display: "block", marginBottom: 4 }}>Ad soyad</span>
            <input
              className="search"
              value={info.name}
              placeholder="Ayşe Yılmaz"
              aria-label="Ad soyad"
              data-cta="delivery-name"
              maxLength={60}
              onChange={(e) => patch({ name: e.target.value.slice(0, 60) })}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "block" }}>
            <span className="faint" style={{ display: "block", marginBottom: 4 }}>Telefon</span>
            <input
              className="search"
              value={info.phone}
              placeholder="05xx xxx xx xx"
              aria-label="Telefon"
              data-cta="delivery-phone"
              inputMode="tel"
              maxLength={24}
              onChange={(e) => patch({ phone: e.target.value.slice(0, 24) })}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "block" }}>
            <span className="faint" style={{ display: "block", marginBottom: 4 }}>İl</span>
            <input
              className="search"
              value={info.city}
              placeholder="İstanbul"
              aria-label="İl"
              data-cta="delivery-city"
              maxLength={40}
              onChange={(e) => patch({ city: e.target.value.slice(0, 40) })}
              style={{ width: "100%" }}
            />
          </label>
          <label style={{ display: "block" }}>
            <span className="faint" style={{ display: "block", marginBottom: 4 }}>Adres</span>
            <textarea
              className="search"
              rows={2}
              maxLength={120}
              value={info.address}
              placeholder="Mahalle, cadde, no…"
              aria-label="Adres"
              data-cta="delivery-address"
              onChange={(e) => patch({ address: e.target.value.slice(0, 120) })}
              style={{ width: "100%", resize: "vertical", minHeight: 56 }}
            />
          </label>
          <p className="faint" style={{ margin: 0 }}>
            Demo teslimat · checkout notuna yazılır · ikas&apos;a gitmez
          </p>
        </div>
      ) : null}
    </div>
  );
}

export { DELIVERY_KEY };
