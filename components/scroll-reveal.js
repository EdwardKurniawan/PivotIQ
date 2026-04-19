'use client';

import { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, delay = 0, as: Tag = 'div', className = '', style = {}, threshold = 0.18 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || visible) return undefined;

    const fallbackId = window.setTimeout(() => {
      setVisible(true);
    }, Math.max(520, 640 + delay));

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.clearTimeout(fallbackId);
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(node);
    return () => {
      window.clearTimeout(fallbackId);
      observer.disconnect();
    };
  }, [delay, threshold, visible]);

  return (
    <Tag
      ref={ref}
      className={`scroll-reveal ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
