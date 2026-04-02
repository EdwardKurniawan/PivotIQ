import Link from 'next/link';
import './globals.css';
import { getMessages } from '../lib/i18n';
import { getServerLocale } from '../lib/i18n-server';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';
const metadataBase = new URL(siteUrl);

export const metadata = {
  metadataBase,
  title: {
    default: 'PivotIQ | AI Career Risk Scanner and Pivot Planner',
    template: '%s | PivotIQ',
  },
  description: 'PivotIQ helps white-collar professionals see which parts of their job are most exposed to AI, identify believable adjacent pivots, and follow a practical career transition plan.',
  keywords: [
    'AI career risk',
    'job automation risk',
    'career pivot',
    'career planning',
    'white collar jobs',
    'AI job displacement',
    'career transition roadmap',
    'future of work',
  ],
  authors: [{ name: 'Jened', url: 'https://pivotiq.app' }],
  alternates: {
    canonical: '/',
  },
  category: 'career development',
  applicationName: 'PivotIQ',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    title: 'PivotIQ | AI Career Risk Scanner and Pivot Planner',
    description: 'Start with a free scan. See AI risk by task, not just by title, then decide where to pivot next.',
    type: 'website',
    siteName: 'PivotIQ',
    url: siteUrl,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PivotIQ | AI Career Risk Scanner and Pivot Planner',
    description: 'See what is exposed, what still compounds, and what to do next before the market decides for you.',
  },
};

export default function RootLayout({ children }) {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PivotIQ',
    legalName: 'Jened',
    email: 'contact@pivotiq.app',
    url: siteUrl,
    identifier: 'KvK 90948211',
  };
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PivotIQ',
    url: siteUrl,
    inLanguage: locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/audit`,
      'query-input': 'required name=career-risk-scan',
    },
  };

  return (
    <html lang={locale}>
      <body style={{ margin: 0 }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
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
