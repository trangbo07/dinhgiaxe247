export type CompareCarInput = {
  label: string
  brand: string
  model: string
  year: number
  version: string
  color: string
  mileage: number
}

export type CompareValuationSnapshot = {
  price: number
  priceLow: number
  priceHigh: number
  explanation: string
  source?: string
}

export type CompareAdvantage = 'A' | 'B' | 'NGANG'

export type CompareRow = {
  criteria: string
  valueA: string
  valueB: string
  advantage: CompareAdvantage
  gap: string
  explanation: string
}

export type CarCompareReport = {
  verdict: {
    pick: 'A' | 'B' | 'TUY_NHU_CAU'
    headline: string
    summary: string
    priceGapVnd: number
    priceGapLabel: string
  }
  comparisonRows: CompareRow[]
  priceAnalysis: string
  technicalAnalysis: string
  ownershipCost: string
  risks: string[]
  negotiationA: string
  negotiationB: string
  finalAdvice: string
}

export type CompareQuota = {
  used: number
  max: number
  remaining: number
}

export type CarCompareApiResponse = {
  carA: CompareValuationSnapshot
  carB: CompareValuationSnapshot
  report: CarCompareReport
  compareQuota?: CompareQuota
}
