"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  ShieldAlert,
  UserCheck,
  UserX,
  Mail,
  Phone,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Textarea";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useToast } from "@/components/ui/Toast";
import { fetchAdminUsers, updateUserStatus } from "@/services/admin";
import { UserAdminView } from "@/types/admin";

export default function AdminUsersPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserAdminView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Suspension modal
  const [suspendingUser, setSuspendingUser] = useState<UserAdminView | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchAdminUsers(
        roleFilter === "ALL" ? undefined : roleFilter
      );
      setUsers(res.items);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat daftar pengguna."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleToggleStatus = async (user: UserAdminView) => {
    if (user.status === "ACTIVE") {
      setSuspendingUser(user);
      setSuspensionReason("");
    } else {
      // Re-activate
      setIsSubmittingStatus(true);
      try {
        await updateUserStatus(user.id, "ACTIVE", "Dipulihkan oleh Admin Banjar");
        showToast("success", `Akun ${user.name} berhasil diaktifkan kembali.`);
        await loadUsers();
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Gagal mengaktifkan akun.";
        showToast("error", msg);
      } finally {
        setIsSubmittingStatus(false);
      }
    }
  };

  const handleConfirmSuspension = async () => {
    if (!suspendingUser) return;
    if (!suspensionReason.trim()) {
      showToast("error", "Alasan penangguhan akun wajib diisi.");
      return;
    }

    setIsSubmittingStatus(true);
    try {
      await updateUserStatus(suspendingUser.id, "SUSPENDED", suspensionReason.trim());
      showToast(
        "success",
        `Akun ${suspendingUser.name} telah ditangguhkan. Sesi login telah dicabut.`
      );
      setSuspendingUser(null);
      setSuspensionReason("");
      await loadUsers();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Gagal menangguhkan akun.";
      showToast("error", msg);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Pengguna & Otoritas Akun"
        description="Kelola akun warga, petugas sampah, dan operator admin banjar. Penangguhan akun akan mencabut sesi aktif secara instan."
        breadcrumbs={[
          { label: "Admin", href: "/admin" },
          { label: "Pengguna", active: true },
        ]}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={loadUsers}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
          >
            Segarkan
          </Button>
        }
      />

      {/* Role Filter & Search Toolbar */}
      <Panel className="p-3 bg-surface border border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Cari nama, email, atau telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-canvas border border-border rounded-lg text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-700"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "USER", "COLLECTOR", "ADMIN"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  roleFilter === role
                    ? "bg-brand-900 text-white"
                    : "bg-surface text-text-secondary hover:bg-canvas border border-border"
                }`}
              >
                {role === "ALL" ? "Semua Peran" : role}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {/* Users List */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-20 rounded-xl" />
          <LoadingSkeleton className="h-20 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState title="Gagal Memuat Pengguna" description={error} onRetry={loadUsers} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="Tidak Ada Pengguna"
          description="Tidak ditemukan data pengguna yang cocok dengan kriteria pencarian."
        />
      ) : (
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <Panel
              key={user.id}
              className={`p-4 bg-surface border transition-colors shadow-xs ${
                user.status === "SUSPENDED"
                  ? "border-[#F5C6BF] bg-[#FDF8F7]"
                  : "border-border"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-900 border border-brand-200">
                      {user.id}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-900 uppercase">
                      {user.roles.join(", ")}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                        user.status === "ACTIVE"
                          ? "bg-[#E7F4EA] text-[#276749]"
                          : user.status === "SUSPENDED"
                          ? "bg-[#FBEAE7] text-[#A43F35]"
                          : "bg-[#FFF4D9] text-[#98631C]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-primary">
                    {user.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      {user.phone}
                    </span>
                    {user.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-text-muted" />
                        {user.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <Button
                    variant={user.status === "SUSPENDED" ? "primary" : "danger"}
                    size="sm"
                    disabled={isSubmittingStatus}
                    onClick={() => handleToggleStatus(user)}
                    leftIcon={
                      user.status === "SUSPENDED" ? (
                        <UserCheck className="w-3.5 h-3.5" />
                      ) : (
                        <UserX className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {user.status === "SUSPENDED" ? "Pulihkan Akun" : "Tangguhkan (Suspend)"}
                  </Button>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* Suspension Modal */}
      <Modal
        isOpen={Boolean(suspendingUser)}
        onClose={() => {
          if (!isSubmittingStatus) {
            setSuspendingUser(null);
            setSuspensionReason("");
          }
        }}
        title="Tangguhkan Akun Pengguna (Suspension)"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#FBEAE7] border border-[#F5C6BF] rounded-lg text-[#A43F35] text-xs">
            <p className="font-bold">Konsekuensi Penangguhan Akun:</p>
            <p>
              Pengguna <strong>{suspendingUser?.name}</strong> akan kehilangan akses ke seluruh workspace dan sesi login akan segera dibatalkan oleh server.
            </p>
          </div>

          <Textarea
            label="Alasan Penangguhan Akun *"
            placeholder="Contoh: Terdeteksi pelanggaran berulang menyerahkan limbah B3/medis tanpa izin, akun disalahgunakan..."
            value={suspensionReason}
            onChange={(e) => setSuspensionReason(e.target.value)}
            rows={3}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmittingStatus}
              onClick={() => {
                setSuspendingUser(null);
                setSuspensionReason("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={isSubmittingStatus || !suspensionReason.trim()}
              onClick={handleConfirmSuspension}
            >
              {isSubmittingStatus ? "Menangguhkan..." : "Konfirmasi Tangguhkan"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
