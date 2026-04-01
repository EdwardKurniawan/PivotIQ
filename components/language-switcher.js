'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLocaleLabel, getMessages, normalizeLocale, persistLocale, SUPPORTED_LOCALES } from '../lib/i18n';

export default function LanguageSwitcher({ locale = 'en', onChange = null }) {
  const router = useRouter();
  const [value, setValue] = useState(normalizeLocale(locale));

  useEffect(() => {
    setValue(normalizeLocale(locale));
  }, [locale]);

  const label = getMessages(value).common.language;

  const handleChange = (event) => {
    const next = persistLocale(event.target.value);
    setValue(next);
    onChange?.(next);
    router.refresh();
  };

  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        borderRadius: '999px',
        background: 'rgba(255,255,255,0.62)',
        border: '1px solid rgba(19, 27, 35, 0.08)',
        color: '#41515D',
        fontSize: '13px',
        fontWeight: 700,
      }}
    >
      <span>{label}</span>
      <select
        value={value}
        onChange={handleChange}
        style={{
          border: 'none',
          background: 'transparent',
          color: '#13202A',
          fontSize: '13px',
          fontWeight: 800,
          outline: 'none',
        }}
      >
        {SUPPORTED_LOCALES.map((localeOption) => (
          <option key={localeOption} value={localeOption}>
            {getLocaleLabel(localeOption)}
          </option>
        ))}
      </select>
    </label>
  );
}
