import type { ReactNode } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'

export type TocItem = { id: string; label: string }

type LegalPageShellProps = {
  title: string
  subtitle?: string
  updatedAt?: string
  toc?: readonly TocItem[]
  children: ReactNode
}

export default function LegalPageShell({
  title,
  subtitle,
  updatedAt = 'Cập nhật: tháng 6/2026',
  toc,
  children,
}: LegalPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-br from-midnight_text via-slate-900 to-primary/90">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />

        <div className="container relative z-10 px-4 py-12 lg:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 backdrop-blur-sm transition hover:bg-white/20 hover:text-white">
            <Icon icon="tabler:arrow-left" className="text-lg" />
            Về trang chủ
          </Link>

          <div className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white/90">
                <Icon icon="tabler:shield-lock" className="text-base text-blue-300" />
                ValuCar · Pháp lý
              </div>
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-4 text-base leading-relaxed text-white/75 sm:text-lg">{subtitle}</p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3 lg:shrink-0">
              <span className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                <Icon icon="tabler:calendar" className="text-lg text-white/70" />
                {updatedAt}
              </span>
              <span className="inline-flex items-center gap-2 rounded-xl bg-blue-500/20 px-4 py-2.5 text-sm font-semibold text-blue-100 border border-blue-400/30">
                <Icon icon="tabler:certificate" className="text-lg" />
                Bảo vệ thông tin cá nhân
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container px-4 py-12 lg:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            {toc && toc.length > 0 ? (
              <aside className="lg:col-span-4 xl:col-span-3">
                <nav
                  aria-label="Mục lục chính sách"
                  className="lg:sticky lg:top-28 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
                  <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <Icon icon="tabler:list" className="text-primary text-base" />
                    Mục lục
                  </p>
                  <ul className="space-y-1">
                    {toc.map((item, i) => (
                      <li key={item.id}>
                        <a
                          href={`#${item.id}`}
                          className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-primary/5 hover:text-primary">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500 transition group-hover:bg-primary group-hover:text-white">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </aside>
            ) : null}

            <div className={toc?.length ? 'lg:col-span-8 xl:col-span-9' : 'lg:col-span-12'}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
