/**
 * tokens.ts → globals.css @theme 블록 자동 생성
 * pnpm generate-tokens  (predev / prebuild 에서 자동 실행)
 */
import { colorGroups, radius, shadows, fontFamily, typography } from '../src/design/tokens';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const CSS_PATH = resolve(ROOT, 'src/app/globals.css');

/* ─── @theme 블록 생성 ─── */
const lines: string[] = ['@theme {'];

const push = (s: string) => lines.push(`  ${s}`);
const blank = () => lines.push('');

push('/* Neutral */');
for (const [token, hex] of Object.entries(colorGroups.neutral)) {
  push(`--color-${token}: ${hex};`);
}

blank();
push('/* Accent */');
for (const [token, hex] of Object.entries(colorGroups.accent)) {
  push(`--color-${token}: ${hex};`);
}

blank();
push('/* Status */');
for (const [token, hex] of Object.entries(colorGroups.status)) {
  push(`--color-${token}: ${hex};`);
}

blank();
push('/* Font */');
push(`--font-body: ${fontFamily.body.join(', ')};`);

blank();
push('/* Border radius */');
for (const [token, value] of Object.entries(radius)) {
  push(`--${token}: ${value};`);
}

blank();
push('/* Shadows */');
for (const [token, value] of Object.entries(shadows)) {
  push(`--${token}: ${value};`);
}

blank();
push('/* Typography scale */');
for (const [token, value] of Object.entries(typography)) {
  push(`--${token}: ${value};`);
}

lines.push('}');
const themeBlock = lines.join('\n');

/* ─── globals.css 의 @theme { ... } 교체 ─── */
const css = readFileSync(CSS_PATH, 'utf8');

const start = css.indexOf('@theme {');
if (start === -1) {
  console.error('❌  @theme 블록을 찾지 못했습니다. globals.css를 확인하세요.');
  process.exit(1);
}

// @theme 안에 중첩 괄호 없음 — 첫 번째 } 가 닫는 괄호
const end = css.indexOf('}', start) + 1;
const updated = css.slice(0, start) + themeBlock + css.slice(end);

writeFileSync(CSS_PATH, updated, 'utf8');
console.log('✓  tokens.ts → globals.css @theme 동기화 완료');
