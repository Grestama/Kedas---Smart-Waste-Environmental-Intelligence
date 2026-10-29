"""Unit tests for pagination helpers and bound limits."""

import pytest
from pydantic import ValidationError

from app.common.pagination import (
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE,
    PaginatedResponse,
    PaginationParams,
)


def test_pagination_defaults():
    params = PaginationParams()
    assert params.page == 1
    assert params.page_size == DEFAULT_PAGE_SIZE
    assert params.offset == 0


def test_pagination_offset_calculation():
    params = PaginationParams(page=3, page_size=15)
    assert params.offset == 30


def test_pagination_max_limit_enforced():
    """Requesting more than MAX_PAGE_SIZE triggers validation error."""
    with pytest.raises(ValidationError):
        PaginationParams(page=1, page_size=MAX_PAGE_SIZE + 1)


def test_paginated_response_helper():
    items = [{"id": 1}, {"id": 2}]
    res = PaginatedResponse.create(items=items, total=50, page=1, page_size=10)
    assert res.total == 50
    assert res.page == 1
    assert res.page_size == 10
    assert res.total_pages == 5
    assert len(res.items) == 2
