/**
 * Slug Utility Functions
 *
 * Converts text to URL-friendly slugs for node navigation.
 */

/**
 * Convert text to URL-friendly slug
 *
 * Rules:
 * - Lowercase
 * - Replace spaces with hyphens
 * - Remove special characters (keep only alphanumeric and hyphens)
 * - Remove leading/trailing hyphens
 * - Collapse multiple hyphens into one
 *
 * @param text - Text to convert to slug
 * @returns URL-friendly slug
 *
 * @example
 * textToSlug('Event Loop') // 'event-loop'
 * textToSlug('JavaScript Basics!') // 'javascript-basics'
 * textToSlug('  Multiple   Spaces  ') // 'multiple-spaces'
 */
export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Get node slug from node text
 *
 * Wrapper around textToSlug for semantic clarity.
 *
 * @param nodeText - Node text content
 * @returns URL-friendly slug for the node
 */
export function getNodeSlug(nodeText: string): string {
  return textToSlug(nodeText)
}

