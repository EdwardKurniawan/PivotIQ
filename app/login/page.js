'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '../../lib/supabase/browser';
import { BrandLogo } from '../../components/brand-logo';
import LanguageSwitcher from '../../components/language-switcher';
import { getBrowserLocale, getMessages } from '../../lib/i18n';

const palette = {
  bg: '#F4EFE7',
  panel: 'rgba(255, 255, 255, 0.78)',
  panelStrong: '#13202A',
  border: 'rgba(19, 27, 35, 0.08)',
  text: '#131B23',
  textMuted: '#50606B',
  textSoft: '#6D7A84',
  cream: '#FFF9F2',
  orange: '#F28A43',
  teal: '#1B6F63',
  navy: '#13202A',
};

export default function LoginPage() {
  const [locale, setLocale] = useState(getBrowserLocale());
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const authConfigured = Boolean(supabase);
  const messages = getMessages(locale);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setStatus('error');
      setMessage('Supabase auth is not configured yet. Add Supabase env vars before testing magic-link login.');
      return;
    }

    setStatus('loading');
    setMessage('');

    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setStatus('error');
      setMessage(error.message);
      return;
    }

    setStatus('success');
    setMessage(messages.login.sentMessage);
  };

  return (
    <div className="auth-page" style={{ minHeight: '100vh', background: palette.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 18% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(27, 111, 99, 0.14), transparent 28%)',
        }}
      />

      <div className="auth-shell" style={{ width: '100%', maxWidth: '1040px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'stretch', position: 'relative', zIndex: 2 }}>
        <div
          className="auth-panel-dark"
          style={{
            borderRadius: '30px',
            padding: '30px',
            background: palette.panelStrong,
            border: `1px solid ${palette.border}`,
            boxShadow: '0 28px 80px rgba(19, 32, 42, 0.16)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '22px',
          }}
        >
          <div>
            <div style={{ marginBottom: '28px' }}>
              <BrandLogo subtitle={messages.login.subtitle} textColor="white" subColor={palette.textSoft} />
            </div>

            <div style={{ color: '#9FD6CE', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              {messages.login.eyebrow}
            </div>
            <h1 className="auth-title" style={{ color: 'white', fontSize: 'clamp(34px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.05em', lineHeight: 0.96, margin: '0 0 14px', fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
              {messages.login.title}
            </h1>
            <p className="auth-copy" style={{ color: palette.textMuted, fontSize: '16px', lineHeight: 1.76, margin: 0 }}>
              {messages.login.body}
            </p>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              'Saved report history',
              'Persistent roadmap progress',
              'Reminder-ready account state',
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderRadius: '18px',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${palette.border}`,
                  color: '#E7EDF0',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                <span style={{ width: '24px', height: '24px', borderRadius: '10px', background: 'rgba(27, 111, 99, 0.14)', color: '#1B6F63', border: '1px solid rgba(27, 111, 99, 0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B6F63" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6.5 12.5L10.2 16L17.5 8.7" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          className="auth-panel-light"
          style={{
            borderRadius: '30px',
            padding: '30px',
            background: palette.panel,
            border: `1px solid ${palette.border}`,
            boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
            <LanguageSwitcher locale={locale} onChange={setLocale} />
          </div>
          <div style={{ color: '#A7602E', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            {messages.login.sendLabel}
          </div>
          <h2 style={{ color: palette.text, fontSize: '28px', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 10px' }}>
            {messages.login.sendTitle}
          </h2>
          <p style={{ color: palette.textMuted, fontSize: '14px', lineHeight: 1.72, marginBottom: '24px' }}>
            {messages.login.sendBody}
          </p>

          {!authConfigured && (
            <div style={{ marginBottom: '18px', padding: '14px 16px', borderRadius: '18px', border: '1px solid rgba(242, 138, 67, 0.22)', background: 'rgba(242, 138, 67, 0.10)', color: '#8B4A1B', fontSize: '14px', lineHeight: 1.65 }}>
              Supabase is not configured yet. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to enable accounts.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="section-label" style={{ color: '#7A5A43' }}>{messages.login.emailLabel}</label>
            <input
              className="piq-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={messages.login.emailPlaceholder}
              style={{ marginBottom: '18px' }}
            />
            <button
              disabled={!email || status === 'loading'}
              style={!email || status === 'loading'
                ? { width: '100%', border: 'none', borderRadius: '20px', background: palette.navy, color: '#FFF7F1', padding: '17px 22px', fontSize: '16px', fontWeight: 900, opacity: 0.45, cursor: 'default', boxShadow: 'none' }
                : { width: '100%', border: 'none', borderRadius: '20px', background: palette.navy, color: '#FFF7F1', padding: '17px 22px', fontSize: '16px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 18px 40px rgba(19, 32, 42, 0.18)' }}
            >
              {status === 'loading' ? messages.login.sendingButton : messages.login.sendButton}
            </button>
          </form>

          {message && (
            <div
              style={{
                marginTop: '16px',
                borderRadius: '18px',
                padding: '14px 16px',
                background: status === 'success' ? 'rgba(65,194,174,0.10)' : 'rgba(255,143,77,0.09)',
                border: `1px solid ${status === 'success' ? 'rgba(65,194,174,0.22)' : 'rgba(255,143,77,0.22)'}`,
                color: status === 'success' ? '#1B6F63' : '#A7602E',
                fontSize: '13px',
                lineHeight: 1.65,
              }}
            >
              {message}
            </div>
          )}

          <div className="auth-links" style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/report" style={{ color: palette.textMuted, fontSize: '13px', fontWeight: 700 }}>{messages.login.continueWithout}</Link>
            <Link href="/dashboard" style={{ color: palette.navy, fontSize: '13px', fontWeight: 800 }}>{messages.login.goDashboard}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
