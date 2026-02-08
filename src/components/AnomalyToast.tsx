import { AlertTriangle, X, Phone, MessageCircle, HandHelping } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CommunityMember } from "@/types"

export function AnomalyToast({
  message,
  member,
  onDismiss,
  onCall,
  onChat,
  onProvideAssistance,
}: {
  message: string
  member?: CommunityMember | null
  onDismiss: () => void
  onCall?: () => void
  onChat?: () => void
  onProvideAssistance?: () => void
}) {
  const hasActions = Boolean(member && (onCall || onChat || onProvideAssistance))

  return (
    <div
      className="absolute left-3 right-3 top-20 z-[14] rounded-2xl border-2 border-black bg-white p-4 neo-shadow"
      role="alert"
    >
      <div className="flex items-start gap-3">
        {member ? (
          <div className="h-14 w-14 shrink-0 rounded-full border-2 border-black neo-shadow-sm overflow-hidden bg-slate-100">
            <img src={member.avatar} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 text-slate-600" />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-black">{message}</p>
          {member && (
            <p className="mt-0.5 text-xs text-slate-600">
              {member.name} • Anomaly detected
            </p>
          )}
        </div>
        <button type="button" onClick={onDismiss} className="shrink-0 rounded-lg p-1.5 border-2 border-black neo-shadow-sm text-slate-700 hover:translate-y-0.5 hover:shadow-none transition-all" aria-label="Close">
          <X className="h-5 w-5" />
        </button>
      </div>
      {hasActions && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {onCall && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onCall()
                onDismiss()
              }}
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
          )}
          {onChat && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onChat()
                onDismiss()
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
          )}
          {onProvideAssistance && (
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => {
                onProvideAssistance()
                onDismiss()
              }}
            >
              <HandHelping className="h-4 w-4" />
              Provide assistance
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
