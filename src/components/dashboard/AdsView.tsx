import React, { useState } from "react";
import {
  TrendingUp,
  Megaphone,
  Plus,
  Play,
  Pause,
  DollarSign,
  MousePointerClick,
  Target,
  BarChart2,
  ExternalLink,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
} from "lucide-react";
import { CurrencyCode, formatCurrency } from "../../utils/currency";
import { ModalOverlay } from "../common/ModalOverlay";

interface AdCampaign {
  id: string;
  name: string;
  network: "Marketplace Mansa" | "TikTok Ads" | "Meta / Instagram" | "Google Search";
  dailyBudget: number;
  spent: number;
  clicks: number;
  conversions: number;
  revenue: number;
  roas: number;
  status: "active" | "paused";
}

interface AdsViewProps {
  lang?: "fr" | "en";
  currency?: CurrencyCode;
}

export const AdsView: React.FC<AdsViewProps> = ({ lang = "fr", currency = "XAF" as CurrencyCode }) => {
  const activeCurrency: CurrencyCode = (currency as CurrencyCode) || "XAF";
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campName, setCampName] = useState("");
  const [campNetwork, setCampNetwork] = useState<AdCampaign["network"]>("Marketplace Mansa");
  const [campBudget, setCampBudget] = useState("5000");

  const totalSpent = campaigns.reduce((acc, c) => acc + c.spent, 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue, 0);
  const avgRoas = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(1) : "0.0";
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) + "%" : "0%";
  const avgCpcFormatted = totalClicks > 0 ? formatCurrency(totalSpent / totalClicks, activeCurrency) : formatCurrency(0, activeCurrency);

  const toggleCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((c) =>
        c.id === id ? { ...c, status: c.status === "active" ? "paused" : "active" } : c
      )
    );
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const newCamp: AdCampaign = {
      id: "camp-" + Date.now(),
      name: campName,
      network: campNetwork,
      dailyBudget: parseFloat(campBudget) || 5000,
      spent: 0,
      clicks: 0,
      conversions: 0,
      revenue: 0,
      roas: 0,
      status: "active",
    };
    setCampaigns([newCamp, ...campaigns]);
    setIsCreateModalOpen(false);
    setCampName("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "fr" ? "Annonces & Acquisition de Trafic" : "Ads & Traffic Growth"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "fr"
              ? "Mettez vos produits en avant sur la marketplace Mansa, sponsorisez vos offres et suivez votre ROAS en direct."
              : "Boost your products on the Marketplace Mansa discovery feed and track multi-channel ad conversions."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{lang === "fr" ? "Créer une campagne" : "Create Ad Campaign"}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Dépenses Publicitaires Totales</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {formatCurrency(totalSpent, activeCurrency)}
          </div>
          <div className="text-[11px] text-zinc-400">Budget maîtrisé et plafonné</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Clics & Visiteurs Envoyés</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#6699ff] font-mono">
            {totalClicks.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400">CPC moyen : {avgCpcFormatted}</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Ventes Directes Réalisées</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {totalConversions}
          </div>
          <div className="text-[11px] text-emerald-400">Taux de conversion : {conversionRate}</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Retour sur Dépense (ROAS)</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {avgRoas}x
          </div>
          <div className="text-[11px] text-emerald-400">{formatCurrency(totalRevenue, activeCurrency)} générés</div>
        </div>

      </div>

      {/* Campaigns Table Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Campagnes Sponsorisées Actives</h3>
          <span className="text-xs text-zinc-500 font-mono">{campaigns.length} campagnes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-medium text-zinc-400">
                <th className="py-3 px-3">Campagne</th>
                <th className="py-3 px-3">Réseau</th>
                <th className="py-3 px-3">Budget / jour</th>
                <th className="py-3 px-3">Dépensé</th>
                <th className="py-3 px-3">Clics</th>
                <th className="py-3 px-3">Ventes</th>
                <th className="py-3 px-3">Chiffre d'Affaires</th>
                <th className="py-3 px-3">ROAS</th>
                <th className="py-3 px-3">Statut</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="space-y-2 max-w-sm mx-auto">
                      <p className="text-xs font-semibold text-zinc-300">
                        {lang === "fr" ? "Aucune campagne publicitaire lancée" : "No ad campaign created"}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {lang === "fr"
                          ? "Créez une campagne sponsorisée pour promouvoir vos produits sur le réseau Mansa et TikTok."
                          : "Create a sponsored campaign to boost your sales."}
                      </p>
                      <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3DDC84] hover:bg-[#2FB86A] text-black text-xs font-bold transition-all shadow-sm cursor-pointer mt-2"
                      >
                        <Plus className="size-3.5" />
                        <span>{lang === "fr" ? "Lancer une campagne" : "Launch campaign"}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-bold text-white block">{c.name}</span>
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-zinc-300">
                        {c.network}
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-mono text-zinc-300 whitespace-nowrap">
                      {formatCurrency(c.dailyBudget, activeCurrency)}/j
                    </td>

                    <td className="py-3.5 px-3 font-mono text-zinc-300 whitespace-nowrap">
                      {formatCurrency(c.spent, activeCurrency)}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-zinc-300 whitespace-nowrap">
                      {c.clicks}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {c.conversions}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-white font-bold whitespace-nowrap">
                      {formatCurrency(c.revenue, activeCurrency)}
                    </td>

                    <td className="py-3.5 px-3 font-mono text-emerald-400 font-bold whitespace-nowrap">
                      {c.roas}x
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {c.status === "active" ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Actif</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                          <span>En pause</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleCampaign(c.id)}
                        className={`p-1.5 rounded-lg border border-white/10 text-xs font-semibold cursor-pointer transition-colors ${
                          c.status === "active"
                            ? "hover:bg-amber-500/10 text-amber-400"
                            : "hover:bg-emerald-500/10 text-emerald-400"
                        }`}
                        title={c.status === "active" ? "Mettre en pause" : "Activer"}
                      >
                        {c.status === "active" ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE CAMPAIGN MODAL */}
      <ModalOverlay
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Megaphone className="size-5 text-[#0055ff]" />
              <h3 className="text-base font-bold text-white">Lancer une Campagne Sponsorisée</h3>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleCreateCampaign} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Nom de la campagne</label>
              <input
                type="text"
                value={campName}
                onChange={(e) => setCampName(e.target.value)}
                placeholder="ex: Mise en avant Mansa - Pass VIP Football"
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Plateforme de diffusion</label>
              <select
                value={campNetwork}
                onChange={(e) => setCampNetwork(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none cursor-pointer"
              >
                <option value="Marketplace Mansa">Marketplace Mansa (Recommandé - Fort ROI)</option>
                <option value="TikTok Ads">TikTok Ads (Vidéos courtes)</option>
                <option value="Meta / Instagram">Meta Ads (Instagram Stories & Feeds)</option>
                <option value="Google Search">Google Search (Mots-clés ciblés)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Budget quotidien</label>
              <input
                type="number"
                step="100"
                min="500"
                value={campBudget}
                onChange={(e) => setCampBudget(e.target.value)}
                placeholder={`ex: 5000`}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] px-3 py-2 font-mono text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Lancer la diffusion
              </button>
            </div>
          </form>

        </div>
      </ModalOverlay>

    </div>
  );
};
