import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.SUPABASE_SECRET_KEY?.trim()

/** Thông báo khi thiếu cấu hình lưu DB (không throw) */
export function getSupabaseAdminConfigError(): string | null {
  if (!supabaseUrl) {
    return 'Thiếu NEXT_PUBLIC_SUPABASE_URL trong file .env'
  }
  if (!supabaseServiceRoleKey) {
    return (
      'Thiếu SUPABASE_SERVICE_ROLE_KEY trong file .env. ' +
      'Lấy tại Supabase → Project Settings → API → service_role (secret). ' +
      'Sau đó restart npm run dev.'
    )
  }
  return null
}

/** Client admin — trả về null nếu chưa cấu hình (không throw) */
export function tryCreateSupabaseServerClient(): SupabaseClient | null {
  if (getSupabaseAdminConfigError()) return null

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/** @deprecated Dùng tryCreateSupabaseServerClient — vẫn throw để vehicle-catalog báo lỗi rõ */
export function createSupabaseServerClient() {
  const err = getSupabaseAdminConfigError()
  if (err) {
    throw new Error(err)
  }

  return createClient(supabaseUrl!, supabaseServiceRoleKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase browser env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

/** Dùng cho auth (đăng nhập/đăng ký) trên server — anon key */
export function getSupabaseAuthConfigError(): string | null {
  if (!supabaseUrl) {
    return 'Thiếu NEXT_PUBLIC_SUPABASE_URL trong file .env'
  }
  if (!supabaseAnonKey) {
    return 'Thiếu NEXT_PUBLIC_SUPABASE_ANON_KEY (hoặc NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) trong file .env'
  }
  return null
}

export function createSupabaseAuthClient() {
  const err = getSupabaseAuthConfigError()
  if (err) {
    throw new Error(err)
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
