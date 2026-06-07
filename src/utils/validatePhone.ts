export function normalizeVNPhone(raw: string): string {
  return raw.trim().replace(/\s|-|\./g, '').replace(/^\+84/, '0')
}

// 10 digits, second digit 3-9 — covers all Vietnamese carrier prefixes (Viettel, Mobifone, Vinaphone, Vietnamobile, Gmobile, Reddi)
export function isValidVNPhone(raw: string): boolean {
  return /^0[3-9][0-9]{8}$/.test(normalizeVNPhone(raw))
}
