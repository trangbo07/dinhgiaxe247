'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Icon } from '@iconify/react/dist/iconify.js'
import toast from 'react-hot-toast'
import type { BusinessProfile } from '@/lib/business-profile'

type TabId = 'profile' | 'account' | 'notifications' | 'preferences'

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'profile', label: 'Hồ sơ DN', icon: 'tabler:building-store' },
  { id: 'account', label: 'Tài khoản', icon: 'tabler:key' },
  { id: 'notifications', label: 'Thông báo', icon: 'tabler:bell' },
  { id: 'preferences', label: 'Tùy chọn', icon: 'tabler:adjustments' },
]

const inputClass =
  'w-full bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3 text-gray-700 font-medium transition-all outline-none'

const emptyProfile = (email = ''): BusinessProfile => ({
  companyName: '',
  contactName: '',
  phone: '',
  address: '',
  taxCode: '',
  website: '',
  email,
  notifyNewLeads: true,
  notifyEmail: email,
  accountType: 'business',
  createdAt: null,
})

export default function DashboardSettings() {
  const { data: session, update } = useSession()
  const [activeTab, setActiveTab] = useState<TabId>('profile')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<BusinessProfile>(() =>
    emptyProfile(session?.user?.email ?? '')
  )

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.profile) setProfile(data.profile)
      if (!res.ok && data.error) toast.error(data.error)
    } catch {
      toast.error('Không tải được cài đặt')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveProfile = async (patch: Partial<BusinessProfile> & Record<string, unknown>) => {
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lưu thất bại')
      if (data.profile) setProfile(data.profile)
      if (data.sessionName) {
        await update({ name: data.sessionName })
      }
      toast.success('Đã lưu cài đặt')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi lưu')
    } finally {
      setSaving(false)
    }
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void saveProfile({
      companyName: profile.companyName,
      contactName: profile.contactName,
      phone: profile.phone,
      address: profile.address,
      taxCode: profile.taxCode,
      website: profile.website,
    })
  }

  const handleNotificationsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void saveProfile({
      notifyNewLeads: profile.notifyNewLeads,
      notifyEmail: profile.notifyEmail,
    })
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setChangingPassword(true)
    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại')
      toast.success(data.message || 'Đã đổi mật khẩu')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Lỗi')
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Icon icon="tabler:loader" className="text-4xl text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-midnight_text">Cài đặt</h2>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý hồ sơ doanh nghiệp, bảo mật và thông báo trên ValuCar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}>
            <Icon icon={t.icon} className="text-lg" />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form
          onSubmit={handleProfileSubmit}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-midnight_text flex items-center gap-2">
            <Icon icon="tabler:building-store" className="text-primary text-xl" />
            Thông tin doanh nghiệp
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                Tên doanh nghiệp / showroom <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={profile.companyName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, companyName: e.target.value }))
                }
                className={inputClass}
                placeholder="Công ty TNHH ABC Auto"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                Người liên hệ
              </label>
              <input
                value={profile.contactName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, contactName: e.target.value }))
                }
                className={inputClass}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                className={inputClass}
                placeholder="0901234567"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                Mã số thuế
              </label>
              <input
                value={profile.taxCode}
                onChange={(e) => setProfile((p) => ({ ...p, taxCode: e.target.value }))}
                className={inputClass}
                placeholder="0123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                Website
              </label>
              <input
                value={profile.website}
                onChange={(e) => setProfile((p) => ({ ...p, website: e.target.value }))}
                className={inputClass}
                placeholder="https://showroom.vn"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-midnight_text mb-1.5">
                Địa chỉ
              </label>
              <textarea
                rows={2}
                value={profile.address}
                onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
                className={inputClass}
                placeholder="Số nhà, quận, thành phố"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-60">
            {saving ? (
              <Icon icon="tabler:loader" className="animate-spin" />
            ) : (
              <Icon icon="tabler:device-floppy" />
            )}
            Lưu hồ sơ
          </button>
        </form>
      )}

      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-midnight_text mb-4 flex items-center gap-2">
              <Icon icon="tabler:mail" className="text-primary text-xl" />
              Email đăng nhập
            </h3>
            <p className="text-sm text-slate-600 mb-2">
              Email dùng để đăng nhập — đổi email cần liên hệ quản trị hoặc Supabase Dashboard.
            </p>
            <input
              readOnly
              value={profile.email}
              className={`${inputClass} bg-slate-100 cursor-not-allowed`}
            />
            {profile.createdAt && (
              <p className="text-xs text-slate-400 mt-3">
                Tài khoản tạo:{' '}
                {new Date(profile.createdAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          <form
            onSubmit={handlePasswordSubmit}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-midnight_text flex items-center gap-2">
              <Icon icon="tabler:lock" className="text-primary text-xl" />
              Đổi mật khẩu
            </h3>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Mật khẩu hiện tại</label>
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Mật khẩu mới</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 text-white font-bold text-sm hover:bg-slate-900 disabled:opacity-60">
              {changingPassword ? (
                <Icon icon="tabler:loader" className="animate-spin" />
              ) : (
                <Icon icon="tabler:key" />
              )}
              Cập nhật mật khẩu
            </button>
          </form>
        </div>
      )}

      {activeTab === 'notifications' && (
        <form
          onSubmit={handleNotificationsSubmit}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
          <h3 className="font-bold text-midnight_text flex items-center gap-2">
            <Icon icon="tabler:bell" className="text-primary text-xl" />
            Thông báo
          </h3>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
            <input
              type="checkbox"
              checked={profile.notifyNewLeads}
              onChange={(e) =>
                setProfile((p) => ({ ...p, notifyNewLeads: e.target.checked }))
              }
              className="mt-1 w-4 h-4 rounded border-slate-300 text-primary"
            />
            <span>
              <span className="font-semibold text-midnight_text block">
                Nhắc khi có lead khách mới
              </span>
              <span className="text-sm text-slate-500">
                Bật để theo dõi khách định giá từ trang chủ (xem tại mục Khách website).
              </span>
            </span>
          </label>

          <div>
            <label className="block text-sm font-semibold text-midnight_text mb-1.5">
              Email nhận thông báo (tùy chọn)
            </label>
            <input
              type="email"
              value={profile.notifyEmail}
              onChange={(e) =>
                setProfile((p) => ({ ...p, notifyEmail: e.target.value }))
              }
              className={inputClass}
              placeholder={profile.email}
            />
            <p className="text-xs text-slate-400 mt-1">
              Gửi email tự động sẽ bổ sung sau — hiện lưu tùy chọn trên hồ sơ.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-60">
            <Icon icon="tabler:device-floppy" />
            Lưu thông báo
          </button>
        </form>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-midnight_text flex items-center gap-2">
            <Icon icon="tabler:adjustments" className="text-primary text-xl" />
            Tùy chọn hệ thống
          </h3>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
              <Icon icon="tabler:language" className="text-primary text-lg" />
              Ngôn ngữ: <strong className="text-midnight_text">Tiếng Việt</strong>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
              <Icon icon="tabler:coin" className="text-primary text-lg" />
              Đơn vị tiền: <strong className="text-midnight_text">VNĐ</strong>
            </li>
            <li className="flex items-center gap-2 p-3 rounded-xl bg-slate-50">
              <Icon icon="tabler:shield-check" className="text-primary text-lg" />
              Loại tài khoản:{' '}
              <strong className="text-midnight_text capitalize">{profile.accountType}</strong>
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            Các tùy chọn nâng cao (xuất CSV lead, webhook) sẽ có trong bản cập nhật tiếp theo.
          </p>
        </div>
      )}
    </div>
  )
}
