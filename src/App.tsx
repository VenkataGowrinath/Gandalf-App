import { useState, useCallback, useEffect, useRef } from "react"
import { MapView } from "@/components/MapView"
import { GroupHeader } from "@/components/GroupHeader"
import { BottomCTAs } from "@/components/BottomCTAs"
import { FriendActionSheet } from "@/components/FriendActionSheet"
import { AssistChatPanel } from "@/components/AssistChatPanel"
import { HelpRequestBanner } from "@/components/HelpRequestBanner"
import { NavigateSheet } from "@/components/NavigateSheet"
import { AnomalyToast } from "@/components/AnomalyToast"
import { JourneyViewSheet } from "@/components/JourneyViewSheet"
import { mockGroups } from "@/data/mockGroups"
import { getJourneyForMember } from "@/data/mockJourneys"
import {
  getPositionAlongPath,
  getHeadingAlongPath,
  getEventLabelAtProgress,
  getReplayProgress,
} from "@/lib/journeyReplay"
import type { CommunityMember, Group, IncomingHelpRequest, IntentOption } from "@/types"
import { MapPin } from "lucide-react"
import "./index.css"

const JOURNEY_REPLAY_DURATION_MS = 48_000
const JOURNEY_REPLAY_TICK_MS = 180

export default function App() {
  const [currentGroupId, setCurrentGroupId] = useState(mockGroups[0].id)
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null)
  const [friendSheetOpen, setFriendSheetOpen] = useState(false)
  const [friendCardAnchor, setFriendCardAnchor] = useState<{ x: number; y: number } | null>(null)
  const [helpRequest, setHelpRequest] = useState<IncomingHelpRequest | null>(null)
  const [navigateOpen, setNavigateOpen] = useState(false)
  const [navigateDestination, setNavigateDestination] = useState<string | undefined>()
  const [journeyViewOpen, setJourneyViewOpen] = useState(false)
  const [journeyMemberId, setJourneyMemberId] = useState<string | null>(null)
  const [chatInitialMemberId, setChatInitialMemberId] = useState<string | null>(null)
  const [chatInitialIntent, setChatInitialIntent] = useState<IntentOption | null>(null)
  const [anomaly, setAnomaly] = useState<{
    message: string
    member: CommunityMember
  } | null>(null)
  const [frozenSuddenHalt, setFrozenSuddenHalt] = useState<{
    memberId: string
    position: { lat: number; lng: number }
  } | null>(null)
  const [centerOnPosition, setCenterOnPosition] = useState<{ lat: number; lng: number } | null>(null)

  const currentGroup =
    mockGroups.find((g) => g.id === currentGroupId) ?? mockGroups[0]

  const [liveGroup, setLiveGroup] = useState<Group | null>(null)
  const groupForMap = liveGroup ?? currentGroup

  const openChatWithMember = useCallback((memberId: string | null, intent: IntentOption | null) => {
    setChatInitialMemberId(memberId)
    setChatInitialIntent(intent)
    setChatOpen(true)
  }, [])

  const handleMemberClick = useCallback((member: CommunityMember, anchorPoint: { x: number; y: number }) => {
    setSelectedMember(member)
    setFriendCardAnchor(anchorPoint)
    // Clicking danger (sudden halt) marker opens AI proxy chat directly
    if (member.status.type === "sudden_halt") {
      openChatWithMember(member.id, "Safety Status")
      setFriendSheetOpen(false)
      return
    }
    setFriendSheetOpen(true)
  }, [openChatWithMember])

  const openNavigateToFriend = useCallback((destination?: string) => {
    setNavigateDestination(destination)
    setNavigateOpen(true)
  }, [])

  const openJourneyView = useCallback((memberId: string) => {
    setJourneyMemberId(memberId)
    setFriendSheetOpen(false)
    setJourneyViewOpen(true)
  }, [])

  // Mock: trigger a help request after 5s for demo
  useEffect(() => {
    const t = setTimeout(() => {
      const group = mockGroups[0]
      const from = group.members[0]
      if (from) {
        setHelpRequest((prev) =>
          prev
            ? prev
            : {
                id: `hr-${Date.now()}`,
                fromMember: from,
                message: `${from.name} is asking for help. Can you assist?`,
                timestamp: new Date(),
              }
        )
      }
    }, 5000)
    return () => clearTimeout(t)
  }, [])

  // Mock: anomaly alert after 8s
  useEffect(() => {
    const t = setTimeout(() => {
      const group = mockGroups[0]
      const member = group.members[0]
      if (member) {
        setAnomaly({
          message: `${member.name} stopped unexpectedly.`,
          member,
        })
      }
    }, 8000)
    return () => clearTimeout(t)
  }, [])

  const journeyReplayStartRef = useRef(Date.now())

  useEffect(() => {
    setLiveGroup(null)
    setFrozenSuddenHalt(null)
    setCenterOnPosition(null)
    journeyReplayStartRef.current = Date.now()
  }, [currentGroupId])

  // Journey replay: members with a journey move along the path; when sudden_halt appears avatar freezes and map recenters until user interacts with proxy
  useEffect(() => {
    const base = currentGroup
    const interval = setInterval(() => {
      const progress = getReplayProgress(
        journeyReplayStartRef.current,
        JOURNEY_REPLAY_DURATION_MS
      )
      let hasJourneyMember = false
      const members = base.members.map((m) => {
        if (frozenSuddenHalt?.memberId === m.id) {
          hasJourneyMember = true
          return {
            ...m,
            position: frozenSuddenHalt.position,
            status: { type: "sudden_halt" as const, text: "sudden halt" },
          }
        }
        const journey = getJourneyForMember(m.id)
        if (!journey || journey.path.length < 2) return m
        hasJourneyMember = true
        const speed = journey.replaySpeed ?? 1
        const offset = journey.progressOffset ?? 0
        const memberProgress = (progress * speed + offset) % 1
        const position = getPositionAlongPath(journey.path, memberProgress)
        const heading = Math.round(
          getHeadingAlongPath(journey.path, memberProgress)
        )
        const endTime = journey.endedAt ?? new Date(journey.startedAt.getTime() + 60 * 60 * 1000)
        const label = getEventLabelAtProgress(
          journey.events,
          journey.startedAt,
          endTime,
          memberProgress
        )
        const isSuddenHalt = label.toLowerCase() === "sudden halt"
        if (isSuddenHalt && (!frozenSuddenHalt || frozenSuddenHalt.memberId !== m.id)) {
          setFrozenSuddenHalt({ memberId: m.id, position })
          setCenterOnPosition(position)
        }
        return {
          ...m,
          position,
          status: isSuddenHalt
            ? { type: "sudden_halt" as const, text: "sudden halt" }
            : {
                type: "moving" as const,
                text: label,
                heading,
              },
        }
      })
      if (hasJourneyMember)
        setLiveGroup((prev) => ({
          ...(prev ?? base),
          members,
        }))
    }, JOURNEY_REPLAY_TICK_MS)
    return () => clearInterval(interval)
  }, [currentGroup, frozenSuddenHalt])

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#B8EDD2] md:max-w-lg md:mx-auto md:rounded-2xl md:border-2 md:border-black md:shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
      {/* Map container: map + all overlays inside with padding from map edges */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <MapView
            group={groupForMap}
            onMemberClick={handleMemberClick}
            centerOn={centerOnPosition}
            friendCard={
              friendSheetOpen && selectedMember && friendCardAnchor ? (
                <FriendActionSheet
                  member={selectedMember}
                  open={true}
                  onOpenChange={setFriendSheetOpen}
                  anchorPoint={friendCardAnchor}
                  onMessage={() => openChatWithMember(selectedMember?.id ?? null, null)}
                  onOfferAssistance={() => openChatWithMember(selectedMember?.id ?? null, "I'm coming")}
                  onViewRoute={() =>
                    selectedMember && openNavigateToFriend(selectedMember.name)
                  }
                  onViewJourney={
                    selectedMember ? () => openJourneyView(selectedMember.id) : undefined
                  }
                  showJourney={!!selectedMember && !!getJourneyForMember(selectedMember.id)}
                  onAIChat={() =>
                    openChatWithMember(selectedMember?.id ?? null, "Safety Status")
                  }
                />
              ) : null
            }
          />
        </div>
        <div className="absolute inset-5 z-10 safe-top safe-bottom flex flex-col pointer-events-none">
          <div className="relative flex-1 min-h-0">
            <div className="pointer-events-auto">
              <GroupHeader
                groups={mockGroups}
                currentGroup={currentGroup}
                onSelectGroup={setCurrentGroupId}
              />
            </div>
            <div className="absolute right-4 top-4 flex items-center gap-3 pointer-events-auto">
              <button
                type="button"
                className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white neo-shadow hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
                onClick={() => setNavigateOpen(true)}
                aria-label="Navigate"
              >
                <MapPin className="h-5 w-5" />
              </button>
              <div className="w-12 h-12 rounded-full bg-[#4ADE80] border-2 border-black flex items-center justify-center neo-shadow-sm overflow-hidden">
                <span className="font-bold text-black text-sm">ME</span>
              </div>
            </div>
            {anomaly && (
              <div className="pointer-events-auto">
                <AnomalyToast
                  message={anomaly.message}
                  member={anomaly.member}
                  onDismiss={() => setAnomaly(null)}
                  onCall={() => {
                    window.location.href = "tel:+919876543210"
                  }}
                  onChat={() => {
                    openChatWithMember(anomaly.member.id, "Safety Status")
                    setAnomaly(null)
                    setChatOpen(true)
                  }}
                  onProvideAssistance={() => {
                    openChatWithMember(anomaly.member.id, "I'm coming")
                    setAnomaly(null)
                    setChatOpen(true)
                  }}
                />
              </div>
            )}
            {helpRequest && (
              <div className="pointer-events-auto">
                <HelpRequestBanner
                  request={helpRequest}
                  onAccept={() => {
                    openChatWithMember(helpRequest.fromMember.id, "I'm coming")
                    setHelpRequest(null)
                    setChatOpen(true)
                  }}
                  onDecline={() => setHelpRequest(null)}
                  onNavigateToFriend={() => {
                    openNavigateToFriend(helpRequest.fromMember.name)
                    setHelpRequest(null)
                  }}
                  onDismiss={() => setHelpRequest(null)}
                />
              </div>
            )}
            <div className="pointer-events-auto">
              <BottomCTAs
                onAssistClick={() => {
                  setChatInitialMemberId(null)
                  setChatInitialIntent(null)
                  setChatOpen(true)
                }}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-1 right-2 z-0 pointer-events-none">
          <p className="text-[10px] text-green-800/40 font-bold">© FunkyMaps Contributors</p>
        </div>
      </div>

      <JourneyViewSheet
        journey={journeyMemberId ? getJourneyForMember(journeyMemberId) ?? null : null}
        open={journeyViewOpen}
        onOpenChange={setJourneyViewOpen}
      />

      <AssistChatPanel
        group={currentGroup}
        isOpen={chatOpen}
        onClose={() => {
          setChatOpen(false)
          if (chatInitialMemberId === frozenSuddenHalt?.memberId)
            setFrozenSuddenHalt(null)
        }}
        initialMemberId={chatInitialMemberId}
        initialIntent={chatInitialIntent}
      />

      <NavigateSheet
        open={navigateOpen}
        onOpenChange={setNavigateOpen}
        initialDestination={navigateDestination}
      />
    </div>
  )
}
