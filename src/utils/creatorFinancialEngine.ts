import {
  PayoutMethodConfig,
  PayoutMethodType,
  WithdrawalRequest,
  WithdrawalStatus,
  CreatorFinancialBalance,
  KycVerificationInfo,
} from "../types";
import { FirestoreTransaction } from "../services/dbService";
import { db, doc, setDoc } from "../services/firebase";

const STORAGE_PAYOUT_METHODS_PREFIX = "mansa_payout_methods_";
const STORAGE_WITHDRAWALS_PREFIX = "mansa_withdrawals_";
const STORAGE_KYC_PREFIX = "mansa_kyc_";
const STORAGE_CLEARED_TXS_PREFIX = "mansa_cleared_txs_";

export const FINANCIAL_EVENTS = {
  BALANCE_CHANGED: "mansa_financial_balance_changed",
  WITHDRAWAL_CREATED: "mansa_withdrawal_created",
  PAYOUT_METHOD_CHANGED: "mansa_payout_method_changed",
  KYC_CHANGED: "mansa_kyc_changed",
};

export const PLATFORM_FEE_RATE = 0.03; // 3% frais de plateforme Mansa
export const RESERVE_RATE = 0.05; // 5% réserve de garantie temporaire
export const CLEARANCE_HOURS = 48; // 48h période standard de compensation
export const MIN_WITHDRAWAL_AMOUNT_XOF = 5000;
export const MIN_WITHDRAWAL_AMOUNT_EUR = 10;

/**
 * Récupère les méthodes de retrait enregistrées pour un créateur.
 */
export function getSavedPayoutMethods(creatorId: string): PayoutMethodConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PAYOUT_METHODS_PREFIX}${creatorId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    // Si aucun profil spécifique, vérifier la configuration globale du profil
    const legacyConfigured = localStorage.getItem("mansa_creator_payout_configured");
    if (legacyConfigured === "true") {
      const defaultMethod: PayoutMethodConfig = {
        id: "pm-default-wave",
        type: "wave",
        label: "Wave Côte d'Ivoire",
        accountHolder: "Johan Désiré",
        accountIdentifier: "+225 07 88 99 00 11",
        country: "Côte d'Ivoire",
        isVerified: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
      savePayoutMethod(creatorId, defaultMethod);
      return [defaultMethod];
    }
    return [];
  } catch (e) {
    return [];
  }
}

/**
 * Vérifie si un moyen de retrait valide est configuré.
 * RÈGLE D'OR : N'est requis QUE pour demander un retrait, JAMAIS pour vendre ou publier.
 */
export function isWithdrawalConfigured(creatorId: string): boolean {
  const methods = getSavedPayoutMethods(creatorId);
  return methods.length > 0;
}

/**
 * Enregistre ou met à jour une méthode de retrait.
 */
export function savePayoutMethod(creatorId: string, method: PayoutMethodConfig): PayoutMethodConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedPayoutMethods(creatorId);
    const existingIndex = current.findIndex((m) => m.id === method.id);
    let updated: PayoutMethodConfig[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = method;
    } else {
      if (method.isDefault) {
        current.forEach((m) => (m.isDefault = false));
      }
      updated = [method, ...current];
    }

    localStorage.setItem(`${STORAGE_PAYOUT_METHODS_PREFIX}${creatorId}`, JSON.stringify(updated));
    localStorage.setItem("mansa_creator_payout_configured", "true");
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.PAYOUT_METHOD_CHANGED, { detail: { methods: updated } }));
    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Supprime une méthode de retrait.
 */
export function removePayoutMethod(creatorId: string, methodId: string): PayoutMethodConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedPayoutMethods(creatorId);
    const filtered = current.filter((m) => m.id !== methodId);
    if (filtered.length > 0 && !filtered.some((m) => m.isDefault)) {
      filtered[0].isDefault = true;
    }
    localStorage.setItem(`${STORAGE_PAYOUT_METHODS_PREFIX}${creatorId}`, JSON.stringify(filtered));
    if (filtered.length === 0) {
      localStorage.setItem("mansa_creator_payout_configured", "false");
    }
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.PAYOUT_METHOD_CHANGED, { detail: { methods: filtered } }));
    return filtered;
  } catch (e) {
    return [];
  }
}

/**
 * Définit la méthode par défaut.
 */
export function setDefaultPayoutMethod(creatorId: string, methodId: string): PayoutMethodConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedPayoutMethods(creatorId);
    const updated = current.map((m) => ({
      ...m,
      isDefault: m.id === methodId,
    }));
    localStorage.setItem(`${STORAGE_PAYOUT_METHODS_PREFIX}${creatorId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.PAYOUT_METHOD_CHANGED, { detail: { methods: updated } }));
    return updated;
  } catch (e) {
    return [];
  }
}

/**
 * Récupère l'historique des demandes de retrait.
 */
export function getWithdrawalHistory(creatorId: string): WithdrawalRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_WITHDRAWALS_PREFIX}${creatorId}`);
    if (raw) {
      return JSON.parse(raw);
    }
    // Données de démonstration réalistes si première ouverture
    const demoWithdrawals: WithdrawalRequest[] = [
      {
        id: "wdr-demo-01",
        creatorId,
        amount: 250000,
        currency: "FCFA",
        fee: 0,
        netAmount: 250000,
        payoutMethodId: "pm-default-wave",
        payoutMethodType: "wave",
        payoutMethodLabel: "Wave CI (+225 07 88 99 00 11)",
        destinationDetails: "Wave Côte d'Ivoire · Compte Johan Désiré",
        accountHolder: "Johan Désiré",
        status: "completed",
        requestedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
        referenceNumber: "WDR-2026-WV882104",
      },
      {
        id: "wdr-demo-02",
        creatorId,
        amount: 120000,
        currency: "FCFA",
        fee: 0,
        netAmount: 120000,
        payoutMethodId: "pm-default-wave",
        payoutMethodType: "wave",
        payoutMethodLabel: "Wave CI (+225 07 88 99 00 11)",
        destinationDetails: "Wave Côte d'Ivoire · Compte Johan Désiré",
        accountHolder: "Johan Désiré",
        status: "completed",
        requestedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
        processedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
        referenceNumber: "WDR-2026-WV451093",
      },
    ];
    localStorage.setItem(`${STORAGE_WITHDRAWALS_PREFIX}${creatorId}`, JSON.stringify(demoWithdrawals));
    return demoWithdrawals;
  } catch (e) {
    return [];
  }
}

/**
 * Identifiants des transactions forcées en statut "libéré / disponible" (pour tests ou validation anticipée)
 */
function getForceClearedTxIds(creatorId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_CLEARED_TXS_PREFIX}${creatorId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Libère manuellement tous les fonds en attente pour les rendre immédiatement disponibles.
 */
export function forceClearAllPendingFunds(creatorId: string, txIds: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getForceClearedTxIds(creatorId);
    const merged = Array.from(new Set([...current, ...txIds]));
    localStorage.setItem(`${STORAGE_CLEARED_TXS_PREFIX}${creatorId}`, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.BALANCE_CHANGED));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Calcule le solde financier complet d'un créateur en séparant :
 * - Solde total
 * - Montants en attente (période de compensation 48h)
 * - Montants disponibles (débloqués et retirables)
 * - Réserves temporaires (5% rolling reserve)
 * - Total des retraits déjà versés
 */
export function calculateCreatorFinancialBalance(
  creatorId: string,
  transactions: FirestoreTransaction[],
  currency: string = "FCFA"
): CreatorFinancialBalance {
  const withdrawals = getWithdrawalHistory(creatorId);
  const forceClearedIds = new Set(getForceClearedTxIds(creatorId));
  const now = Date.now();
  const clearanceThresholdMs = CLEARANCE_HOURS * 3600 * 1000;

  let totalGrossVolume = 0;
  let totalPlatformFees = 0;
  let totalNetRevenue = 0;
  let pendingBalance = 0;
  let availableBalance = 0;
  let reserveBalance = 0;

  for (const tx of transactions) {
    const gross = tx.amountNumber || 0;
    const fee = Math.round(gross * PLATFORM_FEE_RATE);
    const net = Math.max(0, gross - fee);

    totalGrossVolume += gross;
    totalPlatformFees += fee;
    totalNetRevenue += net;

    // Réserve de sécurité (5%)
    const reservePortion = Math.round(net * RESERVE_RATE);
    const withdrawablePortion = net - reservePortion;
    reserveBalance += reservePortion;

    // Vérifier la période de compensation
    const txTime = tx.createdAt ? new Date(tx.createdAt).getTime() : now;
    const isCleared = forceClearedIds.has(tx.id) || now - txTime >= clearanceThresholdMs;

    if (isCleared) {
      availableBalance += withdrawablePortion;
    } else {
      pendingBalance += withdrawablePortion;
    }
  }

  // Déduire les retraits validés ou en cours de traitement
  let totalWithdrawn = 0;
  for (const wdr of withdrawals) {
    if (wdr.status === "completed" || wdr.status === "processing" || wdr.status === "pending") {
      totalWithdrawn += wdr.amount;
      availableBalance -= wdr.amount;
    }
  }

  availableBalance = Math.max(0, availableBalance);

  return {
    totalGrossVolume,
    totalPlatformFees,
    totalNetRevenue,
    pendingBalance,
    availableBalance,
    reserveBalance,
    totalWithdrawn,
    currency,
  };
}

/**
 * Vérifie si le créateur peut effectuer un retrait et renvoie la raison en cas de blocage.
 */
export function verifyWithdrawalEligibility(
  creatorId: string,
  availableBalance: number,
  currency: string = "FCFA"
): {
  isEligible: boolean;
  code: "OK" | "NO_PAYOUT_METHOD" | "INSUFFICIENT_FUNDS" | "BELOW_MIN_THRESHOLD" | "KYC_REQUIRED";
  message: string;
  configuredMethod?: PayoutMethodConfig;
} {
  const methods = getSavedPayoutMethods(creatorId);
  const defaultMethod = methods.find((m) => m.isDefault) || methods[0];

  if (!defaultMethod) {
    return {
      isEligible: false,
      code: "NO_PAYOUT_METHOD",
      message:
        "Aucun moyen de retrait configuré. Vos ventes et gains sont conservés en sécurité sur votre solde. Veuillez renseigner un compte Wave, Orange Money, MTN, RIB bancaire ou Crypto pour demander un versement.",
    };
  }

  const minThreshold = currency === "EUR" ? MIN_WITHDRAWAL_AMOUNT_EUR : MIN_WITHDRAWAL_AMOUNT_XOF;
  if (availableBalance < minThreshold) {
    return {
      isEligible: false,
      code: "BELOW_MIN_THRESHOLD",
      message: `Le solde disponible (${availableBalance.toLocaleString("fr-FR")} ${currency}) est inférieur au seuil minimum de retrait (${minThreshold.toLocaleString("fr-FR")} ${currency}).`,
      configuredMethod: defaultMethod,
    };
  }

  return {
    isEligible: true,
    code: "OK",
    message: "Éligible au retrait.",
    configuredMethod: defaultMethod,
  };
}

/**
 * Crée une nouvelle demande de retrait.
 */
export function createWithdrawalRequest(params: {
  creatorId: string;
  amount: number;
  currency?: string;
  payoutMethodId: string;
}): {
  success: boolean;
  request?: WithdrawalRequest;
  error?: string;
} {
  const { creatorId, amount, currency = "FCFA", payoutMethodId } = params;
  const methods = getSavedPayoutMethods(creatorId);
  const method = methods.find((m) => m.id === payoutMethodId);

  if (!method) {
    return {
      success: false,
      error: "Moyen de retrait introuvable ou non sélectionné. Veuillez configurer votre compte de retrait.",
    };
  }

  const refNumber = `WDR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newRequest: WithdrawalRequest = {
    id: `wdr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    creatorId,
    amount,
    currency,
    fee: 0, // Frais de retrait pris en charge par afhub/Mansa
    netAmount: amount,
    payoutMethodId: method.id,
    payoutMethodType: method.type,
    payoutMethodLabel: `${method.label} (${method.accountIdentifier})`,
    destinationDetails: `${method.label} · ${method.accountHolder} · ${method.accountIdentifier}`,
    accountHolder: method.accountHolder,
    status: "processing", // Passe immédiatement en traitement pour une expérience fluide
    requestedAt: new Date().toISOString(),
    referenceNumber: refNumber,
  };

  try {
    const current = getWithdrawalHistory(creatorId);
    const updated = [newRequest, ...current];
    localStorage.setItem(`${STORAGE_WITHDRAWALS_PREFIX}${creatorId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.WITHDRAWAL_CREATED, { detail: newRequest }));
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.BALANCE_CHANGED));

    // 1. Synchronisation backend sécurisée côté serveur (Section 5 & 7)
    if (typeof fetch !== "undefined") {
      fetch("/api/financial/request-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          amount,
          currency,
          payoutMethod: method,
        }),
      }).catch((err) => console.warn("Notice: Server financial sync:", err));
    }

    // 2. Persistance Firestore sécurisée (règles withdrawals)
    try {
      const docRef = doc(db, "withdrawals", newRequest.id);
      setDoc(docRef, newRequest).catch((e) => console.warn("Notice: Firestore withdrawal sync:", e));
    } catch (e) {}

    // Simulation de validation automatique sous 12 secondes
    setTimeout(() => {
      markWithdrawalCompleted(creatorId, newRequest.id);
    }, 12000);

    return {
      success: true,
      request: newRequest,
    };
  } catch (e: any) {
    return {
      success: false,
      error: e?.message || "Erreur lors de l'enregistrement de la demande de retrait.",
    };
  }
}

/**
 * Met à jour le statut d'un retrait (ex: passage à 'completed' ou 'rejected')
 */
export function markWithdrawalCompleted(creatorId: string, withdrawalId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getWithdrawalHistory(creatorId);
    const updated = current.map((w) =>
      w.id === withdrawalId
        ? {
            ...w,
            status: "completed" as WithdrawalStatus,
            processedAt: new Date().toISOString(),
          }
        : w
    );
    localStorage.setItem(`${STORAGE_WITHDRAWALS_PREFIX}${creatorId}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.BALANCE_CHANGED));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Gestion du statut KYC
 */
export function getCreatorKycStatus(creatorId: string): KycVerificationInfo {
  if (typeof window === "undefined") return { status: "not_required" };
  try {
    const raw = localStorage.getItem(`${STORAGE_KYC_PREFIX}${creatorId}`);
    if (raw) return JSON.parse(raw);
    return {
      status: "verified",
      documentType: "cni",
      documentNumber: "CI-0994-8821",
      verifiedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    };
  } catch (e) {
    return { status: "not_required" };
  }
}

export function saveCreatorKycStatus(creatorId: string, info: KycVerificationInfo): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KYC_PREFIX}${creatorId}`, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent(FINANCIAL_EVENTS.KYC_CHANGED, { detail: info }));
  } catch (e) {
    console.error(e);
  }
}
