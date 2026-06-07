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
  if (configErr) {
    return NextResponse.json({ error: configErr, users: [] }, { status: 503 });
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa cấu hình", users: [] }, { status: 503 });
  }

  const { data, error: supaErr } = await supabase.auth.admin.listUsers({ perPage: 500 });
  if (supaErr) {
    return NextResponse.json({ error: supaErr.message, users: [] }, { status: 500 });
  }

  const users = (data?.users ?? []).map((u) => ({
    id: u.id,
    email: u.email,
    name:
      u.user_metadata?.company_name ||
      u.user_metadata?.full_name ||
      u.user_metadata?.name ||
      null,
    role: (u.app_metadata?.role as string) ?? null,
    account_type: (u.user_metadata?.account_type as string) ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at,
  }));

  return NextResponse.json({ users });
}
