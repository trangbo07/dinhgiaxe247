'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/Layout/Header/Logo'
import { useEffect, useState } from 'react'
import {
  DASHBOARD_NAV,
  getDashboardPageTitle,
  isDashboardNavActive,
} from '@/lib/dashboard-nav'

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const pageTitle = getDashboardPageTitle(pathname ?? '')
  const mobileTabs = DASHBOARD_NAV.filter((n) => n.mobileTab)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/?login=1')
    }
  }, [status, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 p-5">
          <Logo href="/dashboard" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {DASHBOARD_NAV.map((item) => {
            const active = isDashboardNavActive(pathname ?? '', item.href)
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon icon={item.icon} className="text-xl shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <p className="mb-1 text-xs text-slate-500">Đăng nhập với</p>
          <p className="truncate text-sm font-bold text-midnight_text">
            {session.user?.name}
          </p>
          <p className="truncate text-xs text-slate-500">{session.user?.email}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50">
            <Icon icon="tabler:logout" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex min-h-[100dvh] flex-1 flex-col lg:pl-64">
        {/* Mobile + tablet top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-3 py-3 backdrop-blur-md sm:px-4 lg:px-8 lg:py-4">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-midnight_text hover:bg-slate-100 lg:hidden"
            aria-label="Mở menu">
            <Icon icon="tabler:menu-2" className="text-2xl" />
          </button>

          <div className="min-w-0 flex-1 lg:hidden">
            <p className="truncate text-base font-bold text-midnight_text">{pageTitle}</p>
            <p className="truncate text-xs text-slate-500">
              {session.user?.name ?? 'Doanh nghiệp'}
            </p>
          </div>

          <div className="hidden flex-1 lg:block">
            <h1 className="text-xl font-bold text-midnight_text">Bảng điều khiển Doanh nghiệp</h1>
            <p className="text-xs text-slate-500">
              Định giá · Chat AI · Lead khách · Lưu cloud
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-primary lg:w-auto lg:px-3 lg:py-2"
              aria-label="Trang chủ">
              <Icon icon="tabler:home" className="text-xl lg:mr-1" />
              <span className="hidden text-sm font-medium lg:inline">Trang chủ</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-x-hidden px-3 py-4 pb-24 sm:px-4 sm:py-5 lg:px-8 lg:pb-8 lg:pt-6">
          {children}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          aria-label="Điều hướng chính">
          <div className="grid grid-cols-5">
            {mobileTabs.map((item) => {
              const active = isDashboardNavActive(pathname ?? '', item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-bold transition-colors sm:text-xs ${
                    active ? 'text-primary' : 'text-slate-500'
                  }`}>
                  <Icon
                    icon={item.icon}
                    className={`text-[22px] ${active ? 'scale-110' : ''}`}
                  />
                  <span className="max-w-full truncate">{item.shortLabel}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Mobile drawer menu (Tips & AI + logout) */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Đóng menu"
            onClick={() => setMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,280px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <Logo href="/dashboard" />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100"
                aria-label="Đóng">
                <Icon icon="tabler:x" className="text-2xl" />
              </button>
            </div>

            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-bold text-midnight_text truncate">
                {session.user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {DASHBOARD_NAV.map((item) => {
                const active = isDashboardNavActive(pathname ?? '', item.href)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-[48px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}>
                    <Icon icon={item.icon} className="text-xl" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div
              className="border-t border-slate-100 p-4"
              style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-red-50 text-sm font-semibold text-red-600">
                <Icon icon="tabler:logout" />
                Đăng xuất
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
