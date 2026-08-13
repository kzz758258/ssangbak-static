export type ContentSeries = {
  slug: string;
  title: string;
  description: string;
  posts: string[];
  steps: Record<string, string>;
};

export const CONTENT_SERIES: ContentSeries[] = [
  {
    slug: "youth-culture-pass",
    title: "청년문화예술패스 신청·이용 시리즈",
    description: "신청 대상과 지원금 사용처를 확인한 뒤 발급 후 잔액, 사용기한과 취소·환불 문제까지 이어서 해결합니다.",
    posts: ["youth-culture-pass-apply", "youth-culture-pass-balance-refund-guide"],
    steps: {
      "youth-culture-pass-apply": "대상·신청·사용처",
      "youth-culture-pass-balance-refund-guide": "잔액·취소·환불"
    }
  },
  {
    slug: "youth-future-savings",
    title: "청년미래적금 신청 시리즈",
    description: "가입 조건을 확인하고 신청 시기·은행·금리를 결정한 뒤 기존 청년도약계좌에서 갈아탈 수 있는지까지 이어서 확인합니다.",
    posts: [
      "youth-future-savings",
      "youth-future-savings-apply",
      "youth-future-savings-bank",
      "youth-future-savings-interest"
    ],
    steps: {
      "youth-future-savings": "조건 확인",
      "youth-future-savings-apply": "신청일·갈아타기",
      "youth-future-savings-bank": "은행별 신청",
      "youth-future-savings-interest": "금리 비교"
    }
  },
  {
    slug: "youth-savings-account",
    title: "청년내일저축계좌 신청·만기 시리즈",
    description: "소득기준과 신청방법을 먼저 확인하고 가입 후 만기 수령액, 유지 조건과 재가입 여부까지 살펴봅니다.",
    posts: ["youth-savings-account-criteria", "youth-savings-account-guide"],
    steps: {
      "youth-savings-account-criteria": "조건·신청",
      "youth-savings-account-guide": "만기·재가입"
    }
  },
  {
    slug: "earned-income-tax-credit",
    title: "근로장려금 신청·지급 시리즈",
    description: "대상 여부를 확인한 뒤 정기·반기 신청, 예상 지급액과 지급일, 지급 제외 시 이의신청까지 한 흐름으로 정리합니다.",
    posts: [
      "earned-income-tax-credit-eligibility-guide",
      "earned-income-tax-credit-application-guide",
      "2026-earned-income-tax-credit-half-year",
      "earned-income-freelancer-application-guide",
      "earned-income-tax-credit-amount-payment-date",
      "eitc-objection-process-guide"
    ],
    steps: {
      "earned-income-tax-credit-eligibility-guide": "대상 확인",
      "earned-income-tax-credit-application-guide": "정기 신청",
      "2026-earned-income-tax-credit-half-year": "반기 신청·정산",
      "earned-income-freelancer-application-guide": "프리랜서 신청",
      "earned-income-tax-credit-amount-payment-date": "금액·지급일",
      "eitc-objection-process-guide": "지급 제외·이의신청"
    }
  },
  {
    slug: "agricultural-food-voucher",
    title: "농식품바우처 신청·사용 시리즈",
    description: "대상 확인과 신청부터 카드 등록, 사용처·품목, 잔액 관리와 분실 재발급까지 실제 이용 순서대로 확인합니다.",
    posts: [
      "agricultural-food-voucher-application",
      "agri-food-voucher-card-registration",
      "agri-food-voucher-where-to-use-it",
      "agri-food-voucher-items",
      "agri-food-voucher-balance-inquiry",
      "agricultural-food-voucher-card-lost"
    ],
    steps: {
      "agricultural-food-voucher-application": "대상·신청",
      "agri-food-voucher-card-registration": "카드 등록",
      "agri-food-voucher-where-to-use-it": "사용처 확인",
      "agri-food-voucher-items": "구매 품목 확인",
      "agri-food-voucher-balance-inquiry": "잔액 관리",
      "agricultural-food-voucher-card-lost": "분실·재발급"
    }
  },
  {
    slug: "student-loans",
    title: "학자금대출 신청·상환 시리즈",
    description: "학기 대출을 신청하고 생활비 잔여한도를 확인한 뒤 여유가 생겼을 때 중도상환하는 순서로 연결합니다.",
    posts: [
      "second-semester-student-loan-guide",
      "student-living-expense-loan-total-limit-guide",
      "student-loan-early-repayment-guide"
    ],
    steps: {
      "second-semester-student-loan-guide": "신청·실행",
      "student-living-expense-loan-total-limit-guide": "생활비 한도",
      "student-loan-early-repayment-guide": "중도상환"
    }
  },
  {
    slug: "energy-voucher",
    title: "에너지바우처 신청·지급 시리즈",
    description: "지원대상과 금액을 확인하고 신청한 뒤 등유·LPG 가구의 추가 지급 대상 여부까지 점검합니다.",
    posts: [
      "energy-voucher-subsidies",
      "energy-voucher-application",
      "energy-voucher-additional-payment"
    ],
    steps: {
      "energy-voucher-subsidies": "대상·지원금액",
      "energy-voucher-application": "신청",
      "energy-voucher-additional-payment": "추가 지급"
    }
  },
  {
    slug: "medical-benefits",
    title: "의료급여 신청·이용 시리즈",
    description: "바뀐 부양비 기준을 확인하고 의료급여를 신청한 뒤 진료비 본인부담 보상까지 이어서 살펴봅니다.",
    posts: [
      "medical-benefits-support-costs-abolition",
      "2026-medical-benefits-application-method",
      "2026-medical-benefits-out-of-pocket-expenses"
    ],
    steps: {
      "medical-benefits-support-costs-abolition": "제도 변경",
      "2026-medical-benefits-application-method": "대상·신청",
      "2026-medical-benefits-out-of-pocket-expenses": "이용 후 보상"
    }
  },
  {
    slug: "comprehensive-income-tax",
    title: "종합소득세 신고·납부 시리즈",
    description: "필요 서류를 준비해 홈택스로 신고하고, 납부가 부담되면 분납을 검토하며 미신고 불이익까지 확인합니다.",
    posts: [
      "may-income-tax-guide",
      "may-income-tax-filing-guide",
      "income-tax-installment-payment-guide",
      "may-income-tax-penalties"
    ],
    steps: {
      "may-income-tax-guide": "서류 준비",
      "may-income-tax-filing-guide": "홈택스 신고",
      "income-tax-installment-payment-guide": "분납",
      "may-income-tax-penalties": "미신고 대응"
    }
  },
  {
    slug: "property-tax",
    title: "재산세 조회·납부 시리즈",
    description: "재산세 부과내역과 납부기간을 확인한 뒤 카드 무이자·캐시백 혜택을 비교해 납부수단을 결정합니다.",
    posts: ["property-tax", "property-tax-card-benefits"],
    steps: {
      "property-tax": "조회·납부기간",
      "property-tax-card-benefits": "카드 혜택 비교"
    }
  },
  {
    slug: "vat-filing",
    title: "부가가치세 신고·납부 시리즈",
    description: "확정신고 대상과 홈택스 신고방법을 확인하고 납부기한 연장 대상이라면 별도 납부일정까지 이어서 점검합니다.",
    posts: ["2026-vat-final-return", "2026-vat-payment-extension"],
    steps: {
      "2026-vat-final-return": "확정신고",
      "2026-vat-payment-extension": "납부기한 연장"
    }
  },
  {
    slug: "yellow-umbrella-mutual-aid",
    title: "노란우산공제 가입·해지 시리즈",
    description: "가입대상과 소득공제 혜택을 확인하고 중도해지가 필요할 때 환급금과 세금 불이익까지 비교합니다.",
    posts: ["yellow-umbrella-mutual-aid-enrollment", "noran-usan-gongje-haeji-refund"],
    steps: {
      "yellow-umbrella-mutual-aid-enrollment": "가입·소득공제",
      "noran-usan-gongje-haeji-refund": "해지·환급금"
    }
  }
];

export function getSeriesForPost(slugPath: string) {
  return CONTENT_SERIES.find((series) => series.posts.includes(slugPath));
}
