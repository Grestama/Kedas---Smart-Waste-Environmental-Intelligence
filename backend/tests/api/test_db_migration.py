"""Tests for database migrations (Alembic upgrade / downgrade cycle)."""

import contextlib
import os
import tempfile

from alembic.config import Config
from sqlalchemy import create_engine, inspect

from alembic import command


def test_alembic_migration_upgrade_and_downgrade():
    """Verify that Alembic migrations run cleanly from an empty database and can rollback."""
    # Create a temp file path and close it so SQLite can safely access it on Windows
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    try:
        sqlite_url = f"sqlite:///{db_path}"

        # Setup Alembic Config pointing to the test DB
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
        ini_path = os.path.join(backend_dir, "alembic.ini")
        alembic_cfg = Config(ini_path)
        alembic_cfg.set_main_option("sqlalchemy.url", sqlite_url)
        alembic_cfg.set_main_option("script_location", os.path.join(backend_dir, "alembic"))

        # 1. Run upgrade head
        command.upgrade(alembic_cfg, "head")

        # 2. Inspect created tables
        engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        try:
            inspector = inspect(engine)
            table_names = inspector.get_table_names()
            assert "audit_logs" in table_names
            assert "alembic_version" in table_names

            # Verify audit_logs columns
            columns = {c["name"]: c for c in inspector.get_columns("audit_logs")}
            assert "id" in columns
            assert "actor_user_id" in columns
            assert "action" in columns
            assert "entity_type" in columns
            assert "created_at" in columns
        finally:
            engine.dispose()

        # 3. Test rollback to base
        command.downgrade(alembic_cfg, "base")

        engine2 = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        try:
            inspector_after = inspect(engine2)
            tables_after = inspector_after.get_table_names()
            assert "audit_logs" not in tables_after
        finally:
            engine2.dispose()

        # 4. Re-upgrade to ensure repeatability
        command.upgrade(alembic_cfg, "head")

        engine3 = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        try:
            inspector_final = inspect(engine3)
            assert "audit_logs" in inspector_final.get_table_names()
        finally:
            engine3.dispose()

    finally:
        if os.path.exists(db_path):
            with contextlib.suppress(OSError):
                os.remove(db_path)
