'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { createSupabaseBrowserClient } from '@/utils/supabase'
import Loader from '@/components/Common/Loader'
import Logo from '@/components/Layout/Header/Logo'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60'

const inputErrorClass =
  'w-full rounded-xl border border-red-400 bg-red-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:opacity-60'

type Status = 'verifying' | 'ready' | 'token-error' | 'success'

export default function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [status, setStatus] = useState<Status>('verifying')
  const [tokenError, setTokenError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabaseRef = useRef(createSupabaseBrowserClient())

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'recovery') {
      setTokenError('Liên kết không hợp lệ hoặc đã hết hạn.')
      setStatus('token-error')
      return
    }

    supabaseRef.current.auth
      .verifyOtp({ token_hash: tokenHash, type: 'recovery' })
      .then(({ error }) => {
        if (error) {
          setTokenError('Liên kết đã hết hạn hoặc đã được sử dụng. Vui lòng yêu cầu lại.')
          setStatus('token-error')
        } else {
          setStatus('ready')
        }
      })
      .catch(() => {
        setTokenError('Lỗi xác thực. Vui lòng thử lại.')
        setStatus('token-error')
      })
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setFieldError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirm) {
      setFieldError('Mật khẩu xác nhận không khớp')
      return
    }
    setFieldError('')
    setLoading(true)
    try {
      const { error } = await supabaseRef.current.auth.updateUser({ password })
      if (error) throw new Error(error.message)
      setStatus('success')
      setTimeout(() => router.push('/signin'), 3000)
    } catch (err) {
      setFieldError(err instanceof Error ? err.message : 'Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto mb-6 inline-block max-w-[160px]">
        <Logo linked={false} />
      </div>

      {status === 'verifying' && (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader />
          <p className="text-sm text-gray-500">Đang xác thực liên kết...</p>
        </div>
      )}

      {status === 'token-error' && (
        <div className="py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Icon icon="tabler:link-off" className="text-3xl text-red-500" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-midnight_text">Liên kết không hợp lệ</h3>
          <p className="mb-8 text-sm text-gray-500">{tokenError}</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95">
            <Icon icon="tabler:arrow-left" />
            Yêu cầu lại liên kết
          </Link>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Icon icon="tabler:lock-check" className="text-2xl text-primary" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-midnight_text">Đặt mật khẩu mới</h3>
          <p className="mb-6 text-sm text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn.</p>

          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-semibold text-midnight_text">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldError) setFieldError('') }}
                  disabled={loading}
                  className={`${fieldError ? inputErrorClass : inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}>
                  <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} className="text-xl" />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-1.5 block text-sm font-semibold text-midnight_text">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); if (fieldError) setFieldError('') }}
                  disabled={loading}
                  className={`${fieldError ? inputErrorClass : inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                  tabIndex={-1}>
                  <Icon icon={showConfirm ? 'tabler:eye-off' : 'tabler:eye'} className="text-xl" />
                </button>
              </div>
              {fieldError && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                  <Icon icon="tabler:alert-circle" className="shrink-0 text-base" />
                  {fieldError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
              {loading
                ? <><Loader /> Đang cập nhật...</>
                : <><Icon icon="tabler:lock-check" className="text-lg" />Đặt mật khẩu mới</>}
            </button>
          </form>
        </>
      )}

      {status === 'success' && (
        <div className="py-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Icon icon="tabler:circle-check" className="text-3xl text-green-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-midnight_text">Mật khẩu đã được cập nhật!</h3>
          <p className="mb-8 text-sm text-gray-500">
            Đang chuyển hướng đến trang đăng nhập...
          </p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
            <Icon icon="tabler:arrow-left" />
            Đăng nhập ngay
          </Link>
        </div>
      )}
    </>
  )
}
