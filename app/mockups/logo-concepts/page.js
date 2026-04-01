import Link from 'next/link';

const pageBg = '#F4EFE7';
const ink = '#13202A';
const muted = '#5D6A74';
const orange = '#F28A43';
const teal = '#1B6F63';
const cream = '#FFF9F2';

function shellStyle(accent) {
  return {
    borderRadius: '32px',
    border: '1px solid rgba(19, 27, 35, 0.08)',
    background: 'rgba(255,255,255,0.82)',
    boxShadow: '0 24px 70px rgba(19, 33, 45, 0.12)',
    overflow: 'hidden',
    position: 'relative',
    isolation: 'isolate',
    backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.94), rgba(255,255,255,0.72)), radial-gradient(circle at top right, ${accent}22, transparent 36%)`,
  };
}

function LogoLockup({ children, wordmark = 'PivotIQ', tagline = 'Career intelligence for the AI shift' }) {
  return (
    <div style={{ display: 'grid', gap: '18px' }}>
      <div
        style={{
          minHeight: '240px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(180deg, rgba(244,239,231,0.28), rgba(255,255,255,0.12))',
          padding: '28px',
        }}
      >
        <div style={{ display: 'grid', justifyItems: 'center', gap: '18px' }}>
          {children}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: ink, fontSize: '34px', fontWeight: 800, letterSpacing: '-0.05em' }}>{wordmark}</div>
            <div style={{ color: muted, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{tagline}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitPivotMark() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="18" width="84" height="84" rx="28" fill={ink} />
      <path d="M42 34H66C81.464 34 94 46.536 94 62C94 77.464 81.464 90 66 90H42V34Z" fill={cream} />
      <path d="M54 46H66C74.837 46 82 53.163 82 62C82 70.837 74.837 78 66 78H54V46Z" fill={orange} />
      <path d="M58 46H42V90H58C72.359 90 84 79.255 84 66V62C84 53.163 76.837 46 68 46H58Z" fill={teal} fillOpacity="0.95" />
    </svg>
  );
}

function SignalCompass() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="40" stroke={ink} strokeWidth="8" />
      <circle cx="60" cy="60" r="24" stroke={muted} strokeWidth="2.5" strokeDasharray="4 6" />
      <path d="M76 44L66.5 68.5L42 78L51.5 53.5L76 44Z" fill={orange} />
      <circle cx="60" cy="60" r="8" fill={ink} />
      <path d="M89 31L93 27" stroke={teal} strokeWidth="5" strokeLinecap="round" />
      <path d="M27 93L31 89" stroke={teal} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function FoldedPathMonogram() {
  return (
    <svg width="182" height="120" viewBox="0 0 182 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 90V28H72C88.569 28 102 41.431 102 58C102 74.569 88.569 88 72 88H50" stroke={ink} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M118 30V90" stroke={orange} strokeWidth="16" strokeLinecap="round" />
      <path d="M152 30C165.255 30 176 40.745 176 54C176 67.255 165.255 78 152 78C138.745 78 128 67.255 128 54C128 40.745 138.745 30 152 30Z" stroke={teal} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M165 74L177 88" stroke={teal} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 58H74" stroke={cream} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

function MonogramGrid() {
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="17" y="17" width="96" height="96" rx="30" fill={ink} />
      <path d="M40 36H69C80.046 36 89 44.954 89 56C89 67.046 80.046 76 69 76H52V94" stroke={cream} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M52 76H74V94" stroke={orange} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="82" y="36" width="12" height="58" rx="6" fill={teal} />
    </svg>
  );
}

function InsightAperture() {
  return (
    <svg width="132" height="132" viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="66" cy="66" r="44" fill={ink} />
      <path d="M66 22C90.301 22 110 41.699 110 66C110 90.301 90.301 110 66 110C47.272 110 31.276 98.306 24.938 81.824L66 66V22Z" fill={teal} />
      <path d="M66 22C80.509 22 93.379 29.021 101.391 39.848L66 66V22Z" fill={orange} />
      <circle cx="66" cy="66" r="12" fill={cream} />
    </svg>
  );
}

function PiqVariationOne() {
  return (
    <svg width="186" height="120" viewBox="0 0 186 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 92V28H70C86.569 28 100 41.431 100 58C100 74.569 86.569 88 70 88H48" stroke={ink} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M116 28V92" stroke={orange} strokeWidth="14" strokeLinecap="round" />
      <circle cx="152" cy="58" r="30" stroke={teal} strokeWidth="14" />
      <path d="M170 78L182 92" stroke={teal} strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
}

function PiqVariationTwo() {
  return (
    <svg width="186" height="120" viewBox="0 0 186 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 90V28H68C84.569 28 98 41.431 98 58C98 74.569 84.569 88 68 88H46" stroke={ink} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M112 32V88" stroke={orange} strokeWidth="12" strokeLinecap="round" />
      <path d="M152 30C166.359 30 178 41.641 178 56C178 70.359 166.359 82 152 82C137.641 82 126 70.359 126 56C126 41.641 137.641 30 152 30Z" stroke={teal} strokeWidth="12" />
      <path d="M164 76L176 88" stroke={teal} strokeWidth="12" strokeLinecap="round" />
      <path d="M50 58H70" stroke={cream} strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function PiqVariationThree() {
  return (
    <svg width="186" height="120" viewBox="0 0 186 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 92V28H64C83.33 28 99 43.67 99 63C99 82.33 83.33 98 64 98H50" stroke={ink} strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114 24V96" stroke={orange} strokeWidth="10" strokeLinecap="round" />
      <circle cx="152" cy="58" r="28" fill="none" stroke={teal} strokeWidth="14" />
      <path d="M168 76L181 89" stroke={teal} strokeWidth="10" strokeLinecap="round" />
    </svg>
  );
}

function PiqVariationFour() {
  return (
    <svg width="186" height="120" viewBox="0 0 186 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="18" width="150" height="84" rx="28" fill={ink} />
      <path d="M38 84V36H68C80.15 36 90 45.85 90 58C90 70.15 80.15 80 68 80H50" stroke={cream} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M108 38V82" stroke={orange} strokeWidth="12" strokeLinecap="round" />
      <circle cx="138" cy="58" r="20" stroke={teal} strokeWidth="12" />
      <path d="M150 72L160 84" stroke={teal} strokeWidth="12" strokeLinecap="round" />
    </svg>
  );
}

function PiqVariationFive() {
  return (
    <svg width="186" height="120" viewBox="0 0 186 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28 90V28H66C83.673 28 98 42.327 98 60C98 77.673 83.673 92 66 92H50" stroke={ink} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M114 28V92" stroke={orange} strokeWidth="8" strokeLinecap="round" />
      <path d="M154 30C168.359 30 180 41.641 180 56C180 70.359 168.359 82 154 82C139.641 82 128 70.359 128 56C128 41.641 139.641 30 154 30Z" stroke={teal} strokeWidth="16" />
      <path d="M170 74L182 86" stroke={teal} strokeWidth="8" strokeLinecap="round" />
    </svg>
  );
}

const concepts = [
  {
    name: 'Split Pivot Mark',
    accent: orange,
    description: 'Geometric shift inside a monogram. Best if you want the clearest metaphor for moving roles without losing identity.',
    why: 'Feels ownable, clean, and product-ready.',
    render: <SplitPivotMark />,
  },
  {
    name: 'Signal Compass',
    accent: teal,
    description: 'A directional symbol fused with a signal system. Strongest for “career intelligence” and guided decision-making.',
    why: 'Most explicit about clarity and navigation.',
    render: <SignalCompass />,
  },
  {
    name: 'Folded PIQ Path',
    accent: orange,
    description: 'The folded-path idea translated into a clearer PIQ monogram. It keeps the sense of movement, but now reads like a true brand mark.',
    why: 'Best balance between elegant symbolism and recognizability.',
    render: <FoldedPathMonogram />,
  },
  {
    name: 'Monogram Grid',
    accent: teal,
    description: 'Structured PI monogram with one displaced element. Smart, restrained, and strongest as a long-term identity system.',
    why: 'Most premium and least startup-generic.',
    render: <MonogramGrid />,
  },
  {
    name: 'Insight Aperture',
    accent: orange,
    description: 'A lens-like reveal of the right angle. Speaks to seeing what is changing before others do.',
    why: 'Best if you want a strategic-intelligence feel.',
    render: <InsightAperture />,
  },
];

const piqVariations = [
  {
    name: 'PIQ Path 01',
    accent: orange,
    description: 'Most literal and balanced. Clear letters first, path metaphor second.',
    why: 'Best starting point if recognizability matters most.',
    render: <PiqVariationOne />,
  },
  {
    name: 'PIQ Path 02',
    accent: teal,
    description: 'Softer and more editorial, with a quieter internal fold inside the P.',
    why: 'Best if you want premium over aggressive clarity.',
    render: <PiqVariationTwo />,
  },
  {
    name: 'PIQ Path 03',
    accent: orange,
    description: 'Tall and elegant, with more movement and a more directional tail on the Q.',
    why: 'Best if you want the logo to feel dynamic and forward-leaning.',
    render: <PiqVariationThree />,
  },
  {
    name: 'PIQ Path 04',
    accent: teal,
    description: 'Contained badge version, useful if you want an app icon and wordmark system together.',
    why: 'Best if product UI and favicon performance matter most.',
    render: <PiqVariationFour />,
  },
  {
    name: 'PIQ Path 05',
    accent: orange,
    description: 'Minimal center stroke with heavier P and Q shapes. Most reduced and logo-like.',
    why: 'Best if you want the most ownable and scalable mark.',
    render: <PiqVariationFive />,
  },
];

export const metadata = {
  title: 'PivotIQ Logo Concepts',
  description: 'Five flat logo mockups for PivotIQ.',
};

export default function LogoConceptsPage() {
  return (
    <div style={{ minHeight: '100vh', background: pageBg, color: ink }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 8% 10%, rgba(242, 138, 67, 0.12), transparent 24%), radial-gradient(circle at 84% 12%, rgba(27, 111, 99, 0.12), transparent 28%)',
        }}
      />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto', padding: '28px 28px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
          <div>
            <div style={{ color: muted, fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
              Brand mockups
            </div>
            <h1 style={{ fontSize: 'clamp(42px, 8vw, 82px)', lineHeight: 0.92, letterSpacing: '-0.065em', margin: 0, fontWeight: 700, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
              Five flat logo directions for PivotIQ
            </h1>
            <p style={{ maxWidth: '760px', margin: '16px 0 0', color: muted, fontSize: '18px', lineHeight: 1.7 }}>
              Each route stays modern, elegant, and smart while expressing a different side of the product: clarity, movement, signal, or strategic repositioning.
            </p>
          </div>
          <Link href="/" style={{ padding: '14px 18px', borderRadius: '999px', background: ink, color: cream, textDecoration: 'none', fontWeight: 800 }}>
            Back to site
          </Link>
        </div>

        <div style={{ display: 'grid', gap: '22px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {concepts.map((concept) => (
            <section key={concept.name} style={shellStyle(concept.accent)}>
              <LogoLockup>{concept.render}</LogoLockup>
              <div style={{ padding: '22px 24px 26px', borderTop: '1px solid rgba(19, 27, 35, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.04em' }}>{concept.name}</h2>
                  <div style={{ padding: '8px 10px', borderRadius: '999px', background: `${concept.accent}1A`, color: concept.accent, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Concept
                  </div>
                </div>
                <p style={{ margin: '0 0 12px', color: muted, fontSize: '15px', lineHeight: 1.7 }}>{concept.description}</p>
                <p style={{ margin: 0, color: ink, fontSize: '14px', fontWeight: 700 }}>Why it works: <span style={{ color: muted, fontWeight: 500 }}>{concept.why}</span></p>
              </div>
            </section>
          ))}
        </div>

        <div style={{ marginTop: '56px', marginBottom: '24px' }}>
          <div style={{ color: muted, fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            Focused second round
          </div>
          <h2 style={{ fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 0.95, letterSpacing: '-0.06em', margin: 0, fontWeight: 700, fontFamily: 'Iowan Old Style, Palatino Linotype, Book Antiqua, Georgia, serif' }}>
            Five tighter PIQ variations
          </h2>
          <p style={{ maxWidth: '760px', margin: '14px 0 0', color: muted, fontSize: '17px', lineHeight: 1.7 }}>
            These are more disciplined logo explorations of the folded-path idea, with stronger letter recognition and less abstraction.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '22px', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {piqVariations.map((concept) => (
            <section key={concept.name} style={shellStyle(concept.accent)}>
              <LogoLockup>{concept.render}</LogoLockup>
              <div style={{ padding: '22px 24px 26px', borderTop: '1px solid rgba(19, 27, 35, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px', marginBottom: '12px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.04em' }}>{concept.name}</h2>
                  <div style={{ padding: '8px 10px', borderRadius: '999px', background: `${concept.accent}1A`, color: concept.accent, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    PIQ Round
                  </div>
                </div>
                <p style={{ margin: '0 0 12px', color: muted, fontSize: '15px', lineHeight: 1.7 }}>{concept.description}</p>
                <p style={{ margin: 0, color: ink, fontSize: '14px', fontWeight: 700 }}>Why it works: <span style={{ color: muted, fontWeight: 500 }}>{concept.why}</span></p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
