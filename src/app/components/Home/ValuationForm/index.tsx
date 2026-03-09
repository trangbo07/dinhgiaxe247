'use client'

import { useState, useEffect } from 'react'
import data from '../../../../../data.json'

interface Brand { id: string; name: string; models: Model[] }
interface Model { id: string; name: string; years: YearEntry[] }
interface YearEntry { year: number; versions: Version[] }
interface Version { name: string; colors: string[] }

const ValuationForm = () => {
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [years, setYears] = useState<YearEntry[]>([])
  const [versions, setVersions] = useState<Version[]>([])
  const [colors, setColors] = useState<string[]>([])

  const [selectedBrand, setSelectedBrand] = useState('')
  const [selectedModel, setSelectedModel] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedVersion, setSelectedVersion] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [mileage, setMileage] = useState('')
  const [price, setPrice] = useState<number | null>(null)

  useEffect(() => {
    // load brands
    setBrands(data.brands)
  }, [])

  useEffect(() => {
    if (selectedBrand) {
      const brand = brands.find((b) => b.id === selectedBrand)
      setModels(brand ? brand.models : [])
      setSelectedModel('')
      setYears([])
      setVersions([])
      setColors([])
      setSelectedYear('')
      setSelectedVersion('')
      setSelectedColor('')
      setPrice(null)
    }
  }, [selectedBrand, brands])

  useEffect(() => {
    if (selectedModel) {
      const model = models.find((m) => m.id === selectedModel)
      setYears(model ? model.years : [])
      setSelectedYear('')
      setVersions([])
      setColors([])
      setSelectedVersion('')
      setSelectedColor('')
      setPrice(null)
    }
  }, [selectedModel, models])

  useEffect(() => {
    if (selectedYear) {
      const yearEnt = years.find((y) => y.year.toString() === selectedYear)
      setVersions(yearEnt ? yearEnt.versions : [])
      setSelectedVersion('')
      setColors([])
      setSelectedColor('')
      setPrice(null)
    }
  }, [selectedYear, years])

  useEffect(() => {
    if (selectedVersion) {
      const ver = versions.find((v) => v.name === selectedVersion)
      setColors(ver ? ver.colors : [])
      setSelectedColor('')
      setPrice(null)
    }
  }, [selectedVersion, versions])

  const calcPrice = () => {
    // rudimentary algorithm
    let base = 200000000 // some base
    const yearDiff = new Date().getFullYear() - parseInt(selectedYear || '0')
    base -= yearDiff * 10000000
    const km = parseInt(mileage) || 0
    base -= Math.floor(km / 10000) * 2000000
    setPrice(base > 0 ? base : 0)
  }

  return (
    <section className='py-20 bg-white'>
      <div className='container'>
        <h2 className='text-3xl font-bold text-midnight_text mb-8 text-center'>
          Định Giá Xe
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className='w-full border rounded-lg p-3'
            >
              <option value=''>Chọn hãng</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!models.length}
            >
              <option value=''>Chọn mẫu</option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!years.length}
            >
              <option value=''>Chọn năm</option>
              {years.map((y) => (
                <option key={y.year} value={y.year}>
                  {y.year}
                </option>
              ))}
            </select>
            <select
              value={selectedVersion}
              onChange={(e) => setSelectedVersion(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!versions.length}
            >
              <option value=''>Chọn phiên bản</option>
              {versions.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
            </select>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className='w-full border rounded-lg p-3'
              disabled={!colors.length}
            >
              <option value=''>Chọn màu</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type='number'
              placeholder='Quãng đường (km)'
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className='w-full border rounded-lg p-3'
            />
            <button
              className='bg-primary text-white px-6 py-3 rounded-full w-full mt-4'
              onClick={calcPrice}
              disabled={!selectedColor || !mileage}
            >
              Tính giá
            </button>
          </div>
          <div className='flex items-center justify-center'>
            {price !== null && (
              <div className='text-center'>
                <p className='text-xl font-semibold'>Giá ước tính:</p>
                <p className='text-3xl font-bold text-primary'>
                  {price.toLocaleString('vi-VN')} đ
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ValuationForm
