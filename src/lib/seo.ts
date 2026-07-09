export function absoluteUrl(pathOrUrl: string | undefined, site: URL): string | undefined {
  if (!pathOrUrl) return undefined;
  return new URL(pathOrUrl, site).toString();
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
