export type VehicleBrand = {
  id: string
  name: string
}

export type VehicleModel = {
  id: string
  brand_id: string
  name: string
}

export type VehicleGeneration = {
  id: string
  model_id: string
  name: string
}

export type VehicleVersion = {
  id: string
  generation_id: string
  name: string
}

export type VehicleYear = {
  id: string
  version_id: string
  year: number
}

export type VehicleColor = {
  id: string
  version_id: string
  color: string
}

export type VehicleHierarchyNode = {
  brandId: string
  brandName: string
  modelId: string
  modelName: string
  generationId: string
  generationName: string
  versionId: string
  versionName: string
  year: number
  colors: string[]
}

export type VehicleCatalogPayload = {
  brands: VehicleBrand[]
  models: VehicleModel[]
  generations: VehicleGeneration[]
  versions: VehicleVersion[]
  years: VehicleYear[]
  colors: VehicleColor[]
}

export type ValuationIntent = 'sell' | 'buy'

export type ValuationLeadInsert = {
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  intent: ValuationIntent
  phone: string
  generation?: string | null
  version?: string | null
  price?: number | null
  price_low?: number | null
  price_high?: number | null
  source?: string | null
  explanation?: string | null
}