import Image from 'next/image'
import Link from 'next/link'

type LogoProps = {
  href?: string
  /** false = chỉ ảnh, không bọc Link (dùng khi cha đã là Link) */
  linked?: boolean
}

const Logo: React.FC<LogoProps> = ({ href = '/', linked = true }) => {
  const image = (
    <Image
      src="/images/logo/logo_Valucar.svg"
      alt="ValuCar"
      width={160}
      height={50}
      style={{ width: '105px', height: 'auto' }}
      priority
    />
  )

  if (!linked) return image

  return <Link href={href}>{image}</Link>
}

export default Logo
