'use client'

import { useTheme } from '@/app/Providers'
import WcLedStrip, { WcTricolorBar } from '@/components/WcLedStrip'

type Anim = 'float-a' | 'float-b' | 'float-c' | 'blink' | 'flag' | 'confetti'

type FloatingIcon = {
  emoji: string
  left?: string
  right?: string
  top: string
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  anim: Anim
  delay: string
  opacity?: number
}

export type WcSectionVariant =
  | 'valuation'
  | 'trust'
  | 'process'
  | 'features'
  | 'people'
  | 'pricing'
  | 'business'
  | 'contact'

const SIZE: Record<FloatingIcon['size'], string> = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
}

const ANIM: Record<Anim, string> = {
  'float-a': 'wc-ball-a',
  'float-b': 'wc-ball-b',
  'float-c': 'wc-ball-c',
  blink: 'wc-blink-soft',
  flag: 'wc-flag-wave',
  confetti: 'wc-confetti',
}

const PRESETS: Record<WcSectionVariant, FloatingIcon[]> = {
  valuation: [
    { emoji: '⚽', left: '2%',  top: '6%',  size: 'lg', anim: 'float-a', delay: '0s',   opacity: 0.12 },
    { emoji: '🏆', right: '4%', top: '12%', size: 'md', anim: 'float-b', delay: '0.6s', opacity: 0.1  },
    { emoji: '🥅', left: '8%',  top: '55%', size: 'sm', anim: 'blink',   delay: '0.3s', opacity: 0.08 },
    { emoji: '⭐', right: '6%', top: '70%', size: 'sm', anim: 'confetti', delay: '1s',  opacity: 0.1  },
    { emoji: '🇨🇦', left: '1%',  top: '35%', size: 'xs', anim: 'flag',    delay: '0.2s', opacity: 0.15 },
    { emoji: '🇲🇽', right: '1%', top: '40%', size: 'xs', anim: 'flag',    delay: '0.5s', opacity: 0.15 },
  ],
  trust: [
    { emoji: '⚽', left: '3%',  top: '20%', size: 'md', anim: 'float-c', delay: '0s' },
    { emoji: '🏆', right: '3%', top: '25%', size: 'md', anim: 'float-a', delay: '0.8s' },
    { emoji: '✨', left: '50%', top: '8%',  size: 'xs', anim: 'blink',   delay: '0.4s' },
    { emoji: '⚽', right: '8%', top: '75%', size: 'sm', anim: 'float-b', delay: '1.2s' },
  ],
  process: [
    { emoji: '⚽', left: '1%',  top: '10%', size: 'xl', anim: 'float-a', delay: '0s',   opacity: 0.07 },
    { emoji: '🏆', right: '2%', top: '8%',  size: 'lg', anim: 'float-b', delay: '0.5s', opacity: 0.08 },
    { emoji: '🥅', left: '5%',  top: '80%', size: 'md', anim: 'blink',   delay: '0.9s', opacity: 0.07 },
    { emoji: '🇺🇸', right: '4%', top: '85%', size: 'sm', anim: 'flag',    delay: '0.3s', opacity: 0.12 },
    { emoji: '⭐', left: '45%', top: '3%',  size: 'sm', anim: 'confetti', delay: '1.5s', opacity: 0.09 },
  ],
  features: [
    { emoji: '⚽', left: '2%',  top: '15%', size: 'lg', anim: 'float-b', delay: '0s' },
    { emoji: '🏆', right: '3%', top: '20%', size: 'md', anim: 'float-c', delay: '0.7s' },
    { emoji: '⚽', right: '6%', top: '75%', size: 'sm', anim: 'float-a', delay: '1.1s' },
    { emoji: '🇲🇽', left: '4%', top: '78%', size: 'xs', anim: 'flag', delay: '0.4s' },
  ],
  people: [
    { emoji: '🏆', left: '2%',  top: '12%', size: 'md', anim: 'float-a', delay: '0s' },
    { emoji: '⚽', right: '4%', top: '18%', size: 'lg', anim: 'float-b', delay: '0.6s' },
    { emoji: '⭐', left: '6%',  top: '70%', size: 'sm', anim: 'blink',   delay: '1s' },
  ],
  pricing: [
    { emoji: '⚽', left: '3%',  top: '8%',  size: 'lg', anim: 'float-c', delay: '0s' },
    { emoji: '🏆', right: '5%', top: '12%', size: 'md', anim: 'float-a', delay: '0.5s' },
    { emoji: '🇨🇦', left: '1%',  top: '50%', size: 'xs', anim: 'flag',    delay: '0.2s' },
    { emoji: '🇺🇸', right: '1%', top: '55%', size: 'xs', anim: 'flag',    delay: '0.8s' },
    { emoji: '✨', right: '8%', top: '80%', size: 'sm', anim: 'confetti', delay: '1.3s' },
  ],
  business: [
    { emoji: '⚽', left: '2%',  top: '15%', size: 'md', anim: 'float-b', delay: '0s' },
    { emoji: '🏆', right: '3%', top: '20%', size: 'md', anim: 'float-a', delay: '0.7s' },
    { emoji: '🥅', right: '6%', top: '70%', size: 'sm', anim: 'blink',   delay: '0.3s' },
  ],
  contact: [
    { emoji: '⚽', left: '2%',  top: '10%', size: 'lg', anim: 'float-a', delay: '0s' },
    { emoji: '🏆', right: '4%', top: '15%', size: 'md', anim: 'float-c', delay: '0.6s' },
    { emoji: '⭐', left: '5%',  top: '75%', size: 'sm', anim: 'confetti', delay: '1s' },
    { emoji: '🇲🇽', right: '2%', top: '80%', size: 'xs', anim: 'flag', delay: '0.4s' },
  ],
}

const SPARKLES = [
  { left: '15%', top: '25%', delay: '0s' },
  { left: '85%', top: '35%', delay: '0.8s' },
  { left: '70%', top: '65%', delay: '1.4s' },
  { left: '25%', top: '80%', delay: '0.5s' },
]

type Props = {
  variant: WcSectionVariant
  strip?: boolean
  led?: boolean
}

/** Lớp icon nền + hiệu ứng WC cho từng section — chỉ hiện khi theme bật */
export default function WorldCupSectionDecor({
  variant,
  strip = true,
  led = false,
}: Props) {
  const { worldcupEnabled } = useTheme()
  if (!worldcupEnabled) return null

  const icons = PRESETS[variant]

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      {strip && <WcTricolorBar className="absolute left-0 right-0 top-0 h-0.5 opacity-60" />}

      {led && (
        <WcLedStrip variant="twinkle" count={36} className="absolute left-0 right-0 top-1 h-px" />
      )}

      {icons.map((icon, i) => (
        <span
          key={i}
          className={`absolute select-none ${SIZE[icon.size]} ${ANIM[icon.anim]}`}
          style={{
            left: icon.left,
            right: icon.right,
            top: icon.top,
            opacity: icon.opacity ?? 0.11,
            animationDelay: icon.delay,
            animationDuration: `${5 + (i % 4) * 1.2}s`,
          }}
        >
          {icon.emoji}
        </span>
      ))}

      {SPARKLES.map((s, i) => (
        <span
          key={`sp-${i}`}
          className="wc-sparkle absolute h-1 w-1 rounded-full bg-amber-300"
          style={{ left: s.left, top: s.top, animationDelay: s.delay, animationDuration: `${3 + i * 0.5}s` }}
        />
      ))}
    </div>
  )
}

const LABEL_ICONS = ['⚽', '🏆', '✨', '🥅'] as const

/** Nhãn section kèm icon nhấp nháy */
export function WorldCupSectionLabel({
  children,
  index = 0,
  compact = false,
}: {
  children: React.ReactNode
  index?: number
  compact?: boolean
}) {
  const { worldcupEnabled } = useTheme()
  if (!worldcupEnabled) return <>{children}</>

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {children}
        <span
          className="wc-blink-soft text-xs"
          style={{ animationDelay: `${(index % 4) * 0.25}s` }}
          aria-hidden
        >
          {LABEL_ICONS[index % LABEL_ICONS.length]}
        </span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span
        className="wc-blink-soft text-sm"
        style={{ animationDelay: `${(index % 4) * 0.25}s` }}
        aria-hidden
      >
        {LABEL_ICONS[index % LABEL_ICONS.length]}
      </span>
      {children}
      <span
        className="wc-flag-wave text-sm"
        style={{ animationDelay: `${(index % 4) * 0.25 + 0.15}s` }}
        aria-hidden
      >
        {LABEL_ICONS[(index + 2) % LABEL_ICONS.length]}
      </span>
    </span>
  )
}

const ACCENT_ICONS = ['⚽', '🏆', '⭐', '🥅', '✨', '🎯']

/** Bọc icon/card — thêm emoji nhấp nháy góc */
export function WorldCupIconAccent({
  children,
  index = 0,
  className = '',
}: {
  children: React.ReactNode
  index?: number
  className?: string
}) {
  const { worldcupEnabled } = useTheme()
  if (!worldcupEnabled) return <div className={className}>{children}</div>

  return (
    <div className={`relative ${className}`}>
      <div
        className="wc-icon-ring-pulse"
        style={{ animationDelay: `${(index % 6) * 0.2}s` }}
      >
        {children}
      </div>
      <span
        className="wc-blink-soft absolute -right-1.5 -top-1.5 z-10 text-sm drop-shadow"
        style={{ animationDelay: `${(index % 6) * 0.3}s` }}
        aria-hidden
      >
        {ACCENT_ICONS[index % ACCENT_ICONS.length]}
      </span>
    </div>
  )
}
