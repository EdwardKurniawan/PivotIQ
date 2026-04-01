export const LOCALE_COOKIE = 'pivotiq_locale';
export const SUPPORTED_LOCALES = ['en', 'nl', 'de'];

export function normalizeLocale(value) {
  const locale = String(value || '').trim().toLowerCase();
  return SUPPORTED_LOCALES.includes(locale) ? locale : 'en';
}

export function getLocaleLabel(locale) {
  const normalized = normalizeLocale(locale);
  if (normalized === 'nl') return 'Nederlands';
  if (normalized === 'de') return 'Deutsch';
  return 'English';
}

export function getBrowserLocale() {
  if (typeof window === 'undefined') return 'en';

  const stored = window.localStorage.getItem(LOCALE_COOKIE);
  if (stored) return normalizeLocale(stored);

  const cookieMatch = document.cookie
    .split('; ')
    .find((value) => value.startsWith(`${LOCALE_COOKIE}=`));

  if (cookieMatch) {
    return normalizeLocale(cookieMatch.split('=').slice(1).join('='));
  }

  return 'en';
}

export function persistLocale(locale) {
  const next = normalizeLocale(locale);

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LOCALE_COOKIE, next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return next;
}

const messages = {
  en: {
    common: {
      language: 'Language',
      signIn: 'Sign in',
      startFreeScan: 'Start free scan',
      runFreeScan: 'Run my free scan',
      newAudit: 'New Audit',
      dashboard: 'Dashboard',
      latestLocalReport: 'Latest Local Report',
      shareLink: 'Share link',
      linkCopied: 'Link copied',
      footerCompany: 'Jened · KvK 90948211',
      footerContact: 'contact@pivotiq.app',
    },
    home: {
      subtitle: 'See the shift before it hits',
      badge: 'Career intelligence for the AI shift',
      heroTitle: 'Career clarity, before your role gets quietly redefined.',
      heroBody: 'PivotIQ breaks your role into the work that is becoming automated, the work that still compounds, and the moves that make sense before urgency decides for you.',
      heroNote: 'Free diagnosis first. Roadmap later if it earns it.',
    },
    audit: {
      subtitle: 'Free scan first',
      helper: 'Tell us your work. We map the pressure.',
      step: 'Step',
      of: 'of',
      stepRole: 'Your role',
      stepTasks: 'Workload signal',
      startLabel: 'Start the scan',
      startTitle: 'Tell us where you sit before the shift hits.',
      startBody: 'Your title is only the start. The better signal is your real workload, your industry, and where your weekly time actually goes.',
      titleLabel: 'What job title best matches your current role?',
      titlePlaceholder: 'Type your current job title',
      industryLabel: 'Which industry best matches your world?',
      roleBlendLabel: 'How much of your role is execution versus strategy?',
      managementLabel: 'Do you manage people right now?',
      continue: 'Continue',
      tasksLabel: 'What actually fills your week?',
      tasksBody: 'Pick the tasks that take the most time or feel most central to how your role creates value today.',
      tasksTarget: 'Recommended target: 5–8 tasks. Minimum: 3.',
      recommendedTitle: 'Recommended for your role',
      recommendedBody: 'Suggested from your matched title family, title wording, and industry. Start here, then search or add what is missing.',
      searchTitle: 'Search or add your own',
      searchBody: 'Need something more specific? Search the task library or add a custom task in your own words.',
      searchPlaceholder: 'Search tasks',
      customPlaceholder: 'Add a custom task',
      addTask: 'Add task',
      selectedTitle: 'Selected tasks',
      selectedBody: 'Mark the work that really defines the role today. We use this to score pressure and suggest pivots.',
      primaryTitle: 'Which tasks take the most time?',
      primaryBody: 'Pick up to 3 tasks that dominate your week.',
      generate: 'Generate my report',
      loadingError: 'Something went wrong. Please try again.',
      scanSteps: [
        'Scanning role patterns and workload signals...',
        'Analyzing task-level AI exposure...',
        'Mapping strengths, gaps, and pivot options...',
        'Building your personalized 90-day plan...',
      ],
    },
    login: {
      subtitle: 'Account access',
      eyebrow: 'Save your momentum',
      title: 'Come back to your reports, not just your browser tab.',
      body: 'A magic link lets users save audit history, revisit structured reports, and keep milestone progress synced across sessions.',
      sendLabel: 'Magic-link sign in',
      sendTitle: 'Send the link',
      sendBody: 'No password, no setup friction. We email a secure sign-in link and drop you into the dashboard.',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@example.com',
      sendButton: 'Send Magic Link →',
      sendingButton: 'Sending magic link…',
      continueWithout: 'Continue without account',
      goDashboard: 'Go to dashboard →',
      sentMessage: 'Magic link sent. Open your email and use the sign-in link to reach your dashboard.',
    },
    dashboard: {
      subtitle: 'Dashboard',
      heroEyebrow: 'Saved progress',
      heroTitle: 'Your reports, your progress, your next move.',
      heroBody: 'Come back to the diagnosis, pick up the roadmap where you left off, and keep momentum instead of restarting from scratch.',
    },
    success: {
      subtitle: 'Unlock complete',
      confirmed: 'Payment confirmed',
      unlocked: 'is unlocked.',
      redirecting: 'Redirecting you to the report in a moment…',
      viewNow: 'View my report now →',
    },
    report: {
      previewSubtitle: 'Report preview',
      fullSubtitle: 'Report experience',
      emptyTitle: 'No report found yet.',
      emptyBody: 'Start a fresh audit and we’ll build your first task-level diagnosis.',
      emptyCta: 'Start your free audit →',
      pivotReady: 'Your pivot map is ready.',
      riskScore: 'RISK SCORE',
      whatThisReallySays: 'WHAT THIS REALLY SAYS',
      roleRead: 'What this says about your role',
      durableAdvantages: 'Your durable advantages',
      stopAssuming: 'What to stop assuming',
      strongestNextMove: 'STRONGEST NEXT MOVE',
      whatYouAreBettingOn: 'What you are betting on',
      whatToDoFirst: 'What to do first',
    },
  },
  nl: {
    common: {
      language: 'Taal',
      signIn: 'Inloggen',
      startFreeScan: 'Start gratis scan',
      runFreeScan: 'Start mijn gratis scan',
      newAudit: 'Nieuwe scan',
      dashboard: 'Dashboard',
      latestLocalReport: 'Laatste lokale rapport',
      shareLink: 'Link delen',
      linkCopied: 'Link gekopieerd',
      footerCompany: 'Jened · KvK 90948211',
      footerContact: 'contact@pivotiq.app',
    },
    home: {
      subtitle: 'Zie de verschuiving voordat die jou raakt',
      badge: 'Carrière-intelligentie voor de AI-verschuiving',
      heroTitle: 'Carrièreduidelijkheid, voordat je rol stilletjes wordt hertekend.',
      heroBody: 'PivotIQ splitst je rol op in het werk dat wordt geautomatiseerd, het werk dat nog steeds sterker wordt, en de stappen die logisch zijn voordat urgentie voor jou beslist.',
      heroNote: 'Eerst een gratis diagnose. Pas daarna een roadmap als die het verdient.',
    },
    audit: {
      subtitle: 'Eerst een gratis scan',
      helper: 'Vertel ons wat je doet. Wij brengen de druk in kaart.',
      step: 'Stap',
      of: 'van',
      stepRole: 'Jouw rol',
      stepTasks: 'Werkbelasting',
      startLabel: 'Start de scan',
      startTitle: 'Vertel ons waar jij zit voordat de verschuiving toeslaat.',
      startBody: 'Je functietitel is alleen het begin. Het betere signaal is je echte werk, je sector en waar je week werkelijk aan opgaat.',
      titleLabel: 'Welke functietitel past het best bij je huidige rol?',
      titlePlaceholder: 'Typ je huidige functietitel',
      industryLabel: 'Welke sector past het best bij jouw wereld?',
      roleBlendLabel: 'Hoeveel van je rol is uitvoering versus strategie?',
      managementLabel: 'Geef je op dit moment leiding aan mensen?',
      continue: 'Doorgaan',
      tasksLabel: 'Waar gaat je week echt aan op?',
      tasksBody: 'Kies de taken die de meeste tijd kosten of het meest bepalend zijn voor hoe jouw rol vandaag waarde creëert.',
      tasksTarget: 'Aanbevolen: 5–8 taken. Minimum: 3.',
      recommendedTitle: 'Aanbevolen voor jouw rol',
      recommendedBody: 'Voorgesteld op basis van je gematchte functiefamilie, titel en sector. Begin hier en zoek of voeg toe wat ontbreekt.',
      searchTitle: 'Zoek of voeg zelf toe',
      searchBody: 'Iets specifiekers nodig? Zoek in de takenbibliotheek of voeg een taak toe in je eigen woorden.',
      searchPlaceholder: 'Zoek taken',
      customPlaceholder: 'Voeg een eigen taak toe',
      addTask: 'Taak toevoegen',
      selectedTitle: 'Geselecteerde taken',
      selectedBody: 'Markeer het werk dat je rol vandaag echt definieert. Daarmee scoren we druk en stellen we pivots voor.',
      primaryTitle: 'Welke taken kosten de meeste tijd?',
      primaryBody: 'Kies maximaal 3 taken die je week domineren.',
      generate: 'Genereer mijn rapport',
      loadingError: 'Er ging iets mis. Probeer het opnieuw.',
      scanSteps: [
        'Rolverdeling en werkpatronen worden gescand...',
        'AI-blootstelling per taak wordt geanalyseerd...',
        'Sterktes, hiaten en pivotopties worden in kaart gebracht...',
        'Je persoonlijke 90-dagenplan wordt opgebouwd...',
      ],
    },
    login: {
      subtitle: 'Accounttoegang',
      eyebrow: 'Bewaar je momentum',
      title: 'Kom terug naar je rapporten, niet alleen naar je browsertab.',
      body: 'Met een magic link kun je je scanhistorie bewaren, rapporten opnieuw openen en mijlpaalvoortgang tussen sessies synchroniseren.',
      sendLabel: 'Inloggen met magic link',
      sendTitle: 'Verstuur de link',
      sendBody: 'Geen wachtwoord, geen gedoe. We mailen een veilige inloglink en brengen je direct naar je dashboard.',
      emailLabel: 'E-mailadres',
      emailPlaceholder: 'jij@voorbeeld.com',
      sendButton: 'Verstuur magic link →',
      sendingButton: 'Magic link wordt verstuurd…',
      continueWithout: 'Doorgaan zonder account',
      goDashboard: 'Ga naar dashboard →',
      sentMessage: 'Magic link verzonden. Open je e-mail en gebruik de inloglink om naar je dashboard te gaan.',
    },
    dashboard: {
      subtitle: 'Dashboard',
      heroEyebrow: 'Opgeslagen voortgang',
      heroTitle: 'Je rapporten, je voortgang, je volgende stap.',
      heroBody: 'Kom terug naar de diagnose, pak de roadmap weer op waar je was gebleven en houd momentum zonder opnieuw te beginnen.',
    },
    success: {
      subtitle: 'Ontgrendeling voltooid',
      confirmed: 'Betaling bevestigd',
      unlocked: 'is ontgrendeld.',
      redirecting: 'Je wordt zo doorgestuurd naar het rapport…',
      viewNow: 'Bekijk nu mijn rapport →',
    },
    report: {
      previewSubtitle: 'Rapportvoorbeeld',
      fullSubtitle: 'Rapportervaring',
      emptyTitle: 'Nog geen rapport gevonden.',
      emptyBody: 'Start een nieuwe scan en we bouwen je eerste diagnose op taakniveau.',
      emptyCta: 'Start je gratis scan →',
      pivotReady: 'Je pivotkaart is klaar.',
      riskScore: 'RISICOSCORE',
      whatThisReallySays: 'WAT DIT ECHT ZEGT',
      roleRead: 'Wat dit zegt over je rol',
      durableAdvantages: 'Je duurzame voordelen',
      stopAssuming: 'Wat je niet meer moet aannemen',
      strongestNextMove: 'STERKSTE VOLGENDE STAP',
      whatYouAreBettingOn: 'Waar je op inzet',
      whatToDoFirst: 'Wat je eerst moet doen',
    },
  },
  de: {
    common: {
      language: 'Sprache',
      signIn: 'Anmelden',
      startFreeScan: 'Kostenlosen Scan starten',
      runFreeScan: 'Meinen kostenlosen Scan starten',
      newAudit: 'Neuer Scan',
      dashboard: 'Dashboard',
      latestLocalReport: 'Letzter lokaler Bericht',
      shareLink: 'Link teilen',
      linkCopied: 'Link kopiert',
      footerCompany: 'Jened · KvK 90948211',
      footerContact: 'contact@pivotiq.app',
    },
    home: {
      subtitle: 'Sieh die Verschiebung, bevor sie dich trifft',
      badge: 'Karriere-Intelligenz für den KI-Wandel',
      heroTitle: 'Karriereklarheit, bevor deine Rolle leise neu definiert wird.',
      heroBody: 'PivotIQ zerlegt deine Rolle in Arbeit, die automatisiert wird, Arbeit, die weiter an Wert gewinnt, und Schritte, die sinnvoll sind, bevor Dringlichkeit für dich entscheidet.',
      heroNote: 'Erst eine kostenlose Diagnose. Danach eine Roadmap, wenn sie es verdient.',
    },
    audit: {
      subtitle: 'Zuerst ein kostenloser Scan',
      helper: 'Sag uns, woran du arbeitest. Wir zeigen den Druck auf.',
      step: 'Schritt',
      of: 'von',
      stepRole: 'Deine Rolle',
      stepTasks: 'Arbeitslast',
      startLabel: 'Scan starten',
      startTitle: 'Sag uns, wo du stehst, bevor der Wandel dich trifft.',
      startBody: 'Dein Jobtitel ist nur der Anfang. Das bessere Signal ist deine echte Arbeit, deine Branche und womit deine Woche wirklich gefüllt ist.',
      titleLabel: 'Welcher Jobtitel passt am besten zu deiner aktuellen Rolle?',
      titlePlaceholder: 'Gib deinen aktuellen Jobtitel ein',
      industryLabel: 'Welche Branche passt am besten zu deinem Umfeld?',
      roleBlendLabel: 'Wie viel deiner Rolle ist Ausführung versus Strategie?',
      managementLabel: 'Führst du aktuell Menschen?',
      continue: 'Weiter',
      tasksLabel: 'Womit ist deine Woche tatsächlich gefüllt?',
      tasksBody: 'Wähle die Aufgaben, die am meisten Zeit kosten oder heute am stärksten bestimmen, wie deine Rolle Wert schafft.',
      tasksTarget: 'Empfohlen: 5–8 Aufgaben. Minimum: 3.',
      recommendedTitle: 'Empfohlen für deine Rolle',
      recommendedBody: 'Vorgeschlagen auf Basis deiner zugeordneten Titelfamilie, Formulierung des Titels und Branche. Starte hier und suche oder ergänze, was fehlt.',
      searchTitle: 'Suchen oder selbst hinzufügen',
      searchBody: 'Etwas Spezifischeres nötig? Durchsuche die Aufgabenbibliothek oder ergänze eine Aufgabe in deinen eigenen Worten.',
      searchPlaceholder: 'Aufgaben suchen',
      customPlaceholder: 'Eigene Aufgabe hinzufügen',
      addTask: 'Aufgabe hinzufügen',
      selectedTitle: 'Ausgewählte Aufgaben',
      selectedBody: 'Markiere die Arbeit, die deine Rolle heute wirklich definiert. Damit bewerten wir den Druck und schlagen passende Pivot-Richtungen vor.',
      primaryTitle: 'Welche Aufgaben kosten am meisten Zeit?',
      primaryBody: 'Wähle bis zu 3 Aufgaben, die deine Woche dominieren.',
      generate: 'Meinen Bericht erstellen',
      loadingError: 'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
      scanSteps: [
        'Rollenmuster und Arbeitslastsignale werden gescannt...',
        'KI-Exponierung auf Aufgabenebene wird analysiert...',
        'Stärken, Lücken und Pivot-Optionen werden abgebildet...',
        'Dein persönlicher 90-Tage-Plan wird erstellt...',
      ],
    },
    login: {
      subtitle: 'Kontozugang',
      eyebrow: 'Behalte dein Momentum',
      title: 'Komm zu deinen Berichten zurück, nicht nur zu deinem Browser-Tab.',
      body: 'Ein Magic Link ermöglicht es, Audit-Verlauf zu speichern, strukturierte Berichte erneut aufzurufen und Meilenstein-Fortschritt zwischen Sitzungen zu synchronisieren.',
      sendLabel: 'Mit Magic Link anmelden',
      sendTitle: 'Link senden',
      sendBody: 'Kein Passwort, keine Hürde. Wir schicken dir einen sicheren Anmeldelink und bringen dich direkt ins Dashboard.',
      emailLabel: 'E-Mail-Adresse',
      emailPlaceholder: 'du@beispiel.de',
      sendButton: 'Magic Link senden →',
      sendingButton: 'Magic Link wird gesendet…',
      continueWithout: 'Ohne Konto fortfahren',
      goDashboard: 'Zum Dashboard →',
      sentMessage: 'Magic Link gesendet. Öffne deine E-Mail und nutze den Anmeldelink, um dein Dashboard zu erreichen.',
    },
    dashboard: {
      subtitle: 'Dashboard',
      heroEyebrow: 'Gespeicherter Fortschritt',
      heroTitle: 'Deine Berichte, dein Fortschritt, dein nächster Schritt.',
      heroBody: 'Kehre zur Diagnose zurück, nimm die Roadmap dort wieder auf, wo du aufgehört hast, und halte dein Momentum, statt neu zu starten.',
    },
    success: {
      subtitle: 'Freischaltung abgeschlossen',
      confirmed: 'Zahlung bestätigt',
      unlocked: 'ist freigeschaltet.',
      redirecting: 'Du wirst gleich zum Bericht weitergeleitet…',
      viewNow: 'Meinen Bericht jetzt ansehen →',
    },
    report: {
      previewSubtitle: 'Berichtsvorschau',
      fullSubtitle: 'Berichtserlebnis',
      emptyTitle: 'Noch kein Bericht gefunden.',
      emptyBody: 'Starte einen neuen Scan, dann erstellen wir deine erste Diagnose auf Aufgabenebene.',
      emptyCta: 'Deinen kostenlosen Scan starten →',
      pivotReady: 'Deine Pivot-Karte ist fertig.',
      riskScore: 'RISIKOWERT',
      whatThisReallySays: 'WAS DAS WIRKLICH BEDEUTET',
      roleRead: 'Was das über deine Rolle aussagt',
      durableAdvantages: 'Deine dauerhaften Vorteile',
      stopAssuming: 'Was du nicht mehr annehmen solltest',
      strongestNextMove: 'STÄRKSTER NÄCHSTER SCHRITT',
      whatYouAreBettingOn: 'Worauf du setzt',
      whatToDoFirst: 'Was du zuerst tun solltest',
    },
  },
};

export function getMessages(locale) {
  return messages[normalizeLocale(locale)];
}
