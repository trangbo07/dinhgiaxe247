type WindowRule = { windowMs: number; max: number };

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number; reason: string };

const buckets = new Map<string, number[]>();
let lastCleanup = Date.now();
const CLEANUP_EVERY_MS = 5 * 60 * 1000;

function envInt(name: string, fallback: number) {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_EVERY_MS) return;
  lastCleanup = now;
  const maxAge = 24 * 60 * 60 * 1000;
  for (const [key, times] of buckets.entries()) {
    const kept = times.filter((t) => now - t < maxAge);
    if (kept.length === 0) buckets.delete(key);
    else buckets.set(key, kept);
  }
}

function checkWindows(key: string, rules: WindowRule[]): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  const times = buckets.get(key) ?? [];
  const recent = times.filter((t) =>
    rules.some((r) => now - t < r.windowMs)
  );

  for (const rule of rules) {
    const inWindow = recent.filter((t) => now - t < rule.windowMs);
    if (inWindow.length >= rule.max) {
      const oldest = Math.min(...inWindow);
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + rule.windowMs - now) / 1000)
      );
      const mins = Math.ceil(rule.windowMs / 60000);
      return {
        allowed: false,
        retryAfterSeconds,
        reason: `Quá ${rule.max} lượt trong ${mins} phút. Thử lại sau ${retryAfterSeconds}s.`,
      };
    }
  }

  recent.push(now);
  buckets.set(key, recent);
  return { allowed: true };
}

/** Chống spam nhanh theo IP khi so sánh xe. */
export function rateLimitGuestCompare(ip: string): RateLimitResult {
  return checkWindows(`guest-compare:${ip}`, [{ windowMs: 20 * 1000, max: 1 }])
}

/** Giới hạn so sánh xe theo thiết bị — mặc định 5 lượt / tháng. */
export function rateLimitDeviceCompare(deviceId: string): RateLimitResult {
  const max = envInt('RATE_GUEST_COMPARE_PER_DEVICE', 5)
  const monthKey = new Date().toISOString().slice(0, 7)

  const result = checkWindows(`guest-compare-dev:${deviceId}:${monthKey}`, [
    { windowMs: 32 * 24 * 60 * 60 * 1000, max },
  ])

  if (!result.allowed) {
    return {
      ...result,
      reason: `Bạn đã dùng hết ${max} lượt so sánh xe trên thiết bị này trong tháng. Đăng ký tài khoản hoặc thử lại tháng sau.`,
    }
  }

  return result
}

export function getDeviceCompareQuota(deviceId: string): {
  used: number
  max: number
  remaining: number
} {
  const max = envInt('RATE_GUEST_COMPARE_PER_DEVICE', 5)
  const monthKey = new Date().toISOString().slice(0, 7)
  const key = `guest-compare-dev:${deviceId}:${monthKey}`
  const windowMs = 32 * 24 * 60 * 60 * 1000
  const now = Date.now()
  const used = (buckets.get(key) ?? []).filter((t) => now - t < windowMs).length
  return { used, max, remaining: Math.max(0, max - used) }
}

export function rateLimitAuthCompare(userId: string): RateLimitResult {
  const perHour = envInt('RATE_AUTH_COMPARE_PER_HOUR', 40)
  const perDay = envInt('RATE_AUTH_COMPARE_PER_DAY', 150)

  return checkWindows(`auth-compare:${userId}`, [
    { windowMs: 10 * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ])
}

/** Khách (landing): chặn spam crawl + Gemini. */
export function rateLimitGuestValuation(ip: string): RateLimitResult {
  const burstSec = envInt("RATE_GUEST_VALUATION_BURST_SEC", 5);
  const perHour = envInt("RATE_GUEST_VALUATION_PER_HOUR", 8);
  const perDay = envInt("RATE_GUEST_VALUATION_PER_DAY", 30);

  return checkWindows(`guest-val:${ip}`, [
    { windowMs: burstSec * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ]);
}

/** Doanh nghiệp đăng nhập: thoải mái nhưng vẫn có trần chống bot. */
export function rateLimitAuthValuation(userId: string): RateLimitResult {
  const perHour = envInt("RATE_AUTH_VALUATION_PER_HOUR", 120);
  const perDay = envInt("RATE_AUTH_VALUATION_PER_DAY", 500);

  return checkWindows(`auth-val:${userId}`, [
    { windowMs: 3 * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ]);
}

export function rateLimitAuthVehicleDetect(userId: string): RateLimitResult {
  const perHour = envInt("RATE_AUTH_VEHICLE_DETECT_PER_HOUR", 30);
  const perDay = envInt("RATE_AUTH_VEHICLE_DETECT_PER_DAY", 100);

  return checkWindows(`auth-vdetect:${userId}`, [
    { windowMs: 5 * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ]);
}

export function rateLimitAuthChat(userId: string): RateLimitResult {
  const perHour = envInt("RATE_AUTH_CHAT_PER_HOUR", 80);
  const perDay = envInt("RATE_AUTH_CHAT_PER_DAY", 300);

  return checkWindows(`auth-chat:${userId}`, [
    { windowMs: 2 * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ]);
}

export function rateLimitGuestLeads(ip: string): RateLimitResult {
  const perHour = envInt("RATE_GUEST_LEADS_PER_HOUR", 10);
  const perDay = envInt("RATE_GUEST_LEADS_PER_DAY", 40);

  return checkWindows(`guest-lead:${ip}`, [
    { windowMs: 10 * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ]);
}

/** Khách chat AI sau định giá (giới hạn chặt hơn user đăng nhập). */
export function rateLimitGuestChat(ip: string): RateLimitResult {
  const perHour = envInt("RATE_GUEST_CHAT_PER_HOUR", 25);
  const perDay = envInt("RATE_GUEST_CHAT_PER_DAY", 80);

  return checkWindows(`guest-chat:${ip}`, [
    { windowMs: 2 * 1000, max: 1 },
    { windowMs: 60 * 60 * 1000, max: perHour },
    { windowMs: 24 * 60 * 60 * 1000, max: perDay },
  ]);
}
