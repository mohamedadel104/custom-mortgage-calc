export const TAX_REVIEWED = '2026-10-25';
export const STATES = [
  { id: 'BW', name: 'Baden-Württemberg', tax: 5 },
  { id: 'BY', name: 'Bayern', tax: 3.5 },
  { id: 'BE', name: 'Berlin', tax: 6 },
  { id: 'BB', name: 'Brandenburg', tax: 6.5 },
  { id: 'HB', name: 'Bremen', tax: 5.5 },
  { id: 'HH', name: 'Hamburg', tax: 5.5 },
  { id: 'HE', name: 'Hessen', tax: 6 },
  { id: 'MV', name: 'Mecklenburg-Vorpommern', tax: 6 },
  { id: 'NI', name: 'Niedersachsen', tax: 5 },
  { id: 'NW', name: 'Nordrhein-Westfalen', tax: 6.5 },
  { id: 'RP', name: 'Rheinland-Pfalz', tax: 5 },
  { id: 'SL', name: 'Saarland', tax: 6.5 },
  { id: 'SN', name: 'Sachsen', tax: 5.5 },
  { id: 'ST', name: 'Sachsen-Anhalt', tax: 5 },
  { id: 'SH', name: 'Schleswig-Holstein', tax: 6.5 },
  { id: 'TH', name: 'Thüringen', tax: 5 },
] as const;

export const SOURCES = {
  ecb: 'https://data.ecb.europa.eu/data/datasets/MIR/MIR.M.DE.B.A2C.O.R.A.2250.EUR.N',
  bundesbank:
    'https://www.bundesbank.de/de/statistiken/geld-und-kapitalmaerkte/zinssaetze-und-renditen/mfi-zinsstatistik-bestaende-neugeschaeft--650658',
  tax: 'https://finanzamt.brandenburg.de/fa/de/steuern/steuerinformationen/grunderwerbsteuer/',
  bremen:
    'https://www.transparenz.bremen.de/metainformationen/gesetz-ueber-die-festsetzung-des-steuersatzes-fuer-die-grunderwerbsteuer-vom-16-november-2010-261196',
  consumer:
    'https://www.verbraucherzentrale.de/wissen/geld-versicherungen/bau-und-immobilienfinanzierung/immobilienfinanzierung-haeufige-fragen-rund-um-hauskauf-und-hauskredit-6992',
  cancellation: 'https://www.gesetze-im-internet.de/bgb/__489.html',
  broker: 'https://www.gesetze-im-internet.de/bgb/__656c.html',
  kfw: 'https://www.kfw.de/inlandsfoerderung/Privatpersonen/Neubau/Förderprodukte/Wohneigentumsprogramm-(124)/',
};
