'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import AdminUsersPage from '@/components/Dashboard/AdminUsersPage'

export default function AdminUsersRoute() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading' || !session || session.user?.role !== 'admin') {
    return (
      <div className="flex justify-center py-20">
        <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
      </div>
    )
  }

  return <AdminUsersPage />
}
