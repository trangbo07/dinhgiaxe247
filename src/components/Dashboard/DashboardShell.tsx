'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/Layout/Header/Logo'
import { useEffect } from 'react'

const nav = [
  { id: 'overview', label: 'Tổng quan', icon: 'tabler:layout-dashboard', href: '/dashboard' },
  { id: 'leads', label: 'Khách website', icon: 'tabler:users', href: '/dashboard/leads' },
  { id: 'valuation', label: 'Định giá xe', icon: 'tabler:car', href: '/dashboard/valuation' },
  { id: 'history', label: 'Lịch sử DN', icon: 'tabler:history', href: '/dashboard/history' },
  { id: 'insights', label: 'Tips & AI', icon: 'tabler:bulb', href: '/dashboard/insights' },
  { id: 'settings', label: 'Cài đặt', icon: 'tabler:settings', href: '/dashboard/settings' },
]

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/?login=1')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Icon icon="tabler:loader" className="text-4xl text-primary animate-spin" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 bg-white border-r border-slate-200 z-30">
        <div className="p-5 border-b border-slate-100">
          <Logo href="/dashboard" />
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon icon={item.icon} className="text-xl" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Đăng nhập với</p>
          <p className="text-sm font-bold text-midnight_text truncate">
            {session.user?.name}
          </p>
          <p className="text-xs text-slate-500 truncate">{session.user?.email}</p>
          <Link
            href="/dashboard/settings"
            className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:bg-primary/5 py-2 rounded-lg transition-colors">
            <Icon icon="tabler:settings" />
            Cài đặt
          </Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-sm font-semibold text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors">
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <div className="lg:hidden">
            <Logo href="/dashboard" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg lg:text-xl font-bold text-midnight_text">
              Bảng điều khiển Doanh nghiệp
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              Định giá không giới hạn · Chat AI không giới hạn · Lưu lịch sử trên cloud
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              <Icon icon="tabler:infinity" /> Unlimited
            </span>
            <Link
              href="/dashboard/settings"
              className="hidden sm:inline-flex items-center gap-1 text-sm text-slate-500 hover:text-primary font-medium">
              <Icon icon="tabler:settings" />
              Cài đặt
            </Link>
            <Link
              href="/"
              className="text-sm text-slate-500 hover:text-primary font-medium">
              Trang chủ
            </Link>
          </div>
        </header>

        <div className="lg:hidden flex overflow-x-auto gap-2 px-4 py-3 border-b border-slate-200 bg-white">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold ${
                  active ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                {item.label}
              </Link>
            )
          })}
        </div>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
