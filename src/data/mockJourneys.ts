import type { Journey } from "@/types"
import { mockGroups } from "./mockGroups"

const center = { lat: 17.4485, lng: 78.3908 }

/** Valli's journey from office to home with interactions (mock) */
function buildValliJourney(): Journey {
  const group = mockGroups[0]
  const valli = group.members.find((m) => m.id === "sm-1")!
  const now = new Date()
  const startedAt = new Date(now.getTime() - 52 * 60 * 1000) // 52 min ago

  const start = { lat: center.lat + 0.003, lng: center.lng - 0.001 }
  const home = { lat: center.lat + 0.0015, lng: center.lng + 0.0005 }
  const path: { lat: number; lng: number }[] = [
    start,
    { lat: center.lat + 0.0028, lng: center.lng - 0.0002 },
    { lat: center.lat + 0.0022, lng: center.lng + 0.0002 },
    { lat: center.lat + 0.0018, lng: center.lng + 0.0004 },
    home,
  ]

  const t = (minsAgo: number) =>
    new Date(startedAt.getTime() + (52 - minsAgo) * 60 * 1000)

  const events: Journey["events"] = [
    {
      id: "je-1",
      type: "start",
      timestamp: t(52),
      position: start,
      label: "Left office",
      message: "Started journey home",
    },
    {
      id: "je-2",
      type: "status_change",
      timestamp: t(38),
      position: path[1],
      label: "Stopped at signal",
      message: "Status: stopped at traffic signal",
    },
    {
      id: "je-3",
      type: "help_requested",
      timestamp: t(28),
      position: path[2],
      label: "Asked for help",
      message: "Valli requested help. You received the notification.",
    },
    {
      id: "je-4",
      type: "assistance_accepted",
      timestamp: t(25),
      position: path[2],
      label: "You accepted",
      message: "You accepted the request and opened chat.",
    },
    {
      id: "je-5",
      type: "message",
      timestamp: t(22),
      position: path[3],
      label: "Chat: “I’m on my way”",
      message: "You sent: I'm on my way. Stay on the line.",
    },
    {
      id: "je-6",
      type: "reached_home",
      timestamp: t(0),
      position: home,
      label: "Reached home",
      message: "Valli reached home safely.",
    },
  ]

  return {
    id: "journey-valli-1",
    memberId: valli.id,
    member: { ...valli },
    path,
    home,
    startedAt,
    endedAt: new Date(),
    events,
    progressOffset: 0,
    replaySpeed: 1,
  }
}

/** Anjali's journey: different path (SW to NE), faster pace, different statuses */
function buildAnjaliJourney(): Journey {
  const group = mockGroups[0]
  const anjali = group.members.find((m) => m.id === "sm-3")!
  const now = new Date()
  const startedAt = new Date(now.getTime() - 45 * 60 * 1000)

  const start = { lat: center.lat + 0.001, lng: center.lng - 0.004 }
  const end = { lat: center.lat + 0.0035, lng: center.lng - 0.0015 }
  const path: { lat: number; lng: number }[] = [
    start,
    { lat: center.lat + 0.0014, lng: center.lng - 0.0032 },
    { lat: center.lat + 0.002, lng: center.lng - 0.0024 },
    { lat: center.lat + 0.0026, lng: center.lng - 0.002 },
    end,
  ]

  const t = (minsAgo: number) =>
    new Date(startedAt.getTime() + (45 - minsAgo) * 60 * 1000)

  const events: Journey["events"] = [
    { id: "aj-1", type: "start", timestamp: t(45), position: start, label: "Headed to café", message: "Started" },
    { id: "aj-2", type: "status_change", timestamp: t(32), position: path[1], label: "Slowing down", message: "Near café" },
    { id: "aj-3", type: "message", timestamp: t(18), position: path[2], label: "“Be there in 10”", message: "Chat" },
    { id: "aj-4", type: "reached_home", timestamp: t(0), position: end, label: "Arrived", message: "Reached" },
  ]

  return {
    id: "journey-anjali-1",
    memberId: anjali.id,
    member: { ...anjali },
    path,
    home: end,
    startedAt,
    endedAt: new Date(),
    events,
    progressOffset: 0.28,
    replaySpeed: 1.35,
  }
}

/** Rahul's journey: different path (W to E), slower pace, different statuses */
function buildRahulJourney(): Journey {
  const group = mockGroups[0]
  const rahul = group.members.find((m) => m.id === "sm-4")!
  const now = new Date()
  const startedAt = new Date(now.getTime() - 60 * 60 * 1000)

  const start = { lat: center.lat - 0.0025, lng: center.lng + 0.002 }
  const end = { lat: center.lat - 0.0005, lng: center.lng + 0.005 }
  const path: { lat: number; lng: number }[] = [
    start,
    { lat: center.lat - 0.002, lng: center.lng + 0.0028 },
    { lat: center.lat - 0.0014, lng: center.lng + 0.0035 },
    { lat: center.lat - 0.0008, lng: center.lng + 0.0042 },
    end,
  ]

  const t = (minsAgo: number) =>
    new Date(startedAt.getTime() + (60 - minsAgo) * 60 * 1000)

  const events: Journey["events"] = [
    { id: "rj-5", type: "reached_home", timestamp: t(0), position: end, label: "Reached", message: "Arrived" },
    { id: "rj-4", type: "message", timestamp: t(10), position: path[3], label: "“Running 5 mins late”", message: "Chat" },
    { id: "rj-3", type: "status_change", timestamp: t(20), position: path[2], label: "Back on route", message: "Resumed" },
    { id: "rj-1b", type: "status_change", timestamp: t(34), position: path[1], label: "sudden halt", message: "Sudden halt detected" },
    { id: "rj-2", type: "status_change", timestamp: t(42), position: path[1], label: "Stopped at store", message: "Quick stop" },
    { id: "rj-1", type: "start", timestamp: t(60), position: start, label: "On the way", message: "Started" },
  ]

  return {
    id: "journey-rahul-1",
    memberId: rahul.id,
    member: { ...rahul },
    path,
    home: end,
    startedAt,
    endedAt: new Date(),
    events,
    progressOffset: 0.55,
    replaySpeed: 0.82,
  }
}

export const mockJourneys: Journey[] = [
  buildValliJourney(),
  buildAnjaliJourney(),
  buildRahulJourney(),
]

/** Get journey for a member if one exists */
export function getJourneyForMember(memberId: string): Journey | undefined {
  return mockJourneys.find((j) => j.memberId === memberId)
}
