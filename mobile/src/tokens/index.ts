/**
 * WasteLink Bali Mobile — Design Tokens
 * Mengikuti filosofi "Calm field operations" & pedoman designapps.md
 */

export const colors = {
  // Brand Greens
  brand900: "#1D3F35", // Primary deep forest
  brand700: "#2F6552", // Interactive green
  brand500: "#4D8570",
  brand200: "#BCE1C7",
  brand100: "#E8F0E9",
  brand50: "#F3F9F5",

  // Neutrals / Surfaces
  canvas: "#F6F6F1", // App background
  surface: "#FFFFFF", // Card / Panel background
  surfaceElevated: "#FFFFFF",
  border: "#E2E8E4",
  borderSubtle: "#EEF2EF",

  // Typography
  textPrimary: "#1D2A24",
  textSecondary: "#4A5D53",
  textMuted: "#7E8C84",
  textInverse: "#FFFFFF",

  // Semantic Status
  successBg: "#E7F4EA",
  successText: "#276749",
  successBorder: "#BCE1C7",

  warningBg: "#FFF4D9",
  warningText: "#98631C",
  warningBorder: "#F7E1A0",

  dangerBg: "#FBEAE7",
  dangerText: "#A43F35",
  dangerBorder: "#F5C6BF",

  infoBg: "#EAF2F9",
  infoText: "#315F86",
  infoBorder: "#BDD8EF",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const touchTargets = {
  minHeight: 48, // 48dp baseline standard
  minWidth: 48,
  minButtonHeight: 48,
  minButtonWidth: 48,
  buttonRadius: 12,
  cardRadius: 16,
};

export const typography = {
  fontFamily: "System",
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    hero: 28,
  },
  h1: {
    fontSize: 26,
    fontWeight: "800" as const,
  },
  h2: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  h3: {
    fontSize: 17,
    fontWeight: "700" as const,
  },
  body: {
    fontSize: 14,
    fontWeight: "400" as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
};

export function formatWITA(dateString: string): string {
  try {
    const d = new Date(dateString);
    return (
      d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Makassar",
      }) +
      " " +
      d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Makassar",
      }) +
      " WITA"
    );
  } catch {
    return dateString;
  }
}

export const formatWitaDate = formatWITA;

export function formatPoints(pts: number): string {
  return `${pts.toLocaleString("id-ID")} Pts`;
}

export function formatWeightKg(kg: number): string {
  return `${kg.toFixed(2)} kg`;
}
