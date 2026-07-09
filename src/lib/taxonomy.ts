export type SiteCategory = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

export const CATEGORIES: SiteCategory[] = [
  {
    slug: "subsidy",
    title: "지원금·정부정책",
    description: "정부지원금, 복지, 청년·소상공인·가계 지원 정책을 신청 대상과 방법 중심으로 정리합니다.",
    keywords: ["지원금", "수당", "바우처", "급여", "복지", "환급", "신청", "청년", "소상공인", "근로장려금", "장학금", "육아", "보조금"]
  },
  {
    slug: "living-information",
    title: "생활정보",
    description: "일상에서 바로 확인해야 하는 제도, 교통, 통신, 건강, 생활 편의 정보를 모았습니다.",
    keywords: ["생활", "카드", "발급", "조회", "등록", "방법", "청소", "보험", "운전", "교통", "건강", "병원", "약국", "통신", "모바일"]
  },
  {
    slug: "finance-tax",
    title: "금융·세금",
    description: "계좌, 연금, ETF, 세금, 환급, 투자 기초 정보를 초보자도 이해하기 쉽게 정리합니다.",
    keywords: ["계좌", "ISA", "연금", "ETF", "세금", "세액", "소득", "금융", "투자", "주식", "배당", "금값", "환율", "대출"]
  },
  {
    slug: "concert-musical",
    title: "공연·콘서트·뮤지컬",
    description: "콘서트, 뮤지컬, 전시, 축제 일정과 티켓팅 정보를 빠르게 확인할 수 있습니다.",
    keywords: ["콘서트", "뮤지컬", "공연", "티켓", "티켓팅", "예매", "전시", "페스티벌", "축제", "라인업", "내한"]
  },
  {
    slug: "broadcasting-sports",
    title: "방송·스포츠",
    description: "방송, 스포츠 중계, 경기 일정, 투표, 순위 정보를 한눈에 볼 수 있게 정리합니다.",
    keywords: ["방송", "중계", "스포츠", "야구", "축구", "월드컵", "순위", "경기", "투표", "다시보기", "참가자"]
  },
  {
    slug: "ai-job",
    title: "AI·직업",
    description: "AI 시대 직업 변화, 커리어, 채용, 업무 자동화 흐름을 정리합니다.",
    keywords: ["AI 직업", "인공지능", "채용", "취업", "직무", "커리어", "자동화", "삼성", "하이닉스"]
  },
  {
    slug: "ai-stocks",
    title: "AI·주식",
    description: "AI 관련주, 반도체, 소프트웨어, 에너지 등 산업별 투자 키워드를 정리합니다.",
    keywords: ["AI 관련주", "반도체", "소프트웨어", "에너지", "수혜주", "투자", "주가", "종목"]
  },
  {
    slug: "travel-festival",
    title: "여행·축제",
    description: "여행 지원, 지역 축제, 교통, 숙박, 관광 정보를 모아 정리합니다.",
    keywords: ["여행", "숙박", "축제", "관광", "페스타", "셔틀", "벚꽃", "케이블카", "지역", "할인"]
  }
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((category) => [category.slug, category])
);

function sourceText(post: any) {
  return `${post.data.title ?? ""} ${post.data.description ?? ""} ${post.data.slugPath ?? ""}`.toLowerCase();
}

export function inferCategory(post: any): SiteCategory {
  const text = sourceText(post);
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
    .split(/[^a-z0-9가-힣]+/i)
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
