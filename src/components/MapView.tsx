import { useMemo, useEffect, useRef, useState, type ReactNode } from "react"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet"
import L from "leaflet"
import type { Group, CommunityMember } from "@/types"
import { useInterpolatedPositions } from "@/lib/useInterpolatedPositions"
import "leaflet/dist/leaflet.css"

// Fix default icon 404 in production (bundler doesn't copy Leaflet's images)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const DEFAULT_ZOOM = 16
const TRAIL_SECONDS = 8
const TRAIL_PUSH_INTERVAL_MS = 200

const MARKER_COLORS = ["#FCD34D", "#F472B6", "#FB7185", "#C084FC", "#67E8F9", "#FDE047"] as const

function getStatusLabel(status: CommunityMember["status"]): string {
  switch (status.type) {
    case "moving":
      return status.text ?? "moving"
    case "stationary":
      return "stopped"
    case "anomaly_detected":
      return "anomaly"
    case "help_requested":
      return "needs help"
    case "offline":
      return "offline"
    case "low_battery":
      return status.text ? `low battery ${status.text}` : "low battery"
    case "emergency":
      return "emergency"
    case "sudden_halt":
      return status.text ?? "sudden halt"
    default:
      return ""
  }
}

function getMarkerBg(member: CommunityMember, index: number): string {
  if (member.id.startsWith("me-")) return "#4ADE80"
  if (member.status.type === "low_battery") return "#C084FC"
  if (member.status.type === "emergency") return "#F472B6"
  if (member.status.type === "sudden_halt") return "#dc2626"
  return MARKER_COLORS[index % MARKER_COLORS.length]
}

/** Funky neo-brutalist marker: colored circle, black border, blue pill tooltip; sudden_halt = danger design */
function createMemberIcon(
  member: CommunityMember,
  _heading: number,
  index: number
): L.DivIcon {
  const isMe = member.id.startsWith("me-")
  const isSuddenHalt = member.status.type === "sudden_halt"
  const size = isMe ? 56 : index % 3 === 0 ? 56 : 52

  if (isSuddenHalt) {
    const cursor = "pointer"
    const classes = getStatusClasses(member.status)
    const dangerInlineStyles = `
<style>
@keyframes sudden-halt-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.85; transform: scale(1.06); }
}
@keyframes sudden-halt-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(2); opacity: 0; }
}
@keyframes sudden-halt-flash {
  0%, 100% { background-color: #ef4444; }
  50% { background-color: #991b1b; }
}
@keyframes sudden-halt-stripes {
  from { background-position: 0 0; }
  to { background-position: 20px 0; }
}
.sudden-halt-avatar {
  animation: sudden-halt-blink 1.5s ease-in-out infinite;
}
.sudden-halt-ring {
  position: absolute;
  inset: -8px;
  border: 6px solid #ef4444;
  border-radius: 50%;
  animation: sudden-halt-ring 1.5s ease-out infinite;
  pointer-events: none;
}
.sudden-halt-tooltip-inner {
  background-image: linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%, transparent 50%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.1) 75%, transparent 75%, transparent);
  background-size: 20px 20px;
  animation: sudden-halt-flash 1.2s ease-in-out infinite, sudden-halt-stripes 1s linear infinite;
}
</style>
`
    const dangerTooltip =
      '<div style="position:absolute;bottom:-24px;left:50%;transform:translateX(-50%);z-index:20;"><div class="sudden-halt-tooltip-inner" style="color:white;font-size:12px;font-weight:800;padding:8px 16px;border-radius:8px;border:2px solid #000;box-shadow:2px 2px 0 0 rgba(0,0,0,1);white-space:nowrap;font-family:Fredoka,sans-serif;">sudden halt</div></div>'
    const dangerHtml = `
      ${dangerInlineStyles}
      <div class="${classes}" data-member-id="${member.id}" style="display:flex;flex-direction:column;align-items:center;cursor:${cursor};position:relative;">
        <div style="position:relative;">
          <div class="sudden-halt-ring"></div>
          <div class="sudden-halt-avatar" style="position:relative;z-index:10;width:${size}px;height:${size}px;overflow:hidden;border-radius:50%;border:4px solid #000;box-shadow:2px 2px 0 0 rgba(0,0,0,1);background:#dc2626;display:flex;align-items:center;justify-content:center;">
            <img src="${member.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />
          </div>
        </div>
        ${dangerTooltip}
      </div>
    `
    const dangerHeight = size + 40
    return L.divIcon({
      html: dangerHtml,
      className: "border-0 bg-transparent",
      iconSize: [size + 32, dangerHeight],
      iconAnchor: [(size + 32) / 2, size / 2 + 12],
    })
  }

  const statusText = member.status.type === "moving"
    ? (member.status.type === "moving" ? member.status.text : null) ?? "moving"
    : getStatusLabel(member.status)
  const classes = getStatusClasses(member.status)
  const cursor = isMe ? "default" : "pointer"
  const bg = getMarkerBg(member, index)
  const avatarClass = member.status.type === "emergency" ? "member-marker-avatar " : ""
  const tooltipRotate = (index % 5) - 2
  const overflowCircle = member.status.type === "emergency" ? "visible" : "hidden"
  const innerContent = isMe
    ? `<span style="font-size:${size >= 56 ? "22" : "18"}px;font-weight:700;color:#000;font-family:Fredoka,sans-serif;">ME</span>`
    : `<img src="${member.avatar}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" />`
  const showTooltip = !isMe && member.status.type === "moving" && statusText
  const tooltipHtml = showTooltip
    ? `<div style="margin-top:-12px;background:#3B82F6;color:#fff;font-size:11px;font-weight:700;padding:6px 12px;border-radius:9999px;border:2px solid #000;box-shadow:2px 2px 0 0 rgba(0,0,0,1);white-space:nowrap;transform:rotate(${tooltipRotate}deg);font-family:Fredoka,sans-serif;">${statusText}</div>`
    : ""
  const floatClass = index % 2 === 0 ? "animate-float" : "animate-float-delayed"
  const wrapperClasses = isMe ? classes : `${classes} ${floatClass}`
  const tooltipHeight = 32
  const totalHeight = isMe ? size + 8 : showTooltip ? size + (tooltipHeight - 12) : size + 8
  const anchorY = isMe ? (size + 8) / 2 : size / 2
  return L.divIcon({
    html: `
      <div class="${wrapperClasses}" data-member-id="${member.id}" style="display:flex;flex-direction:column;align-items:center;cursor:${cursor};">
        <div style="position:relative;">
          <div class="${avatarClass}" style="position:relative;width:${size}px;height:${size}px;overflow:${overflowCircle};border-radius:50%;border:4px solid #000;box-shadow:2px 2px 0 0 rgba(0,0,0,1);background:${bg};display:flex;align-items:center;justify-content:center;">
            ${innerContent}
          </div>
        </div>
        ${tooltipHtml}
      </div>
    `,
    className: "border-0 bg-transparent",
    iconSize: [size + 8, totalHeight],
    iconAnchor: [(size + 8) / 2, anchorY],
  })
}

function getStatusClasses(status: CommunityMember["status"]): string {
  const base = "member-marker-wrapper"
  if (status.type === "anomaly_detected") return `${base} anomaly`
  if (status.type === "emergency") return `${base} emergency`
  if (status.type === "moving") return `${base} moving`
  if (status.type === "sudden_halt") return `${base} sudden-halt`
  return base
}

const GRID_PANE_Z = 350 // above tile (200), below marker (600)

/** Renders the grid inside a Leaflet pane so markers stay on top */
function GridOverlayPane() {
  const map = useMap()
  useEffect(() => {
    if (!map.getPane("gridOverlay")) {
      map.createPane("gridOverlay")
      const pane = map.getPane("gridOverlay")
      if (pane) {
        pane.style.zIndex = String(GRID_PANE_Z)
        pane.style.pointerEvents = "none"
        pane.style.overflow = "hidden"
        pane.style.borderRadius = "0.75rem"
        pane.style.width = "100%"
        pane.style.height = "100%"
        pane.innerHTML = `
          <svg width="100%" height="100%" style="opacity:0.4;position:absolute;inset:0;">
            <defs>
              <pattern id="funky-grid-pane" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#funky-grid-pane)"/>
          </svg>
        `
      }
    }
  }, [map])
  return null
}

/** Listens for clicks on marker elements (data-member-id) and invokes onMemberClick with pixel position */
function MapMarkerClickHandler({
  group,
  allMembers,
  onMemberClick,
}: {
  group: Group
  allMembers: CommunityMember[]
  onMemberClick?: (member: CommunityMember, anchorPoint: { x: number; y: number }) => void
}) {
  const map = useMap()
  useEffect(() => {
    if (!onMemberClick) return
    const container = map.getContainer()
    const handleClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-member-id]")
      if (!el) return
      const memberId = el.getAttribute("data-member-id")
      if (!memberId || memberId === group.currentUser.id) return
      const member = allMembers.find((m) => m.id === memberId)
      if (!member) return
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      onMemberClick(member, { x, y })
    }
    container.addEventListener("click", handleClick, true)
    return () => container.removeEventListener("click", handleClick, true)
  }, [map, group.currentUser.id, allMembers, onMemberClick])
  return null
}

/** Renders member markers (no click handlers on Marker - MapMarkerClickHandler does delegated click) */
function MemberMarkers({
  group: _group,
  display,
  allMembers,
  trails,
}: {
  group: Group
  display: Record<string, { lat: number; lng: number; heading: number }>
  allMembers: CommunityMember[]
  trails: Record<string, { lat: number; lng: number; t: number }[]>
}) {
  return (
    <>
      {allMembers.map((m) => {
        const points = trails[m.id]
        if (points && points.length >= 2)
          return (
            <Polyline
              key={`trail-${m.id}`}
              positions={points.map((p) => [p.lat, p.lng] as [number, number])}
              pathOptions={{
                color: "#0f172a",
                weight: 3,
                opacity: 0.35,
              }}
            />
          )
        return null
      })}
      {allMembers.map((member, idx) => {
        const d = display[member.id] ?? {
          lat: member.position.lat,
          lng: member.position.lng,
          heading:
            member.status.type === "moving" &&
            "heading" in member.status
              ? (member.status.heading ?? 0)
              : 0,
        }
        return (
          <Marker
            key={member.id}
            position={[d.lat, d.lng]}
            icon={createMemberIcon(member, 0, idx)}
          />
        )
      })}
    </>
  )
}

export function MapView({
  group,
  onMemberClick,
  friendCard,
}: {
  group: Group
  onMemberClick?: (member: CommunityMember, anchorPoint: { x: number; y: number }) => void
  friendCard?: ReactNode
}) {
  const allMembers = useMemo(
    () => [group.currentUser, ...group.members],
    [group]
  )
  const center: [number, number] = [
    group.currentUser.position.lat,
    group.currentUser.position.lng,
  ]

  const display = useInterpolatedPositions(allMembers, 3)

  const [trails, setTrails] = useState<
    Record<string, { lat: number; lng: number; t: number }[]>
  >({})
  const lastPushRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      const cut = now - TRAIL_SECONDS * 1000
      setTrails((prev) => {
        const next = { ...prev }
        let changed = false
        allMembers.forEach((m) => {
          if (m.status.type !== "moving" || m.id === group.currentUser.id)
            return
          const pos = display[m.id]
          if (!pos) return
          const last = lastPushRef.current[m.id] ?? 0
          if (now - last < TRAIL_PUSH_INTERVAL_MS) return
          lastPushRef.current[m.id] = now
          const arr = [...(prev[m.id] ?? []), { ...pos, t: now }].filter(
            (p) => p.t >= cut
          )
          next[m.id] = arr
          changed = true
        })
        return changed ? next : prev
      })
    }, TRAIL_PUSH_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [allMembers, group.currentUser.id, display])

  return (
    <div className="relative h-full w-full min-h-[300px] overflow-hidden isolate rounded-2xl p-5 neo-shadow bg-white pointer-events-none">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-full w-full min-h-[280px] rounded-xl pointer-events-auto relative z-0 border-2 border-black neo-shadow"
        zoomControl={false}
        style={{ background: "#e5e7eb", boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <GridOverlayPane />
        <MapMarkerClickHandler
          group={group}
          allMembers={allMembers}
          onMemberClick={onMemberClick}
        />
        <MemberMarkers
          group={group}
          display={display}
          allMembers={allMembers}
          trails={trails}
        />
      </MapContainer>
      <div className="pointer-events-auto">{friendCard}</div>
    </div>
  )
}