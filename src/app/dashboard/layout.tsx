import DashboardShell from '@/components/Dashboard/DashboardShell'

export const metadata = {
  title: 'Dashboard | ValuCar',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardShell>{children}</DashboardShell>
}
