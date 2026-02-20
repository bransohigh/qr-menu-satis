"use strict";
/**
 * Shared slug generation utility.
 * Converts a name to a URL-safe slug and ensures uniqueness
 * within the scope of a menu.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSlug = toSlug;
exports.randomSuffix = randomSuffix;
exports.uniqueSlug = uniqueSlug;
/** Turn any string into a lowercase-hyphenated slug */
function toSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 60) || 'item';
}
/** Random 4-char suffix */
function randomSuffix() {
    return Math.random().toString(36).slice(2, 6);
}
/** Generate a slug and ensure uniqueness against a list of existing slugs */
async function uniqueSlug(name, existingSlugsFn, excludeId, excludeSlug) {
    const base = toSlug(name);
    const existing = await existingSlugsFn();
    // If the current item already has this base slug, keep it
    if (excludeSlug && excludeSlug === base)
        return base;
    // If slug is free, use it
    if (!existing.includes(base))
        return base;
    // Otherwise try with suffix
    let attempt = `${base}-${randomSuffix()}`;
    let tries = 0;
    while (existing.includes(attempt) && tries < 10) {
        attempt = `${base}-${randomSuffix()}`;
        tries++;
    }
    return attempt;
}
//# sourceMappingURL=slug.js.map