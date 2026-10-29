"""WasteLink Bali — Request ID middleware.

Generates a unique request/correlation ID for each incoming request,
attaches it to the request state and response headers.
"""

from __future__ import annotations

import re
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

# Validate client-provided request IDs: UUID format or short alphanumeric
_REQUEST_ID_PATTERN = re.compile(r"^[a-zA-Z0-9\-]{8,64}$")
REQUEST_ID_HEADER = "X-Request-ID"


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Attach a unique request_id to every request."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Accept client-provided ID only if it passes validation
        client_id = request.headers.get(REQUEST_ID_HEADER, "")
        if client_id and _REQUEST_ID_PATTERN.match(client_id):
            request_id = client_id
        else:
            request_id = str(uuid.uuid4())

        request.state.request_id = request_id

        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response
