import { NextResponse } from "next/server";
import { createSupabaseAuthClient, getSupabaseAuthConfigError } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }

    const configErr = getSupabaseAuthConfigError();
    if (configErr) {
      return NextResponse.json({ error: configErr }, { status: 503 });
    }

    const supabase = createSupabaseAuthClient();
    const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const redirectTo = `${siteUrl}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(String(email).trim(), {
      redirectTo,
    });

    if (error) {
      console.error("[forgot-password]", error.message);
    }

    // Luôn trả success để tránh email enumeration
    return NextResponse.json({
      ok: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi hệ thống";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
