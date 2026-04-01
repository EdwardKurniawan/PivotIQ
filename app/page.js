import Link from 'next/link';
import ScrollReveal from '../components/scroll-reveal';
import { BrandLogo } from '../components/brand-logo';

const metrics = [
  { label: 'Time to first read', value: '2 min', tone: '#F28A43' },
  { label: 'Free layer', value: 'Useful', tone: '#15384B' },
  { label: 'Upgrade', value: 'One-time', tone: '#1B6F63' },
];

const sampleTasks = [
  {
    label: 'Reporting and recurring updates',
    value: 82,
    color: '#F28A43',
    note: 'High pressure',
  },
  {
    label: 'Forecasting and scenario framing',
    value: 61,
    color: '#E8D8C0',
    note: 'Needs repositioning',
  },
  {
    label: 'Cross-functional planning',
    value: 24,
    color: '#50B8A6',
    note: 'Human edge',
  },
];

const valueCards = [
  {
    eyebrow: 'Spot the pressure',
    title: 'See what inside your role is getting cheaper.',
    body: 'The scan maps the actual work inside the job, so the answer feels specific instead of generic.',
  },
  {
    eyebrow: 'Find the leverage',
    title: 'See where your advantage still compounds.',
    body: 'We highlight the work that gets stronger when trust, judgment, communication, and ownership matter more.',
  },
  {
    eyebrow: 'Move with signal',
    title: 'Get adjacent pivots that actually feel believable.',
    body: 'The roadmap turns the diagnosis into role directions, skill gaps, and proof you can build week by week.',
  },
];

const pivotLanes = [
  {
    label: 'For operators',
    title: 'From repetitive execution to system ownership',
    body: 'Move closer to workflow design, enablement, and cross-functional coordination other teams depend on.',
  },
  {
    label: 'For analysts',
    title: 'From reporting output to business interpretation',
    body: 'Shift toward planning, scenario framing, and translating numbers into choices leaders can act on.',
  },
  {
    label: 'For specialists',
    title: 'From isolated tasks to trusted domain judgment',
    body: 'Build around context, client nuance, and accountable recommendations that generic tools still cannot carry.',
  },
];

const roadmapSteps = [
  {
    number: '01',
    title: 'Map the fragile work',
    body: 'Separate what is getting cheaper from the work that still holds durable value.',
  },
  {
    number: '02',
    title: 'Pick the believable pivot',
    body: 'Choose the direction that keeps your context while increasing defensibility.',
  },
  {
    number: '03',
    title: 'Build proof that compounds',
    body: 'Follow a roadmap designed to create visible momentum, not vague intentions.',
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
    background: palette.navy,
    color: '#FFF7F1',
    fontSize: '16px',
    fontWeight: 800,
    boxShadow: '0 24px 54px rgba(19, 32, 42, 0.18)',
  };
}

export default function Home() {
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
        <BrandLogo subtitle="See the shift before it hits" />

        <Link
          href="/audit"
          style={{
            padding: '13px 18px',
            borderRadius: '999px',
            color: '#FFF7F1',
            background: palette.navy,
            fontSize: '14px',
            fontWeight: 800,
            boxShadow: '0 18px 40px rgba(18, 31, 41, 0.16)',
          }}
        >
          Start free scan
        </Link>
      </nav>

      <ScrollReveal
        as="section"
        className="home-hero"
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
        <div className="home-hero-copy">
          <div className="home-badge home-reveal-1" style={{ ...badgeStyle(), marginBottom: '18px' }}>Career intelligence for the AI shift</div>

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
            Career clarity, before your role gets quietly redefined.
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
            PivotIQ breaks your role into the work that is becoming automated, the work that still compounds, and the moves that make sense before urgency decides for you.
          </p>

          <div className="home-reveal-4 home-hero-actions" style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '26px' }}>
            <Link href="/audit" style={primaryLinkStyle()}>
              Run my free scan
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
              Free diagnosis first. Roadmap later if it earns it.
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
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#91A0AA' }}>Sample diagnosis</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '6px', letterSpacing: '-0.03em' }}>Finance Manager</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#C4D0D6', marginTop: '6px', maxWidth: '420px' }}>
                    Stable title. Fragile reporting layer. Clear path toward planning, systems, and strategic operations.
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
                  Pressure building
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
                    <div key={task.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#E9E0D2' }}>{task.label}</span>
                        <span style={{ color: task.color, fontWeight: 800 }}>{task.value}% exposed</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${task.value}%`, height: '100%', borderRadius: '999px', background: task.color, transition: 'width 0.9s ease' }} />
                      </div>
                      <div style={{ color: task.color, fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '6px' }}>
                        {task.note}
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
                  Strongest next move
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
                  Reposition toward strategic finance, systems, or planning.
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#C4D0D6' }}>
                  The point is not panic. It is to show where your leverage still lives, then help you move before the market forces the decision.
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
                Roadmap preview
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '10px' }}>Weeks 1-12</div>
              <div style={{ display: 'grid', gap: '8px' }}>
                {['Reframe the narrative', 'Close the skill gap', 'Build proof that compounds'].map((item, index) => (
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
        className="home-lanes-section"
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
        <ScrollReveal delay={40} style={{ paddingTop: '10px' }}>
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
            A better pivot should still feel close to who you already are.
          </div>
          <p style={{ fontSize: '18px', lineHeight: 1.72, color: '#495863', maxWidth: '430px' }}>
            The best moves usually keep your existing context and shift you toward work that gets harder to replace, not just more impressive to describe.
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
                background: '#F4EFE7',
                color: palette.navy,
                fontWeight: 800,
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
