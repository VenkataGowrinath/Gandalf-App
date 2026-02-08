export type LatLng = { lat: number; lng: number }

export type MemberStatus =
  | { type: "stationary"; text?: string }
  | { type: "moving"; text: string; heading?: number; speed?: number }
  | { type: "anomaly_detected"; text?: string }
  | { type: "help_requested"; text?: string }
  | { type: "offline"; text?: string }
  | { type: "low_battery"; text?: string }
  | { type: "emergency"; text?: string }
  | { type: "sudden_halt"; text?: string }

export interface CommunityMember {
  id: string
  name: string
  avatar: string
  position: LatLng
  status: MemberStatus
  assistanceRadiusMeters?: number
}

export interface Group {
  id: string
  name: string
  members: CommunityMember[]
  currentUser: CommunityMember
}

export type IntentOption =
  | "Safety Status"
  | "Route Deviation"
  | "Timing Anomaly"
  | "Assistance Feasibility"
  | "Are you safe?"
  | "Need pickup?"
  | "Share route"
  | "I'm coming"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface IncomingHelpRequest {
  id: string
  fromMember: CommunityMember
  message: string
  timestamp: Date
}

export interface IncomingNotification {
  id: string
  fromMember: CommunityMember
  message: string
  timestamp: Date
  intent?: IntentOption
}

/** One event in a friend's journey (status change, help request, interaction, etc.) */
export type JourneyEventType =
  | "start"
  | "status_change"
  | "help_requested"
  | "assistance_accepted"
  | "anomaly"
  | "message"
  | "call"
  | "reached_home"

export interface JourneyEvent {
  id: string
  type: JourneyEventType
  timestamp: Date
  position?: LatLng
  message?: string
  label: string
}

/** A friend's journey from start to home with path and timeline of interactions */
export interface Journey {
  id: string
  memberId: string
  member: CommunityMember
  /** Ordered path from start to home */
  path: LatLng[]
  home: LatLng
  startedAt: Date
  endedAt?: Date
  events: JourneyEvent[]
  /** Replay: phase offset 0–1 (where in the loop this journey starts) */
  progressOffset?: number
  /** Replay: speed multiplier (e.g. 1.2 = 20% faster) */
  replaySpeed?: number
}
