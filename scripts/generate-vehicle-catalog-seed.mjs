import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dataPath = resolve(rootDir, 'data.json')
const extraDataPath = resolve(rootDir, 'data.catalog.extra.json')
const outputPath = resolve(rootDir, 'supabase', 'seed_vehicle_catalog.sql')

const raw = await readFile(dataPath, 'utf8')
const extraRaw = await readFile(extraDataPath, 'utf8')
const baseCatalog = JSON.parse(raw)
const extraCatalog = JSON.parse(extraRaw)

function mergeVersions(existingVersions, extraVersions) {
  const merged = [...existingVersions]
  const indexByName = new Map(merged.map((version, index) => [version.name, index]))
  for (const extraVersion of extraVersions) {
    const index = indexByName.get(extraVersion.name)
    if (index == null) {
      merged.push(extraVersion)
      continue
    }
    merged[index] = {
      ...merged[index],
      colors: [...new Set([...(merged[index].colors ?? []), ...(extraVersion.colors ?? [])])],
    }
  }
  return merged
}

function mergeYears(existingYears, extraYears) {
  const merged = [...existingYears]
  const indexByYear = new Map(merged.map((yearEntry, index) => [yearEntry.year, index]))
  for (const extraYear of extraYears) {
    const index = indexByYear.get(extraYear.year)
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

function mergeCatalog(base, extra) {
  const brands = base.brands.map((brand) => {
    const extraBrand = extra.brands.find((candidate) => candidate.id === brand.id)
    if (!extraBrand) return brand
    const models = [...brand.models]
    const indexById = new Map(models.map((model, index) => [model.id, index]))
    for (const extraModel of extraBrand.models ?? []) {
      const index = indexById.get(extraModel.id)
      if (index == null) {
        models.push(extraModel)
        continue
      }
      models[index] = {
        ...models[index],
        years: mergeYears(models[index].years ?? [], extraModel.years ?? []),
      }
    }
    return { ...brand, models }
  })

  for (const extraBrand of extra.brands ?? []) {
    if (!brands.some((brand) => brand.id === extraBrand.id)) {
      brands.push(extraBrand)
    }
  }

  return { brands }
}

const catalog = mergeCatalog(baseCatalog, extraCatalog)
const catalogJson = JSON.stringify(catalog, null, 2)

const sql = `-- Generated from data.json
-- Source hierarchy: brand -> model -> year -> version -> color
-- Generation is mapped 1:1 from model because the source JSON does not expose a separate generation field.

do $catalog_seed$
declare
  catalog jsonb := $json$
${catalogJson}
$json$::jsonb;
begin
  insert into public.brands (name)
  select distinct brand_item->>'name'
  from jsonb_array_elements(coalesce(catalog->'brands', '[]'::jsonb)) as brand_item
  on conflict (name) do nothing;

  insert into public.car_models (brand_id, name)
  select distinct b.id, model_item->>'name'
  from jsonb_array_elements(coalesce(catalog->'brands', '[]'::jsonb)) as brand_item
  cross join lateral jsonb_array_elements(coalesce(brand_item->'models', '[]'::jsonb)) as model_item
  join public.brands b on b.name = brand_item->>'name'
  on conflict (brand_id, name) do nothing;

  insert into public.car_generations (model_id, name)
  select distinct m.id, model_item->>'name'
  from jsonb_array_elements(coalesce(catalog->'brands', '[]'::jsonb)) as brand_item
  cross join lateral jsonb_array_elements(coalesce(brand_item->'models', '[]'::jsonb)) as model_item
  join public.brands b on b.name = brand_item->>'name'
  join public.car_models m on m.brand_id = b.id and m.name = model_item->>'name'
  on conflict (model_id, name) do nothing;

  insert into public.car_versions (generation_id, name)
  select distinct g.id, version_item->>'name'
  from jsonb_array_elements(coalesce(catalog->'brands', '[]'::jsonb)) as brand_item
  cross join lateral jsonb_array_elements(coalesce(brand_item->'models', '[]'::jsonb)) as model_item
  cross join lateral jsonb_array_elements(coalesce(model_item->'years', '[]'::jsonb)) as year_item
  cross join lateral jsonb_array_elements(coalesce(year_item->'versions', '[]'::jsonb)) as version_item
  join public.brands b on b.name = brand_item->>'name'
  join public.car_models m on m.brand_id = b.id and m.name = model_item->>'name'
  join public.car_generations g on g.model_id = m.id and g.name = model_item->>'name'
  on conflict (generation_id, name) do nothing;

  insert into public.version_years (version_id, year)
  select distinct v.id, (year_item->>'year')::int
  from jsonb_array_elements(coalesce(catalog->'brands', '[]'::jsonb)) as brand_item
  cross join lateral jsonb_array_elements(coalesce(brand_item->'models', '[]'::jsonb)) as model_item
  cross join lateral jsonb_array_elements(coalesce(model_item->'years', '[]'::jsonb)) as year_item
  cross join lateral jsonb_array_elements(coalesce(year_item->'versions', '[]'::jsonb)) as version_item
  join public.brands b on b.name = brand_item->>'name'
  join public.car_models m on m.brand_id = b.id and m.name = model_item->>'name'
  join public.car_generations g on g.model_id = m.id and g.name = model_item->>'name'
  join public.car_versions v on v.generation_id = g.id and v.name = version_item->>'name'
  on conflict (version_id, year) do nothing;

  insert into public.version_colors (version_id, color)
  select distinct v.id, color_item
  from jsonb_array_elements(coalesce(catalog->'brands', '[]'::jsonb)) as brand_item
  cross join lateral jsonb_array_elements(coalesce(brand_item->'models', '[]'::jsonb)) as model_item
  cross join lateral jsonb_array_elements(coalesce(model_item->'years', '[]'::jsonb)) as year_item
  cross join lateral jsonb_array_elements(coalesce(year_item->'versions', '[]'::jsonb)) as version_item
  cross join lateral jsonb_array_elements_text(coalesce(version_item->'colors', '[]'::jsonb)) as color_item
  join public.brands b on b.name = brand_item->>'name'
  join public.car_models m on m.brand_id = b.id and m.name = model_item->>'name'
  join public.car_generations g on g.model_id = m.id and g.name = model_item->>'name'
  join public.car_versions v on v.generation_id = g.id and v.name = version_item->>'name'
  on conflict (version_id, color) do nothing;
end
$catalog_seed$;

`

await writeFile(outputPath, sql, 'utf8')
console.log(`Wrote ${outputPath}`)