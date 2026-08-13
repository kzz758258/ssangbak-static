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
    slug: "civil-documents",
    title: "민원·발급",
    description: "정부24·홈택스·건강보험·고용보험에서 필요한 증명서와 원부를 정확히 고르고 발급·PDF 저장·제출하는 방법을 정리합니다.",
    keywords: [
      "증명서", "확인서", "원부", "등본", "초본", "대장", "발급", "정부24", "전자문서지갑",
      "가족관계", "주민등록", "건축물대장", "토지대장", "자격득실", "납부확인서", "소득금액증명"
    ]
  },
  {
    slug: "tax-finance",
    title: "세금·금융",
    description: "세금 신고와 환급, 카드·보험·대출·연금·투자처럼 가계와 사업에 영향을 주는 금융 실무를 공식 기준에 맞춰 정리합니다.",
    keywords: [
      "세금", "소득세", "부가가치세", "재산세", "취득세", "원천세", "연말정산", "홈택스", "과세",
      "카드", "보험", "대출", "금리", "은행", "계좌", "연금", "ETF", "주식", "배당", "투자", "환율"
    ]
  },
  {
    slug: "local-information",
    title: "지역정보",
    description: "지역별 지원사업, 생활폐기물·공영주차장·공공시설처럼 실제 주소와 운영기관에 따라 달라지는 생활 정보를 공식 지역 자료로 확인합니다.",
    keywords: [
      "지역", "지자체", "시청", "군청", "구청", "주민센터", "행정복지센터", "축제", "관광", "여행", "숙박",
      "공영주차장", "주차", "대형폐기물", "생활폐기물", "공공시설", "체육시설", "캠핑장", "셔틀", "터미널"
    ]
  },
  {
    slug: "living-information",
    title: "생활정보",
    description: "건강, 교통, 통신, 자동차, 디지털 서비스와 일상 문제 해결에 필요한 실용 정보를 정리합니다.",
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
  "finance-tax": "tax-finance",
  "concert-musical": "entertainment-sports",
  "broadcasting-sports": "entertainment-sports",
  "broadcasting": "entertainment-sports",
  "travel-festival": "local-information",
  "ai-stocks": "tax-finance",
  "ai-job": "living-information"
};

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category])
);

function sourceText(post: any) {
  return `${post.data.title ?? ""} ${post.data.description ?? ""} ${post.data.slugPath ?? ""} ${(post.data.tags ?? []).join(" ")}`.toLowerCase();
}

export function isLocalInformationPost(post: any) {
  const text = sourceText(post);
  const region = /(서울|경기|인천|부산|대구|대전|광주|울산|세종|강원|충북|충남|전북|전남|경북|경남|제주|속초|연천|양구|완주|통영|의창)/;
  const localIntent = /(월세|돌봄|지원금|수당|축제|박람회|정원|주차|교통|버스|폐기물|관광|여행|공공시설|주민센터|시청|군청|구청)/;
  const timeSensitiveEntertainment = /(콘서트|공연|예매|티켓|뮤지컬|팬미팅|중계|concert|ticket|musical)/;
  return region.test(text) && localIntent.test(text) && !timeSensitiveEntertainment.test(text);
}

export function inferCategory(post: any): SiteCategory {
  const explicit = post.data.categories?.find((category: string) => CATEGORY_BY_SLUG[category] || LEGACY_CATEGORY_MAP[category]);
  const text = sourceText(post);
  const routeText = `${post.data.slugPath ?? ""} ${post.data.permalink ?? ""}`.toLowerCase();
  const explicitSlug = explicit ? (LEGACY_CATEGORY_MAP[explicit] ?? explicit) : "";
  if (isLocalInformationPost(post)) return CATEGORY_BY_SLUG["local-information"];
  if (explicitSlug && explicitSlug !== "living-information") return CATEGORY_BY_SLUG[explicitSlug];
  if (/(ewc|msi|world-?cup|kbo|wbc|concert|musical|ticket|sports|broadcast|baseball|football)/.test(routeText)) {
    return CATEGORY_BY_SLUG["entertainment-sports"];
  }

  const isGeneralFestival = (text.includes("축제") || text.includes("festival") || text.includes("페스티벌"))
    && !["콘서트", "공연", "뮤지컬", "뮤직", "음악", "워터밤", "티켓팅"].some((signal) => text.includes(signal.toLowerCase()));
  if (isGeneralFestival) return CATEGORY_BY_SLUG["local-information"];

  const entertainmentSignals = [
    "콘서트", "공연", "뮤지컬", "전시", "티켓팅", "좌석", "시야", "중계", "월드컵", "kbo", "wbc",
    "ewc", "msi", "e스포츠", "스포츠", "야구", "축구", "올림픽", "나는솔로", "싱어게인", "미스트롯", "미스터트롯",
    "world-cup", "football", "baseball", "concert", "ticket", "musical", "sports", "broadcast"
  ];
  if (entertainmentSignals.some((signal) => text.includes(signal))) {
    return CATEGORY_BY_SLUG["entertainment-sports"];
  }

  const subsidySignals = [
    "지원금", "지원사업", "장려금", "바우처", "급여", "수당", "보조금", "복지", "육아휴직", "실업급여",
    "장학금", "학자금", "기초연금", "청년지원", "소상공인 지원", "정부정책"
  ];
  if (subsidySignals.some((signal) => text.includes(signal))) return CATEGORY_BY_SLUG["subsidy"];

  const documentSignals = [
    "증명서", "확인서", "등록원부", "등본", "초본", "건축물대장", "토지대장", "소득금액증명",
    "자격득실", "출입국 사실", "정부24 발급", "인터넷 발급", "온라인 발급"
  ];
  if (documentSignals.some((signal) => text.includes(signal))) return CATEGORY_BY_SLUG["civil-documents"];

  const financeSignals = [
    "세금", "소득세", "부가가치세", "재산세", "취득세", "원천세", "연말정산", "과세", "납세",
    "카드혜택", "보험금", "대출", "금리", "은행", "연금", "etf", "주식", "배당", "투자", "환율", "무상증자"
  ];
  if (financeSignals.some((signal) => text.includes(signal))) return CATEGORY_BY_SLUG["tax-finance"];

  const localSignals = [
    "지역축제", "축제 일정", "관광", "여행", "숙박", "공영주차장", "주차장", "대형폐기물", "생활폐기물",
    "공공시설", "체육시설", "캠핑장", "셔틀버스", "터미널", "시청 지원", "군청 지원", "구청 지원"
  ];
  if (localSignals.some((signal) => text.includes(signal))) return CATEGORY_BY_SLUG["local-information"];

  let best = CATEGORY_BY_SLUG["living-information"];
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
