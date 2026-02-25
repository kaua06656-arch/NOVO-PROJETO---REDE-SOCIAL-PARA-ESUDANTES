/**
 * Strips HTML tags from a string to prevent stored XSS.
 * React escapes output by default, but this protects against
 * future use of dangerouslySetInnerHTML or third-party renderers.
 */
export function sanitize(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim()
}

/**
 * Sanitizes all string values in an object (shallow, one level).
 */
export function sanitizeFields<T extends Record<string, unknown>>(obj: T): T {
    const result = { ...obj }
    for (const key in result) {
        if (typeof result[key] === 'string') {
            (result as Record<string, unknown>)[key] = sanitize(result[key] as string)
        }
    }
    return result
}
