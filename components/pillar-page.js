import Link from 'next/link';
import { BrandLogo } from './brand-logo';
import LanguageSwitcher from './language-switcher';

const palette = {
  bg: '#F4EFE7',
  text: '#131B23',
  textMuted: '#50606B',
  navy: '#13202A',
  border: 'rgba(19, 27, 35, 0.08)',
};

function shellCardStyle() {
  return {
    background: 'rgba(255,255,255,0.78)',
    border: `1px solid ${palette.border}`,
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
    backdropFilter: 'blur(18px)',
  };
}

function primaryLinkStyle(fullWidth = false) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : undefined,
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

export function PillarPage({ locale, page, relatedPages, path }) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.title,
    description: page.intro,
    url: `${siteUrl}${path}`,
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
        <BrandLogo subtitle={page.navSubtitle} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <LanguageSwitcher locale={locale} />
          <Link href="/audit" style={primaryLinkStyle()}>
            {page.ctaButton}
          </Link>
        </div>
      </nav>

      <section
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
        <div>
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
            {page.eyebrow}
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
            {page.title}
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
            {page.intro}
          </p>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link href="/audit" style={primaryLinkStyle()}>
              {page.ctaButton}
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
              {page.homeButton}
            </Link>
          </div>
        </div>

        <div style={{ ...shellCardStyle(), borderRadius: '34px', padding: '26px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '10px', fontWeight: 800 }}>
            {page.takeawaysEyebrow}
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
            {page.takeawaysTitle}
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {page.takeaways.map((item) => (
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
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 44px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
        }}
      >
        {page.blocks.map(([eyebrow, title, body]) => (
          <article
            key={title}
            style={{
              ...shellCardStyle(),
              borderRadius: '30px',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '10px', fontWeight: 800 }}>
              {eyebrow}
            </div>
            <div
              style={{
                fontSize: '28px',
                lineHeight: 1.04,
                letterSpacing: '-0.045em',
                fontWeight: 700,
                fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                marginBottom: '12px',
              }}
            >
              {title}
            </div>
            <div style={{ fontSize: '15px', lineHeight: 1.72, color: '#50606B' }}>{body}</div>
          </article>
        ))}
      </section>

      <section
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
            {page.sectionsEyebrow}
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
            {page.sectionsTitle}
          </div>
          <p style={{ fontSize: '17px', lineHeight: 1.76, color: '#495863', margin: 0 }}>
            {page.sectionsBody}
          </p>
        </div>

        <div style={{ display: 'grid', gap: '14px' }}>
          {page.sections.map(([title, body]) => (
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
        style={{
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 96px',
        }}
      >
        <div
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
              {page.ctaEyebrow}
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
              {page.ctaTitle}
            </div>
            <p style={{ fontSize: '17px', lineHeight: 1.72, color: '#C3CFD5', maxWidth: '600px' }}>
              {page.ctaBody}
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
            <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
              {relatedPages.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#E6EEF2',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: 1.5,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <Link href="/audit" style={primaryLinkStyle(true)}>
              {page.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

