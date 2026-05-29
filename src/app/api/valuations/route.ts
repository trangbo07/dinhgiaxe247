import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

function configErrorResponse() {
  const message = getSupabaseAdminConfigError() ?? "Supabase chưa cấu hình";
  return NextResponse.json(
    {
      error: message,
      code: "SUPABASE_NOT_CONFIGURED",
      items: [],
    },
    { status: 503 }
  );
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    return configErrorResponse();
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return configErrorResponse();
  }

  const { data, error } = await supabase
    .from("valuations")
    .select(
      "id, brand, model, year, version, color, mileage, price, price_low, price_high, explanation, source, created_at"
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("valuations list error", error);
    return NextResponse.json(
      {
        error: error.message,
        hint: "Đã chạy file supabase/migrations/001_valuations.sql chưa?",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Chỉ lưu được khi đã đăng nhập" },
      { status: 401 }
    );
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    return NextResponse.json(
      { error: configErr, code: "SUPABASE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return configErrorResponse();
  }

  const body = await request.json();
  const row = {
    user_id: session.user.id,
    brand: String(body.brand ?? "").trim(),
    model: String(body.model ?? "").trim(),
    year: body.year != null ? Number(body.year) : null,
    version: body.version ? String(body.version) : null,
    color: body.color ? String(body.color) : null,
    mileage: Number(body.mileage) || 0,
    price: body.price != null ? Number(body.price) : null,
    price_low: body.priceLow != null ? Number(body.priceLow) : null,
    price_high: body.priceHigh != null ? Number(body.priceHigh) : null,
    explanation: body.explanation ? String(body.explanation) : null,
    source: body.source ? String(body.source) : null,
  };

  if (!row.brand || !row.model) {
    return NextResponse.json({ error: "Thiếu thông tin xe" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("valuations")
    .insert(row)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("valuations insert error", error);
    return NextResponse.json(
      {
        error: error.message,
        hint: "Kiểm tra bảng valuations và SUPABASE_SERVICE_ROLE_KEY",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, item: data });
}
