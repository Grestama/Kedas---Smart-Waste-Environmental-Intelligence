"""Automated guard for Alembic migration integrity, length constraints, and graph continuity."""

import os

from alembic.config import Config
from alembic.script import ScriptDirectory


def test_alembic_revision_lengths_and_uniqueness():
    """Ensure all migration revisions satisfy Alembic's default 32-character limit and graph integrity."""
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    ini_path = os.path.join(backend_dir, "alembic.ini")
    cfg = Config(ini_path)
    cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))

    script_dir = ScriptDirectory.from_config(cfg)
    revisions = list(script_dir.walk_revisions())

    assert len(revisions) > 0, "No Alembic revisions found in repository."

    rev_ids = set()
    for rev in revisions:
        # 1. Uniqueness check
        assert rev.revision not in rev_ids, f"Duplicate revision ID detected: {rev.revision}"
        rev_ids.add(rev.revision)

        # 2. Length check (strict <= 32 chars for standard alembic_version compatibility)
        assert len(rev.revision) <= 32, (
            f"Revision ID '{rev.revision}' exceeds 32 characters ({len(rev.revision)} chars). "
            f"This causes StringDataRightTruncation in standard PostgreSQL alembic_version tables."
        )

        # 3. Down-revision length check if present
        if rev.down_revision:
            if isinstance(rev.down_revision, tuple):
                for down in rev.down_revision:
                    assert len(down) <= 32, f"Down revision '{down}' exceeds 32 characters."
            else:
                assert len(rev.down_revision) <= 32, (
                    f"Down revision '{rev.down_revision}' exceeds 32 characters."
                )

    # 4. Single-head assertion
    heads = script_dir.get_heads()
    assert len(heads) == 1, f"Expected exactly 1 migration head, but found {len(heads)}: {heads}"
