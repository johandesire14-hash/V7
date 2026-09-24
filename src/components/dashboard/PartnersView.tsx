import React, { useState, useEffect } from "react";
import {
  Handshake,
  Building2,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Send,
  Users,
  ExternalLink,
  Shield,
  FileText,
  BadgePercent,
  Check,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Trash2,
} from "lucide-react";
import { ModalOverlay } from "../common/ModalOverlay";
import {
  FirestorePartnerDeal,
  getCreatorPartners,
  savePartnerDealToFirestore,
  deletePartnerDealFromFirestore,
} from "../../services/dbService";

interface PartnersViewProps {
  lang?: "fr" | "en";
  user?: {
    uid?: string;
    name?: string;
    email?: string;
  };
}

export const PartnersView: React.FC<PartnersViewProps> = ({
  lang = "fr",
  user,
}) => {
  const creatorId = user?.uid || "creator_default";
  const [deals, setDeals] = useState<FirestorePartnerDeal[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "opportunities">("all");
  const [isNewDealModalOpen, setIsNewDealModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dealSuccessToast, setDealSuccessToast] = useState<string | null>(null);

  // Form State
  const [newPartnerName, setNewPartnerName] = useState("");
  const [newDealType, setNewDealType] = useState<"co_branding" | "cross_promo" | "sponsor" | "tech_integration">("cross_promo");
  const [newDescription, setNewDescription] = useState("");
  const [newContactEmail, setNewContactEmail] = useState("");

  // Load partner deals from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const fetchDeals = async () => {
      setIsLoadingDeals(true);
      try {
        const data = await getCreatorPartners(creatorId);
        if (isMounted) {
          setDeals(data);
        }
      } catch (err: any) {
        console.error("Failed to load partner deals from Firestore:", err);
      } finally {
        if (isMounted) setIsLoadingDeals(false);
      }
    };

    fetchDeals();
    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  const activeCount = deals.filter((d) => d.status === "active").length;
  const pendingCount = deals.filter((d) => d.status !== "active").length;

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName.trim() || !newDescription.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const typeLabel =
      newDealType === "co_branding"
        ? "Co-Branding & Produit Commun"
        : newDealType === "cross_promo"
        ? "Échange de Visibilité & Cross-Promo"
        : newDealType === "sponsor"
        ? "Sponsoring & Marque"
        : "Intégration Technique";

    const partnerHandle = `@${newPartnerName.toLowerCase().replace(/\s+/g, "_")}`;

    try {
      const savedId = await savePartnerDealToFirestore(creatorId, {
        partnerName: newPartnerName.trim(),
        partnerLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        partnerHandle,
        type: newDealType,
        typeLabel,
        description: newDescription.trim(),
        contactEmail: newContactEmail.trim() || undefined,
        status: "proposed",
        value: "En négociation",
        reach: "Portée estimée 10k+",
        startDate: "Aujourd'hui",
      });

      const newDeal: FirestorePartnerDeal = {
        id: savedId,
        creatorId,
        partnerName: newPartnerName.trim(),
        partnerLogo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        partnerHandle,
        type: newDealType,
        typeLabel,
        description: newDescription.trim(),
        contactEmail: newContactEmail.trim() || undefined,
        status: "proposed",
        value: "En négociation",
        reach: "Portée estimée 10k+",
        startDate: "Aujourd'hui",
        createdAt: new Date().toISOString(),
      };

      setDeals((prev) => [newDeal, ...prev]);
      setIsNewDealModalOpen(false);
      setNewPartnerName("");
      setNewDescription("");
      setNewContactEmail("");
      setDealSuccessToast("Votre proposition de partenariat a été enregistrée avec succès !");
      setTimeout(() => setDealSuccessToast(null), 4000);
    } catch (err: any) {
      console.error("Firestore partner deal save error:", err);
      setErrorMessage(err.message || "Erreur lors de la sauvegarde du partenariat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDeal = async (dealId: string, partnerName: string) => {
    if (!confirm(`Supprimer le partenariat avec ${partnerName} ?`)) return;

    try {
      await deletePartnerDealFromFirestore(dealId);
      setDeals((prev) => prev.filter((d) => d.id !== dealId));
      setDealSuccessToast(`L'accord avec ${partnerName} a été supprimé.`);
      setTimeout(() => setDealSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete partner deal:", err);
      alert("Erreur lors de la suppression du partenariat.");
    }
  };

  const filteredDeals = deals.filter((deal) => {
    if (activeTab === "active") return deal.status === "active";
    if (activeTab === "opportunities") return deal.status !== "active";
    return true;
  });

  return (
    <div className="space-y-6 pb-20 text-white">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <Handshake className="size-6 text-[#0055ff]" />
            <h1 className="text-xl font-bold tracking-tight text-white">
              {lang === "fr" ? "Partenariats & Collaborations B2B" : "Partnerships & B2B Collaborations"}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "fr"
              ? "Gérez vos accords stratégiques, cross-promotions entre créateurs, co-branding et intégrations techniques."
              : "Manage your strategic partnerships, creator cross-promotions, co-branding, and technical integrations."}
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage(null);
            setIsNewDealModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="size-4" />
          <span>{lang === "fr" ? "Proposer un partenariat" : "New Partnership Deal"}</span>
        </button>
      </div>

      {/* SUCCESS TOAST */}
      {dealSuccessToast && (
        <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/30 p-3.5 text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in shadow-md">
          <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
          <span>{dealSuccessToast}</span>
        </div>
      )}

      {/* 2. STATS OVERVIEW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1">
          <span className="text-zinc-400 text-xs">Accords Actifs</span>
          <div className="text-2xl font-bold font-mono text-white">
            {isLoadingDeals ? "..." : activeCount}
          </div>
          <div className="text-[10px] text-emerald-400 font-medium">
            {activeCount > 0 ? `${activeCount} partenariats actifs` : "0 accord"}
          </div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1">
          <span className="text-zinc-400 text-xs">Audience Partagée Estimée</span>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {activeCount > 0 ? "10.0k+" : "0"}
          </div>
          <div className="text-[10px] text-zinc-400">Sur vos canaux partenaires</div>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-1">
          <span className="text-zinc-400 text-xs">Opportunités en Cours</span>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {isLoadingDeals ? "..." : pendingCount}
          </div>
          <div className="text-[10px] text-zinc-400">
            {pendingCount > 0 ? `${pendingCount} proposition(s)` : "0 proposition"}
          </div>
        </div>
      </div>

      {/* 3. TABS */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "all" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Tous les accords ({deals.length})
        </button>
        <button
          onClick={() => setActiveTab("active")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "active" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          Actifs ({deals.filter((d) => d.status === "active").length})
        </button>
        <button
          onClick={() => setActiveTab("opportunities")}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === "opportunities" ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          En négociation ({deals.filter((d) => d.status !== "active").length})
        </button>
      </div>

      {/* 4. DEALS LIST */}
      <div className="space-y-3">
        {isLoadingDeals ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
            <Loader2 className="size-5 animate-spin text-[#0055ff]" />
            <span>Chargement des partenariats...</span>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-12 text-center space-y-3">
            <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
              <Handshake className="size-6 text-zinc-500" />
            </div>
            <p className="text-sm font-semibold text-zinc-300">
              {lang === "fr" ? "Aucun partenariat pour le moment" : "No partnership deal yet"}
            </p>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              {lang === "fr"
                ? "Nouez des alliances stratégiques, proposez du co-branding ou lancez des cross-promotions avec d'autres créateurs de contenu."
                : "Create strategic alliances, pitch co-branding or launch cross-promotions with other creators."}
            </p>
            <button
              onClick={() => {
                setErrorMessage(null);
                setIsNewDealModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-md cursor-pointer mt-2"
            >
              <Plus className="size-4" />
              <span>{lang === "fr" ? "Proposer un partenariat" : "Propose partnership"}</span>
            </button>
          </div>
        ) : (
          filteredDeals.map((deal) => (
            <div
              key={deal.id}
              className="rounded-2xl border border-white/[0.08] bg-[#0f1013] p-5 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={deal.partnerLogo}
                    alt={deal.partnerName}
                    className="size-11 rounded-xl object-cover border border-white/10 bg-zinc-800"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{deal.partnerName}</h3>
                      <span className="text-xs text-zinc-500 font-mono">{deal.partnerHandle}</span>
                      <span className="text-xs text-[#6699ff] font-medium">
                        {deal.typeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1">{deal.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  {deal.status === "active" ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                      <CheckCircle2 className="size-3.5" />
                      Partenariat Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                      <Clock className="size-3.5" />
                      En attente de validation
                    </span>
                  )}

                  <button
                    onClick={() => handleDeleteDeal(deal.id, deal.partnerName)}
                    className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Supprimer l'accord"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Deal Details footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.04] text-xs text-zinc-400">
                <div className="flex items-center gap-4">
                  <span>
                    Valeur / Portée : <strong className="text-white font-mono">{deal.value}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Audience : <strong className="text-white">{deal.reach}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Date : <strong className="text-zinc-300">{deal.startDate}</strong>
                  </span>
                </div>

                {deal.contactEmail && (
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-mono">
                    <Send className="size-3 text-[#0055ff]" />
                    <span>{deal.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. MODAL PROPOSER UN PARTENARIAT */}
      <ModalOverlay
        isOpen={isNewDealModalOpen}
        onClose={() => setIsNewDealModalOpen(false)}
        contentClassName="max-w-lg mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4 text-white">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Handshake className="size-5 text-[#0055ff]" />
              <h3 className="text-base font-bold text-white">Initier un Partenariat B2B</h3>
            </div>
            <button
              onClick={() => setIsNewDealModalOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-semibold text-red-400">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateProposal} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Nom du créateur ou de l'entreprise partenaire :
              </label>
              <input
                type="text"
                value={newPartnerName}
                onChange={(e) => setNewPartnerName(e.target.value)}
                placeholder="Ex: Skylit Trading, Alex Growth, Mansa Media..."
                required
                className="w-full rounded-xl border border-white/10 bg-[#181a20] p-2.5 text-white outline-none focus:border-[#0055ff]"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Type de collaboration :
              </label>
              <select
                value={newDealType}
                onChange={(e) => setNewDealType(e.target.value as any)}
                className="w-full rounded-xl border border-white/10 bg-[#181a20] p-2.5 text-white outline-none focus:border-[#0055ff]"
              >
                <option value="cross_promo">Échange de Visibilité & Cross-Promo (Discord / Telegram)</option>
                <option value="co_branding">Co-Branding de Produit (Pack Commun)</option>
                <option value="sponsor">Sponsoring / Placement de Marque</option>
                <option value="tech_integration">Intégration Bot KPAY</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Description & Proposition de valeur :
              </label>
              <textarea
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Détaillez les bénéfices mutuels, la portée attendue et les modalités de partage..."
                required
                className="w-full rounded-xl border border-white/10 bg-[#181a20] p-2.5 text-white outline-none focus:border-[#0055ff] resize-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Email ou Handle Discord/Telegram de contact :
              </label>
              <input
                type="text"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="contact@partenaire.com ou @handle"
                className="w-full rounded-xl border border-white/10 bg-[#181a20] p-2.5 text-white outline-none focus:border-[#0055ff]"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsNewDealModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Enregistrement en cours...</span>
                  </>
                ) : (
                  <span>Envoyer la proposition</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </ModalOverlay>

    </div>
  );
};
