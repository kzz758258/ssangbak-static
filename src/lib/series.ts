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
  }
];

export function getSeriesForPost(slugPath: string) {
  return CONTENT_SERIES.find((series) => series.posts.includes(slugPath));
}
