import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayLabel(d: Date) {
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const configErr = getSupabaseAdminConfigError();
  if (configErr) return NextResponse.json({ error: configErr }, { status: 503 });

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });

  const now = new Date();
  const startThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const startLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const start14Days = new Date(Date.now() - 13 * 86400_000).toISOString();

  const [usersRes, leadsRes, valuationsRes, leadsMonthRes, leadsLastMonthRes, leads14Res, vals14Res] =
    await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase.from("guest_leads").select("id, intent, status, created_at", { count: "exact" }),
      supabase.from("valuations").select("id, brand, created_at", { count: "exact" }),
      supabase
        .from("guest_leads")
        .select("id", { count: "exact" })
        .gte("created_at", startThisMonth),
      supabase
        .from("guest_leads")
        .select("id", { count: "exact" })
        .gte("created_at", startLastMonth)
        .lt("created_at", endLastMonth),
      supabase
        .from("guest_leads")
        .select("created_at, intent, status")
        .gte("created_at", start14Days)
        .order("created_at", { ascending: true }),
      supabase
        .from("valuations")
        .select("created_at, brand")
        .gte("created_at", start14Days)
        .order("created_at", { ascending: true }),
    ]);

  const allLeads = leadsRes.data ?? [];
  const allVals = valuationsRes.data ?? [];
  const totalUsers = usersRes.data?.users?.length ?? 0;
  const totalLeads = leadsRes.count ?? allLeads.length;
  const totalVals = valuationsRes.count ?? allVals.length;
  const leadsThisMonth = leadsMonthRes.count ?? 0;
  const leadsLastMonth = leadsLastMonthRes.count ?? 0;

  // Users joined this month
  const usersThisMonth = (usersRes.data?.users ?? []).filter(
    (u) => u.created_at && new Date(u.created_at) >= new Date(startThisMonth)
  ).length;

  // Lead intent breakdown
  const intentMua = allLeads.filter((l) => l.intent === "mua").length;
  const intentBan = allLeads.filter((l) => l.intent === "ban").length;

  // Lead status breakdown
  const statusBreakdown = {
    moi: allLeads.filter((l) => l.status === "moi").length,
    da_lien_he: allLeads.filter((l) => l.status === "da_lien_he").length,
    dong: allLeads.filter((l) => l.status === "dong").length,
  };

  // Top 5 brands in valuations
  const brandCount: Record<string, number> = {};
  allVals.forEach((v) => {
    if (v.brand) brandCount[v.brand] = (brandCount[v.brand] ?? 0) + 1;
  });
  const topBrands = Object.entries(brandCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand, count]) => ({ brand, count }));

  // Daily chart (last 14 days)
  const days: { label: string; date: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    days.push({ label: dayLabel(d), date: startOfDay(d).toISOString().slice(0, 10) });
  }

  const leadsBy14 = (leads14Res.data ?? []);
  const valsBy14 = (vals14Res.data ?? []);

  const dailyLeads = days.map(({ label, date }) => ({
    label,
    count: leadsBy14.filter((l) => l.created_at.slice(0, 10) === date).length,
  }));
  const dailyVals = days.map(({ label, date }) => ({
    label,
    count: valsBy14.filter((v) => v.created_at.slice(0, 10) === date).length,
  }));

  // Recent users (last 10)
  const recentUsers = (usersRes.data?.users ?? [])
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8)
    .map((u) => ({
      id: u.id,
      email: u.email,
      name: u.user_metadata?.company_name || u.user_metadata?.full_name || null,
      role: (u.app_metadata?.role as string) ?? null,
      created_at: u.created_at,
    }));

  return NextResponse.json({
    totals: { users: totalUsers, leads: totalLeads, valuations: totalVals },
    thisMonth: { leads: leadsThisMonth, users: usersThisMonth },
    lastMonth: { leads: leadsLastMonth },
    intentBreakdown: { mua: intentMua, ban: intentBan },
    statusBreakdown,
    topBrands,
    dailyLeads,
    dailyVals,
    recentUsers,
  });
}
