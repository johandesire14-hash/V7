/**
 * Règles de validation centralisées pour les numéros de téléphone et opérateurs Mobile Money
 * Conforme aux spécifications :
 * Indicatif téléphonique + Opérateur + Numéro de téléphone + Devise = Correspondance valide
 */

export interface OperatorConfig {
  id: string; // e.g. "mtn", "airtel", "orange", "wave", "moov", "free", "vodacom"
  name: string; // e.g. "MTN", "Airtel", "Orange", "Wave", "Moov", "Free", "Vodacom / M-Pesa"
  brandColor?: string;
  prefixes: string[]; // authorized prefixes
  nationalLength: number; // e.g. 9 or 10 digits
  format: string; // e.g. "06 XXX XX XX"
  formatGroups: number[]; // e.g. [2, 3, 2, 2] -> "06 123 45 67"
  allowedCurrencies: string[]; // e.g. ["XAF", "EUR", "USD"]
  description?: string;
}

export interface DialCodeConfig {
  dialCode: string; // e.g. "+242"
  countryCode: string; // e.g. "CG"
  countryName: string; // e.g. "Congo-Brazzaville"
  flag: string; // e.g. "🇨🇬"
  defaultCurrency: string; // e.g. "XAF"
  supportedCurrencies: string[];
  operators: OperatorConfig[];
}

export const DIAL_CODE_CONFIGS: Record<string, DialCodeConfig> = {
  // 🇨🇬 Congo-Brazzaville — +242
  "+242": {
    dialCode: "+242",
    countryCode: "CG",
    countryName: "Congo-Brazzaville",
    flag: "🇨🇬",
    defaultCurrency: "XAF",
    supportedCurrencies: ["XAF", "EUR", "USD"],
    operators: [
      {
        id: "mtn",
        name: "MTN",
        brandColor: "#FFCC00",
        prefixes: ["06"],
        nationalLength: 9,
        format: "06 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["XAF", "EUR", "USD"],
        description: "MTN Mobile Money Congo (06)",
      },
      {
        id: "airtel",
        name: "Airtel",
        brandColor: "#FF0000",
        prefixes: ["05"],
        nationalLength: 9,
        format: "05 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["XAF", "EUR", "USD"],
        description: "Airtel Money Congo (05)",
      },
    ],
  },

  // 🇸🇳 Sénégal — +221
  "+221": {
    dialCode: "+221",
    countryCode: "SN",
    countryName: "Sénégal",
    flag: "🇸🇳",
    defaultCurrency: "XOF",
    supportedCurrencies: ["XOF", "EUR", "USD"],
    operators: [
      {
        id: "orange",
        name: "Orange",
        brandColor: "#FF7900",
        prefixes: ["77", "78"],
        nationalLength: 9,
        format: "77 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Orange Money Sénégal (77, 78)",
      },
      {
        id: "free",
        name: "Free",
        brandColor: "#CD1818",
        prefixes: ["76"],
        nationalLength: 9,
        format: "76 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Free Money Sénégal (76)",
      },
      {
        id: "wave",
        name: "Wave",
        brandColor: "#1DC3FD",
        prefixes: ["70", "75", "76", "77", "78"],
        nationalLength: 9,
        format: "70 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Wave Sénégal (70, 75, 76, 77, 78)",
      },
    ],
  },

  // 🇨🇮 Côte d’Ivoire — +225
  "+225": {
    dialCode: "+225",
    countryCode: "CI",
    countryName: "Côte d’Ivoire",
    flag: "🇨🇮",
    defaultCurrency: "XOF",
    supportedCurrencies: ["XOF", "EUR", "USD"],
    operators: [
      {
        id: "mtn",
        name: "MTN",
        brandColor: "#FFCC00",
        prefixes: ["05"],
        nationalLength: 10,
        format: "05 XX XX XX XX",
        formatGroups: [2, 2, 2, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "MTN MoMo Côte d'Ivoire (05)",
      },
      {
        id: "orange",
        name: "Orange",
        brandColor: "#FF7900",
        prefixes: ["07"],
        nationalLength: 10,
        format: "07 XX XX XX XX",
        formatGroups: [2, 2, 2, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Orange Money Côte d'Ivoire (07)",
      },
      {
        id: "moov",
        name: "Moov",
        brandColor: "#005BAA",
        prefixes: ["01"],
        nationalLength: 10,
        format: "01 XX XX XX XX",
        formatGroups: [2, 2, 2, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Moov Money Côte d'Ivoire (01)",
      },
      {
        id: "wave",
        name: "Wave",
        brandColor: "#1DC3FD",
        prefixes: ["01", "05", "07"],
        nationalLength: 10,
        format: "0X XX XX XX XX",
        formatGroups: [2, 2, 2, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Wave Côte d'Ivoire (01, 05, 07)",
      },
    ],
  },

  // 🇨🇲 Cameroun — +237
  "+237": {
    dialCode: "+237",
    countryCode: "CM",
    countryName: "Cameroun",
    flag: "🇨🇲",
    defaultCurrency: "XAF",
    supportedCurrencies: ["XAF", "EUR", "USD"],
    operators: [
      {
        id: "mtn",
        name: "MTN",
        brandColor: "#FFCC00",
        prefixes: ["67", "650", "651", "652", "653", "654"],
        nationalLength: 9,
        format: "6XX XX XX XX",
        formatGroups: [3, 2, 2, 2],
        allowedCurrencies: ["XAF", "EUR", "USD"],
        description: "MTN MoMo Cameroun (67, 650-654)",
      },
      {
        id: "orange",
        name: "Orange",
        brandColor: "#FF7900",
        prefixes: ["69", "655", "656", "657", "658", "659"],
        nationalLength: 9,
        format: "6XX XX XX XX",
        formatGroups: [3, 2, 2, 2],
        allowedCurrencies: ["XAF", "EUR", "USD"],
        description: "Orange Money Cameroun (69, 655-659)",
      },
    ],
  },

  // 🇧🇯 Bénin — +229
  "+229": {
    dialCode: "+229",
    countryCode: "BJ",
    countryName: "Bénin",
    flag: "🇧🇯",
    defaultCurrency: "XOF",
    supportedCurrencies: ["XOF", "EUR", "USD"],
    operators: [
      {
        id: "mtn",
        name: "MTN",
        brandColor: "#FFCC00",
        prefixes: [
          "0151", "0152", "0153", "0154",
          "0161", "0162", "0166", "0167", "0169",
          "0190", "0191", "0196", "0197",
          "51", "52", "53", "54", "61", "62", "66", "67", "69", "90", "91", "96", "97",
        ],
        nationalLength: 10,
        format: "01 XX XX XX XX",
        formatGroups: [2, 2, 2, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "MTN MoMo Bénin (01 51/52/53/54/61/62/66/67/69/90/91/96/97)",
      },
      {
        id: "moov",
        name: "Moov",
        brandColor: "#005BAA",
        prefixes: [
          "0155", "0160", "0163", "0164", "0165", "0168",
          "0194", "0195", "0198", "0199",
          "55", "60", "63", "64", "65", "68", "94", "95", "98", "99",
        ],
        nationalLength: 10,
        format: "01 XX XX XX XX",
        formatGroups: [2, 2, 2, 2, 2],
        allowedCurrencies: ["XOF", "EUR", "USD"],
        description: "Moov Money Bénin (01 55/60/63/64/65/68/94/95/98/99)",
      },
    ],
  },

  // 🇨🇩 RD Congo — +243
  "+243": {
    dialCode: "+243",
    countryCode: "CD",
    countryName: "RD Congo",
    flag: "🇨🇩",
    defaultCurrency: "CDF",
    supportedCurrencies: ["CDF", "USD"],
    operators: [
      {
        id: "airtel",
        name: "Airtel",
        brandColor: "#FF0000",
        prefixes: ["97", "98", "99"],
        nationalLength: 9,
        format: "9X XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["CDF", "USD"],
        description: "Airtel Money RDC (97, 98, 99) · CDF/USD",
      },
      {
        id: "orange",
        name: "Orange",
        brandColor: "#FF7900",
        prefixes: ["84", "85", "89", "80"],
        nationalLength: 9,
        format: "84 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["CDF", "USD"],
        description: "Orange Money RDC (80, 84, 85, 89) · CDF/USD",
      },
      {
        id: "vodacom",
        name: "Vodacom / M-Pesa",
        brandColor: "#E60000",
        prefixes: ["81", "82", "83"],
        nationalLength: 9,
        format: "81 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["CDF", "USD"],
        description: "Vodacom M-Pesa RDC (81, 82, 83) · CDF/USD",
      },
    ],
  },

  // 🇷🇼 Rwanda — +250
  "+250": {
    dialCode: "+250",
    countryCode: "RW",
    countryName: "Rwanda",
    flag: "🇷🇼",
    defaultCurrency: "RWF",
    supportedCurrencies: ["RWF", "USD"],
    operators: [
      {
        id: "mtn",
        name: "MTN",
        brandColor: "#FFCC00",
        prefixes: ["78", "79"],
        nationalLength: 9,
        format: "78 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["RWF", "USD"],
        description: "MTN Mobile Money Rwanda (78, 79)",
      },
      {
        id: "airtel",
        name: "Airtel",
        brandColor: "#FF0000",
        prefixes: ["72", "73"],
        nationalLength: 9,
        format: "72 XXX XX XX",
        formatGroups: [2, 3, 2, 2],
        allowedCurrencies: ["RWF", "USD"],
        description: "Airtel Money Rwanda (72, 73)",
      },
    ],
  },
};

/**
 * Liste ordonnée des indicatifs disponibles
 */
export const AVAILABLE_DIAL_CODES = Object.values(DIAL_CODE_CONFIGS);

/**
 * Normalise un numéro de téléphone en supprimant les espaces, tirets, points, parenthèses
 * et en retirant l'indicatif téléphonique si l'utilisateur l'a collé par erreur.
 */
export function normalizePhoneNumber(rawNumber: string, dialCode?: string): string {
  if (!rawNumber) return "";
  let clean = rawNumber.trim().replace(/[\s\-\.\(\)\/]/g, "");

  // Si l'utilisateur a tapé le code indicatif (ex: +242 ou 00242 ou 242) au début, on le retire
  if (dialCode) {
    const rawDigitsDial = dialCode.replace("+", "");
    if (clean.startsWith(dialCode)) {
      clean = clean.slice(dialCode.length);
    } else if (clean.startsWith(`+${rawDigitsDial}`)) {
      clean = clean.slice(rawDigitsDial.length + 1);
    } else if (clean.startsWith(`00${rawDigitsDial}`)) {
      clean = clean.slice(rawDigitsDial.length + 2);
    } else if (clean.startsWith(rawDigitsDial) && clean.length > 9) {
      clean = clean.slice(rawDigitsDial.length);
    }
  }

  // Ne conserver que les chiffres
  return clean.replace(/\D/g, "");
}

/**
 * Formate un numéro normalisé selon les groupes du format de l'opérateur
 */
export function formatPhoneNumber(normalized: string, formatGroups: number[]): string {
  if (!normalized) return "";
  const parts: string[] = [];
  let index = 0;

  for (const size of formatGroups) {
    if (index >= normalized.length) break;
    parts.push(normalized.slice(index, index + size));
    index += size;
  }

  if (index < normalized.length) {
    parts.push(normalized.slice(index));
  }

  return parts.join(" ");
}

export type PhoneValidationStatus =
  | "valid"
  | "empty"
  | "invalid_dial_code"
  | "operator_unavailable"
  | "invalid_length"
  | "incompatible_prefix"
  | "invalid_format"
  | "incompatible_currency";

export interface PhoneValidationResult {
  isValid: boolean;
  status: PhoneValidationStatus;
  dialCode: string;
  countryName?: string;
  countryCode?: string;
  flag?: string;
  operatorId: string;
  operatorName?: string;
  normalizedNumber: string;
  formattedNumber: string;
  fullInternationalNumber: string;
  expectedLength?: number;
  expectedFormat?: string;
  errorTitle?: string;
  errorMessage?: string;
  suggestedOperator?: {
    id: string;
    name: string;
  };
}

/**
 * Moteur de validation complet du numéro de téléphone Mobile Money
 * Vérifie :
 * 1. Indicatif valide
 * 2. Opérateur disponible pour cet indicatif
 * 3. Longueur exacte
 * 4. Préfixe compatible avec l'opérateur
 * 5. Format cohérent
 * 6. Compatibilité de la devise
 */
export function validatePhoneNumber(
  dialCode: string,
  operatorId: string,
  rawPhoneNumber: string,
  currency?: string
): PhoneValidationResult {
  // 1. Vérification de l'indicatif
  const countryConfig = DIAL_CODE_CONFIGS[dialCode];
  if (!countryConfig) {
    return {
      isValid: false,
      status: "invalid_dial_code",
      dialCode,
      operatorId,
      normalizedNumber: "",
      formattedNumber: rawPhoneNumber,
      fullInternationalNumber: `${dialCode} ${rawPhoneNumber}`.trim(),
      errorTitle: "Indicatif invalide",
      errorMessage: `L'indicatif '${dialCode}' n'est pas pris en charge pour les paiements Mobile Money.`,
    };
  }

  // 2. Vérification de l'opérateur pour cet indicatif
  const operatorConfig = countryConfig.operators.find((op) => op.id.toLowerCase() === operatorId.toLowerCase());
  if (!operatorConfig) {
    const availableOpNames = countryConfig.operators.map((op) => op.name).join(", ");
    return {
      isValid: false,
      status: "operator_unavailable",
      dialCode,
      countryName: countryConfig.countryName,
      countryCode: countryConfig.countryCode,
      flag: countryConfig.flag,
      operatorId,
      normalizedNumber: "",
      formattedNumber: rawPhoneNumber,
      fullInternationalNumber: `${dialCode} ${rawPhoneNumber}`.trim(),
      errorTitle: "Opérateur indisponible",
      errorMessage: `L'opérateur '${operatorId}' n'est pas disponible pour l'indicatif ${countryConfig.flag} ${dialCode} (${countryConfig.countryName}). Opérateurs disponibles : ${availableOpNames}.`,
    };
  }

  // Normaliser le numéro
  const normalized = normalizePhoneNumber(rawPhoneNumber, dialCode);
  const formatted = formatPhoneNumber(normalized, operatorConfig.formatGroups);
  const fullIntl = `${dialCode} ${formatted}`.trim();

  // Si aucun numéro saisi
  if (!normalized) {
    return {
      isValid: false,
      status: "empty",
      dialCode,
      countryName: countryConfig.countryName,
      countryCode: countryConfig.countryCode,
      flag: countryConfig.flag,
      operatorId: operatorConfig.id,
      operatorName: operatorConfig.name,
      normalizedNumber: "",
      formattedNumber: "",
      fullInternationalNumber: `${dialCode}`,
      expectedLength: operatorConfig.nationalLength,
      expectedFormat: operatorConfig.format,
      errorTitle: "Numéro requis",
      errorMessage: `Veuillez saisir votre numéro ${operatorConfig.name} (ex: ${operatorConfig.format}).`,
    };
  }

  // 3. Vérification de la longueur
  if (normalized.length !== operatorConfig.nationalLength) {
    return {
      isValid: false,
      status: "invalid_length",
      dialCode,
      countryName: countryConfig.countryName,
      countryCode: countryConfig.countryCode,
      flag: countryConfig.flag,
      operatorId: operatorConfig.id,
      operatorName: operatorConfig.name,
      normalizedNumber: normalized,
      formattedNumber: formatted,
      fullInternationalNumber: fullIntl,
      expectedLength: operatorConfig.nationalLength,
      expectedFormat: operatorConfig.format,
      errorTitle: "Numéro invalide",
      errorMessage: `Le numéro doit contenir exactement ${operatorConfig.nationalLength} chiffres pour cet indicatif (${normalized.length} saisi${normalized.length > 1 ? "s" : ""}). Format attendu : ${operatorConfig.format}`,
    };
  }

  // 4. Vérification du préfixe autorisé pour l'opérateur sélectionné
  const matchesOperatorPrefix = operatorConfig.prefixes.some((p) => normalized.startsWith(p));

  if (!matchesOperatorPrefix) {
    // Trouver si le préfixe correspond à un autre opérateur du même indicatif
    let detectedOp: OperatorConfig | undefined;
    for (const otherOp of countryConfig.operators) {
      if (otherOp.id !== operatorConfig.id) {
        if (otherOp.prefixes.some((p) => normalized.startsWith(p))) {
          detectedOp = otherOp;
          break;
        }
      }
    }

    let errorDetail = `Le préfixe saisi n'est pas reconnu pour ${operatorConfig.name}.`;
    if (detectedOp) {
      errorDetail = `Le numéro saisi correspond à l'opérateur ${detectedOp.name}. Vérifiez votre numéro ou sélectionnez ${detectedOp.name}.`;
    }

    return {
      isValid: false,
      status: "incompatible_prefix",
      dialCode,
      countryName: countryConfig.countryName,
      countryCode: countryConfig.countryCode,
      flag: countryConfig.flag,
      operatorId: operatorConfig.id,
      operatorName: operatorConfig.name,
      normalizedNumber: normalized,
      formattedNumber: formatted,
      fullInternationalNumber: fullIntl,
      expectedLength: operatorConfig.nationalLength,
      expectedFormat: operatorConfig.format,
      errorTitle: `Numéro incompatible avec ${operatorConfig.name}`,
      errorMessage: errorDetail,
      suggestedOperator: detectedOp
        ? {
            id: detectedOp.id,
            name: detectedOp.name,
          }
        : undefined,
    };
  }

  // 6. Vérification de la compatibilité de la devise
  if (currency) {
    const normCur = currency.toUpperCase().trim();
    const isCurrencyAllowed = operatorConfig.allowedCurrencies.includes(normCur);
    if (!isCurrencyAllowed) {
      return {
        isValid: false,
        status: "incompatible_currency",
        dialCode,
        countryName: countryConfig.countryName,
        countryCode: countryConfig.countryCode,
        flag: countryConfig.flag,
        operatorId: operatorConfig.id,
        operatorName: operatorConfig.name,
        normalizedNumber: normalized,
        formattedNumber: formatted,
        fullInternationalNumber: fullIntl,
        expectedLength: operatorConfig.nationalLength,
        expectedFormat: operatorConfig.format,
        errorTitle: "Devise incompatible",
        errorMessage: `La devise ${normCur} n'est pas compatible avec ${operatorConfig.name} (${countryConfig.countryName}). Devises supportées : ${operatorConfig.allowedCurrencies.join(", ")}.`,
      };
    }
  }

  // Tout est valide !
  return {
    isValid: true,
    status: "valid",
    dialCode,
    countryName: countryConfig.countryName,
    countryCode: countryConfig.countryCode,
    flag: countryConfig.flag,
    operatorId: operatorConfig.id,
    operatorName: operatorConfig.name,
    normalizedNumber: normalized,
    formattedNumber: formatted,
    fullInternationalNumber: fullIntl,
    expectedLength: operatorConfig.nationalLength,
    expectedFormat: operatorConfig.format,
  };
}
