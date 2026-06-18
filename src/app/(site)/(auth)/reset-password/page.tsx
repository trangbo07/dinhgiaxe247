import { Suspense } from 'react'
import ResetPasswordForm from './ResetPasswordForm'
import Loader from '@/components/Common/Loader'

export const metadata = { title: 'Đặt lại mật khẩu | ValuCar' }

export default function ResetPasswordPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white px-8 py-10 text-center shadow-xl">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader />
              <p className="text-sm text-gray-500">Đang tải...</p>
            </div>
          }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </section>
  )
}
