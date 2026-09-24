import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  Trash2,
  X,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  itemName?: string;
  itemType?: string;
  itemDetails?: { label: string; value: string }[];
  consequences?: string[];
  confirmButtonText?: string;
  cancelButtonText?: string;
  variant?: "danger" | "warning" | "info";
  requireTextMatch?: string;
  lang?: "fr" | "en";
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemType = "Élément",
  itemDetails,
  consequences,
  confirmButtonText,
  cancelButtonText,
  variant = "danger",
  requireTextMatch,
  lang = "fr",
}) => {
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTypedConfirmation("");
      setIsProcessing(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isProcessing) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isProcessing, onClose]);

  if (!isOpen) return null;

  const isConfirmedDisabled =
    isProcessing ||
    (requireTextMatch ? typedConfirmation.trim().toLowerCase() !== requireTextMatch.trim().toLowerCase() : false);

  const handleConfirm = async () => {
    if (isConfirmedDisabled) return;
    try {
      setIsProcessing(true);
      await onConfirm();
      setIsProcessing(false);
      onClose();
    } catch (e) {
      console.error("Error during confirmed action", e);
      setIsProcessing(false);
    }
  };

  const defaultConsequences =
    variant === "danger"
      ? [
          lang === "fr"
            ? "Cette action est irréversible et supprimera définitivement les données associées."
            : "This action is irreversible and will permanently delete all associated data.",
          lang === "fr"
            ? "Les liens publics et accès membres rattachés deviendront inactifs immédiatement."
            : "Public links and attached member accesses will become inactive immediately.",
        ]
      : undefined;

  const displayConsequences = consequences || defaultConsequences;

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEscape: true,
    disabled: isProcessing,
  });

  return (
    <div
      id="confirm-action-modal-overlay"
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        id="confirm-action-modal-container"
        {...contentProps}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl text-left space-y-5 animate-in zoom-in-95 duration-150 relative overflow-hidden cursor-default"
      >
        {/* Top Accent Bar */}
        <div
          className={`absolute top-0 left-0 right-0 h-1 ${
            variant === "danger"
              ? "bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"
              : variant === "warning"
              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
              : "bg-gradient-to-r from-[#00D26A] to-emerald-400"
          }`}
        />

        {/* Header with Icon & Close */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div
              className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${
                variant === "danger"
                  ? "bg-red-500/10 border-red-500/30 text-red-400"
                  : variant === "warning"
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-blue-500/10 border-blue-500/30 text-blue-400"
              }`}
            >
              {variant === "danger" ? (
                <Trash2 className="size-5" />
              ) : variant === "warning" ? (
                <AlertTriangle className="size-5" />
              ) : (
                <ShieldAlert className="size-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-red-400 font-bold block">
                {lang === "fr" ? "Action irréversible" : "Irreversible Action"}
              </span>
              <h3 className="text-base font-bold text-white leading-snug">{title}</h3>
            </div>
          </div>

          <button
            id="close-confirm-modal-btn"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-zinc-300 leading-relaxed font-normal">
            {description}
          </p>
        )}

        {/* Highlighted Target Item Card */}
        {itemName && (
          <div className="p-3.5 rounded-xl bg-[#181a20] border border-white/[0.08] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-zinc-400 uppercase">{itemType}</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400">
                {lang === "fr" ? "Cible de suppression" : "Target to delete"}
              </span>
            </div>
            <div className="font-bold text-white text-sm truncate flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-400 shrink-0" />
              <span className="truncate">{itemName}</span>
            </div>

            {itemDetails && itemDetails.length > 0 && (
              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                {itemDetails.map((detail, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="text-zinc-500 block text-[10px]">{detail.label}</span>
                    <span className="font-mono font-semibold text-zinc-200 truncate block">
                      {detail.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Consequences Checklist */}
        {displayConsequences && displayConsequences.length > 0 && (
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-semibold text-zinc-400 block">
              {lang === "fr" ? "Conséquences directes :" : "Direct consequences:"}
            </span>
            <div className="space-y-1.5 rounded-xl bg-red-950/20 border border-red-500/20 p-3">
              {displayConsequences.map((cons, idx) => (
                <div key={idx} className="flex items-start gap-2 text-[11px] text-zinc-300">
                  <span className="text-red-400 font-bold shrink-0 mt-0.5">•</span>
                  <span>{cons}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optional Type to Confirm */}
        {requireTextMatch && (
          <div className="space-y-1.5 text-xs">
            <label className="block text-zinc-300 font-semibold">
              {lang === "fr" ? (
                <>
                  Pour confirmer, tapez <strong className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">{requireTextMatch}</strong> ci-dessous :
                </>
              ) : (
                <>
                  To confirm, type <strong className="text-white font-mono bg-white/10 px-1 py-0.5 rounded">{requireTextMatch}</strong> below:
                </>
              )}
            </label>
            <input
              type="text"
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value)}
              placeholder={requireTextMatch}
              className="w-full rounded-xl border border-white/15 bg-[#181a20] p-2.5 font-mono text-xs text-white outline-none focus:border-red-500 transition-colors"
              autoFocus
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            id="cancel-confirm-modal-btn"
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-[#181a20] hover:bg-[#20222a] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelButtonText || (lang === "fr" ? "Annuler" : "Cancel")}
          </button>

          <button
            id="submit-confirm-modal-btn"
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmedDisabled}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg cursor-pointer ${
              isConfirmedDisabled
                ? "bg-red-900/50 opacity-50 cursor-not-allowed"
                : variant === "danger"
                ? "bg-red-600 hover:bg-red-500 shadow-red-900/30"
                : "bg-amber-600 hover:bg-amber-500 shadow-amber-900/30"
            }`}
          >
            {isProcessing ? (
              <>
                <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>{lang === "fr" ? "Suppression en cours..." : "Deleting..."}</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>
                  {confirmButtonText || (lang === "fr" ? "Confirmer la suppression" : "Confirm deletion")}
                </span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
