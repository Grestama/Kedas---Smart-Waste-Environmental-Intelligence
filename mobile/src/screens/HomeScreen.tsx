import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { colors, spacing, touchTargets, typography, formatPoints } from "@/tokens";
import { useMobileAuth } from "@/context/auth-context";
import { PickupRequest, OfflinePickupDraft } from "@/types";
import { OfflineDraftManager } from "@/lib/offline-draft";

interface HomeScreenProps {
  onNavigateToSetor: () => void;
  onNavigateToActivity: () => void;
  onNavigateToPoints: () => void;
}

export function HomeScreen({
  onNavigateToSetor,
  onNavigateToActivity,
  onNavigateToPoints,
}: HomeScreenProps) {
  const { user } = useMobileAuth();
  const [offlineDrafts, setOfflineDrafts] = useState<OfflinePickupDraft[]>([]);
  const [activePickup, setActivePickup] = useState<PickupRequest | null>({
    id: "pick_active_01",
    public_code: "WL-2026-SKW-004",
    reporter_user_id: "usr_warga_01",
    service_area_id: "sa_sukawati",
    category_id: "cat_anorganik_pet",
    category_name: "Plastik PET Bening Bersih",
    address_id: "addr_01",
    address_display: "Banjar Kaja Sukawati",
    slot_id: "slot_01",
    slot_display: "Hari Ini, 09:00 - 10:30 WITA",
    status: "EN_ROUTE",
    assigned_collector_id: "usr_staff_01",
    estimated_weight_kg: 5.5,
    notes: "3 kantong di depan pagar",
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    OfflineDraftManager.getDrafts().then(setOfflineDrafts);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Greeting Header */}
      <View style={styles.greetingHeader}>
        <View>
          <Text style={styles.greetingSub}>Om Swastyastu,</Text>
          <Text style={styles.greetingName}>{user?.name || "Warga Sukawati"}</Text>
          <Text style={styles.banjarBadge}>{user?.banjar || "Banjar Sukawati"}</Text>
        </View>
      </View>

      {/* Offline Draft Alert if any */}
      {offlineDrafts.length > 0 && (
        <View style={styles.draftAlert}>
          <Text style={styles.draftAlertTitle}>
            Tersimpan {offlineDrafts.length} Draf Permohonan Lokal
          </Text>
          <Text style={styles.draftAlertDesc}>
            Permohonan dibuat saat luring dan BELUM terkirim ke server banjar.
          </Text>
          <TouchableOpacity
            style={styles.draftAlertButton}
            onPress={onNavigateToActivity}
          >
            <Text style={styles.draftAlertButtonText}>Periksa Draf di Aktivitas &rarr;</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WastePoints Quick Balance Card */}
      <TouchableOpacity
        style={styles.pointsCard}
        activeOpacity={0.85}
        onPress={onNavigateToPoints}
      >
        <View style={styles.pointsHeader}>
          <Text style={styles.pointsLabel}>SALDO WASTEPOINTS SAYA</Text>
          <Text style={styles.pointsHelp}>Ketuk untuk Mutasi &rarr;</Text>
        </View>
        <Text style={styles.pointsValue}>{formatPoints(1250)}</Text>
        <Text style={styles.pointsHint}>
          Setara kontribusi pemilahan 42 kg sampah terpilah banjar
        </Text>
      </TouchableOpacity>

      {/* Main Big CTA "Setor Sampah" */}
      <TouchableOpacity
        style={styles.mainCtaButton}
        activeOpacity={0.85}
        onPress={onNavigateToSetor}
      >
        <Text style={styles.mainCtaTitle}>+ Buat Permohonan Setoran</Text>
        <Text style={styles.mainCtaSubtitle}>
          Pilih kategori, jadwal, dan armada trike banjar akan menjemput ke rumah Anda
        </Text>
      </TouchableOpacity>

      {/* In-Progress Pickup Status Card */}
      {activePickup && (
        <View style={styles.activePickupCard}>
          <View style={styles.activePickupHeader}>
            <Text style={styles.activePickupStatus}>ARMADA MENUJU LOKASI</Text>
            <Text style={styles.activePickupCode}>{activePickup.public_code}</Text>
          </View>
          <Text style={styles.activePickupCategory}>
            {activePickup.category_name}
          </Text>
          <Text style={styles.activePickupSlot}>
            Jadwal: {activePickup.slot_display}
          </Text>
          <TouchableOpacity
            style={styles.trackButton}
            onPress={onNavigateToActivity}
          >
            <Text style={styles.trackButtonText}>Pantau Perjalanan Armada &rarr;</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Sorting Guide Category Quick Tiles */}
      <View style={styles.guideSection}>
        <Text style={styles.sectionTitle}>Panduan 4 Kategori Pemilahan</Text>
        <View style={styles.tileRow}>
          <View style={[styles.tile, { backgroundColor: "#E7F4EA" }]}>
            <Text style={[styles.tileTitle, { color: "#276749" }]}>1. Organik</Text>
            <Text style={styles.tileDesc}>Sisa sayur & daun kompos banjar</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: "#EAF2F9" }]}>
            <Text style={[styles.tileTitle, { color: "#315F86" }]}>2. Anorganik</Text>
            <Text style={styles.tileDesc}>Botol PET, kardus, kaleng bersih</Text>
          </View>
        </View>
        <View style={styles.tileRow}>
          <View style={[styles.tile, { backgroundColor: "#F3F5F4" }]}>
            <Text style={[styles.tileTitle, { color: "#4A5D53" }]}>3. Residu</Text>
            <Text style={styles.tileDesc}>Plastik sachet & popok kotor</Text>
          </View>
          <View style={[styles.tile, { backgroundColor: "#FFF4D9" }]}>
            <Text style={[styles.tileTitle, { color: "#98631C" }]}>4. Khusus (B3)</Text>
            <Text style={styles.tileDesc}>Baterai & jarum (Jalur Khusus)</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  greetingHeader: {
    marginBottom: spacing.lg,
  },
  greetingSub: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  greetingName: {
    fontSize: typography.fontSize.xl,
    fontWeight: "bold",
    color: colors.brand900,
  },
  banjarBadge: {
    fontSize: typography.fontSize.xs,
    color: colors.brand700,
    fontWeight: "600",
    marginTop: 2,
  },
  draftAlert: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: touchTargets.cardRadius,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  draftAlertTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
    color: colors.warningText,
  },
  draftAlertDesc: {
    fontSize: typography.fontSize.xs,
    color: "#7A4E12",
    marginTop: 2,
  },
  draftAlertButton: {
    marginTop: spacing.sm,
    alignSelf: "flex-start",
  },
  draftAlertButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    color: colors.warningText,
    textDecorationLine: "underline",
  },
  pointsCard: {
    backgroundColor: colors.brand900,
    borderRadius: touchTargets.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  pointsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    color: colors.brand100,
    letterSpacing: 0.5,
  },
  pointsHelp: {
    fontSize: typography.fontSize.xs,
    color: colors.brand200,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.textInverse,
    marginVertical: spacing.xs,
  },
  pointsHint: {
    fontSize: typography.fontSize.xs,
    color: colors.brand100,
    opacity: 0.85,
  },
  mainCtaButton: {
    backgroundColor: colors.brand700,
    borderRadius: touchTargets.buttonRadius,
    padding: spacing.lg,
    minHeight: touchTargets.minHeight,
    justifyContent: "center",
    marginBottom: spacing.lg,
    elevation: 2,
  },
  mainCtaTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: "bold",
    color: colors.textInverse,
    textAlign: "center",
  },
  mainCtaSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.brand100,
    textAlign: "center",
    marginTop: 4,
  },
  activePickupCard: {
    backgroundColor: colors.surface,
    borderColor: colors.brand700,
    borderWidth: 1.5,
    borderRadius: touchTargets.cardRadius,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  activePickupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  activePickupStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    color: colors.warningText,
    backgroundColor: colors.warningBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePickupCode: {
    fontSize: typography.fontSize.xs,
    fontFamily: "monospace",
    color: colors.textMuted,
  },
  activePickupCategory: {
    fontSize: typography.fontSize.base,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  activePickupSlot: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  trackButton: {
    backgroundColor: colors.brand50,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  trackButtonText: {
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    color: colors.brand900,
  },
  guideSection: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: "bold",
    color: colors.brand900,
    marginBottom: spacing.md,
  },
  tileRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  tile: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
  },
  tileTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tileDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
});
