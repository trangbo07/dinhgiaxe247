import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();

  // role: 'admin' để cấp, null hoặc '' để thu hồi
  const newRole = body.role === "admin" ? "admin" : null;

  const configErr = getSupabaseAdminConfigError();
  if (configErr) return NextResponse.json({ error: configErr }, { status: 503 });

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });

  const { data: current } = await supabase.auth.admin.getUserById(id);
  const existingMeta = (current?.user?.app_metadata ?? {}) as Record<string, unknown>;

  const updatedMeta = newRole
    ? { ...existingMeta, role: "admin" }
    : Object.fromEntries(Object.entries(existingMeta).filter(([k]) => k !== "role"));

  const { data, error: supaErr } = await supabase.auth.admin.updateUserById(id, {
    app_metadata: updatedMeta,
  });

  if (supaErr) {
    return NextResponse.json({ error: supaErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    user: { id: data.user.id, role: (data.user.app_metadata?.role as string) ?? null },
  });
}
