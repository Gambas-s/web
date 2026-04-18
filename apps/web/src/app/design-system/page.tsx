'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRef, useState } from 'react';
import {
  colorGuidelines,
  colorRules,
  conceptGuidelines,
  motionGuidelines,
  radiusGuidelines,
  shadowGuidelines,
  shipChecklist,
  spacingGuidelines,
  typographyGuidelines,
  voiceGuidelines,
} from '@/design/guidelines';

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.08 });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 20 }}
      animate={inView || prefersReduced ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: prefersReduced ? 0 : delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

function Section({
  kicker, title, intro, children,
}: {
  kicker: string; title: string; intro?: string; children: React.ReactNode;
}) {
  return (
    <section style={{ paddingTop: 96, paddingBottom: 8 }}>
      <FadeUp>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
            color: 'var(--c-ink3)', letterSpacing: '0.1em', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            {kicker}
          </div>
          <h2 style={{
            fontSize: 36, fontWeight: 700, color: 'var(--c-ink)',
            letterSpacing: '-0.025em', lineHeight: 1.15, margin: '0 0 16px',
          }}>
            {title}
          </h2>
          {intro && (
            <p style={{
              fontSize: 15, color: 'var(--c-ink3)', lineHeight: 1.65,
              maxWidth: 680, margin: 0,
            }}>
              {intro}
            </p>
          )}
          <div style={{
            height: 1, background: 'var(--c-ink6)', marginTop: 28,
          }} />
        </div>
      </FadeUp>
      {children}
    </section>
  );
}

function Card({
  title, meta, children, dark, tone,
}: {
  title?: string; meta?: string; children: React.ReactNode;
  dark?: boolean; tone?: 'sunken';
}) {
  const bg = dark ? 'var(--c-ink)' : tone === 'sunken' ? 'var(--c-sunken)' : 'var(--c-surface)';
  return (
    <div style={{
      background: bg,
      borderRadius: 20,
      padding: 24,
      boxShadow: dark ? 'none' : 'var(--sh-md)',
    }}>
      {title && (
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16,
        }}>
          <span style={{
            fontSize: 14, fontWeight: 600,
            color: dark ? 'var(--c-lo)' : 'var(--c-ink)',
          }}>{title}</span>
          {meta && (
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 11,
              color: dark ? 'rgba(255,255,255,0.4)' : 'var(--c-ink3)',
              letterSpacing: '0.06em',
            }}>{meta}</span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Swatch({ name, hex, label }: { name: string; hex: string; label?: string }) {
  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden',
      boxShadow: 'var(--sh-sm)',
      background: 'var(--c-surface)',
    }}>
      <div style={{ height: 96, background: hex, borderBottom: '1px solid rgba(17,17,15,0.04)' }} />
      <div style={{ padding: '10px 12px 12px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-ink)' }}>{name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', marginTop: 2 }}>{hex}</div>
        {label && <div style={{ fontSize: 11, color: 'var(--c-ink3)', marginTop: 3 }}>{label}</div>}
      </div>
    </div>
  );
}

function PrimaryBtn({
  size = 'md', children, onClick,
}: {
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  const h  = size === 'sm' ? 32 : size === 'lg' ? 54 : 44;
  const px = size === 'sm' ? 14 : size === 'lg' ? 28 : 20;
  const fs = size === 'sm' ? 13 : size === 'lg' ? 16 : 15;
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        height: h, padding: `0 ${px}px`,
        fontSize: fs, fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.01em',
        border: '1px solid #000',
        borderRadius: 9999,
        background: '#121211', color: '#FDFDFC',
        boxShadow: '0 1px 1px rgba(255,255,255,0.15) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 2px 4px rgba(17,17,15,0.15), 0 8px 20px rgba(17,17,15,0.18)',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: `transform var(--mo-quick) var(--mo-bounce)`,
      }}
    >
      {children}
    </button>
  );
}

function SecondaryBtn({ children }: { children: React.ReactNode }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        height: 44, padding: '0 20px',
        fontSize: 15, fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.01em',
        border: '1px solid rgba(17,17,15,0.08)',
        borderRadius: 9999,
        background: '#FFFFFF', color: '#121211',
        boxShadow: '0 1px 0 rgba(255,255,255,0.8) inset, 0 1px 2px rgba(17,17,15,0.06), 0 4px 10px rgba(17,17,15,0.08)',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: `transform var(--mo-quick) var(--mo-bounce)`,
      }}
    >
      {children}
    </button>
  );
}

function GhostBtn({ children }: { children: React.ReactNode }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        height: 44, padding: '0 20px',
        fontSize: 15, fontWeight: 600,
        fontFamily: 'var(--font-sans)',
        letterSpacing: '-0.01em',
        border: '1px solid rgba(17,17,15,0.12)',
        borderRadius: 9999,
        background: 'transparent', color: '#3A3A38',
        cursor: 'pointer',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        transition: `transform var(--mo-quick) var(--mo-bounce)`,
      }}
    >
      {children}
    </button>
  );
}

function MsgBubble({ me, children }: { me?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start',
      maxWidth: '78%',
      padding: '12px 16px',
      borderRadius: me ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
      background: me ? '#121211' : '#FFFFFF',
      color: me ? '#FDFDFC' : '#121211',
      fontSize: 15, lineHeight: 1.5,
      letterSpacing: '-0.005em',
      boxShadow: me
        ? '0 1px 0 rgba(255,255,255,0.1) inset, 0 4px 12px rgba(17,17,15,0.2)'
        : '0 1px 2px rgba(17,17,15,0.04), 0 4px 12px rgba(17,17,15,0.06)',
      border: me ? '1px solid #000' : '1px solid rgba(17,17,15,0.04)',
    }}>
      {children}
    </div>
  );
}

export default function DesignSystemPage() {
  const paperGroup  = colorGuidelines.filter(c => c.group === 'Paper');
  const inkGroup    = colorGuidelines.filter(c => c.group === 'Ink');

  return (
    <div style={{ fontFamily: 'var(--font-sans)', background: 'var(--c-paper)' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <header style={{
        background: 'var(--c-ink)',
        padding: 'clamp(64px, 10vw, 96px) clamp(24px, 5vw, 64px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div aria-hidden style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1024, margin: '0 auto', position: 'relative' }}>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            style={{ marginBottom: 32 }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.1em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
            }}>
              Design System · v2
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: EASE_OUT }}
            style={{
              fontSize: 'clamp(56px, 9vw, 96px)', fontWeight: 700,
              color: 'var(--c-lo)', lineHeight: 1.05,
              letterSpacing: '-0.035em', margin: '0 0 20px',
            }}
          >
            감바쓰
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: EASE_OUT }}
            style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 420, margin: '0 0 40px' }}
          >
            모노크롬 · Apple 입체감 · 탄성 모션.
            <br />
            피그마 대신 이 페이지가 디자인의 단일 진실 공급원입니다.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {['tokens.ts', 'guidelines.ts', 'globals.css'].map(f => (
              <span key={f} style={{
                fontFamily: 'var(--font-mono)', fontSize: 11,
                color: 'rgba(255,255,255,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '4px 10px', borderRadius: 6,
              }}>
                {f}
              </span>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────── */}
      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '0 clamp(24px, 5vw, 64px) 120px' }}>

        {/* 01 / COLOR */}
        <Section
          kicker="01 / COLOR" title="컬러"
          intro="모노크롬만 사용합니다. 계층은 오직 명도·그림자·타입웨이트로 구분합니다. 채도 있는 색은 어떤 경우에도 도입하지 않습니다 — 감정에 색을 칠하지 않는 것이 감바쓰의 원칙입니다."
        >
          <FadeUp>
            <div style={{ marginBottom: 8 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-ink3)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
              }}>
                paper · 종이 스케일
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {paperGroup.map(s => (
                  <Swatch key={s.token} name={s.token} hex={s.hex} label={s.usage} />
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.06}>
            <div style={{ marginTop: 24, marginBottom: 8 }}>
              <div style={{
                fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-ink3)',
                letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
              }}>
                ink · 잉크 스케일
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12 }}>
                {inkGroup.map(s => (
                  <Swatch key={s.token} name={s.token} hex={s.hex} label={s.usage} />
                ))}
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.1}>
            <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Card title="사용 규칙" meta="rules">
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.8, color: 'var(--c-ink2)' }}>
                  {colorRules.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              </Card>
              <Card title="대비 페어" meta="contrast">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { bg: '#FDFDFC', fg: '#121211', label: '기본' },
                    { bg: '#121211', fg: '#FDFDFC', label: '역상' },
                    { bg: '#F4F4F2', fg: '#3A3A38', label: '카드' },
                    { bg: '#FFFFFF', fg: '#6E6E6B', label: '메타' },
                  ].map(({ bg, fg, label }) => (
                    <div key={label} style={{
                      padding: '12px 14px', borderRadius: 10, background: bg, color: fg,
                      border: '1px solid rgba(17,17,15,0.06)',
                      fontFamily: 'var(--font-mono)', fontSize: 11,
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{label}</div>
                      <div style={{ opacity: 0.65, marginTop: 2 }}>{fg}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </FadeUp>
        </Section>

        {/* 02 / TYPE */}
        <Section
          kicker="02 / TYPE" title="타이포그래피"
          intro="Pretendard 한 서체로 모든 계층을 풉니다. 크기와 굵기의 대비만으로 위계를 만들고, 제목은 자간을 조이고 본문은 살짝 풀어 읽기 편하게 둡니다. JetBrains Mono 는 메타·라벨·카운터에만 제한적으로 사용합니다."
        >
          <FadeUp>
            <Card>
              {typographyGuidelines.map((item, i) => (
                <div key={item.label} style={{
                  display: 'grid', gridTemplateColumns: '120px 1fr 120px',
                  alignItems: 'baseline', gap: 20, padding: '18px 0',
                  borderBottom: i < typographyGuidelines.length - 1 ? '1px solid var(--c-ink6)' : 'none',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {item.label}
                  </div>
                  <div style={{
                    fontFamily: ('isMono' in item && item.isMono) ? 'var(--font-mono)' : 'var(--font-sans)',
                    fontSize: Math.min(item.size, 36),
                    fontWeight: item.weight,
                    lineHeight: item.line,
                    letterSpacing: `${item.tracking}em`,
                    color: 'var(--c-ink)',
                  }}>
                    {item.sample}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', textAlign: 'right' }}>
                    {item.size}/{Math.round(item.size * item.line)} · w{item.weight}
                  </div>
                </div>
              ))}
            </Card>
          </FadeUp>
        </Section>

        {/* 03 / SPACE */}
        <Section kicker="03 / SPACE" title="간격 · 모서리 · 그림자"
          intro="4pt 그리드를 기반으로 합니다. 모서리는 컴포넌트 크기에 따라 xs→xl로 올라가며, 그림자는 레이어를 겹쳐 Apple-스타일의 부드럽고 정확한 깊이감을 냅니다.">
          <FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Card title="Spacing · 4pt scale" meta="--s-*">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {spacingGuidelines.map(({ label, px }) => (
                    <div key={label} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 52px', alignItems: 'center', gap: 10, padding: '5px 0' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)' }}>{label}</span>
                      <div style={{ height: 12, width: px, background: 'var(--c-ink)', borderRadius: 2, maxWidth: '100%' }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', textAlign: 'right' }}>{px}px</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Radius" meta="--r-*">
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  {radiusGuidelines.map(({ token, value }) => {
                    const size = 56;
                    return (
                      <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: size, height: size,
                          background: 'var(--c-sunken)',
                          borderRadius: value,
                          boxShadow: 'var(--sh-hair)',
                        }} />
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', textAlign: 'center' }}>
                          {token}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </FadeUp>

          <FadeUp delay={0.06}>
            <Card title="Shadow · elevation" meta="--sh-*">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 20 }}>
                {shadowGuidelines.map(({ token, value, usage }) => (
                  <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '16px 0' }}>
                    <div style={{
                      width: 100, height: 64,
                      background: 'var(--c-surface)',
                      borderRadius: 14,
                      boxShadow: value,
                    }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink)', textAlign: 'center' }}>sh-{token}</div>
                      <div style={{ fontSize: 10, color: 'var(--c-ink3)', textAlign: 'center', marginTop: 2 }}>{usage}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </FadeUp>
        </Section>

        {/* 04 / COMPONENTS */}
        <Section kicker="04 / COMPONENTS" title="컴포넌트"
          intro="모든 인터랙티브 요소는 둥근 모서리 + 레이어드 그림자로 떠있는 감각을 줍니다. 프라이머리는 solid ink, 세컨더리는 흰 카드, 고스트는 외곽선만.">
          <FadeUp>
            <Card title="Buttons" meta="sm · md · lg" >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <PrimaryBtn size="sm">소각</PrimaryBtn>
                <PrimaryBtn size="md">소각</PrimaryBtn>
                <PrimaryBtn size="lg">소각</PrimaryBtn>
                <SecondaryBtn>취소</SecondaryBtn>
                <GhostBtn>더 보기</GhostBtn>
              </div>
            </Card>
          </FadeUp>

          <FadeUp delay={0.06}>
            <Card title="Message Bubbles" meta="chat" tone="sunken" >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520, margin: '0 auto' }}>
                <MsgBubble>오늘 하루 어땠어요?</MsgBubble>
                <MsgBubble me>상사한테 또 혼났어. 진짜 짜증나.</MsgBubble>
                <MsgBubble>그 감정, 바로 버려볼래요?</MsgBubble>
                <MsgBubble>잘 버렸어요. 바구니에 모였어요.</MsgBubble>
              </div>
            </Card>
          </FadeUp>

          <FadeUp delay={0.08}>
            <Card title="Dialog · 소각 확인" meta="modal" tone="sunken">
              <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                <div style={{
                  width: 340, background: '#FFFFFF',
                  borderRadius: 24, padding: '28px 24px 24px',
                  boxShadow: 'var(--sh-xl)',
                  border: '1px solid rgba(17,17,15,0.04)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🗑</div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--c-ink)', marginBottom: 6 }}>3개 모두 버릴까요?</div>
                  <div style={{ fontSize: 13, color: 'var(--c-ink3)', lineHeight: 1.5, marginBottom: 20 }}>소각 후에는 복구할 수 없어요.</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <SecondaryBtn>취소</SecondaryBtn>
                    <PrimaryBtn>소각</PrimaryBtn>
                  </div>
                </div>
              </div>
            </Card>
          </FadeUp>
        </Section>

        {/* 05 / MOTION */}
        <Section kicker="05 / MOTION" title="모션 · 인터랙션"
          intro="네 가지 핵심 모션이 감바쓰의 성격을 만듭니다 — 구기기, 던지기, 바구니 반응, 소각. 전반적으로 탄성 있게, 통통 튀게.">
          <FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Card title="타이밍 토큰" meta="--mo-*">
                {motionGuidelines.durations.map(({ key, ms }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--c-ink3)', width: 60 }}>{key}</span>
                    <div style={{ flex: 1, height: 4, background: 'var(--c-ink6)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(ms / 720) * 100}%`, background: 'var(--c-ink)', borderRadius: 9999 }} />
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--c-ink3)', width: 36, textAlign: 'right' }}>{ms}ms</span>
                  </div>
                ))}
              </Card>

              <Card title="이징" meta="easing">
                {motionGuidelines.easings.map(({ key, curve }) => (
                  <div key={key} style={{ padding: '6px 0', borderBottom: '1px solid var(--c-ink6)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-ink)' }}>{key}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', marginTop: 2 }}>{curve}</div>
                  </div>
                ))}
              </Card>
            </div>
          </FadeUp>

          <FadeUp delay={0.06}>
            <Card title="모션 원칙" meta="principles">
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.9, color: 'var(--c-ink2)' }}>
                {motionGuidelines.principles.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </Card>
          </FadeUp>
        </Section>

        {/* 06 / BRAND */}
        <Section kicker="06 / BRAND" title="브랜드 & 보이스"
          intro="감바쓰는 판단하지 않는 AI 감정 쓰레기통입니다. 무겁지 않게, 의식처럼 가볍게 버리는 경험 — 브랜드는 그 성격을 그대로 담습니다.">
          <FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
              <Card title="말투 예시" meta="do">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {voiceGuidelines.do.map(v => (
                    <div key={v} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--c-sunken)', fontSize: 14, color: 'var(--c-ink)' }}>{v}</div>
                  ))}
                </div>
              </Card>
              <Card title="피할 말투" meta="don't">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {voiceGuidelines.dont.map(v => (
                    <div key={v} style={{
                      padding: '10px 12px', borderRadius: 10,
                      border: '1px dashed var(--c-ink5)',
                      fontSize: 14, color: 'var(--c-ink3)',
                      textDecoration: 'line-through', textDecorationColor: 'var(--c-ink5)',
                    }}>{v}</div>
                  ))}
                </div>
              </Card>
              <Card title="헤드라인" meta="copy">
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9, color: 'var(--c-ink2)' }}>
                  {voiceGuidelines.headlines.map(h => <li key={h}>{h}</li>)}
                </ul>
              </Card>
            </div>
          </FadeUp>

          <FadeUp delay={0.06}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {conceptGuidelines.map(({ keyword, desc }) => (
                <Card key={keyword}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-ink)', marginBottom: 8, letterSpacing: '-0.01em' }}>{keyword}</div>
                  <div style={{ fontSize: 14, color: 'var(--c-ink3)', lineHeight: 1.65 }}>{desc}</div>
                </Card>
              ))}
            </div>
          </FadeUp>
        </Section>

        {/* 07 / USAGE */}
        <Section kicker="07 / USAGE" title="사용 가이드"
          intro="이후 작업하는 Claude agent 가 이 시스템을 정확히 이어받기 위한 참고 문서입니다. 새 화면을 만들 때 이 섹션부터 읽으세요.">
          <FadeUp>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Card title="원칙 요약" meta="tl;dr" dark>
                <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.9, color: 'rgba(255,255,255,0.75)' }}>
                  <li>모노크롬만. 채도 있는 색 절대 금지.</li>
                  <li>Pretendard 단독. mono 는 라벨/카운터에만.</li>
                  <li>계층은 그림자 + 명도 + 웨이트로.</li>
                  <li>이모지 대신 3D 오브제 컴포넌트 사용.</li>
                  <li>프라이머리 액션은 solid ink. 화면당 1개만.</li>
                  <li>모서리는 크기에 비례: 버튼=round, 카드=lg.</li>
                  <li>탄성 있게. 하지만 명시적 액션에만.</li>
                  <li>카피는 짧게, 판단하지 말고, 권유형으로.</li>
                </ol>
              </Card>

              <Card title="CSS 변수 빠른 참조" meta="css vars">
                <pre style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, lineHeight: 1.8,
                  color: 'var(--c-ink2)', margin: 0, whiteSpace: 'pre-wrap',
                }}>{`/* color */
--c-paper  #FDFDFC   canvas
--c-surface #FFFFFF  card
--c-sunken #F4F4F2   recessed
--c-ink    #121211   text
--c-ink2   #3A3A38   secondary
--c-ink3   #6E6E6B   meta

/* radius */
--r-sm 10  --r-md 14  --r-lg 20
--r-xl 28  --r-round 9999

/* shadow */
--sh-sm  subtle
--sh-md  default card
--sh-lg  elevated
--sh-xl  dialog

/* motion */
--mo-base 260ms
--mo-bounce cubic-bezier(.34,1.56,.64,1)
--mo-squish cubic-bezier(.87,0,.13,1)`}
                </pre>
              </Card>
            </div>
          </FadeUp>

          <FadeUp delay={0.06}>
            <Card title="피해야 할 패턴" meta="anti-patterns">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>쓰지 말 것</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: 'var(--c-ink2)' }}>
                    <li>채도 있는 액센트 컬러 (#FF5500 등)</li>
                    <li>그라디언트 배경 (hue 있는)</li>
                    <li>Inter, Roboto, system-ui 단독</li>
                    <li>border-left 4px solid 카드</li>
                    <li>여러 개의 primary 버튼</li>
                    <li>AI 슬롭 메타포 (뇌, 로봇 등)</li>
                  </ul>
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--c-ink3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>대신 이렇게</div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.9, color: 'var(--c-ink2)' }}>
                    <li>모노크롬 스케일만</li>
                    <li>--sh-md 로 카드 띄우기</li>
                    <li>Pretendard + JetBrains Mono</li>
                    <li>--sh-lg 와 radius 로 위계</li>
                    <li>primary 하나 + secondary</li>
                    <li>구체적 종이 오브제 은유</li>
                  </ul>
                </div>
              </div>
            </Card>
          </FadeUp>

          <FadeUp delay={0.08}>
            <Card title="출시 전 체크리스트" meta="before ship" tone="sunken">
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                columnGap: 32, rowGap: 6,
              }}>
                {shipChecklist.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--c-ink2)', padding: '4px 0' }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid var(--c-ink5)', flexShrink: 0 }} />
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </FadeUp>
        </Section>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer style={{
        background: 'var(--c-ink)',
        padding: '40px clamp(24px, 5vw, 64px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 20,
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-lo)', margin: '0 0 4px' }}>
            감바쓰 디자인 시스템 v2
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'rgba(255,255,255,0.3)', margin: 0 }}>
            tokens.ts → guidelines.ts → globals.css → this page
          </p>
        </div>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', height: 40, padding: '0 20px',
          borderRadius: 9999,
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 14, fontWeight: 500,
          textDecoration: 'none',
          transition: 'color var(--mo-quick), border-color var(--mo-quick)',
        }}>
          → 홈으로
        </Link>
      </footer>
    </div>
  );
}
