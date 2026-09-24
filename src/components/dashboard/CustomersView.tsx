import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Download,
  Calendar,
  DollarSign,
  UserCheck,
  UserX,
  X,
  MessageSquare,
  Copy,
  Zap,
} from "lucide-react";
import { ConfirmActionModal } from "../common/ConfirmActionModal";
import { ModalOverlay } from "../common/ModalOverlay";
import { useAuth } from "../../context/AuthContext";
import {
  subscribeToCreatorCustomers,
  createRealCustomer,
  deleteCustomerFromFirestore,
  seedRealisticDemoData,
  FirestoreCustomer,
} from "../../services/dbService";

interface CustomerMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  discordUsername?: string;
  productTitle: string;
  plan: string;
  totalSpent: number;
  totalSpentFormatted?: string;
  countryFlag: string;
  countryName: string;
  joinedDate: string;
  status: "active" | "trial" | "cancelled" | "past_due";
}

interface CustomersViewProps {
  lang?: "fr" | "en";
}

export const CustomersView: React.FC<CustomersViewProps> = ({ lang = "fr" }) => {
  const { user, profile } = useAuth();
  const [customers, setCustomers] = useState<CustomerMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "trial" | "cancelled">("all");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerMember | null>(null);
  const [customerToRevoke, setCustomerToRevoke] = useState<CustomerMember | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberProduct, setNewMemberProduct] = useState("Pass VIP Mansa");

  useEffect(() => {
    const creatorKey = profile?.uid || user?.email || "creator-default";
    const unsub = subscribeToCreatorCustomers(creatorKey, (dbCusts) => {
      const mapped: CustomerMember[] = dbCusts.map((c) => {
        const initials = (c.name || "MB")
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        return {
          id: c.id,
          name: c.name,
          email: c.email,
          avatar: initials,
          discordUsername: c.discordUsername || "",
          productTitle: c.productName || "Accès Mansa",
          plan: `${c.totalSpentFormatted || "0 FCFA"}`,
          totalSpent: c.totalSpent || 0,
          totalSpentFormatted: c.totalSpentFormatted,
          countryFlag: c.countryFlag || "🇨🇮",
          countryName: c.countryName || "Côte d'Ivoire",
          joinedDate: c.joinedDate || new Date().toLocaleDateString("fr-FR"),
          status: c.status || "active",
        };
      });
      setCustomers(mapped);
    });

    return () => unsub();
  }, [profile?.uid, user?.email]);

  const filtered = customers.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.discordUsername && c.discordUsername.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const creatorKey = profile?.uid || user?.email || "creator-default";
    await createRealCustomer(creatorKey, {
      name: newMemberName,
      email: newMemberEmail,
      productName: newMemberProduct,
      totalSpent: 0,
      totalSpentFormatted: "0 FCFA",
      countryFlag: "🇨🇮",
      countryName: "Côte d'Ivoire (Abidjan)",
      status: "active",
    });

    setIsAddMemberOpen(false);
    setNewMemberEmail("");
    setNewMemberName("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {lang === "fr" ? "Clients & Membres" : "Customers & Members"}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "fr"
              ? "Gérez les abonnements, rôles Discord synchronisés, historiques d'achats et accès de vos membres."
              : "Manage member memberships, synchronized Discord roles, lifetime value and access rights."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const data = JSON.stringify(customers, null, 2);
              const blob = new Blob([data], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "clients_mansa.json";
              a.click();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16181f] hover:bg-[#1f222b] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Exporter</span>
          </button>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{lang === "fr" ? "Accorder un accès" : "Grant Access"}</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-4">
        
        {/* Filters and search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
            {[
              { id: "all", label: "Tous les membres" },
              { id: "active", label: "Actifs" },
              { id: "trial", label: "Essais" },
              { id: "cancelled", label: "Annulés" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setStatusFilter(t.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === t.id
                    ? "bg-[#0055ff] text-white"
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email, Discord..."
              className="w-full rounded-xl border border-white/10 bg-[#16181f] pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#0055ff]"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] font-medium text-zinc-400">
                <th className="py-3.5 px-3">Membre</th>
                <th className="py-3.5 px-3">Produit & Formule</th>
                <th className="py-3.5 px-3">Discord / Telegram</th>
                <th className="py-3.5 px-3">Dépenses Cumulées</th>
                <th className="py-3.5 px-3">Date d'inscription</th>
                <th className="py-3.5 px-3">Statut</th>
                <th className="py-3.5 px-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <Users className="size-10 mx-auto mb-3 opacity-30 text-[#3DDC84]" />
                    <p className="text-sm font-semibold text-white">Aucun client ou membre pour l'instant</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
                      Dès qu'un client effectue un achat via Wave, MoMo ou Carte bancaire, il apparaîtra ici automatiquement en temps réel.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      <button
                        onClick={() => setIsAddMemberOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3DDC84]/10 hover:bg-[#3DDC84]/20 text-[#3DDC84] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Ajouter manuellement un membre</span>
                      </button>

                      <button
                        onClick={async () => {
                          const creatorKey = profile?.uid || user?.email || "creator-default";
                          await seedRealisticDemoData(creatorKey, user?.email || "createur@mansa.af", profile?.displayName || "Créateur Mansa");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00D26A]/40 bg-[#00D26A]/10 hover:bg-[#00D26A]/20 text-[#00D26A] text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Zap className="size-3.5" />
                        <span>Simuler 16 clients et ventes</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    {/* Name & Email with Avatar and Country Flag */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="flex size-8 items-center justify-center rounded-full bg-[#151515] border border-white/10 text-xs font-bold text-white shrink-0">
                            {c.avatar}
                          </div>
                          <span className="absolute -bottom-1 -right-1 text-xs leading-none">
                            {c.countryFlag}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{c.name}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                            <span>{c.email}</span>
                            <span className="text-zinc-600">·</span>
                            <span className="text-zinc-400 font-mono">{c.countryName}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Product & plan */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-semibold text-zinc-200">{c.productTitle}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{c.plan}</div>
                    </td>

                    {/* Discord handle */}
                    <td className="py-3.5 px-3 whitespace-nowrap font-mono text-zinc-300">
                      {c.discordUsername ? (
                        <span className="inline-flex items-center gap-1 text-zinc-300">
                          <span className="size-1.5 rounded-full bg-[#3DDC84]" />
                          {c.discordUsername}
                        </span>
                      ) : (
                        <span className="text-zinc-600">Non lié</span>
                      )}
                    </td>

                    {/* Total spent */}
                    <td className="py-3.5 px-3 font-mono font-bold text-white whitespace-nowrap">
                      {c.totalSpentFormatted || `${c.totalSpent.toLocaleString("fr-FR")} FCFA`}
                    </td>

                    {/* Joined Date */}
                    <td className="py-3.5 px-3 text-zinc-400 whitespace-nowrap font-mono text-[11px]">
                      {c.joinedDate}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {c.status === "active" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-[#3DDC84]/10 px-2 py-0.5 text-[10px] font-semibold text-[#3DDC84]">
                          <CheckCircle2 className="size-3" />
                          <span>Actif</span>
                        </span>
                      )}
                      {c.status === "trial" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                          <span>Essai 7j</span>
                        </span>
                      )}
                      {c.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold text-zinc-400">
                          <span>Annulé</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCustomer(c);
                        }}
                        className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 text-xs font-semibold transition-colors"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* GRANT ACCESS / ADD MEMBER MODAL */}
      <ModalOverlay
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#151515] p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="size-5 text-[#3DDC84]" />
              <h3 className="text-base font-bold text-white font-heading">Accorder un Accès Gratuit / VIP</h3>
            </div>
            <button
              onClick={() => setIsAddMemberOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleAddMember} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[#B6B5B0] font-semibold mb-1">Nom complet</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="ex: Jean Dupont"
                className="w-full rounded-xl border border-white/10 bg-black/50 p-2.5 text-white outline-none focus:border-[#3DDC84]"
                required
              />
            </div>

            <div>
              <label className="block text-[#B6B5B0] font-semibold mb-1">Email du membre</label>
              <input
                type="email"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="jean@exemple.fr"
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Produit à débloquer</label>
              <select
                value={newMemberProduct}
                onChange={(e) => setNewMemberProduct(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none cursor-pointer"
              >
                <option value="victory_odds">victory_odds · Accès Privé VIP</option>
                <option value="trading_bot">Victory Trading Bot & Signals</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddMemberOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Valider l'accès
              </button>
            </div>
          </form>

        </div>
      </ModalOverlay>

      {/* CUSTOMER DETAILS MODAL */}
      <ModalOverlay
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        contentClassName="max-w-lg mx-auto"
      >
        {selectedCustomer && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-[#0055ff] text-sm font-bold text-white">
                  {selectedCustomer.avatar}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedCustomer.name}</h3>
                  <p className="text-xs text-zinc-400 font-mono">{selectedCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Produit souscrit :</span>
                <span className="font-semibold text-white">{selectedCustomer.productTitle}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Tarif / Formule :</span>
                <span className="font-mono text-zinc-200">{selectedCustomer.plan}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Total dépensé à vie (LTV) :</span>
                <span className="font-mono font-bold text-emerald-400">${selectedCustomer.totalSpent.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Rôle Discord synchronisé :</span>
                <span className="font-mono text-zinc-200">
                  {selectedCustomer.discordUsername || "Non associé"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Statut du compte :</span>
                <span className="font-semibold text-emerald-400 capitalize">{selectedCustomer.status}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => {
                  alert(`Message envoyé à ${selectedCustomer.email}`);
                  setSelectedCustomer(null);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs text-white font-semibold cursor-pointer"
              >
                <Mail className="size-3.5" />
                <span>Envoyer un email</span>
              </button>

              <button
                onClick={() => {
                  setCustomerToRevoke(selectedCustomer);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
              >
                <UserX className="size-3.5" />
                <span>Révoquer l'accès</span>
              </button>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="ml-auto px-4 py-2 rounded-xl bg-[#0055ff] text-white text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        )}
      </ModalOverlay>

      {/* CONFIRM CUSTOMER ACCESS REVOCATION MODAL */}
      {customerToRevoke && (
        <ConfirmActionModal
          isOpen={!!customerToRevoke}
          onClose={() => setCustomerToRevoke(null)}
          onConfirm={() => {
            setCustomers((prev) => prev.filter((c) => c.id !== customerToRevoke.id));
            if (selectedCustomer?.id === customerToRevoke.id) {
              setSelectedCustomer(null);
            }
            setCustomerToRevoke(null);
          }}
          title={lang === "fr" ? "Révoquer l'accès membre ?" : "Revoke member access?"}
          description={
            lang === "fr"
              ? `Êtes-vous certain de vouloir expulser ${customerToRevoke.name} et révoquer ses licences d'accès ?`
              : `Are you sure you want to revoke access licenses for ${customerToRevoke.name}?`
          }
          itemName={customerToRevoke.name}
          itemType={lang === "fr" ? "Client / Membre VIP" : "Customer / VIP Member"}
          itemDetails={[
            { label: "Email", value: customerToRevoke.email },
            { label: "Produit", value: customerToRevoke.productTitle },
            { label: "Pays", value: `${customerToRevoke.countryFlag} ${customerToRevoke.countryName}` },
            { label: "Total dépensé", value: customerToRevoke.totalSpentFormatted || `$${customerToRevoke.totalSpent}` },
          ]}
          consequences={[
            lang === "fr"
              ? "Le rôle Discord VIP et l'accès au canal Telegram seront révoqués automatiquement."
              : "Discord VIP role and Telegram channel access will be automatically removed.",
            lang === "fr"
              ? "L'abonné ne pourra plus télécharger les fichiers ni accéder aux cours en ligne."
              : "The subscriber will no longer be able to download files or view courses.",
          ]}
          confirmButtonText={lang === "fr" ? "Révoquer l'accès" : "Revoke Access"}
          cancelButtonText={lang === "fr" ? "Annuler" : "Cancel"}
          variant="danger"
          lang={lang}
        />
      )}

    </div>
  );
};
