import { useState } from "react"
import type { Group } from "@/types"
import { ChevronDown, Users, Home, GraduationCap, X } from "lucide-react"
import { cn } from "@/lib/utils"

function GroupIcon({
  group,
  className,
}: {
  group: Group
  className?: string
}) {
  const id = group.id
  if (id === "school-mates")
    return (
      <div className={cn("w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600", className)}>
        <GraduationCap className="w-6 h-6" />
      </div>
    )
  if (id === "work-friends")
    return (
      <div className={cn("w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600", className)}>
        <Users className="w-6 h-6" />
      </div>
    )
  return (
    <div className={cn("w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600", className)}>
      <Home className="w-6 h-6" />
    </div>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3.5 h-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  )
}

export function GroupHeader({
  groups,
  currentGroup,
  onSelectGroup,
}: {
  groups: Group[]
  currentGroup: Group
  onSelectGroup: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const memberCount = (g: Group) => g.members.length + 1

  return (
    <div className="absolute left-4 top-4 z-10 w-max max-w-[min(320px,88vw)] p-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-black text-white px-5 py-3 rounded-2xl flex items-center gap-3 neo-shadow hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95 text-left"
      >
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">
            Current Group
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold truncate">
              {currentGroup.name}
            </span>
            <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" strokeWidth={3} />
          </div>
        </div>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[4px] flex flex-col justify-start pt-20"
          role="dialog"
          aria-modal="true"
          aria-label="Select Group"
        >
          <div className="mx-4 bg-white rounded-3xl border-2 border-black neo-shadow overflow-hidden">
            <div className="p-5 border-b-2 border-black flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-gray-900">Select Group</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full border-2 border-black neo-shadow-sm hover:translate-y-0.5 hover:shadow-none transition-all"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            <div className="py-2">
              {groups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    onSelectGroup(g.id)
                    setOpen(false)
                  }}
                  className={cn(
                    "w-full px-5 py-4 flex items-center justify-between transition-colors active:bg-gray-100",
                    g.id === currentGroup.id && "bg-blue-50/50"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <GroupIcon group={g} />
                    <div className="flex flex-col items-start">
                      <span className="text-[16px] font-bold text-gray-900">
                        {g.name}
                      </span>
                      <span className="text-[13px] text-gray-500 font-medium">
                        {memberCount(g)} members
                      </span>
                    </div>
                  </div>
                  {g.id === currentGroup.id && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                      <CheckIcon />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 bg-gray-50 border-t-2 border-black">
              <button
                type="button"
                className="w-full h-14 bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 neo-shadow hover:translate-y-0.5 hover:shadow-none transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create New Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
