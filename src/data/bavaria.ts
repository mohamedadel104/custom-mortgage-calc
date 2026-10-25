// Selected factual observations from page 9 of each municipal half-year report.
// These are reported rounded means, not an appraisal or a constant-quality index.
// Reviewed manually: 2026-10-25. The corrected November 2025 report is used.
export const BAVARIA_REVIEWED = '2026-10-25';
export const BAVARIA_LINKS = {
  dashboard: 'https://infogram.com/immobilienmarktbericht-bayern-2026-1hnp27e0dp39n4g',
  dashboardEmbed: 'https://e.infogram.com/45174065-3803-4d2d-8740-6b8c76f16add?src=embed',
  report: 'https://www.gutachterausschuesse-bayern.de/',
  boris: 'https://www.boris-bayern.de/',
  committees: 'https://www.gutachterausschuesse-bayern.de/gutachterausschuesse/',
  munich: 'https://stadt.muenchen.de/infos/marktanalysen.html',
  nuremberg: 'https://www.nuernberg.de/internet/stadtportal/grundstuecksmarkt.html',
  bayernlabo: 'https://bayernlabo.de/eigenwohnraum/eigenheimfinanzierung',
};
export const MUNICH_REPORTS = [
  {
    year: 2024,
    period: 'H1 2024',
    url: 'https://stadt.muenchen.de/dam/jcr:5602f0e5-3a8d-430d-a03d-6dcdaffc0acd/Halbjahresreport_2024.pdf',
  },
  {
    year: 2025,
    period: 'H1 2025',
    url: 'https://stadt.muenchen.de/dam/jcr:2dec135c-3fa8-4ce5-8095-4b8184854800/KORREKTUR_Halbjahresreport_2025.pdf',
  },
  {
    year: 2026,
    period: 'H1 2026',
    url: 'https://stadt.muenchen.de/dam/jcr:1ab1829c-2c44-4fdc-b03b-6646c7849fab/Halbjahresreport_2026.pdf',
  },
];
export const MUNICH_SEGMENTS = [
  {
    id: 'flatAverage',
    label: 'New apartment · average location',
    values: [9800, 10000, 9800],
    notes: 'New-build flats in average residential locations. Rounded mean €/m² of living area.',
  },
  {
    id: 'flatGood',
    label: 'New apartment · good location',
    values: [10350, 10700, 10550],
    notes: 'New-build flats in good residential locations. Rounded mean €/m² of living area.',
  },
  {
    id: 'semiNew',
    label: 'New semi-detached house',
    values: [11000, 11200, 10750],
    notes:
      'Average and good locations. Typical living area / plot: H1 2024 130/225 m²; H1 2025 130/250 m²; H1 2026 135/265 m².',
  },
  {
    id: 'semiResale',
    label: 'Resale semi-detached house',
    values: [8750, 8150, 7950],
    notes:
      'Average and good locations. Typical living area / plot: H1 2024 140/370 m²; H1 2025 140/380 m²; H1 2026 145/370 m².',
  },
  {
    id: 'endNew',
    label: 'New end-terrace house',
    values: [11200, 11500, 10400],
    notes:
      'Average and good locations. Typical living area / plot: H1 2024 115/260 m²; H1 2025 120/220 m²; H1 2026 115/225 m².',
  },
  {
    id: 'endResale',
    label: 'Resale end-terrace house',
    values: [8900, 8350, 7500],
    notes:
      'Average and good locations. Typical living area / plot: H1 2024 130/310 m²; H1 2025 125/305 m²; H1 2026 130/285 m².',
  },
  {
    id: 'midNew',
    label: 'New mid-terrace house',
    values: [9450, 10580, 9600],
    notes:
      'Average and good locations. Typical living area / plot: H1 2024 120/180 m²; H1 2025 120/215 m²; H1 2026 115/175 m².',
  },
  {
    id: 'midResale',
    label: 'Resale mid-terrace house',
    values: [7650, 7600, 7650],
    notes:
      'Average and good locations. Typical living area / plot: H1 2024 120/215 m²; H1 2025 120/205 m²; H1 2026 120/225 m².',
  },
];
