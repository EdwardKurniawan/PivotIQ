import { normalizeLocale } from './i18n';

const content = {
  en: {
    navSubtitle: 'Methodology',
    eyebrow: 'Methodology',
    title: 'How PivotIQ thinks about AI career risk, pivots, and roadmap recommendations.',
    intro:
      'PivotIQ is designed to turn a broad AI-career fear into a more specific decision signal. The product does not try to predict the future with certainty. It tries to give white-collar professionals a more useful way to interpret exposure, leverage, and next moves.',
    sections: [
      [
        'Task-level analysis comes first',
        'The scan starts from the workload, not just the job title. That matters because two people with the same title can have very different exposure depending on how much of their week is spent on recurring reporting, coordination, documentation, analysis, stakeholder translation, or judgment-heavy decision support.',
      ],
      [
        'Risk is about compression, not instant replacement',
        'PivotIQ treats AI risk as a question of which parts of a role are getting cheaper, faster, or easier to automate. In most white-collar jobs, the problem is not sudden total replacement. It is that the middle of the job gets thinner while the value shifts toward judgment, trust, and ownership.',
      ],
      [
        'Durable leverage matters as much as exposure',
        'A useful report should not only show what is fragile. It should also show which parts of the role still compound when AI enters the workflow. Work involving context, stakeholder trust, ambiguous decisions, accountable recommendations, and cross-functional alignment usually remains more defensible than routine production work alone.',
      ],
      [
        'Pivots are chosen for believability',
        'PivotIQ is biased toward adjacent moves that preserve context, credibility, and transferability. The goal is not to recommend fantasy reinventions. The goal is to find role directions that still feel plausible for the current user while improving defensibility and future leverage.',
      ],
      [
        'The roadmap is built around visible proof',
        'The roadmap layer is meant to convert insight into movement. That means prioritizing skill gaps, proof assets, and milestone steps that a hiring manager or internal leader could actually believe, rather than producing a vague list of things to learn someday.',
      ],
      [
        'Results are guidance, not certainty',
        'PivotIQ provides structured decision support, not guarantees. Market conditions, company context, geography, timing, and individual execution still matter. The purpose of the report is to make the next move clearer and more grounded, not to predict outcomes with perfect accuracy.',
      ],
    ],
    principlesEyebrow: 'Core principles',
    principlesTitle: 'What the product is optimized for.',
    principles: [
      'Specificity over generic AI headlines',
      'Believable adjacent pivots over dramatic reinvention',
      'Decision clarity over vague future-of-work commentary',
      'Visible proof over passive learning',
    ],
    ctaEyebrow: 'Run the scan',
    ctaTitle: 'See the methodology applied to your own role.',
    ctaBody:
      'The best way to understand the framework is to run the free scan on your actual title, task mix, and industry context.',
    ctaButton: 'Run my free scan',
    homeButton: 'Back to homepage',
  },
  nl: {
    navSubtitle: 'Methodologie',
    eyebrow: 'Methodologie',
    title: 'Hoe PivotIQ denkt over AI-carrièrerisico, pivots en roadmap-aanbevelingen.',
    intro:
      'PivotIQ is ontworpen om brede angst over AI en loopbanen te vertalen naar een specifieker beslissingssignaal. Het product probeert de toekomst niet met zekerheid te voorspellen. Het probeert white-collar professionals een nuttigere manier te geven om blootstelling, hefboom en volgende stappen te interpreteren.',
    sections: [
      [
        'Analyse op taakniveau komt eerst',
        'De scan start vanuit de werklast, niet alleen vanuit de functietitel. Dat is belangrijk omdat twee mensen met dezelfde titel heel verschillende blootstelling kunnen hebben afhankelijk van hoeveel van hun week opgaat aan terugkerende rapportage, coördinatie, documentatie, analyse, stakeholdervertaling of oordeelzware beslissingsondersteuning.',
      ],
      [
        'Risico gaat over compressie, niet over onmiddellijke vervanging',
        'PivotIQ behandelt AI-risico als een vraag welke delen van een rol goedkoper, sneller of makkelijker te automatiseren worden. In de meeste white-collar banen is het probleem geen plotselinge totale vervanging. Het is dat het midden van de baan dunner wordt terwijl de waarde verschuift naar oordeel, vertrouwen en eigenaarschap.',
      ],
      [
        'Duurzame hefboom telt net zo veel als blootstelling',
        'Een nuttig rapport moet niet alleen laten zien wat fragiel is. Het moet ook laten zien welke delen van de rol blijven doorwerken wanneer AI de workflow binnenkomt. Werk rond context, stakeholdervertrouwen, ambiguïteit, verantwoordelijke aanbevelingen en cross-functionele afstemming blijft meestal beter verdedigbaar dan routinematig productiewerk alleen.',
      ],
      [
        'Pivots worden gekozen op geloofwaardigheid',
        'PivotIQ is bevooroordeeld richting aangrenzende stappen die context, geloofwaardigheid en overdraagbaarheid behouden. Het doel is niet om fantasierijke heruitvindingen aan te bevelen. Het doel is rolrichtingen te vinden die nog steeds plausibel voelen voor de huidige gebruiker terwijl ze verdedigbaarheid en toekomstige hefboom verbeteren.',
      ],
      [
        'De roadmap is gebouwd rond zichtbaar bewijs',
        'De roadmaplaag is bedoeld om inzicht om te zetten in beweging. Dat betekent skill gaps, bewijsstukken en mijlpalen prioriteren die een hiring manager of interne leider echt zou kunnen geloven, in plaats van een vage lijst dingen om ooit te leren te produceren.',
      ],
      [
        'Resultaten zijn richting, geen zekerheid',
        'PivotIQ biedt gestructureerde beslissingsondersteuning, geen garanties. Marktomstandigheden, bedrijfscontext, geografie, timing en individuele uitvoering blijven meetellen. Het doel van het rapport is de volgende stap helderder en beter onderbouwd te maken, niet om uitkomsten perfect te voorspellen.',
      ],
    ],
    principlesEyebrow: 'Kernprincipes',
    principlesTitle: 'Waar het product op is geoptimaliseerd.',
    principles: [
      'Specificiteit boven generieke AI-koppen',
      'Geloofwaardige aangrenzende pivots boven dramatische heruitvinding',
      'Beslisklarheid boven vage future-of-work-commentaar',
      'Zichtbaar bewijs boven passief leren',
    ],
    ctaEyebrow: 'Doe de scan',
    ctaTitle: 'Zie de methodologie toegepast op je eigen rol.',
    ctaBody:
      'De beste manier om het framework te begrijpen is de gratis scan te draaien op je echte titel, takenmix en sectorcontext.',
    ctaButton: 'Doe mijn gratis scan',
    homeButton: 'Terug naar homepage',
  },
  de: {
    navSubtitle: 'Methodik',
    eyebrow: 'Methodik',
    title: 'Wie PivotIQ über KI-Karriererisiko, Pivots und Roadmap-Empfehlungen nachdenkt.',
    intro:
      'PivotIQ wurde entwickelt, um eine breite KI-Karriereangst in ein spezifischeres Entscheidungssignal zu übersetzen. Das Produkt versucht nicht, die Zukunft mit Sicherheit vorherzusagen. Es versucht, White-Collar-Professionals eine nützlichere Weise zu geben, Exposition, Hebel und nächste Schritte zu interpretieren.',
    sections: [
      [
        'Analyse auf Aufgabenebene kommt zuerst',
        'Der Scan beginnt bei der Arbeitslast, nicht nur beim Jobtitel. Das ist wichtig, weil zwei Menschen mit demselben Titel sehr unterschiedliche Exposition haben können, je nachdem, wie viel ihrer Woche in wiederkehrendes Reporting, Koordination, Dokumentation, Analyse, Stakeholder-Übersetzung oder urteilsintensive Entscheidungsunterstützung fließt.',
      ],
      [
        'Risiko bedeutet Kompression, nicht sofortige Ersetzung',
        'PivotIQ behandelt KI-Risiko als Frage, welche Teile einer Rolle billiger, schneller oder leichter zu automatisieren werden. In den meisten White-Collar-Jobs ist das Problem nicht plötzliche totale Ersetzung. Es ist, dass die Mitte des Jobs dünner wird, während der Wert sich in Richtung Urteil, Vertrauen und Ownership verschiebt.',
      ],
      [
        'Dauerhafter Hebel zählt genauso wie Exposition',
        'Ein nützlicher Bericht sollte nicht nur zeigen, was fragil ist. Er sollte auch zeigen, welche Teile der Rolle weiter wachsen, wenn KI in den Workflow kommt. Arbeit mit Kontext, Stakeholder-Vertrauen, mehrdeutigen Entscheidungen, verantwortlichen Empfehlungen und funktionsübergreifender Ausrichtung bleibt meist verteidigbarer als reine Routineproduktion.',
      ],
      [
        'Pivots werden nach Glaubwürdigkeit gewählt',
        'PivotIQ ist auf angrenzende Schritte ausgerichtet, die Kontext, Glaubwürdigkeit und Übertragbarkeit bewahren. Das Ziel ist nicht, Fantasie-Neuerfindungen zu empfehlen. Das Ziel ist, Rollenrichtungen zu finden, die für den aktuellen Nutzer weiter plausibel wirken und gleichzeitig Verteidigbarkeit und zukünftigen Hebel verbessern.',
      ],
      [
        'Die Roadmap baut auf sichtbarem Beweis auf',
        'Die Roadmap-Schicht soll Erkenntnis in Bewegung übersetzen. Das bedeutet, Skill-Gaps, Beweisstücke und Meilensteinschritte zu priorisieren, die ein Hiring Manager oder interner Leader tatsächlich glauben könnte, statt eine vage Liste von Dingen zu erzeugen, die man irgendwann lernen sollte.',
      ],
      [
        'Ergebnisse sind Orientierung, keine Gewissheit',
        'PivotIQ bietet strukturierte Entscheidungsunterstützung, keine Garantien. Marktbedingungen, Unternehmenskontext, Geografie, Timing und individuelle Umsetzung spielen weiter eine Rolle. Der Zweck des Berichts ist, den nächsten Schritt klarer und fundierter zu machen, nicht Ergebnisse perfekt vorherzusagen.',
      ],
    ],
    principlesEyebrow: 'Kernprinzipien',
    principlesTitle: 'Worauf das Produkt optimiert ist.',
    principles: [
      'Spezifität statt generischer KI-Schlagzeilen',
      'Glaubwürdige angrenzende Pivots statt dramatischer Neuerfindung',
      'Entscheidungsklarheit statt vager Zukunft-der-Arbeit-Kommentare',
      'Sichtbarer Beweis statt passivem Lernen',
    ],
    ctaEyebrow: 'Scan starten',
    ctaTitle: 'Sieh die Methodik an deiner eigenen Rolle angewendet.',
    ctaBody:
      'Der beste Weg, das Framework zu verstehen, ist, den kostenlosen Scan mit deinem echten Titel, Aufgabenmix und Branchenkontext zu starten.',
    ctaButton: 'Meinen kostenlosen Scan starten',
    homeButton: 'Zurück zur Startseite',
  },
};

export function getMethodologyContent(locale) {
  return content[normalizeLocale(locale)] || content.en;
}

