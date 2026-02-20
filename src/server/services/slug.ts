/**
 * Shared slug generation utility.
 * Converts a name to a URL-safe slug and ensures uniqueness
 * within the scope of a menu.
 */

/** Turn any string into a lowercase-hyphenated slug */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';
}

/** Random 4-char suffix */
export function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 6);
}

/** Generate a slug and ensure uniqueness against a list of existing slugs */
export async function uniqueSlug(
  name: string,
  existingSlugsFn: () => Promise<string[]>,
  excludeId?: string,
  excludeSlug?: string,
): Promise<string> {
  const base = toSlug(name);
  const existing = await existingSlugsFn();
  
  // If the current item already has this base slug, keep it
  if (excludeSlug && excludeSlug === base) return base;
  
  // If slug is free, use it
  if (!existing.includes(base)) return base;
  
  // Otherwise try with suffix
  let attempt = `${base}-${randomSuffix()}`;
  let tries = 0;
  while (existing.includes(attempt) && tries < 10) {
    attempt = `${base}-${randomSuffix()}`;
    tries++;
  }
  return attempt;
}
