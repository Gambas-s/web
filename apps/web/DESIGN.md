# 감바쓰 디자인 시스템

피그마 대신 이 문서와 `/design-system` 페이지를 디자인 레퍼런스로 사용합니다.

## 파일 위치

| 파일 | 역할 |
|---|---|
| `src/design/tokens.ts` | 색상, radius, shadow, 폰트, 여백 기준값 정의 (단일 진실 공급원) |
| `src/design/guidelines.ts` | 토큰 사용 규칙 — 언제 어떤 토큰을 쓸지 |
| `src/app/globals.css` | Pretendard @import, Tailwind @theme 정의 |
| `src/app/design-system/page.tsx` | `/design-system` — 시각적 디자인 레퍼런스 페이지 |

## 규칙

- 색상, 폰트, 여백 값은 **`tokens.ts`에만 정의**한다. CSS나 인라인에 직접 값을 하드코딩하지 않는다.
- **디자인 변경 시 반드시 아래 순서로 수정한다:**
  1. `tokens.ts` — 값 추가/수정
  2. `guidelines.ts` — 용도 규칙 업데이트
  3. `globals.css` — @theme 변수 반영
  4. `src/app/design-system/page.tsx` — 시각적 문서 업데이트

## 색상 토큰

### Neutral (주력)
| 토큰 | Hex | 용도 |
|---|---|---|
| `neutral-0` | `#FFFFFF` | 페이지 배경 |
| `neutral-50` | `#FAFAFA` | 섹션 배경, 카드 배경 |
| `neutral-100` | `#F4F4F5` | 입력 필드 배경 |
| `neutral-200` | `#E4E4E7` | 구분선, 테두리 |
| `neutral-300` | `#D1D1D6` | 비활성 테두리 |
| `neutral-400` | `#A1A1AA` | 플레이스홀더 |
| `neutral-500` | `#71717A` | 보조 텍스트 |
| `neutral-600` | `#52525B` | 서브 텍스트 |
| `neutral-700` | `#3F3F46` | 강조 텍스트 |
| `neutral-800` | `#27272A` | 제목 |
| `neutral-900` | `#18181B` | 기본 텍스트 |

### Accent (극소량)
| 토큰 | Hex | 용도 |
|---|---|---|
| `accent` | `#FFDF1E` | 메인 캐릭터 컬러 — 단 하나의 요소에만 |
| `accent-dim` | `#F5D200` | accent hover/active 상태 |

### Status
| 토큰 | Hex | 용도 |
|---|---|---|
| `success` | `#22C55E` | 성공, 완료 상태 |
| `warning` | `#F59E0B` | 경고, 주의 상태 |
| `error` | `#EF4444` | 오류, 삭제 액션 |

## 폰트

- **Pretendard** — 단일 폰트 패밀리. CDN(`jsdelivr`) 로드.
- `font-body` 변수 하나만 사용. display/display 폰트 없음.

### 타이포 스케일
| 용도 | 크기 | 굵기 | 줄간격 |
|---|---|---|---|
| Heading 1 | 36px | 700 | 1.2 |
| Heading 2 | 28px | 700 | 1.2 |
| Heading 3 | 22px | 600 | 1.3 |
| Body | 15px | 400 | 1.6 |
| Caption | 13px | 400 | 1.4 |
| Label | 12px | 500 | 1.4 |

## Border Radius

| 토큰 | 값 | 용도 |
|---|---|---|
| `radius-sm` | 4px | 태그, 배지 |
| `radius-md` | 8px | 입력 필드, 작은 카드 |
| `radius-lg` | 16px | 카드, 패널 |
| `radius-xl` | 24px | 모달, 포스트잇 |
| `radius-2xl` | 32px | 큰 카드, 바텀시트 |
| `radius-full` | 9999px | 버튼, 아바타, 칩 |

## Shadow

| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow-sm` | `0 1px 4px rgba(0,0,0,0.04)` | 카드 기본 |
| `shadow-md` | `0 4px 16px rgba(0,0,0,0.06)` | 카드 hover, 드롭다운 |
| `shadow-lg` | `0 8px 32px rgba(0,0,0,0.07)` | 모달, 플로팅 패널 |
| `shadow-3d` | `0 8px 32px rgba(0,0,0,0.07)` | 버튼 기본 그림자 |
| `shadow-3d-hover` | `0 12px 40px rgba(0,0,0,0.11)` | 버튼 hover 상태 |

## 버튼 인터랙션 패턴

호버 시 색 변화 대신 물리감 있는 3D 애니메이션을 사용한다.

- **기본:** `var(--shadow-3d)`
- **hover:** `translateY(-2px)` + `var(--shadow-3d-hover)` → 떠오르는 느낌
- **active:** `translateY(4px)` + shadow 제거 → 눌리는 3D 효과
- **transition:** 150ms ease

## 여백

- 기준: **4px 배수 시스템**
- 모든 padding/margin은 4의 배수만 사용 (`p-1`, `p-2`, `p-4`, `p-6`, `p-8` …)

## 컨셉 & 톤

- **3D & 입체감**: 그림자와 translate로 물리적인 버튼 인터랙션을 표현한다.
- **클린 & 모던**: 무채색 중심. 색은 의미가 있을 때만, 극도로 절제해서 사용한다.
- **애니메이션**: 호버는 색 변화가 아닌 움직임으로. 웹이라는 매체의 즐거움을 살린다.
- **명확한 구조**: 그림자와 연한 stroke로 영역을 구분. 복잡한 색상 없이도 위계를 만든다.
