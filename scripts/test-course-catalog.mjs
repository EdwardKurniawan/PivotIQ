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

testExactToolPhraseBeatsGenericReporting();
testStrongCatalogMatchBeatsGenericAiFallbackShape();
testWeakSemanticMatchIsFlagged();
testDataCampWinsWhenItIsBetterMatch();
testAgenticAiMatchesAgentCourseOverGenericAiLiteracy();

console.log('Course catalog matching tests passed.');
