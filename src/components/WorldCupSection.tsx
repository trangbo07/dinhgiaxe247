'use client'

import Link from 'next/link'
import { useTheme } from '@/app/Providers'
import WcLedStrip, { WcTricolorBar } from '@/components/WcLedStrip'

const WC_NAVY   = '#001B5E'
const WC_RED    = '#C8102E'
const WC_GREEN  = '#006847'
const WC_BLUE   = '#0057A8'

const nations = [
  { flag: '🇨🇦', name: 'Canada',  color: WC_RED   },
  { flag: '🇲🇽', name: 'Mexico',  color: WC_GREEN },
  { flag: '🇺🇸', name: 'USA',     color: WC_BLUE  },
]

export default function WorldCupSection() {
  const { worldcupEnabled } = useTheme()
  if (!worldcupEnabled) return null

  return (
    <div className="wc-section-hero relative overflow-hidden">

      <div
        className="relative"
        style={{
          background: `linear-gradient(160deg, ${WC_NAVY} 0%, #002470 55%, #001B5E 100%)`,
        }}
      >
        {/* Stadium light beams */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div
            className="wc-spotlight-a absolute -left-1/4 top-0 h-full w-1/2 opacity-20"
            style={{ background: `linear-gradient(135deg, ${WC_BLUE}55 0%, transparent 60%)` }}
          />
          <div
            className="wc-spotlight-b absolute -right-1/4 top-0 h-full w-1/2 opacity-20"
            style={{ background: `linear-gradient(225deg, ${WC_RED}55 0%, transparent 60%)` }}
          />
          <div
            className="wc-spotlight-c absolute left-1/2 top-0 h-full w-1/3 -translate-x-1/2 opacity-15"
            style={{ background: `linear-gradient(180deg, ${WC_GREEN}44 0%, transparent 70%)` }}
          />
        </div>

        {/* Dot-grid texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Side vertical banners */}
        <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-8 flex-col items-center justify-center gap-3 border-r border-white/5 bg-white/[0.03] lg:flex">
          {['⚽', '🏆', '⚽'].map((icon, i) => (
            <span
              key={i}
              className="wc-blink-soft text-lg"
              style={{ animationDelay: `${i * 0.4}s` }}
            >
              {icon}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-8 flex-col items-center justify-center gap-3 border-l border-white/5 bg-white/[0.03] lg:flex">
          {['🏆', '⚽', '🏆'].map((icon, i) => (
            <span
              key={i}
              className="wc-blink-soft text-lg"
              style={{ animationDelay: `${i * 0.4 + 0.2}s` }}
            >
              {icon}
            </span>
          ))}
        </div>

        {/* Floating balls */}
        <span className="pointer-events-none absolute left-[5%] top-[15%] text-6xl opacity-[0.08] wc-ball-a hidden lg:block" aria-hidden>⚽</span>
        <span className="pointer-events-none absolute right-[6%] top-[25%] text-5xl opacity-[0.07] wc-ball-b hidden lg:block" aria-hidden>⚽</span>
        <span className="pointer-events-none absolute right-[15%] bottom-[20%] text-4xl opacity-[0.07] wc-ball-c hidden xl:block" aria-hidden>⚽</span>

        {/* Confetti */}
        {[
          { l: '10%', t: '20%', c: WC_RED,   s: '6px', d: '0s'   },
          { l: '90%', t: '30%', c: WC_GREEN, s: '5px', d: '0.6s' },
          { l: '5%',  t: '70%', c: WC_BLUE,  s: '7px', d: '1.2s' },
          { l: '95%', t: '65%', c: '#FFD700', s: '5px', d: '0.3s' },
          { l: '50%', t: '10%', c: WC_RED,   s: '4px', d: '0.9s' },
        ].map((p, i) => (
          <span
            key={i}
            className="wc-confetti pointer-events-none absolute rounded-sm"
            style={{ left: p.l, top: p.t, width: p.s, height: p.s, backgroundColor: p.c, animationDelay: p.d }}
          />
        ))}

        {/* Tricolor top */}
        <WcTricolorBar className="h-1.5" />

        <WcLedStrip variant="stadium" count={72} className="h-[3px]" />

        <div className="container relative z-10 px-4 py-16 text-center sm:py-20 lg:py-24">

          {/* Trophy badge — pulsing ring */}
          <div className="relative mx-auto mb-6 inline-flex">
            <div className="wc-trophy-ring absolute -inset-2 rounded-full" aria-hidden />
            <div
              className="relative flex h-20 w-20 items-center justify-center rounded-full text-4xl shadow-2xl ring-4 ring-white/10"
              style={{ background: `linear-gradient(135deg, ${WC_BLUE} 0%, #0070d8 100%)` }}
            >
              <span className="wc-bounce-soft">🏆</span>
            </div>
          </div>

          {/* FIFA label */}
          <div className="mb-3 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-white/20" />
            <span className="wc-text-fifa text-xs font-black uppercase tracking-[0.25em]">FIFA</span>
            <div className="h-px w-12 bg-white/20" />
          </div>

          <h2 className="mx-auto max-w-3xl text-4xl font-black leading-none tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="wc-text-glow">WORLD CUP</span>
            <br />
            <span
              className="wc-year-glow mt-1 block text-5xl sm:text-6xl lg:text-7xl"
              style={{
                background: `linear-gradient(90deg, ${WC_RED} 0%, white 45%, ${WC_BLUE} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              2026
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/60 sm:text-lg">
            Định giá xe ngay hôm nay — biết rõ giá trị xe bạn đang có,{' '}
            <span className="font-semibold text-white/90">chuẩn bị tự tin cho mùa bóng đá đỉnh cao.</span>
          </p>

          {/* Host nations — cards with blink border */}
          <div className="mx-auto mt-8 flex max-w-xs items-center justify-center divide-x divide-white/15 overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
            {nations.map((n, i) => (
              <div
                key={n.name}
                className="wc-nation-card flex flex-1 flex-col items-center gap-1 px-4 py-3"
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                <span className="wc-flag-wave text-2xl" style={{ animationDelay: `${i * 0.15}s` }}>
                  {n.flag}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/50">
                  {n.name}
                </span>
                <div
                  className="wc-dot-blink h-0.5 w-6 rounded-full"
                  style={{ backgroundColor: n.color, animationDelay: `${i * 0.3}s` }}
                />
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/#valuation"
              className="wc-cta-glow inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-black text-white shadow-xl transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${WC_BLUE} 0%, #0070d8 100%)` }}
            >
              🚗 Định giá xe ngay
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/8 px-8 py-4 text-sm font-bold text-white/80 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              Xem quy trình
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Stats — blinking icons */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-t border-white/10 pt-8">
            {[
              { icon: '🇻🇳', text: 'Thị trường Việt Nam' },
              { icon: '🤖', text: 'AI định giá' },
              { icon: '⚡', text: 'Real-time' },
              { icon: '📊', text: '30 ngày dữ liệu' },
            ].map((s, i) => (
              <div
                key={s.text}
                className="flex items-center gap-1.5 text-sm text-white/40"
              >
                <span className="wc-blink-soft" style={{ animationDelay: `${i * 0.25}s` }}>
                  {s.icon}
                </span>
                <span className="font-medium text-white/60">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        <WcLedStrip variant="stadium" count={72} className="h-[3px]" reverse />

        <WcTricolorBar className="h-1.5" />
      </div>

      {/* Wave divider */}
      <div className="relative -mt-px" style={{ backgroundColor: WC_NAVY }}>
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="block w-full">
          <path
            d="M0 60L80 50C160 40 320 20 480 13.3C640 6.7 800 13.3 960 26.7C1120 40 1280 53.3 1360 58.7L1440 60H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}
