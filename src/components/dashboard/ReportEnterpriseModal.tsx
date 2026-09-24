import React, { useState, useRef } from "react";
import { X, Flag, CheckCircle2, AlertTriangle } from "lucide-react";
import { useModalDismiss } from "../../hooks/useModalDismiss";
import { db, collection, addDoc } from "../../services/firebase";

interface ReportEnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  companyLogo?: string;
  lang?: "fr" | "en";
}

const REPORT_REASONS = [
  "Contenu trompeur ou mensonger",
  "Non-respect des engagements / Absence de livraison",
  "Arnaque ou escroquerie financière",
  "Violation des droits d'auteur ou plagiat",
  "Spam, harcèlement ou comportement toxique",
  "Autre motif",
];

export const ReportEnterpriseModal: React.FC<ReportEnterpriseModalProps> = ({
  isOpen,
  onClose,
  companyName,
  companyLogo,
  lang = "fr",
}) => {
  const { overlayProps, contentProps } = useModalDismiss({ isOpen, onClose });

  const [selectedReason, setSelectedReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reportPayload = {
      companyName,
      reason: selectedReason,
      details: details.trim(),
      createdAt: new Date().toISOString(),
      status: "pending",
    };

    // 1. Enregistrement direct dans Firestore (sécurisé par les règles reports)
    try {
      addDoc(collection(db, "reports"), reportPayload).catch((err) =>
        console.warn("Notice: Firestore report write:", err)
      );
    } catch (e) {}

    // 2. Enregistrement serveur
    if (typeof fetch !== "undefined") {
      fetch("/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportPayload),
      }).catch((err) => console.warn("Notice: Server report submit:", err));
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setDetails("");
        onClose();
      }, 2500);
    }, 600);
  };

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        {...contentProps}
        className="relative w-full max-w-md rounded-2xl bg-[#111319] border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#151822]">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Flag className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Signaler l’entreprise</h2>
              <p className="text-xs text-zinc-400">Signalement auprès des gérants du site · {companyName}</p>
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

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Signalement transmis</h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Votre signalement a été transmis aux gérants du site afhub. Notre équipe étudiera ce dossier sous 24h avec la plus grande attention.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-zinc-300">
            <div className="space-y-2">
              <label className="font-semibold text-zinc-200 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-400" />
                <span>Sélectionnez le motif du signalement</span>
              </label>
              <div className="space-y-1.5">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      selectedReason === reason
                        ? "bg-rose-500/10 border-rose-500/40 text-white font-medium"
                        : "bg-white/[0.03] border-white/5 text-zinc-400 hover:border-white/15 hover:text-zinc-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportReason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="accent-rose-500"
                    />
                    <span className="text-xs">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-zinc-200">
                Détails complémentaires (facultatif)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Précisez les faits constatés, liens ou captures utiles..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-rose-500/50 resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
              >
                {isSubmitting ? "Envoi..." : "Signaler aux gérants du site"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
