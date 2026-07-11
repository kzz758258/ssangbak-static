# SsangBak SEO Audit And Improvement Plan

Updated: 2026-07-11

## Current Diagnosis

Search Console 상태가 `크롤링됨 - 현재 색인이 생성되지 않음`이었다면, Google이 URL 접근 자체를 막힌 것은 아닙니다. 현재 사이트 기준으로는 robots, sitemap, canonical, noindex 같은 기본 차단 문제보다 “색인할 만큼 강한 문서로 판단되지 않음”에 가까운 상태입니다.

특히 기존 WordPress 시절 글은 짧은 본문, CTA 중심 구성, 유사한 형식의 반복 글, 약한 내부링크, 주제 분산이 겹쳐 Google 색인 보류가 발생했을 가능성이 큽니다.

## Technical SEO Check

| 항목 | 상태 | 판단 |
| --- | --- | --- |
| robots.txt | 정상 | `Allow: /`, sitemap, Daum 인증 PIN 확인 |
| sitemap | 정상 | `https://ssangbak.com/sitemap-index.xml` 열림 |
| sitemap URL 수 | 정상 | `sitemap-0.xml` 기준 434개 URL 포함 |
| RSS | 정상 | `https://ssangbak.com/rss.xml` 응답 정상 |
| canonical | 정상 | 글 URL 기준 self canonical 생성 |
| noindex | 정상 | 일반 페이지는 `index, follow` |
| Article JSON-LD | 정상 | 글마다 Article 구조화데이터 생성 |
| Breadcrumb JSON-LD | 정상 | 글마다 BreadcrumbList 생성 |
| 카테고리 허브 | 정상 | 8개 카테고리 페이지 생성 |
| 관련글 내부링크 | 정상 | 글 하단 관련글 자동 생성 |
| 이미지 | 정상 범위 | `/wp-content/uploads/` 이미지 경로 복구 완료 |
| TOC toggle 잔재 | 정상 | 현재 검사 기준 `toggle` 잔재 없음 |
| 404 처리 | 수정 필요였음 | 없는 URL이 200으로 홈을 반환하는 soft 404 위험 발견 |

## Fix Applied Now

- `src/pages/404.astro` 추가
- 루트 `dist/404.html` 생성 확인
- 404 페이지는 `noindex, follow`로 설정
- 404 페이지에서 주요 카테고리로 이동 가능하게 구성
- `BaseLayout`에 페이지별 robots meta를 넘길 수 있도록 개선

이 수정은 Cloudflare Pages가 최상위 `404.html`이 없을 때 없는 URL을 홈으로 돌려주는 SPA fallback 문제를 막기 위한 것입니다. soft 404 신호를 줄이는 데 중요합니다.

## Content Quality Findings

425개 글을 구조 기준으로 재분류했습니다.

| 그룹 | 개수 | 의미 |
| --- | ---: | --- |
| 유지 | 88 | 당장 유지 가능. 새 글 발행과 내부링크로 밀어줄 글 |
| 보강 | 264 | 본문 길이, H2 구조, 설명문, CTA 중 일부 보강 필요 |
| 개선 우선 | 73 | 짧거나 구조가 약해서 색인 보류 가능성이 높은 글 |

세부 지표:

- 전체 글: 425개
- 450단어 미만: 65개
- 650단어 미만: 286개
- H2가 0개인 글: 6개
- H2가 3개 미만인 글: 20개
- CTA 링크가 없는 글: 58개
- meta description은 모두 존재
- 짧은 meta description: 42개
- `toggle` 잔재: 0개
- 한글 slug: 0개

## Priority Content Candidates

먼저 손볼 글은 아래처럼 “짧고 구조가 약한데, 검색 의도는 분명한 글”입니다.

| 우선순위 | URL | 문제 |
| --- | --- | --- |
| 1 | `/weekly-holiday-allowance-calculator/` | 230단어, H2 없음, CTA 없음 |
| 2 | `/estimated-height-calculator/` | 49단어, H2 1개, CTA 없음 |
| 3 | `/income-amount-calculator/` | 283단어, H2 없음 |
| 4 | `/solo-32nd/` | 295단어, H2 없음 |
| 5 | `/mr-trot3-top7-concert/` | 329단어, H2 1개, CTA 없음 |
| 6 | `/isa-account-opening-possible-financial-institutions/` | 289단어, H2 1개, CTA 없음 |
| 7 | `/check-the-balance-of-training-benefit-voucher/` | 163단어, H2 1개 |
| 8 | `/climate-accompanying-card-all-things/` | 296단어, H2 1개 |
| 9 | `/agri-food-voucher-where-to-use-it/` | 334단어, H2 2개 |
| 10 | `/health-living-practice-grant/` | 443단어, description 짧음 |

## Recommended SEO Strategy

다양한 주제의 정보 사이트 자체가 문제는 아닙니다. 다만 “아무거나 쓰는 잡블로그”처럼 보이면 Google이 사이트 전체의 전문성과 일관성을 약하게 볼 수 있습니다.

SsangBak은 잡블로그보다 아래 포지션이 더 좋습니다.

> 생활에 바로 쓰는 신청·조회·예매·지원금 실전 가이드

이 정체성 안에서는 지원금, 정책, 생활정보, 금융, 공연, 스포츠까지 다룰 수 있습니다. 핵심은 주제를 줄이는 것이 아니라, 글의 형식을 통일하는 것입니다.

모든 글은 다음 질문에 답해야 합니다.

1. 누가 대상인가?
2. 언제까지 해야 하나?
3. 어디서 신청/조회/예매하나?
4. 준비물이나 조건은 무엇인가?
5. 놓치면 손해 보는 포인트는 무엇인가?
6. 공식 링크/확인 경로는 어디인가?

## Next Work Order

1. 이번 404 수정 배포
2. Search Console에서 대표 URL 5개 색인 요청
3. `개선 우선` 73개 중 네이버 유입 있는 글은 보수적으로 보강
4. 유입 없는 계산기/짧은 글부터 본문 900~1,400단어 수준으로 개선
5. 새 글은 처음부터 고품질 템플릿으로 발행
6. 2~4주 뒤 Search Console에서 색인 상태 변화 확인

## Search Console Monitoring

대표 URL로 아래를 검사하면 좋습니다.

- `/weekly-holiday-allowance-calculator/`
- `/energy-voucher-application/`
- `/2026-second-half-policy-changes-guide/`
- `/culture-nuri-card-guide/`
- `/category/subsidy/`

확인할 항목:

- Google에 등록되어 있는지
- 마지막 크롤링 날짜
- 사용자 선언 canonical과 Google 선택 canonical이 같은지
- 페이지 가져오기 성공 여부
- 색인 제외 사유가 `크롤링됨 - 현재 색인이 생성되지 않음`에서 바뀌는지
