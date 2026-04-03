import { PillarPage } from '../../components/pillar-page';
import { getMessages } from '../../lib/i18n';
import { getServerLocale } from '../../lib/i18n-server';
import { getRoleGuideLinks } from '../../lib/role-pages';
import { buildPageMetadata } from '../../lib/seo';

const PATH = '/ai-career-risk';

export function generateMetadata() {
  return buildPageMetadata({
    locale: getServerLocale(),
    key: 'aiCareerRisk',
    path: PATH,
  });
}

export default function AiCareerRiskPage() {
  const locale = getServerLocale();
  const messages = getMessages(locale);
  const page = messages.pillars.aiCareerRisk;
  const relatedPages = [
    { href: '/career-pivot-planner', label: messages.pillars.careerPivotPlanner.linkLabel },
    { href: '/white-collar-jobs-at-risk-from-ai', label: messages.pillars.whiteCollarJobsAtRisk.linkLabel },
  ];
  const rolePages = getRoleGuideLinks(locale, [
    'marketing-manager-ai-risk',
    'fpa-analyst-ai-risk',
    'hr-business-partner-ai-risk',
  ]);

  return <PillarPage locale={locale} page={page} relatedPages={relatedPages} rolePages={rolePages} path={PATH} />;
}
