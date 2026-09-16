"use client";

import { useState } from "react";
import { parsePhotoFromNote } from "@/components/ui-photo";

/** Merchant Siparişler row: photo-proof delivery preference from checkout note with copy CTA. */
export function MerchantPhotoLine({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!photo) return null;

  const label = `Foto · ${photo.label}`;

  async function copyFoto() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="merchant-photo" style={{ marginTop: 4 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="merchant-photo-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyFoto()}
      >
        {copied ? "kopyalandı" : "Fotoyu kopyala"}
      </button>
    </div>
  );
}
