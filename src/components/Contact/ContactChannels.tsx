import { Icon } from '@iconify/react/dist/iconify.js'
import { VALUCAR_CONTACT_CHANNELS } from '@/lib/valucar-contact'

type ContactChannelsVariant = 'hero' | 'cards' | 'footer' | 'compact'

type ContactChannelsProps = {
  variant?: ContactChannelsVariant
  title?: string
  className?: string
}

export default function ContactChannels({
  variant = 'cards',
  title,
  className = '',
}: ContactChannelsProps) {
  if (variant === 'hero') {
    return (
      <div
        className={`mt-10 rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur-md sm:p-5 ${className}`}>
        {title ? (
          <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500 lg:text-start">
            {title}
          </p>
        ) : null}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {VALUCAR_CONTACT_CHANNELS.map((ch) => (
            <ChannelLink key={ch.id} channel={ch} className="hero-pill" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div className={`space-y-3 ${className}`}>
        {title ? (
          <p className="text-sm font-bold uppercase tracking-wider text-white/50">{title}</p>
        ) : null}
        <ul className="space-y-2.5">
          {VALUCAR_CONTACT_CHANNELS.map((ch) => (
            <li key={ch.id}>
              <ChannelLink channel={ch} className="footer-link" />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-3 sm:gap-4 ${className}`}>
        {VALUCAR_CONTACT_CHANNELS.map((ch) => (
          <ChannelLink key={ch.id} channel={ch} className="compact" />
        ))}
      </div>
    )
  }

  // cards — privacy, contact section
  return (
    <div className={className}>
      {title ? (
        <p className="mb-4 text-sm font-bold text-slate-500 text-center sm:text-start">{title}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {VALUCAR_CONTACT_CHANNELS.map((ch) => (
          <ChannelLink key={ch.id} channel={ch} className="card" />
        ))}
      </div>
    </div>
  )
}

type Channel = (typeof VALUCAR_CONTACT_CHANNELS)[number]

function ChannelLink({
  channel,
  className,
}: {
  channel: Channel
  className: string
}) {
  const isExternal = 'external' in channel && channel.external
  const base =
    className === 'hero-pill'
      ? 'group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-primary/30 hover:shadow-md'
      : className === 'footer-link'
        ? 'group inline-flex items-center gap-3 text-white/75 transition hover:text-white'
        : className === 'compact'
          ? 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/40 hover:text-primary'
          : 'group flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition hover:border-primary/30 hover:bg-primary/5 hover:shadow-md'

  const iconWrap =
    className === 'hero-pill'
      ? 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition'
      : className === 'footer-link'
        ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white group-hover:bg-white/20'
        : className === 'compact'
          ? 'text-lg text-primary'
          : 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/30 transition group-hover:scale-105'

  const content = (
    <>
      <div className={iconWrap}>
        <Icon icon={channel.icon} className={className === 'compact' ? 'text-lg' : 'text-xl'} />
      </div>
      <div className="min-w-0">
        {className !== 'compact' && className !== 'footer-link' ? (
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{channel.label}</p>
        ) : null}
        <p
          className={
            className === 'footer-link'
              ? 'text-sm font-medium truncate'
              : className === 'compact'
                ? 'truncate max-w-[140px] sm:max-w-none'
                : 'mt-0.5 font-bold text-midnight_text group-hover:text-primary truncate'
          }>
          {channel.id === 'facebook' && className === 'compact' ? 'Facebook' : channel.value}
        </p>
      </div>
      {className === 'card' || className === 'hero-pill' ? (
        <Icon
          icon="tabler:external-link"
          className={`ml-auto shrink-0 text-slate-300 opacity-0 transition group-hover:opacity-100 ${channel.id === 'phone' || channel.id === 'email' ? 'hidden' : ''}`}
        />
      ) : null}
    </>
  )

  return (
    <a
      href={channel.href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={base}>
      {content}
    </a>
  )
}
