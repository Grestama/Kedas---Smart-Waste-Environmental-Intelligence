/**
 * WasteLink Bali Mobile — Contextual Permissions & Fallbacks Handler
 * Memastikan izin sistem perangkat diminta transparan dengan penjelasan manfaat
 * dan menyediakan alur cadangan (fallback) bila izin ditolak pengguna.
 */

export type PermissionType = "CAMERA" | "LOCATION" | "NOTIFICATION";

export interface PermissionStatus {
  type: PermissionType;
  granted: boolean;
  canAskAgain: boolean;
  rationale: string;
  fallbackDescription: string;
}

export class DevicePermissionsManager {
  private static permissionStates: Record<PermissionType, boolean> = {
    CAMERA: false,
    LOCATION: false,
    NOTIFICATION: false,
  };

  /**
   * Minta izin akses kamera untuk dokumentasi pemilahan sampah.
   */
  public static async requestCameraPermission(
    allowSimulation: boolean = true
  ): Promise<PermissionStatus> {
    const rationale =
      "WasteLink Bali memerlukan izin kamera agar Anda dapat memotret kondisi sampah terpilah dan mempercepat verifikasi petugas TPS3R.";
    const fallbackDescription =
      "Anda tetap dapat mengajukan setoran tanpa foto atau memilih foto dari galeri perangkat.";

    if (allowSimulation) {
      this.permissionStates.CAMERA = true;
    }

    return {
      type: "CAMERA",
      granted: this.permissionStates.CAMERA,
      canAskAgain: true,
      rationale,
      fallbackDescription,
    };
  }

  /**
   * Minta izin akses lokasi (GPS) untuk validasi banjar.
   */
  public static async requestLocationPermission(
    allowSimulation: boolean = true
  ): Promise<PermissionStatus> {
    const rationale =
      "WasteLink Bali menggunakan lokasi Anda untuk memastikan titik penjemputan berada dalam jangkauan armada trike Banjar Sukawati.";
    const fallbackDescription =
      "Anda dapat memilih alamat penjemputan tersimpan secara manual tanpa mengaktifkan sensor GPS.";

    if (allowSimulation) {
      this.permissionStates.LOCATION = true;
    }

    return {
      type: "LOCATION",
      granted: this.permissionStates.LOCATION,
      canAskAgain: true,
      rationale,
      fallbackDescription,
    };
  }

  /**
   * Minta izin notifikasi push untuk pembaruan status penjemputan.
   */
  public static async requestNotificationPermission(
    allowSimulation: boolean = true
  ): Promise<PermissionStatus> {
    const rationale =
      "Izin notifikasi diperlukan untuk memberi tahu saat armada penjemputan mulai meluncur ke rumah Anda.";
    const fallbackDescription =
      "Status perjalanan dapat dipantau langsung pada tab Aktivitas di dalam aplikasi.";

    if (allowSimulation) {
      this.permissionStates.NOTIFICATION = true;
    }

    return {
      type: "NOTIFICATION",
      granted: this.permissionStates.NOTIFICATION,
      canAskAgain: true,
      rationale,
      fallbackDescription,
    };
  }

  public static getPermissionState(type: PermissionType): boolean {
    return this.permissionStates[type];
  }
}
