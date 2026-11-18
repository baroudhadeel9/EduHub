/**
 * Sanitize external URLs to prevent Stored XSS via javascript: or data: URIs
 */
export function sanitizeExternalUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return trimmed;
  }
  return undefined;
}
