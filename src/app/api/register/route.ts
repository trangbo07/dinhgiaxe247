import { NextResponse } from "next/server";
import { createSupabaseAuthClient, getSupabaseAuthConfigError } from "@/utils/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? body.companyName ?? "").trim();
    const email = String(body.email ?? "").trim();
    const password = String(body.password ?? "");
    const accountType = body.accountType === "personal" ? "personal" : "business";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: accountType === "business" ? "Vui lòng nhập tên doanh nghiệp, email và mật khẩu" : "Vui lòng nhập họ tên, email và mật khẩu" },
        { status: 400 }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        { error: accountType === "business" ? "Tên doanh nghiệp không hợp lệ" : "Họ tên không hợp lệ" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự" },
        { status: 400 }
      );
    }

    const configErr = getSupabaseAuthConfigError();
    if (configErr) {
      return NextResponse.json({ error: configErr }, { status: 503 });
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          account_type: accountType,
          full_name: name,
          ...(accountType === "business" ? { company_name: name } : {}),
        },
      },
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return NextResponse.json({ error: "Email này đã được đăng ký" }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const needsConfirmation = !data.session;
    return NextResponse.json({
      ok: true,
      needsConfirmation,
      accountType,
      message: needsConfirmation
        ? "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản."
        : "Đăng ký thành công. Bạn có thể đăng nhập ngay.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Không thể đăng ký. Vui lòng thử lại sau.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
