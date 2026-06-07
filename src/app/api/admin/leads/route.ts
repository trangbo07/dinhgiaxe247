import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const configErr = getSupabaseAdminConfigError();
  if (configErr) return NextResponse.json({ error: configErr, items: [] }, { status: 503 });

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase chưa cấu hình", items: [] }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const intent = searchParams.get("intent");
  const status = searchParams.get("status");

  let query = supabase
    .from("guest_leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (intent === "mua" || intent === "ban") query = query.eq("intent", intent);
  if (status === "moi" || status === "da_lien_he" || status === "dong") query = query.eq("status", status);

  const { data, error: supaErr } = await query;
  if (supaErr) {
    return NextResponse.json({ error: supaErr.message, items: [] }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
