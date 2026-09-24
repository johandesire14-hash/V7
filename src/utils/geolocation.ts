import type { CurrencyCode, SupportedCountry } from "./currency";
import { SUPPORTED_COUNTRIES, getStoredCountry, setStoredCountry, setStoredCurrency } from "./currency";

export type { SupportedCountry, CurrencyCode };
export { getStoredCountry, SUPPORTED_COUNTRIES };

export interface UserLocationResult {
  latitude: number;
  longitude: number;
  countryCode: string;
  countryName: string;
  currencyCode: CurrencyCode;
}

/**
 * Heuristic mapping from rough African & global lat/long coordinates to country & currency
 */
function approximateCountryFromCoordinates(lat: number, lng: number): { countryCode: string; currency: CurrencyCode } {
  // Senegal / Dakar: ~14.7° N, -17.4° W
  if (lat >= 12.0 && lat <= 16.7 && lng >= -17.6 && lng <= -11.3) {
    return { countryCode: "SN", currency: "XOF" };
  }
  // Côte d'Ivoire / Abidjan: ~5.3° N, -4.0° W
  if (lat >= 4.3 && lat <= 10.7 && lng >= -8.6 && lng <= -2.5) {
    return { countryCode: "CI", currency: "XOF" };
  }
  // Cameroon / Douala / Yaounde: ~4.0° N, 9.7° E
  if (lat >= 1.6 && lat <= 13.1 && lng >= 8.4 && lng <= 16.2) {
    return { countryCode: "CM", currency: "XAF" };
  }
  // Republic of the Congo (Brazzaville): ~-4.2° S, 15.2° E
  if (lat >= -5.0 && lat <= 3.7 && lng >= 11.1 && lng <= 18.6) {
    return { countryCode: "CG", currency: "XAF" };
  }
  // DR Congo (Kinshasa): ~-4.4° S, 15.3° E
  if (lat >= -13.5 && lat <= 5.4 && lng >= 12.2 && lng <= 31.3) {
    return { countryCode: "CD", currency: "CDF" };
  }
  // Benin / Cotonou: ~6.3° N, 2.4° E
  if (lat >= 6.2 && lat <= 12.4 && lng >= 0.7 && lng <= 3.8) {
    return { countryCode: "BJ", currency: "XOF" };
  }
  // Guinea / Conakry: ~9.6° N, -13.6° W
  if (lat >= 7.1 && lat <= 12.7 && lng >= -15.1 && lng <= -7.8) {
    return { countryCode: "GN", currency: "GNF" };
  }
  // Rwanda / Kigali: ~-1.9° S, 30.0° E
  if (lat >= -2.9 && lat <= -1.0 && lng >= 28.8 && lng <= 30.9) {
    return { countryCode: "RW", currency: "RWF" };
  }
  // France / Europe: ~42° to 51° N, -5° to 10° E
  if (lat >= 41.3 && lat <= 51.1 && lng >= -5.2 && lng <= 9.6) {
    return { countryCode: "FR", currency: "EUR" };
  }
  // USA: ~24° to 50° N, -125° to -66° W
  if (lat >= 24.0 && lat <= 50.0 && lng >= -125.0 && lng <= -66.0) {
    return { countryCode: "US", currency: "USD" };
  }

  // Fallback check based on user's timezone if available
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  if (tz.includes("Dakar")) return { countryCode: "SN", currency: "XOF" };
  if (tz.includes("Abidjan")) return { countryCode: "CI", currency: "XOF" };
  if (tz.includes("Douala") || tz.includes("Lagos") || tz.includes("Yaounde")) return { countryCode: "CM", currency: "XAF" };
  if (tz.includes("Kinshasa") || tz.includes("Lubumbashi")) return { countryCode: "CD", currency: "CDF" };
  if (tz.includes("Brazzaville")) return { countryCode: "CG", currency: "XAF" };
  if (tz.includes("Kigali")) return { countryCode: "RW", currency: "RWF" };
  if (tz.includes("Paris") || tz.includes("Brussels")) return { countryCode: "FR", currency: "EUR" };

  return { countryCode: "SN", currency: "XOF" };
}

/**
 * Requests device GPS location and updates local currency & country context
 */
export async function requestUserLocation(): Promise<UserLocationResult | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    console.warn("Geolocation not supported by this browser");
    return null;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detected = approximateCountryFromCoordinates(latitude, longitude);
        const countryInfo = SUPPORTED_COUNTRIES.find((c) => c.code === detected.countryCode) || SUPPORTED_COUNTRIES[0];

        setStoredCountry(countryInfo.code);
        setStoredCurrency(countryInfo.currencyCode);

        window.dispatchEvent(
          new CustomEvent("mansa_country_changed", {
            detail: { countryCode: countryInfo.code, currency: countryInfo.currencyCode },
          })
        );

        resolve({
          latitude,
          longitude,
          countryCode: countryInfo.code,
          countryName: countryInfo.nameFr || countryInfo.nameEn,
          currencyCode: countryInfo.currencyCode,
        });
      },
      (error) => {
        console.warn("Geolocation permission denied or timed out:", error.message);
        // Fallback to timezone heuristic
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        let code = "SN";
        let cur: CurrencyCode = "XOF";
        if (tz.includes("Douala") || tz.includes("Brazzaville")) {
          code = "CM";
          cur = "XAF";
        } else if (tz.includes("Kinshasa")) {
          code = "CD";
          cur = "CDF";
        } else if (tz.includes("Paris")) {
          code = "FR";
          cur = "EUR";
        }
        const countryInfo = SUPPORTED_COUNTRIES.find((c) => c.code === code) || SUPPORTED_COUNTRIES[0];
        resolve({
          latitude: 14.6928,
          longitude: -17.4467,
          countryCode: countryInfo.code,
          countryName: countryInfo.nameFr || countryInfo.nameEn,
          currencyCode: cur,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      }
    );
  });
}
