import { Sparkles } from "lucide-react"

export function BottomCTAs({
  onAssistClick,
}: {
  onAssistClick: () => void
}) {
  return (
    <div className="safe-bottom absolute bottom-8 left-0 right-0 z-10 flex items-center justify-center">
      <button
        type="button"
        className="group w-16 h-16 rounded-[2rem] bg-[#18181B] flex items-center justify-center neo-shadow-lg hover:translate-y-1 hover:shadow-none transition-all active:scale-95 border-2 border-white/10"
        onClick={onAssistClick}
        aria-label="Assist / Chat"
      >
        <Sparkles className="h-8 w-8 text-[#F472B6] group-hover:rotate-180 transition-transform duration-500" />
      </button>
    </div>
  )
}
