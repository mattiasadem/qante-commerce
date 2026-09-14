"use client";

import { useState } from "react";
import { parseContactFromNote } from "@/components/ui-contact";

/** /siparis confirm: contact preference from checkout note with copy CTA. */
export function OrderConfirmContactSummary({ note }: { note?: string }) {
  const contact = parseContactFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!contact) return null;

  async function copyContact() {
    try {
      await navigator.clipboard.writeText(contact.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <p className="muted" data-cta="contact-summary" style={{ marginTop: 6 }}>
      İletişim · {contact.label}
      <button
        className="chip"
        type="button"
        data-cta="contact-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyContact()}
      >
        {copied ? "kopyalandı" : "İletişimi kopyala"}
      </button>
    </p>
  );
}
