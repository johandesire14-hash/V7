import React from "react";
import { ArrowRight, Sparkles, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { CountryFlag } from "./common/CountryFlag";

interface HeroSectionProps {
  onOpenStudio: (category?: string) => void;
  lang: "fr" | "en";
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenStudio, lang }) => {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#090a0f] via-[#090a0f] to-[#0d0e15] px-6 sm:px-10 pt-16 pb-20 border-b border-white/[0.04]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1040px] flex-col items-center text-center">
        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.12] max-w-4xl">
          Vendez vos accès privés, formations & logiciels{" "}
          <span className="text-[#00D26A]">
            sans friction
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 max-w-2xl text-base sm:text-lg text-zinc-400 font-normal leading-relaxed">
          Créez votre page de vente en 2 minutes, automatisez vos invitations Telegram & Discord, et encaissez instantanément par Wave, Orange Money, MTN et Carte Bancaire.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md">
          <button
            onClick={() => onOpenStudio()}
            className="mansa-btn-green w-full sm:w-auto px-8 py-3.5 text-sm sm:text-base cursor-pointer font-bold flex items-center justify-center gap-2"
          >
            <span>Lancer ma boutique gratuitement</span>
            <ArrowRight className="size-4" />
          </button>

          <a
            href="#marketplace"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-white/10 bg-[#121318] hover:bg-white/5 text-white text-sm font-semibold transition-all text-center"
          >
            Explorer la marketplace
          </a>
        </div>

        {/* Real Flags & Supported Payment Methods Strip */}
        <div className="mt-12 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#12131a] p-4 sm:p-5">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Paiements locaux & internationaux acceptés
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CountryFlag countryCode="CI" className="w-5 h-3.5 rounded-[2px] object-cover" />
              <span>Wave & Orange <strong>CI</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CountryFlag countryCode="SN" className="w-5 h-3.5 rounded-[2px] object-cover" />
              <span>Wave & Orange <strong>SN</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CountryFlag countryCode="CM" className="w-5 h-3.5 rounded-[2px] object-cover" />
              <span>MTN MoMo <strong>CM</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CountryFlag countryCode="BJ" className="w-5 h-3.5 rounded-[2px] object-cover" />
              <span>Moov & MTN <strong>BJ</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CountryFlag countryCode="FR" className="w-5 h-3.5 rounded-[2px] object-cover" />
              <span>CB, Visa, Apple Pay</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
              <CountryFlag countryCode="US" className="w-5 h-3.5 rounded-[2px] object-cover" />
              <span>International</span>
            </div>
          </div>
        </div>

        {/* Clean stats row */}
        <div className="mt-8 w-full max-w-2xl grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-sans">100%</div>
            <div className="text-xs text-zinc-400 mt-0.5">Accès automatisés</div>
          </div>

          <div className="text-center border-x border-white/10">
            <div className="text-xl sm:text-2xl font-extrabold text-[#00D26A] font-sans">Mobile Money</div>
            <div className="text-xs text-zinc-400 mt-0.5">Wave, Orange, MTN & CB</div>
          </div>

          <div className="text-center">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-sans">0 € / mois</div>
            <div className="text-xs text-zinc-400 mt-0.5">Aucun abonnement fixe</div>
          </div>
        </div>

      </div>
    </section>
  );
};

