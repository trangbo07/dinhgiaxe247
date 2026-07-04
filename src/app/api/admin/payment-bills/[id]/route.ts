import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";
import { BUSINESS_PLAN_INFO, isPlanCode } from "@/lib/payment-bills";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, session } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const action = body.action === "approve" ? "approve" : body.action === "reject" ? "reject" : null;

  if (!action) {
    return NextResponse.json({ error: "action phải là 'approve' hoặc 'reject'" }, { status: 400 });
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) return NextResponse.json({ error: configErr }, { status: 503 });

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });

  if (action === "reject") {
    const { data, error: supaErr } = await supabase
      .from("payment_bills")
      .update({
        status: "rejected",
        admin_note: body.note ? String(body.note) : null,
        reviewed_by: session!.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "pending")
      .select()
      .single();

    if (supaErr || !data) {
      return NextResponse.json(
        { error: supaErr?.message ?? "Bill không tồn tại hoặc đã được xử lý" },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, bill: data });
  }

  const { data: bill, error: fetchErr } = await supabase
    .from("payment_bills")
    .select("plan_code, status")
    .eq("id", id)
    .single();

  if (fetchErr || !bill) {
    return NextResponse.json({ error: "Không tìm thấy bill" }, { status: 404 });
  }
  if (!isPlanCode(bill.plan_code)) {
    return NextResponse.json({ error: "Gói trên bill không hợp lệ" }, { status: 400 });
  }

  const durationDays = BUSINESS_PLAN_INFO[bill.plan_code].durationDays;

  const { error: rpcErr } = await supabase.rpc("approve_payment_bill", {
    p_bill_id: id,
    p_admin_id: session!.user.id,
    p_duration_days: durationDays,
  });

  if (rpcErr) {
    return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }

  const { data: updatedBill } = await supabase
    .from("payment_bills")
    .select("*")
    .eq("id", id)
    .single();

  return NextResponse.json({ ok: true, bill: updatedBill });
}
