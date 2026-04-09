export const BROAD_ROLE_FIXTURE_CLARIFIERS = Object.freeze({
  goal_now: 'hybrid_transition',
  timeline_urgency: 'within_6_months',
  years_experience_band: '6_10',
  location_preference: 'united_states',
  ai_maturity: 'weekly',
});

export const BROAD_ROLE_FIXTURES = Object.freeze([
  {
    jobTitle: 'Data Analyst',
    industry: 'SaaS',
    tasks: ['Dashboard creation', 'SQL analysis', 'Stakeholder insights'],
    topPivotPattern: /(data|analytics|business operations|business intelligence|strategy and operations|operations manager)/i,
    stayPattern: /(strategic operations manager|analytics|operations lead|higher-leverage version)/i,
  },
  {
    jobTitle: 'Customer Success Manager',
    industry: 'SaaS',
    tasks: ['Renewal prep', 'Account health reviews', 'Stakeholder communication'],
    topPivotPattern: /(customer|account|enablement|operations)/i,
    stayPattern: /(customer strategy lead|customer success lead|customer operations lead|higher-leverage version)/i,
  },
  {
    jobTitle: 'Executive Assistant',
    industry: 'Healthcare',
    tasks: ['Calendar coordination', 'Meeting prep', 'Executive follow-up'],
    topPivotPattern: /(operations|administrative|business operations|executive operations)/i,
    stayPattern: /(higher-leverage version|operations lead|executive operations lead)/i,
  },
  {
    jobTitle: 'Operations Manager',
    industry: 'Manufacturing',
    tasks: ['Process mapping', 'Workflow coordination', 'Status reporting'],
    topPivotPattern: /(operations|program|project|delivery|workflow)/i,
    stayPattern: /(program operations lead|operations lead|higher-leverage version)/i,
  },
  {
    jobTitle: 'Marketing Manager',
    industry: 'Retail',
    tasks: ['Campaign planning', 'Performance reporting', 'Cross-functional launch coordination'],
    topPivotPattern: /(marketing|gtm|growth|product marketing|operations)/i,
    stayPattern: /(marketing strategy lead|marketing operations lead|growth strategy lead|higher-leverage version)/i,
  },
]);
