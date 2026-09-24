import React, { useState } from "react";
import {
  Globe,
  ExternalLink,
  Plus,
  CheckCircle2,
  Copy,
  Settings,
  Layout,
  Smartphone,
  Eye,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Layers,
  X,
  Palette,
} from "lucide-react";
import { ModalOverlay } from "../common/ModalOverlay";

interface WebsitesViewProps {
  lang?: "fr" | "en";
}

export const WebsitesView: React.FC<WebsitesViewProps> = ({ lang = "fr" }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [isAddDomainOpen, setIsAddDomainOpen] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [domains, setDomains] = useState<Array<{
    id: string;
    domain: string;
    status: string;
    ssl: string;
    type: string;
  }>>([]);

  const handleCopy = (url: string) => {
    navigator.clipboard?.writeText?.(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setDomains([
      ...domains,
      {
        id: "dom-" + Date.now(),
        domain: newDomain.toLowerCase().trim(),
        status: "connected",
        ssl: "active",
        type: "Domaine Personnalisé",
      },
    ]);
    setNewDomain("");
    setIsAddDomainOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "fr" ? "Sites Web & Vitrines d'Entreprise" : "Websites & Enterprise Funnels"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "fr"
              ? "Personnalisez la vitrine de votre entreprise Mansa, connectez vos noms de domaine personnalisés et publiez vos pages de capture."
              : "Customize your enterprise storefront, connect custom domains and configure high-converting checkout funnels."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddDomainOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{lang === "fr" ? "Ajouter un domaine" : "Add Domain"}</span>
          </button>
        </div>
      </div>

      {/* Main Storefront Feature Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          <div className="flex items-start gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-[#0055ff]/10 text-[#0055ff] border border-[#0055ff]/20 shrink-0">
              <Globe className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Vitrine Officielle Mansa</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                Votre vitrine principale où vos clients peuvent découvrir vos produits, souscrire à un pass VIP et accéder à leurs cours.
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="font-mono text-xs text-[#6699ff] font-semibold">
                  mansa.app/entreprise
                </span>
                <button
                  onClick={() => handleCopy("https://mansa.app/entreprise")}
                  className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl === "https://mansa.app/entreprise" ? (
                    <span className="text-emerald-400">Copié !</span>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copier</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#preview"
              onClick={(e) => {
                e.preventDefault();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16181f] hover:bg-[#1f222b] px-4 py-2.5 text-xs font-semibold text-zinc-200 transition-colors"
            >
              <Eye className="size-3.5" />
              <span>Prévisualiser</span>
            </a>
            <button
              onClick={() => {}}
              className="flex items-center gap-1.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Palette className="size-3.5" />
              <span>Personnaliser le thème</span>
            </button>
          </div>
        </div>

        {/* 3 Interactive Cards: Link in Bio, Checkout Funnel, Embed Widget */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Link in Bio */}
          <div className="rounded-xl border border-white/[0.06] bg-[#121316] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Smartphone className="size-4 text-[#0055ff]" />
                <span>Page Link-in-Bio</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Actif</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Page mobile optimisée pour Instagram, TikTok et Twitter/X avec tous vos liens en 1 clic.
            </p>
            <button
              onClick={() => handleCopy("https://mansa.app/victory_odds/links")}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-zinc-300 hover:text-white font-semibold cursor-pointer"
            >
              <Copy className="size-3" />
              <span>Copier le lien bio</span>
            </button>
          </div>

          {/* Checkout Funnel */}
          <div className="rounded-xl border border-white/[0.06] bg-[#121316] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layout className="size-4 text-purple-400" />
                <span>Tunnel 1-Click Checkout</span>
              </span>
              <span className="text-[10px] font-mono text-purple-400">Apple Pay</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Page de paiement ultra-rapide avec conversion optimisée, avis vérifiés et garanties.
            </p>
            <button
              onClick={() => handleCopy("https://mansa.app/checkout/victory_odds")}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-zinc-300 hover:text-white font-semibold cursor-pointer"
            >
              <Copy className="size-3" />
              <span>Copier l'URL du tunnel</span>
            </button>
          </div>

          {/* Embed Widget */}
          <div className="rounded-xl border border-white/[0.06] bg-[#121316] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="size-4 text-emerald-400" />
                <span>Bouton & Widget Intégré</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400">HTML / React</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Intégrez le tunnel de paiement directement sur votre site web existant (WordPress, Webflow, React).
            </p>
            <button
              onClick={() => alert("Code HTML d'intégration copié dans le presse-papier !")}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 py-1.5 text-xs text-zinc-300 hover:text-white font-semibold cursor-pointer"
            >
              <Copy className="size-3" />
              <span>Obtenir le code HTML</span>
            </button>
          </div>

        </div>

      </div>

      {/* Custom Domains Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Noms de Domaine Personnalisés</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Associez votre propre marque blanche avec certificat SSL automatique.
            </p>
          </div>
          <button
            onClick={() => setIsAddDomainOpen(true)}
            className="text-xs text-[#0055ff] hover:underline font-semibold cursor-pointer"
          >
            + Lier un autre domaine
          </button>
        </div>

        <div className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-xl overflow-hidden bg-[#121316]">
          {domains.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-3">
              <div className="size-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                <Globe className="size-5 text-zinc-500" />
              </div>
              <p className="text-xs font-semibold text-zinc-300">
                {lang === "fr" ? "Aucun domaine personnalisé connecté" : "No custom domain connected"}
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                {lang === "fr"
                  ? "Connectez votre propre nom de domaine (ex: boutique.votremarque.com) pour vendre sous votre propre marque blanche."
                  : "Connect your custom domain to sell under your own white-label brand."}
              </p>
              <button
                onClick={() => setIsAddDomainOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>{lang === "fr" ? "Connecter un domaine" : "Connect domain"}</span>
              </button>
            </div>
          ) : (
            domains.map((dom) => (
              <div
                key={dom.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="size-4 text-zinc-400" />
                  <div>
                    <span className="text-xs font-mono font-bold text-white">{dom.domain}</span>
                    <div className="text-[10px] text-zinc-500">{dom.type}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                    <ShieldCheck className="size-3.5" />
                    <span>SSL Actif & Connecté</span>
                  </span>

                  <button
                    onClick={() => alert(`Test DNS réussi pour ${dom.domain}`)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
                    title="Vérifier la configuration DNS"
                  >
                    <Settings className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD DOMAIN MODAL */}
      <ModalOverlay
        isOpen={isAddDomainOpen}
        onClose={() => setIsAddDomainOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="size-5 text-[#0055ff]" />
              <h3 className="text-base font-bold text-white">Connecter un Nom de Domaine</h3>
            </div>
            <button
              onClick={() => setIsAddDomainOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleAddDomain} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Votre sous-domaine ou domaine personnalisé
              </label>
              <input
                type="text"
                placeholder="ex: app.votre-marque.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 font-mono text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 space-y-1.5 text-zinc-400">
              <span className="font-semibold text-white block">Instructions DNS CNAME :</span>
              <div className="flex justify-between font-mono text-[11px]">
                <span>Type : <strong>CNAME</strong></span>
                <span>Valeur : <strong>cname.mansa.app</strong></span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddDomainOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Connecter le domaine
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

    </div>
  );
};
