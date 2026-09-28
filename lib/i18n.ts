export const locales = ['az', 'ru', 'en'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export const languageNames: Record<Locale, string> = {
  az: 'AZ',
  ru: 'RU',
  en: 'EN',
}

export const translations = {
  az: {
    language: 'Dil',
    search: 'Məkanları axtar',
    location: 'Məkan',
    date: 'Tarix',
    workspaceType: 'İş məkanı növü',
    anyWorkspace: 'İstənilən iş məkanı',
    today: 'Bu gün',
    tomorrow: 'Sabah',
    verified: 'Təsdiqlənib',
    from: 'Başlanğıc qiymət',
    perDay: '/ gün',
  },
  ru: {
    language: 'Язык',
    search: 'Найти пространство',
    location: 'Место',
    date: 'Дата',
    workspaceType: 'Тип пространства',
    anyWorkspace: 'Любое пространство',
    today: 'Сегодня',
    tomorrow: 'Завтра',
    verified: 'Проверено',
    from: 'От',
    perDay: '/ день',
  },
  en: {
    language: 'Language',
    search: 'Search spaces',
    location: 'Location',
    date: 'Date',
    workspaceType: 'Workspace type',
    anyWorkspace: 'Any workspace',
    today: 'Today',
    tomorrow: 'Tomorrow',
    verified: 'Verified',
    from: 'From',
    perDay: '/ day',
  },
} satisfies Record<Locale, Record<string, string>>

export function getTranslations(locale: Locale) {
  return translations[locale] ?? translations.en
}
