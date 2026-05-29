export type BusinessProfile = {
  companyName: string
  contactName: string
  phone: string
  address: string
  taxCode: string
  website: string
  email: string
  notifyNewLeads: boolean
  notifyEmail: string
  accountType: string
  createdAt: string | null
}

export function profileFromMetadata(
  meta: Record<string, unknown> | undefined,
  email: string,
  createdAt?: string | null
): BusinessProfile {
  const m = meta ?? {}
  const companyName =
    (typeof m.company_name === "string" && m.company_name) ||
    (typeof m.full_name === "string" && m.full_name) ||
    ""

  return {
    companyName,
    contactName:
      (typeof m.contact_name === "string" && m.contact_name) || "",
    phone: (typeof m.phone === "string" && m.phone) || "",
    address: (typeof m.address === "string" && m.address) || "",
    taxCode: (typeof m.tax_code === "string" && m.tax_code) || "",
    website: (typeof m.website === "string" && m.website) || "",
    email,
    notifyNewLeads: m.notify_new_leads !== false,
    notifyEmail:
      (typeof m.notify_email === "string" && m.notify_email) || email,
    accountType:
      (typeof m.account_type === "string" && m.account_type) || "business",
    createdAt: createdAt ?? null,
  }
}

export function metadataPatchFromProfile(
  current: Record<string, unknown> | undefined,
  patch: Partial<BusinessProfile>
): Record<string, unknown> {
  const next = { ...(current ?? {}) }

  if (patch.companyName !== undefined) {
    next.company_name = patch.companyName.trim()
    next.full_name = patch.companyName.trim()
  }
  if (patch.contactName !== undefined) {
    next.contact_name = patch.contactName.trim()
  }
  if (patch.phone !== undefined) next.phone = patch.phone.trim()
  if (patch.address !== undefined) next.address = patch.address.trim()
  if (patch.taxCode !== undefined) next.tax_code = patch.taxCode.trim()
  if (patch.website !== undefined) next.website = patch.website.trim()
  if (patch.notifyNewLeads !== undefined) {
    next.notify_new_leads = patch.notifyNewLeads
  }
  if (patch.notifyEmail !== undefined) {
    next.notify_email = patch.notifyEmail.trim()
  }

  next.account_type = "business"
  return next
}
