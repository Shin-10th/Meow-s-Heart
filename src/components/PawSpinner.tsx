import { PawPrint } from 'lucide-react'

export default function PawSpinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-cocoa-light">
      <PawPrint className="h-8 w-8 animate-bounce text-brand-400" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  )
}
