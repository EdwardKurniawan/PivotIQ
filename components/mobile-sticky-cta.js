'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MobileStickyCta({ href, children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 220);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link
      href={href}
      className={`home-mobile-top-cta ${visible ? 'is-visible' : ''}`}
    >
      {children}
    </Link>
  );
}
