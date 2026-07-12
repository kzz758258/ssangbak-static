export type SiteCategory = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export const CATEGORIES: SiteCategory[] = [
  {
    slug: "subsidy",
    title: "지원금&정부정책",
    description: "정부지원금, 복지 혜택, 청년·소상공인 정책, 신청 대상과 기간을 한눈에 확인할 수 있게 정리합니다.",
    keywords: [
      "지원금", "정부", "정책", "복지", "수당", "바우처", "급여", "환급", "신청", "대상", "자격",
      "청년", "소상공인", "근로", "장려금", "보조금", "지원사업", "민생", "난방비", "에너지바우처",
      "기초연금", "육아", "돌봄", "주거", "월세", "일자리도약"
    ]
  },
  {
    slug: "living-information",
    title: "생활정보",
    description: "세금, 금융, 여행, 축제, 건강, 교통, 통신, AI·직업·주식 등 일상에 필요한 실용 정보를 정리합니다.",
    keywords: [
      "생활", "방법", "조회", "발급", "등록", "사용처", "환불", "카드", "보험", "세금", "금융",
      "연말정산", "홈택스", "계좌", "연금", "ETF", "주식", "배당", "투자", "AI", "직업",
      "채용", "취업", "여행", "축제", "숙박", "관광", "교통", "통신", "건강", "병원",
      "약국", "모바일", "청소", "에어컨", "고속도로", "여권", "운전", "자동차"
    ]
  },
  {
    slug: "entertainment-sports",
    title: "엔터&스포츠",
    description: "콘서트, 공연, 뮤지컬, 전시, 방송, e스포츠와 경기 일정·중계·예매 정보를 빠르게 정리합니다.",
    keywords: [
      "콘서트", "콘서트", "공연", "공연", "공연", "뮤지컬", "뮤지컬", "전시", "예매", "예매",
      "티켓", "티켓", "티켓팅", "티켓팅", "좌석", "시야", "팬클럽", "선예매", "라인업",
      "셋리스트", "월드투어", "내한", "공연장", "공연 할인권", "영화", "방송", "중계",
      "스포츠", "야구", "축구", "월드컵", "KBO", "WBC", "올림픽", "EWC", "MSI", "롤",
      "리그 오브 레전드", "e스포츠", "경기", "대진표", "순위", "투표", "출연자", "다시보기",
      "음악축제", "뮤직페스티벌", "워터밤", "나는솔로", "싱어게인", "미스트롯", "미스터트롯",
      "임영웅", "BTS", "빅뱅", "데이식스"
    ]
  }
];

const LEGACY_CATEGORY_MAP: Record<string, string> = {
  "finance-tax": "living-information",
  "concert-musical": "entertainment-sports",
  "broadcasting-sports": "entertainment-sports",
  "broadcasting": "entertainment-sports",
  "travel-festival": "living-information",
  "ai-stocks": "living-information",
  "ai-job": "living-information"
};

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category])
);

function sourceText(post: any) {
  return `${post.data.title ?? ""} ${post.data.description ?? ""} ${post.data.slugPath ?? ""} ${(post.data.tags ?? []).join(" ")}`.toLowerCase();
}

export function inferCategory(post: any): SiteCategory {
  const explicit = post.data.categories?.find((category: string) => CATEGORY_BY_SLUG[category] || LEGACY_CATEGORY_MAP[category]);
  if (explicit) return CATEGORY_BY_SLUG[LEGACY_CATEGORY_MAP[explicit] ?? explicit];

  const text = sourceText(post);
  const routeText = `${post.data.slugPath ?? ""} ${post.data.permalink ?? ""}`.toLowerCase();
  if (/(ewc|msi|world-?cup|kbo|wbc|concert|musical|ticket|sports|broadcast|baseball|football)/.test(routeText)) {
    return CATEGORY_BY_SLUG["entertainment-sports"];
  }

  const isGeneralFestival = (text.includes("축제") || text.includes("festival") || text.includes("페스티벌"))
    && !["콘서트", "공연", "뮤지컬", "뮤직", "음악", "워터밤", "티켓팅"].some((signal) => text.includes(signal.toLowerCase()));
  if (isGeneralFestival) return CATEGORY_BY_SLUG["living-information"];

  const entertainmentSignals = [
    "콘서트", "공연", "뮤지컬", "전시", "티켓팅", "좌석", "시야", "중계", "월드컵", "kbo", "wbc",
    "ewc", "msi", "e스포츠", "스포츠", "야구", "축구", "올림픽", "나는솔로", "싱어게인", "미스트롯", "미스터트롯",
    "world-cup", "football", "baseball", "concert", "ticket", "musical", "sports", "broadcast"
  ];
  if (entertainmentSignals.some((signal) => text.includes(signal))) {
    return CATEGORY_BY_SLUG["entertainment-sports"];
  }

  let best = CATEGORIES[1];
  let bestScore = 0;

  for (const category of CATEGORIES) {
    const score = category.keywords.reduce((total, keyword) => {
      return text.includes(keyword.toLowerCase()) ? total + 1 : total;
    }, 0);

    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }

  return best;
}

function tokens(post: any) {
  return sourceText(post)
    .replace(/https?:\/\/\S+/g, " ")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2)
    .filter((token) => !["2025", "2026", "guide", "method", "application"].includes(token));
}

export function getRelatedPosts(post: any, posts: any[], limit = 5) {
  const currentCategory = inferCategory(post).slug;
  const currentTokens = new Set(tokens(post));

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const candidateCategory = inferCategory(candidate).slug;
      const overlap = tokens(candidate).filter((token) => currentTokens.has(token)).length;
      const categoryScore = candidateCategory === currentCategory ? 5 : 0;
      return { post: candidate, score: overlap + categoryScore };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.post.data.pubDate.valueOf() - a.post.data.pubDate.valueOf();
    })
    .slice(0, limit)
    .map((entry) => entry.post);
}
