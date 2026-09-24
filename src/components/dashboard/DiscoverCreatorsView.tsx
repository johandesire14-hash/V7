import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Star,
  Users,
  CheckCircle2,
  ArrowRight,
  Filter,
  Building2,
  Lock,
  ExternalLink,
  ChevronRight,
  Layers,
  ShoppingBag,
} from "lucide-react";
import { EnterpriseSubscription, CreatorPlatformOffer } from "../../types";
import { PLATFORM_OFFERS_CATALOG } from "../../utils/rightsAccessEngine";

export const PLATFORM_CREATOR_OFFERS: CreatorPlatformOffer[] = PLATFORM_OFFERS_CATALOG;

export interface CreatorEnterpriseCard {
  id: string;
  companyId: string;
  companyName: string;
  creatorName: string;
  companyLogo?: string;
  companyInitials: string;
  bannerUrl: string;
  description: string;
  rating: number;
  reviewsCount: number;
  subscribersCount: string;
  membersNumber: number;
  category: string;
  categoryLabel: string;
  accentColor?: string;
  isVerified?: boolean;
  offersCount: number;
  startingPrice: string;
  defaultOfferTitle: string;
}

export const DISCOVER_CREATOR_ENTERPRISES: CreatorEnterpriseCard[] = [
  {
    id: "comp-money-life",
    companyId: "comp-money-life",
    companyName: "Money Life",
    creatorName: "Ousmane Diallo",
    companyLogo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80",
    companyInitials: "ML",
    bannerUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
    description:
      "Réseau officiel d'apprentissage et d'entraide sur les marchés financiers. Analyses techniques quotidiennes, signaux de scalping XAUUSD et club privé d'investisseurs africains.",
    rating: 4.95,
    reviewsCount: 420,
    subscribersCount: "5 420 membres",
    membersNumber: 5420,
    category: "trading",
    categoryLabel: "Trading & Finance",
    isVerified: true,
    offersCount: 2,
    startingPrice: "0 € Gratuit",
    defaultOfferTitle: "Pass Adhésion & Signaux VIP",
  },
  {
    id: "comp-cadre-financier",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    creatorName: "Marc-Antoine R.",
    companyLogo: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=300&q=80",
    companyInitials: "CF",
    bannerUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    description:
      "La méthode de référence pour structurer son capital et négocier les marchés avec une précision institutionnelle. Accès aux canaux Telegram et au serveur exclusif Discord.",
    rating: 4.98,
    reviewsCount: 384,
    subscribersCount: "3 480 membres",
    membersNumber: 3480,
    category: "trading",
    categoryLabel: "Finance Institutionnelle",
    isVerified: true,
    offersCount: 2,
    startingPrice: "29 € / mois",
    defaultOfferTitle: "Financial Framework Pro",
  },
  {
    id: "comp-fce-africa",
    companyId: "comp-fce-africa",
    companyName: "Forex Elite Africa",
    creatorName: "Kofi Mensah",
    companyLogo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80",
    companyInitials: "FE",
    bannerUrl: "https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Communauté panafricaine dédiée au trading des devises majeures et de l'or. Alertes d'exécution rapide, points d'entrée précis et webinaires de coaching hebdomadaires.",
    rating: 4.90,
    reviewsCount: 215,
    subscribersCount: "2 150 membres",
    membersNumber: 2150,
    category: "trading",
    categoryLabel: "Forex & Scalping",
    isVerified: true,
    offersCount: 1,
    startingPrice: "15 000 FCFA / mois",
    defaultOfferTitle: "Signaux Gold & Forex VIP",
  },
  {
    id: "comp-devkreativ",
    companyId: "comp-devkreativ",
    companyName: "DevKreativ Lab SaaS",
    creatorName: "Sarah Benali",
    companyLogo: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
    companyInitials: "DK",
    bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
    description:
      "Outils d'automatisation pour marchands et créateurs africains. Synchronisation Wave, Orange Money et délivrance automatique d'accès Discord et Telegram.",
    rating: 4.88,
    reviewsCount: 196,
    subscribersCount: "4 200 membres",
    membersNumber: 4200,
    category: "software",
    categoryLabel: "SaaS & Code",
    isVerified: true,
    offersCount: 2,
    startingPrice: "19 000 FCFA / mois",
    defaultOfferTitle: "DevKreativ SDK & Bot Hub",
  },
  {
    id: "comp-ecommerce-mastery",
    companyId: "comp-ecommerce-mastery",
    companyName: "E-Commerce Mastery UEMOA",
    creatorName: "Mamadou Sow",
    companyLogo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    companyInitials: "EM",
    bannerUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    description:
      "Guide complet d'approvisionnement et logistique pour l'Afrique de l'Ouest. Accès à la base de +80 fournisseurs vérifiés en Chine et au groupe Telegram d'entraide.",
    rating: 4.98,
    reviewsCount: 428,
    subscribersCount: "8 900 membres",
    membersNumber: 8900,
    category: "ecommerce",
    categoryLabel: "E-Commerce & Import",
    isVerified: true,
    offersCount: 1,
    startingPrice: "45 000 FCFA (À vie)",
    defaultOfferTitle: "Académie Sourcing & Import",
  },
  {
    id: "comp-bs-syndicate",
    companyId: "comp-bs-syndicate",
    companyName: "BS Syndicate Crypto",
    creatorName: "Alexandre K.",
    companyLogo: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=300&q=80",
    companyInitials: "BS",
    bannerUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
    description:
      "Syndicat privé d'investisseurs crypto et DeFi. Veille sur les airdrops, analyse des protocoles émergents et alertes exclusives sur notre Discord officiel.",
    rating: 4.92,
    reviewsCount: 168,
    subscribersCount: "1 400 membres",
    membersNumber: 1400,
    category: "crypto",
    categoryLabel: "Crypto & Web3",
    isVerified: true,
    offersCount: 1,
    startingPrice: "49 € / mois",
    defaultOfferTitle: "Syndicate Pass VIP",
  },
];

interface DiscoverCreatorsViewProps {
  lang?: "fr" | "en";
  user: any;
  onNavigateToEnterprise?: (enterprise: CreatorEnterpriseCard | string) => void;
}

export const DiscoverCreatorsView: React.FC<DiscoverCreatorsViewProps> = ({
  lang = "fr",
  user,
  onNavigateToEnterprise,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Le mode compact est automatique sur les écrans étroits et complet sur desktop.
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleViewportChange = (event: MediaQueryListEvent) => setIsCompact(event.matches);

    setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  const categories = [
    { id: "all", label: "Toutes les entreprises" },
    { id: "trading", label: "Trading & Forex" },
    { id: "software", label: "Logiciels & SaaS" },
    { id: "ecommerce", label: "E-Commerce & Import" },
    { id: "crypto", label: "Crypto & Web3" },
  ];

  const filteredEnterprises = DISCOVER_CREATOR_ENTERPRISES.filter((ent) => {
    const matchesCat = selectedCategory === "all" || ent.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;
    const matchesSearch =
      ent.companyName.toLowerCase().includes(q) ||
      ent.creatorName.toLowerCase().includes(q) ||
      ent.description.toLowerCase().includes(q) ||
      ent.categoryLabel.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const showBanners = !isCompact;

  const handleEnterpriseClick = (ent: CreatorEnterpriseCard) => {
    if (onNavigateToEnterprise) {
      onNavigateToEnterprise(ent);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-white select-none animate-in fade-in duration-150">
      {/* Header Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#121316] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {lang === "fr" ? "Découvrir les Entreprises" : "Discover Enterprises"}
              </h1>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {lang === "fr"
                ? "Explorez les pages des créateurs de la plateforme. Cliquez sur une entreprise pour visiter son espace communauté, ses offres et son assistance."
                : "Explore creator enterprises. Click an enterprise to preview its community space and offers."}
            </p>
          </div>

        </div>

        {/* Search and Filters Bar */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="size-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par nom d'entreprise, créateur ou mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00D26A] transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-white text-black font-bold shadow-sm"
                    : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Creator Enterprises: 3 per row on screen as requested */}
      {filteredEnterprises.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#121316] p-10 text-center space-y-2">
          <Building2 className="size-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Aucune entreprise trouvée</h3>
          <p className="text-xs text-zinc-400">Essayez de modifier vos filtres ou termes de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredEnterprises.map((enterprise) => (
            <div
              key={enterprise.id}
              onClick={() => handleEnterpriseClick(enterprise)}
              className="group rounded-2xl border border-white/10 bg-[#12141c] hover:border-white/20 transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <div>
                {/* 1. BANNIÈRE (visible si showBanners est actif) */}
                {showBanners && (
                  <div className="relative h-24 sm:h-28 w-full overflow-hidden bg-zinc-900 shrink-0">
                    <img
                      src={enterprise.bannerUrl}
                      alt={enterprise.companyName}
                      className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12141c] via-transparent to-black/30" />
                  </div>
                )}

                {/* 2. HEADER: Photo de profil + Nom entreprise + Par : Nom créateur */}
                <div className={`p-4 ${showBanners ? "-mt-7" : "pt-4"} relative z-10 space-y-3`}>
                  <div className="flex items-start justify-between gap-3">
                    {/* Photo de profil (Enterprise Logo) */}
                    <div className="size-12 rounded-2xl bg-black border-2 border-[#12141c] shadow-md overflow-hidden shrink-0 flex items-center justify-center">
                      {enterprise.companyLogo ? (
                        <img
                          src={enterprise.companyLogo}
                          alt={enterprise.companyName}
                          className="size-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-black text-white">{enterprise.companyInitials}</span>
                      )}
                    </div>

                    {/* Stats: Étoiles & Membres */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                        <Star className="size-3 fill-amber-400" />
                        <span>{enterprise.rating.toFixed(1)}</span>
                        <span className="text-zinc-500 font-normal">({enterprise.reviewsCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                        <Users className="size-3 text-zinc-500" />
                        <span>{enterprise.subscribersCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Nom de l'entreprise & Par : Créateur */}
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white group-hover:text-[#00D26A] transition-colors truncate">
                        {enterprise.companyName}
                      </h3>
                    </div>

                    {/* Par : le nom du créateur (EXPLICIT USER REQUIREMENT) */}
                    <p className="text-[11px] font-medium text-emerald-400 truncate">
                      par : <span className="text-zinc-300 font-semibold">{enterprise.creatorName}</span>
                    </p>
                  </div>

                  {/* Description coupée avec … si trop longue (EXPLICIT USER REQUIREMENT) */}
                  <p
                    className="text-xs text-zinc-400 leading-relaxed line-clamp-2 text-ellipsis font-light"
                    title={enterprise.description}
                  >
                    {enterprise.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: CTA to visit Community page */}
              <div className="p-4 pt-2 border-t border-white/[0.06] flex items-center justify-between gap-2 mt-auto">
                <div className="text-[11px] text-zinc-500 font-mono">
                  <span>{enterprise.offersCount} offre{enterprise.offersCount > 1 ? "s" : ""}</span>
                  <span className="mx-1.5">•</span>
                  <span className="text-zinc-300 font-bold">{enterprise.startingPrice}</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#00D26A] transition-colors">
                  <span>Visiter</span>
                  <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
