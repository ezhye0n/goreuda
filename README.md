# 고르다 (Goreuda)

웹프로그래밍 중간과제 15팀. HTML과 CSS만으로 만드는 선물 고민 도우미 웹사이트.

- **선물을 고르다**: 받는 사람과 상황을 고르면 선물 인사이트와 추천 상품을 보여줌
- **바르고 고른 선택**: 판매처별 가격을 비교하고 최저가 판매처로 연결

## 팀원과 담당

| 담당 | 페이지 파일 | 그 외 |
|---|---|---|
| 이지현 (팀장) | main.html, wishlist.html | common.css, 링크 연결, 수행계획서 수합, 최종 제출 |
| 우은민 | main.css, result.html, explore.html | 디자인 가이드, 로고 |
| 오현채 | select.html, report.html | 상품 이미지 |
| 이예경 | detail.html, compare.html | 벤치마킹 캡처 |

## 파일 구조

```
15_goreuda_main.html       메인
15_goreuda_select.html     조건 선택
15_goreuda_result.html     추천 결과 (인사이트 + 추천 상품)
15_goreuda_detail.html     상품 상세
15_goreuda_compare.html    판매처 가격 비교
15_goreuda_explore.html    상품 탐색
15_goreuda_wishlist.html   선물 후보 비교 (찜)
15_goreuda_report.html     선물 인사이트 리포트
15_goreuda_common.css      공통 CSS (팀장만 수정)
15_goreuda_template.html   새 페이지 시작용 템플릿 (수정 X)
images/                    이미지 (15_파일명.jpg, 30개 이하)
```

## 규칙

1. **내 파일만 수정해요.** 다른 사람 파일을 고쳐야 하면 단톡에 먼저 말해요.
2. **공통 CSS(15_goreuda_common.css)는 팀장만 수정해요.** 필요한 스타일은 내 페이지 CSS에 넣거나 팀장에게 요청해요.
3. **작업 시작 전에 Pull(최신 받기), 작업 끝나면 Commit + Push(올리기)** 순서를 지켜요.
4. 파일명은 영문으로 써요. 한글 파일명은 압축하면 깨질 수 있어요.
5. 링크와 이미지는 상대경로로 써요. (예: `images/15_gift01.jpg`)
6. JavaScript는 쓰지 않아요.

## 새 페이지 시작하는 법

1. `15_goreuda_template.html`을 복사해서 내 페이지 파일명으로 저장
2. 헤더, 푸터는 그대로 두고 `<main>` 안만 내 내용으로 바꾸기
3. `<meta name="page-owner">`에 내 이름 쓰기
4. 템플릿 안 예시(상품 카드, 선택 카드, 탭, GIFT GAP, 표) 중 필요한 것만 복사
5. 내 페이지 전용 CSS는 `15_goreuda_페이지명.css`로 따로 만들어서 연결

## 커밋 메시지 예시

```
[select] 조건 선택 질문 카드 추가
[common] 버튼 hover 색 수정
[images] 15_gift05 실제 사진으로 교체
```

## 참고

- 상품 이미지 출처: 각 브랜드 공식몰 및 판매처
- 인사이트 수치는 예시 데이터
