import { colorGroups, radius, shadows } from './tokens';

export const colorGuidelines: Array<{
  token: string;
  hex: string;
  group: string;
  usage: string;
}> = [
  { token: 'neutral-0',   hex: colorGroups.neutral['neutral-0'],   group: 'Neutral', usage: '페이지 배경' },
  { token: 'neutral-50',  hex: colorGroups.neutral['neutral-50'],  group: 'Neutral', usage: '섹션 배경, 카드 배경' },
  { token: 'neutral-100', hex: colorGroups.neutral['neutral-100'], group: 'Neutral', usage: '입력 필드 배경' },
  { token: 'neutral-200', hex: colorGroups.neutral['neutral-200'], group: 'Neutral', usage: '구분선, 테두리' },
  { token: 'neutral-300', hex: colorGroups.neutral['neutral-300'], group: 'Neutral', usage: '비활성 테두리' },
  { token: 'neutral-400', hex: colorGroups.neutral['neutral-400'], group: 'Neutral', usage: '플레이스홀더' },
  { token: 'neutral-500', hex: colorGroups.neutral['neutral-500'], group: 'Neutral', usage: '보조 텍스트' },
  { token: 'neutral-600', hex: colorGroups.neutral['neutral-600'], group: 'Neutral', usage: '서브 텍스트' },
  { token: 'neutral-700', hex: colorGroups.neutral['neutral-700'], group: 'Neutral', usage: '강조 텍스트' },
  { token: 'neutral-800', hex: colorGroups.neutral['neutral-800'], group: 'Neutral', usage: '제목' },
  { token: 'neutral-900', hex: colorGroups.neutral['neutral-900'], group: 'Neutral', usage: '기본 텍스트' },
  { token: 'accent',      hex: colorGroups.accent['accent'],       group: 'Accent',  usage: '메인 캐릭터 컬러 — 극소량 사용' },
  { token: 'accent-dim',  hex: colorGroups.accent['accent-dim'],   group: 'Accent',  usage: '액센트 hover/active 상태' },
  { token: 'success',     hex: colorGroups.status['success'],      group: 'Status',  usage: '성공, 완료 상태' },
  { token: 'warning',     hex: colorGroups.status['warning'],      group: 'Status',  usage: '경고, 주의 상태' },
  { token: 'error',       hex: colorGroups.status['error'],        group: 'Status',  usage: '오류, 삭제 액션' },
];

export const typographyGuidelines = [
  {
    label: 'Heading 1',
    size: '36px',
    weight: '700',
    lineHeight: '1.2',
    usage: '페이지 제목',
    sample: '감바쓰: 나쁜 감정은 쓰레기통으로',
  },
  {
    label: 'Heading 2',
    size: '28px',
    weight: '700',
    lineHeight: '1.2',
    usage: '섹션 제목',
    sample: '오늘 하루 어땠어?',
  },
  {
    label: 'Heading 3',
    size: '22px',
    weight: '600',
    lineHeight: '1.3',
    usage: '카드 제목, 모달 제목',
    sample: '지금 바로 털어놔봐.',
  },
  {
    label: 'Body',
    size: '15px',
    weight: '400',
    lineHeight: '1.6',
    usage: '채팅 말풍선, 본문 전체',
    sample: '야, 오늘 진짜 힘들었지? 다 털어놔봐. 뭐가 그렇게 스트레스야?',
  },
  {
    label: 'Caption',
    size: '13px',
    weight: '400',
    lineHeight: '1.4',
    usage: '보조 설명, 타임스탬프',
    sample: '방금 전 · 읽음',
  },
  {
    label: 'Label',
    size: '12px',
    weight: '500',
    lineHeight: '1.4',
    usage: '버튼 라벨, 태그, 배지',
    sample: 'Send · Cancel · New Chat',
  },
] as const;

export const radiusGuidelines = [
  { token: 'radius-sm',   value: radius['radius-sm'],   label: 'sm — 4px',   usage: '태그, 배지' },
  { token: 'radius-md',   value: radius['radius-md'],   label: 'md — 8px',   usage: '입력 필드, 작은 카드' },
  { token: 'radius-lg',   value: radius['radius-lg'],   label: 'lg — 16px',  usage: '카드, 패널' },
  { token: 'radius-xl',   value: radius['radius-xl'],   label: 'xl — 24px',  usage: '모달, 포스트잇' },
  { token: 'radius-2xl',  value: radius['radius-2xl'],  label: '2xl — 32px', usage: '큰 카드, 바텀시트' },
  { token: 'radius-full', value: radius['radius-full'], label: 'full',        usage: '버튼, 아바타, 칩' },
] as const;

export const shadowGuidelines = [
  { token: 'shadow-sm',  value: shadows['shadow-sm'],  usage: '미세한 부상감 — 카드 기본' },
  { token: 'shadow-md',  value: shadows['shadow-md'],  usage: '카드 hover, 드롭다운' },
  { token: 'shadow-lg',  value: shadows['shadow-lg'],  usage: '모달, 플로팅 패널' },
  { token: 'shadow-3d',  value: shadows['shadow-3d'],  usage: '버튼 3D 효과 — 기본 상태' },
] as const;

export const spacingGuidelines = [
  { label: 'p-1',  px: 4,  tailwind: 'p-1' },
  { label: 'p-2',  px: 8,  tailwind: 'p-2' },
  { label: 'p-3',  px: 12, tailwind: 'p-3' },
  { label: 'p-4',  px: 16, tailwind: 'p-4' },
  { label: 'p-6',  px: 24, tailwind: 'p-6' },
  { label: 'p-8',  px: 32, tailwind: 'p-8' },
  { label: 'p-10', px: 40, tailwind: 'p-10' },
  { label: 'p-12', px: 48, tailwind: 'p-12' },
] as const;

export const conceptGuidelines = [
  { keyword: '3D & 입체감',    desc: '그림자와 translate로 물리적인 버튼 인터랙션을 표현한다.' },
  { keyword: '클린 & 모던',    desc: '무채색 중심. 색은 의미가 있을 때만, 극도로 절제해서 사용한다.' },
  { keyword: '애니메이션',     desc: '호버는 색 변화가 아닌 움직임으로. 웹이라는 매체의 즐거움을 살린다.' },
  { keyword: '명확한 구조',    desc: '그림자와 연한 stroke로 영역을 구분. 복잡한 색상 없이도 위계를 만든다.' },
] as const;
