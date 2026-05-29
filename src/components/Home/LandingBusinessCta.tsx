'use client'

import { Icon } from '@iconify/react/dist/iconify.js'

const perks = [
  'Định giá cao (có giới hạn chống spam)',
  'Chat AI chuyên gia',
  'Lead khách từ website',
  'Lưu lịch sử Supabase',
]

export default function LandingBusinessCta() {
  return (
    <section className="py-16 lg:py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-midnight_text via-slate-900 to-primary p-8 text-white shadow-2xl lg:p-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue-500/30 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-100">
                <Icon icon="tabler:building-store" />
                Doanh nghiệp
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight lg:text-4xl">
                Showroom & đại lý — workspace riêng trên ValuCar
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-blue-100/90 lg:text-base">
                Đăng nhập dashboard: định giá không giới hạn trong mức hợp lý, nhận lead khách định giá
                trên trang chủ, quản lý hồ sơ và cài đặt doanh nghiệp.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium">
                    <Icon icon="tabler:check" className="shrink-0 text-emerald-400" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-stretch gap-3 sm:flex-row lg:flex-col lg:items-end">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof (window as Window & { openSignInModal?: () => void }).openSignInModal === 'function') {
                    ;(window as Window & { openSignInModal?: () => void }).openSignInModal!()
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-8 py-4 font-bold text-midnight_text shadow-lg transition-transform hover:scale-[1.02]">
                <Icon icon="tabler:login" className="text-xl text-primary" />
                Đăng nhập DN
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof (window as Window & { openSignUpModal?: () => void }).openSignUpModal === 'function') {
                    ;(window as Window & { openSignUpModal?: () => void }).openSignUpModal!()
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur transition-colors hover:bg-white/20">
                <Icon icon="tabler:user-plus" className="text-xl" />
                Đăng ký miễn phí
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
