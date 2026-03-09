import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'

const Payment = () => {
  return (
    <section className='py-10'>
      <div className='container'>
        <div className='grid grid-cols-1 lg:grid-cols-12 space-x-1 content-center justify-items-center'>
          <div className='col-span-6'>
            <Image
              src='/images/payment/payment.png'
              alt='payment'
              width={600}
              height={500}
            />
          </div>
          <div className='col-span-6 flex flex-col gap-5 justify-center'>
            <h2 className='text-midnight_text text-center lg:text-start sm:leading-14 leading-12'>
              Bây giờ là lúc thay đổi cách bạn định giá xe.
            </h2>
            <p className='text-black/75 text-lg font-normal text-center lg:text-start sm:leading-140 max-w-2xl lg:max-w-lg mx-auto lg:mx-0'>
              Quản lý định giá xe minh bạch và chính xác. ValuCar giúp bạn theo dõi giá trị xe theo khu vực,
              lập kế hoạch bán hàng hiệu quả, và luôn dẫn trước thị trường — không bỏ lỡ cơ hội.
            </p>
            <Link
              href={'/'}
              className='text-primary hover:text-blue-700 text-lg font-medium flex items-center gap-2 mx-auto lg:mx-0'>
              Tìm hiểu thêm
              <Icon icon='tabler:arrow-right' className='text-2xl' />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Payment
