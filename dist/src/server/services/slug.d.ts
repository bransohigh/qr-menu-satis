/**
 * Shared slug generation utility.
 * Converts a name to a URL-safe slug and ensures uniqueness
 * within the scope of a menu.
 */
/** Turn any string into a lowercase-hyphenated slug */
export declare function toSlug(name: string): string;
/** Random 4-char suffix */
export declare function randomSuffix(): string;
/** Generate a slug and ensure uniqueness against a list of existing slugs */
export declare function uniqueSlug(name: string, existingSlugsFn: () => Promise<string[]>, excludeId?: string, excludeSlug?: string): Promise<string>;
//# sourceMappingURL=slug.d.ts.map