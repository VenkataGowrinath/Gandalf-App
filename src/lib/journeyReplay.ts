import type { JourneyEvent, LatLng } from "@/types"

/** Linear position along path: progress 0 = start, 1 = end. Uses segment-based interpolation. */
export function getPositionAlongPath(
  path: LatLng[],
  progress: number
): LatLng {
  if (path.length === 0)
    return { lat: 0, lng: 0 }
  if (path.length === 1)
    return path[0]
  const p = Math.max(0, Math.min(1, progress))
  const segCount = path.length - 1
  const segIndex = p * segCount
  const i = Math.min(Math.floor(segIndex), path.length - 2)
  const t = segIndex - i
  const a = path[i]
  const b = path[i + 1]
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
  }
}

/** Heading in degrees (0 = north, 90 = east) along path at progress, for avatar arrow. */
export function getHeadingAlongPath(
  path: LatLng[],
  progress: number
): number {
  if (path.length < 2) return 0
  const p = Math.max(0, Math.min(1, progress))
  const segCount = path.length - 1
  const segIndex = p * segCount
  const i = Math.min(Math.floor(segIndex), path.length - 2)
  const a = path[i]
  const b = path[i + 1]
  const dLng = (b.lng - a.lng) * Math.cos((a.lat * Math.PI) / 180)
  const dLat = b.lat - a.lat
  const deg = (Math.atan2(dLng, dLat) * 180) / Math.PI
  return (deg + 360) % 360
}

/** Event label at progress (0–1) over journey timeline. Uses event timestamps. */
export function getEventLabelAtProgress(
  events: JourneyEvent[],
  startedAt: Date,
  endedAt: Date,
  progress: number
): string {
  if (events.length === 0) return "Moving"
  const startMs = startedAt.getTime()
  const endMs = endedAt.getTime()
  const duration = endMs - startMs
  if (duration <= 0) return events[events.length - 1]?.label ?? "Moving"
  const t = startMs + progress * duration
  const sorted = [...events].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  let last: JourneyEvent | null = null
  for (const e of sorted) {
    if (e.timestamp.getTime() <= t) last = e
    else break
  }
  const label = last?.label ?? sorted[0]?.label ?? "Moving"
  // #region agent log
  const hasSuddenHaltEvent = events.some((ev) => String(ev.label).toLowerCase() === "sudden halt")
  if (hasSuddenHaltEvent) {
    fetch("http://127.0.0.1:7243/ingest/4b9cad50-ec19-4c48-9ad9-0b62b47c574e", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ location: "journeyReplay.ts:getEventLabelAtProgress", message: "event label (sudden-halt journey)", data: { progress, durationMin: duration / 60000, tMin: (t - startMs) / 60000, lastLabel: last?.label, label }, timestamp: Date.now(), hypothesisId: "A" }) }).catch(() => {})
  }
  // #endregion
  return label
}

/** Replay progress 0–1 that advances over durationMs and loops. */
export function getReplayProgress(
  startTime: number,
  durationMs: number,
  now: number = Date.now()
): number {
  const elapsed = now - startTime
  const p = (elapsed / durationMs) % 1
  return p
}
