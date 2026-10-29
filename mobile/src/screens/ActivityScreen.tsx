import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { colors, spacing, touchTargets, typography, formatWitaDate } from "@/tokens";
import { PickupRequest, OfflinePickupDraft, PickupStatus } from "@/types";
import { OfflineDraftManager } from "@/lib/offline-draft";

interface ActivityScreenProps {
  onSelectPickup: (pickupId: string) => void;
  onNavigateToSetor: () => void;
}

type FilterTab = "SEMUA" | "AKTIF" | "SELESAI" | "DRAF";

const MOCK_ONLINE_PICKUPS: PickupRequest[] = [
  {
    id: "pick_001",
    public_code: "WL-2026-SKW-004",
    reporter_user_id: "usr_warga_01",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik",
    category_name: "Plastik PET Bening Bersih",
    address_id: "addr_01",
    address_display: "Jl. Raya Batuan No. 14, Banjar Kaja",
    slot_id: "slot_01",
    slot_display: "Hari Ini, 09:00 - 10:30 WITA",
    status: "EN_ROUTE",
    assigned_collector_id: "usr_staff_01",
    estimated_weight_kg: 5.5,
    notes: "3 kantong di depan pagar",
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: "pick_002",
    public_code: "WL-2026-SKW-002",
    reporter_user_id: "usr_warga_01",
    service_area_id: "sa_sukawati",
    category_id: "cat_organik",
    category_name: "Organik Dapur & Upacara",
    address_id: "addr_01",
    address_display: "Jl. Raya Batuan No. 14, Banjar Kaja",
    slot_id: "slot_02",
    slot_display: "Kemarin, 14:00 - 15:30 WITA",
    status: "COMPLETED",
    assigned_collector_id: "usr_staff_01",
    estimated_weight_kg: 8.0,
    actual_weight_kg: 8.2,
    points_earned: 410,
    notes: "Selesai diolah di TPS3R Sukawati",
    created_at: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
  },
  {
    id: "pick_003",
    public_code: "WL-2026-SKW-001",
    reporter_user_id: "usr_warga_01",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik",
    category_name: "Kardus & Kertas Dupleks",
    address_id: "addr_01",
    address_display: "Jl. Raya Batuan No. 14, Banjar Kaja",
    slot_id: "slot_03",
    slot_display: "28 Okt 2026, 09:00 - 10:30 WITA",
    status: "COMPLETED",
    assigned_collector_id: "usr_staff_02",
    estimated_weight_kg: 12.0,
    actual_weight_kg: 11.5,
    points_earned: 690,
    notes: "Kardus kering dan terikat rapi",
    created_at: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
  },
];

function getStatusBadge(status: PickupStatus) {
  switch (status) {
    case "PENDING_ASSIGNMENT":
    case "SUBMITTED":
      return {
        label: "Menunggu Petugas",
        bg: colors.warningBg,
        text: colors.warningText,
        border: colors.warningBorder,
      };
    case "ACCEPTED":
      return {
        label: "Diterima Petugas",
        bg: colors.infoBg,
        text: colors.infoText,
        border: colors.infoBorder,
      };
    case "EN_ROUTE":
      return {
        label: "Petugas Menuju Lokasi",
        bg: colors.infoBg,
        text: colors.infoText,
        border: colors.infoBorder,
      };
    case "ARRIVED":
    case "INSPECTION":
    case "WEIGHED":
      return {
        label: "Proses Timbang di Lokasi",
        bg: colors.brand100,
        text: colors.brand900,
        border: colors.brand200,
      };
    case "COLLECTED":
    case "COMPLETED":
      return {
        label: "Selesai & Sah",
        bg: colors.successBg,
        text: colors.successText,
        border: colors.successBorder,
      };
    case "CANCELLED":
    case "REJECTED":
      return {
        label: "Dibatalkan",
        bg: colors.dangerBg,
        text: colors.dangerText,
        border: colors.dangerBorder,
      };
    default:
      return {
        label: status,
        bg: colors.surface,
        text: colors.textSecondary,
        border: colors.border,
      };
  }
}

export function ActivityScreen({
  onSelectPickup,
  onNavigateToSetor,
}: ActivityScreenProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("SEMUA");
  const [offlineDrafts, setOfflineDrafts] = useState<OfflinePickupDraft[]>([]);
  const [onlinePickups, setOnlinePickups] = useState<PickupRequest[]>(MOCK_ONLINE_PICKUPS);
  const [syncingDraftId, setSyncingDraftId] = useState<string | null>(null);

  const loadData = async () => {
    const drafts = await OfflineDraftManager.getDrafts();
    setOfflineDrafts(drafts);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncDraft = async (draft: OfflinePickupDraft) => {
    setSyncingDraftId(draft.local_id);
    try {
      const created = await OfflineDraftManager.submitDraftToServer(draft);
      Alert.alert(
        "Draf Berhasil Terkirim!",
        `Permohonan setoran berhasil dikirim ke server dengan kode ${created.public_code || "WL-2026-SKW-NEW"}.`
      );
      setOnlinePickups((prev) => [
        {
          ...created,
          public_code: created.public_code || `WL-2026-SKW-00${prev.length + 1}`,
          category_name: draft.category_name,
          address_display: draft.address_display,
          slot_display: draft.slot_display,
          status: "PENDING_ASSIGNMENT",
        },
        ...prev,
      ]);
      await loadData();
    } catch {
      Alert.alert(
        "Koneksi Gagal",
        "Perangkat masih dalam kondisi luring (offline). Draf tetap aman tersimpan di ponsel Anda."
      );
    } finally {
      setSyncingDraftId(null);
    }
  };

  const handleDeleteDraft = async (localId: string) => {
    Alert.alert(
      "Hapus Draf Lokal?",
      "Draf permohonan yang belum terkirim ke server ini akan dihapus permanen.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await OfflineDraftManager.removeDraft(localId);
            await loadData();
          },
        },
      ]
    );
  };

  // Filter items
  const isOnlineActive = (status: PickupStatus) =>
    ["SUBMITTED", "PENDING_ASSIGNMENT", "ACCEPTED", "EN_ROUTE", "ARRIVED", "INSPECTION", "WEIGHED"].includes(status);

  const filteredOnline = onlinePickups.filter((p) => {
    if (activeTab === "SEMUA") return true;
    if (activeTab === "AKTIF") return isOnlineActive(p.status);
    if (activeTab === "SELESAI") return !isOnlineActive(p.status);
    return false;
  });

  const showDrafts = activeTab === "SEMUA" || activeTab === "DRAF";

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Aktivitas Setor</Text>
        <Text style={styles.headerSubtitle}>
          Riwayat permohonan setoran sampah Anda di Banjar Sukawati
        </Text>
      </View>

      {/* Filter Tabs Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "SEMUA" && styles.tabButtonActive]}
          onPress={() => setActiveTab("SEMUA")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "SEMUA" }}
        >
          <Text style={[styles.tabButtonText, activeTab === "SEMUA" && styles.tabButtonTextActive]}>
            Semua
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "AKTIF" && styles.tabButtonActive]}
          onPress={() => setActiveTab("AKTIF")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "AKTIF" }}
        >
          <Text style={[styles.tabButtonText, activeTab === "AKTIF" && styles.tabButtonTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "SELESAI" && styles.tabButtonActive]}
          onPress={() => setActiveTab("SELESAI")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "SELESAI" }}
        >
          <Text style={[styles.tabButtonText, activeTab === "SELESAI" && styles.tabButtonTextActive]}>
            Selesai
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "DRAF" && styles.tabButtonActive]}
          onPress={() => setActiveTab("DRAF")}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === "DRAF" }}
        >
          <Text style={[styles.tabButtonText, activeTab === "DRAF" && styles.tabButtonTextActive]}>
            Draf ({offlineDrafts.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Offline Drafts Section */}
        {showDrafts && offlineDrafts.length > 0 && (
          <View style={styles.draftsSection}>
            <Text style={styles.sectionHeading}>Draf Tersimpan di Ponsel (Luring)</Text>
            {offlineDrafts.map((draft) => (
              <View key={draft.local_id} style={styles.draftCard}>
                <View style={styles.draftCardHeader}>
                  <View style={styles.draftBadge}>
                    <Text style={styles.draftBadgeText}>DRAF LOKAL (BELUM KE SERVER)</Text>
                  </View>
                  <Text style={styles.itemDate}>
                    {formatWitaDate(draft.created_at)}
                  </Text>
                </View>

                <Text style={styles.itemCategory}>{draft.category_name}</Text>
                <Text style={styles.itemMeta}>{draft.address_display}</Text>
                <Text style={styles.itemMeta}>Jadwal: {draft.slot_display}</Text>

                {draft.notes ? (
                  <Text style={styles.itemNotes}>Catatan: {draft.notes}</Text>
                ) : null}

                <View style={styles.draftActions}>
                  <TouchableOpacity
                    style={styles.btnSync}
                    onPress={() => handleSyncDraft(draft)}
                    disabled={syncingDraftId === draft.local_id}
                    accessibilityLabel="Kirim draf lokal ke server sekarang"
                  >
                    <Text style={styles.btnSyncText}>
                      {syncingDraftId === draft.local_id
                        ? "Mengirim..."
                        : "Kirim ke Server Sekarang"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btnDeleteDraft}
                    onPress={() => handleDeleteDraft(draft.local_id)}
                    accessibilityLabel="Hapus draf lokal"
                  >
                    <Text style={styles.btnDeleteDraftText}>Hapus</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Online Pickups Section */}
        {activeTab !== "DRAF" && (
          <View>
            {filteredOnline.length > 0 ? (
              filteredOnline.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.pickupCard}
                    onPress={() => onSelectPickup(item.id)}
                    accessibilityLabel={`Lihat pelacakan setoran ${item.public_code}`}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.publicCode}>{item.public_code}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: badge.bg,
                            borderColor: badge.border,
                          },
                        ]}
                      >
                        <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                          {badge.label}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.itemCategory}>{item.category_name}</Text>
                    <Text style={styles.itemMeta}>{item.address_display}</Text>
                    <Text style={styles.itemMeta}>Jadwal: {item.slot_display}</Text>

                    <View style={styles.cardFooter}>
                      <Text style={styles.weightText}>
                        {item.actual_weight_kg
                          ? `Bobot Sah: ${item.actual_weight_kg} kg`
                          : `Estimasi: ${item.estimated_weight_kg || 0} kg`}
                      </Text>
                      {item.points_earned ? (
                        <Text style={styles.pointsText}>
                          +{item.points_earned} WastePoints
                        </Text>
                      ) : (
                        <Text style={styles.detailLink}>Pantau Progres &gt;</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Belum Ada Aktivitas</Text>
                <Text style={styles.emptySub}>
                  Belum ada permohonan setoran sampah pada filter ini.
                </Text>
                <TouchableOpacity
                  style={styles.btnStartDeposit}
                  onPress={onNavigateToSetor}
                  accessibilityLabel="Mulai permohonan setor sampah baru"
                >
                  <Text style={styles.btnStartDepositText}>
                    Setor Sampah Sekarang
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
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
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabButton: {
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    minHeight: touchTargets.minButtonHeight,
    justifyContent: "center",
  },
  tabButtonActive: {
    borderBottomColor: colors.brand700,
  },
  tabButtonText: {
    ...typography.body,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tabButtonTextActive: {
    color: colors.brand900,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionHeading: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.warningText,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  draftsSection: {
    marginBottom: spacing.lg,
  },
  draftCard: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1.5,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  draftCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  draftBadge: {
    backgroundColor: colors.warningText,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  draftBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: "700",
    fontSize: 10,
  },
  itemDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  itemCategory: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  itemMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemNotes: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: "italic",
    marginTop: spacing.xs,
  },
  draftActions: {
    flexDirection: "row",
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  btnSync: {
    flex: 1,
    backgroundColor: colors.brand900,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  btnSyncText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: "700",
  },
  btnDeleteDraft: {
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  btnDeleteDraftText: {
    ...typography.caption,
    color: colors.dangerText,
    fontWeight: "600",
  },
  pickupCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: touchTargets.minButtonHeight,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  publicCode: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  weightText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  pointsText: {
    ...typography.caption,
    color: colors.successText,
    fontWeight: "700",
  },
  detailLink: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  btnStartDeposit: {
    backgroundColor: colors.brand900,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 10,
    minHeight: touchTargets.minButtonHeight,
    justifyContent: "center",
  },
  btnStartDepositText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: "700",
  },
});
