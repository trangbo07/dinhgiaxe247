import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import ContactChannels from '@/components/Contact/ContactChannels'
import LegalSection from './LegalSection'
import { privacyPolicySections, privacyPolicyToc } from './privacy-policy-sections'

export { privacyPolicyToc }

export default function PrivacyPolicyContent() {
  return (
    <div className="space-y-6">
      <section
        id="tong-quan"
        className="scroll-mt-28 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-blue-50/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon="tabler:info-circle" className="text-2xl" />
          </div>
          <div>
            <h2 className="text-lg font-black text-midnight_text">Tổng quan</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Trang này giải thích cách <strong className="text-midnight_text">ValuCar</strong> thu
              thập, dùng và bảo vệ thông tin của bạn khi tra cứu giá xe hoặc dùng tài khoản công ty.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Nếu bạn tra cứu miễn phí rồi gửi họ tên và số điện thoại, thông tin đó có thể được
              salon hoặc đại lý đang dùng <strong className="text-midnight_text">gói doanh nghiệp</strong>{' '}
              xem trên ValuCar để gọi tư vấn — đúng với tính năng dịch vụ, không chuyển cho bên lạ
              bên ngoài.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Bằng việc tiếp tục sử dụng dịch vụ, bạn xác nhận đã đọc chính sách này và{' '}
              <Link href="/dieu-khoan-dieu-kien" className="font-semibold text-primary hover:underline">
                Điều khoản sử dụng
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: 'tabler:lock', label: 'Mã hóa & HTTPS' },
            { icon: 'tabler:building-store', label: 'Gói doanh nghiệp' },
            { icon: 'tabler:clock', label: 'Phản hồi 7 ngày' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 rounded-xl border border-white/80 bg-white/70 px-4 py-3 shadow-sm">
              <Icon icon={item.icon} className="text-xl text-primary shrink-0" />
              <span className="text-sm font-semibold text-slate-700">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {privacyPolicySections.map((section) => (
        <LegalSection key={section.id} section={section}>
          {section.id === 'muc-7' ? (
            <ContactChannels variant="cards" title="Kênh liên hệ ValuCar" className="mt-2" />
          ) : null}
        </LegalSection>
      ))}

      <div className="rounded-3xl border border-slate-200 bg-midnight_text p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-white/50 text-center sm:text-start">
          Cần hỗ trợ?
        </p>
        <p className="mt-1 text-lg font-bold text-white text-center sm:text-start">
          Liên hệ đội ngũ ValuCar
        </p>
        <p className="mt-1 mb-6 text-sm text-white/60 text-center sm:text-start">
          Phản hồi khiếu nại trong 7 ngày làm việc.
        </p>
        <ContactChannels variant="compact" className="[&_a]:border-white/20 [&_a]:bg-white/10 [&_a]:text-white [&_a:hover]:bg-white/20 [&_a:hover]:text-white" />
      </div>
    </div>
  )
}
