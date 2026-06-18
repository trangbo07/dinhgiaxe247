'use client'

type LedVariant = 'wave' | 'chase' | 'stadium' | 'twinkle'

const LED_CLASS: Record<LedVariant, string> = {
  wave: 'wc-led-wave',
  chase: 'wc-led-chase',
  stadium: 'wc-led-stadium',
  twinkle: 'wc-led-twinkle',
}

/** Dải LED — mỗi variant có nhịp nhấp nháy khác nhau */
export default function WcLedStrip({
  count = 48,
  variant = 'wave',
  className = 'h-[2px]',
  reverse = false,
}: {
  count?: number
  variant?: LedVariant
  className?: string
  reverse?: boolean
}) {
  const ledClass = LED_CLASS[variant]

  return (
    <div className={`flex w-full ${className}`}>
      {Array.from({ length: count }).map((_, i) => {
        const idx = reverse ? count - 1 - i : i
        const delay = (idx * 0.065) % 2.8
        const duration = 2.2 + (idx % 7) * 0.18

        return (
          <span
            key={i}
            className={`${ledClass} flex-1 origin-center rounded-full`}
            style={{
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        )
      })}
    </div>
  )
}

/** Dải tricolor — mỗi màu pulse lệch pha */
export function WcTricolorBar({ className = 'h-1' }: { className?: string }) {
  return (
    <div className={`wc-tricolor-flow flex w-full ${className}`}>
      <div className="flex-1 bg-[#C8102E]" />
      <div className="flex-1 bg-[#006847]" />
      <div className="flex-1 bg-[#0057A8]" />
    </div>
  )
}
