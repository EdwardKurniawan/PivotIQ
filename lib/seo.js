import { normalizeLocale } from './i18n';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';

const seoMessages = {
  en: {
    home: {
      title: 'AI Career Risk Scanner and Job Automation Risk Test',
      description:
        'PivotIQ is an AI career risk scanner and career pivot planner for white-collar professionals. See job automation risk by task, find believable adjacent pivots, and build a transition roadmap.',
    },
    aiCareerRisk: {
      title: 'AI Career Risk Guide for White-Collar Professionals',
      description:
        'Understand AI career risk at the task level, see what inside your role is getting compressed, and learn how to respond before urgency forces the pivot.',
    },
    careerPivotPlanner: {
      title: 'Career Pivot Planner for AI-Exposed Roles',
      description:
        'Use a career pivot planner built for white-collar professionals who need believable adjacent moves, clearer skill priorities, and a practical transition roadmap.',
    },
    whiteCollarJobsAtRisk: {
      title: 'White-Collar Jobs at Risk From AI',
      description:
        'See which white-collar jobs are most exposed to AI, why task mix matters more than title alone, and how to find stronger adjacent paths.',
    },
    methodology: {
      title: 'PivotIQ Methodology and Scoring Logic',
      description:
        'See how PivotIQ approaches AI career risk, task-level exposure, believable pivots, and roadmap recommendations for white-collar professionals.',
    },
    audit: {
      title: 'Free AI Career Risk Scan',
      description:
        'Run a free AI career risk scan to see which tasks in your role are getting compressed, where your human edge still compounds, and which pivots are worth exploring next.',
    },
    login: {
      title: 'Sign In to Save Your Career Reports',
      description:
        'Sign in to PivotIQ to save reports, track roadmap progress, and come back to your AI career risk scan without losing momentum.',
    },
    privacy: {
      title: 'Privacy Policy',
      description:
        'Read how PivotIQ collects, stores, and uses account data, audit inputs, reports, and payment information.',
    },
    terms: {
      title: 'Terms of Service',
      description:
        'Review the terms that govern your use of PivotIQ, including payments, report recommendations, and account responsibilities.',
    },
    contact: {
      title: 'Contact PivotIQ',
      description:
        'Contact PivotIQ for support, payments, privacy requests, or partnership questions.',
    },
    dashboard: {
      title: 'Dashboard',
      description:
        'Saved reports, roadmap progress, and account state for PivotIQ users.',
    },
    success: {
      title: 'Unlock Complete',
      description:
        'Confirmation page for successful PivotIQ unlocks and report access updates.',
    },
    report: {
      title: 'Career Report',
      description:
        'Personalized PivotIQ report experience with pivots, skill gaps, and roadmap guidance.',
    },
  },
  nl: {
    home: {
      title: 'AI-carrièrerisicoscan en test voor automatiseringsrisico',
      description:
        'PivotIQ is een AI-carrièrerisicoscan en carrièrepivotplanner voor white-collar professionals. Zie automatiseringsrisico per taak, ontdek geloofwaardige aangrenzende pivots en bouw een roadmap voor de overgang.',
    },
    aiCareerRisk: {
      title: 'Gids voor AI-carrièrerisico bij white-collar professionals',
      description:
        'Begrijp AI-carrièrerisico op taakniveau, zie welk deel van je rol onder druk komt en leer hoe je reageert voordat urgentie je dwingt te pivoten.',
    },
    careerPivotPlanner: {
      title: 'Carrièrepivotplanner voor AI-blootgestelde rollen',
      description:
        'Gebruik een carrièrepivotplanner voor white-collar professionals die geloofwaardige aangrenzende stappen, scherpere skill-prioriteiten en een praktische roadmap nodig hebben.',
    },
    whiteCollarJobsAtRisk: {
      title: 'White-collar banen die risico lopen door AI',
      description:
        'Zie welke white-collar banen het meest blootstaan aan AI, waarom takenmix belangrijker is dan titel alleen, en hoe je sterkere aangrenzende paden vindt.',
    },
    methodology: {
      title: 'PivotIQ-methodologie en scorelogica',
      description:
        'Zie hoe PivotIQ kijkt naar AI-carrièrerisico, blootstelling op taakniveau, geloofwaardige pivots en roadmap-aanbevelingen voor white-collar professionals.',
    },
    audit: {
      title: 'Gratis AI-carrièrerisicoscan',
      description:
        'Doe een gratis AI-carrièrerisicoscan om te zien welke taken in je rol onder druk komen, waar je menselijke voordeel nog groeit en welke pivots logisch zijn.',
    },
    login: {
      title: 'Log in om je carrièreresultaten op te slaan',
      description:
        'Log in bij PivotIQ om rapporten op te slaan, roadmap-voortgang bij te houden en later verder te gaan met je AI-carrièrescan.',
    },
    privacy: {
      title: 'Privacybeleid',
      description:
        'Lees hoe PivotIQ accountgegevens, audit-invoer, rapporten en betaalinformatie verzamelt, bewaart en gebruikt.',
    },
    terms: {
      title: 'Algemene voorwaarden',
      description:
        'Bekijk de voorwaarden voor het gebruik van PivotIQ, inclusief betalingen, rapportaanbevelingen en accountverantwoordelijkheden.',
    },
    contact: {
      title: 'Contact met PivotIQ',
      description:
        'Neem contact op met PivotIQ voor support, betalingen, privacyverzoeken of samenwerkingen.',
    },
    dashboard: {
      title: 'Dashboard',
      description:
        'Opgeslagen rapporten, roadmap-voortgang en accountstatus voor PivotIQ-gebruikers.',
    },
    success: {
      title: 'Ontgrendeling voltooid',
      description:
        'Bevestigingspagina voor succesvolle PivotIQ-ontgrendelingen en bijgewerkte rapporttoegang.',
    },
    report: {
      title: 'Carrièrerapport',
      description:
        'Gepersonaliseerde PivotIQ-rapportervaring met pivots, skill gaps en roadmapbegeleiding.',
    },
  },
  de: {
    home: {
      title: 'KI-Karriererisiko-Scan und Test für Automatisierungsrisiko',
      description:
        'PivotIQ ist ein KI-Karriererisiko-Scan und Karriere-Pivot-Planer für White-Collar-Professionals. Sieh Automatisierungsrisiko pro Aufgabe, finde glaubwürdige angrenzende Pivots und baue eine Übergangs-Roadmap.',
    },
    aiCareerRisk: {
      title: 'Leitfaden zum KI-Karriererisiko für White-Collar-Professionals',
      description:
        'Verstehe KI-Karriererisiko auf Aufgabenebene, sieh, welcher Teil deiner Rolle unter Druck gerät, und lerne, wie du reagierst, bevor Dringlichkeit dich zum Pivot zwingt.',
    },
    careerPivotPlanner: {
      title: 'Karriere-Pivot-Planer für KI-exponierte Rollen',
      description:
        'Nutze einen Karriere-Pivot-Planer für White-Collar-Professionals, die glaubwürdige angrenzende Schritte, klarere Skill-Prioritäten und eine praktische Übergangs-Roadmap brauchen.',
    },
    whiteCollarJobsAtRisk: {
      title: 'White-Collar-Jobs mit Risiko durch KI',
      description:
        'Sieh, welche White-Collar-Jobs KI am stärksten ausgesetzt sind, warum der Aufgabenmix wichtiger ist als der Titel allein und wie du stärkere angrenzende Wege findest.',
    },
    methodology: {
      title: 'PivotIQ-Methodik und Logik hinter der Bewertung',
      description:
        'Sieh, wie PivotIQ KI-Karriererisiko, Aufgaben-Exposition, glaubwürdige Pivots und Roadmap-Empfehlungen für White-Collar-Professionals bewertet.',
    },
    audit: {
      title: 'Kostenloser KI-Karriererisiko-Scan',
      description:
        'Starte einen kostenlosen KI-Karriererisiko-Scan, um zu sehen, welche Aufgaben in deiner Rolle unter Druck geraten, wo dein menschlicher Vorteil wächst und welche Pivots sinnvoll sind.',
    },
    login: {
      title: 'Anmelden, um deine Karriereberichte zu speichern',
      description:
        'Melde dich bei PivotIQ an, um Berichte zu speichern, Roadmap-Fortschritt zu verfolgen und später zu deinem KI-Karrierescan zurückzukehren.',
    },
    privacy: {
      title: 'Datenschutzerklärung',
      description:
        'Lies, wie PivotIQ Kontodaten, Audit-Eingaben, Berichte und Zahlungsinformationen erhebt, speichert und verwendet.',
    },
    terms: {
      title: 'Nutzungsbedingungen',
      description:
        'Prüfe die Bedingungen für die Nutzung von PivotIQ, einschließlich Zahlungen, Berichtsempfehlungen und Kontoverantwortung.',
    },
    contact: {
      title: 'PivotIQ kontaktieren',
      description:
        'Kontaktiere PivotIQ bei Support-, Zahlungs-, Datenschutz- oder Partnerschaftsanfragen.',
    },
    dashboard: {
      title: 'Dashboard',
      description:
        'Gespeicherte Berichte, Roadmap-Fortschritt und Kontostatus für PivotIQ-Nutzer.',
    },
    success: {
      title: 'Freischaltung abgeschlossen',
      description:
        'Bestätigungsseite für erfolgreiche PivotIQ-Freischaltungen und aktualisierte Berichtszugriffe.',
    },
    report: {
      title: 'Karrierebericht',
      description:
        'Personalisierte PivotIQ-Berichtserfahrung mit Pivots, Skill Gaps und Roadmap-Anleitung.',
    },
  },
};

function getLocaleSeo(locale) {
  return seoMessages[normalizeLocale(locale)] || seoMessages.en;
}

function baseMetadata({
  title,
  description,
  path,
  index = true,
}) {
  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      title,
      description,
      url: path || siteUrl,
      type: 'website',
    },
    twitter: {
      title,
      description,
    },
    robots: index
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
            nosnippet: true,
          },
        },
  };
}

export function buildPageMetadata({ locale, key, path, index = true }) {
  const page = getLocaleSeo(locale)[key] || getLocaleSeo('en')[key];
  return baseMetadata({
    title: page.title,
    description: page.description,
    path,
    index,
  });
}
