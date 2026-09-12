"use client";

import { parseContactFromNote } from "@/components/ui-contact";

/** /siparis confirm: contact preference from checkout note. */
export function OrderConfirmContactSummary({ note }: { note?: string }) {
  const contact = parseContactFromNote(note);
  if (!contact) return null;
  return (
    <p className="muted" data-cta="contact-summary" style={{ marginTop: 6 }}>
      İletişim · {contact.label}
    </p>
  );
}
