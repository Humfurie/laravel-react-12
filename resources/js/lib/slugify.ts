/**
 * Convert text to a URL-friendly slug
 *
 * @param text - The text to convert to a slug
 * @returns A URL-friendly slug string
 *
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("My  Project  2024") // "my-project-2024"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim()
        .substring(0, 255); // Limit length to 255 characters
}
