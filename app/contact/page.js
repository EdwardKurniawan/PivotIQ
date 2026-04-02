import { LegalPage } from '../../components/legal-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';

export default function ContactPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);

  return (
    <LegalPage
      title={messages.legal.contactTitle}
      intro={messages.legal.contactIntro}
      sections={messages.legal.contactSections}
      backHomeLabel={messages.legal.backHome}
    />
  );
}
