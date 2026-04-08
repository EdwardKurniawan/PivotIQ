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

testExactToolPhraseBeatsGenericReporting();
testStrongCatalogMatchBeatsGenericAiFallbackShape();
testWeakSemanticMatchIsFlagged();
testDataCampWinsWhenItIsBetterMatch();
testAgenticAiMatchesAgentCourseOverGenericAiLiteracy();
testLegalClauseGapMatchesContractResource();
testProcurementForecastingRejectsEducationMatch();
testLegalRiskRejectsMarketingMatch();
testComplianceKpisPreferGovernanceOverGenericAi();

console.log('Course catalog matching tests passed.');
