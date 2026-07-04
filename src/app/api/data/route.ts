import { NextResponse } from 'next/server'

import { headerItem } from '@/types/menu'
import { featureData } from '@/types/featuredata'
import { socialLinksData } from '@/types/sociallinks'
import { plansData } from '@/types/plans'
import { footerlLinksData } from '@/types/footerlinks'

const HeaderData: headerItem[] = [
  { label: 'Định giá', href: '/#valuation' },
  { label: 'So sánh xe', href: '/compare' },
  { label: 'Checklist', href: '/checklist' },
  { label: 'Quy trình', href: '/#how-it-works' },
  { label: 'Tính năng', href: '/#features' },
  { label: 'Bảng giá', href: '/#pricing' },
  { label: 'Liên hệ', href: '/#contact' },
]

const FeatureData: featureData[] = [
  {
    imgSrc: '/images/features/time.svg',
    heading: 'Định Giá Xe Nhanh Chóng',
    paragraph:
      'Đánh giá giá trị xe của bạn ngay lập tức. Nhận thông tin chính xác về giá trị thị trường. Luôn nắm bắt giá trị xe một cách dễ dàng.',
  },
  {
    imgSrc: '/images/features/signal.svg',
    heading: 'So Sánh Thị Trường',
    paragraph:
      'Xem giá xe theo khu vực và loại. Phân tích xu hướng thị trường. Đưa ra quyết định mua bán thông minh với thông tin rõ ràng.',
  },
  {
    imgSrc: '/images/features/dollar.svg',
    heading: 'Quản Lý Danh Mục Xe',
    paragraph:
      'Liên kết tất cả xe của bạn. Theo dõi giá trị và hoạt động. Quản lý mọi thứ trong một bảng điều khiển.',
  },
]

const PlansData: plansData[] = [
  {
    heading: 'Gói Tháng',
    planCode: 'monthly',
    price: {
      monthly: 199000,
      yearly: 199000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      '4 lượt định giá miễn phí/tháng, không giới hạn khi mua gói',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo tổng hợp & xuất PDF chi tiết',
      'Biểu đồ tăng trưởng lead & định giá',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Gói Quý',
    planCode: 'quarterly',
    price: {
      monthly: 539000,
      yearly: 539000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo tổng hợp & xuất PDF chi tiết',
      'Biểu đồ tăng trưởng lead & định giá',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Gói Năm',
    planCode: 'yearly',
    price: {
      monthly: 1399000,
      yearly: 1399000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo tổng hợp & xuất PDF chi tiết',
      'Biểu đồ tăng trưởng lead & định giá',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
]

const FooterLinks: footerlLinksData[] = [
  { label: 'Sản Phẩm', href: '/#product' },
  { label: 'Giá', href: '/#pricing' },
  { label: 'Tính Năng', href: '/#features ' },
  { label: 'Liên Hệ', href: '/#contact ' },
]

const SocialLinks: socialLinksData[] = [
  {
    imgSrc: 'fa-brands:facebook-f',
    link: 'https://www.facebook.com/profile.php?id=61590451947338',
    width: 10,
  },
]

export const GET = () => {
  return NextResponse.json({
    HeaderData,
    FeatureData,
    PlansData,
    FooterLinks,
    SocialLinks,
  })
}
