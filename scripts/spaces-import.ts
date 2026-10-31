// Imports coworking spaces from the operators spreadsheet into the CMS.
// Usage: pnpm spaces:import "<path to .xlsx>"
// Safe to re-run: spaces are matched by Space ID (BAK-001…), photos by their Drive link, amenities by name.
import config from '@payload-config'
import ExcelJS from 'exceljs'
import { getPayload } from 'payload'
import sharp from 'sharp'
import { amenityCategories, days, districts, infoTopics, photoCategories, workspaceTypes } from '@/lib/space-options'

type Row = Record<string, string>
type Option = { value: string; label: string }

const file = process.argv[2]
if (!file) {
  console.error('Usage: pnpm spaces:import "<path to .xlsx>"')
  process.exit(1)
}

const warnings = new Map<string, string[]>()
const warn = (code: string, message: string) => warnings.set(code, [...(warnings.get(code) ?? []), message])

// ---------- Reading the workbook ----------

function cellText(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object') {
    if ('result' in value) return cellText(value.result as ExcelJS.CellValue)
    if ('hyperlink' in value && value.hyperlink) return String(value.hyperlink)
    if ('richText' in value) return value.richText.map((part) => part.text).join('')
    if ('text' in value) return cellText(value.text as ExcelJS.CellValue)
    return ''
  }
  return String(value).trim()
}

// Rows as objects keyed by header name (without the " *" required marker)
function readSheet(workbook: ExcelJS.Workbook, name: string): Row[] {
  const sheet = workbook.getWorksheet(name)
  if (!sheet) throw new Error(`Sheet "${name}" not found`)
  const headers = (sheet.getRow(1).values as ExcelJS.CellValue[]).map((value) => cellText(value).replace(/\s*\*$/, ''))
  const rows: Row[] = []
  sheet.eachRow((row, index) => {
    if (index === 1) return
    const values = row.values as ExcelJS.CellValue[]
    const record: Row = {}
    headers.forEach((header, column) => { if (header) record[header] = cellText(values[column]).replace(/\s+/g, ' ').trim() })
    // Times are stored as dates on 1899-12-30
    for (const key of ['Opens', 'Closes']) {
      const raw = values[headers.indexOf(key)]
      if (raw instanceof Date) record[key] = raw.toISOString().slice(11, 16)
    }
    if (record['Space ID'] && record['Space ID'] !== 'BAK-000') rows.push(record)
  })
  return rows
}

// ---------- Value mapping ----------

const norm = (value: string) => value.toLowerCase().replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()
function pick(list: readonly Option[], input: string, aliases: Record<string, string> = {}) {
  if (!input) return undefined
  return aliases[norm(input)] ?? list.find((item) => norm(item.label) === norm(input) || item.value === norm(input))?.value
}

const workspaceAliases: Record<string, string> = { desk: 'hot-desk', 'dedicated desk': 'fixed-desk', 'desk + capsul': 'package', 'desk + capsule': 'package', capsul: 'capsule', 'seminar room': 'seminar-room' }
const yes = (value: string) => norm(value) === 'yes'
const no = (value: string) => norm(value) === 'no'
const num = (value: string) => (value && Number.isFinite(Number(value)) ? Number(value) : undefined)

// "+050 352 25 25" or "050…" → "+994 50 352 25 25"
function phone(code: string, value: string) {
  if (!value) return undefined
  const fixed = value.replace(/^\+?0(?=\d)/, '+994 ')
  if (fixed !== value) warn(code, `Phone "${value}" changed to "${fixed}" — please confirm`)
  return /^\+[0-9][0-9 ()-]{6,20}$/.test(fixed) ? fixed : (warn(code, `Phone "${value}" is not valid and was left empty`), undefined)
}

const url = (value: string) => (/^https?:\/\//i.test(value) ? value : undefined)

// ---------- Coordinates from Google Maps links ----------

function coordsIn(text: string): [number, number] | null {
  const decoded = decodeURIComponent(text)
  const match = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ?? decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) ?? decoded.match(/[?&](?:q|ll|query|center)=(-?\d+\.\d+),\s*(-?\d+\.\d+)/)
  if (!match) return null
  const [lat, lng] = [Number(match[1]), Number(match[2])]
  // Sanity check: Azerbaijan
  return lat > 38 && lat < 42.5 && lng > 44 && lng < 51 ? [lng, lat] : null
}

async function coordsFromMapsLink(link: string): Promise<[number, number] | null> {
  let current = link
  for (let hop = 0; hop < 6; hop++) {
    const found = coordsIn(current)
    if (found) return found
    const res = await fetch(current, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (OtagLab import)' } })
    const next = res.headers.get('location')
    if (!next) return coordsIn(await res.text())
    current = new URL(next, current).toString()
  }
  return null
}

// ---------- Main ----------

const payload = await getPayload({ config })
const workbook = new ExcelJS.Workbook()
await workbook.xlsx.readFile(file)

const spaces = readSheet(workbook, 'Spaces')
const optionRows = readSheet(workbook, 'Workspace Options')
const amenityRows = readSheet(workbook, 'Amenities')
const hourRows = readSheet(workbook, 'Opening Hours')
const photoRows = readSheet(workbook, 'Photos')
const infoRows = readSheet(workbook, 'Additional Info')
const forSpace = (rows: Row[], code: string) => rows.filter((row) => row['Space ID'] === code)

async function amenityId(name: string, categoryLabel: string) {
  const existing = await payload.find({ collection: 'amenities', where: { name: { equals: name } }, limit: 1, locale: 'en' })
  if (existing.docs[0]) return existing.docs[0].id
  const category = pick(amenityCategories, categoryLabel) ?? 'other'
  return (await payload.create({ collection: 'amenities', data: { name, category: category as never }, locale: 'en' })).id
}

async function photoId(code: string, link: string, alt: string) {
  const existing = await payload.find({ collection: 'media', where: { sourceUrl: { equals: link } }, limit: 1 })
  if (existing.docs[0]) return existing.docs[0].id
  if (/\/folders\//.test(link)) return warn(code, `Photo folder link skipped (use links to single photos): ${link}`), null
  const id = link.match(/\/file\/d\/([\w-]+)/)?.[1] ?? link.match(/[?&]id=([\w-]+)/)?.[1]
  if (!id) return warn(code, `Not a Google Drive file link: ${link}`), null
  const res = await fetch(`https://drive.usercontent.google.com/download?id=${id}&export=download&confirm=t`)
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) return warn(code, `Could not download photo (is it shared "Anyone with the link"?): ${link}`), null
  // Resize to keep uploads small and strip camera metadata
  const data = await sharp(Buffer.from(await res.arrayBuffer())).rotate().resize({ width: 2400, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer()
  const doc = await payload.create({ collection: 'media', data: { alt, sourceUrl: link }, file: { data, mimetype: 'image/jpeg', name: `${code.toLowerCase()}-${id.slice(0, 8)}.jpg`, size: data.length } })
  return doc.id
}

let imported = 0
for (const row of spaces) {
  const code = row['Space ID']
  const name = row['Name']
  console.log(`\n${code} ${name}`)

  const lat = num(row['Latitude'])
  const lng = num(row['Longitude'])
  let location: [number, number] | undefined = lat !== undefined && lng !== undefined ? [lng, lat] : undefined
  if (!location && url(row['Google Maps link'])) location = (await coordsFromMapsLink(row['Google Maps link'])) ?? undefined
  if (!location) warn(code, 'No coordinates — set the location in the CMS so it shows on the map')
  else if (lat === undefined) warn(code, `Coordinates taken from the Google Maps link (${location[1]}, ${location[0]}) — check the pin`)

  const options = forSpace(optionRows, code).map((option) => {
    const type = pick(workspaceTypes, option['Workspace type'], workspaceAliases)
    if (!type) warn(code, `Unknown workspace type "${option['Workspace type']}" saved as Other`)
    const prices = { priceHour: num(option['Price / hour']), priceEvening: num(option['Price / hour – evening']), priceDay: num(option['Price / day']), priceWeek: num(option['Price / week']), priceMonth: num(option['Price / month']) }
    if (Object.values(prices).every((value) => value === undefined)) warn(code, `"${option['Option name'] || option['Workspace type']}" has no price (shown as "Price on request")`)
    return {
      type: (type ?? 'other') as never,
      name: option['Option name'] || undefined,
      description: option['Description'] || undefined,
      seats: num(option['Seats per unit']),
      units: num(option['Number of units']),
      currency: (option['Currency'] || 'AZN') as never,
      ...prices,
      vatIncluded: no(option['VAT included']) ? false : yes(option['VAT included']) ? true : undefined,
      available: no(option['Available now']) ? false : true,
      minimumBooking: option['Minimum booking'] || undefined,
      internalNote: option['Notes'] || undefined,
    }
  })

  const amenities = []
  for (const amenity of forSpace(amenityRows, code)) {
    if (!amenity['Amenity']) continue
    amenities.push({ amenity: await amenityId(amenity['Amenity'], amenity['Category (auto)']), cost: (norm(amenity['Cost']) === 'paid extra' ? 'paid' : 'included') as never, details: amenity['Details'] || undefined })
  }

  const hours = forSpace(hourRows, code).map((hour) => ({
    day: (pick(days, hour['Day']) ?? 'every-day') as never,
    appliesTo: (pick(workspaceTypes, hour['Applies to'], workspaceAliases) ?? null) as never,
    opens: hour['Opens'] || undefined,
    closes: hour['Closes'] || undefined,
    open24h: yes(hour['Open 24h']),
    closed: yes(hour['Closed']),
    note: hour['Notes'] || undefined,
  }))

  const infos = forSpace(infoRows, code).filter((info) => info['Details (EN)'])
  const info = infos.map((item) => ({ topic: (pick(infoTopics, item['Topic']) ?? 'other') as never, details: item['Details (EN)'], showOnWebsite: !no(item['Show on website']) }))

  const photos = []
  for (const photo of forSpace(photoRows, code)) {
    const link = photo['Google Drive link']
    if (!link) { warn(code, `Photo row "${photo['Photo of']} ${photo['Specific item']}" has no link`); continue }
    const image = await photoId(code, link, [name, photo['Specific item'] || photo['Photo of']].filter(Boolean).join(' — '))
    if (!image) continue
    const item = photo['Specific item']
    const category = norm(photo['Photo of']) === 'desks' ? (/stable|fixed|dedicated/i.test(item) ? 'fixed-desk' : 'hot-desk') : pick(photoCategories, photo['Photo of'], { capsules: 'capsule', 'common area': 'common-area' })
    photos.push({ image, category: (category ?? 'other') as never, item: item || undefined, isCover: yes(photo['Cover photo']), caption: photo['Caption (EN)'] || undefined })
  }
  if (!photos.length) warn(code, 'No photos imported')

  const email = row['Email']?.trim()
  if (!email) warn(code, 'No email — booking requests only reach OtagLab')
  const district = pick(districts, row['District'])
  if (row['District'] && !district) warn(code, `Unknown district "${row['District']}"`)

  const data = {
    name,
    code,
    // Filled in from the name by the CMS
    slug: '',
    tagline: row['Tagline (EN)'] || undefined,
    about: row['About (EN)'],
    capacity: num(row['Total capacity (seats)']),
    city: row['City'] || 'Baku',
    district: district as never,
    address: row['Street address'],
    floor: row['Floor / office'] || undefined,
    metro: row['Nearest metro'] || undefined,
    landmark: row['Landmark / how to find'] || undefined,
    location,
    googleMapsUrl: url(row['Google Maps link']),
    phone: phone(code, row['Phone']),
    whatsapp: phone(code, row['WhatsApp']),
    email: email || undefined,
    website: url(row['Website']),
    instagram: url(row['Instagram']),
    facebook: url(row['Facebook']),
    linkedin: url(row['LinkedIn']),
    options,
    amenities,
    hours,
    info,
    photos,
    contactPerson: row['Contact person'] || undefined,
    internalNotes: row['Internal notes (not published)'] || undefined,
    // Everything except paused spaces goes live straight away
    _status: (norm(row['Status']) === 'paused' ? 'draft' : 'published') as 'draft' | 'published',
  }

  const existing = await payload.find({ collection: 'spaces', where: { code: { equals: code } }, limit: 1, draft: true, locale: 'en' })
  const saved = existing.docs[0]
    ? await payload.update({ collection: 'spaces', id: existing.docs[0].id, data, locale: 'en' })
    : await payload.create({ collection: 'spaces', data, locale: 'en' })

  // Azerbaijani and Russian texts, matched to the saved rows by position
  for (const locale of ['az', 'ru'] as const) {
    const suffix = locale.toUpperCase()
    const about = row[`About (${suffix})`]
    const translatedInfo = infos.map((item) => item[`Details (${suffix})`])
    if (!about && !translatedInfo.some(Boolean)) continue
    await payload.update({
      collection: 'spaces',
      id: saved.id,
      locale,

      data: { about: about || undefined, info: (saved.info ?? []).map((item, index) => ({ id: item.id, topic: item.topic, showOnWebsite: item.showOnWebsite, details: translatedInfo[index] || undefined })), _status: data._status },
    })
  }

  imported++
  console.log(`  ${existing.docs[0] ? 'updated' : 'created'} /spaces/${saved.slug} (${data._status}) — ${options.length} options, ${amenities.length} amenities, ${hours.length} hours, ${photos.length} photos`)
}

console.log(`\nImported ${imported} spaces.`)
if (warnings.size) {
  console.log('\nTo check in the CMS:')
  for (const [code, list] of warnings) for (const message of list) console.log(`  ${code}: ${message}`)
}
await payload.destroy()
process.exit(0)
