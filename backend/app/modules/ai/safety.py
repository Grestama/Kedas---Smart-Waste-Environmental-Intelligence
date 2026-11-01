"""Kedas — AI Safety, Prompt Injection Defense, and PII Minimization."""

from __future__ import annotations

import re

# Signatures for prompt injection, jailbreaks, and system prompt override attempts
INJECTION_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)", re.IGNORECASE),
    re.compile(r"system\s+prompt\s*(reveal|show|dump|print)", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(dan|unrestricted|god\s+mode|jailbroken)", re.IGNORECASE),
    re.compile(r"(sudo|root)\s+mode", re.IGNORECASE),
    re.compile(r"override\s+safety\s+guidelines", re.IGNORECASE),
    re.compile(r"bypass\s+(authorization|rbac|filter)", re.IGNORECASE),
    re.compile(r"execute\s+(sql|command|script|eval)", re.IGNORECASE),
    re.compile(r"delete\s+from\s+[a-z_]+", re.IGNORECASE),
    re.compile(r"drop\s+table", re.IGNORECASE),
    re.compile(r"(system\s*:|assistant\s*:|human\s*:)\s*", re.IGNORECASE),
    re.compile(r"reveal\s+(system\s+prompt|instructions|secret|api\s*key)", re.IGNORECASE),
    re.compile(r"\b(bomb|explosive|weapon)\b", re.IGNORECASE),
]

# PII regex patterns for minimization
EMAIL_PATTERN = re.compile(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+")
PHONE_PATTERN = re.compile(r"(\+?[0-9]{2,4}[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,6})")


def check_prompt_injection(prompt: str) -> tuple[bool, str | None]:
    """Inspect user prompt for prompt injection and jailbreak attempts.

    Returns:
        (is_injected, reason)
    """
    if not prompt:
        return False, None

    for pattern in INJECTION_PATTERNS:
        match = pattern.search(prompt)
        if match:
            return True, f"Pola instruksi terlarang terdeteksi: '{match.group(0)}'"

    return False, None


def sanitize_retrieved_context(context: str) -> str:
    """Sanitize retrieved knowledge document chunk before feeding to LLM.

    Treats retrieved text as untrusted content, neutralizing any embedded
    injection instructions or script tags.
    """
    if not context:
        return ""

    # Strip dangerous HTML/script tags
    sanitized = re.sub(r"<\s*script[^>]*>.*?<\s*/\s*script\s*>", "", context, flags=re.DOTALL | re.IGNORECASE)
    sanitized = re.sub(r"<\s*iframe[^>]*>.*?<\s*/\s*iframe\s*>", "", sanitized, flags=re.DOTALL | re.IGNORECASE)

    # Neutralize prompt escape attempts within document chunks
    sanitized = sanitized.replace("```system", "'''system")
    sanitized = sanitized.replace("```instruction", "'''instruction")

    return sanitized


def redact_pii(text: str) -> str:
    """Redact email addresses and phone numbers to ensure PII minimization in logs."""
    if not text:
        return ""

    redacted = EMAIL_PATTERN.sub("[REDACTED_EMAIL]", text)
    redacted = PHONE_PATTERN.sub("[REDACTED_PHONE]", redacted)
    return redacted
