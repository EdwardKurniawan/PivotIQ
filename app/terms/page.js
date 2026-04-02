import { LegalPage } from '../../components/legal-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'terms',
    path: '/terms',
  });
}

export default function TermsPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);

  return (
    <LegalPage
      title={messages.legal.termsTitle}
      intro={messages.legal.termsIntro}
      sections={messages.legal.termsSections}
      backHomeLabel={messages.legal.backHome}
    />
  );
}
