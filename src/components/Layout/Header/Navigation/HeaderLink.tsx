'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { headerItem } from '@/types/menu'

function normalizeHash(href: string) {
  const i = href.indexOf('#')
  return i >= 0 ? href.slice(i) : ''
}

function isNavActive(pathname: string, hash: string, href: string) {
  const linkHash = normalizeHash(href)
  if (linkHash) {
    return pathname === '/' && hash === linkHash
  }
  return pathname === href
}

const HeaderLink: React.FC<{ item: headerItem }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false)
  const pathname = usePathname()
  const [hash, setHash] = useState('')

  useEffect(() => {
    const sync = () => setHash(window.location.hash)
    sync()
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const active = isNavActive(pathname, hash, item.href)

  return (
    <div
      className="relative"
      onMouseEnter={() => item.submenu && setSubmenuOpen(true)}
      onMouseLeave={() => setSubmenuOpen(false)}>
      <Link
        href={item.href}
        className={`text-sm xl:text-[15px] font-semibold capitalize transition-colors hover:text-primary whitespace-nowrap ${
          active ? 'text-primary' : 'text-midnight_text/85'
        }`}>
        {item.label}
        {item.submenu && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.5em"
            height="1.5em"
            viewBox="0 0 24 24"
            className="inline-block ml-0.5">
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="m7 10l5 5l5-5"
            />
          </svg>
        )}
      </Link>
      {submenuOpen && item.submenu && (
        <div className="absolute left-0 mt-1 w-56 rounded-xl bg-white py-2 shadow-xl">
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              className={`block px-4 py-2 text-sm font-medium ${
                isNavActive(pathname, hash, subItem.href)
                  ? 'bg-primary text-white'
                  : 'text-midnight_text hover:bg-slate-50'
              }`}>
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default HeaderLink
