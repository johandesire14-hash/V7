import React, { useState } from "react";
import {
  Building2,
  X,
  Check,
  CreditCard,
  Globe,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Store,
  DollarSign,
  Layers,
} from "lucide-react";
import { Company } from "../types";
import { CurrencyCode, SUPPORTED_CURRENCIES } from "../utils/currency";
import { useModalDismiss } from "../hooks/useModalDismiss";

interface CompanyOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated: (company: Omit<Company, "id" | "createdAt">) => void;
  lang?: "fr" | "en";
}

interface PaymentOption {
  id: string;
  name: string;
  iconText: string;
  color: string;
  category: "mobile_money" | "card_bank" | "crypto";
}

const AVAILABLE_PAYMENTS: PaymentOption[] = [
  {
    id: "wave",
    name: "Wave Mobile Money",
    iconText: "🌊",
    color: "border-[#1DC4FA]/40 bg-[#1DC4FA]/10 text-[#1DC4FA]",
    category: "mobile_money",
  },
  {
    id: "orange_money",
    name: "Orange Money",
    iconText: "🟠",
    color: "border-orange-500/40 bg-orange-500/10 text-orange-400",
    category: "mobile_money",
  },
  {
    id: "mtn_momo",
    name: "MTN Mobile Money",
    iconText: "🟡",
    color: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
    category: "mobile_money",
  },
  {
    id: "moov_money",
    name: "Moov Money / Flooz",
    iconText: "🟢",
    color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
    category: "mobile_money",
  },
  {
    id: "card_visa_mastercard",
    name: "Carte Bancaire (Visa / Mastercard)",
    iconText: "💳",
    color: "border-blue-500/40 bg-blue-500/10 text-blue-400",
    category: "card_bank",
  },
  {
    id: "bank_transfer",
    name: "Virement Bancaire (RIB / IBAN)",
    iconText: "🏦",
    color: "border-purple-500/40 bg-purple-500/10 text-purple-400",
    category: "card_bank",
  },
  {
    id: "crypto_usdt",
    name: "Crypto USDT & Stablecoins",
    iconText: "🪙",
    color: "border-teal-500/40 bg-teal-500/10 text-teal-400",
    category: "crypto",
  },
];

const POPULAR_CURRENCIES: Array<{ code: CurrencyCode; label: string; flag: string }> = [
  { code: "XOF", label: "Franc CFA UEMOA (Sénégal, Côte d'Ivoire, Bénin...)", flag: "🇸🇳 🇨🇮 🇧🇯" },
  { code: "XAF", label: "Franc CFA CEMAC (Cameroun, Congo, Gabon...)", flag: "🇨🇲 🇨🇬 🇬🇦" },
  { code: "CDF", label: "Franc Congolais (RD Congo / RDC - FC)", flag: "🇨🇩" },
  { code: "RWF", label: "Franc Rwandais (Rwanda - FRw)", flag: "🇷🇼" },
  { code: "EUR", label: "Euro (France & Diaspora - €)", flag: "🇪🇺" },
  { code: "USD", label: "Dollar Américain (International - $)", flag: "🇺🇸" },
  { code: "GNF", label: "Franc Guinéen (Guinée - GNF)", flag: "🇬🇳" },
  { code: "NGN", label: "Naira Nigérian (Nigéria - ₦)", flag: "🇳🇬" },
  { code: "GHS", label: "Cedi Ghanéen (Ghana - GH₵)", flag: "🇬🇭" },
  { code: "KES", label: "Shilling Kényan (Kenya - KSh)", flag: "🇰🇪" },
  { code: "MAD", label: "Dirham Marocain (Maroc - DH)", flag: "🇲🇦" },
];

export const CompanyOnboardingModal: React.FC<CompanyOnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompanyCreated,
  lang = "fr",
}) => {
  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [acceptedPayments, setAcceptedPayments] = useState<string[]>([
    "wave",
    "orange_money",
    "mtn_momo",
    "card_visa_mastercard",
  ]);
  const [primaryCurrency, setPrimaryCurrency] = useState<CurrencyCode>("XOF");
  const [supportEmail, setSupportEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const togglePayment = (id: string) => {
    setAcceptedPayments((prev) =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter((p) => p !== id) : prev) : [...prev, id]
    );
  };

  const getInitials = (str: string) => {
    if (!str.trim()) return "EN";
    return str
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || "")
      .slice(0, 2)
      .join("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Veuillez saisir le nom de votre entreprise.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      onCompanyCreated({
        name: name.trim(),
        description: description.trim() || "Vitrine officielle et services digitaux",
        acceptedPayments,
        primaryCurrency,
        logoInitials: getInitials(name),
        supportEmail: supportEmail.trim(),
      });
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEscape: true,
  });

  if (!isOpen) return null;

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/85 backdrop-blur-md animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        {...contentProps}
        className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0e1014] text-white shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col cursor-default"
      >
        {/* Modal Top Header Banner */}
        <div className="relative px-6 py-5 border-b border-white/10 bg-gradient-to-r from-[#14171f] via-[#101217] to-[#0e1014] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#3DDC84]/15 border border-[#3DDC84]/30 text-[#3DDC84]">
              <Building2 className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {lang === "fr" ? "Créer une nouvelle entreprise" : "Create a new enterprise"}
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === "fr"
                  ? "Configurez l'identité, les moyens de paiement et la devise principale de votre entreprise."
                  : "Setup identity, accepted payment methods and primary currency for your enterprise."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body with Scroll */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <span className="size-2 rounded-full bg-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Identité de l'entreprise */}
          <div className="space-y-4 rounded-xl border border-white/10 bg-[#14161d] p-4.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Store className="size-4 text-[#3DDC84]" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  {lang === "fr" ? "1. Identité de l'Entreprise" : "1. Enterprise Identity"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-600 via-teal-700 to-black text-[11px] font-black text-white shadow-inner font-mono">
                  {getInitials(name)}
                </div>
                <span className="text-[11px] text-zinc-400 font-mono">Aperçu</span>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-zinc-200 font-semibold mb-1.5">
                  {lang === "fr" ? "Nom de l'entreprise *" : "Enterprise Name *"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder={lang === "fr" ? "Ex: AfriTech Academy, Studio K, Mansa Digital..." : "e.g. AfriTech Academy"}
                  className="w-full rounded-xl border border-white/10 bg-[#0c0d10] px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#3DDC84] focus:ring-1 focus:ring-[#3DDC84] transition-all font-medium"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-zinc-200 font-semibold mb-1.5">
                  {lang === "fr" ? "Description de la vitrine" : "Showcase Description"}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    lang === "fr"
                      ? "Ex: Accès VIP exclusif, formations vidéo business et ressources premium pour créateurs."
                      : "Brief description of your products and showcase..."
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#0c0d10] px-3.5 py-2.5 text-white placeholder-zinc-500 text-xs outline-none focus:border-[#3DDC84] focus:ring-1 focus:ring-[#3DDC84] transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  {lang === "fr" ? "Email de contact / support (optionnel)" : "Support Email (optional)"}
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="support@votre-entreprise.com"
                  className="w-full rounded-xl border border-white/10 bg-[#0c0d10] px-3.5 py-2 text-zinc-300 placeholder-zinc-600 text-xs outline-none focus:border-[#3DDC84] transition-all"
                />
              </div>
            </div>
          </div>

          {/* 2. Moyens de Paiement Acceptés */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#14161d] p-4.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-emerald-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  {lang === "fr" ? "2. Moyens de Paiement Acceptés" : "2. Accepted Payment Methods"}
                </h3>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {acceptedPayments.length} sélectionné{acceptedPayments.length > 1 ? "s" : ""}
              </span>
            </div>

            <p className="text-[11px] text-zinc-400">
              {lang === "fr"
                ? "Activez les méthodes de paiement que vos clients pourront utiliser pour acheter vos produits et abonnements."
                : "Select payment methods your customers can use at checkout."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {AVAILABLE_PAYMENTS.map((payment) => {
                const isSelected = acceptedPayments.includes(payment.id);
                return (
                  <button
                    type="button"
                    key={payment.id}
                    onClick={() => togglePayment(payment.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? `${payment.color} border-current shadow-sm`
                        : "border-white/10 bg-[#0c0d10] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none shrink-0">{payment.iconText}</span>
                      <div className="min-w-0">
                        <span className="font-bold block text-xs truncate text-white">
                          {payment.name}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`size-4.5 rounded-md border flex items-center justify-center shrink-0 ml-2 transition-all ${
                        isSelected
                          ? "bg-[#3DDC84] border-[#3DDC84] text-black"
                          : "border-white/20 bg-black/20"
                      }`}
                    >
                      {isSelected && <Check className="size-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Devise Principale de l'Entreprise */}
          <div className="space-y-3 rounded-xl border border-white/10 bg-[#14161d] p-4.5">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <Globe className="size-4 text-purple-400" />
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">
                  {lang === "fr" ? "3. Devise Principale de l'Entreprise" : "3. Primary Enterprise Currency"}
                </h3>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#3DDC84] px-2 py-0.5 rounded bg-[#3DDC84]/15">
                {primaryCurrency} ({SUPPORTED_CURRENCIES[primaryCurrency]?.symbol || "$"})
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-zinc-200 font-semibold">
                {lang === "fr" ? "Devise de tarification par défaut" : "Default Pricing Currency"}
              </label>
              <select
                value={primaryCurrency}
                onChange={(e) => setPrimaryCurrency(e.target.value as CurrencyCode)}
                className="w-full rounded-xl border border-white/10 bg-[#0c0d10] p-3 text-white text-xs font-mono outline-none focus:border-[#3DDC84] cursor-pointer"
              >
                {POPULAR_CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code} className="bg-[#12141a] text-white">
                    {curr.flag} {curr.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-zinc-400">
                {lang === "fr"
                  ? "Vos acheteurs verront les prix dans cette devise et pourront payer en monnaie locale avec conversion automatique en direct."
                  : "Buyers will see prices in this currency with real-time automatic conversion."}
              </p>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer transition-colors"
            >
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`mansa-btn-green px-6 py-2.5 text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                !name.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Building2 className="size-4" />
              <span>{isSubmitting ? "Création en cours..." : lang === "fr" ? "Créer l'entreprise" : "Create Enterprise"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
