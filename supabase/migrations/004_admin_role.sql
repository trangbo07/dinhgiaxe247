-- Thêm role admin cho user thông qua app_metadata của Supabase Auth
-- app_metadata chỉ có thể set bằng service_role (an toàn, user không tự set được)

-- ============================================================
-- CÁCH 1: Đặt admin bằng SQL (chạy trong Supabase SQL Editor)
-- ============================================================

-- Đặt role admin cho user theo email (thay email bên dưới):
-- UPDATE auth.users
-- SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
-- WHERE email = 'admin@example.com';

-- Thu hồi quyền admin:
-- UPDATE auth.users
-- SET raw_app_meta_data = (COALESCE(raw_app_meta_data, '{}'::jsonb) - 'role')
-- WHERE email = 'admin@example.com';

-- ============================================================
-- CÁCH 2: Đặt admin qua API (xem /api/admin/users/[id] PATCH)
-- ============================================================
-- Dùng trang /dashboard/admin/users để set/revoke admin trong UI

-- ============================================================
-- KIỂM TRA: Xem danh sách user và role hiện tại
-- ============================================================
-- SELECT id, email, raw_app_meta_data->>'role' as role
-- FROM auth.users
-- ORDER BY created_at DESC;
