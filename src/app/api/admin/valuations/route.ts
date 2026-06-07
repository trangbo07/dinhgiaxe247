import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const configErr = getSupabaseAdminConfigError();
  if (configErr) return NextResponse.json({ error: configErr, items: [] }, { status: 503 });

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase chưa cấu hình", items: [] }, { status: 503 });

  const { data, error: supaErr } = await supabase
    .from("valuations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (supaErr) {
    return NextResponse.json({ error: supaErr.message, items: [] }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
