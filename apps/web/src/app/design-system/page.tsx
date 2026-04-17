'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { colorGroups, shadows } from '@/design/tokens';
import { MessageDock } from '@/components/ui/message-dock';
import {
  colorGuidelines,
  conceptGuidelines,
  radiusGuidelines,
  shadowGuidelines,
  spacingGuidelines,
  typographyGuidelines,
} from '@/design/guidelines';

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* ─── Animation wrapper ─── */
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.1 });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 28 }}
      animate={inView || prefersReduced ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: prefersReduced ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Section wrapper ─── */
function Section({
  number, title, subtitle, children,
}: {
  number: string; title: string; subtitle?: string; children: React.ReactNode;
}) {
  return (
    <section style={{ paddingTop: 96, paddingBottom: 24 }}>
      <FadeUp>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 14,
          paddingBottom: 20,
          borderBottom: '1.5px solid var(--color-neutral-200)',
          marginBottom: 48,
        }}>
          <span style={{
            fontFamily: 'monospace', fontSize: 11, fontWeight: 600,
            color: 'var(--color-neutral-400)', letterSpacing: '0.1em', flexShrink: 0,
          }}>
            {number}
          </span>
          <h2 style={{
            fontSize: 24, fontWeight: 700, color: 'var(--color-neutral-900)',
            letterSpacing: '-0.01em', margin: 0,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ fontSize: 13, color: 'var(--color-neutral-400)', marginLeft: 'auto', flexShrink: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      </FadeUp>
      {children}
    </section>
  );
}

/* ─── 3D Button ─── */
function Button3D({
  children, variant = 'primary', size = 'md', onClick,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'disabled';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const bg =
    variant === 'primary'   ? 'var(--color-neutral-900)' :
    variant === 'secondary' ? 'var(--color-neutral-0)'   :
    variant === 'accent'    ? 'var(--color-accent)'      :
                              'var(--color-neutral-100)';

  const textColor =
    variant === 'primary'  ? 'var(--color-neutral-0)'   :
    variant === 'disabled' ? 'var(--color-neutral-400)' :
                             'var(--color-neutral-900)';

  const borderColor =
    variant === 'disabled' ? 'var(--color-neutral-200)' : 'var(--color-neutral-900)';

  const h  = size === 'sm' ? 40 : size === 'lg' ? 52 : 44;
  const px = size === 'sm' ? 20 : size === 'lg' ? 32 : 24;
  const fs = size === 'sm' ? 13 : size === 'lg' ? 16 : 14;

  const transform = variant === 'disabled' ? 'none' : pressed ? 'translateY(4px)' : hovered ? 'translateY(-2px)' : 'translateY(0)';
  const shadow    = variant === 'disabled' ? 'none' : pressed ? 'none' : hovered ? 'var(--shadow-3d-hover)' : 'var(--shadow-3d)';

  return (
    <button
      disabled={variant === 'disabled'}
      onClick={onClick}
      style={{
        height: h, padding: `0 ${px}px`,
        borderRadius: 'var(--radius-full)',
        background: bg, color: textColor,
        fontSize: fs, fontWeight: 600,
        fontFamily: 'var(--font-body)',
        border: `2px solid ${borderColor}`,
        cursor: variant === 'disabled' ? 'not-allowed' : 'pointer',
        transform, boxShadow: shadow,
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {children}
    </button>
  );
}

/* ─── Page ─── */
export default function DesignSystemPage() {
  const [clickCount, setClickCount] = useState(0);

  const clickMessages = [
    '눌러보세요', '한 번 더?', '좋아, 한 번 더.',
    '이제 그만해.', '나 바쁘니까 나중에 해.', '진심이야?', '…알아서 해.',
  ];
  const msg = clickMessages[Math.min(clickCount, clickMessages.length - 1)];

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      <a
        href="#main-content"
        style={{
          position: 'absolute', top: -100, left: 16, zIndex: 9999,
          padding: '8px 16px',
          background: 'var(--color-accent)', color: 'var(--color-neutral-900)',
          fontWeight: 700, fontSize: 14,
          borderRadius: 'var(--radius-md)',
          textDecoration: 'none',
          transition: 'top 0.1s',
        }}
        onFocus={(e) => { e.currentTarget.style.top = '16px'; }}
        onBlur={(e) => { e.currentTarget.style.top = '-100px'; }}
      >
        본문으로 이동
      </a>

      {/* ───────────── HERO ───────────── */}
      <header style={{
        background: 'var(--color-neutral-900)',
        padding: 'clamp(64px, 10vw, 96px) clamp(24px, 5vw, 64px) clamp(72px, 11vw, 108px)',
        overflow: 'hidden', position: 'relative',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, var(--overlay-dot) 1px, transparent 1px)',
          backgroundSize: '32px 32px', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1024, margin: '0 auto', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            style={{ marginBottom: 36 }}
          >
            <span style={{
              display: 'inline-block',
              background: 'var(--color-accent)',
              color: 'var(--color-neutral-900)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
              textTransform: 'uppercase', padding: '5px 14px',
              borderRadius: 'var(--radius-full)',
            }}>
              Design System · v1
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: EASE_OUT }}
            style={{
              fontSize: 'clamp(60px, 10vw, 112px)', fontWeight: 800,
              color: 'var(--color-neutral-0)', lineHeight: 1.0,
              letterSpacing: '-0.025em',
              textShadow: '6px 6px 0px var(--color-accent)',
              marginBottom: 28,
            }}
          >
            감바쓰
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
            style={{ fontSize: 16, color: 'var(--color-neutral-400)', fontWeight: 400, lineHeight: 1.75, maxWidth: 460 }}
          >
            3D · 클린 · 물리감 있는 인터랙션.
            <br />
            피그마 대신 이 페이지가 디자인의 단일 진실 공급원입니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{ marginTop: 48, display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {['tokens.ts', 'guidelines.ts', 'globals.css'].map((f) => (
              <span key={f} style={{
                fontSize: 12, fontFamily: 'monospace',
                color: 'var(--color-neutral-400)',
                background: 'var(--overlay-surface)',
                border: '1px solid var(--overlay-border)',
                padding: '4px 10px', borderRadius: 6,
              }}>
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ───────────── BODY ───────────── */}
      <main id="main-content" style={{ background: 'var(--color-neutral-0)' }}>
        <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px) 120px' }}>

          {/* ── 01. Color Palette ── */}
          <Section number="01" title="Color Palette" subtitle="무채색 중심 — 액센트는 극소량">
            <FadeUp>
              <div style={{ marginBottom: 48 }}>
                <p style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-400)',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
                }}>
                  Neutral
                </p>
                <div style={{
                  display: 'flex', height: 80, borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden', border: '1.5px solid var(--color-neutral-200)',
                }}>
                  {Object.entries(colorGroups.neutral).map(([token, hex]) => (
                    <div key={token} style={{ flex: 1, background: hex }} title={`${token}: ${hex}`} />
                  ))}
                </div>
                <div style={{ display: 'flex', marginTop: 8 }}>
                  {Object.entries(colorGroups.neutral).map(([token]) => (
                    <div key={token} style={{ flex: 1, textAlign: 'center' }}>
                      <p style={{ fontSize: 9, color: 'var(--color-neutral-400)', fontFamily: 'monospace' }}>
                        {token.replace('neutral-', '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.1}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
                {/* Accent */}
                <div>
                  <p style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-400)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
                  }}>Accent</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {Object.entries(colorGroups.accent).map(([token, hex]) => {
                      const g = colorGuidelines.find((c) => c.token === token);
                      return (
                        <div key={token} style={{ flex: 1 }}>
                          <div style={{
                            height: 88, background: hex,
                            borderRadius: 'var(--radius-card)',
                            border: '1.5px solid var(--color-neutral-200)',
                            boxShadow: token === 'accent' ? 'var(--shadow-3d)' : 'none',
                            marginBottom: 10,
                          }} />
                          <p style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-neutral-800)' }}>{token}</p>
                          <p style={{ fontSize: 10, color: 'var(--color-neutral-400)', fontFamily: 'monospace', marginTop: 2 }}>{hex}</p>
                          {g?.usage && <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: 5, lineHeight: 1.4 }}>{g.usage}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <p style={{
                    fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-400)',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
                  }}>Status</p>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {Object.entries(colorGroups.status).map(([token, hex]) => {
                      const g = colorGuidelines.find((c) => c.token === token);
                      return (
                        <div key={token} style={{ flex: 1 }}>
                          <div style={{
                            height: 88, background: hex,
                            borderRadius: 'var(--radius-card)',
                            border: '1.5px solid var(--color-neutral-200)',
                            marginBottom: 10,
                          }} />
                          <p style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: 'var(--color-neutral-800)' }}>{token}</p>
                          <p style={{ fontSize: 10, color: 'var(--color-neutral-400)', fontFamily: 'monospace', marginTop: 2 }}>{hex}</p>
                          {g?.usage && <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', marginTop: 5, lineHeight: 1.4 }}>{g.usage}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div style={{
                marginTop: 32, padding: '14px 18px',
                background: 'var(--color-neutral-50)',
                borderRadius: 'var(--radius-card)',
                border: '1.5px solid var(--color-neutral-200)',
                fontSize: 13, color: 'var(--color-neutral-600)', lineHeight: 1.6,
              }}>
                <strong style={{ color: 'var(--color-neutral-900)' }}>원칙:</strong> neutral 계열을 기본으로.
                accent는 <em>극소량</em>만 — 주목을 끌어야 할 단 하나의 요소에.
              </div>
            </FadeUp>
          </Section>

          {/* ── 02. Typography ── */}
          <Section number="02" title="Typography" subtitle="Pretendard · 단일 패밀리">
            <div>
              {typographyGuidelines.map((item, i) => (
                <FadeUp key={item.label} delay={Math.min(i * 0.05, 0.2)}>
                  <div style={{
                    display: 'grid', gridTemplateColumns: '128px 1fr', gap: 24,
                    alignItems: 'start', padding: '22px 0',
                    borderBottom: '1px solid var(--color-neutral-100)',
                  }}>
                    <div style={{ paddingTop: 4 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-neutral-800)', letterSpacing: '0.01em' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-neutral-400)', fontFamily: 'monospace', marginTop: 5, lineHeight: 1.7 }}>
                        {item.size} · {item.weight}w<br />lh {item.lineHeight}<br />{item.usage}
                      </p>
                    </div>
                    <p style={{ fontSize: item.size, fontWeight: item.weight, lineHeight: item.lineHeight, color: 'var(--color-neutral-900)', margin: 0 }}>
                      {item.sample}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </Section>

          {/* ── 03. Border Radius ── */}
          <Section number="03" title="Border Radius" subtitle="직각보다 둥근 느낌">
            <FadeUp>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {radiusGuidelines.map((item, i) => (
                  <div key={item.token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 56 + i * 8, height: 56 + i * 8,
                      background: 'var(--color-neutral-100)',
                      border: '1.5px solid var(--color-neutral-200)',
                      borderRadius: item.value,
                    }} />
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-neutral-800)', fontFamily: 'monospace' }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-neutral-500)', marginTop: 3 }}>{item.usage}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </Section>

          {/* ── 04. Spacing ── */}
          <Section number="04" title="Spacing" subtitle="4px 배수 시스템">
            <FadeUp>
              <div style={{
                background: 'var(--color-neutral-50)',
                border: '1.5px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-lg)', padding: '28px',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {spacingGuidelines.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ width: 36, fontSize: 12, fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-neutral-600)', flexShrink: 0 }}>
                      {item.label}
                    </span>
                    <div style={{
                      height: 12, borderRadius: 'var(--radius-full)',
                      background: 'var(--color-neutral-900)',
                      width: `${item.px * 3}px`, flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, color: 'var(--color-neutral-400)', fontFamily: 'monospace' }}>
                      {item.px}px
                    </span>
                  </div>
                ))}
              </div>
            </FadeUp>
          </Section>

          {/* ── 05. Shadow ── */}
          <Section number="05" title="Shadow" subtitle="그림자로 영역과 깊이를 만든다">
            <FadeUp>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
                {shadowGuidelines.map((item) => (
                  <div key={item.token} style={{
                    background: 'var(--color-neutral-0)',
                    borderRadius: 'var(--radius-lg)', padding: '28px 24px',
                    border: '1.5px solid var(--color-neutral-200)',
                    boxShadow: `var(--${item.token})`,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', color: 'var(--color-neutral-900)' }}>
                      {item.token}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-neutral-500)', marginTop: 6 }}>{item.usage}</p>
                    <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-neutral-400)', marginTop: 10, wordBreak: 'break-all', lineHeight: 1.6 }}>
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </FadeUp>
          </Section>

          {/* ── 06. Interaction ── */}
          <Section number="06" title="Interaction" subtitle="움직임으로 말한다">
            <FadeUp>
              <div style={{
                background: 'var(--color-neutral-50)',
                border: '1.5px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-xl)', padding: '56px 32px 48px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', marginBottom: 40, height: 24 }}>
                  {msg}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
                  <Button3D variant="primary"   size="lg" onClick={() => setClickCount((n) => n + 1)}>Primary</Button3D>
                  <Button3D variant="secondary" size="lg">Secondary</Button3D>
                  <Button3D variant="accent"    size="lg">Accent</Button3D>
                  <Button3D variant="disabled"  size="lg">Disabled</Button3D>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, textAlign: 'left' }}>
                  {[
                    ['기본',   `var(--shadow-3d) → ${shadows['shadow-3d']}`],
                    ['hover',  'translateY(-2px) + var(--shadow-3d-hover)'],
                    ['active', 'translateY(4px) + shadow 제거'],
                  ].map(([label, desc]) => (
                    <div key={label} style={{
                      padding: '14px 16px',
                      background: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--color-neutral-200)',
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-800)', marginBottom: 5, fontFamily: 'monospace' }}>
                        {label}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-neutral-500)', lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </Section>

          {/* ── 07. Concept & Tone ── */}
          <Section number="07" title="컨셉 & 톤" subtitle="이 제품이 추구하는 것">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
              {conceptGuidelines.map((item, i) => (
                <FadeUp key={item.keyword} delay={Math.min(i * 0.08, 0.2)}>
                  <div style={{
                    padding: '32px 28px',
                    background: 'var(--color-neutral-0)',
                    borderRadius: 'var(--radius-xl)',
                    border: '1.5px solid var(--color-neutral-200)',
                    boxShadow: 'var(--shadow-3d)',
                    height: '100%',
                  }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-neutral-900)', marginBottom: 12, letterSpacing: '-0.01em' }}>
                      {item.keyword}
                    </p>
                    <p style={{ fontSize: 14, color: 'var(--color-neutral-500)', lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                </FadeUp>
              ))}
            </div>
          </Section>

          {/* ── 08. MessageDock ── */}
          <Section number="08" title="MessageDock" subtitle="채팅 입력 독 컴포넌트">
            <FadeUp>
              <div style={{
                background: 'var(--color-neutral-50)',
                border: '1.5px solid var(--color-neutral-200)',
                borderRadius: 'var(--radius-xl)', padding: '48px 32px 40px',
                display: 'flex', flexDirection: 'column', gap: 40,
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 80 }}>
                  <MessageDock
                    position="inline" theme="light" enableAnimations closeOnSend={false}
                    placeholder={(name) => `${name}에게 메시지...`}
                    onMessageSend={(msg, char) => console.log('[MessageDock]', char.name, ':', msg)}
                  />
                </div>

                <p style={{ fontSize: 12, color: 'var(--color-neutral-400)', textAlign: 'center', marginTop: -8 }}>
                  캐릭터를 클릭하면 입력창이 열립니다 · Enter 또는 전송 버튼으로 메시지 전송
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                  {[
                    ['border',     `1.5px solid var(--color-neutral-200)`, 'neutral-200 — 영역 구분 stroke'],
                    ['shadow',     `var(--shadow-3d) → ${shadows['shadow-3d']}`,  'shadow-3d 토큰'],
                    ['online dot', `var(--color-success)`,                  'success 토큰'],
                  ].map(([label, value, desc]) => (
                    <div key={label} style={{
                      padding: '14px 16px',
                      background: 'var(--color-neutral-0)',
                      borderRadius: 'var(--radius-card)',
                      border: '1px solid var(--color-neutral-200)',
                    }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-neutral-800)', fontFamily: 'monospace', marginBottom: 4 }}>
                        {label}
                      </p>
                      <p style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--color-neutral-400)', marginBottom: 3, wordBreak: 'break-all' }}>
                        {value}
                      </p>
                      <p style={{ fontSize: 11, color: 'var(--color-neutral-500)' }}>{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </Section>

        </div>
      </main>

      {/* ───────────── FOOTER ───────────── */}
      <footer style={{
        background: 'var(--color-neutral-900)',
        padding: '44px clamp(24px, 5vw, 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 24,
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-neutral-0)' }}>
            감바쓰 디자인 시스템
          </p>
          <p style={{ fontSize: 12, color: 'var(--color-neutral-600)', marginTop: 5, fontFamily: 'monospace' }}>
            tokens.ts → guidelines.ts → globals.css → this page
          </p>
        </div>
        <FooterLink href="/">→ 감바쓰 홈으로</FooterLink>
      </footer>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <a
      href={href}
      style={{
        display: 'inline-block', height: 44, lineHeight: '40px',
        padding: '0 24px', borderRadius: 'var(--radius-full)',
        background: 'var(--color-accent)', color: 'var(--color-neutral-900)',
        fontSize: 14, fontWeight: 700,
        border: '2px solid var(--color-accent)',
        textDecoration: 'none',
        boxShadow: pressed ? 'none' : hovered ? `4px 6px 0px var(--overlay-glow)` : `4px 4px 0px var(--overlay-glow)`,
        transform: pressed ? 'translateY(4px)' : hovered ? 'translateY(-2px)' : 'none',
        transition: 'transform 150ms ease, box-shadow 150ms ease',
        userSelect: 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
    >
      {children}
    </a>
  );
}
