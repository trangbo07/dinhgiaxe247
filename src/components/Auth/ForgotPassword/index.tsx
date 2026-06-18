'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import Loader from '@/components/Common/Loader'

type ForgotPasswordProps = {
  onBack?: () => void
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3.5 text-base text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 disabled:opacity-60'

const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailNorm = email.trim()
    if (!emailNorm) {
      setError('Vui lòng nhập email')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gửi thất bại')
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi hệ thống')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Icon icon="tabler:mail-check" className="text-3xl text-green-600" />
        </div>
        <h3 className="mb-2 text-xl font-bold text-midnight_text">Kiểm tra email</h3>
        <p className="mb-1 text-sm text-gray-500">Chúng tôi đã gửi liên kết đặt lại mật khẩu đến:</p>
        <p className="mb-6 font-semibold text-gray-800">{email}</p>
        <p className="mb-8 text-xs text-gray-400">
          Không thấy email? Kiểm tra thư mục spam hoặc thử lại sau vài phút.
        </p>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-bold text-primary hover:underline">
            ← Quay lại đăng nhập
          </button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
        <Icon icon="tabler:lock-open" className="text-2xl text-primary" />
      </div>
      <h3 className="mb-2 text-xl font-bold text-midnight_text">Quên mật khẩu?</h3>
      <p className="mb-6 text-sm text-gray-500">
        Nhập email đăng ký để nhận liên kết đặt lại mật khẩu.
      </p>

      <form onSubmit={handleSubmit} className="text-left">
        <div className="mb-5">
          <label className="mb-1.5 block text-sm font-semibold text-midnight_text">Email</label>
          <input
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
            disabled={loading}
            className={inputClass}
          />
          {error && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
              <Icon icon="tabler:alert-circle" className="shrink-0 text-base" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70">
          {loading
            ? <><Loader /> Đang gửi...</>
            : <><Icon icon="tabler:send" className="text-lg" />Gửi liên kết đặt lại</>}
        </button>
      </form>

      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="w-full text-center text-sm font-bold text-gray-500 transition-colors hover:text-primary">
          ← Quay lại đăng nhập
        </button>
      )}
    </>
  )
}

export default ForgotPassword
