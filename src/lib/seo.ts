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

export function buildMetaDescription(title: string, description?: string, category?: string): string {
  const normalized = (description ?? "")
    .replace(/\s+/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .trim();

  const fallback = `${title} 핵심 정보와 신청·예매·조회 방법을 최신 기준으로 정리했습니다. ${category ? `${category} 관련 일정, 대상, 준비사항을 한눈에 확인하세요.` : "필요한 조건, 기간, 준비사항을 한눈에 확인하세요."}`;
  const source = normalized.length >= 55 ? normalized : fallback;
  const maxLength = 155;

  if (source.length <= maxLength) return source;

  const clipped = source.slice(0, maxLength - 1);
  const lastBreak = Math.max(
    clipped.lastIndexOf("."),
    clipped.lastIndexOf("!"),
    clipped.lastIndexOf("?"),
    clipped.lastIndexOf(" ")
  );

  return `${clipped.slice(0, lastBreak > 80 ? lastBreak : maxLength - 1).trim()}…`;
}
