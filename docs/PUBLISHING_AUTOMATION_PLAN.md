# SsangBak Publishing Automation Plan

Updated: 2026-07-13

## Goal

키워드 또는 키워드와 서브키워드를 입력하면 최신 이슈를 확인하고, evergreen 검색 의도에 맞는 제목/썸네일/CTA/본문을 생성한 뒤 정적 사이트에 글을 발행하는 자동화입니다.
모든 글은 `docs/SSANGBAK_CONTENT_STANDARD.md`의 사람 우선 콘텐츠, 정보 이득, E-E-A-T, AI Overview 대응 기준을 우선 적용합니다.

초기 MVP는 “자동 초안 생성 + 사람 승인 + GitHub commit + Cloudflare 자동 배포”로 시작합니다. 품질이 안정되면 승인 단계를 줄입니다.

## Recommended Flow

1. 키워드 입력
2. 서브키워드 선택 입력
3. 최신 정보와 공식 출처 검색
4. 검색 의도 분류
5. evergreen 제목 후보 5개 추천
6. 제목 선택
7. 썸네일 카피 후보 5개 추천
8. CTA 버튼명 후보 5개 추천
9. 카피와 CTA 선택
10. 카테고리 자동 분류
11. 짧은 영문 slug 생성
12. 글 초안 생성
13. 이미지 1~2장 생성 또는 지정
14. CTA 버튼을 약속된 위치에 삽입
15. 자체 품질 점검
16. 통과하면 Markdown 파일 생성
17. 빌드 검사
18. GitHub push
19. Cloudflare Pages 자동 배포

## Search Intent Types

자동화는 키워드를 아래 중 하나로 분류합니다.
검색 의도는 "알고 싶다 -> 찾아가고 싶다 -> 고르고 싶다 -> 신청/구매/예매하고 싶다" 흐름에서 독자가 현재 어디에 있는지 기준으로 판단합니다.

| 유형 | 예시 | 글 구조 |
| --- | --- | --- |
| 신청형 | 에너지바우처 신청방법 | 대상, 기간, 조건, 서류, 신청절차, 주의사항 |
| 조회형 | 환급금 조회 | 조회 위치, 본인인증, 결과 해석, 문제 해결 |
| 예매형 | 콘서트 티켓팅 | 일정, 가격, 좌석, 예매처, 성공 팁 |
| 비교형 | KTX SRT 차이 | 핵심 차이, 표, 상황별 추천 |
| 일정형 | 월드컵 일정 | 날짜, 시간, 장소, 중계, 변동 확인법 |
| 계산형 | 주휴수당 계산기 | 공식, 예시, 계산표, 주의사항 |

## Article Template

모든 새 글은 아래 구조를 기본으로 합니다.

1. SEO 제목, meta description, 짧은 영문 slug
2. 첫 100자 안에 메인 키워드를 포함한 두괄식 답변
3. 핵심 요약 3~5개
4. 본문 목차
5. 모바일 반응형 표 또는 체크리스트
6. 대상/조건
7. 기간/일정
8. 신청·조회·예매 방법
9. 준비물/주의사항
10. CTA 버튼
11. 공식 출처와 확인 경로
12. 자주 묻는 질문 5개
13. 발행 후 리라이트 메모

## SEO/AEO/EEAT Rules

- 제목은 검색어를 앞쪽에 배치
- SEO 제목은 50~60자 안쪽 우선
- meta description은 140~160자 안쪽 우선
- slug는 짧은 영어로 생성
- H2는 4~7개를 기본으로 사용
- H2에는 서브키워드 또는 의미적으로 가까운 연관어를 자연스럽게 포함
- 질문형 H2 아래에는 1~2문장의 직접 답변을 먼저 배치
- 본문은 고정 단어 수보다 정보 충실도와 검색 의도 충족을 우선
- 표는 모바일에서 가로 스크롤 가능하게 작성
- FAQ는 실제 질문형으로 5개 작성
- 공식 출처, 신청처, 예매처를 명확히 표기
- 불확실한 최신 정보는 “확정/예상/변동 가능”을 구분
- 금융/정책/건강성 내용은 단정 표현을 줄이고 확인 경로 제공
- 메인 키워드는 자연스럽게 분산하고 억지 반복 금지
- 이미지에는 구체적인 ALT 텍스트를 작성
- "알아보겠습니다", "결론적으로", "다양한 측면에서" 같은 AI 상투어 사용 금지

## Quality Gate

발행 전 자동 점검 기준입니다.

| 항목 | 통과 기준 |
| --- | --- |
| 제목 | 핵심 키워드 포함, 과장 표현 과도하지 않음 |
| slug | 짧은 영어, 중복 없음 |
| description | 140~160자 안쪽 권장 |
| 본문 구조 | H2 4~7개, H3는 필요할 때만 |
| 첫 문단 | 첫 100자 안에 메인 키워드 포함 |
| 정보 이득 | 고유 표, 체크리스트, 최신 공식 확인, 실제 팁 중 1개 이상 |
| 이미지 | 1~2장, alt 포함 |
| CTA | 약속된 위치에 1~2개 |
| 내부링크 | 관련 글 2개 이상 추천 |
| 외부링크 | 공식 출처 우선 |
| FAQ | 실제 질문 5개 |
| 문체 | AI 상투어 제거, 사람에게 직접 설명하는 톤 |
| 빌드 | `npm.cmd run build` 통과 |

## File Output

자동화 결과물은 다음 파일로 생성합니다.

```txt
src/content/posts/{short-english-slug}.md
public/wp-content/uploads/{yyyy}/{mm}/{short-english-slug}.jpg
```

Markdown frontmatter:

```yaml
---
title: ""
description: ""
pubDate: ""
updatedDate: ""
permalink: "/short-english-slug/"
slugPath: "short-english-slug"
categories: []
tags: []
heroImage: "/wp-content/uploads/yyyy/mm/short-english-slug.jpg"
originalUrl: "https://ssangbak.com/short-english-slug/"
---
```

## MVP Scope

1차 자동화는 아래까지만 합니다.

- 키워드 입력
- 최신 정보 검색
- 제목/썸네일/CTA 후보 추천
- 선택값 기반 글 초안 생성
- Markdown 파일 생성
- 빌드 검사
- 승인 후 push

2차 자동화에서 추가할 항목:

- Google Indexing API 또는 수동 색인 요청 보조
- 네이버/다음/브런치/쓰레드 재가공
- 썸네일 템플릿 자동 합성
- 이미지 기반 짧은 영상 생성
- Search Console 성과 기반 리라이트 후보 자동 추천
