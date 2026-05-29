import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const status = String(body.status ?? "").trim();

  if (!["moi", "da_lien_he", "dong"].includes(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ" }, { status: 400 });
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    return NextResponse.json({ error: configErr }, { status: 503 });
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("guest_leads")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, item: data });
}
