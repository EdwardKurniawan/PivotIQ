import assert from 'node:assert/strict';
import { buildCatalogMatch } from '../lib/course-catalog.js';
import { assessCourseMatchRelevance, isWeakProbeResult } from '../lib/course-catalog-quality.js';

const pivot = {
  title: 'Data-Driven Operations Manager',
  decision_frame: 'strongest-leverage-fit',
};

function entry(overrides) {
  return {
    provider: 'Test',
    title: 'Generic Course',
    summary: '',
    skills: [],
    tags: [],
    role_families: [],
    outcome_types: [],
    resource_type: 'course',
    verification_status: 'verified',
    ...overrides,
  };
}

function testExactToolPhraseBeatsGenericReporting() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Power BI reporting',
      category: 'technical',
      gap_priority: 'medium',
      how_to_close_gap: 'Create business-ready BI dashboards and reporting workflows.',
    },
    pivot,
    [
      entry({
        title: 'Excel Skills for Business',
        summary: 'Spreadsheet reporting and business analysis.',
        skills: ['excel', 'reporting', 'business analysis'],
        tags: ['analytics', 'reporting'],
        role_families: ['analytics', 'operations'],
      }),
      entry({
        provider: 'DataCamp',
        title: 'Introduction to Power BI',
        summary: 'Power BI course for building dashboards and business intelligence reporting.',
        skills: ['power bi', 'dashboarding', 'data storytelling'],
        tags: ['dashboard storytelling', 'reporting'],
        role_families: ['analytics', 'operations'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'Introduction to Power BI');
}

function testStrongCatalogMatchBeatsGenericAiFallbackShape() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Contract lifecycle management',
      category: 'domain',
      gap_priority: 'medium',
      how_to_close_gap: 'Understand contract workflow, governance, and lifecycle operations.',
    },
    pivot,
    [
      entry({
        title: 'Prompt Engineering',
        summary: 'Generative AI prompting for productivity.',
        skills: ['prompt engineering', 'generative ai'],
        tags: ['ai execution'],
        role_families: ['ai-automation'],
      }),
      entry({
        provider: 'Ironclad',
        title: 'Digital Contracting Academy',
        summary: 'Contract lifecycle workflows, CLM governance, and legal operations.',
        skills: ['contract lifecycle management', 'clm', 'legal operations'],
        tags: ['contracting', 'legal workflow'],
        role_families: ['operations'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'Digital Contracting Academy');
}

function testWeakSemanticMatchIsFlagged() {
  const relevance = assessCourseMatchRelevance(
    entry({
      title: 'Agile with Atlassian Jira',
      summary: 'Agile planning and Jira project delivery.',
      skills: ['agile', 'jira', 'project delivery'],
      tags: ['operations'],
    }),
    {
      expected_terms: ['contract', 'legal', 'clm', 'lifecycle'],
      required_terms: ['contract', 'legal', 'clm'],
    }
  );

  assert.equal(relevance.relevance_status, 'weak');
  assert.equal(isWeakProbeResult({ match: { title: 'Agile with Atlassian Jira' }, score: 20, relevance_status: relevance.relevance_status }), true);
}

function testDataCampWinsWhenItIsBetterMatch() {
  const match = buildCatalogMatch(
    {
      skill_name: 'SQL',
      category: 'technical',
      gap_priority: 'critical',
      how_to_close_gap: 'Build hands-on SQL query fluency for analytics and reporting.',
    },
    pivot,
    [
      entry({
        provider: 'Coursera',
        title: 'AI For Everyone',
        summary: 'AI strategy and business adoption.',
        skills: ['ai strategy', 'change management'],
        tags: ['leadership'],
      }),
      entry({
        provider: 'DataCamp',
        title: 'Intermediate SQL',
        summary: 'Intermediate SQL course for subqueries, window functions, and advanced querying.',
        skills: ['sql', 'window functions', 'subqueries', 'data analysis'],
        tags: ['analytics', 'sql'],
        role_families: ['analytics', 'technical'],
      }),
    ]
  );

  assert.equal(match.entry.provider, 'DataCamp');
  assert.equal(match.entry.title, 'Intermediate SQL');
}

function testAgenticAiMatchesAgentCourseOverGenericAiLiteracy() {
  const match = buildCatalogMatch(
    {
      skill_name: 'AI agent workflows',
      category: 'technical',
      gap_priority: 'critical',
      how_to_close_gap: 'Build tool-using agent workflows for multi-step automation.',
    },
    {
      title: 'AI Workflow Automation Specialist',
      decision_frame: 'highest upside',
    },
    [
      entry({
        provider: 'Google',
        title: 'AI Essentials',
        summary: 'General workplace AI productivity and prompting course.',
        skills: ['ai productivity', 'prompting', 'responsible ai'],
        tags: ['workplace ai'],
        role_families: ['strategy', 'operations'],
      }),
      entry({
        provider: 'DeepLearning.AI',
        title: 'AI Agents in LangGraph',
        summary: 'Build agentic AI workflows with LangGraph, stateful agents, tool use, and multi-step orchestration.',
        skills: ['ai agents', 'langgraph', 'tool use', 'agent orchestration', 'workflow automation'],
        tags: ['ai agents', 'agentic ai', 'hands-on ai'],
        role_families: ['ai-automation', 'technical'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'AI Agents in LangGraph');
}

function testLegalClauseGapMatchesContractResource() {
  const match = buildCatalogMatch(
    {
      skill_name: 'AI contract clause drafting',
      category: 'legal operations',
      gap_priority: 'critical',
      how_to_close_gap: 'Build a clause mapping workflow for contract review and approval routing.',
    },
    {
      title: 'Contract Operations Strategist',
      decision_frame: 'safest transition',
    },
    [
      entry({
        provider: 'Udemy',
        title: 'The Complete SQL Bootcamp',
        summary: 'SQL course for relational databases and query analysis.',
        skills: ['sql', 'queries', 'database analysis'],
        tags: ['analytics'],
        role_families: ['analytics'],
      }),
      entry({
        provider: 'Ironclad',
        title: 'Digital Contracting Academy',
        summary: 'Contract lifecycle workflows, clause libraries, contract drafting, CLM governance, and legal operations.',
        skills: ['contract lifecycle management', 'clause library', 'contract drafting', 'clm', 'legal operations'],
        tags: ['clause mapping', 'contract operations', 'legal workflow'],
        role_families: ['operations', 'legal'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'Digital Contracting Academy');
}

function testProcurementForecastingRejectsEducationMatch() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Forecasting',
      category: 'technical',
      gap_priority: 'critical',
      how_to_close_gap: 'Build spend forecasts for procurement operations.',
    },
    {
      title: 'Procurement Operations Manager',
      decision_frame: 'strongest leverage fit',
    },
    [
      entry({
        provider: 'Coursera',
        title: 'Instructional Design Foundations and Applications',
        summary: 'Instructional design course for curriculum planning and learning programs.',
        skills: ['instructional design', 'curriculum design', 'learning programs'],
        tags: ['customer education', 'learning operations'],
        role_families: ['education', 'operations'],
      }),
      entry({
        provider: 'Coursera',
        title: 'Global Procurement and Sourcing Specialization',
        summary: 'Procurement and sourcing specialization covering supplier selection, spend context, and category strategy.',
        skills: ['procurement', 'sourcing', 'supplier management', 'spend analysis'],
        tags: ['procurement analytics', 'supplier strategy', 'sourcing'],
        role_families: ['operations', 'analytics', 'procurement'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'Global Procurement and Sourcing Specialization');
}

function testLegalRiskRejectsMarketingMatch() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Risk Assessment Framework Application',
      category: 'legal operations',
      gap_priority: 'critical',
      how_to_close_gap: 'Apply risk assessment frameworks in compliance workflows.',
    },
    {
      title: 'Compliance Evaluation Manager',
      decision_frame: 'safest transition',
    },
    [
      entry({
        provider: 'Udemy',
        title: 'The Complete Digital Marketing Course',
        summary: 'Broad digital marketing course covering traffic, conversion channels, analytics, and growth tactics.',
        skills: ['digital marketing', 'seo', 'campaign analytics'],
        tags: ['marketing'],
        role_families: ['marketing'],
      }),
      entry({
        provider: 'NIST',
        title: 'NIST AI Risk Management Framework',
        summary: 'Risk management framework for AI governance, compliance, and risk assessment.',
        skills: ['risk assessment', 'governance', 'compliance'],
        tags: ['risk framework', 'ai governance'],
        role_families: ['legal', 'ai-automation'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'NIST AI Risk Management Framework');
}

function testComplianceKpisPreferGovernanceOverGenericAi() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Develop and report on compliance and customer trust KPIs',
      category: 'legal operations',
      gap_priority: 'medium',
      how_to_close_gap: 'Measure compliance workflow quality and trust reporting.',
    },
    {
      title: 'Compliance Automation Specialist',
      decision_frame: 'safest transition',
    },
    [
      entry({
        provider: 'Microsoft Learn',
        title: 'Microsoft Learn: AI and Copilot learning paths',
        summary: 'AI productivity and Copilot learning for workplace productivity.',
        skills: ['copilot', 'ai productivity', 'prompting'],
        tags: ['trusted free vendor resource', 'ai'],
        role_families: ['ai-automation', 'operations'],
      }),
      entry({
        provider: 'NIST',
        title: 'NIST AI Risk Management Framework',
        summary: 'Risk management framework for AI governance, compliance evaluation, and trustworthy AI operating practices.',
        skills: ['risk assessment', 'ai governance', 'compliance evaluation', 'regulatory workflow'],
        tags: ['risk framework', 'governance', 'compliance'],
        role_families: ['legal', 'ai-automation', 'operations'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'NIST AI Risk Management Framework');
}

function testAiWorkflowGapBeatsRoleDomainCourse() {
  const match = buildCatalogMatch(
    {
      skill_name: 'AI workflow design',
      category: 'workflow',
      gap_priority: 'critical',
      how_to_close_gap: 'Build one AI-assisted procurement workflow and document the before/after impact.',
    },
    {
      title: 'Procurement Intelligence Manager',
      decision_frame: 'stay and advance',
    },
    [
      entry({
        provider: 'Coursera',
        title: 'Global Procurement and Sourcing Specialization',
        summary: 'Procurement and sourcing specialization covering supplier selection and category strategy.',
        skills: ['procurement', 'sourcing', 'supplier management', 'spend analysis'],
        tags: ['procurement analytics', 'supplier strategy', 'sourcing'],
        role_families: ['operations', 'analytics', 'procurement'],
      }),
      entry({
        provider: 'DataCamp',
        title: 'Introduction to AI Agents',
        summary: 'Design AI agent workflows and automation systems for business processes.',
        skills: ['ai agents', 'workflow design', 'automation mapping', 'agent systems'],
        tags: ['workflow design', 'automation', 'hands-on ai'],
        role_families: ['ai-automation', 'technical'],
      }),
    ]
  );

  assert.equal(match.entry.title, 'Introduction to AI Agents');
}

function testLegalIntakeWorkflowPrefersLegalOpsResource() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Legal intake workflow design',
      category: 'legal operations',
      gap_priority: 'critical',
      how_to_close_gap: 'Design a structured legal intake process with routing, issue tagging, and SLA visibility.',
    },
    {
      title: 'Legal Operations Analyst',
      decision_frame: 'safest transition',
    },
    [
      entry({
        provider: 'HubSpot Academy',
        title: 'Customer service operations skills',
        summary: 'Improve support operations and service routing workflows.',
        skills: ['service operations', 'routing', 'customer workflows'],
        tags: ['customer service', 'support routing'],
        role_families: ['customer', 'operations'],
        resource_type: 'pathway',
      }),
      entry({
        provider: 'Coursera',
        title: 'Legal operations learning paths',
        summary: 'Find legal operations, contract workflow, and compliance-oriented learning paths on Coursera.',
        skills: ['legal operations', 'contract workflows', 'compliance', 'governance'],
        tags: ['trusted vendor resource', 'coursera'],
        role_families: ['legal', 'operations'],
        resource_type: 'pathway',
      }),
    ]
  );

  assert.equal(match.entry.title, 'Legal operations learning paths');
}

function testProcurementDashboardProbeRejectsGenericFinanceCourse() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Supplier performance dashboarding',
      category: 'procurement operations',
      gap_priority: 'critical',
      how_to_close_gap: 'Build supplier scorecards and procurement dashboards that support sourcing reviews.',
    },
    {
      title: 'Procurement Systems Manager',
      decision_frame: 'strongest leverage fit',
    },
    [
      entry({
        provider: 'Coursera',
        title: 'Finance automation learning paths',
        summary: 'Explore automation, analytics, and operational finance learning resources.',
        skills: ['finance automation', 'workflow automation', 'reporting', 'operational finance'],
        tags: ['trusted vendor resource', 'coursera'],
        role_families: ['analytics', 'operations'],
        resource_type: 'pathway',
      }),
      entry({
        provider: 'Coursera',
        title: 'Procurement analytics learning paths',
        summary: 'Use Coursera programs to strengthen spend analysis, sourcing decisions, and supplier reporting.',
        skills: ['procurement analytics', 'sourcing', 'supplier reporting', 'spend analysis'],
        tags: ['trusted vendor resource', 'coursera'],
        role_families: ['procurement', 'analytics'],
        resource_type: 'pathway',
      }),
    ]
  );

  assert.equal(match.entry.title, 'Procurement analytics learning paths');
}

function testCustomerEducationProbePrefersLearningResource() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Learning analytics and onboarding measurement',
      category: 'customer education',
      gap_priority: 'medium',
      how_to_close_gap: 'Measure onboarding completion, adoption signals, and curriculum impact for customer education programs.',
    },
    {
      title: 'Customer Education Lead',
      decision_frame: 'strongest leverage fit',
    },
    [
      entry({
        provider: 'HubSpot Academy',
        title: 'Customer success operations skills',
        summary: 'Improve onboarding and lifecycle operations for customer-facing teams.',
        skills: ['customer success', 'onboarding', 'customer lifecycle', 'service design'],
        tags: ['customer operations'],
        role_families: ['customer', 'operations'],
        resource_type: 'pathway',
      }),
      entry({
        provider: 'Coursera',
        title: 'Instructional Design Foundations and Applications',
        summary: 'Instructional design course for curriculum planning and measurable learning programs.',
        skills: ['instructional design', 'learning programs', 'curriculum', 'training'],
        tags: ['instructional design', 'learning analytics'],
        role_families: ['education', 'operations'],
        resource_type: 'course',
      }),
    ]
  );

  assert.equal(match.entry.title, 'Instructional Design Foundations and Applications');
}

function testRevopsProbePrefersCrmReportingResource() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Revenue operations dashboard design',
      category: 'revenue operations',
      gap_priority: 'medium',
      how_to_close_gap: 'Build shared funnel dashboards and CRM reporting for handoffs across sales and marketing.',
    },
    {
      title: 'Revenue Operations Manager',
      decision_frame: 'strongest leverage fit',
    },
    [
      entry({
        provider: 'Google Cloud Skills Boost',
        title: 'Data analytics foundations paths',
        summary: 'Build data literacy and analysis habits for business reporting and decision support.',
        skills: ['data analytics', 'analysis foundations', 'reporting', 'decision support'],
        tags: ['google', 'analytics'],
        role_families: ['analytics', 'operations'],
        resource_type: 'pathway',
        source_metadata: { collection: 'researched-expansion-pack' },
      }),
      entry({
        provider: 'HubSpot Academy',
        title: 'Revenue operations skills',
        summary: 'Strengthen cross-functional pipeline operations and shared reporting systems.',
        skills: ['revenue operations', 'shared reporting', 'crm hygiene', 'process alignment'],
        tags: ['trusted free vendor resource', 'hubspot'],
        role_families: ['operations', 'analytics'],
        resource_type: 'course',
      }),
    ]
  );

  assert.equal(match.entry.title, 'Revenue operations skills');
}

function testFpaProbePrefersForecastResource() {
  const match = buildCatalogMatch(
    {
      skill_name: 'Forecast scenario modeling',
      category: 'finance analytics',
      gap_priority: 'critical',
      how_to_close_gap: 'Create scenario models and forecast views that support planning and executive decision-making.',
    },
    {
      title: 'FP&A Manager',
      decision_frame: 'strongest leverage fit',
    },
    [
      entry({
        provider: 'Coursera',
        title: 'Google Project Management Professional Certificate',
        summary: 'Project management certificate covering planning, stakeholder communication, and delivery workflows.',
        skills: ['project management', 'stakeholder management', 'planning', 'delivery'],
        tags: ['operations'],
        role_families: ['operations', 'strategy'],
      }),
      entry({
        provider: 'DataCamp',
        title: 'Forecasting paths',
        summary: 'Learn business forecasting, scenario modeling, finance planning, and time series methods for analytical decision support.',
        skills: ['forecasting', 'scenario modeling', 'finance planning', 'analysis'],
        tags: ['trusted vendor resource', 'datacamp', 'forecast modeling', 'fpa'],
        role_families: ['analytics', 'strategy'],
        resource_type: 'pathway',
        source_metadata: { collection: 'researched-expansion-pack' },
      }),
    ]
  );

  assert.equal(match.entry.title, 'Forecasting paths');
}

testExactToolPhraseBeatsGenericReporting();
testStrongCatalogMatchBeatsGenericAiFallbackShape();
testWeakSemanticMatchIsFlagged();
testDataCampWinsWhenItIsBetterMatch();
testAgenticAiMatchesAgentCourseOverGenericAiLiteracy();
testLegalClauseGapMatchesContractResource();
testProcurementForecastingRejectsEducationMatch();
testLegalRiskRejectsMarketingMatch();
testComplianceKpisPreferGovernanceOverGenericAi();
testAiWorkflowGapBeatsRoleDomainCourse();
testLegalIntakeWorkflowPrefersLegalOpsResource();
testProcurementDashboardProbeRejectsGenericFinanceCourse();
testCustomerEducationProbePrefersLearningResource();
testRevopsProbePrefersCrmReportingResource();
testFpaProbePrefersForecastResource();

console.log('Course catalog matching tests passed.');
