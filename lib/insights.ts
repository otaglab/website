// Insights categories, languages and URL helpers shared by the CMS and the site

export const postCategories = [
  { value: 'news', label: 'News', segment: 'news' },
  { value: 'event', label: 'Event', segment: 'events' },
  { value: 'blog', label: 'Blog', segment: 'blog' },
] as const

export type PostCategory = (typeof postCategories)[number]['value']

// The language a post is written in. When the site gets /az and /ru versions,
// each locale can list the posts written in its language.
export const postLanguages = [
  { value: 'en', label: 'EN', name: 'English' },
  { value: 'az', label: 'AZ', name: 'Azərbaycanca' },
  { value: 'ru', label: 'RU', name: 'Русский' },
] as const

export type PostLanguage = (typeof postLanguages)[number]['value']

export function categoryFromSegment(segment: string) {
  return postCategories.find((category) => category.segment === segment)
}

export function postPath(post: { category: PostCategory; slug: string }) {
  const category = postCategories.find((item) => item.value === post.category)
  return `/insights/${category?.segment ?? post.category}/${post.slug}`
}

const transliteration: Record<string, string> = {
  ə: 'e', ı: 'i', ğ: 'g', ş: 's', ç: 'c', ö: 'o', ü: 'u',
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

// URL-safe slug from an English, Azerbaijani or Russian title
export function slugify(text: string) {
  return text
    .toLowerCase()
    .split('')
    .map((char) => transliteration[char] ?? char)
    .join('')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
