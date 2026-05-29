'use client'

import { Icon } from '@iconify/react/dist/iconify.js'

const ValuationProcess = () => {
  const steps = [
    {
      number: '01',
      title: 'Nhập Thông Tin Xe',
      description: 'Cung cấp hãng, dòng xe, năm sản xuất, số km và tình trạng',
      icon: 'tabler:car',
    },
    {
      number: '02',
      title: 'AI Phân Tích',
      description: 'Hệ thống AI xử lý và so sánh với hàng ngàn giao dịch thực tế',
      icon: 'tabler:brain',
    },
    {
      number: '03',
      title: 'Định Giá Minh Bạch',
      description: 'Nhận khoảng giá tham chiếu với 3+ lý do chi tiết và rõ ràng',
      icon: 'tabler:list-check',
    },
    {
      number: '04',
      title: 'Đưa Ra Quyết Định',
      description: 'Sử dụng dữ liệu chính xác để mua, bán hoặc định giá xe tự tin',
      icon: 'tabler:hand-thumbs-up',
    },
  ]

  return (
    <section id="how-it-works" className="scroll-mt-24 bg-gradient-to-b from-white via-slate-50/50 to-white py-20 lg:py-28">
      <div className="container px-4">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Quy trình
          </span>
          <h2 className="mt-2 text-3xl font-black text-midnight_text sm:text-4xl lg:text-5xl">
            4 bước đến con số bạn tin được
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Không cần tài khoản để thử — chỉ cần thông tin xe và vài giây liên hệ khi xem kết quả.
          </p>
        </div>

        {/* Steps */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          {steps.map((step, index) => (
            <div key={index} className='relative'>
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className='hidden lg:block absolute top-24 left-[60%] w-[calc(100%-40px)] h-1 bg-gradient-to-r from-primary to-primary/30' />
              )}

              {/* Card */}
              <div className="relative z-10 h-full rounded-2xl bg-white p-8 shadow-md transition-all duration-300 hover:shadow-xl">
                {/* Step Number */}
                <div className='text-primary text-5xl font-bold opacity-20 mb-4'>
                  {step.number}
                </div>

                {/* Icon Circle */}
                <div className='mb-6'>
                  <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
                    <Icon
                      icon={step.icon}
                      className='text-3xl text-primary'
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className='text-xl font-bold text-midnight_text mb-3'>
                  {step.title}
                </h3>
                <p className='text-black/70 text-base leading-relaxed'>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className='text-center'>
          <p className='text-lg text-black/60 mb-6'>
            Sẵn sàng định giá xe của bạn ngay bây giờ?
          </p>
          <a
            href="/#valuation"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
            Bắt đầu định giá
            <Icon icon="tabler:arrow-right" className="text-xl" />
          </a>
        </div>
      </div>
    </section>
  )
}

export default ValuationProcess
