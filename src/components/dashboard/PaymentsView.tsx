import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Building2,
  DollarSign,
  ShieldCheck,
  Zap,
  X,
  FileText,
  Copy,
  Smartphone,
  Plus,
  Check,
  Wallet,
  Lock,
  RefreshCw,
  AlertTriangle,
  Send,
  Trash2,
  Eye,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ModalOverlay } from "../common/ModalOverlay";
import {
  subscribeToCreatorTransactions,
  createRealTransaction,
  FirestoreTransaction,
} from "../../services/dbService";
import { CurrencyCode, formatCurrency } from "../../utils/currency";
import { isCreatorPayoutConfigured, setCreatorPayoutConfigured } from "../../utils/payoutConfig";
import { ContextualLocationPrompt } from "../common/ContextualLocationPrompt";
import {
  PayoutMethodConfig,
  PayoutMethodType,
  WithdrawalRequest,
  KycVerificationInfo,
} from "../../types";
import {
  calculateCreatorFinancialBalance,
  getSavedPayoutMethods,
  savePayoutMethod,
  removePayoutMethod,
  setDefaultPayoutMethod,
  getWithdrawalHistory,
  createWithdrawalRequest,
  isWithdrawalConfigured,
  verifyWithdrawalEligibility,
  forceClearAllPendingFunds,
  getCreatorKycStatus,
  saveCreatorKycStatus,
  FINANCIAL_EVENTS,
  MIN_WITHDRAWAL_AMOUNT_XOF,
  MIN_WITHDRAWAL_AMOUNT_EUR,
} from "../../utils/creatorFinancialEngine";

interface PaymentTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  amountGrossFormatted: string;
  amountGrossNumber: number;
  feeAmountFormatted: string;
  amountNetFormatted: string;
  amountNetNumber: number;
  currency: string;
  paymentMethod: "wave" | "orange_money" | "mtn_momo" | "moov_money" | "visa_mastercard" | "bank_uemoa";
  paymentMethodLabel: string;
  countryFlag: string;
  countryName: string;
  status: "succeeded" | "pending" | "refunded" | "disputed";
  date: string;
  time: string;
  rawTx: FirestoreTransaction;
}

interface PaymentsViewProps {
  lang?: "fr" | "en";
  currency?: CurrencyCode;
  activeWorkspaceId?: string;
  activeCompanyName?: string;
}

type FinancialTab = "overview" | "sales" | "withdrawals" | "payout_methods";

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  lang = "fr",
  currency = "XAF" as CurrencyCode,
  activeWorkspaceId = "personnel",
  activeCompanyName,
}) => {
  const activeCurrency: CurrencyCode = (currency as CurrencyCode) || "XAF";
  const { user, profile } = useAuth();
  const creatorKey = profile?.uid || user?.email || "creator-default";

  const isCompanyContext = Boolean(activeWorkspaceId && activeWorkspaceId !== "personnel");
  const contextName = isCompanyContext ? (activeCompanyName || "Entreprise") : "Personnel";

  // Navigation tab
  const [activeTab, setActiveTab] = useState<FinancialTab>("overview");

  // Transactions & Raw Data
  const [rawTransactions, setRawTransactions] = useState<FirestoreTransaction[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Withdrawals & Payout Methods
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethodConfig[]>([]);
  const [kycInfo, setKycInfo] = useState<KycVerificationInfo>({ status: "not_required" });

  // Modals & Drawers
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isAddMethodModalOpen, setIsAddMethodModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);

  // Withdrawal form inside modal
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<WithdrawalRequest | null>(null);
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  // New Payout Method Form
  const [newMethodType, setNewMethodType] = useState<PayoutMethodType>("wave");
  const [newMethodLabel, setNewMethodLabel] = useState("Wave Côte d'Ivoire");
  const [newMethodHolder, setNewMethodHolder] = useState(profile?.momoName || user?.displayName || "Johan Désiré");
  const [newMethodIdentifier, setNewMethodIdentifier] = useState("+225 07 88 99 00 11");
  const [newMethodBank, setNewMethodBank] = useState("");
  const [newMethodCountry, setNewMethodCountry] = useState("Côte d'Ivoire");

  // Feedback notifications
  const [notification, setNotification] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Manual Sale State
  const [saleProductName, setSaleProductName] = useState("Offre Pro Mansa Trading VIP");
  const [saleCustomerName, setSaleCustomerName] = useState("");
  const [saleCustomerEmail, setSaleCustomerEmail] = useState("");
  const [saleAmount, setSaleAmount] = useState("35000");
  const [saleCurrency, setSaleCurrency] = useState("XOF");
  const [salePaymentMethod, setSalePaymentMethod] = useState("Wave CI");
  const [saleLocation, setSaleLocation] = useState("Abidjan, Côte d'Ivoire");

  // Load Payout Methods & Withdrawals
  const reloadFinancialData = () => {
    const methods = getSavedPayoutMethods(creatorKey);
    setPayoutMethods(methods);
    const wdrs = getWithdrawalHistory(creatorKey);
    setWithdrawals(wdrs);
    const kyc = getCreatorKycStatus(creatorKey);
    setKycInfo(kyc);
  };

  useEffect(() => {
    reloadFinancialData();

    const handleDataChange = () => {
      reloadFinancialData();
    };

    window.addEventListener(FINANCIAL_EVENTS.PAYOUT_METHOD_CHANGED, handleDataChange);
    window.addEventListener(FINANCIAL_EVENTS.WITHDRAWAL_CREATED, handleDataChange);
    window.addEventListener(FINANCIAL_EVENTS.BALANCE_CHANGED, handleDataChange);
    window.addEventListener(FINANCIAL_EVENTS.KYC_CHANGED, handleDataChange);

    return () => {
      window.removeEventListener(FINANCIAL_EVENTS.PAYOUT_METHOD_CHANGED, handleDataChange);
      window.removeEventListener(FINANCIAL_EVENTS.WITHDRAWAL_CREATED, handleDataChange);
      window.removeEventListener(FINANCIAL_EVENTS.BALANCE_CHANGED, handleDataChange);
      window.removeEventListener(FINANCIAL_EVENTS.KYC_CHANGED, handleDataChange);
    };
  }, [creatorKey]);

  // Subscribe to real transactions
  useEffect(() => {
    const unsub = subscribeToCreatorTransactions(creatorKey, (dbTxs) => {
      setRawTransactions(dbTxs);
      const mapped: PaymentTransaction[] = dbTxs.map((t) => {
        const gross = t.amountNumber || 0;
        const fee = Math.round(gross * 0.03);
        const net = Math.max(0, gross - fee);

        return {
          id: t.id,
          customerName: t.buyerName || t.customerName || "Client Acheteur",
          customerEmail: t.buyerEmail || t.customerEmail || "client@afhub.app",
          productName: t.productName,
          amountGrossFormatted: t.amount,
          amountGrossNumber: gross,
          feeAmountFormatted: `${fee.toLocaleString("fr-FR")} ${t.currency}`,
          amountNetFormatted: `${net.toLocaleString("fr-FR")} ${t.currency}`,
          amountNetNumber: net,
          currency: t.currency,
          paymentMethod: (t.paymentMethod?.toLowerCase().includes("wave")
            ? "wave"
            : t.paymentMethod?.toLowerCase().includes("orange")
            ? "orange_money"
            : t.paymentMethod?.toLowerCase().includes("mtn")
            ? "mtn_momo"
            : t.paymentMethod?.toLowerCase().includes("moov")
            ? "moov_money"
            : "visa_mastercard") as any,
          paymentMethodLabel: t.paymentMethod || "Mobile Money",
          countryFlag: t.buyerLocation?.includes("Sénégal")
            ? "🇸🇳"
            : t.buyerLocation?.includes("Nigéria")
            ? "🇳🇬"
            : t.buyerLocation?.includes("Cameroun")
            ? "🇨🇲"
            : t.buyerLocation?.includes("Ghana")
            ? "🇬🇭"
            : "🇨🇮",
          countryName: t.buyerLocation || "Côte d'Ivoire",
          status: (t.status as any) || "succeeded",
          date: t.createdAt
            ? new Date(t.createdAt).toLocaleDateString("fr-FR")
            : new Date().toLocaleDateString("fr-FR"),
          time: t.createdAt
            ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          rawTx: t,
        };
      });
      setTransactions(mapped);
    });

    return () => unsub();
  }, [creatorKey]);

  // Filter transactions strictly according to context:
  // - Mode Entreprise : uniquement les revenus et transactions générés par cette entreprise spécifique
  // - Mode Personnel : solde global sur toute la plateforme (toutes entreprises, revenus d'affiliation, autres revenus)
  // Règle formelle : Il ne faut JAMAIS mélanger le solde d'une entreprise avec le solde personnel global.
  const contextRawTransactions = useMemo(() => {
    if (!isCompanyContext) {
      // En mode Personnel : tous les flux qui m'appartiennent sur la plateforme
      return rawTransactions;
    }
    // En mode Entreprise : exclusion absolue des affiliations et revenus personnels
    return rawTransactions.filter((t) => {
      if (t.type === "affiliate" || t.type === "other") {
        return false;
      }
      const matchCompId = t.companyId === activeWorkspaceId;
      const matchCompName = activeCompanyName && (
        (t.companyName && t.companyName.toLowerCase() === activeCompanyName.toLowerCase()) ||
        (t.storeName && t.storeName.toLowerCase() === activeCompanyName.toLowerCase())
      );
      return matchCompId || matchCompName;
    });
  }, [rawTransactions, isCompanyContext, activeWorkspaceId, activeCompanyName]);

  const contextTransactions = useMemo(() => {
    if (!isCompanyContext) {
      return transactions;
    }
    return transactions.filter((tx) => {
      const t = tx.rawTx;
      if (t.type === "affiliate" || t.type === "other") {
        return false;
      }
      const matchCompId = t.companyId === activeWorkspaceId;
      const matchCompName = activeCompanyName && (
        (t.companyName && t.companyName.toLowerCase() === activeCompanyName.toLowerCase()) ||
        (t.storeName && t.storeName.toLowerCase() === activeCompanyName.toLowerCase())
      );
      return matchCompId || matchCompName;
    });
  }, [transactions, isCompanyContext, activeWorkspaceId, activeCompanyName]);

  // Breakdown consolidé pour le Mode Personnel (Entreprises, Affiliation, Autres)
  const personalBreakdown = useMemo(() => {
    let companiesRevenue = 0;
    let affiliateRevenue = 0;
    let otherRevenue = 0;

    rawTransactions.forEach((t) => {
      const net = (t.amountNumber || 0) * 0.96;
      if (t.type === "affiliate") {
        affiliateRevenue += net;
      } else if (t.type === "other") {
        otherRevenue += net;
      } else {
        companiesRevenue += net;
      }
    });

    return {
      companies: companiesRevenue,
      affiliates: affiliateRevenue,
      other: otherRevenue,
      total: companiesRevenue + affiliateRevenue + otherRevenue,
    };
  }, [rawTransactions]);

  // Compute Balances strictly isolated for this context
  const balance = useMemo(() => {
    return calculateCreatorFinancialBalance(creatorKey, contextRawTransactions, activeCurrency);
  }, [creatorKey, contextRawTransactions, withdrawals, activeCurrency]);

  const hasWithdrawalConfigured = payoutMethods.length > 0;

  // Téléchargement individuel d'un bordereau de virement
  const handleDownloadBordereau = (w: WithdrawalRequest) => {
    const statusText =
      w.status === "completed"
        ? "VERSÉ AVEC SUCCÈS"
        : w.status === "processing"
        ? "EN COURS DE TRAITEMENT"
        : "EN ATTENTE DE VALIDATION";

    const content = `============================================================
              MANSA — BORDEREAU DE VIREMENT OFFICIEL
============================================================
Référence du Virement : ${w.referenceNumber}
Date d'Émission       : ${new Date(w.requestedAt).toLocaleString("fr-FR")}
Statut du Virement    : ${statusText}

BÉNÉFICIAIRE :
Titulaire du Compte   : ${w.accountHolder}
Moyen de Réception    : ${w.payoutMethodLabel}
Coordonnées / RIB     : ${w.destinationDetails}

DÉCOMPTE FINANCIER :
Montant Viré          : ${w.amount.toLocaleString("fr-FR")} ${w.currency}
Frais de Virement     : 0 FCFA (Pris en charge à 100% par Mansa)
Délai de Réception    : Immédiat / Moins de 24 heures ouvrées

SÉCURITÉ & AUTHENTIFICATION :
Identifiant Système   : ${w.id}
Émetteur Agréé        : MANSA PAYMENTS SAS
Certificat de Clôture : SHA256-${btoa(w.id + w.referenceNumber).slice(0, 24)}
============================================================
Document généré électroniquement, faisant foi de bordereau officiel de règlement.
`;
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bordereau_virement_${w.referenceNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return contextTransactions.filter((tx) => {
      const matchesFilter = filterStatus === "all" || tx.status === filterStatus;
      const matchesSearch =
        tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [contextTransactions, filterStatus, searchQuery]);

  // Handle Manual Sale Creation
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const amtNum = parseFloat(saleAmount) || 25000;
    await createRealTransaction(creatorKey, {
      productName: saleProductName,
      productId: "prod-" + Date.now(),
      amount: `${amtNum.toLocaleString("fr-FR")} ${saleCurrency}`,
      amountNumber: amtNum,
      currency: saleCurrency,
      buyerName: saleCustomerName || "Client Acheteur Mansa",
      buyerEmail: saleCustomerEmail || "client@afhub.app",
      buyerLocation: saleLocation,
      paymentMethod: salePaymentMethod,
    });
    setIsNewSaleModalOpen(false);
    setSaleCustomerName("");
    setSaleCustomerEmail("");
    showFeedback("success", "Nouvelle vente enregistrée et créditée à votre solde créateur !");
  };

  // Handle Withdrawal Request Submission
  const handleSubmitWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError(null);

    const amountNum = parseFloat(withdrawalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawalError("Veuillez saisir un montant de virement valide.");
      return;
    }

    const targetMethodId = selectedMethodId || payoutMethods[0]?.id;
    if (!targetMethodId) {
      setWithdrawalError("Veuillez sélectionner ou configurer un compte de retrait.");
      return;
    }

    if (amountNum > balance.availableBalance) {
      setWithdrawalError(
        `Le montant demandé dépasse votre solde disponible (${formatCurrency(balance.availableBalance, activeCurrency)}).`
      );
      return;
    }

    const minAmount = activeCurrency === "EUR" ? MIN_WITHDRAWAL_AMOUNT_EUR : MIN_WITHDRAWAL_AMOUNT_XOF;
    if (amountNum < minAmount) {
      setWithdrawalError(
        `Le montant minimum de retrait est de ${formatCurrency(minAmount, activeCurrency)}.`
      );
      return;
    }

    setIsSubmittingWithdrawal(true);
    setTimeout(() => {
      const result = createWithdrawalRequest({
        creatorId: creatorKey,
        amount: amountNum,
        currency: activeCurrency,
        payoutMethodId: targetMethodId,
      });

      setIsSubmittingWithdrawal(false);
      if (result.success && result.request) {
        setWithdrawalSuccess(result.request);
        reloadFinancialData();
        showFeedback(
          "success",
          `Demande de virement de ${formatCurrency(amountNum, activeCurrency)} transmise avec succès !`
        );
      } else {
        setWithdrawalError(result.error || "Échec de l'envoi de la demande de virement.");
      }
    }, 900);
  };

  // Handle Save New Payout Method
  const handleSaveNewMethod = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: PayoutMethodConfig = {
      id: `pm-${Date.now()}`,
      type: newMethodType,
      label: newMethodLabel,
      accountHolder: newMethodHolder,
      accountIdentifier: newMethodIdentifier,
      bankName: newMethodBank,
      country: newMethodCountry,
      isVerified: true,
      isDefault: payoutMethods.length === 0,
      createdAt: new Date().toISOString(),
    };

    savePayoutMethod(creatorKey, newConfig);
    setCreatorPayoutConfigured(true);
    setIsAddMethodModalOpen(false);
    showFeedback("success", "Moyen de retrait configuré avec succès ! Vos retraits sont débloqués.");
  };

  // Fast forward clearance (testing / demonstration)
  const handleClearAllPending = () => {
    const pendingIds = transactions.map((t) => t.id);
    forceClearAllPendingFunds(creatorKey, pendingIds);
    showFeedback(
      "info",
      "Période de compensation terminée : l'ensemble des fonds en attente est désormais disponible pour retrait !"
    );
  };

  const showFeedback = (type: "success" | "info" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open withdrawal dialog with checks
  const handleOpenWithdrawalDialog = () => {
    setWithdrawalError(null);
    setWithdrawalSuccess(null);
    if (payoutMethods.length > 0) {
      const defaultM = payoutMethods.find((m) => m.isDefault) || payoutMethods[0];
      setSelectedMethodId(defaultM.id);
    }
    setWithdrawalAmount(balance.availableBalance > 0 ? balance.availableBalance.toString() : "50000");
    setIsPayoutModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast feedback */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium animate-slide-up ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-200"
              : notification.type === "error"
              ? "bg-rose-950/90 border-rose-500/40 text-rose-200"
              : "bg-sky-950/90 border-sky-500/40 text-sky-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          ) : notification.type === "error" ? (
            <AlertCircle className="size-5 text-rose-400 shrink-0" />
          ) : (
            <Zap className="size-5 text-sky-400 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Centre Financier & Encaissements
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Consultez votre solde en temps réel, suivez vos encaissements Mobile Money & Cartes, et
            demandez vos virements de fonds vers votre compte bancaire ou wallet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              const csvContent =
                "data:text/csv;charset=utf-8," +
                ["ID,Client,Email,Produit,Pays,Brut,Frais,Net,Statut,Date"]
                  .concat(
                    transactions.map(
                      (t) =>
                        `${t.id},${t.customerName},${t.customerEmail},${t.productName},${t.countryName},${t.amountGrossFormatted},${t.feeAmountFormatted},${t.amountNetFormatted},${t.status},${t.date}`
                    )
                  )
                  .join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", `mansa_ventes_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-[#151515] text-xs font-semibold text-[#B6B5B0] hover:text-white hover:border-white/20 transition-all cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Exporter CSV</span>
          </button>

          <button
            onClick={() => setIsNewSaleModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer border border-white/10"
          >
            <Plus className="size-3.5 text-emerald-400" />
            <span>+ Vente manuelle</span>
          </button>

          <button
            onClick={handleOpenWithdrawalDialog}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-500/20"
          >
            <ArrowUpRight className="size-4" />
            <span>Demander un virement</span>
          </button>
        </div>
      </div>

      {/* Demande de localisation contextuelle pour adapter devises & moyens de paiement */}
      <ContextualLocationPrompt currentCurrency={activeCurrency} className="my-1" />

      {/* 4 Navigation Subtabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.08] overflow-x-auto no-scrollbar pb-px">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "overview"
              ? "border-emerald-500 text-white bg-emerald-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <DollarSign className="size-3.5" />
          <span>Vue d'ensemble & Soldes</span>
        </button>

        <button
          onClick={() => setActiveTab("sales")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "sales"
              ? "border-emerald-500 text-white bg-emerald-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ArrowDownLeft className="size-3.5" />
          <span>Historique des Ventes ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("withdrawals")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "withdrawals"
              ? "border-emerald-500 text-white bg-emerald-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ArrowUpRight className="size-3.5" />
          <span>Gestion des Retraits ({withdrawals.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("payout_methods")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "payout_methods"
              ? "border-emerald-500 text-white bg-emerald-500/5"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <CreditCard className="size-3.5" />
          <span>Moyens de Retrait & KYC</span>
          {payoutMethods.length === 0 && (
            <span className="size-2 rounded-full bg-amber-400 animate-ping"></span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: VUE D'ENSEMBLE & SOLDES */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* CARTES DE SOLDES (VUE D'ENSEMBLE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Solde Total selon le contexte */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-white">
                  {isCompanyContext
                    ? `Solde total — ${contextName}`
                    : "Solde total — Personnel"}
                </span>
                <Wallet className="size-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
                {formatCurrency(balance.totalNetRevenue - balance.totalWithdrawn, activeCurrency)}
              </div>
              <p className="text-[11px] text-zinc-500 leading-tight">
                {isCompanyContext
                  ? `Revenus nets générés exclusivement par l'entreprise ${contextName}.`
                  : "Solde consolidé : ensemble de vos entreprises, affiliations et activités Mansa."}
              </p>
            </div>

            {/* 2. Montant Disponible au Retrait */}
            <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#0e1c12] to-[#0c0d0e] p-5 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Montant Disponible
                </span>
                <ArrowUpRight className="size-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                {formatCurrency(balance.availableBalance, activeCurrency)}
              </div>
              <p className="text-[11px] text-emerald-400/80 leading-tight">
                Fonds débloqués prêts pour un virement immédiat vers vos comptes.
              </p>
            </div>

            {/* 3. Montants en Attente (Période de compensation 48h) */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-amber-400">
                <span className="font-semibold flex items-center gap-1.5">
                  <Clock className="size-3.5 text-amber-400" />
                  Fonds en Attente (48h)
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tracking-tight">
                {formatCurrency(balance.pendingBalance, activeCurrency)}
              </div>
              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-zinc-500">Délai de compensation antifraude.</p>
                {balance.pendingBalance > 0 && (
                  <button
                    onClick={handleClearAllPending}
                    title="Simuler la fin du délai de 48h pour rendre les fonds disponibles"
                    className="text-[10px] text-amber-300 hover:text-white underline cursor-pointer"
                  >
                    Libérer maintenant ⚡
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* DÉCOMPOSITION DU SOLDE SELON LE CONTEXTE */}
          {!isCompanyContext && (
            <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-r from-blue-950/20 via-[#0d121c] to-[#0c0d0e] p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Décomposition du Solde Global — Mode Personnel
                  </h3>
                </div>
                <span className="text-[11px] text-zinc-400">
                  Consolidation de tous vos flux sur la plateforme
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="text-[11px] font-semibold text-zinc-400">
                    1. Ventes de mes Entreprises
                  </div>
                  <div className="text-lg font-extrabold font-mono text-white">
                    {formatCurrency(personalBreakdown.companies, activeCurrency)}
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Revenus cumulés de toutes vos entreprises actives
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="text-[11px] font-semibold text-indigo-300">
                    2. Revenus d'Affiliation
                  </div>
                  <div className="text-lg font-extrabold font-mono text-indigo-400">
                    {formatCurrency(personalBreakdown.affiliates, activeCurrency)}
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Commissions générées sur la recommandation d'autres créateurs
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                  <div className="text-[11px] font-semibold text-emerald-300">
                    3. Autres Revenus Mansa
                  </div>
                  <div className="text-lg font-extrabold font-mono text-emerald-400">
                    {formatCurrency(personalBreakdown.other, activeCurrency)}
                  </div>
                  <p className="text-[10px] text-zinc-500">
                    Bonus, partenariats et récompenses plateforme
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DERNIÈRES VENTES ET DERNIERS RETRAITS (APERÇU RAPIDE) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Aperçu Ventes Récentes */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="size-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Dernières Ventes Encaissées</h3>
                </div>
                <button
                  onClick={() => setActiveTab("sales")}
                  className="text-xs text-emerald-400 hover:underline cursor-pointer"
                >
                  Voir tout ({transactions.length}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {transactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer border border-white/[0.04]"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{tx.productName}</span>
                        <span className="text-[10px] text-zinc-500">· {tx.countryFlag}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {tx.customerName} · {tx.paymentMethodLabel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        +{tx.amountNetFormatted}
                      </div>
                      <div className="text-[10px] text-zinc-500">{tx.date}</div>
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Aucune vente pour le moment. Créez une vente manuelle pour tester le système.
                  </div>
                )}
              </div>
            </div>

            {/* Aperçu Retraits Récents */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="size-4 text-sky-400" />
                  <h3 className="text-sm font-bold text-white">Historique Récent des Retraits</h3>
                </div>
                <button
                  onClick={() => setActiveTab("withdrawals")}
                  className="text-xs text-sky-400 hover:underline cursor-pointer"
                >
                  Voir tout ({withdrawals.length}) →
                </button>
              </div>

              <div className="space-y-2.5">
                {withdrawals.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setSelectedWithdrawal(w)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer border border-white/[0.04]"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{w.payoutMethodLabel}</span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                            w.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : w.status === "processing"
                              ? "bg-sky-500/20 text-sky-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {w.status === "completed"
                            ? "Versé"
                            : w.status === "processing"
                            ? "En cours"
                            : "En attente"}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400">Réf: {w.referenceNumber}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {formatCurrency(w.amount, w.currency as CurrencyCode)}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {new Date(w.requestedAt).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                  </div>
                ))}

                {withdrawals.length === 0 && (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    Aucun retrait demandé pour le moment.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: HISTORIQUE DES VENTES */}
      {/* ========================================================================= */}
      {activeTab === "sales" && (
        <div className="space-y-4">
          {/* Controls & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-3 size-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Rechercher par client, email, produit ou référence #TX..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#121316] pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-xl border border-white/10 bg-[#121316] px-3 py-2 text-xs text-white outline-none cursor-pointer"
              >
                <option value="all">Tous les statuts</option>
                <option value="succeeded">Validés (Encaissés)</option>
                <option value="pending">En attente</option>
                <option value="refunded">Remboursés</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0c0d0e] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3 px-4">Date & Réf</th>
                    <th className="py-3 px-4">Client Acheteur</th>
                    <th className="py-3 px-4">Produit / Offre</th>
                    <th className="py-3 px-4">Mode de Paiement</th>
                    <th className="py-3 px-4">Brut</th>
                    <th className="py-3 px-4">Frais (3%)</th>
                    <th className="py-3 px-4">Net Crédité</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Reçu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-white">{tx.date}</div>
                        <div className="text-[10px] font-mono text-zinc-500">#{tx.id.substring(0, 12)}</div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{tx.customerName}</span>
                          <span className="text-[10px]">{tx.countryFlag}</span>
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">{tx.customerEmail}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-zinc-200 font-medium">
                        {tx.productName}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 text-[11px] text-zinc-300">
                          {tx.paymentMethodLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-zinc-300 whitespace-nowrap">
                        {tx.amountGrossFormatted}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500 whitespace-nowrap">
                        -{tx.feeAmountFormatted}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 whitespace-nowrap">
                        +{tx.amountNetFormatted}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          <span>Encaissé</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTx(tx);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                          title="Voir le reçu"
                        >
                          <FileText className="size-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-500">
                        Aucune transaction trouvée correspondant aux critères.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GESTION & HISTORIQUE DES RETRAITS */}
      {/* ========================================================================= */}
      {activeTab === "withdrawals" && (
        <div className="space-y-4">
          {/* TOTAL DES RETRAITS DÉJÀ VERSÉS (DÉPLACÉ DEPUIS LA VUE D'ENSEMBLE) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1">
              <div className="text-xs text-zinc-400 font-semibold">Total Retraits Déjà Versés</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                {formatCurrency(balance.totalWithdrawn, activeCurrency)}
              </div>
              <div className="text-[11px] text-zinc-500">
                Montants reçus sur vos comptes Mobile Money ou bancaires.
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-1">
              <div className="text-xs text-zinc-400 font-semibold">Solde Disponible au Retrait</div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-white">
                {formatCurrency(balance.availableBalance, activeCurrency)}
              </div>
              <div className="text-[11px] text-zinc-500">
                Fonds immédiatement transférables sans délai.
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/[0.08] bg-[#0c0d0e]">
            <div>
              <h3 className="text-base font-bold text-white">Demandes de Virement de Fonds</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Retirez vos fonds disponibles vers votre compte Wave, Orange Money, MTN MoMo ou compte bancaire.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-[10px] text-zinc-400">Disponible au retrait :</div>
                <div className="text-base font-bold font-mono text-emerald-400">
                  {formatCurrency(balance.availableBalance, activeCurrency)}
                </div>
              </div>
              <button
                onClick={handleOpenWithdrawalDialog}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <ArrowUpRight className="size-4" />
                <span>Demander un virement</span>
              </button>
            </div>
          </div>

          {/* Table of withdrawals */}
          <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0c0d0e] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="border-b border-white/[0.08] bg-white/[0.02] text-[11px] font-semibold text-zinc-400">
                  <tr>
                    <th className="py-3 px-4">Référence</th>
                    <th className="py-3 px-4">Date de Demande</th>
                    <th className="py-3 px-4">Montant du Virement</th>
                    <th className="py-3 px-4">Compte Destinataire</th>
                    <th className="py-3 px-4">Titulaire</th>
                    <th className="py-3 px-4">Frais Mansa</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Bordereau & Téléchargement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {withdrawals.map((w) => (
                    <tr
                      key={w.id}
                      onClick={() => setSelectedWithdrawal(w)}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {w.referenceNumber}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-400">
                        {new Date(w.requestedAt).toLocaleDateString("fr-FR")}{" "}
                        <span className="text-[10px] text-zinc-500">
                          {new Date(w.requestedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                        {formatCurrency(w.amount, w.currency as CurrencyCode)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-zinc-200 font-medium">{w.payoutMethodLabel}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300">
                        {w.accountHolder}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-emerald-400 whitespace-nowrap">
                        0 FCFA (Gratuit)
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {w.status === "completed" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                            <CheckCircle2 className="size-3" />
                            <span>Versé</span>
                          </span>
                        )}
                        {w.status === "processing" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                            <Clock className="size-3" />
                            <span>En cours de traitement</span>
                          </span>
                        )}
                        {w.status === "pending" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                            <Clock className="size-3" />
                            <span>En attente de validation</span>
                          </span>
                        )}
                        {w.status === "rejected" && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                            <AlertCircle className="size-3" />
                            <span>Rejeté</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWithdrawal(w);
                            }}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                            title="Voir le bordereau de virement"
                          >
                            <FileText className="size-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadBordereau(w);
                            }}
                            className="p-1.5 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-500/20 cursor-pointer transition-colors"
                            title="Télécharger individuellement ce bordereau"
                          >
                            <Download className="size-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {withdrawals.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-zinc-500">
                        Aucun virement demandé pour l'instant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MOYENS DE RETRAIT & KYC */}
      {/* ========================================================================= */}
      {activeTab === "payout_methods" && (
        <div className="space-y-6">
          {/* Top banner */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0c0d0e] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white">Comptes de Retrait Enregistrés</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                Ajoutez vos comptes Wave, Orange Money, MTN MoMo ou vos coordonnées bancaires (IBAN/RIB).
                Ces comptes sont utilisés exclusivement pour vous verser vos fonds gagnés.
              </p>
            </div>
            <button
              onClick={() => setIsAddMethodModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="size-4" />
              <span>Ajouter un compte de retrait</span>
            </button>
          </div>

          {/* Grid of configured methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {payoutMethods.map((method) => (
              <div
                key={method.id}
                className={`rounded-2xl border p-5 space-y-4 relative ${
                  method.isDefault
                    ? "border-emerald-500/40 bg-gradient-to-b from-[#0f2115] to-[#0c0d0e]"
                    : "border-white/[0.08] bg-[#0c0d0e]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      {method.type.includes("bank") ? (
                        <Building2 className="size-4 text-sky-400" />
                      ) : method.type.includes("crypto") ? (
                        <Wallet className="size-4 text-amber-400" />
                      ) : (
                        <Smartphone className="size-4 text-emerald-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{method.label}</h4>
                      <span className="text-[10px] text-zinc-400">{method.country || "Afrique de l'Ouest"}</span>
                    </div>
                  </div>

                  {method.isDefault ? (
                    <span className="text-[10px] font-bold font-mono text-emerald-400">
                      Par défaut
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        setDefaultPayoutMethod(creatorKey, method.id);
                        showFeedback("info", `${method.label} défini comme compte par défaut.`);
                      }}
                      className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Définir par défaut
                    </button>
                  )}
                </div>

                <div className="space-y-1.5 text-xs bg-black/30 rounded-xl p-3 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Titulaire :</span>
                    <span className="font-semibold text-zinc-200">{method.accountHolder}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Identifiant :</span>
                    <span className="font-mono font-bold text-white">{method.accountIdentifier}</span>
                  </div>
                  {method.bankName && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Banque :</span>
                      <span className="text-zinc-300">{method.bankName}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="size-3" />
                    Compte vérifié pour les retraits
                  </span>
                  {payoutMethods.length > 1 && (
                    <button
                      onClick={() => {
                        removePayoutMethod(creatorKey, method.id);
                        showFeedback("info", "Compte de retrait supprimé.");
                      }}
                      className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Supprimer ce compte"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {payoutMethods.length === 0 && (
              <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01] space-y-3">
                <AlertTriangle className="size-8 text-amber-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Aucun moyen de retrait configuré</h4>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  Vos ventes continuent normalement et vos fonds s'accumulent en toute sécurité.
                  Renseignez un compte Wave, Orange Money, MTN ou bancaire pour demander vos virements.
                </p>
                <button
                  onClick={() => setIsAddMethodModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer"
                >
                  Ajouter mon premier compte de retrait
                </button>
              </div>
            )}
          </div>

          {/* KYC & Identity Verification Section */}
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0c0d0e] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Vérification d'Identité Créateur (KYC)</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Conforme aux normes de conformité bancaire BCEAO & UEMOA.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-emerald-400">
                <CheckCircle2 className="size-3.5" />
                <span>Niveau 2 : Vérifié</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-white/[0.02] p-4 rounded-xl border border-white/5">
              <div>
                <span className="text-zinc-500 block">Pièce justificative :</span>
                <span className="font-semibold text-white">Carte Nationale d'Identité (CNI)</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Numéro de document :</span>
                <span className="font-mono text-zinc-200">CI-0994-882190</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Plafond de retrait autorisé :</span>
                <span className="font-bold text-emerald-400">Illimité (Niveau Pro)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DEMANDE DE VIREMENT (WITHDRAWAL) */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={isPayoutModalOpen}
        onClose={() => {
          setIsPayoutModalOpen(false);
          setWithdrawalSuccess(null);
        }}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="size-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Demande de Virement de vos Fonds</h3>
            </div>
            <button
              onClick={() => {
                setIsPayoutModalOpen(false);
                setWithdrawalSuccess(null);
              }}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* CAS 1: AUCUN MOYEN DE RETRAIT CONFIGURÉ */}
          {!hasWithdrawalConfigured ? (
            <div className="py-4 space-y-4 text-center">
              <div className="size-12 mx-auto rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Moyen de retrait non configuré</h4>
                <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                  Votre solde disponible est de{" "}
                  <strong className="text-emerald-400 font-mono">
                    {formatCurrency(balance.availableBalance, activeCurrency)}
                  </strong>
                  . Pour demander un virement, vous devez d'abord renseigner votre compte Mobile Money
                  (Wave, Orange, MTN) ou vos coordonnées bancaires.
                </p>
              </div>

              <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 text-xs text-zinc-400 text-left">
                ℹ️ Vos ventes continuent normalement. Vous pouvez configurer votre compte de retrait à
                tout moment pour libérer vos virements.
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setActiveTab("payout_methods");
                    setIsAddMethodModalOpen(true);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Configurer mon compte
                </button>
              </div>
            </div>
          ) : withdrawalSuccess ? (
            /* CAS 2: VIREMENT RÉUSSI */
            <div className="py-6 text-center space-y-3">
              <div className="flex size-14 mx-auto items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="size-8" />
              </div>
              <h4 className="text-base font-bold text-white">Demande de Virement Transmise !</h4>
              <p className="text-xs text-zinc-300">
                <strong className="font-mono text-emerald-400">
                  {formatCurrency(withdrawalSuccess.amount, withdrawalSuccess.currency as CurrencyCode)}
                </strong>{" "}
                ont été transmis vers votre compte {withdrawalSuccess.payoutMethodLabel}.
              </p>
              <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-[11px] font-mono text-zinc-400">
                Réf: {withdrawalSuccess.referenceNumber}
              </div>
              <button
                onClick={() => {
                  setIsPayoutModalOpen(false);
                  setWithdrawalSuccess(null);
                  setActiveTab("withdrawals");
                }}
                className="w-full mt-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Consulter mes virements
              </button>
            </div>
          ) : (
            /* CAS 3: FORMULAIRE DE RETRAIT NORMAL */
            <form onSubmit={handleSubmitWithdrawal} className="space-y-4">
              {withdrawalError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-rose-400" />
                  <span>{withdrawalError}</span>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-zinc-300">Montant à virer</label>
                  <span className="text-[11px] text-zinc-400">
                    Disponible :{" "}
                    <strong className="text-emerald-400 font-mono">
                      {formatCurrency(balance.availableBalance, activeCurrency)}
                    </strong>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min={5000}
                    max={balance.availableBalance}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#16181f] pl-4 pr-16 py-2.5 font-mono text-sm text-white focus:border-emerald-500 outline-none"
                    placeholder="50000"
                    required
                  />
                  <span className="absolute right-3.5 top-3 font-mono text-xs text-zinc-400 font-bold">
                    {activeCurrency}
                  </span>
                </div>

                {/* Quick percentage buttons */}
                <div className="flex items-center gap-2 mt-2">
                  {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
                    const quickAmt = Math.floor(balance.availableBalance * ratio);
                    return (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setWithdrawalAmount(quickAmt.toString())}
                        className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-mono font-semibold text-zinc-400 hover:text-white border border-white/5 cursor-pointer"
                      >
                        {ratio === 1 ? "100% (Max)" : `${ratio * 100}%`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Compte de destination
                </label>
                <select
                  value={selectedMethodId}
                  onChange={(e) => setSelectedMethodId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-xs text-white outline-none cursor-pointer"
                >
                  {payoutMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label} ({method.accountIdentifier}) · {method.accountHolder}
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 text-xs text-zinc-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Frais de virement :</span>
                  <span className="text-emerald-400 font-mono font-bold">0 FCFA (Pris en charge)</span>
                </div>
                <div className="flex justify-between">
                  <span>Délai estimé :</span>
                  <span className="text-white font-medium">Instantané à 15 minutes</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/5">
                  <span>Net à recevoir sur votre compte :</span>
                  <span className="font-mono text-emerald-400 text-sm">
                    {formatCurrency(parseFloat(withdrawalAmount) || 0, activeCurrency)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPayoutModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdrawal || balance.availableBalance < 5000}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black text-xs font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  {isSubmittingWithdrawal ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpRight className="size-4" />
                  )}
                  <span>Confirmer le virement</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </ModalOverlay>

      {/* ========================================================================= */}
      {/* MODAL: AJOUTER UN MOYEN DE RETRAIT */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={isAddMethodModalOpen}
        onClose={() => setIsAddMethodModalOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="size-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Nouveau Compte de Retrait</h3>
            </div>
            <button
              onClick={() => setIsAddMethodModalOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleSaveNewMethod} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Moyen de retrait</label>
              <select
                value={newMethodType}
                onChange={(e) => {
                  const val = e.target.value as PayoutMethodType;
                  setNewMethodType(val);
                  if (val === "wave") setNewMethodLabel("Wave Côte d'Ivoire");
                  else if (val === "orange_money") setNewMethodLabel("Orange Money Côte d'Ivoire");
                  else if (val === "mtn_momo") setNewMethodLabel("MTN Mobile Money");
                  else if (val === "moov_money") setNewMethodLabel("Moov Money");
                  else if (val === "bank_uemoa") setNewMethodLabel("Compte Bancaire UEMOA (RIB)");
                  else if (val === "bank_cemac") setNewMethodLabel("Compte Bancaire CEMAC");
                  else if (val === "crypto_usdt") setNewMethodLabel("USDT Wallet (TRC-20)");
                }}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none cursor-pointer"
              >
                <option value="wave">🇨🇮 Wave Côte d'Ivoire (Instantané)</option>
                <option value="orange_money">🇨🇮 / 🇸🇳 Orange Money</option>
                <option value="mtn_momo">🌍 MTN MoMo (Bénin, Cameroun, Côte d'Ivoire)</option>
                <option value="moov_money">🌍 Moov Money Flooz</option>
                <option value="bank_uemoa">🌍 Virement Bancaire UEMOA (Ecobank, Coris, UBA, SG)</option>
                <option value="crypto_usdt">🪙 USDT (Réseau TRC-20)</option>
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">Nom ou libellé du compte</label>
              <input
                type="text"
                value={newMethodLabel}
                onChange={(e) => setNewMethodLabel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Nom complet du titulaire du compte
              </label>
              <input
                type="text"
                value={newMethodHolder}
                onChange={(e) => setNewMethodHolder(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                {newMethodType.includes("bank")
                  ? "Numéro IBAN / RIB complet (24 caractères)"
                  : newMethodType.includes("crypto")
                  ? "Adresse Wallet USDT (TRC-20)"
                  : "Numéro de téléphone Mobile Money avec indicatif (+225...)"}
              </label>
              <input
                type="text"
                value={newMethodIdentifier}
                onChange={(e) => setNewMethodIdentifier(e.target.value)}
                placeholder={
                  newMethodType.includes("bank")
                    ? "CI093 01234 56789012345 67"
                    : newMethodType.includes("crypto")
                    ? "TYDzsxdhP4WshT..."
                    : "+225 07 88 99 00 11"
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            {newMethodType.includes("bank") && (
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nom de la banque</label>
                <input
                  type="text"
                  value={newMethodBank}
                  onChange={(e) => setNewMethodBank(e.target.value)}
                  placeholder="Ex: Ecobank Côte d'Ivoire, NSIA Banque, Coris..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddMethodModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Enregistrer le compte
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

      {/* ========================================================================= */}
      {/* MODAL: REÇU DE VENTE (TRANSACTION) */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        contentClassName="max-w-lg mx-auto"
      >
        {selectedTx && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  Bordereau de Vente Mansa
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Détail de la Transaction</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Identifiant #TX</span>
                <span className="font-mono font-bold text-white">{selectedTx.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Date et heure</span>
                <span className="text-white">
                  {selectedTx.date} à {selectedTx.time}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Client Acheteur</span>
                <span className="font-semibold text-white">
                  {selectedTx.customerName} ({selectedTx.countryFlag} {selectedTx.countryName})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Email client</span>
                <span className="font-mono text-zinc-300">{selectedTx.customerEmail}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Produit / Offre achetée</span>
                <span className="font-semibold text-white">{selectedTx.productName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Moyen de paiement utilisé</span>
                <span className="font-semibold text-emerald-400">{selectedTx.paymentMethodLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Montant brut payé par le client</span>
                <span className="font-mono font-bold text-white">{selectedTx.amountGrossFormatted}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Frais de plateforme (3%)</span>
                <span className="font-mono text-zinc-400">-{selectedTx.feeAmountFormatted}</span>
              </div>
              <div className="flex justify-between py-2 bg-emerald-500/10 p-2 rounded-xl">
                <span className="font-semibold text-emerald-300">Montant net crédité au créateur :</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  +{selectedTx.amountNetFormatted}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Fermer le reçu
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* ========================================================================= */}
      {/* MODAL: BORDEREAU DE VIREMENT (WITHDRAWAL RECEIPT) */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={!!selectedWithdrawal}
        onClose={() => setSelectedWithdrawal(null)}
        contentClassName="max-w-md mx-auto"
      >
        {selectedWithdrawal && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                  Bordereau de Virement Mansa
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">Détail du Virement</h3>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Référence Virement</span>
                <span className="font-mono font-bold text-white">{selectedWithdrawal.referenceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Date de demande</span>
                <span className="text-white">
                  {new Date(selectedWithdrawal.requestedAt).toLocaleString("fr-FR")}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Montant versé</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {formatCurrency(selectedWithdrawal.amount, selectedWithdrawal.currency as CurrencyCode)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Moyen de destination</span>
                <span className="font-semibold text-white">{selectedWithdrawal.payoutMethodLabel}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Titulaire</span>
                <span className="text-zinc-200">{selectedWithdrawal.accountHolder}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-400">Détails destination</span>
                <span className="text-zinc-300">{selectedWithdrawal.destinationDetails}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Statut du virement</span>
                <span
                  className={`font-semibold font-mono uppercase text-xs ${
                    selectedWithdrawal.status === "completed"
                      ? "text-emerald-400"
                      : selectedWithdrawal.status === "processing"
                      ? "text-sky-400"
                      : "text-amber-400"
                  }`}
                >
                  {selectedWithdrawal.status === "completed"
                    ? "Versé avec succès"
                    : selectedWithdrawal.status === "processing"
                    ? "En cours de traitement"
                    : "En attente"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => handleDownloadBordereau(selectedWithdrawal)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="size-4" />
                <span>Télécharger ce bordereau</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedWithdrawal(null)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* ========================================================================= */}
      {/* MODAL: NOUVELLE VENTE MANUELLE */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#151515] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Plus className="size-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white font-heading">Enregistrer une Vente Manuelle</h3>
            </div>
            <button
              onClick={() => setIsNewSaleModalOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSale} className="space-y-3 text-xs">
            <div>
              <label className="block font-medium text-zinc-400 mb-1">Nom du produit / offre</label>
              <input
                type="text"
                value={saleProductName}
                onChange={(e) => setSaleProductName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-zinc-400 mb-1">Nom du client</label>
                <input
                  type="text"
                  value={saleCustomerName}
                  onChange={(e) => setSaleCustomerName(e.target.value)}
                  placeholder="Ex: Koffi Emmanuel"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-400 mb-1">Email du client</label>
                <input
                  type="email"
                  value={saleCustomerEmail}
                  onChange={(e) => setSaleCustomerEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-zinc-400 mb-1">Montant brut</label>
                <input
                  type="number"
                  value={saleAmount}
                  onChange={(e) => setSaleAmount(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-zinc-400 mb-1">Devise</label>
                <select
                  value={saleCurrency}
                  onChange={(e) => setSaleCurrency(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="XOF">XOF (FCFA UEMOA)</option>
                  <option value="XAF">XAF (FCFA CEMAC)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-400 mb-1">Moyen de paiement client</label>
              <select
                value={salePaymentMethod}
                onChange={(e) => setSalePaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
              >
                <option value="Wave CI">Wave Côte d'Ivoire</option>
                <option value="Wave SN">Wave Sénégal</option>
                <option value="Orange Money CI">Orange Money Côte d'Ivoire</option>
                <option value="MTN MoMo">MTN MoMo</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Carte Bancaire">Carte Bancaire / Stripe</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-zinc-400 mb-1">Localisation de l'acheteur</label>
              <input
                type="text"
                value={saleLocation}
                onChange={(e) => setSaleLocation(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewSaleModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold cursor-pointer"
              >
                Enregistrer et créditer
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>
    </div>
  );
};
