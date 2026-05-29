import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import {
  metadataPatchFromProfile,
  profileFromMetadata,
  type BusinessProfile,
} from "@/lib/business-profile";
import {
  getSupabaseAdminConfigError,
  tryCreateSupabaseServerClient,
} from "@/utils/supabase";

function normalizePhone(phone: string) {
  const p = phone.replace(/\s/g, "").replace(/^\+84/, "0");
  if (!p) return "";
  if (!/^0[0-9]{9,10}$/.test(p)) return null;
  return p;
}

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    return NextResponse.json(
      {
        error: configErr,
        profile: profileFromMetadata(
          undefined,
          session.user.email ?? "",
          null
        ),
      },
      { status: 503 }
    );
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });
  }

  const { data, error } = await supabase.auth.admin.getUserById(session.user.id);

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Không tải được hồ sơ" },
      { status: 500 }
    );
  }

  const profile = profileFromMetadata(
    data.user.user_metadata,
    data.user.email ?? session.user.email ?? "",
    data.user.created_at
  );

  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const configErr = getSupabaseAdminConfigError();
  if (configErr) {
    return NextResponse.json({ error: configErr }, { status: 503 });
  }

  const supabase = tryCreateSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase chưa cấu hình" }, { status: 503 });
  }

  const body = await request.json();

  const companyName =
    body.companyName != null ? String(body.companyName).trim() : undefined;
  if (companyName !== undefined && companyName.length < 2) {
    return NextResponse.json(
      { error: "Tên doanh nghiệp phải có ít nhất 2 ký tự" },
      { status: 400 }
    );
  }

  const phoneRaw =
    body.phone != null ? String(body.phone).trim() : undefined;
  if (phoneRaw !== undefined && phoneRaw) {
    const normalized = normalizePhone(phoneRaw);
    if (normalized === null) {
      return NextResponse.json(
        { error: "Số điện thoại không hợp lệ (vd: 0901234567)" },
        { status: 400 }
      );
    }
  }

  const notifyEmail =
    body.notifyEmail != null ? String(body.notifyEmail).trim() : undefined;
  if (notifyEmail !== undefined && notifyEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
      return NextResponse.json({ error: "Email thông báo không hợp lệ" }, { status: 400 });
    }
  }

  const { data: existing, error: fetchErr } = await supabase.auth.admin.getUserById(
    session.user.id
  );

  if (fetchErr || !existing.user) {
    return NextResponse.json(
      { error: fetchErr?.message ?? "Không đọc được hồ sơ" },
      { status: 500 }
    );
  }

  const patch: Partial<BusinessProfile> = {};
  if (companyName !== undefined) patch.companyName = companyName;
  if (body.contactName != null) patch.contactName = String(body.contactName);
  if (phoneRaw !== undefined) {
    patch.phone = phoneRaw ? normalizePhone(phoneRaw) ?? "" : "";
  }
  if (body.address != null) patch.address = String(body.address);
  if (body.taxCode != null) patch.taxCode = String(body.taxCode);
  if (body.website != null) patch.website = String(body.website);
  if (typeof body.notifyNewLeads === "boolean") {
    patch.notifyNewLeads = body.notifyNewLeads;
  }
  if (notifyEmail !== undefined) patch.notifyEmail = notifyEmail;

  const user_metadata = metadataPatchFromProfile(
    existing.user.user_metadata,
    patch
  );

  const { data, error } = await supabase.auth.admin.updateUserById(
    session.user.id,
    { user_metadata }
  );

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Không cập nhật được hồ sơ" },
      { status: 500 }
    );
  }

  const profile = profileFromMetadata(
    data.user.user_metadata,
    data.user.email ?? session.user.email ?? "",
    data.user.created_at
  );

  return NextResponse.json({
    ok: true,
    profile,
    sessionName: profile.companyName || profile.contactName,
  });
}
