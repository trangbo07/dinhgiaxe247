'use client'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Logo from '@/components/Layout/Header/Logo'
import Loader from '@/components/Common/Loader'

const Signin = () => {
  const router = useRouter()

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    checkboxToggle: false,
  })
  const [loading, setLoading] = useState(false)

  const loginUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const email = loginData.email.trim()
    const password = loginData.password.trim()
    if (!email || !password) {
      toast.error('Vui lòng nhập tài khoản và mật khẩu')
      return
    }

    setLoading(true)
    signIn('credentials', { email, password, redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error(callback?.error)
          console.log(callback?.error)
          setLoading(false)
          return
        }

        if (callback?.ok && !callback?.error) {
          toast.success('Đăng nhập thành công')
          setLoading(false)
          // Hide modal and refresh page to show session, or just reload smoothly
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }
      })
      .catch((err) => {
        setLoading(false)
        console.log(err.message)
        toast.error(err.message)
      })
  }

  return (
    <>
      <div className='mb-6 text-center mx-auto inline-block max-w-[160px]'>
        <Logo />
      </div>
      
      <h3 className="text-2xl font-bold text-midnight_text mb-2">Đăng Nhập Hệ Thống</h3>
      <p className="text-sm text-gray-500 mb-8">Xin chào bạn đã quay trở lại với ValuCar </p>
      <p className="text-sm text-gray-500 mb-8">Tài khoản demo : admin - mật khẩu : 123</p>
      <form onSubmit={loginUser}>
        <div className='mb-5'>
          <input
            type='text'
            placeholder='Tài khoản'
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            className='w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-5 py-3.5 text-base text-dark outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 text-gray-800'
          />
        </div>
        <div className='mb-6'>
          <input
            type='password'
            placeholder='Mật khẩu'
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className='w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-5 py-3.5 text-base text-dark outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10 text-gray-800'
          />
        </div>
        <div className='mb-8'>
          <button
            type='submit'
            className='w-full py-3.5 rounded-xl text-lg font-bold transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-primary to-blue-600 shadow-lg shadow-primary/30 hover:shadow-xl hover:scale-[1.02] flex justify-center items-center gap-2'>
            Đăng Nhập {loading && <Loader />}
          </button>
        </div>
      </form>

      <Link
        href='/'
        className='mb-4 inline-block text-sm font-medium text-gray-500 hover:text-primary transition-colors'>
        Quên mật khẩu?
      </Link>
      <p className='text-gray-500 text-sm'>
        Chưa có tài khoản?{' '}
        <Link href='/' className='text-primary font-bold hover:underline'>
          Đăng Ký Khách Mới
        </Link>
      </p>
    </>
  )
}

export default Signin
