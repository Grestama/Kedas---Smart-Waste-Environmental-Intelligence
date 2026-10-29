import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors, spacing, touchTargets, typography } from "@/tokens";
import { useMobileAuth } from "@/context/auth-context";
import { DevicePermissionsManager, PermissionType } from "@/lib/permissions";
import { OfflineDraftManager } from "@/lib/offline-draft";

export function ProfileScreen() {
  const { user, logout } = useMobileAuth();
  const [offlineDraftCount, setOfflineDraftCount] = useState<number>(0);

  const [permissions, setPermissions] = useState<Record<PermissionType, boolean>>({
    CAMERA: DevicePermissionsManager.getPermissionState("CAMERA"),
    LOCATION: DevicePermissionsManager.getPermissionState("LOCATION"),
    NOTIFICATION: DevicePermissionsManager.getPermissionState("NOTIFICATION"),
  });

  const refreshDrafts = async () => {
    const drafts = await OfflineDraftManager.getDrafts();
    setOfflineDraftCount(drafts.length);
  };

  useEffect(() => {
    refreshDrafts();
  }, []);

  const handleTogglePermission = async (type: PermissionType) => {
    if (type === "CAMERA") {
      const res = await DevicePermissionsManager.requestCameraPermission();
      setPermissions((prev) => ({ ...prev, CAMERA: res.granted }));
      Alert.alert(
        res.granted ? "Izin Kamera Aktif" : "Izin Kamera Nonaktif",
        res.granted ? res.rationale : res.fallbackDescription
      );
    } else if (type === "LOCATION") {
      const res = await DevicePermissionsManager.requestLocationPermission();
      setPermissions((prev) => ({ ...prev, LOCATION: res.granted }));
      Alert.alert(
        res.granted ? "Izin Lokasi Aktif" : "Izin Lokasi Nonaktif",
        res.granted ? res.rationale : res.fallbackDescription
      );
    } else if (type === "NOTIFICATION") {
      const res = await DevicePermissionsManager.requestNotificationPermission();
      setPermissions((prev) => ({ ...prev, NOTIFICATION: res.granted }));
      Alert.alert(
        res.granted ? "Izin Notifikasi Aktif" : "Izin Notifikasi Nonaktif",
        res.granted ? res.rationale : res.fallbackDescription
      );
    }
  };

  const handleClearDrafts = () => {
    if (offlineDraftCount === 0) {
      Alert.alert("Draf Kosong", "Tidak ada draf lokal tersimpan di ponsel Anda.");
      return;
    }
    Alert.alert(
      "Bersihkan Draf Lokal?",
      `Terdapat ${offlineDraftCount} draf lokal yang belum disinkronkan ke server. Yakin ingin menghapus seluruhnya?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Bersihkan Semua",
          style: "destructive",
          onPress: async () => {
            const drafts = await OfflineDraftManager.getDrafts();
            for (const d of drafts) {
              await OfflineDraftManager.removeDraft(d.local_id);
            }
            await refreshDrafts();
            Alert.alert("Selesai", "Semua draf offline lokal telah dibersihkan.");
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Keluar dari Aplikasi?",
      "Anda akan keluar dari akun Warga Sukawati di perangkat ini.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Keluar",
          style: "destructive",
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : "W"}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name || "Wayan Sudarsana"}</Text>
        <Text style={styles.userPhone}>{user?.phone || "0812-3456-7890"}</Text>
        <View style={styles.badgeBanjar}>
          <Text style={styles.badgeBanjarText}>{user?.banjar || "Banjar Kaja Sukawati"}</Text>
        </View>
      </View>

      {/* Role Notice & Separation Policy */}
      <View style={styles.roleCard}>
        <Text style={styles.roleCardTitle}>Peran Akun: Warga Komunitas</Text>
        <Text style={styles.roleCardBody}>
          Aplikasi mobile ini dirancang eksklusif untuk Warga Banjar Sukawati guna mengajukan
          setoran dan memantau WastePoints.
        </Text>
        <Text style={styles.roleCardPolicy}>
          Catatan: Petugas armada lapangan dan admin TPS3R bertugas melalui Terminal Web POS Desktop di kantor operasional.
        </Text>
      </View>

      {/* Device Permissions Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Izin Akses Perangkat</Text>
        <Text style={styles.sectionSubtitle}>
          Izin digunakan untuk mempermudah foto sampah dan penentuan titik koordinat banjar.
        </Text>

        <TouchableOpacity
          style={styles.permissionRow}
          onPress={() => handleTogglePermission("CAMERA")}
          accessibilityLabel="Pengaturan izin kamera"
        >
          <View style={styles.permTextCol}>
            <Text style={styles.permLabel}>Kamera Foto Sampah</Text>
            <Text style={styles.permDesc}>
              {permissions.CAMERA ? "Aktif (Dapat mengambil foto kondisi pemilahan)" : "Nonaktif (Pakai opsi tanpa foto)"}
            </Text>
          </View>
          <View
            style={[
              styles.permToggleBadge,
              permissions.CAMERA ? styles.permBadgeActive : styles.permBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.permToggleText,
                permissions.CAMERA ? styles.permTextActive : styles.permTextInactive,
              ]}
            >
              {permissions.CAMERA ? "Aktif" : "Ubah"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.permissionRow}
          onPress={() => handleTogglePermission("LOCATION")}
          accessibilityLabel="Pengaturan izin lokasi GPS"
        >
          <View style={styles.permTextCol}>
            <Text style={styles.permLabel}>Lokasi GPS Wilayah</Text>
            <Text style={styles.permDesc}>
              {permissions.LOCATION ? "Aktif (Verifikasi banjar otomatis)" : "Nonaktif (Pilih alamat manual)"}
            </Text>
          </View>
          <View
            style={[
              styles.permToggleBadge,
              permissions.LOCATION ? styles.permBadgeActive : styles.permBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.permToggleText,
                permissions.LOCATION ? styles.permTextActive : styles.permTextInactive,
              ]}
            >
              {permissions.LOCATION ? "Aktif" : "Ubah"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.permissionRow}
          onPress={() => handleTogglePermission("NOTIFICATION")}
          accessibilityLabel="Pengaturan izin notifikasi"
        >
          <View style={styles.permTextCol}>
            <Text style={styles.permLabel}>Notifikasi Penjemputan</Text>
            <Text style={styles.permDesc}>
              {permissions.NOTIFICATION ? "Aktif (Pemberitahuan armada meluncur)" : "Nonaktif"}
            </Text>
          </View>
          <View
            style={[
              styles.permToggleBadge,
              permissions.NOTIFICATION ? styles.permBadgeActive : styles.permBadgeInactive,
            ]}
          >
            <Text
              style={[
                styles.permToggleText,
                permissions.NOTIFICATION ? styles.permTextActive : styles.permTextInactive,
              ]}
            >
              {permissions.NOTIFICATION ? "Aktif" : "Ubah"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Offline Storage Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Penyimpanan Luring (Offline)</Text>
        <View style={styles.storageCard}>
          <View style={styles.storageRow}>
            <Text style={styles.storageLabel}>Draf Setoran Belum Terkirim</Text>
            <Text style={styles.storageValue}>{offlineDraftCount} Draf</Text>
          </View>
          <TouchableOpacity
            style={styles.clearDraftBtn}
            onPress={handleClearDrafts}
            accessibilityLabel="Bersihkan draf lokal"
          >
            <Text style={styles.clearDraftBtnText}>Bersihkan Draf Lokal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Banjar Sukawati Helpline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bantuan & Layanan Banjar</Text>
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Posko TPS3R Sukawati</Text>
          <Text style={styles.helpBody}>
            Jl. Raya Batuan No. 12, Sukawati, Gianyar, Bali
          </Text>
          <Text style={styles.helpHours}>Jam Layanan: 07:00 - 15:00 WITA</Text>
          <View style={styles.contactDivider} />
          <Text style={styles.contactPerson}>
            Kaling / Koordinator: I Ketut Arnawa (0812-9876-5432)
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={handleLogout}
        accessibilityLabel="Keluar dari akun warga"
      >
        <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
      </TouchableOpacity>

      <Text style={styles.versionFooter}>
        WasteLink Bali Citizen App • v1.0.0 (Expo/React Native)
      </Text>
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
  profileHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.brand900,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textInverse,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  userPhone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badgeBanjar: {
    backgroundColor: colors.brand100,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: spacing.sm,
  },
  badgeBanjarText: {
    ...typography.caption,
    color: colors.brand900,
    fontWeight: "700",
  },
  roleCard: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand200,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  roleCardTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.brand900,
    marginBottom: spacing.xs,
  },
  roleCardBody: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  roleCardPolicy: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "600",
    marginTop: spacing.xs,
    fontStyle: "italic",
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  permissionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: touchTargets.minButtonHeight,
  },
  permTextCol: {
    flex: 1,
    marginRight: spacing.md,
  },
  permLabel: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  permDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  permToggleBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
  },
  permBadgeActive: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  permBadgeInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  permToggleText: {
    ...typography.caption,
    fontWeight: "700",
  },
  permTextActive: {
    color: colors.successText,
  },
  permTextInactive: {
    color: colors.textSecondary,
  },
  storageCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
  },
  storageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  storageLabel: {
    ...typography.body,
    color: colors.textPrimary,
  },
  storageValue: {
    ...typography.body,
    fontWeight: "700",
    color: colors.warningText,
  },
  clearDraftBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.dangerBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  clearDraftBtnText: {
    ...typography.caption,
    color: colors.dangerText,
    fontWeight: "700",
  },
  helpCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  helpTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.brand900,
  },
  helpBody: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  helpHours: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "600",
    marginTop: 2,
  },
  contactDivider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.sm,
  },
  contactPerson: {
    ...typography.caption,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  logoutBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.dangerBorder,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
    minHeight: touchTargets.minButtonHeight,
  },
  logoutBtnText: {
    ...typography.body,
    color: colors.dangerText,
    fontWeight: "700",
  },
  versionFooter: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
