'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/components/Layout/Header/Logo'
import Loader from '@/components/Common/Loader'

type SigninProps = {
  onSwitchToSignUp?: () => void
  onSuccess?: () => void
}

const Signin = ({ onSwitchToSignUp, onSuccess }: SigninProps) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const emailNorm = email.trim()
    const passwordNorm = password.trim()
    if (!emailNorm || !passwordNorm) {
      toast.error('Vui lòng nhập email và mật khẩu')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email: emailNorm,
        password: passwordNorm,
        redirect: false,
      })

      if (result?.error) {
        toast.error(result.error)
        return
      }

      if (result?.ok) {
        toast.success('Đăng nhập thành công')
        onSuccess?.()
        router.push('/dashboard')
        router.refresh()
        return
      }

      toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Lỗi đăng nhập')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto mb-6 inline-block max-w-[160px] text-center">
        <Logo linked={false} />
      </div>

      <h3 className="mb-2 text-2xl font-bold text-midnight_text">Đăng Nhập Doanh Nghiệp</h3>
      <p className="mb-8 text-sm text-gray-500">Dùng email doanh nghiệp đã đăng ký trên ValuCar</p>

      <form onSubmit={loginUser} className="text-left">
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-midnight_text">Email</label>
          <input
            type="email"
            placeholder="email@congty.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-semibold text-midnight_text">Mật khẩu</label>
          <input
            type="password"
            placeholder="Mật khẩu"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? (
            <>
              Đang xử lý <Loader />
            </>
          ) : (
            'Đăng nhập'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        {onSwitchToSignUp ? (
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-bold text-primary hover:underline">
            Đăng ký doanh nghiệp
          </button>
        ) : (
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Đăng ký doanh nghiệp
          </Link>
        )}
      </p>
    </>
  )
}

export default Signin
