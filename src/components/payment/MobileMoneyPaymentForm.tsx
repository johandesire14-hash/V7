import React, { useState, useEffect, useId, useMemo } from "react";
import {
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Info,
  ArrowRight,
  Check,
} from "lucide-react";
import {
  DIAL_CODE_CONFIGS,
  validatePhoneNumber,
  PhoneValidationResult,
  formatPhoneNumber,
  normalizePhoneNumber,
} from "../../utils/phoneValidationRules";

// Ordre des indicatifs conformes aux spécifications du cahier des charges
const ORDERED_DIAL_CODES = ["+221", "+242", "+243", "+225", "+237", "+229", "+250"];

interface MobileMoneyPaymentFormProps {
  currency?: string;
  onValidationChange: (result: PhoneValidationResult) => void;
  defaultDialCode?: string;
  defaultOperatorId?: string;
  defaultPhoneNumber?: string;
  className?: string;
}

export const MobileMoneyPaymentForm: React.FC<MobileMoneyPaymentFormProps> = ({
  currency = "XAF",
  onValidationChange,
  defaultDialCode = "+242",
  defaultOperatorId,
  defaultPhoneNumber = "",
  className = "",
}) => {
  const dialCodeSelectId = useId();
  const phoneNumberInputId = useId();

  // Liste des indicatifs disponibles (uniquement les codes internationaux)
  const dialCodesList = useMemo(() => {
    const definedCodes = Object.keys(DIAL_CODE_CONFIGS);
    const sorted = [...ORDERED_DIAL_CODES.filter((code) => definedCodes.includes(code))];
    definedCodes.forEach((c) => {
      if (!sorted.includes(c)) sorted.push(c);
    });
    return sorted;
  }, []);

  // Indicatif international sélectionné (ex: "+242")
  const [selectedDialCode, setSelectedDialCode] = useState<string>(() => {
    return DIAL_CODE_CONFIGS[defaultDialCode] ? defaultDialCode : "+242";
  });

  // Configuration du pays déduite automatiquement de l'indicatif
  const currentCountryConfig = useMemo(() => {
    return DIAL_CODE_CONFIGS[selectedDialCode] || DIAL_CODE_CONFIGS["+242"];
  }, [selectedDialCode]);

  // Opérateur sélectionné parmi ceux disponibles pour cet indicatif
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>(() => {
    if (defaultOperatorId) {
      const match = currentCountryConfig.operators.find(
        (op) => op.id.toLowerCase() === defaultOperatorId.toLowerCase()
      );
      if (match) return match.id;
    }
    return currentCountryConfig.operators[0]?.id || "mtn";
  });

  // Quand l'indicatif change, filtrer et réajuster l'opérateur
  const handleDialCodeChange = (newCode: string) => {
    setSelectedDialCode(newCode);
    const targetConfig = DIAL_CODE_CONFIGS[newCode];
    if (targetConfig && targetConfig.operators.length > 0) {
      const stillValid = targetConfig.operators.some(
        (op) => op.id.toLowerCase() === selectedOperatorId.toLowerCase()
      );
      if (!stillValid) {
        setSelectedOperatorId(targetConfig.operators[0].id);
      }
    }
  };

  // Numéro de téléphone brut sans indicatif
  const [rawPhoneNumber, setRawPhoneNumber] = useState<string>(() => {
    return normalizePhoneNumber(defaultPhoneNumber, defaultDialCode);
  });

  // Opérateur actuellement sélectionné
  const currentOperator = useMemo(() => {
    return (
      currentCountryConfig.operators.find(
        (op) => op.id.toLowerCase() === selectedOperatorId.toLowerCase()
      ) || currentCountryConfig.operators[0]
    );
  }, [currentCountryConfig, selectedOperatorId]);

  // Validation en temps réel
  const validationResult = useMemo(() => {
    if (!currentOperator) {
      return {
        isValid: false,
        status: "operator_unavailable" as const,
        dialCode: selectedDialCode,
        operatorId: selectedOperatorId,
        normalizedNumber: "",
        formattedNumber: "",
        fullInternationalNumber: "",
        errorMessage: "Opérateur non sélectionné",
      };
    }
    return validatePhoneNumber(
      selectedDialCode,
      currentOperator.id,
      rawPhoneNumber,
      currency
    );
  }, [selectedDialCode, currentOperator, rawPhoneNumber, currency]);

  // Notifier le composant parent à chaque changement de validation
  useEffect(() => {
    onValidationChange(validationResult);
  }, [validationResult, onValidationChange]);

  // Gestionnaire de saisie avec normalisation automatique
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const cleanDigits = normalizePhoneNumber(val, selectedDialCode);
    if (currentOperator && cleanDigits.length > currentOperator.nationalLength + 2) {
      return;
    }
    setRawPhoneNumber(cleanDigits);
  };

  // Bascule rapide vers un opérateur suggéré (ex: saisie de 05 sur MTN Congo)
  const handleSwitchToSuggested = (suggestedOpId: string) => {
    setSelectedOperatorId(suggestedOpId);
  };

  // Formatage visuel avec espaces pour l'utilisateur
  const displayFormattedValue = useMemo(() => {
    if (!currentOperator || !rawPhoneNumber) return rawPhoneNumber;
    return formatPhoneNumber(rawPhoneNumber, currentOperator.formatGroups);
  }, [rawPhoneNumber, currentOperator]);

  return (
    <div
      id="mobile-money-payment-form"
      className={`space-y-3.5 ${className}`}
    >
      {/* ============================================================ */}
      {/* 1. SÉLECTION DE L'OPÉRATEUR DISPONIBLE POUR CET INDICATIF   */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
            Opérateur
          </label>
          <span className="text-[10px] text-zinc-500">
            Disponible pour {selectedDialCode}
          </span>
        </div>

        {/* Boutons d'opérateurs disponibles uniquement */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {currentCountryConfig.operators.map((op) => {
            const isSelected = selectedOperatorId.toLowerCase() === op.id.toLowerCase();
            return (
              <button
                key={op.id}
                type="button"
                id={`operator-btn-${op.id}`}
                onClick={() => setSelectedOperatorId(op.id)}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-amber-400/15 border-amber-400 text-white shadow-sm shadow-amber-400/20"
                    : "bg-[#1b1e2a] border-white/10 text-zinc-300 hover:bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: op.brandColor || "#FFCC00" }}
                  />
                  <span>{op.name}</span>
                </div>
                {isSelected && (
                  <Check className="size-3.5 text-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. CHAMP DE TÉLÉPHONE AVEC SÉLECTEUR D'INDICATIF INTÉGRÉ    */}
      {/*    [ +242 ▾ ] [ 06 XXX XX XX ]                              */}
      {/* ============================================================ */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor={phoneNumberInputId}
            className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider"
          >
            Numéro de téléphone
          </label>
          {currentOperator && (
            <span className="text-[10px] font-mono text-zinc-400">
              Format attendu : {currentOperator.format}
            </span>
          )}
        </div>

        {/* Conteneur unifié : Sélecteur d'indicatif à gauche + Champ numéro à droite */}
        <div
          className={`flex items-stretch rounded-xl border bg-[#12141c] transition-all overflow-hidden ${
            validationResult.isValid
              ? "border-emerald-500/70 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/40 bg-emerald-500/5"
              : rawPhoneNumber.length > 0
              ? "border-red-500/70 focus-within:border-red-400 focus-within:ring-1 focus-within:ring-red-400/40 bg-red-500/5"
              : "border-white/15 focus-within:border-amber-400 focus-within:ring-1 focus-within:ring-amber-400/30"
          }`}
        >
          {/* Partie gauche : Sélecteur d'indicatif avec UNIQUEMENT les codes internationaux (+221, +242, etc.) */}
          <div className="relative flex items-center bg-[#1b1e2a] hover:bg-[#222634] border-r border-white/10 transition-colors shrink-0">
            <select
              id={dialCodeSelectId}
              aria-label="Indicatif international"
              value={selectedDialCode}
              onChange={(e) => handleDialCodeChange(e.target.value)}
              className="appearance-none bg-transparent pl-3 pr-7 py-2.5 text-xs sm:text-sm font-mono font-bold text-white outline-none cursor-pointer"
            >
              {dialCodesList.map((code) => (
                <option
                  key={code}
                  value={code}
                  className="bg-[#161822] text-white py-1.5 font-mono"
                >
                  {code}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400">
              <ChevronDown className="size-3.5" />
            </div>
          </div>

          {/* Partie droite : Champ de saisie avec placeholder adapté */}
          <div className="relative flex-1 flex items-center">
            <input
              id={phoneNumberInputId}
              type="tel"
              inputMode="numeric"
              value={displayFormattedValue}
              onChange={handlePhoneChange}
              placeholder={currentOperator?.format || "06 XXX XX XX"}
              className="w-full bg-transparent py-2.5 pl-3 pr-9 text-xs sm:text-sm font-mono text-white placeholder-zinc-600 outline-none"
            />
            <div className="absolute right-3 pointer-events-none">
              {validationResult.isValid ? (
                <CheckCircle2 className="size-4 text-emerald-400 animate-in zoom-in-50 duration-150" />
              ) : rawPhoneNumber.length > 0 ? (
                <AlertCircle className="size-4 text-red-400 animate-in zoom-in-50 duration-150" />
              ) : null}
            </div>
          </div>
        </div>

        {/* Compteur de chiffres saisis */}
        {currentOperator && (
          <div className="flex items-center justify-between text-[10px] text-zinc-400 px-1 pt-0.5">
            <span>Saisie sans indicatif (normalisation automatique)</span>
            <span
              className={`font-mono font-bold ${
                rawPhoneNumber.length === currentOperator.nationalLength
                  ? "text-emerald-400"
                  : rawPhoneNumber.length > currentOperator.nationalLength
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}
            >
              {rawPhoneNumber.length} / {currentOperator.nationalLength} chiffres
            </span>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* 3. RETOUR DE VALIDATION EN TEMPS RÉEL                        */}
      {/* ============================================================ */}
      <div id="validation-feedback-box" className="pt-0.5">
        {/* CAS VALIDE */}
        {validationResult.isValid && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-start gap-2.5 text-emerald-300 animate-in fade-in duration-200">
            <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5 text-xs">
              <div className="font-bold flex items-center gap-1.5 text-white">
                <span>✅ Numéro valide</span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-1.5 py-0.2 rounded border border-emerald-500/30">
                  {validationResult.fullInternationalNumber}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">
                  · {currentOperator?.name}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-tight">
                Numéro conforme aux spécifications {currentOperator?.name} ({selectedDialCode}).
              </p>
            </div>
          </div>
        )}

        {/* CAS INVALIDE : Incompatibilité opérateur / préfixe */}
        {!validationResult.isValid &&
          validationResult.status === "incompatible_prefix" && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 space-y-2 text-red-200 animate-in fade-in duration-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-white">
                    ❌ Numéro incompatible avec {currentOperator?.name}
                  </div>
                  <p className="text-[11px] text-red-200/90 leading-relaxed">
                    {validationResult.errorMessage}
                  </p>
                </div>
              </div>

              {/* Bouton d'action pour basculer vers l'opérateur détecté */}
              {validationResult.suggestedOperator && (
                <div className="pt-1.5 border-t border-red-500/20 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-300">
                    Changer pour l'opérateur correspondant :
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleSwitchToSuggested(validationResult.suggestedOperator!.id)
                    }
                    className="py-1 px-2.5 rounded-lg bg-red-500/25 hover:bg-red-500/35 text-white font-bold text-[11px] border border-red-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>Sélectionner {validationResult.suggestedOperator.name}</span>
                    <ArrowRight className="size-3" />
                  </button>
                </div>
              )}
            </div>
          )}

        {/* CAS INVALIDE : Longueur incorrecte */}
        {!validationResult.isValid &&
          validationResult.status === "invalid_length" &&
          rawPhoneNumber.length > 0 && (
            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-start gap-2 text-amber-200 animate-in fade-in duration-200">
              <AlertCircle className="size-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white">
                  ❌ Longueur de numéro incorrecte
                </div>
                <p className="text-[11px] text-amber-200/90 leading-relaxed">
                  {validationResult.errorMessage}
                </p>
              </div>
            </div>
          )}

        {/* CAS INVALIDE : Devise incompatible */}
        {!validationResult.isValid &&
          validationResult.status === "incompatible_currency" && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 flex items-start gap-2 text-red-200 animate-in fade-in duration-200">
              <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-white">
                  ❌ {validationResult.errorTitle}
                </div>
                <p className="text-[11px] text-red-200/90 leading-relaxed">
                  {validationResult.errorMessage}
                </p>
              </div>
            </div>
          )}

        {/* CAS : Champ encore vide */}
        {rawPhoneNumber.length === 0 && (
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] text-zinc-400 flex items-center gap-2">
            <Info className="size-3.5 text-zinc-500 shrink-0" />
            <span>
              Saisissez votre numéro {currentOperator?.name} sans indicatif ({selectedDialCode}).
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
