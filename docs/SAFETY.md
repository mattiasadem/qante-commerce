# Safety

This document extends the commerce-agents blueprint safety notes with Qante / KVKK rules.

## Harness (do not disable)

- Fencing of catalog copy, reviews, and policies
- Provenance: cart and writes only accept ids the server issued this session
- Quantity cap and serialized writes per session
- Merchant approval gate; guardrails re-checked at apply time
- Presentation tools take ids; the server fills records

## Credentials

- Storefront and merchant use separate ikas private apps (read vs write)
- Tokens live in `shared/ikas/auth.py` and are passed only to `client.py`
- Logs must use `mask_headers` / `mask_authorization`. Never log Authorization
- Approve/discard HTTP routes are operator-only. The model cannot call them

## Writes

- `stage_*` never calls ikas
- `apply_change` runs only when `status == approved`
- Production default: `IKAS_WRITES_ENABLED=false`

## Memory (KVKK)

Allowlist: size, color preference, delivery preference, interest category.

Blocklist (must never be stored in memory):

- TCKN
- health
- religion
- ethnicity
- financial status
- detailed address
- phone

Retention: 12 months (`MEMORY_RETENTION_DAYS=365`). Switch: `ENABLE_MEMORY=false` turns memory off.

User commands: "hakkımda ne hatırlıyorsun" and delete. Storefront shows an aydınlatma notice before memory is on.

## Demo (F0)

The Vercel app does not call Anthropic or ikas. Seed data only. No live PII.
