import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { createSupabaseAuthClient } from "@/utils/supabase";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");
  const confirmPassword = String(body.confirmPassword ?? "");

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "Vui lòng nhập mật khẩu hiện tại và mật khẩu mới" },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "Mật khẩu mới phải có ít nhất 6 ký tự" },
      { status: 400 }
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json(
      { error: "Mật khẩu mới và xác nhận không khớp" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAuthClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: session.user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: "Mật khẩu hiện tại không đúng" },
      { status: 400 }
    );
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, message: "Đã đổi mật khẩu" });
  }

  const admin = tryCreateSupabaseServerClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });
  }

  const { error } = await admin.auth.admin.updateUserById(session.user.id, {
    password: newPassword,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: "Đã đổi mật khẩu. Lần đăng nhập sau dùng mật khẩu mới.",
  });
}
