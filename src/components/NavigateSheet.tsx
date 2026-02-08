import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetBody,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export function NavigateSheet({
  open,
  onOpenChange,
  initialDestination,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDestination?: string
}) {
  const [destination, setDestination] = useState(initialDestination ?? "")

  const handleGo = () => {
    // MVP: just close; in production would show route on map
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[50vh]">
        <SheetHeader>
          <SheetTitle>Navigate</SheetTitle>
        </SheetHeader>
        <SheetBody className="pt-4">
          <p className="mb-2 text-sm text-slate-600">
            Enter destination. We&apos;ll show the safest route (police, hospitals, well-lit
            roads highlighted).
          </p>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="e.g. Madhapur Metro, Hyderabad"
            className="mb-4 min-h-[44px] w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
          />
          <Button className="w-full" onClick={handleGo}>
            Show route
          </Button>
          <p className="mt-4 text-xs text-slate-500">
            Safety layer: police stations, hospitals, well-lit roads and high footfall areas will be highlighted. Historical risk areas are marked in amber.
          </p>
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
