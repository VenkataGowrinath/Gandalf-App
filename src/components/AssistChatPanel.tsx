import { useState, useRef, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import type { Group, CommunityMember, IntentOption, ChatMessage } from "@/types"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

const INTENT_OPTIONS: IntentOption[] = [
  "Safety Status",
  "Route Deviation",
  "Timing Anomaly",
  "Assistance Feasibility",
]
const QUICK_INTENTS: IntentOption[] = [
  "Are you safe?",
  "Need pickup?",
  "Share route",
  "I'm coming",
]

function getMockProxyReply(
  intent: IntentOption,
  member: CommunityMember,
  _userMessage: string
): string {
  const name = member.name
  if (intent === "Safety Status") {
    if (member.status.type === "moving")
      return `${name} is currently moving. Last update: "${member.status.text}". Route looks fine. No anomalies.`
    return `${name} is stationary. Location is in a well-lit area. Safety score: Good.`
  }
  if (intent === "Route Deviation")
    return `${name}'s route is on track. No significant deviations.`
  if (intent === "Timing Anomaly")
    return `No timing anomalies for ${name}. Movement is consistent.`
  if (intent === "Assistance Feasibility")
    return `You are within assistance range of ${name}. Estimated time to reach: ~8 min.`
  if (intent === "Are you safe?") return `${name} is safe. No issues reported.`
  if (intent === "Need pickup?") return `${name} can coordinate pickup. Share your location when ready.`
  if (intent === "Share route") return `${name} has shared their route. You can see it on the map.`
  if (intent === "I'm coming") return `Noted. ${name} is on the way to assist.`
  return `Here's the status for ${name} (${intent}). Anything else?`
}

export function AssistChatPanel({
  group,
  isOpen,
  onClose,
  initialMemberId,
  initialIntent,
}: {
  group: Group
  isOpen: boolean
  onClose: () => void
  initialMemberId?: string | null
  initialIntent?: IntentOption | null
}) {
  const [selectedIntent, setSelectedIntent] = useState<IntentOption>("Safety Status")
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)
  const [freeText, setFreeText] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const members = group.members
  const selectedMember = members.find((m) => m.id === selectedMemberId) ?? members[0] ?? null

  useEffect(() => {
    if (isOpen) {
      setSelectedMemberId(initialMemberId ?? members[0]?.id ?? null)
      setSelectedIntent(initialIntent ?? "Safety Status")
    }
  }, [isOpen, initialMemberId, initialIntent, members])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (overrideIntent?: IntentOption) => {
    const member = selectedMember
    if (!member) return
    const intentToUse = overrideIntent ?? selectedIntent
    const text =
      freeText.trim() ||
      `Tell me about the current ${intentToUse} of ${member.name} and I want to know more about`
    if (!overrideIntent) setFreeText("")
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    const reply = getMockProxyReply(intentToUse, member, text)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply,
          timestamp: new Date(),
        },
      ])
    }, 500)
  }

  if (!isOpen) return null

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="bottom" className="max-h-[85vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>Assist / Chat</SheetTitle>
        </SheetHeader>
        <SheetBody className="flex flex-1 flex-col overflow-hidden">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tell me about the current
          </p>
          <div className="mb-3 flex flex-wrap gap-2">
            {INTENT_OPTIONS.map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => setSelectedIntent(intent)}
                className={cn(
                  "min-h-[44px] rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                  selectedIntent === intent
                    ? "bg-black text-white"
                    : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
                )}
              >
                {intent}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            of
          </p>
          <select
            value={selectedMemberId ?? ""}
            onChange={(e) => setSelectedMemberId(e.target.value || null)}
            className="mb-4 min-h-[44px] w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
          >
            <option value="">Select user</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            and I want to know more about
          </p>
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            placeholder="Optional context..."
            className="mb-4 min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
          />
          <div className="mb-2 flex flex-wrap gap-2">
            {QUICK_INTENTS.map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => handleSend(intent)}
                className="min-h-[44px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
              >
                {intent}
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <div className="mt-4 flex-1 space-y-3 overflow-y-auto border-t border-slate-100 pt-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                      msg.role === "user"
                        ? "bg-black text-white"
                        : "bg-slate-100 text-slate-800"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </SheetBody>
        <div className="safe-bottom flex gap-2 border-t border-slate-100 p-4">
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="min-h-[44px] flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
          />
          <Button onClick={() => handleSend()} size="icon" className="h-11 w-11 shrink-0" aria-label="Send">
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
