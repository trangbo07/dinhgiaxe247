'use client'

import { Icon } from '@iconify/react/dist/iconify.js'

type Point = { label: string; count: number }

function maxCount(series: Point[][]) {
  const all = series.flat().map((p) => p.count)
  return Math.max(1, ...all)
}

export function GrowthBarChart({
  title,
  subtitle,
  series,
  colors,
  legends,
  height = 200,
}: {
  title: string
  subtitle?: string
  series: Point[][]
  colors: string[]
  legends: string[]
  height?: number
}) {
  const labels = series[0]?.map((p) => p.label) ?? []
  const max = maxCount(series)
  const barGroupW = Math.min(28, 320 / Math.max(labels.length, 1))
  const chartW = labels.length * (barGroupW + 8)
  const chartH = height - 48

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-black text-midnight_text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs font-semibold">
        {legends.map((leg, i) => (
          <span key={leg} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: colors[i] }} />
            {leg}
          </span>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg width={Math.max(chartW, 280)} height={height} className="mx-auto">
          {labels.map((label, i) => {
            const x = i * (barGroupW + 8) + 4
            return (
              <g key={label}>
                {series.map((s, si) => {
                  const count = s[i]?.count ?? 0
                  const barH = (count / max) * chartH
                  const barW = barGroupW / series.length - 2
                  const bx = x + si * (barW + 2)
                  return (
                    <g key={si}>
                      <rect
                        x={bx}
                        y={chartH - barH + 8}
                        width={barW}
                        height={barH}
                        rx={3}
                        fill={colors[si]}
                        opacity={0.9}
                      />
                      {count > 0 && (
                        <text
                          x={bx + barW / 2}
                          y={chartH - barH + 4}
                          textAnchor="middle"
                          className="fill-slate-600 text-[9px] font-bold"
                        >
                          {count}
                        </text>
                      )}
                    </g>
                  )
                })}
                <text
                  x={x + barGroupW / 2}
                  y={height - 4}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px]"
                >
                  {label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

export function TrendLineChart({
  title,
  data,
  color = '#2563eb',
  height = 160,
}: {
  title: string
  data: { label: string; value: number }[]
  color?: string
  height?: number
}) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const w = Math.max(280, data.length * 36)
  const pad = 24
  const innerH = height - pad * 2
  const step = data.length > 1 ? (w - pad * 2) / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = pad + i * step
    const y = pad + innerH - (d.value / max) * innerH
    return { x, y, ...d }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-black text-midnight_text">{title}</h3>
      <div className="overflow-x-auto">
        <svg width={w} height={height} className="mx-auto">
          <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          {points.map((p) => (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r={4} fill={color} />
              {p.value > 0 && (
                <text x={p.x} y={p.y - 8} textAnchor="middle" className="fill-slate-600 text-[9px] font-bold">
                  {p.value}
                </text>
              )}
              <text x={p.x} y={height - 6} textAnchor="middle" className="fill-slate-400 text-[9px]">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}

export function DonutStat({
  title,
  segments,
}: {
  title: string
  segments: { label: string; value: number; color: string }[]
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  let offset = 0
  const r = 52
  const cx = 70
  const cy = 70
  const circumference = 2 * Math.PI * r

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-black text-midnight_text">{title}</h3>
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <svg width={140} height={140} className="shrink-0">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={14} />
          {segments.map((seg) => {
            const len = (seg.value / total) * circumference
            const dash = `${len} ${circumference - len}`
            const el = (
              <circle
                key={seg.label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={14}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            )
            offset += len
            return el
          })}
          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" className="fill-slate-800 text-sm font-black">
            {total}
          </text>
        </svg>
        <ul className="flex-1 space-y-2 text-sm">
          {segments.map((seg) => (
            <li key={seg.label} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: seg.color }} />
                {seg.label}
              </span>
              <span className="font-bold text-midnight_text">
                {seg.value}{' '}
                <span className="text-xs font-normal text-slate-400">
                  ({Math.round((seg.value / total) * 100)}%)
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function StatCard({
  label,
  value,
  sub,
  growth,
  icon,
  accent = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  growth?: number | null
  icon: string
  accent?: 'blue' | 'violet' | 'emerald' | 'amber'
}) {
  const colors = {
    blue: 'from-blue-500 to-primary bg-blue-50 text-blue-700',
    violet: 'from-violet-500 to-purple-600 bg-violet-50 text-violet-700',
    emerald: 'from-emerald-500 to-teal-600 bg-emerald-50 text-emerald-700',
    amber: 'from-amber-500 to-orange-500 bg-amber-50 text-amber-800',
  }[accent]

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-black text-midnight_text">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
        </div>
        <span className={`rounded-xl bg-gradient-to-br p-2.5 text-white ${colors.split(' ').slice(0, 2).join(' ')}`}>
          <Icon icon={icon} className="h-5 w-5" />
        </span>
      </div>
      {growth != null && (
        <p
          className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
            growth >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth)}% vs tháng trước
        </p>
      )}
    </div>
  )
}
