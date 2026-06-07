import LegalPageShell from '@/components/Legal/LegalPageShell'
import PrivacyPolicyContent, { privacyPolicyToc } from '@/components/Legal/PrivacyPolicyContent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính sách Bảo mật | ValuCar',
  description:
    'Chính sách bảo mật thông tin cá nhân khi sử dụng nền tảng định giá xe ValuCar — thu thập, sử dụng và quyền của người dùng.',
}

export default function PrivacyPolicyPage() {
  return (
    <LegalPageShell
      title="Chính sách Bảo mật Thông tin"
      subtitle="Thông tin cá nhân khi tra cứu giá xe và dùng tài khoản công ty trên ValuCar — viết ngắn gọn, dễ hiểu."
      toc={privacyPolicyToc}>
      <PrivacyPolicyContent />
    </LegalPageShell>
  )
}
