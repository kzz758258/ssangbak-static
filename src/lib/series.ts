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
  },
  {
    slug: "grandparent-care-allowance",
    title: "조부모 돌봄수당 지역별 시리즈",
    description: "전국 제도 차이를 먼저 비교하고 서울·경기·광주·제주·충남·경남·울산의 대상, 금액과 신청처를 지역별로 확인합니다.",
    posts: [
      "2026-grandparent-care-allowance",
      "2026-grandparent-care-allowance-guide",
      "gyeonggido-grandparents-care-allowance",
      "2026-seoul-grandparent-care-allowance-guide",
      "2026-gwangju-grandparent-care-allowance",
      "2026-jeju-grandparent-care-allowance",
      "2026-chungnam-grandparent-care-allowance-guide",
      "2026-kyungnam-grandparent-care-allowance-guide",
      "2026-ul-san-grandparent-care-allowance-guide"
    ]
  },
  {
    slug: "energy-voucher",
    title: "에너지바우처 신청·사용 시리즈",
    description: "신청 자격과 지원금액을 확인한 뒤 추가 지급 대상까지 이어서 점검합니다.",
    posts: [
      "energy-voucher-application",
      "energy-voucher-subsidies",
      "energy-voucher-additional-payment"
    ]
  },
  {
    slug: "youth-rent-support",
    title: "청년 월세지원 지역별 시리즈",
    description: "서울·부산·인천의 청년 월세지원 대상, 소득 기준과 신청 경로를 거주 지역별로 비교합니다.",
    posts: [
      "2026-seoul-youth-rent-guide",
      "busan-monthly-rent-support-guide",
      "incheon-youth-rent-support-application-guide"
    ]
  },
  {
    slug: "small-business-support",
    title: "소상공인 지원·공제 시리즈",
    description: "경영안정 바우처와 고용보험료, 냉난방기·가전 지원부터 노란우산공제까지 사업자가 확인할 제도를 목적별로 묶었습니다.",
    posts: [
      "small-business-voucher-guide",
      "small-business-employment-insurance-support-guide",
      "small-business-air-conditioner-support",
      "small-business-appliance-refund",
      "yellow-umbrella-mutual-aid-enrollment",
      "daejeon-small-business-subsidy"
    ]
  },
  {
    slug: "comprehensive-income-tax",
    title: "종합소득세 신고·납부 시리즈",
    description: "신고 서류와 홈택스 신고 절차, 무신고 불이익, 분납 방법을 신고 흐름에 맞춰 확인합니다.",
    posts: [
      "may-income-tax-guide",
      "may-income-tax-filing-guide",
      "may-income-tax-penalties",
      "income-tax-installment-payment-guide"
    ]
  },
  {
    slug: "local-tax",
    title: "재산세·주민세 신고납부 시리즈",
    description: "재산세 조회와 카드 혜택, 주민세 개인분·사업소분 신고 및 위택스 납부 방법을 세목별로 정리합니다.",
    posts: [
      "property-tax",
      "property-tax-card-benefits",
      "2026-resident-tax-payment",
      "2026-resident-tax-business-premises"
    ]
  },
  {
    slug: "vat-filing",
    title: "부가가치세 신고·납부 시리즈",
    description: "부가가치세 확정신고 대상과 홈택스 신고 방법, 납부기한 연장 대상 및 날짜를 함께 확인합니다.",
    posts: [
      "2026-vat-final-return",
      "2026-vat-payment-extension"
    ]
  }
];

export function getSeriesForPost(slugPath: string) {
  return CONTENT_SERIES.find((series) => series.posts.includes(slugPath));
}
