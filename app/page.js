import Link from 'next/link';
import ScrollReveal from '../components/scroll-reveal';
import { BrandLogo } from '../components/brand-logo';
import LanguageSwitcher from '../components/language-switcher';
import MobileStickyCta from '../components/mobile-sticky-cta';
import { getMessages } from '../lib/i18n';
import { getServerLocale } from '../lib/i18n-server';
import { getRoleGuideLinks } from '../lib/role-pages';
import { buildPageMetadata } from '../lib/seo';

export function generateMetadata() {
  const metadata = buildPageMetadata({
    locale: getServerLocale(),
    key: 'home',
    path: '/',
  });

  return {
    ...metadata,
    other: {
      ...(metadata.other || {}),
      'impact-site-verification': '834dadd9-6392-4583-b90e-7af5e7c73c53',
    },
  };
}

const sampleTasks = [
  {
    key: 'task1',
    value: 82,
    color: '#F28A43',
  },
  {
    key: 'task2',
    value: 61,
    color: '#E8D8C0',
  },
  {
    key: 'task3',
    value: 24,
    color: '#50B8A6',
  },
];

const palette = {
  bg: '#F4EFE7',
  text: '#131B23',
  textSoft: '#5D6A74',
  textMuted: '#4A5863',
  cream: '#FFF9F2',
  orange: '#F28A43',
  teal: '#1B6F63',
  navy: '#13202A',
  border: 'rgba(19, 27, 35, 0.08)',
  borderStrong: 'rgba(19, 27, 35, 0.12)',
};

function shellCardStyle() {
  return {
    background: 'rgba(255,255,255,0.78)',
    border: `1px solid ${palette.border}`,
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
    backdropFilter: 'blur(18px)',
  };
}

function badgeStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 14px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.58)',
    border: `1px solid ${palette.border}`,
    color: '#355163',
    fontSize: '12px',
    fontWeight: 800,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };
}

function primaryLinkStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '18px 32px',
    minWidth: '280px',
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #F28A43, #F6C06D)',
    color: '#13202A',
    fontSize: '16px',
    fontWeight: 800,
    border: '1px solid rgba(242, 138, 67, 0.34)',
    boxShadow: '0 22px 48px rgba(242, 138, 67, 0.24)',
  };
}

export default function Home() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';
  const metrics = [
    { label: messages.home.metrics[0], value: messages.home.metricValues[0], tone: '#F28A43' },
    { label: messages.home.metrics[1], value: messages.home.metricValues[1], tone: '#15384B' },
    { label: messages.home.metrics[2], value: messages.home.metricValues[2], tone: '#1B6F63' },
  ];
  const valueCards = messages.home.valueCards.map(([eyebrow, title, body]) => ({ eyebrow, title, body }));
  const pivotLanes = messages.home.pivotLanes.map(([label, title, body]) => ({ label, title, body }));
  const roadmapSteps = messages.home.roadmapSteps.map(([number, title, body]) => ({ number, title, body }));
  const faqItems = messages.home.faqItems.map(([question, answer]) => ({ question, answer })).slice(0, 4);
  const featuredRoleGuides = getRoleGuideLinks(locale, [
    'marketing-manager-ai-risk',
    'procurement-analyst-ai-risk',
    'legal-operations-manager-ai-risk',
    'customer-education-manager-ai-risk',
  ]).slice(0, 3);
  const sampleTaskNotes = messages.home.sampleNotes;
  const sampleTaskLabels = messages.home.sampleTaskLabels;
  const editorialSignals = [
    { label: 'Pressure', value: '82', tone: '#F28A43' },
    { label: 'Leverage', value: '61', tone: '#13202A' },
    { label: 'Pivot fit', value: '74', tone: '#1B6F63' },
  ];
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PivotIQ',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'PivotIQ helps white-collar professionals understand AI career risk at the task level, discover credible adjacent pivots, and follow a transition roadmap.',
    url: siteUrl,
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: palette.bg,
        color: palette.text,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 14% 8%, rgba(242, 138, 67, 0.16), transparent 28%), radial-gradient(circle at 84% 14%, rgba(27, 111, 99, 0.14), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(244,239,231,0) 36%)',
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <nav
        className="home-reveal-0 home-nav"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '18px 28px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <BrandLogo subtitle={messages.home.subtitle} />

        <div className="home-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <LanguageSwitcher locale={locale} />
          <Link
            className="home-nav-signin"
            href="/login"
            style={{
              padding: '12px 18px',
              borderRadius: '999px',
              color: '#41515D',
              background: 'rgba(255,255,255,0.62)',
              border: `1px solid ${palette.border}`,
              fontSize: '14px',
              fontWeight: 800,
            }}
          >
            {messages.common.signIn}
          </Link>

          <Link
            className="home-nav-cta"
            href="/audit"
            style={{
              padding: '13px 18px',
              borderRadius: '999px',
              color: '#13202A',
              background: 'linear-gradient(135deg, #F28A43, #F6C06D)',
              border: '1px solid rgba(242, 138, 67, 0.34)',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 18px 40px rgba(242, 138, 67, 0.24)',
            }}
          >
            {messages.common.startFreeScan}
          </Link>
        </div>
      </nav>

      <ScrollReveal
        as="section"
        className={`home-hero ${locale !== 'en' ? 'home-hero-long' : ''}`}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '8px 28px 34px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(320px, 0.92fr)',
          gap: '28px',
          alignItems: 'start',
        }}
      >
        <div className={`home-hero-copy ${locale !== 'en' ? 'home-hero-copy-long' : ''}`}>
          <div className="home-badge home-reveal-1" style={{ ...badgeStyle(), marginBottom: '18px' }}>{messages.home.badge}</div>

          <h1
            className="home-reveal-2"
            style={{
              fontSize: 'clamp(52px, 7.2vw, 92px)',
              lineHeight: 0.92,
              letterSpacing: '-0.07em',
              margin: '0 0 20px',
              maxWidth: '840px',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              textWrap: 'balance',
            }}
          >
            {messages.home.heroTitle}
          </h1>

          <p
            className="home-reveal-3"
            style={{
              maxWidth: '660px',
              fontSize: '18px',
              lineHeight: 1.65,
              color: '#42505C',
              margin: '0 0 28px',
              textWrap: 'pretty',
            }}
          >
            {messages.home.heroBody}
          </p>

          <div className="home-reveal-4 home-hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '14px', maxWidth: '660px' }}>
            <Link className="home-primary-cta" href="/audit" style={{ ...primaryLinkStyle(), width: '100%', maxWidth: '660px' }}>
              {messages.common.runFreeScan}
            </Link>
          </div>

        </div>

        <div
          className="home-hero-art"
          style={{
            position: 'relative',
            minHeight: '480px',
            display: 'grid',
            alignItems: 'stretch',
          }}
        >
          <div
            className="home-glow"
            style={{
              position: 'absolute',
              inset: '30px 18px 10px 42px',
              borderRadius: '40px',
              background: 'linear-gradient(180deg, rgba(242, 138, 67, 0.1), rgba(27, 111, 99, 0.08))',
              filter: 'blur(18px)',
            }}
          />

          <div
            className="home-float-slow home-sample-card"
            style={{
              ...shellCardStyle(),
              position: 'relative',
              borderRadius: '36px',
              padding: '24px',
              '--float-rotate': '-1.5deg',
              transform: 'rotate(-1.5deg)',
              transformOrigin: 'center',
            }}
          >
            <div
              className="home-sample-inner"
              style={{
                borderRadius: '28px',
                background: palette.navy,
                color: '#F4EFE7',
                padding: '22px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div className="home-sample-head" style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#91A0AA' }}>{messages.home.sampleDiagnosis}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '6px', letterSpacing: '-0.03em' }}>{messages.home.sampleRoleTitle}</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#C4D0D6', marginTop: '6px', maxWidth: '420px' }}>
                    {messages.home.sampleRoleBody}
                  </div>
                </div>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '999px',
                    background: 'rgba(242, 138, 67, 0.14)',
                    color: '#FFB686',
                    fontSize: '12px',
                    fontWeight: 800,
                  }}
                >
                  {messages.home.pressureBuilding}
                </div>
              </div>

              <div className="home-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                {metrics.map((item) => (
                  <div
                    key={item.label}
                    className="home-hover-lift home-metric-card"
                    style={{
                      borderRadius: '18px',
                      padding: '14px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 800, color: item.tone }}>{item.value}</div>
                    <div style={{ marginTop: '6px', fontSize: '12px', lineHeight: 1.45, color: '#9AA8B0' }}>{item.label}</div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  borderRadius: '24px',
                  padding: '18px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sampleTasks.map((task) => (
                    <div key={task.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#E9E0D2' }}>{sampleTaskLabels[sampleTasks.findIndex((item) => item.key === task.key)]}</span>
                        <span style={{ color: task.color, fontWeight: 800 }}>{task.value}% {messages.home.exposedSuffix}</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${task.value}%`, height: '100%', borderRadius: '999px', background: task.color, transition: 'width 0.9s ease' }} />
                      </div>
                      <div style={{ color: task.color, fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '6px' }}>
                        {sampleTaskNotes[sampleTasks.findIndex((item) => item.key === task.key)]}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  borderRadius: '24px',
                  padding: '18px',
                  background: 'linear-gradient(135deg, rgba(242, 138, 67, 0.12), rgba(27, 111, 99, 0.12))',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D9CCBA', marginBottom: '8px', fontWeight: 800 }}>
                  {messages.home.strongestNextMove}
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
                  {messages.home.strongestNextMoveTitle}
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#C4D0D6' }}>
                  {messages.home.strongestNextMoveBody}
                </div>
              </div>
            </div>
          </div>

          <div
            className="home-float-fast home-roadmap-card"
            style={{
              ...shellCardStyle(),
              position: 'absolute',
              right: '8px',
              bottom: '20px',
              width: '42%',
              borderRadius: '30px',
              padding: '18px',
              '--float-rotate': '2.5deg',
              transform: 'rotate(2.5deg)',
              transformOrigin: 'center',
            }}
          >
            <div style={{ borderRadius: '22px', background: palette.cream, padding: '16px', color: '#15212B' }}>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6D7A84', marginBottom: '8px', fontWeight: 800 }}>
                {messages.home.roadmapPreview}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px' }}>{messages.home.roadmapWeeks}</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {messages.home.roadmapItems.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '16px',
                      background: index === 0 ? 'rgba(242, 138, 67, 0.12)' : 'rgba(19, 33, 43, 0.05)',
                      fontSize: '13px',
                      color: '#2B3945',
                      fontWeight: 700,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <MobileStickyCta href="/audit">
        {messages.common.runFreeScan}
      </MobileStickyCta>

      <ScrollReveal
        as="section"
        className={`home-editorial-section ${locale !== 'en' ? 'home-lanes-section-long' : ''}`}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '8px 28px 54px',
        }}
      >
        <div
          className="home-editorial-shell"
          style={{
            ...shellCardStyle(),
            borderRadius: '36px',
            padding: '32px',
            position: 'relative',
            background:
              'radial-gradient(circle at 0% 0%, rgba(242, 138, 67, 0.08), transparent 26%), rgba(255,255,255,0.78)',
          }}
        >
          <div
            className="home-editorial-top"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 0.82fr) minmax(320px, 1.18fr)',
              gap: '24px',
              alignItems: 'start',
              marginBottom: '22px',
            }}
          >
            <ScrollReveal delay={40} className={locale !== 'en' ? 'home-lanes-intro-long' : ''} style={{ paddingTop: '4px' }}>
              <div
                style={{
                  fontSize: 'clamp(42px, 6vw, 68px)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.06em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                  marginBottom: '18px',
                  maxWidth: '460px',
                }}
              >
                {messages.home.lanesIntroTitle}
              </div>
              <p style={{ fontSize: '18px', lineHeight: 1.72, color: '#495863', maxWidth: '440px', margin: 0 }}>
                {messages.home.lanesIntroBody}
              </p>
            </ScrollReveal>

            <div
              className="home-value-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '16px',
              }}
            >
              {valueCards.map((card, index) => (
                <ScrollReveal
                  key={card.title}
                  className="home-hover-lift"
                  delay={index * 90}
                  style={{
                    borderRadius: '26px',
                    padding: '22px',
                    background: 'rgba(255,255,255,0.58)',
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '10px', fontWeight: 800 }}>
                    {card.eyebrow}
                  </div>
                  <div
                    style={{
                      fontSize: '24px',
                      lineHeight: 1.06,
                      letterSpacing: '-0.04em',
                      fontWeight: 700,
                      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                      marginBottom: '10px',
                    }}
                  >
                    {card.title}
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.68, color: '#50606B' }}>{card.body}</div>
                </ScrollReveal>
              ))}
            </div>
          </div>

        <div
          className="home-editorial-signal-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '14px',
            marginBottom: '18px',
          }}
        >
          {editorialSignals.map((item) => (
            <div
              key={item.label}
              style={{
                borderRadius: '20px',
                padding: '16px 18px',
                background: 'rgba(255,255,255,0.5)',
                border: `1px solid ${palette.border}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '10px', marginBottom: '10px' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6A7882', fontWeight: 800 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: item.tone, letterSpacing: '-0.04em' }}>
                  {item.value}
                </div>
              </div>
              <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(19, 27, 35, 0.08)', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${item.value}%`,
                    height: '100%',
                    borderRadius: '999px',
                    background: item.tone,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="home-lanes-list" style={{ display: 'grid', gap: '14px' }}>
          {pivotLanes.map((lane, index) => (
            <ScrollReveal
              key={lane.title}
              className="home-hover-lift home-lane-card"
              delay={index * 100}
              style={{
                borderRadius: '24px',
                padding: '22px 24px',
                background: 'rgba(255,255,255,0.52)',
                border: `1px solid ${palette.border}`,
                display: 'grid',
                gridTemplateColumns: '160px minmax(0, 1fr)',
                gap: '18px',
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  borderRadius: '18px',
                  padding: '16px',
                  background: 'linear-gradient(180deg, rgba(242, 138, 67, 0.12), rgba(27, 111, 99, 0.08))',
                  color: '#25485A',
                  fontSize: '12px',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {lane.label}
              </div>
              <div>
                <div style={{ fontSize: '27px', lineHeight: 1.04, letterSpacing: '-0.04em', fontWeight: 700, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif', marginBottom: '10px' }}>
                  {lane.title}
                </div>
                <div style={{ fontSize: '15px', lineHeight: 1.72, color: '#50606B' }}>{lane.body}</div>
              </div>
            </ScrollReveal>
          ))}
        </div>
        </div>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        className="home-faq-section"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 54px',
        }}
      >
        <ScrollReveal
          delay={40}
          style={{
            ...shellCardStyle(),
            borderRadius: '34px',
            padding: '28px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '22px', alignItems: 'end', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '10px', fontWeight: 800 }}>
                {messages.home.faqEyebrow}
              </div>
              <div
                style={{
                  fontSize: 'clamp(30px, 4vw, 48px)',
                  lineHeight: 0.98,
                  letterSpacing: '-0.055em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                  maxWidth: '620px',
                }}
              >
                {messages.home.faqTitle}
              </div>
            </div>
            <div style={{ maxWidth: '430px' }}>
              <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#495863', margin: 0 }}>
                {messages.home.faqBody}
              </p>
              <div style={{ marginTop: '12px' }}>
                <Link
                  href="/methodology"
                  style={{
                    color: '#1B6F63',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                  }}
                >
                  {messages.home.methodologyLinkLabel}
                </Link>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }} className="two-col">
          {faqItems.map((item, index) => (
            <ScrollReveal
              key={item.question}
              as="article"
              delay={index * 70}
              className="home-hover-lift"
              style={{
                borderRadius: '22px',
                padding: '20px 22px',
                background: 'rgba(255,255,255,0.58)',
                border: `1px solid ${palette.border}`,
              }}
            >
              <h2
                style={{
                  margin: '0 0 10px',
                  fontSize: '21px',
                  lineHeight: 1.08,
                  letterSpacing: '-0.04em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                }}
              >
                {item.question}
              </h2>
              <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.75, color: '#50606B' }}>
                {item.answer}
              </p>
            </ScrollReveal>
          ))}
          </div>
        </ScrollReveal>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        className="home-closing-section"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 110px',
        }}
      >
        <div
          className="home-closing-shell"
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
              {messages.home.closingEyebrow}
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
              {messages.home.closingTitle}
            </div>
            <p style={{ fontSize: '17px', lineHeight: 1.72, color: '#C3CFD5', maxWidth: '600px' }}>
              {messages.home.closingBody}
            </p>
            <div style={{ marginTop: '16px' }}>
              <Link
                href="/methodology"
                style={{
                  color: '#F3D4B5',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                {messages.home.methodologyLinkLabel}
              </Link>
            </div>
            <div style={{ marginTop: '18px', display: 'flex', gap: '9px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ color: '#9DADB7', fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {messages.home.roleGuidesEyebrow}
              </span>
              {featuredRoleGuides.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    color: '#F3D4B5',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    borderRadius: '999px',
                    padding: '7px 10px',
                    fontSize: '12px',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div
            style={{
              borderRadius: '28px',
              background: 'rgba(255,255,255,0.06)',
              padding: '22px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div style={{ display: 'grid', gap: '12px', marginBottom: '18px' }}>
              {roadmapSteps.map((step, index) => (
                <ScrollReveal
                  key={step.number}
                  className="home-hover-lift"
                  delay={index * 90}
                  style={{
                    padding: '14px 14px 15px',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ color: '#FFB686', fontSize: '12px', fontWeight: 900, letterSpacing: '0.08em', marginBottom: '6px' }}>{step.number}</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#B3C1C9' }}>{step.body}</div>
                </ScrollReveal>
              ))}
            </div>
            <Link
              href="/audit"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '16px 18px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #F28A43, #F6C06D)',
                color: '#13202A',
                border: '1px solid rgba(242, 138, 67, 0.34)',
                fontWeight: 800,
                boxShadow: '0 18px 40px rgba(242, 138, 67, 0.24)',
              }}
            >
              {messages.home.closingCta}
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
