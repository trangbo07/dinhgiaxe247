import { NextResponse } from "next/server";
import type { RateLimitResult } from "@/lib/rate-limit";

export function rateLimitResponse(result: Extract<RateLimitResult, { allowed: false }>) {
  return NextResponse.json(
    {
      error: result.reason,
      code: "RATE_LIMITED",
      retryAfterSeconds: result.retryAfterSeconds,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    }
  );
}
