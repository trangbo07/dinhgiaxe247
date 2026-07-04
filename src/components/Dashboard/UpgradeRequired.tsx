'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import { BUSINESS_PLAN_INFO, PLAN_CODES } from '@/lib/payment-bills'

type UpgradeRequiredProps = {
  icon?: string
  title?: string
  description: string
}

export default function UpgradeRequired({
  icon = 'tabler:lock',
  title = 'Tính năng dành cho gói Doanh nghiệp',
  description,
}: UpgradeRequiredProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8 text-center">
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Icon icon={icon} className="text-3xl text-primary" />
      </div>
      <h3 className="text-lg font-black text-midnight_text">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{description}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {PLAN_CODES.map((code) => {
          const info = BUSINESS_PLAN_INFO[code]
          return (
            <span
              key={code}
              className="rounded-full border border-primary/20 bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-sm">
              {info.label}: {info.price.toLocaleString('vi-VN')}đ
            </span>
          )
        })}
      </div>

      <Link
        href="/dashboard/plans"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:opacity-90 hover:scale-[1.02]">
        <Icon icon="tabler:crown" />
        Xem & mua gói Doanh nghiệp
      </Link>
    </div>
  )
}
