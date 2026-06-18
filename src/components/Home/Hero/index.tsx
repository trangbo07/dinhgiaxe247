import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react/dist/iconify.js'
import ContactChannels from '@/components/Contact/ContactChannels'

const stats = [
  { value: '30 ngày', label: 'Dữ liệu thị trường', icon: 'tabler:chart-line' },
  { value: '2 nguồn', label: 'Chợ Tốt & Bonbanh', icon: 'tabler:database' },
  { value: 'Miễn phí', label: 'Định giá khách', icon: 'tabler:gift' },
]

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-header pt-10 pb-14 lg:pt-14 lg:pb-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(59,130,246,0.14),transparent_70%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-primary/8 blur-3xl"
        aria-hidden
      />

      <div className="container relative z-10 px-4">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <div className="mb-5 flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                </span>
                ValuCar · Định giá AI thời gian thực
              </span>
            </div>

            <h1 className="mx-auto max-w-2xl text-center text-4xl font-black leading-tight tracking-tight text-midnight_text sm:text-5xl lg:mx-0 lg:text-start lg:text-[3.15rem] lg:leading-[1.12]">
              Biết giá xe{' '}
              <span className="bg-gradient-to-r from-primary via-blue-500 to-blue-400 bg-clip-text text-transparent">
                trong vài phút
              </span>
              — minh bạch, có lý do.
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-center text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0 lg:text-start">
              Dữ liệu Chợ Tốt & Bonbanh, tích hợp AI và quy trình định giá ValuCar — khoảng giá tham chiếu
              kèm giải thích rõ ràng theo tình trạng xe và thị trường.
            </p>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/#valuation"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 sm:w-auto">
                Định giá miễn phí
                <Icon
                  icon="tabler:arrow-down"
                  className="text-xl transition-transform group-hover:translate-y-0.5"
                />
              </Link>
              <button
                type="button"
                onClick={() => {
                  if (
                    typeof window !== 'undefined' &&
                    typeof (window as Window & { openSignUpModal?: () => void }).openSignUpModal ===
                      'function'
                  ) {
                    ;(window as Window & { openSignUpModal?: () => void }).openSignUpModal!()
                  }
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/90 px-8 py-4 text-base font-bold text-midnight_text shadow-sm transition-all hover:bg-white sm:w-auto">
                <Icon icon="tabler:building-store" className="text-xl text-primary" />
                Dành cho showroom
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/80 p-3 text-center shadow-sm backdrop-blur-sm sm:p-4">
                  <Icon icon={s.icon} className="mx-auto mb-1 text-xl text-primary sm:text-2xl" />
                  <p className="text-sm font-black text-midnight_text sm:text-base">{s.value}</p>
                  <p className="text-[10px] font-medium text-slate-500 sm:text-xs">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[520px] lg:max-w-none">
              <div
                className="pointer-events-none absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/15 to-blue-300/10 blur-3xl"
                aria-hidden
              />

              <div className="relative overflow-hidden rounded-3xl shadow-[0_28px_56px_-20px_rgba(0,27,80,0.22)]">
                <div className="relative aspect-[5/4] sm:aspect-[4/3]">
                  <Image
                    src="/images/hero/banner4.png"
                    alt="ValuCar — định giá xe thông minh"
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 520px"
                    className="object-cover object-center"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight_text/40 via-transparent to-transparent" />
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <Icon icon="tabler:sparkles" className="text-lg text-primary" />
                    <span className="text-sm font-bold text-midnight_text">Định giá minh bạch</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">AI · Chợ Tốt · Bonbanh</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ContactChannels
          variant="hero"
          title="Liên hệ ValuCar"
          className="mx-auto max-w-4xl lg:max-w-none"
        />
      </div>
    </section>
  )
}

export default Hero
