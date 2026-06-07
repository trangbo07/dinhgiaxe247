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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 via-blue-50 to-white border border-blue-200 p-8 text-midnight_text shadow-xl lg:p-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-blue-300/20 blur-3xl"
            aria-hidden
          />

          <div className="relative z-10 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <Icon icon="tabler:building-store" />
                Doanh nghiệp
              </span>
              <h2 className="mt-4 text-3xl font-black leading-tight lg:text-4xl">
                Showroom & đại lý — workspace riêng trên ValuCar
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-slate-600 lg:text-base">
                Đăng nhập dashboard: định giá không giới hạn trong mức hợp lý, nhận lead khách định giá
                trên trang chủ, quản lý hồ sơ và cài đặt doanh nghiệp.
              </p>
              <ul className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {perks.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Icon icon="tabler:check" className="shrink-0 text-primary" />
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-primary/25 transition-transform hover:scale-[1.02]">
                <Icon icon="tabler:login" className="text-xl" />
                Đăng nhập DN
              </button>
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined' && typeof (window as Window & { openSignUpModal?: () => void }).openSignUpModal === 'function') {
                    ;(window as Window & { openSignUpModal?: () => void }).openSignUpModal!()
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-primary/30 bg-white px-8 py-4 font-bold text-primary transition-colors hover:bg-primary/5">
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
