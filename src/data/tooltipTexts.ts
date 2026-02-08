/**
 * Canonical tooltip texts for map avatar status (moving / direction / safety / anomaly).
 * Use these for status.text when type is "moving" and for journey event labels so tooltips stay consistent.
 */

/** Movement / Direction */
export const MOVEMENT_DIRECTION = [
  "Turning right ahead",
  "Took a U-turn",
  "Heading toward Madhapur",
  "Continuing straight route",
  "Entered side street",
  "Changing route slightly",
  "Crossing main junction",
  "Approaching destination now",
] as const

/** Speed / Motion behavior */
export const SPEED_MOTION = [
  "Slowing near signal",
  "Stopped briefly roadside",
  "Moving steadily forward",
  "Speed dropped suddenly",
  "Accelerating after stop",
] as const

/** Safety / Context signals */
export const SAFETY_CONTEXT = [
  "Within assistance range",
  "Exiting safe zone",
  "Entering well-lit area",
  "Low footfall stretch",
  "Near police station",
] as const

/** Anomaly / Attention states */
export const ANOMALY_ATTENTION = [
  "Route deviation detected",
  "Unusual pause detected",
] as const

export const TOOLTIP_TEXTS = [
  ...MOVEMENT_DIRECTION,
  ...SPEED_MOTION,
  ...SAFETY_CONTEXT,
  ...ANOMALY_ATTENTION,
] as const

export type TooltipText = (typeof TOOLTIP_TEXTS)[number]
