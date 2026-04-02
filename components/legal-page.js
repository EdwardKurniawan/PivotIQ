import Link from 'next/link';

export function LegalPage({ title, intro, sections, backHomeLabel }) {
  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at top left, rgba(217, 140, 54, 0.16), transparent 28%), radial-gradient(circle at top right, rgba(62, 125, 120, 0.12), transparent 24%), #F4EFE7',
        padding: '32px 20px 72px',
      }}
    >
      <div
        style={{
          maxWidth: '940px',
          margin: '0 auto',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: '#5B6772',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          <span aria-hidden="true">←</span>
          {backHomeLabel}
        </Link>

        <section
          style={{
            marginTop: '24px',
            borderRadius: '32px',
            border: '1px solid rgba(19, 27, 35, 0.08)',
            background: 'rgba(255, 252, 247, 0.88)',
            boxShadow: '0 24px 80px rgba(19, 27, 35, 0.08)',
            padding: '40px clamp(22px, 4vw, 56px)',
          }}
        >
          <div style={{ maxWidth: '720px' }}>
            <p
              style={{
                margin: 0,
                color: '#7B6A53',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              PivotIQ
            </p>
            <h1
              style={{
                margin: '14px 0 16px',
                fontSize: 'clamp(38px, 6vw, 72px)',
                lineHeight: 0.96,
                letterSpacing: '-0.05em',
                color: '#13202A',
                fontFamily: 'var(--font-canela), "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Palatino, serif',
              }}
            >
              {title}
            </h1>
            <p
              style={{
                margin: 0,
                color: '#5D6A74',
                fontSize: '18px',
                lineHeight: 1.7,
                maxWidth: '680px',
              }}
            >
              {intro}
            </p>
          </div>

          <div
            style={{
              marginTop: '32px',
              display: 'grid',
              gap: '18px',
            }}
          >
            {sections.map(([heading, body]) => (
              <article
                key={heading}
                style={{
                  borderRadius: '24px',
                  border: '1px solid rgba(19, 27, 35, 0.08)',
                  background: '#F7F1E8',
                  padding: '22px 22px 20px',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    color: '#13202A',
                    fontSize: '20px',
                    lineHeight: 1.2,
                  }}
                >
                  {heading}
                </h2>
                <p
                  style={{
                    margin: '10px 0 0',
                    color: '#55626C',
                    fontSize: '16px',
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
