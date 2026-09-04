# Copyright 2026 Anthropic PBC
# SPDX-License-Identifier: Apache-2.0

"""Routes, gates, and merchant writes every vertical honors; each test_contract.py star-imports it."""

import asyncio
import inspect
import re
from collections.abc import Iterable
from datetime import date, timedelta
from typing import Any

import pytest
from fastapi import FastAPI
from fastapi.routing import APIRoute
from fastapi.testclient import TestClient
from pydantic import BaseModel

from commerce_common.memory import InMemoryMemoryStore
from commerce_common.types import MemoryFact
from demo_common import (
    SESSION_HEADER,
    build_merchant_router,
)
from demo_common.storefront_fixtures import load_catalog, load_json
from demo_common.tests.fixtures import showcase_products, start_operator, start_shopper
from merchant_agent import (
    ActorKind,
    CampaignDraft,
    ChangeNotApplicable,
    ChangeStatus,
    InventoryActionItem,
    PriceUpdateItem,
    PromotionDraft,
)
from merchant_agent_runtime import MerchantAgent
from shopping_agent import SearchFilters, ShoppingSessionContext

IDENTITY_FIELDS = {"user_id", "session_id", "merchant_id", "operator"}
STOREFRONT_PUBLIC = {
    "/api/session",
    "/api/products",
    "/api/products/{product_id:path}",
    "/api/health",
}
MERCHANT_PUBLIC = {"/api/merchant/session", "/api/merchant/health"}
LOOPBACK = ("127.0.0.1", 12345)


# -- fixtures ------------------------------------------------------------------------


@pytest.fixture
def seeded_shopper(client):
    """Returns shopper headers over a freshly reseeded memory; reseeds again afterwards."""
    client.post("/api/reset", json={"clear_memory": True}, headers=start_shopper(client))
    yield start_shopper(client)
    client.post("/api/reset", json={"clear_memory": True}, headers=start_shopper(client))


@pytest.fixture
def portal(make_storefront, make_merchant_router):
    """Returns (client, store, merchant_id) for a portal whose store holds two facts."""
    store = InMemoryMemoryStore()
    app = FastAPI()
    app.include_router(make_merchant_router(make_storefront(), store), prefix="/api/merchant")
    client = TestClient(app, base_url="http://localhost", client=LOOPBACK)
    merchant_id = client.post("/api/merchant/session").json()["merchant_id"]
    asyncio.run(
        store.upsert_facts(
            merchant_id,
            [
                MemoryFact(
                    key="margin_floor",
                    value="keeps every listing above a 30% margin",
                    category="constraint",
                ),
                MemoryFact(key="digest_style", value="wants the morning digest kept to five lines"),
            ],
        )
    )
    return client, store, merchant_id


def _routes(app: FastAPI) -> list[Any]:
    """Every ``/api/`` path operation with its effective path, methods, and dependant.

    FastAPI 0.137 stopped copying an included router's operations into ``app.routes``;
    ``iter_route_contexts`` walks the nested shape, and older releases keep the flat one.
    """
    try:
        from fastapi.routing import iter_route_contexts
    except ImportError:  # FastAPI < 0.137
        routes: Iterable[Any] = app.routes
    else:
        routes = iter_route_contexts(app.routes)
    return [
        r
        for r in routes
        if isinstance(getattr(r, "original_route", r), APIRoute) and r.path.startswith("/api/")
    ]


def _dependency_of(route: Any):
    """The route's session dependency: the last one declared (a route-level hook such as
    the ticketing example's before_turn precedes it), or None on a public route."""
    calls = [dep.call for dep in route.dependant.dependencies]
    return calls[-1] if calls else None


def _resolver(current_session: Any):
    """The callable behind a role's ``CurrentSession`` annotation."""
    return current_session.__metadata__[0].dependency


def _declared_fields(route: Any) -> set[str]:
    dependant = route.dependant
    declared = {param.name for param in (*dependant.query_params, *dependant.path_params)}
    for body in dependant.body_params:
        annotation = body.field_info.annotation
        if isinstance(annotation, type) and issubclass(annotation, BaseModel):
            declared |= set(annotation.model_fields)
        else:
            declared.add(body.name)
    return declared


# -- identity ------------------------------------------------------------------------


def test_no_route_reads_identity_from_the_request(main):
    for route in _routes(main.app):
        if not route.path.endswith("/session"):
            assert not (_declared_fields(route) & IDENTITY_FIELDS), route.path


def test_public_route_sets_are_closed_and_each_role_has_its_own_token_store(
    main, extra_public_routes
):
    routes = _routes(main.app)
    storefront = [r for r in routes if not r.path.startswith("/api/merchant")]
    portal = [r for r in routes if r.path.startswith("/api/merchant")]
    assert {r.path for r in storefront if _dependency_of(r) is None} == (
        STOREFRONT_PUBLIC | extra_public_routes
    )
    assert {r.path for r in portal if _dependency_of(r) is None} == MERCHANT_PUBLIC
    resolver = _resolver(main.host.CurrentSession)
    assert all(_dependency_of(r) is resolver for r in storefront if _dependency_of(r))
    portal_dependencies = {_dependency_of(r) for r in portal if _dependency_of(r)}
    assert len(portal_dependencies) == 1
    assert resolver not in portal_dependencies


def test_every_scoped_route_refuses_a_missing_or_unknown_token(main, client):
    made_up = {SESSION_HEADER: "not-a-token"}
    for route in _routes(main.app):
        if _dependency_of(route) is None:
            continue
        path = re.sub(r"\{[^}]+\}", "x", route.path)
        for method in route.methods:
            assert client.request(method, path, json={}).status_code == 401, (method, path)
            assert client.request(method, path, json={}, headers=made_up).status_code == 401


def test_storefront_session_binds_the_profile_and_reset_reissues_it(main, client):
    started = client.post("/api/session", json={"user_id": "demo-user-2"}).json()
    assert started["user_id"] == "demo-user-2" and started["name"]
    assert main.host.sessions.require(started["session_id"]).user_id == "demo-user-2"
    assert client.post("/api/session", json={}).json()["user_id"] == "demo-user"
    assert (
        client.post("/api/session").json()["user_id"] == "demo-user"
    )  # the storefront sends no body
    assert client.post("/api/session", json={"user_id": ""}).status_code == 422

    mine, theirs = start_shopper(client), start_shopper(client, "demo-user-2")
    assert client.post("/api/reset", json={}, headers=theirs).status_code == 200
    fresh = client.post("/api/reset", json={}, headers=mine).json()["session_id"]
    assert client.get("/api/cart", headers=mine).status_code == 401
    assert main.host.sessions.require(fresh).user_id == "demo-user"


def test_merchant_session_binds_the_server_held_identity(portal):
    client, _, merchant_id = portal
    started = client.post("/api/merchant/session", json={"merchant_id": "someone-else"}).json()
    assert started["merchant_id"] == merchant_id
    headers = {SESSION_HEADER: started["session_id"]}
    assert client.get("/api/merchant/overview", headers=headers).status_code == 200
    fresh = client.post("/api/merchant/reset", json={}, headers=headers).json()["session_id"]
    assert client.get("/api/merchant/overview", headers=headers).status_code == 401
    assert client.get("/api/merchant/overview", headers={SESSION_HEADER: fresh}).status_code == 200


# -- host hardening --------------------------------------------------------------------


def test_non_loopback_host_names_are_rejected_before_any_route(main):
    for host, status in (
        ("http://localhost", 200),
        ("http://127.0.0.1", 200),
        ("http://evil.example.com", 400),
        ("http://testserver", 400),
        ("http://localhost.evil.example", 400),
    ):
        assert TestClient(main.app, base_url=host).get("/api/health").status_code == status, host


def test_json_body_without_a_content_type_is_not_parsed(client):
    # A cross-site "simple request" cannot set a JSON Content-Type.
    shopper = start_shopper(client)
    body = b'{"key": "x", "value": "y"}'
    assert client.request("PATCH", "/api/memory", content=body).status_code == 401
    assert client.request("PATCH", "/api/memory", content=body, headers=shopper).status_code == 422
    text = shopper | {"Content-Type": "text/plain"}
    assert client.request("PATCH", "/api/memory", content=body, headers=text).status_code == 422


def test_health_names_the_store_and_the_model(main, client, portal):
    storefront = client.get("/api/health").json()
    assert storefront["store"] == main.backend.store_name
    assert storefront["products"] == len(main.backend.products)
    assert storefront["model"] == main.agent.config.model
    portal_health = portal[0].get("/api/merchant/health").json()
    assert portal_health["store"] == main.backend.store_name and portal_health["role"] == "merchant"


# -- memory --------------------------------------------------------------------------


def _facts(main, user_id: str = "demo-user") -> dict:
    return {fact.key: fact for fact in asyncio.run(main.host.memory_store.get_facts(user_id))}


def test_memory_routes_carry_the_key_in_the_body(main):
    routes = [r for r in _routes(main.app) if r.path.endswith("/memory")]
    assert {(m, r.path) for r in routes for m in r.methods} == {
        ("GET", "/api/memory"),
        ("PATCH", "/api/memory"),
        ("DELETE", "/api/memory"),
        ("GET", "/api/merchant/memory"),
        ("DELETE", "/api/merchant/memory"),
    }
    assert not any(r.dependant.path_params or r.dependant.query_params for r in routes)


def test_seed_file_matches_what_a_fresh_shopper_sees(main, client, seeded_shopper):
    seed = load_json(main.DATA_DIR, "memory-seed.json")
    listed = client.get("/api/memory", headers=seeded_shopper).json()["facts"]
    assert {fact["key"] for fact in listed} == {fact["key"] for fact in seed["demo-user"]}
    assert all(fact["updated_at"] for fact in listed)
    assert (
        client.get("/api/memory", headers=start_shopper(client, "demo-user-2")).json()["facts"]
        == []
    )


def test_delete_and_edit_touch_exactly_one_fact_of_the_callers_own(main, client, seeded_shopper):
    key, *rest = sorted(_facts(main))
    stranger = start_shopper(client, "demo-user-2")
    assert (
        client.request("DELETE", "/api/memory", json={"key": key}, headers=stranger).status_code
        == 404
    )
    assert (
        client.patch("/api/memory", json={"key": key, "value": "x"}, headers=stranger).status_code
        == 404
    )

    edited = client.patch(
        "/api/memory", json={"key": key, "value": "corrected"}, headers=seeded_shopper
    )
    assert edited.status_code == 200
    assert _facts(main)[key].value == "corrected"
    rejected = client.patch(
        "/api/memory",
        json={"key": key, "value": "card on file 4000 1234 5678 9010"},
        headers=seeded_shopper,
    )
    assert rejected.status_code == 400 and "4000" not in rejected.text
    assert _facts(main)[key].value == "corrected"

    deleted = client.request("DELETE", "/api/memory", json={"key": key}, headers=seeded_shopper)
    assert deleted.json() == {"ok": True, "deleted": key}
    assert set(_facts(main)) == set(rest)
    assert (
        client.request(
            "DELETE", "/api/memory", json={"key": key}, headers=seeded_shopper
        ).status_code
        == 404
    )


def test_purge_deletes_everything_and_clear_memory_reseeds(main, client, seeded_shopper):
    assert (
        client.post("/api/reset", json={"purge_memory": True}, headers=seeded_shopper).status_code
        == 200
    )
    assert _facts(main) == {}
    assert asyncio.run(main.host.memory_store.purge_generation("demo-user")) >= 1
    client.post("/api/reset", json={"clear_memory": True}, headers=start_shopper(client))
    assert _facts(main)


def test_merchant_memory_lists_deletes_one_fact_and_purges(portal):
    client, store, merchant_id = portal
    headers = start_operator(client)
    listed = client.get("/api/merchant/memory", headers=headers).json()["facts"]
    assert {fact["key"] for fact in listed} == {"margin_floor", "digest_style"}
    body = {"key": "margin_floor"}
    deleted = client.request("DELETE", "/api/merchant/memory", json=body, headers=headers)
    assert deleted.json() == {"ok": True, "deleted": "margin_floor"}
    assert (
        client.request("DELETE", "/api/merchant/memory", json=body, headers=headers).status_code
        == 404
    )

    assert client.post("/api/merchant/reset", json={}, headers=headers).status_code == 200
    assert (
        len(client.get("/api/merchant/memory", headers=start_operator(client)).json()["facts"]) == 1
    )
    headers = start_operator(client)
    assert (
        client.post("/api/merchant/reset", json={"purge_memory": True}, headers=headers).status_code
        == 200
    )
    assert client.get("/api/merchant/memory", headers=start_operator(client)).json()["facts"] == []
    assert asyncio.run(store.purge_generation(merchant_id)) == 1


# -- portal routes -------------------------------------------------------------------


def test_listings_total_counts_the_universe_and_survives_paging(portal):
    client, _, _ = portal
    headers = start_operator(client)
    everything = client.get("/api/merchant/listings", headers=headers).json()
    assert everything["total"] == len(everything["listings"]) > 1
    page = client.get("/api/merchant/listings", params={"limit": 1}, headers=headers).json()
    assert page["total"] == everything["total"] and len(page["listings"]) == 1
    listing_id = everything["listings"][0]["listing_id"]
    detail = client.get(f"/api/merchant/listings/{listing_id}", headers=headers).json()
    assert detail["listing"]["listing_id"] == listing_id
    assert client.get("/api/merchant/listings/nope", headers=headers).status_code == 404


def test_ids_containing_slashes_reach_the_id_routes(client, main):
    """A platform's global id ("gid://shop/Product/7") reaches the handler, which answers
    404 for an unknown id; the id routes take ``:path`` parameters so it does not miss."""
    headers = start_operator(client)
    weird = "gid://acme/Listing/7"
    listing = client.get(f"/api/merchant/listings/{weird}", headers=headers)
    assert listing.status_code == 404 and listing.json()["detail"] == "Listing not found"
    product = client.get(f"/api/products/{weird}")
    assert product.status_code == 404 and product.json()["detail"] == "Product not found"
    applied = client.post(f"/api/merchant/changes/{weird}/apply", headers=headers)
    assert applied.status_code == 200 and weird in applied.json()["reason"]


def test_overview_and_alerts_carry_the_portal_keys(portal):
    client, _, _ = portal
    headers = start_operator(client)
    overview = client.get("/api/merchant/overview", headers=headers).json()
    assert {"snapshot", "needs_attention", "recent_orders", "recent_changes"} <= set(overview)
    assert set(overview["needs_attention"]) == {"inventory", "order_issues", "pending_changes"}
    assert set(client.get("/api/merchant/alerts", headers=headers).json()) == {
        "inventory",
        "order_issues",
    }


def test_preview_card_buttons_report_a_hold_apart_from_an_apply(
    backend, merchant, merchant_identity, operator_session
):
    """A held call answers ok=false with the reason; only an applied change queues an app event."""
    agent = MerchantAgent(
        backend=merchant, config=merchant.config, memory_store=InMemoryMemoryStore()
    )
    app = FastAPI()
    router = build_merchant_router(
        storefront=backend,
        backend=merchant,
        agent=agent,
        identity=merchant_identity,
        example_dir="contract",
    )
    app.include_router(router, prefix="/api/merchant")
    client = TestClient(app, base_url="http://localhost", client=LOOPBACK)
    headers = start_operator(client)
    apply_route = next(
        r for r in _routes(app) if r.path.endswith("/changes/{change_id:path}/apply")
    )
    sessions = inspect.getclosurevars(_dependency_of(apply_route)).nonlocals["store"]

    def stored():
        return sessions.require(headers[SESSION_HEADER])

    held = client.post("/api/merchant/changes/chg-none/apply", headers=headers)
    assert held.status_code == 200
    body = held.json()
    assert body["ok"] is False and body["change"] is None
    assert "chg-none was not staged or listed in this session" in body["reason"]
    dismissed = client.post("/api/merchant/changes/chg-none/discard", headers=headers).json()
    assert dismissed["ok"] is False and "nothing to discard" in dismissed["reason"]
    record = stored()
    assert record.pending_app_events == []
    assert not record.state.approved_change_ids and not record.state.host_action_change_ids

    listing = merchant.all_listings()[0]
    staged = asyncio.run(
        merchant.stage_price_update(
            operator_session,
            [PriceUpdateItem(listing_id=listing.listing_id, new_price=listing.price)],
        )
    )
    record.state.remember_change(staged)
    sessions.save(record)
    applied = client.post(f"/api/merchant/changes/{staged.change_id}/apply", headers=headers).json()
    assert applied["ok"] is True and applied["change"]["status"] == "applied"
    record = stored()
    assert record.pending_app_events == [
        f"Operator approved and applied change {staged.change_id} from the preview card."
    ]
    assert not record.state.approved_change_ids
    again = client.post(f"/api/merchant/changes/{staged.change_id}/apply", headers=headers)
    assert again.status_code == 400 and len(stored().pending_app_events) == 1


def test_orders_route_lists_the_callers_own_orders_newest_first(client):
    other = start_shopper(client, "demo-user-2")
