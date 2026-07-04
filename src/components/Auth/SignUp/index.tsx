'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Icon } from '@iconify/react/dist/iconify.js'
import Logo from '@/components/Layout/Header/Logo'
import Loader from '@/components/Common/Loader'

const eyeButtonClass =
  'absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'

type SignUpProps = {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-5 py-3.5 text-base text-dark outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 text-gray-800'

const SignUp = ({ onSuccess, onSwitchToSignIn }: SignUpProps) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const name = form.name.trim()
    const email = form.email.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword

    if (!name || !email || !password || !confirmPassword) {
      toast.error('Vui lòng nhập tên doanh nghiệp, email và mật khẩu')
      return
    }

    if (name.length < 2) {
      toast.error('Tên doanh nghiệp không hợp lệ')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Email không hợp lệ')
      return
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Đăng ký thất bại')

      toast.success(data.message || 'Đăng ký thành công')
      setForm({ name: '', email: '', password: '', confirmPassword: '' })

      if (onSuccess) {
        onSuccess()
      } else if (onSwitchToSignIn) {
        onSwitchToSignIn()
      } else if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Đăng ký thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto mb-5 inline-block max-w-[160px] text-center">
        <Logo linked={false} />
      </div>

      <h3 className='text-xl font-bold text-midnight_text mb-1'>
        Đăng Ký Doanh Nghiệp
      </h3>
      <p className='text-sm text-gray-500 mb-4'>
        4 lượt định giá miễn phí/tháng — nâng cấp gói Doanh nghiệp để dùng không giới hạn.
      </p>

      <form onSubmit={handleSubmit} className='text-left'>
        <div className='mb-4'>
          <label className='block text-sm font-semibold text-midnight_text mb-1.5'>
            Tên doanh nghiệp <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            placeholder='VD: Showroom Ô tô ABC'
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-semibold text-midnight_text mb-1.5'>
            Email <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            placeholder='email@congty.com'
            autoComplete='email'
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          <p className='mt-1.5 flex items-center gap-1 text-xs text-red-500'>
            <Icon icon='tabler:info-circle' className='shrink-0 text-sm' />
            Vui lòng cung cấp đúng địa chỉ email để nhận thông báo xác nhận tài khoản.
          </p>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-semibold text-midnight_text mb-1.5'>
            Mật khẩu <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Tối thiểu 6 ký tự'
              autoComplete='new-password'
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={`${inputClass} pr-12`}
            />
            <button
              type='button'
              onClick={() => setShowPassword((v) => !v)}
              className={eyeButtonClass}
              tabIndex={-1}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} className='text-xl' />
            </button>
          </div>
        </div>

        <div className='mb-5'>
          <label className='block text-sm font-semibold text-midnight_text mb-1.5'>
            Xác nhận mật khẩu <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder='Nhập lại mật khẩu'
              autoComplete='new-password'
              required
              minLength={6}
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className={`${inputClass} pr-12`}
            />
            <button
              type='button'
              onClick={() => setShowConfirm((v) => !v)}
              className={eyeButtonClass}
              tabIndex={-1}
              aria-label={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
              <Icon icon={showConfirm ? 'tabler:eye-off' : 'tabler:eye'} className='text-xl' />
            </button>
          </div>
        </div>

        <div className='mb-5 rounded-xl px-4 py-3 text-xs font-medium border bg-blue-50 border-blue-100 text-blue-700'>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1"><Icon icon="tabler:check" />4 lượt định giá miễn phí/tháng</span>
            <span className="flex items-center gap-1"><Icon icon="tabler:check" />Dashboard quản lý</span>
            <span className="flex items-center gap-1"><Icon icon="tabler:check" />Quản lý lead khách</span>
            <span className="flex items-center gap-1"><Icon icon="tabler:check" />Không giới hạn khi nâng cấp gói</span>
          </div>
        </div>

        <button
          type='submit'
          disabled={loading}
          className='w-full py-3.5 rounded-xl text-base font-bold transition-all duration-300 text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100 mb-4'>
          {loading
            ? <><Loader /> Đang tạo tài khoản...</>
            : <><Icon icon="tabler:building-store" className="text-lg" />Tạo tài khoản Doanh nghiệp</>}
        </button>
      </form>

      <p className='text-gray-500 text-sm text-center'>
        Đã có tài khoản?{' '}
        {onSwitchToSignIn ? (
          <button
            type='button'
            onClick={onSwitchToSignIn}
            className='text-primary font-bold hover:underline'>
            Đăng nhập ngay
          </button>
        ) : (
          <Link href='/signin' className='text-primary font-bold hover:underline'>
            Đăng nhập ngay
          </Link>
        )}
      </p>
    </>
  )
}

export default SignUp
