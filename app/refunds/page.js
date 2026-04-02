import { LegalPage } from '../../components/legal-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';

export default function RefundsPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);

  return (
    <LegalPage
      title={messages.legal.refundsTitle}
      intro={messages.legal.refundsIntro}
      sections={messages.legal.refundsSections}
      backHomeLabel={messages.legal.backHome}
    />
  );
}
