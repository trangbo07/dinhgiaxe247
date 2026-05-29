import { normalizeName } from '@/lib/vehicle-recognition'

export type CatalogBrand = {
  id: string
  name: string
  models: CatalogModel[]
}

export type CatalogModel = {
  id: string
  name: string
  years: { year: number; versions: { name: string; colors: string[] }[] }[]
}

function scoreName(query: string, candidate: string) {
  const q = normalizeName(query)
  const c = normalizeName(candidate)
  if (!q || !c) return 0
  if (q === c) return 100
  if (c.includes(q) || q.includes(c)) return 80
  const qParts = q.split(' ')
  const hits = qParts.filter((p) => p.length > 1 && c.includes(p)).length
  return hits * 25
}

export function findBrand(brands: CatalogBrand[], name: string): CatalogBrand | null {
  let best: CatalogBrand | null = null
  let bestScore = 0
  for (const b of brands) {
    const s = scoreName(name, b.name)
    if (s > bestScore) {
      bestScore = s
      best = b
    }
  }
  return bestScore >= 50 ? best : null
}

export function findModel(brand: CatalogBrand, modelName: string): CatalogModel | null {
  let best: CatalogModel | null = null
  let bestScore = 0
  for (const m of brand.models) {
    const s = scoreName(modelName, m.name)
    if (s > bestScore) {
      bestScore = s
      best = m
    }
  }
  return bestScore >= 40 ? best : null
}

export function findVersion(
  versions: { name: string; colors: string[] }[],
  versionName?: string
) {
  if (!versionName) return versions[0] ?? null
  let best = versions[0] ?? null
  let bestScore = 0
  for (const v of versions) {
    const s = scoreName(versionName, v.name)
    if (s > bestScore) {
      bestScore = s
      best = v
    }
  }
  return bestScore >= 35 ? best : versions[0] ?? null
}
