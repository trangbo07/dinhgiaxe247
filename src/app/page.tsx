import { Suspense } from 'react'
import LandingPage from '@/components/Home/LandingPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ValuCar - Định Giá Xe Ô Tô Thông Minh',
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">Đang tải...</div>
      }>
      <LandingPage />
    </Suspense>
  )
}
