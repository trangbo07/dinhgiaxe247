'use client'

import { useTheme } from '@/app/Providers'
import WcLedStrip, { WcTricolorBar } from '@/components/WcLedStrip'

const WC_NAVY = '#001435'

/** Dải banner ngang — default & compact có animation khác nhau */
export default function WorldCupDecorStrip({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  const { worldcupEnabled } = useTheme()
  if (!worldcupEnabled) return null

  const isCompact = variant === 'compact'

  return (
    <div
      className={`relative overflow-hidden ${isCompact ? 'wc-strip-compact' : 'wc-strip-default'}`}
      style={{
        background: isCompact
          ? `linear-gradient(90deg, ${WC_NAVY} 0%, #001B5E 50%, ${WC_NAVY} 100%)`
          : `linear-gradient(90deg, ${WC_NAVY} 0%, #002470 40%, #003080 60%, ${WC_NAVY} 100%)`,
      }}
    >
      <div className="wc-strip-shimmer pointer-events-none absolute inset-0" aria-hidden />

      <WcTricolorBar className={isCompact ? 'h-0.5' : 'h-1'} />

      <div className={`relative flex items-center justify-center overflow-hidden ${isCompact ? 'h-8' : 'h-11'}`}>
        <WcLedStrip
          variant={isCompact ? 'twinkle' : 'chase'}
          count={isCompact ? 40 : 56}
          className="absolute inset-x-0 top-0 h-px"
        />

        <div className={`wc-marquee-mask flex w-full items-center ${isCompact ? 'wc-marquee-mask-compact' : 'wc-marquee-mask-strip'}`}>
          <div
            className={`flex whitespace-nowrap will-change-transform ${
              isCompact ? 'wc-marquee-track-reverse' : 'wc-marquee-track-drift'
            }`}
          >
            {Array.from({ length: 2 }).map((_, dup) => (
              <span
                key={dup}
                className={`flex items-center font-bold uppercase tracking-widest text-white/75 ${
                  isCompact ? 'gap-4 px-4 text-[10px]' : 'gap-6 px-6 text-xs'
                }`}
                aria-hidden={dup === 1}
              >
                <span className="wc-blink-soft text-amber-300/90" style={{ animationDuration: '2.8s' }}>⚽</span>
                <span>Hưởng ứng World Cup 2026</span>
                <span className="text-white/25">|</span>
                <span>ValuCar × FIFA Special</span>
                <span className="text-white/25">|</span>
                <span className="wc-flag-wave">🇨🇦</span>
                <span className="wc-flag-wave" style={{ animationDelay: '0.3s' }}>🇲🇽</span>
                <span className="wc-flag-wave" style={{ animationDelay: '0.6s' }}>🇺🇸</span>
                <span className="text-white/25">|</span>
                <span className="wc-text-glow text-white/90">🏆 GOAL!</span>
                <span className="wc-blink-soft text-amber-300/90" style={{ animationDuration: '3.2s', animationDelay: '0.5s' }}>⚽</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <WcTricolorBar className={isCompact ? 'h-0.5' : 'h-1'} />
    </div>
  )
}
