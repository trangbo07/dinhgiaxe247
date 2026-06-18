'use client'

import WcLedStrip, { WcTricolorBar } from '@/components/WcLedStrip'

const WC_NAVY = '#001435'

const MARQUEE_ITEMS = [
  '⚽ FIFA World Cup 2026',
  '🏆 Canada · Mexico · USA',
  '🚗 ValuCar Special Edition',
  '⚽ Định giá xe — Chuẩn bị mùa bóng đá',
]

/** Banner đầu trang — sóng LED + aurora mượt */
export default function WorldCupBanner() {
  const marqueeText = MARQUEE_ITEMS.join('   ✦   ')

  return (
    <div
      id="wc-top-banner"
      className="wc-top-banner relative w-full overflow-hidden"
      style={{ backgroundColor: WC_NAVY }}
    >
      {/* Aurora nền */}
      <div className="wc-banner-aurora pointer-events-none absolute inset-0" aria-hidden />

      <WcTricolorBar />
      <WcLedStrip variant="wave" count={52} />

      <div className="wc-banner-sweep pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative flex h-9 items-center overflow-hidden sm:h-10">
        <div className="absolute left-3 z-10 hidden items-center gap-1.5 sm:flex">
          {['🇨🇦', '🇲🇽', '🇺🇸'].map((f, i) => (
            <span
              key={f}
              className="wc-flag-wave text-sm"
              style={{ animationDelay: `${i * 0.35}s`, animationDuration: `${2.8 + i * 0.3}s` }}
            >
              {f}
            </span>
          ))}
        </div>

        <div className="wc-marquee-mask wc-marquee-mask-top absolute inset-0 flex items-center px-10 sm:px-24">
          <div className="wc-marquee-track wc-marquee-top flex whitespace-nowrap will-change-transform">
            <span className="px-4 text-[10px] font-bold tracking-wide text-white/75 sm:text-[11px]">
              {marqueeText}
            </span>
            <span className="px-4 text-[10px] font-bold tracking-wide text-white/75 sm:text-[11px]" aria-hidden>
              {marqueeText}
            </span>
          </div>
        </div>

        <div className="absolute right-3 z-10 hidden items-center gap-1.5 sm:flex">
          {['🇺🇸', '🇲🇽', '🇨🇦'].map((f, i) => (
            <span
              key={`r-${f}`}
              className="wc-flag-wave text-sm"
              style={{ animationDelay: `${i * 0.35 + 0.15}s`, animationDuration: `${3 + i * 0.25}s` }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      <WcLedStrip variant="twinkle" count={52} reverse className="h-[2px]" />
      <WcTricolorBar />
    </div>
  )
}
