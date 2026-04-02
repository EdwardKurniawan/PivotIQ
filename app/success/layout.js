import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'success',
    path: '/success',
    index: false,
  });
}

export default function SuccessLayout({ children }) {
  return children;
}

