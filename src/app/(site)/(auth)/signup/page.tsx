import SignUp from '@/components/Auth/SignUp'
import Breadcrumb from '@/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng Ký Doanh Nghiệp | Định Giá Xe',
}

const SignupPage = () => {
  return (
    <>
      <Breadcrumb pageName='Đăng Ký Doanh Nghiệp' />

      <section className='pb-16 pt-4'>
        <div className='container'>
          <div className='mx-auto max-w-md rounded-3xl border border-gray-100 bg-white px-8 py-10 text-center shadow-xl'>
            <SignUp />
          </div>
        </div>
      </section>
    </>
  )
}

export default SignupPage
