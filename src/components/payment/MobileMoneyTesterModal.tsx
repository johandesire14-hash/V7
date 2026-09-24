import React, { useState } from "react";
import {
  X,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Server,
  Zap,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { MobileMoneyPaymentForm } from "./MobileMoneyPaymentForm";
import {
  PhoneValidationResult,
  AVAILABLE_DIAL_CODES,
  validatePhoneNumber,
} from "../../utils/phoneValidationRules";
import { useModalDismiss } from "../../hooks/useModalDismiss";

interface MobileMoneyTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoneyTesterModal: React.FC<MobileMoneyTesterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currency, setCurrency] = useState<string>("XAF");
  const [currentValidation, setCurrentValidation] = useState<PhoneValidationResult | null>(null);
  const [serverValidationResponse, setServerValidationResponse] = useState<any>(null);
  const [isCallingServer, setIsCallingServer] = useState<boolean>(false);
  const [formKey, setFormKey] = useState<number>(0);

  // Valeurs initiales injectées pour les scénarios de test
  const [testDialCode, setTestDialCode] = useState<string>("+242");
  const [testOperatorId, setTestOperatorId] = useState<string>("mtn");
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>("06 123 45 67");

  if (!isOpen) return null;

  const handleApplyPreset = (
    dialCode: string,
    operatorId: string,
    phoneNumber: string,
    curr: string
  ) => {
    setTestDialCode(dialCode);
    setTestOperatorId(operatorId);
    setTestPhoneNumber(phoneNumber);
    setCurrency(curr);
    setServerValidationResponse(null);
    setFormKey((prev) => prev + 1);
  };

  const handleTestBackendEndpoint = async () => {
    if (!currentValidation) return;
    setIsCallingServer(true);
    setServerValidationResponse(null);

    try {
      const response = await fetch("/api/payment/validate-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dialCode: currentValidation.dialCode,
          operatorId: currentValidation.operatorId,
          phoneNumber: currentValidation.normalizedNumber,
          currency,
        }),
      });

      const data = await response.json();
      setServerValidationResponse({
        httpStatus: response.status,
        data,
      });
    } catch (err: any) {
      setServerValidationResponse({
        httpStatus: 500,
        error: err.message,
      });
    } finally {
      setIsCallingServer(false);
    }
  };

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEscape: true,
  });

  return (
    <div
      id="mobile-money-tester-modal"
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        {...contentProps}
        className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-[#0f1117] p-5 sm:p-7 shadow-2xl space-y-5 text-white my-auto cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Smartphone className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Laboratoire de Validation Numéros de Téléphone
                </h2>
                <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Directives Complètes
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Vérification Indicatif + Opérateur disponible + Numéro + Devise
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Presets rapides demandés dans les spécifications */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="size-3.5 text-amber-400" />
            <span>Scénarios de test rapides (Conformes au cahier des charges) :</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleApplyPreset("+242", "mtn", "06 123 45 67", "XAF")}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <span>🇨🇬 MTN Valide</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono">06 123 45 67 (9 ch.)</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+242", "mtn", "05 123 45 67", "XAF")}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-red-400 flex items-center gap-1">
                <span>🇨🇬 05 sur MTN</span>
              </div>
              <div className="text-[10px] text-zinc-400">Détecte Airtel ❌</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+242", "mtn", "06 123 45 6", "XAF")}
              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-amber-400 flex items-center gap-1">
                <span>🇨🇬 Longueur 8 ch.</span>
              </div>
              <div className="text-[10px] text-zinc-400">Invalide (9 requis) ❌</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+250", "mtn", "78 123 45 67", "RWF")}
              className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-blue-400 flex items-center gap-1">
                <span>🇷🇼 Rwanda (+250)</span>
              </div>
              <div className="text-[10px] text-zinc-400">Sans Wave ni Orange ✅</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+221", "orange", "77 123 45 67", "XOF")}
              className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-orange-400 flex items-center gap-1">
                <span>🇸🇳 Sénégal (+221)</span>
              </div>
              <div className="text-[10px] text-zinc-400">Orange / Free / Wave</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+225", "mtn", "05 12 34 56 78", "XOF")}
              className="p-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-yellow-400 flex items-center gap-1">
                <span>🇨🇮 Côte d'Ivoire</span>
              </div>
              <div className="text-[10px] text-zinc-400">Format 10 chiffres</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+243", "airtel", "97 123 45 67", "USD")}
              className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-purple-400 flex items-center gap-1">
                <span>🇨🇩 RDC (+243)</span>
              </div>
              <div className="text-[10px] text-zinc-400">CDF ou USD supporté</div>
            </button>

            <button
              type="button"
              onClick={() => handleApplyPreset("+229", "mtn", "01 51 23 45 67", "XOF")}
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-left transition-all cursor-pointer"
            >
              <div className="font-bold text-emerald-400 flex items-center gap-1">
                <span>🇧🇯 Bénin (+229)</span>
              </div>
              <div className="text-[10px] text-zinc-400">MTN / Moov 10 chiffres</div>
            </button>
          </div>
        </div>

        {/* Le composant de validation interactif */}
        <div>
          <MobileMoneyPaymentForm
            key={formKey}
            currency={currency}
            defaultDialCode={testDialCode}
            defaultOperatorId={testOperatorId}
            defaultPhoneNumber={testPhoneNumber}
            onValidationChange={setCurrentValidation}
          />
        </div>

        {/* Panneau de test Backend (Section 10) */}
        <div className="rounded-2xl border border-white/10 bg-[#141620] p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Server className="size-4 text-blue-400" />
              <h4 className="text-xs sm:text-sm font-bold text-white">
                Vérification Stricte Backend (`/api/payment/validate-phone`)
              </h4>
            </div>
            <button
              type="button"
              disabled={isCallingServer}
              onClick={handleTestBackendEndpoint}
              className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isCallingServer ? (
                <RefreshCw className="size-3.5 animate-spin" />
              ) : (
                <ArrowRight className="size-3.5" />
              )}
              <span>Tester vérification serveur</span>
            </button>
          </div>

          {serverValidationResponse && (
            <div
              className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                serverValidationResponse.data?.isValid
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span>
                  Réponse Serveur (HTTP {serverValidationResponse.httpStatus}) :{" "}
                  {serverValidationResponse.data?.isValid ? "✅ VALIDE" : "❌ TRANSACTION REFUSÉE"}
                </span>
                <span className="text-[10px] text-zinc-400">
                  Status: {serverValidationResponse.data?.status}
                </span>
              </div>
              <pre className="text-[11px] overflow-x-auto p-2 bg-black/40 rounded-lg">
                {JSON.stringify(serverValidationResponse.data, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Fermer le testeur
          </button>
        </div>
      </div>
    </div>
  );
};
