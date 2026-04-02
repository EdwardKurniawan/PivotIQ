import Link from 'next/link';
import ScrollReveal from '../components/scroll-reveal';
import { BrandLogo } from '../components/brand-logo';
import LanguageSwitcher from '../components/language-switcher';
import MobileStickyCta from '../components/mobile-sticky-cta';
import { getMessages } from '../lib/i18n';
import { getServerLocale } from '../lib/i18n-server';

export const metadata = {
  title: 'AI Career Risk Scanner for White-Collar Professionals',
  description: 'Run a free AI career risk scan to see which parts of your role are exposed, which strengths still compound, and which adjacent pivots make sense next.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Career Risk Scanner for White-Collar Professionals',
    description: 'See AI risk by task, identify believable adjacent pivots, and get a practical transition roadmap.',
    url: '/',
    type: 'website',
  },
  twitter: {
    title: 'AI Career Risk Scanner for White-Collar Professionals',
    description: 'See AI risk by task, identify believable adjacent pivots, and get a practical transition roadmap.',
  },
};

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
    padding: '18px 24px',
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
      'PivotIQ helps white-collar professionals understand AI career risk at the task level, discover believable adjacent pivots, and follow a transition roadmap.',
    url: siteUrl,
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

      <nav
        className="home-reveal-0 home-nav"
        style={{
          position: 'relative',
          zIndex: 2,
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
          padding: '34px 28px 42px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.08fr) minmax(320px, 0.92fr)',
          gap: '28px',
          alignItems: 'end',
        }}
      >
        <div className={`home-hero-copy ${locale !== 'en' ? 'home-hero-copy-long' : ''}`}>
          <div className="home-badge home-reveal-1" style={{ ...badgeStyle(), marginBottom: '18px' }}>{messages.home.badge}</div>

          <h1
            className="home-reveal-2"
            style={{
              fontSize: 'clamp(62px, 9vw, 118px)',
              lineHeight: 0.9,
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
              fontSize: '20px',
              lineHeight: 1.65,
              color: '#42505C',
              margin: '0 0 28px',
              textWrap: 'pretty',
            }}
          >
            {messages.home.heroBody}
          </p>

          <div className="home-reveal-4 home-hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '26px' }}>
            <Link className="home-primary-cta" href="/audit" style={primaryLinkStyle()}>
              {messages.common.runFreeScan}
            </Link>
            <div
              className="home-hero-note"
              style={{
                padding: '17px 20px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.66)',
                border: `1px solid ${palette.border}`,
                color: '#4A5762',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              {messages.home.heroNote}
            </div>
          </div>

        </div>

        <div
          className="home-hero-art"
          style={{
            position: 'relative',
            minHeight: '620px',
            display: 'grid',
            alignItems: 'stretch',
          }}
        >
          <div
            className="home-glow"
            style={{
              position: 'absolute',
              inset: '22px 0 0 36px',
              borderRadius: '40px',
              background: 'linear-gradient(180deg, rgba(242, 138, 67, 0.14), rgba(27, 111, 99, 0.1))',
              filter: 'blur(16px)',
            }}
          />

          <div
            className="home-float-slow home-sample-card"
            style={{
              ...shellCardStyle(),
              position: 'relative',
              borderRadius: '36px',
              padding: '24px',
              '--float-rotate': '-3deg',
              transform: 'rotate(-3deg)',
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
              right: '-6px',
              bottom: '24px',
              width: '44%',
              borderRadius: '30px',
              padding: '18px',
              '--float-rotate': '5deg',
              transform: 'rotate(5deg)',
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
        className="home-value-section"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '12px 28px 82px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '18px',
          }}
        >
          {valueCards.map((card, index) => (
            <ScrollReveal
              key={card.title}
              className="home-hover-lift"
              delay={index * 90}
              style={{
                ...shellCardStyle(),
                borderRadius: '30px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#6A7882', marginBottom: '10px', fontWeight: 800 }}>
                {card.eyebrow}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  lineHeight: 1.02,
                  letterSpacing: '-0.045em',
                  fontWeight: 700,
                  fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
                  marginBottom: '12px',
                }}
              >
                {card.title}
              </div>
              <div style={{ fontSize: '15px', lineHeight: 1.7, color: '#50606B' }}>{card.body}</div>
            </ScrollReveal>
          ))}
        </div>
      </ScrollReveal>

      <ScrollReveal
        as="section"
        className={`home-lanes-section ${locale !== 'en' ? 'home-lanes-section-long' : ''}`}
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 88px',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.85fr) minmax(320px, 1.15fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <ScrollReveal delay={40} className={locale !== 'en' ? 'home-lanes-intro-long' : ''} style={{ paddingTop: '10px' }}>
          <div
            style={{
              fontSize: 'clamp(42px, 6vw, 72px)',
              lineHeight: 0.95,
              letterSpacing: '-0.06em',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              marginBottom: '18px',
              maxWidth: '440px',
            }}
          >
            {messages.home.lanesIntroTitle}
          </div>
          <p style={{ fontSize: '18px', lineHeight: 1.72, color: '#495863', maxWidth: '430px' }}>
            {messages.home.lanesIntroBody}
          </p>
        </ScrollReveal>

        <div className="home-lanes-list" style={{ display: 'grid', gap: '16px' }}>
          {pivotLanes.map((lane, index) => (
            <ScrollReveal
              key={lane.title}
              className="home-hover-lift home-lane-card"
              delay={index * 100}
              style={{
                ...shellCardStyle(),
                borderRadius: '30px',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '140px minmax(0, 1fr)',
                gap: '18px',
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  borderRadius: '22px',
                  padding: '18px',
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
              How it works
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
              Start with the free scan. Unlock the roadmap only if the diagnosis earns your trust.
            </div>
            <p style={{ fontSize: '17px', lineHeight: 1.72, color: '#C3CFD5', maxWidth: '600px' }}>
              The free layer should already feel useful. The paid layer exists to turn that clarity into a concrete pivot plan with milestones and skill priorities.
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
              Start the scan
            </Link>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}
