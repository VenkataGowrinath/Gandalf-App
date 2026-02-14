import { useMemo, useCallback, type ReactNode } from "react"
import Map, { Source, Layer, Marker, useMap } from "react-map-gl/maplibre"
import type { LayerProps } from "react-map-gl/maplibre"
import type { Group, CommunityMember } from "@/types"
import { useInterpolatedPositions } from "@/lib/useInterpolatedPositions"
import { HEATMAP_GEOJSON } from "@/lib/constants"
import "maplibre-gl/dist/maplibre-gl.css"

/** Heatmap layer: intensity drives color; higher = blue (safer), lower = red (less safe). Renders under markers. */
const heatmapLayerStyle: LayerProps = {
  id: "heatmap-layer",
  type: "heatmap",
  maxzoom: 19,
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "intensity"], 0, 0, 1, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 14, 1.5, 19, 1.1],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0, "rgba(0,0,0,0)",
      0.08, "rgba(220,50,50,0.6)",
      0.2, "rgba(255,140,0,0.6)",
      0.35, "rgba(255,200,100,0.5)",
      0.5, "rgba(128,128,128,0.5)",
      0.65, "rgba(100,180,255,0.5)",
      0.85, "rgba(59,130,246,0.6)",
      1, "rgba(37,99,235,0.7)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 22, 12, 45, 15, 72, 19, 55],
    "heatmap-opacity": 0.65,
  },
}

const DEFAULT_ZOOM = 16

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

function getStatusClasses(status: CommunityMember["status"]): string {
  const base = "member-marker-wrapper"
  if (status.type === "anomaly_detected") return `${base} anomaly`
  if (status.type === "emergency") return `${base} emergency`
  if (status.type === "moving") return `${base} moving`
  if (status.type === "sudden_halt") return `${base} sudden-halt`
  return base
}

/** MapLibre marker content (neo-brutalist avatar + tooltip) */
function MemberMarkerContent({ member, index }: { member: CommunityMember; index: number }) {
  const isMe = member.id.startsWith("me-")
  const isSuddenHalt = member.status.type === "sudden_halt"
  const size = isMe ? 56 : index % 3 === 0 ? 56 : 52
  const statusText =
    member.status.type === "moving"
      ? (member.status as { text?: string }).text ?? "moving"
      : getStatusLabel(member.status)
  const classes = getStatusClasses(member.status)
  const bg = getMarkerBg(member, index)
  const avatarClass = member.status.type === "emergency" ? "member-marker-avatar " : ""
  const tooltipRotate = (index % 5) - 2
  const overflowCircle = member.status.type === "emergency" ? "visible" : "hidden"
  const showTooltip = !isMe && member.status.type === "moving" && statusText
  const floatClass = index % 2 === 0 ? "animate-float" : "animate-float-delayed"
  const wrapperClasses = isMe ? classes : `${classes} ${floatClass}`

  if (isSuddenHalt) {
    return (
      <div
        className={wrapperClasses}
        data-member-id={member.id}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", position: "relative" }}
      >
        <div style={{ position: "relative", zIndex: 0 }}>
          <div className="member-marker-sudden-halt-ring" />
          <div
            className="sudden-halt-avatar"
            style={{
              position: "relative", width: size, height: size, overflow: "hidden", borderRadius: "50%",
              border: "4px solid #000", boxShadow: "2px 2px 0 0 rgba(0,0,0,1)", background: "#dc2626",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <img src={member.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        </div>
        <div className="sudden-halt-tooltip-inner" style={{ marginTop: -12, position: "relative", zIndex: 1 }}>
          sudden halt
        </div>
      </div>
    )
  }

  return (
    <div className={wrapperClasses} data-member-id={member.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: isMe ? "default" : "pointer" }}>
      <div
        className={avatarClass}
        style={{
          position: "relative", width: size, height: size, overflow: overflowCircle, borderRadius: "50%",
          border: "4px solid #000", boxShadow: "2px 2px 0 0 rgba(0,0,0,1)", background: bg,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {isMe ? (
          <span style={{ fontSize: size >= 56 ? 22 : 18, fontWeight: 700, color: "#000", fontFamily: "Fredoka, sans-serif" }}>ME</span>
        ) : (
          <img src={member.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </div>
      {showTooltip && (
        <div style={{ marginTop: -12, background: "#3B82F6", color: "#fff", fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 9999, border: "2px solid #000", boxShadow: "2px 2px 0 0 rgba(0,0,0,1)", whiteSpace: "nowrap", transform: `rotate(${tooltipRotate}deg)`, fontFamily: "Fredoka, sans-serif" }}>
          {statusText}
        </div>
      )}
    </div>
  )
}

/** Renders MapLibre markers; must be child of Map to use useMap for click anchor */
function MapLibreMarkers({
  group: _group,
  display,
  allMembers,
  onMemberClick,
}: {
  group: Group
  display: Record<string, { lat: number; lng: number; heading: number }>
  allMembers: CommunityMember[]
  onMemberClick?: (member: CommunityMember, anchorPoint: { x: number; y: number }) => void
}) {
  const { current: mapRef } = useMap()
  const handleMarkerClick = useCallback(
    (member: CommunityMember) => (e: { originalEvent: MouseEvent }) => {
      if (member.id.startsWith("me-") || !onMemberClick || !mapRef) return
      const container = mapRef.getMap().getContainer()
      const rect = container.getBoundingClientRect()
      onMemberClick(member, { x: e.originalEvent.clientX - rect.left, y: e.originalEvent.clientY - rect.top })
    },
    [onMemberClick, mapRef]
  )
  return (
    <>
      {allMembers.map((member, idx) => {
        const d = display[member.id] ?? {
          lat: member.position.lat,
          lng: member.position.lng,
          heading: member.status.type === "moving" && "heading" in member.status ? (member.status as { heading?: number }).heading ?? 0 : 0,
        }
        return (
          <Marker
            key={member.id}
            longitude={d.lng}
            latitude={d.lat}
            anchor="bottom"
            onClick={handleMarkerClick(member)}
            style={{ cursor: member.id.startsWith("me-") ? "default" : "pointer" }}
          >
            <MemberMarkerContent member={member} index={idx} />
          </Marker>
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
  const display = useInterpolatedPositions(allMembers, 3)

  const initialViewState = useMemo(
    () => ({
      longitude: group.currentUser.position.lng,
      latitude: group.currentUser.position.lat,
      zoom: DEFAULT_ZOOM,
    }),
    [group.currentUser.position.lng, group.currentUser.position.lat]
  )

  return (
    <div className="relative h-full w-full min-h-[300px] overflow-hidden isolate rounded-2xl p-5 neo-shadow bg-white pointer-events-none">
      <div className="h-full w-full min-h-[280px] rounded-xl pointer-events-auto relative z-0 border-2 border-black neo-shadow overflow-hidden" style={{ background: "#f2f3f0", boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}>
        <Map
          initialViewState={initialViewState}
          mapStyle="/map-styles/positron.json"
          style={{ width: "100%", height: "100%", minHeight: 280 }}
        >
          <Source id="heatmap-source" type="geojson" data={HEATMAP_GEOJSON}>
            <Layer {...heatmapLayerStyle} />
          </Source>
          <MapLibreMarkers
            group={group}
            display={display}
            allMembers={allMembers}
            onMemberClick={onMemberClick}
          />
        </Map>
      </div>
      <div className="pointer-events-auto">{friendCard}</div>
    </div>
  )
}