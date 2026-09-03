# Qante Commerce Agents — Mimari & Uygulama Planı

**Proje:** Qante Commerce için Claude tabanlı Shopping Agent + Merchant Agent, ikas altyapısı üzerinde
**Sahip:** Nivorius GmbH
**Sürüm:** v0.1 — 2 Eylül 2026 (cleaned copy for this repo)
**Bu belge kim için:** Cursor'da implementasyon yapan geliştirici. `.cursorrules` bu belgeye referans verir.

## F0 (shipped)

Pragmatic split so a browser demo can go live on Vercel Hobby today:

- **One Next.js app** at `web/` (App Router, TypeScript strict). Vercel Root Directory = `web`.
- Route handlers implement the API contracts (no separate FastAPI process required for the demo).
- Python skeletons remain: `merchant/api` :8005 (`IKAS_LOCAL_STORE=1`), `storefront/api` :8004.
- No Anthropic key, no live ikas, no money spend. Chat is a scripted demo turn.
- ADR-001 **Option B**: own `cart_store` (cookie guest cart). Do not invent an ikas cart API.
- Blueprint packages (`shopping_agent`, `merchant_agent`, `commerce_common`) are **not vendored**. Intended git pin is commented in `requirements.txt`.

Do not touch `https://qante.vercel.app` or the qante inventory repo.

---

## 0. Tek Sayfa Özet

- Anthropic `commerce-agents` blueprint **değiştirilmeden** pip bağımlılığı olarak kullanılır (F1+). Biz backend host, Next.js web ve ikas transport yazarız.
- **Merchant agent** ikas Admin GraphQL üzerinde. Yazma: `stage_*` → ledger → insan onayı → `apply_change` → mutation. Admin token model'e ulaşmaz.
- **Shopping agent** kataloğu server-side okur. F0 sepet stratejisi: Option B (`cart_store`).
- **Fazlar:** F0 keşif+demo → F1 merchant read-only → F2 staged writes → F3 shopping agent.
- **Diller:** identifier/comment/commit İngilizce; kullanıcı metinleri Türkçe (ünlem yok, "lütfen" yok).
- Fiyat: `Intl.NumberFormat("tr-TR")` → `1.249,90 ₺`.
- Marka: Qante, asistan: Qante Asistan, dark-grain (beige/indigo yok), Inter, 12px radius, logo = kare + round-pip SVG.

---

## 1. Referanslar

| Kaynak | Rol |
|---|---|
| `github.com/anthropics/commerce-agents` | Blueprint. Apache-2.0. Pin commit, fork yok, üstüne yazma. |
| `github.com/Shopify/claude-for-commerce-examples` | FastAPI + Next.js yapısal şablon |
| `builders.ikas.com/docs/app-development` | Private App = OAuth2 client-credentials |
| `ikas.dev/docs` | Admin GraphQL. Endpoint: `https://api.myikas.com/api/v2/admin/graphql` |

Blueprint paketleri `requirements.txt` yorum satırında pinlenir: `commerce-common`, `shopping-agent-core`, `shopping-agent-runtime`, `merchant-agent-core`, `merchant-agent-runtime`.

---

## 2. Hedef Mimari

```
Müşteri  →  web/ (Next.js)  →  /api/chat /api/cart /api/brand
Operatör →  web/merchant    →  /api/merchant/reads/*

Python (local / later host):
  storefront/api :8004  →  ShoppingAgent (blueprint, F3)
  merchant/api   :8005  →  MerchantAgent (blueprint, F1+)
  shared/ikas           →  auth · gql client · cache
                         →  ikas Admin GraphQL (not called in F0)
```

İlkeler (blueprint, değiştirilmez): tek model + skills; UI bileşenleri tool'dur; safety harness'te enforce; backend ikas'ı çağırır mantığı yeniden yazmaz; GraphQL yalnızca `shared/ikas/queries.py`.

---

## 3. Repo (F0 as shipped)

```
qante-commerce/
├── .cursorrules
├── .env.example
├── docs/PLAN.md  DECISIONS.md  SAFETY.md  IKAS_API_NOTES.md
├── shared/ikas/{auth,client,queries,types,cache}.py
├── storefront/api/{main,cart_store}.py
├── merchant/api/{main,local_store,metrics,alerts,staging}.py
├── merchant/data/seed.json
├── merchant/data/alert_thresholds.json
├── tests/fake_ikas.py
├── tests/test_local_store_metrics.py
├── web/                    # Vercel root
│   ├── app/(shop)/         # / /urun/[id] /sepet
│   ├── app/merchant/       # Özet /sohbet /bekleyen
│   ├── app/api/            # brand cart chat products merchant/reads
│   ├── components/
│   ├── lib/
│   ├── data/seed.json      # mirror (Vercel cannot import ../merchant)
│   └── public/products/*.svg
├── requirements.txt
├── requirements-dev.txt
├── ruff.toml
└── pytest.ini
```

**Kural:** `shopping_agent`, `merchant_agent`, `commerce_common` paketlerine dokunulmaz.

---

## 4. shared/ikas

- `auth.py`: client-credentials token, expiry-60s refresh, asyncio.Lock. Token yalnızca `client.py`'ye. Log'da Authorization maskelenir.
- `client.py`: httpx async GraphQL, retry 429/5xx, no 4xx retry. Test: MockTransport.
- `queries.py`: **tek yer** GraphQL dokümanı. F0: yalnızca `__typename` (şema doğrulanmadı).
- `types.py`: pydantic modelleri. Belirsiz ikas alan adları tahmin edilmez → `docs/IKAS_API_NOTES.md`.
- `cache.py`: katalog TTL 10 dk, sipariş 5 dk. F0: no-op / local.
- Webhooks: F1. F0'da yok.

Aday operasyonlar (doğrulanmadı): `listProduct`, `listCategory`, `listProductStockLocations`, `listOrder`, `listCustomer`, `saveProduct`, `saveProductStockLocations`, `saveWebhook`. Kampanya objesi F0 sorusu (Q3).

---

## 5. Merchant

Okumalar (F1 hedefi; F0 seed.json üzerinden demo):

| Metod | Kaynak |
|---|---|
| `get_business_snapshot` | `listOrder` → `metrics.py` |
| `query_metrics` | orders + products |
| `search_listings` / `get_listing` | `listProduct` |
| `get_inventory_alerts` | stok + satış hızı → `alerts.py` |
| `get_order_issues` | unshipped > 48h, return open, pending_payment > 24h |
| `get_pricing_context` | fiyat + stok + 30g satış |
| `get_merchant_context` | TRY, Europe/Istanbul |

Yazmalar F2: `stage_*` ikas'a gitmez. `apply_change` yalnız `status == approved` ve `IKAS_WRITES_ENABLED=true`.

Guardrail (F2): `max_price_change_pct=20`, `max_discount_pct=40`, `max_restock_units=500`, `max_items_per_change=25`, protected `sku/barcode/taxRate/vendor`.

Portal F0: `/merchant` Özet (metric cards + alerts + Sor), `/merchant/sohbet`, `/merchant/bekleyen` (boş kuyruk OK).

---

## 6. Shopping

F0 config (demo, model yok):

```
brand_name=Qante
assistant_name=Qante Asistan
brand_voice=samimi, kısa, Türkçe; fiyat ve stok veriden, uydurma yok
enable_cart=true
```

### ADR-001 Option B (karar verildi)

Kendi `cart_store` + cookie guest cart. ikas cart API uydurulmaz. Checkout hand-off F3 (ikas URL doğrulanınca).

Memory (KVKK): whitelist beden/renk/teslimat/kategori. **Kara liste:** sağlık, din, etnisite, finansal durum, TCKN, adres, telefon. F0 memory kapalı.

---

## 7. Güvenlik

Kapatılmayacak: fencing, provenance, quantity cap, merchant approval gate.
Ek: iki ayrı ikas credential (F1+), onay route model'e kapalı, token mask, `IKAS_WRITES_ENABLED=false`.
Ayrıntı: `docs/SAFETY.md`.

---

## 8. Eval

Snapshot evals F1+. F0: `pytest` local_store metrics, ruff clean. Türkçe + `1.249,90 ₺` formatı UI'da zorunlu.

---

## 9. Fazlar

| Faz | Durum |
|---|---|
| F0 keşif+demo | **Bu repo.** Seed storefront + merchant Özet, scripted chat, Option B cart. |
| F1 merchant read-only | IkasMerchantBackend 8 okuma, cache, webhook, 20 eval |
| F2 staged writes + onay | ledger, apply_change, portal Bekleyen gerçek kuyruk |
| F3 shopping agent | search, policies, checkout handoff, memory |
| F4 aday | Meta Ads, WhatsApp, multi-tenant |

F0 görevleri (orijinal 0.1–0.6) ikas live çağrı **yapmadan** kapatıldı: local_store + seed + Next demo. Canlı `listProduct` F1.

---

## 10. Ortam (`.env.example`)

```
ANTHROPIC_API_KEY=
SHOPPING_MODEL=claude-sonnet-5
MERCHANT_MODEL=claude-opus-5
IKAS_STOREFRONT_CLIENT_ID=
IKAS_STOREFRONT_CLIENT_SECRET=
IKAS_MERCHANT_CLIENT_ID=
IKAS_MERCHANT_CLIENT_SECRET=
IKAS_STORE_DOMAIN=qante.myikas.com
IKAS_GRAPHQL_URL=https://api.myikas.com/api/v2/admin/graphql
IKAS_WEBHOOK_SECRET=
IKAS_LOCAL_STORE=1
IKAS_WRITES_ENABLED=false
ENABLE_MEMORY=false
MEMORY_RETENTION_DAYS=365
DATABASE_URL=sqlite+aiosqlite:///./data/qante.db
LOG_LEVEL=INFO
```

Repo içinde credential yok. Live ikas çağrısı yok.

---

## 11. Komutlar

Python venv, then install both requirements files. Merchant API on 8005 with IKAS_LOCAL_STORE=1. Storefront API on 8004. In web/: install Node packages, then next dev or next build. ruff check and pytest. Vercel Root Directory is web.

---

## 12. Cursor kuralları

`.cursorrules` PLAN §12.1 ile aynı:

- PLAN.md source of truth.
- vendor / shopping_agent / merchant_agent / commerce_common dokunulmaz.
- GraphQL yalnızca `shared/ikas/queries.py`.
- ikas credential route/log/tool/model'e girmez.
- `stage_*` ikas çağırmaz; yalnız `apply_change` mutation gönderir (approved).
- Testler ağ ve Anthropic key istemez (`tests/fake_ikas.py`).
- Python async, pydantic v2, httpx, ruff. TypeScript strict.
- UI Türkçe; identifier/comment/commit İngilizce.
- Belirsiz ikas alanı → `docs/IKAS_API_NOTES.md`, tahmin yok.
- Faz sırası: sonraki fazı istenmeden başlatma.

---

## 13. Açık sorular

Q1–Q7 `docs/IKAS_API_NOTES.md` içinde.

| # | Soru |
|---|---|
| Q1 | Public Storefront/Cart API veya URL ile sepet doldurma? (B yüzünden F0'da kendi cart) |
| Q2 | Admin API rate limit |
| Q3 | İndirim/kampanya objesi |
| Q4 | Katalog büyüklüğü, varyant (beden/renk), kategori derinliği |
| Q5 | Ajan ikas vitrini / ayrı sayfa / WhatsApp |
| Q6 | Operatör sayısı, roller |
| Q7 | KVKK rıza vs meşru menfaat |

---

## 14. Başarı (ileriki fazlar)

- F1: operatör ciro/stok sorularını ikas paneli açmadan yanıtlar.
- F2: ≥10 gerçek değişiklik onaylanıp yazılır, sıfır guardrail ihlali.
- F3: sepete ekleme ölçülür, p50 ilk bileşen < 4s, sıfır ID sızıntısı.

F0 DoD (bu repo): storefront home + merchant Özet seed sayıları; cart add; asistan rayında demo yanıt; `web/` Vercel root olarak deploy edilebilir.

---

## 15. UI (F0)

İlkeler: chatbot balonu yok. Storefront = grid + cart drawer + assistant rail (desktop sticky, mobil bottom sheet). Merchant = Özet → Sohbet → Bekleyen. Inter, 12px radius, dark grain, Qante accent `#d8c7a6`.

Storefront routes: `/`, `/urun/[id]` ("bu ürünü sor" chips), `/sepet`.
Merchant routes: `/merchant`, `/merchant/sohbet`, `/merchant/bekleyen`.

API (Next route handlers):

- `GET /api/brand` — name, tokens, logo SVG
- `GET/POST /api/cart` — cookie `qante_cart`
- `POST /api/chat` — JSON veya SSE demo turn, 2–3 ürün UI
- `GET /api/products`
- `GET /api/merchant/reads/snapshot|alerts|issues`

Seed vibe: fashion/home, TRY, isimler "Keten Gömlek", "Yün Atkı", "Seramik Vazo".
