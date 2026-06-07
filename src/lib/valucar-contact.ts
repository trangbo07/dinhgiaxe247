export const VALUCAR_CONTACT = {
  phoneDisplay: '096 579 62 99',
  phoneTel: '0965796299',
  email: 'valucar247@gmail.com',
  facebookUrl: 'https://www.facebook.com/profile.php?id=61590451947338',
  facebookLabel: 'ValuCar trên Facebook',
} as const

export const VALUCAR_CONTACT_CHANNELS = [
  {
    id: 'phone',
    label: 'Gọi ngay',
    value: VALUCAR_CONTACT.phoneDisplay,
    href: `tel:${VALUCAR_CONTACT.phoneTel}`,
    icon: 'tabler:phone',
  },
  {
    id: 'email',
    label: 'Email',
    value: VALUCAR_CONTACT.email,
    href: `mailto:${VALUCAR_CONTACT.email}`,
    icon: 'tabler:mail',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    value: 'ValuCar',
    href: VALUCAR_CONTACT.facebookUrl,
    icon: 'tabler:brand-facebook',
    external: true,
  },
] as const
