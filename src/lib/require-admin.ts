import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";

export async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      session: null,
    };
  }
  if (session.user.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden – chỉ admin mới có quyền" }, { status: 403 }),
      session: null,
    };
  }
  return { error: null, session };
}
