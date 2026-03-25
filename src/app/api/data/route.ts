import { NextResponse } from 'next/server'

import { headerItem } from '@/types/menu'
import { featureData } from '@/types/featuredata'
import { socialLinksData } from '@/types/sociallinks'
import { plansData } from '@/types/plans'
import { footerlLinksData } from '@/types/footerlinks'

const HeaderData: headerItem[] = [
  { label: 'Sản Phẩm', href: '/#product' },
  { label: 'Giá', href: '/#pricing' },
  { label: 'Tính Năng', href: '/#features ' },
  { label: 'Liên Hệ', href: '/#contact ' },
  { label: 'Tài Liệu', href: '/documentation' },
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
    heading: 'Cá Nhân',
    price: {
      monthly: 0,
      yearly: 0,
    },
    subscriber: 0,
    button: 'Đang dùng miễn phí',
    option: [
      '3 lượt định giá / tháng',
      'Định giá theo dữ liệu thị trường mới',
      'Chat AI hỗ trợ cơ bản',
    ],
    category: ['personal'],
    imgSrc: '/images/pricing/starone.svg',
  },
  {
    heading: 'Gói Tháng',
    price: {
      monthly: 129000,
      yearly: 129000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo định giá chuyên sâu cho từng xe',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Gói Quý',
    price: {
      monthly: 350000,
      yearly: 350000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo định giá chuyên sâu cho từng xe',
    ],
    category: ['business'],
    imgSrc: '/images/pricing/starthree.svg',
  },
  {
    heading: 'Gói Năm',
    price: {
      monthly: 1499000,
      yearly: 1499000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Không giới hạn thời gian chat AI (giải đáp, tips định giá)',
      'Lưu lại lịch sử các xe đã định giá',
      'Gợi ý giá thu mua hợp lý theo thị trường',
      'Báo cáo định giá chuyên sâu cho từng xe',
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
    link: 'www.facebook.com',
    width: 10,
  },
  {
    imgSrc: 'fa6-brands:instagram',
    link: 'www.instagram.com',
    width: 14,
  },
  {
    imgSrc: 'fa6-brands:twitter',
    link: 'www.twitter.com',
    width: 14,
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
