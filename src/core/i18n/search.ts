/** Lowercases and strips Polish diacritics (NFD handles most letters, ł needs a manual map). */
export function normalizeForSearch(text: string): string {
  return text.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '');
}

export function matchesQuery(text: string, query: string): boolean {
  return normalizeForSearch(text).includes(normalizeForSearch(query));
}
