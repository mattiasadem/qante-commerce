from __future__ import annotations

from datetime import datetime

from merchant.api.local_store import LocalStore
from merchant.api.metrics import ISTANBUL, REVENUE_STATUSES, compute_snapshot, parse_dt
from merchant.api.staging import StagingLedger, writes_enabled
from shared.ikas.auth import mask_authorization, mask_headers
from shared.ikas.queries import LIST_ORDER, LIST_PRODUCT
from tests.fake_ikas import canned

NOW = datetime(2026, 9, 3, 12, 0, tzinfo=ISTANBUL)


def _store() -> LocalStore:
    return LocalStore()


def test_seed_has_twelve_products() -> None:
    assert len(_store().products) == 12


def test_snapshot_matches_seed_window() -> None:
    store = _store()
    snap = store.snapshot(now=NOW)
    start = parse_dt(snap["period_start"] + "T00:00:00+03:00")
    expected = compute_snapshot(store.orders, now=NOW)
    assert snap["revenue"] == expected["revenue"]
    assert snap["order_count"] == expected["order_count"]
    assert snap["aov"] == expected["aov"]
    assert snap["revenue"] > 0
    assert snap["order_count"] >= 10
    current_orders = [
        o
        for o in store.orders
        if o["status"] in REVENUE_STATUSES
        and parse_dt(o["created_at"]) >= start
        and parse_dt(o["created_at"]) < NOW
    ]
    assert snap["order_count"] == len(current_orders)
    assert snap["aov"] == round(snap["revenue"] / snap["order_count"], 2)


def test_turkish_product_names_present() -> None:
    names = {p["name"] for p in _store().products}
    assert "Keten Gömlek" in names
    assert "Yün Atkı" in names
    assert "Seramik Vazo" in names


def test_low_and_out_of_stock_alerts() -> None:
    kinds = {(a["kind"], a["product_id"]) for a in _store().alerts(now=NOW)}
    assert ("out_of_stock", "prod_ipek_fular") in kinds
    assert ("low_stock", "prod_deri_cuzdan") in kinds
    assert ("low_stock", "prod_yun_atki") in kinds
    assert ("slow_mover", "prod_kadife_minder") in kinds


def test_order_issues_from_seed() -> None:
    issues = _store().issues(now=NOW)
    kinds = {i["kind"] for i in issues}
    assert "unshipped" in kinds
    assert "pending_payment" in kinds
    assert "return_open" in kinds


def test_fake_ikas_canned_ops() -> None:
    product = canned("ListProduct")
    assert "listProduct" in product["data"]
    order = canned("ListOrder")
    assert "listOrder" in order["data"]


def test_queries_live_in_one_module() -> None:
    assert "listProduct" in LIST_PRODUCT
    assert "listOrder" in LIST_ORDER


def test_authorization_is_masked() -> None:
    assert mask_authorization("Bearer super-secret") == "Bearer ***"
    masked = mask_headers({"Authorization": "Bearer super-secret", "Accept": "application/json"})
    assert masked["Authorization"] == "Bearer ***"
    assert masked["Accept"] == "application/json"


def test_apply_change_requires_approval_and_flag_off() -> None:
    assert writes_enabled() is False
    ledger = StagingLedger()
    row = ledger.stage("price_update", {"listing_id": "prod_yun_atki"}, session_id="s1")
    try:
        ledger.apply_change(row["id"])
        raise AssertionError("expected PermissionError")
    except PermissionError:
        pass
    approved = ledger.approve(row["id"], operator_id="op1")
    applied = ledger.apply_change(approved["id"])
    assert applied["status"] == "failed"
    assert "IKAS_WRITES_ENABLED" in applied["error"]
