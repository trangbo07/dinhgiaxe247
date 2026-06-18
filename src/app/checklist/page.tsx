import type { Metadata } from 'next'
import GuestChecklistSection from '@/components/Home/GuestChecklistSection'

export const metadata: Metadata = {
  title: 'Checklist mua xe cũ | ValuCar',
  description: '15 hạng mục kiểm tra khi mua xe cũ — gợi ý % thương lượng dựa trên giá định giá.',
}

export default function ChecklistPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-white">
      <GuestChecklistSection />
    </main>
  )
}
