/**
 * Kedas Iconography System & Semantic Map
 * In strict alignment with MASTER PROMPT — KEDAS ICON-FIRST VISUAL LANGUAGE.
 */

export const iconSizes = {
  xs: 14,       // metadata, inline status tags
  sm: 16,       // compact controls, table action icons
  md: 18,       // inputs, menu items, regular buttons
  lg: 22,       // navigation items, card subheadings
  xl: 26,       // KPI cards, primary feature tiles
  "2xl": 34,    // empty states, major section feature icons
  display: 44,  // hero visual or primary illustration symbol
} as const;

export type IconSizeToken = keyof typeof iconSizes;

export const iconStroke = {
  default: 1.85,
  thin: 1.5,
  bold: 2.2,
} as const;

export const iconContainerVariants = {
  /** Soft tinted surface: Low contrast pastel background with stronger icon color */
  soft: "rounded-xl bg-[#E8F0E9] text-[#1D3F35] border border-[#D7E4D9]/60",
  /** Solid brand surface: Deep evergreen background with white or leaf icon */
  brand: "rounded-xl bg-[#122620] text-emerald-400 shadow-xs",
  /** Outline surface: Transparent background with subtle neutral border */
  outline: "rounded-xl bg-white border border-[#DDE3DD] text-[#1D3F35] shadow-2xs",
  /** Inverse surface: For dark sections or dark headers */
  inverse: "rounded-xl bg-white/10 text-emerald-300 border border-white/15",
  /** Warning container: For safety alerts and hazardous B3 notes */
  warning: "rounded-xl bg-[#FFF4D9] text-[#98631C] border border-[#F7E1A0]",
  /** Danger container: For rejected or critical status */
  danger: "rounded-xl bg-[#FBEAE7] text-[#A43F35] border border-[#F5C6BF]",
  /** Info container: For procedural notices */
  info: "rounded-xl bg-[#EAF2F9] text-[#315F86] border border-[#BDD8EF]",
} as const;

export type IconContainerVariant = keyof typeof iconContainerVariants;
