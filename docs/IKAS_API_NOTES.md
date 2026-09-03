# ikas API notes

F0 discovery log. Confirmed query/mutation names, rate limits, and quirks go here.
Until a row is marked confirmed, `shared/ikas/queries.py` only selects `__typename`.

Do not guess field names in application code. Add a question here instead.

## Open questions (from PLAN.md section 13)

### Q1 — Storefront / cart

Is there a public Storefront or Cart API, or a URL that can fill an ikas cart with variant + qty?

Impact: shopping agent cart strategy (A/B/C). ADR-001 currently picks B (own `cart_store`) because this is unanswered.

Owner: Mattias + ikas docs/support. Phase: F0.4.

### Q2 — Admin API rate limit

What are the Admin GraphQL rate limits (steady and burst)?

Impact: cache TTL, concurrent operators. Token bucket in `client.py` is a stub until measured.

Phase: F0.3.

### Q3 — Discount / campaign object

Does the Admin API expose a discount or campaign type we can `save*`?

Impact: `stage_promotion` / `stage_campaign`. Until confirmed, those stage methods should raise ChangeNotApplicable.

Phase: F0.3.

### Q4 — Qante catalog shape

Catalog size, variant model (size/color), category depth?

Impact: family vs variant id namespace, search approach.

Owner: Qante. Phase: F0.1.

### Q5 — Where the assistant lives

Inside the ikas vitrine, a separate page, WhatsApp, or all of the above?

Impact: web layer. F0 ships a standalone Next.js app in `web/`.

Owner: Qante. Phase: F0.1.

### Q6 — Operators and roles

How many operators, which roles?

Impact: auth model, person-scoped merchant memory.

Owner: Qante. Phase: F0.1.

### Q7 — KVKK basis for memory

Explicit consent vs legitimate interest? Who writes the aydınlatma text?

Impact: memory on/off. See docs/SAFETY.md.

Owner: Qante legal, before F3.

## Schema (unconfirmed)

Candidate operation names from PLAN.md 4.3, **not** verified in playground:

| Purpose | Candidate | Status |
|---|---|---|
| Product list/search | `listProduct` | unverified |
| Single product | `listProduct` with id filter | unverified |
| Categories | `listCategory` | unverified |
| Stock | `listProductStockLocations` or product `stocks` | unverified |
| Orders | `listOrder` | unverified |
| Customer | `listCustomer` | unverified |
| Product write | `saveProduct` | unverified |
| Stock write | `saveProductStockLocations` | unverified |
| Webhook | `saveWebhook` | unverified |

Endpoint (from public docs, still confirm): `https://api.myikas.com/api/v2/admin/graphql`

## Rate limit

Not measured. Do not assume Shopify-like leaky bucket values.

## Quirks

None recorded yet. No live ikas calls from this repository in F0.
