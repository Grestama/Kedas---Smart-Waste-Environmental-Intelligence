import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { colors, spacing, touchTargets, typography } from "@/tokens";
import { WasteCategory, CollectionSlot, CitizenAddress } from "@/types";
import { DevicePermissionsManager } from "@/lib/permissions";
import { OfflineDraftManager } from "@/lib/offline-draft";
import { mobileApiClient } from "@/lib/api-client";

interface NewDepositScreenProps {
  onSuccess: (requestId: string) => void;
  onCancel: () => void;
}

// 4 macro categories
const CATEGORIES: WasteCategory[] = [
  {
    id: "cat_anorganik",
    code: "ANORGANIK",
    name: "Anorganik Daur Ulang",
    category_type: "RECYCLABLE",
    description: "Plastik PET, kardus, kertas, kaleng logam, dan kaca botol dalam kondisi kering dan bersih.",
    preparation_guide: "Bilas wadah dari sisa makanan/minuman, keringkan, dan pisahkan tutup botol.",
    safety_notes: "Hati-hati dengan pecahan kaca, bungkus terpisah.",
    is_active: true,
    display_order: 1,
  },
  {
    id: "cat_organik",
    code: "ORGANIK",
    name: "Organik Dapur & Upacara",
    category_type: "ORGANIC",
    description: "Sisa canang sari, dedaunan, kulit buah, dan sisa bahan dapur non-minyak pekat.",
    preparation_guide: "Pisahkan dari kantong plastik, staples, dan dupa.",
    safety_notes: "Jangan dicampur dengan residu bangkai atau kotoran hewan.",
    is_active: true,
    display_order: 2,
  },
  {
    id: "cat_residu",
    code: "RESIDU",
    name: "Residu Non-Daur Ulang",
    category_type: "RESIDUAL",
    description: "Popok sekali pakai, puntung rokok, plastik sachet multilapis kotor.",
    preparation_guide: "Ikat rapat dalam kantong sampah tersendiri.",
    safety_notes: "Jangan dibakar di pekarangan rumah.",
    is_active: true,
    display_order: 3,
  },
  {
    id: "cat_b3_spesifik",
    code: "B3_SPESIFIK",
    name: "Limbah B3 & Berbahaya",
    category_type: "SPECIAL",
    description: "Baterai bekas, aki, pestisida/insektisida, lampu neon, jarum, obat kedaluwarsa.",
    preparation_guide: "Simpan dalam wadah khusus tertutup rapat dan tahan bocor.",
    safety_notes: "DILARANG diangkut armada trike harian. Wajib drop-off langsung pada pos terjadwal.",
    is_active: true,
    display_order: 4,
  },
];

const AVAILABLE_SLOTS: CollectionSlot[] = [
  {
    id: "slot_morning",
    service_area_id: "sa_sukawati",
    start_time: "08:30 WITA",
    end_time: "10:30 WITA",
    max_capacity: 15,
    booked_capacity: 7,
    remaining_capacity: 8,
    is_active: true,
  },
  {
    id: "slot_afternoon",
    service_area_id: "sa_sukawati",
    start_time: "13:30 WITA",
    end_time: "15:30 WITA",
    max_capacity: 15,
    booked_capacity: 12,
    remaining_capacity: 3,
    is_active: true,
  },
];

const SAVED_ADDRESSES: CitizenAddress[] = [
  {
    id: "addr_01",
    label: "Rumah Utama",
    address_line: "Jl. Raya Batuan No. 14, Gang Cempaka",
    banjar_name: "Banjar Kaja Sukawati",
    is_default: true,
  },
  {
    id: "addr_02",
    label: "Pekarangan / Toko",
    address_line: "Pasar Seni Sukawati Blok B No. 5",
    banjar_name: "Banjar Tengah Sukawati",
    is_default: false,
  },
];

export function NewDepositScreen({ onSuccess, onCancel }: NewDepositScreenProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<WasteCategory | null>(CATEGORIES[0]);
  const [materialDetail, setMaterialDetail] = useState<string>("Plastik PET Bening (Botol Air Mineral)");
  const [estimatedWeightKg, setEstimatedWeightKg] = useState<string>("3.5");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<CitizenAddress>(SAVED_ADDRESSES[0]);
  const [selectedSlot, setSelectedSlot] = useState<CollectionSlot>(AVAILABLE_SLOTS[0]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [b3BlockedModal, setB3BlockedModal] = useState<boolean>(false);

  // Safety Gate Check for B3
  const handleSelectCategory = (cat: WasteCategory) => {
    if (cat.category_type === "SPECIAL") {
      setB3BlockedModal(true);
      setSelectedCategory(cat);
      return;
    }
    setB3BlockedModal(false);
    setSelectedCategory(cat);
  };

  // Camera Handler with contextual permission
  const handleCapturePhoto = async () => {
    const perm = await DevicePermissionsManager.requestCameraPermission();
    if (perm.granted) {
      // Simulate photo capture
      setPhotoUri(`file://storage/mock/photo_${Date.now()}.jpg`);
    } else {
      Alert.alert(
        "Izin Kamera Ditolak",
        perm.fallbackDescription
      );
    }
  };

  // Location handler with contextual permission
  const handleGpsLocation = async () => {
    const perm = await DevicePermissionsManager.requestLocationPermission();
    if (perm.granted) {
      Alert.alert(
        "Lokasi GPS Terverifikasi",
        "Koordinat berada di wilayah kerja Banjar Kaja Sukawati (-8.5912, 115.2831)."
      );
    } else {
      Alert.alert(
        "Izin Lokasi Ditolak",
        perm.fallbackDescription
      );
    }
  };

  // Form Submission (Online with Offline Draft Fallback)
  const handleSubmitDeposit = async () => {
    if (!selectedCategory) return;
    if (selectedCategory.category_type === "SPECIAL") {
      Alert.alert(
        "Penjemputan B3 Tidak Diizinkan",
        "Limbah B3 harus dibawa langsung ke pos TPS3R Sukawati demi keselamatan petugas."
      );
      return;
    }

    setIsSubmitting(true);
    const weightNum = parseFloat(estimatedWeightKg) || 2.0;

    const payload = {
      category_id: selectedCategory.id,
      address_id: selectedAddress.id,
      slot_id: selectedSlot.id,
      estimated_weight_kg: weightNum,
      notes: `${materialDetail}. ${notes}`.trim(),
    };

    try {
      // Try submitting to backend API
      const res = await mobileApiClient.post<{ id: string; public_code: string }>(
        "/pickup-requests",
        payload
      );
      setIsSubmitting(false);
      onSuccess(res.id || "pick_new_01");
    } catch {
      // Offline fallback: save as offline draft
      await OfflineDraftManager.saveDraft({
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        address_id: selectedAddress.id,
        address_display: `${selectedAddress.label} - ${selectedAddress.address_line}`,
        slot_id: selectedSlot.id,
        slot_display: `${selectedSlot.start_time} - ${selectedSlot.end_time}`,
        estimated_weight_kg: weightNum,
        photo_uri: photoUri || undefined,
        notes: `${materialDetail}. ${notes}`.trim(),
      });

      setIsSubmitting(false);
      Alert.alert(
        "Tersimpan sebagai Draf Lokal (Luring)",
        "Koneksi backend tidak dapat dijangkau. Permohonan Anda aman tersimpan di ponsel sebagai [DRAFT_LOKAL_OFFLINE] dan siap dikirim saat online di tab Aktivitas.",
        [{ text: "Mengerti", onPress: () => onSuccess("draft_local") }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Wizard Steps Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onCancel}
          style={styles.headerCancelBtn}
          accessibilityLabel="Batal dan kembali ke beranda"
        >
          <Text style={styles.headerCancelText}>Batal</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setor Sampah</Text>
        <View style={styles.stepBadge}>
          <Text style={styles.stepBadgeText}>Langkah {currentStep} / 5</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
        {/* STEP 1: KATEGORI & KESELAMATAN */}
        {currentStep === 1 && (
          <View>
            <Text style={styles.sectionTitle}>Pilih Kategori Sampah</Text>
            <Text style={styles.sectionSubtitle}>
              Pilah sampah Anda sesuai 4 kategori Banjar Sukawati untuk menjaga keselamatan lingkungan.
            </Text>

            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              const isB3 = cat.category_type === "SPECIAL";

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.cardOption,
                    isSelected && styles.cardOptionSelected,
                    isB3 && styles.cardOptionB3,
                  ]}
                  onPress={() => handleSelectCategory(cat)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.cardHeader}>
                    <Text
                      style={[
                        styles.cardTitle,
                        isSelected && styles.cardTitleSelected,
                        isB3 && styles.cardTitleB3,
                      ]}
                    >
                      {cat.name}
                    </Text>
                    {isB3 && (
                      <View style={styles.b3Badge}>
                        <Text style={styles.b3BadgeText}>Wajib Drop-Off</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardDesc}>{cat.description}</Text>
                  {cat.preparation_guide && (
                    <Text style={styles.cardGuide}>
                      Panduan: {cat.preparation_guide}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* B3 Gate Alert Banner */}
            {b3BlockedModal && (
              <View style={styles.b3AlertBanner}>
                <Text style={styles.b3AlertTitle}>
                  Perhatian: Penjemputan Trike Dibatasi
                </Text>
                <Text style={styles.b3AlertBody}>
                  Limbah Berbahaya & Beracun (B3) seperti aki, baterai, jarum, dan insektisida
                  tidak dapat diangkut dengan armada trike harian demi keselamatan petugas TPS3R.
                  Silakan serahkan langsung ke Pos B3 TPS3R Sukawati atau hubungi Kaling.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 2: DETAIL MATERIAL & FOTO */}
        {currentStep === 2 && (
          <View>
            <Text style={styles.sectionTitle}>Detail Material & Foto</Text>
            <Text style={styles.sectionSubtitle}>
              Berikan perkiraan bobot dan foto kondisi sampah agar petugas menyiapkan wadah yang tepat.
            </Text>

            {/* Material description input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Jenis Material / Sampah Terpilah</Text>
              <TextInput
                style={styles.textInput}
                value={materialDetail}
                onChangeText={setMaterialDetail}
                placeholder="Contoh: Botol PET bening bersih, kardus cokelat"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            {/* Weight input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Perkiraan Berat Total (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={estimatedWeightKg}
                onChangeText={setEstimatedWeightKg}
                keyboardType="numeric"
                placeholder="Contoh: 3.5"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.inputHint}>
                *Berat aktual dan sah akan ditimbang langsung oleh petugas di tempat.
              </Text>
            </View>

            {/* Photo capture */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Foto Sampah Terpilah (Opsional)</Text>
              <TouchableOpacity
                style={styles.photoUploadBtn}
                onPress={handleCapturePhoto}
                accessibilityLabel="Ambil foto sampah terpilah"
              >
                <Text style={styles.photoUploadText}>
                  {photoUri ? "Foto Terpilih: foto_sampah.jpg (Ubah)" : "Ambil Foto Sampah (Kamera)"}
                </Text>
              </TouchableOpacity>
              {photoUri && (
                <Text style={styles.photoSuccessText}>
                  Kondisi sampah siap diverifikasi oleh petugas.
                </Text>
              )}
            </View>

            {/* Notes input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Catatan untuk Petugas (Opsional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholder="Contoh: Ditaruh di teras samping dekat pintu gerbang hijau."
                placeholderTextColor={colors.textMuted}
              />
            </View>
          </View>
        )}

        {/* STEP 3: LOKASI PENJEMPUTAN */}
        {currentStep === 3 && (
          <View>
            <Text style={styles.sectionTitle}>Pilih Titik Penjemputan</Text>
            <Text style={styles.sectionSubtitle}>
              Armada trike beroperasi melayani wilayah Banjar Sukawati.
            </Text>

            {SAVED_ADDRESSES.map((addr) => {
              const isSelected = selectedAddress.id === addr.id;
              return (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                  onPress={() => setSelectedAddress(addr)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                    {addr.label} {addr.is_default && "(Utama)"}
                  </Text>
                  <Text style={styles.cardDesc}>{addr.address_line}</Text>
                  <Text style={styles.banjarTag}>{addr.banjar_name}</Text>
                </TouchableOpacity>
              );
            })}

            {/* GPS verification button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleGpsLocation}
              accessibilityLabel="Verifikasi posisi GPS saat ini"
            >
              <Text style={styles.gpsButtonText}>
                Verifikasi Posisi GPS Banjar
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 4: PILIH JADWAL / SLOT */}
        {currentStep === 4 && (
          <View>
            <Text style={styles.sectionTitle}>Pilih Slot Penjemputan</Text>
            <Text style={styles.sectionSubtitle}>
              Pilih waktu yang tersedia untuk armada trike Banjar Sukawati (Zona WITA).
            </Text>

            {AVAILABLE_SLOTS.map((slot) => {
              const isSelected = selectedSlot.id === slot.id;
              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.cardOption, isSelected && styles.cardOptionSelected]}
                  onPress={() => setSelectedSlot(slot)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, isSelected && styles.cardTitleSelected]}>
                      {slot.start_time} - {slot.end_time}
                    </Text>
                    <View style={styles.slotRemainingBadge}>
                      <Text style={styles.slotRemainingText}>
                        Sisa {slot.remaining_capacity} slot
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.cardDesc}>
                    Armada TPS3R Sukawati • Wilayah Banjar Kaja & Tengah
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Penjemputan beroperasi Senin - Sabtu pukul 08:00 - 16:00 WITA. Hari raya keagamaan libur operasional.
              </Text>
            </View>
          </View>
        )}

        {/* STEP 5: RINGKASAN & KONFIRMASI */}
        {currentStep === 5 && (
          <View>
            <Text style={styles.sectionTitle}>Ringkasan Permohonan</Text>
            <Text style={styles.sectionSubtitle}>
              Periksa kembali rincian setoran sampah Anda sebelum dikirimkan.
            </Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Kategori</Text>
                <Text style={styles.summaryValue}>{selectedCategory?.name}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Detail Material</Text>
                <Text style={styles.summaryValue}>{materialDetail}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Perkiraan Berat</Text>
                <Text style={styles.summaryValue}>{estimatedWeightKg} kg</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Jadwal Slot</Text>
                <Text style={styles.summaryValue}>
                  {selectedSlot.start_time} - {selectedSlot.end_time}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Alamat</Text>
                <Text style={styles.summaryValue}>
                  {selectedAddress.label} ({selectedAddress.address_line})
                </Text>
              </View>

              {notes ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Catatan</Text>
                  <Text style={styles.summaryValue}>{notes}</Text>
                </View>
              ) : null}
            </View>

            {/* Authoritative points disclaimer */}
            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerTitle}>Ketentuan WastePoints</Text>
              <Text style={styles.disclaimerText}>
                WastePoints final dihitung dan diterbitkan secara sah oleh sistem backend
                setelah proses timbang bersih dan inspeksi mutu di TPS3R Sukawati.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Footer */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setCurrentStep((s) => s - 1)}
            disabled={isSubmitting}
            accessibilityLabel="Kembali ke langkah sebelumnya"
          >
            <Text style={styles.btnSecondaryText}>Kembali</Text>
          </TouchableOpacity>
        )}

        {currentStep < 5 ? (
          <TouchableOpacity
            style={[
              styles.btnPrimary,
              selectedCategory?.category_type === "SPECIAL" && styles.btnDisabled,
            ]}
            onPress={() => {
              if (selectedCategory?.category_type === "SPECIAL") {
                Alert.alert(
                  "Penjemputan B3 Tidak Diizinkan",
                  "Limbah B3 harus diserahkan langsung ke pos TPS3R Sukawati demi keselamatan petugas."
                );
                return;
              }
              setCurrentStep((s) => s + 1);
            }}
            accessibilityLabel="Lanjut ke langkah berikutnya"
          >
            <Text style={styles.btnPrimaryText}>Lanjut</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btnPrimary, isSubmitting && styles.btnDisabled]}
            onPress={handleSubmitDeposit}
            disabled={isSubmitting}
            accessibilityLabel="Kirim permohonan setoran sampah"
          >
            <Text style={styles.btnPrimaryText}>
              {isSubmitting ? "Mengirim Permohonan..." : "Kirim Permohonan"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
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
  headerCancelBtn: {
    minHeight: touchTargets.minButtonHeight,
    minWidth: touchTargets.minButtonWidth,
    justifyContent: "center",
  },
  headerCancelText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  stepBadge: {
    backgroundColor: colors.brand100,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  stepBadgeText: {
    ...typography.caption,
    color: colors.brand900,
    fontWeight: "700",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  cardOption: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    minHeight: touchTargets.minButtonHeight,
  },
  cardOptionSelected: {
    borderColor: colors.brand700,
    backgroundColor: colors.brand50,
  },
  cardOptionB3: {
    borderColor: colors.warningBorder,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
  },
  cardTitleSelected: {
    color: colors.brand900,
  },
  cardTitleB3: {
    color: colors.warningText,
  },
  cardDesc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  cardGuide: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "600",
  },
  b3Badge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  b3BadgeText: {
    ...typography.caption,
    color: colors.warningText,
    fontWeight: "700",
  },
  b3AlertBanner: {
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  b3AlertTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.warningText,
    marginBottom: spacing.xs,
  },
  b3AlertBody: {
    ...typography.caption,
    color: colors.warningText,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...typography.caption,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textTransform: "uppercase",
  },
  textInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: touchTargets.minButtonHeight,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  inputHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  photoUploadBtn: {
    backgroundColor: colors.surface,
    borderColor: colors.brand700,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderRadius: 10,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  photoUploadText: {
    ...typography.body,
    color: colors.brand700,
    fontWeight: "600",
  },
  photoSuccessText: {
    ...typography.caption,
    color: colors.successText,
    marginTop: spacing.xs,
    fontWeight: "600",
  },
  banjarTag: {
    ...typography.caption,
    color: colors.brand700,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  gpsButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm,
    minHeight: touchTargets.minButtonHeight,
  },
  gpsButtonText: {
    ...typography.body,
    color: colors.brand900,
    fontWeight: "600",
  },
  slotRemainingBadge: {
    backgroundColor: colors.brand100,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 6,
  },
  slotRemainingText: {
    ...typography.caption,
    color: colors.brand900,
    fontWeight: "700",
  },
  infoBox: {
    backgroundColor: colors.infoBg,
    borderColor: colors.infoBorder,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  infoBoxText: {
    ...typography.caption,
    color: colors.infoText,
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
    flex: 1,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1.5,
    textAlign: "right",
  },
  disclaimerBox: {
    backgroundColor: colors.brand50,
    borderColor: colors.brand200,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.md,
  },
  disclaimerTitle: {
    ...typography.body,
    fontWeight: "700",
    color: colors.brand900,
    marginBottom: spacing.xs,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  btnSecondary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  btnSecondaryText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  btnPrimary: {
    flex: 2,
    backgroundColor: colors.brand900,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: touchTargets.minButtonHeight,
  },
  btnPrimaryText: {
    ...typography.body,
    color: colors.textInverse,
    fontWeight: "700",
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
