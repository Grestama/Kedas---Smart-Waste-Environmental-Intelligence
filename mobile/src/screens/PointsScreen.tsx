import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors, spacing, touchTargets, typography, formatPoints, formatWitaDate } from "@/tokens";
import { WastePointsBalance, PointLedgerItem } from "@/types";

interface PointsScreenProps {
  onNavigateToSetor: () => void;
}

const MOCK_BALANCE: WastePointsBalance = {
  total_balance: 1450,
  total_earned_all_time: 2150,
  total_redeemed_all_time: 700,
};

const MOCK_LEDGER: PointLedgerItem[] = [
  {
    id: "tx_001",
    entry_type: "REWARD",
    points_delta: 410,
    balance_after: 1450,
    reason: "Setoran Sampah: Botol PET Bening (8.2 kg) • WL-2026-SKW-002",
    created_at: new Date(Date.now() - 86400 * 1000 * 1).toISOString(),
  },
  {
    id: "tx_002",
    entry_type: "REWARD",
    points_delta: 690,
    balance_after: 1040,
    reason: "Setoran Sampah: Kardus & Kertas Dupleks (11.5 kg) • WL-2026-SKW-001",
    created_at: new Date(Date.now() - 86400 * 1000 * 3).toISOString(),
  },
  {
    id: "tx_003",
    entry_type: "REDEMPTION",
    points_delta: -500,
    balance_after: 350,
    reason: "Penukaran Voucher Sembako Koperasi Desa Sukawati",
    created_at: new Date(Date.now() - 86400 * 1000 * 7).toISOString(),
  },
  {
    id: "tx_004",
    entry_type: "REWARD",
    points_delta: 850,
    balance_after: 850,
    reason: "Bonus Pemilahan Bersih Awal Warga Banjar Sukawati",
    created_at: new Date(Date.now() - 86400 * 1000 * 14).toISOString(),
  },
];

const REWARD_CATALOG_PREVIEWS = [
  {
    id: "cat_01",
    title: "Token Listrik PLN Rp 20.000",
    pointsRequired: 200,
    partner: "PLN UID Bali & BUMDes",
    tag: "Energi Bersih",
  },
  {
    id: "cat_02",
    title: "Voucher Sembako Rp 50.000",
    pointsRequired: 500,
    partner: "Koperasi Desa Sukawati",
    tag: "Kebutuhan Pokok",
  },
  {
    id: "cat_03",
    title: "Donasi Bibit Pohon Upacara",
    pointsRequired: 100,
    partner: "Prajaniti & Banjar Sukawati",
    tag: "Pelestarian Alam",
  },
  {
    id: "cat_04",
    title: "Minyak Goreng Sawit 1 Liter",
    pointsRequired: 300,
    partner: "Bank Sampah Bintang Sukawati",
    tag: "Kebutuhan Dapur",
  },
];

export function PointsScreen({ onNavigateToSetor }: PointsScreenProps) {
  const [balance] = useState<WastePointsBalance>(MOCK_BALANCE);
  const [ledger] = useState<PointLedgerItem[]>(MOCK_LEDGER);

  const handleRewardClick = (item: (typeof REWARD_CATALOG_PREVIEWS)[0]) => {
    Alert.alert(
      "Katalog Penukaran Segera Hadir",
      `Penukaran "${item.title}" (${item.pointsRequired} Poin) akan diintegrasikan bersama mitra ${item.partner} pada rilis fase berikutnya.`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WastePoints Saya</Text>
        <Text style={styles.headerSubtitle}>
          Tabungan poin pemilahan sampah organik dan anorganik terpilah
        </Text>
      </View>

      {/* Main Balance Hero Card */}
      <View style={styles.heroCard}>
        <Text style={styles.heroSubtitle}>Saldo Poin Aktif</Text>
        <Text style={styles.heroPoints}>{formatPoints(balance.total_balance)}</Text>
        <Text style={styles.heroPointsUnit}>WastePoints</Text>

        <View style={styles.heroDivider} />

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatCol}>
            <Text style={styles.heroStatLabel}>Total Diperoleh</Text>
            <Text style={styles.heroStatValue}>+{balance.total_earned_all_time}</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStatCol}>
            <Text style={styles.heroStatLabel}>Total Ditukar</Text>
            <Text style={styles.heroStatValue}>-{balance.total_redeemed_all_time}</Text>
          </View>
        </View>

        <View style={styles.heroEstimateBox}>
          <Text style={styles.heroEstimateText}>
            Estimasi Nilai Manfaat Sirkular: Rp {(balance.total_balance * 100).toLocaleString("id-ID")}
          </Text>
          <Text style={styles.heroEstimateSub}>
            *Dapat ditukarkan dengan sembako atau token listrik di BUMDes Sukawati.
          </Text>
        </View>
      </View>

      {/* Action to Earn More */}
      <TouchableOpacity
        style={styles.earnMoreBtn}
        onPress={onNavigateToSetor}
        accessibilityLabel="Setor sampah untuk mendapatkan poin lagi"
      >
        <Text style={styles.earnMoreBtnText}>+ Setor Sampah untuk Tambah Poin</Text>
      </TouchableOpacity>

      {/* Rewards Catalog Preview */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Katalog Penukaran</Text>
          <View style={styles.badgeSoon}>
            <Text style={styles.badgeSoonText}>Segera Hadir</Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>
          Tukarkan WastePoints Anda dengan voucher kebutuhan harian di Banjar Sukawati.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catalogScroll}>
          {REWARD_CATALOG_PREVIEWS.map((reward) => (
            <TouchableOpacity
              key={reward.id}
              style={styles.catalogCard}
              onPress={() => handleRewardClick(reward)}
              accessibilityLabel={`Lihat reward ${reward.title}`}
            >
              <View style={styles.catalogTag}>
                <Text style={styles.catalogTagText}>{reward.tag}</Text>
              </View>
              <Text style={styles.catalogTitle}>{reward.title}</Text>
              <Text style={styles.catalogPartner}>Mitra: {reward.partner}</Text>
              <View style={styles.catalogPointsRow}>
                <Text style={styles.catalogPointsReq}>{reward.pointsRequired} Poin</Text>
                <Text style={styles.catalogActionText}>Detail &gt;</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Ledger History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riwayat Transaksi Poin</Text>
        <Text style={styles.sectionSubtitle}>
          Setiap perolehan poin tercatat sah pada buku besar digital backend.
        </Text>

        {ledger.map((item) => {
          const isPositive = item.points_delta > 0;
          return (
            <View key={item.id} style={styles.ledgerCard}>
              <View style={styles.ledgerTopRow}>
                <Text style={styles.ledgerReason}>{item.reason}</Text>
                <Text
                  style={[
                    styles.ledgerDelta,
                    isPositive ? styles.ledgerDeltaPositive : styles.ledgerDeltaNegative,
                  ]}
                >
                  {isPositive ? `+${item.points_delta}` : item.points_delta}
                </Text>
              </View>
              <View style={styles.ledgerBottomRow}>
                <Text style={styles.ledgerDate}>{formatWitaDate(item.created_at)}</Text>
                <Text style={styles.ledgerBalanceAfter}>
                  Saldo setelahnya: {item.balance_after}
                </Text>
              </View>
            </View>
          );
        })}
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
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.md,
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
  heroCard: {
    backgroundColor: colors.brand900,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    alignItems: "center",
  },
  heroSubtitle: {
    ...typography.caption,
    color: colors.brand200,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  heroPoints: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.textInverse,
    marginTop: 4,
  },
  heroPointsUnit: {
    ...typography.caption,
    color: colors.brand200,
    fontWeight: "600",
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    width: "100%",
    marginVertical: spacing.md,
  },
  heroStatsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
  },
  heroStatCol: {
    alignItems: "center",
  },
  heroStatLabel: {
    ...typography.caption,
    color: colors.brand200,
    fontSize: 11,
  },
  heroStatValue: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  heroEstimateBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: spacing.sm,
    width: "100%",
    marginTop: spacing.md,
    alignItems: "center",
  },
  heroEstimateText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: "700",
  },
  heroEstimateSub: {
    ...typography.caption,
    color: colors.brand200,
    fontSize: 10,
    marginTop: 2,
  },
  earnMoreBtn: {
    backgroundColor: colors.brand700,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    minHeight: touchTargets.minButtonHeight,
  },
  earnMoreBtnText: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textInverse,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  badgeSoon: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  badgeSoonText: {
    ...typography.caption,
    color: colors.warningText,
    fontWeight: "700",
    fontSize: 10,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  catalogScroll: {
    flexDirection: "row",
    paddingBottom: spacing.xs,
  },
  catalogCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    width: 220,
    marginRight: spacing.md,
    minHeight: 140,
    justifyContent: "space-between",
  },
  catalogTag: {
    backgroundColor: colors.brand100,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: spacing.xs,
  },
  catalogTagText: {
    ...typography.caption,
    color: colors.brand900,
    fontWeight: "700",
    fontSize: 10,
  },
  catalogTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 18,
  },
  catalogPartner: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  catalogPointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  catalogPointsReq: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "700",
  },
  catalogActionText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
  },
  ledgerCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  ledgerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ledgerReason: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    marginRight: spacing.sm,
    fontSize: 13,
  },
  ledgerDelta: {
    ...typography.body,
    fontWeight: "800",
    fontSize: 15,
  },
  ledgerDeltaPositive: {
    color: colors.successText,
  },
  ledgerDeltaNegative: {
    color: colors.dangerText,
  },
  ledgerBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  ledgerDate: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  ledgerBalanceAfter: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
});
