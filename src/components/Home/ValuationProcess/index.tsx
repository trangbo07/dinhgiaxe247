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
    <section className='py-20 bg-gradient-to-b from-white to-gray-50'>
      <div className='container'>
        {/* Title */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl lg:text-5xl font-bold text-midnight_text mb-4'>
            Quy Trình Định Giá Xe
          </h2>
          <p className='text-lg text-black/60 max-w-3xl mx-auto mb-8'>
            ValuCar giúp bạn định giá xe ô tô một cách nhanh chóng, minh bạch và chính xác
            chỉ trong 4 bước đơn giản
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
              <div className='bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 h-full relative z-10'>
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
            href='/#valuation'
            className='inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-primary/90 transition-colors duration-300'>
            Bắt Đầu Định Giá
            <Icon icon='tabler:arrow-right' className='text-xl' />
          </a>
        </div>
      </div>
    </section>
  )
}

export default ValuationProcess
