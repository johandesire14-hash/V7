import React, { useState, useEffect } from "react";
import { MapPin, Check, X, Compass, Loader2 } from "lucide-react";
import { requestUserLocation, getStoredCountry, SUPPORTED_COUNTRIES } from "../../utils/geolocation";
import type { SupportedCountry } from "../../utils/geolocation";
import type { CurrencyCode } from "../../utils/currency";

interface ContextualLocationPromptProps {
  lang?: "fr" | "en";
  currentCurrency?: CurrencyCode;
  onLocationResolved?: (country: SupportedCountry) => void;
  className?: string;
  variant?: "banner" | "compact" | "button";
}

const STORAGE_KEY_DISMISSED = "mansa_location_prompt_dismissed";

export const ContextualLocationPrompt: React.FC<ContextualLocationPromptProps> = ({
  lang = "fr",
  currentCurrency,
  onLocationResolved,
  className = "",
  variant = "banner",
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<SupportedCountry | null>(null);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_DISMISSED) === "true";
  });
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const existingCode = getStoredCountry();
    if (existingCode) {
      const match = SUPPORTED_COUNTRIES.find((c) => c.code === existingCode);
      if (match) {
        setDetectedCountry(match);
      }
    }
  }, []);

  const handleRequestLocation = async () => {
    setIsLoading(true);
    setFeedbackMsg(null);
    try {
      const result = await requestUserLocation();
      if (result) {
        const countryObj = SUPPORTED_COUNTRIES.find((c) => c.code === result.countryCode) || {
          code: result.countryCode,
          nameFr: result.countryName,
          nameEn: result.countryName,
          currencyCode: result.currencyCode,
          currencyNameFr: result.currencyCode,
          currencyNameEn: result.currencyCode,
          symbol: result.currencyCode,
          flag: "📍",
          keywords: [],
        };
        setDetectedCountry(countryObj);
        if (onLocationResolved) {
          onLocationResolved(countryObj);
        }
        const countryName = countryObj.nameFr || countryObj.nameEn;
        setFeedbackMsg(
          lang === "fr"
            ? `Position calibrée : ${countryObj.flag} ${countryName} · Devise : ${countryObj.currencyCode}`
            : `Location calibrated: ${countryObj.flag} ${countryName} · Currency: ${countryObj.currencyCode}`
        );
      }
      setTimeout(() => {
        setIsDismissed(true);
        localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
      }, 3500);
    } catch (err) {
      setFeedbackMsg(
        lang === "fr"
          ? "Localisation configurée selon le fuseau horaire régional."
          : "Location fallback applied from timezone."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY_DISMISSED, "true");
  };

  // If already dismissed and no feedback, don't show the banner
  if (isDismissed && !feedbackMsg) {
    if (variant === "button") {
      return (
        <button
          onClick={handleRequestLocation}
          disabled={isLoading}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer ${className}`}
          title={lang === "fr" ? "Calibrer ma localisation" : "Calibrate location"}
        >
          {isLoading ? (
            <Loader2 className="size-3.5 text-emerald-400 animate-spin" />
          ) : (
            <MapPin className="size-3.5 text-emerald-400" />
          )}
          <span>
            {detectedCountry
              ? `${detectedCountry.flag} ${detectedCountry.currencyCode}`
              : lang === "fr"
              ? "Ma position"
              : "My location"}
          </span>
        </button>
      );
    }
    return null;
  }

  if (variant === "button") {
    return (
      <button
        onClick={handleRequestLocation}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold transition-all cursor-pointer ${className}`}
        title={lang === "fr" ? "Détecter ma position géographique" : "Detect user location"}
      >
        {isLoading ? (
          <Loader2 className="size-3.5 text-emerald-400 animate-spin" />
        ) : (
          <Compass className="size-3.5 text-emerald-400" />
        )}
        <span>
          {isLoading
            ? lang === "fr"
              ? "Localisation..."
              : "Locating..."
            : detectedCountry
            ? `${detectedCountry.flag} ${detectedCountry.nameFr || detectedCountry.nameEn}`
            : lang === "fr"
            ? "Détecter ma position"
            : "Detect location"}
        </span>
      </button>
    );
  }

  return (
    <div
      className={`rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#0e1713] to-[#0c0d10] p-4 text-white shadow-lg transition-all animate-in fade-in duration-200 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="size-9 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : detectedCountry ? (
              <span className="text-base">{detectedCountry.flag}</span>
            ) : (
              <MapPin className="size-4" />
            )}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>
                {lang === "fr" ? "Localisation & Moyens de paiement" : "Location & Payment Methods"}
              </span>
            </h4>
            <p className="text-xs text-zinc-300 mt-0.5 max-w-xl leading-relaxed">
              {feedbackMsg ? (
                <span className="text-emerald-300 font-semibold">{feedbackMsg}</span>
              ) : lang === "fr" ? (
                "Autorisez la localisation pour adapter automatiquement vos devises (FCFA, GNF, CDF, EUR, USD) et vos opérateurs Mobile Money (Wave, Orange, MTN, Moov)."
              ) : (
                "Enable location to automatically adapt local currencies and Mobile Money operators."
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {!feedbackMsg && (
            <>
              <button
                onClick={handleRequestLocation}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00D26A] hover:bg-[#00b85c] active:scale-95 text-black font-bold text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{lang === "fr" ? "Détection..." : "Locating..."}</span>
                  </>
                ) : (
                  <>
                    <Compass className="size-3.5" />
                    <span>{lang === "fr" ? "Activer la localisation" : "Enable location"}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={lang === "fr" ? "Ignorer" : "Dismiss"}
              >
                <X className="size-4" />
              </button>
            </>
          )}

          {feedbackMsg && (
            <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold px-2 py-1 bg-emerald-500/10 rounded-lg">
              <Check className="size-3.5" />
              <span>{lang === "fr" ? "Configuré" : "Configured"}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
