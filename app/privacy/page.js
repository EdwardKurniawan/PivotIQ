import { LegalPage } from '../../components/legal-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'privacy',
    path: '/privacy',
  });
}

export default function PrivacyPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);

  return (
    <LegalPage
      title={messages.legal.privacyTitle}
      intro={messages.legal.privacyIntro}
      sections={messages.legal.privacySections}
      backHomeLabel={messages.legal.backHome}
    />
  );
}
