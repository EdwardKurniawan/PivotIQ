export const SENIOR_ROLE_FIXTURE_CLARIFIERS = Object.freeze({
  goal_now: 'hybrid_transition',
  timeline_urgency: 'within_6_months',
  years_experience_band: '11_plus',
  location_preference: 'united_states',
  ai_maturity: 'repeatable_workflows',
  role_blend: 'strategy',
  management_scope: 'small-team',
});

export const SENIOR_ROLE_FIXTURES = Object.freeze([
  {
    jobTitle: 'Finance Manager',
    industry: 'SaaS',
    tasks: ['Board-ready variance narratives', 'Scenario planning and tradeoff modeling', 'Budget review leadership'],
    topPivotPattern: /(finance|strategic finance|fp&a|finance systems|business operations)/i,
    stayPattern: /(strategic finance manager|finance manager|finance systems manager|higher-leverage version)/i,
    clarifiers: {
      technical_capability: 'advanced_spreadsheets',
      proof_state: 'dashboard_or_analysis',
      decision_scope: 'internal-ops',
      domain_focus: 'business planning and finance systems',
    },
  },
  {
    jobTitle: 'Senior HR Business Partner',
    industry: 'SaaS',
    tasks: ['Workforce planning', 'Manager coaching', 'Org design support'],
    topPivotPattern: /(people|talent|workforce|hr|operations)/i,
    stayPattern: /(people operations lead|senior hr business partner|workforce planning lead|higher-leverage version)/i,
    clarifiers: {
      proof_state: 'internal_project',
      decision_scope: 'internal-ops',
      domain_focus: 'manager enablement and workforce planning',
    },
  },
  {
    jobTitle: 'Senior Program Manager',
    industry: 'Healthcare',
    tasks: ['Cross-functional program governance', 'Executive stakeholder alignment', 'Delivery risk reviews'],
    topPivotPattern: /(program|portfolio|delivery|operations|strategy and operations)/i,
    stayPattern: /(program manager|program operations lead|delivery operations manager|higher-leverage version)/i,
    clarifiers: {
      proof_state: 'workflow_or_playbook',
      decision_scope: 'regulated-high-stakes',
      domain_focus: 'program governance and delivery risk',
    },
  },
  {
    jobTitle: 'Marketing Director',
    industry: 'Retail',
    tasks: ['Go-to-market planning', 'Budget and performance reviews', 'Team prioritization'],
    topPivotPattern: /(marketing|gtm|growth|product marketing|revenue operations)/i,
    stayPattern: /(marketing director|marketing strategy lead|marketing operations lead|growth strategy lead)/i,
    allowSeniorTitles: true,
    clarifiers: {
      proof_state: 'internal_project',
      decision_scope: 'customer-revenue',
      domain_focus: 'go-to-market planning and team prioritization',
    },
  },
  {
    jobTitle: 'Customer Success Director',
    industry: 'SaaS',
    tasks: ['Executive account reviews', 'Renewal strategy', 'Team coaching'],
    topPivotPattern: /(customer|account|operations|revenue operations|enablement)/i,
    stayPattern: /(customer success director|customer strategy lead|customer operations lead|higher-leverage version)/i,
    allowSeniorTitles: true,
    clarifiers: {
      proof_state: 'internal_project',
      decision_scope: 'customer-revenue',
      domain_focus: 'renewal strategy and executive account oversight',
    },
  },
]);
