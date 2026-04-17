export const colorGroups = {
  neutral: {
    'neutral-0':   '#FFFFFF',
    'neutral-50':  '#FAFAFA',
    'neutral-100': '#F4F4F5',
    'neutral-200': '#E4E4E7',
    'neutral-300': '#D1D1D6',
    'neutral-400': '#A1A1AA',
    'neutral-500': '#71717A',
    'neutral-600': '#52525B',
    'neutral-700': '#3F3F46',
    'neutral-800': '#27272A',
    'neutral-900': '#18181B',
  },
  accent: {
    'accent':     '#FFDF1E',
    'accent-dim': '#F5D200',
  },
  status: {
    'success': '#22C55E',
    'warning': '#F59E0B',
    'error':   '#EF4444',
  },
} as const;

export const colors = {
  ...colorGroups.neutral,
  ...colorGroups.accent,
  ...colorGroups.status,
} as const;

export const radius = {
  'radius-sm':   '4px',
  'radius-md':   '8px',
  'radius-card': '12px',
  'radius-lg':   '16px',
  'radius-xl':   '24px',
  'radius-2xl':  '32px',
  'radius-full': '9999px',
} as const;

export const shadows = {
  'shadow-sm':       '0 1px 4px rgba(0,0,0,0.04)',
  'shadow-md':       '0 4px 16px rgba(0,0,0,0.06)',
  'shadow-lg':       '0 8px 32px rgba(0,0,0,0.07)',
  'shadow-3d':       '0 8px 32px rgba(0,0,0,0.07)',
  'shadow-3d-hover': '0 12px 40px rgba(0,0,0,0.11)',
} as const;

export const fontFamily = {
  body: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
} as const;

export const typography = {
  'text-xs':   '0.75rem',
  'text-sm':   '0.8125rem',
  'text-base': '0.9375rem',
  'text-lg':   '1.125rem',
  'text-xl':   '1.375rem',
  'text-2xl':  '1.75rem',
  'text-3xl':  '2.25rem',
} as const;

export const overlays = {
  'overlay-dot':     'rgba(255,255,255,0.07)',
  'overlay-surface': 'rgba(255,255,255,0.05)',
  'overlay-border':  'rgba(255,255,255,0.10)',
  'overlay-glow':    'rgba(255,255,255,0.15)',
} as const;

export const spacing = {
  base: 4,
} as const;
