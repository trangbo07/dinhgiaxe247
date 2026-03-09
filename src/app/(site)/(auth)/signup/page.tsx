import SignUp from '@/app/components/Auth/SignUp'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Đăng Ký | Định Giá Xe',
}

const SignupPage = () => {
  return (
    <>
      <Breadcrumb pageName='Trang Đăng Ký' />

      <SignUp />
    </>
  )
}

export default SignupPage
