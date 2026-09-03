# Decisions

## ADR-001 — Cart and checkout strategy (F0)

Status: accepted
Date: 2026-09-03

### Context

PLAN.md section 6.3 lists three options for shopping-agent cart:

- A. Widget inside the ikas theme, using the theme client SDK cart
- B. Own cart on our host (`cart_store.py`) plus checkout URL hand-off
- C. Discovery assistant with cart disabled

Q1 in IKAS_API_NOTES.md is still open: we have not confirmed a public Storefront/Cart API or a URL that can hydrate an ikas cart.

### Decision

**Option B** for F0–F3 start: a cart owned by this repository (`storefront/api/cart_store.py` and the Next.js `/api/cart` cookie cart).

We do **not** invent an ikas cart API. Checkout remains a later hand-off once Q1 is answered. Until then the demo cart is guest-only and in-memory or cookie-backed.

### Consequences

- Provenance stays on our server (session id).
- If ikas later exposes a theme SDK cart (option A), we can swap the store behind the same backend methods.
- Option C is the fallback if B cannot hand off to checkout.

### Evidence

No confirmed ikas cart/checkout URL as of this ADR. See Q1.
