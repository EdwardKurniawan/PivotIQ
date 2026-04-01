import Link from 'next/link';

const problems = [
  {
    title: 'Titles hide the real risk',
    body: 'Two people with the same title can have very different exposure depending on how much of their week is reporting, analysis, coordination, or judgment-heavy work.',
  },
  {
    title: 'Most advice is either too vague or too alarmist',
    body: 'People do not need another article about “AI changing everything.” They need to know what is getting cheaper in their own job and what to do next.',
  },
  {
    title: 'A good pivot plan should feel cared for',
    body: 'If someone pays, the output needs to connect the problem to a believable next move, a skill gap, and a milestone they can actually complete.',
  },
];

const deliverables = [
  'A free task-level risk score before any paid decision',
  'A clear explanation of which parts of the role are safest, pressured, or already shifting',
  'Three adjacent pivot options ranked by fit',
  'A 12-week roadmap with milestones, proof points, blockers, and catch-up logic',
  'Skill-gap guidance tied directly to the chosen pivot',
];

const pricingRows = [
  { label: 'Free scan', value: 'Start free' },
  { label: 'Paid upgrade', value: 'Only if you want the full roadmap' },
  { label: 'Billing style', value: 'One-time, no subscription' },
];

export default function HomeCopyRefreshMockup() {
  return (
    <div style={{ minHeight: '100vh', background: '#0C1117', color: '#F7F3EA' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(circle at 15% 0%, rgba(85, 180, 164, 0.15), transparent 28%), radial-gradient(circle at 85% 10%, rgba(197, 143, 75, 0.12), transparent 30%)',
        }}
      />

      <nav
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 28px',
          maxWidth: '1180px',
          margin: '0 auto',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #55B4A4, #1E6F69)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#081014',
              fontWeight: 900,
            }}
          >
            P
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.02em' }}>PivotIQ</div>
            <div style={{ color: '#8FA2B3', fontSize: '12px' }}>Career repositioning for the AI shift</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            style={{
              border: '1px solid rgba(143, 162, 179, 0.18)',
              background: 'rgba(12, 17, 23, 0.65)',
              borderRadius: '999px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#B5C1CB',
            }}
          >
            Starts with a free scan
          </div>
          <Link href="/audit">
            <button
              style={{
                border: 'none',
                borderRadius: '999px',
                background: '#F0E4CF',
                color: '#11161D',
                padding: '13px 18px',
                fontSize: '14px',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Start free scan
            </button>
          </Link>
        </div>
      </nav>

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '52px 28px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '999px',
              padding: '7px 12px',
              marginBottom: '22px',
              background: 'rgba(85, 180, 164, 0.12)',
              border: '1px solid rgba(85, 180, 164, 0.25)',
              color: '#97D8CD',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            Task-level diagnosis, not title-level panic
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 76px)',
              lineHeight: 0.98,
              letterSpacing: '-0.045em',
              margin: '0 0 20px',
              fontWeight: 900,
              maxWidth: '700px',
            }}
          >
            See what parts of your job are getting cheaper,
            <span style={{ color: '#F0E4CF' }}> and what to do before it hits your role.</span>
          </h1>

          <p
            style={{
              fontSize: '18px',
              lineHeight: 1.7,
              color: '#B5C1CB',
              maxWidth: '610px',
              margin: '0 0 28px',
            }}
          >
            PivotIQ starts with a free risk scan based on the work that actually fills your week. If the result is useful, you can unlock the full roadmap later. No subscription, no inflated promises.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <Link href="/audit">
              <button
                style={{
                  border: 'none',
                  borderRadius: '16px',
                  background: '#55B4A4',
                  color: '#081014',
                  padding: '16px 22px',
                  fontSize: '15px',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.28)',
                }}
              >
                Get my free risk score
              </button>
            </Link>
            <a
              href="#deliverables"
              style={{
                borderRadius: '16px',
                border: '1px solid rgba(143, 162, 179, 0.18)',
                color: '#D8E1E8',
                padding: '15px 20px',
                fontSize: '15px',
                fontWeight: 700,
                textDecoration: 'none',
                background: 'rgba(15, 21, 28, 0.7)',
              }}
            >
              See what you get
            </a>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', color: '#8FA2B3', fontSize: '13px' }}>
            <span>Free scan first</span>
            <span>One-time upgrade later</span>
            <span>No subscription</span>
          </div>
        </div>

        <div
          style={{
            borderRadius: '28px',
            padding: '22px',
            background: 'linear-gradient(180deg, rgba(16, 24, 33, 0.94), rgba(11, 16, 23, 0.94))',
            border: '1px solid rgba(143, 162, 179, 0.14)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.34)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            {pricingRows.map((item) => (
              <div
                key={item.label}
                style={{
                  borderRadius: '18px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(143, 162, 179, 0.1)',
                }}
              >
                <div style={{ color: '#8FA2B3', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' }}>
                  {item.label}
                </div>
                <div style={{ color: '#F7F3EA', fontSize: '14px', lineHeight: 1.4, fontWeight: 700 }}>{item.value}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              borderRadius: '22px',
              padding: '18px',
              background: '#101B26',
              border: '1px solid rgba(85, 180, 164, 0.16)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#8FA2B3', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sample snapshot</div>
                <div style={{ color: '#F7F3EA', fontSize: '20px', fontWeight: 800, marginTop: '4px' }}>Finance Manager · 68 risk</div>
              </div>
              <div
                style={{
                  padding: '8px 10px',
                  borderRadius: '999px',
                  background: 'rgba(197, 143, 75, 0.16)',
                  color: '#E7C28E',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                Moderate pressure
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Reporting and status updates', 82, '#F08B73'],
                ['Forecasting and planning', 61, '#E7C28E'],
                ['Managing people', 24, '#55B4A4'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ borderRadius: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px 12px 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px', color: '#D8E1E8', fontSize: '13px' }}>
                    <span>{label}</span>
                    <span style={{ color, fontWeight: 800 }}>{value}% exposed</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)' }}>
                    <div style={{ width: `${value}%`, height: '100%', borderRadius: '999px', background: color }} />
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                borderRadius: '16px',
                background: 'rgba(85, 180, 164, 0.08)',
                border: '1px solid rgba(85, 180, 164, 0.18)',
                padding: '14px',
              }}
            >
              <div style={{ color: '#97D8CD', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                Why this feels useful
              </div>
              <div style={{ color: '#D8E1E8', fontSize: '14px', lineHeight: 1.65 }}>
                The report does not just say “AI is coming.” It shows which work is most exposed, what stays valuable, and what adjacent role to build toward next.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '34px 28px 24px',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
          }}
        >
          {problems.map((item) => (
            <div
              key={item.title}
              style={{
                borderRadius: '22px',
                padding: '22px',
                background: 'rgba(14, 20, 28, 0.86)',
                border: '1px solid rgba(143, 162, 179, 0.12)',
              }}
            >
              <div style={{ color: '#F0E4CF', fontSize: '18px', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.02em' }}>
                {item.title}
              </div>
              <div style={{ color: '#AEBBC6', fontSize: '14px', lineHeight: 1.7 }}>{item.body}</div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="deliverables"
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '62px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        <div>
          <div style={{ color: '#97D8CD', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
            Proposed copy direction
          </div>
          <h2 style={{ fontSize: 'clamp(30px, 5vw, 52px)', lineHeight: 1.02, letterSpacing: '-0.04em', margin: '0 0 16px', fontWeight: 900 }}>
            Calm, specific, and honest beats dramatic.
          </h2>
          <p style={{ color: '#B5C1CB', fontSize: '17px', lineHeight: 1.75, margin: '0 0 20px' }}>
            This version stops leading with price, avoids inflated proof, and sounds closer to a serious career product. It frames the free scan as the entry point and treats the paid roadmap as a later decision, which is much clearer than “Audit My Career — $29” in the hero.
          </p>
          <p style={{ color: '#8FA2B3', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
            It also replaces vague “AI-proof” language with concrete promises: task-level diagnosis, adjacent pivots, milestone roadmap, and no subscription trap.
          </p>
        </div>

        <div
          style={{
            borderRadius: '26px',
            background: 'rgba(14, 20, 28, 0.88)',
            border: '1px solid rgba(143, 162, 179, 0.12)',
            padding: '24px',
          }}
        >
          <div style={{ color: '#F7F3EA', fontSize: '20px', fontWeight: 800, marginBottom: '14px' }}>What the landing page should promise</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {deliverables.map((item) => (
              <div key={item} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '999px',
                    background: 'rgba(85, 180, 164, 0.14)',
                    color: '#97D8CD',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 900,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  ✓
                </div>
                <div style={{ color: '#D8E1E8', fontSize: '14px', lineHeight: 1.65 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '1180px',
          margin: '0 auto',
          padding: '0 28px 80px',
        }}
      >
        <div
          style={{
            borderRadius: '28px',
            padding: '28px',
            background: 'linear-gradient(135deg, rgba(85, 180, 164, 0.12), rgba(197, 143, 75, 0.12))',
            border: '1px solid rgba(240, 228, 207, 0.14)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ color: '#F7F3EA', fontSize: '28px', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '8px' }}>
              Start with the free scan. Upgrade only if the result earns it.
            </div>
            <div style={{ color: '#D8E1E8', fontSize: '15px', lineHeight: 1.7, maxWidth: '700px' }}>
              That framing is clearer, more trustworthy, and much less “AI landing page” than pushing a paid CTA before the user even understands the value.
            </div>
          </div>
          <Link href="/audit">
            <button
              style={{
                border: 'none',
                borderRadius: '16px',
                background: '#F0E4CF',
                color: '#11161D',
                padding: '16px 22px',
                fontSize: '15px',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Open the audit flow
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
