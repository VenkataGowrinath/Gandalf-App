import { useRef, useState, useEffect, useCallback } from "react"
import type { CommunityMember } from "@/types"

export interface DisplayState {
  lat: number
  lng: number
  heading: number
}

/** Ease-in-out: 0 at t=0, 1 at t=1 */
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/** Duration in ms: 300–800 based on distance (degrees ≈ 100m at equator) */
function durationMs(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  const d = Math.hypot(to.lat - from.lat, to.lng - from.lng)
  const ms = 300 + Math.min(500, d * 8000)
  return Math.round(ms)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function normalizeAngle(deg: number): number {
  let d = deg % 360
  if (d > 180) d -= 360
  if (d < -180) d += 360
  return d
}

/** Returns display positions/headings for all members, interpolated from targets. Updates at ~20fps for 60fps-friendly animation. */
export function useInterpolatedPositions(
  allMembers: CommunityMember[],
  /** Throttle: update React state every N animation frames (e.g. 3 = ~20fps) */
  stateEveryNFrames = 3
): Record<string, DisplayState> {
  const [display, setDisplay] = useState<Record<string, DisplayState>>(() => {
    const init: Record<string, DisplayState> = {}
    allMembers.forEach((m) => {
      const heading =
        m.status.type === "moving" && "heading" in m.status
          ? (m.status.heading ?? 0)
          : 0
      init[m.id] = {
        lat: m.position.lat,
        lng: m.position.lng,
        heading,
      }
    })
    return init
  })

  const refs = useRef({
    display: {} as Record<string, DisplayState>,
    start: {} as Record<string, { lat: number; lng: number; heading: number }>,
    target: {} as Record<string, { lat: number; lng: number; heading: number }>,
    startTime: 0,
    durations: {} as Record<string, number>,
    rafId: 0,
    frameCount: 0,
  })

  const run = useCallback(() => {
    const r = refs.current
    const now = performance.now()
    const elapsed = (now - r.startTime) / 1000
    let anyAnimating = false
    const next: Record<string, DisplayState> = {}

    allMembers.forEach((m) => {
      const tid = m.id
      const t = r.target[tid]
      if (!t) return
      const start = r.start[tid]
      const durSec = r.durations[tid] ?? 0.4
      const sec = Math.min(1, durSec > 0 ? elapsed / durSec : 1)
      const eased = easeInOut(sec)
      if (eased < 1) anyAnimating = true

      const lat = lerp(start.lat, t.lat, eased)
      const lng = lerp(start.lng, t.lng, eased)
      const headingFrom = start.heading
      const headingTo = normalizeAngle(t.heading)
      let headingDelta = headingTo - headingFrom
      if (headingDelta > 180) headingDelta -= 360
      if (headingDelta < -180) headingDelta += 360
      const heading = headingFrom + headingDelta * eased

      next[tid] = { lat, lng, heading }
      r.display[tid] = next[tid]
    })

    r.frameCount++
    if (r.frameCount >= stateEveryNFrames) {
      r.frameCount = 0
      setDisplay((prev) => {
        const out = { ...prev }
        let changed = false
        allMembers.forEach((m) => {
          const n = next[m.id]
          if (n && (prev[m.id]?.lat !== n.lat || prev[m.id]?.lng !== n.lng || prev[m.id]?.heading !== n.heading)) {
            out[m.id] = n
            changed = true
          }
        })
        return changed ? out : prev
      })
    }

    if (anyAnimating) r.rafId = requestAnimationFrame(run)
  }, [allMembers, stateEveryNFrames])

  useEffect(() => {
    const r = refs.current
    const now = performance.now()
    r.startTime = now

    allMembers.forEach((m) => {
      const id = m.id
      const target = {
        lat: m.position.lat,
        lng: m.position.lng,
        heading:
          m.status.type === "moving" && "heading" in m.status
            ? (m.status.heading ?? 0)
            : r.display[id]?.heading ?? r.target[id]?.heading ?? 0,
      }
      const prev = r.display[id] ?? r.target[id] ?? {
        lat: m.position.lat,
        lng: m.position.lng,
        heading: target.heading,
      }
      r.start[id] = { ...prev }
      r.target[id] = target
      r.durations[id] = durationMs(
        { lat: prev.lat, lng: prev.lng },
        { lat: target.lat, lng: target.lng }
      ) / 1000
    })

    if (!r.rafId) r.rafId = requestAnimationFrame(run)
    return () => {
      if (r.rafId) cancelAnimationFrame(r.rafId)
      r.rafId = 0
    }
  }, [allMembers, run])

  return display
}
