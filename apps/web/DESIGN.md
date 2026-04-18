# 감바쓰 디자인 시스템 v2

피그마 대신 이 문서와 `/design-system` 페이지를 디자인 레퍼런스로 사용합니다.

## 파일 위치

| 파일 | 역할 |
|---|---|
| `src/design/tokens.ts` | 색상, radius, shadow, 폰트, 여백, 모션 기준값 정의 (단일 진실 공급원) |
| `src/design/guidelines.ts` | 토큰 사용 규칙 — 언제 어떤 토큰을 쓸지 |
| `src/app/globals.css` | 폰트 @import, Tailwind @theme, CSS 변수 (`--c-*`, `--sh-*`, `--mo-*`) |
| `src/app/design-system/page.tsx` | `/design-system` — 시각적 디자인 레퍼런스 페이지 |

## 원칙 (tl;dr)

1. **모노크롬만.** 채도 있는 색 절대 금지.
2. **Pretendard 단독.** JetBrains Mono 는 라벨/카운터에만.
3. **계층은 그림자 + 명도 + 웨이트로.**
4. 프라이머리 액션은 solid ink. 화면당 1개만.
5. 모서리는 크기에 비례: 버튼=round, 카드=lg.
6. 탄성 있게 — 하지만 명시적 액션에만 과장.
7. 카피는 짧게, 판단 없이, 권유형으로.

## 색상 토큰

### Paper · 종이 스케일

| 토큰 | Hex | 용도 |
|---|---|---|
| `paper`   | `#FDFDFC` | 전체 캔버스 / 페이지 배경 |
| `surface` | `#FFFFFF` | 떠있는 카드 |
| `sunken`  | `#F4F4F2` | 패인 영역 (바구니, 입력창) |
| `tint`    | `#EDEDEA` | 은은한 채움 |

### Ink · 잉크 스케일

| 토큰 | Hex | 용도 |
|---|---|---|
| `ink`  | `#121211` | 기본 텍스트 / 프라이머리 액션 배경 |
| `ink2` | `#3A3A38` | 2차 텍스트 |
| `ink3` | `#6E6E6B` | 3차 / 메타 |
| `ink4` | `#9E9E9B` | 플레이스홀더 |
| `ink5` | `#C4C4C0` | 헤어라인 |
| `ink6` | `#E2E2DF` | 구분선 |

### Functional

| 토큰 | Hex | 용도 |
|---|---|---|
| `hi`    | `#0A0A09` | 최고 대비 |
| `lo`    | `#FAFAF8` | hi 위의 텍스트 (반전) |
| `ember` | `#1A1A17` | "불씨" — 거의 검정 |

## CSS 변수 규칙

```
/* Tailwind utilities */      /* direct CSS use */
--color-paper / bg-paper      --c-paper
--color-ink   / text-ink      --c-ink
...                           ...

/* 그림자 */
--sh-sm   subtle card
--sh-md   default card
--sh-lg   hover / elevated
--sh-xl   dialog / sheet
--sh-inset  recessed wells

/* 모션 */
--mo-instant  120ms
--mo-quick    180ms
--mo-base     260ms
--mo-slow     420ms
--mo-scene    720ms
--mo-standard  cubic-bezier(0.32, 0.72, 0, 1)
--mo-bounce   cubic-bezier(0.34, 1.56, 0.64, 1)
--mo-squish   cubic-bezier(0.87, 0, 0.13, 1)
```

## 폰트

- **Pretendard** — variable, 100–900. CDN(jsdelivr) 로드.
- **JetBrains Mono** — 400, 500. Google Fonts.

### 타이포 스케일

| 스텝 | 크기 | 굵기 | 줄간격 | 자간 | 용도 |
|---|---|---|---|---|---|
| display | 72px | 700 | 1.05 | -0.035em | 랜딩 히어로 |
| h1      | 48px | 700 | 1.10 | -0.030em | 페이지 제목 |
| h2      | 36px | 700 | 1.15 | -0.025em | 섹션 제목 |
| h3      | 24px | 600 | 1.25 | -0.020em | 카드 제목 |
| h4      | 18px | 600 | 1.35 | -0.015em | 서브 제목 |
| body lg | 18px | 400 | 1.55 | -0.010em | 리드 본문 |
| body    | 15px | 400 | 1.60 | -0.005em | 말풍선, 본문 |
| caption | 13px | 400 | 1.50 |  0.000em | 보조 설명 |
| label   | 12px | 500 | 1.40 | +0.010em | 버튼, 태그 |
| mono    | 12px | 500 | 1.50 | +0.020em | 카운터, 메타 |

## Border Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius-xs`    | 6px   | 아이콘 배지, 태그 |
| `radius-sm`    | 10px  | 소형 카드 |
| `radius-md`    | 14px  | 입력 필드, 카드 |
| `radius-lg`    | 20px  | 주요 카드 |
| `radius-xl`    | 28px  | 다이얼로그, 시트 |
| `radius-round` | 9999px| 버튼, 아바타, 칩 |

## Shadow

그림자 레이어를 겹쳐 Apple-스타일의 부드러운 깊이감을 만든다.

| 토큰 | 용도 |
|---|---|
| `--sh-sm`    | 헤어라인 카드 |
| `--sh-md`    | 기본 카드 |
| `--sh-lg`    | hover / 강조 |
| `--sh-xl`    | 다이얼로그 / 시트 |
| `--sh-inset` | 패인 영역 (입력창, 바구니) |
| `--sh-hair`  | 1px 테두리 대신 사용 |
| `--sh-bounce`| 바운스 프리뷰 |

## 버튼 패턴

```
primary   → ink (solid) bg + lo text, border: 1px solid #000
secondary → surface bg + ink text, sh-sm border
ghost     → transparent bg + ink2 text, dashed border
```

액션 시 `scale(0.96)` + `--mo-bounce` 전환. 화면당 primary 1개만.

## 여백

기준: **4pt 배수 시스템**. 변수명: `--s-1`(4px) ~ `--s-12`(120px).

## 모션

| 타이밍 | 용도 |
|---|---|
| `instant` 120ms | 버튼 눌림 |
| `quick` 180ms  | hover, 토글 |
| `base` 260ms   | 대부분의 전환 |
| `slow` 420ms   | 모달, 시트 |
| `scene` 720ms  | 소각 시작 |

- `--mo-bounce` — 던지기, 버튼, 바구니
- `--mo-squish` — 구기기
- `--mo-standard` — 대부분의 UI

## 디자인 변경 시 순서

1. `tokens.ts` — 값 추가/수정
2. `guidelines.ts` — 용도 규칙 업데이트
3. `globals.css` — @theme / :root 반영
4. `src/app/design-system/page.tsx` — 시각적 문서 업데이트
