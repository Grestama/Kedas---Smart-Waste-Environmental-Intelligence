"""API Tests for User Notifications, State Changes, and Isolation."""

from __future__ import annotations


def _register(client, email, name):
    resp = client.post(
        "/api/v1/auth/register",
        json={"full_name": name, "email": email, "password": "password_123"},
    )
    assert resp.status_code == 201
    return resp.json()["session_token"], resp.json()["user"]


def test_notifications_lifecycle_and_isolation(client, db_session):
    token_a, user_a = _register(client, "notif_a@bali.id", "User A")
    headers_a = {"Authorization": f"Bearer {token_a}"}

    token_b, user_b = _register(client, "notif_b@bali.id", "User B")
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Seed notification for user A
    from app.modules.notification.models import Notification

    n1 = Notification(
        user_id=user_a["id"],
        title="Penjemputan Dijadwalkan",
        body="Petugas sedang dalam perjalanan ke banjar.",
        event_type="PICKUP_SCHEDULED",
        reference_id="ref-123",
    )
    n2 = Notification(
        user_id=user_a["id"],
        title="Poin Diterima",
        body="+100 WastePoints berhasil masuk ke akun Anda.",
        event_type="POINTS_EARNED",
        reference_id="ref-456",
    )
    db_session.add_all([n1, n2])
    db_session.commit()

    # User A lists notifications
    list_a = client.get("/api/v1/notifications", headers=headers_a).json()
    assert len(list_a) == 2
    assert list_a[0]["is_read"] is False

    # User B lists notifications -> MUST BE EMPTY (Strict IDOR Isolation)
    list_b = client.get("/api/v1/notifications", headers=headers_b).json()
    assert len(list_b) == 0

    # User A marks first notification as read
    patch_resp = client.patch(f"/api/v1/notifications/{n1.id}/read", headers=headers_a)
    assert patch_resp.status_code == 200
    assert patch_resp.json()["is_read"] is True

    # User B attempts to mark User A's notification as read -> MUST FAIL with 404
    hack_resp = client.patch(f"/api/v1/notifications/{n1.id}/read", headers=headers_b)
    assert hack_resp.status_code == 404

    # User A marks all as read
    all_resp = client.post("/api/v1/notifications/read-all", headers=headers_a)
    assert all_resp.status_code == 200

    unread_a = client.get("/api/v1/notifications?unread_only=true", headers=headers_a).json()
    assert len(unread_a) == 0
