import Link from 'next/link';
import './globals.css';
import { getMessages } from '../lib/i18n';
import { getServerLocale } from '../lib/i18n-server';

export const metadata = {
  metadataBase: new URL('http://localhost:3002'),
  title: 'PivotIQ — See Which Parts of Your Job Are Next',
  description: 'A premium task-level career scan that shows where AI pressure is building, what still compounds, and where to pivot next.',
  authors: [{ name: 'Jened', url: 'https://pivotiq.app' }],
  openGraph: {
    title: 'PivotIQ — See Which Parts of Your Job Are Next',
    description: 'Start with a free scan. See risk by task, not by title, then decide if the full pivot roadmap earns your trust.',
    type: 'website',
    siteName: 'PivotIQ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PivotIQ — See Which Parts of Your Job Are Next',
    description: 'See what is exposed, what still matters, and what to do next.',
  },
};

export default function RootLayout({ children }) {
  const locale = getServerLocale();
  const messages = getMessages(locale);

  return (
    <html lang={locale}>
      <body style={{ margin: 0 }}>
        {children}
        <footer
          style={{
            borderTop: '1px solid rgba(19, 27, 35, 0.08)',
            background: '#F4EFE7',
            padding: '18px 24px 28px',
          }}
        >
          <div
            style={{
              maxWidth: '1220px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '14px',
              flexWrap: 'wrap',
              color: '#5D6A74',
              fontSize: '13px',
              lineHeight: 1.7,
            }}
          >
            <span>{messages.common.footerCompany}</span>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px 18px',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <Link href="/privacy" style={{ color: '#5D6A74', textDecoration: 'none' }}>
                {messages.common.privacy}
              </Link>
              <Link href="/terms" style={{ color: '#5D6A74', textDecoration: 'none' }}>
                {messages.common.terms}
              </Link>
              <Link href="/contact" style={{ color: '#5D6A74', textDecoration: 'none' }}>
                {messages.common.contact}
              </Link>
              <a
                href="mailto:contact@pivotiq.app"
                style={{ color: '#13202A', textDecoration: 'none', fontWeight: 600 }}
              >
                {messages.common.footerContact}
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
