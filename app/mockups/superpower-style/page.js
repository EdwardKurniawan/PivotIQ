import Link from 'next/link';

const highlights = [
  'Free task-level scan',
  'Credible adjacent pivots',
  'One-time roadmap upgrade',
];

const outcomes = [
  {
    stat: '68%',
    label: 'of the sample role is under pressure',
    tone: '#F28A43',
  },
  {
    stat: '3',
    label: 'adjacent pivots ranked by fit',
    tone: '#113B55',
  },
  {
    stat: '12',
    label: 'weeks in the execution roadmap',
    tone: '#1B6F63',
  },
];

const storyCards = [
  {
    eyebrow: 'Risk map',
    title: 'See what in your role is turning into software.',
    body: 'We score the actual work inside the job, so the answer feels personal instead of generic.',
  },
  {
    eyebrow: 'Human edge',
    title: 'See what still gets stronger with trust and judgment.',
    body: 'The scan highlights the parts of your week that are harder to automate because context still matters.',
  },
  {
    eyebrow: 'Pivot plan',
    title: 'See where to move next before urgency decides for you.',
    body: 'When the diagnosis earns it, the paid layer turns that signal into pivots, skill gaps, and milestones.',
  },
];

const lanes = [
  {
    label: 'Operators',
    title: 'Move from execution to system ownership',
    body: 'Closer to workflow design, enablement, and coordination other teams rely on.',
  },
  {
    label: 'Analysts',
    title: 'Move from reporting to interpretation',
    body: 'Closer to planning, scenario framing, and decisions leaders can actually use.',
  },
  {
    label: 'Specialists',
    title: 'Move from output to trusted judgment',
    body: 'Closer to domain nuance, client communication, and accountable recommendations.',
  },
];

const roadmapSteps = [
  {
    number: '01',
    title: 'Map the fragile work',
    body: 'Identify the tasks that are getting cheaper and the ones still carrying durable value.',
  },
  {
    number: '02',
    title: 'Pick the strongest next move',
    body: 'Choose the role direction that preserves your context while increasing defensibility.',
  },
  {
    number: '03',
    title: 'Build proof in public',
    body: 'Follow a weekly roadmap that turns the pivot into visible evidence, not vague intent.',
  },
];

function shellCardStyle() {
  return {
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(17, 26, 35, 0.08)',
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
    backdropFilter: 'blur(18px)',
  };
}

export default function SuperpowerStyleMockup() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F4EFE7',
        color: '#131B23',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #F28A43, #1B6F63)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0D141A',
              fontWeight: 900,
            }}
          >
            P
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.03em' }}>PivotIQ</div>
            <div style={{ fontSize: '12px', color: '#5D6A74' }}>Mockup inspired by the Superpower rhythm</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/"
            style={{
              padding: '12px 16px',
              borderRadius: '999px',
              color: '#2A3844',
              border: '1px solid rgba(19, 27, 35, 0.12)',
              background: 'rgba(255,255,255,0.55)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Back to current site
          </Link>
          <Link
            href="/audit"
            style={{
              padding: '13px 18px',
              borderRadius: '999px',
              color: '#FFF7F1',
              background: '#13202A',
              fontSize: '14px',
              fontWeight: 800,
              boxShadow: '0 18px 40px rgba(18, 31, 41, 0.16)',
            }}
          >
            Start free scan
          </Link>
        </div>
      </nav>

      <section
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
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.58)',
              border: '1px solid rgba(19, 27, 35, 0.08)',
              color: '#355163',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            Career intelligence for the AI shift
          </div>

          <h1
            style={{
              fontSize: 'clamp(62px, 9vw, 118px)',
              lineHeight: 0.9,
              letterSpacing: '-0.07em',
              margin: '0 0 20px',
              maxWidth: '800px',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              textWrap: 'balance',
            }}
          >
            Career clarity, before your role gets quietly redefined.
          </h1>

          <p
            style={{
              maxWidth: '640px',
              fontSize: '20px',
              lineHeight: 1.65,
              color: '#42505C',
              margin: '0 0 28px',
              textWrap: 'pretty',
            }}
          >
            Adapted to a lighter, premium editorial style, PivotIQ becomes less like a warning tool and more like an intelligence product: free diagnosis first, then a roadmap only if the signal feels sharp.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '26px' }}>
            <Link
              href="/audit"
              style={{
                padding: '18px 24px',
                borderRadius: '999px',
                background: '#13202A',
                color: '#FFF7F1',
                fontSize: '16px',
                fontWeight: 800,
                boxShadow: '0 24px 54px rgba(19, 32, 42, 0.18)',
              }}
            >
              Run my free scan
            </Link>
            <div
              style={{
                padding: '17px 20px',
                borderRadius: '999px',
                background: 'rgba(255,255,255,0.66)',
                border: '1px solid rgba(19, 27, 35, 0.08)',
                color: '#4A5762',
                fontSize: '15px',
                fontWeight: 700,
              }}
            >
              Find the fragile work. Then decide if the roadmap earns it.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {highlights.map((item) => (
              <div
                key={item}
                style={{
                  padding: '10px 14px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(19, 27, 35, 0.08)',
                  color: '#51606B',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            minHeight: '620px',
            display: 'grid',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '22px 0 0 36px',
              borderRadius: '40px',
              background: 'linear-gradient(180deg, rgba(242, 138, 67, 0.14), rgba(27, 111, 99, 0.1))',
              filter: 'blur(16px)',
            }}
          />

          <div
            style={{
              ...shellCardStyle(),
              position: 'relative',
              borderRadius: '36px',
              padding: '24px',
              transform: 'rotate(-3deg)',
            }}
          >
            <div
              style={{
                borderRadius: '28px',
                background: '#13202A',
                color: '#F4EFE7',
                padding: '22px',
                minHeight: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '18px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#91A0AA' }}>Sample diagnosis</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '6px', letterSpacing: '-0.03em' }}>Finance Manager</div>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                {outcomes.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      borderRadius: '18px',
                      padding: '14px 12px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ fontSize: '24px', fontWeight: 800, color: item.tone }}>{item.stat}</div>
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
                  {[
                    { label: 'Reporting and recurring updates', value: 82, color: '#F28A43' },
                    { label: 'Forecasting and scenario framing', value: 61, color: '#F2DFC6' },
                    { label: 'Cross-functional planning', value: 24, color: '#50B8A6' },
                  ].map((task) => (
                    <div key={task.label}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#E9E0D2' }}>{task.label}</span>
                        <span style={{ color: task.color, fontWeight: 800 }}>{task.value}% exposed</span>
                      </div>
                      <div style={{ height: '7px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                        <div style={{ width: `${task.value}%`, height: '100%', borderRadius: '999px', background: task.color }} />
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
                  Best next move
                </div>
                <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '8px' }}>
                  Reposition toward strategic finance, systems, or planning.
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#C4D0D6' }}>
                  In this direction, the product feels more like a high-end intelligence report than an AI-risk calculator.
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              ...shellCardStyle(),
              position: 'absolute',
              right: '-6px',
              bottom: '24px',
              width: '44%',
              borderRadius: '30px',
              padding: '18px',
              transform: 'rotate(5deg)',
            }}
          >
            <div style={{ borderRadius: '22px', background: '#FFF9F2', padding: '16px', color: '#15212B' }}>
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
      </section>

      <section
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
          {storyCards.map((card) => (
            <div
              key={card.title}
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
            </div>
          ))}
        </div>
      </section>

      <section
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
        <div style={{ paddingTop: '10px' }}>
          <div
            style={{
              fontSize: 'clamp(42px, 6vw, 72px)',
              lineHeight: 0.95,
              letterSpacing: '-0.06em',
              fontWeight: 700,
              fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif',
              marginBottom: '18px',
              maxWidth: '420px',
            }}
          >
            A better pivot still feels close to who you already are.
          </div>
          <p style={{ fontSize: '18px', lineHeight: 1.72, color: '#495863', maxWidth: '420px' }}>
            The adaptation works best if the site sells calm, grounded repositioning. Not hustle. Not panic. Just a sharper next move.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '16px' }}>
          {lanes.map((lane) => (
            <div
              key={lane.title}
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
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1220px',
          margin: '0 auto',
          padding: '0 28px 110px',
        }}
      >
        <div
          style={{
            borderRadius: '38px',
            background: '#13202A',
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
              Final section
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
              This is the version of PivotIQ that feels like a premium intelligence brand.
            </div>
            <p style={{ fontSize: '17px', lineHeight: 1.72, color: '#C3CFD5', maxWidth: '600px' }}>
              If you like this direction, the next step is converting the real homepage to this lighter system, then replacing the mock cards with your actual scan UI and product screenshots.
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
              {roadmapSteps.map((step) => (
                <div
                  key={step.number}
                  style={{
                    padding: '14px 14px 15px',
                    borderRadius: '18px',
                    background: 'rgba(255,255,255,0.04)',
                  }}
                >
                  <div style={{ color: '#FFB686', fontSize: '12px', fontWeight: 900, letterSpacing: '0.08em', marginBottom: '6px' }}>{step.number}</div>
                  <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.03em' }}>{step.title}</div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#B3C1C9' }}>{step.body}</div>
                </div>
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
                color: '#13202A',
                fontWeight: 800,
              }}
            >
              Open the real scan flow
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
