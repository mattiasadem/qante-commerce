# Agent host wiring (still missing)

For real `useAgentTurn` / `Chat` / blueprint `StoreShell`:

1. Uncomment git pins in root `requirements.txt` (commit fd4d592…).
2. Implement `StorefrontBackend` / `MerchantBackend` over ikas (see Shopify `shopify_backend.py` pattern).
3. Mount shopping_agent / merchant_agent FastAPI hosts (demo_common helpers in `vendor/demo_common`).
4. Point `web` AgentApi at storefront `/api/chat` SSE (X-Session-Id).
5. Prefer a Tailwind storefront/web (Shopify pattern) or add Tailwind to `web/` so StoreShell/BagPanel class names resolve.
6. Keep Option B `cart_store` until cart_update SSE lands; then sync drawer from agent events.
