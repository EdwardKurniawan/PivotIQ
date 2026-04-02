import { PillarPage } from '../../components/pillar-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';
import { buildPageMetadata } from '../../lib/seo';

const PATH = '/career-pivot-planner';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'careerPivotPlanner',
    path: PATH,
  });
}

export default function CareerPivotPlannerPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const page = messages.pillars.careerPivotPlanner;
  const relatedPages = [
    { href: '/ai-career-risk', label: messages.pillars.aiCareerRisk.linkLabel },
    { href: '/white-collar-jobs-at-risk-from-ai', label: messages.pillars.whiteCollarJobsAtRisk.linkLabel },
  ];

  return <PillarPage locale={locale} page={page} relatedPages={relatedPages} path={PATH} />;
}

