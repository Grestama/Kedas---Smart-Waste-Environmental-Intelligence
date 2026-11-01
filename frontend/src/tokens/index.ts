/**
 * Design Tokens — Kedas Web Platform
 * In strict alignment with docs/design/design_web.md.
 */

export const colors = {
  kedas: {
    forest: {
      950: "#122620", // Utility bar, deepest headings
      900: "#16352D", // Primary brand surface
      800: "#1D3F35", // Primary CTA, section titles
      700: "#285747", // Hover / selected state
    },
    leaf: {
      600: "#219B72", // Restrained accent
      500: "#2DBA87", // Interactive accent
    },
    neutrals: {
      ivory50: "#F6F6F1", // Page canvas
      paper0: "#FFFFFF", // Surface / card / forms
      sage100: "#E8F0E9", // Context pill / subtle highlight
      sage200: "#D7E4D9", // Soft borders
      slate700: "#53645E", // High-contrast body copy
      slate600: "#64736D", // Secondary copy
      slate400: "#9AA7A0", // Disabled / muted
      border: "#DDE3DD",
    },
  },
  // Backward compatibility tokens
  brand: {
    900: "#1D3F35",
    800: "#1D3F35",
    700: "#2F6552",
    100: "#E8F0E9",
  },
  canvas: "#F6F6F1",
  surface: "#FFFFFF",
  text: {
    primary: "#1E2A25",
    secondary: "#5D6B63",
    disabled: "#9BA6A0",
  },
  border: {
    DEFAULT: "#DDE3DD",
    focus: "#83B6A0",
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
      label: "Dibatalkan / Ditolak",
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

export * from "./icons";

export const borders = {
  hairline: "1px", // divider, subtle card border
  default: "1px",  // input and standard cards
  emphasis: "1.5px", // selected state and focus container
  strong: "2px",   // active/selected visual, hover pop-up cards
  feature: "3px",  // accent edge on featured components
} as const;

export const radii = {
  xs: "6px",
  sm: "9px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "26px",
  pill: "9999px",
  full: "9999px",
} as const;

export const shadows = {
  xs: "0 1px 2px rgba(20, 43, 35, 0.05)",
  sm: "0 2px 6px rgba(20, 43, 35, 0.06), 0 1px 2px rgba(20, 43, 35, 0.04)",
  md: "0 8px 20px rgba(20, 43, 35, 0.08), 0 2px 6px rgba(20, 43, 35, 0.04)",
  lg: "0 16px 36px rgba(20, 43, 35, 0.11), 0 4px 12px rgba(20, 43, 35, 0.05)",
  xl: "0 24px 56px rgba(20, 43, 35, 0.14), 0 8px 18px rgba(20, 43, 35, 0.06)",
  focus: "0 0 0 3px rgba(67, 134, 109, 0.20)",
  interactive: "0 8px 24px rgba(20, 48, 39, 0.09)",
  interactiveHover: "0 12px 30px rgba(18, 38, 32, 0.12)",
} as const;

export const surfaces = {
  page: "#F6F6F1",         // warm ivory
  surface: "#FFFFFF",      // white
  surfaceSoft: "#F5F4EE",  // warm neutral
  surfaceRaised: "#FFFFFF",
  surfaceInverse: "#122620", // dark evergreen
  surfaceSelected: "#E8F0E9", // sage tint
  surfaceDisabled: "#EFF2F0",
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
 * Aman terhadap null, undefined, atau string tanggal tidak valid
 */
export function formatWITA(
  dateInput?: string | Date | number | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "-";
  try {
    const date =
      typeof dateInput === "object" && dateInput instanceof Date
        ? dateInput
        : new Date(dateInput);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "Asia/Makassar",
      dateStyle: options?.dateStyle ?? "medium",
      timeStyle: options?.timeStyle ?? "short",
      ...options,
    }).format(date);
  } catch {
    return "-";
  }
}

/**
 * Format bobot sampah (kg)
 */
export function formatWeightKg(kg?: number | null): string {
  const val = typeof kg === "number" && !isNaN(kg) ? kg : 0;
  return `${new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  }).format(val)} kg`;
}

/**
 * Format jumlah WastePoints
 */
export function formatPoints(points?: number | null): string {
  const val = typeof points === "number" && !isNaN(points) ? points : 0;
  return `${new Intl.NumberFormat("id-ID").format(val)} poin`;
}
