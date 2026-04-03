import { normalizeLocale } from './i18n';

export const ROLE_PAGE_SLUGS = [
  'marketing-manager-ai-risk',
  'fpa-analyst-ai-risk',
  'hr-business-partner-ai-risk',
  'customer-success-manager-ai-risk',
  'recruiter-ai-risk',
  'office-manager-ai-risk',
];

const relatedRoleSlugs = [
  'marketing-manager-ai-risk',
  'fpa-analyst-ai-risk',
  'hr-business-partner-ai-risk',
  'customer-success-manager-ai-risk',
  'recruiter-ai-risk',
  'office-manager-ai-risk',
];

const content = {
  en: {
    common: {
      navSubtitle: 'Role risk guide',
      eyebrow: 'Role guide',
      snapshotEyebrow: 'Quick read',
      snapshotTitle: 'What usually matters most in this role.',
      sectionsEyebrow: 'How to think about the role',
      ctaEyebrow: 'Run the scan',
      homeButton: 'Back to homepage',
      ctaButton: 'Run my free scan',
      relatedHeading: 'Related role guides',
      methodologyButton: 'See methodology',
      methodologyLinkLabel: 'How PivotIQ scores risk and pivots',
    },
    pages: {
      'marketing-manager-ai-risk': {
        linkLabel: 'Marketing manager AI risk',
        metaTitle: 'Marketing Manager AI Risk Guide',
        metaDescription: 'See how AI affects marketing manager roles, which tasks are most exposed, what still compounds, and which adjacent pivots look strongest.',
        title: 'Marketing manager AI risk is usually highest in execution-heavy coordination work.',
        intro: 'Marketing managers often sit at the center of briefs, reporting, stakeholder coordination, campaign operations, and channel execution. AI rarely makes the whole role disappear at once, but it can compress the parts built on repetitive production and recurring synthesis.',
        snapshot: [
          'Campaign reporting, content briefing, basic channel planning, and recurring update work often feel pressure first.',
          'Judgment around positioning, cross-functional alignment, tradeoffs, and business translation usually retains stronger human leverage.',
          'Believable adjacent pivots often move toward revenue operations, lifecycle strategy, marketing operations, or strategic planning.',
        ],
        blocks: [
          ['Exposure', 'Where the pressure usually builds', 'The role becomes more fragile when too much of the week is spent coordinating assets, reformatting updates, writing templated briefs, or packaging campaign results.'],
          ['Strength', 'What still compounds', 'Context-heavy messaging choices, channel tradeoffs, executive communication, and ownership across teams remain harder to replace than the production layer around them.'],
          ['Pivot', 'What a smart next move can look like', 'The strongest move is often not “AI marketing manager.” It is a shift toward roles where strategic judgment and operating leverage matter more than content throughput.'],
        ],
        sectionsTitle: 'How to evaluate a marketing manager role under AI pressure.',
        sectionsBody: 'The useful question is not whether marketing will use AI. It is whether your role is still anchored in the work that compounds when AI enters the workflow.',
        sections: [
          ['Separate orchestration from ownership', 'If your value comes mostly from coordinating moving parts, the role is more exposed than a version centered on strategy and decision quality.'],
          ['Look at how much of the week is templated', 'The more your workload depends on recurring briefs, repackaged reporting, and routine asset direction, the more AI can compress the middle.'],
          ['Protect the business-translation layer', 'The strongest marketing managers still help leadership decide where to invest, what to stop, and how to align teams around signal instead of noise.'],
          ['Choose pivots that preserve credibility', 'Revenue operations, lifecycle strategy, and marketing operations often keep the context while moving you closer to harder-to-replace work.'],
        ],
        ctaTitle: 'See how exposed your marketing role really is at the task level.',
        ctaBody: 'A broad article about AI in marketing is not enough. A task-level scan can show whether your real leverage is growing or quietly thinning out.',
      },
      'fpa-analyst-ai-risk': {
        linkLabel: 'FP&A analyst AI risk',
        metaTitle: 'FP&A Analyst AI Risk Guide',
        metaDescription: 'See how AI affects FP&A analyst roles, which finance tasks are most exposed, what still compounds, and which adjacent pivots make sense.',
        title: 'FP&A analyst AI risk tends to sit in repeatable reporting more than business judgment.',
        intro: 'FP&A analysts live close to reporting, forecasting, scenario building, planning rhythm, and executive support. AI can compress parts of the reporting and synthesis layer quickly, but the decision-support layer usually weakens more slowly because it depends on context and judgment.',
        snapshot: [
          'Recurring variance reporting, data preparation, slide packaging, and templated commentary usually feel pressure first.',
          'Scenario framing, finance storytelling, business partnership, and tradeoff guidance often keep stronger leverage.',
          'Believable adjacent pivots often include finance business partner, strategic finance, revenue operations, or planning roles.',
        ],
        blocks: [
          ['Exposure', 'The reporting layer gets cheaper first', 'When the role leans heavily on recurring decks, routine variance commentary, and manual data assembly, AI can compress a meaningful part of the workload.'],
          ['Strength', 'Interpretation still matters', 'Leaders still need someone to explain what the numbers mean, what assumptions are changing, and which choices deserve attention now.'],
          ['Pivot', 'The stronger paths move closer to business decisions', 'The best adjacent move usually keeps your finance context while moving you toward higher-trust interpretation and planning ownership.'],
        ],
        sectionsTitle: 'How to think about FP&A analyst exposure under AI.',
        sectionsBody: 'The most useful lens is to separate financial production from financial judgment.',
        sections: [
          ['Audit how much time goes to recurring output', 'If a large share of the week goes to packaging updates and maintaining templated reporting, risk is higher than the title alone suggests.'],
          ['Value the translation layer', 'Explaining tradeoffs to non-finance leaders remains more defensible than producing the underlying materials alone.'],
          ['Look for pivots that keep finance credibility intact', 'Finance business partner and strategic planning roles often feel believable because they build on the same core trust.'],
          ['Build proof beyond technical accuracy', 'The next-level signal is not just correct numbers. It is being able to turn financial inputs into decisions leaders can actually act on.'],
        ],
        ctaTitle: 'Check whether your FP&A role is drifting toward compression or stronger leverage.',
        ctaBody: 'A task-level scan can show whether your finance role is still building decision leverage or getting pulled toward cheaper output work.',
      },
      'hr-business-partner-ai-risk': {
        linkLabel: 'HR business partner AI risk',
        metaTitle: 'HR Business Partner AI Risk Guide',
        metaDescription: 'See how AI affects HR business partner roles, which tasks are most exposed, what remains defensible, and which adjacent pivots look strongest.',
        title: 'HR business partner AI risk is lower in judgment-heavy work than in process-heavy support.',
        intro: 'HR business partners often work across performance conversations, org design, manager support, workforce planning, documentation, and employee issues. AI can reduce the burden of process, drafting, and administrative support, but the advisory layer still depends on judgment, trust, and organizational context.',
        snapshot: [
          'Policy drafting, recurring documentation, coordination-heavy support, and templated people-process work often compress earlier.',
          'Manager coaching, org judgment, sensitive stakeholder handling, and change navigation usually keep stronger human leverage.',
          'Believable adjacent pivots often include organizational effectiveness, people strategy, talent programs, or change management.',
        ],
        blocks: [
          ['Exposure', 'Process support gets cheaper faster', 'The more your week leans on drafting, documenting, templated communications, and routine coordination, the more exposed the role becomes.'],
          ['Strength', 'Trust still matters', 'The HRBP advantage is not just policy knowledge. It is the ability to navigate sensitive decisions, interpret context, and influence managers in moments where judgment matters.'],
          ['Pivot', 'The strongest adjacent moves deepen advisory ownership', 'Organizational effectiveness and people strategy roles often feel stronger because they move further toward judgment and system design.'],
        ],
        sectionsTitle: 'How to assess HRBP risk without overreacting to AI headlines.',
        sectionsBody: 'Most HRBP roles are not disappearing overnight, but some versions of the work are becoming thinner and more automated.',
        sections: [
          ['Separate administrative support from advisory leverage', 'The more the role behaves like people-process coordination, the more exposed it is than a version anchored in managerial influence and organizational judgment.'],
          ['Look for context-heavy work', 'Conflict navigation, leadership coaching, and change communication remain more defensible than drafting and process administration alone.'],
          ['Choose pivots that preserve people credibility', 'Organizational effectiveness, change management, and talent strategy often keep your context while moving you toward harder-to-replace work.'],
          ['Build evidence of system thinking', 'Future leverage often comes from showing that you can improve how the organization works, not just support how it runs today.'],
        ],
        ctaTitle: 'See whether your HRBP role is anchored in process or in judgment.',
        ctaBody: 'A task-level scan helps separate people work that is thinning out from the advisory leverage that still compounds.',
      },
      'customer-success-manager-ai-risk': {
        linkLabel: 'Customer success manager AI risk',
        metaTitle: 'Customer Success Manager AI Risk Guide',
        metaDescription: 'See how AI affects customer success manager roles, which tasks are most exposed, what still compounds, and which adjacent pivots look strongest.',
        title: 'Customer success manager AI risk rises when the role is mostly coordination and status management.',
        intro: 'Customer success managers often spend time on onboarding, renewals, check-ins, escalation handling, stakeholder coordination, and account communication. AI can compress repetitive communication and routine account coverage, but deeper account judgment and commercial strategy still retain human leverage.',
        snapshot: [
          'Routine check-ins, recap emails, basic onboarding guidance, and coordination-heavy account support often get cheaper first.',
          'Renewal strategy, escalation handling, stakeholder trust, and commercial judgment usually keep stronger value.',
          'Believable adjacent pivots often include account strategy, implementation leadership, revenue operations, or enablement roles.',
        ],
        blocks: [
          ['Exposure', 'The generic-touchpoint layer is vulnerable', 'When the role is built around updates, follow-ups, reminders, and low-complexity account motions, AI can reduce how much human coverage is needed.'],
          ['Strength', 'Trust in important moments still matters', 'Customers still need a human when context is messy, priorities conflict, and the account needs commercial judgment rather than scripted support.'],
          ['Pivot', 'The strongest moves deepen ownership', 'Roles closer to account strategy, implementation complexity, or commercial operations often preserve context while increasing defensibility.'],
        ],
        sectionsTitle: 'How to think about customer success exposure under AI.',
        sectionsBody: 'The core question is whether your work is generic account coverage or high-trust account judgment.',
        sections: [
          ['Audit the share of routine account touchpoints', 'If too much of the week goes to standard follow-ups and recurring check-ins, AI pressure is probably higher than it first appears.'],
          ['Protect the renewal and escalation layer', 'The work that still compounds is often the part where relationship trust and decision quality matter most.'],
          ['Move closer to strategic ownership', 'Account strategy, implementation leadership, and revenue operations can be stronger adjacent paths because they rely less on generic coverage.'],
          ['Build proof that you change outcomes', 'Future leverage comes from showing measurable retention, expansion, or adoption impact, not just activity volume.'],
        ],
        ctaTitle: 'Check whether your customer success role is mostly coverage or real account leverage.',
        ctaBody: 'The scan can show whether your current workload is getting cheaper or whether it is still anchored in trust-heavy work customers truly value.',
      },
      'recruiter-ai-risk': {
        linkLabel: 'Recruiter AI risk',
        metaTitle: 'Recruiter AI Risk Guide',
        metaDescription: 'See how AI affects recruiter roles, which tasks are most exposed, what still compounds, and which adjacent pivots remain believable.',
        title: 'Recruiter AI risk is highest in sourcing and coordination, not in high-trust hiring judgment.',
        intro: 'Recruiters often split time across sourcing, outreach, scheduling, pipeline management, candidate communication, and hiring-manager alignment. AI can compress much of the top-of-funnel and administrative layer, but the judgment-heavy parts of hiring still depend on context, calibration, and trust.',
        snapshot: [
          'Sourcing, outreach drafting, scheduling, pipeline updates, and routine coordination often face pressure first.',
          'Candidate assessment, hiring-manager calibration, persuasion, and process judgment often keep stronger leverage.',
          'Believable adjacent pivots often include talent operations, employer brand, people programs, or strategic recruiting leadership.',
        ],
        blocks: [
          ['Exposure', 'Top-of-funnel work is becoming cheaper', 'Recruiting becomes more exposed when the week is dominated by sourcing, coordination, and repetitive candidate communication.'],
          ['Strength', 'Hiring judgment still carries weight', 'The most defensible part of the role is often the human judgment around fit, signal, credibility, and how to move a process forward with the right stakeholders.'],
          ['Pivot', 'The better moves preserve hiring context', 'Talent operations and strategic recruiting paths often feel stronger because they keep the domain knowledge while moving toward systems or higher-value judgment.'],
        ],
        sectionsTitle: 'How to evaluate recruiter exposure without flattening the whole function.',
        sectionsBody: 'Recruiting is not equally exposed across every task. The structure of the week matters more than the title.',
        sections: [
          ['Separate sourcing from selection judgment', 'The more your value depends on top-of-funnel generation alone, the more exposed the role is likely to be.'],
          ['Value the alignment layer', 'Helping hiring managers calibrate, make tradeoffs, and close candidates is harder to compress than routine coordination.'],
          ['Choose adjacent moves that keep people-market context', 'Talent operations, employer brand, and people programs can preserve credibility while reducing dependence on compressible sourcing work.'],
          ['Build evidence of process impact', 'The strongest signal is not just volume. It is improving hiring quality, process speed, and stakeholder confidence.'],
        ],
        ctaTitle: 'See whether your recruiting role is still built on judgment or mostly on volume.',
        ctaBody: 'A task-level scan can show whether your leverage comes from hiring insight or from workflow layers AI is quickly compressing.',
      },
      'office-manager-ai-risk': {
        linkLabel: 'Office manager AI risk',
        metaTitle: 'Office Manager AI Risk Guide',
        metaDescription: 'See how AI affects office manager roles, which tasks are most exposed, what still compounds, and which adjacent pivots may be strongest.',
        title: 'Office manager AI risk is usually concentrated in coordination, scheduling, and administrative flow.',
        intro: 'Office managers often carry scheduling, vendor coordination, documentation, office operations, meeting support, and cross-team administrative coverage. AI can compress a large share of repetitive coordination, but the role still retains value when it expands into operations ownership and execution reliability.',
        snapshot: [
          'Scheduling, documentation, meeting prep, recurring coordination, and standard admin support often feel pressure first.',
          'Execution ownership, operational reliability, judgment across stakeholders, and problem resolution usually hold more value.',
          'Believable adjacent pivots often include operations coordinator, program operations, workplace operations, or project support roles.',
        ],
        blocks: [
          ['Exposure', 'Administrative workflow is highly compressible', 'The more the role is built around calendars, reminders, formatted documents, and routine follow-up, the more vulnerable it becomes.'],
          ['Strength', 'Operational steadiness still matters', 'A strong office manager often provides reliability across moving parts, resolves ambiguity, and keeps teams functioning when the workflow is messy.'],
          ['Pivot', 'The best next move often shifts into operations', 'Operations and program-support roles can feel stronger because they preserve the coordination context while increasing scope and ownership.'],
        ],
        sectionsTitle: 'How to think about office manager exposure under AI.',
        sectionsBody: 'The useful distinction is between routine administrative throughput and real operational ownership.',
        sections: [
          ['Measure how much of the week is pure admin flow', 'If most of the workload is scheduling, formatting, documenting, and coordination, risk is likely higher than the title alone suggests.'],
          ['Protect the execution-reliability layer', 'Work that keeps teams aligned and solves operational friction still matters when it depends on context and judgment.'],
          ['Choose pivots with more ownership', 'Program operations, workplace operations, and project support often offer stronger adjacent paths than staying fully inside generic admin coverage.'],
          ['Build proof of operational impact', 'The next-level signal is showing that you improve team reliability, not just that you keep tasks moving.'],
        ],
        ctaTitle: 'See whether your office role is built on compressible admin work or operational leverage.',
        ctaBody: 'The scan helps separate routine coordination from the execution ownership that can still compound into stronger adjacent paths.',
      },
    },
  },
  nl: {
    common: {
      navSubtitle: 'Rolrisicogids',
      eyebrow: 'Rolgids',
      snapshotEyebrow: 'Snelle lezing',
      snapshotTitle: 'Wat meestal het belangrijkst is in deze rol.',
      sectionsEyebrow: 'Hoe je naar de rol kijkt',
      ctaEyebrow: 'Doe de scan',
      homeButton: 'Terug naar homepage',
      ctaButton: 'Doe mijn gratis scan',
      relatedHeading: 'Gerelateerde rolgidsen',
      methodologyButton: 'Bekijk methodologie',
      methodologyLinkLabel: 'Hoe PivotIQ risico en pivots beoordeelt',
    },
    pages: {
      'marketing-manager-ai-risk': {
        linkLabel: 'Marketing manager AI-risico',
        metaTitle: 'Gids voor marketing manager AI-risico',
        metaDescription: 'Zie hoe AI marketing manager-rollen beïnvloedt, welke taken het meest blootstaan, wat nog sterker wordt en welke aangrenzende pivots het meest logisch zijn.',
        title: 'Marketing manager AI-risico is meestal het hoogst in uitvoeringsgerichte coördinatiewerkzaamheden.',
        intro: 'Marketingmanagers zitten vaak midden in briefs, rapportage, stakeholdercoördinatie, campagne-operations en kanaaluitvoering. AI laat de hele rol zelden in één keer verdwijnen, maar kan wel de delen comprimeren die draaien op repetitieve productie en terugkerende synthese.',
        snapshot: [
          'Campagnerapportage, contentbriefing, basis-kanaalplanning en terugkerende updatewerkzaamheden voelen vaak als eerste druk.',
          'Oordeel rond positionering, cross-functionele afstemming, trade-offs en bedrijfsvertaling behoudt meestal sterker menselijk voordeel.',
          'Geloofwaardige aangrenzende pivots bewegen vaak richting revenue operations, lifecycle-strategie, marketing operations of strategische planning.',
        ],
        blocks: [
          ['Blootstelling', 'Waar de druk meestal opbouwt', 'De rol wordt kwetsbaarder wanneer te veel van de week opgaat aan coördineren van assets, herformatteren van updates, schrijven van sjabloonmatige briefs of verpakken van campagneresultaten.'],
          ['Sterkte', 'Wat nog steeds doorwerkt', 'Contextrijke messaging-keuzes, kanaaltrade-offs, directiecommunicatie en eigenaarschap over teams heen blijven moeilijker te vervangen dan de productielaag eromheen.'],
          ['Pivot', 'Hoe een slimme volgende stap eruit kan zien', 'De sterkste stap is vaak niet “AI marketing manager”. Het is een verschuiving richting rollen waarin strategisch oordeel en operationele hefboom belangrijker zijn dan contentdoorvoer.'],
        ],
        sectionsTitle: 'Hoe je een marketingmanager-rol onder AI-druk beoordeelt.',
        sectionsBody: 'De nuttige vraag is niet of marketing AI gaat gebruiken. De vraag is of jouw rol nog steeds verankerd is in werk dat doorwerkt wanneer AI de workflow binnenkomt.',
        sections: [
          ['Scheid orchestration van ownership', 'Als je waarde vooral komt uit het coördineren van bewegende onderdelen, is de rol kwetsbaarder dan een versie die draait om strategie en besliskwaliteit.'],
          ['Kijk hoeveel van de week sjabloonmatig is', 'Hoe meer je werklast afhangt van terugkerende briefs, herverpakte rapportage en routinematige assetrichting, hoe meer AI het midden kan comprimeren.'],
          ['Bescherm de bedrijfsvertaallaag', 'De sterkste marketingmanagers helpen leiders nog steeds beslissen waar te investeren, wat te stoppen en hoe teams rond signaal in plaats van ruis af te stemmen.'],
          ['Kies pivots die geloofwaardigheid behouden', 'Revenue operations, lifecycle-strategie en marketing operations voelen vaak geloofwaardig omdat ze dezelfde context behouden maar dichter naar moeilijker vervangbaar werk bewegen.'],
        ],
        ctaTitle: 'Zie hoe blootgesteld je marketingrol echt is op taakniveau.',
        ctaBody: 'Een breed artikel over AI in marketing is niet genoeg. Een scan op taakniveau kan laten zien of je echte hefboom groeit of stilletjes dunner wordt.',
      },
      'fpa-analyst-ai-risk': {
        linkLabel: 'FP&A-analist AI-risico',
        metaTitle: 'Gids voor FP&A-analist AI-risico',
        metaDescription: 'Zie hoe AI FP&A-analistrollen beïnvloedt, welke financiële taken het meest blootstaan, wat nog sterker wordt en welke aangrenzende pivots logisch zijn.',
        title: 'FP&A-analist AI-risico zit meestal meer in herhaalbare rapportage dan in business judgment.',
        intro: 'FP&A-analisten zitten dicht op rapportage, forecasting, scenariobouw, planningsritme en executive support. AI kan delen van de rapportage- en syntheselaag snel comprimeren, maar de decision-supportlaag verzwakt meestal langzamer omdat die afhangt van context en oordeel.',
        snapshot: [
          'Terugkerende variantierapportage, datapreparatie, slideverpakking en sjabloonmatige commentary voelen meestal als eerste druk.',
          'Scenarioframing, finance-storytelling, business partnership en trade-offbegeleiding behouden vaak sterkere hefboom.',
          'Geloofwaardige aangrenzende pivots omvatten vaak finance business partner, strategic finance, revenue operations of planningrollen.',
        ],
        blocks: [
          ['Blootstelling', 'De rapportagelaag wordt als eerste goedkoper', 'Wanneer de rol zwaar leunt op terugkerende decks, routinevariantiecommentaar en handmatige datasamenstelling, kan AI een betekenisvol deel van de werklast comprimeren.'],
          ['Sterkte', 'Interpretatie blijft belangrijk', 'Leiders hebben nog steeds iemand nodig die uitlegt wat de cijfers betekenen, welke aannames verschuiven en welke keuzes nu aandacht verdienen.'],
          ['Pivot', 'De sterkere paden bewegen dichter naar bedrijfsbeslissingen', 'De beste aangrenzende stap behoudt meestal je financiële context terwijl je dichter naar hogere-trust interpretatie en planningseigenaarschap beweegt.'],
        ],
        sectionsTitle: 'Hoe je denkt over blootstelling van FP&A-analisten onder AI.',
        sectionsBody: 'De nuttigste lens is financiële productie scheiden van financieel oordeel.',
        sections: [
          ['Controleer hoeveel tijd naar terugkerende output gaat', 'Als een groot deel van de week opgaat aan verpakken van updates en onderhouden van sjabloonmatige rapportage, is het risico hoger dan de titel alleen suggereert.'],
          ['Waardeer de vertaallaag', 'Trade-offs uitleggen aan niet-financiële leiders blijft verdedigbaarder dan alleen de onderliggende materialen produceren.'],
          ['Zoek pivots die financiële geloofwaardigheid intact houden', 'Finance business partner- en strategic planning-rollen voelen vaak geloofwaardig omdat ze op dezelfde kern van vertrouwen bouwen.'],
          ['Bouw bewijs voorbij technische nauwkeurigheid', 'Het volgende niveau signaal is niet alleen correcte cijfers. Het is financiële input kunnen vertalen naar keuzes waar leiders echt naar kunnen handelen.'],
        ],
        ctaTitle: 'Check of je FP&A-rol afdrijft richting compressie of sterkere hefboom.',
        ctaBody: 'Een scan op taakniveau kan laten zien of je financiële rol nog beslishefboom opbouwt of juist wordt teruggetrokken naar goedkoper outputwerk.',
      },
      'hr-business-partner-ai-risk': {
        linkLabel: 'HR business partner AI-risico',
        metaTitle: 'Gids voor HR business partner AI-risico',
        metaDescription: 'Zie hoe AI HR business partner-rollen beïnvloedt, welke taken het meest blootstaan, wat verdedigbaar blijft en welke aangrenzende pivots het sterkst lijken.',
        title: 'HR business partner AI-risico is lager in oordeelzwaar werk dan in proceszware ondersteuning.',
        intro: 'HR business partners werken vaak over performancegesprekken, organisatieontwerp, managersupport, workforce planning, documentatie en employee issues heen. AI kan de last van proces, drafting en administratieve ondersteuning verminderen, maar de advieslaag blijft afhankelijk van oordeel, vertrouwen en organisatiecontext.',
        snapshot: [
          'Policy drafting, terugkerende documentatie, coördinatiezware ondersteuning en sjabloonmatig people-processwerk comprimeren vaak eerder.',
          'Managercoaching, organisatieoordeel, gevoelige stakeholderafhandeling en changenavigatie behouden meestal sterker menselijk voordeel.',
          'Geloofwaardige aangrenzende pivots omvatten vaak organizational effectiveness, people strategy, talent programs of change management.',
        ],
        blocks: [
          ['Blootstelling', 'Procesondersteuning wordt sneller goedkoper', 'Hoe meer je week leunt op drafting, documenteren, sjablooncommunicatie en routinecoördinatie, hoe kwetsbaarder de rol wordt.'],
          ['Sterkte', 'Vertrouwen blijft tellen', 'Het HRBP-voordeel is niet alleen beleidskennis. Het is het vermogen om gevoelige beslissingen te navigeren, context te interpreteren en managers te beïnvloeden wanneer oordeel telt.'],
          ['Pivot', 'De sterkste aangrenzende stappen verdiepen advies-eigenaarschap', 'Organizational effectiveness- en people strategy-rollen voelen vaak sterker omdat ze verder bewegen naar oordeel en systeemontwerp.'],
        ],
        sectionsTitle: 'Hoe je HRBP-risico beoordeelt zonder te hard op AI-koppen te reageren.',
        sectionsBody: 'De meeste HRBP-rollen verdwijnen niet van de ene op de andere dag, maar sommige versies van het werk worden wel dunner en meer geautomatiseerd.',
        sections: [
          ['Scheid administratieve support van advieshefboom', 'Hoe meer de rol zich gedraagt als people-processcoördinatie, hoe kwetsbaarder ze is dan een versie die verankerd is in managementinvloed en organisatieoordeel.'],
          ['Zoek contextzwaar werk', 'Conflictnavigatie, leiderschapscoaching en change-communicatie blijven verdedigbaarder dan alleen drafting en procesadministratie.'],
          ['Kies pivots die people-geloofwaardigheid behouden', 'Organizational effectiveness, change management en talent strategy behouden vaak je context terwijl ze je naar moeilijker vervangbaar werk verschuiven.'],
          ['Bouw bewijs van system thinking', 'Toekomstige hefboom komt vaak uit laten zien dat je kunt verbeteren hoe de organisatie werkt, niet alleen hoe die vandaag draait.'],
        ],
        ctaTitle: 'Zie of je HRBP-rol meer op proces of op oordeel is verankerd.',
        ctaBody: 'Een scan op taakniveau helpt people-werk dat dunner wordt te scheiden van de advieshefboom die nog steeds doorwerkt.',
      },
      'customer-success-manager-ai-risk': {
        linkLabel: 'Customer success manager AI-risico',
        metaTitle: 'Gids voor customer success manager AI-risico',
        metaDescription: 'Zie hoe AI customer success manager-rollen beïnvloedt, welke taken het meest blootstaan, wat nog doorwerkt en welke aangrenzende pivots het sterkst lijken.',
        title: 'Customer success manager AI-risico stijgt wanneer de rol vooral coördinatie en statusbeheer is.',
        intro: 'Customer success managers besteden vaak tijd aan onboarding, renewals, check-ins, escalatieafhandeling, stakeholdercoördinatie en accountcommunicatie. AI kan repetitieve communicatie en routinematige accountcoverage comprimeren, maar diepere accountjudgment en commerciële strategie behouden nog steeds menselijke hefboom.',
        snapshot: [
          'Routinecheck-ins, recapmails, basis-onboardingbegeleiding en coördinatiezware accountondersteuning worden vaak als eerste goedkoper.',
          'Renewalstrategie, escalatieafhandeling, stakeholdervertrouwen en commercieel oordeel behouden meestal sterkere waarde.',
          'Geloofwaardige aangrenzende pivots omvatten vaak accountstrategie, implementatieleiding, revenue operations of enablement-rollen.',
        ],
        blocks: [
          ['Blootstelling', 'De laag van generieke contactmomenten is kwetsbaar', 'Wanneer de rol gebouwd is rond updates, follow-ups, reminders en lage-complexiteit accountmotions, kan AI verminderen hoeveel menselijke coverage nodig is.'],
          ['Sterkte', 'Vertrouwen in belangrijke momenten telt nog steeds', 'Klanten hebben nog steeds een mens nodig wanneer context rommelig is, prioriteiten botsen en het account commercieel oordeel nodig heeft in plaats van gescripte support.'],
          ['Pivot', 'De sterkste stappen verdiepen eigenaarschap', 'Rollen dichter op accountstrategie, implementatiecomplexiteit of commerciële operations behouden vaak context terwijl ze verdedigbaarheid vergroten.'],
        ],
        sectionsTitle: 'Hoe je denkt over customer success-blootstelling onder AI.',
        sectionsBody: 'De kernvraag is of je werk generieke accountcoverage is of accountjudgment met hoge vertrouwenswaarde.',
        sections: [
          ['Controleer het aandeel routinematige accounttouchpoints', 'Als te veel van de week naar standaard follow-ups en terugkerende check-ins gaat, is de AI-druk waarschijnlijk hoger dan het eerst lijkt.'],
          ['Bescherm de renewal- en escalatielaag', 'Het werk dat nog doorwerkt is vaak het deel waar relatievertrouwen en besliskwaliteit het belangrijkst zijn.'],
          ['Beweeg dichter naar strategisch eigenaarschap', 'Accountstrategie, implementatieleiding en revenue operations kunnen sterkere aangrenzende paden zijn omdat ze minder op generieke coverage leunen.'],
          ['Bouw bewijs dat je uitkomsten verandert', 'Toekomstige hefboom komt uit aantoonbare retention-, expansion- of adoptionimpact, niet alleen uit activiteitsvolume.'],
        ],
        ctaTitle: 'Check of je customer success-rol vooral coverage is of echte accounthefboom.',
        ctaBody: 'De scan kan laten zien of je huidige werklast goedkoper wordt of nog steeds verankerd is in trust-heavy werk dat klanten echt waarderen.',
      },
      'recruiter-ai-risk': {
        linkLabel: 'Recruiter AI-risico',
        metaTitle: 'Gids voor recruiter AI-risico',
        metaDescription: 'Zie hoe AI recruiter-rollen beïnvloedt, welke taken het meest blootstaan, wat nog doorwerkt en welke aangrenzende pivots geloofwaardig blijven.',
        title: 'Recruiter AI-risico is het hoogst in sourcing en coördinatie, niet in hiring judgment met hoge vertrouwenswaarde.',
        intro: 'Recruiters verdelen hun tijd vaak over sourcing, outreach, planning, pipelinemanagement, kandidaatcommunicatie en hiring-managerafstemming. AI kan veel van de top-of-funnel- en administratieve laag comprimeren, maar de oordeelzware delen van hiring hangen nog steeds af van context, kalibratie en vertrouwen.',
        snapshot: [
          'Sourcing, outreach drafting, planning, pipeline-updates en routinecoördinatie staan vaak het eerst onder druk.',
          'Kandidaatbeoordeling, hiring-managerkalibratie, overtuiging en procesoordeel behouden vaak sterkere hefboom.',
          'Geloofwaardige aangrenzende pivots omvatten vaak talent operations, employer brand, people programs of strategisch recruiting leadership.',
        ],
        blocks: [
          ['Blootstelling', 'Top-of-funnel-werk wordt goedkoper', 'Recruiting wordt kwetsbaarder wanneer de week wordt gedomineerd door sourcing, coördinatie en repetitieve kandidaatcommunicatie.'],
          ['Sterkte', 'Hiring judgment draagt nog steeds gewicht', 'Het best verdedigbare deel van de rol is vaak het menselijke oordeel rond fit, signaal, geloofwaardigheid en hoe je een proces met de juiste stakeholders vooruit beweegt.'],
          ['Pivot', 'De betere stappen behouden hiringcontext', 'Talent operations en strategische recruitingpaden voelen vaak sterker omdat ze domeinkennis behouden terwijl ze richting systemen of oordeel met hogere waarde bewegen.'],
        ],
        sectionsTitle: 'Hoe je recruiter-blootstelling beoordeelt zonder de hele functie plat te slaan.',
        sectionsBody: 'Recruiting is niet in elke taak even blootgesteld. De structuur van de week telt meer dan de titel.',
        sections: [
          ['Scheid sourcing van selectieoordeel', 'Hoe meer je waarde afhangt van alleen top-of-funnel-generatie, hoe kwetsbaarder de rol waarschijnlijk is.'],
          ['Waardeer de afstemmingslaag', 'Hiring managers helpen kalibreren, trade-offs maken en kandidaten closen is moeilijker te comprimeren dan routinecoördinatie.'],
          ['Kies aangrenzende stappen die people-marketcontext behouden', 'Talent operations, employer brand en people programs kunnen geloofwaardigheid behouden terwijl ze afhankelijkheid van comprimeerbaar sourcingwerk verminderen.'],
          ['Bouw bewijs van procesimpact', 'Het sterkste signaal is niet alleen volume. Het is hiringkwaliteit, processnelheid en stakeholdervertrouwen verbeteren.'],
        ],
        ctaTitle: 'Zie of je recruitingrol nog steeds op oordeel is gebouwd of vooral op volume.',
        ctaBody: 'Een scan op taakniveau kan laten zien of je hefboom uit hiringinzicht komt of uit workflowlagen die AI snel comprimeert.',
      },
      'office-manager-ai-risk': {
        linkLabel: 'Office manager AI-risico',
        metaTitle: 'Gids voor office manager AI-risico',
        metaDescription: 'Zie hoe AI office manager-rollen beïnvloedt, welke taken het meest blootstaan, wat nog doorwerkt en welke aangrenzende pivots het sterkst kunnen zijn.',
        title: 'Office manager AI-risico zit meestal geconcentreerd in coördinatie, planning en administratieve flow.',
        intro: 'Office managers dragen vaak planning, leverancierscoördinatie, documentatie, office operations, meeting support en cross-team administratieve coverage. AI kan een groot deel van repetitieve coördinatie comprimeren, maar de rol houdt nog steeds waarde wanneer die uitbreidt naar operations-eigenaarschap en uitvoeringsbetrouwbaarheid.',
        snapshot: [
          'Planning, documentatie, meeting prep, terugkerende coördinatie en standaard admin-support voelen vaak als eerste druk.',
          'Uitvoeringseigenaarschap, operationele betrouwbaarheid, oordeel tussen stakeholders en probleemoplossing houden meestal meer waarde.',
          'Geloofwaardige aangrenzende pivots omvatten vaak operations coordinator, program operations, workplace operations of project support-rollen.',
        ],
        blocks: [
          ['Blootstelling', 'Administratieve workflow is sterk comprimeerbaar', 'Hoe meer de rol gebouwd is rond agenda’s, reminders, geformatteerde documenten en routinefollow-up, hoe kwetsbaarder die wordt.'],
          ['Sterkte', 'Operationele stabiliteit blijft belangrijk', 'Een sterke office manager levert vaak betrouwbaarheid over bewegende onderdelen heen, lost ambiguïteit op en houdt teams functionerend wanneer de workflow rommelig is.'],
          ['Pivot', 'De beste volgende stap verschuift vaak richting operations', 'Operations- en program-supportrollen kunnen sterker voelen omdat ze de coördinatiecontext behouden terwijl ze scope en eigenaarschap vergroten.'],
        ],
        sectionsTitle: 'Hoe je denkt over office manager-blootstelling onder AI.',
        sectionsBody: 'Het nuttige onderscheid is tussen routinematige administratieve throughput en echt operationeel eigenaarschap.',
        sections: [
          ['Meet hoeveel van de week pure adminflow is', 'Als het grootste deel van de werklast uit planning, formatteren, documenteren en coördinatie bestaat, is het risico waarschijnlijk hoger dan de titel alleen suggereert.'],
          ['Bescherm de laag van uitvoeringsbetrouwbaarheid', 'Werk dat teams afgestemd houdt en operationele frictie oplost blijft tellen wanneer het afhangt van context en oordeel.'],
          ['Kies pivots met meer eigenaarschap', 'Program operations, workplace operations en project support bieden vaak sterkere aangrenzende paden dan volledig in generieke admincoverage blijven.'],
          ['Bouw bewijs van operationele impact', 'Het volgende niveau signaal is laten zien dat je teambetrouwbaarheid verbetert, niet alleen dat je taken laat doorlopen.'],
        ],
        ctaTitle: 'Zie of je officerol op comprimeerbaar adminwerk of op operationele hefboom is gebouwd.',
        ctaBody: 'De scan helpt routinecoördinatie te scheiden van het uitvoeringseigenaarschap dat nog steeds kan doorwerken in sterkere aangrenzende paden.',
      },
    },
  },
  de: {
    common: {
      navSubtitle: 'Rollenrisiko-Leitfaden',
      eyebrow: 'Rollenleitfaden',
      snapshotEyebrow: 'Kurzüberblick',
      snapshotTitle: 'Was in dieser Rolle meist am wichtigsten ist.',
      sectionsEyebrow: 'Wie man die Rolle denken sollte',
      ctaEyebrow: 'Scan starten',
      homeButton: 'Zurück zur Startseite',
      ctaButton: 'Meinen kostenlosen Scan starten',
      relatedHeading: 'Verwandte Rollenleitfäden',
      methodologyButton: 'Methodik ansehen',
      methodologyLinkLabel: 'Wie PivotIQ Risiko und Pivots bewertet',
    },
    pages: {
      'marketing-manager-ai-risk': {
        linkLabel: 'Marketing-Manager KI-Risiko',
        metaTitle: 'Leitfaden zum Marketing-Manager KI-Risiko',
        metaDescription: 'Sieh, wie KI Marketing-Manager-Rollen verändert, welche Aufgaben am stärksten exponiert sind, was weiter wächst und welche angrenzenden Pivots am stärksten aussehen.',
        title: 'Das KI-Risiko von Marketing-Managern ist meist in ausführungsnaher Koordinationsarbeit am höchsten.',
        intro: 'Marketing-Manager sitzen oft im Zentrum von Briefings, Reporting, Stakeholder-Koordination, Kampagnen-Operations und Kanalausführung. KI lässt die ganze Rolle selten auf einmal verschwinden, kann aber die Teile komprimieren, die auf repetitiver Produktion und wiederkehrender Synthese beruhen.',
        snapshot: [
          'Kampagnen-Reporting, Content-Briefing, grundlegende Kanalplanung und wiederkehrende Update-Arbeit spüren oft zuerst Druck.',
          'Urteil bei Positionierung, funktionsübergreifender Ausrichtung, Trade-offs und Business-Übersetzung behält meist stärkeren menschlichen Hebel.',
          'Glaubwürdige angrenzende Pivots bewegen sich oft in Richtung Revenue Operations, Lifecycle-Strategie, Marketing Operations oder strategische Planung.',
        ],
        blocks: [
          ['Exposition', 'Wo der Druck meist wächst', 'Die Rolle wird fragiler, wenn zu viel der Woche in Asset-Koordination, Umformatieren von Updates, Schreiben vorlagenbasierter Briefs oder Verpacken von Kampagnenergebnissen steckt.'],
          ['Stärke', 'Was weiter wächst', 'Kontextreiche Messaging-Entscheidungen, Kanal-Trade-offs, Kommunikation mit der Führungsebene und Ownership über Teams hinweg bleiben schwerer zu ersetzen als die Produktionsschicht darum herum.'],
          ['Pivot', 'Wie ein kluger nächster Schritt aussehen kann', 'Der stärkste Schritt ist oft nicht “AI Marketing Manager”. Es ist eine Verschiebung in Richtung Rollen, in denen strategisches Urteil und operativer Hebel wichtiger sind als Content-Durchsatz.'],
        ],
        sectionsTitle: 'Wie man eine Marketing-Manager-Rolle unter KI-Druck bewertet.',
        sectionsBody: 'Die nützliche Frage ist nicht, ob Marketing KI nutzen wird. Die Frage ist, ob deine Rolle noch in der Arbeit verankert ist, die weiter wächst, wenn KI in den Workflow kommt.',
        sections: [
          ['Orchestrierung von Ownership trennen', 'Wenn dein Wert vor allem daraus kommt, bewegliche Teile zu koordinieren, ist die Rolle exponierter als eine Version, die auf Strategie und Entscheidungsqualität basiert.'],
          ['Darauf schauen, wie viel der Woche vorlagenbasiert ist', 'Je mehr deine Arbeitslast von wiederkehrenden Briefs, neu verpacktem Reporting und routinemäßiger Asset-Steuerung abhängt, desto stärker kann KI die Mitte komprimieren.'],
          ['Die Business-Übersetzungsschicht schützen', 'Die stärksten Marketing-Manager helfen der Führung weiter zu entscheiden, wo investiert wird, was gestoppt werden sollte und wie Teams auf Signal statt auf Rauschen ausgerichtet werden.'],
          ['Pivots wählen, die Glaubwürdigkeit bewahren', 'Revenue Operations, Lifecycle-Strategie und Marketing Operations fühlen sich oft glaubwürdig an, weil sie denselben Kontext behalten und näher an schwerer ersetzbare Arbeit rücken.'],
        ],
        ctaTitle: 'Sieh, wie exponiert deine Marketing-Rolle auf Aufgabenebene wirklich ist.',
        ctaBody: 'Ein breiter Artikel über KI im Marketing reicht nicht. Ein Scan auf Aufgabenebene kann zeigen, ob dein echter Hebel wächst oder leiser dünner wird.',
      },
      'fpa-analyst-ai-risk': {
        linkLabel: 'FP&A-Analyst KI-Risiko',
        metaTitle: 'Leitfaden zum FP&A-Analyst KI-Risiko',
        metaDescription: 'Sieh, wie KI FP&A-Analyst-Rollen verändert, welche Finanzaufgaben am stärksten exponiert sind, was weiter wächst und welche angrenzenden Pivots sinnvoll sind.',
        title: 'Das KI-Risiko von FP&A-Analysten sitzt meist stärker in wiederholbarem Reporting als im Business-Urteil.',
        intro: 'FP&A-Analysten arbeiten nah an Reporting, Forecasting, Szenarioaufbau, Planungsrhythmen und Executive Support. KI kann Teile der Reporting- und Syntheseschicht schnell komprimieren, aber die Decision-Support-Schicht schwächt sich meist langsamer ab, weil sie von Kontext und Urteil abhängt.',
        snapshot: [
          'Wiederkehrendes Abweichungsreporting, Datenaufbereitung, Slide-Verpackung und vorlagenbasierter Kommentar spüren meist zuerst Druck.',
          'Szenario-Framing, Finance-Storytelling, Business Partnership und Trade-off-Führung behalten oft stärkeren Hebel.',
          'Glaubwürdige angrenzende Pivots umfassen oft Finance Business Partner, Strategic Finance, Revenue Operations oder Planungsrollen.',
        ],
        blocks: [
          ['Exposition', 'Die Reporting-Schicht wird zuerst billiger', 'Wenn die Rolle stark auf wiederkehrende Decks, routinemäßigen Abweichungskommentar und manuelle Datenzusammenstellung baut, kann KI einen bedeutenden Teil der Arbeitslast komprimieren.'],
          ['Stärke', 'Interpretation bleibt wichtig', 'Führungskräfte brauchen weiter jemanden, der erklärt, was die Zahlen bedeuten, welche Annahmen sich verschieben und welche Entscheidungen jetzt Aufmerksamkeit verdienen.'],
          ['Pivot', 'Die stärkeren Wege bewegen sich näher an Geschäftsentscheidungen', 'Der beste angrenzende Schritt bewahrt meist deinen Finance-Kontext und verschiebt dich gleichzeitig in Richtung höher vertrauenswürdiger Interpretation und Planungs-Ownership.'],
        ],
        sectionsTitle: 'Wie man über die Exposition von FP&A-Analysten unter KI nachdenkt.',
        sectionsBody: 'Der nützlichste Blickwinkel ist, finanzielle Produktion von finanziellem Urteil zu trennen.',
        sections: [
          ['Prüfen, wie viel Zeit in wiederkehrenden Output fließt', 'Wenn ein großer Teil der Woche in Verpacken von Updates und Pflege vorlagenbasierter Reports geht, ist das Risiko höher, als der Titel allein vermuten lässt.'],
          ['Die Übersetzungsschicht wertschätzen', 'Trade-offs für Nicht-Finanz-Leader zu erklären bleibt verteidigbarer, als nur die zugrunde liegenden Materialien zu produzieren.'],
          ['Pivots suchen, die Finance-Glaubwürdigkeit intakt halten', 'Finance-Business-Partner- und Strategic-Planning-Rollen fühlen sich oft glaubwürdig an, weil sie auf demselben Kernvertrauen aufbauen.'],
          ['Beweise jenseits technischer Genauigkeit aufbauen', 'Das nächste Signal ist nicht nur korrekte Zahlen. Es ist, finanzielle Inputs in Entscheidungen zu übersetzen, nach denen Führungskräfte tatsächlich handeln können.'],
        ],
        ctaTitle: 'Prüfe, ob deine FP&A-Rolle in Richtung Kompression oder stärkeren Hebel driftet.',
        ctaBody: 'Ein Scan auf Aufgabenebene kann zeigen, ob deine Finance-Rolle noch Entscheidungshebel aufbaut oder zurück in billigere Output-Arbeit gezogen wird.',
      },
      'hr-business-partner-ai-risk': {
        linkLabel: 'HR Business Partner KI-Risiko',
        metaTitle: 'Leitfaden zum HR Business Partner KI-Risiko',
        metaDescription: 'Sieh, wie KI HR-Business-Partner-Rollen verändert, welche Aufgaben am stärksten exponiert sind, was verteidigbar bleibt und welche angrenzenden Pivots am stärksten aussehen.',
        title: 'Das KI-Risiko von HR Business Partnern ist in urteilsintensiver Arbeit geringer als in prozesslastiger Unterstützung.',
        intro: 'HR Business Partner arbeiten oft über Performance-Gespräche, Organisationsdesign, Manager-Support, Workforce Planning, Dokumentation und Employee Issues hinweg. KI kann die Last von Prozess, Drafting und administrativer Unterstützung senken, aber die Beratungsschicht bleibt von Urteil, Vertrauen und Organisationskontext abhängig.',
        snapshot: [
          'Policy-Drafting, wiederkehrende Dokumentation, koordinationslastiger Support und vorlagenbasiertes People-Process-Arbeiten komprimieren oft früher.',
          'Manager-Coaching, Organisationsurteil, sensible Stakeholder-Handhabung und Change-Navigation behalten meist stärkeren menschlichen Hebel.',
          'Glaubwürdige angrenzende Pivots umfassen oft Organizational Effectiveness, People Strategy, Talent Programs oder Change Management.',
        ],
        blocks: [
          ['Exposition', 'Prozessunterstützung wird schneller billiger', 'Je mehr deine Woche auf Drafting, Dokumentation, vorlagenbasierter Kommunikation und Routinekoordination beruht, desto exponierter wird die Rolle.'],
          ['Stärke', 'Vertrauen zählt weiter', 'Der HRBP-Vorteil ist nicht nur Policy-Wissen. Es ist die Fähigkeit, sensible Entscheidungen zu navigieren, Kontext zu interpretieren und Manager in Momenten mit hohem Urteilsbedarf zu beeinflussen.'],
          ['Pivot', 'Die stärksten angrenzenden Schritte vertiefen Advisory-Ownership', 'Organizational-Effectiveness- und People-Strategy-Rollen fühlen sich oft stärker an, weil sie weiter in Richtung Urteil und Systemdesign gehen.'],
        ],
        sectionsTitle: 'Wie man HRBP-Risiko bewertet, ohne auf KI-Schlagzeilen überzureagieren.',
        sectionsBody: 'Die meisten HRBP-Rollen verschwinden nicht über Nacht, aber manche Versionen der Arbeit werden dünner und automatisierter.',
        sections: [
          ['Administrative Unterstützung von Advisory-Hebel trennen', 'Je mehr sich die Rolle wie People-Process-Koordination verhält, desto exponierter ist sie als eine Version, die in Führungseinfluss und Organisationsurteil verankert ist.'],
          ['Nach kontextreicher Arbeit suchen', 'Konfliktnavigation, Leadership-Coaching und Change-Kommunikation bleiben verteidigbarer als nur Drafting und Prozessadministration.'],
          ['Pivots wählen, die People-Glaubwürdigkeit erhalten', 'Organizational Effectiveness, Change Management und Talent Strategy bewahren oft deinen Kontext, während sie dich in schwerer ersetzbare Arbeit verschieben.'],
          ['Beweise für Systemdenken aufbauen', 'Zukünftiger Hebel kommt oft daraus zu zeigen, dass du verbessern kannst, wie die Organisation funktioniert, nicht nur wie sie heute läuft.'],
        ],
        ctaTitle: 'Sieh, ob deine HRBP-Rolle eher auf Prozess oder auf Urteil verankert ist.',
        ctaBody: 'Ein Scan auf Aufgabenebene hilft, dünner werdende People-Arbeit von dem Advisory-Hebel zu trennen, der weiter wächst.',
      },
      'customer-success-manager-ai-risk': {
        linkLabel: 'Customer Success Manager KI-Risiko',
        metaTitle: 'Leitfaden zum Customer Success Manager KI-Risiko',
        metaDescription: 'Sieh, wie KI Customer-Success-Manager-Rollen verändert, welche Aufgaben am stärksten exponiert sind, was weiter wächst und welche angrenzenden Pivots am stärksten aussehen.',
        title: 'Das KI-Risiko von Customer Success Managern steigt, wenn die Rolle vor allem aus Koordination und Statusmanagement besteht.',
        intro: 'Customer Success Manager verbringen oft Zeit mit Onboarding, Renewals, Check-ins, Eskalationsbearbeitung, Stakeholder-Koordination und Account-Kommunikation. KI kann repetitive Kommunikation und routinemäßige Account-Abdeckung komprimieren, aber tieferes Account-Urteil und kommerzielle Strategie behalten weiter menschlichen Hebel.',
        snapshot: [
          'Routine-Check-ins, Recap-Mails, grundlegende Onboarding-Hinweise und koordinationslastiger Account-Support werden oft zuerst billiger.',
          'Renewal-Strategie, Eskalationsbearbeitung, Stakeholder-Vertrauen und kommerzielles Urteil behalten meist stärkeren Wert.',
          'Glaubwürdige angrenzende Pivots umfassen oft Account-Strategie, Implementierungsführung, Revenue Operations oder Enablement-Rollen.',
        ],
        blocks: [
          ['Exposition', 'Die generische Touchpoint-Schicht ist verwundbar', 'Wenn die Rolle auf Updates, Follow-ups, Erinnerungen und Low-Complexity-Account-Motions basiert, kann KI reduzieren, wie viel menschliche Abdeckung benötigt wird.'],
          ['Stärke', 'Vertrauen in wichtigen Momenten zählt weiter', 'Kunden brauchen weiter einen Menschen, wenn der Kontext unordentlich ist, Prioritäten kollidieren und das Account kommerzielles Urteil statt geskripteten Support braucht.'],
          ['Pivot', 'Die stärksten Schritte vertiefen Ownership', 'Rollen näher an Account-Strategie, Implementierungskomplexität oder Commercial Operations bewahren oft Kontext und erhöhen gleichzeitig die Verteidigbarkeit.'],
        ],
        sectionsTitle: 'Wie man über Customer-Success-Exposition unter KI nachdenkt.',
        sectionsBody: 'Die Kernfrage ist, ob deine Arbeit generische Account-Abdeckung oder vertrauensintensives Account-Urteil ist.',
        sections: [
          ['Den Anteil routinemäßiger Account-Touchpoints prüfen', 'Wenn zu viel der Woche in Standard-Follow-ups und wiederkehrende Check-ins geht, ist der KI-Druck wahrscheinlich höher, als es zuerst scheint.'],
          ['Die Renewal- und Eskalationsschicht schützen', 'Die Arbeit, die weiter wächst, ist oft der Teil, in dem Beziehungsvertrauen und Entscheidungsqualität am wichtigsten sind.'],
          ['Näher an strategisches Ownership rücken', 'Account-Strategie, Implementierungsführung und Revenue Operations können stärkere angrenzende Wege sein, weil sie weniger auf generische Abdeckung angewiesen sind.'],
          ['Beweise bauen, dass du Ergebnisse veränderst', 'Zukünftiger Hebel kommt aus messbarer Retention-, Expansion- oder Adoption-Wirkung, nicht nur aus Aktivitätsvolumen.'],
        ],
        ctaTitle: 'Prüfe, ob deine Customer-Success-Rolle vor allem Coverage oder echter Account-Hebel ist.',
        ctaBody: 'Der Scan kann zeigen, ob deine aktuelle Arbeitslast billiger wird oder ob sie weiter in vertrauensintensiver Arbeit verankert ist, die Kunden wirklich schätzen.',
      },
      'recruiter-ai-risk': {
        linkLabel: 'Recruiter KI-Risiko',
        metaTitle: 'Leitfaden zum Recruiter KI-Risiko',
        metaDescription: 'Sieh, wie KI Recruiter-Rollen verändert, welche Aufgaben am stärksten exponiert sind, was weiter wächst und welche angrenzenden Pivots glaubwürdig bleiben.',
        title: 'Das KI-Risiko von Recruitern ist im Sourcing und in der Koordination am höchsten, nicht im vertrauensintensiven Hiring-Urteil.',
        intro: 'Recruiter teilen ihre Zeit oft zwischen Sourcing, Outreach, Scheduling, Pipeline-Management, Kandidatenkommunikation und Hiring-Manager-Abstimmung auf. KI kann viel der Top-of-Funnel- und administrativen Schicht komprimieren, aber die urteilsintensiven Teile des Hiring hängen weiter von Kontext, Kalibrierung und Vertrauen ab.',
        snapshot: [
          'Sourcing, Outreach-Drafting, Scheduling, Pipeline-Updates und Routinekoordination stehen oft zuerst unter Druck.',
          'Kandidatenbewertung, Hiring-Manager-Kalibrierung, Überzeugung und Prozessurteil behalten oft stärkeren Hebel.',
          'Glaubwürdige angrenzende Pivots umfassen oft Talent Operations, Employer Brand, People Programs oder strategisches Recruiting Leadership.',
        ],
        blocks: [
          ['Exposition', 'Top-of-Funnel-Arbeit wird billiger', 'Recruiting wird exponierter, wenn die Woche von Sourcing, Koordination und repetitiver Kandidatenkommunikation dominiert wird.'],
          ['Stärke', 'Hiring-Urteil trägt weiter Gewicht', 'Der am besten verteidigbare Teil der Rolle ist oft das menschliche Urteil rund um Fit, Signal, Glaubwürdigkeit und wie man einen Prozess mit den richtigen Stakeholdern voranbringt.'],
          ['Pivot', 'Die besseren Schritte bewahren Hiring-Kontext', 'Talent Operations und strategische Recruiting-Wege fühlen sich oft stärker an, weil sie Domain-Wissen erhalten und gleichzeitig in Richtung Systeme oder höherwertiges Urteil verschieben.'],
        ],
        sectionsTitle: 'Wie man Recruiter-Exposition bewertet, ohne die ganze Funktion zu nivellieren.',
        sectionsBody: 'Recruiting ist nicht in jeder Aufgabe gleich exponiert. Die Struktur der Woche zählt mehr als der Titel.',
        sections: [
          ['Sourcing von Auswahlurteil trennen', 'Je mehr dein Wert nur von Top-of-Funnel-Generierung abhängt, desto exponierter ist die Rolle wahrscheinlich.'],
          ['Die Ausrichtungsschicht wertschätzen', 'Hiring Manager bei Kalibrierung, Trade-offs und Candidate Closing zu helfen ist schwerer zu komprimieren als Routinekoordination.'],
          ['Angrenzende Schritte wählen, die People-Market-Kontext behalten', 'Talent Operations, Employer Brand und People Programs können Glaubwürdigkeit erhalten und gleichzeitig die Abhängigkeit von komprimierbarer Sourcing-Arbeit senken.'],
          ['Beweise für Prozesswirkung aufbauen', 'Das stärkste Signal ist nicht nur Volumen. Es ist Verbesserungen bei Hiring-Qualität, Prozessgeschwindigkeit und Stakeholder-Vertrauen.'],
        ],
        ctaTitle: 'Sieh, ob deine Recruiting-Rolle weiter auf Urteil oder vor allem auf Volumen gebaut ist.',
        ctaBody: 'Ein Scan auf Aufgabenebene kann zeigen, ob dein Hebel aus Hiring-Insight kommt oder aus Workflow-Schichten, die KI schnell komprimiert.',
      },
      'office-manager-ai-risk': {
        linkLabel: 'Office Manager KI-Risiko',
        metaTitle: 'Leitfaden zum Office Manager KI-Risiko',
        metaDescription: 'Sieh, wie KI Office-Manager-Rollen verändert, welche Aufgaben am stärksten exponiert sind, was weiter wächst und welche angrenzenden Pivots am stärksten sein können.',
        title: 'Das KI-Risiko von Office Managern konzentriert sich meist auf Koordination, Scheduling und administrativen Flow.',
        intro: 'Office Manager tragen oft Scheduling, Vendor-Koordination, Dokumentation, Office Operations, Meeting-Support und funktionsübergreifende administrative Abdeckung. KI kann einen großen Teil repetitiver Koordination komprimieren, aber die Rolle behält weiter Wert, wenn sie in Operations-Ownership und Ausführungszuverlässigkeit hinein wächst.',
        snapshot: [
          'Scheduling, Dokumentation, Meeting Prep, wiederkehrende Koordination und standardmäßiger Admin-Support spüren oft zuerst Druck.',
          'Ausführungs-Ownership, operative Zuverlässigkeit, Urteil zwischen Stakeholdern und Problemlösung behalten meist mehr Wert.',
          'Glaubwürdige angrenzende Pivots umfassen oft Operations Coordinator, Program Operations, Workplace Operations oder Project Support-Rollen.',
        ],
        blocks: [
          ['Exposition', 'Administrative Workflows sind stark komprimierbar', 'Je mehr die Rolle auf Kalendern, Erinnerungen, formatierten Dokumenten und Routine-Follow-up basiert, desto exponierter wird sie.'],
          ['Stärke', 'Operative Stabilität bleibt wichtig', 'Ein starker Office Manager liefert oft Zuverlässigkeit über bewegliche Teile hinweg, löst Mehrdeutigkeit und hält Teams funktionsfähig, wenn der Workflow unordentlich ist.'],
          ['Pivot', 'Der beste nächste Schritt verschiebt sich oft in Richtung Operations', 'Operations- und Program-Support-Rollen können sich stärker anfühlen, weil sie den Koordinationskontext erhalten und gleichzeitig Scope und Ownership vergrößern.'],
        ],
        sectionsTitle: 'Wie man über Office-Manager-Exposition unter KI nachdenkt.',
        sectionsBody: 'Die nützliche Unterscheidung ist die zwischen routinemäßigem administrativem Durchsatz und echtem operativem Ownership.',
        sections: [
          ['Messen, wie viel der Woche reiner Admin-Flow ist', 'Wenn der Großteil der Arbeitslast aus Scheduling, Formatierung, Dokumentation und Koordination besteht, ist das Risiko wahrscheinlich höher, als der Titel allein vermuten lässt.'],
          ['Die Ausführungszuverlässigkeitsschicht schützen', 'Arbeit, die Teams ausgerichtet hält und operative Reibung löst, zählt weiter, wenn sie von Kontext und Urteil abhängt.'],
          ['Pivots mit mehr Ownership wählen', 'Program Operations, Workplace Operations und Project Support bieten oft stärkere angrenzende Wege, als vollständig in generischer Admin-Abdeckung zu bleiben.'],
          ['Beweise für operative Wirkung aufbauen', 'Das nächste Signal ist zu zeigen, dass du Team-Zuverlässigkeit verbesserst, nicht nur Aufgaben in Bewegung hältst.'],
        ],
        ctaTitle: 'Sieh, ob deine Office-Rolle auf komprimierbarer Admin-Arbeit oder auf operativem Hebel aufgebaut ist.',
        ctaBody: 'Der Scan hilft, Routinekoordination von dem Ausführungs-Ownership zu trennen, das weiter in stärkere angrenzende Wege wachsen kann.',
      },
    },
  },
};

export function getRolePage(locale, slug) {
  const normalizedLocale = normalizeLocale(locale);
  const localized = content[normalizedLocale] || content.en;
  const page = localized.pages[slug];

  if (!page) {
    return null;
  }

  return {
    ...localized.common,
    takeawaysEyebrow: localized.common.snapshotEyebrow,
    takeawaysTitle: localized.common.snapshotTitle,
    takeaways: [],
    roleGuidesEyebrow: localized.common.relatedHeading,
    roleGuidesTitle: localized.common.relatedHeading,
    roleGuidesBody: localized.common.methodologyLinkLabel,
    roleGuideLinkPrompt: localized.common.methodologyButton,
    ...page,
    takeawaysEyebrow: page.takeawaysEyebrow || page.snapshotEyebrow || localized.common.snapshotEyebrow,
    takeawaysTitle: page.takeawaysTitle || page.snapshotTitle || localized.common.snapshotTitle,
    takeaways: page.takeaways || page.snapshot || [],
    roleGuidesEyebrow: page.roleGuidesEyebrow || localized.common.relatedHeading,
    roleGuidesTitle: page.roleGuidesTitle || localized.common.relatedHeading,
    roleGuidesBody: page.roleGuidesBody || localized.common.methodologyLinkLabel,
    roleGuideLinkPrompt: page.roleGuideLinkPrompt || localized.common.methodologyButton,
  };
}

export function hasRolePage(slug) {
  return ROLE_PAGE_SLUGS.includes(slug);
}

export function getRelatedRolePages(locale, currentSlug) {
  const normalizedLocale = normalizeLocale(locale);
  const localized = content[normalizedLocale] || content.en;

  return relatedRoleSlugs
    .filter((slug) => slug !== currentSlug)
    .slice(0, 3)
    .map((slug) => ({
      href: `/roles/${slug}`,
      label: localized.pages[slug].linkLabel,
    }));
}

export function getRoleGuideLinks(locale, slugs = ROLE_PAGE_SLUGS) {
  const normalizedLocale = normalizeLocale(locale);
  const localized = content[normalizedLocale] || content.en;

  return slugs
    .filter((slug) => localized.pages[slug])
    .map((slug) => ({
      href: `/roles/${slug}`,
      label: localized.pages[slug].linkLabel,
      title: localized.pages[slug].title,
    }));
}
