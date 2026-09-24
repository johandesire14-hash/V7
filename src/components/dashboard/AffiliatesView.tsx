import React, { useState } from "react";
import {
  Search,
  Plus,
  Check,
  Copy,
  ChevronLeft,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Users,
  Trophy,
  Wallet,
  ExternalLink,
  MessageCircle,
  Send,
  CheckCircle2,
  X,
  Sparkles,
  Share2,
  Instagram,
  Video,
  Smartphone,
  QrCode,
} from "lucide-react";
import { ModalOverlay } from "../common/ModalOverlay";

import {
  CurrencyCode,
  formatCurrency,
  convertFromUSD,
} from "../../utils/currency";

export interface AffiliateCompany {
  id: string;
  name: string;
  handle: string;
  logo: string;
  industry: string;
  commissionRate: string; // e.g. "50%" or "-"
  affiliateEarnings: string; // e.g. "$500k+"
  conversions: string; // e.g. "10 000+"
  earningsPerClick: string; // e.g. "1,70 $US"
  conversionRate: string; // e.g. "4.14%"
  isJoined?: boolean;
  affiliateUrl?: string;
  description?: string;
}

const MARKETPLACE_DATA: AffiliateCompany[] = [];

interface AffiliatesViewProps {
  lang?: "fr" | "en";
  userRefName?: string;
  isPersonalWorkspace?: boolean;
  currency?: CurrencyCode | string;
}

export const AffiliatesView: React.FC<AffiliatesViewProps> = ({
  lang = "fr",
  userRefName = "johan",
  currency = "USD",
}) => {
  const activeCurrency = (currency as CurrencyCode) || "USD";
  // Tabs: "dashboard" (Tableau de bord) vs "refer_buyers" (Parrainer des acheteurs)
  const [topTab, setTopTab] = useState<"dashboard" | "refer_buyers">("refer_buyers");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);

  // Companies state
  const [companies, setCompanies] = useState<AffiliateCompany[]>(MARKETPLACE_DATA);

  // Active joined list for dashboard
  const [joinedAffiliates, setJoinedAffiliates] = useState<AffiliateCompany[]>([]);

  // Social share modal
  const [socialModalItem, setSocialModalItem] = useState<AffiliateCompany | null>(null);
  const [socialCopyFeedback, setSocialCopyFeedback] = useState<string | null>(null);

  // Modal feedback for newly joined affiliate
  const [activeSuccessModal, setActiveSuccessModal] = useState<AffiliateCompany | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Withdrawal modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState<"wave" | "orange" | "mtn" | "crypto">("wave");
  const [withdrawPhone, setWithdrawPhone] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const industriesList = Array.from(new Set(MARKETPLACE_DATA.map((c) => c.industry)));

  const handleCopy = (url: string) => {
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSocialCopy = (text: string, type: string) => {
    navigator.clipboard?.writeText?.(text);
    setSocialCopyFeedback(type);
    setTimeout(() => setSocialCopyFeedback(null), 2500);
  };

  const handleJoinAffiliate = (company: AffiliateCompany) => {
    const customUrl = `https://mansa.app/${company.handle}?a=${userRefName.toLowerCase()}`;
    const updatedCompany = { ...company, isJoined: true, affiliateUrl: customUrl };

    setCompanies((prev) =>
      prev.map((c) => (c.id === company.id ? updatedCompany : c))
    );

    if (!joinedAffiliates.some((j) => j.id === company.id)) {
      setJoinedAffiliates((prev) => [updatedCompany, ...prev]);
    }

    setActiveSuccessModal(updatedCompany);
  };

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesIndustry =
      selectedIndustry === "all" || c.industry === selectedIndustry;

    return matchesSearch && matchesIndustry;
  });

  return (
    <div className="min-h-screen text-white pb-16">
      
      {/* 1. TOP HEADER (Layout Mansa) */}
      <div className="border-b border-white/[0.08] pb-0">
        <h1 className="text-xl font-bold tracking-tight text-white px-1">
          Affiliés
        </h1>

        {/* Tab Navigation: Tableau de bord | Parrainer des acheteurs */}
        <div className="flex items-center gap-6 mt-4 text-xs font-semibold px-1">
          <button
            onClick={() => setTopTab("dashboard")}
            className={`pb-3 transition-colors relative cursor-pointer ${
              topTab === "dashboard"
                ? "text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Tableau de bord
            {topTab === "dashboard" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>

          <button
            onClick={() => setTopTab("refer_buyers")}
            className={`pb-3 transition-colors relative cursor-pointer ${
              topTab === "refer_buyers"
                ? "text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Parrainer des acheteurs
            {topTab === "refer_buyers" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* 2. TAB: PARRAINER DES ACHETEURS (MARCHÉ DES AFFILIÉS) */}
      {topTab === "refer_buyers" && (
        <div className="mt-5 space-y-4">
          
          {/* Breadcrumb / Subheader */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTopTab("dashboard")}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>Retour</span>
              </button>
              <h2 className="text-base font-bold text-white">
                Marché des affiliés
              </h2>

              {/* Type d'industrie filter button */}
              <div className="relative">
                <button
                  onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#16181f] px-2.5 py-1 text-[11px] font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                >
                  <Plus className="size-3 text-zinc-400" />
                  <span>
                    {selectedIndustry === "all" ? "Type d'industrie" : selectedIndustry}
                  </span>
                  <ChevronDown className="size-3 text-zinc-400 ml-0.5" />
                </button>

                {/* Dropdown Menu */}
                {isIndustryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-white/10 bg-[#16181f] p-1.5 shadow-2xl z-30 space-y-0.5">
                    <button
                      onClick={() => {
                        setSelectedIndustry("all");
                        setIsIndustryDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                        selectedIndustry === "all" ? "bg-white/10 text-white font-bold" : "text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      Toutes les industries
                    </button>
                    {industriesList.map((ind) => (
                      <button
                        key={ind}
                        onClick={() => {
                          setSelectedIndustry(ind);
                          setIsIndustryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer truncate ${
                          selectedIndustry === ind ? "bg-white/10 text-white font-bold" : "text-zinc-300 hover:bg-white/5"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search Input on the right */}
            <div className="relative w-full sm:w-64">
              <Search className="size-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher"
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#141518] border border-white/10 text-white placeholder-zinc-500 outline-none focus:border-white/30 transition-colors"
              />
            </div>
          </div>

          {/* TABLE OF AFFILIATES (Design Mansa) */}
          <div className="overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0c0d0e]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] text-[11px] font-medium text-zinc-400 bg-[#121316]/50">
                  <th className="py-3 px-4 font-normal">Entreprise</th>
                  <th className="py-3 px-4 font-normal">Type d'industrie</th>
                  <th className="py-3 px-4 font-normal">Taux de commission</th>
                  <th className="py-3 px-4 font-normal">Gains d'affiliés</th>
                  <th className="py-3 px-4 font-normal">Conversions</th>
                  <th className="py-3 px-4 font-normal">Gains par clic</th>
                  <th className="py-3 px-4 font-normal">Taux de conversion</th>
                  <th className="py-3 px-4 font-normal text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 px-4 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-zinc-500">
                        <Users className="size-8 text-zinc-600" />
                        <p className="text-xs font-medium text-zinc-300">
                          {lang === "fr" ? "Aucun programme d'affiliation disponible" : "No affiliate programs available"}
                        </p>
                        <p className="text-[11px] text-zinc-500 max-w-sm">
                          {lang === "fr"
                            ? "Les créateurs et entreprises partenaires apparaîtront ici lorsqu'ils ouvriront leurs programmes d'affiliation."
                            : "Partner companies and creators will appear here when their programs become available."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((comp) => (
                  <tr
                    key={comp.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Entreprise (Logo + Name) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={comp.logo}
                          alt={comp.name}
                          className="size-7 rounded-lg object-cover bg-zinc-800 border border-white/10"
                        />
                        <span className="font-semibold text-white text-xs whitespace-nowrap">
                          {comp.name}
                        </span>
                      </div>
                    </td>

                    {/* Type d'industrie */}
                    <td className="py-3.5 px-4 text-zinc-300 whitespace-nowrap">
                      {comp.industry}
                    </td>

                    {/* Taux de commission */}
                    <td className="py-3.5 px-4 font-medium text-zinc-200">
                      {comp.commissionRate}
                    </td>

                    {/* Gains d'affiliés */}
                    <td className="py-3.5 px-4 font-medium text-zinc-200 font-mono">
                      {comp.affiliateEarnings}
                    </td>

                    {/* Conversions */}
                    <td className="py-3.5 px-4 font-medium text-zinc-200 font-mono">
                      {comp.conversions}
                    </td>

                    {/* Gains par clic */}
                    <td className="py-3.5 px-4 font-medium text-zinc-200 font-mono">
                      {comp.earningsPerClick}
                    </td>

                    {/* Taux de conversion */}
                    <td className="py-3.5 px-4 font-medium text-zinc-200 font-mono">
                      {comp.conversionRate}
                    </td>

                    {/* Action Button: Devenir affilié / Copier & Partager */}
                    <td className="py-3.5 px-4 text-right">
                      {comp.isJoined ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSocialModalItem(comp)}
                            className="p-1.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 cursor-pointer transition-colors"
                            title="Partager sur Instagram & TikTok"
                          >
                            <Instagram className="size-3.5" />
                          </button>

                          <button
                            onClick={() => handleCopy(comp.affiliateUrl || `https://mansa.app/${comp.handle}?a=${userRefName}`)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors cursor-pointer whitespace-nowrap inline-flex items-center gap-1.5"
                          >
                            {copiedLink === (comp.affiliateUrl || `https://mansa.app/${comp.handle}?a=${userRefName}`) ? (
                              <>
                                <Check className="size-3 text-emerald-400" />
                                <span className="text-emerald-400">Lien copié</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3 text-zinc-300" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleJoinAffiliate(comp)}
                          className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Devenir affilié
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* 3. TAB: TABLEAU DE BORD (DASHBOARD AFFILIÉ) */}
      {topTab === "dashboard" && (
        <div className="mt-6 space-y-6">
          
          {/* Metric cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1">
              <span className="text-zinc-400 text-xs">Commissions Disponibles</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(0, activeCurrency)}
              </div>
              <div className="text-[10px] text-zinc-500 font-mono">
                {activeCurrency !== "USD"
                  ? `${convertFromUSD(0, "USD").toFixed(2)} $US`
                  : `${convertFromUSD(0, "XOF")} FCFA`}
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1">
              <span className="text-zinc-400 text-xs">Total Ventes Apportées</span>
              <div className="text-2xl font-bold font-mono text-white">
                0
              </div>
              <div className="text-[10px] text-zinc-500">Clients convertis</div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1">
              <span className="text-zinc-400 text-xs">Clics Totaux</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                0
              </div>
              <div className="text-[10px] text-zinc-500">Taux conv. 0.0%</div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1 flex flex-col justify-between">
              <div>
                <span className="text-zinc-400 text-xs">Programmes Rejoints</span>
                <div className="text-2xl font-bold font-mono text-white">
                  {joinedAffiliates.length}
                </div>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                disabled={joinedAffiliates.length === 0}
                className="w-full py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Wallet className="size-3.5" />
                <span>Retirer mon solde</span>
              </button>
            </div>
          </div>

          {/* Active affiliate links table */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-white">Vos Liens de Parrainage Actifs</h3>
                <p className="text-xs text-zinc-400">
                  Partagez directement sur Instagram, TikTok, WhatsApp ou Telegram pour toucher vos commissions.
                </p>
              </div>
              <button
                onClick={() => setTopTab("refer_buyers")}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Parcourir plus d'entreprises</span>
              </button>
            </div>

            {joinedAffiliates.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                  <Share2 className="size-6 text-zinc-500" />
                </div>
                <p className="text-sm font-semibold text-zinc-300">
                  {lang === "fr" ? "Aucun programme d'affiliation actif" : "No active affiliate program"}
                </p>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  {lang === "fr"
                    ? "Rejoignez un programme partenaire dans le catalogue pour obtenir vos liens traqués et commencer à générer des revenus passifs."
                    : "Join a partner company in the catalog to get tracked referral links and start earning commissions."}
                </p>
                <button
                  onClick={() => setTopTab("refer_buyers")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer mt-2"
                >
                  <Plus className="size-4" />
                  <span>{lang === "fr" ? "Parcourir le catalogue d'affiliation" : "Browse affiliate catalog"}</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {joinedAffiliates.map((item) => {
                  const url = item.affiliateUrl || `https://mansa.app/${item.handle}?a=${userRefName}`;
                  return (
                    <div key={item.id} className="py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img src={item.logo} alt={item.name} className="size-9 rounded-xl object-cover border border-white/10 bg-zinc-800" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{item.name}</span>
                            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
                              {item.industry}
                            </span>
                            <span className="rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold px-1.5 py-0.5">
                              {item.commissionRate} com.
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-zinc-500">{url}</span>
                        </div>
                      </div>

                      {/* Social quick share action bar */}
                      <div className="flex items-center gap-2 flex-wrap self-end lg:self-auto">
                        {/* Instagram & TikTok Share Button */}
                        <button
                          onClick={() => setSocialModalItem(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/30 cursor-pointer shadow-sm"
                          title="Partager sur Instagram & TikTok"
                        >
                          <Instagram className="size-3.5 text-emerald-400" />
                          <span className="text-[11px]">Insta / TikTok</span>
                        </button>

                        {/* WhatsApp */}
                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`🔥 Découvre ${item.name} : ${url}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
                          title="Partager sur WhatsApp"
                        >
                          <MessageCircle className="size-3.5" />
                        </a>

                        {/* Telegram */}
                        <a
                          href={`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`🔥 Découvre ${item.name}`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg bg-[#229ED9]/20 text-[#229ED9] hover:bg-[#229ED9] hover:text-white transition-colors"
                          title="Partager sur Telegram"
                        >
                          <Send className="size-3.5" />
                        </a>

                        {/* Copy link */}
                        <button
                          onClick={() => handleCopy(url)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          {copiedLink === url ? (
                            <>
                              <Check className="size-3 text-white" />
                              <span>Copié</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3 text-white" />
                              <span>Copier</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* 4. MODAL INSTAGRAM & TIKTOK SHARING */}
      <ModalOverlay
        isOpen={!!socialModalItem}
        onClose={() => {
          setSocialModalItem(null);
          setSocialCopyFeedback(null);
        }}
        contentClassName="max-w-lg mx-auto"
      >
        {socialModalItem && (
          <div className="w-full rounded-2xl border border-white/15 bg-[#121316] p-6 shadow-2xl space-y-5 text-white animate-in fade-in zoom-in duration-150">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 text-white">
                  <Share2 className="size-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Partager sur Instagram & TikTok
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Générez vos textes prêts à coller en bio ou story.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSocialModalItem(null);
                  setSocialCopyFeedback(null);
                }}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Target Creator Details */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
              <img src={socialModalItem.logo} alt={socialModalItem.name} className="size-10 rounded-xl object-cover" />
              <div>
                <span className="font-bold text-white text-sm block">{socialModalItem.name}</span>
                <span className="text-[11px] text-zinc-400">{socialModalItem.industry} • Commission : <strong className="text-emerald-400">{socialModalItem.commissionRate}</strong></span>
              </div>
            </div>

            {/* Options Tabs / Formats */}
            <div className="space-y-3.5 text-xs">
              
              {/* INSTAGRAM BIO / STORY */}
              <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Instagram className="size-4 text-pink-400" />
                    <span className="font-bold text-white">Instagram (Bio / Sticker Story)</span>
                  </div>
                  <button
                    onClick={() =>
                      handleSocialCopy(
                        socialModalItem.affiliateUrl || `https://mansa.app/${socialModalItem.handle}?a=${userRefName}`,
                        "insta_link"
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    {socialCopyFeedback === "insta_link" ? <Check className="size-3" /> : <Copy className="size-3" />}
                    <span>{socialCopyFeedback === "insta_link" ? "Lien Copié !" : "Copier le Lien"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-300">
                  Collez ce lien dans votre <strong>Bio Instagram</strong> ou utilisez le <strong>Sticker « Lien »</strong> dans vos Stories.
                </p>

                <div className="p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-pink-300 break-all">
                  {socialModalItem.affiliateUrl || `https://mansa.app/${socialModalItem.handle}?a=${userRefName}`}
                </div>
              </div>

              {/* TIKTOK BIO / CAPTION */}
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-cyan-400" />
                    <span className="font-bold text-white">TikTok (Lien en Bio & Légende)</span>
                  </div>
                  <button
                    onClick={() => {
                      const caption = `🔥 Rejoins ${socialModalItem.name} ici : ${socialModalItem.affiliateUrl || `https://mansa.app/${socialModalItem.handle}?a=${userRefName}`} #mansa #${socialModalItem.handle} #business`;
                      handleSocialCopy(caption, "tiktok_caption");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    {socialCopyFeedback === "tiktok_caption" ? <Check className="size-3" /> : <Copy className="size-3" />}
                    <span>{socialCopyFeedback === "tiktok_caption" ? "Texte Copié !" : "Copier Légende TikTok"}</span>
                  </button>
                </div>

                <p className="text-[11px] text-zinc-300">
                  Idéal pour insérer dans la description de vos vidéos TikTok virales avec vos hashtags.
                </p>
              </div>

              {/* DIRECT QUICK APP LAUNCHERS */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <a
                  href="https://www.instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Instagram className="size-3.5 text-pink-400" />
                  <span>Ouvrir Instagram</span>
                </a>

                <a
                  href="https://www.tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Smartphone className="size-3.5 text-cyan-400" />
                  <span>Ouvrir TikTok</span>
                </a>
              </div>

            </div>

          </div>
        )}
      </ModalOverlay>

      {/* 5. SUCCESS JOIN MODAL */}
      <ModalOverlay
        isOpen={!!activeSuccessModal}
        onClose={() => setActiveSuccessModal(null)}
        contentClassName="max-w-md mx-auto"
      >
        {activeSuccessModal && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Programme d'affiliation rejoint !</h3>
              </div>
              <button
                onClick={() => setActiveSuccessModal(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <img src={activeSuccessModal.logo} alt={activeSuccessModal.name} className="size-10 rounded-xl object-cover" />
                <div>
                  <span className="font-bold text-white text-sm block">{activeSuccessModal.name}</span>
                  <span className="text-[11px] text-zinc-400">{activeSuccessModal.industry}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-zinc-400 font-medium text-[11px]">
                  Votre lien de parrainage exclusif :
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={activeSuccessModal.affiliateUrl || `https://mansa.app/${activeSuccessModal.handle}?a=${userRefName}`}
                    className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3 py-2 text-xs font-mono text-white outline-none"
                  />
                  <button
                    onClick={() => handleCopy(activeSuccessModal.affiliateUrl || `https://mansa.app/${activeSuccessModal.handle}?a=${userRefName}`)}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors shrink-0"
                    title="Copier"
                  >
                    {copiedLink === (activeSuccessModal.affiliateUrl || `https://mansa.app/${activeSuccessModal.handle}?a=${userRefName}`) ? (
                      <Check className="size-4 text-white" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Social sharing options inside success modal */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    const comp = activeSuccessModal;
                    setActiveSuccessModal(null);
                    setSocialModalItem(comp);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Instagram className="size-3.5 text-emerald-400" />
                  <span>Partager sur Insta & TikTok</span>
                </button>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
                Toutes les ventes réalisées via ce lien seront automatiquement créditées sur votre solde d'affilié et payables via Mobile Money (Wave, Orange, MTN).
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveSuccessModal(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold cursor-pointer"
              >
                Terminer
              </button>
            </div>

          </div>
        )}
      </ModalOverlay>

      {/* 6. WITHDRAWAL MODAL */}
      <ModalOverlay
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="size-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Retirer mes commissions</h3>
            </div>
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {withdrawSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="size-6" />
              </div>
              <h4 className="text-base font-bold text-white">Demande de Retrait Transmise !</h4>
              <p className="text-xs text-zinc-400">
                Votre virement de <strong>{formatCurrency(0, activeCurrency)}</strong> est en cours de transfert vers <strong>{withdrawMethod.toUpperCase()} ({withdrawPhone || "+225 07..."})</strong>.
              </p>
              <button
                onClick={() => {
                  setWithdrawSuccess(false);
                  setIsWithdrawModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setWithdrawSuccess(true);
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-3 rounded-xl bg-[#181a20] border border-white/5 flex items-center justify-between font-mono">
                <span className="text-zinc-400">Solde disponible :</span>
                <span className="text-base font-bold text-emerald-400">{formatCurrency(0, activeCurrency)}</span>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-2">Moyen de paiement :</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "wave", label: "Wave Mobile" },
                    { id: "orange", label: "Orange Money" },
                    { id: "mtn", label: "MTN MoMo" },
                    { id: "crypto", label: "USDT (TRC20)" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setWithdrawMethod(m.id as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        withdrawMethod === m.id
                          ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-sm"
                          : "bg-[#16181f] border-white/10 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">
                  {withdrawMethod === "crypto" ? "Adresse de portefeuille USDT" : "Numéro de téléphone"}
                </label>
                <input
                  type="text"
                  value={withdrawPhone}
                  onChange={(e) => setWithdrawPhone(e.target.value)}
                  placeholder={withdrawMethod === "crypto" ? "T9yD14Nj9yDbv3G9..." : "+225 07 00 00 00 00"}
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Confirmer le retrait
                </button>
              </div>
            </form>
          )}

        </div>
      </ModalOverlay>

    </div>
  );
};
