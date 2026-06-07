import LegalPageShell from '@/components/Legal/LegalPageShell'
import TermsContent, { termsToc } from '@/components/Legal/TermsContent'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Điều khoản & Điều kiện | ValuCar',
  description:
    'Điều khoản sử dụng dịch vụ định giá xe ValuCar — quyền, nghĩa vụ, gói doanh nghiệp và giới hạn trách nhiệm.',
}

export default function TermsPage() {
  return (
    <LegalPageShell
      title="Điều khoản và Điều kiện"
      subtitle="Quy định khi tra cứu giá xe, dùng tài khoản công ty và các gói dịch vụ trên ValuCar."
      toc={termsToc}>
      <TermsContent />
    </LegalPageShell>
  )
}
