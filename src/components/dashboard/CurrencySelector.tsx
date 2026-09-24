import React, { useState, useRef, useEffect } from "react";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  SUPPORTED_COUNTRIES,
  SupportedCountry,
  searchCountriesAndCurrencies,
  setStoredCurrency,
  getStoredCountry,
  setStoredCountry,
} from "../../utils/currency";
import { ChevronDown, Check, Globe, Search, Sparkles, MapPin, Loader2 } from "lucide-react";
import { CountryFlag } from "../common/CountryFlag";
import { requestUserLocation } from "../../utils/geolocation";

interface CurrencySelectorProps {
  currentCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
  lang?: "fr" | "en";
  variant?: "header" | "pill" | "inline";
  showRatePreview?: boolean;
}

// Key African countries highlighted for quick 1-click access
const QUICK_COUNTRIES = ["SN", "CG", "CD", "CI", "CM", "BJ", "RW"];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  currentCurrency,
  onSelectCurrency,
  lang = "fr",
  variant = "header",
  showRatePreview = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [activeCountryCode, setActiveCountryCode] = useState<string>(() => getStoredCountry());
  const [isLocating, setIsLocating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleAutoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const loc = await requestUserLocation();
      if (loc) {
        setActiveCountryCode(loc.countryCode);
        onSelectCurrency(loc.currencyCode);
      }
    } finally {
      setIsLocating(false);
    }
  };

  const activeConfig = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;

  // Listen to country / currency changes from other components
  useEffect(() => {
    const handleCountryChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ countryCode: string }>;
      if (customEvent.detail?.countryCode) {
        setActiveCountryCode(customEvent.detail.countryCode);
      }
    };
    window.addEventListener("mansa_country_changed", handleCountryChange);
    return () => window.removeEventListener("mansa_country_changed", handleCountryChange);
  }, []);

  const filteredCountryItems = searchCountriesAndCurrencies(searchFilter, lang === "en" ? "en" : "fr");

  const handleSelectCountry = (country: SupportedCountry) => {
    setStoredCurrency(country.currencyCode);
    setStoredCountry(country.code);
    setActiveCountryCode(country.code);
    onSelectCurrency(country.currencyCode);
    setIsOpen(false);
    setSearchFilter("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine current display flag: prefer chosen country flag, else fallback to currency's default
  const displayCountryCode = activeCountryCode || activeConfig.countryCode || "SN";

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger Button based on variant */}
      {variant === "header" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shrink-0 min-h-[36px] ${
            isOpen
              ? "border-[#00D26A] bg-[#00D26A]/10 text-[#00D26A]"
              : "border-white/10 bg-[#121318] text-zinc-200 hover:border-white/20 hover:bg-[#181a22]"
          }`}
          title="Changer votre pays ou devise d'affichage"
        >
          <CountryFlag countryCode={displayCountryCode} className="w-4 h-3 rounded-[2px] object-cover shrink-0 shadow-xs" />
          <span className="font-mono font-bold text-xs">{activeConfig.code}</span>
          <span className="hidden md:inline text-[10px] text-zinc-400 font-normal">({activeConfig.symbol})</span>
          <ChevronDown className={`size-3 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {variant === "pill" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer shrink-0 ${
            isOpen
              ? "border-[#00D26A] bg-[#00D26A]/10 text-[#00D26A]"
              : "border-white/10 bg-[#121318] text-zinc-200 hover:bg-[#181a22] hover:border-white/20"
          }`}
        >
          <CountryFlag countryCode={displayCountryCode} className="w-4 h-3 rounded-[2px] object-cover shrink-0 shadow-xs" />
          <span className="font-mono font-bold text-white">{activeConfig.code}</span>
          <span className="hidden xs:inline text-zinc-400 font-mono text-[11px]">· {activeConfig.symbol}</span>
          <ChevronDown className={`size-3 text-zinc-400 ml-0.5 sm:ml-1 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {variant === "inline" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
        >
          <CountryFlag countryCode={displayCountryCode} className="w-4 h-3 rounded-[2px] object-cover shrink-0 shadow-xs" />
          <span className="font-mono font-bold text-white">{activeConfig.code}</span>
          <ChevronDown className={`size-3 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#121318] p-3.5 shadow-2xl z-50 space-y-3 animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Globe className="size-3.5 text-[#00D26A]" />
              <span>Pays & Devise de paiement</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 flex items-center gap-1">
              <Sparkles className="size-2.5 text-[#00D26A]" />
              Taux en direct
            </span>
          </div>

          {/* Search bar with clear explanation */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Écrivez votre pays (Sénégal, Congo, Bénin...) ou devise..."
              className="w-full rounded-xl border border-white/10 bg-[#1a1c24] pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00D26A] transition-all"
              autoFocus
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-2 text-[10px] text-zinc-400 hover:text-white px-1 py-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* Bouton de détection automatique de localisation */}
          <button
            type="button"
            onClick={handleAutoDetectLocation}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-[#00D26A]/15 hover:border-[#00D26A]/40 text-xs font-semibold text-zinc-300 hover:text-[#00D26A] transition-all cursor-pointer"
          >
            {isLocating ? (
              <>
                <Loader2 className="size-3.5 animate-spin text-[#00D26A]" />
                <span>Détection de votre pays en cours...</span>
              </>
            ) : (
              <>
                <MapPin className="size-3.5 text-[#00D26A]" />
                <span>Détecter automatiquement mon pays & devise</span>
              </>
            )}
          </button>

          {/* Quick country shortcuts (Sénégal, Congo, RD Congo, Côte d'Ivoire, Cameroun, Bénin, Rwanda) */}
          {!searchFilter && (
            <div className="space-y-1.5">
              <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                Accès rapide par pays :
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SUPPORTED_COUNTRIES.filter((c) => QUICK_COUNTRIES.includes(c.code)).map((qc) => {
                  const isCurrent = activeCountryCode === qc.code && currentCurrency === qc.currencyCode;
                  return (
                    <button
                      key={qc.code}
                      type="button"
                      onClick={() => handleSelectCountry(qc)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#00D26A]/20 border-[#00D26A] text-white shadow-xs"
                          : "bg-white/[0.04] border-white/5 text-zinc-300 hover:bg-white/10 hover:border-white/15"
                      }`}
                    >
                      <CountryFlag countryCode={qc.code} className="w-3.5 h-2.5 rounded-[1px] object-cover shrink-0" />
                      <span>{qc.nameFr}</span>
                      <span className="text-[9px] font-mono text-zinc-400 font-bold">({qc.currencyCode})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Countries & Currencies List */}
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1 pb-1">
              {searchFilter
                ? `Résultats pour "${searchFilter}" :`
                : "Tous les pays & devises :"}
            </div>

            {filteredCountryItems.map((country) => {
              const isSelected = country.currencyCode === currentCurrency && activeCountryCode === country.code;
              const currConfig = SUPPORTED_CURRENCIES[country.currencyCode] || SUPPORTED_CURRENCIES.USD;

              return (
                <button
                  key={`${country.code}-${country.currencyCode}`}
                  type="button"
                  onClick={() => handleSelectCountry(country)}
                  className={`w-full flex items-center justify-between p-2 sm:p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#00D26A]/15 border border-[#00D26A]/40 text-white"
                      : "hover:bg-white/5 border border-transparent text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CountryFlag countryCode={country.code} className="w-5 h-3.5 rounded-[2px] object-cover shrink-0 shadow-xs" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-white">
                          {country.nameFr}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-[#00D26A] bg-[#00D26A]/10 px-1.5 py-0.2 rounded border border-[#00D26A]/20">
                          {country.currencyCode} ({country.symbol})
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 truncate">
                        {country.currencyNameFr}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {currConfig.code !== "USD" && (
                      <span className="text-[10px] font-mono text-zinc-400">
                        1$ = {currConfig.rateToUSD >= 100 ? Math.round(currConfig.rateToUSD).toLocaleString("fr-FR") : currConfig.rateToUSD.toFixed(2)} {country.symbol}
                      </span>
                    )}
                    {isSelected && (
                      <div className="flex size-4 items-center justify-center rounded-full bg-[#00D26A] text-black shrink-0">
                        <Check className="size-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

            {filteredCountryItems.length === 0 && (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs text-zinc-400 font-medium">
                  Aucun pays ou devise trouvé pour cette recherche
                </p>
                <p className="text-[11px] text-zinc-500">
                  Essayez d'écrire Sénégal, Congo, RDC, Bénin, Cameroun ou Rwanda
                </p>
              </div>
            )}
          </div>

          {/* Quick Notice Footer */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
            <span>Afrique & International</span>
            <span className="text-[#00D26A] font-semibold">Taux instantanés</span>
          </div>
        </div>
      )}
    </div>
  );
};
