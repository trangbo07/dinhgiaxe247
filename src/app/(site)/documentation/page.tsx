import { Documentation } from '@/components/Documentation/Documentation'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Tài Liệu | Định Giá Xe',
}

export default function Page() {
  return (
    <>
      <Documentation />
    </>
  )
}
