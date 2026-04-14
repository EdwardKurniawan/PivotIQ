function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
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
  if (family === 'finance') return /\b(finance planning lead|finance business partner|strategic finance analyst|commercial finance analyst|commercial finance manager|fp&a manager|finance systems manager|pricing strategy manager|revenue planning manager)\b/.test(normalized);
  if (family === 'operations') return /\b(program operations manager|program operations lead|project operations manager|delivery operations manager|change management lead|pmo manager|portfolio operations manager|workflow operations manager)\b/.test(normalized);
  if (family === 'hr') return /\b(people operations manager|people operations lead|workforce planning manager|talent operations manager|manager enablement lead|hr operations manager)\b/.test(normalized);
  if (family === 'marketing') return /\b(product marketing manager|marketing strategy lead|marketing operations lead|marketing operations strategist|growth strategy lead|gtm strategy lead|revenue marketing lead)\b/.test(normalized);
  if (family === 'customer') return /\b(customer strategy lead|customer success strategy lead|customer success strategy manager|customer operations lead|customer success director|customer success manager|account strategy lead|customer enablement lead|renewal strategy lead|customer health operations manager)\b/.test(normalized);
  if (family === 'analytics') return /\b(business intelligence lead|business intelligence manager|analytics manager|analytics strategy manager|analytics operations lead|insights operations manager|customer insights manager|customer insights lead|revenue operations analyst)\b/.test(normalized);
  return true;
}

function canonicalFallbackTitleForFamily(family, currentTitle = '') {
  const normalizedCurrent = normalizeText(currentTitle);
  const senior = /\b(director|head|senior|lead)\b/.test(normalizedCurrent);

  if (family === 'customer') return senior ? 'Customer Success Director' : 'Customer Operations Lead';
  if (family === 'marketing') return senior ? 'Revenue Marketing Lead' : 'Marketing Operations Lead';
  if (family === 'operations') return senior ? 'Portfolio Operations Manager' : 'Delivery Operations Manager';
  if (family === 'hr') return senior ? 'People Operations Lead' : 'HR Operations Manager';
  if (family === 'analytics') return senior ? 'Business Intelligence Manager' : 'Business Intelligence Lead';
  if (family === 'finance') return senior ? 'Finance Systems Manager' : 'Finance Business Partner';

  return '';
}

function canonicalAlternativeTitlesForFamily(family, currentTitle = '') {
  const normalizedCurrent = normalizeText(currentTitle);
  const senior = /\b(director|head|senior|lead)\b/.test(normalizedCurrent);

  if (family === 'operations') {
    return senior
      ? ['Portfolio Operations Manager', 'Program Operations Lead', 'Delivery Operations Manager', 'PMO Manager', 'Workflow Operations Manager', 'Project Operations Manager', 'Change Management Lead']
      : ['Delivery Operations Manager', 'Program Operations Manager', 'Project Operations Manager', 'Workflow Operations Manager', 'PMO Manager', 'Program Operations Lead', 'Change Management Lead'];
  }

  if (family === 'customer') {
    return senior
      ? ['Customer Success Strategy Manager', 'Customer Operations Lead', 'Customer Enablement Lead', 'Account Strategy Lead', 'Renewal Strategy Lead', 'Customer Health Operations Manager']
      : ['Customer Operations Lead', 'Customer Success Strategy Manager', 'Customer Enablement Lead', 'Account Strategy Lead', 'Renewal Strategy Lead', 'Customer Health Operations Manager'];
  }

  if (family === 'finance') {
    return senior
      ? ['Finance Systems Manager', 'Finance Business Partner', 'Strategic Finance Analyst', 'Commercial Finance Manager', 'FP&A Manager', 'Revenue Planning Manager', 'Pricing Strategy Manager']
      : ['Finance Business Partner', 'Finance Systems Manager', 'Strategic Finance Analyst', 'Commercial Finance Manager', 'FP&A Manager', 'Revenue Planning Manager', 'Pricing Strategy Manager'];
  }

  if (family === 'marketing') {
    return senior
      ? ['Marketing Operations Lead', 'Marketing Strategy Lead', 'Product Marketing Manager', 'Growth Strategy Lead', 'Revenue Marketing Lead', 'Marketing Operations Strategist', 'GTM Strategy Lead']
      : ['Marketing Operations Lead', 'Marketing Operations Strategist', 'Product Marketing Manager', 'Growth Strategy Lead', 'Marketing Strategy Lead', 'Revenue Marketing Lead', 'GTM Strategy Lead'];
  }

  if (family === 'analytics') {
    return senior
      ? ['Analytics Manager', 'Business Intelligence Manager', 'Analytics Operations Lead', 'Analytics Strategy Manager', 'Insights Operations Manager', 'Customer Insights Manager', 'Business Intelligence Lead']
      : ['Business Intelligence Lead', 'Analytics Operations Lead', 'Analytics Strategy Manager', 'Analytics Manager', 'Insights Operations Manager', 'Customer Insights Manager', 'Business Intelligence Manager'];
  }

  return [];
}

function titleOvershootsCurrentProfile(title, reportData) {
  const currentTitle = normalizeText(reportData?.profile?.job_title);
  const targetTitle = normalizeText(title);
  if (!currentTitle || !targetTitle) return false;

  const currentIsExecutive = /\b(director|head|vp|vice president|chief)\b/.test(currentTitle);
  const targetIsExecutive = /\b(director|head|vp|vice president|chief)\b/.test(targetTitle);

  if (!currentIsExecutive && targetIsExecutive) return true;
  if (!/\blead\b/.test(currentTitle) && /\b(head|vp|vice president|chief)\b/.test(targetTitle)) return true;

  return false;
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
  const topSkills = normalizeArray(topPivot?.skill_gaps);
  if (!topPivot || !topSkills.length || !family) return reportData;

  const priorityPattern = family === 'customer'
    ? /\b(salesforce|hubspot|gainsight|crm|health score|segmentation|renewal model|workflow automation|sql)\b/
    : family === 'marketing'
      ? /\b(hubspot|marketo|google analytics|ga4|attribution|lifecycle|crm|sql|experimentation|campaign automation)\b/
      : family === 'finance'
        ? /\b(sql|power bi|erp|scenario model|financial model|planning model|forecast model)\b/
        : family === 'analytics'
          ? /\b(sql|python|snowflake|bigquery|dbt|etl|elt|warehouse|tableau|looker|power bi|data model|database architecture)\b/
          : family === 'operations'
            ? /\b(automation|integration|api|workflow|handoff|power automate|zapier|airtable)\b/
            : family === 'hr'
              ? /\b(workday|hris|people analytics|workflow automation)\b/
              : null;

  const filtered = topSkills.filter((skill) => !isOffFamilySkillForFamily(skill, family));
  const candidateSkills = filtered;
  const reordered = [...candidateSkills].sort((left, right) => {
    const leftText = normalizeText([left?.skill_name, left?.category, left?.how_to_close_gap].join(' '));
    const rightText = normalizeText([right?.skill_name, right?.category, right?.how_to_close_gap].join(' '));

    const score = (skill, text) => {
      let value = 0;
      if (skill?.market_backed) value += 30;
      if (skill?.tool_backed) value += 12;
      if (priorityPattern?.test(text)) value += 16;
      if (normalizeText(skill?.gap_priority) === 'critical') value += 10;
      if (normalizeText(skill?.gap_priority) === 'medium') value += 4;
      if (/business process management/i.test(String(skill?.resource_title || '')) && !skill?.market_backed) value -= 14;
      if (/\b(process design|business process management)\b/.test(text) && !skill?.market_backed) value -= 8;
      if (isGenericAiResource(skill) && !skillIsAiSpecific(skill)) value -= 20;
      return value;
    };

    const diff = score(right, rightText) - score(left, leftText);
    if (diff !== 0) return diff;
    return String(left?.skill_name || '').localeCompare(String(right?.skill_name || ''));
  });

  const changed = JSON.stringify(reordered) !== JSON.stringify(topSkills);
  if (changed) {
    repairs.push(`Reordered ${family} top-pivot skills to preserve model- and market-backed gaps without hard-coded replacement.`);
    const repairedReport = {
      ...reportData,
      pivots: reportData.pivots.map((pivot, pivotIndex) => (
        pivotIndex === 0 ? { ...pivot, skill_gaps: reordered } : pivot
      )),
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
  const topOvershootsProfile = titleOvershootsCurrentProfile(topTitle, reportData);
  const replacementIndex = normalizeArray(reportData.pivots).findIndex((pivot, index) =>
    index > 0 &&
    titleMatchesFamily(pivot?.title, family) &&
    titleMatchesCanonicalFamily(pivot?.title, family) &&
    !titleOvershootsCurrentProfile(pivot?.title, reportData)
  );

  if (titleMatchesFamily(topTitle, family) && topIsCanonical && !topOvershootsProfile) return reportData;

  if (replacementIndex <= 0) {
    const fallbackTitle = canonicalFallbackTitleForFamily(family, reportData?.profile?.job_title || topTitle);
    if (!fallbackTitle) {
      warnings.push(`Top pivot title does not match ${family} role family.`);
      return reportData;
    }

    repairs.push(`Reframed top pivot into ${fallbackTitle} for a cleaner ${family} role-family fit.`);
    return {
      ...reportData,
      pivots: normalizeArray(reportData.pivots).map((pivot, index) => (
        index === 0
          ? {
              ...pivot,
              id: slugify(fallbackTitle) || pivot.id,
              title: fallbackTitle,
            }
          : pivot
      )),
    };
  }

  const pivots = [...reportData.pivots];
  const [replacement] = pivots.splice(replacementIndex, 1);
  repairs.push(`Moved ${replacement.title} above off-family top pivot.`);
  return { ...reportData, pivots: [replacement, ...pivots] };
}

function repairLowerPivotFamilies(reportData, warnings, repairs) {
  const family = inferSpecializedFamily(reportData);
  if (!family || !['customer', 'finance', 'marketing', 'analytics', 'operations'].includes(family)) return reportData;

  const usedTitles = new Set();
  let changed = false;

  const pivots = normalizeArray(reportData.pivots).map((pivot, index) => {
    const title = pivot?.title || '';
    const normalizedTitle = normalizeText(title);
    const openings = Number(pivot?.live_market_signal?.matched_openings_count || 0);
    const fitScore = Number(pivot?.live_market_signal?.profile_fit_score || 0);
    const weakSignal = openings < 3 && fitScore < 25;
    const offFamily = !titleMatchesCanonicalFamily(title, family);
    const overshoots = titleOvershootsCurrentProfile(title, reportData);
    const duplicateTitle = usedTitles.has(normalizedTitle);

    if (index === 0) {
      usedTitles.add(normalizedTitle);
      return pivot;
    }

    let shouldRepair = offFamily || overshoots || duplicateTitle;

    if (
      family === 'customer'
      && weakSignal
      && /\b(product|platform|head|director|architect|consultant|data analyst|revenue operations)\b/.test(normalizedTitle)
    ) {
      shouldRepair = true;
    }

    if (
      family === 'finance'
      && weakSignal
      && /\b(product|revenue operations|transformation|platform architect|head|director)\b/.test(normalizedTitle)
    ) {
      shouldRepair = true;
    }

    if (
      family === 'operations'
      && (
        offFamily
        || (weakSignal && /\b(customer success|customer operations|marketing|revenue operations|product manager|product operations architect|architect|head of|director)\b/.test(normalizedTitle))
      )
    ) {
      shouldRepair = true;
    }

    if (
      family === 'marketing'
      && (
        offFamily
        || (weakSignal && /\b(ai program manager|customer success|consultant|revenue operations|product manager)\b/.test(normalizedTitle))
      )
    ) {
      shouldRepair = true;
    }

    if (
      family === 'analytics'
      && (
        offFamily
        || (weakSignal && /\b(revenue operations|product manager|customer success|marketing|program manager)\b/.test(normalizedTitle))
      )
    ) {
      shouldRepair = true;
    }

    if (!shouldRepair) {
      usedTitles.add(normalizedTitle);
      return pivot;
    }

    const replacementTitle = canonicalAlternativeTitlesForFamily(family, reportData?.profile?.job_title || title)
      .find((candidate) => !usedTitles.has(normalizeText(candidate)));

    if (!replacementTitle) {
      usedTitles.add(normalizedTitle);
      return pivot;
    }

    usedTitles.add(normalizeText(replacementTitle));
    changed = true;

    return {
      ...pivot,
      id: slugify(replacementTitle) || pivot.id,
      title: replacementTitle,
      ranking_reason: secondaryRankingCopy(pivot),
      skill_gaps: sanitizeSkillGapsForFamily(pivot.skill_gaps, family),
    };
  });

  if (!changed) return reportData;

  repairs.push(`Reframed weaker ${family} backup pivots into cleaner adjacent titles.`);
  return {
    ...reportData,
    pivots,
  };
}

function sanitizeSkillGapsForFamily(skillGaps, family) {
  const normalized = normalizeArray(skillGaps);
  if (!family) return normalized;
  return normalized.filter((skill) => !isOffFamilySkillForFamily(skill, family));
}

function isOffFamilySkillForFamily(skill, family) {
  const hardSkillPattern = family === 'customer'
    ? /\b(salesforce|hubspot|gainsight|crm|health score|segmentation|workflow automation|sql)\b/
    : family === 'marketing'
      ? /\b(hubspot|marketo|google analytics|ga4|attribution|lifecycle|crm|sql|experimentation)\b/
      : family === 'finance'
        ? /\b(sql|power bi|erp|scenario model|financial model|planning model)\b/
        : family === 'analytics'
          ? /\b(sql|python|snowflake|bigquery|dbt|etl|elt|warehouse|tableau|looker|power bi|data model|database architecture)\b/
          : family === 'operations'
            ? /\b(automation|integration|api|workflow|handoff|power automate|zapier|airtable)\b/
            : null;
  const hardSkillText = normalizeText([skill?.skill_name, skill?.category, skill?.how_to_close_gap].join(' '));
  if (skill?.market_backed && hardSkillPattern?.test(hardSkillText)) return false;

  const text = normalizeText([skill?.skill_name, skill?.category, skill?.how_to_close_gap].join(' '));
  if (!text || !family) return false;
  if (family === 'hr') return /\b(contract|clause|clm|legal intake|sourcing|supplier|pricing strategy|forecast model|machine learning|systems architecture|prompt design)\b/.test(text);
  if (family === 'finance') return /\b(curriculum|instructional|customer success|clause library|legal intake|recruiting|prompt design|prompt engineering|ai literacy)\b/.test(text);
  if (family === 'operations') return /\b(clause library|contract review|curriculum|instructional|supplier sourcing|machine learning|statistical modeling|prompt design|prompt engineering)\b/.test(text);
  if (family === 'customer') return /\b(contract|clause|curriculum|python|sql|statistical modeling|machine learning|prompt design|prompt engineering)\b/.test(text);
  if (family === 'marketing') return /\b(contract|clause|curriculum|python|sql|machine learning|prompt design|prompt engineering)\b/.test(text);
  if (family === 'analytics') return /\b(product lifecycle|product management|business strategy|curriculum|contract|prompt design)\b/.test(text);
  return false;
}

function hasStrongMarketBackedHardSkills(skillGaps, family) {
  const pattern = family === 'customer'
    ? /\b(salesforce|hubspot|gainsight|crm|health score|segmentation|renewal model|workflow automation|sql)\b/
    : family === 'marketing'
      ? /\b(hubspot|marketo|google analytics|ga4|attribution|lifecycle|crm|sql|experimentation|campaign automation)\b/
      : family === 'finance'
        ? /\b(sql|power bi|erp|scenario model|financial model|planning model|forecast model)\b/
        : family === 'analytics'
          ? /\b(sql|python|snowflake|bigquery|dbt|etl|elt|warehouse|tableau|looker|power bi|data model|database architecture)\b/
          : family === 'operations'
            ? /\b(automation|integration|api|workflow|handoff|power automate|zapier|airtable)\b/
            : family === 'hr'
              ? /\b(workday|hris|people analytics|workflow automation)\b/
              : null;
  if (!pattern) return false;

  const hits = normalizeArray(skillGaps)
    .slice(0, 4)
    .filter((skill) => skill?.market_backed && pattern.test(normalizeText([skill?.skill_name, skill?.category, skill?.how_to_close_gap].join(' '))))
    .length;

  return hits >= 2;
}

function shouldRepairTopBundleForFamily(skillGaps, family) {
  const text = normalizeText(
    normalizeArray(skillGaps)
      .slice(0, 3)
      .flatMap((skill) => [skill?.skill_name, skill?.category, skill?.resource_title, skill?.how_to_close_gap])
      .join(' ')
  );
  const nativeRoleSignals = normalizeText(
    normalizeArray(skillGaps)
      .slice(0, 2)
      .flatMap((skill) => [skill?.skill_name, skill?.category])
      .join(' ')
  );

  if (!text || !family) return false;
  if (hasStrongMarketBackedHardSkills(skillGaps, family)) return false;
  if (family === 'customer') {
    return (
      /\b(customer success data analyst|python|sql|statistical|machine learning|prompt design|data science|business process management|power bi|data modeling)\b/.test(text) ||
      !/\b(customer|renewal|account|retention|customer success|customer operations|service|crm|health score|segmentation)\b/.test(nativeRoleSignals)
    );
  }
  if (family === 'marketing') {
    return (
      /\b(prompt design|sql|python|machine learning|data science|business process management)\b/.test(text) ||
      !/\b(marketing|campaign|growth|launch|gtm|brand|lifecycle|crm|attribution|experimentation)\b/.test(nativeRoleSignals)
    );
  }
  if (family === 'operations') {
    return (
      /\b(prompt design|machine learning|systems architecture|statistical modeling)\b/.test(text) ||
      !/\b(workflow|operations|process|delivery|program|project|automation|integration|handoff)\b/.test(nativeRoleSignals)
    );
  }
  if (family === 'hr') {
    return (
      /\b(systems architecture|machine learning|prompt design|python|sql|statistical modeling)\b/.test(text) ||
      !/\b(manager|people|workforce|talent|hr|human resources)\b/.test(nativeRoleSignals)
    );
  }
  if (family === 'finance') {
    return (
      /\b(prompt design|machine learning|curriculum|contract|business process management|power bi|product lifecycle|product management)\b/.test(text) ||
      !/\b(finance|financial|forecast|scenario|planning|budget|pricing|commercial|sql|erp|model)\b/.test(nativeRoleSignals)
    );
  }
  if (family === 'analytics') {
    return (
      /\b(product lifecycle|product management|business strategy|strategy analyst|prompt design|marketing ops|business process management)\b/.test(text) ||
      !/\b(data|analytics|dashboard|kpi|sql|business intelligence|reporting|insights|python|etl|warehouse|snowflake|tableau|looker|power bi|data model)\b/.test(nativeRoleSignals)
    );
  }
  return false;
}

function buildRoleNativeTopBundle(family) {
  if (family === 'customer') {
    return [
      {
        skill_name: 'Renewal risk review design',
        category: 'customer operations',
        current_strength: 'You already see the signals that show up before an account is at risk.',
        required_level: 'Able to run a repeatable renewal-risk review that turns account health into earlier action.',
        gap_priority: 'critical',
        why_it_matters: 'Customer-success pivots get stronger when you can make account risk visible before renewal conversations become reactive.',
        evidence_you_already_have: 'You already understand customer context, handoffs, and the moments where signals get ignored.',
        how_to_close_gap: 'Build one renewal-risk review with flags, owners, and next-step triggers for an account segment.',
        resource_title: 'Service Hub Software Certification Course',
        resource_url: 'https://academy.hubspot.com/courses/hubspot-service-software',
        resource_provider: 'HubSpot Academy',
        resource_access: 'free',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Customer workflow automation',
        category: 'workflow',
        current_strength: 'You already know where prep, follow-up, and customer handoffs slow down.',
        required_level: 'Able to automate one low-risk customer workflow with clear review points and ownership.',
        gap_priority: 'medium',
        why_it_matters: 'This is how a customer-success pivot starts looking operationally stronger, not just more analytical.',
        evidence_you_already_have: 'You already know which account-review steps repeat and where context gets lost.',
        how_to_close_gap: 'Map one renewal or onboarding workflow and automate the lowest-risk step with explicit QA checks.',
        resource_title: 'Improve Business with Salesforce Flow Automation',
        resource_url: 'https://trailhead.salesforce.com/content/learn/trails/distribute-and-implement-flows',
        resource_provider: 'Salesforce Trailhead',
        resource_access: 'free',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Executive renewal communication',
        category: 'communication',
        current_strength: 'You already translate account activity into updates, risk notes, and stakeholder conversations.',
        required_level: 'Able to turn AI-assisted account analysis into a clear customer-risk recommendation leaders can act on.',
        gap_priority: 'medium',
        why_it_matters: 'Even strong customer data work underperforms if it does not become a clear next-step recommendation.',
        evidence_you_already_have: 'You already understand the commercial and relationship context around customer decisions.',
        how_to_close_gap: 'Use AI for first-pass synthesis, then rewrite one renewal or account review into a concise executive brief.',
        resource_title: 'Google AI Essentials',
        resource_url: 'https://www.coursera.org/google-learn/ai-essentials',
        resource_provider: 'Google / Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
    ];
  }

  if (family === 'marketing') {
    return [
      {
        skill_name: 'Campaign experiment design',
        category: 'marketing operations',
        current_strength: 'You already know the campaign calendar, stakeholder pressure, and what success usually needs to prove.',
        required_level: 'Able to design one AI-assisted campaign experiment with clear success metrics, audience logic, and follow-up actions.',
        gap_priority: 'critical',
        why_it_matters: 'Marketing pivots get stronger when you can turn campaign work into experiment systems and sharper decision loops.',
        evidence_you_already_have: 'You already see where campaign planning, copy, and reporting create repeated decision friction.',
        how_to_close_gap: 'Rebuild one campaign review into an experiment brief with hypothesis, metrics, and next-step decisions.',
        resource_title: 'AI for Marketing Course',
        resource_url: 'https://academy.hubspot.com/courses/AI-for-Marketers',
        resource_provider: 'HubSpot Academy',
        resource_access: 'free',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Marketing performance narrative',
        category: 'analytics communication',
        current_strength: 'You already report on performance and know which numbers matter in reviews.',
        required_level: 'Able to turn campaign metrics into a clear recommendation about what to scale, stop, or test next.',
        gap_priority: 'medium',
        why_it_matters: 'This is what turns marketing reporting into growth judgment instead of scoreboard maintenance.',
        evidence_you_already_have: 'You already understand the story behind campaign swings, not just the raw metrics.',
        how_to_close_gap: 'Rewrite one performance review into a decision memo that ties metrics to the next two actions.',
        resource_title: 'Google Skillshop: Ads, Analytics, and marketing products',
        resource_url: 'https://skillshop.withgoogle.com/',
        resource_provider: 'Google Skillshop',
        resource_access: 'free',
        resource_type: 'pathway',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'AI-assisted launch workflow design',
        category: 'workflow',
        current_strength: 'You already coordinate launch steps, copy requests, and stakeholder follow-through.',
        required_level: 'Able to design one AI-assisted launch or campaign workflow with checkpoints, owners, and review rules.',
        gap_priority: 'medium',
        why_it_matters: 'The marketing role gets stronger when you redesign the operating system, not just the content output.',
        evidence_you_already_have: 'You already know where launches slow down and where context gets dropped.',
        how_to_close_gap: 'Map one campaign or launch workflow and redesign it with AI support plus explicit human review points.',
        resource_title: 'OpenAI Academy',
        resource_url: 'https://academy.openai.com/',
        resource_provider: 'OpenAI Academy',
        resource_access: 'free',
        resource_type: 'pathway',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
    ];
  }

  if (family === 'operations') {
    return [
      {
        skill_name: 'Workflow redesign',
        category: 'workflow',
        current_strength: 'You already see where intake, follow-up, and ownership break down.',
        required_level: 'Able to redesign one recurring workflow with clearer handoffs, AI support, and review controls.',
        gap_priority: 'critical',
        why_it_matters: 'Operations pivots become credible when you can improve throughput through a cleaner system, not just better personal productivity.',
        evidence_you_already_have: 'You already understand the sequence of work well enough to spot where the workflow actually fails.',
        how_to_close_gap: 'Document one recurring operating workflow and rebuild it with clearer handoffs, controls, and automation.',
        resource_title: 'Build and optimize cloud flows in Power Automate',
        resource_url: 'https://learn.microsoft.com/en-us/training/paths/build-optimize-cloud-flows-power-automate/',
        resource_provider: 'Microsoft Learn',
        resource_access: 'free',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Operating review communication',
        category: 'communication',
        current_strength: 'You already translate status, blockers, and progress for different stakeholders.',
        required_level: 'Able to turn AI-assisted process analysis into a clear decision update with next actions and tradeoffs.',
        gap_priority: 'medium',
        why_it_matters: 'The operating role gets stronger when faster process insight becomes better team decisions.',
        evidence_you_already_have: 'You already know what gets missed when updates are long but unclear.',
        how_to_close_gap: 'Use AI for first-pass status synthesis, then rewrite one operating review into a concise action memo.',
        resource_title: 'Google AI Essentials',
        resource_url: 'https://www.coursera.org/google-learn/ai-essentials',
        resource_provider: 'Google / Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'AI rollout governance',
        category: 'leadership',
        current_strength: 'You already balance speed, quality, and stakeholder friction in recurring work.',
        required_level: 'Able to roll out one AI-assisted workflow with clear adoption rules, success metrics, and risk controls.',
        gap_priority: 'medium',
        why_it_matters: 'Operations leaders gain leverage when they can make a new workflow usable for the team, not just themselves.',
        evidence_you_already_have: 'You already know which steps need controls and which changes the team will resist.',
        how_to_close_gap: 'Pilot one AI-assisted workflow, define the guardrails, and document the adoption pattern for others.',
        resource_title: 'Digital Transformation',
        resource_url: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
        resource_provider: 'Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
    ];
  }

  if (family === 'hr') {
    return [
      {
        skill_name: 'Manager enablement workflow design',
        category: 'workflow',
        current_strength: 'You already understand the repeated manager questions, approval points, and people-ops friction.',
        required_level: 'Able to redesign one manager-support workflow into a repeatable AI-assisted operating play.',
        gap_priority: 'critical',
        why_it_matters: 'HR-adjacent pivots get stronger when you can make people support more scalable without losing judgment.',
        evidence_you_already_have: 'You already know where manager support slows down and where repeated escalation could be standardized better.',
        how_to_close_gap: 'Map one manager-support workflow and redesign it with AI assistance plus explicit review points.',
        resource_title: 'OpenAI Academy',
        resource_url: 'https://academy.openai.com/',
        resource_provider: 'OpenAI Academy',
        resource_access: 'free',
        resource_type: 'pathway',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Workforce planning communication',
        category: 'communication',
        current_strength: 'You already translate people issues into stakeholder language and manager action.',
        required_level: 'Able to turn AI-assisted people analysis into clear manager guidance and workforce recommendations.',
        gap_priority: 'medium',
        why_it_matters: 'People-ops pivots need visible judgment, not just faster HR output.',
        evidence_you_already_have: 'You already understand the context that makes workforce recommendations sensitive and high stakes.',
        how_to_close_gap: 'Use AI for first-pass people analysis, then rewrite one workforce-planning update into a clear manager brief.',
        resource_title: 'Google AI Essentials',
        resource_url: 'https://www.coursera.org/google-learn/ai-essentials',
        resource_provider: 'Google / Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'People-ops AI rollout design',
        category: 'leadership',
        current_strength: 'You already understand the risks, sensitivities, and adoption issues around new workflows in people operations.',
        required_level: 'Able to roll out one AI-assisted people workflow with clear governance, review rules, and success measures.',
        gap_priority: 'medium',
        why_it_matters: 'The HR-adjacent move gets stronger when you can make AI safe, measurable, and reusable for managers or people teams.',
        evidence_you_already_have: 'You already know which parts of a people workflow can be assisted and which parts still need human judgment.',
        how_to_close_gap: 'Pilot one AI-assisted people workflow, define the guardrails, and document what managers should and should not trust.',
        resource_title: 'Digital Transformation',
        resource_url: 'https://www.coursera.org/learn/bcg-uva-darden-digital-transformation',
        resource_provider: 'Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
    ];
  }

  if (family === 'finance') {
    return [
      {
        skill_name: 'Scenario modeling for decisions',
        category: 'financial planning',
        current_strength: 'You already know the assumptions, tradeoffs, and stakeholder pressure behind planning decisions.',
        required_level: 'Able to build one scenario model that shows the business impact of different planning or pricing paths.',
        gap_priority: 'critical',
        why_it_matters: 'Finance pivots get stronger when you can turn forecast inputs into a decision-ready scenario view.',
        evidence_you_already_have: 'You already understand the commercial questions behind the numbers, not just the spreadsheet mechanics.',
        how_to_close_gap: 'Rebuild one real planning question into a scenario model with assumptions, sensitivities, and a recommendation.',
        resource_title: 'Financial modeling learning paths',
        resource_url: 'https://learn.snowflake.com/en/',
        resource_provider: 'Snowflake',
        resource_access: 'free',
        resource_type: 'pathway',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Finance systems analysis',
        category: 'technical analytics',
        current_strength: 'You already know where reporting depends on manual pulls, spreadsheet stitching, and repeated explanation.',
        required_level: 'Able to query or validate one recurring finance question without relying on fragile spreadsheet workarounds.',
        gap_priority: 'medium',
        why_it_matters: 'Finance-adjacent roles get stronger when you can move from spreadsheet handling to repeatable finance analysis.',
        evidence_you_already_have: 'You already know which recurring numbers leadership asks for and where the data gets messy.',
        how_to_close_gap: 'Use SQL or a finance-friendly analytics workflow to answer one recurring planning question more cleanly.',
        resource_title: 'SQL for Data Science',
        resource_url: 'https://www.coursera.org/learn/sql-for-data-science',
        resource_provider: 'Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'Planning narrative for leadership',
        category: 'communication',
        current_strength: 'You already explain drivers, assumptions, and variance in business reviews.',
        required_level: 'Able to turn analysis into a concise planning recommendation leaders can act on quickly.',
        gap_priority: 'medium',
        why_it_matters: 'Finance credibility rises when analysis becomes a clear recommendation instead of a spreadsheet walkthrough.',
        evidence_you_already_have: 'You already understand which numbers matter because you are close to the operating context.',
        how_to_close_gap: 'Rewrite one planning or forecast review into a brief decision memo with tradeoffs, risks, and next moves.',
        resource_title: 'Google AI Essentials',
        resource_url: 'https://www.coursera.org/google-learn/ai-essentials',
        resource_provider: 'Google / Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
    ];
  }

  if (family === 'analytics') {
    return [
      {
        skill_name: 'Decision-support dashboard design',
        category: 'analytics communication',
        current_strength: 'You already know which metrics matter and where reporting currently stops short of a decision.',
        required_level: 'Able to build one dashboard or review pack that clearly tells leaders what changed and what to do next.',
        gap_priority: 'critical',
        why_it_matters: 'Analytics pivots get stronger when you turn reporting into a clear recommendation layer, not just a cleaner dashboard.',
        evidence_you_already_have: 'You already surface patterns and questions in reviews, even if the reporting flow still feels too reactive.',
        how_to_close_gap: 'Rebuild one existing dashboard into a decision review with actions, owners, and next-step questions.',
        resource_title: 'Get started with Microsoft data analytics',
        resource_url: 'https://learn.microsoft.com/en-us/training/paths/data-analytics-microsoft/',
        resource_provider: 'Microsoft Learn',
        resource_access: 'free',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'SQL analysis for business questions',
        category: 'technical analytics',
        current_strength: 'You already ask the right business questions and know what a useful answer looks like.',
        required_level: 'Able to query common business tables and validate one operational hypothesis with clean logic.',
        gap_priority: 'medium',
        why_it_matters: 'The analytics move gets much more credible once you can answer recurring business questions without waiting on someone else.',
        evidence_you_already_have: 'You already know which data questions repeat in dashboards, reviews, and stakeholder asks.',
        how_to_close_gap: 'Practice foundational SQL against one reporting question you already work with every week.',
        resource_title: 'SQL for Data Science',
        resource_url: 'https://www.coursera.org/learn/sql-for-data-science',
        resource_provider: 'Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
      {
        skill_name: 'KPI review narrative',
        category: 'communication',
        current_strength: 'You already explain metric movement in meetings, comments, and stakeholder follow-ups.',
        required_level: 'Able to turn AI-assisted analysis into a concise narrative about what changed, why it matters, and what should happen next.',
        gap_priority: 'medium',
        why_it_matters: 'This is what makes analytics feel commercially useful instead of just technically correct.',
        evidence_you_already_have: 'You already know the context around the numbers, which is what gives the narrative value.',
        how_to_close_gap: 'Use AI for first-pass synthesis, then rewrite one KPI review into a short decision memo with explicit tradeoffs.',
        resource_title: 'Google AI Essentials',
        resource_url: 'https://www.coursera.org/google-learn/ai-essentials',
        resource_provider: 'Google / Coursera',
        resource_access: 'paid',
        resource_type: 'course',
        resource_verified: true,
        resource_verification_status: 'quality-gate-repair',
      },
    ];
  }

  return [];
}

export function applyReportQualityGate(reportData) {
  if (!reportData || typeof reportData !== 'object') return reportData;

  const warnings = [];
  const repairs = [];
  const family = inferSpecializedFamily(reportData);
  let nextReport = repairTopPivotFamily(reportData, warnings, repairs);
  nextReport = repairLowerPivotFamilies(nextReport, warnings, repairs);
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
        nextPivot.skill_gaps = sanitizeSkillGapsForFamily(nextPivot.skill_gaps, family);
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
