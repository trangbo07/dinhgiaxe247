import { Icon } from '@iconify/react/dist/iconify.js'
import type { ReactNode } from 'react'

export type LegalSubsection = {
  title: string
  paragraphs?: string[]
  bullets?: string[]
  highlight?: string
}

export type LegalSectionData = {
  id: string
  number: string
  title: string
  icon: string
  intro?: string
  subsections?: LegalSubsection[]
  bullets?: string[]
  paragraphs?: string[]
  callout?: { variant: 'info' | 'shield' | 'alert'; title: string; body: string }
  footer?: string
}

type LegalSectionProps = {
  section: LegalSectionData
  children?: ReactNode
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-slate-600">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
          <span dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ul>
  )
}

function Callout({
  variant,
  title,
  body,
}: {
  variant: 'info' | 'shield' | 'alert'
  title: string
  body: string
}) {
  const styles = {
    info: {
      wrap: 'border-blue-100 bg-gradient-to-br from-blue-50/80 to-slate-50',
      icon: 'tabler:info-circle',
      iconBg: 'bg-blue-100 text-blue-600',
      title: 'text-blue-900',
    },
    shield: {
      wrap: 'border-blue-100 bg-gradient-to-br from-blue-50/80 to-slate-50',
      icon: 'tabler:shield-check',
      iconBg: 'bg-blue-100 text-blue-600',
      title: 'text-blue-900',
    },
    alert: {
      wrap: 'border-amber-100 bg-gradient-to-br from-amber-50/80 to-slate-50',
      icon: 'tabler:alert-triangle',
      iconBg: 'bg-amber-100 text-amber-600',
      title: 'text-amber-900',
    },
  }[variant]

  return (
    <div className={`mt-6 flex gap-4 rounded-2xl border p-5 ${styles.wrap}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}>
        <Icon icon={styles.icon} className="text-xl" />
      </div>
      <div>
        <p className={`font-bold text-sm ${styles.title}`}>{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{body}</p>
      </div>
    </div>
  )
}

export default function LegalSection({ section, children }: LegalSectionProps) {
  return (
    <section
      id={section.id}
      className="scroll-mt-28 rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-start gap-4 border-b border-slate-100 pb-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg shadow-primary/25">
          <Icon icon={section.icon} className="text-2xl" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-bold uppercase tracking-widest text-primary/80">
            Mục {section.number}
          </span>
          <h2 className="mt-1 text-xl font-black text-midnight_text sm:text-2xl">{section.title}</h2>
        </div>
      </div>

      <div className="pt-6">
        {section.intro ? (
          <p className="text-[15px] leading-relaxed text-slate-600">{section.intro}</p>
        ) : null}

        {section.subsections?.map((sub) => (
          <div key={sub.title} className="mt-8">
            <h3 className="flex items-center gap-2 text-base font-bold text-midnight_text">
              <Icon icon="tabler:chevron-right" className="text-primary text-lg" />
              {sub.title}
            </h3>
            {sub.paragraphs?.map((p, i) => (
              <p
                key={i}
                className="mt-3 text-[15px] leading-relaxed text-slate-600"
                dangerouslySetInnerHTML={{ __html: p }}
              />
            ))}
            {sub.bullets ? <BulletList items={sub.bullets} /> : null}
            {sub.highlight ? (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 border border-slate-100">
                {sub.highlight}
              </p>
            ) : null}
          </div>
        ))}

        {section.paragraphs?.map((p, i) => (
          <p
            key={i}
            className={`text-[15px] leading-relaxed text-slate-600 ${i === 0 && !section.intro ? '' : 'mt-4'}`}
            dangerouslySetInnerHTML={{ __html: p }}
          />
        ))}

        {section.bullets ? <BulletList items={section.bullets} /> : null}
        {section.callout ? <Callout {...section.callout} /> : null}
        {children}
        {section.footer ? (
          <p className="mt-6 text-[15px] leading-relaxed text-slate-600 border-t border-slate-100 pt-6">
            {section.footer}
          </p>
        ) : null}
      </div>
    </section>
  )
}
