import React, { useState } from "react";
import { CreditCard, Smartphone, X } from "lucide-react";
import { ModalOverlay } from "../common/ModalOverlay";
import { MobileMoneyPaymentForm } from "../payment/MobileMoneyPaymentForm";

export interface CheckoutPreviewPlan {
  id: string;
  name: string;
  price: number;
  currency?: string;
  billing: "monthly" | "yearly" | "one_time" | "free";
}

interface CheckoutPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  productName: string;
  description: string;
  productImage?: string | null;
  pricingType: "free" | "paid";
  priceAmount: number;
  billingCycle: "monthly" | "yearly" | "one_time";
  currencyCode: string;
  currencySymbol: string;
  pricingOptions: CheckoutPreviewPlan[];
  selectedPlanId: string;
  onPlanChange: (planId: string) => void;
  mode?: "preview" | "live";
  initialEmail?: string;
  onEmailChange?: (email: string) => void;
  initialPaymentMethod?: "card" | "mobile_money";
  onPaymentMethodChange?: (method: "card" | "mobile_money") => void;
  onMobileMoneyValidationChange?: (result: any) => void;
  onSubmit?: () => void;
  isProcessing?: boolean;
  isSubmitDisabled?: boolean;
  paymentError?: string | null;
}

const billingLabel = (billing: CheckoutPreviewPlan["billing"]) => {
  switch (billing) {
    case "monthly":
      return "par mois";
    case "yearly":
      return "par an";
    case "free":
      return "accès gratuit";
    default:
      return "paiement unique";
  }
};

export const CheckoutPreviewModal: React.FC<CheckoutPreviewModalProps> = ({
  isOpen,
  onClose,
  companyName,
  productName,
  description,
  productImage,
  pricingType,
  priceAmount,
  billingCycle,
  currencyCode,
  currencySymbol,
  pricingOptions,
  selectedPlanId,
  onPlanChange,
  mode = "preview",
  initialEmail = "",
  onEmailChange,
  initialPaymentMethod = "card",
  onPaymentMethodChange,
  onMobileMoneyValidationChange,
  onSubmit,
  isProcessing = false,
  isSubmitDisabled = false,
  paymentError = null,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">(initialPaymentMethod);

  if (!isOpen) return null;

  const selectedPlan =
    pricingOptions.find((option) => option.id === selectedPlanId) || pricingOptions[0];
  const amount = pricingType === "free" ? 0 : selectedPlan?.price ?? priceAmount;
  const cycle = selectedPlan?.billing || billingCycle;
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(amount);
  const companyInitials = companyName.trim().slice(0, 2).toUpperCase() || "MP";

  return (
    <ModalOverlay
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[70]"
      backdropClassName="bg-black/75 backdrop-blur-md"
      contentClassName="max-w-[510px] mx-auto"
    >
      <section
        aria-labelledby="checkout-preview-title"
        className="max-h-[92vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#101012] text-white shadow-2xl"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#101012]/95 px-4 py-3 backdrop-blur sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="size-9 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              {productImage ? (
                <img src={productImage} alt="" className="size-full object-cover" />
              ) : (
                <span className="flex size-full items-center justify-center text-xs font-bold text-zinc-200">
                  {companyInitials}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-zinc-300">{companyName}</p>
              <h2 id="checkout-preview-title" className="truncate text-sm font-bold text-white">
                {productName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer le checkout"
            className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="space-y-5 p-4 sm:p-5">
          <div className="space-y-1 text-center">
            <p className="text-xs font-semibold text-zinc-200">Finalisez votre commande</p>
            {description.trim() && (
              <p className="mx-auto max-w-md text-[11px] leading-relaxed text-zinc-400">
                {description}
              </p>
            )}
            <p className="pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Tarif officiel
            </p>
            <p className="text-3xl font-black tracking-tight text-white">
              {pricingType === "free" ? "Gratuit" : `${formattedAmount} ${currencySymbol}`}
            </p>
            {pricingType === "paid" && (
              <p className="text-[11px] text-zinc-400">{billingLabel(cycle)}</p>
            )}
          </div>

          {pricingOptions.length > 1 && (
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold text-zinc-200">Choisissez votre formule :</legend>
              {pricingOptions.map((option) => {
                const isSelected = option.id === (selectedPlan?.id || selectedPlanId);
                const optionAmount = new Intl.NumberFormat("fr-FR", {
                  maximumFractionDigits: 2,
                }).format(option.price);
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-xs transition-colors ${
                      isSelected
                        ? "border-blue-500/70 bg-blue-500/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <input
                        type="radio"
                        name="checkout-preview-plan"
                        checked={isSelected}
                        onChange={() => onPlanChange(option.id)}
                        className="size-3.5 accent-blue-500"
                      />
                      <span className="truncate">{option.name}</span>
                    </span>
                    <span className="shrink-0 font-mono font-bold text-white">
                      {optionAmount} {currencySymbol}
                    </span>
                  </label>
                );
              })}
            </fieldset>
          )}

          <div className="space-y-1.5">
            <label htmlFor="checkout-preview-email" className="text-[11px] font-semibold text-zinc-300">
              Votre adresse email pour la confirmation :
            </label>
            <input
              id="checkout-preview-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                onEmailChange?.(event.target.value);
              }}
              placeholder="nom@exemple.com"
              className="w-full rounded-lg border border-white/10 bg-[#18181b] px-3 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-500"
            />
          </div>

          {pricingType === "paid" && (
            <fieldset className="space-y-2.5">
              <legend className="text-[11px] font-bold text-zinc-300">
                Mode de paiement sécurisé :
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  aria-pressed={paymentMethod === "card"}
                  onClick={() => {
                    setPaymentMethod("card");
                    onPaymentMethodChange?.("card");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    paymentMethod === "card"
                      ? "border-blue-500/70 bg-blue-500/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="size-4 text-blue-400" />
                  Carte bancaire
                </button>
                <button
                  type="button"
                  aria-pressed={paymentMethod === "mobile_money"}
                  onClick={() => {
                    setPaymentMethod("mobile_money");
                    onPaymentMethodChange?.("mobile_money");
                  }}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors ${
                    paymentMethod === "mobile_money"
                      ? "border-amber-400/70 bg-amber-400/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white"
                  }`}
                >
                  <Smartphone className="size-4 text-amber-400" />
                  Mobile Money
                </button>
              </div>

              {paymentMethod === "card" ? (
                <div className="space-y-2 rounded-xl border border-white/10 bg-[#18181b] p-3.5" aria-label="Aperçu du formulaire carte bancaire">
                  <label className="block space-y-1 text-[10px] font-medium text-zinc-400">
                    Numéro de carte
                    <input disabled={mode === "preview"} placeholder="1234  5678  9012  3456" className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-600" />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block space-y-1 text-[10px] font-medium text-zinc-400">
                      Expiration
                      <input disabled={mode === "preview"} placeholder="MM / AA" className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-600" />
                    </label>
                    <label className="block space-y-1 text-[10px] font-medium text-zinc-400">
                      CVC
                      <input disabled={mode === "preview"} placeholder="CVC" className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-500 placeholder:text-zinc-600" />
                    </label>
                  </div>
                </div>
              ) : (
                <MobileMoneyPaymentForm
                  currency={currencyCode}
                  onValidationChange={(result) => onMobileMoneyValidationChange?.(result)}
                  defaultDialCode="+242"
                  className="rounded-xl border border-white/10 bg-[#18181b] p-3.5"
                />
              )}
            </fieldset>
          )}

          <div className="space-y-2 border-t border-white/10 pt-4">
            <button
              type="button"
              disabled={mode === "preview" || isSubmitDisabled || isProcessing}
              onClick={onSubmit}
              title={mode === "preview" ? "Aperçu uniquement" : undefined}
              className="w-full cursor-not-allowed rounded-xl bg-[#1769e8] px-4 py-3 text-sm font-bold text-white opacity-70"
            >
              {isProcessing
                ? "Validation sécurisée..."
                : pricingType === "free"
                ? "Rejoindre gratuitement"
                : `Payer ${formattedAmount} ${currencySymbol}`}
            </button>
            {paymentError && <p className="text-center text-[10px] text-red-300">{paymentError}</p>}
            {mode === "preview" && (
              <p className="text-center text-[10px] text-zinc-500">
                Aperçu du checkout : aucun paiement n’est effectué depuis le studio.
              </p>
            )}
          </div>
        </div>
      </section>
    </ModalOverlay>
  );
};
