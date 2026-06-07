import baseCatalog from '../../data.json'
import extraCatalog from '../../data.catalog.extra.json'

type CatalogVersion = { name: string; colors: string[] }
type CatalogYear = { year: number; versions: CatalogVersion[] }
type CatalogModel = { id: string; name: string; years: CatalogYear[] }
type CatalogBrand = { id: string; name: string; models: CatalogModel[] }
type CatalogFile = { brands: CatalogBrand[] }

function mergeVersions(existingVersions: CatalogVersion[], extraVersions: CatalogVersion[]) {
  const merged = [...existingVersions]
  const versionIndex = new Map(merged.map((version, index) => [version.name, index]))

  for (const extraVersion of extraVersions) {
    const index = versionIndex.get(extraVersion.name)
    if (index == null) {
      merged.push(extraVersion)
      continue
    }
    merged[index] = {
      ...merged[index],
      colors: Array.from(new Set([...(merged[index].colors ?? []), ...(extraVersion.colors ?? [])])),
    }
  }

  return merged
}

function mergeYears(existingYears: CatalogYear[], extraYears: CatalogYear[]) {
  const merged = [...existingYears]
  const yearIndex = new Map(merged.map((yearEntry, index) => [yearEntry.year, index]))

  for (const extraYear of extraYears) {
    const index = yearIndex.get(extraYear.year)
    if (index == null) {
      merged.push(extraYear)
      continue
    }
    merged[index] = {
      ...merged[index],
      versions: mergeVersions(merged[index].versions ?? [], extraYear.versions ?? []),
    }
  }

  return merged
}

function mergeModels(existingModels: CatalogModel[], extraModels: CatalogModel[]) {
  const merged = [...existingModels]
  const modelIndex = new Map(merged.map((model, index) => [model.id, index]))

  for (const extraModel of extraModels) {
    const index = modelIndex.get(extraModel.id)
    if (index == null) {
      merged.push(extraModel)
      continue
    }
    merged[index] = {
      ...merged[index],
      years: mergeYears(merged[index].years ?? [], extraModel.years ?? []),
    }
  }

  return merged
}

function mergeCatalog(base: CatalogFile, extra: CatalogFile): CatalogFile {
  const brands = base.brands.map((brand) => {
    const extraBrand = extra.brands.find((candidate) => candidate.id === brand.id)
    if (!extraBrand) return brand
    return {
      ...brand,
      models: mergeModels(brand.models ?? [], extraBrand.models ?? []),
    }
  })

  for (const extraBrand of extra.brands) {
    if (!brands.some((brand) => brand.id === extraBrand.id)) {
      brands.push(extraBrand)
    }
  }

  return { brands }
}

export const vehicleCatalog = mergeCatalog(baseCatalog as unknown as CatalogFile, extraCatalog as unknown as CatalogFile)
