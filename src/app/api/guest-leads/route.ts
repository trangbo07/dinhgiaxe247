import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { getClientIp } from "@/lib/client-ip";
import { rateLimitGuestLeads } from "@/lib/rate-limit";
import { rateLimitResponse } from "@/lib/api-rate-limit-response";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

export async function GET(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    return NextResponse.json({ error: configErr, items: [] }, { status: 503 });
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa cấu hình", items: [] }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const intent = searchParams.get("intent");
  const status = searchParams.get("status");

  let query = supabase
    .from("guest_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (intent === "mua" || intent === "ban") {
    query = query.eq("intent", intent);
  }
  if (status === "moi" || status === "da_lien_he" || status === "dong") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("guest_leads list", error);
    return NextResponse.json(
      {
        error: error.message,
        hint: "Chạy supabase/migrations/002_guest_leads.sql",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimitGuestLeads(getClientIp(request));
    if (!limited.allowed) return rateLimitResponse(limited);

    const body = await request.json();
    const fullName = String(body.fullName ?? "").trim();
    const phone = String(body.phone ?? "").replace(/\s/g, "");
    const intent = String(body.intent ?? "").trim();
    const brand = String(body.brand ?? "").trim();
    const model = String(body.model ?? "").trim();

    if (!fullName || !phone || !intent) {
      return NextResponse.json(
        { error: "Thiếu họ tên, số điện thoại hoặc nhu cầu mua/bán" },
        { status: 400 }
      );
    }

    if (!brand || !model) {
      return NextResponse.json({ error: "Thiếu thông tin xe" }, { status: 400 });
    }

    if (intent !== "mua" && intent !== "ban") {
      return NextResponse.json({ error: "Nhu cầu không hợp lệ" }, { status: 400 });
    }

    const phoneNorm = phone.replace(/\s|-|\./g, "").replace(/^\+84/, "0");
    if (!/^0[3-9][0-9]{8}$/.test(phoneNorm)) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ (phải là số Việt Nam 10 số, bắt đầu 03x/07x/08x/09x)" },
        { status: 400 }
      );
    }

    const configErr = getSupabaseAdminConfigError();
    if (configErr) {
      return NextResponse.json({ error: configErr, saved: false }, { status: 503 });
    }

    const supabase = tryCreateSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Không kết nối Supabase", saved: false },
        { status: 503 }
      );
    }

    const row = {
      full_name: fullName,
      phone: phoneNorm,
      intent,
      brand,
      model,
      year: body.year != null ? Number(body.year) : null,
      version: body.version ? String(body.version) : null,
      color: body.color ? String(body.color) : null,
      mileage: Number(body.mileage) || 0,
      price: body.price != null ? Number(body.price) : null,
      price_low: body.priceLow != null ? Number(body.priceLow) : null,
      price_high: body.priceHigh != null ? Number(body.priceHigh) : null,
      explanation: body.explanation ? String(body.explanation) : null,
      source: body.source ? String(body.source) : null,
      status: "moi",
    };

    const { data, error } = await supabase
      .from("guest_leads")
      .insert(row)
      .select("id, created_at")
      .single();

    if (error) {
      console.error("guest_leads insert", error);
      return NextResponse.json(
        { error: error.message, saved: false, hint: "Kiểm tra bảng guest_leads trên Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      saved: true,
      message: "Đã lưu hồ sơ khách. Doanh nghiệp có thể xem trên dashboard.",
      item: data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Không thể lưu thông tin khách", saved: false },
      { status: 500 }
    );
  }
}
