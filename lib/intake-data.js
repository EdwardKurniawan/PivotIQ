const TITLE_KEYWORDS = {
  analyst: ['analysis', 'reporting', 'forecasting', 'dashboarding', 'data-cleanup', 'process-mapping', 'scenario-modeling', 'pricing-analysis'],
  manager: ['stakeholder-updates', 'planning-roadmaps', 'decision-memos', 'team-coaching', 'cross-functional-alignment', 'executive-briefing', 'backlog-prioritization'],
  marketing: ['campaign-reporting', 'content-briefing', 'market-research', 'stakeholder-updates', 'demand-generation', 'seo-optimization', 'lifecycle-crm', 'ab-testing'],
  'marketing-manager': ['campaign-reporting', 'content-briefing', 'demand-generation', 'lifecycle-crm', 'ab-testing', 'stakeholder-updates'],
  finance: ['forecasting', 'budgeting', 'variance-analysis', 'reporting', 'stakeholder-updates', 'scenario-modeling', 'pricing-analysis', 'executive-briefing'],
  accountant: ['budgeting', 'variance-analysis', 'reporting', 'data-cleanup', 'compliance-monitoring', 'pricing-analysis'],
  accounting: ['budgeting', 'variance-analysis', 'reporting', 'data-cleanup', 'compliance-monitoring', 'pricing-analysis'],
  'fp&a': ['forecasting', 'scenario-modeling', 'pricing-analysis', 'variance-analysis', 'executive-briefing', 'reporting'],
  'operations-analyst': ['analysis', 'dashboarding', 'process-mapping', 'reporting', 'forecasting', 'data-cleanup'],
  revenue: ['pipeline-reporting', 'forecasting', 'pricing-analysis', 'renewal-analysis', 'sales-enablement', 'revops-automation'],
  operations: ['process-mapping', 'dashboarding', 'vendor-coordination', 'stakeholder-updates', 'project-tracking', 'revops-automation', 'procurement-operations', 'implementation-onboarding'],
  coordinator: ['project-tracking', 'meeting-facilitation', 'stakeholder-updates', 'vendor-coordination', 'documentation', 'process-mapping'],
  administrator: ['documentation', 'project-tracking', 'stakeholder-updates', 'meeting-facilitation', 'vendor-coordination', 'onboarding-enablement'],
  admin: ['documentation', 'project-tracking', 'stakeholder-updates', 'meeting-facilitation', 'vendor-coordination', 'onboarding-enablement'],
  assistant: ['documentation', 'meeting-facilitation', 'stakeholder-updates', 'project-tracking', 'vendor-coordination'],
  'executive-assistant': ['executive-briefing', 'meeting-facilitation', 'stakeholder-updates', 'project-tracking', 'documentation', 'vendor-coordination'],
  office: ['reporting', 'stakeholder-updates', 'meeting-facilitation', 'project-tracking', 'vendor-coordination', 'documentation', 'onboarding-enablement'],
  'office-manager': ['reporting', 'stakeholder-updates', 'meeting-facilitation', 'project-tracking', 'vendor-coordination', 'documentation'],
  recruiter: ['candidate-screening', 'interview-coordination', 'stakeholder-updates', 'onboarding-enablement', 'people-ops-reporting', 'training-facilitation'],
  'hr-business-partner': ['people-ops-reporting', 'team-coaching', 'stakeholder-updates', 'training-facilitation', 'onboarding-enablement', 'policy-documentation'],
  talent: ['candidate-screening', 'interview-coordination', 'people-ops-reporting', 'onboarding-enablement', 'training-facilitation'],
  hr: ['candidate-screening', 'interview-coordination', 'people-ops-reporting', 'team-coaching', 'policy-documentation', 'onboarding-enablement', 'training-facilitation'],
  people: ['people-ops-reporting', 'team-coaching', 'training-facilitation', 'onboarding-enablement', 'stakeholder-updates'],
  sales: ['client-calls', 'pipeline-reporting', 'forecasting', 'stakeholder-updates', 'proposal-writing', 'sales-enablement', 'renewal-analysis'],
  'sales-operations': ['pipeline-reporting', 'forecasting', 'revops-automation', 'dashboarding', 'process-mapping', 'sales-enablement'],
  account: ['client-calls', 'stakeholder-updates', 'proposal-writing', 'renewal-analysis', 'customer-success-planning', 'pipeline-reporting'],
  'customer-success': ['client-calls', 'stakeholder-updates', 'renewal-analysis', 'customer-success-planning', 'implementation-onboarding', 'sales-enablement'],
  customer: ['customer-support', 'ticket-triage', 'stakeholder-updates', 'customer-success-planning', 'implementation-onboarding', 'knowledge-base-writing'],
  support: ['customer-support', 'ticket-triage', 'stakeholder-updates', 'knowledge-base-writing', 'process-mapping', 'customer-success-planning', 'implementation-onboarding'],
  product: ['user-research', 'planning-roadmaps', 'decision-memos', 'cross-functional-alignment', 'market-research', 'product-discovery', 'backlog-prioritization', 'requirements-definition', 'ab-testing'],
  'project-manager': ['project-tracking', 'cross-functional-alignment', 'stakeholder-updates', 'meeting-facilitation', 'planning-roadmaps', 'executive-briefing'],
  project: ['project-tracking', 'cross-functional-alignment', 'stakeholder-updates', 'meeting-facilitation', 'planning-roadmaps', 'sprint-planning', 'release-coordination'],
  'program-manager': ['project-tracking', 'cross-functional-alignment', 'stakeholder-updates', 'meeting-facilitation', 'planning-roadmaps', 'training-facilitation'],
  program: ['project-tracking', 'cross-functional-alignment', 'stakeholder-updates', 'meeting-facilitation', 'planning-roadmaps', 'training-facilitation'],
  engineer: ['coding-dev', 'debugging-qa', 'system-design', 'documentation', 'data-cleanup', 'incident-response', 'release-coordination', 'data-modeling'],
  developer: ['coding-dev', 'debugging-qa', 'system-design', 'documentation', 'automation-building', 'incident-response', 'release-coordination', 'data-modeling'],
  software: ['coding-dev', 'debugging-qa', 'system-design', 'release-coordination', 'incident-response', 'data-modeling'],
  data: ['analysis', 'dashboarding', 'data-cleanup', 'data-modeling', 'scenario-modeling', 'automation-building'],
  'business-analyst': ['analysis', 'requirements-definition', 'process-mapping', 'stakeholder-updates', 'dashboarding', 'decision-memos'],
  scientist: ['analysis', 'market-research', 'user-research', 'scenario-modeling', 'data-cleanup', 'documentation'],
  researcher: ['market-research', 'user-research', 'analysis', 'documentation', 'decision-memos', 'scenario-modeling'],
  designer: ['content-briefing', 'proposal-writing', 'user-research', 'stakeholder-updates', 'ab-testing'],
  content: ['content-briefing', 'seo-optimization', 'campaign-reporting', 'market-research', 'stakeholder-updates'],
  brand: ['content-briefing', 'campaign-reporting', 'market-research', 'stakeholder-updates', 'demand-generation'],
  seo: ['seo-optimization', 'content-briefing', 'campaign-reporting', 'ab-testing'],
  growth: ['demand-generation', 'lifecycle-crm', 'ab-testing', 'campaign-reporting', 'seo-optimization'],
  legal: ['contract-review', 'policy-documentation', 'stakeholder-updates', 'decision-memos', 'compliance-monitoring', 'requirements-definition'],
  counsel: ['contract-review', 'policy-documentation', 'stakeholder-updates', 'decision-memos', 'compliance-monitoring'],
  'compliance-manager': ['compliance-monitoring', 'policy-documentation', 'documentation', 'stakeholder-updates', 'requirements-definition', 'decision-memos'],
  compliance: ['compliance-monitoring', 'policy-documentation', 'documentation', 'stakeholder-updates', 'requirements-definition'],
  procurement: ['procurement-operations', 'vendor-coordination', 'process-mapping', 'pricing-analysis', 'stakeholder-updates'],
  teacher: ['curriculum-design', 'training-facilitation', 'documentation', 'stakeholder-updates', 'onboarding-enablement'],
  instructor: ['curriculum-design', 'training-facilitation', 'documentation', 'onboarding-enablement'],
  professor: ['curriculum-design', 'training-facilitation', 'user-research', 'documentation'],
  'instructional-designer': ['curriculum-design', 'training-facilitation', 'documentation', 'onboarding-enablement', 'content-briefing', 'user-research'],
  training: ['training-facilitation', 'curriculum-design', 'documentation', 'onboarding-enablement'],
  learning: ['training-facilitation', 'curriculum-design', 'documentation', 'onboarding-enablement'],
  nurse: ['documentation', 'stakeholder-updates', 'training-facilitation', 'process-mapping', 'compliance-monitoring'],
  clinical: ['documentation', 'stakeholder-updates', 'compliance-monitoring', 'process-mapping'],
};

const INDUSTRY_KEYWORDS = {
  tech: ['automation-building', 'system-design', 'debugging-qa', 'dashboarding', 'incident-response', 'release-coordination', 'data-modeling'],
  finance: ['forecasting', 'variance-analysis', 'reporting', 'budgeting', 'scenario-modeling', 'pricing-analysis'],
  healthcare: ['documentation', 'stakeholder-updates', 'policy-documentation', 'process-mapping', 'compliance-monitoring', 'implementation-onboarding'],
  education: ['curriculum-design', 'stakeholder-updates', 'content-briefing', 'training-facilitation', 'onboarding-enablement'],
  consulting: ['client-calls', 'decision-memos', 'stakeholder-updates', 'market-research', 'executive-briefing', 'requirements-definition'],
  sales: ['client-calls', 'proposal-writing', 'pipeline-reporting', 'forecasting', 'sales-enablement', 'renewal-analysis'],
  marketing: ['campaign-reporting', 'content-briefing', 'market-research', 'demand-generation', 'seo-optimization', 'lifecycle-crm', 'ab-testing'],
  media: ['content-briefing', 'stakeholder-updates', 'campaign-reporting', 'seo-optimization', 'demand-generation'],
  legal: ['contract-review', 'policy-documentation', 'compliance-monitoring', 'decision-memos', 'requirements-definition'],
  hr: ['candidate-screening', 'interview-coordination', 'people-ops-reporting', 'training-facilitation', 'onboarding-enablement'],
  real_estate: ['client-calls', 'proposal-writing', 'stakeholder-updates', 'process-mapping', 'pricing-analysis'],
  other: [],
};

const MAJOR_GROUP_TASK_PRESETS = {
  Management: ['planning-roadmaps', 'team-coaching', 'executive-briefing', 'cross-functional-alignment', 'decision-memos', 'project-tracking', 'backlog-prioritization', 'stakeholder-updates'],
  'Business and Financial Operations': ['analysis', 'reporting', 'forecasting', 'budgeting', 'variance-analysis', 'scenario-modeling', 'pricing-analysis', 'executive-briefing'],
  'Computer and Mathematical': ['analysis', 'dashboarding', 'data-cleanup', 'coding-dev', 'debugging-qa', 'automation-building', 'data-modeling', 'system-design'],
  'Architecture and Engineering': ['system-design', 'documentation', 'process-mapping', 'project-tracking', 'data-modeling', 'release-coordination', 'analysis'],
  'Life, Physical, and Social Science': ['analysis', 'user-research', 'market-research', 'documentation', 'scenario-modeling', 'data-cleanup', 'decision-memos'],
  'Community and Social Service': ['stakeholder-updates', 'meeting-facilitation', 'documentation', 'training-facilitation', 'onboarding-enablement', 'customer-success-planning'],
  Legal: ['contract-review', 'policy-documentation', 'stakeholder-updates', 'decision-memos', 'compliance-monitoring', 'requirements-definition'],
  'Educational Instruction and Library': ['curriculum-design', 'training-facilitation', 'documentation', 'stakeholder-updates', 'onboarding-enablement', 'user-research'],
  'Arts, Design, Entertainment, Sports, and Media': ['content-briefing', 'campaign-reporting', 'market-research', 'seo-optimization', 'proposal-writing', 'stakeholder-updates', 'demand-generation'],
  'Healthcare Practitioners and Technical': ['documentation', 'stakeholder-updates', 'process-mapping', 'compliance-monitoring', 'training-facilitation', 'analysis'],
  'Sales and Related': ['client-calls', 'pipeline-reporting', 'forecasting', 'proposal-writing', 'stakeholder-updates', 'sales-enablement', 'renewal-analysis', 'customer-success-planning'],
  'Office and Administrative Support': ['reporting', 'stakeholder-updates', 'meeting-facilitation', 'project-tracking', 'vendor-coordination', 'documentation', 'onboarding-enablement', 'process-mapping'],
};

const MAJOR_GROUP_INDUSTRY_DEFAULTS = {
  Management: ['Consulting', 'Tech', 'Finance', 'Other'],
  'Business and Financial Operations': ['Finance', 'Consulting', 'Tech', 'Other'],
  'Computer and Mathematical': ['Tech', 'Finance', 'Healthcare', 'Other'],
  'Architecture and Engineering': ['Tech', 'Healthcare', 'Consulting', 'Other'],
  'Life, Physical, and Social Science': ['Healthcare', 'Education', 'Tech', 'Other'],
  'Community and Social Service': ['Healthcare', 'Education', 'HR', 'Other'],
  Legal: ['Legal', 'Finance', 'Healthcare', 'Other'],
  'Educational Instruction and Library': ['Education', 'HR', 'Consulting', 'Other'],
  'Arts, Design, Entertainment, Sports, and Media': ['Marketing', 'Media', 'Tech', 'Other'],
  'Healthcare Practitioners and Technical': ['Healthcare', 'Education', 'Other', 'Consulting'],
  'Sales and Related': ['Sales', 'Marketing', 'Tech', 'Real Estate'],
  'Office and Administrative Support': ['HR', 'Finance', 'Healthcare', 'Other'],
};

const TITLE_INDUSTRY_SIGNALS = {
  marketing: ['Marketing', 'Media', 'Tech'],
  brand: ['Marketing', 'Media'],
  content: ['Marketing', 'Media'],
  growth: ['Marketing', 'Tech', 'Sales'],
  seo: ['Marketing', 'Media'],
  product: ['Tech', 'Marketing'],
  engineer: ['Tech'],
  developer: ['Tech'],
  software: ['Tech'],
  data: ['Tech', 'Finance'],
  analyst: ['Finance', 'Tech', 'Consulting'],
  finance: ['Finance'],
  accounting: ['Finance'],
  accountant: ['Finance'],
  'fp&a': ['Finance'],
  controller: ['Finance'],
  auditor: ['Finance'],
  tax: ['Finance'],
  revenue: ['Sales', 'Finance', 'Tech'],
  sales: ['Sales', 'Marketing'],
  account: ['Sales', 'Marketing'],
  customer: ['Sales', 'Tech'],
  recruiter: ['HR'],
  talent: ['HR'],
  hr: ['HR'],
  people: ['HR'],
  legal: ['Legal'],
  counsel: ['Legal'],
  compliance: ['Legal', 'Finance', 'Healthcare'],
  teacher: ['Education'],
  instructor: ['Education'],
  professor: ['Education'],
  learning: ['Education', 'HR'],
  training: ['Education', 'HR'],
  clinical: ['Healthcare'],
  nurse: ['Healthcare'],
  medical: ['Healthcare'],
  health: ['Healthcare'],
  consultant: ['Consulting'],
  strategy: ['Consulting', 'Finance'],
  'real-estate': ['Real Estate'],
  property: ['Real Estate'],
};

export const TASK_LIBRARY = [
  {
    task_id: 'reporting',
    label: 'Reporting and status updates',
    category: 'writing/documentation',
    aliases: ['reports', 'status updates', 'weekly updates', 'report writing'],
  },
  {
    task_id: 'analysis',
    label: 'Analysis and insight generation',
    category: 'analysis',
    aliases: ['analysis', 'insights', 'data analysis', 'performance review'],
  },
  {
    task_id: 'forecasting',
    label: 'Forecasting and planning',
    category: 'analysis',
    aliases: ['forecasting', 'planning', 'capacity planning', 'scenario planning'],
  },
  {
    task_id: 'dashboarding',
    label: 'Dashboarding and KPI tracking',
    category: 'analysis',
    aliases: ['dashboards', 'kpis', 'scorecards', 'metrics tracking'],
  },
  {
    task_id: 'data-cleanup',
    label: 'Data cleanup and validation',
    category: 'analysis',
    aliases: ['data cleanup', 'validation', 'qa checks', 'reconciliation'],
  },
  {
    task_id: 'client-calls',
    label: 'Client calls and relationship management',
    category: 'communication/stakeholder work',
    aliases: ['client calls', 'customer calls', 'account management', 'relationship management'],
  },
  {
    task_id: 'stakeholder-updates',
    label: 'Stakeholder updates and coordination',
    category: 'communication/stakeholder work',
    aliases: ['stakeholder updates', 'coordination', 'follow-ups', 'cross-functional communication'],
  },
  {
    task_id: 'meeting-facilitation',
    label: 'Meeting facilitation and follow-through',
    category: 'communication/stakeholder work',
    aliases: ['meetings', 'running meetings', 'facilitation'],
  },
  {
    task_id: 'cross-functional-alignment',
    label: 'Cross-functional alignment',
    category: 'communication/stakeholder work',
    aliases: ['alignment', 'cross-functional work', 'stakeholder management'],
  },
  {
    task_id: 'decision-memos',
    label: 'Decision memos and recommendations',
    category: 'writing/documentation',
    aliases: ['memos', 'recommendations', 'business cases'],
  },
  {
    task_id: 'proposal-writing',
    label: 'Proposal writing and presentations',
    category: 'writing/documentation',
    aliases: ['proposals', 'presentations', 'pitch decks'],
  },
  {
    task_id: 'documentation',
    label: 'Documentation and knowledge capture',
    category: 'writing/documentation',
    aliases: ['documentation', 'knowledge base', 'process docs'],
  },
  {
    task_id: 'policy-documentation',
    label: 'Policy and compliance documentation',
    category: 'writing/documentation',
    aliases: ['policy writing', 'compliance docs', 'controls documentation'],
  },
  {
    task_id: 'content-briefing',
    label: 'Content briefing and creation',
    category: 'writing/documentation',
    aliases: ['content', 'briefs', 'creative briefs', 'copywriting'],
  },
  {
    task_id: 'campaign-reporting',
    label: 'Campaign performance reporting',
    category: 'analysis',
    aliases: ['campaign reporting', 'campaign analysis', 'marketing performance'],
  },
  {
    task_id: 'market-research',
    label: 'Market and competitor research',
    category: 'analysis',
    aliases: ['research', 'competitor research', 'market research'],
  },
  {
    task_id: 'user-research',
    label: 'User research and synthesis',
    category: 'analysis',
    aliases: ['user research', 'interviews', 'synthesis'],
  },
  {
    task_id: 'process-mapping',
    label: 'Process mapping and improvement',
    category: 'operations/process',
    aliases: ['process improvement', 'workflow mapping', 'operational improvement'],
  },
  {
    task_id: 'project-tracking',
    label: 'Project tracking and follow-up',
    category: 'operations/process',
    aliases: ['project tracking', 'follow-up', 'project coordination'],
  },
  {
    task_id: 'vendor-coordination',
    label: 'Vendor and partner coordination',
    category: 'operations/process',
    aliases: ['vendor management', 'partner coordination'],
  },
  {
    task_id: 'team-coaching',
    label: 'Managing or coaching people',
    category: 'leadership/management',
    aliases: ['managing people', 'coaching', 'people management', 'performance management'],
  },
  {
    task_id: 'planning-roadmaps',
    label: 'Strategy and roadmap planning',
    category: 'leadership/management',
    aliases: ['strategy', 'roadmaps', 'planning', 'strategic planning'],
  },
  {
    task_id: 'candidate-screening',
    label: 'Candidate screening and evaluation',
    category: 'operations/process',
    aliases: ['screening', 'candidate review', 'resume review'],
  },
  {
    task_id: 'interview-coordination',
    label: 'Interview coordination and scheduling',
    category: 'operations/process',
    aliases: ['interviews', 'scheduling', 'interview process'],
  },
  {
    task_id: 'people-ops-reporting',
    label: 'People operations reporting',
    category: 'analysis',
    aliases: ['hr reporting', 'headcount reporting', 'people analytics'],
  },
  {
    task_id: 'budgeting',
    label: 'Budgeting and cost management',
    category: 'analysis',
    aliases: ['budgeting', 'cost control', 'expense planning'],
  },
  {
    task_id: 'variance-analysis',
    label: 'Variance analysis and reconciliation',
    category: 'analysis',
    aliases: ['variance analysis', 'reconciliation', 'close support'],
  },
  {
    task_id: 'pipeline-reporting',
    label: 'Pipeline reporting and CRM hygiene',
    category: 'analysis',
    aliases: ['pipeline', 'crm', 'sales reporting'],
  },
  {
    task_id: 'customer-support',
    label: 'Customer issue resolution',
    category: 'communication/stakeholder work',
    aliases: ['support', 'customer support', 'issue resolution'],
  },
  {
    task_id: 'ticket-triage',
    label: 'Ticket triage and routing',
    category: 'operations/process',
    aliases: ['triage', 'routing', 'ticket management'],
  },
  {
    task_id: 'knowledge-base-writing',
    label: 'Knowledge base and help center writing',
    category: 'writing/documentation',
    aliases: ['knowledge base', 'help center', 'support documentation'],
  },
  {
    task_id: 'coding-dev',
    label: 'Coding and implementation',
    category: 'technical/production',
    aliases: ['coding', 'development', 'implementation', 'software engineering'],
  },
  {
    task_id: 'debugging-qa',
    label: 'Debugging, QA, and troubleshooting',
    category: 'technical/production',
    aliases: ['debugging', 'qa', 'testing', 'troubleshooting'],
  },
  {
    task_id: 'system-design',
    label: 'System design and architecture decisions',
    category: 'technical/production',
    aliases: ['system design', 'architecture', 'technical design'],
  },
  {
    task_id: 'automation-building',
    label: 'Automation building and workflow tooling',
    category: 'technical/production',
    aliases: ['automation', 'workflow automation', 'tooling', 'no-code automation'],
  },
  {
    task_id: 'contract-review',
    label: 'Contract review and redlining',
    category: 'writing/documentation',
    aliases: ['contracts', 'redlining', 'legal review'],
  },
  {
    task_id: 'curriculum-design',
    label: 'Curriculum or program design',
    category: 'writing/documentation',
    aliases: ['curriculum', 'program design', 'training design'],
  },
  {
    task_id: 'executive-briefing',
    label: 'Executive briefing and narrative framing',
    category: 'communication/stakeholder work',
    aliases: ['executive briefings', 'narrative framing', 'leadership updates', 'board updates'],
  },
  {
    task_id: 'scenario-modeling',
    label: 'Scenario modeling and sensitivity analysis',
    category: 'analysis',
    aliases: ['scenario modeling', 'sensitivity analysis', 'what-if analysis', 'driver modeling'],
  },
  {
    task_id: 'pricing-analysis',
    label: 'Pricing, margin, and commercial analysis',
    category: 'analysis',
    aliases: ['pricing analysis', 'margin analysis', 'commercial analysis', 'unit economics'],
  },
  {
    task_id: 'demand-generation',
    label: 'Demand generation and campaign planning',
    category: 'operations/process',
    aliases: ['demand gen', 'campaign planning', 'lead generation', 'growth planning'],
  },
  {
    task_id: 'lifecycle-crm',
    label: 'Lifecycle CRM and nurture workflow management',
    category: 'operations/process',
    aliases: ['crm lifecycle', 'nurture workflows', 'email journeys', 'customer lifecycle'],
  },
  {
    task_id: 'seo-optimization',
    label: 'SEO optimization and content refreshes',
    category: 'writing/documentation',
    aliases: ['seo', 'content optimization', 'content refresh', 'search optimization'],
  },
  {
    task_id: 'ab-testing',
    label: 'Experimentation and A/B test analysis',
    category: 'analysis',
    aliases: ['a/b testing', 'experimentation', 'conversion tests', 'testing analysis'],
  },
  {
    task_id: 'sales-enablement',
    label: 'Sales enablement and deal support materials',
    category: 'communication/stakeholder work',
    aliases: ['sales enablement', 'battlecards', 'deal support', 'enablement materials'],
  },
  {
    task_id: 'renewal-analysis',
    label: 'Renewal, expansion, and account risk analysis',
    category: 'analysis',
    aliases: ['renewals', 'expansion analysis', 'account risk', 'retention analysis'],
  },
  {
    task_id: 'product-discovery',
    label: 'Product discovery and hypothesis shaping',
    category: 'analysis',
    aliases: ['product discovery', 'hypothesis shaping', 'problem discovery', 'solution discovery'],
  },
  {
    task_id: 'backlog-prioritization',
    label: 'Backlog prioritization and tradeoff decisions',
    category: 'leadership/management',
    aliases: ['backlog prioritization', 'tradeoff decisions', 'prioritization', 'scope decisions'],
  },
  {
    task_id: 'requirements-definition',
    label: 'Requirements definition and workflow scoping',
    category: 'operations/process',
    aliases: ['requirements', 'workflow scoping', 'business requirements', 'acceptance criteria'],
  },
  {
    task_id: 'sprint-planning',
    label: 'Sprint planning and delivery coordination',
    category: 'operations/process',
    aliases: ['sprint planning', 'delivery coordination', 'iteration planning', 'standup coordination'],
  },
  {
    task_id: 'release-coordination',
    label: 'Release coordination and launch readiness',
    category: 'operations/process',
    aliases: ['release coordination', 'launch readiness', 'release planning', 'go-live coordination'],
  },
  {
    task_id: 'incident-response',
    label: 'Incident response and operational triage',
    category: 'technical/production',
    aliases: ['incident response', 'operational triage', 'production support', 'incident management'],
  },
  {
    task_id: 'data-modeling',
    label: 'Data modeling and instrumentation planning',
    category: 'technical/production',
    aliases: ['data modeling', 'instrumentation', 'event tracking', 'schema planning'],
  },
  {
    task_id: 'revops-automation',
    label: 'RevOps automation and systems maintenance',
    category: 'technical/production',
    aliases: ['revops automation', 'crm automation', 'systems maintenance', 'ops tooling'],
  },
  {
    task_id: 'procurement-operations',
    label: 'Procurement, sourcing, and vendor ops',
    category: 'operations/process',
    aliases: ['procurement', 'sourcing', 'vendor ops', 'purchasing operations'],
  },
  {
    task_id: 'compliance-monitoring',
    label: 'Compliance monitoring and control reviews',
    category: 'writing/documentation',
    aliases: ['compliance monitoring', 'control reviews', 'audit support', 'risk controls'],
  },
  {
    task_id: 'onboarding-enablement',
    label: 'Onboarding design and enablement workflows',
    category: 'operations/process',
    aliases: ['onboarding', 'enablement', 'ramp workflows', 'new hire onboarding'],
  },
  {
    task_id: 'training-facilitation',
    label: 'Training facilitation and workshop delivery',
    category: 'communication/stakeholder work',
    aliases: ['training facilitation', 'workshops', 'live training', 'session delivery'],
  },
  {
    task_id: 'implementation-onboarding',
    label: 'Implementation onboarding and client rollout',
    category: 'operations/process',
    aliases: ['implementation', 'client onboarding', 'rollout', 'deployment onboarding'],
  },
  {
    task_id: 'customer-success-planning',
    label: 'Success planning and adoption follow-through',
    category: 'communication/stakeholder work',
    aliases: ['customer success', 'adoption planning', 'success plans', 'account planning'],
  },
];

function normalizeValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function buildTitleSignalTokens(jobTitle, titleProfile = null) {
  const rawParts = [
    String(jobTitle || '').toLowerCase(),
    String(titleProfile?.title || '').toLowerCase(),
    String(titleProfile?.canonical_title || titleProfile?.canonicalTitle || '').toLowerCase(),
    String(titleProfile?.major_group_name || titleProfile?.majorGroupName || '').toLowerCase(),
  ].filter(Boolean);

  const baseTokens = rawParts
    .join(' ')
    .split(/[^a-z0-9&+.#/-]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  const phraseTokens = [];
  for (const raw of rawParts) {
    const words = raw
      .split(/[^a-z0-9&+.#/-]+/g)
      .map((token) => token.trim())
      .filter(Boolean);

    phraseTokens.push(raw);

    for (let index = 0; index < words.length - 1; index += 1) {
      phraseTokens.push(`${words[index]} ${words[index + 1]}`);
    }

    for (let index = 0; index < words.length - 2; index += 1) {
      phraseTokens.push(`${words[index]} ${words[index + 1]} ${words[index + 2]}`);
    }
  }

  return Array.from(new Set([...baseTokens, ...phraseTokens].map((token) => normalizeValue(token)).filter(Boolean)));
}

function scoreTaskForContext(task, jobTitle, industry, titleProfile = null) {
  const normalizedTitle = String(jobTitle || '').toLowerCase();
  const normalizedIndustry = normalizeValue(industry).replace(/-/g, '_');
  const majorGroupName = titleProfile?.major_group_name || titleProfile?.majorGroupName || '';
  const titleTokens = buildTitleSignalTokens(jobTitle, titleProfile);
  let score = 0;
  const genericKeywords = new Set(['manager', 'analyst', 'coordinator', 'administrator', 'assistant', 'designer']);

  Object.entries(TITLE_KEYWORDS).forEach(([keyword, taskIds]) => {
    if (titleTokens.includes(normalizeValue(keyword)) && taskIds.includes(task.task_id)) {
      const isPhraseKeyword = keyword.includes('-');
      score += genericKeywords.has(keyword) ? 3 : isPhraseKeyword ? 10 : 7;
    }
  });

  const majorGroupTasks = MAJOR_GROUP_TASK_PRESETS[majorGroupName] || [];
  if (majorGroupTasks.includes(task.task_id)) {
    score += 3;
  }

  const industryTasks = INDUSTRY_KEYWORDS[normalizedIndustry] || [];
  if (industryTasks.includes(task.task_id)) {
    score += 3;
  }

  if (normalizedTitle.includes('senior') || normalizedTitle.includes('lead') || normalizedTitle.includes('head') || normalizedTitle.includes('director')) {
    if (task.category === 'leadership/management' || task.task_id === 'cross-functional-alignment') {
      score += 2;
    }
  }

  if (titleProfile?.is_canonical) {
    score += 0.5;
  }

  return score;
}

export function getRecommendedTasks({ jobTitle, industry, selectedTaskIds = [], limit = 8, titleProfile = null }) {
  const excluded = new Set(selectedTaskIds);

  return TASK_LIBRARY
    .map((task) => ({
      ...task,
      score: scoreTaskForContext(task, jobTitle, industry, titleProfile),
    }))
    .filter((task) => !excluded.has(task.task_id))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.label.localeCompare(b.label);
    })
    .slice(0, limit);
}

export function inferIndustrySuggestions({ jobTitle, titleProfile = null, currentIndustry = null, limit = 4 }) {
  const suggestions = [];
  const seen = new Set();
  const majorGroupName = titleProfile?.major_group_name || titleProfile?.majorGroupName || '';
  const titleTokens = buildTitleSignalTokens(jobTitle, titleProfile);

  function addIndustry(value) {
    if (!value || seen.has(value)) return;
    seen.add(value);
    suggestions.push(value);
  }

  if (currentIndustry) {
    addIndustry(currentIndustry);
  }

  Object.entries(TITLE_INDUSTRY_SIGNALS).forEach(([token, industries]) => {
    if (titleTokens.includes(token)) {
      industries.forEach(addIndustry);
    }
  });

  (MAJOR_GROUP_INDUSTRY_DEFAULTS[majorGroupName] || []).forEach(addIndustry);

  ['Tech', 'Finance', 'Marketing', 'Healthcare', 'Legal', 'Education', 'Sales', 'HR', 'Consulting', 'Media', 'Real Estate', 'Other'].forEach(addIndustry);

  return suggestions.slice(0, limit);
}

export function getTitleRecommendationContext({ jobTitle, titleProfile = null, industry = null }) {
  const majorGroupName = titleProfile?.major_group_name || titleProfile?.majorGroupName || '';
  const industrySuggestions = inferIndustrySuggestions({ jobTitle, titleProfile, currentIndustry: industry, limit: 3 });

  return {
    titleFamily: majorGroupName || 'Unmatched title',
    titleMatched: Boolean(titleProfile?.title),
    industrySuggestions,
  };
}

export function searchTasks(query, selectedTaskIds = [], limit = 8) {
  const trimmedQuery = String(query || '').trim().toLowerCase();
  if (!trimmedQuery) return [];

  const excluded = new Set(selectedTaskIds);

  return TASK_LIBRARY
    .filter((task) => {
      if (excluded.has(task.task_id)) return false;
      const haystack = [task.label, task.category, ...(task.aliases || [])].join(' ').toLowerCase();
      return haystack.includes(trimmedQuery);
    })
    .slice(0, limit);
}

export function createCustomTask(label) {
  const cleanedLabel = String(label || '').trim();
  if (!cleanedLabel) return null;

  return {
    task_id: `custom-${normalizeValue(cleanedLabel)}`,
    label: cleanedLabel,
    category: 'custom',
    aliases: [],
    source: 'custom',
  };
}

export function hasLeadershipSignals(selectedTasks = []) {
  return selectedTasks.some(
    (task) =>
      task.category === 'leadership/management' ||
      task.task_id === 'team-coaching' ||
      task.task_id === 'cross-functional-alignment'
  );
}

export function getTaskSelectionSummary(selectedTasks = []) {
  const buckets = selectedTasks.reduce((acc, task) => {
    const category = task.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => `${count} ${category}`)
    .join(' · ');
}
