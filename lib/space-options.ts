// Fixed value lists for coworking spaces, shared by the CMS, the import and the site.
// Mirrors the "Lists" tab of the operators spreadsheet.

const options = <T extends string>(entries: readonly (readonly [T, string])[]) => entries.map(([value, label]) => ({ value, label }))

export const workspaceTypes = options([
  ['hot-desk', 'Hot desk'],
  ['fixed-desk', 'Fixed desk'],
  ['cubicle-desk', 'Cubicle desk'],
  ['private-office', 'Private office'],
  ['meeting-room', 'Meeting room'],
  ['conference-room', 'Conference room'],
  ['seminar-room', 'Seminar room'],
  ['event-space', 'Event space'],
  ['phone-booth', 'Phone / Zoom booth'],
  ['capsule', 'Capsule'],
  ['package', 'Package'],
  ['virtual-office', 'Virtual office'],
  ['other', 'Other'],
] as const)
export type WorkspaceType = (typeof workspaceTypes)[number]['value']

// Desk-style options are used for the "from ₼X / day" price on cards
export const deskTypes: WorkspaceType[] = ['hot-desk', 'fixed-desk', 'cubicle-desk']
export const roomTypes: WorkspaceType[] = ['meeting-room', 'conference-room', 'seminar-room', 'event-space', 'capsule', 'phone-booth']

export const districts = options([
  ['binagadi', 'Binagadi'], ['garadagh', 'Garadagh'], ['khatai', 'Khatai'], ['khazar', 'Khazar'], ['narimanov', 'Narimanov'], ['nasimi', 'Nasimi'],
  ['nizami', 'Nizami'], ['pirallahi', 'Pirallahi'], ['sabail', 'Sabail'], ['sabunchu', 'Sabunchu'], ['surakhani', 'Surakhani'], ['yasamal', 'Yasamal'],
] as const)

export const currencies = options([['AZN', 'AZN'], ['USD', 'USD'], ['EUR', 'EUR']] as const)
export const currencySymbol: Record<string, string> = { AZN: '₼', USD: '$', EUR: '€' }

export const days = options([
  ['every-day', 'Every day'], ['weekdays', 'Weekdays (Mon–Fri)'], ['weekends', 'Weekends (Sat–Sun)'],
  ['monday', 'Monday'], ['tuesday', 'Tuesday'], ['wednesday', 'Wednesday'], ['thursday', 'Thursday'], ['friday', 'Friday'], ['saturday', 'Saturday'], ['sunday', 'Sunday'],
  ['public-holidays', 'Public holidays'],
] as const)

export const infoTopics = options([
  ['house-rules', 'House rules'], ['parking', 'Parking'], ['payment-methods', 'Payment methods'], ['cancellation-policy', 'Cancellation policy'],
  ['discounts-packages', 'Discounts & packages'], ['accessibility', 'Accessibility'], ['access-security', 'Access & security'], ['locations', 'Locations'],
  ['pricing-notes', 'Pricing notes'], ['events-community', 'Events & community'], ['pets', 'Pets'], ['food-drink-policy', 'Food & drink policy'], ['other', 'Other'],
] as const)

export const amenityCategories = options([
  ['connectivity', 'Connectivity & tech'], ['food-drink', 'Food & drink'], ['comfort', 'Comfort & facilities'], ['services', 'Services'],
  ['access-security', 'Access & security'], ['transport-parking', 'Transport & parking'], ['accessibility', 'Accessibility'], ['other', 'Other'],
] as const)

export const photoCategories = options([
  ['hot-desk', 'Hot desk'], ['fixed-desk', 'Fixed desk'], ['cubicle-desk', 'Cubicle desk'], ['private-office', 'Private office'],
  ['meeting-room', 'Meeting room'], ['conference-room', 'Conference room'], ['event-space', 'Event space'], ['phone-booth', 'Phone / Zoom booth'],
  ['capsule', 'Capsule'], ['common-area', 'Common area / lounge'], ['kitchen-cafe', 'Kitchen / café'], ['reception', 'Reception'],
  ['building-exterior', 'Building exterior'], ['other', 'Other'],
] as const)

export const labelOf = (list: readonly { value: string; label: string }[], value: string | null | undefined) => list.find((item) => item.value === value)?.label ?? value ?? ''
