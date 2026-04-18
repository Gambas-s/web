import { color, radius, shadow, space, text, motion } from './tokens';

// ── Color ────────────────────────────────────────────────────

export const colorGuidelines = [
  { token: 'paper',   hex: color.paper,   group: 'Paper',  usage: '전체 캔버스 / 페이지 배경' },
  { token: 'surface', hex: color.surface, group: 'Paper',  usage: '떠있는 카드' },
  { token: 'sunken',  hex: color.sunken,  group: 'Paper',  usage: '패인 영역 (바구니, 입력창)' },
  { token: 'tint',    hex: color.tint,    group: 'Paper',  usage: '은은한 채움' },
  { token: 'ink',     hex: color.ink,     group: 'Ink',    usage: '기본 텍스트 / 프라이머리 액션 배경' },
  { token: 'ink2',    hex: color.ink2,    group: 'Ink',    usage: '2차 텍스트' },
  { token: 'ink3',    hex: color.ink3,    group: 'Ink',    usage: '3차 / 메타' },
  { token: 'ink4',    hex: color.ink4,    group: 'Ink',    usage: '플레이스홀더' },
  { token: 'ink5',    hex: color.ink5,    group: 'Ink',    usage: '헤어라인' },
  { token: 'ink6',    hex: color.ink6,    group: 'Ink',    usage: '구분선' },
  { token: 'hi',      hex: color.hi,      group: 'Func',   usage: '최고 대비 / primary action' },
  { token: 'lo',      hex: color.lo,      group: 'Func',   usage: 'hi 위의 텍스트 (반전)' },
  { token: 'ember',   hex: color.ember,   group: 'Func',   usage: '"불씨" — 거의 검정' },
] as const;

export const colorRules = [
  'paper 는 전체 배경.',
  'surface 는 떠있는 카드.',
  'sunken 은 패인 영역 (바구니, 입력창).',
  '본문은 ink2, 메타는 ink3.',
  '프라이머리 액션 = ink (solid) 배경 + lo 텍스트.',
  '채도 있는 색은 어떤 경우에도 도입하지 않는다.',
  '계층은 오직 명도·그림자·타입웨이트로 구분한다.',
] as const;

// ── Typography ───────────────────────────────────────────────

export const typographyGuidelines = [
  { label: 'display',  ...text.display, usage: '랜딩 히어로', sample: '오늘, 버릴 감정 있어요?' },
  { label: 'h1',       ...text.h1,      usage: '페이지 제목', sample: '오늘, 버릴 감정 있어요?' },
  { label: 'h2',       ...text.h2,      usage: '섹션 제목',   sample: '길게 눌러 구기기' },
  { label: 'h3',       ...text.h3,      usage: '카드 제목',   sample: '바구니가 가득 찼어요' },
  { label: 'h4',       ...text.h4,      usage: '서브 제목',   sample: '3개 모두 버릴까요?' },
  { label: 'body lg',  ...text.bodyLg,  usage: '리드 본문',   sample: '판단 없이 받아주는 AI 쓰레기통.' },
  { label: 'body',     ...text.body,    usage: '말풍선, 본문', sample: '메시지를 길게 눌러 구겨 바구니에 던지세요.' },
  { label: 'caption',  ...text.caption, usage: '보조 설명',   sample: '소각 후에는 복구할 수 없어요' },
  { label: 'label',    ...text.label,   usage: '버튼, 태그',  sample: 'BASKET' },
  { label: 'mono',     ...text.mono,    usage: '카운터, 메타', sample: 'basket: 3 · 127 burned', isMono: true },
] as const;

// ── Radius ───────────────────────────────────────────────────

export const radiusGuidelines = [
  { token: 'xs',    value: `${radius.xs}px`,    usage: '아이콘 배지, 태그' },
  { token: 'sm',    value: `${radius.sm}px`,    usage: '소형 카드' },
  { token: 'md',    value: `${radius.md}px`,    usage: '입력 필드, 카드' },
  { token: 'lg',    value: `${radius.lg}px`,    usage: '주요 카드' },
  { token: 'xl',    value: `${radius.xl}px`,    usage: '다이얼로그, 시트' },
  { token: 'round', value: `${radius.round}px`, usage: '버튼, 아바타, 칩' },
] as const;

// ── Shadow ───────────────────────────────────────────────────

export const shadowGuidelines = [
  { token: 'sm',     value: shadow.sm,     usage: '헤어라인 카드 (subtle)' },
  { token: 'md',     value: shadow.md,     usage: '기본 카드' },
  { token: 'lg',     value: shadow.lg,     usage: 'hover / 강조' },
  { token: 'xl',     value: shadow.xl,     usage: '다이얼로그 / 시트' },
  { token: 'inset',  value: shadow.inset,  usage: '패인 영역 (입력창, 바구니)' },
  { token: 'hair',   value: shadow.hair,   usage: '1px 테두리 대신' },
  { token: 'bounce', value: shadow.bounce, usage: '바운스 프리뷰' },
] as const;

// ── Spacing ──────────────────────────────────────────────────

export const spacingGuidelines = Object.entries(space).map(([key, px]) => ({
  label: key,
  px,
})) as { label: string; px: number }[];

// ── Motion ───────────────────────────────────────────────────

export const motionGuidelines = {
  durations: Object.entries(motion.duration).map(([key, ms]) => ({ key, ms })),
  easings:   Object.entries(motion.easing).map(([key, curve]) => ({ key, curve })),
  principles: [
    '명시적 액션만 과장한다 — 자동 전환은 차분하게, 사용자가 버리고 태우는 순간만 통통 튀게.',
    '모든 터치는 즉각 반응 — 버튼은 누르는 즉시 scale(0.96)으로 응답.',
    '물리 법칙은 부드럽게 어긴다 — bounce 이징으로 종이가 살아있는 것처럼.',
    '소각 중엔 조작 금지 — 약 3초간 화면 전체가 의식(ritual).',
    'prefers-reduced-motion 은 존중 — 흔들림 애니메이션은 opacity 로 대체.',
  ],
} as const;

// ── Concept & Voice ──────────────────────────────────────────

export const conceptGuidelines = [
  { keyword: '모노크롬',   desc: '채도 있는 색은 절대 쓰지 않는다. 계층은 그림자·명도·웨이트가 만든다.' },
  { keyword: 'Apple 입체감', desc: '레이어드 그림자로 카드를 공중에 띄운다. border-left 카드는 안티패턴.' },
  { keyword: '장난기',     desc: '구기고 태우는 놀이감. 통통 튀는 탄성 애니메이션으로 표현한다.' },
  { keyword: '의식(ritual)', desc: '소각은 카타르시스 있는 의식. 짧고 가볍게, 판단 없이.' },
] as const;

export const voiceGuidelines = {
  do:    ['오늘, 버릴 감정 있어요?', '깨끗해졌어요.', 'GAMBASS'],
  dont:  ['고객님의 소중한 데이터를 안전하게 처리합니다.', '작업이 완료되었습니다.'],
  cta:   ['버리러 가기', '비우기 →', '소각', '한 번 더', '취소', '홈으로'],
  headlines: ['오늘, 버릴 감정 있어요?', '깨끗해졌어요', '3개 모두 버릴까요?', '바구니가 가득 찼어요'],
  meta:  ['basket: 3', '2 / 3 burned', '소각 중…', '24시간 자동 소각'],
} as const;

// ── Checklist ─────────────────────────────────────────────────

export const shipChecklist = [
  '컬러는 모노크롬만 썼는가',
  'Pretendard 를 로드했는가',
  'primary 버튼은 한 화면에 1개인가',
  '이모지 대신 오브제/아이콘을 썼는가',
  '카드에는 --sh-md 이상이 있는가',
  '본문 자간이 음수로 잡혀있는가',
  '터치 타겟이 44px 이상인가',
  '과장된 모션은 액션 결과에만 썼는가',
  '카피가 판단하지 않는 톤인가',
] as const;
