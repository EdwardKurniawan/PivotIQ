import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'login',
    path: '/login',
  });
}

export default function LoginLayout({ children }) {
  return children;
}

