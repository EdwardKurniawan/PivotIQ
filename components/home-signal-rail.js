'use client';

import { startTransition, useEffect, useState } from 'react';

export default function HomeSignalRail({ eyebrow, items = [], steps = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeItems = Array.isArray(items) ? items : [];
  const safeSteps = Array.isArray(steps) ? steps : [];
  const activeItem = safeItems[activeIndex] || safeItems[0] || null;

  useEffect(() => {
    if (safeItems.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setActiveIndex((current) => (current + 1) % safeItems.length);
      });
    }, 2600);

    return () => window.clearInterval(intervalId);
  }, [safeItems.length]);

  return (
    <div
      className="home-signal-rail-shell"
      style={{
        display: 'grid',
        gap: '16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            color: '#A56C2B',
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {eyebrow}
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {safeItems.map((item, index) => (
            <span
              key={item.title}
              className={index === activeIndex ? 'home-signal-dot is-active' : 'home-signal-dot'}
            />
          ))}
        </div>
      </div>

      {activeItem ? (
        <div
          className="home-signal-stage"
          style={{
            display: 'grid',
            gap: '8px',
          }}
        >
          <div
            style={{
              color: '#111A22',
              fontSize: '31px',
              lineHeight: 0.96,
              letterSpacing: '-0.06em',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              maxWidth: '420px',
            }}
          >
            {activeItem.title}
          </div>
          <div
            style={{
              color: '#55636D',
              fontSize: '14px',
              lineHeight: 1.68,
              maxWidth: '420px',
            }}
          >
            {activeItem.body}
          </div>
        </div>
      ) : null}

      <div style={{ display: 'grid', gap: '10px' }}>
        {safeSteps.map((step, index) => (
          <div
            key={step.number}
            className={index === activeIndex % Math.max(safeSteps.length, 1) ? 'home-signal-step is-active' : 'home-signal-step'}
            style={{
              borderRadius: '18px',
              padding: '13px 14px',
              background: index === activeIndex % Math.max(safeSteps.length, 1) ? 'rgba(224, 144, 67, 0.1)' : 'rgba(17, 26, 34, 0.04)',
              border: '1px solid rgba(17, 26, 34, 0.08)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ color: '#A56C2B', fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '5px' }}>
              {step.number}
            </div>
            <div style={{ color: '#111A22', fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>
              {step.title}
            </div>
            <div style={{ color: '#55636D', fontSize: '13px', lineHeight: 1.58 }}>
              {step.body}
            </div>
            <span className="home-signal-step-bar" />
          </div>
        ))}
      </div>
    </div>
  );
}
