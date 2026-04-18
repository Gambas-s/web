/**
 * tokens.ts → globals.css @theme 블록 자동 생성
 * pnpm generate-tokens  (predev / prebuild 에서 자동 실행)
 */
import { color, radius, shadow, font } from '../src/design/tokens';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '..');
const CSS_PATH = resolve(ROOT, 'src/app/globals.css');

/* ─── @theme 블록 생성 ─── */
const lines: string[] = ['@theme {'];

const push = (s: string) => lines.push(`  ${s}`);
const blank = () => lines.push('');

push('/* Color — monochrome only */');
for (const [key, hex] of Object.entries(color)) {
  push(`--color-${key}: ${hex};`);
}

blank();
push('/* Font */');
push(`--font-sans: ${font.sans};`);
push(`--font-mono: ${font.mono};`);

blank();
push('/* Radius */');
for (const [key, value] of Object.entries(radius)) {
  push(`--radius-${key}: ${typeof value === 'number' ? value + 'px' : value};`);
}

blank();
push('/* Shadow */');
for (const [key, value] of Object.entries(shadow)) {
  push(`--shadow-${key}: ${value};`);
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

// @theme 블록의 닫는 } 찾기 (중첩 없음 가정)
let depth = 0;
let end = start;
for (let i = start; i < css.length; i++) {
  if (css[i] === '{') depth++;
  else if (css[i] === '}') {
    depth--;
    if (depth === 0) { end = i + 1; break; }
  }
}

const updated = css.slice(0, start) + themeBlock + css.slice(end);
writeFileSync(CSS_PATH, updated, 'utf8');
console.log('✓  tokens.ts → globals.css @theme 동기화 완료');
