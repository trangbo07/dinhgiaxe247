import { vehicleCatalog } from '@/lib/vehicle-catalog-data'

export type CarSelection = {
  brandId: string
  modelId: string
  year: string
  version: string
  color: string
  mileage: string
}

export function getBrandName(brandId: string) {
  return vehicleCatalog.brands.find((b) => b.id === brandId)?.name ?? brandId
}

export function getModelName(brandId: string, modelId: string) {
  const brand = vehicleCatalog.brands.find((b) => b.id === brandId)
  return brand?.models.find((m) => m.id === modelId)?.name ?? modelId
}

export function getModelsForBrand(brandId: string) {
  return vehicleCatalog.brands.find((b) => b.id === brandId)?.models ?? []
}

export function getYearsForModel(brandId: string, modelId: string) {
  const model = getModelsForBrand(brandId).find((m) => m.id === modelId)
  return model?.years ?? []
}

export function getVersionsForYear(brandId: string, modelId: string, year: string) {
  const yearEnt = getYearsForModel(brandId, modelId).find((y) => String(y.year) === year)
  return yearEnt?.versions ?? []
}

export function getColorsForVersion(
  brandId: string,
  modelId: string,
  year: string,
  version: string
) {
  const ver = getVersionsForYear(brandId, modelId, year).find((v) => v.name === version)
  return ver?.colors ?? []
}

export function formatCarLabel(sel: Partial<CarSelection>) {
  if (!sel.brandId || !sel.modelId) return '—'
  const parts = [
    getBrandName(sel.brandId),
    getModelName(sel.brandId, sel.modelId),
    sel.year,
    sel.version,
    sel.color,
    sel.mileage ? `${Number(sel.mileage).toLocaleString('vi-VN')} km` : null,
  ].filter(Boolean)
  return parts.join(' · ')
}

export { vehicleCatalog }
