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
import { useWallet } from '@/app/Providers'

const Header: React.FC = () => {
  const { data: session } = useSession()
  const { balance, isPro } = useWallet()
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

  // Ensure global modal helpers are always the most up-to-date instance
  if (typeof window !== 'undefined') {
    (window as any).openSignInModal = () => {
      setIsSignUpOpen(false)
      setIsSignInOpen(true)
      setNavbarOpen(false)
    }
    ;(window as any).openSignUpModal = () => {
      setIsSignInOpen(false)
      setIsSignUpOpen(true)
      setNavbarOpen(false)
    }
  }

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

  const handleScroll = () => {
    setSticky(window.scrollY >= 80)
  }

  const handleClickOutside = (event: MouseEvent) => {
    if (
      signInRef.current &&
      !signInRef.current.contains(event.target as Node)
    ) {
      setIsSignInOpen(false)
    }
    if (
      signUpRef.current &&
      !signUpRef.current.contains(event.target as Node)
    ) {
      setIsSignUpOpen(false)
    }
    if (
      mobileMenuRef.current &&
      !mobileMenuRef.current.contains(event.target as Node) &&
      navbarOpen
    ) {
      setNavbarOpen(false)
    }
  }

  useEffect(() => {
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
    <header
      className={`fixed top-0 z-40 w-full transition-all duration-300 ${
        sticky
          ? 'bg-white/95 py-3 shadow-[0_8px_30px_-12px_rgba(0,27,80,0.15)] backdrop-blur-md'
          : 'bg-header/80 py-3 backdrop-blur-sm'
      }`}>
      <div>
        <div className='container flex items-center justify-between'>
          <div>
            <Logo />
          </div>
          <nav className='hidden lg:flex grow items-center gap-8 justify-start md:ml-20'>
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
                <Link
                  href='#'
                  className='hidden lg:block bg-white text-primary hover:bg-gray-50 px-6 py-2.5 rounded-full font-semibold text-base transition-all shadow-sm'
                  onClick={(e) => {
                    e.preventDefault()
                    openSignInModal()
                  }}>
                  Đăng Nhập
                </Link>
                {isSignInOpen && (
                  <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity'>
                    <div
                      ref={signInRef}
                      className='relative mx-auto w-full max-w-md overflow-hidden rounded-3xl px-8 pt-12 pb-8 text-center bg-white shadow-2xl border border-gray-100 transform transition-all'>
                      <button
                        onClick={() => setIsSignInOpen(false)}
                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert hover:cursor-pointer'
                        aria-label='Close Sign In Modal'>
                        <Icon
                          icon='tabler:x'
                          className='text-gray-400 hover:text-gray-700 text-2xl inline-block me-2'
                        />
                      </button>
                      <Signin
                        onSwitchToSignUp={() => {
                          setIsSignInOpen(false)
                          setIsSignUpOpen(true)
                        }}
                      />
                    </div>
                  </div>
                )}
                <Link
                  href='#'
                  className='hidden lg:block bg-gradient-to-r from-primary to-blue-600 text-white hover:opacity-90 px-6 py-2.5 rounded-full font-semibold text-base shadow-lg shadow-primary/30 transition-all'
                  onClick={(e) => {
                    e.preventDefault()
                    openSignUpModal()
                  }}>
                  Đăng Ký DN
                </Link>
                {isSignUpOpen && (
                  <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity'>
                    <div
                      ref={signUpRef}
                      className='relative mx-auto w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 px-8 pt-12 pb-8 text-center'>
                      <button
                        onClick={() => setIsSignUpOpen(false)}
                        className='absolute top-0 right-0 mr-8 mt-8 dark:invert hover:cursor-pointer'
                        aria-label='Close Sign Up Modal'>
                        <Icon
                          icon='tabler:x'
                          className='text-gray-400 hover:text-gray-700 text-2xl inline-block me-2'
                        />
                      </button>
                      <SignUp
                        onSwitchToSignIn={openSignInModal}
                        onSuccess={() => {
                          setIsSignUpOpen(false)
                          window.location.href = '/signin'
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => setNavbarOpen(!navbarOpen)}
              className='block lg:hidden p-2 rounded-lg'
              aria-label='Toggle mobile menu'>
              <span className='block w-6 h-0.5 bg-black'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
              <span className='block w-6 h-0.5 bg-black mt-1.5'></span>
            </button>
          </div>
        </div>
        {navbarOpen && (
          <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-40' />
        )}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed top-0 right-0 h-full w-full bg-white shadow-lg transform transition-transform duration-300 max-w-xs ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          } z-50`}>
          <div className='flex items-center justify-between p-4'>
            <h2 className='text-lg font-bold text-midnight_text'>
              <Logo />
            </h2>

            {/*  */}
            <button
              onClick={() => setNavbarOpen(false)}
              className="bg-[url('/images/closed.svg')] bg-no-repeat bg-contain w-5 h-5 absolute top-0 right-0 mr-8 mt-8 dark:invert"
              aria-label='Close menu Modal'></button>
          </div>
          <nav className='flex flex-col items-start p-4'>
            {headerData.map((item, index) => (
              <MobileHeaderLink
                key={index}
                item={item}
                onNavigate={() => setNavbarOpen(false)}
              />
            ))}
            <div className='mt-4 flex flex-col gap-4 w-full'>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className='bg-primary text-white w-full px-4 py-2 rounded-lg text-center font-semibold'
                    onClick={() => setNavbarOpen(false)}>
                    Vào Dashboard
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className='bg-slate-100 text-slate-700 w-full px-4 py-2 rounded-lg'>
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href='#'
                    className='bg-transparent border border-primary text-primary px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white'
                    onClick={(e) => {
                      e.preventDefault()
                      openSignInModal()
                    }}>
                    Đăng Nhập
                  </Link>
                  <Link
                    href='#'
                    className='bg-primary text-white  px-4 py-2 rounded-lg hover:bg-blue-700'
                    onClick={(e) => {
                      e.preventDefault()
                      openSignUpModal()
                    }}>
                    Đăng Ký DN
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
