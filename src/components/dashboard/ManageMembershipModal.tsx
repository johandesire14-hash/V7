import React, { useState, useRef } from "react";
import {
  X,
  ShieldCheck,
  AlertCircle,
  Calendar,
  CreditCard,
  LogOut,
  CheckCircle2,
  Lock,
  ChevronRight,
  Info,
} from "lucide-react";
import { EnterpriseSubscription } from "../../types";
import { useModalDismiss } from "../../hooks/useModalDismiss";

interface ManageMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: EnterpriseSubscription;
  onCancelSubscription: () => void;
  onLeaveCompany: () => void;
  onViewOffers?: () => void;
  lang?: "fr" | "en";
}

export const ManageMembershipModal: React.FC<ManageMembershipModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onCancelSubscription,
  onLeaveCompany,
  onViewOffers,
  lang = "fr",
}) => {
  const { overlayProps, contentProps } = useModalDismiss({ isOpen, onClose });

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasActivePaidSub = Boolean(subscription.hasPaidOffer) && subscription.status !== "canceled";

  const handleConfirmCancel = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onCancelSubscription();
      setIsProcessing(false);
      setConfirmCancelOpen(false);
      setFeedbackNotice("Votre abonnement a été résilié avec succès. Vous restez membre de l'entreprise.");
      setTimeout(() => setFeedbackNotice(null), 4000);
    }, 500);
  };

  const handleConfirmLeave = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onLeaveCompany();
      setIsProcessing(false);
      setConfirmLeaveOpen(false);
      onClose();
    }, 400);
  };

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        {...contentProps}
        className="relative w-full max-w-lg rounded-2xl bg-[#111319] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#151822]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Gérer l’adhésion</h2>
              <p className="text-xs text-zinc-400">{subscription.companyName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Feedback message banner */}
        {feedbackNotice && (
          <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-zinc-300">
          {/* Section: Abonnements Actifs auprès de cette entreprise */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Abonnements actifs auprès de l'entreprise
              </h3>
            </div>

            {hasActivePaidSub ? (
              /* Fiche d'abonnement actif détaillée */
              <div className="p-4 rounded-xl bg-[#161822] border border-white/10 space-y-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider">
                      Offre en cours
                    </span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {subscription.productName || "Abonnement VIP"}
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {subscription.priceDisplay || "Tarif mensuel"}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-bold font-mono">
                    Statut : Actif
                  </span>
                </div>

                {/* Métadonnées précises */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Calendar className="size-3.5 text-zinc-400 shrink-0" />
                    <span>
                      Début : <strong className="text-white font-medium">{subscription.subscribedAt || "15 Janv. 2026"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <CreditCard className="size-3.5 text-zinc-400 shrink-0" />
                    <span>
                      Renouvellement : <strong className="text-white font-medium">Mensuel</strong>
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex items-center gap-2 text-zinc-400 text-[11px]">
                    <Info className="size-3.5 text-indigo-400 shrink-0" />
                    <span>Prochaine échéance : <span className="text-zinc-200 font-medium">15 Oct. 2026</span></span>
                  </div>
                </div>

                {/* Informations importantes liées à l'abonnement */}
                <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5 text-xs text-zinc-400 space-y-1.5">
                  <div className="font-semibold text-zinc-300">Informations importantes :</div>
                  <ul className="space-y-1 list-disc list-inside text-[11px] leading-relaxed">
                    <li>Accès direct aux canaux Telegram/Discord VIP et alertes en direct.</li>
                    <li>Prélèvement automatique à chaque échéance mensuelle.</li>
                    <li>En cas de résiliation, vos accès restent disponibles jusqu'à l'échéance.</li>
                  </ul>
                </div>

                {/* Action de gestion : Résilier uniquement lorsque permis */}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => setConfirmCancelOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Résilier
                  </button>
                </div>
              </div>
            ) : (
              /* Aucun abonnement actif */
              <div className="p-5 rounded-xl bg-[#161822] border border-white/5 space-y-3 text-center">
                <div className="size-10 rounded-full bg-white/5 mx-auto flex items-center justify-center text-zinc-400">
                  <Info className="size-5 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">
                    Vous n’avez aucun abonnement actif auprès de cette entreprise.
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
                    Le membre peut néanmoins continuer à accéder à son espace membre et aux fonctionnalités gratuites auxquelles il a droit.
                  </p>
                </div>

                {onViewOffers && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewOffers();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    <span>Découvrir les offres disponibles</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Section 3 : Quitter l'entreprise */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400/80">
                Quitter l’entreprise
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Résilier un abonnement et quitter l’entreprise sont deux actions distinctes. Un membre peut résilier un abonnement tout en restant membre, ou quitter l’entreprise même sans abonnement actif.
              </p>
            </div>

            <button
              onClick={() => setConfirmLeaveOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/15 text-rose-300 hover:text-rose-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogOut className="size-4" />
              <span>Quitter l’entreprise</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#151822] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>

      {/* Confirmation Résiliation d'abonnement */}
      {confirmCancelOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#141620] border border-white/15 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="size-5" />
              <h4 className="text-sm font-bold text-white">Résilier l'abonnement ?</h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Êtes-vous sûr de vouloir résilier votre abonnement à{" "}
              <strong className="text-white">{subscription.productName}</strong> ? Vous conserverez vos accès jusqu’à la fin de la période en cours et resterez membre de l'entreprise.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmCancelOpen(false)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? "Résiliation..." : "Confirmer la résiliation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Quitter l'entreprise */}
      {confirmLeaveOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-2xl bg-[#141620] border border-rose-500/30 p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-400">
              <LogOut className="size-5 text-rose-400" />
              <h4 className="text-sm font-bold text-white">Quitter cette entreprise ?</h4>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Vous n’aurez plus accès à votre espace membre auprès de cette entreprise. Vos abonnements actifs éventuels doivent être traités selon leurs propres conditions.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmLeaveOpen(false)}
                disabled={isProcessing}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmLeave}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? "Sortie en cours..." : "Quitter l’entreprise"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
