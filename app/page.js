import Link from 'next/link';
import ScrollReveal from '../components/scroll-reveal';
import { BrandLogo } from '../components/brand-logo';
import HomeSignalRail from '../components/home-signal-rail';
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
    color: '#D88A3D',
  },
  {
    key: 'task2',
    value: 61,
    color: '#C9B697',
  },
  {
    key: 'task3',
    value: 24,
    color: '#2D7F74',
  },
];

const laneImageSeeds = ['signal-briefing', 'operating-review', 'career-handoff'];
const bentoImageSeeds = ['decision-room', 'analysis-wall', 'workflow-map'];

const palette = {
  bg: '#EFE8DD',
  paper: 'rgba(255, 250, 244, 0.84)',
  paperStrong: '#FFF9F2',
  panel: 'rgba(255,255,255,0.72)',
  panelStrong: 'rgba(255,255,255,0.88)',
  text: '#111A22',
  textSoft: '#55636D',
  textMuted: '#6D7882',
  navy: '#121C24',
  navySoft: '#1A2731',
  orange: '#E09043',
  copper: '#A56C2B',
  teal: '#1B6F63',
  sand: '#D7C4A7',
  border: 'rgba(17, 26, 34, 0.08)',
  borderStrong: 'rgba(17, 26, 34, 0.14)',
  glow: 'rgba(224, 144, 67, 0.18)',
};

function surfaceStyle({ radius = '32px', background = palette.panel, border = palette.border, shadow = '0 28px 80px rgba(17, 26, 34, 0.08)' } = {}) {
  return {
    background,
    border: `1px solid ${border}`,
    borderRadius: radius,
    boxShadow: shadow,
    backdropFilter: 'blur(18px)',
  };
}

function chapterLabelStyle(color = palette.textMuted) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    color,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  };
}

function primaryLinkStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '240px',
    padding: '18px 28px',
    borderRadius: '999px',
    background: palette.navy,
    color: '#FFF9F2',
    fontSize: '15px',
    fontWeight: 800,
    border: '1px solid rgba(17, 26, 34, 0.12)',
    boxShadow: '0 24px 48px rgba(17, 26, 34, 0.18)',
    transition: 'transform 0.24s ease, box-shadow 0.24s ease',
  };
}

function secondaryLinkStyle() {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '220px',
    padding: '18px 28px',
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.56)',
    color: palette.text,
    fontSize: '15px',
    fontWeight: 800,
    border: `1px solid ${palette.borderStrong}`,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45)',
    transition: 'transform 0.24s ease, border-color 0.24s ease',
  };
}

function imagePanelStyle(seed, overlay = 'linear-gradient(180deg, rgba(18,28,36,0.12), rgba(18,28,36,0.62))') {
  return {
    backgroundImage: `${overlay}, url(https://picsum.photos/seed/${seed}/960/1280)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
}

export default function Home() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';
  const metrics = [
    { label: messages.home.metrics[0], value: messages.home.metricValues[0], tone: palette.orange },
    { label: messages.home.metrics[1], value: messages.home.metricValues[1], tone: palette.navy },
    { label: messages.home.metrics[2], value: messages.home.metricValues[2], tone: palette.teal },
  ];
  const valueCards = messages.home.valueCards.map(([eyebrow, title, body]) => ({ eyebrow, title, body }));
  const searchIntentItems = messages.home.searchIntentItems.map(([title, body]) => ({ title, body }));
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
        minHeight: '100dvh',
        background: palette.bg,
        color: palette.text,
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 12% 9%, rgba(224, 144, 67, 0.18), transparent 24%), radial-gradient(circle at 88% 14%, rgba(27, 111, 99, 0.14), transparent 24%), radial-gradient(circle at 52% 48%, rgba(255,255,255,0.26), transparent 36%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '14% auto auto -10%',
          width: '38vw',
          height: '38vw',
          minWidth: '280px',
          minHeight: '280px',
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(224, 144, 67, 0.22), rgba(224, 144, 67, 0))',
          filter: 'blur(34px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '42% -12% auto auto',
          width: '34vw',
          height: '34vw',
          minWidth: '260px',
          minHeight: '260px',
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(27, 111, 99, 0.16), rgba(27, 111, 99, 0))',
          filter: 'blur(36px)',
          pointerEvents: 'none',
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
        className="home-floating-nav home-reveal-0"
        style={{
          position: 'relative',
          zIndex: 3,
          maxWidth: '1360px',
          margin: '0 auto',
          padding: '18px 28px 0',
        }}
      >
        <div
          style={{
            ...surfaceStyle({
              radius: '999px',
              background: 'rgba(255,255,255,0.58)',
              shadow: '0 18px 54px rgba(17, 26, 34, 0.08)',
            }),
            padding: '12px 18px',
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
              href="/login"
              style={{
                padding: '12px 18px',
                borderRadius: '999px',
                color: palette.textSoft,
                background: 'rgba(255,255,255,0.72)',
                border: `1px solid ${palette.border}`,
                fontSize: '14px',
                fontWeight: 800,
              }}
            >
              {messages.common.signIn}
            </Link>
            <Link href="/audit" className="home-primary-cta" style={{ ...primaryLinkStyle(), minWidth: 'unset', padding: '13px 18px', fontSize: '14px' }}>
              {messages.common.startFreeScan}
            </Link>
          </div>
        </div>
      </nav>

      <main className="home-page-main" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100%', position: 'relative', zIndex: 2 }}>
        <ScrollReveal
          as="section"
          className="home-cinematic-hero"
          style={{
            position: 'relative',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '56px 28px 0',
          }}
        >
          <div
            className="home-hero-shell"
            style={{
              ...surfaceStyle({
                radius: '44px',
                background: 'rgba(255,250,244,0.72)',
                shadow: '0 34px 94px rgba(17, 26, 34, 0.1)',
              }),
              padding: '38px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '-12% auto auto -10%',
                width: '300px',
                height: '300px',
                borderRadius: '999px',
                background: 'radial-gradient(circle, rgba(224, 144, 67, 0.16), rgba(224, 144, 67, 0))',
                filter: 'blur(26px)',
                pointerEvents: 'none',
              }}
            />

            <div
              className="home-hero-grid"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 0.92fr) minmax(360px, 1.08fr)',
                gap: '38px',
                alignItems: 'stretch',
              }}
            >
              <div className="home-hero-copy-column" style={{ display: 'flex', flexDirection: 'column', gap: '18px', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ ...chapterLabelStyle(), marginBottom: '18px' }}>
                    <span style={{ width: '34px', height: '1px', background: 'rgba(17, 26, 34, 0.18)' }} />
                    {messages.home.badge}
                  </div>

                  <h1
                    style={{
                      margin: '0 0 18px',
                      maxWidth: '640px',
                      color: palette.text,
                      fontSize: 'clamp(3.3rem, 6.2vw, 6.05rem)',
                      lineHeight: 0.88,
                      letterSpacing: '-0.078em',
                      fontWeight: 700,
                      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                      textWrap: 'balance',
                    }}
                  >
                    {messages.home.heroTitle}
                  </h1>

                  <p
                    style={{
                      margin: '0 0 22px',
                      maxWidth: '560px',
                      color: palette.textSoft,
                      fontSize: '18px',
                      lineHeight: 1.74,
                      textWrap: 'pretty',
                    }}
                  >
                    {messages.home.heroBody}
                  </p>
                </div>

                <div
                  className="home-hero-note-inline"
                  style={{
                    ...surfaceStyle({
                      radius: '28px',
                      background: 'rgba(255,255,255,0.58)',
                      shadow: 'none',
                    }),
                    padding: '18px 20px',
                    maxWidth: '560px',
                  }}
                >
                  <div style={{ ...chapterLabelStyle(palette.copper), marginBottom: '10px' }}>{messages.home.closingEyebrow}</div>
                  <div style={{ color: palette.text, fontSize: '16px', fontWeight: 700, lineHeight: 1.55, marginBottom: '6px' }}>
                    {messages.home.heroNote}
                  </div>
                  <div style={{ color: palette.textSoft, fontSize: '14px', lineHeight: 1.65 }}>
                    {messages.home.searchIntentBody}
                  </div>
                </div>

                <div className="home-hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <Link href="/audit" className="home-primary-cta" style={primaryLinkStyle()}>
                    {messages.common.runFreeScan}
                  </Link>
                  <Link href="/methodology" style={secondaryLinkStyle()}>
                    {messages.home.methodologyLinkLabel}
                  </Link>
                </div>

                <div className="home-hero-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                  {metrics.map((item) => (
                    <div
                      key={item.label}
                      style={{
                        ...surfaceStyle({
                          radius: '24px',
                          background: 'rgba(255,255,255,0.58)',
                          shadow: 'none',
                        }),
                        padding: '16px 16px 17px',
                      }}
                    >
                      <div style={{ fontSize: '28px', lineHeight: 1, fontWeight: 900, letterSpacing: '-0.05em', color: item.tone }}>
                        {item.value}
                      </div>
                      <div style={{ marginTop: '7px', color: palette.textSoft, fontSize: '12px', lineHeight: 1.45 }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="home-hero-ribbon"
                  style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    paddingTop: '6px',
                  }}
                >
                  {searchIntentItems.slice(0, 3).map((item, index) => (
                    <span
                      key={item.title}
                      className={index === 1 ? 'home-ribbon-pill home-ribbon-pill-accent' : 'home-ribbon-pill'}
                      style={{
                        padding: '10px 14px',
                        borderRadius: '999px',
                        background: index === 1 ? 'rgba(224, 144, 67, 0.12)' : 'rgba(255,255,255,0.52)',
                        border: `1px solid ${index === 1 ? 'rgba(224, 144, 67, 0.18)' : palette.border}`,
                        color: index === 1 ? palette.copper : palette.textSoft,
                        fontSize: '12px',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.title}
                    </span>
                  ))}
                </div>
              </div>

              <div
                className="home-hover-lift home-float-card"
                style={{
                  ...surfaceStyle({
                    radius: '40px',
                    background: `linear-gradient(180deg, ${palette.navy} 0%, ${palette.navySoft} 100%)`,
                    border: 'rgba(255,255,255,0.08)',
                    shadow: '0 40px 100px rgba(17, 26, 34, 0.18)',
                  }),
                  padding: '28px',
                  color: '#F5EEE3',
                  position: 'relative',
                  overflow: 'hidden',
                  transform: 'translateY(34px)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 'auto -12% -28% auto',
                    width: '260px',
                    height: '260px',
                    borderRadius: '999px',
                    background: 'radial-gradient(circle, rgba(224, 144, 67, 0.18), rgba(224, 144, 67, 0))',
                    filter: 'blur(22px)',
                    pointerEvents: 'none',
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div className="home-sample-head" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'start', flexWrap: 'wrap', marginBottom: '24px' }}>
                    <div>
                      <div style={{ ...chapterLabelStyle('#98A6AF'), marginBottom: '12px' }}>{messages.home.sampleDiagnosis}</div>
                      <div
                        style={{
                          fontSize: '34px',
                          lineHeight: 0.94,
                          letterSpacing: '-0.06em',
                          fontWeight: 700,
                          fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                          marginBottom: '10px',
                          maxWidth: '480px',
                        }}
                      >
                        {messages.home.sampleRoleTitle}
                      </div>
                      <div style={{ maxWidth: '520px', fontSize: '15px', lineHeight: 1.72, color: '#C3D0D6' }}>
                        {messages.home.sampleRoleBody}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: '10px 14px',
                        borderRadius: '999px',
                        background: 'rgba(224, 144, 67, 0.14)',
                        color: '#F2C087',
                        border: '1px solid rgba(224, 144, 67, 0.18)',
                        fontSize: '12px',
                        fontWeight: 900,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {messages.home.pressureBuilding}
                    </div>
                  </div>

                  <div className="home-dark-metric-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
                    {metrics.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          borderRadius: '20px',
                          padding: '14px 14px 15px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <div style={{ fontSize: '26px', lineHeight: 1, fontWeight: 900, letterSpacing: '-0.05em', color: item.tone }}>
                          {item.value}
                        </div>
                        <div style={{ marginTop: '7px', color: '#9BAAB3', fontSize: '12px', lineHeight: 1.45 }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      borderRadius: '28px',
                      padding: '20px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      marginBottom: '16px',
                    }}
                  >
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {sampleTasks.map((task, index) => (
                        <div key={task.key}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', alignItems: 'baseline' }}>
                            <span style={{ color: '#E7DED1', fontSize: '13px', fontWeight: 700 }}>{sampleTaskLabels[index]}</span>
                            <span style={{ color: task.color, fontSize: '12px', fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                              {task.value}% {messages.home.exposedSuffix}
                            </span>
                          </div>
                          <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                            <div style={{ width: `${task.value}%`, height: '100%', borderRadius: '999px', background: task.color }} />
                          </div>
                          <div style={{ marginTop: '6px', color: task.color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {sampleTaskNotes[index]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      borderRadius: '28px',
                      padding: '18px 20px',
                      background: 'linear-gradient(135deg, rgba(224, 144, 67, 0.12), rgba(27, 111, 99, 0.1))',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ ...chapterLabelStyle('#DCCDB8'), marginBottom: '10px' }}>{messages.home.strongestNextMove}</div>
                    <div
                      style={{
                        fontSize: '24px',
                        lineHeight: 0.98,
                        letterSpacing: '-0.05em',
                        fontWeight: 700,
                        fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                        marginBottom: '8px',
                      }}
                    >
                      {messages.home.strongestNextMoveTitle}
                    </div>
                    <div style={{ color: '#C6D2D8', fontSize: '14px', lineHeight: 1.65 }}>
                      {messages.home.strongestNextMoveBody}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="home-hero-lower-grid"
              style={{
                position: 'relative',
                zIndex: 1,
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.08fr) minmax(320px, 0.92fr)',
                gap: '26px',
                alignItems: 'stretch',
                marginTop: '34px',
              }}
            >
              <div
                className="home-hover-lift"
                style={{
                  ...surfaceStyle({
                    radius: '34px',
                  background: 'rgba(255,255,255,0.78)',
                  }),
                  padding: '26px',
                  minHeight: '360px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '18px',
                    borderRadius: '24px',
                    ...imagePanelStyle(
                      bentoImageSeeds[0],
                      'linear-gradient(180deg, rgba(17,26,34,0.02), rgba(17,26,34,0.64))'
                    ),
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ ...chapterLabelStyle('#F0E2CB') }}>{messages.home.roadmapPreview}</div>
                  <div style={{ maxWidth: '360px' }}>
                    <div
                      style={{
                        color: '#FFF8EE',
                        fontSize: '30px',
                        lineHeight: 0.96,
                        letterSpacing: '-0.06em',
                        fontWeight: 700,
                        fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                        marginBottom: '12px',
                      }}
                    >
                      {messages.home.roadmapWeeks}
                    </div>
                    <div style={{ display: 'grid', gap: '8px', maxWidth: '340px' }}>
                      {messages.home.roadmapItems.map((item, index) => (
                        <div
                          key={item}
                          style={{
                            padding: '11px 12px',
                            borderRadius: '16px',
                            color: '#FFF8EE',
                            background: index === 0 ? 'rgba(224, 144, 67, 0.18)' : 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontSize: '13px',
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

              <div className="home-hero-mini-stack" style={{ display: 'grid', gap: '18px' }}>
                <div
                  className="home-hover-lift"
                  style={{
                    ...surfaceStyle({
                      radius: '30px',
                      background: 'rgba(255,255,255,0.74)',
                    }),
                    padding: '24px',
                  }}
                >
                  <HomeSignalRail
                    eyebrow={messages.home.searchIntentEyebrow}
                    items={searchIntentItems}
                    steps={roadmapSteps}
                  />
                </div>

                <div
                  className="home-hover-lift"
                  style={{
                    ...surfaceStyle({
                      radius: '30px',
                      background: 'rgba(255,249,242,0.86)',
                    }),
                    padding: '20px',
                  }}
                >
                  <div style={{ ...chapterLabelStyle(), marginBottom: '10px' }}>{messages.home.roleGuidesEyebrow}</div>
                  <div
                    style={{
                      fontSize: '26px',
                      lineHeight: 0.98,
                      letterSpacing: '-0.055em',
                      fontWeight: 700,
                      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                      marginBottom: '10px',
                    }}
                  >
                    {messages.home.roleGuidesTitle}
                  </div>
                  <div style={{ color: palette.textSoft, fontSize: '14px', lineHeight: 1.68, marginBottom: '14px' }}>
                    {messages.home.roleGuidesBody}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {featuredRoleGuides.map((item) => (
                      <Link
                        key={`hero-${item.href}`}
                        href={item.href}
                        style={{
                          padding: '9px 12px',
                          borderRadius: '999px',
                          background: 'rgba(255,255,255,0.72)',
                          border: `1px solid ${palette.border}`,
                          color: palette.textSoft,
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/methodology"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      color: palette.teal,
                      fontSize: '13px',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {messages.home.methodologyLinkLabel}
                  </Link>
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
          className="home-interest-chapter"
          style={{
            position: 'relative',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '136px 28px 0',
          }}
        >
          <div
            className="home-interest-grid"
            style={{
              ...surfaceStyle({
                radius: '42px',
                background: 'rgba(255,250,244,0.7)',
                shadow: '0 28px 84px rgba(17, 26, 34, 0.09)',
              }),
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 0.76fr) minmax(0, 1.24fr)',
              gap: '26px',
              alignItems: 'start',
              padding: '28px',
            }}
          >
            <div>
              <div style={{ ...chapterLabelStyle(), marginBottom: '14px' }}>{messages.home.searchIntentEyebrow}</div>
              <div
                style={{
                  maxWidth: '500px',
                  fontSize: 'clamp(2.7rem, 5vw, 4.6rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.07em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                  marginBottom: '16px',
                }}
              >
                {messages.home.searchIntentTitle}
              </div>
              <p style={{ maxWidth: '470px', fontSize: '17px', lineHeight: 1.72, color: palette.textSoft, margin: '0 0 18px' }}>
                {messages.home.searchIntentBody}
              </p>
              <div style={{ display: 'grid', gap: '10px' }}>
                {messages.home.searchIntentItems.map(([title, body], index) => (
                  <div
                    key={title}
                    style={{
                      ...surfaceStyle({
                        radius: '22px',
                        background: index === 0 ? 'rgba(255,249,242,0.88)' : 'rgba(255,255,255,0.56)',
                        shadow: 'none',
                      }),
                      padding: '15px 16px',
                    }}
                  >
                    <div style={{ color: index === 0 ? palette.copper : palette.textMuted, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div style={{ color: palette.text, fontSize: '16px', fontWeight: 800, lineHeight: 1.35, marginBottom: '5px' }}>
                      {title}
                    </div>
                    <div style={{ color: palette.textSoft, fontSize: '13px', lineHeight: 1.62 }}>
                      {body}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="home-bento-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gridAutoFlow: 'dense',
                gap: '18px',
              }}
            >
              <ScrollReveal
                className="home-hover-lift"
                style={{
                  ...surfaceStyle({
                    radius: '34px',
                    background: `linear-gradient(145deg, ${palette.navy} 0%, #20303B 100%)`,
                    border: 'rgba(255,255,255,0.08)',
                    shadow: '0 28px 84px rgba(17, 26, 34, 0.16)',
                  }),
                  gridColumn: 'span 4 / span 4',
                  minHeight: '360px',
                  padding: '24px',
                  color: '#F8F1E5',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: '18px',
                    borderRadius: '26px',
                    ...imagePanelStyle(
                      bentoImageSeeds[1],
                      'linear-gradient(180deg, rgba(17,26,34,0.1), rgba(17,26,34,0.76))'
                    ),
                    opacity: 0.9,
                  }}
                />
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <div style={{ ...chapterLabelStyle('#E7D7BE'), marginBottom: '12px' }}>{valueCards[0]?.eyebrow}</div>
                    <div
                      style={{
                        maxWidth: '520px',
                        fontSize: '32px',
                        lineHeight: 0.96,
                        letterSpacing: '-0.06em',
                        fontWeight: 700,
                        fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                        marginBottom: '12px',
                      }}
                    >
                      {valueCards[0]?.title}
                    </div>
                    <div style={{ maxWidth: '520px', color: '#D7E0E4', fontSize: '15px', lineHeight: 1.7 }}>
                      {valueCards[0]?.body}
                    </div>
                  </div>
                  <div className="home-inline-stat-row" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {metrics.map((item) => (
                      <div
                        key={item.label}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '999px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: '#F4EADA',
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        <span style={{ color: item.tone, marginRight: '8px' }}>{item.value}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal
                className="home-hover-lift"
                style={{
                  ...surfaceStyle({
                    radius: '32px',
                    background: 'rgba(255,255,255,0.84)',
                  }),
                  gridColumn: 'span 2 / span 2',
                  padding: '20px',
                  minHeight: '360px',
                }}
              >
                <div style={{ ...chapterLabelStyle(), marginBottom: '12px' }}>{messages.home.strongestNextMove}</div>
                <div
                  style={{
                    fontSize: '28px',
                    lineHeight: 0.96,
                    letterSpacing: '-0.055em',
                    fontWeight: 700,
                    fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                    marginBottom: '12px',
                  }}
                >
                  {messages.home.strongestNextMoveTitle}
                </div>
                <div style={{ color: palette.textSoft, fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>
                  {messages.home.strongestNextMoveBody}
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {roadmapSteps.slice(0, 2).map((step) => (
                    <div
                      key={step.number}
                      style={{
                        borderRadius: '18px',
                        padding: '14px',
                        background: 'rgba(17, 26, 34, 0.04)',
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <div style={{ color: palette.copper, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '5px' }}>{step.number}</div>
                      <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800, marginBottom: '5px' }}>{step.title}</div>
                      <div style={{ color: palette.textSoft, fontSize: '13px', lineHeight: 1.6 }}>{step.body}</div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              <ScrollReveal
                className="home-hover-lift"
                style={{
                  ...surfaceStyle({
                    radius: '32px',
                    background: 'rgba(255,255,255,0.72)',
                  }),
                  gridColumn: 'span 3 / span 3',
                  padding: '20px',
                }}
              >
                <div style={{ ...chapterLabelStyle(), marginBottom: '12px' }}>{valueCards[1]?.eyebrow}</div>
                <div
                  style={{
                    fontSize: '30px',
                    lineHeight: 0.96,
                    letterSpacing: '-0.055em',
                    fontWeight: 700,
                    fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                    marginBottom: '10px',
                    maxWidth: '360px',
                  }}
                >
                  {valueCards[1]?.title}
                </div>
                <div style={{ color: palette.textSoft, fontSize: '14px', lineHeight: 1.72 }}>
                  {valueCards[1]?.body}
                </div>
              </ScrollReveal>

              <ScrollReveal
                className="home-hover-lift"
                style={{
                  ...surfaceStyle({
                    radius: '32px',
                    background: 'rgba(255,249,242,0.92)',
                  }),
                  gridColumn: 'span 3 / span 3',
                  padding: '20px',
                }}
              >
                <div style={{ ...chapterLabelStyle(palette.copper), marginBottom: '12px' }}>{valueCards[2]?.eyebrow}</div>
                <div
                  style={{
                    fontSize: '30px',
                    lineHeight: 0.96,
                    letterSpacing: '-0.055em',
                    fontWeight: 700,
                    fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                    marginBottom: '10px',
                    maxWidth: '380px',
                  }}
                >
                  {valueCards[2]?.title}
                </div>
                <div style={{ color: palette.textSoft, fontSize: '14px', lineHeight: 1.72 }}>
                  {valueCards[2]?.body}
                </div>
              </ScrollReveal>

              <ScrollReveal
                className="home-hover-lift"
                style={{
                  ...surfaceStyle({
                    radius: '34px',
                    background: 'rgba(255,255,255,0.8)',
                  }),
                  gridColumn: 'span 6 / span 6',
                  padding: '22px',
                }}
              >
                <div className="home-scan-strip" style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 0.78fr) minmax(0, 1.22fr)', gap: '18px', alignItems: 'start' }}>
                  <div
                    style={{
                      borderRadius: '26px',
                      padding: '18px',
                      minHeight: '220px',
                      ...imagePanelStyle(
                        bentoImageSeeds[2],
                        'linear-gradient(180deg, rgba(17,26,34,0.08), rgba(17,26,34,0.62))'
                      ),
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ ...chapterLabelStyle('#F4E7D2') }}>{messages.home.sampleDiagnosis}</div>
                    <div style={{ color: '#FFF9F2', fontSize: '18px', fontWeight: 800, lineHeight: 1.35, maxWidth: '220px' }}>
                      {messages.home.sampleRoleTitle}
                    </div>
                  </div>

                  <div>
                    <div style={{ ...chapterLabelStyle(), marginBottom: '14px' }}>{messages.home.roadmapPreview}</div>
                    <div className="home-inline-proof-grid" style={{ display: 'grid', gap: '10px' }}>
                      {sampleTasks.map((task, index) => (
                        <div
                          key={task.key}
                          style={{
                            borderRadius: '18px',
                            padding: '14px 16px',
                            background: index === 0 ? 'rgba(224, 144, 67, 0.08)' : 'rgba(17, 26, 34, 0.04)',
                            border: `1px solid ${palette.border}`,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', alignItems: 'baseline' }}>
                            <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800 }}>
                              {sampleTaskLabels[index]}
                            </div>
                            <div style={{ color: task.color, fontSize: '12px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              {sampleTaskNotes[index]}
                            </div>
                          </div>
                          <div style={{ height: '8px', borderRadius: '999px', background: 'rgba(17, 26, 34, 0.08)', overflow: 'hidden' }}>
                            <div style={{ width: `${task.value}%`, height: '100%', borderRadius: '999px', background: task.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="home-sticky-narrative"
          style={{
            position: 'relative',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '140px 28px 0',
          }}
        >
          <div
            className="home-sticky-grid"
            style={{
              ...surfaceStyle({
                radius: '42px',
                background: 'rgba(255,255,255,0.72)',
                shadow: '0 28px 84px rgba(17, 26, 34, 0.09)',
              }),
              display: 'grid',
              gridTemplateColumns: 'minmax(280px, 0.72fr) minmax(0, 1.28fr)',
              gap: '24px',
              alignItems: 'start',
              padding: '28px',
            }}
          >
            <div className="home-sticky-copy" style={{ position: 'sticky', top: '106px' }}>
              <div style={{ ...chapterLabelStyle(), marginBottom: '14px' }}>{messages.home.lanesIntroTitle}</div>
              <div
                style={{
                  maxWidth: '430px',
                  fontSize: 'clamp(2.7rem, 5vw, 4.8rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.07em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                  marginBottom: '16px',
                }}
              >
                {messages.home.lanesIntroTitle}
              </div>
              <p style={{ maxWidth: '420px', fontSize: '17px', lineHeight: 1.74, color: palette.textSoft, margin: '0 0 22px' }}>
                {messages.home.lanesIntroBody}
              </p>
              <div style={{ marginBottom: '18px' }}>
                <Link
                  href="/methodology"
                  style={{
                    color: palette.teal,
                    fontSize: '14px',
                    fontWeight: 800,
                    textDecoration: 'none',
                  }}
                >
                  {messages.home.methodologyLinkLabel}
                </Link>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ ...chapterLabelStyle(), width: '100%', marginBottom: '2px' }}>{messages.home.roleGuidesEyebrow}</span>
                {featuredRoleGuides.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.6)',
                      border: `1px solid ${palette.border}`,
                      color: palette.textSoft,
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

            <div className="home-lane-stack" style={{ display: 'grid', gap: '18px' }}>
              {pivotLanes.map((lane, index) => (
                <ScrollReveal
                  key={lane.title}
                  as="article"
                  className="home-hover-lift"
                  delay={index * 90}
                  style={{
                    ...surfaceStyle({
                      radius: '34px',
                      background: 'rgba(255,255,255,0.8)',
                    }),
                    padding: '20px',
                  }}
                >
                  <div className="home-lane-frame" style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: '20px', alignItems: 'stretch' }}>
                    <div
                      style={{
                        minHeight: '220px',
                        borderRadius: '26px',
                        ...imagePanelStyle(
                          laneImageSeeds[index] || `lane-${index}`,
                          'linear-gradient(180deg, rgba(17,26,34,0.05), rgba(17,26,34,0.58))'
                        ),
                        display: 'flex',
                        alignItems: 'flex-end',
                        padding: '16px',
                      }}
                    >
                      <div
                        style={{
                          padding: '9px 12px',
                          borderRadius: '999px',
                          background: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.12)',
                          color: '#FFF9F2',
                          fontSize: '11px',
                          fontWeight: 900,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {lane.label}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                      <div>
                        <div
                          style={{
                            maxWidth: '520px',
                            fontSize: '34px',
                            lineHeight: 0.95,
                            letterSpacing: '-0.06em',
                            fontWeight: 700,
                            fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                            marginBottom: '12px',
                          }}
                        >
                          {lane.title}
                        </div>
                        <div style={{ maxWidth: '560px', color: palette.textSoft, fontSize: '15px', lineHeight: 1.72 }}>
                          {lane.body}
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: '22px',
                          padding: '16px',
                          background: index === 0 ? 'rgba(224, 144, 67, 0.08)' : 'rgba(17, 26, 34, 0.04)',
                          border: `1px solid ${palette.border}`,
                        }}
                      >
                        <div style={{ color: index === 0 ? palette.copper : palette.textMuted, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>
                          {roadmapSteps[index]?.number || messages.home.roadmapPreview}
                        </div>
                        <div style={{ color: palette.text, fontSize: '17px', fontWeight: 800, marginBottom: '6px' }}>
                          {roadmapSteps[index]?.title || messages.home.roadmapWeeks}
                        </div>
                        <div style={{ color: palette.textSoft, fontSize: '13px', lineHeight: 1.62 }}>
                          {roadmapSteps[index]?.body || messages.home.lanesIntroBody}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="home-proof-chapter"
          style={{
            position: 'relative',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '140px 28px 0',
          }}
        >
          <div
            style={{
              ...surfaceStyle({
                radius: '42px',
                background: 'rgba(255,250,244,0.84)',
              }),
              padding: '28px',
            }}
          >
            <div className="home-proof-top" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 0.82fr)', gap: '22px', alignItems: 'start', marginBottom: '22px' }}>
              <div>
                <div style={{ ...chapterLabelStyle(), marginBottom: '14px' }}>{messages.home.faqEyebrow}</div>
                <div
                  style={{
                    maxWidth: '660px',
                    fontSize: 'clamp(2.5rem, 4.6vw, 4.2rem)',
                    lineHeight: 0.94,
                    letterSpacing: '-0.065em',
                    fontWeight: 700,
                    fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                    marginBottom: '14px',
                  }}
                >
                  {messages.home.faqTitle}
                </div>
                <p style={{ maxWidth: '620px', color: palette.textSoft, fontSize: '16px', lineHeight: 1.74, margin: 0 }}>
                  {messages.home.faqBody}
                </p>
              </div>

              <div
                style={{
                  ...surfaceStyle({
                    radius: '30px',
                    background: 'rgba(255,255,255,0.78)',
                    shadow: 'none',
                  }),
                  padding: '18px',
                }}
              >
                <div style={{ ...chapterLabelStyle(palette.copper), marginBottom: '12px' }}>{messages.home.closingEyebrow}</div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {roadmapSteps.map((step) => (
                    <div
                      key={step.number}
                      style={{
                        borderRadius: '18px',
                        padding: '13px 14px',
                        background: 'rgba(17, 26, 34, 0.04)',
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <div style={{ color: palette.copper, fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '5px' }}>{step.number}</div>
                      <div style={{ color: palette.text, fontSize: '15px', fontWeight: 800, marginBottom: '4px' }}>{step.title}</div>
                      <div style={{ color: palette.textSoft, fontSize: '13px', lineHeight: 1.58 }}>{step.body}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="home-faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              {faqItems.map((item, index) => (
                <ScrollReveal
                  key={item.question}
                  as="article"
                  delay={index * 70}
                  className="home-hover-lift"
                  style={{
                    borderRadius: '28px',
                    padding: '22px',
                    background: index === 0 ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.68)',
                    border: `1px solid ${palette.border}`,
                  }}
                >
                  <h2
                    style={{
                      margin: '0 0 10px',
                      color: palette.text,
                      fontSize: '26px',
                      lineHeight: 0.98,
                      letterSpacing: '-0.05em',
                      fontWeight: 700,
                      fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                    }}
                  >
                    {item.question}
                  </h2>
                  <p style={{ margin: 0, color: palette.textSoft, fontSize: '15px', lineHeight: 1.74 }}>
                    {item.answer}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal
          as="section"
          className="home-final-chapter"
          style={{
            position: 'relative',
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '140px 28px 110px',
          }}
        >
          <div
            className="home-final-shell"
            style={{
              ...surfaceStyle({
                radius: '44px',
                background: `linear-gradient(160deg, ${palette.navy} 0%, #1B2832 100%)`,
                border: 'rgba(255,255,255,0.08)',
                shadow: '0 40px 120px rgba(17, 26, 34, 0.2)',
              }),
              padding: '30px',
              color: '#F7F0E6',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.04fr) minmax(320px, 0.96fr)',
              gap: '22px',
              alignItems: 'start',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 'auto auto -18% -6%',
                width: '280px',
                height: '280px',
                borderRadius: '999px',
                background: 'radial-gradient(circle, rgba(224, 144, 67, 0.18), rgba(224, 144, 67, 0))',
                filter: 'blur(28px)',
                pointerEvents: 'none',
              }}
            />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ ...chapterLabelStyle('#AAB8C1'), marginBottom: '14px' }}>{messages.home.closingEyebrow}</div>
              <div
                style={{
                  maxWidth: '640px',
                  fontSize: 'clamp(2.8rem, 5vw, 4.8rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.07em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                  marginBottom: '14px',
                }}
              >
                {messages.home.closingTitle}
              </div>
              <p style={{ maxWidth: '600px', color: '#C2CFD5', fontSize: '17px', lineHeight: 1.74, margin: '0 0 24px' }}>
                {messages.home.closingBody}
              </p>

              <div className="home-final-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
                <Link
                  href="/audit"
                  className="home-primary-cta"
                  style={{
                    ...primaryLinkStyle(),
                    background: 'linear-gradient(135deg, #E09043, #F2C279)',
                    color: palette.navy,
                    border: '1px solid rgba(224, 144, 67, 0.26)',
                    boxShadow: '0 24px 58px rgba(224, 144, 67, 0.24)',
                  }}
                >
                  {messages.home.closingCta}
                </Link>
                <Link
                  href="/methodology"
                  style={{
                    ...secondaryLinkStyle(),
                    background: 'rgba(255,255,255,0.07)',
                    color: '#F7F0E6',
                    border: '1px solid rgba(255,255,255,0.14)',
                  }}
                >
                  {messages.home.methodologyLinkLabel}
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ ...chapterLabelStyle('#AAB8C1'), width: '100%', marginBottom: '4px' }}>{messages.home.roleGuidesEyebrow}</span>
                {featuredRoleGuides.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '999px',
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#F2E1C9',
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

            <div style={{ position: 'relative', zIndex: 1, display: 'grid', gap: '14px' }}>
              <div
                style={{
                  borderRadius: '30px',
                  padding: '18px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ ...chapterLabelStyle('#F1DAB9'), marginBottom: '10px' }}>{messages.home.sampleDiagnosis}</div>
                <div
                  style={{
                    fontSize: '26px',
                    lineHeight: 0.96,
                    letterSpacing: '-0.055em',
                    fontWeight: 700,
                    fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                    marginBottom: '10px',
                  }}
                >
                  {messages.home.sampleRoleTitle}
                </div>
                <div style={{ color: '#C2CFD5', fontSize: '14px', lineHeight: 1.68, marginBottom: '14px' }}>
                  {messages.home.sampleRoleBody}
                </div>
                <div style={{ display: 'grid', gap: '9px' }}>
                  {sampleTasks.map((task, index) => (
                    <div key={`${task.key}-closing`}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '5px', alignItems: 'baseline' }}>
                        <span style={{ color: '#F7F0E6', fontSize: '13px', fontWeight: 700 }}>{sampleTaskLabels[index]}</span>
                        <span style={{ color: task.color, fontSize: '11px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          {sampleTaskNotes[index]}
                        </span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                        <div style={{ width: `${task.value}%`, height: '100%', borderRadius: '999px', background: task.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="home-final-step-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                {roadmapSteps.map((step) => (
                  <div
                    key={`${step.number}-closing`}
                    style={{
                      borderRadius: '24px',
                      padding: '16px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ color: '#F0C58F', fontSize: '11px', fontWeight: 900, letterSpacing: '0.1em', marginBottom: '6px' }}>
                      {step.number}
                    </div>
                    <div style={{ color: '#F7F0E6', fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>
                      {step.title}
                    </div>
                    <div style={{ color: '#AEBCC4', fontSize: '13px', lineHeight: 1.58 }}>
                      {step.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>
    </div>
  );
}
