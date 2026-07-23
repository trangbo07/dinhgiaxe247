'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import Logo from './Logo'
import HeaderLink from './Navigation/HeaderLink'
import MobileHeaderLink from './Navigation/MobileHeaderLink'
import Signin from '@/components/Auth/SignIn'
import SignUp from '@/components/Auth/SignUp'
import { Icon } from '@iconify/react/dist/iconify.js'
import { headerItem } from '@/types/menu'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/app/Providers'

const Header: React.FC = () => {
  const { data: session } = useSession()
  const { worldcupEnabled } = useTheme()
  const [headerData, setHeaderData] = useState<headerItem[]>([])

  const [navbarOpen, setNavbarOpen] = useState(false)
  const [sticky, setSticky] = useState(false)
  const [isSignInOpen, setIsSignInOpen] = useState(false)
  const [isSignUpOpen, setIsSignUpOpen] = useState(false)

  const signInRef = useRef<HTMLDivElement>(null)
  const signUpRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/data')
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setHeaderData(data.HeaderData)
      } catch (error) {
        console.error('Error fetching services:', error)
      }
    }
    fetchData()
  }, [])

  const openSignInModal = () => {
    setIsSignUpOpen(false)
    setIsSignInOpen(true)
    setNavbarOpen(false)
  }

  const openSignUpModal = () => {
    setIsSignInOpen(false)
    setIsSignUpOpen(true)
    setNavbarOpen(false)
  }

  const closeAuthModals = () => {
    setIsSignInOpen(false)
    setIsSignUpOpen(false)
  }

  useEffect(() => {
    const w = window as Window & {
      openSignInModal?: () => void
      openSignUpModal?: () => void
    }
    w.openSignInModal = () => {
      setIsSignUpOpen(false)
      setIsSignInOpen(true)
      setNavbarOpen(false)
    }
    w.openSignUpModal = () => {
      setIsSignInOpen(false)
      setIsSignUpOpen(true)
      setNavbarOpen(false)
    }
    return () => {
      delete w.openSignInModal
      delete w.openSignUpModal
    }
  }, [])

  const handleScroll = () => {
    setSticky(window.scrollY >= 80)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (signInRef.current && !signInRef.current.contains(event.target as Node)) {
        setIsSignInOpen(false)
      }
      if (signUpRef.current && !signUpRef.current.contains(event.target as Node)) {
        setIsSignUpOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && navbarOpen) {
        setNavbarOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [navbarOpen, isSignInOpen, isSignUpOpen])

  useEffect(() => {
    if (isSignInOpen || isSignUpOpen || navbarOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
    } else {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.style.overflow = 'auto'
      document.body.classList.remove('modal-open')
    }
  }, [isSignInOpen, isSignUpOpen, navbarOpen])

  return (
    <>
    <header
      className={`site-header w-full transition-all duration-300 ${
        navbarOpen ? 'max-lg:hidden' : ''
      } ${
        sticky
          ? 'bg-white/95 py-3 shadow-[0_8px_30px_-12px_rgba(0,27,80,0.15)] backdrop-blur-md'
          : 'bg-header/80 py-3 backdrop-blur-sm'
      } ${worldcupEnabled ? 'site-header--wc' : ''}`}>
      <div>
        <div className='container flex items-center justify-between'>
          <div>
            <Logo />
          </div>
          <nav className='hidden lg:flex grow items-center gap-4 xl:gap-8 justify-start md:ml-8 xl:ml-20 mr-6 xl:mr-10'>
            {headerData.map((item, index) => (
              <HeaderLink key={index} item={item} />
            ))}
          </nav>
          <div className='flex items-center gap-4'>
            {session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="hidden lg:inline-flex items-center gap-2 bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2.5 rounded-full font-semibold text-sm shadow-md hover:shadow-lg transition-all">
                  <Icon icon="tabler:layout-dashboard" className="text-lg" />
                  Vào Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-slate-100 text-slate-700 px-4 py-2.5 rounded-full font-semibold text-sm hover:bg-slate-200 transition-all">
                  Đăng xuất
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className='hidden lg:block bg-white text-primary hover:bg-gray-50 px-4 xl:px-6 py-2.5 rounded-full font-semibold text-sm xl:text-base whitespace-nowrap transition-all shadow-sm'
                  onClick={openSignInModal}>
                  Đăng Nhập
                </button>
                <button
                  type="button"
                  className='hidden lg:block bg-gradient-to-r from-primary to-blue-600 text-white hover:opacity-90 px-4 xl:px-6 py-2.5 rounded-full font-semibold text-sm xl:text-base whitespace-nowrap shadow-lg shadow-primary/30 transition-all'
                  onClick={() => openSignUpModal()}>
                  Đăng Ký DN
                </button>
              </>
            )}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='relative z-[61] block rounded-lg p-2 lg:hidden'
              aria-label={navbarOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={navbarOpen}>
              {navbarOpen ? (
                <Icon icon="tabler:x" className="text-2xl text-midnight_text" />
              ) : (
                <>
                  <span className='block h-0.5 w-6 bg-black' />
                  <span className='mt-1.5 block h-0.5 w-6 bg-black' />
                  <span className='mt-1.5 block h-0.5 w-6 bg-black' />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {worldcupEnabled && (
        <div className="wc-navbar-tricolor flex h-[3px] w-full" aria-hidden>
          <div className="flex-1 bg-[#C8102E]" />
          <div className="flex-1 bg-[#006847]" />
          <div className="flex-1 bg-[#0057A8]" />
        </div>
      )}
    </header>

    {/* Mobile menu */}
    <div
      className={`fixed left-0 right-0 bottom-0 z-[60] lg:hidden transition-all duration-300 ${
        worldcupEnabled ? 'site-mobile-menu-offset' : 'top-0'
      } ${
        navbarOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu điều hướng">
      <button
        type="button"
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300 ${
          navbarOpen ? 'opacity-100' : 'opacity-0'
        }`}
        aria-label="Đóng menu"
        onClick={() => setNavbarOpen(false)}
        tabIndex={navbarOpen ? 0 : -1}
      />
      <aside
        ref={mobileMenuRef}
        className={`absolute inset-y-0 flex w-[min(100%,20rem)] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          session
            ? `left-0 border-r border-slate-200 ${navbarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `right-0 border-l border-slate-200 ${navbarOpen ? 'translate-x-0' : 'translate-x-full'}`
        }`}>
          <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
            <Logo />
            <button
              type="button"
              onClick={() => setNavbarOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
              aria-label="Đóng menu">
              <Icon icon="tabler:x" className="text-2xl" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto bg-white px-4 py-2">
            {headerData.map((item, index) => (
              <MobileHeaderLink
                key={index}
                item={item}
                onNavigate={() => setNavbarOpen(false)}
              />
            ))}
            <div className="mt-auto flex w-full flex-col gap-3 border-t border-slate-100 py-4">
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="w-full rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white"
                    onClick={() => setNavbarOpen(false)}>
                    Vào Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full rounded-xl bg-slate-100 px-4 py-3 text-slate-700">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="w-full rounded-xl border-2 border-primary px-4 py-3 font-semibold text-primary hover:bg-primary/5"
                    onClick={openSignInModal}>
                    Đăng Nhập
                  </button>
                  <button
                    type="button"
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-3 font-semibold text-white shadow-md"
                    onClick={() => openSignUpModal()}>
                    Đăng Ký DN
                  </button>
                </>
              )}
            </div>
          </nav>
        </aside>
    </div>

    {isSignInOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={closeAuthModals}>
        <div
          ref={signInRef}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white px-8 pb-8 pt-12 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={closeAuthModals}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-slate-100 hover:text-gray-700"
            aria-label="Đóng">
            <Icon icon="tabler:x" className="text-2xl" />
          </button>
          <Signin
            onSuccess={closeAuthModals}
            onSwitchToSignUp={() => {
              setIsSignInOpen(false)
              setIsSignUpOpen(true)
            }}
          />
        </div>
      </div>
    )}

    {isSignUpOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={closeAuthModals}>
        <div
          ref={signUpRef}
          className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white px-8 pb-8 pt-12 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={closeAuthModals}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-slate-100 hover:text-gray-700"
            aria-label="Đóng">
            <Icon icon="tabler:x" className="text-2xl" />
          </button>
          <SignUp
            onSwitchToSignIn={openSignInModal}
            onSuccess={() => {
              setIsSignUpOpen(false)
              setIsSignInOpen(true)
            }}
          />
        </div>
      </div>
    )}
    </>
  )
}

export default Header
