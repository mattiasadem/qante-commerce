"""Async GraphQL transport for the ikas Admin API.

Logs op_name, duration, and status. Never logs Authorization, payloads, or tokens.
"""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any

import httpx

from shared.ikas.auth import IkasAuth, mask_headers

logger = logging.getLogger(__name__)

DEFAULT_GRAPHQL_URL = "https://api.myikas.com/api/v2/admin/graphql"
MAX_ATTEMPTS = 3


class IkasClient:
    def __init__(
        self,
        auth: IkasAuth,
        *,
        graphql_url: str = DEFAULT_GRAPHQL_URL,
        transport: httpx.AsyncBaseTransport | None = None,
        timeout: float = 20.0,
    ) -> None:
        self._auth = auth
        self._graphql_url = graphql_url
        self._transport = transport
        self._timeout = timeout

    async def execute(
        self,
        document: str,
        variables: dict[str, Any] | None = None,
        *,
        op_name: str,
    ) -> dict[str, Any]:
        token = await self._auth.get_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        body = {
            "query": document,
            "variables": variables or {},
            "operationName": op_name,
        }
        last_error: Exception | None = None
        for attempt in range(1, MAX_ATTEMPTS + 1):
            started = time.perf_counter()
            try:
                async with httpx.AsyncClient(
                    transport=self._transport, timeout=self._timeout
                ) as client:
                    response = await client.post(self._graphql_url, json=body, headers=headers)
                elapsed_ms = int((time.perf_counter() - started) * 1000)
                logger.info(
                    "ikas graphql op=%s status=%s ms=%s attempt=%s headers=%s",
                    op_name,
                    response.status_code,
                    elapsed_ms,
                    attempt,
                    mask_headers(dict(response.request.headers)),
                )
                if response.status_code in {429} or response.status_code >= 500:
                    last_error = httpx.HTTPStatusError(
                        f"ikas {response.status_code}",
                        request=response.request,
                        response=response,
                    )
                    await _backoff(attempt)
                    continue
                if response.status_code >= 400:
                    response.raise_for_status()
                payload = response.json()
                if "errors" in payload:
                    logger.warning("ikas graphql op=%s has errors (body omitted)", op_name)
                return payload
            except httpx.TransportError as exc:
                last_error = exc
                logger.warning("ikas graphql op=%s transport error attempt=%s", op_name, attempt)
                await _backoff(attempt)
        assert last_error is not None
        raise last_error


async def _backoff(attempt: int) -> None:
    await asyncio.sleep(min(0.25 * (2 ** (attempt - 1)), 2.0))
