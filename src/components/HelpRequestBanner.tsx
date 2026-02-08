import type { IncomingHelpRequest } from "@/types"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function HelpRequestBanner({
  request,
  onAccept,
  onDecline,
  onNavigateToFriend,
  onDismiss,
}: {
  request: IncomingHelpRequest | null
  onAccept: () => void
  onDecline: () => void
  onNavigateToFriend: () => void
  onDismiss: () => void
}) {
  if (!request) return null

  return (
    <div
      className="absolute left-3 right-3 top-20 z-[15] rounded-2xl border-2 border-black bg-white p-4 neo-shadow"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 shrink-0 rounded-full border-2 border-black neo-shadow-sm overflow-hidden bg-slate-100">
          <img src={request.fromMember.avatar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-black">{request.message}</p>
          <p className="mt-1 text-xs text-slate-600">
            {request.fromMember.name} • Help requested
          </p>
        </div>
        <button type="button" onClick={onDismiss} className="shrink-0 rounded-lg p-1 border-2 border-black neo-shadow-sm text-slate-700 hover:translate-y-0.5 hover:shadow-none transition-all" aria-label="Dismiss">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" className="border-2 border-black neo-shadow-sm font-bold hover:translate-y-0.5 hover:shadow-none" onClick={onAccept}>
          Accept
        </Button>
        <Button variant="outline" size="sm" className="border-2 border-black neo-shadow-sm font-bold hover:translate-y-0.5 hover:shadow-none" onClick={onDecline}>
          Decline
        </Button>
        <Button variant="outline" size="sm" className="border-2 border-black neo-shadow-sm font-bold hover:translate-y-0.5 hover:shadow-none" onClick={onNavigateToFriend}>
          Navigate to friend
        </Button>
      </div>
    </div>
  )
}
