/**
 * GESTION DU MOYEN DE RETRAIT CRÉATEUR
 * 
 * RÈGLE FONDAMENTALE DU SYSTÈME FINANCIER :
 * 1. La configuration d'un moyen de retrait n'est PAS obligatoire pour publier ou vendre.
 * 2. Un créateur peut créer des offres, les rendre publiques et encaisser des ventes
 *    même s'il n'a pas encore renseigné de compte bancaire, Mobile Money ou wallet.
 * 3. Les montants nets de chaque vente sont automatiquement crédités à son solde.
 * 4. La configuration du retrait est requise UNIQUEMENT lorsque le créateur souhaite
 *    demander le versement (retrait) de ses fonds disponibles.
 */

import { isWithdrawalConfigured } from "./creatorFinancialEngine";

export interface PayoutSettings {
  payoutMethod?: "wave" | "orange_momo" | "bank_uemoa" | "bank_cemac" | "crypto" | string;
  momoNumber?: string;
  momoName?: string;
  bankName?: string;
  bankIbanRib?: string;
  bankAccountHolder?: string;
}

const LOCAL_PAYOUT_CONFIGURED_KEY = "mansa_creator_payout_configured";

export function isCreatorPayoutConfigured(profile?: PayoutSettings | null): boolean {
  if (typeof window !== "undefined") {
    // Check direct withdrawal engine
    const withdrawalReady = isWithdrawalConfigured(profile?.momoName || "default");
    if (withdrawalReady) return true;

    const localFlag = localStorage.getItem(LOCAL_PAYOUT_CONFIGURED_KEY);
    if (localFlag === "true") return true;
    if (localFlag === "false") return false;
  }

  if (!profile) return false;

  const method = profile.payoutMethod;
  if (!method) return false;

  if (method === "wave" || method === "orange_momo") {
    return Boolean(profile.momoNumber && profile.momoNumber.trim().length >= 6);
  }

  if (method === "bank_uemoa" || method === "bank_cemac") {
    return Boolean(profile.bankIbanRib && profile.bankIbanRib.trim().length >= 8);
  }

  if (method === "crypto") {
    return true;
  }

  return false;
}

export function setCreatorPayoutConfigured(configured: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_PAYOUT_CONFIGURED_KEY, configured ? "true" : "false");
    window.dispatchEvent(new CustomEvent("mansa_payout_config_changed", { detail: { configured } }));
  }
}
