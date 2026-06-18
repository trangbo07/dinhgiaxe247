export type DashboardNavItem = {
  id: string
  label: string
  shortLabel: string
  icon: string
  href: string
  mobileTab?: boolean
  adminOnly?: boolean
  /** Chỉ hiện với tài khoản business */
  businessOnly?: boolean
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
    businessOnly: true,
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
    label: 'Lịch sử',
    shortLabel: 'Lịch sử',
    icon: 'tabler:history',
    href: '/dashboard/history',
    mobileTab: true,
  },
  {
    id: 'reports',
    label: 'Báo cáo',
    shortLabel: 'Báo cáo',
    icon: 'tabler:report-analytics',
    href: '/dashboard/reports',
    mobileTab: false,
    businessOnly: true,
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
    id: 'plans',
    label: 'Gói của tôi',
    shortLabel: 'Gói',
    icon: 'tabler:crown',
    href: '/dashboard/plans',
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
  // ── Admin only ──────────────────────────────────────
  {
    id: 'admin-overview',
    label: 'Admin Dashboard',
    shortLabel: 'Admin',
    icon: 'tabler:shield-check',
    href: '/dashboard/admin',
    mobileTab: false,
    adminOnly: true,
  },
  {
    id: 'admin-users',
    label: 'Quản lý Users',
    shortLabel: 'Users',
    icon: 'tabler:users-group',
    href: '/dashboard/admin/users',
    mobileTab: false,
    adminOnly: true,
  },
  {
    id: 'admin-leads',
    label: 'Tất cả Leads',
    shortLabel: 'All Leads',
    icon: 'tabler:database',
    href: '/dashboard/admin/leads',
    mobileTab: false,
    adminOnly: true,
  },
  {
    id: 'admin-valuations',
    label: 'Tất cả Định giá',
    shortLabel: 'All Vals',
    icon: 'tabler:chart-bar',
    href: '/dashboard/admin/valuations',
    mobileTab: false,
    adminOnly: true,
  },
]

export function isDashboardNavActive(pathname: string, href: string) {
  if (href === '/dashboard' || href === '/dashboard/admin') return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function getDashboardPageTitle(pathname: string) {
  const item = DASHBOARD_NAV.find((n) => isDashboardNavActive(pathname, n.href))
  return item?.label ?? 'Dashboard'
}
