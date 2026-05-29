'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { useSession } from 'next-auth/react'

type ValuationRow = {
  id: string
  brand: string
  model: string
  year: number | null
  price: number | null
  price_low: number | null
  price_high: number | null
  created_at: string
}

export default function DashboardOverview() {
  const { data: session } = useSession()
  const [items, setItems] = useState<ValuationRow[]>([])
  const [guestLeads, setGuestLeads] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/valuations').then((r) => r.json()),
      fetch('/api/guest-leads').then((r) => r.json()),
    ])
      .then(([valuations, leads]) => {
        setItems(valuations.items ?? [])
        setGuestLeads((leads.items ?? []).length)
      })
      .catch(() => {
        setItems([])
        setGuestLeads(0)
      })
      .finally(() => setLoading(false))
  }, [])

  const thisMonth = items.filter((i) => {
    const d = new Date(i.created_at)
    const n = new Date()
    return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear()
  })

  const features = [
    {
      icon: 'tabler:infinity',
      title: 'Định giá không giới hạn',
      desc: 'Không còn giới hạn 3 lượt/tháng khi đã vào dashboard.',
      color: 'from-blue-500 to-primary',
    },
    {
      icon: 'tabler:message-chatbot',
      title: 'Chat AI không giới hạn',
      desc: 'Hỏi tình trạng xe, tips định giá, đàm phán 24/7.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: 'tabler:users',
      title: 'Lead khách website',
      desc: 'Khách định giá trên trang chủ — đầy đủ SĐT, mua/bán, xe và giá để sales gọi.',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: 'tabler:report-analytics',
      title: 'Báo cáo chuyên sâu',
      desc: 'Rủi ro, thanh khoản, gợi ý giá bán nhanh / giữ giá.',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: 'tabler:photo-scan',
      title: 'Định giá 6 ảnh',
      desc: 'Workflow chuẩn showroom: đuôi, km, góc, nội thất, xước.',
      color: 'from-rose-500 to-pink-600',
    },
    {
      icon: 'tabler:chart-line',
      title: 'Tham chiếu thị trường',
      desc: 'Crawl Chợ Tốt & Bonbanh + AI Gemini có kiểm soát.',
      color: 'from-cyan-500 to-blue-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-600 p-6 lg:p-8 text-white shadow-xl">
        <p className="text-blue-100 text-sm font-medium">Xin chào</p>
        <h2 className="text-2xl lg:text-3xl font-black mt-1">
          {session?.user?.name ?? 'Doanh nghiệp'}
        </h2>
        <p className="mt-2 text-blue-50/90 max-w-2xl text-sm lg:text-base">
          Đây là không gian làm việc của bạn — không còn giao diện landing. Bắt đầu
          định giá hoặc xem lịch sử đã lưu bên dưới.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/dashboard/valuation"
            className="inline-flex items-center gap-2 bg-white text-primary px-5 py-3 rounded-xl font-bold text-sm hover:scale-[1.02] transition-transform">
            <Icon icon="tabler:car" className="text-xl" />
            Định giá ngay
          </Link>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-2 bg-white/15 border border-white/30 px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/25 transition-colors">
            <Icon icon="tabler:users" className="text-xl" />
            Khách website ({guestLeads})
          </Link>
          <Link
            href="/dashboard/history"
            className="inline-flex items-center gap-2 bg-white/15 border border-white/30 px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/25 transition-colors">
            <Icon icon="tabler:history" className="text-xl" />
            Lịch sử DN ({items.length})
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lead khách', value: guestLeads, icon: 'tabler:users' },
          { label: 'Định giá DN', value: items.length, icon: 'tabler:database' },
          { label: 'Tháng này', value: thisMonth.length, icon: 'tabler:calendar' },
          { label: 'Định giá', value: '∞', icon: 'tabler:infinity' },
          { label: 'Chat AI', value: '∞', icon: 'tabler:robot' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <Icon icon={s.icon} className="text-2xl text-primary mb-2" />
            <p className="text-2xl font-black text-midnight_text">{s.value}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-bold text-midnight_text mb-4">
          Tính năng trong tài khoản của bạn
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md transition-shadow">
              <div
                className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-3`}>
                <Icon icon={f.icon} className="text-2xl" />
              </div>
              <h4 className="font-bold text-midnight_text">{f.title}</h4>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-midnight_text">Định giá gần đây (đã lưu)</h3>
          <Link href="/dashboard/history" className="text-sm text-primary font-semibold">
            Xem tất cả
          </Link>
        </div>
        {loading ? (
          <p className="text-slate-500 text-sm">Đang tải...</p>
        ) : items.length === 0 ? (
          <p className="text-slate-500 text-sm">
            Chưa có bản ghi. Hãy{' '}
            <Link href="/dashboard/valuation" className="text-primary font-semibold">
              định giá xe
            </Link>{' '}
            — lưu lại mọi lượt định giá của bạn 
          </p>
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 5).map((v) => (
              <li
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-semibold text-midnight_text">
                    {v.brand} {v.model} {v.year ? `· ${v.year}` : ''}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(v.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
                <p className="font-bold text-primary text-sm">
                  {v.price_low != null && v.price_high != null
                    ? `${v.price_low.toLocaleString('vi-VN')} – ${v.price_high.toLocaleString('vi-VN')} đ`
                    : v.price != null
                      ? `${v.price.toLocaleString('vi-VN')} đ`
                      : '—'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
