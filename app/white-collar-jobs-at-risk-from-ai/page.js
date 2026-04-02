import { PillarPage } from '../../components/pillar-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

const PATH = '/white-collar-jobs-at-risk-from-ai';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'whiteCollarJobsAtRisk',
    path: PATH,
  });
}

export default function WhiteCollarJobsAtRiskPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const page = messages.pillars.whiteCollarJobsAtRisk;
  const relatedPages = [
    { href: '/ai-career-risk', label: messages.pillars.aiCareerRisk.linkLabel },
    { href: '/career-pivot-planner', label: messages.pillars.careerPivotPlanner.linkLabel },
  ];

  return <PillarPage locale={locale} page={page} relatedPages={relatedPages} path={PATH} />;
}

