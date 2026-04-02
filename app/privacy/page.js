import { LegalPage } from '../../components/legal-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';

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
