import { useMemo, useEffect } from "react"
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet"
import L from "leaflet"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet"
import type { Journey, JourneyEvent, JourneyEventType } from "@/types"
import {
  MapPin,
  Home,
  Play,
  AlertCircle,
  HandHelping,
  CheckCircle2,
  MessageCircle,
  Phone,
  Circle,
} from "lucide-react"
import "leaflet/dist/leaflet.css"

const pathOptions = {
  color: "#0f172a",
  weight: 4,
  opacity: 0.8,
}

function FitPathBounds({ path }: { path: { lat: number; lng: number }[] }) {
  const map = useMap()
  useEffect(() => {
    if (path.length < 2) return
    const bounds = L.latLngBounds(path.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 16 })
  }, [map, path])
  return null
}

function createPinIcon(label: string, color: string) {
  return L.divIcon({
    html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
      <div style="width:32px;height:32px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.2);"></div>
      <span style="font-size:10px;font-weight:600;color:#0f172a;white-space:nowrap;background:#fff;padding:2px 6px;border-radius:100px;box-shadow:0 1px 4px rgba(0,0,0,0.1);">${label}</span>
    </div>`,
    className: "border-0 bg-transparent",
    iconSize: [64, 48],
    iconAnchor: [16, 24],
  })
}

function JourneyMap({ journey }: { journey: Journey }) {
  const path = journey.path
  const positions = useMemo(
    () => path.map((p) => [p.lat, p.lng] as [number, number]),
    [path]
  )
  const start = path[0]
  const home = journey.home

  return (
    <div className="h-[220px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <MapContainer
        center={[start.lat, start.lng]}
        zoom={14}
        className="h-full w-full rounded-xl"
        zoomControl={false}
        style={{ background: "#B8EDD2" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
        />
        <FitPathBounds path={path} />
        <Polyline positions={positions} pathOptions={pathOptions} />
        <Marker
          position={[start.lat, start.lng]}
          icon={createPinIcon("Start", "#34d399")}
        />
        <Marker
          position={[home.lat, home.lng]}
          icon={createPinIcon("Home", "#0f172a")}
        />
      </MapContainer>
    </div>
  )
}

function eventIcon(type: JourneyEventType) {
  switch (type) {
    case "start":
      return <Play className="h-4 w-4 text-slate-600" />
    case "status_change":
      return <Circle className="h-4 w-4 text-slate-500" />
    case "help_requested":
      return <HandHelping className="h-4 w-4 text-amber-600" />
    case "assistance_accepted":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "anomaly":
      return <AlertCircle className="h-4 w-4 text-amber-600" />
    case "message":
      return <MessageCircle className="h-4 w-4 text-slate-600" />
    case "call":
      return <Phone className="h-4 w-4 text-slate-600" />
    case "reached_home":
      return <Home className="h-4 w-4 text-green-600" />
    default:
      return <MapPin className="h-4 w-4 text-slate-500" />
  }
}

function formatTime(d: Date) {
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function TimelineEvent({ event }: { event: JourneyEvent }) {
  return (
    <div className="flex gap-3 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[var(--shadow-soft)]">
        {eventIcon(event.type)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">
          {formatTime(event.timestamp)}
        </p>
        <p className="text-sm font-semibold text-slate-900">{event.label}</p>
        {event.message && event.message !== event.label && (
          <p className="mt-0.5 text-xs text-slate-600">{event.message}</p>
        )}
      </div>
    </div>
  )
}

export function JourneyViewSheet({
  journey,
  open,
  onOpenChange,
}: {
  journey: Journey | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!journey) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <img
              src={journey.member.avatar}
              alt=""
              className="h-[58px] w-[58px] rounded-full bg-white object-cover"
            />
            <div>
              <span className="block">{journey.member.name}&apos;s journey</span>
              <span className="text-xs font-normal text-slate-500">
                Start → Home · {journey.events.length} events
              </span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-col gap-4 overflow-y-auto pt-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Route
            </p>
            <JourneyMap journey={journey} />
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Timeline & interactions
            </p>
            <div className="divide-y divide-slate-100">
              {journey.events.map((event) => (
                <TimelineEvent key={event.id} event={event} />
              ))}
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
