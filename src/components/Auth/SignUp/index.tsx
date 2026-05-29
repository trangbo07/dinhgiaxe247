'use client'

import Link from 'next/link'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/components/Layout/Header/Logo'
import Loader from '@/components/Common/Loader'

type SignUpProps = {
  onSuccess?: () => void
  onSwitchToSignIn?: () => void
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-5 py-3.5 text-base text-dark outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 text-gray-800'

const SignUp = ({ onSuccess, onSwitchToSignIn }: SignUpProps) => {
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const companyName = form.companyName.trim()
    const email = form.email.trim()
    const password = form.password
    const confirmPassword = form.confirmPassword

    if (!companyName || !email || !password || !confirmPassword) {
      toast.error('Vui lòng nhập tên doanh nghiệp, email và mật khẩu')
      return
    }

    if (companyName.length < 2) {
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
        body: JSON.stringify({ companyName, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Đăng ký thất bại')
      }

      toast.success(data.message || 'Đăng ký doanh nghiệp thành công')
      setForm({ companyName: '', email: '', password: '', confirmPassword: '' })

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
      <div className='mb-6 text-center mx-auto inline-block max-w-[160px]'>
        <Logo />
      </div>

      <h3 className='text-2xl font-bold text-midnight_text mb-2'>
        Đăng Ký Doanh Nghiệp
      </h3>
      <p className='text-sm text-gray-500 mb-8'>
        Chỉ cần tên doanh nghiệp và email — bổ sung hồ sơ chi tiết sau khi đăng
        nhập.
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
            value={form.companyName}
            onChange={(e) =>
              setForm({ ...form, companyName: e.target.value })
            }
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
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-semibold text-midnight_text mb-1.5'>
            Mật khẩu <span className='text-red-500'>*</span>
          </label>
          <input
            type='password'
            placeholder='Tối thiểu 6 ký tự'
            autoComplete='new-password'
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={inputClass}
          />
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-semibold text-midnight_text mb-1.5'>
            Xác nhận mật khẩu <span className='text-red-500'>*</span>
          </label>
          <input
            type='password'
            placeholder='Nhập lại mật khẩu'
            autoComplete='new-password'
            required
            minLength={6}
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className={inputClass}
          />
        </div>

        <div className='mb-6'>
          <button
            type='submit'
            disabled={loading}
            className='w-full py-3.5 rounded-xl text-lg font-bold transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] flex justify-center items-center gap-2 disabled:opacity-70 disabled:hover:scale-100'>
            Tạo tài khoản {loading && <Loader />}
          </button>
        </div>
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
