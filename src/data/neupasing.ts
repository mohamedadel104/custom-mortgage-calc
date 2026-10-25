// Manually reviewed factual observations, 2026-10-25. Counts refer to their named
// project/subset, not individual notarised transactions. Do not expand aggregate
// counts into invented unit rows or add this quarter's total to its components.
export const NEUPASING_REVIEWED = '2026-10-25';
export const NEUPASING_QUARTER = {
  name: 'Paul-Gerhardt-Allee quarter',
  homes: 2400,
  approximate: true,
  hectares: 33,
  publisher: 'Landeshauptstadt München',
  url: 'https://stadt.muenchen.de/infos/paul-gerhardt-allee.html',
};

export interface DevelopmentEvidence {
  id: string;
  name: string;
  location: string;
  homes: number;
  countBasis: string;
  completion: string;
  retailSoldReported: number | null;
  blockAcquiredHomes: number | null;
  status: string;
  notes: string;
  sources: { publisher: string; url: string }[];
}

export const NEUPASING_DEVELOPMENTS: DevelopmentEvidence[] = [
  {
    id: 'bls-at-home',
    name: '@home · BLS',
    location: 'Berduxstraße · Paul-Gerhardt-Allee quarter',
    homes: 131,
    countBasis: 'Ownership apartments marketed by BLS; not the whole WA3 block',
    completion: '2023 · developer completion news, 8 May',
    retailSoldReported: 131,
    blockAcquiredHomes: null,
    status: 'Developer: 100% sold',
    notes:
      'Full sell-out is an aggregate publisher claim. Unit closing prices and contract dates are not disclosed. Seven retained example units include one displayed listing price.',
    sources: [
      {
        publisher: 'Bayerische Landessiedlung',
        url: 'https://www.bls-bayern.de/immobilien/eigentumswohnungen-obermenzing/',
      },
    ],
  },
  {
    id: 'belvedere',
    name: 'Belvedere',
    location: 'Hermine-von-Parish-Straße 3–9 · 81245',
    homes: 164,
    countBasis: 'Ownership apartments; commercial space excluded',
    completion: '2021 · developer project record',
    retailSoldReported: 164,
    blockAcquiredHomes: null,
    status: 'Developer: all apartments handed to new owners',
    notes:
      'Project handover supports aggregate sales activity. It does not disclose 164 individual contract dates or final prices.',
    sources: [
      {
        publisher: 'MünchenBau · project facts',
        url: 'https://www.muenchenbau.com/referenzen/belvedere/',
      },
      { publisher: 'MünchenBau · handover statement', url: 'https://www.muenchenbau.com/news/' },
    ],
  },
  {
    id: 'pandion-penta',
    name: 'PANDION PENTA',
    location: 'Paul-Gerhardt-Allee quarter · Pasing-Obermenzing',
    homes: 293,
    countBasis: 'Project apartments',
    completion: '2020 · developer project record',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Completed; exact sold count not established here',
    notes:
      'The €174m project volume is not a sum of verified apartment closing prices and is not divided by apartment area to invent a price benchmark.',
    sources: [
      { publisher: 'PANDION · portfolio', url: 'https://pandion.de/index.php?id=39&oid=72' },
    ],
  },
  {
    id: 'anders-wohnen',
    name: 'anders wohnen · UBM / Baywobau',
    location: 'Peter-Anders-Straße / Berduxstraße · 81245',
    homes: 373,
    countBasis: 'Developer’s completed project count; mixed ownership and rental housing',
    completion: 'Q2 2021 · UBM project record',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Completed; no complete retail transaction count',
    notes:
      'Earlier plans and separate phases use different unit counts. The 172-unit WA6 phase is part of this ensemble and is not counted as another independent project.',
    sources: [
      {
        publisher: 'UBM Development',
        url: 'https://www.ubm-development.com/de/projekte/anders-wohnen-muenchen/',
      },
    ],
  },
  {
    id: 'easy',
    name: 'EASY · Corpus Sireo',
    location: 'Paul-Gerhardt-Allee · 81245',
    homes: 305,
    countBasis: 'Apartments across 13 buildings',
    completion: 'June 2021 · construction contractor',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Construction completed; sale count undisclosed',
    notes:
      'The contractor documents the housing stock and completion. Construction completion alone does not prove an individual sale.',
    sources: [{ publisher: 'Bauwens', url: 'https://www.bauwens.de/de/projekte/easy' }],
  },
  {
    id: 'prisma-pasing',
    name: 'PRISMA PASING · DEMOS',
    location: 'Hermine-von-Parish-Straße · 81245',
    homes: 255,
    countBasis: 'Ownership apartments across 15 houses',
    completion: 'Completed by review date; exact completion year not retained',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Developer advertises its last available apartment',
    notes:
      'A furnished 90.60 m² four-room show apartment is still advertised. Availability does not establish a complete list of notarised transactions.',
    sources: [
      {
        publisher: 'DEMOS Wohnbau',
        url: 'https://www.demos.de/Pasing-Paul-Gerhardt-Allee-Baufeld-WA2-4.aspx',
      },
    ],
  },
  {
    id: 'induwo-block-purchase',
    name: 'INDUWO → Münchner Wohnen',
    location: 'Between Berduxstraße and Hermine-von-Parish-Straße',
    homes: 68,
    countBasis: 'Three acquired buildings; subset of a larger development',
    completion: 'Handover reported 12 May 2026',
    retailSoldReported: null,
    blockAcquiredHomes: 68,
    status: 'One block purchase announced 17 May 2024',
    notes:
      '68 homes acquired in one institutional purchase, not 68 separate retail sale contracts. Purchase price undisclosed. Now used for subsidised rental housing.',
    sources: [
      {
        publisher: 'Münchner Wohnen · acquisition, 2024',
        url: 'https://www.muenchner-wohnen.de/unternehmen/aktuelles-presse/aktuelle-mitteilungen/2024/muenchner-wohnen-erwirbt-68-wohnungen-an-der-paul-gerhardt-allee',
      },
      {
        publisher: 'Münchner Wohnen · handover, 2026',
        url: 'https://www.muenchner-wohnen.de/unternehmen/aktuelles-presse/aktuelle-mitteilungen/2026/122-neue-und-guenstige-wohnungen-fuer-pasing',
      },
    ],
  },
  {
    id: 'muenchner-wohnen-own-build',
    name: 'Münchner Wohnen · own construction',
    location: 'Hermine-von-Parish-Straße / Franz-Langinger-Straße',
    homes: 54,
    countBasis: 'New rental apartments; separate from the 68-home acquisition',
    completion: 'Rental launch reported 12 May 2026',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Own construction for rent; no retail sale claimed',
    notes:
      'The publisher’s combined 122-home announcement consists of these 54 homes plus the 68 acquired homes. Do not add 122 again or label the 54 as apartment sales.',
    sources: [
      {
        publisher: 'Münchner Wohnen',
        url: 'https://www.muenchner-wohnen.de/unternehmen/aktuelles-presse/aktuelle-mitteilungen/2026/122-neue-und-guenstige-wohnungen-fuer-pasing',
      },
    ],
  },
  {
    id: 'artec-wa7',
    name: 'Artec · WA7.1 + WA7.2',
    location: 'Paul-Gerhardt-Allee quarter · northern building plots',
    homes: 450,
    countBasis: 'Approximately 450 apartments across two buildings',
    completion: 'Completion year not disclosed in the retained source',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Engineering project reference; no sale count',
    notes:
      'Approximate project size from the structural engineer. No individual sale status or closing-price evidence is inferred.',
    sources: [
      {
        publisher: 'Berk+Partner · project engineer',
        url: 'https://www.berk-partner.de/projekte/pga-wa7',
      },
    ],
  },
  {
    id: 'gvg-wa2-3',
    name: 'GVG · WA2(3)',
    location: 'Paul-Gerhardt-Allee quarter',
    homes: 240,
    countBasis: 'Residential units; project brochure',
    completion: 'December 2019 · developer brochure, p. 15',
    retailSoldReported: null,
    blockAcquiredHomes: null,
    status: 'Completed housing stock; no retail sale count',
    notes:
      'Mixed housing project. Count describes homes and does not identify individual sales or their prices.',
    sources: [
      {
        publisher: 'GVG · project brochure, p. 15',
        url: 'https://www.gvgnet.de/wp-content/uploads/2020/01/GVG_Broschu%CC%88re_ONLINE.pdf',
      },
    ],
  },
];

export const HISTORICAL_PROJECT_PRICES = [
  {
    projectId: 'belvedere',
    project: 'Belvedere',
    publishedAt: '2017-09-19',
    low: 6900,
    high: 7700,
  },
  {
    projectId: 'pandion-penta',
    project: 'PANDION PENTA',
    publishedAt: '2017-09-19',
    low: 6750,
    high: 7650,
  },
  {
    projectId: 'anders-wohnen',
    project: 'anders wohnen',
    publishedAt: '2017-09-19',
    low: 6750,
    high: 8000,
  },
];
export const HISTORICAL_PROJECT_PRICE_SOURCE = {
  publisher: 'Fischer Immobilien · contemporary asking-price review',
  url: 'https://www.fischer-immobilien-muenchen.de/blog-posts/neue-kleinstadt-pasing-obermenzing/',
};

export function developmentCoverage(records: DevelopmentEvidence[]) {
  return {
    records: records.length,
    retailSoldReported: records.reduce((n, r) => n + (r.retailSoldReported ?? 0), 0),
    blockAcquiredHomes: records.reduce((n, r) => n + (r.blockAcquiredHomes ?? 0), 0),
  };
}
