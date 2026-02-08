import { Button } from "@/components/ui/button"
import type { CommunityMember } from "@/types"
import { Phone, MessageCircle, HandHelping, MapPin, Bot, Route, X } from "lucide-react"

const CARD_OFFSET_PX = 44

function FriendActionCardContent({
  member,
  onClose,
  onMessage,
  onOfferAssistance,
  onViewRoute,
  onViewJourney,
  onAIChat,
  showJourney = false,
}: {
  member: CommunityMember
  onClose: () => void
  onMessage: () => void
  onOfferAssistance: () => void
  onViewRoute: () => void
  onViewJourney?: () => void
  onAIChat: () => void
  showJourney?: boolean
}) {
  return (
    <>
      <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
        <div className="h-14 w-14 rounded-full border-2 border-black neo-shadow-sm overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
          <img src={member.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-bold text-black truncate">{member.name}</span>
          {member.status.type !== "stationary" && (
            <span className="mt-0.5 inline-block rounded-full bg-[#3B82F6] text-white px-2 py-0.5 text-xs font-bold border-2 border-black neo-shadow-sm">
              {member.status.type === "moving" && member.status.text
                ? member.status.text
                : member.status.type.replace("_", " ")}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-2 border-2 border-black neo-shadow-sm text-slate-700 hover:translate-y-0.5 hover:shadow-none transition-all"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-col gap-2 pt-3 max-h-[50vh] overflow-y-auto">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-3 border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all font-bold"
          onClick={() => {
            window.location.href = `tel:+919876543210`
          }}
        >
          <Phone className="h-4 w-4" />
          Call
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start gap-3 border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all font-bold" onClick={() => { onClose(); onMessage() }}>
          <MessageCircle className="h-4 w-4" />
          Message
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start gap-3 border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all font-bold" onClick={() => { onClose(); onOfferAssistance() }}>
          <HandHelping className="h-4 w-4" />
          Offer assistance
        </Button>
        <Button variant="outline" size="sm" className="w-full justify-start gap-3 border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all font-bold" onClick={() => { onClose(); onViewRoute() }}>
          <MapPin className="h-4 w-4" />
          View route
        </Button>
        {showJourney && onViewJourney && (
          <Button variant="outline" size="sm" className="w-full justify-start gap-3 border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all font-bold" onClick={() => { onClose(); onViewJourney() }}>
            <Route className="h-4 w-4" />
            View journey
          </Button>
        )}
        <Button variant="outline" size="sm" className="w-full justify-start gap-3 border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all font-bold" onClick={() => { onClose(); onAIChat() }}>
          <Bot className="h-4 w-4" />
          Open AI proxy chat
        </Button>
      </div>
    </>
  )
}

export function FriendActionSheet({
  member,
  open,
  onOpenChange,
  anchorPoint,
  onMessage,
  onOfferAssistance,
  onViewRoute,
  onViewJourney,
  onAIChat,
  showJourney = false,
}: {
  member: CommunityMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  anchorPoint: { x: number; y: number } | null
  onMessage: () => void
  onOfferAssistance: () => void
  onViewRoute: () => void
  onViewJourney?: () => void
  onAIChat: () => void
  showJourney?: boolean
}) {
  if (!member || !open) return null

  // Floating card right below the avatar (anchor is marker position; card sits below it)
  const top = anchorPoint ? anchorPoint.y + CARD_OFFSET_PX : 0
  const left = anchorPoint ? anchorPoint.x : 0

  return (
    <>
      {/* Backdrop: close on click outside */}
      <button
        type="button"
        className="fixed inset-0 z-40 bg-transparent cursor-default"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="absolute z-50 w-[min(320px,calc(100vw-32px))] rounded-2xl border-2 border-black bg-white p-4 neo-shadow"
        style={{
          left: anchorPoint ? left : undefined,
          top: anchorPoint ? top : undefined,
          transform: anchorPoint ? "translateX(-50%)" : undefined,
        }}
      >
        <FriendActionCardContent
          member={member}
          onClose={() => onOpenChange(false)}
          onMessage={onMessage}
          onOfferAssistance={onOfferAssistance}
          onViewRoute={onViewRoute}
          onViewJourney={onViewJourney}
          onAIChat={onAIChat}
          showJourney={showJourney}
        />
      </div>
    </>
  )
}
