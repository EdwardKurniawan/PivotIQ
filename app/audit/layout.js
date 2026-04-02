import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'audit',
    path: '/audit',
  });
}

export default function AuditLayout({ children }) {
  return children;
}

