'use client'

import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/Layout/Header/Logo'
import Loader from '@/components/Common/Loader'
import ForgotPassword from '@/components/Auth/ForgotPassword'

type SigninProps = {
  onSwitchToSignUp?: () => void
  onSuccess?: () => void
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60'

const inputErrorClass =
  'w-full rounded-xl border border-red-400 bg-red-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:opacity-60'

const Signin = ({ onSwitchToSignUp, onSuccess }: SigninProps) => {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const passwordRef = useRef<HTMLInputElement>(null)

  if (showForgot) {
    return (
      <>
        <div className="mx-auto mb-6 inline-block max-w-[160px] text-center">
          <Logo linked={false} />
        </div>
        <ForgotPassword onBack={() => setShowForgot(false)} />
      </>
    )
  }

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const emailNorm = email.trim()
    const passwordNorm = password.trim()
    if (!emailNorm || !passwordNorm) {
      toast.error('Vui lòng nhập email và mật khẩu')
      return
    }

    setLoading(true)
    setPasswordError('')
    try {
      const result = await signIn('credentials', {
        email: emailNorm,
        password: passwordNorm,
        redirect: false,
      })

      if (result?.error) {
        setPassword('')
        setPasswordError(result.error)
        setTimeout(() => passwordRef.current?.focus(), 50)
        return
      }

      if (result?.ok) {
        toast.success('Đăng nhập thành công')
        onSuccess?.()
        router.push('/dashboard')
        router.refresh()
        return
      }

      setPassword('')
      setPasswordError('Đăng nhập thất bại. Vui lòng thử lại.')
      setTimeout(() => passwordRef.current?.focus(), 50)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi đăng nhập'
      setPassword('')
      setPasswordError(msg)
      setTimeout(() => passwordRef.current?.focus(), 50)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto mb-6 inline-block max-w-[160px] text-center">
        <Logo linked={false} />
      </div>

      <h3 className="mb-2 text-2xl font-bold text-midnight_text">Đăng Nhập</h3>
      <p className="mb-8 text-sm text-gray-500">Dùng email đã đăng ký trên ValuCar</p>

      <form onSubmit={loginUser} className="text-left">
        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-midnight_text">Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className={inputClass}
          />
        </div>

        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-semibold text-midnight_text">Mật khẩu</label>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-xs font-semibold text-primary hover:underline">
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <input
              ref={passwordRef}
              type={showPassword ? 'text' : 'password'}
              placeholder="Mật khẩu"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError('') }}
              disabled={loading}
              className={`${passwordError ? inputErrorClass : inputClass} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} className="text-xl" />
            </button>
          </div>
          {passwordError && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
              <Icon icon="tabler:alert-circle" className="shrink-0 text-base" />
              {passwordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-lg font-bold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
          {loading ? <><Loader /> Đang xử lý</> : 'Đăng nhập'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Chưa có tài khoản?{' '}
        {onSwitchToSignUp ? (
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-bold text-primary hover:underline">
            Đăng ký ngay
          </button>
        ) : (
          <Link href="/signup" className="font-bold text-primary hover:underline">
            Đăng ký ngay
          </Link>
        )}
      </p>
    </>
  )
}

export default Signin
