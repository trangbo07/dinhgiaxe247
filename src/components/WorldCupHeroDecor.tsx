'use client'

import { useTheme } from '@/app/Providers'

const WC_RED   = '#C8102E'
const WC_GREEN = '#006847'
const WC_BLUE  = '#0057A8'

function Pennant({ color, delay }: { color: string; delay: string }) {
  return (
    <span
      className="wc-pennant inline-block"
      style={{
        width: 0,
        height: 0,
        borderLeft: '7px solid transparent',
        borderRight: '7px solid transparent',
        borderTop: `14px solid ${color}`,
        animationDelay: delay,
      }}
    />
  )
}

export default function WorldCupHeroDecor() {
  const { worldcupEnabled } = useTheme()
  if (!worldcupEnabled) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Stadium spotlights */}
      <div
        className="wc-spotlight-a absolute -left-[10%] -top-[20%] h-[70%] w-[45%] opacity-30"
        style={{
          background: `conic-gradient(from 45deg at 0% 0%, ${WC_BLUE}44, transparent 55%)`,
        }}
      />
      <div
        className="wc-spotlight-b absolute -right-[10%] -top-[20%] h-[70%] w-[45%] opacity-25"
        style={{
          background: `conic-gradient(from 135deg at 100% 0%, ${WC_RED}44, transparent 55%)`,
        }}
      />

      {/* Fairy light strings — top hero */}
      <div className="absolute left-0 right-0 top-4 hidden h-6 lg:block">
        <div className="mx-auto flex max-w-4xl justify-between px-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              className="wc-fairy-light mt-2 h-2 w-2 rounded-full"
              style={{
                backgroundColor: [WC_RED, WC_GREEN, WC_BLUE, '#FFD700'][i % 4],
                animationDelay: `${(i * 0.15) % 2.4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Left pennant banner */}
      <div className="absolute left-2 top-16 hidden flex-col items-center gap-0.5 md:flex lg:left-6 lg:top-20">
        <div className="flex gap-1">
          <Pennant color={WC_RED} delay="0s" />
          <Pennant color={WC_GREEN} delay="0.2s" />
          <Pennant color={WC_BLUE} delay="0.4s" />
          <Pennant color={WC_RED} delay="0.6s" />
          <Pennant color={WC_GREEN} delay="0.8s" />
        </div>
        <span className="wc-blink-soft mt-1 text-[8px] font-black uppercase tracking-widest text-white/40">
          WC 2026
        </span>
      </div>

      {/* Right pennant banner */}
      <div className="absolute right-2 top-16 hidden flex-col items-center gap-0.5 md:flex lg:right-6 lg:top-20">
        <div className="flex gap-1">
          <Pennant color={WC_BLUE} delay="0.1s" />
          <Pennant color={WC_GREEN} delay="0.3s" />
          <Pennant color={WC_RED} delay="0.5s" />
          <Pennant color={WC_BLUE} delay="0.7s" />
          <Pennant color={WC_GREEN} delay="0.9s" />
        </div>
        <span className="wc-blink-soft mt-1 text-[8px] font-black uppercase tracking-widest text-white/40">
          FIFA
        </span>
      </div>

      {/* Badge — góc phải */}
      <div className="absolute right-4 top-6 z-20 hidden sm:flex lg:right-8 lg:top-8">
        <div className="wc-badge-glow flex items-center gap-2 rounded-full px-3.5 py-1.5 text-white shadow-lg ring-1 ring-white/15"
          style={{ backgroundColor: '#001B5Ecc', backdropFilter: 'blur(8px)' }}>
          <span className="flex gap-0.5">
            <span className="wc-dot-blink h-2 w-2 rounded-full" style={{ backgroundColor: WC_RED, animationDelay: '0s' }} />
            <span className="wc-dot-blink h-2 w-2 rounded-full" style={{ backgroundColor: WC_GREEN, animationDelay: '0.3s' }} />
            <span className="wc-dot-blink h-2 w-2 rounded-full" style={{ backgroundColor: WC_BLUE, animationDelay: '0.6s' }} />
          </span>
          <span className="wc-text-glow text-[10px] font-black uppercase tracking-widest text-white/90">
            World Cup 2026
          </span>
        </div>
      </div>

      {/* Floating elements */}
      <span className="absolute right-[3%] top-[35%] text-4xl opacity-[0.14] wc-ball-b hidden xl:block">⚽</span>
      <span className="absolute left-[2%] bottom-[25%] text-5xl opacity-[0.09] wc-ball-c hidden xl:block">⚽</span>
      <span className="absolute right-[10%] bottom-[12%] text-2xl opacity-[0.12] wc-ball-a hidden lg:block">🏆</span>

      {/* Confetti dots */}
      {[
        { l: '15%', t: '40%', c: WC_RED,   d: '0s'   },
        { l: '80%', t: '50%', c: WC_GREEN, d: '0.5s' },
        { l: '70%', t: '30%', c: WC_BLUE,  d: '1s'   },
        { l: '25%', t: '60%', c: '#FFD700', d: '1.5s' },
        { l: '55%', t: '75%', c: WC_RED,   d: '0.8s' },
      ].map((p, i) => (
        <span
          key={i}
          className="wc-confetti absolute h-1.5 w-1.5 rounded-sm"
          style={{ left: p.l, top: p.t, backgroundColor: p.c, animationDelay: p.d }}
        />
      ))}

      {/* Navy radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,61,165,0.18), transparent 70%)',
        }}
      />
    </div>
  )
}
