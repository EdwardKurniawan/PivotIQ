import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'report',
    path: '/report',
    index: false,
  });
}

export default function ReportLayout({ children }) {
  return children;
}

