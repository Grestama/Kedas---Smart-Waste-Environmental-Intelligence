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


def test_boolean_columns_use_dialect_agnostic_defaults():
    """Ensure no Boolean column uses raw integer literals (0, 1) as server defaults.

    PostgreSQL enforces strict boolean type checking (DatatypeMismatch error if 0 or 1 is used),
    whereas SQLite tolerates integers. All migrations must use sa.true() or sa.false().
    """
    import glob

    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
    versions_dir = os.path.join(backend_dir, "alembic", "versions")
    migration_files = glob.glob(os.path.join(versions_dir, "*.py"))

    invalid_defaults = [
        'server_default="0"',
        'server_default="1"',
        "server_default='0'",
        "server_default='1'",
        'server_default=sa.text("0")',
        'server_default=sa.text("1")',
        "server_default=sa.text('0')",
        "server_default=sa.text('1')",
    ]

    for file_path in migration_files:
        with open(file_path, encoding="utf-8") as f:
            content = f.read()

        for line_num, line in enumerate(content.splitlines(), start=1):
            if "sa.Boolean()" in line:
                for inv in invalid_defaults:
                    assert inv not in line, (
                        f"Found prohibited boolean server default '{inv}' in "
                        f"{os.path.basename(file_path)}:{line_num}: {line.strip()}. "
                        f"Use sa.false() or sa.true() for PostgreSQL & SQLite compatibility."
                    )
