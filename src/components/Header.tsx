import React from "react";
import { Globe, Layers } from "lucide-react";
import { AfhubLogo } from "./AfhubLogo";
import { CurrencyCode } from "../utils/currency";
import { CurrencySelector } from "./dashboard/CurrencySelector";

interface HeaderProps {
  onOpenStudio?: () => void;
  onOpenMarketplace: () => void;
  onOpenDocs: () => void;
  onOpenLogin: () => void;
  onOpenDemo?: () => void;
  lang: "fr" | "en";
  setLang: (lang: "fr" | "en") => void;
  currency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenStudio,
  onOpenMarketplace,
  onOpenDocs,
  onOpenLogin,
  onOpenDemo,
  lang,
  setLang,
  currency = "USD",
  onCurrencyChange,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#000000]/90 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between px-4 sm:px-8 gap-4">
        
        {/* afhub Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <a
            href="#home"
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            aria-label="afhub Accueil"
          >
            <AfhubLogo size="md" textColor="text-white" />
          </a>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-zinc-400">
          <button
            onClick={onOpenMarketplace}
            className="hover:text-white transition-colors cursor-pointer font-medium"
          >
            Explorer la marketplace
          </button>
          <a
            href="#categories"
            className="hover:text-white transition-colors"
          >
            Catégories
          </a>
          <a
            href="#faq"
            className="hover:text-white transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Right side Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Global Currency Selector with CountryFlag */}
          {onCurrencyChange && (
            <div>
              <CurrencySelector
                currentCurrency={currency}
                onSelectCurrency={onCurrencyChange}
                lang="fr"
                variant="header"
              />
            </div>
          )}

          {/* Language Indicator */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-white/10 bg-[#121318] text-zinc-300 min-h-[36px]"
            title="Langue : Français"
          >
            <Globe className="size-3.5 text-emerald-400" />
            <span className="font-bold text-white">FR</span>
          </div>

          {/* Quick Demo Exploration Button */}
          {onOpenDemo && (
            <button
              onClick={onOpenDemo}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer hidden sm:flex items-center gap-1.5 min-h-[36px]"
              title="Tester immédiatement l'application en mode Démo"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Mode Démo</span>
            </button>
          )}

          {/* Sign In */}
          <button
            onClick={onOpenLogin}
            className="text-xs sm:text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer px-2 sm:px-3 py-1.5"
          >
            Connexion
          </button>

          {/* CTA: Start Selling / Launch Product */}
          {onOpenStudio && (
            <button
              onClick={() => onOpenStudio()}
              className="mansa-btn-green px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-black rounded-xl cursor-pointer shadow-sm min-h-[36px] flex items-center gap-1.5"
            >
              <span>Créer ma boutique</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
