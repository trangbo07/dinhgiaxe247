import { Be_Vietnam_Pro } from 'next/font/google'
import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import LayoutChrome from '@/components/Layout/LayoutChrome'
import ScrollToTop from '@/components/ScrollToTop'
import Aoscompo from '@/utils/aos'
import { Providers } from './Providers'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'ValuCar - Định Giá Xe Ô Tô...',
  description: 'ValuCar - Định Giá Xe Ô Tô...',
  icons: {
    icon: [
      { url: '/images/logo/logo_Valucar.png?v=2', type: 'image/png', sizes: '32x32' },
      { url: '/images/logo/logo_Valucar.png?v=2', type: 'image/png', sizes: '192x192' },
    ],
    shortcut: '/images/logo/logo_Valucar.png?v=2',
    apple: '/images/logo/logo_Valucar.png?v=2',
  },
}

const font = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='vi' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('valucar_wc_theme');if(t==='1')document.documentElement.classList.add('worldcup-theme');}catch(e){}})();`,
          }}
        />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="kXSaUIrNIb+RL9gObOTDEw"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${font.className}`}>
        <Providers>
          <Aoscompo>
            <LayoutChrome>{children}</LayoutChrome>
            <ScrollToTop />
          </Aoscompo>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
