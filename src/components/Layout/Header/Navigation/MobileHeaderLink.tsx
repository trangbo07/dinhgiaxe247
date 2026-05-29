'use client'

import { useState } from 'react'
import Link from 'next/link'
import { headerItem } from '@/types/menu'

const MobileHeaderLink: React.FC<{
  item: headerItem
  onNavigate?: () => void
}> = ({ item, onNavigate }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false)

  const handleToggle = (e: React.MouseEvent) => {
    if (item.submenu) {
      e.preventDefault()
      setSubmenuOpen(!submenuOpen)
    } else {
      onNavigate?.()
    }
  }

  return (
    <div className="relative w-full">
      <Link
        href={item.href}
        onClick={handleToggle}
        className="flex w-full items-center justify-between py-3 text-base font-semibold text-midnight_text hover:text-primary">
        {item.label}
        {item.submenu && (
          <svg xmlns="http://www.w3.org/2000/svg" width="1.25em" height="1.25em" viewBox="0 0 24 24">
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
        <div className="mb-2 rounded-lg bg-slate-50 p-2">
          {item.submenu.map((subItem, index) => (
            <Link
              key={index}
              href={subItem.href}
              onClick={() => onNavigate?.()}
              className="block rounded-md py-2 px-3 text-sm text-slate-600 hover:bg-white hover:text-primary">
              {subItem.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MobileHeaderLink
