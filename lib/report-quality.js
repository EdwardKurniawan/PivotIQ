function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function inferSpecializedFamily(reportData) {
  const profile = reportData?.profile || {};
  const title = normalizeText(profile.job_title);
  const text = normalizeText([
    profile.job_title,
    profile.industry,
    ...normalizeArray(profile.tasks),
    ...normalizeArray(profile.primary_tasks),
    profile.clarifiers?.domain_focus,
  ].join(' '));

  if (/\b(hr business partner|human resources business partner|people business partner)\b/.test(title)) return 'hr';
  if (/\b(fp&a analyst|fpa analyst|finance analyst|commercial finance)\b/.test(title)) return 'finance';
  if (/\b(project manager|program manager|pmo manager)\b/.test(title)) return 'operations';
  if (/\b(procurement|sourcing|supplier|vendor|spend|category|supply chain|purchasing)\b/.test(title)) return 'procurement';
  if (/\b(legal|contract|compliance|privacy|governance|policy|clm)\b/.test(title)) return 'legal';
  if (/\b(education|learning|enablement|training|instructional|curriculum|onboarding)\b/.test(title)) return 'education';
  if (/\b(marketing|growth|brand|gtm|go to market|product marketing|demand gen)\b/.test(title)) return 'marketing';
  if (/\b(customer success|account management|customer operations|customer education|renewal)\b/.test(title)) return 'customer';
  if (/\b(data analyst|business intelligence|analytics|reporting analyst|power bi|tableau|looker|sql analyst)\b/.test(title)) return 'analytics';
  if (/\b(legal|contract|compliance|privacy|governance|policy|clm)\b/.test(text)) return 'legal';
  if (/\b(procurement|sourcing|supplier|vendor|spend|category|supply chain|purchasing)\b/.test(text)) return 'procurement';
  if (/\b(education|learning|enablement|training|instructional|curriculum|onboarding)\b/.test(text)) return 'education';
  if (/\b(marketing|growth|brand|gtm|go to market|product marketing|demand gen)\b/.test(text)) return 'marketing';
  if (/\b(customer success|account management|customer operations|customer education|renewal)\b/.test(text)) return 'customer';
  if (/\b(data analyst|business intelligence|analytics|reporting analyst|power bi|tableau|looker|sql analyst)\b/.test(text)) return 'analytics';
  if (/\b(finance|financial|fp&a|fpa|forecast|budget|pricing|commercial finance)\b/.test(title)) return 'finance';
  if (/\b(project manager|program manager|operations|delivery|implementation|pmo|change management)\b/.test(title)) return 'operations';
  if (/\b(hr|human resources|people operations|people partner|talent|workforce|employee relations|recruiter)\b/.test(title)) return 'hr';
  if (/\b(finance|financial|fp&a|fpa|forecast|budget|pricing|commercial finance)\b/.test(text)) return 'finance';
  if (/\b(project manager|program manager|operations|delivery|implementation|pmo|change management)\b/.test(text)) return 'operations';
  if (/\b(hr|human resources|people operations|people partner|talent|workforce|employee relations|recruiter)\b/.test(text)) return 'hr';
  return '';
}

function titleMatchesFamily(title, family) {
  const normalized = normalizeText(title);
  if (!family) return true;
  if (family === 'legal') return /\b(legal|contract|contracts|compliance|clm|policy|governance|privacy)\b/.test(normalized);
  if (family === 'procurement') return /\b(procurement|sourcing|supplier|vendor|spend|category|supply chain|purchasing)\b/.test(normalized);
  if (family === 'education') return /\b(customer education|education|learning|enablement|training|instructional|curriculum|onboarding)\b/.test(normalized);
  if (family === 'finance') return /\b(finance|financial|fp&a|fpa|forecast|budget|pricing|commercial finance)\b/.test(normalized);
  if (family === 'operations') return /\b(operations|program|project|delivery|implementation|pmo|change management)\b/.test(normalized);
  if (family === 'hr') return /\b(people|hr|human resources|talent|workforce|employee)\b/.test(normalized);
  if (family === 'marketing') return /\b(marketing|growth|brand|gtm|product marketing|demand gen)\b/.test(normalized);
  if (family === 'customer') return /\b(customer|account|renewal|success|enablement)\b/.test(normalized);
  if (family === 'analytics') return /\b(data|analytics|business intelligence|insights|reporting|bi)\b/.test(normalized);
  return true;
}

function titleMatchesCanonicalFamily(title, family) {
  const normalized = normalizeText(title);
  if (!family) return true;
  if (family === 'legal') return /\b(legal operations|contract lifecycle|contract operations|contract management|legal technology|compliance operations|compliance analyst|compliance manager|compliance risk)\b/.test(normalized);
  if (family === 'procurement') return /\b(procurement|strategic sourcing|supplier|spend|supply chain)\b/.test(normalized);
  if (family === 'education') return /\b(customer education|learning operations|enablement program|instructional design|learning experience|curriculum|onboarding|education lead|learning and development|customer success enablement)\b/.test(normalized);
  if (family === 'finance') return /\b(finance planning lead|finance business partner|strategic finance analyst|commercial finance analyst|fp&a manager|finance systems manager|pricing strategy manager|revenue planning manager)\b/.test(normalized);
  if (family === 'operations') return /\b(program operations manager|project operations manager|delivery operations manager|change management lead|pmo manager|portfolio operations manager|workflow operations manager)\b/.test(normalized);
  if (family === 'hr') return /\b(people operations manager|people operations lead|workforce planning manager|talent operations manager|manager enablement lead|hr operations manager)\b/.test(normalized);
  if (family === 'marketing') return /\b(product marketing manager|marketing strategy lead|marketing operations lead|growth strategy lead|gtm strategy lead|revenue marketing lead)\b/.test(normalized);
  if (family === 'customer') return /\b(customer strategy lead|customer success strategy lead|customer operations lead|customer success director|customer success manager|account strategy lead|customer enablement lead)\b/.test(normalized);
  if (family === 'analytics') return /\b(business intelligence lead|business intelligence manager|analytics manager|analytics strategy manager|analytics operations lead|customer insights manager|customer insights lead|revenue operations analyst)\b/.test(normalized);
  return true;
}

function skillIsAiSpecific(skill) {
  const text = normalizeText([skill?.skill_name, skill?.category, skill?.how_to_close_gap].join(' '));
  return /\b(ai|prompt|llm|automation|copilot|chatgpt|claude)\b/.test(text);
}

function isGenericAiResource(skill) {
  const resource = normalizeText([skill?.resource_title, skill?.resource_provider, skill?.resource_url].join(' '));
  if (!resource) return false;
  return /\b(ai for everyone|openai cookbook|microsoft learn ai|copilot learning|prompt engineering overview)\b/.test(resource);
}

function isNegativeTopRankingCopy(pivot) {
  return /\b(pushed down|discounted|penalized)\b/i.test(String(pivot?.ranking_reason || pivot?.live_market_signal?.ranking_reason || ''));
}

function positiveTopRankingCopy(pivot) {
  const signal = pivot?.live_market_signal || {};
  const openings = Number(signal.matched_openings_count || 0);
  const fit = Number(signal.profile_fit_score || 0);

  if (!openings) {
    return 'This pivot ranks first because it is the most role-native path in the final recommendation set, but it should still be verified against more live postings.';
  }

  if (fit >= 35) {
    return 'This pivot ranks first because it has the strongest blend of role fit, live-market evidence, and credible next-step skill gaps.';
  }

  return 'This pivot ranks first because live postings support the role direction, even though the user still needs visible proof for several required skills.';
}

function secondaryRankingCopy(pivot) {
  const signal = pivot?.live_market_signal || {};
  const openings = Number(signal.matched_openings_count || 0);

  if (openings) {
    return 'This pivot remains a secondary option because live postings show real demand, but the final featured recommendation is a cleaner fit right now.';
  }

  return 'This pivot remains a secondary option because it is plausible from the model analysis, but it needs more live-market verification before becoming the featured recommendation.';
}

function cleanSkillName(skillName) {
  const value = String(skillName || '').trim();
  const normalized = normalizeText(value);
  if (!value) return value;

  if (normalized.includes('compliance') && normalized.includes('customer trust') && normalized.includes('kpi')) {
    return 'Compliance and customer trust KPI reporting';
  }
  if (normalized.includes('contract lifecycle')) {
    return 'Contract lifecycle management';
  }
  if (normalized.includes('procurement') && normalized.includes('analytics')) {
    return 'Procurement analytics';
  }
  if (normalized.includes('enablement') && normalized.includes('program')) {
    return 'Enablement program design';
  }

  const words = value.split(/\s+/).filter(Boolean);
  if (words.length > 7 || value.length > 68) {
    return words.slice(0, 6).join(' ');
  }

  return value;
}

function cleanReportText(value, repairs) {
  if (typeof value === 'string') {
    const cleaned = value
      .replaceAll('Develop And Report On Compliance And Customer Trust Kpis', 'Compliance and customer trust KPI reporting')
      .replaceAll('Aml/ctf', 'AML/CTF')
      .replaceAll('Aml/Ctf', 'AML/CTF');
    if (cleaned !== value) repairs.push('Cleaned overlong market-skill phrasing in report text.');
    return cleaned;
  }
  if (Array.isArray(value)) return value.map((item) => cleanReportText(item, repairs));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cleanReportText(item, repairs)])
    );
  }
  return value;
}

function cleanSkillGap(skill, warnings, repairs) {
  let nextSkill = { ...skill };
  const cleanedName = cleanSkillName(nextSkill.skill_name);

  if (cleanedName && cleanedName !== nextSkill.skill_name) {
    warnings.push('Simplified an overlong skill gap name.');
    repairs.push('Simplified overlong skill gap names.');
    nextSkill.skill_name = cleanedName;
  }

  if (isGenericAiResource(nextSkill) && !skillIsAiSpecific(nextSkill)) {
    warnings.push(`Removed generic AI resource from non-AI gap: ${nextSkill.skill_name || 'unknown skill'}.`);
    repairs.push('Removed generic non-specific learning resource.');
    nextSkill = {
      ...nextSkill,
      resource_title: '',
      resource_url: '',
      resource_provider: '',
      resource_access: '',
      resource_verified: false,
      resource_verification_status: 'quality-gate-removed',
    };
  }

  return nextSkill;
}

function repairFamilyTopSkill(reportData, family, warnings, repairs) {
  const topPivot = normalizeArray(reportData?.pivots)[0];
  const topSkill = normalizeArray(topPivot?.skill_gaps)[0];
  if (!topPivot || !topSkill) return reportData;

  const normalizedSkill = normalizeText(topSkill.skill_name);
  if (family === 'procurement' && normalizedSkill.includes('contract lifecycle')) {
    repairs.push('Replaced procurement top skill with a more role-native procurement analytics skill.');
    const repairedReport = {
      ...reportData,
      pivots: reportData.pivots.map((pivot, pivotIndex) => {
        if (pivotIndex !== 0) return pivot;
        return {
          ...pivot,
          skill_gaps: normalizeArray(pivot.skill_gaps).map((skill, skillIndex) => (
            skillIndex === 0
              ? {
                  ...skill,
                  skill_name: 'Procurement analytics',
                  category: skill.category || 'domain',
                  required_level: 'Can analyze spend, supplier performance, sourcing tradeoffs, and procurement decision signals.',
                  why_it_matters: 'Procurement intelligence roles need evidence that you can turn supplier and spend data into decisions.',
                  evidence_to_build: 'Build a spend or supplier performance scorecard tied to one sourcing recommendation.',
                  how_to_close_gap: 'Practice with procurement and sourcing datasets, then produce one scorecard or decision memo.',
                  resource_title: 'Global Procurement and Sourcing Specialization',
                  resource_provider: 'Coursera',
                  resource_url: 'https://www.coursera.org/specializations/procurement-sourcing',
                  resource_access: 'paid',
                  resource_verified: true,
                }
              : skill
          )),
        };
      }),
    };
    return {
      ...repairedReport,
      first_30_days: buildFirst30DaysFallback(repairedReport, repairedReport.pivots[0]),
    };
  }

  return reportData;
}

function first30DaysMentionsPivot(first30Days, pivotTitle) {
  const normalizedTitle = normalizeText(pivotTitle);
  if (!normalizedTitle) return true;
  const text = normalizeText([
    ...normalizeArray(first30Days?.next_7_days),
    ...normalizeArray(first30Days?.next_30_days),
    first30Days?.proof_asset?.title,
    first30Days?.proof_asset?.description,
  ].join(' '));
  return !text || text.includes(normalizedTitle);
}

function buildFirst30DaysFallback(reportData, pivot) {
  const profile = reportData?.profile || {};
  const topSkill = normalizeArray(pivot?.skill_gaps)[0]?.skill_name || 'one visible skill gap';
  const primaryTask = normalizeArray(profile.primary_tasks)[0] || normalizeArray(profile.tasks)[0] || 'your highest-value task';
  const title = pivot?.title || 'the target role';

  return {
    next_7_days: [
      `Pick one core task this week, starting with ${primaryTask}, and redesign it toward ${title}.`,
      `Review 12 live job descriptions for ${title} and mark repeated responsibilities, tools, and deliverables.`,
      `Choose ${topSkill} as the first skill to close and ignore secondary learning until that is underway.`,
    ],
    next_30_days: [
      `Build one proof asset that demonstrates ${topSkill} in a business context.`,
      `Turn 3 past work examples into proof stories for ${title}.`,
      `Get feedback from 2 people close to ${title} so you can refine the story before investing more time.`,
    ],
    avoid: [
      'Do not start with a broad learning binge before choosing a target path.',
      'Do not collect certificates without producing one visible proof asset.',
      'Do not try to fix every skill gap at once.',
    ],
    proof_asset: {
      title: `${title} proof asset`,
      description: `Create one artifact that shows ${topSkill} applied to a real business problem connected to your background.`,
      why_it_matters: 'This turns learning into visible employability evidence.',
    },
  };
}

function hasProofAssetBuilder(reportData) {
  return Boolean(
    reportData?.proof_asset_builder?.title &&
    normalizeArray(reportData?.proof_asset_builder?.sections).length &&
    normalizeArray(reportData?.proof_asset_builder?.checklist).length
  );
}

function repairTopPivotFamily(reportData, warnings, repairs) {
  const family = inferSpecializedFamily(reportData);
  const topTitle = reportData?.pivots?.[0]?.title;
  if (!family) return reportData;

  const topIsCanonical = titleMatchesCanonicalFamily(topTitle, family);
  const replacementIndex = normalizeArray(reportData.pivots).findIndex((pivot, index) =>
    index > 0 &&
    titleMatchesFamily(pivot?.title, family) &&
    titleMatchesCanonicalFamily(pivot?.title, family)
  );

  if (titleMatchesFamily(topTitle, family) && topIsCanonical) return reportData;

  if (replacementIndex <= 0) {
    warnings.push(`Top pivot title does not match ${family} role family.`);
    return reportData;
  }

  const pivots = [...reportData.pivots];
  const [replacement] = pivots.splice(replacementIndex, 1);
  repairs.push(`Moved ${replacement.title} above off-family top pivot.`);
  return { ...reportData, pivots: [replacement, ...pivots] };
}

function buildFamilyRepairSkill(skill, family) {
  if (family === 'hr') {
    return {
      ...skill,
      skill_name: 'Manager enablement workflow design',
      category: 'workflow',
      why_it_matters: 'HR-adjacent paths need evidence that you can design repeatable manager support and people workflows.',
      how_to_close_gap: 'Map one manager-support or people-operations workflow, then redesign it into a reusable operating play.',
    };
  }
  if (family === 'finance') {
    return {
      ...skill,
      skill_name: 'Scenario modeling',
      category: 'analysis',
      why_it_matters: 'Finance-adjacent paths need evidence that you can translate numbers into decisions under uncertainty.',
      how_to_close_gap: 'Build one scenario model tied to a real planning or pricing decision.',
    };
  }
  if (family === 'operations') {
    return {
      ...skill,
      skill_name: 'Workflow design',
      category: 'workflow',
      why_it_matters: 'Operations-adjacent paths need evidence that you can redesign recurring execution systems.',
      how_to_close_gap: 'Document one recurring operating workflow and rebuild it with clearer handoffs, controls, and automation.',
    };
  }
  return skill;
}

function isOffFamilySkillForFamily(skill, family) {
  const text = normalizeText([skill?.skill_name, skill?.category, skill?.how_to_close_gap].join(' '));
  if (!text || !family) return false;
  if (family === 'hr') return /\b(contract|clause|clm|legal intake|sourcing|supplier|pricing strategy|forecast model)\b/.test(text);
  if (family === 'finance') return /\b(curriculum|instructional|customer success|clause library|legal intake|recruiting)\b/.test(text);
  if (family === 'operations') return /\b(clause library|contract review|curriculum|instructional|supplier sourcing)\b/.test(text);
  return false;
}

export function applyReportQualityGate(reportData) {
  if (!reportData || typeof reportData !== 'object') return reportData;

  const warnings = [];
  const repairs = [];
  const family = inferSpecializedFamily(reportData);
  let nextReport = repairTopPivotFamily(reportData, warnings, repairs);
  const topPivot = normalizeArray(nextReport.pivots)[0] || null;

  if (topPivot && isNegativeTopRankingCopy(topPivot)) {
    const rankingReason = positiveTopRankingCopy(topPivot);
    topPivot.ranking_reason = rankingReason;
    topPivot.live_market_signal = {
      ...(topPivot.live_market_signal || {}),
      ranking_reason: rankingReason,
    };
    repairs.push('Rewrote negative ranking copy on the top pivot.');
  }

  if (Array.isArray(nextReport.pivots)) {
    nextReport.pivots = nextReport.pivots.map((pivot, index) => {
      const nextPivot = {
        ...pivot,
        skill_gaps: normalizeArray(pivot.skill_gaps).map((skill) => cleanSkillGap(skill, warnings, repairs)),
      };
      if (family && index > 0) {
        nextPivot.skill_gaps = nextPivot.skill_gaps.map((skill) => (
          isOffFamilySkillForFamily(skill, family)
            ? buildFamilyRepairSkill(skill, family)
            : skill
        ));
      }
      const copy = `${nextPivot.ranking_reason || ''} ${nextPivot.live_market_signal?.ranking_reason || ''}`;
      const needsSecondaryCopy = index > 0 && /\b(ranks first|pushed down|discounted|penalized)\b/i.test(copy);

      if (needsSecondaryCopy) {
        const rankingReason = secondaryRankingCopy(nextPivot);
        repairs.push('Rewrote confusing ranking copy on secondary pivots.');
        return {
          ...nextPivot,
          ranking_reason: rankingReason,
          live_market_signal: {
            ...(nextPivot.live_market_signal || {}),
            ranking_reason: rankingReason,
          },
        };
      }

      return nextPivot;
    });
  }

  const finalTopPivot = normalizeArray(nextReport.pivots)[0] || topPivot;
  nextReport = repairFamilyTopSkill(nextReport, family, warnings, repairs);
  const finalTopPivotAfterSkillRepair = normalizeArray(nextReport.pivots)[0] || finalTopPivot;
  const shouldRebuildPlanForSkillCleanup = repairs.includes('Simplified overlong skill gap names.');

  if (shouldRebuildPlanForSkillCleanup || !first30DaysMentionsPivot(nextReport.first_30_days, finalTopPivotAfterSkillRepair?.title)) {
    nextReport = {
      ...nextReport,
      first_30_days: buildFirst30DaysFallback(nextReport, finalTopPivotAfterSkillRepair),
    };
    repairs.push(shouldRebuildPlanForSkillCleanup
      ? 'Rebuilt first 30 days after skill-name cleanup.'
      : 'Rebuilt first 30 days to match the final active pivot.');
  }

  if (!normalizeArray(nextReport.first_30_days?.next_7_days).length || !normalizeArray(nextReport.first_30_days?.next_30_days).length) {
    nextReport = {
      ...nextReport,
      first_30_days: buildFirst30DaysFallback(nextReport, finalTopPivotAfterSkillRepair),
    };
    repairs.push('Filled missing first-30-days plan.');
  }

  if (!nextReport.first_30_days?.proof_asset?.title && finalTopPivotAfterSkillRepair) {
    nextReport = {
      ...nextReport,
      first_30_days: {
        ...(nextReport.first_30_days || {}),
        proof_asset: buildFirst30DaysFallback(nextReport, finalTopPivotAfterSkillRepair).proof_asset,
      },
    };
    repairs.push('Filled missing first-30-days proof asset.');
  }

  if (!hasProofAssetBuilder(nextReport)) {
    warnings.push('Proof asset builder is missing or incomplete.');
  }

  if (Array.isArray(nextReport.pivots) && nextReport.pivots[0]?.skill_gaps) {
    nextReport = {
      ...nextReport,
      skill_gaps: nextReport.pivots[0].skill_gaps,
    };
  }
  nextReport = cleanReportText(nextReport, repairs);

  const status = repairs.length ? 'repaired' : warnings.length ? 'warning' : 'passed';
  return {
    ...nextReport,
    active_pivot_id: nextReport.pivots?.[0]?.id || nextReport.active_pivot_id,
    quality_audit: {
      status,
      warnings: [...new Set(warnings)],
      repairs: [...new Set(repairs)],
    },
  };
}
