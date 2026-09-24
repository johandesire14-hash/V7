import React from "react";
import { ArrowRight, Send, Disc as DiscordIcon, BookOpen, PackageCheck, Code2, Sparkles } from "lucide-react";
import { CategoryCardItem } from "../types";

interface BuildNextCarouselProps {
  onSelectCategory: (cat: CategoryCardItem) => void;
  onOpenStudio: (category?: string) => void;
  lang: "fr" | "en";
}

const CATEGORIES_DATA: CategoryCardItem[] = [
  {
    id: "community",
    categoryKey: "community",
    title: "Canaux Telegram & Discord Privés",
    subtitle: "Abonnements VIP avec invitation automatique générée en direct après paiement.",
    samplePrompt: "Canal Telegram VIP avec bot d'accès automatique",
    icon: Send,
    colorGradient: "from-[#229ED9]/10 to-transparent",
  },
  {
    id: "courses",
    categoryKey: "courses",
    title: "Formations & E-books",
    subtitle: "Vendez vos guides, vidéos et programmes avec accès direct et sécurisé.",
    samplePrompt: "Formation vidéo et masterclass privée",
    icon: BookOpen,
    colorGradient: "from-emerald-500/10 to-transparent",
  },
  {
    id: "digital",
    categoryKey: "digital",
    title: "Fichiers & Templates",
    subtitle: "Templates Notion, presets, tableurs, codes sources et ressources prêtes à l'emploi.",
    samplePrompt: "Templates Notion & Design",
    icon: PackageCheck,
    colorGradient: "from-[#00D26A]/10 to-transparent",
  },
  {
    id: "software",
    categoryKey: "software",
    title: "SaaS & Logiciels",
    subtitle: "Licences logicielles, robots de trading et scripts avec gestion de clés.",
    samplePrompt: "Logiciel ou script avec clé d'activation",
    icon: Code2,
    colorGradient: "from-indigo-500/10 to-transparent",
  },
];

export const BuildNextCarousel: React.FC<BuildNextCarouselProps> = ({
  onSelectCategory,
  onOpenStudio,
  lang,
}) => {
  return (
    <section id="categories" className="w-full bg-[#0c0d12] py-16 border-t border-white/[0.04]">
      <div className="mx-auto max-w-[1100px] px-6 sm:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Que souhaitez-vous vendre ?
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Sélectionnez un type de produit pour configurer votre offre en 2 minutes.
            </p>
          </div>

          <button
            onClick={() => onOpenStudio()}
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span>Créer sur mesure</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* 4 Clean Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES_DATA.map((cat) => {
            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.06] bg-[#12141a]/80 p-5 transition-all duration-200 hover:border-emerald-500/40 hover:bg-[#161822] cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-white/[0.04] text-white border border-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                      <Icon className="size-5" />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {cat.title}
                  </h3>

                  <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-semibold text-zinc-500 group-hover:text-white transition-colors">
                  <span>Lancer ce modèle</span>
                  <ArrowRight className="size-3 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

