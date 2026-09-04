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
