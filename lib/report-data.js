const DEFAULT_TASK_RISKS = {
  'Writing reports': 82,
  'Analyzing data': 76,
  'Client calls': 28,
  'Managing people': 22,
  'Coding / Dev': 61,
  'Customer support': 73,
  Research: 58,
  'Creating content': 84,
  'Running meetings': 24,
  'Building models': 52,
  'Reviewing docs': 68,
  'Strategy & planning': 34,
  'Reporting and status updates': 81,
  'Analysis and insight generation': 76,
  'Forecasting and planning': 51,
  'Dashboarding and KPI tracking': 62,
  'Data cleanup and validation': 78,
  'Client calls and relationship management': 26,
  'Stakeholder updates and coordination': 38,
  'Meeting facilitation and follow-through': 24,
  'Cross-functional alignment': 29,
  'Decision memos and recommendations': 63,
  'Proposal writing and presentations': 69,
  'Documentation and knowledge capture': 74,
  'Policy and compliance documentation': 65,
  'Content briefing and creation': 82,
  'Campaign performance reporting': 79,
  'Market and competitor research': 61,
  'User research and synthesis': 46,
  'Process mapping and improvement': 41,
  'Project tracking and follow-up': 55,
  'Vendor and partner coordination': 37,
  'Managing or coaching people': 22,
  'Strategy and roadmap planning': 34,
  'Candidate screening and evaluation': 84,
  'Interview coordination and scheduling': 79,
  'People operations reporting': 74,
  'Budgeting and cost management': 57,
  'Variance analysis and reconciliation': 64,
  'Pipeline reporting and CRM hygiene': 72,
  'Customer issue resolution': 67,
  'Ticket triage and routing': 81,
  'Knowledge base and help center writing': 71,
  'Coding and implementation': 61,
  'Debugging, QA, and troubleshooting': 41,
  'System design and architecture decisions': 27,
  'Automation building and workflow tooling': 31,
  'Contract review and redlining': 63,
  'Curriculum or program design': 44,
};

const FALLBACK_TASK_TRANSLATIONS = {
  nl: {
    'Stakeholder updates and coordination': 'Stakeholder-updates en coördinatie',
  },
  de: {
    'Stakeholder updates and coordination': 'Stakeholder-Updates und Koordination',
  },
};

function translateFallbackTask(locale, taskName) {
  if (!taskName) return taskName;
  const normalizedLocale = String(locale || 'en').toLowerCase();
  return FALLBACK_TASK_TRANSLATIONS[normalizedLocale]?.[taskName] || taskName;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function extractJsonCandidate(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]+?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return null;
}

export function parseModelJson(rawText) {
  const candidate = extractJsonCandidate(rawText);
  if (!candidate) return null;

  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function extractTaskLabels(tasks) {
  if (!Array.isArray(tasks)) return [];

  return tasks
    .map((task) => {
      if (typeof task === 'string') return task;
      return task?.label || task?.task_name || '';
    })
    .filter(Boolean);
}

function buildWeek({
  weekNumber,
  title,
  goal,
  why,
  problem,
  actions,
  timeCommitment,
  successSignal,
  proof,
  blockers,
  catchUp,
  encouragement,
}) {
  return {
    week_number: weekNumber,
    title,
    goal,
    why_this_week: why,
    problem_being_solved: problem,
    actions,
    time_commitment: timeCommitment,
    success_signal: successSignal,
    proof_of_completion: proof,
    common_blockers: blockers,
    catch_up_plan: catchUp,
    encouragement,
  };
}

function buildSkillGap({
  skillName,
  category,
  currentStrength,
  requiredLevel,
  gapPriority,
  whyItMatters,
  evidence,
  howToClose,
  resourceTitle,
  resourceUrl,
}) {
  return {
    skill_name: skillName,
    category,
    current_strength: currentStrength,
    required_level: requiredLevel,
    gap_priority: gapPriority,
    why_it_matters: whyItMatters,
    evidence_you_already_have: evidence,
    how_to_close_gap: howToClose,
    resource_title: resourceTitle,
    resource_url: resourceUrl,
  };
}

function buildPivot({
  id,
  title,
  fitSummary,
  outcome,
  decisionFrame,
  whoThisIsFor,
  tradeoffs,
  whyThisPathWins,
  whatYouAreBettingOn,
  matchScore,
  salaryRange,
  salaryDelta,
  transitionTime,
  difficulty,
  strengths,
  skillGaps,
  weeks,
}) {
  return {
    id,
    title,
    fit_summary: fitSummary,
    outcome,
    decision_frame: decisionFrame,
    who_this_is_for: whoThisIsFor,
    tradeoffs: tradeoffs || [],
    why_this_path_wins: whyThisPathWins,
    what_you_are_betting_on: whatYouAreBettingOn,
    match_score: matchScore,
    salary_range: salaryRange,
    salary_delta: salaryDelta,
    transition_time: transitionTime,
    difficulty,
    strengths_to_leverage: strengths,
    skill_gaps: skillGaps,
    roadmap: { weeks },
  };
}

const DEFAULT_PIVOT_DECISION_FRAMES = [
  'safest transition',
  'strongest leverage fit',
  'fastest cash recovery',
  'highest upside',
  'long-term platform bet',
];

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function inferRoleFamily(text) {
  const normalized = normalizeText(text);
  if (/(marketing|growth|brand|demand|campaign|content|seo|crm)/.test(normalized)) return 'marketing';
  if (/(fp&a|finance|financial|accounting|accountant|controller|budget|forecast)/.test(normalized)) return 'finance';
  if (/(hr|human resources|people|recruit|talent|workforce)/.test(normalized)) return 'hr';
  if (/(customer success|account manager|sales ops|revops|revenue operations|sales operations)/.test(normalized)) return 'customer';
  if (/(operations|office manager|program manager|project manager|coordinator|admin|administrative)/.test(normalized)) return 'operations';
  if (/(product|strategy|bizops|business operations|analyst)/.test(normalized)) return 'product';
  return 'general';
}

function buildStayRoleBlueprint(roleFamily, locale = 'en') {
  const copy = {
    en: {
      marketing: {
        nextTitle: 'Marketing Strategy Lead',
        opportunities: [
          'Turn campaign reporting into decision-ready growth reviews',
          'Build AI-assisted briefing systems for content and demand teams',
          'Lead testing velocity and experimentation governance',
        ],
        proofAsset: 'AI-assisted campaign planning operating system',
        metric: 'Reduce campaign planning turnaround time while increasing testing velocity',
        narrative: 'I am making marketing execution faster, but more importantly I am making planning and decision quality stronger.',
      },
      finance: {
        nextTitle: 'Strategic Finance Manager',
        opportunities: [
          'Turn forecasting into faster scenario support for leaders',
          'Build AI-assisted monthly business review narratives',
          'Own the finance workflow that translates numbers into decisions',
        ],
        proofAsset: 'AI-assisted forecast and variance review pack',
        metric: 'Reduce planning cycle time while improving decision-readiness of finance narratives',
        narrative: 'I am not only accelerating analysis. I am making finance a faster decision partner for the business.',
      },
      hr: {
        nextTitle: 'People Operations Lead',
        opportunities: [
          'Turn policy and people questions into a reliable AI-assisted support layer',
          'Build manager enablement workflows that reduce repeated HR escalations',
          'Lead AI-assisted org-health and workforce insight reporting',
        ],
        proofAsset: 'AI-assisted manager support and policy workflow',
        metric: 'Reduce repeated HR escalations while improving response consistency',
        narrative: 'I am using AI to make HR support more scalable, but also to increase the strategic quality of people decisions.',
      },
      customer: {
        nextTitle: 'Customer Strategy Lead',
        opportunities: [
          'Turn renewal prep into AI-assisted risk and opportunity reviews',
          'Build a reusable AI-assisted onboarding and success workflow',
          'Lead account insight reporting that helps teams act earlier',
        ],
        proofAsset: 'AI-assisted account health and renewal workflow',
        metric: 'Improve renewal-readiness and reduce manual prep time for account reviews',
        narrative: 'I am making customer-facing work more proactive, more scalable, and more commercially useful.',
      },
      operations: {
        nextTitle: 'Program Operations Lead',
        opportunities: [
          'Turn intake and coordination work into cleaner automated workflows',
          'Build AI-assisted status reporting and follow-up systems',
          'Lead operational standards that make team throughput more reliable',
        ],
        proofAsset: 'AI-assisted intake and coordination system',
        metric: 'Reduce manual follow-up load while improving response consistency',
        narrative: 'I am not just keeping operations moving. I am redesigning how operational work flows through the team.',
      },
      product: {
        nextTitle: 'Strategic Operations Manager',
        opportunities: [
          'Turn analysis into faster, decision-ready recommendation memos',
          'Build AI-assisted research synthesis and prioritization workflows',
          'Lead operating rhythms that make planning and review sharper',
        ],
        proofAsset: 'AI-assisted strategy and prioritization brief',
        metric: 'Reduce decision memo turnaround time while improving clarity and reuse',
        narrative: 'I am using AI to increase the speed of analysis, but also to raise the quality of strategic judgment.',
      },
      general: {
        nextTitle: 'Higher-leverage version of your current role',
        opportunities: [
          'Turn repetitive execution into AI-assisted workflow design',
          'Move from raw output into interpretation and decision support',
          'Lead one visible AI adoption pattern for your team',
        ],
        proofAsset: 'Internal AI leverage case',
        metric: 'Improve speed, quality, or decision support on one high-visibility workflow',
        narrative: 'I am using AI to become more strategic, not just more efficient.',
      },
    },
  };

  const selected = copy.en[roleFamily] || copy.en.general;
  if (locale === 'nl') {
    return {
      ...selected,
      nextTitle:
        roleFamily === 'marketing' ? 'Marketing Strategy Lead'
        : roleFamily === 'finance' ? 'Strategic Finance Manager'
        : roleFamily === 'hr' ? 'People Operations Lead'
        : roleFamily === 'customer' ? 'Customer Strategy Lead'
        : roleFamily === 'operations' ? 'Program Operations Lead'
        : roleFamily === 'product' ? 'Strategic Operations Manager'
        : 'Sterkere versie van je huidige rol',
      proofAsset:
        roleFamily === 'marketing' ? 'AI-ondersteund campagneplanningssysteem'
        : roleFamily === 'finance' ? 'AI-ondersteund forecast- en variantie review pack'
        : roleFamily === 'hr' ? 'AI-ondersteunde manager- en policyworkflow'
        : roleFamily === 'customer' ? 'AI-ondersteunde account health- en renewalworkflow'
        : roleFamily === 'operations' ? 'AI-ondersteund intake- en coördinatiesysteem'
        : roleFamily === 'product' ? 'AI-ondersteunde strategie- en prioriteringsbrief'
        : 'Interne AI-leverage case',
    };
  }
  if (locale === 'de') {
    return {
      ...selected,
      nextTitle:
        roleFamily === 'marketing' ? 'Marketing Strategy Lead'
        : roleFamily === 'finance' ? 'Strategic Finance Manager'
        : roleFamily === 'hr' ? 'People Operations Lead'
        : roleFamily === 'customer' ? 'Customer Strategy Lead'
        : roleFamily === 'operations' ? 'Program Operations Lead'
        : roleFamily === 'product' ? 'Strategic Operations Manager'
        : 'Stärkere Version deiner aktuellen Rolle',
      proofAsset:
        roleFamily === 'marketing' ? 'KI-gestütztes Kampagnenplanungs-System'
        : roleFamily === 'finance' ? 'KI-gestütztes Forecast- und Varianz-Review-Pack'
        : roleFamily === 'hr' ? 'KI-gestützter Manager- und Policy-Workflow'
        : roleFamily === 'customer' ? 'KI-gestützter Account-Health- und Renewal-Workflow'
        : roleFamily === 'operations' ? 'KI-gestütztes Intake- und Koordinationssystem'
        : roleFamily === 'product' ? 'KI-gestütztes Strategie- und Priorisierungs-Brief'
        : 'Interner KI-Leverage-Case',
    };
  }
  return selected;
}

function parseSalaryNumbers(value) {
  const matches = String(value || '').match(/\$?\d[\d,]*/g) || [];
  return matches
    .map((item) => Number(String(item).replace(/[^0-9]/g, '')))
    .filter((item) => Number.isFinite(item) && item > 0);
}

function formatCurrency(value) {
  if (!Number.isFinite(value) || value <= 0) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function estimateLearningCost(bestPivot) {
  const criticalCount = normalizeArray(bestPivot?.skill_gaps).filter((item) => item?.gap_priority === 'critical').length;
  const mediumCount = normalizeArray(bestPivot?.skill_gaps).filter((item) => item?.gap_priority === 'medium').length;
  const difficultyBase = bestPivot?.difficulty === 'High' ? 1800 : bestPivot?.difficulty === 'Medium' ? 950 : 450;
  return difficultyBase + (criticalCount * 250) + (mediumCount * 100);
}

function estimatePaybackMonths(bestPivot, learningCost) {
  const salaryValues = parseSalaryNumbers(bestPivot?.salary_delta);
  const annualUpside = salaryValues.length >= 2
    ? Math.max(salaryValues[0], salaryValues[1])
    : salaryValues[0] || 0;

  if (!annualUpside || /flat|similar|unclear|lateral/i.test(String(bestPivot?.salary_delta || ''))) {
    return null;
  }

  const monthlyUpside = annualUpside / 12;
  if (!monthlyUpside) return null;

  return clamp(Math.ceil(learningCost / monthlyUpside), 1, 36);
}

function buildDecisionSignal(summary, bestPivot) {
  const score = Number(summary?.overall_score || 0);
  const matchScore = Number(bestPivot?.match_score || 0);

  if (score >= 70) {
    return {
      recommendation_type: 'active-pivot',
      headline: 'Start active transition now',
      urgency: 'High urgency',
      rationale: 'The current role is losing value fast enough that waiting for perfect clarity is riskier than beginning the move.',
      confidence_label: matchScore >= 78 ? 'High confidence' : 'Moderate confidence',
      confidence_reason: matchScore >= 78
        ? 'Your background already maps cleanly into the best-fit path, so the biggest unlock is visible proof, not reinvention.'
        : 'The direction is still strong, but the transition depends on building clearer proof and reducing a few skill gaps quickly.',
    };
  }

  if (score >= 40) {
    return {
      recommendation_type: 'hybrid-transition',
      headline: 'Prepare to pivot in the next 3-6 months',
      urgency: 'Build while you still have leverage',
      rationale: 'You still have room to use the current role as a platform, but the market is shifting enough that a passive wait-and-see approach will cost momentum.',
      confidence_label: matchScore >= 75 ? 'High confidence' : 'Moderate confidence',
      confidence_reason: matchScore >= 75
        ? 'The target path is believable now, which means you can transition deliberately instead of reactively.'
        : 'The strategy is sound, but you should treat the next 30 days as a validation sprint before committing harder.',
    };
  }

  return {
    recommendation_type: 'stay-and-redesign',
    headline: 'Stay, but redesign the role around stronger leverage',
    urgency: 'Low immediate urgency',
    rationale: 'The role is not under immediate collapse, so the highest-value move is to strengthen the parts of the job that become more important with AI.',
    confidence_label: 'Moderate confidence',
    confidence_reason: 'The current role still has room to compound, but the next gains will come from repositioning the work, not protecting the old task mix.',
  };
}

function buildCareerRoi(summary, bestPivot) {
  const learningCost = estimateLearningCost(bestPivot);
  const paybackMonths = estimatePaybackMonths(bestPivot, learningCost);
  const salaryRangeValues = parseSalaryNumbers(bestPivot?.salary_range);
  const midpointSalary = salaryRangeValues.length >= 2
    ? Math.round((salaryRangeValues[0] + salaryRangeValues[1]) / 2)
    : salaryRangeValues[0] || null;

  return {
    salary_range: bestPivot?.salary_range || '',
    salary_delta: bestPivot?.salary_delta || '',
    transition_time: bestPivot?.transition_time || '',
    learning_cost_estimate: formatCurrency(learningCost),
    payback_period: paybackMonths ? `${paybackMonths} month${paybackMonths === 1 ? '' : 's'}` : 'Longer / depends on role change',
    roi_read: summary?.overall_score >= 70
      ? 'The economic case for moving is strong because the downside of staying exposed is rising.'
      : summary?.overall_score >= 40
        ? 'This is usually worth doing as a staged transition: build proof now, then convert once the signal is strong.'
        : 'Treat this as a leverage upgrade more than an escape plan; the value comes from future-proofing while the current role is still viable.',
    midpoint_salary: midpointSalary ? formatCurrency(midpointSalary) : '',
  };
}

function buildFirst30Days(profile, bestPivot, roadmap, nextMove) {
  const firstThreeWeeks = normalizeArray(roadmap?.weeks).slice(0, 3);
  const topSkill = normalizeArray(bestPivot?.skill_gaps)[0];
  const secondSkill = normalizeArray(bestPivot?.skill_gaps)[1];
  const primaryTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'your highest-value task';

  return {
    next_7_days: [
      nextMove?.explanation || `Run one AI-assisted redesign on ${primaryTask} and capture the before/after difference.`,
      firstThreeWeeks[0]?.actions?.[0] || `Review live job descriptions for ${bestPivot?.title || 'the target role'} and write down repeated requirements.`,
      `Choose ${topSkill?.skill_name || 'one visible skill gap'} as the first skill to close and ignore secondary learning until that is underway.`,
    ].filter(Boolean),
    next_30_days: [
      firstThreeWeeks[1]?.actions?.[0] || 'Turn past work into 3 proof stories using a problem -> action -> outcome format.',
      firstThreeWeeks[2]?.actions?.[0] || `Build a simple proof asset that demonstrates ${topSkill?.skill_name || 'the target skill'} in a business context.`,
      `Get feedback from 2 people close to ${bestPivot?.title || 'the target path'} so you can refine the story before investing more time.`,
    ].filter(Boolean),
    avoid: [
      'Do not start with a broad learning binge before choosing a target path.',
      'Do not collect certificates without producing one visible proof asset.',
      secondSkill?.skill_name
        ? `Do not split focus too early across both ${topSkill?.skill_name || 'your top skill'} and ${secondSkill.skill_name}; sequence them.`
        : 'Do not try to fix every skill gap at once.',
    ].filter(Boolean),
    proof_asset: {
      title: `${bestPivot?.title || 'Pivot'} proof asset`,
      description: topSkill?.skill_name
        ? `Create one artifact that shows ${topSkill.skill_name} applied to a real business problem connected to your background.`
        : 'Create one artifact that makes your transition story concrete and employer-readable.',
      why_it_matters: 'This is what turns learning into employability. Hiring confidence rises faster when the evidence is visible.',
    },
  };
}

function buildStayAndAdvance(profile, summary, bestPivot, locale = 'en') {
  const jobTitle = profile?.job_title || profile?.jobTitle || 'your role';
  const industry = profile?.industry || 'your industry';
  const roleFamily = inferRoleFamily([jobTitle, industry, ...(profile?.tasks || [])].join(' '));
  const blueprint = buildStayRoleBlueprint(roleFamily, locale);
  const primaryTasks = Array.isArray(profile?.primary_tasks) && profile.primary_tasks.length
    ? profile.primary_tasks
    : Array.isArray(profile?.tasks)
      ? profile.tasks.slice(0, 3)
      : [];
  const anchorTask = primaryTasks[0] || 'your highest-visibility work';
  const secondaryTask = primaryTasks[1] || 'stakeholder communication';
  const tertiaryTask = primaryTasks[2] || 'decision support';
  const urgency = summary?.overall_score >= 70 ? 'Move quickly' : summary?.overall_score >= 45 ? 'Start now' : 'Use this as an advantage';

  const localizedHeadline = locale === 'nl'
    ? 'Als je wilt blijven, gebruik AI dan om sneller richting een sterkere rol te bewegen.'
    : locale === 'de'
      ? 'Wenn du bleiben willst, nutze KI, um schneller in eine stärkere Version deiner Rolle zu wachsen.'
      : 'If you want to stay, use AI to move faster toward a stronger version of your role.';

  const localizedRecommendation = locale === 'nl'
    ? 'Blijf in je vakgebied, maar verschuif van uitvoer naar AI-gestuurde oordeelsvorming, workflowontwerp en zichtbare strategische leverage.'
    : locale === 'de'
      ? 'Bleib im Berufsfeld, aber verschiebe dich von reiner Ausführung hin zu KI-gestütztem Urteilsvermögen, Workflow-Design und sichtbarer strategischer Hebelwirkung.'
      : 'Stay in the same career lane, but shift from raw execution into AI-directed judgment, workflow design, and visible strategic leverage.';

  const localizedRationale = locale === 'nl'
    ? `${jobTitle} hoeft niet per se een exit-signaal te zijn. De sterkste interne stap is vaak degene waarbij je AI gebruikt om ${anchorTask.toLowerCase()} sneller, scherper en beter koppelbaar aan bedrijfsbeslissingen te maken.`
    : locale === 'de'
      ? `${jobTitle} ist nicht automatisch ein Exit-Signal. Der stärkste interne Schritt ist oft, KI zu nutzen, um ${anchorTask.toLowerCase()} schneller, schärfer und enger an Geschäftsentscheidungen zu koppeln.`
      : `${jobTitle} is not automatically a leave signal. The strongest internal move is often to use AI to make ${anchorTask.toLowerCase()} faster, sharper, and more tightly connected to business decisions.`;

  const localizedLeverageOps = [
    {
      title: blueprint.opportunities?.[0] || (locale === 'nl' ? 'Maak repetitieve output lichter' : locale === 'de' ? 'Mache repetitive Outputs leichter' : 'Make repetitive output lighter'),
      current_work: anchorTask,
      ai_shift: locale === 'nl'
        ? `Gebruik AI om eerste versies, samenvattingen of structuur voor ${anchorTask.toLowerCase()} te produceren, zodat jij de kwaliteitscontrole en de uiteindelijke keuze houdt.`
        : locale === 'de'
          ? `Nutze KI, um erste Entwürfe, Zusammenfassungen oder Strukturen für ${anchorTask.toLowerCase()} zu erzeugen, während du Qualitätskontrolle und endgültige Entscheidungen behältst.`
          : `Use AI to draft first versions, summaries, or structure for ${anchorTask.toLowerCase()}, while you keep the quality bar and final judgment.`,
      advantage_if_you_lead: locale === 'nl'
        ? 'Leidinggevenden zien je dan niet als iemand die dezelfde output maakt, maar als iemand die throughput herontwerpt.'
        : locale === 'de'
          ? 'So wirst du nicht als jemand gesehen, der nur dieselbe Arbeit macht, sondern als jemand, der den Durchsatz neu gestaltet.'
          : 'That makes you look less like someone doing the same work and more like someone redesigning throughput.',
    },
    {
      title: blueprint.opportunities?.[1] || (locale === 'nl' ? 'Verplaats jezelf richting interpretatie' : locale === 'de' ? 'Verschiebe dich Richtung Interpretation' : 'Move yourself toward interpretation'),
      current_work: secondaryTask,
      ai_shift: locale === 'nl'
        ? `Laat AI helpen met voorbereiding rond ${secondaryTask.toLowerCase()}, maar positioneer jezelf als degene die nuance, stakeholdercontext en prioriteiten bewaakt.`
        : locale === 'de'
          ? `Lass KI bei der Vorbereitung rund um ${secondaryTask.toLowerCase()} helfen, positioniere dich aber als die Person, die Nuancen, Stakeholder-Kontext und Prioritäten steuert.`
          : `Let AI assist with preparation around ${secondaryTask.toLowerCase()}, but position yourself as the person who owns nuance, stakeholder context, and prioritization.`,
      advantage_if_you_lead: locale === 'nl'
        ? 'Dat duwt je rol omhoog van uitvoering naar oordeel en advies.'
        : locale === 'de'
          ? 'So verschiebt sich deine Rolle von Ausführung hin zu Urteilsvermögen und Beratung.'
          : 'That pushes your role upward from execution into judgment and recommendation.',
    },
    {
      title: blueprint.opportunities?.[2] || (locale === 'nl' ? 'Word de AI-adoptielaag in je team' : locale === 'de' ? 'Werde die KI-Adoptionsschicht in deinem Team' : 'Become the AI adoption layer for your team'),
      current_work: tertiaryTask,
      ai_shift: locale === 'nl'
        ? `Gebruik ${tertiaryTask.toLowerCase()} als ingang om één AI-pilot, reviewproces of teamworkflow zichtbaar te verbeteren.`
        : locale === 'de'
          ? `Nutze ${tertiaryTask.toLowerCase()} als Einstieg, um einen KI-Piloten, Review-Prozess oder Team-Workflow sichtbar zu verbessern.`
          : `Use ${tertiaryTask.toLowerCase()} as the entry point to improve one AI pilot, review process, or team workflow in a visible way.`,
      advantage_if_you_lead: locale === 'nl'
        ? 'Zo word je degene die verandering veiliger en bruikbaarder maakt, niet degene die door verandering wordt ingehaald.'
        : locale === 'de'
          ? 'So wirst du die Person, die Veränderung sicherer und nützlicher macht, statt von ihr überholt zu werden.'
          : 'That makes you the person who makes change safer and more useful, instead of the person change happens to.',
    },
  ];

  return {
    headline: localizedHeadline,
    recommendation: localizedRecommendation,
    rationale: localizedRationale,
    urgency_label: urgency,
    leverage_opportunities: localizedLeverageOps,
    promotion_path: {
      next_title: blueprint.nextTitle || (locale === 'nl' ? 'Sterkere variant van je huidige rol' : locale === 'de' ? 'Stärkere Version deiner aktuellen Rolle' : 'Stronger version of your current role'),
      why_it_opens: locale === 'nl'
        ? `De volgende promotiestap in ${industry} gaat waarschijnlijk naar mensen die AI gebruiken om snelheid, besliskwaliteit en zichtbare leverage te verhogen, niet alleen output te verhogen.`
        : locale === 'de'
          ? `Der nächste Karriereschritt in ${industry} geht wahrscheinlich an Menschen, die KI nutzen, um Geschwindigkeit, Entscheidungsqualität und sichtbare Hebelwirkung zu erhöhen, nicht nur Output.`
          : `The next promotion step in ${industry} is likely to go to people who use AI to improve speed, decision quality, and visible leverage, not just produce more output.`,
      timeline: summary?.overall_score >= 70 ? '6-12 months' : '3-9 months',
      signals_to_build: [
        locale === 'nl' ? 'Laat een AI-gestuurde workflowverbetering zien met meetbaar effect' : locale === 'de' ? 'Zeige eine KI-gestützte Workflow-Verbesserung mit messbarer Wirkung' : 'Show one AI-assisted workflow improvement with measurable impact',
        locale === 'nl' ? 'Word de persoon die output van tools beoordeelt en standaardiseert' : locale === 'de' ? 'Werde die Person, die Tool-Output bewertet und standardisiert' : 'Become the person who evaluates and standardizes tool output',
        locale === 'nl' ? 'Vertaal AI-gebruik naar leiderschapstaal: tijd, kwaliteit, risico, throughput' : locale === 'de' ? 'Übersetze KI-Nutzung in Führungssprache: Zeit, Qualität, Risiko, Durchsatz' : 'Translate AI usage into leadership language: time, quality, risk, throughput',
      ],
    },
    work_redesign: {
      automate: [anchorTask],
      augment: [secondaryTask],
      protect: [
        locale === 'nl' ? 'Stakeholderoordeel en prioritering' : locale === 'de' ? 'Stakeholder-Urteil und Priorisierung' : 'Stakeholder judgment and prioritization',
        locale === 'nl' ? 'Kwaliteitscontrole bij output met hoge impact' : locale === 'de' ? 'Qualitätskontrolle bei hochwirksamen Ergebnissen' : 'Quality control on high-stakes output',
      ],
      lead: [
        locale === 'nl' ? 'AI-pilots of teamadoptie' : locale === 'de' ? 'KI-Piloten oder Teamadoption' : 'AI pilots or team adoption',
        locale === 'nl' ? 'Nieuwe workflows of reviewstandaarden' : locale === 'de' ? 'Neue Workflows oder Review-Standards' : 'New workflows or review standards',
      ],
    },
    thirty_day_plan: {
      this_week: [
        locale === 'nl' ? `Kies één taak, te beginnen met ${anchorTask.toLowerCase()}, en herbouw die met AI.` : locale === 'de' ? `Wähle eine Aufgabe, beginnend mit ${anchorTask.toLowerCase()}, und baue sie mit KI neu auf.` : `Choose one task, starting with ${anchorTask.toLowerCase()}, and rebuild it with AI.`,
        locale === 'nl' ? 'Meet tijdswinst, kwaliteitsrisico en waar menselijk oordeel nog nodig was.' : locale === 'de' ? 'Miss Zeitgewinn, Qualitätsrisiko und wo menschliches Urteil noch nötig war.' : 'Measure time saved, quality risk, and where human judgment still had to step in.',
      ],
      this_month: [
        locale === 'nl' ? 'Presenteer één kleine AI-werkflowverbetering aan je manager of team.' : locale === 'de' ? 'Präsentiere deinem Manager oder Team eine kleine KI-Workflow-Verbesserung.' : 'Present one small AI workflow improvement to your manager or team.',
        locale === 'nl' ? 'Documenteer voor-na impact zodat het als promotiesignaal werkt.' : locale === 'de' ? 'Dokumentiere den Vorher-Nachher-Effekt, damit er als Karrieresignal wirkt.' : 'Document before/after impact so it becomes promotion evidence.',
      ],
      metric_to_move: locale === 'nl'
        ? blueprint.metric || 'Kies één metric: doorlooptijd, revisies, foutpercentage of briefingkwaliteit.'
        : locale === 'de'
          ? blueprint.metric || 'Wähle eine Kennzahl: Durchlaufzeit, Revisionen, Fehlerquote oder Briefing-Qualität.'
          : blueprint.metric || 'Choose one metric to move: turnaround time, revisions, error rate, or briefing quality.',
      leadership_narrative: locale === 'nl'
        ? blueprint.narrative || `Positioneer dit als: "Ik gebruik AI niet alleen om sneller te werken, maar om ${jobTitle.toLowerCase()} betrouwbaarder en strategischer te maken."`
        : locale === 'de'
          ? blueprint.narrative || `Positioniere es so: "Ich nutze KI nicht nur, um schneller zu arbeiten, sondern um ${jobTitle.toLowerCase()} verlässlicher und strategischer zu machen."`
          : blueprint.narrative || `Position this as: "I am not just using AI to work faster. I am using it to make ${jobTitle.toLowerCase()} more reliable and more strategic."`,
      proof_asset: {
        title: blueprint.proofAsset || (locale === 'nl' ? 'Interne AI-leverage case' : locale === 'de' ? 'Interner KI-Leverage-Case' : 'Internal AI leverage case'),
        description: locale === 'nl'
          ? 'Een korte voor-na casus die laat zien hoe je één taak met AI hebt herontworpen en wat dat deed voor tijd, kwaliteit of besluitvorming.'
          : locale === 'de'
            ? 'Ein kurzer Vorher-Nachher-Case, der zeigt, wie du eine Aufgabe mit KI neu gestaltet hast und was das für Zeit, Qualität oder Entscheidungen gebracht hat.'
            : 'A short before/after case showing how you redesigned one task with AI and what that changed in time, quality, or decision support.',
        why_it_matters: locale === 'nl'
          ? 'Dit geeft leiders bewijs dat jij niet alleen AI gebruikt, maar ook teamleverage creëert.'
          : locale === 'de'
            ? 'Das gibt Führungskräften Beweis, dass du KI nicht nur nutzt, sondern Team-Leverage schaffst.'
            : 'This gives leadership evidence that you are not just using AI, but creating leverage for the team.',
      },
    },
  };
}

function buildStayAdvanceSkillGaps(profile, stayAndAdvance, basePivot, locale = 'en') {
  const sourceGaps = normalizeArray(basePivot?.skill_gaps);
  const sourcePrimary = sourceGaps[0] || {};
  const sourceSecondary = sourceGaps[1] || sourcePrimary;
  const sourceTertiary = sourceGaps[2] || sourceSecondary;
  const primaryTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'your core workflow';

  const localized = {
    workflow: locale === 'nl'
      ? {
          name: 'AI-workflowontwerp',
          current: `Je kent ${primaryTask.toLowerCase()} al goed vanuit de praktijk.`,
          required: 'Je kunt een duidelijke AI-ondersteunde workflow ontwerpen, reviewen en documenteren.',
          why: 'Interne promoties gaan steeds vaker naar mensen die werk slimmer structureren, niet alleen harder uitvoeren.',
          evidence: `Je ziet al waar ${primaryTask.toLowerCase()} vertraagt, waar revisies ontstaan en waar context verloren gaat.`,
          close: 'Bouw een concrete AI-ondersteunde workflow voor een terugkerende taak en leg de voor-na impact vast.',
        }
      : locale === 'de'
        ? {
            name: 'KI-Workflow-Design',
            current: `Du kennst ${primaryTask.toLowerCase()} bereits aus der Praxis.`,
            required: 'Du kannst einen klaren KI-unterstützten Workflow entwerfen, prüfen und dokumentieren.',
            why: 'Interne Aufstiege gehen zunehmend an Menschen, die Arbeit intelligenter strukturieren, statt nur mehr Output zu liefern.',
            evidence: `Du siehst bereits, wo ${primaryTask.toLowerCase()} stockt, wo Revisionen entstehen und wo Kontext verloren geht.`,
            close: 'Baue einen konkreten KI-unterstützten Workflow für eine wiederkehrende Aufgabe und dokumentiere die Vorher-Nachher-Wirkung.',
          }
        : {
            name: 'AI workflow design',
            current: `You already know how ${primaryTask.toLowerCase()} works in practice.`,
            required: 'You can design, review, and document a clear AI-assisted workflow for high-value recurring work.',
            why: 'Internal advancement increasingly goes to people who can redesign how work gets done, not just produce more of it.',
            evidence: `You already see where ${primaryTask.toLowerCase()} slows down, where revisions pile up, and where context gets lost.`,
            close: 'Build one concrete AI-assisted workflow for a recurring task and document the before/after impact.',
          },
    communication: locale === 'nl'
      ? {
          name: 'AI-ondersteunde besluitcommunicatie',
          current: 'Je vertaalt al werk naar updates, afstemming en besluiten voor anderen.',
          required: 'Je kunt AI-output vertalen naar heldere beslisondersteuning die managers vertrouwen.',
          why: 'Mensen die AI goed gebruiken maar de context slecht uitleggen, winnen geen invloed. Interpretatie blijft de hefboom.',
          evidence: 'Je hebt al stakeholdercontext, organisatietaal en gevoel voor prioriteiten.',
          close: 'Gebruik AI voor de eerste analyse of conceptstructuur, maar lever zelf de uiteindelijke samenvatting, aanbeveling en trade-off.',
        }
      : locale === 'de'
        ? {
            name: 'KI-gestützte Entscheidungs-Kommunikation',
            current: 'Du übersetzt Arbeit bereits in Updates, Abstimmung und Entscheidungen für andere.',
            required: 'Du kannst KI-Output in klare Entscheidungsunterstützung übersetzen, der Führungskräfte vertrauen.',
            why: 'Wer KI nutzt, aber den Kontext schlecht erklärt, gewinnt keinen Einfluss. Interpretation bleibt der Hebel.',
            evidence: 'Du hast bereits Stakeholder-Kontext, Organisationssprache und Prioritätsgefühl.',
            close: 'Nutze KI für erste Analyse oder Struktur, liefere aber selbst die finale Zusammenfassung, Empfehlung und Abwägung.',
          }
        : {
            name: 'AI-assisted decision communication',
            current: 'You already translate work into updates, alignment, and decisions for other people.',
            required: 'You can turn AI output into clear decision support that leaders trust.',
            why: 'People who use AI well but explain it poorly do not gain influence. Interpretation remains the leverage layer.',
            evidence: 'You already have stakeholder context, organizational language, and a feel for priorities.',
            close: 'Use AI for first-pass analysis or structure, but personally deliver the final summary, recommendation, and trade-off.',
          },
    leadership: locale === 'nl'
      ? {
          name: 'AI-adoptie en change leadership',
          current: 'Je bent al dichtbij het dagelijkse werk van het team en ziet wat wel of niet landt.',
          required: 'Je kunt één AI-pilot, standaard of reviewproces leiden zodat anderen het veilig overnemen.',
          why: 'Dat is het verschil tussen iemand die efficiënter werkt en iemand die als promotiekandidaat wordt gezien.',
          evidence: 'Je kent al de risico’s, vragen en weerstand die bij nieuwe tools of werkwijzen ontstaan.',
          close: 'Kies één teamproces, maak een kleine AI-pilot veilig en deelbaar, en koppel het effect aan tijd, kwaliteit of risico.',
        }
      : locale === 'de'
        ? {
            name: 'KI-Adoption und Veränderungsführung',
            current: 'Du bist bereits nah an der täglichen Arbeit des Teams und siehst, was funktioniert und was nicht.',
            required: 'Du kannst einen KI-Piloten, Standard oder Review-Prozess so führen, dass andere ihn sicher übernehmen.',
            why: 'Das ist der Unterschied zwischen jemandem, der nur effizienter arbeitet, und jemandem, der als Beförderungskandidat gilt.',
            evidence: 'Du kennst bereits die Risiken, Fragen und Widerstände, die bei neuen Tools oder Arbeitsweisen auftauchen.',
            close: 'Wähle einen Teamprozess, mache einen kleinen KI-Piloten sicher und teilbar und verbinde die Wirkung mit Zeit, Qualität oder Risiko.',
          }
        : {
            name: 'AI adoption leadership',
            current: 'You are already close enough to the team’s real work to see what will and will not stick.',
            required: 'You can lead one AI pilot, standard, or review process in a way other people can safely adopt.',
            why: 'That is the difference between someone who simply works faster and someone who looks promotable.',
            evidence: 'You already understand the risks, objections, and operational friction around new tools or workflows.',
            close: 'Pick one team process, make a small AI pilot safe and reusable, and tie the result to time, quality, or risk.',
          },
  };

  return [
    buildSkillGap({
      skillName: localized.workflow.name,
      category: 'workflow',
      currentStrength: localized.workflow.current,
      requiredLevel: localized.workflow.required,
      gapPriority: 'critical',
      whyItMatters: localized.workflow.why,
      evidence: localized.workflow.evidence,
      howToClose: localized.workflow.close,
      resourceTitle: sourcePrimary.resource_title || sourcePrimary.skill_name || 'Recommended course',
      resourceUrl: sourcePrimary.resource_url || 'https://www.coursera.org/',
    }),
    buildSkillGap({
      skillName: localized.communication.name,
      category: 'communication',
      currentStrength: localized.communication.current,
      requiredLevel: localized.communication.required,
      gapPriority: 'medium',
      whyItMatters: localized.communication.why,
      evidence: localized.communication.evidence,
      howToClose: localized.communication.close,
      resourceTitle: sourceSecondary.resource_title || sourceSecondary.skill_name || sourcePrimary.resource_title || 'Recommended course',
      resourceUrl: sourceSecondary.resource_url || sourcePrimary.resource_url || 'https://www.coursera.org/',
    }),
    buildSkillGap({
      skillName: localized.leadership.name,
      category: 'leadership',
      currentStrength: localized.leadership.current,
      requiredLevel: localized.leadership.required,
      gapPriority: 'medium',
      whyItMatters: localized.leadership.why,
      evidence: localized.leadership.evidence,
      howToClose: localized.leadership.close,
      resourceTitle: sourceTertiary.resource_title || sourceSecondary.resource_title || sourcePrimary.resource_title || 'Recommended course',
      resourceUrl: sourceTertiary.resource_url || sourceSecondary.resource_url || sourcePrimary.resource_url || 'https://www.coursera.org/',
    }),
  ];
}

function buildStayAdvanceWeeks({ profile, stayAndAdvance, summary, locale = 'en' }) {
  const jobTitle = profile?.job_title || 'your role';
  const anchorTask = normalizeArray(profile?.primary_tasks)[0] || normalizeArray(profile?.tasks)[0] || 'one high-visibility task';
  const proofAssetTitle = stayAndAdvance?.thirty_day_plan?.proof_asset?.title || (locale === 'nl' ? 'Interne AI-case' : locale === 'de' ? 'Interner KI-Case' : 'Internal AI case');
  const nextTitle = stayAndAdvance?.promotion_path?.next_title || (locale === 'nl' ? 'Sterkere interne rol' : locale === 'de' ? 'Stärkere interne Rolle' : 'Stronger internal role');
  const leadLabel = locale === 'nl' ? 'Leid de adoptie zichtbaar' : locale === 'de' ? 'Adoption sichtbar führen' : 'Lead adoption visibly';

  return [
    buildWeek({
      weekNumber: 1,
      title: locale === 'nl' ? 'Kies de AI-werkflow die je wilt herontwerpen' : locale === 'de' ? 'Wähle den KI-Workflow, den du neu gestalten willst' : 'Choose the AI workflow to redesign',
      goal: locale === 'nl' ? `Kies één terugkerende taak rond ${anchorTask.toLowerCase()} die genoeg frictie heeft om een zichtbare AI-case op te bouwen.` : locale === 'de' ? `Wähle eine wiederkehrende Aufgabe rund um ${anchorTask.toLowerCase()}, die genug Reibung erzeugt, um einen sichtbaren KI-Case aufzubauen.` : `Choose one recurring workflow around ${anchorTask.toLowerCase()} with enough friction to build a visible AI case.`,
      why: locale === 'nl' ? 'Zonder scherp focusgebied blijft “meer AI gebruiken” vaag en niet promootbaar.' : locale === 'de' ? 'Ohne klaren Fokus bleibt „mehr KI nutzen“ vage und nicht beförderungsrelevant.' : 'Without a sharp focus area, “use more AI” stays vague and not promotion-worthy.',
      problem: locale === 'nl' ? 'Je hebt één duidelijke ingang nodig waar snelheid, kwaliteit of besluitvorming zichtbaar beter kunnen worden.' : locale === 'de' ? 'Du brauchst einen klaren Einstieg, bei dem Geschwindigkeit, Qualität oder Entscheidungsunterstützung sichtbar besser werden können.' : 'You need one clear entry point where speed, quality, or decision support can get visibly better.',
      actions: [
        locale === 'nl' ? `Map de huidige stappen voor ${anchorTask.toLowerCase()} en markeer waar vertraging of herwerk ontstaat.` : locale === 'de' ? `Mappe die aktuellen Schritte für ${anchorTask.toLowerCase()} und markiere, wo Verzögerungen oder Nacharbeit entstehen.` : `Map the current steps for ${anchorTask.toLowerCase()} and mark where delays or rework happen.`,
        locale === 'nl' ? 'Kies één metric om te verbeteren: doorlooptijd, revisies, foutpercentage of briefingkwaliteit.' : locale === 'de' ? 'Wähle eine Kennzahl: Durchlaufzeit, Revisionen, Fehlerquote oder Briefing-Qualität.' : 'Choose one metric to improve: turnaround time, revisions, error rate, or briefing quality.',
        locale === 'nl' ? 'Leg vast wie deze werkflow gebruikt of erop wacht.' : locale === 'de' ? 'Halte fest, wer diesen Workflow nutzt oder auf ihn wartet.' : 'Document who uses or waits on this workflow.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: locale === 'nl' ? 'Je hebt één gekozen workflow, één metric en één stakeholdergroep.' : locale === 'de' ? 'Du hast einen gewählten Workflow, eine Kennzahl und eine Stakeholder-Gruppe.' : 'You have one chosen workflow, one metric, and one stakeholder group.',
      proof: locale === 'nl' ? 'Een korte workflowmap en baseline-notitie.' : locale === 'de' ? 'Eine kurze Workflow-Map und Baseline-Notiz.' : 'A short workflow map and baseline note.',
      blockers: [locale === 'nl' ? 'Tegelijk meerdere workflows willen verbeteren.' : locale === 'de' ? 'Mehrere Workflows gleichzeitig verbessern wollen.' : 'Trying to improve multiple workflows at once.', locale === 'nl' ? 'Geen metric kiezen.' : locale === 'de' ? 'Keine Kennzahl wählen.' : 'Not choosing a metric.'],
      catchUp: locale === 'nl' ? 'Kies alsnog één workflow en één metric, ook als de analyse nog ruw is.' : locale === 'de' ? 'Wähle trotzdem einen Workflow und eine Kennzahl, auch wenn die Analyse noch grob ist.' : 'Still choose one workflow and one metric even if the analysis is rough.',
      encouragement: locale === 'nl' ? 'Een promotiewaardige AI-case begint klein en duidelijk.' : locale === 'de' ? 'Ein beförderungswürdiger KI-Case beginnt klein und klar.' : 'A promotion-worthy AI case starts small and clear.',
    }),
    buildWeek({
      weekNumber: 2,
      title: locale === 'nl' ? 'Ontwerp de nieuwe werkflow' : locale === 'de' ? 'Entwirf den neuen Workflow' : 'Design the new workflow',
      goal: locale === 'nl' ? 'Bepaal wat AI doet, wat jij reviewt en waar menselijk oordeel blijft.' : locale === 'de' ? 'Lege fest, was KI übernimmt, was du prüfst und wo menschliches Urteil bleibt.' : 'Define what AI handles, what you review, and where human judgment stays in the loop.',
      why: locale === 'nl' ? 'Leverage komt uit beter workflowontwerp, niet uit blind automatiseren.' : locale === 'de' ? 'Hebelwirkung entsteht aus besserem Workflow-Design, nicht aus blindem Automatisieren.' : 'Leverage comes from better workflow design, not blind automation.',
      problem: locale === 'nl' ? 'Je moet laten zien dat je snelheid verhoogt zonder kwaliteit of context te verliezen.' : locale === 'de' ? 'Du musst zeigen, dass du Geschwindigkeit erhöhst, ohne Qualität oder Kontext zu verlieren.' : 'You need to show that speed can increase without losing quality or context.',
      actions: [
        locale === 'nl' ? 'Maak een eerste AI-ondersteunde versie van de workflow.' : locale === 'de' ? 'Baue eine erste KI-unterstützte Version des Workflows.' : 'Build a first AI-assisted version of the workflow.',
        locale === 'nl' ? 'Definieer reviewpunten en kwaliteitsgrenzen.' : locale === 'de' ? 'Definiere Review-Punkte und Qualitätsgrenzen.' : 'Define review points and quality thresholds.',
        locale === 'nl' ? 'Schrijf op welke inputs het team moet leveren om de workflow betrouwbaar te maken.' : locale === 'de' ? 'Schreibe auf, welche Inputs das Team liefern muss, damit der Workflow zuverlässig wird.' : 'Write down the inputs the team must provide to make the workflow reliable.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: locale === 'nl' ? 'Er is een duidelijke AI-ondersteunde workflow met reviewstappen.' : locale === 'de' ? 'Es gibt einen klaren KI-unterstützten Workflow mit Review-Schritten.' : 'There is a clear AI-assisted workflow with explicit review steps.',
      proof: locale === 'nl' ? 'Een gedeelde workflowschets of SOP.' : locale === 'de' ? 'Eine geteilte Workflow-Skizze oder SOP.' : 'A shared workflow sketch or SOP.',
      blockers: [locale === 'nl' ? 'AI alles laten doen zonder checks.' : locale === 'de' ? 'KI alles ohne Kontrollen machen lassen.' : 'Letting AI do everything without checks.', locale === 'nl' ? 'Geen duidelijke inputstandaarden zetten.' : locale === 'de' ? 'Keine klaren Input-Standards setzen.' : 'Not setting clear input standards.'],
      catchUp: locale === 'nl' ? 'Documenteer ten minste de stappen, reviewmomenten en kwaliteitscriteria.' : locale === 'de' ? 'Dokumentiere zumindest Schritte, Review-Momente und Qualitätskriterien.' : 'At minimum, document the steps, review moments, and quality criteria.',
      encouragement: locale === 'nl' ? 'Dit is waar je verschuift van gebruiker naar ontwerper.' : locale === 'de' ? 'Hier verschiebst du dich vom Nutzer zum Gestalter.' : 'This is where you shift from user to designer.',
    }),
    buildWeek({
      weekNumber: 3,
      title: locale === 'nl' ? 'Bouw het eerste bewijs' : locale === 'de' ? 'Erzeuge den ersten Nachweis' : 'Build the first proof',
      goal: locale === 'nl' ? `Maak de eerste versie van ${proofAssetTitle.toLowerCase()} zodat leiders een concreet resultaat kunnen zien.` : locale === 'de' ? `Erstelle die erste Version des ${proofAssetTitle.toLowerCase()}, damit Führungskräfte ein konkretes Ergebnis sehen können.` : `Create the first version of the ${proofAssetTitle.toLowerCase()} so leadership can see a concrete result.`,
      why: locale === 'nl' ? 'Zonder bewijs blijft “ik gebruik AI slim” een claim zonder gewicht.' : locale === 'de' ? 'Ohne Beweis bleibt „ich nutze KI gut“ nur eine Behauptung.' : 'Without proof, “I use AI well” is just a claim.',
      problem: locale === 'nl' ? 'Je hebt een zichtbare output nodig die promotiewaarde signaleert.' : locale === 'de' ? 'Du brauchst ein sichtbares Ergebnis, das Beförderungsreife signalisiert.' : 'You need a visible output that signals promotable leverage.',
      actions: [
        locale === 'nl' ? 'Leg baseline en verbeterde output naast elkaar.' : locale === 'de' ? 'Stelle Baseline und verbesserte Ausgabe nebeneinander.' : 'Put baseline output next to the improved output.',
        locale === 'nl' ? 'Beschrijf het zakelijke effect in tijd, kwaliteit of besliskwaliteit.' : locale === 'de' ? 'Beschreibe die geschäftliche Wirkung in Zeit, Qualität oder Entscheidungsqualität.' : 'Describe the business effect in time, quality, or decision quality.',
        locale === 'nl' ? 'Laat één stakeholder de output reviewen.' : locale === 'de' ? 'Lass einen Stakeholder das Ergebnis prüfen.' : 'Have one stakeholder review the output.',
      ],
      timeCommitment: '3 hours',
      successSignal: locale === 'nl' ? 'Je hebt een eerste interne case die niet alleen efficiëntie, maar ook leverage toont.' : locale === 'de' ? 'Du hast einen ersten internen Case, der nicht nur Effizienz, sondern Hebelwirkung zeigt.' : 'You have a first internal case that shows more than efficiency.',
      proof: proofAssetTitle,
      blockers: [locale === 'nl' ? 'Alleen de tooldemo laten zien.' : locale === 'de' ? 'Nur die Tool-Demo zeigen.' : 'Showing only the tool demo.', locale === 'nl' ? 'Geen zakelijk effect benoemen.' : locale === 'de' ? 'Keine geschäftliche Wirkung benennen.' : 'Not naming the business effect.'],
      catchUp: locale === 'nl' ? 'Maak desnoods een ruwe voor-na case van één taak.' : locale === 'de' ? 'Erstelle notfalls einen groben Vorher-Nachher-Case für eine Aufgabe.' : 'Create a rough before/after case for one task if needed.',
      encouragement: locale === 'nl' ? 'Een ruwe case is beter dan nog een week abstract denken.' : locale === 'de' ? 'Ein roher Case ist besser als noch eine Woche abstraktes Denken.' : 'A rough case is better than another week of abstract thinking.',
    }),
    buildWeek({
      weekNumber: 4,
      title: locale === 'nl' ? 'Vertaal het naar leiderschapstaal' : locale === 'de' ? 'Übersetze es in Führungssprache' : 'Translate it into leadership language',
      goal: locale === 'nl' ? 'Maak van de AI-case een narratief dat als promotieleverage gelezen wordt.' : locale === 'de' ? 'Mache aus dem KI-Case ein Narrativ, das wie Beförderungs-Hebelwirkung gelesen wird.' : 'Turn the AI case into a narrative that reads like promotion leverage.',
      why: locale === 'nl' ? 'Promoties volgen zelden uit slim werk alleen; ze volgen uit zichtbaar waardevol werk.' : locale === 'de' ? 'Beförderungen folgen selten aus cleverer Arbeit allein; sie folgen aus sichtbar wertvoller Arbeit.' : 'Promotions rarely follow from smart work alone; they follow from visibly valuable work.',
      problem: locale === 'nl' ? 'Je moet het effect koppelen aan teamresultaat en leiderschapswaarde.' : locale === 'de' ? 'Du musst die Wirkung mit Teamergebnis und Führungswert verknüpfen.' : 'You need to connect the effect to team outcomes and leadership value.',
      actions: [
        locale === 'nl' ? 'Schrijf een korte update voor manager of teamlead.' : locale === 'de' ? 'Schreibe ein kurzes Update für Manager oder Teamlead.' : 'Write a short update for your manager or team lead.',
        locale === 'nl' ? 'Gebruik de leiderschapszin uit je rapport als basis.' : locale === 'de' ? 'Nutze den Führungssatz aus deinem Report als Ausgangspunkt.' : 'Use the leadership narrative from your report as a starting point.',
        locale === 'nl' ? 'Vraag expliciet om feedback op verdere toepassing.' : locale === 'de' ? 'Bitte explizit um Feedback zur weiteren Anwendung.' : 'Ask explicitly for feedback on where to apply it next.',
      ],
      timeCommitment: '2 hours',
      successSignal: locale === 'nl' ? 'Je hebt een verhaal dat klinkt als schaalbare impact, niet als toolenthousiasme.' : locale === 'de' ? 'Du hast ein Narrativ, das wie skalierbare Wirkung klingt, nicht wie Tool-Begeisterung.' : 'You have a story that sounds like scalable impact, not tool enthusiasm.',
      proof: locale === 'nl' ? 'Een gedeelde update, memo of deckslide.' : locale === 'de' ? 'Ein geteiltes Update, Memo oder eine Deck-Slide.' : 'A shared update, memo, or deck slide.',
      blockers: [locale === 'nl' ? 'Te veel praten over de tool.' : locale === 'de' ? 'Zu viel über das Tool sprechen.' : 'Talking too much about the tool.', leadLabel],
      catchUp: locale === 'nl' ? 'Maak minimaal een korte before-after samenvatting van drie zinnen.' : locale === 'de' ? 'Erstelle mindestens eine kurze Vorher-Nachher-Zusammenfassung in drei Sätzen.' : 'At minimum, write a three-sentence before/after summary.',
      encouragement: locale === 'nl' ? 'Wie je het verhaal vertelt, bepaalt vaak hoe hoog de leverage wordt gezien.' : locale === 'de' ? 'Wie du die Geschichte erzählst, bestimmt oft, wie hoch die Hebelwirkung wahrgenommen wird.' : 'How you tell the story often determines how much leverage other people see in it.',
    }),
    ...[5, 6, 7, 8, 9, 10, 11, 12].map((weekNumber) =>
      buildWeek({
        weekNumber,
        title:
          weekNumber === 5 ? (locale === 'nl' ? 'Herhaal met een tweede workflow' : locale === 'de' ? 'Wiederhole es mit einem zweiten Workflow' : 'Repeat with a second workflow')
          : weekNumber === 6 ? (locale === 'nl' ? 'Standaardiseer review en governance' : locale === 'de' ? 'Standardisiere Review und Governance' : 'Standardize review and governance')
          : weekNumber === 7 ? (locale === 'nl' ? 'Bouw teamadoptie' : locale === 'de' ? 'Baue Team-Adoption auf' : 'Build team adoption')
          : weekNumber === 8 ? (locale === 'nl' ? 'Laat een metric echt bewegen' : locale === 'de' ? 'Bewege eine Kennzahl sichtbar' : 'Move the metric visibly')
          : weekNumber === 9 ? (locale === 'nl' ? 'Maak de case promotieready' : locale === 'de' ? 'Mache den Case beförderungsreif' : 'Make the case promotion-ready')
          : weekNumber === 10 ? (locale === 'nl' ? 'Verbind het aan een grotere scope' : locale === 'de' ? 'Verbinde es mit größerem Scope' : 'Connect it to broader scope')
          : weekNumber === 11 ? (locale === 'nl' ? 'Vraag om de volgende verantwoordelijkheid' : locale === 'de' ? 'Bitte um die nächste Verantwortung' : 'Ask for the next responsibility')
          : (locale === 'nl' ? 'Consolideer je promotiepad' : locale === 'de' ? 'Konsolidiere deinen Aufstiegspfad' : 'Consolidate the promotion path'),
        goal: locale === 'nl' ? `Blijf het patroon herhalen totdat ${nextTitle.toLowerCase()} geloofwaardig aan je naam hangt.` : locale === 'de' ? `Wiederhole das Muster, bis ${nextTitle.toLowerCase()} glaubwürdig mit deinem Namen verbunden ist.` : `Keep repeating the pattern until ${nextTitle.toLowerCase()} starts to feel attached to your name.`,
        why: locale === 'nl' ? 'Eén AI-win is interessant. Een reeks zichtbare wins verandert je interne positie.' : locale === 'de' ? 'Ein KI-Erfolg ist interessant. Eine Reihe sichtbarer Erfolge verändert deine interne Position.' : 'One AI win is interesting. A series of visible wins changes your internal position.',
        problem: locale === 'nl' ? 'Je hebt herhaalbaarheid nodig zodat leiderschap dit leest als nieuwe scope, niet als eenmalige slimheid.' : locale === 'de' ? 'Du brauchst Wiederholbarkeit, damit Führung dies als neuen Scope liest und nicht als einmalige Cleverness.' : 'You need repeatability so leadership reads this as new scope, not a one-off smart move.',
        actions: [
          locale === 'nl' ? 'Pas hetzelfde patroon toe op een tweede of grotere workflow.' : locale === 'de' ? 'Wende dasselbe Muster auf einen zweiten oder größeren Workflow an.' : 'Apply the same pattern to a second or larger workflow.',
          locale === 'nl' ? 'Documenteer impact en deel wat anderen kunnen herhalen.' : locale === 'de' ? 'Dokumentiere die Wirkung und teile, was andere wiederholen können.' : 'Document impact and share what others can repeat.',
          locale === 'nl' ? 'Koppel de case aan extra verantwoordelijkheid of scope.' : locale === 'de' ? 'Verknüpfe den Case mit zusätzlicher Verantwortung oder größerem Scope.' : 'Connect the case to increased responsibility or broader scope.',
        ],
        timeCommitment: '2–4 hours',
        successSignal: locale === 'nl' ? 'Je hebt meerdere voorbeelden van AI-leverage die als promotiewaarde gelezen worden.' : locale === 'de' ? 'Du hast mehrere Beispiele für KI-Hebelwirkung, die wie Beförderungswert gelesen werden.' : 'You have multiple examples of AI leverage that read like promotion value.',
        proof: locale === 'nl' ? 'Een reeks korte interne cases of updates.' : locale === 'de' ? 'Eine Reihe kurzer interner Cases oder Updates.' : 'A set of short internal cases or updates.',
        blockers: [locale === 'nl' ? 'Na één succes stoppen.' : locale === 'de' ? 'Nach einem Erfolg aufhören.' : 'Stopping after one success.', locale === 'nl' ? 'De impact niet zichtbaar maken voor anderen.' : locale === 'de' ? 'Die Wirkung nicht sichtbar machen.' : 'Not making the impact visible to others.'],
        catchUp: locale === 'nl' ? 'Herhaal het patroon op kleine schaal in plaats van te wachten op een perfect project.' : locale === 'de' ? 'Wiederhole das Muster im Kleinen, statt auf das perfekte Projekt zu warten.' : 'Repeat the pattern on a smaller scope instead of waiting for the perfect project.',
        encouragement: locale === 'nl' ? 'Carrièresprongen binnen hetzelfde vakgebied komen vaak uit zichtbaar herhaalde leverage, niet uit één groot moment.' : locale === 'de' ? 'Karrieresprünge im selben Feld entstehen oft aus sichtbar wiederholter Hebelwirkung, nicht aus einem großen Moment.' : 'Career acceleration inside the same lane usually comes from visibly repeated leverage, not one big moment.',
      })
    ),
  ];
}

function buildStayAdvancePath(profile, summary, stayAndAdvance, basePivot, locale = 'en') {
  const skillGaps = buildStayAdvanceSkillGaps(profile, stayAndAdvance, basePivot, locale);
  const roadmapWeeks = buildStayAdvanceWeeks({ profile, stayAndAdvance, summary, locale });

  return buildPivot({
    id: 'stay-and-advance',
    title: stayAndAdvance?.promotion_path?.next_title || stayAndAdvance?.headline || 'Stay and advance with AI',
    fitSummary: stayAndAdvance?.recommendation || stayAndAdvance?.rationale || '',
    outcome: stayAndAdvance?.rationale || stayAndAdvance?.recommendation || '',
    decisionFrame: 'stay and advance',
    whoThisIsFor: stayAndAdvance?.rationale || stayAndAdvance?.recommendation || '',
    tradeoffs: [
      locale === 'nl' ? 'Je moet zichtbaar AI-leverage opbouwen binnen je huidige context.' : locale === 'de' ? 'Du musst sichtbare KI-Hebelwirkung im aktuellen Kontext aufbauen.' : 'You need to build visible AI leverage inside your current context.',
      locale === 'nl' ? 'Zonder bewijs blijft deze route voelen als meer van hetzelfde werk.' : locale === 'de' ? 'Ohne Nachweise fühlt sich dieser Weg wie mehr vom Gleichen an.' : 'Without proof, this path can still look like “more of the same” work.',
    ],
    whyThisPathWins: stayAndAdvance?.rationale || stayAndAdvance?.recommendation || '',
    whatYouAreBettingOn: locale === 'nl'
      ? 'Dat leiders waarde toekennen aan mensen die AI veilig, meetbaar en teambreed inzetbaar maken.'
      : locale === 'de'
        ? 'Dass Führung Menschen belohnt, die KI sicher, messbar und teamfähig machen.'
        : 'That leadership rewards people who make AI safe, measurable, and usable for the wider team.',
    matchScore: Math.max(52, Math.min(92, Number(summary?.overall_score || 60) + 8)),
    salaryRange: basePivot?.salary_range || '',
    salaryDelta: locale === 'nl' ? 'Interne promotie / scope-upgrade' : locale === 'de' ? 'Interne Beförderung / Scope-Upgrade' : 'Internal promotion / scope upgrade',
    transitionTime: stayAndAdvance?.promotion_path?.timeline || '3-9 months',
    difficulty: 'Medium',
    strengths: normalizeArray(stayAndAdvance?.promotion_path?.signals_to_build).slice(0, 3),
    skillGaps,
    weeks: roadmapWeeks,
  });
}

function buildSyntheticPivotWeeks({ pivotTitle, decisionFrame, jobTitle, industry, skillGaps = [] }) {
  const topSkills = normalizeArray(skillGaps).slice(0, 2);
  const primarySkill = topSkills[0]?.skill_name || 'core transition skill';
  const secondarySkill = topSkills[1]?.skill_name || 'proof-building';
  const betLabel = decisionFrame || 'best-fit path';

  return [
    buildWeek({
      weekNumber: 1,
      title: 'Lock the target',
      goal: `Define what ${pivotTitle} actually means in the market so your effort compounds toward one believable direction.`,
      why: `Without a sharp target, ${jobTitle} professionals usually collect advice without translating it into employer-ready proof.`,
      problem: 'You need a concrete target role definition before you start building proof or rewriting your story.',
      actions: [
        `Review 12 live job descriptions for ${pivotTitle} and mark repeated responsibilities, tools, and deliverables.`,
        'Write a one-page transition brief explaining why your current background maps to this path.',
        `List the top 3 employer expectations that matter most for the ${betLabel} version of this pivot.`,
      ],
      timeCommitment: '3–4 hours',
      successSignal: `You can explain ${pivotTitle} in 3 sentences and name the top requirements employers expect.`,
      proof: 'A saved transition brief plus annotated job descriptions.',
      blockers: ['Trying to keep too many directions alive at once.', 'Researching without capturing patterns.'],
      catchUp: 'If the week slips, finish the transition brief and review 5 representative job descriptions only.',
      encouragement: 'Specificity creates relief. Once the target is sharper, the rest of the roadmap feels lighter.',
    }),
    buildWeek({
      weekNumber: 2,
      title: 'Inventory your proof',
      goal: 'Turn your current experience into evidence that already supports this pivot.',
      why: 'Most transitions stall because experience stays described as responsibilities instead of leverage and outcomes.',
      problem: 'You likely already have usable proof, but it is buried inside everyday work.',
      actions: [
        'List 8 work examples that show ownership, judgment, workflow improvement, or measurable results.',
        'Rewrite 3 examples using a problem → action → outcome structure.',
        'Choose one story that will anchor your positioning for this pivot.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have 3 polished proof stories tied clearly to the target role.',
      proof: 'A short document with 3 transition-ready story blocks.',
      blockers: ['Undervaluing routine work that actually shows leverage.', 'Forgetting measurable results or stakeholders.'],
      catchUp: 'Complete one strong proof story first and reuse the pattern later.',
      encouragement: 'You are not starting from zero. You are making existing leverage visible.',
    }),
    buildWeek({
      weekNumber: 3,
      title: 'Prioritize the skill ladder',
      goal: `Decide what to learn first so ${pivotTitle} becomes more believable quickly.`,
      why: 'If every missing skill feels equally urgent, you scatter energy and never build visible proof fast enough.',
      problem: 'You need a practical build order, not a long list of “nice to have” capabilities.',
      actions: [
        `Rank the top skills for ${pivotTitle} by hiring value, not curiosity.`,
        `Make ${primarySkill} the main skill focus for the next 3 weeks.`,
        `Choose ${secondarySkill} as the lighter parallel skill so momentum stays visible.`,
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You can explain why the first skill is first and what can wait.',
      proof: 'A prioritized skill ladder with one main focus and one secondary focus.',
      blockers: ['Trying to master everything at once.', 'Confusing learning with signal-building.'],
      catchUp: 'Lock the first skill and one secondary skill even if the rest stays rough.',
      encouragement: 'Depth beats breadth early. The fastest progress usually looks narrower, not busier.',
    }),
    buildWeek({
      weekNumber: 4,
      title: 'Ship the first proof asset',
      goal: 'Create one visible artifact that proves you can operate in the direction of the pivot.',
      why: 'Courses can help you learn, but evidence is what changes how employers and peers read you.',
      problem: 'Without visible proof, the pivot stays theoretical.',
      actions: [
        'Build one artifact tied to the role: a workflow, dashboard, memo, scorecard, or mini case study.',
        `Use ${primarySkill} inside the artifact so the skill becomes visible, not just claimed.`,
        'Write a short note explaining the business problem the asset solves.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have one shareable artifact that demonstrates new-role behavior.',
      proof: 'A shareable URL, doc, PDF, or deck plus one sentence on the business problem solved.',
      blockers: ['Overbuilding the first asset.', 'Choosing an example too far from real employer needs.'],
      catchUp: 'Publish a rough first version this week and improve it later.',
      encouragement: 'Visible work changes the emotional feel of a pivot fast. Once the proof exists, momentum gets easier.',
    }),
    buildWeek({
      weekNumber: 5,
      title: 'Install a weekly operating rhythm',
      goal: 'Turn the pivot into a consistent system instead of a burst of motivation.',
      why: 'Most people do not fail because the path is impossible. They fail because progress is too irregular to compound.',
      problem: 'You need a cadence that survives work pressure and low-energy weeks.',
      actions: [
        'Protect two recurring calendar blocks for pivot work.',
        'Define a catch-up rule for messy weeks so progress does not stall completely.',
        'Track one visible weekly metric like proof shipped, outreach sent, or hours protected.',
      ],
      timeCommitment: '1–2 hours setup',
      successSignal: 'You have a repeatable weekly system with a fallback plan.',
      proof: 'Calendar blocks plus a simple progress tracker.',
      blockers: ['Treating pivot work as optional.', 'Waiting for a perfect mood or long stretch of time.'],
      catchUp: 'Protect one 45-minute block this week if the original plan breaks.',
      encouragement: 'Consistency is what turns this from stressful to sustainable.',
    }),
    buildWeek({
      weekNumber: 6,
      title: 'Get market feedback',
      goal: 'Pressure-test your story and proof before you invest more time in the wrong version of the pivot.',
      why: 'External feedback prevents expensive drift and reveals what feels credible right now.',
      problem: 'You need a real market read, not just your own internal confidence.',
      actions: [
        'Share your transition brief and first proof asset with 2–3 people close to the target role.',
        'Ask what feels strong, what feels weak, and what they would expect next.',
        'Cluster the feedback into themes and decide what to fix first.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have specific feedback that sharpens the next steps.',
      proof: 'Written notes from 2–3 conversations or message exchanges.',
      blockers: ['Waiting until everything feels finished.', 'Asking vague questions that get vague advice back.'],
      catchUp: 'Send materials asynchronously with 3 targeted questions if live calls are hard to schedule.',
      encouragement: 'Feedback is not a detour. It is how the plan gets smarter.',
    }),
    buildWeek({
      weekNumber: 7,
      title: 'Rewrite your positioning',
      goal: 'Make your public story match the direction you are now building toward.',
      why: 'If your materials still describe only your old role, your new capability stays invisible.',
      problem: 'Your positioning usually lags behind the progress you are making.',
      actions: [
        'Rewrite your headline and summary around the pivot direction.',
        'Add your strongest proof asset to your profile or resume.',
        'Update 3 bullets to emphasize systems improved, outcomes created, or judgment applied.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: 'Someone can understand your new direction within 30 seconds of reading your materials.',
      proof: 'Updated resume and LinkedIn profile.',
      blockers: ['Trying to sound like a finished expert instead of a credible transitioner.', 'Leaving old role language untouched.'],
      catchUp: 'Update the headline, summary, and one proof project first.',
      encouragement: 'Positioning is not pretending. It is making your trajectory legible.',
    }),
    buildWeek({
      weekNumber: 8,
      title: 'Expand the proof set',
      goal: 'Create a second example so your pivot looks repeatable instead of one-off.',
      why: 'One example creates interest. Two examples create pattern recognition.',
      problem: 'You need to show range without losing focus.',
      actions: [
        'Build a second smaller proof asset that solves a different kind of business problem.',
        'Make it easier to skim than the first asset.',
        'Write one line explaining how the two examples complement each other.',
      ],
      timeCommitment: '4 hours',
      successSignal: 'You have two proof assets that show range within the target direction.',
      proof: 'A second mini case study, workflow, or portfolio item.',
      blockers: ['Making the second asset too big.', 'Choosing an example too similar to the first.'],
      catchUp: 'Create a one-page mini asset rather than a full build if time is tight.',
      encouragement: 'At this point, the pivot should start to feel like evidence, not aspiration.',
    }),
    buildWeek({
      weekNumber: 9,
      title: 'Start targeted outreach',
      goal: 'Turn the roadmap into live opportunities through focused conversations and company mapping.',
      why: 'Transitions accelerate when you stop waiting for perfect readiness and start entering real conversations.',
      problem: 'You need exposure to live openings, decision-makers, and real role language.',
      actions: [
        'Create a list of 20 relevant companies or teams.',
        'Send 5 focused outreach messages tied to your transition brief or proof asset.',
        'Track what gets replies and refine the message after every few sends.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have started real conversations instead of staying in private preparation mode.',
      proof: 'A target list plus outreach tracker.',
      blockers: ['Over-personalizing every message.', 'Waiting until materials feel perfect.'],
      catchUp: 'Send 3 high-quality messages this week if 5 feels too heavy.',
      encouragement: 'You do not need universal approval. You need a few credible openings.',
    }),
    buildWeek({
      weekNumber: 10,
      title: 'Rehearse the transition story',
      goal: 'Prepare concise answers for why this pivot makes sense and why now.',
      why: 'A disciplined story reduces doubt in networking, interviews, and internal conversations.',
      problem: 'Without a tighter narrative, your background can sound fragmented instead of strategic.',
      actions: [
        'Write your answer to “Why this pivot?” in 60 seconds and in 3 minutes.',
        'Practice using your proof assets as support, not side notes.',
        'Prepare one calm response to the most likely objection.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You can explain the transition clearly without rambling or apologizing for missing pieces.',
      proof: 'A written narrative plus one recorded practice run.',
      blockers: ['Overexplaining your whole career history.', 'Sounding defensive about missing experience.'],
      catchUp: 'Nail the 60-second version first.',
      encouragement: 'Clarity creates confidence. Confidence creates momentum.',
    }),
    buildWeek({
      weekNumber: 11,
      title: 'Run live bets',
      goal: 'Use what you built in real-world decisions: applications, pilots, stretch work, or advisory projects.',
      why: 'This is where the roadmap shifts from preparation to conversion.',
      problem: 'You need a bridge from “I could do this” to “someone trusted me to do this.”',
      actions: [
        'Apply to a focused set of roles or propose one internal pilot tied to the new direction.',
        'Customize your story using the strongest proof asset for each opportunity.',
        'Track rejections, silence, and positive signals separately to find the real friction.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have entered the market or internal decision cycle with concrete materials.',
      proof: 'Applications sent, proposal shared, or live opportunity tracker updated.',
      blockers: ['Applying too broadly.', 'Taking silence as proof the pivot is wrong.'],
      catchUp: 'Choose one narrow target segment and submit 3 strong opportunities instead.',
      encouragement: 'This week is about contact with the market, not instant wins.',
    }),
    buildWeek({
      weekNumber: 12,
      title: 'Review and re-sequence',
      goal: 'Close the 12 weeks with a clear view of what worked and what the next 30 days should be.',
      why: 'Reflection keeps the roadmap from ending in a vague blur of effort.',
      problem: 'Without a review step, progress can feel incomplete even when it is real.',
      actions: [
        'Review progress against your original transition brief and current opportunities.',
        'Mark what was completed, what slipped, and why.',
        'Choose the next 3 actions for the coming month based on evidence, not guilt.',
      ],
      timeCommitment: '2 hours',
      successSignal: 'You have a clear next-month plan and can point to concrete progress from the last 12 weeks.',
      proof: 'A short review note plus next-30-day action list.',
      blockers: ['Judging success only by final job outcome.', 'Ignoring process wins and evidence gained.'],
      catchUp: 'If multiple weeks slipped, focus on lessons learned and re-sequence rather than trying to “finish everything.”',
      encouragement: `The point of this plan is traction. If you now have better clarity, stronger proof, and better opportunities, ${pivotTitle} is already becoming more real.`,
    }),
  ];
}

export function hydrateModelReportData(reportData, fallbackProfile = null) {
  const fallback = buildDemoReportData(
    fallbackProfile?.job_title || fallbackProfile?.jobTitle || '',
    fallbackProfile?.industry || '',
    Array.isArray(fallbackProfile?.tasks) ? fallbackProfile.tasks : [],
    fallbackProfile
  );

  if (!reportData || typeof reportData !== 'object') {
    return fallback;
  }

  const profile = {
    ...fallback.profile,
    ...(reportData.profile && typeof reportData.profile === 'object' ? reportData.profile : {}),
  };

  const incomingPivots = normalizeArray(reportData.pivots);
  const basePivotsByFrame = new Map(
    normalizeArray(fallback.pivots).map((pivot) => [pivot.decision_frame, pivot])
  );

  const hydratedPivots = DEFAULT_PIVOT_DECISION_FRAMES.map((frame, index) => {
    const incomingPivot = incomingPivots.find((pivot) => pivot?.decision_frame === frame) || incomingPivots[index] || {};
    const basePivot = basePivotsByFrame.get(frame) || fallback.pivots[index] || fallback.pivots[0];
    const title = incomingPivot.title || basePivot.title;
    const skillGaps = normalizeArray(incomingPivot.skill_gaps).length
      ? incomingPivot.skill_gaps
      : basePivot.skill_gaps;
    const strengths = normalizeArray(incomingPivot.strengths_to_leverage).length
      ? incomingPivot.strengths_to_leverage
      : basePivot.strengths_to_leverage;

    return {
      ...basePivot,
      ...incomingPivot,
      id: incomingPivot.id || slugify(title) || basePivot.id || `pivot-${index + 1}`,
      title,
      decision_frame: frame,
      strengths_to_leverage: strengths,
      tradeoffs: normalizeArray(incomingPivot.tradeoffs).length ? incomingPivot.tradeoffs : basePivot.tradeoffs,
      skill_gaps: skillGaps,
      roadmap: {
        weeks:
          normalizeArray(incomingPivot?.roadmap?.weeks).length >= 12
            ? incomingPivot.roadmap.weeks
            : buildSyntheticPivotWeeks({
                pivotTitle: title,
                decisionFrame: frame,
                jobTitle: profile.job_title,
                industry: profile.industry,
                skillGaps,
              }),
      },
    };
  });

  const featuredPivot = hydratedPivots[0] || fallback.pivots[0];
  const decision = reportData.decision && typeof reportData.decision === 'object'
    ? { ...buildDecisionSignal(reportData.summary || fallback.summary, featuredPivot), ...reportData.decision }
    : buildDecisionSignal(reportData.summary || fallback.summary, featuredPivot);
  const careerRoi = reportData.career_roi && typeof reportData.career_roi === 'object'
    ? { ...buildCareerRoi(reportData.summary || fallback.summary, featuredPivot), ...reportData.career_roi }
    : buildCareerRoi(reportData.summary || fallback.summary, featuredPivot);
  const stayAndAdvance = reportData.stay_and_advance && typeof reportData.stay_and_advance === 'object'
    ? { ...buildStayAndAdvance(profile, reportData.summary || fallback.summary, featuredPivot, reportData.locale || profile.locale || 'en'), ...reportData.stay_and_advance }
    : buildStayAndAdvance(profile, reportData.summary || fallback.summary, featuredPivot, reportData.locale || profile.locale || 'en');
  const stayPath = buildStayAdvancePath(profile, reportData.summary || fallback.summary, stayAndAdvance, featuredPivot, reportData.locale || profile.locale || 'en');
  const first30Days = reportData.first_30_days && typeof reportData.first_30_days === 'object'
    ? { ...buildFirst30Days(profile, featuredPivot, { weeks: featuredPivot.roadmap.weeks }, reportData.next_move || fallback.next_move), ...reportData.first_30_days }
    : buildFirst30Days(profile, featuredPivot, { weeks: featuredPivot.roadmap.weeks }, reportData.next_move || fallback.next_move);

  return normalizeReportData({
    ...fallback,
    ...reportData,
    profile,
    summary: {
      ...fallback.summary,
      ...(reportData.summary && typeof reportData.summary === 'object' ? reportData.summary : {}),
    },
    interpretation: {
      ...fallback.interpretation,
      ...(reportData.interpretation && typeof reportData.interpretation === 'object' ? reportData.interpretation : {}),
    },
    task_breakdown: normalizeArray(reportData.task_breakdown).length ? reportData.task_breakdown : fallback.task_breakdown,
    pivots: hydratedPivots,
    skill_gaps: normalizeArray(reportData.skill_gaps).length ? reportData.skill_gaps : featuredPivot.skill_gaps,
    roadmap: {
      cadence: 'weekly',
      total_weeks: 12,
      weeks: normalizeArray(reportData.roadmap?.weeks).length ? reportData.roadmap.weeks : featuredPivot.roadmap.weeks,
    },
    next_move: {
      ...fallback.next_move,
      ...(reportData.next_move && typeof reportData.next_move === 'object' ? reportData.next_move : {}),
    },
    decision,
    career_roi: careerRoi,
    stay_and_advance: stayAndAdvance,
    stay_path: stayPath,
    first_30_days: first30Days,
  }, profile);
}

export function buildDemoReportData(jobTitle, industry, tasks, intakeProfile = null, locale = 'en') {
  const selectedTasks = extractTaskLabels(tasks?.length ? tasks : intakeProfile?.selected_tasks).length
    ? extractTaskLabels(tasks?.length ? tasks : intakeProfile?.selected_tasks)
    : ['Reporting and status updates', 'Analysis and insight generation', 'Strategy and roadmap planning'];
  const primaryTasks = Array.isArray(intakeProfile?.primary_tasks) && intakeProfile.primary_tasks.length
    ? intakeProfile.primary_tasks
    : selectedTasks.slice(0, 3);
  const roleBlend = intakeProfile?.clarifiers?.role_blend || 'mixed';
  const managementScope = intakeProfile?.clarifiers?.management_scope || null;
  const roleBlendLabel = roleBlend === 'execution'
    ? 'execution-heavy'
    : roleBlend === 'strategy'
      ? 'strategy-heavy'
      : 'mixed execution-and-strategy';
  const leadershipContext = managementScope && managementScope !== 'none'
    ? ' Because you also manage people, the safer path is not just doing work faster, but making better decisions about what work should exist at all.'
    : '';
  const taskBreakdown = selectedTasks.map((task, index) => {
    const baseRisk = DEFAULT_TASK_RISKS[task] ?? 55;
    const riskScore = clamp(baseRisk + ((index % 3) - 1) * 4, 18, 92);

    let explanation = 'AI can accelerate part of this work, but human oversight still shapes final quality and accountability.';
    if (riskScore >= 75) {
      explanation = `Tools like ChatGPT, Claude, and workflow automation already compress the amount of manual ${task.toLowerCase()} needed in ${industry}.`;
    } else if (riskScore >= 45) {
      explanation = `This part of a ${jobTitle} role is being reshaped by AI copilots, so the value is shifting from doing to directing and quality-controlling output.`;
    } else {
      explanation = `This area still depends on judgment, relationship context, and nuanced tradeoffs that AI cannot reliably own in ${industry}.`;
    }

    return {
      task_name: task,
      risk_score: riskScore,
      explanation,
    };
  });

  const overallScore = clamp(
    Math.round(taskBreakdown.reduce((sum, item) => sum + item.risk_score, 0) / taskBreakdown.length),
    25,
    88
  );
  const riskLevel = overallScore >= 70 ? 'HIGH' : overallScore >= 40 ? 'MODERATE' : 'LOW';
  const displacementTimeline =
    overallScore >= 70
      ? `Significant disruption is likely within 12–18 months as AI adoption rises across ${industry}.`
      : overallScore >= 40
        ? `Meaningful workflow disruption is likely within 18–24 months as teams in ${industry} standardize AI-assisted execution.`
        : `AI adoption is likely to change expectations over the next 24–36 months, even if immediate disruption is lower in ${industry}.`;

  const topTasks = taskBreakdown
    .slice()
    .sort((a, b) => b.risk_score - a.risk_score)
    .slice(0, 2)
    .map((item) => item.task_name.toLowerCase());
  const primaryTaskSummary = primaryTasks.slice(0, 2).map((task) => task.toLowerCase()).join(' and ');
  const strengthLine = roleBlend === 'strategy'
    ? 'Your advantage is not raw output volume. It is prioritization, judgment, and decision framing.'
    : roleBlend === 'execution'
      ? 'Your advantage is practical closeness to the work, which makes you well-placed to redesign how it gets done.'
      : 'Your advantage is that you can still bridge execution reality with broader business context.';

  const commonWeeks = [
    buildWeek({
      weekNumber: 1,
      title: 'Clarify the pivot target',
      goal: 'Define the exact role variation you are moving toward so the rest of the roadmap stops feeling generic.',
      why: `Without a specific destination, ${jobTitle} professionals usually collect courses and advice but never translate them into credible progress.`,
      problem: 'You need a tighter direction than “future-proof my career” so each week compounds instead of scattering effort.',
      actions: [
        `Review 15 live job descriptions connected to this pivot and mark repeated responsibilities, tools, and deliverables.`,
        'Write a one-page transition brief that explains why your current background maps to this role.',
        'Choose one proof-of-skill theme you will build over the next 12 weeks.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: 'You can explain your pivot in 3 sentences and name the top 5 requirements employers expect.',
      proof: 'A saved transition brief plus annotated job descriptions.',
      blockers: ['Trying to keep too many pivot options alive at once.', 'Researching roles without capturing repeat patterns.'],
      catchUp: 'If you miss the week, skip extra research and complete only the transition brief plus 5 representative job descriptions.',
      encouragement: 'Specificity is relief. Once the target sharpens, the roadmap starts feeling much more achievable.',
    }),
    buildWeek({
      weekNumber: 2,
      title: 'Audit your evidence',
      goal: 'Turn vague experience into proof that hiring managers can trust.',
      why: 'Most career switchers undersell themselves because they describe responsibilities instead of results and transferable patterns.',
      problem: 'You likely have relevant evidence already, but it is buried inside past projects and daily work.',
      actions: [
        'List 8 work examples that show strategy, execution, communication, automation, or process improvement.',
        'Rewrite 3 of them using a problem → action → outcome format.',
        'Identify one measurable result you can reference for each example.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have 3 polished proof stories that clearly connect your current background to the pivot.',
      proof: 'A document containing 3 transition-ready story blocks.',
      blockers: ['Assuming “normal work” is not portfolio-worthy.', 'Forgetting numbers, stakeholders, or outcomes.'],
      catchUp: 'Finish one strong story instead of three, then reuse that pattern later.',
      encouragement: 'You are not starting from zero. This week is about making hidden leverage visible.',
    }),
  ];

  const pivot1SkillGaps = [
    buildSkillGap({
      skillName: 'Prompt design',
      category: 'AI execution',
      currentStrength: 'You already know the business context and decisions the output needs to support.',
      requiredLevel: 'Able to structure prompts, evaluate outputs, and iterate quickly with quality controls.',
      gapPriority: 'critical',
      whyItMatters: 'This is the fastest way to convert your existing domain expertise into visible AI leverage.',
      evidence: 'You already shape briefs, stakeholder asks, or deliverables that map naturally into prompt design.',
      howToClose: 'Build one repeatable prompt workflow tied to a real task from your current job.',
      resourceTitle: 'ChatGPT Prompt Engineering for Developers',
      resourceUrl: 'https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/',
    }),
    buildSkillGap({
      skillName: 'AI QA workflows',
      category: 'Quality control',
      currentStrength: 'You already know what “good enough” looks like in your function.',
      requiredLevel: 'Able to evaluate AI outputs against business, brand, and stakeholder standards before shipping.',
      gapPriority: 'critical',
      whyItMatters: 'Companies do not just want faster output. They want someone who can keep quality from slipping while AI speeds work up.',
      evidence: 'Your current review or approval instincts already give you the basis for a QA rubric.',
      howToClose: 'Create a simple review checklist and use it on 5 AI-assisted outputs.',
      resourceTitle: 'OpenAI Cookbook',
      resourceUrl: 'https://cookbook.openai.com/',
    }),
    buildSkillGap({
      skillName: 'Automation mapping',
      category: 'Workflow design',
      currentStrength: 'You already understand where work gets delayed, repeated, or handed off poorly.',
      requiredLevel: 'Able to map a repetitive workflow and automate low-risk steps with no-code tools.',
      gapPriority: 'medium',
      whyItMatters: 'This turns you from a tool user into someone who improves the operating system of the team.',
      evidence: 'Your familiarity with recurring workflows gives you strong instincts for where automation has leverage.',
      howToClose: 'Map one recurring workflow and automate one step with a low-code or no-code tool.',
      resourceTitle: 'Zapier Learn',
      resourceUrl: 'https://zapier.com/blog/learn-automation/',
    }),
  ];

  const pivot2SkillGaps = [
    buildSkillGap({
      skillName: 'Dashboard storytelling',
      category: 'Analytics communication',
      currentStrength: 'You already know what metrics stakeholders care about.',
      requiredLevel: 'Able to turn raw metrics into a clear narrative that supports decisions.',
      gapPriority: 'critical',
      whyItMatters: 'Operations roles reward people who translate numbers into actions, not just charts.',
      evidence: 'You already surface patterns in meetings, reports, or project reviews.',
      howToClose: 'Rebuild one existing report into a clearer dashboard and explain what decisions it should trigger.',
      resourceTitle: 'Google Data Analytics Certificate',
      resourceUrl: 'https://www.coursera.org/professional-certificates/google-data-analytics',
    }),
    buildSkillGap({
      skillName: 'SQL basics',
      category: 'Technical analytics',
      currentStrength: 'You likely already ask data questions and interpret outputs.',
      requiredLevel: 'Able to query common business tables and validate simple operational hypotheses.',
      gapPriority: 'critical',
      whyItMatters: 'SQL is the fastest credibility unlock for adjacent ops and analytics roles.',
      evidence: 'Your current task mix already gives you business questions worth answering with data.',
      howToClose: 'Practice 20 foundational SQL queries tied to funnel, workflow, or process questions.',
      resourceTitle: 'SQL for Data Science',
      resourceUrl: 'https://www.coursera.org/learn/sql-for-data-science',
    }),
  ];

  const pivot3SkillGaps = [
    buildSkillGap({
      skillName: 'Change management',
      category: 'Leadership',
      currentStrength: 'You already influence people through projects and communication.',
      requiredLevel: 'Able to drive adoption, handle resistance, and sequence change across teams.',
      gapPriority: 'critical',
      whyItMatters: 'AI transformation roles fail when leaders focus only on tools and ignore adoption behavior.',
      evidence: 'You already navigate stakeholders, expectations, and shifting priorities.',
      howToClose: 'Document one internal rollout plan that includes adoption risks and stakeholder handling.',
      resourceTitle: 'Digital Transformation',
      resourceUrl: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
    }),
    buildSkillGap({
      skillName: 'Vendor evaluation',
      category: 'AI strategy',
      currentStrength: 'You already compare tools and tradeoffs informally in your current work.',
      requiredLevel: 'Able to evaluate AI tools based on use case fit, risk, cost, and rollout readiness.',
      gapPriority: 'medium',
      whyItMatters: 'This is how you move from operator to decision-maker in an AI program role.',
      evidence: 'Your practical exposure to workflows gives you real criteria for what matters in evaluation.',
      howToClose: 'Create a side-by-side scorecard for 3 AI tools relevant to your function.',
      resourceTitle: 'AI for Everyone',
      resourceUrl: 'https://www.coursera.org/learn/ai-for-everyone',
    }),
  ];

  const pivot4SkillGaps = [
    buildSkillGap({
      skillName: 'Stakeholder discovery',
      category: 'Consultative work',
      currentStrength: 'You already translate business needs into practical next steps.',
      requiredLevel: 'Able to run short discovery conversations and turn them into scoped workflow or tooling recommendations.',
      gapPriority: 'critical',
      whyItMatters: 'Fast-cash pivots reward people who can diagnose messy workflow problems quickly and convert trust into scoped work.',
      evidence: 'Your current role already exposes you to repeated friction, handoffs, and stakeholder pain points.',
      howToClose: 'Run 3 mock discovery sessions and turn each into a one-page recommendation memo.',
      resourceTitle: 'The Mom Test',
      resourceUrl: 'https://www.momtestbook.com/',
    }),
    buildSkillGap({
      skillName: 'Workflow prototyping',
      category: 'Automation delivery',
      currentStrength: 'You already know the sequence of work well enough to spot where lightweight automation helps.',
      requiredLevel: 'Able to prototype a small workflow improvement or AI-assisted process in days, not weeks.',
      gapPriority: 'critical',
      whyItMatters: 'Quickly-visible prototypes are what make a cash-recovery path credible to employers, clients, or internal sponsors.',
      evidence: 'Your process familiarity means you can usually spot an obvious first automation candidate.',
      howToClose: 'Build 2 small before-and-after workflow prototypes tied to a real business use case.',
      resourceTitle: 'Zapier Learn',
      resourceUrl: 'https://zapier.com/blog/learn-automation/',
    }),
  ];

  const pivot5SkillGaps = [
    buildSkillGap({
      skillName: 'Systems architecture judgment',
      category: 'Platform thinking',
      currentStrength: 'You already understand how work moves between tools, people, and approvals.',
      requiredLevel: 'Able to reason about durable workflow design, operating models, and where AI should sit inside a broader system.',
      gapPriority: 'critical',
      whyItMatters: 'Long-term platform roles reward people who can shape the system, not just optimize a single step.',
      evidence: 'Your day-to-day exposure to broken handoffs gives you grounded instincts for what a better system needs.',
      howToClose: 'Document one end-to-end workflow redesign with clear system boundaries, owners, and AI decision points.',
      resourceTitle: 'Designing Machine Learning Systems',
      resourceUrl: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/',
    }),
    buildSkillGap({
      skillName: 'Governance and rollout design',
      category: 'Operating model',
      currentStrength: 'You likely already balance speed, quality, and stakeholder expectations informally.',
      requiredLevel: 'Able to define adoption rules, risk controls, and rollout sequencing for AI-enabled workflows.',
      gapPriority: 'medium',
      whyItMatters: 'The platform bet gets stronger when you can connect technical possibility to responsible operating decisions.',
      evidence: 'Your current role already requires judgment about what should be standardized, reviewed, or escalated.',
      howToClose: 'Create a lightweight governance playbook for one AI-assisted workflow and test it with peers.',
      resourceTitle: 'NIST AI Risk Management Framework',
      resourceUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
    }),
  ];

  const buildPivotWeeks = (pivotTitle, skillGaps) => [
    ...commonWeeks,
    buildWeek({
      weekNumber: 3,
      title: 'Translate your target skills',
      goal: `Map the highest-priority capabilities for ${pivotTitle} into a build order that fits your current schedule.`,
      why: 'This week exists because most pivots get bloated here. If every missing capability feels equally urgent, you will scatter your effort and never build visible leverage fast enough.',
      problem: 'You need to know which skills create immediate employability versus which ones can safely wait, otherwise the roadmap turns into anxious busywork.',
      actions: [
        `Rank the top 5 required skills for ${pivotTitle} by urgency, not interest.`,
        'Choose one critical skill to practice deeply this month.',
        'Pick one lower-effort skill to learn in parallel so momentum stays visible.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You have a practical build order, not just a long list of missing skills, and you can explain why the first skill is first.',
      proof: 'A prioritized skill ladder with one critical focus, one secondary focus, and a short note on what can wait.',
      blockers: ['Trying to master everything at once.', 'Choosing skills based on curiosity instead of hiring value.', 'Mistaking course consumption for signal-building.'],
      catchUp: 'If this week slips, keep only the ranking exercise and lock one critical skill. If you skip that decision, the next few weeks lose focus.',
      encouragement: 'Depth beats breadth early. The goal is not to feel busy. It is to build the one capability jump that changes how the market reads you.',
    }),
    buildWeek({
      weekNumber: 4,
      title: 'Build your first proof asset',
      goal: 'Create a visible artifact that proves you can already operate in the direction of the pivot.',
      why: 'This week exists because proof changes the conversation. Courses can help you learn, but evidence is what makes the pivot feel believable to hiring managers and to you.',
      problem: 'Without evidence, your pivot still looks theoretical. If you skip this week, later networking and applications will lean too hard on potential instead of proof.',
      actions: [
        'Create one artifact tied to the new role: a workflow, analysis, memo, scorecard, or mini case study.',
        'Use at least one of your priority skills inside the artifact.',
        'Write a short explanation of the business problem the asset solves.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have one shareable artifact that demonstrates new-role behavior, not just old-role experience, and you know exactly why it matters.',
      proof: 'A URL, PDF, slide, or doc you would feel comfortable showing a recruiter, plus one sentence explaining the business problem it solves.',
      blockers: ['Overbuilding the asset.', 'Picking a portfolio idea too disconnected from real employer needs.', 'Spending all week polishing instead of shipping a first version.'],
      catchUp: 'Create a rough first version this week and polish later instead of waiting for a perfect portfolio piece. Protect the act of publishing; that is the compounding move.',
      encouragement: 'Momentum becomes real once the work is visible. A strong first proof asset often does more for confidence than another month of private preparation.',
    }),
    buildWeek({
      weekNumber: 5,
      title: 'Install a repeatable practice rhythm',
      goal: 'Turn the pivot from a one-off burst into a system you can sustain for 90 days.',
      why: 'Most people do not fail because the pivot is impossible; they fail because progress is too irregular.',
      problem: 'You need a cadence strong enough to survive work fatigue and life interruptions.',
      actions: [
        'Create two weekly practice blocks in your calendar and protect them like meetings.',
        'Define a default catch-up window for weeks that slip.',
        'Set a single metric that proves you are still moving, even in messy weeks.',
      ],
      timeCommitment: '1–2 hours setup, then recurring',
      successSignal: 'You have a weekly routine with protected time and a fallback plan.',
      proof: 'Calendar blocks plus a visible progress tracker.',
      blockers: ['Treating pivot work as optional.', 'Needing the perfect mood or long stretch of time to start.'],
      catchUp: 'Reduce the week to one protected 45-minute block if your schedule breaks.',
      encouragement: 'Consistency is what makes this feel cared-for instead of chaotic.',
    }),
    buildWeek({
      weekNumber: 6,
      title: 'Pressure-test with real feedback',
      goal: 'Get outside validation before you sink more time into the wrong narrative or proof asset.',
      why: 'Internal confidence matters, but market feedback prevents expensive drift.',
      problem: 'You need to know whether your pivot story and asset make sense to someone who hires or works in the role.',
      actions: [
        'Share your transition brief and proof asset with 2–3 relevant professionals.',
        'Ask what feels credible, what feels weak, and what they would expect next.',
        'Capture all feedback in one place and cluster it into themes.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have external feedback pointing to concrete improvements rather than guesswork.',
      proof: 'Written notes from 2–3 review conversations or message exchanges.',
      blockers: ['Waiting until everything feels finished.', 'Asking vague questions that produce vague advice.'],
      catchUp: 'If live calls are hard, send the materials asynchronously with 3 targeted questions.',
      encouragement: 'Feedback is not a detour. It is how the roadmap becomes smarter.',
    }),
    buildWeek({
      weekNumber: 7,
      title: 'Upgrade your positioning',
      goal: 'Make your LinkedIn, resume, and personal narrative match the direction you are now building toward.',
      why: 'If your materials still describe only your past role, your new capability remains invisible.',
      problem: 'Your public positioning likely lags behind the progress you are making.',
      actions: [
        'Rewrite your headline and summary around the pivot direction.',
        'Add one transition-ready project or asset to your profile or resume.',
        'Rewrite 3 bullet points to emphasize problems solved, systems improved, and outcomes created.',
      ],
      timeCommitment: '3–4 hours',
      successSignal: 'A recruiter or peer can understand your new direction within 30 seconds of viewing your profile.',
      proof: 'Updated resume and LinkedIn profile.',
      blockers: ['Trying to sound like a finished expert instead of a credible transitioner.', 'Leaving old role language untouched.'],
      catchUp: 'Update headline, summary, and one project first; polish the rest later.',
      encouragement: 'Positioning is not pretending. It is making your trajectory legible.',
    }),
    buildWeek({
      weekNumber: 8,
      title: 'Expand your proof set',
      goal: 'Build a second proof asset so you are not relying on one example to carry the whole pivot.',
      why: 'One strong example creates interest; two or more create pattern recognition.',
      problem: 'You need to show this is repeatable behavior, not a lucky one-off project.',
      actions: [
        'Create a second, smaller proof asset that solves a different kind of business problem.',
        'Make the asset easier to skim than the first one.',
        'Write one sentence explaining how the two assets complement each other.',
      ],
      timeCommitment: '4 hours',
      successSignal: 'You have two proof assets that show range within the target role.',
      proof: 'A second portfolio item or mini-case study.',
      blockers: ['Turning the second asset into a giant build.', 'Choosing an example too similar to the first.'],
      catchUp: 'Create a one-page mini asset instead of a full project if time is tight.',
      encouragement: 'At this point, your portfolio should start feeling like evidence, not aspiration.',
    }),
    buildWeek({
      weekNumber: 9,
      title: 'Start targeted outreach',
      goal: 'Turn the roadmap into real opportunities through focused networking and opportunity mapping.',
      why: 'Transitions accelerate when you stop waiting for perfect readiness and start entering real conversations.',
      problem: 'You need exposure to live openings, decision-makers, and role language as it exists now.',
      actions: [
        'Create a target list of 20 companies or teams that hire this role.',
        'Reach out to 5 people with a specific angle tied to your transition brief or proof asset.',
        'Track response patterns and refine your message after every 3–5 sends.',
      ],
      timeCommitment: '3 hours',
      successSignal: 'You have started real conversations instead of passively consuming advice.',
      proof: 'A target list plus outreach tracker.',
      blockers: ['Over-personalizing every message.', 'Waiting until your materials feel perfect.'],
      catchUp: 'Send 3 quality messages this week if 5 feels too heavy.',
      encouragement: 'You do not need universal approval. You need a few credible openings.',
    }),
    buildWeek({
      weekNumber: 10,
      title: 'Rehearse the transition story',
      goal: 'Prepare concise, believable answers for why you are pivoting and why now.',
      why: 'A strong transition story reduces doubt in both networking and interviews.',
      problem: 'Without a disciplined narrative, your background can sound fragmented instead of strategic.',
      actions: [
        'Write your answer to “Why this pivot?” in 60 seconds and in 3 minutes.',
        'Practice using your proof assets as supporting evidence, not side notes.',
        'Identify one likely objection and prepare a calm response.',
      ],
      timeCommitment: '2–3 hours',
      successSignal: 'You can explain the pivot clearly without rambling or apologizing for your background.',
      proof: 'A written narrative and one recorded practice run.',
      blockers: ['Overexplaining your whole career history.', 'Sounding defensive about missing experience.'],
      catchUp: 'Nail the 60-second answer first. That is the highest-leverage version.',
      encouragement: 'Clarity creates confidence. Confidence creates momentum.',
    }),
    buildWeek({
      weekNumber: 11,
      title: 'Run live applications or internal bets',
      goal: 'Use everything built so far in real-world decisions: applications, internal stretch work, consulting, or pilot offers.',
      why: 'This is where the roadmap shifts from preparation to conversion.',
      problem: 'You need a bridge from “I could do this” to “someone trusted me to do this.”',
      actions: [
        'Apply to a focused set of roles or propose one internal pilot tied to the new direction.',
        'Customize your narrative using the strongest proof asset for each opportunity.',
        'Log rejections, silence, and positive signals separately to see where friction actually sits.',
      ],
      timeCommitment: '4–5 hours',
      successSignal: 'You have entered the market or internal decision cycle with concrete materials, not just intentions.',
      proof: 'Applications sent, pilot proposal submitted, or live opportunity tracker updated.',
      blockers: ['Applying too broadly.', 'Taking silence as proof the pivot is wrong.'],
      catchUp: 'Choose one narrow target segment and submit only 3 strong opportunities.',
      encouragement: 'This week is not about instant wins. It is about real contact with the market.',
    }),
    buildWeek({
      weekNumber: 12,
      title: 'Review, celebrate, and re-sequence',
      goal: 'Close the 90 days with a clear view of what worked, what is still blocked, and what the next 30 days should be.',
      why: 'The roadmap should leave the user feeling supported and proud, not dropped at the end.',
      problem: 'Without reflection, progress feels vague and unfinished even when it is real.',
      actions: [
        'Review your progress against the original transition brief and current opportunities.',
        'Mark which milestones were completed, which slipped, and why.',
        'Choose the next 3 actions for the following month based on evidence, not guilt.',
      ],
      timeCommitment: '2 hours',
      successSignal: 'You have a clear next-month plan and can point to concrete progress from the last 12 weeks.',
      proof: 'A short review note plus next-30-day action list.',
      blockers: ['Judging the roadmap only by final job outcome.', 'Ignoring process wins and evidence gained.'],
      catchUp: 'If multiple weeks slipped, focus on lessons learned and re-sequence the next month rather than trying to “finish everything” at once.',
      encouragement: 'Completion matters. Reflection turns effort into a system you can trust again next month.',
    }),
  ];

  const pivot1 = buildPivot({
    id: slugify(`ai-enabled-${jobTitle}`) || 'ai-enabled-role',
    title: `AI-Enabled ${jobTitle}`,
    fitSummary: `This is the lowest-friction path because it builds on the context, business judgment, and stakeholder trust you already have. Instead of abandoning your field, you reposition yourself as the person who can redesign the riskiest parts of the role without losing quality.`,
    outcome: 'You stay close to your current field while becoming the person who can direct AI safely, improve throughput, and protect the parts of the work that still need human judgment.',
    decisionFrame: 'safest transition',
    whoThisIsFor: `Best for someone who wants to stay close to ${industry}, protect existing credibility, and turn present-day domain knowledge into a stronger advantage rather than start over.`,
    tradeoffs: [
      'Safer and faster than the other paths, but with less upside than a larger role reset.',
      'Relies on you proving you can redesign work, not just use AI tools casually.',
    ],
    whyThisPathWins: 'It keeps the user near their existing context while upgrading how they execute, review, and improve the work that AI is reshaping first.',
    whatYouAreBettingOn: 'You are betting that domain context plus AI workflow judgment will be valued faster than generic tool familiarity.',
    matchScore: clamp(90 - Math.max(taskBreakdown.length - 4, 0) * 2, 76, 94),
    salaryRange: '$95K – $135K/year',
    salaryDelta: '+18% above median for similar roles with AI execution skills',
    transitionTime: '6–10 weeks with consistent effort (~5hrs/week)',
    difficulty: 'Low',
    strengths: ['Domain knowledge', 'Communication', 'Workflow ownership', 'Context from daily execution'],
    skillGaps: pivot1SkillGaps,
    weeks: buildPivotWeeks(`AI-Enabled ${jobTitle}`, pivot1SkillGaps),
  });

  const pivot2 = buildPivot({
    id: slugify(`${industry}-operations-analyst`) || 'operations-analyst',
    title: `${industry} Operations Analyst`,
    fitSummary: 'This is an adjacent move for users whose current work already touches reporting, process improvement, or cross-functional execution. It works especially well when your current role has too much recurring coordination and not enough recognized operating leverage.',
    outcome: 'You move into a role that is more resilient because it rewards operational clarity, measurement, and process design over repetitive execution.',
    decisionFrame: 'strongest leverage fit',
    whoThisIsFor: `Best for someone whose current job already sits between teams, systems, reporting, and workflow cleanup, but whose leverage is currently hidden inside “keeping things moving.”`,
    tradeoffs: [
      'More repositioning work than the safest path, because you need to make your operating leverage visible.',
      'Usually lower upside than the most ambitious path, but often more believable in the near term.',
    ],
    whyThisPathWins: 'It turns coordination, reporting, and process judgment into a recognized operating role instead of leaving those strengths buried inside a broader job title.',
    whatYouAreBettingOn: 'You are betting that systems thinking, measurement, and process clarity will outlast repetitive execution work in your field.',
    matchScore: clamp(84 - Math.max(taskBreakdown.length - 5, 0) * 2, 70, 88),
    salaryRange: '$88K – $125K/year',
    salaryDelta: '+12% above median for adjacent operations roles',
    transitionTime: '2–4 months with consistent effort (~6hrs/week)',
    difficulty: 'Medium',
    strengths: ['Cross-functional awareness', 'Process exposure', 'Reporting context'],
    skillGaps: pivot2SkillGaps,
    weeks: buildPivotWeeks(`${industry} Operations Analyst`, pivot2SkillGaps),
  });

  const pivot3 = buildPivot({
    id: slugify(`${industry}-enablement-lead`) || 'enablement-lead',
    title: `${industry} Enablement Lead`,
    fitSummary: 'This path is optimized for faster cash recovery. It works when your current background already includes training others, improving how teams work, or turning messy operational knowledge into repeatable playbooks.',
    outcome: 'You move toward a role that can monetize quickly through enablement, internal transformation work, or scoped consulting-style projects tied to workflow improvement.',
    decisionFrame: 'fastest cash recovery',
    whoThisIsFor: 'Best for someone who needs a believable near-term move, can package practical workflow knowledge quickly, and wants a path that can create income without waiting for a full identity reset.',
    tradeoffs: [
      'Can create faster income or internal traction, but may feel less prestigious than the highest-upside paths at first.',
      'You need tangible proof assets quickly, because this path is won through visible usefulness rather than title prestige.',
    ],
    whyThisPathWins: 'It turns hard-earned practical knowledge into something employers or clients can buy quickly: clearer processes, faster onboarding, and better AI-assisted execution.',
    whatYouAreBettingOn: 'You are betting that teams will pay sooner for workflow clarity and enablement than for a bigger title leap.',
    matchScore: clamp(81 - Math.max(taskBreakdown.length - 5, 0) * 2, 69, 86),
    salaryRange: '$92K – $132K/year',
    salaryDelta: '+10% above median, with room for contract or advisory income',
    transitionTime: '4–8 weeks with focused proof-building (~6hrs/week)',
    difficulty: 'Medium',
    strengths: ['Practical process knowledge', 'Communication', 'Training instinct', 'Operational empathy'],
    skillGaps: pivot4SkillGaps,
    weeks: buildPivotWeeks(`${industry} Enablement Lead`, pivot4SkillGaps),
  });

  const pivot4 = buildPivot({
    id: slugify('ai-program-manager') || 'ai-program-manager',
    title: 'AI Program Manager',
    fitSummary: 'This is the more ambitious path for users who can already influence people, coordinate work, and operate with strategic context. It is strongest when your current role already includes translation between teams, priorities, and systems.',
    outcome: 'You move from doing the work into helping teams adopt AI, sequence change well, and build operating leverage across functions.',
    decisionFrame: 'highest upside',
    whoThisIsFor: 'Best for someone with visible stakeholder range, stronger strategic instincts, and enough confidence to trade a safer adjacent move for a more ambitious role shift.',
    tradeoffs: [
      'Highest upside of the three, but it asks for more positioning work and more visible proof of strategic influence.',
      'Takes longer to make believable if your current resume still reads as primarily execution-only.',
    ],
    whyThisPathWins: 'It gives the user the clearest route to higher leverage and compensation by moving them from doing the work into shaping how teams adopt and govern it.',
    whatYouAreBettingOn: 'You are betting that cross-functional leadership, AI adoption judgment, and change sequencing will become scarcer and more valuable than direct execution alone.',
    matchScore: clamp(78 - Math.max(taskBreakdown.length - 5, 0) * 2, 64, 83),
    salaryRange: '$110K – $155K/year',
    salaryDelta: '+28% above median for your current field',
    transitionTime: '4–6 months with consistent effort (~8hrs/week)',
    difficulty: 'High',
    strengths: ['Stakeholder communication', 'Project context', 'Execution insight'],
    skillGaps: pivot3SkillGaps,
    weeks: buildPivotWeeks('AI Program Manager', pivot3SkillGaps),
  });

  const pivot5 = buildPivot({
    id: slugify('workflow-automation-consultant') || 'workflow-automation-consultant',
    title: 'Workflow Automation Consultant',
    fitSummary: 'This is the longer compounding bet. It fits people who can already see patterns across tools, teams, and recurring work, and who want to move toward designing the operating system instead of only improving one job at a time.',
    outcome: 'You position yourself for a role family that compounds as organizations keep redesigning workflows around AI, automation, governance, and system ownership.',
    decisionFrame: 'long-term platform bet',
    whoThisIsFor: 'Best for someone willing to invest in a longer setup period in exchange for a role family that should keep getting stronger as AI adoption deepens.',
    tradeoffs: [
      'The setup period is longer because you need stronger systems-level proof, not just one-off wins.',
      'This path can feel less immediately legible than a safer adjacent role unless you explain the system value clearly.',
    ],
    whyThisPathWins: 'It shifts the user into a role family built around workflow architecture, durable process leverage, and the ability to redesign how work happens as tools keep changing.',
    whatYouAreBettingOn: 'You are betting that platform-level workflow design and governance will compound faster than any single tool specialization.',
    matchScore: clamp(76 - Math.max(taskBreakdown.length - 5, 0) * 2, 65, 82),
    salaryRange: '$115K – $165K/year',
    salaryDelta: '+22% above median for transformation-oriented roles',
    transitionTime: '4–7 months with consistent systems-level proof (~7hrs/week)',
    difficulty: 'High',
    strengths: ['Systems awareness', 'Pattern recognition', 'Cross-team judgment'],
    skillGaps: pivot5SkillGaps,
    weeks: buildPivotWeeks('Workflow Automation Consultant', pivot5SkillGaps),
  });

  const pivots = [pivot1, pivot2, pivot3, pivot4, pivot5];
  const featuredPivot = pivot1;

  return {
    locale,
    generation_stage: 'full_complete',
    schema_version: 'pivotiq-structured-report-v1',
    generated_at: new Date().toISOString(),
    profile: {
      locale,
      job_title: jobTitle,
      industry,
      tasks: selectedTasks,
      selected_tasks: Array.isArray(intakeProfile?.selected_tasks) ? intakeProfile.selected_tasks : selectedTasks.map((task) => ({ label: task })),
      primary_tasks: primaryTasks,
      clarifiers: {
        role_blend: roleBlend,
        management_scope: managementScope,
      },
      linkedin_profile_url: intakeProfile?.linkedin_profile_url || null,
    },
    summary: {
      overall_score: overallScore,
      risk_level: riskLevel,
      displacement_timeline: displacementTimeline,
      narrative: `${jobTitle} in ${industry} is most exposed where work is repeatable, document-heavy, or easy to accelerate with AI. The biggest pressure points here are ${topTasks.join(' and ')}, with special attention to your time-heavy work in ${primaryTaskSummary || topTasks.join(' and ')}. But this is not a blanket “your role is disappearing” story. It is a narrower story about which layers of the role are weakening first, and which layers still become more valuable when teams need judgment, coordination, and ownership.`,
      what_this_means: `The right response is not a vague upskilling sprint. It is a sequenced pivot plan that starts with the riskiest work in your current ${roleBlendLabel} role and maps each problem to a visible, employable capability shift. ${strengthLine}${leadershipContext}`,
    },
    interpretation: {
      role_read: `Your role is being repriced unevenly. The repetitive, document-heavy layer of the work is weakening first, while the parts that depend on prioritization, judgment, and cross-functional trust still carry leverage.`,
      durable_advantages: [
        `You already understand the business context behind ${primaryTasks[0] || selectedTasks[0] || 'the work'}, which is harder to replace than the output itself.`,
        roleBlend === 'strategy'
          ? 'You likely have stronger decision-framing instincts than the average specialist moving into AI-heavy workflows.'
          : 'You are close enough to the day-to-day work to spot where AI helps, where it breaks, and where oversight still matters.',
        managementScope && managementScope !== 'none'
          ? 'You can combine execution changes with people judgment, which becomes more valuable as teams adopt AI unevenly.'
          : 'You already have transferable proof in the form of stakeholder communication, coordination, and delivery judgment.',
      ],
      stop_assuming: `Do not treat this as proof that your whole ${jobTitle} role is fading. The stronger conclusion is that some tasks inside it are losing value faster than the judgment layer around them.`,
    },
    task_breakdown: taskBreakdown,
    pivots,
    skill_gaps: featuredPivot.skill_gaps,
    roadmap: {
      cadence: 'weekly',
      total_weeks: 12,
      weeks: featuredPivot.roadmap.weeks,
    },
    next_move: {
      title: locale === 'nl' ? 'Jouw stap deze week' : locale === 'de' ? 'Dein Schritt diese Woche' : 'Your move this week',
      explanation: `Pick one of your top weekly tasks${primaryTasks[0] ? `, starting with ${primaryTasks[0]}` : ''}, and rebuild it with AI before Friday. Measure the time saved, note what quality controls were still needed, and use that as the first proof point in your transition story. That one experiment gives you a clearer answer than another week of passive research.`,
    },
    decision: buildDecisionSignal({ overall_score: overallScore }, featuredPivot),
    career_roi: buildCareerRoi({ overall_score: overallScore }, featuredPivot),
    stay_and_advance: buildStayAndAdvance({
      job_title: jobTitle,
      industry,
      primary_tasks: primaryTasks,
      tasks: selectedTasks,
    }, { overall_score: overallScore }, featuredPivot, locale),
    first_30_days: buildFirst30Days({
      primary_tasks: primaryTasks,
      tasks: selectedTasks,
    }, featuredPivot, { weeks: featuredPivot.roadmap.weeks }, {
      explanation: `Pick one of your top weekly tasks${primaryTasks[0] ? `, starting with ${primaryTasks[0]}` : ''}, and rebuild it with AI before Friday. Measure the time saved, note what quality controls were still needed, and use that as the first proof point in your transition story. That one experiment gives you a clearer answer than another week of passive research.`,
    }),
  };
}

export function normalizeReportData(reportData, fallbackProfile = null) {
  if (!reportData || typeof reportData !== 'object') return null;

  const profile = reportData.profile || fallbackProfile || {};
  const locale = reportData.locale || profile.locale || 'en';
  const fallback = buildDemoReportData(
    profile.job_title || profile.jobTitle || '',
    profile.industry || '',
    Array.isArray(profile.tasks) ? profile.tasks : [],
    profile,
    locale
  );
  const incomingPivots = Array.isArray(reportData.pivots) ? reportData.pivots : [];
  const fallbackPivots = Array.isArray(fallback.pivots) ? fallback.pivots : [];
  const pivots = DEFAULT_PIVOT_DECISION_FRAMES.map((frame, index) => {
    const matchingIncoming = incomingPivots.find((pivot) => normalizeText(pivot?.decision_frame) === frame);
    const positionalIncoming = incomingPivots[index];
    const basePivot = fallbackPivots[index] || fallbackPivots[0] || null;
    const sourcePivot = matchingIncoming || positionalIncoming || basePivot;

    if (!sourcePivot) return null;

    return {
      ...(basePivot || {}),
      ...sourcePivot,
      decision_frame: frame,
      tradeoffs: Array.isArray(sourcePivot.tradeoffs) && sourcePivot.tradeoffs.length
        ? sourcePivot.tradeoffs
        : basePivot?.tradeoffs || [],
      skill_gaps: Array.isArray(sourcePivot.skill_gaps) && sourcePivot.skill_gaps.length
        ? sourcePivot.skill_gaps
        : basePivot?.skill_gaps || [],
      strengths_to_leverage: Array.isArray(sourcePivot.strengths_to_leverage) && sourcePivot.strengths_to_leverage.length
        ? sourcePivot.strengths_to_leverage
        : basePivot?.strengths_to_leverage || [],
      roadmap: {
        weeks: Array.isArray(sourcePivot?.roadmap?.weeks) && sourcePivot.roadmap.weeks.length
          ? sourcePivot.roadmap.weeks
          : basePivot?.roadmap?.weeks || [],
      },
    };
  }).filter(Boolean);
  const defaultPivot = pivots[0] || null;
  const summary = {
    overall_score: Number(reportData.summary?.overall_score || 0),
    risk_level: reportData.summary?.risk_level || 'MODERATE',
    displacement_timeline: reportData.summary?.displacement_timeline || '',
    narrative: reportData.summary?.narrative || '',
    what_this_means: reportData.summary?.what_this_means || '',
  };
  const decision = reportData.decision && typeof reportData.decision === 'object'
    ? { ...buildDecisionSignal(summary, defaultPivot), ...reportData.decision }
    : buildDecisionSignal(summary, defaultPivot);
  const careerRoi = reportData.career_roi && typeof reportData.career_roi === 'object'
    ? { ...buildCareerRoi(summary, defaultPivot), ...reportData.career_roi }
    : buildCareerRoi(summary, defaultPivot);
  const stayAndAdvance = reportData.stay_and_advance && typeof reportData.stay_and_advance === 'object'
    ? { ...buildStayAndAdvance(profile, summary, defaultPivot, locale), ...reportData.stay_and_advance }
    : buildStayAndAdvance(profile, summary, defaultPivot, locale);
  const stayPath = buildStayAdvancePath(profile, summary, stayAndAdvance, defaultPivot, locale);
  const first30Days = reportData.first_30_days && typeof reportData.first_30_days === 'object'
    ? { ...buildFirst30Days(profile, defaultPivot, reportData.roadmap, reportData.next_move), ...reportData.first_30_days }
    : buildFirst30Days(profile, defaultPivot, reportData.roadmap, reportData.next_move);

  return {
    locale,
    generation_stage: reportData.generation_stage || fallback.generation_stage || 'full_complete',
    schema_version: reportData.schema_version || 'pivotiq-structured-report-v1',
    generated_at: reportData.generated_at || new Date().toISOString(),
    profile: {
      job_title: profile.job_title || profile.jobTitle || '',
      industry: profile.industry || '',
      tasks: Array.isArray(profile.tasks) ? profile.tasks : [],
      selected_tasks: Array.isArray(profile.selected_tasks) ? profile.selected_tasks : [],
      primary_tasks: Array.isArray(profile.primary_tasks) ? profile.primary_tasks : [],
      clarifiers: profile.clarifiers && typeof profile.clarifiers === 'object' ? profile.clarifiers : {},
      linkedin_profile_url: profile.linkedin_profile_url || null,
    },
    summary,
    interpretation: {
      role_read: reportData.interpretation?.role_read || '',
      durable_advantages: Array.isArray(reportData.interpretation?.durable_advantages) ? reportData.interpretation.durable_advantages : [],
      stop_assuming: reportData.interpretation?.stop_assuming || '',
    },
    task_breakdown: Array.isArray(reportData.task_breakdown)
      ? reportData.task_breakdown.map((task) => ({
          ...task,
          task_name: translateFallbackTask(locale, task.task_name),
        }))
      : [],
    pivots: pivots.map((pivot) => ({
      ...pivot,
      decision_frame: pivot.decision_frame || 'safest transition',
      who_this_is_for: pivot.who_this_is_for || '',
      tradeoffs: Array.isArray(pivot.tradeoffs) ? pivot.tradeoffs : [],
      why_this_path_wins: pivot.why_this_path_wins || '',
      what_you_are_betting_on: pivot.what_you_are_betting_on || '',
    })),
    skill_gaps: Array.isArray(reportData.skill_gaps)
      ? reportData.skill_gaps
      : defaultPivot?.skill_gaps || [],
    roadmap: {
      cadence: reportData.roadmap?.cadence || 'weekly',
      total_weeks: Number(reportData.roadmap?.total_weeks || defaultPivot?.roadmap?.weeks?.length || 12),
      weeks: Array.isArray(reportData.roadmap?.weeks)
        ? reportData.roadmap.weeks
        : defaultPivot?.roadmap?.weeks || [],
    },
    next_move: {
      title: reportData.next_move?.title || fallback.next_move?.title || 'Your move this week',
      explanation: reportData.next_move?.explanation || '',
    },
    decision,
    career_roi: careerRoi,
    stay_and_advance: {
      headline: stayAndAdvance?.headline || '',
      recommendation: stayAndAdvance?.recommendation || '',
      rationale: stayAndAdvance?.rationale || '',
      urgency_label: stayAndAdvance?.urgency_label || '',
      leverage_opportunities: Array.isArray(stayAndAdvance?.leverage_opportunities) ? stayAndAdvance.leverage_opportunities : [],
      promotion_path: {
        next_title: stayAndAdvance?.promotion_path?.next_title || '',
        why_it_opens: stayAndAdvance?.promotion_path?.why_it_opens || '',
        timeline: stayAndAdvance?.promotion_path?.timeline || '',
        signals_to_build: Array.isArray(stayAndAdvance?.promotion_path?.signals_to_build) ? stayAndAdvance.promotion_path.signals_to_build : [],
      },
      work_redesign: {
        automate: Array.isArray(stayAndAdvance?.work_redesign?.automate) ? stayAndAdvance.work_redesign.automate : [],
        augment: Array.isArray(stayAndAdvance?.work_redesign?.augment) ? stayAndAdvance.work_redesign.augment : [],
        protect: Array.isArray(stayAndAdvance?.work_redesign?.protect) ? stayAndAdvance.work_redesign.protect : [],
        lead: Array.isArray(stayAndAdvance?.work_redesign?.lead) ? stayAndAdvance.work_redesign.lead : [],
      },
      thirty_day_plan: {
        this_week: Array.isArray(stayAndAdvance?.thirty_day_plan?.this_week) ? stayAndAdvance.thirty_day_plan.this_week : [],
        this_month: Array.isArray(stayAndAdvance?.thirty_day_plan?.this_month) ? stayAndAdvance.thirty_day_plan.this_month : [],
        metric_to_move: stayAndAdvance?.thirty_day_plan?.metric_to_move || '',
        leadership_narrative: stayAndAdvance?.thirty_day_plan?.leadership_narrative || '',
        proof_asset: {
          title: stayAndAdvance?.thirty_day_plan?.proof_asset?.title || '',
          description: stayAndAdvance?.thirty_day_plan?.proof_asset?.description || '',
          why_it_matters: stayAndAdvance?.thirty_day_plan?.proof_asset?.why_it_matters || '',
        },
      },
    },
    stay_path: {
      ...stayPath,
      tradeoffs: Array.isArray(stayPath?.tradeoffs) ? stayPath.tradeoffs : [],
      strengths_to_leverage: Array.isArray(stayPath?.strengths_to_leverage) ? stayPath.strengths_to_leverage : [],
      skill_gaps: Array.isArray(stayPath?.skill_gaps) ? stayPath.skill_gaps : [],
      roadmap: {
        weeks: Array.isArray(stayPath?.roadmap?.weeks) ? stayPath.roadmap.weeks : [],
      },
    },
    first_30_days: {
      next_7_days: Array.isArray(first30Days?.next_7_days) ? first30Days.next_7_days : [],
      next_30_days: Array.isArray(first30Days?.next_30_days) ? first30Days.next_30_days : [],
      avoid: Array.isArray(first30Days?.avoid) ? first30Days.avoid : [],
      proof_asset: {
        title: first30Days?.proof_asset?.title || '',
        description: first30Days?.proof_asset?.description || '',
        why_it_matters: first30Days?.proof_asset?.why_it_matters || '',
      },
    },
  };
}

export function reportDataToEmailHtml(reportData) {
  const normalized = normalizeReportData(reportData);
  if (!normalized) return '';

  const { profile, summary, pivots, roadmap, next_move: nextMove } = normalized;
  const featuredPivot = pivots[0];
  const topWeeks = (roadmap.weeks || []).slice(0, 4);

  return `
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#6366F1;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">WHAT WE FOUND</p>
      <h2 style="color:white;font-size:24px;font-weight:900;margin:0 0 6px;">${summary.overall_score} · ${summary.risk_level} risk</h2>
      <p style="color:#9CA3AF;font-size:14px;line-height:1.7;margin:0 0 10px;">${profile.job_title} · ${profile.industry}</p>
      <p style="color:#C4C9D4;font-size:14px;line-height:1.8;margin:0 0 12px;">${summary.narrative}</p>
      <p style="color:#818CF8;font-size:13px;line-height:1.7;margin:0;">⏱ ${summary.displacement_timeline}</p>
    </div>
    ${
      featuredPivot
        ? `
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#10B981;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">BEST FIT PIVOT</p>
      <h3 style="color:white;font-size:22px;font-weight:800;margin:0 0 8px;">${featuredPivot.title}</h3>
      <p style="color:#C4C9D4;font-size:14px;line-height:1.8;margin:0 0 12px;">${featuredPivot.fit_summary}</p>
      <p style="color:#9CA3AF;font-size:13px;line-height:1.7;margin:0;">${featuredPivot.salary_range} · ${featuredPivot.transition_time} · ${featuredPivot.difficulty} difficulty</p>
    </div>`
        : ''
    }
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#F97316;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">FIRST MILESTONES</p>
      ${topWeeks.map((week) => `
        <div style="padding:14px 0;border-top:1px solid #1A2540;">
          <div style="color:white;font-size:15px;font-weight:700;margin-bottom:4px;">Week ${week.week_number}: ${week.title}</div>
          <div style="color:#818CF8;font-size:12px;font-weight:700;margin-bottom:6px;">Goal: ${week.goal}</div>
          <div style="color:#C4C9D4;font-size:13px;line-height:1.7;">${week.why_this_week}</div>
        </div>
      `).join('')}
    </div>
    <div style="background:#0F1828;border:1px solid #1A2540;border-radius:20px;padding:28px;margin-bottom:20px;">
      <p style="color:#F1F5F9;font-size:11px;font-weight:800;letter-spacing:2.5px;text-transform:uppercase;margin:0 0 16px;">YOUR MOVE THIS WEEK</p>
      <p style="color:#C7D2FE;font-size:14px;line-height:1.8;margin:0;">${nextMove.explanation}</p>
    </div>
  `;
}
