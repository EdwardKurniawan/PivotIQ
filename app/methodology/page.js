import Link from 'next/link';
import { BrandLogo } from '../../components/brand-logo';
import LanguageSwitcher from '../../components/language-switcher';
import { getServerLocale } from '../../lib/i18n-server';
import { getMethodologyContent } from '../../lib/methodology-content';
import { buildPageMetadata } from '../../lib/seo';

const palette = {
  text: '#131B23',
  textMuted: '#50606B',
  border: 'rgba(19, 27, 35, 0.08)',
  navy: '#13202A',
};

function shellCardStyle() {
  return {
    background: 'rgba(255,255,255,0.78)',
    border: `1px solid ${palette.border}`,
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
    backdropFilter: 'blur(18px)',
  };
}

function primaryLinkStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px 22px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #F28A43, #F6C06D)',
    color: '#13202A',
    fontSize: '15px',
    fontWeight: 800,
    border: '1px solid rgba(242, 138, 67, 0.34)',
    boxShadow: '0 18px 40px rgba(242, 138, 67, 0.24)',
    textDecoration: 'none',
  };
}

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'methodology',
    path: '/methodology',
  });
}

export default function MethodologyPage() {
  const locale = getServerLocale();
  const content = getMethodologyContent(locale);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: content.title,
    description: content.intro,
    url: `${siteUrl}/methodology`,
    inLanguage: locale,
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 12% 0%, rgba(242, 138, 67, 0.16), transparent 26%), radial-gradient(circle at 86% 10%, rgba(27, 111, 99, 0.14), transparent 28%), #F4EFE7',
        color: palette.text,
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <nav
        className="pillar-nav"
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <BrandLogo subtitle={content.navSubtitle} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <LanguageSwitcher locale={locale} />
          <Link href="/audit" style={primaryLinkStyle()}>
            {content.ctaButton}
          </Link>
        </div>
      </nav>

      <section
        className="pillar-hero"
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '30px 28px 52px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.04fr) minmax(300px, 0.96fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div className="pillar-hero-copy">
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '9px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.58)',
              border: `1px solid ${palette.border}`,
              color: '#355163',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            {content.eyebrow}
          </div>
          <h1
            style={{
              fontSize: 'clamp(52px, 7vw, 94px)',
              lineHeight: 0.92,
              letterSpacing: '-0.065em',
              margin: '0 0 18px',
              maxWidth: '820px',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              textWrap: 'balance',
            }}
          >
            {content.title}
          </h1>
          <p
            style={{
              maxWidth: '720px',
              fontSize: '20px',
              lineHeight: 1.68,
              color: '#42505C',
              margin: '0 0 26px',
            }}
          >
            {content.intro}
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/audit" style={primaryLinkStyle()}>
              {content.ctaButton}
            </Link>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px 22px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.66)',
                color: '#4A5762',
                border: `1px solid ${palette.border}`,
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              {content.homeButton}
            </Link>
          </div>
        </div>

        <div className="pillar-hero-side" style={{ ...shellCardStyle(), borderRadius: '34px', padding: '26px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '10px', fontWeight: 800 }}>
            {content.principlesEyebrow}
          </div>
          <div
            style={{
              fontSize: '28px',
              lineHeight: 1.02,
              letterSpacing: '-0.045em',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              marginBottom: '14px',
            }}
          >
            {content.principlesTitle}
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {content.principles.map((item) => (
              <div
                key={item}
                style={{
                  borderRadius: '18px',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.74)',
                  border: `1px solid ${palette.border}`,
                  color: '#394753',
                  fontSize: '15px',
                  lineHeight: 1.6,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="pillar-sections"
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 52px',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 0.74fr) minmax(0, 1.26fr)',
          gap: '22px',
          alignItems: 'stretch',
        }}
      >
        <div style={{ ...shellCardStyle(), borderRadius: '34px', padding: '30px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '12px', fontWeight: 800 }}>
            {content.mappingEyebrow}
          </div>
          <div
            style={{
              fontSize: 'clamp(34px, 5vw, 56px)',
              lineHeight: 0.98,
              letterSpacing: '-0.055em',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              marginBottom: '14px',
            }}
          >
            {content.mappingTitle}
          </div>
          <p style={{ fontSize: '17px', lineHeight: 1.76, color: '#495863', margin: 0 }}>
            {content.mappingBody}
          </p>
        </div>

        <div
          className="two-col"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '14px',
          }}
        >
          {content.mappingItems.map(([label, body], index) => {
            const tone = index === 0 ? '#F28A43' : index === 1 ? '#13202A' : index === 2 ? '#1B6F63' : index === 3 ? '#8B6B2E' : '#50606B';
            return (
              <article
                key={label}
                style={{
                  ...shellCardStyle(),
                  borderRadius: '26px',
                  padding: '22px 24px',
                  border: `1px solid ${tone}22`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span style={{ width: '28px', height: '28px', borderRadius: '999px', display: 'grid', placeItems: 'center', background: `${tone}12`, color: tone, border: `1px solid ${tone}24`, fontSize: '12px', fontWeight: 900 }}>
                    {index + 1}
                  </span>
                  <h2 style={{ margin: 0, color: '#13202A', fontSize: '20px', lineHeight: 1.12, letterSpacing: '-0.035em', fontWeight: 700 }}>
                    {label}
                  </h2>
                </div>
                <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.72, color: '#50606B' }}>
                  {body}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        className="pillar-sections"
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 52px',
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 0.78fr) minmax(0, 1.22fr)',
          gap: '22px',
          alignItems: 'start',
        }}
      >
        <div style={{ ...shellCardStyle(), borderRadius: '34px', padding: '30px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '12px', fontWeight: 800 }}>
            {content.eyebrow}
          </div>
          <div
            style={{
              fontSize: 'clamp(34px, 5vw, 56px)',
              lineHeight: 0.98,
              letterSpacing: '-0.055em',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              marginBottom: '14px',
            }}
          >
            {content.title}
          </div>
          <p style={{ fontSize: '17px', lineHeight: 1.76, color: '#495863', margin: 0 }}>
            {content.intro}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {content.sections.map(([title, body]) => (
            <article
              key={title}
              style={{
                ...shellCardStyle(),
                borderRadius: '26px',
                padding: '22px 24px',
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontSize: '24px',
                  lineHeight: 1.08,
                  letterSpacing: '-0.04em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                }}
              >
                {title}
              </h2>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.75, color: '#50606B' }}>
                {body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="pillar-cta-section"
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 96px',
        }}
      >
        <div
          className="pillar-cta-shell"
          style={{
            borderRadius: '38px',
            background: palette.navy,
            color: '#F4EFE7',
            padding: '34px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 0.82fr)',
            gap: '22px',
            alignItems: 'start',
            boxShadow: '0 28px 80px rgba(19, 32, 42, 0.18)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#9DADB7', marginBottom: '10px', fontWeight: 800 }}>
              {content.ctaEyebrow}
            </div>
            <div
              style={{
                fontSize: 'clamp(34px, 5vw, 58px)',
                lineHeight: 0.96,
                letterSpacing: '-0.055em',
                fontWeight: 700,
                fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                marginBottom: '14px',
                maxWidth: '620px',
              }}
            >
              {content.ctaTitle}
            </div>
            <p style={{ fontSize: '17px', lineHeight: 1.72, color: '#C3CFD5', maxWidth: '600px' }}>
              {content.ctaBody}
            </p>
          </div>

          <div
            style={{
              borderRadius: '28px',
              background: 'rgba(255,255,255,0.06)',
              padding: '22px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Link href="/audit" style={{ ...primaryLinkStyle(), width: '100%' }}>
              {content.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
