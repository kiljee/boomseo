// src/seo/utils/geoUtils.ts

export interface CountryOption {
  code: string;
  name: string;
  defaultLang: string;
}

export interface CountryGroup {
  group: string;
  countries: CountryOption[];
}

export const COUNTRY_GROUPS: CountryGroup[] = [
  {
    group: 'Balkans & Eastern Europe',
    countries: [
      { code: 'RS', name: 'Serbia (Srbija)', defaultLang: 'sr' },
      { code: 'BA', name: 'Bosnia and Herzegovina', defaultLang: 'sr' },
      { code: 'ME', name: 'Montenegro (Crna Gora)', defaultLang: 'sr' },
      { code: 'HR', name: 'Croatia (Hrvatska)', defaultLang: 'hr' },
      { code: 'SI', name: 'Slovenia', defaultLang: 'sl' },
      { code: 'MK', name: 'North Macedonia', defaultLang: 'mk' },
      { code: 'BG', name: 'Bulgaria', defaultLang: 'bg' },
      { code: 'RO', name: 'Romania', defaultLang: 'ro' },
      { code: 'PL', name: 'Poland', defaultLang: 'pl' },
      { code: 'CZ', name: 'Czech Republic', defaultLang: 'cs' },
      { code: 'SK', name: 'Slovakia', defaultLang: 'sk' },
      { code: 'HU', name: 'Hungary', defaultLang: 'hu' },
      { code: 'UA', name: 'Ukraine', defaultLang: 'uk' },
      { code: 'GR', name: 'Greece', defaultLang: 'el' },
    ],
  },
  {
    group: 'Western & Northern Europe',
    countries: [
      { code: 'DE', name: 'Germany (Deutschland)', defaultLang: 'de' },
      { code: 'AT', name: 'Austria (Österreich)', defaultLang: 'de' },
      { code: 'CH', name: 'Switzerland (Schweiz)', defaultLang: 'de' },
      { code: 'GB', name: 'United Kingdom', defaultLang: 'en' },
      { code: 'FR', name: 'France', defaultLang: 'fr' },
      { code: 'IT', name: 'Italy', defaultLang: 'it' },
      { code: 'ES', name: 'Spain', defaultLang: 'es' },
      { code: 'PT', name: 'Portugal', defaultLang: 'pt' },
      { code: 'NL', name: 'Netherlands', defaultLang: 'nl' },
      { code: 'BE', name: 'Belgium', defaultLang: 'fr' },
      { code: 'SE', name: 'Sweden', defaultLang: 'sv' },
      { code: 'NO', name: 'Norway', defaultLang: 'no' },
      { code: 'DK', name: 'Denmark', defaultLang: 'da' },
      { code: 'FI', name: 'Finland', defaultLang: 'fi' },
      { code: 'IE', name: 'Ireland', defaultLang: 'en' },
    ],
  },
  {
    group: 'Americas & Global',
    countries: [
      { code: 'US', name: 'United States', defaultLang: 'en' },
      { code: 'CA', name: 'Canada', defaultLang: 'en' },
      { code: 'AU', name: 'Australia', defaultLang: 'en' },
      { code: 'NZ', name: 'New Zealand', defaultLang: 'en' },
      { code: 'BR', name: 'Brazil', defaultLang: 'pt' },
      { code: 'MX', name: 'Mexico', defaultLang: 'es' },
      { code: 'TR', name: 'Turkey', defaultLang: 'tr' },
      { code: 'IN', name: 'India', defaultLang: 'en' },
      { code: 'ZA', name: 'South Africa', defaultLang: 'en' },
      { code: 'JP', name: 'Japan', defaultLang: 'ja' },
    ],
  },
];

// Flat lookup map derived automatically from COUNTRY_GROUPS
const COUNTRY_TO_LANG_MAP: Record<string, string> = {};
for (const group of COUNTRY_GROUPS) {
  for (const c of group.countries) {
    COUNTRY_TO_LANG_MAP[c.code] = c.defaultLang;
  }
}

export function resolveLanguageFromCountry(countryCode?: string): string {
  if (!countryCode) return 'en';
  const clean = countryCode.trim().toUpperCase();
  return COUNTRY_TO_LANG_MAP[clean] || 'en';
}

export function buildGeoTargetedQuery(
  keyword: string,
  cityOrState?: string
): string {
  const cleanKeyword = keyword.trim();
  const cleanLoc = (cityOrState || '').trim();

  if (!cleanLoc) {
    return cleanKeyword;
  }

  if (cleanKeyword.toLowerCase().includes(cleanLoc.toLowerCase())) {
    return cleanKeyword;
  }

  return `${cleanKeyword} ${cleanLoc}`;
}