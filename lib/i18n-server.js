import { cookies } from 'next/headers';
import { LOCALE_COOKIE, normalizeLocale } from './i18n';

export function getServerLocale() {
  return normalizeLocale(cookies().get(LOCALE_COOKIE)?.value || 'en');
}
