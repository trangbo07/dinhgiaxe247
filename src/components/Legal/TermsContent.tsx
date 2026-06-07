import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import ContactChannels from '@/components/Contact/ContactChannels'
import LegalSection from './LegalSection'
import { termsSections, termsToc } from './terms-sections'

export { termsToc }

export default function TermsContent() {
  return (
    <div className="space-y-6">
      <section
        id="tong-quan"
        className="scroll-mt-28 rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-white to-blue-50/50 p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon icon="tabler:file-certificate" className="text-2xl" />
          </div>
          <div>
            <h2 className="text-lg font-black text-midnight_text">Tổng quan</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Điều khoản này quy định quyền và nghĩa vụ khi bạn truy cập website, tra cứu định giá
              xe hoặc sử dụng tài khoản <strong className="text-midnight_text">ValuCar</strong>.
            </p>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
              Khi bấm định giá, đăng ký tài khoản hoặc tiếp tục dùng dịch vụ, bạn đồng ý với các
              điều khoản dưới đây và với{' '}
              <Link href="/chinh-sach-bao-mat" className="font-semibold text-primary hover:underline">
                Chính sách Bảo mật
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: 'tabler:chart-line', label: 'Giá tham chiếu' },
            { icon: 'tabler:building-store', label: 'Gói doanh nghiệp' },
            { icon: 'tabler:gavel', label: 'Luật Việt Nam' },
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

      {termsSections.map((section) => (
        <LegalSection key={section.id} section={section}>
          {section.id === 'muc-4' ? (
            <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
              <Link href="/chinh-sach-bao-mat" className="font-semibold text-primary hover:underline">
                Xem Chính sách Bảo mật →
              </Link>
            </p>
          ) : null}
          {section.id === 'muc-9' ? (
            <ContactChannels variant="cards" title="Kênh liên hệ" className="mt-2" />
          ) : null}
        </LegalSection>
      ))}

      <div className="rounded-3xl border border-slate-200 bg-midnight_text p-6 sm:p-8">
        <p className="text-lg font-bold text-white text-center sm:text-start">
          Cần giải thích thêm?
        </p>
        <p className="mt-1 mb-6 text-sm text-white/60 text-center sm:text-start">
          Gọi, email hoặc nhắn Facebook — đội ngũ ValuCar sẵn sàng hỗ trợ.
        </p>
        <ContactChannels variant="compact" className="[&_a]:border-white/20 [&_a]:bg-white/10 [&_a]:text-white [&_a:hover]:bg-white/20 [&_a:hover]:text-white" />
      </div>
    </div>
  )
}
