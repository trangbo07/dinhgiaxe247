import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";
import { PAYMENT_BILLS_BUCKET } from "@/lib/payment-bills";

const SIGNED_URL_TTL_SECONDS = 60 * 10;

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const configErr = getSupabaseAdminConfigError();
  if (configErr) return NextResponse.json({ error: configErr, items: [] }, { status: 503 });

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase chưa cấu hình", items: [] }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  let query = supabase
    .from("payment_bills")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (status === "pending" || status === "approved" || status === "rejected") {
    query = query.eq("status", status);
  }

  const { data, error: supaErr } = await query;
  if (supaErr) {
    return NextResponse.json({ error: supaErr.message, items: [] }, { status: 500 });
  }

  const items = await Promise.all(
    (data ?? []).map(async (bill) => {
      const [{ data: signed }, { data: userData }] = await Promise.all([
        supabase.storage.from(PAYMENT_BILLS_BUCKET).createSignedUrl(bill.image_path, SIGNED_URL_TTL_SECONDS),
        supabase.auth.admin.getUserById(bill.user_id),
      ]);
      return {
        ...bill,
        imageUrl: signed?.signedUrl ?? null,
        userEmail: userData?.user?.email ?? null,
      };
    })
  );

  return NextResponse.json({ items });
}
