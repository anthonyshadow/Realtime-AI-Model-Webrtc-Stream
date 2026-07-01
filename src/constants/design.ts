export const studioSpacing = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.5rem",
  "2xl": "2rem",
} as const;

export const studioRadii = {
  control: "0.5rem",
  panel: "0.75rem",
  sheet: "1rem",
  pill: "9999px",
} as const;

export const studioPanelWidths = {
  controlDrawer: "min(24rem, calc(100vw - 1.5rem))",
  setupPanel: "min(32rem, calc(100vw - 2rem))",
  recorderBar: "min(34rem, calc(100vw - 1.5rem))",
  reviewSheet: "min(42rem, calc(100vw - 1rem))",
} as const;

export const studioOverlayZIndex = {
  status: 10,
  controlDrawer: 20,
  recorder: 30,
  review: 40,
  modal: 50,
} as const;

export const studioTransitionDurations = {
  fast: "150ms",
  base: "200ms",
  overlay: "300ms",
} as const;

export const studioBreakpoints = {
  mobile: "320px",
  tablet: "768px",
  desktop: "1024px",
  largeDesktop: "1440px",
} as const;

export const studioClassNames = {
  disabled: "disabled:cursor-not-allowed disabled:opacity-50",
  focusRing:
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200",
  motion: "transition duration-200 ease-out motion-reduce:transition-none",
  overlayMotion:
    "transition duration-300 ease-out motion-reduce:transform-none motion-reduce:transition-none",
  surface:
    "border border-white/15 bg-neutral-950/78 text-white shadow-[0_18px_60px_rgb(0_0_0/0.38)] backdrop-blur-xl",
  touchTarget: "min-h-11",
} as const;

export const studioDesignTokens = {
  breakpoints: studioBreakpoints,
  classNames: studioClassNames,
  overlayZIndex: studioOverlayZIndex,
  panelWidths: studioPanelWidths,
  radii: studioRadii,
  spacing: studioSpacing,
  transitionDurations: studioTransitionDurations,
} as const;
