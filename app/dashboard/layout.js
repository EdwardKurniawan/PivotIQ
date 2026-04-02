import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'dashboard',
    path: '/dashboard',
    index: false,
  });
}

export default function DashboardLayout({ children }) {
  return children;
}

