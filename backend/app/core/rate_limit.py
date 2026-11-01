"""WasteLink Bali — Layered Rate Limiting and Brute-Force Abuse Mitigation.

Provides:
- Trusted-proxy aware Client IP resolution (prevents X-Forwarded-For spoofing).
- Privacy-preserving HMAC-keyed account identifier hashing.
- Sliding-window rate limiting with progressive backoff and temporary cooldown.
- Structured RateLimitError with Retry-After header.
"""

from __future__ import annotations

import hashlib
import hmac
import ipaddress
import logging
import threading
import time
from dataclasses import dataclass
from typing import Any

from starlette.requests import Request

from app.core.config import get_settings
from app.core.errors import RateLimitError

logger = logging.getLogger("wastelink.security.rate_limit")

# Default trusted proxy CIDRs (loopback and common container/proxy networks)
DEFAULT_TRUSTED_PROXIES = [
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.168.0.0/16"),
]


@dataclass(frozen=True)
class RateLimitPolicy:
    """Configuration for a specific rate-limiting policy."""

    name: str
    limit: int
    window_seconds: int
    block_duration_seconds: int = 0


# Baseline Authentication & Abuse Mitigation Policies
POLICY_AUTH_LOGIN_ACCOUNT = RateLimitPolicy(
    name="auth_login_account",
    limit=5,
    window_seconds=300,  # 5 attempts per 5 minutes per account
    block_duration_seconds=300,
)

POLICY_AUTH_LOGIN_IP = RateLimitPolicy(
    name="auth_login_ip",
    limit=20,
    window_seconds=300,  # 20 attempts per 5 minutes per IP
    block_duration_seconds=300,
)

POLICY_AUTH_REGISTER_IP = RateLimitPolicy(
    name="auth_register_ip",
    limit=5,
    window_seconds=900,  # 5 registrations per 15 minutes per IP
    block_duration_seconds=900,
)


def is_ip_trusted(ip_str: str) -> bool:
    """Check if an IP address belongs to the trusted proxy network."""
    if not ip_str or ip_str in ("testclient", "localhost", "testserver"):
        return True
    try:
        addr = ipaddress.ip_address(ip_str)
        return any(addr in network for network in DEFAULT_TRUSTED_PROXIES)
    except ValueError:
        return False


def get_client_ip(request: Request) -> str:
    """Resolve genuine client IP address resisting header spoofing.

    If request originates directly from an untrusted client, request.client.host is used,
    ignoring any spoofed X-Forwarded-For headers.
    If originating through a verified trusted proxy, the rightmost untrusted IP in
    the X-Forwarded-For chain is returned.
    """
    direct_ip = request.client.host if request.client else "127.0.0.1"

    if not is_ip_trusted(direct_ip):
        # Direct connection from untrusted source: do not trust forwarding headers
        return direct_ip

    forwarded_for = request.headers.get("x-forwarded-for")
    if not forwarded_for:
        return direct_ip

    # Parse X-Forwarded-For chain: client, proxy1, proxy2...
    ips = [ip.strip() for ip in forwarded_for.split(",") if ip.strip()]
    if not ips:
        return direct_ip

    # Walk from right to left to find the first untrusted IP
    for candidate in reversed(ips):
        if not is_ip_trusted(candidate):
            return candidate

    return ips[0]


def get_account_key(identifier: str) -> str:
    """Generate privacy-preserving, non-reversible key for account throttling."""
    clean_id = identifier.strip().lower()
    settings = get_settings()
    secret = settings.session_secret_key.encode("utf-8")
    return hmac.new(secret, clean_id.encode("utf-8"), hashlib.sha256).hexdigest()[:16]


class InMemoryRateLimitStore:
    """Thread-safe in-memory sliding-window rate limit store with auto-expiry."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._records: dict[str, list[float]] = {}
        self._blocked_until: dict[str, float] = {}
        self._last_cleanup = time.monotonic()

    def check_and_record(
        self,
        key: str,
        limit: int,
        window_seconds: int,
        block_duration_seconds: int = 0,
        record_hit: bool = True,
    ) -> tuple[bool, int, int]:
        """Check whether key is within limit.

        Returns:
            (is_allowed: bool, retry_after: int, remaining: int)
        """
        now = time.monotonic()

        with self._lock:
            self._maybe_cleanup(now)

            # Check if currently in cooldown block
            blocked_until = self._blocked_until.get(key, 0.0)
            if now < blocked_until:
                retry_after = max(1, int(blocked_until - now))
                return False, retry_after, 0

            # Prune timestamps outside current window
            cutoff = now - window_seconds
            timestamps = [t for t in self._records.get(key, []) if t > cutoff]

            if len(timestamps) >= limit:
                # Limit exceeded: trigger cooldown
                block_secs = block_duration_seconds or window_seconds
                self._blocked_until[key] = now + block_secs
                self._records[key] = timestamps
                return False, block_secs, 0

            if record_hit:
                timestamps.append(now)
                self._records[key] = timestamps

            remaining = max(0, limit - len(timestamps))
            return True, 0, remaining

    def reset(self, key: str) -> None:
        """Reset rate limit history for a key upon successful authentication."""
        with self._lock:
            self._records.pop(key, None)
            self._blocked_until.pop(key, None)

    def _maybe_cleanup(self, now: float) -> None:
        if now - self._last_cleanup < 60.0:
            return
        self._last_cleanup = now
        stale_cutoff = now - 3600.0  # Remove entries older than 1 hour

        keys_to_remove = []
        for k, timestamps in self._records.items():
            valid_ts = [t for t in timestamps if t > stale_cutoff]
            if not valid_ts:
                keys_to_remove.append(k)
            else:
                self._records[k] = valid_ts

        for k in keys_to_remove:
            self._records.pop(k, None)

        stale_blocks = [k for k, until in self._blocked_until.items() if until < now]
        for k in stale_blocks:
            self._blocked_until.pop(k, None)


# Global rate limiter instance
_global_store = InMemoryRateLimitStore()


def should_bypass_rate_limit(request: Request) -> bool:
    """Check if request should bypass rate limiting (e.g. during automated test suites).

    In production/staging/local, this always returns False (rate limiting fully active).
    In test environment, bypasses rate limiting unless explicitly testing with header
    'x-test-enforce-rate-limit: true'.
    """
    settings = get_settings()
    if settings.app_env.value == "test":
        if request.headers.get("x-test-enforce-rate-limit") == "true":
            return False
        return True
    return False


class RateLimiter:
    """Application-level rate limiter coordinator."""

    def __init__(self, store: InMemoryRateLimitStore | None = None) -> None:
        self.store = store or _global_store

    def check_rate_limit(
        self,
        key: str,
        policy: RateLimitPolicy,
        record_hit: bool = True,
        request: Request | None = None,
    ) -> None:
        """Check rate limit for given key and raise RateLimitError if exceeded."""
        if request and should_bypass_rate_limit(request):
            return

        full_key = f"{policy.name}:{key}"
        is_allowed, retry_after, remaining = self.store.check_and_record(
            key=full_key,
            limit=policy.limit,
            window_seconds=policy.window_seconds,
            block_duration_seconds=policy.block_duration_seconds,
            record_hit=record_hit,
        )

        if not is_allowed:
            logger.warning(
                "Rate limit exceeded [policy=%s, key_hash=%s, retry_after=%ds]",
                policy.name,
                key[:8],
                retry_after,
            )
            raise RateLimitError(
                message=(
                    f"Terlalu banyak permintaan untuk sementara waktu. "
                    f"Silakan coba lagi dalam {retry_after} detik."
                ),
                retry_after=retry_after,
            )

    def check_login_rate_limits(self, request: Request, identifier: str) -> None:
        """Enforce rate limits on login endpoint across IP and Account dimensions."""
        if should_bypass_rate_limit(request):
            return

        client_ip = get_client_ip(request)
        account_key = get_account_key(identifier)

        # 1. Check IP rate limit (read-only pre-check, hit recorded on failure)
        self.check_rate_limit(
            client_ip, POLICY_AUTH_LOGIN_IP, record_hit=False, request=request
        )

        # 2. Check Account rate limit (read-only pre-check, hit recorded on failure)
        self.check_rate_limit(
            account_key, POLICY_AUTH_LOGIN_ACCOUNT, record_hit=False, request=request
        )

    def record_login_failure(self, request: Request, identifier: str) -> None:
        """Increment failure counters for IP and Account upon failed login."""
        if should_bypass_rate_limit(request):
            return

        client_ip = get_client_ip(request)
        account_key = get_account_key(identifier)

        self.store.check_and_record(
            key=f"{POLICY_AUTH_LOGIN_IP.name}:{client_ip}",
            limit=POLICY_AUTH_LOGIN_IP.limit,
            window_seconds=POLICY_AUTH_LOGIN_IP.window_seconds,
            block_duration_seconds=POLICY_AUTH_LOGIN_IP.block_duration_seconds,
            record_hit=True,
        )
        self.store.check_and_record(
            key=f"{POLICY_AUTH_LOGIN_ACCOUNT.name}:{account_key}",
            limit=POLICY_AUTH_LOGIN_ACCOUNT.limit,
            window_seconds=POLICY_AUTH_LOGIN_ACCOUNT.window_seconds,
            block_duration_seconds=POLICY_AUTH_LOGIN_ACCOUNT.block_duration_seconds,
            record_hit=True,
        )

    def record_login_success(self, request: Request, identifier: str) -> None:
        """Clear account failure history on successful login."""
        account_key = get_account_key(identifier)
        self.store.reset(f"{POLICY_AUTH_LOGIN_ACCOUNT.name}:{account_key}")


rate_limiter = RateLimiter()
