import { Icon } from '@iconify/react/dist/iconify.js'

const items = [
  {
    icon: 'tabler:shield-check',
    title: 'Minh bạch',
    desc: 'Mỗi kết quả kèm lý do và nguồn tham chiếu',
  },
  {
    icon: 'tabler:clock-bolt',
    title: 'Nhanh',
    desc: 'Vài phút thay vì tra thủ công hàng giờ',
  },
  {
    icon: 'tabler:users',
    title: 'Cho showroom',
    desc: 'Dashboard, lead khách & lịch sử cloud',
  },
  {
    icon: 'tabler:lock',
    title: 'An toàn',
    desc: 'Rate limit API, bảo vệ chi phí AI',
  },
]

export default function LandingTrustBand() {
  return (
    <section className="relative bg-white py-10">
      <div className="container">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {items.map((item) => (
            <div
              key={item.title}
              className="group flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left lg:flex-col lg:items-center lg:text-center">
              <div className="mb-3 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white sm:mb-0 sm:mr-4 lg:mb-3 lg:mr-0">
                <Icon icon={item.icon} className="text-2xl" />
              </div>
              <div>
                <p className="font-bold text-midnight_text">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
