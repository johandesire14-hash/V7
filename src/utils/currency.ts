export type CurrencyCode =
  | "XOF"
  | "XAF"
  | "CDF"
  | "RWF"
  | "NGN"
  | "GHS"
  | "KES"
  | "MAD"
  | "ZAR"
  | "GNF"
  | "EUR"
  | "USD"
  | "GBP"
  | "CAD";

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  nameFr: string;
  nameEn: string;
  flag: string;
  countryCode?: string;
  rateToUSD: number; // 1 USD = rateToUSD
  prefix?: string;
  suffix?: string;
  decimals: number;
}

export interface SupportedCountry {
  code: string; // ISO 2-letter country code (SN, CG, CD, CI, CM, BJ, RW...)
  nameFr: string;
  nameEn: string;
  currencyCode: CurrencyCode;
  currencyNameFr: string;
  currencyNameEn: string;
  symbol: string;
  flag: string;
  keywords: string[];
  priority?: boolean;
}

export interface DetectedLocationInfo {
  countryCode: string;
  countryName: string;
  currency: CurrencyCode;
  timezone: string;
  locale: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  XOF: {
    code: "XOF",
    symbol: "FCFA",
    nameFr: "Franc CFA UEMOA (XOF) - Sénégal, Côte d'Ivoire, Bénin...",
    nameEn: "West African CFA Franc (XOF) - Senegal, Ivory Coast, Benin...",
    flag: "🇸🇳",
    countryCode: "SN",
    rateToUSD: 605.0,
    suffix: " FCFA",
    decimals: 0,
  },
  XAF: {
    code: "XAF",
    symbol: "FCFA",
    nameFr: "Franc CFA CEMAC (XAF) - Cameroun, Congo, Gabon...",
    nameEn: "Central African CFA Franc (XAF) - Cameroon, Congo, Gabon...",
    flag: "🇨🇲",
    countryCode: "CM",
    rateToUSD: 605.0,
    suffix: " FCFA",
    decimals: 0,
  },
  CDF: {
    code: "CDF",
    symbol: "FC",
    nameFr: "Franc congolais (CDF) - RD Congo (RDC)",
    nameEn: "Congolese Franc (CDF) - DR Congo",
    flag: "🇨🇩",
    countryCode: "CD",
    rateToUSD: 2850.0,
    suffix: " FC",
    decimals: 0,
  },
  RWF: {
    code: "RWF",
    symbol: "FRw",
    nameFr: "Franc rwandais (RWF) - Rwanda",
    nameEn: "Rwandan Franc (RWF) - Rwanda",
    flag: "🇷🇼",
    countryCode: "RW",
    rateToUSD: 1350.0,
    suffix: " FRw",
    decimals: 0,
  },
  NGN: {
    code: "NGN",
    symbol: "₦",
    nameFr: "Naira nigérian (NGN)",
    nameEn: "Nigerian Naira (NGN)",
    flag: "🇳🇬",
    countryCode: "NG",
    rateToUSD: 1550.0,
    prefix: "₦",
    decimals: 0,
  },
  GHS: {
    code: "GHS",
    symbol: "GH₵",
    nameFr: "Cedi ghanéen (GHS)",
    nameEn: "Ghanaian Cedi (GHS)",
    flag: "🇬🇭",
    countryCode: "GH",
    rateToUSD: 15.6,
    prefix: "GH₵",
    decimals: 2,
  },
  KES: {
    code: "KES",
    symbol: "KSh",
    nameFr: "Shilling kényan (KES)",
    nameEn: "Kenyan Shilling (KES)",
    flag: "🇰🇪",
    countryCode: "KE",
    rateToUSD: 129.0,
    prefix: "KSh ",
    decimals: 0,
  },
  MAD: {
    code: "MAD",
    symbol: "DH",
    nameFr: "Dirham marocain (MAD)",
    nameEn: "Moroccan Dirham (MAD)",
    flag: "🇲🇦",
    countryCode: "MA",
    rateToUSD: 9.9,
    suffix: " DH",
    decimals: 2,
  },
  ZAR: {
    code: "ZAR",
    symbol: "R",
    nameFr: "Rand sud-africain (ZAR)",
    nameEn: "South African Rand (ZAR)",
    flag: "🇿🇦",
    countryCode: "ZA",
    rateToUSD: 18.2,
    prefix: "R ",
    decimals: 2,
  },
  GNF: {
    code: "GNF",
    symbol: "GNF",
    nameFr: "Franc guinéen (GNF)",
    nameEn: "Guinean Franc (GNF)",
    flag: "🇬🇳",
    countryCode: "GN",
    rateToUSD: 8600.0,
    suffix: " GNF",
    decimals: 0,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    nameFr: "Euro (EUR) - France & Diaspora Européenne",
    nameEn: "Euro (EUR) - European Union",
    flag: "🇪🇺",
    countryCode: "FR",
    rateToUSD: 0.92,
    suffix: " €",
    decimals: 2,
  },
  USD: {
    code: "USD",
    symbol: "$",
    nameFr: "Dollar américain (USD) - International",
    nameEn: "US Dollar (USD)",
    flag: "🇺🇸",
    countryCode: "US",
    rateToUSD: 1.0,
    prefix: "$",
    decimals: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    nameFr: "Livre sterling (GBP)",
    nameEn: "British Pound (GBP)",
    flag: "🇬🇧",
    countryCode: "GB",
    rateToUSD: 0.79,
    prefix: "£",
    decimals: 2,
  },
  CAD: {
    code: "CAD",
    symbol: "CA$",
    nameFr: "Dollar canadien (CAD)",
    nameEn: "Canadian Dollar (CAD)",
    flag: "🇨🇦",
    countryCode: "CA",
    rateToUSD: 1.36,
    prefix: "CA$",
    decimals: 2,
  },
};

/**
 * Supported African and international countries mapped to their national currencies.
 * Allows users to find their currency immediately when typing their country name.
 */
export const SUPPORTED_COUNTRIES: SupportedCountry[] = [
  {
    code: "SN",
    nameFr: "Sénégal",
    nameEn: "Senegal",
    currencyCode: "XOF",
    currencyNameFr: "Franc CFA UEMOA",
    currencyNameEn: "West African CFA Franc",
    symbol: "FCFA",
    flag: "🇸🇳",
    keywords: ["senegal", "sénégal", "dakar", "sn", "xof", "cfa", "fcfa", "wave", "orange money"],
    priority: true,
  },
  {
    code: "CG",
    nameFr: "Congo (Brazzaville)",
    nameEn: "Congo (Brazzaville)",
    currencyCode: "XAF",
    currencyNameFr: "Franc CFA CEMAC",
    currencyNameEn: "Central African CFA Franc",
    symbol: "FCFA",
    flag: "🇨🇬",
    keywords: ["congo", "brazzaville", "république du congo", "republique du congo", "cg", "xaf", "cfa", "fcfa", "airtel", "mtn"],
    priority: true,
  },
  {
    code: "CD",
    nameFr: "RD Congo (Kinshasa)",
    nameEn: "DR Congo (Kinshasa)",
    currencyCode: "CDF",
    currencyNameFr: "Franc congolais",
    currencyNameEn: "Congolese Franc",
    symbol: "FC",
    flag: "🇨🇩",
    keywords: ["rd congo", "rdc", "congo rdc", "kinshasa", "lubumbashi", "republique democratique du congo", "cd", "cdf", "franc congolais", "fc", "mpesa", "orange"],
    priority: true,
  },
  {
    code: "CI",
    nameFr: "Côte d'Ivoire",
    nameEn: "Ivory Coast",
    currencyCode: "XOF",
    currencyNameFr: "Franc CFA UEMOA",
    currencyNameEn: "West African CFA Franc",
    symbol: "FCFA",
    flag: "🇨🇮",
    keywords: ["cote d'ivoire", "côte d'ivoire", "abidjan", "yamoussoukro", "ci", "xof", "cfa", "fcfa", "wave", "orange", "mtn"],
    priority: true,
  },
  {
    code: "CM",
    nameFr: "Cameroun",
    nameEn: "Cameroon",
    currencyCode: "XAF",
    currencyNameFr: "Franc CFA CEMAC",
    currencyNameEn: "Central African CFA Franc",
    symbol: "FCFA",
    flag: "🇨🇲",
    keywords: ["cameroun", "cameroon", "douala", "yaounde", "yaoundé", "cm", "xaf", "cfa", "fcfa", "mtn momo", "orange money"],
    priority: true,
  },
  {
    code: "BJ",
    nameFr: "Bénin",
    nameEn: "Benin",
    currencyCode: "XOF",
    currencyNameFr: "Franc CFA UEMOA",
    currencyNameEn: "West African CFA Franc",
    symbol: "FCFA",
    flag: "🇧🇯",
    keywords: ["benin", "bénin", "cotonou", "porto-novo", "bj", "xof", "cfa", "fcfa", "mtn", "moov money", "flooz"],
    priority: true,
  },
  {
    code: "RW",
    nameFr: "Rwanda",
    nameEn: "Rwanda",
    currencyCode: "RWF",
    currencyNameFr: "Franc rwandais",
    currencyNameEn: "Rwandan Franc",
    symbol: "FRw",
    flag: "🇷🇼",
    keywords: ["rwanda", "kigali", "rw", "rwf", "frw", "franc rwandais", "mtn momo", "airtel money"],
    priority: true,
  },
  {
    code: "GA",
    nameFr: "Gabon",
    nameEn: "Gabon",
    currencyCode: "XAF",
    currencyNameFr: "Franc CFA CEMAC",
    currencyNameEn: "Central African CFA Franc",
    symbol: "FCFA",
    flag: "🇬🇦",
    keywords: ["gabon", "libreville", "ga", "xaf", "cfa", "fcfa", "airtel money"],
  },
  {
    code: "TG",
    nameFr: "Togo",
    nameEn: "Togo",
    currencyCode: "XOF",
    currencyNameFr: "Franc CFA UEMOA",
    currencyNameEn: "West African CFA Franc",
    symbol: "FCFA",
    flag: "🇹🇬",
    keywords: ["togo", "lome", "lomé", "tg", "xof", "cfa", "fcfa", "flooz", "tmoney"],
  },
  {
    code: "ML",
    nameFr: "Mali",
    nameEn: "Mali",
    currencyCode: "XOF",
    currencyNameFr: "Franc CFA UEMOA",
    currencyNameEn: "West African CFA Franc",
    symbol: "FCFA",
    flag: "🇲🇱",
    keywords: ["mali", "bamako", "ml", "xof", "cfa", "fcfa", "orange money"],
  },
  {
    code: "BF",
    nameFr: "Burkina Faso",
    nameEn: "Burkina Faso",
    currencyCode: "XOF",
    currencyNameFr: "Franc CFA UEMOA",
    currencyNameEn: "West African CFA Franc",
    symbol: "FCFA",
    flag: "🇧🇫",
    keywords: ["burkina", "burkina faso", "ouagadougou", "bf", "xof", "cfa", "fcfa"],
  },
  {
    code: "GN",
    nameFr: "Guinée",
    nameEn: "Guinea",
    currencyCode: "GNF",
    currencyNameFr: "Franc guinéen",
    currencyNameEn: "Guinean Franc",
    symbol: "GNF",
    flag: "🇬🇳",
    keywords: ["guinee", "guinée", "conakry", "gn", "gnf", "orange money"],
  },
  {
    code: "NG",
    nameFr: "Nigéria",
    nameEn: "Nigeria",
    currencyCode: "NGN",
    currencyNameFr: "Naira nigérian",
    currencyNameEn: "Nigerian Naira",
    symbol: "₦",
    flag: "🇳🇬",
    keywords: ["nigeria", "nigéria", "lagos", "abuja", "ng", "ngn", "naira"],
  },
  {
    code: "GH",
    nameFr: "Ghana",
    nameEn: "Ghana",
    currencyCode: "GHS",
    currencyNameFr: "Cedi ghanéen",
    currencyNameEn: "Ghanaian Cedi",
    symbol: "GH₵",
    flag: "🇬🇭",
    keywords: ["ghana", "accra", "gh", "ghs", "cedi"],
  },
  {
    code: "KE",
    nameFr: "Kenya",
    nameEn: "Kenya",
    currencyCode: "KES",
    currencyNameFr: "Shilling kényan",
    currencyNameEn: "Kenyan Shilling",
    symbol: "KSh",
    flag: "🇰🇪",
    keywords: ["kenya", "nairobi", "ke", "kes", "shilling", "mpesa"],
  },
  {
    code: "MA",
    nameFr: "Maroc",
    nameEn: "Morocco",
    currencyCode: "MAD",
    currencyNameFr: "Dirham marocain",
    currencyNameEn: "Moroccan Dirham",
    symbol: "DH",
    flag: "🇲🇦",
    keywords: ["maroc", "morocco", "casablanca", "rabat", "ma", "mad", "dirham"],
  },
  {
    code: "ZA",
    nameFr: "Afrique du Sud",
    nameEn: "South Africa",
    currencyCode: "ZAR",
    currencyNameFr: "Rand sud-africain",
    currencyNameEn: "South African Rand",
    symbol: "R",
    flag: "🇿🇦",
    keywords: ["afrique du sud", "south africa", "johannesburg", "cape town", "za", "zar", "rand"],
  },
  {
    code: "FR",
    nameFr: "France & Diaspora (Europe)",
    nameEn: "France & European Diaspora",
    currencyCode: "EUR",
    currencyNameFr: "Euro",
    currencyNameEn: "Euro",
    symbol: "€",
    flag: "🇫🇷",
    keywords: ["france", "europe", "paris", "diaspora", "fr", "eu", "eur", "euro"],
  },
  {
    code: "US",
    nameFr: "International (États-Unis)",
    nameEn: "International (United States)",
    currencyCode: "USD",
    currencyNameFr: "Dollar américain",
    currencyNameEn: "US Dollar",
    symbol: "$",
    flag: "🇺🇸",
    keywords: ["etats-unis", "états-unis", "usa", "us", "dollar", "usd", "international"],
  },
  {
    code: "CA",
    nameFr: "Canada",
    nameEn: "Canada",
    currencyCode: "CAD",
    currencyNameFr: "Dollar canadien",
    currencyNameEn: "Canadian Dollar",
    symbol: "CA$",
    flag: "🇨🇦",
    keywords: ["canada", "montreal", "montréal", "toronto", "ca", "cad"],
  },
  {
    code: "GB",
    nameFr: "Royaume-Uni",
    nameEn: "United Kingdom",
    currencyCode: "GBP",
    currencyNameFr: "Livre sterling",
    currencyNameEn: "British Pound",
    symbol: "£",
    flag: "🇬🇧",
    keywords: ["royaume-uni", "angleterre", "london", "uk", "gb", "gbp", "livre"],
  },
];

/**
 * Normalizes text for search (removes accents, lowercase, trimmed)
 */
export const normalizeSearchText = (str: string): string => {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

/**
 * Detects the user's location & recommended currency based on browser timezone and locale,
 * with first-class preference for African nations.
 */
export const detectUserLocationAndCurrency = (): DetectedLocationInfo => {
  let timezone = "UTC";
  try {
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    timezone = "UTC";
  }

  const navLang = typeof navigator !== "undefined" ? navigator.language || "fr-FR" : "fr-FR";
  const lowerTz = timezone.toLowerCase();
  const lowerLang = navLang.toLowerCase();

  // Rwanda
  if (lowerTz.includes("kigali") || lowerLang.includes("rw")) {
    return {
      countryCode: "RW",
      countryName: "Rwanda",
      currency: "RWF",
      timezone,
      locale: navLang,
      flag: "🇷🇼",
    };
  }

  // RD Congo (Kinshasa, Lubumbashi)
  if (lowerTz.includes("kinshasa") || lowerTz.includes("lubumbashi") || lowerLang.includes("cd")) {
    return {
      countryCode: "CD",
      countryName: "RD Congo",
      currency: "CDF",
      timezone,
      locale: navLang,
      flag: "🇨🇩",
    };
  }

  // Congo (Brazzaville)
  if (lowerTz.includes("brazzaville") || lowerLang.includes("cg")) {
    return {
      countryCode: "CG",
      countryName: "Congo (Brazzaville)",
      currency: "XAF",
      timezone,
      locale: navLang,
      flag: "🇨🇬",
    };
  }

  // Sénégal
  if (lowerTz.includes("dakar") || lowerLang.includes("sn")) {
    return {
      countryCode: "SN",
      countryName: "Sénégal",
      currency: "XOF",
      timezone,
      locale: navLang,
      flag: "🇸🇳",
    };
  }

  // Côte d'Ivoire & UEMOA
  if (lowerTz.includes("abidjan") || lowerLang.includes("ci")) {
    return {
      countryCode: "CI",
      countryName: "Côte d'Ivoire",
      currency: "XOF",
      timezone,
      locale: navLang,
      flag: "🇨🇮",
    };
  }

  // Cameroun & CEMAC
  if (lowerTz.includes("douala") || lowerTz.includes("yaounde") || lowerLang.includes("cm")) {
    return {
      countryCode: "CM",
      countryName: "Cameroun",
      currency: "XAF",
      timezone,
      locale: navLang,
      flag: "🇨🇲",
    };
  }

  // Bénin
  if (lowerTz.includes("cotonou") || lowerLang.includes("bj")) {
    return {
      countryCode: "BJ",
      countryName: "Bénin",
      currency: "XOF",
      timezone,
      locale: navLang,
      flag: "🇧🇯",
    };
  }

  // Nigeria
  if (lowerTz.includes("lagos") || lowerLang.includes("ng")) {
    return {
      countryCode: "NG",
      countryName: "Nigéria",
      currency: "NGN",
      timezone,
      locale: navLang,
      flag: "🇳🇬",
    };
  }

  // Ghana
  if (lowerTz.includes("accra") || lowerLang.includes("gh")) {
    return {
      countryCode: "GH",
      countryName: "Ghana",
      currency: "GHS",
      timezone,
      locale: navLang,
      flag: "🇬🇭",
    };
  }

  // Kenya
  if (lowerTz.includes("nairobi") || lowerLang.includes("ke")) {
    return {
      countryCode: "KE",
      countryName: "Kenya",
      currency: "KES",
      timezone,
      locale: navLang,
      flag: "🇰🇪",
    };
  }

  // Maroc
  if (lowerTz.includes("casablanca") || lowerLang.includes("ma")) {
    return {
      countryCode: "MA",
      countryName: "Maroc",
      currency: "MAD",
      timezone,
      locale: navLang,
      flag: "🇲🇦",
    };
  }

  // Autres pays UEMOA (Togo, Mali, Burkina, Niger)
  if (
    lowerTz.includes("lome") ||
    lowerTz.includes("bamako") ||
    lowerTz.includes("ouagadougou") ||
    lowerTz.includes("niamey")
  ) {
    return {
      countryCode: "XOF",
      countryName: "Zone UEMOA",
      currency: "XOF",
      timezone,
      locale: navLang,
      flag: "🌍",
    };
  }

  // Autres pays CEMAC (Gabon, Tchad, RCA, Guinée Équatoriale)
  if (lowerTz.includes("libreville") || lowerTz.includes("ndjamena") || lowerTz.includes("bangui")) {
    return {
      countryCode: "XAF",
      countryName: "Zone CEMAC",
      currency: "XAF",
      timezone,
      locale: navLang,
      flag: "🌍",
    };
  }

  // Eurozone detection (France, Belgique, etc.)
  if (
    lowerTz.includes("paris") ||
    lowerTz.includes("brussels") ||
    lowerTz.includes("berlin") ||
    lowerTz.includes("madrid") ||
    lowerTz.includes("rome") ||
    lowerTz.includes("amsterdam")
  ) {
    return {
      countryCode: "FR",
      countryName: "France & Diaspora",
      currency: "EUR",
      timezone,
      locale: navLang,
      flag: "🇪🇺",
    };
  }

  // Default to Sénégal / Côte d'Ivoire FCFA (XOF)
  return {
    countryCode: "SN",
    countryName: "Afrique de l'Ouest / Centrale",
    currency: "XOF",
    timezone,
    locale: navLang,
    flag: "🇸🇳",
  };
};

/**
 * Persisted preferred country helper
 */
export const getStoredCountry = (): string => {
  if (typeof window === "undefined") return "SN";
  try {
    const saved = localStorage.getItem("mansa_preferred_country");
    if (saved) return saved;
  } catch {
    // ignore
  }
  return detectUserLocationAndCurrency().countryCode || "SN";
};

/**
 * Saves selected country to localStorage and notifies listeners
 */
export const setStoredCountry = (countryCode: string): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mansa_preferred_country", countryCode);
    window.dispatchEvent(new CustomEvent("mansa_country_changed", { detail: { countryCode } }));
  } catch {
    // ignore
  }
};

/**
 * Country & Currency search helper: searches by country name, currency code, keyword, or symbol
 */
export const searchCountriesAndCurrencies = (
  query: string,
  lang: "fr" | "en" = "fr"
): SupportedCountry[] => {
  const normalized = normalizeSearchText(query);
  if (!normalized) return SUPPORTED_COUNTRIES;

  return SUPPORTED_COUNTRIES.filter((item) => {
    const name = normalizeSearchText(lang === "fr" ? item.nameFr : item.nameEn);
    const currName = normalizeSearchText(lang === "fr" ? item.currencyNameFr : item.currencyNameEn);
    const code = item.code.toLowerCase();
    const currCode = item.currencyCode.toLowerCase();
    const symbol = item.symbol.toLowerCase();
    const matchesKeyword = item.keywords.some((k) => normalizeSearchText(k).includes(normalized));

    return (
      name.includes(normalized) ||
      currName.includes(normalized) ||
      code.includes(normalized) ||
      currCode.includes(normalized) ||
      symbol.includes(normalized) ||
      matchesKeyword
    );
  });
};

/**
 * Converts an amount from USD to the target currency
 */
export const convertFromUSD = (amountUSD: number, targetCurrency: CurrencyCode): number => {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.XOF;
  return amountUSD * config.rateToUSD;
};

/**
 * Converts an amount between any two supported currencies
 */
export const convertBetweenCurrencies = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number => {
  if (fromCurrency === toCurrency) return amount;
  const fromConfig = SUPPORTED_CURRENCIES[fromCurrency] || SUPPORTED_CURRENCIES.USD;
  const toConfig = SUPPORTED_CURRENCIES[toCurrency] || SUPPORTED_CURRENCIES.XOF;
  const inUSD = amount / fromConfig.rateToUSD;
  return inUSD * toConfig.rateToUSD;
};

/**
 * Persisted currency helper - reads from localStorage or falls back to detected location
 */
export const getStoredCurrency = (): CurrencyCode => {
  if (typeof window === "undefined") return "XOF";
  try {
    const saved = localStorage.getItem("mansa_preferred_currency") as CurrencyCode;
    if (saved && SUPPORTED_CURRENCIES[saved]) {
      return saved;
    }
  } catch {
    // ignore
  }
  return detectUserLocationAndCurrency().currency;
};

/**
 * Persists the selected currency to localStorage and triggers window storage event
 */
export const setStoredCurrency = (currency: CurrencyCode): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("mansa_preferred_currency", currency);
    window.dispatchEvent(new CustomEvent("mansa_currency_changed", { detail: { currency } }));
  } catch {
    // ignore
  }
};

/**
 * Formats an amount between any two currencies into a clean string representation for forms/inputs
 */
export const formatConvertedNumericPrice = (
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): string => {
  if (fromCurrency === toCurrency) {
    const config = SUPPORTED_CURRENCIES[toCurrency] || SUPPORTED_CURRENCIES.USD;
    return config.decimals === 0 ? Math.round(amount).toString() : amount.toString();
  }
  const converted = convertBetweenCurrencies(amount, fromCurrency, toCurrency);
  const targetConfig = SUPPORTED_CURRENCIES[toCurrency] || SUPPORTED_CURRENCIES.USD;
  if (targetConfig.decimals === 0) {
    return Math.round(converted).toString();
  }
  return (Math.round(converted * 100) / 100).toFixed(targetConfig.decimals);
};

/**
 * Formats a USD amount into the target currency formatted string
 */
export const formatCurrency = (
  amountUSD: number,
  targetCurrency: CurrencyCode = "XOF",
  options?: {
    compact?: boolean;
    includeSuffix?: boolean;
    locale?: string;
  }
): string => {
  const config = SUPPORTED_CURRENCIES[targetCurrency] || SUPPORTED_CURRENCIES.XOF;
  const converted = convertFromUSD(amountUSD, targetCurrency);
  const locale = options?.locale || (targetCurrency === "EUR" ? "fr-FR" : "fr-FR");

  let numFormatted = "";
  if (options?.compact && converted >= 1000) {
    if (converted >= 1_000_000) {
      numFormatted = (converted / 1_000_000).toFixed(1).replace(".", ",") + "M";
    } else {
      numFormatted = (converted / 1_000).toFixed(0).replace(".", ",") + "k";
    }
  } else {
    numFormatted = new Intl.NumberFormat(locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    }).format(converted);
  }

  if (config.prefix) {
    return `${config.prefix}${numFormatted}`;
  }
  if (config.suffix && options?.includeSuffix !== false) {
    return `${numFormatted}${config.suffix}`;
  }
  return `${numFormatted} ${config.symbol}`;
};
