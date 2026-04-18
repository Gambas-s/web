// ============================================================
//  감바쓰 · GAMBASS · Design Tokens  v2
//  모노크롬 + Apple-스타일 3D + 장난기
// ============================================================

export const color = {
  // base paper (layered warm-whites for depth, saturation ≤ 0.003)
  paper:   "#FDFDFC", // canvas / page background
  surface: "#FFFFFF", // elevated card
  sunken:  "#F4F4F2", // recessed wells (input, basket)
  tint:    "#EDEDEA", // subtle fill

  // ink scale (near-blacks with a warm undertone)
  ink:  "#121211", // primary text / hi-contrast
  ink2: "#3A3A38", // secondary text
  ink3: "#6E6E6B", // tertiary / meta
  ink4: "#9E9E9B", // placeholder
  ink5: "#C4C4C0", // hairlines
  ink6: "#E2E2DF", // subtle dividers

  // functional
  hi:    "#0A0A09", // hi-contrast / primary action
  lo:    "#FAFAF8", // invert text on hi
  ember: "#1A1A17", // "불씨" — almost black
} as const;

export const radius = {
  xs:    6,
  sm:    10,
  md:    14,
  lg:    20,
  xl:    28,
  round: 9999,
} as const;

// 4pt grid
export const space = {
  s1:  4,
  s2:  8,
  s3:  12,
  s4:  16,
  s5:  20,
  s6:  24,
  s7:  32,
  s8:  40,
  s9:  48,
  s10: 64,
  s11: 80,
  s12: 120,
} as const;

// Apple-style layered shadows — "그림자로 영역 구분"
export const shadow = {
  sm:     "0 1px 2px rgba(17,17,15,0.04), 0 2px 6px rgba(17,17,15,0.05)",
  md:     "0 2px 4px rgba(17,17,15,0.04), 0 8px 24px rgba(17,17,15,0.07)",
  lg:     "0 4px 8px rgba(17,17,15,0.05), 0 18px 40px rgba(17,17,15,0.10)",
  xl:     "0 8px 16px rgba(17,17,15,0.06), 0 32px 80px rgba(17,17,15,0.14)",
  inset:  "inset 0 1px 2px rgba(17,17,15,0.06), inset 0 0 0 1px rgba(17,17,15,0.03)",
  hair:   "0 0 0 1px rgba(17,17,15,0.06)",
  bounce: "0 2px 4px rgba(17,17,15,0.06), 0 24px 48px rgba(17,17,15,0.12)",
} as const;

export const font = {
  sans: `"Pretendard", "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, "Noto Sans KR", sans-serif`,
  mono: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace`,
} as const;

// Pretendard scale — Apple-ish: tight leading on display, generous on body
export const text = {
  display: { size: 72, line: 1.05, weight: 700, tracking: -0.035 },
  h1:      { size: 48, line: 1.10, weight: 700, tracking: -0.030 },
  h2:      { size: 36, line: 1.15, weight: 700, tracking: -0.025 },
  h3:      { size: 24, line: 1.25, weight: 600, tracking: -0.020 },
  h4:      { size: 18, line: 1.35, weight: 600, tracking: -0.015 },
  bodyLg:  { size: 18, line: 1.55, weight: 400, tracking: -0.010 },
  body:    { size: 15, line: 1.60, weight: 400, tracking: -0.005 },
  caption: { size: 13, line: 1.50, weight: 400, tracking:  0.000 },
  label:   { size: 12, line: 1.40, weight: 500, tracking:  0.010 },
  mono:    { size: 12, line: 1.50, weight: 500, tracking:  0.020 },
} as const;

// Motion — "통통 튀는" 탄성
export const motion = {
  duration: {
    instant: 120, // 버튼 눌림
    quick:   180, // hover, 토글
    base:    260, // 대부분의 전환
    slow:    420, // 모달, 시트
    scene:   720, // 화면 전환, 소각 시작
  },
  easing: {
    standard: "cubic-bezier(0.32, 0.72, 0, 1)", // snappy Apple default
    out:      "cubic-bezier(0.16, 1, 0.3, 1)",  // soft out
    bounce:   "cubic-bezier(0.34, 1.56, 0.64, 1)", // 바구니에 떨어질 때
    squish:   "cubic-bezier(0.87, 0, 0.13, 1)", // 구기기
  },
} as const;
