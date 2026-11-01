"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  PlusCircle,
  Coins,
  Scale,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { IconContainer } from "@/components/ui/IconContainer";
import { StatusBadge, getStatusBadgeConfig } from "@/components/ui/StatusBadge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/auth-context";
import { collectionService } from "@/services/collection";
import { mockUsers, mockRequests } from "@/mocks/previewData";
import { formatWITA, formatWeightKg, formatPoints } from "@/tokens";
import { EcoGuideWidget } from "@/components/ai";

export default function UserDashboard() {
  const { user: authUser } = useAuth();
  const [requests, setRequests] = useState<any[]>(mockRequests);
  const [pointsBalance, setPointsBalance] = useState<number>(mockUsers.warga.pointsBalance);

  useEffect(() => {
    let isMounted = true;
    collectionService
      .getMyPickupRequests()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setRequests(data);
        }
      })
      .catch(() => {});

    collectionService
      .getPointsBalance()
      .then((res) => {
        if (isMounted && res && typeof res.current_balance === "number") {
          setPointsBalance(res.current_balance);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const latestRequest = requests[0] || null;
  const userName = authUser?.full_name || mockUsers.warga.name;
  const userBanjar =
    authUser?.preferred_active_role === "USER"
      ? "Banjar Sukawati Kaja"
      : mockUsers.warga.banjar;

  const totalKg = requests
    .filter(
      (r) =>
        (r.status as string) === "COMPLETED" ||
        (r.status as string) === "selesai" ||
        (r.status as string) === "COLLECTED"
    )
    .reduce(
      (acc, r) =>
        acc +
        (r.actual_weight_kg ||
          (r as any).actual_weight ||
          r.estimated_weight_kg ||
          (r as any).estimated_weight ||
          0),
      0
    );
  const totalKgDeposited = totalKg > 0 ? totalKg : mockUsers.warga.totalKgDeposited;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Om Swastiastu, ${userName}`}
        description={`${userBanjar} • Pantau setoran sampah terpilah dan kontribusi sirkular banjar Anda.`}
        actions={
          <Link href="/app/setoran/baru">
            <Button
              variant="primary"
              leftIcon={<PlusCircle className="w-4 h-4" />}
            >
              Setor Sampah Baru
            </Button>
          </Link>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Saldo WastePoints"
          value={formatPoints(pointsBalance)}
          hint="Dapat ditukarkan di pos komposting banjar"
          icon={<Coins className="w-5 h-5 text-amber-700" />}
        />
        <StatCard
          label="Total Sampah Disetor"
          value={formatWeightKg(totalKgDeposited)}
          hint="Tereduksi dari pembakaran & TPA"
          icon={<Scale className="w-5 h-5 text-emerald-800" />}
        />
        <StatCard
          label="Status Banjar Pilot"
          value="Sukawati Kaja"
          hint="Jadwal jemput: Senin, Rabu, Jumat"
          icon={<Calendar className="w-5 h-5 text-brand-700" />}
        />
      </div>

      {/* Active Deposit Card */}
      {latestRequest && (
        <Panel
          title="Setoran Aktif Terbaru"
          subtitle={`Nomor Permintaan: ${latestRequest.public_code || latestRequest.id}`}
          action={
            <Link href={`/app/setoran/${latestRequest.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                Lihat Detail Status
              </Button>
            </Link>
          }
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-canvas border-2 border-border hover:border-brand-800 hover:-translate-y-0.5 hover:shadow-interactive transition-all duration-fast ease-soft cursor-pointer">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <StatusBadge
                  variant={getStatusBadgeConfig(latestRequest.status).variant}
                  label={getStatusBadgeConfig(latestRequest.status).label}
                />
                <span className="text-xs font-semibold text-text-primary">
                  {latestRequest.category_name ||
                    (latestRequest.category_id
                      ? `Kategori #${latestRequest.category_id.slice(0, 8)}`
                      : "Sampah Terpilah")}
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                Estimasi Bobot:{" "}
                <strong>
                  {formatWeightKg(
                    latestRequest.estimated_weight_kg ||
                      latestRequest.estimated_weight ||
                      0
                  )}
                </strong>{" "}
                &bull; Alamat: {latestRequest.address || "Area Terdaftar"}
              </p>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <span className="text-[11px] uppercase tracking-wider text-text-secondary font-medium block">
                Jadwal Penjemputan
              </span>
              <span className="text-xs font-semibold text-brand-900 block mt-0.5">
                {formatWITA(latestRequest.scheduled_at || latestRequest.created_at)}
              </span>
            </div>
          </div>
        </Panel>
      )}

      {/* Recent Activity Table */}
      <Panel
        title="Riwayat Setoran Terbaru"
        subtitle="Daftar setoran sampah terpilah yang telah diajukan atau selesai ditimbang."
        action={
          <Link href="/app/setoran">
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              Lihat Semua Setoran
            </Button>
          </Link>
        }
      >
        <div className="divide-y divide-border -mx-5 -my-2">
          {requests.map((req) => {
            const badge = getStatusBadgeConfig(req.status);

            return (
              <div
                key={req.id}
                className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAFBF9] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <IconContainer variant="soft" size="md" className="shrink-0 mt-0.5">
                    <Package className="w-4 h-4 text-brand-900" />
                  </IconContainer>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-900">
                        {req.public_code || req.id}
                      </span>
                      <StatusBadge variant={badge.variant} label={badge.label} size="sm" />
                    </div>
                    <p className="text-xs font-medium text-text-primary mt-1">
                      {req.category_name ||
                        (req.category_id
                          ? `Kategori #${req.category_id.slice(0, 8)}`
                          : "Sampah Terpilah")}{" "}
                      &bull;{" "}
                      {req.pickup_type === "pickup" || req.service_mode === "PICKUP"
                        ? "Dijemput Petugas"
                        : "Antar ke Pos"}
                    </p>
                    <p className="text-[11px] text-text-secondary mt-0.5">
                      Dibuat pada {formatWITA(req.created_at)}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <div className="text-xs font-bold text-brand-900">
                    {req.actual_weight || req.actual_weight_kg
                      ? formatWeightKg(req.actual_weight || req.actual_weight_kg)
                      : `Est. ${formatWeightKg(
                          req.estimated_weight || req.estimated_weight_kg || 0
                        )}`}
                  </div>
                  {req.points_earned ? (
                    <div className="text-xs font-semibold text-[#276749]">
                      +{req.points_earned} WastePoints
                    </div>
                  ) : (
                    <div className="text-[11px] text-text-secondary">
                      Menunggu timbang
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Floating EcoGuide Assistant for Residents */}
      <EcoGuideWidget
        destinationName="Banjar Komunitas"
        initialPrompts={[
          "Bagaimana cara memilah botol kaca dan kaleng aluminium?",
          "Kapan jadwal penjemputan sampah anorganik minggu ini?",
          "Berapa WastePoints yang diperoleh dari 5 kg kardus?",
        ]}
      />
    </div>
  );
}
