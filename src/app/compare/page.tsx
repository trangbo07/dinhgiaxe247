import type { Metadata } from 'next'
import CarCompareTool from '@/components/Home/CarCompareTool'

export const metadata: Metadata = {
  title: 'So sánh 2 xe | ValuCar',
  description: 'So sánh song song hai dòng xe — giá thị trường, km, chi phí/km và gợi ý lựa chọn.',
}

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50/80 via-white to-white">
      <CarCompareTool />
    </main>
  )
}
