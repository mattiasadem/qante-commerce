"""OAuth2 client-credentials token cache for the ikas Admin API.

The token is held in memory only and handed to client.py. It must never appear
in a route, a log line, a tool argument, or model context.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any

import httpx

logger = logging.getLogger(__name__)

TOKEN_URL_DEFAULT = "https://api.myikas.com/api/oauth/token"
REFRESH_SKEW_SECONDS = 60


def mask_authorization(value: str) -> str:
    """Replace an Authorization header value for logs."""
    if not value:
        return value
    return "Bearer ***"


def mask_headers(headers: dict[str, Any]) -> dict[str, Any]:
    """Copy headers with Authorization redacted. Never log the original mapping."""
    out: dict[str, Any] = {}
    for key, val in headers.items():
        if key.lower() == "authorization":
            out[key] = mask_authorization(str(val))
        else:
            out[key] = val
    return out


class IkasAuth:
    """Fetch and cache a client-credentials access token."""

    def __init__(
        self,
        client_id: str,
        client_secret: str,
        *,
        token_url: str = TOKEN_URL_DEFAULT,
        transport: httpx.AsyncBaseTransport | None = None,
    ) -> None:
        self._client_id = client_id
        self._client_secret = client_secret
        self._token_url = token_url
        self._transport = transport
        self._token: str | None = None
        self._expires_at: float = 0.0
        self._lock = asyncio.Lock()

    async def get_token(self) -> str:
        async with self._lock:
            now = time.monotonic()
            if self._token and now < self._expires_at - REFRESH_SKEW_SECONDS:
                return self._token
            return await self._refresh()

    async def _refresh(self) -> str:
        # Live token fetch is not used in F0 (IKAS_LOCAL_STORE=1). Method exists
        # so F1 can plug in without rewriting callers. No network in tests:
        # inject httpx.MockTransport.
        logger.info("ikas token refresh starting")
        async with httpx.AsyncClient(transport=self._transport) as client:
            response = await client.post(
                self._token_url,
                data={
                    "grant_type": "client_credentials",
                    "client_id": self._client_id,
                    "client_secret": self._client_secret,
                },
                headers={"Accept": "application/json"},
            )
            response.raise_for_status()
            payload = response.json()
        token = payload["access_token"]
        expires_in = float(payload.get("expires_in", 3600))
        self._token = token
        self._expires_at = time.monotonic() + expires_in
        logger.info("ikas token refresh complete expires_in=%s", expires_in)
        return token

    @classmethod
    def from_env(cls, prefix: str = "IKAS_STOREFRONT") -> IkasAuth:
        client_id = os.environ.get(f"{prefix}_CLIENT_ID", "")
        client_secret = os.environ.get(f"{prefix}_CLIENT_SECRET", "")
        return cls(client_id, client_secret)
