export type ContentSeries = {
  slug: string;
  title: string;
  description: string;
  posts: string[];
};

export const CONTENT_SERIES: ContentSeries[] = [
  {
    slug: "public-certificates",
    title: "공공 증명서 발급 시리즈",
    description: "제출처에 맞는 서류 종류를 고르고 온라인 발급·PDF 저장·오류 해결까지 이어서 확인합니다.",
    posts: [
      "resident-registration-abstract-online-guide",
      "family-relation-certificate-online-guide",
      "seal-certificate-online-issuance-guide",
      "income-certificate-issuance-guide",
      "national-tax-payment-certificate-guide",
      "local-tax-itemized-certificate-guide",
      "health-insurance-qualification-certificate-guide",
      "health-insurance-payment-certificate-guide",
      "employment-insurance-history-certificate-guide",
      "single-parent-family-certificate-guide",
      "entry-exit-record-certificate-guide",
      "building-register-online-guide",
      "land-register-online-issuance-guide",
      "vehicle-registration-record-guide"
    ]
  },
  {
    slug: "student-loans",
    title: "학자금대출 시리즈",
    description: "2학기 신청부터 생활비 한도, 이자지원과 중도상환까지 학생이 실제로 결정해야 할 순서대로 확인합니다.",
    posts: [
      "second-semester-student-loan-guide",
      "student-living-expense-loan-total-limit-guide",
      "ai-study-support-loan-guide",
      "scholarship-support-section",
      "2026-rural-student-loan-second-semester",
      "seoul-student-loan-interest-2026-guide",
      "student-loan-early-repayment-guide"
    ]
  },
  {
    slug: "earned-income-tax-credit",
    title: "근로장려금 시리즈",
    description: "신청 자격부터 반기·정기 차이, 지급액과 지급일, 프리랜서 신청 및 이의신청까지 중복 없이 이어서 확인합니다.",
    posts: [
      "earned-income-tax-credit-eligibility-guide",
      "earned-income-tax-credit-application-guide",
      "2026-earned-income-tax-credit-half-year",
      "earned-income-tax-credit-amount-payment-date",
      "earned-income-freelancer-application-guide",
      "eitc-objection-process-guide"
    ]
  },
  {
    slug: "agricultural-food-voucher",
    title: "농식품바우처 이용 시리즈",
    description: "신청 이후 카드 등록, 사용처와 품목, 잔액 확인 및 분실 대응까지 실제 이용 순서대로 정리합니다.",
    posts: [
      "agricultural-food-voucher-application",
      "agri-food-voucher-card-registration",
      "agri-food-voucher-where-to-use-it",
      "agri-food-voucher-items",
      "agri-food-voucher-balance-inquiry",
      "agricultural-food-voucher-card-lost"
    ]
  },
  {
    slug: "health-insurance",
    title: "건강보험 조회·발급 시리즈",
    description: "환급금 조회부터 피부양자 등록, 자격확인서와 납부확인서 발급까지 건강보험 업무별로 찾아봅니다.",
    posts: [
      "health-insurance-refund-lookup-guide",
      "national-health-insurance-refund",
      "health-insurance-dependent-registration-guide",
      "health-insurance-qualification-certificate-guide",
      "health-insurance-payment-certificate-guide"
    ]
  },
  {
    slug: "car-administration",
    title: "자동차 조회·민원 시리즈",
    description: "검사 예약과 등록원부 발급, 과태료 조회, 자동차세·채권 환급처럼 차량 보유자가 자주 처리하는 업무를 묶었습니다.",
    posts: [
      "car-inspection-reservation-guide",
      "vehicle-registration-record-guide",
      "car-registration-reissue-guide",
      "vehicle-fine-lookup-payment-guide",
      "car-tax-refund-application",
      "car-bond-refund-check"
    ]
  }
];

export function getSeriesForPost(slugPath: string) {
  return CONTENT_SERIES.find((series) => series.posts.includes(slugPath));
}
