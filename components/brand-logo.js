import Link from 'next/link';

function BrandMark({ size = 38 }) {
  const stroke = size <= 40 ? 3.2 : size <= 56 ? 4 : 5;
  const iStroke = size <= 40 ? 2.3 : size <= 56 ? 3 : 3.6;
  const tailStroke = size <= 40 ? 2.3 : size <= 56 ? 3 : 3.2;

  return (
    <svg width={size} height={size} viewBox="0 0 132 132" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="14" y="14" width="104" height="104" rx="30" fill="#13202A" />
      <path d="M34 96V38H58C69.046 38 78 46.954 78 58C78 69.046 69.046 78 58 78H46" stroke="#FFF9F2" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M67 42V90" stroke="#F28A43" strokeWidth={iStroke} strokeLinecap="round" />
      <circle cx="90" cy="60" r="16" stroke="#1B6F63" strokeWidth={stroke - 1} />
      <path d="M100 70L108 80" stroke="#1B6F63" strokeWidth={tailStroke} strokeLinecap="round" />
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
