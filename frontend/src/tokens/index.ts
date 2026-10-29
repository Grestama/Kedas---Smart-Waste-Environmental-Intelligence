/**
 * Design Tokens - WasteLink Bali ("Calm Field Operations")
 * Sesuai panduan designweb.md, designapps.md, dan wastelink_ui_reference.html.
 */

export const colors = {
  brand: {
    900: "#1D3F35", // Deep forest green - primary action, headings, dark surfaces
    700: "#2F6552", // Slate green - accents, secondary highlights
    100: "#E8F0E9", // Soft sage tint - light badge, highlight panels
  },
  canvas: "#F6F6F1", // Warm neutral off-white background
  surface: "#FFFFFF", // Crisp card / panel white
  text: {
    primary: "#1E2A25", // High contrast readable body text
    secondary: "#5D6B63", // Muted metadata, helper text, labels
    disabled: "#9BA6A0",
  },
  border: {
    DEFAULT: "#DCE3DD", // Subtle border for cards and dividers
    focus: "#83B6A0", // Accessible focus ring
  },
  status: {
    success: {
      text: "#276749",
      bg: "#E7F4EA",
      border: "#BCE1C7",
      label: "Selesai / Terverifikasi",
    },
    warning: {
      text: "#98631C",
      bg: "#FFF4D9",
      border: "#F7E1A0",
      label: "Dalam Proses / Perlu Perhatian",
    },
    danger: {
      text: "#A43F35",
      bg: "#FBEAE7",
      border: "#F5C6BF",
      label: "Dibatalkan / Gagal",
    },
    info: {
      text: "#315F86",
      bg: "#EAF2F9",
      border: "#BDD8EF",
      label: "Menunggu / Terjadwal",
    },
    neutral: {
      text: "#5D6B63",
      bg: "#EFF2F0",
      border: "#DCE3DD",
      label: "Draf / Catatan",
    },
  },
} as const;

export const radii = {
  sm: "6px",
  md: "8px",
  lg: "12px",
  xl: "16px",
  full: "9999px",
} as const;

export const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#83b6a0] focus-visible:ring-offset-2";

/**
 * Format angka ke format mata uang Rupiah
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal dan waktu ke zona waktu WITA (Asia/Makassar)
 */
export function formatWITA(
  dateInput: string | Date | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    dateStyle: options?.dateStyle ?? "medium",
    timeStyle: options?.timeStyle ?? "short",
    ...options,
  }).format(date);
}

/**
 * Format bobot sampah (kg)
 */
export function formatWeightKg(kg: number): string {
  return `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(kg)} kg`;
}

/**
 * Format WastePoints
 */
export function formatPoints(points: number): string {
  return `${new Intl.NumberFormat("id-ID").format(points)} poin`;
}
