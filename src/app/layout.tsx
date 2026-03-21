import { Poppins } from 'next/font/google'
import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Layout/Header'
import Footer from '@/components/Layout/Footer'
import ScrollToTop from '@/components/ScrollToTop'
import Aoscompo from '@/utils/aos'
import { Providers } from './Providers'

export const metadata: Metadata = {
  icons: {
    icon: '/images/logo/logo_Valucar.png?v=2',
    shortcut: '/images/logo/logo_Valucar.png?v=2',
    apple: '/images/logo/logo_Valucar.png?v=2',
  },
}

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${font.className}`}>
        <Providers>
          <Aoscompo>
            <Header />
            {children}
            <Footer />
          </Aoscompo>
        </Providers>
      </body>
    </html>
  )
}
