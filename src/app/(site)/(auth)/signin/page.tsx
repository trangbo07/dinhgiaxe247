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

      <Signin />
    </>
  )
}

export default SigninPage
