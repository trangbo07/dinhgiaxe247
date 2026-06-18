'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/Layout/Header/Logo'
import { useEffect, useState } from 'react'
import {
  DASHBOARD_NAV,
  type DashboardNavItem,
  getDashboardPageTitle,
  isDashboardNavActive,
} from '@/lib/dashboard-nav'
import { useWallet } from '@/app/Providers'

// ─── NavLink renders one item with correct active color ──────────────────────

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: DashboardNavItem
  pathname: string
  onClick?: () => void
}) {
  const active = isDashboardNavActive(pathname, item.href)
  const isAdminItem = item.adminOnly

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
        active
          ? 'bg-primary text-white shadow-lg shadow-primary/25'
          : isAdminItem
          ? 'text-blue-700 hover:bg-blue-50'
          : 'text-slate-600 hover:bg-slate-100'
      }`}>
      <Icon icon={item.icon} className="shrink-0 text-xl" />
      {item.label}
    </Link>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname() ?? ''
  const [menuOpen, setMenuOpen] = useState(false)
  const { isUltra, ultraUntil } = useWallet()

  const isAdmin = session?.user?.role === 'admin'
  const isOnAdminPage = pathname.startsWith('/dashboard/admin')
  const accountType = session?.user?.accountType ?? 'business'
  const isPersonal = accountType === 'personal'

  const businessNav = DASHBOARD_NAV.filter((n) => {
    if (n.adminOnly) return false
    if (n.businessOnly && isPersonal) return false
    return true
  })
  const adminNav = DASHBOARD_NAV.filter((n) => n.adminOnly)
  const mobileTabs = businessNav.filter((n) => n.mobileTab)

  const pageTitle = getDashboardPageTitle(pathname)

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/?login=1')
  }, [status, router])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
      </div>
    )
  }
  if (!session) return null

  // ── Sidebar nav content (reused in desktop + mobile drawer) ───────────────
  const SidebarNav = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
      {/* Business section */}
      {businessNav.map((item) => (
        <NavLink key={item.id} item={item} pathname={pathname} onClick={onClick} />
      ))}

      {/* Admin section */}
      {isAdmin && adminNav.length > 0 && (
        <>
          <div className="my-3 flex items-center gap-2 px-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary">
              <Icon icon="tabler:shield-check" className="text-[10px]" />
              Quản trị
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
          <div className="space-y-0.5">
            {adminNav.map((item) => (
              <NavLink key={item.id} item={item} pathname={pathname} onClick={onClick} />
            ))}
          </div>
        </>
      )}
    </nav>
  )

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-slate-50">

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="dashboard-sidebar fixed inset-y-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="border-b border-slate-100 p-5">
          <Logo href="/dashboard" />
        </div>

        <SidebarNav />

        {/* Footer */}
        <div className="border-t border-slate-100 p-4">
          {isAdmin && (
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2">
              <Icon icon="tabler:shield-check" className="shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-blue-700">Admin</p>
                <p className="truncate text-[10px] text-blue-500">{session.user?.email}</p>
              </div>
            </div>
          )}
          {!isAdmin && (
            <>
              <p className="mb-0.5 text-xs text-slate-400">Đăng nhập với</p>
              <p className="truncate text-sm font-bold text-midnight_text">{session.user?.name}</p>
              <p className="truncate text-xs text-slate-400">{session.user?.email}</p>
            </>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50">
            <Icon icon="tabler:logout" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex min-h-[100dvh] flex-1 flex-col lg:pl-64">

        {/* Top bar */}
        <header
          className={`dashboard-topbar sticky top-0 z-20 flex items-center gap-3 border-b px-3 py-3 backdrop-blur-md sm:px-4 lg:px-8 lg:py-4 ${
            isOnAdminPage && isAdmin
              ? 'border-blue-200 bg-blue-50/95'
              : 'border-slate-200 bg-white/95'
          }`}>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-midnight_text hover:bg-slate-100 lg:hidden"
            aria-label="Mở menu">
            <Icon icon="tabler:menu-2" className="text-2xl" />
          </button>

          {/* Mobile title */}
          <div className="min-w-0 flex-1 lg:hidden">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-bold text-midnight_text">{pageTitle}</p>
              {isOnAdminPage && isAdmin && (
                <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-black text-white">
                  ADMIN
                </span>
              )}
              {isUltra && !isAdmin && (
                <span className="shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-1.5 py-0.5 text-[8px] font-black text-white">
                  ULTRA
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-500">{session.user?.name ?? (isPersonal ? 'Cá nhân' : 'Doanh nghiệp')}</p>
          </div>

          {/* Desktop title */}
          <div className="hidden flex-1 lg:block">
            {isOnAdminPage && isAdmin ? (
              <div className="flex items-center gap-2">
                <Icon icon="tabler:shield-check" className="text-xl text-primary" />
                <div>
                  <h1 className="text-xl font-bold text-primary">Admin Control Center</h1>
                  <p className="text-xs text-blue-500">Toàn quyền quản trị hệ thống</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-midnight_text">
                    {isPersonal ? 'Bảng điều khiển Cá nhân' : 'Bảng điều khiển Doanh nghiệp'}
                  </h1>
                  {isUltra && (
                    <span className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-2 py-0.5 text-[9px] font-black text-white">
                      ULTRA
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500">
                  {isPersonal ? 'Định giá · Chat AI · Lịch sử' : 'Định giá · Chat AI · Lead khách · Lưu cloud'}
                </p>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={`hidden h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-bold lg:flex ${
                  isOnAdminPage
                    ? 'bg-primary text-white'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}>
                <Icon icon="tabler:shield-check" />
                Admin
              </Link>
            )}
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

        {/* Mobile bottom tabs (business only) */}
        <nav
          className="hidden"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
          aria-label="Điều hướng chính">
          <div className={`grid grid-cols-${mobileTabs.length}`}>
            {mobileTabs.map((item) => {
              const active = isDashboardNavActive(pathname, item.href)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[10px] font-bold transition-colors sm:text-xs ${
                    active ? 'text-primary' : 'text-slate-500'
                  }`}>
                  <Icon icon={item.icon} className={`text-[22px] ${active ? 'scale-110' : ''}`} />
                  <span className="max-w-full truncate">{item.shortLabel}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="dashboard-mobile-drawer fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
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

            {/* User info */}
            <div className={`border-b px-4 py-3 ${isAdmin ? 'border-blue-100 bg-blue-50' : 'border-slate-100'}`}>
              {isAdmin ? (
                <div className="flex items-center gap-2">
                  <Icon icon="tabler:shield-check" className="text-primary" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-blue-700">{session.user?.name}</p>
                    <p className="truncate text-xs text-blue-500">{session.user?.email}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="truncate text-sm font-bold text-midnight_text">{session.user?.name}</p>
                  <p className="truncate text-xs text-slate-500">{session.user?.email}</p>
                </>
              )}
            </div>

            <SidebarNav onClick={() => setMenuOpen(false)} />

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
