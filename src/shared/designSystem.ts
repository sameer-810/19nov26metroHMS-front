/**
 * Metro Hospital design tokens, taken from the logo: navy ring, blue and red pulse.
 * Navy/blue carry the interface (actions, links, selection, focus). Logo red is a
 * brand colour for the mark, wordmark and brand accents only — never for buttons or
 * status, because in a clinical app red means "critical". Red/amber/green signal
 * colours stay reserved for clinical meaning.
 * WCAG 2.1 AA throughout; contrast ratios are noted beside each status pair.
 */

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

export const palette = {
  /** Navy-tinted greys (hue of the logo ring). The interface is built almost entirely out of this ramp. */
  ink: {
    900: "#0A1530",
    800: "#101D3D",
    700: "#1C2A4F",
    600: "#36456B",
    500: "#56658A",
    400: "#8794B2",
    300: "#BCC5DA",
    200: "#DAE0EC",
    100: "#EBEFF6",
    50: "#F5F7FB",
  },

  /**
   * Primary — Metro navy to blue. Actions, links, selection, focus.
   * 700 is the logo ring (#12367F), 500 the blue half of the pulse (#2276B6).
   */
  clinical: {
    900: "#0A1D45",
    800: "#0E2A62",
    700: "#12367F", // logo navy · 11.6:1 on white
    600: "#1A5599", // 7.4:1 on white
    500: "#2276B6", // logo blue · 4.9:1 on white
    400: "#4E94CC",
    300: "#8BBAE2",
    200: "#BCD6EE",
    100: "#DDEAF6",
    50: "#EFF5FB",
  },

  /** Brand red — the red half of the pulse and the wordmark. Brand moments only. */
  metroRed: {
    900: "#5E0E12",
    800: "#7F1419",
    700: "#A81B22",
    600: "#D0232B", // logo red · 5.1:1 on white
    500: "#DE4A50",
    400: "#E87A7E",
    300: "#F1AAAC",
    200: "#F8D2D3",
    100: "#FCE8E8",
    50: "#FEF4F4",
  },

  /** Accent — teal. Secondary emphasis only; never a status. */
  teal: {
    900: "#07352F",
    800: "#0A4A41",
    700: "#0C6357",
    600: "#10806F",
    500: "#159C88",
    400: "#3DBCA6",
    300: "#7AD3C3",
    200: "#B0E6DC",
    100: "#D8F3EE",
    50: "#EEFAF8",
  },

  neutral: {
    0: "#FFFFFF",
    50: "#F5F7FB",
    100: "#EBEFF6",
    200: "#DAE0EC",
    300: "#BCC5DA",
    400: "#8794B2",
    500: "#56658A",
    600: "#36456B",
    700: "#1C2A4F",
    800: "#101D3D",
    900: "#0A1530",
  },

  surface: {
    primary: "#FFFFFF",
    secondary: "#F5F7FB",
    tertiary: "#EBEFF6",
    raised: "#FFFFFF",
    sunken: "#EBEFF6",
    dark: "#0A1530",
    darkRaised: "#101D3D",
  },

  text: {
    primary: "#0A1530",
    secondary: "#36456B",
    tertiary: "#56658A",
    disabled: "#8794B2",
    inverse: "#FFFFFF",
    accent: "#12367F",
    link: "#1A5599",
  },

  border: {
    subtle: "#EBEFF6",
    default: "#DAE0EC",
    strong: "#BCC5DA",
    focus: "#1A5599",
    dark: "#1C2A4F",
  },

  // ---- Generic UI status (banners, toasts, form feedback) ------------------
  // Deliberately separate from the clinical `signal` ramp.
  success: { bg: "#E6F4EC", text: "#0B6B3F", border: "#B6E0C9" }, // 6.05:1
  warning: { bg: "#FDF2DC", text: "#8A5304", border: "#F5DDA8" }, // 6.34:1
  danger: { bg: "#FCEAE8", text: "#A82418", border: "#F5C6C0" }, // 6.48:1
  info: { bg: "#EEF4FB", text: "#12367F", border: "#C4D9EE" }, // 10.6:1
} as const;

// ---------------------------------------------------------------------------
// Clinical signal — the sacred ramp
// ---------------------------------------------------------------------------

/**
 * Clinical alert tiers (four, no more). Always render `shape` with the colour
 * so the tier stays readable to colour-blind staff.
 */
export const signal = {
  /** Act now. Anaphylaxis risk, critical lab value, arrest call, ESI 1. */
  critical: {
    color: "#B3261E",
    onColor: "#FFFFFF",
    bg: "#FCEAE8",
    border: "#F0B4AD",
    text: "#8C1D18",
    shape: "octagon",
    icon: "octagon-alert",
    label: "Critical",
  },
  /** Act soon. Out-of-range vitals, urgent order, ESI 2. */
  urgent: {
    color: "#B25000",
    onColor: "#FFFFFF",
    bg: "#FDEDE0",
    border: "#F3C9A4",
    text: "#8A3D00",
    shape: "triangle",
    icon: "triangle-alert",
    label: "Urgent",
  },
  /** Worth knowing, optionally actionable. Due review, mild abnormality. */
  caution: {
    color: "#8A5304",
    onColor: "#FFFFFF",
    bg: "#FDF2DC",
    border: "#F0D49A",
    text: "#6B4003",
    shape: "diamond",
    icon: "info",
    label: "Caution",
  },
  /** Within range, nothing required. */
  normal: {
    color: "#0B6B3F",
    onColor: "#FFFFFF",
    bg: "#E6F4EC",
    border: "#AFDCC4",
    text: "#08512F",
    shape: "circle",
    icon: "circle-check",
    label: "Normal",
  },
} as const;

export type SignalLevel = keyof typeof signal;

/**
 * How intrusive each tier may be: blocking modal, confirm, inline, or passive badge.
 * Only critical overrides require a typed reason, so routine alerts do not breed junk reasons.
 */
export const alertTier = {
  critical: {
    presentation: "blocking",
    requireReason: true,
    dismissible: false,
  },
  urgent: { presentation: "confirm", requireReason: false, dismissible: true },
  caution: { presentation: "inline", requireReason: false, dismissible: true },
  normal: { presentation: "passive", requireReason: false, dismissible: true },
} as const;

/** Result flags against the reference range; critical ones are panic values that escalate. */
export const valueFlag = {
  criticalLow: {
    signal: "critical" as SignalLevel,
    glyph: "LL",
    label: "Critically low",
  },
  low: { signal: "urgent" as SignalLevel, glyph: "L", label: "Low" },
  normal: { signal: "normal" as SignalLevel, glyph: "", label: "Normal" },
  high: { signal: "urgent" as SignalLevel, glyph: "H", label: "High" },
  criticalHigh: {
    signal: "critical" as SignalLevel,
    glyph: "HH",
    label: "Critically high",
  },
} as const;

export type ValueFlag = keyof typeof valueFlag;

/** Emergency Severity Index, the ED triage scale. 1 is resuscitation. */
export const triageLevel = {
  1: {
    label: "Resuscitation",
    signal: "critical" as SignalLevel,
    color: "#B3261E",
    targetMinutes: 0,
  },
  2: {
    label: "Emergent",
    signal: "critical" as SignalLevel,
    color: "#D9480F",
    targetMinutes: 10,
  },
  3: {
    label: "Urgent",
    signal: "urgent" as SignalLevel,
    color: "#B25000",
    targetMinutes: 30,
  },
  4: {
    label: "Less urgent",
    signal: "caution" as SignalLevel,
    color: "#8A5304",
    targetMinutes: 60,
  },
  5: {
    label: "Non-urgent",
    signal: "normal" as SignalLevel,
    color: "#0B6B3F",
    targetMinutes: 120,
  },
} as const;

/** Bed states, from the spec's state table. Colour carries the meaning here. */
export const bedState = {
  available: {
    label: "Available",
    color: "#0B6B3F",
    bg: "#E6F4EC",
    border: "#AFDCC4",
  },
  occupied: {
    label: "Occupied",
    color: "#1A5599",
    bg: "#EEF4FB",
    border: "#C4D9EE",
  },
  reserved: {
    label: "Reserved",
    color: "#8A5304",
    bg: "#FDF2DC",
    border: "#F0D49A",
  },
  maintenance: {
    label: "Under maintenance",
    color: "#56658A",
    bg: "#EBEFF6",
    border: "#DAE0EC",
  },
} as const;

// ---------------------------------------------------------------------------
// Dark theme
// ---------------------------------------------------------------------------

/** Dark theme: raised surfaces get lighter (elevation, not inversion). */
export const darkPalette = {
  surface: {
    primary: "#141C2B",
    secondary: "#0D1420",
    tertiary: "#1B2537",
    raised: "#1B2537",
    sunken: "#0A111B",
    dark: "#060C14",
    darkRaised: "#141C2B",
  },
  text: {
    primary: "#E8ECF2",
    secondary: "#B4BECC",
    tertiary: "#8794B2",
    disabled: "#56658A",
    inverse: "#0A1530",
    accent: "#8BBAE2",
    link: "#8BBAE2",
  },
  border: {
    subtle: "#1C2A4F",
    default: "#2A3648",
    strong: "#36456B",
    focus: "#4E94CC",
    dark: "#060C14",
  },
  success: { bg: "#0E2E1E", text: "#6FD39B", border: "#1C4F33" },
  warning: { bg: "#332507", text: "#E8B55C", border: "#54401A" },
  danger: { bg: "#3A1512", text: "#F09186", border: "#5E2620" },
  info: { bg: "#0E2246", text: "#8BBAE2", border: "#1E3D6E" },
} as const;

/** Signal ramp re-tuned for dark surfaces, where daylight reds and ambers glare. */
export const darkSignal = {
  critical: {
    color: "#F2655A",
    onColor: "#2A0806",
    bg: "#3A1512",
    border: "#6B2A24",
    text: "#F09186",
    shape: "octagon",
    icon: "octagon-alert",
    label: "Critical",
  },
  urgent: {
    color: "#E8903F",
    onColor: "#2A1503",
    bg: "#38230C",
    border: "#66401A",
    text: "#EFAE72",
    shape: "triangle",
    icon: "triangle-alert",
    label: "Urgent",
  },
  caution: {
    color: "#E0B75E",
    onColor: "#2A1F03",
    bg: "#332507",
    border: "#5E4715",
    text: "#E8C87F",
    shape: "diamond",
    icon: "info",
    label: "Caution",
  },
  normal: {
    color: "#54C489",
    onColor: "#04240F",
    bg: "#0E2E1E",
    border: "#1F5336",
    text: "#7FD6A6",
    shape: "circle",
    icon: "circle-check",
    label: "Normal",
  },
} as const;

// ---------------------------------------------------------------------------
// Status accents — KPI tiles and chart series
// ---------------------------------------------------------------------------
export const accents = {
  clinical: { color: "#1A5599", tint: "#EEF4FB" },
  metroRed: { color: "#D0232B", tint: "#FCE8E8" },
  /** Decorative KPI accents use the logo colours; names kept so screens need no change. */
  teal: { color: "#2276B6", tint: "#E4EFF8" },
  violet: { color: "#12367F", tint: "#E6EBF5" },
  amber: { color: "#A96A08", tint: "#FDF2DC" },
  rose: { color: "#B3261E", tint: "#FCEAE8" },
  green: { color: "#0B6B3F", tint: "#E6F4EC" },
  neutral: { color: "#56658A", tint: "#EBEFF6" },
} as const;

/** Chart series colours, ordered for greyscale/CVD contrast. Assign in order, never by hash. */
export const chartSeries = [
  "#12367F",
  "#D0232B",
  "#2276B6",
  "#A96A08",
  "#0B6B3F",
  "#6B4FC4",
  "#56658A",
] as const;

// ---------------------------------------------------------------------------
// Spacing, radius, elevation
// ---------------------------------------------------------------------------

/** 4pt grid. */
export const space = {
  none: 0,
  hair: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  "5xl": 48,
  "6xl": 64,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
  "2xl": 16,
  full: 9999,
} as const;

export const outline = { width: 1, color: palette.border.default } as const;

const soft = (y: number, blur: number, opacity: number, elev: number) => ({
  shadowColor: "#0A1530",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: opacity,
  shadowRadius: blur,
  elevation: elev,
});

/** Shadows for floating layers only; resting surfaces use a hairline border. */
export const shadows = {
  none: {},
  xs: soft(1, 2, 0.03, 1),
  sm: soft(1, 3, 0.05, 2),
  md: soft(4, 12, 0.07, 4),
  lg: soft(8, 24, 0.1, 8),
  xl: soft(16, 36, 0.12, 14),
} as const;

export const elevation = {
  base: shadows.none,
  raised: shadows.none,
  floating: shadows.md,
  overlay: shadows.lg,
} as const;

export const motion = {
  duration: { instant: 80, fast: 150, medium: 250, slow: 400 },
  spring: {
    gentle: { damping: 18, stiffness: 180 },
    default: { damping: 20, stiffness: 220 },
    bouncy: { damping: 12, stiffness: 200 },
    crisp: { damping: 25, stiffness: 300 },
  },
} as const;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * One family, weights up to 600. Sentence case everywhere; `overline` is the only
 * uppercase style and never carries clinical content.
 */
export const fonts = {
  display: "Inter_600SemiBold",
  heading: "Inter_600SemiBold",
  bodyRegular: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_600SemiBold",
  /** Doses, batch numbers, ESC/P previews — anything that must not re-flow. */
  mono: "monospace",
} as const;

/** Tabular figures for any number compared down a column (vitals, doses, amounts). */
export const numeric = { fontVariant: ["tabular-nums" as const] };

export const typography = {
  display: {
    large: { fontSize: 28, lineHeight: 34, fontFamily: fonts.display },
    medium: { fontSize: 24, lineHeight: 30, fontFamily: fonts.display },
    small: { fontSize: 21, lineHeight: 26, fontFamily: fonts.display },
  },
  heading: {
    h1: { fontSize: 20, lineHeight: 26, fontFamily: fonts.heading },
    h2: { fontSize: 17, lineHeight: 24, fontFamily: fonts.heading },
    h3: { fontSize: 15, lineHeight: 20, fontFamily: fonts.heading },
    h4: { fontSize: 13, lineHeight: 18, fontFamily: fonts.heading },
  },
  body: {
    large: { fontSize: 15, lineHeight: 22, fontFamily: fonts.bodyRegular },
    default: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bodyRegular },
    small: { fontSize: 13, lineHeight: 18, fontFamily: fonts.bodyRegular },
  },
  label: {
    large: { fontSize: 14, lineHeight: 20, fontFamily: fonts.bodyMedium },
    medium: { fontSize: 13, lineHeight: 18, fontFamily: fonts.bodyMedium },
    small: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bodyMedium },
  },
  caption: { fontSize: 12, lineHeight: 16, fontFamily: fonts.bodyRegular },
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: fonts.bodyMedium,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  /** Large, unmissable — the vitals tile, the value on a result card. */
  metric: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: fonts.display,
    ...numeric,
  },
  metricSmall: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: fonts.display,
    ...numeric,
  },
} as const;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export const breakpoints = {
  sm: 640,
  md: 760,
  lg: 900,
  xl: 1100,
  xxl: 1280,
} as const;

/** Table density presets; screens read these rather than hard-coding row heights. */
export const density = {
  comfortable: { rowHeight: 52, cellPaddingY: 12, fontScale: 1 },
  standard: { rowHeight: 44, cellPaddingY: 8, fontScale: 1 },
  compact: { rowHeight: 36, cellPaddingY: 4, fontScale: 0.96 },
} as const;

export type Density = keyof typeof density;

export const layout = {
  screenPadding: 24,
  screenPaddingPhone: 16,
  cardPadding: 16,
  cardPaddingCompact: 12,

  controlHeight: 38,
  /** 44 is the accessibility floor, and the hand may be gloved. */
  controlHeightPhone: 46,

  sectionGap: 24,
  itemGap: 12,

  sidebarWidth: 248,
  sidebarCollapsedWidth: 68,
  navRowHeight: 36,

  tabBarHeight: 64,
  tabBarClearance: 88,

  chipHeight: 30,
  rowHeight: 44,
  rowHeightDense: 36,
  rowHeightPhone: 60,
  tableHeaderHeight: 36,

  /** Patient identity band: never scrolled away or collapsed (wrong-patient safety). */
  patientBannerHeight: 64,
  patientBannerHeightPhone: 76,

  contentMaxWidth: 1320,
  wideBreakpoint: 900,

  /** Minimum tappable square, WCAG 2.5.5. */
  minTouchTarget: 44,
} as const;

export const gradients = {
  hero: ["#0E2A62", "#12367F", "#2276B6"],
  clinical: ["#2276B6", "#12367F"],
  teal: ["#10806F", "#0A4A41"],
  light: ["#FFFFFF", "#F5F7FB"],
  mist: ["#EFF5FB", "#FEF4F4"],
} as const;

/** Brand alias — prefer this over reaching into `palette.clinical` directly. */
export const brand = palette.clinical;

/** The three exact logo colours, for the mark, wordmark and brand accents. */
export const brandColors = {
  navy: "#12367F",
  blue: "#2276B6",
  red: "#D0232B",
} as const;

/** Navy chrome: sidebar and phone app bar. White text on navy is 11.6:1. */
export const chrome = {
  bg: "#12367F",
  border: "rgba(255,255,255,0.12)",
  text: "#FFFFFF",
  textMuted: "#BCD6EE", // 7.0:1 on navy
  icon: "#BCD6EE",
  hover: "rgba(255,255,255,0.08)",
  activeBg: "rgba(255,255,255,0.14)",
  activeBar: "#D0232B",
  plate: "#FFFFFF",
} as const;

export type Palette = typeof palette;
export type Signal = typeof signal;
