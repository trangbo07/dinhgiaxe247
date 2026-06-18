'use client'

import { useTheme } from '@/app/Providers'

/** Màn hình chờ — quả bóng xoay cho đến khi theme WC đồng bộ xong */
export default function WorldCupBootLoader() {
  const { worldcupEnabled } = useTheme()

  return (
    <div
      className={`wc-boot-loader fixed inset-0 z-[9999] flex flex-col items-center justify-center ${
        worldcupEnabled ? 'wc-boot-loader--wc' : 'wc-boot-loader--default'
      }`}
      role="status"
      aria-live="polite"
      aria-label="Đang tải ValuCar"
    >
      {/* Nền gradient */}
      <div className="wc-boot-loader-bg pointer-events-none absolute inset-0" aria-hidden />

      {/* Quả bóng */}
      <div className="wc-boot-ball relative z-10 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28">
        <div className="wc-boot-ball-orbit absolute inset-0 rounded-full" aria-hidden />
        <span className="wc-boot-ball-emoji relative text-5xl sm:text-6xl" aria-hidden>
          ⚽
        </span>
      </div>

      {/* Vòng tricolor (WC) */}
      {worldcupEnabled && (
        <div className="wc-boot-tricolor relative z-10 mt-8 flex h-1 w-40 overflow-hidden rounded-full sm:w-48">
          <div className="flex-1 bg-[#C8102E]" />
          <div className="flex-1 bg-[#006847]" />
          <div className="flex-1 bg-[#0057A8]" />
        </div>
      )}

      <p className="relative z-10 mt-6 text-sm font-semibold tracking-wide text-slate-500">
        {worldcupEnabled ? 'ValuCar · World Cup Edition' : 'ValuCar'}
      </p>
      <p className="relative z-10 mt-1 text-xs text-slate-400">Đang chuẩn bị giao diện…</p>

      {/* Chấm loading */}
      <div className="relative z-10 mt-4 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="wc-boot-dot h-1.5 w-1.5 rounded-full bg-primary/60"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}
