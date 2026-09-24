import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Plus,
  Shield,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  Clock,
  ArrowRight,
  ExternalLink,
  X,
  Mail,
  UserCheck,
  Trash2,
} from "lucide-react";
import { ModalOverlay } from "../common/ModalOverlay";
import {
  FirestoreWorkforceMember,
  getCreatorWorkforce,
  saveWorkforceMemberToFirestore,
  deleteWorkforceMemberFromFirestore,
} from "../../services/dbService";

interface WorkforceViewProps {
  lang?: "fr" | "en";
  user?: {
    uid?: string;
    name?: string;
    email?: string;
  };
}

export const WorkforceView: React.FC<WorkforceViewProps> = ({
  lang = "fr",
  user,
}) => {
  const creatorId = user?.uid || "creator_default";
  const [team, setTeam] = useState<FirestoreWorkforceMember[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Modérateur Discord");
  const [inviteRate, setInviteRate] = useState("500");

  // Load team on mount or user change
  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      setIsLoadingTeam(true);
      try {
        const data = await getCreatorWorkforce(creatorId);
        if (isMounted) {
          setTeam(data);
        }
      } catch (err: any) {
        console.error("Failed to load workforce from Firestore:", err);
      } finally {
        if (isMounted) setIsLoadingTeam(false);
      }
    };

    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, [creatorId]);

  const totalPayroll = team.reduce((acc, w) => {
    const num = parseFloat(w.rate.replace(/[^0-9.]/g, "") || "0");
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const avgRating = team.length > 0
    ? (team.reduce((acc, m) => acc + (m.rating || 5.0), 0) / team.length).toFixed(1)
    : "-";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const workerName = inviteEmail.split("@")[0];
    const workerAvatar = inviteEmail.slice(0, 2).toUpperCase();

    try {
      const savedId = await saveWorkforceMemberToFirestore(creatorId, {
        name: workerName,
        role: inviteRole,
        rate: `$${inviteRate}.00 / mois`,
        avatar: workerAvatar,
        status: "active",
        tasksCompleted: 0,
        rating: 5.0,
      });

      const newMember: FirestoreWorkforceMember = {
        id: savedId,
        creatorId,
        name: workerName,
        role: inviteRole,
        rate: `$${inviteRate}.00 / mois`,
        avatar: workerAvatar,
        status: "active",
        tasksCompleted: 0,
        rating: 5.0,
        createdAt: new Date().toISOString(),
      };

      setTeam((prev) => [newMember, ...prev]);
      setIsInviteOpen(false);
      setInviteEmail("");
      setSuccessToast(`Le collaborateur ${workerName} a été ajouté avec succès !`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: any) {
      console.error("Firestore workforce save error:", err);
      setErrorMessage(err.message || "Erreur lors de la sauvegarde du collaborateur.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Voulez-vous vraiment retirer ${memberName} de votre équipe ?`)) return;

    try {
      await deleteWorkforceMemberFromFirestore(memberId);
      setTeam((prev) => prev.filter((m) => m.id !== memberId));
      setSuccessToast(`${memberName} a été retiré de votre équipe.`);
      setTimeout(() => setSuccessToast(null), 3000);
    } catch (err: any) {
      console.error("Failed to delete workforce member:", err);
      alert("Erreur lors de la suppression du collaborateur.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === "fr" ? "Main-d'œuvre & Équipe" : "Workforce & Team"}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "fr"
              ? "Déléguez la gestion de votre communauté, recrutez des modérateurs vérifiés et automatisez la paie de vos collaborateurs."
              : "Delegate community management, hire verified staff and automate contractor payouts."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setErrorMessage(null);
              setIsInviteOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{lang === "fr" ? "Recruter / Inviter un membre" : "Invite Team Member"}</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-400 shadow-md animate-in fade-in">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Collaborateurs Actifs</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {isLoadingTeam ? "..." : team.length}
          </div>
          <div className="text-[11px] text-emerald-400">
            {team.length > 0 ? "100% de missions honorées" : "0 collaborateur"}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Budget Paie Mensuel Automatisé</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            ${totalPayroll.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-400">Prélevé directement sur vos revenus</div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1.5">
          <span className="text-xs text-zinc-400 font-medium">Satisfaction de l'Équipe</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
            {team.length > 0 ? `${avgRating} / 5` : "- / 5"}
          </div>
          <div className="text-[11px] text-zinc-400">Évaluations vérifiées par Mansa</div>
        </div>
      </div>

      {/* Current Team List */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white">Votre Équipe en Ligne</h3>
            {isLoadingTeam && <Loader2 className="size-3.5 animate-spin text-[#0055ff]" />}
          </div>
          <span className="text-xs text-zinc-500 font-mono">{team.length} personnes</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {isLoadingTeam ? (
            <div className="py-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
              <Loader2 className="size-5 animate-spin text-[#0055ff]" />
              <span>Chargement des collaborateurs...</span>
            </div>
          ) : team.length === 0 ? (
            <div className="py-10 px-4 text-center space-y-3">
              <div className="size-10 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                <Users className="size-5 text-zinc-500" />
              </div>
              <p className="text-xs font-semibold text-zinc-300">
                {lang === "fr" ? "Aucun collaborateur actif" : "No active team members"}
              </p>
              <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                {lang === "fr"
                  ? "Invitez un modérateur, développeur ou assistant pour vous aider à gérer votre communauté."
                  : "Invite a moderator, developer or assistant to help run your storefront."}
              </p>
              <button
                onClick={() => {
                  setErrorMessage(null);
                  setIsInviteOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>{lang === "fr" ? "Inviter un collaborateur" : "Invite member"}</span>
              </button>
            </div>
          ) : (
            team.map((worker) => (
              <div
                key={worker.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex size-10 items-center justify-center rounded-full bg-[#1e2029] border border-white/10 text-xs font-bold text-white font-mono">
                    {worker.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{worker.name}</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        <span>Actif</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{worker.role}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <span className="font-mono font-bold text-white block">{worker.rate}</span>
                    <span className="text-[10px] text-zinc-500">{worker.tasksCompleted} tâches traitées</span>
                  </div>

                  <button
                    onClick={() => handleDeleteMember(worker.id, worker.name)}
                    className="p-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    title="Retirer le collaborateur"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Talent Marketplace Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">Marketplace des Talents Mansa</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Recrutez des opérateurs experts rodés aux meilleures pratiques des communautés rentables.
          </p>
        </div>

        <div className="pt-2">
          <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-white/[0.04] bg-[#121316] space-y-2">
            <Star className="size-6 text-zinc-600" />
            <p className="text-xs font-semibold text-zinc-300">
              {lang === "fr" ? "Aucun talent disponible actuellement" : "No talents currently available"}
            </p>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              {lang === "fr"
                ? "Les profils Mansa (modérateurs, développeurs de bots) apparaîtront dès l'ouverture des candidatures."
                : "Talent profiles will be listed here once applications open."}
            </p>
          </div>
        </div>
      </div>

      {/* INVITE MODAL */}
      <ModalOverlay
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Users className="size-5 text-[#0055ff]" />
              <h3 className="text-base font-bold text-white">Ajouter un Collaborateur</h3>
            </div>
            <button
              onClick={() => setIsInviteOpen(false)}
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

          <form onSubmit={handleInvite} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Email de l'invité</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="collaborateur@gmail.com"
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Rôle et permissions</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none cursor-pointer"
              >
                <option value="Modérateur Discord">Modérateur Discord & Telegram</option>
                <option value="Agent Support Client">Agent Support Client (Messagerie)</option>
                <option value="Développeur Web & Bots">Développeur Web & Webhooks</option>
                <option value="Responsable Marketing">Responsable Marketing & Affiliés</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Rémunération mensuelle ($US)</label>
              <input
                type="number"
                value={inviteRate}
                onChange={(e) => setInviteRate(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 font-mono text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
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
                  <span>Enregistrer le membre</span>
                )}
              </button>
            </div>
          </form>

        </div>
      </ModalOverlay>

    </div>
  );
};
