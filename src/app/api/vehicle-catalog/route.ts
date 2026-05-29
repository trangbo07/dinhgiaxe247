import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/utils/supabase'
import type {
  VehicleBrand,
  VehicleColor,
  VehicleGeneration,
  VehicleModel,
  VehicleVersion,
  VehicleYear,
} from '@/types/vehicle'

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const [brandsRes, modelsRes, generationsRes, versionsRes, yearsRes, colorsRes] = await Promise.all([
      supabase.from('brands').select('id,name').order('name', { ascending: true }),
      supabase.from('car_models').select('id,brand_id,name').order('name', { ascending: true }),
      supabase.from('car_generations').select('id,model_id,name').order('name', { ascending: true }),
      supabase.from('car_versions').select('id,generation_id,name').order('name', { ascending: true }),
      supabase.from('version_years').select('id,version_id,year').order('year', { ascending: false }),
      supabase.from('version_colors').select('id,version_id,color').order('color', { ascending: true }),
    ])

    if (brandsRes.error) throw brandsRes.error
    if (modelsRes.error) throw modelsRes.error
    if (generationsRes.error) throw generationsRes.error
    if (versionsRes.error) throw versionsRes.error
    if (yearsRes.error) throw yearsRes.error
    if (colorsRes.error) throw colorsRes.error

    const brands = (brandsRes.data ?? []) as VehicleBrand[]
    const models = (modelsRes.data ?? []) as VehicleModel[]
    const generations = (generationsRes.data ?? []) as VehicleGeneration[]
    const versions = (versionsRes.data ?? []) as VehicleVersion[]
    const years = (yearsRes.data ?? []) as VehicleYear[]
    const colors = (colorsRes.data ?? []) as VehicleColor[]

    return NextResponse.json({ brands, models, generations, versions, years, colors })
  } catch (err: unknown) {
    console.error('vehicle catalog api error', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}