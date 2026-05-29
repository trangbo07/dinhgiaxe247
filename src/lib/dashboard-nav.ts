export type DashboardNavItem = {
  id: string
  label: string
  shortLabel: string
  icon: string
  href: string
  /** Hiện trên bottom bar mobile (tối đa 5) */
  mobileTab?: boolean
}

export const DASHBOARD_NAV: DashboardNavItem[] = [
  {
    id: 'overview',
    label: 'Tổng quan',
    shortLabel: 'Tổng quan',
    icon: 'tabler:layout-dashboard',
    href: '/dashboard',
    mobileTab: true,
  },
  {
    id: 'leads',
    label: 'Khách website',
    shortLabel: 'Khách',
    icon: 'tabler:users',
    href: '/dashboard/leads',
    mobileTab: true,
  },
  {
    id: 'valuation',
    label: 'Định giá xe',
    shortLabel: 'Định giá',
    icon: 'tabler:car',
    href: '/dashboard/valuation',
    mobileTab: true,
  },
  {
    id: 'history',
    label: 'Lịch sử DN',
    shortLabel: 'Lịch sử',
    icon: 'tabler:history',
    href: '/dashboard/history',
    mobileTab: true,
  },
  {
    id: 'insights',
    label: 'Tips & AI',
    shortLabel: 'Tips',
    icon: 'tabler:bulb',
    href: '/dashboard/insights',
    mobileTab: false,
  },
  {
    id: 'settings',
    label: 'Cài đặt',
    shortLabel: 'Cài đặt',
    icon: 'tabler:settings',
    href: '/dashboard/settings',
    mobileTab: true,
  },
]

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getDashboardPageTitle(pathname: string) {
  const item = DASHBOARD_NAV.find((n) => isDashboardNavActive(pathname, n.href))
  return item?.label ?? 'Dashboard'
}
