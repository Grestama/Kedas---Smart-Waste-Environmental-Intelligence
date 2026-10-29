import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { colors, spacing, touchTargets, typography, formatWitaDate } from "@/tokens";
import { PickupRequest, PickupStatus } from "@/types";

interface TrackingDetailScreenProps {
  pickupId: string;
  onBack: () => void;
}

const LIFECYCLE_STEPS: { key: PickupStatus; label: string; desc: string }[] = [
  {
    key: "PENDING_ASSIGNMENT",
    label: "Permohonan Terdaftar",
    desc: "Menunggu penugasan petugas armada trike TPS3R Sukawati.",
  },
  {
    key: "ACCEPTED",
    label: "Diterima Petugas",
    desc: "Petugas telah menerima tugas dan mengonfirmasi rute.",
  },
  {
    key: "EN_ROUTE",
    label: "Petugas Menuju Lokasi",
    desc: "Armada trike sedang dalam perjalanan ke banjar Anda.",
  },
  {
    key: "ARRIVED",
    label: "Tiba di Lokasi",
    desc: "Petugas telah tiba di titik penjemputan.",
  },
  {
    key: "INSPECTION",
    label: "Pemeriksaan Kualitas",
    desc: "Pemeriksaan tingkat kebersihan dan pemilahan material.",
  },
  {
    key: "COLLECTED",
    label: "Timbang & Angkut",
    desc: "Penimbangan digital aktual dan pemuatan ke armada.",
  },
  {
    key: "COMPLETED",
    label: "Selesai & Sah",
    desc: "WastePoints resmi telah diterbitkan oleh sistem backend.",
  },
];

// Helper to calculate step index
function getStepIndex(status: PickupStatus): number {
  switch (status) {
    case "SUBMITTED":
    case "PENDING_ASSIGNMENT":
      return 0;
    case "ACCEPTED":
      return 1;
    case "EN_ROUTE":
      return 2;
    case "ARRIVED":
      return 3;
    case "INSPECTION":
      return 4;
    case "WEIGHED":
    case "COLLECTED":
      return 5;
    case "COMPLETED":
      return 6;
    case "CANCELLED":
    case "REJECTED":
      return -1;
    default:
      return 0;
  }
}

export function TrackingDetailScreen({
  pickupId,
  onBack,
}: TrackingDetailScreenProps) {
  // Mock pickup detail (in real app, fetched by pickupId)
  const [pickup, setPickup] = useState<PickupRequest>({
    id: pickupId,
    public_code: "WL-2026-SKW-004",
    reporter_user_id: "usr_warga_01",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik",
    category_name: "Plastik PET Bening Bersih",
    address_id: "addr_01",
    address_display: "Jl. Raya Batuan No. 14, Banjar Kaja Sukawati",
    slot_id: "slot_01",
    slot_display: "Hari Ini, 09:00 - 10:30 WITA",
    status: "EN_ROUTE",
    assigned_collector_id: "usr_staff_01",
    estimated_weight_kg: 5.5,
    actual_weight_kg: null,
    points_earned: null,
    notes: "3 kantong di depan pagar samping pura keluarga",
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  });

  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const currentStepIdx = getStepIndex(pickup.status);
  const isCancelled = pickup.status === "CANCELLED" || pickup.status === "REJECTED";
  const canCancel =
    pickup.status === "SUBMITTED" ||
    pickup.status === "PENDING_ASSIGNMENT" ||
    pickup.status === "ACCEPTED";

  const handleCancelPickup = () => {
    Alert.alert(
      "Batalkan Penjemputan?",
      "Apakah Anda yakin ingin membatalkan permohonan setoran sampah ini?",
      [
        { text: "Kembali", style: "cancel" },
        {
          text: "Ya, Batalkan",
          style: "destructive",
          onPress: () => {
            setIsCancelling(true);
            setTimeout(() => {
              setPickup((prev) => ({
                ...prev,
                status: "CANCELLED",
                notes: `${prev.notes || ""} [Dibatalkan oleh Warga]`,
              }));
              setIsCancelling(false);
              Alert.alert(
                "Permohonan Dibatalkan",
                "Permohonan setoran sampah ini telah resmi dibatalkan di server."
              );
            }, 600);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          accessibilityLabel="Kembali ke aktivitas"
        >
          <Text style={styles.backBtnText}>&lt; Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pelacakan Setoran</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* Ticket Header Card */}
        <View style={styles.ticketCard}>
          <View style={styles.ticketTopRow}>
            <View>
              <Text style={styles.ticketCode}>{pickup.public_code}</Text>
              <Text style={styles.ticketDate}>
                Diajukan: {formatWitaDate(pickup.created_at)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                isCancelled ? styles.statusBadgeCancelled : styles.statusBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  isCancelled ? styles.statusTextCancelled : styles.statusTextActive,
                ]}
              >
                {isCancelled ? "Dibatalkan" : pickup.status}
              </Text>
            </View>
          </View>

          <View style={styles.ticketDivider} />

          <Text style={styles.itemCategory}>{pickup.category_name}</Text>
          <Text style={styles.itemAddress}>{pickup.address_display}</Text>
          <Text style={styles.itemSlot}>Jadwal: {pickup.slot_display}</Text>
          {pickup.notes ? (
            <Text style={styles.itemNotes}>Catatan: {pickup.notes}</Text>
          ) : null}
        </View>

        {/* Assigned Collector Card */}
        {pickup.assigned_collector_id && !isCancelled && (
          <View style={styles.collectorCard}>
            <Text style={styles.collectorCardTitle}>Petugas Armada Lapangan</Text>
            <Text style={styles.collectorName}>I Made Suartana</Text>
            <Text style={styles.collectorMeta}>
              Armada Trike TPS3R Sukawati • Unit 02
            </Text>
            <Text style={styles.collectorPhone}>Kontak: 0819-3456-7890</Text>
          </View>
        )}

        {/* Stepper Timeline */}
        <View style={styles.stepperContainer}>
          <Text style={styles.sectionHeading}>Alur Perjalanan & Verifikasi</Text>

          {isCancelled ? (
            <View style={styles.cancelledBox}>
              <Text style={styles.cancelledText}>
                Permohonan setoran ini telah dibatalkan. Armada tidak akan menuju lokasi.
              </Text>
            </View>
          ) : (
            LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isUpcoming = idx > currentStepIdx;

              return (
                <View key={step.key} style={styles.stepRow}>
                  {/* Step Indicator & Line */}
                  <View style={styles.indicatorCol}>
                    <View
                      style={[
                        styles.circleIndicator,
                        isPast && styles.circlePast,
                        isCurrent && styles.circleCurrent,
                        isUpcoming && styles.circleUpcoming,
                      ]}
                    >
                      <Text
                        style={[
                          styles.indicatorNumber,
                          isCurrent && styles.indicatorNumberCurrent,
                        ]}
                      >
                        {isPast ? "✓" : idx + 1}
                      </Text>
                    </View>
                    {idx < LIFECYCLE_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.stepLine,
                          idx < currentStepIdx && styles.stepLineActive,
                        ]}
                      />
                    )}
                  </View>

                  {/* Step Description */}
                  <View style={styles.stepContentCol}>
                    <Text
                      style={[
                        styles.stepLabel,
                        isCurrent && styles.stepLabelCurrent,
                        isUpcoming && styles.stepLabelUpcoming,
                      ]}
                    >
                      {step.label}
                    </Text>
                    <Text style={styles.stepDesc}>{step.desc}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Official Weigh-in & Inspection Results */}
        {pickup.status === "COMPLETED" && (
          <View style={styles.resultCard}>
            <Text style={styles.resultCardTitle}>Hasil Timbang & Verifikasi Sah</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Berat Kotor (Gross)</Text>
              <Text style={styles.resultVal}>5.80 kg</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Berat Wadah (Tare)</Text>
              <Text style={styles.resultVal}>0.30 kg</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Berat Bersih Aktual</Text>
              <Text style={styles.resultValBold}>5.50 kg</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Tingkat Kebersihan</Text>
              <Text style={styles.resultValBadge}>Grade A (Sangat Bersih)</Text>
            </View>
            <View style={styles.pointsEarnedBox}>
              <Text style={styles.pointsEarnedLabel}>WastePoints Diterbitkan</Text>
              <Text style={styles.pointsEarnedValue}>+410 Poin</Text>
            </View>
          </View>
        )}

        {/* Cancel Button if eligible */}
        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={handleCancelPickup}
            disabled={isCancelling}
            accessibilityLabel="Batalkan permohonan setoran ini"
          >
            <Text style={styles.cancelBtnText}>
              {isCancelling ? "Memproses Pembatalan..." : "Batalkan Permohonan Ini"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    minHeight: touchTargets.minButtonHeight,
  },
  backBtn: {
    minHeight: touchTargets.minButtonHeight,
    minWidth: touchTargets.minButtonWidth,
    justifyContent: "center",
  },
  backBtnText: {
    ...typography.body,
    color: colors.brand700,
    fontWeight: "700",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerRightSpacer: {
    width: 48,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  ticketCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  ticketTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ticketCode: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  ticketDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
  },
  statusBadgeCancelled: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
  },
  statusTextActive: {
    color: colors.infoText,
  },
  statusTextCancelled: {
    color: colors.dangerText,
  },
  ticketDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.md,
  },
  itemCategory: {
    ...typography.body,
    fontWeight: "700",
    color: colors.brand900,
  },
  itemAddress: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  itemSlot: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
    marginTop: 2,
  },
  itemNotes: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    fontStyle: "italic",
  },
  collectorCard: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand200,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  collectorCardTitle: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.brand900,
    textTransform: "uppercase",
  },
  collectorName: {
    ...typography.body,
    fontWeight: "700",
    color: colors.brand900,
    marginTop: 2,
  },
  collectorMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  collectorPhone: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "600",
    marginTop: 4,
  },
  stepperContainer: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 56,
  },
  indicatorCol: {
    alignItems: "center",
    width: 32,
    marginRight: spacing.md,
  },
  circleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  circlePast: {
    backgroundColor: colors.brand700,
    borderColor: colors.brand700,
  },
  circleCurrent: {
    backgroundColor: colors.brand900,
    borderColor: colors.brand900,
  },
  circleUpcoming: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  indicatorNumber: {
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 11,
  },
  indicatorNumberCurrent: {
    color: colors.textInverse,
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  stepLineActive: {
    backgroundColor: colors.brand700,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: spacing.lg,
  },
  stepLabel: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  stepLabelCurrent: {
    color: colors.brand900,
  },
  stepLabelUpcoming: {
    color: colors.textMuted,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  cancelledBox: {
    backgroundColor: colors.dangerBg,
    padding: spacing.md,
    borderRadius: 8,
  },
  cancelledText: {
    ...typography.body,
    color: colors.dangerText,
    fontWeight: "600",
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.successBorder,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  resultCardTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.successText,
    marginBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  resultLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  resultVal: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  resultValBold: {
    ...typography.body,
    color: colors.brand900,
    fontWeight: "700",
  },
  resultValBadge: {
    ...typography.caption,
    color: colors.successText,
    fontWeight: "700",
  },
  pointsEarnedBox: {
    backgroundColor: colors.successBg,
    borderRadius: 8,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  pointsEarnedLabel: {
    ...typography.body,
    fontWeight: "700",
    color: colors.successText,
  },
  pointsEarnedValue: {
    ...typography.h3,
    color: colors.successText,
  },
  cancelBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  cancelBtnText: {
    ...typography.body,
    color: colors.dangerText,
    fontWeight: "700",
  },
});
