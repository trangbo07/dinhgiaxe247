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
    heading: 'Gói Free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    subscriber: 0,
    button: 'Bắt Đầu Miễn Phí',
    option: [
      'Không giới hạn lượt định giá',
      'Cung cấp khoảng giá tiêu chuẩn',
      'Kết quả sơ bộ',
    ],
    category: ['personal'],
    imgSrc: '/images/pricing/starone.svg',
  },
  {
    heading: 'Gói Basic',
    price: {
      monthly: 99000,
      yearly: 99000,
    },
    subscriber: 0.5,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Truy cập báo cáo chi tiết',
      'Phân tích tình trạng xe',
      'Phân tích thị trường',
    ],
    category: ['personal'],
    imgSrc: '/images/pricing/startwo.svg',
  },
  {
    heading: 'Gói Pro',
    price: {
      monthly: 149000,
      yearly: 149000,
    },
    subscriber: 1,
    button: 'Mua Ngay',
    option: [
      'Không giới hạn lượt định giá',
      'Phân tích chuyên sâu',
      'Check phạt nguội',
      'Tư vấn 1:1 24/7',
      'Truy cập toàn bộ nội dung cao cấp',
    ],
    category: ['personal'],
    imgSrc: '/images/pricing/starthree.svg',
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
      'Phân tích chuyên sâu',
      'Check phạt nguội',
      'Tư vấn 1:1 24/7',
      'Truy cập toàn bộ nội dung cao cấp',
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
      'Phân tích chuyên sâu',
      'Check phạt nguội',
      'Tư vấn 1:1 24/7',
      'Truy cập toàn bộ nội dung cao cấp',
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
      'Phân tích chuyên sâu',
      'Check phạt nguội',
      'Tư vấn 1:1 24/7',
      'Truy cập toàn bộ nội dung cao cấp',
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
