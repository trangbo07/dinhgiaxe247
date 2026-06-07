'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'

type AdminUser = {
  id: string
  email: string | undefined
  name: string | null
  role: string | null
  account_type: string | null
  created_at: string
  last_sign_in_at: string | null
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Không tải được danh sách')
      setUsers(data.users ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const toggleAdmin = async (user: AdminUser) => {
    const newRole = user.role === 'admin' ? null : 'admin'
    const label = newRole ? 'Cấp quyền Admin' : 'Thu hồi quyền Admin'
    if (!confirm(`${label} cho ${user.email}?`)) return

    setUpdating(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại')
      toast.success(`${label} thành công`)
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: data.user.role } : u))
      )
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi')
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden sm:space-y-6">
      <div className="flex items-center gap-2 lg:hidden">
        <p className="min-w-0 flex-1 text-xs leading-snug text-slate-500">
          Quản lý tất cả tài khoản · Cấp / thu hồi quyền Admin.
        </p>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Làm mới"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={`text-xl ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="hidden items-start justify-between gap-4 lg:flex">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-midnight_text">Quản lý Users</h2>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">Admin Only</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Xem tất cả tài khoản · Cấp hoặc thu hồi quyền Admin.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50">
          <Icon icon={loading ? 'tabler:loader' : 'tabler:refresh'} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Icon icon="tabler:loader" className="animate-spin text-4xl text-primary" />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
            {users.length} tài khoản
          </div>
          <div className="divide-y divide-slate-100">
            {users.map((user) => (
              <div key={user.id} className="flex min-w-0 items-center gap-3 px-4 py-3 sm:py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon icon={user.role === 'admin' ? 'tabler:shield-check' : 'tabler:user'} className="text-xl" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-midnight_text">
                    {user.name || user.email}
                  </p>
                  {user.name && (
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  )}
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Đăng ký: {new Date(user.created_at).toLocaleDateString('vi-VN')}
                    {user.last_sign_in_at
                      ? ` · Đăng nhập: ${new Date(user.last_sign_in_at).toLocaleDateString('vi-VN')}`
                      : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {user.role === 'admin' && (
                    <span className="hidden rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 sm:inline-flex">
                      Admin
                    </span>
                  )}
                  <button
                    type="button"
                    disabled={updating === user.id}
                    onClick={() => toggleAdmin(user)}
                    className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
                      user.role === 'admin'
                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}>
                    {updating === user.id ? (
                      <Icon icon="tabler:loader" className="animate-spin" />
                    ) : user.role === 'admin' ? (
                      'Thu hồi Admin'
                    ) : (
                      'Cấp Admin'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
