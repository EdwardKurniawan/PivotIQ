import Link from 'next/link';

function BrandMark({ size = 38 }) {
  const stroke = size <= 40 ? 3.1 : size <= 56 ? 4 : 4.8;
  const qStroke = size <= 40 ? 2.6 : size <= 56 ? 3.3 : 4.1;
  const iStroke = size <= 40 ? 2.1 : size <= 56 ? 2.8 : 3.4;
  const tailStroke = size <= 40 ? 2.1 : size <= 56 ? 2.8 : 3.2;

  return (
    <svg width={size} height={size} viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="14" y="14" width="104" height="104" rx="30" fill="#13202A" />
      <path d="M34 95V37H56C67.046 37 76 45.954 76 57C76 68.046 67.046 77 56 77H45" stroke="#FFF9F2" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M67 42V89" stroke="#F28A43" strokeWidth={iStroke} strokeLinecap="round" />
      <circle cx="91" cy="60" r="14.5" stroke="#1B6F63" strokeWidth={qStroke} />
      <path d="M99.5 68.5L107 76.5" stroke="#1B6F63" strokeWidth={tailStroke} strokeLinecap="round" />
    </svg>
  );
}

export function BrandLogo({ subtitle, textColor = '#13202A', subColor = '#5D6A74', href = '/', size = 38 }) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <BrandMark size={size} />
      <div>
        <div style={{ color: textColor, fontSize: '17px', fontWeight: 800, letterSpacing: '-0.03em' }}>PivotIQ</div>
        {subtitle ? <div style={{ color: subColor, fontSize: '12px' }}>{subtitle}</div> : null}
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      {content}
    </Link>
  );
}

export function BrandMarkBadge({ size = 88 }) {
  return <BrandMark size={size} />;
}
