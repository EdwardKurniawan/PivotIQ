import { normalizeLocale } from './i18n';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.pivotiq.app';

const seoMessages = {
  en: {
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

