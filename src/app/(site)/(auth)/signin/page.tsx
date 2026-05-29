import Signin from '@/components/Auth/SignIn'
import Breadcrumb from '@/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng Nhập | Định Giá Xe',
}

const SigninPage = () => {
  return (
    <>
      <Breadcrumb pageName='Trang Đăng Nhập' />

      <section className='pb-16 pt-4'>
        <div className='container'>
          <div className='mx-auto max-w-md rounded-3xl border border-gray-100 bg-white px-8 py-10 text-center shadow-xl'>
            <Signin />
          </div>
        </div>
      </section>
    </>
  )
}

export default SigninPage
