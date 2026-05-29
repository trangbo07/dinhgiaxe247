import { NextResponse } from "next/server";
import { createSupabaseAuthClient } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const companyName = String(body.companyName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");

    if (!companyName || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập tên doanh nghiệp, email và mật khẩu" },
        { status: 400 }
      );
    }

    if (companyName.length < 2) {
      return NextResponse.json(
        { error: "Tên doanh nghiệp không hợp lệ" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email không hợp lệ" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: "business",
          company_name: companyName,
          full_name: companyName,
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return NextResponse.json(
          { error: "Email này đã được đăng ký" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const needsConfirmation = !data.session;
    return NextResponse.json({
      ok: true,
      needsConfirmation,
      message: needsConfirmation
        ? "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản."
        : "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch {
    return NextResponse.json(
      { error: "Không thể đăng ký. Vui lòng thử lại sau." },
      { status: 500 }
    );
  }
}
