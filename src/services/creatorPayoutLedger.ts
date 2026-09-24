import {
  collection,
  db,
  doc,
  getDocs,
  query,
  runTransaction,
  where,
} from "./firebase";

export type LedgerEntryType =
  | "vente_confirmee"
  | "retrait_reserve"
  | "retrait_paye"
  | "retrait_echoue_recredite"
  | "remboursement";
export type LedgerStatus = "en_attente" | "disponible" | "reserve";
export type PayoutStatus = "requested" | "processing" | "completed" | "failed" | "en_attente_tresorerie";
export type PayoutDestination = "mobile_money" | "bank";

export interface LedgerEntry {
  creatorId: string;
  amount: number;
  grossAmount?: number;
  providerFee?: number;
  platformFee?: number;
  currency?: string;
  type: LedgerEntryType;
  status: LedgerStatus;
  createdAt: string;
  referenceInvoiceId?: string;
  referencePayoutId?: string;
  availableAt?: string;
}

export interface PayoutRequest {
  id: string;
  idempotencyKey: string;
  creatorId: string;
  amount: number;
  currency: string;
  destinationType: PayoutDestination;
  destinationDetails: string;
  status: PayoutStatus;
  createdAt: string;
  ledgerReserveEntryId?: string;
  transferReference?: string;
  failureReason?: string;
}

const HOLD_PERIOD_MS = 48 * 60 * 60 * 1000;

function availableFromEntries(entries: LedgerEntry[], now = Date.now()) {
  return entries.reduce((total, entry) => {
    const mature = entry.type !== "vente_confirmee" || !entry.availableAt || new Date(entry.availableAt).getTime() <= now;
    if (!mature) return total;
    if (entry.type === "vente_confirmee" && entry.status === "en_attente") return total;
    if (entry.type === "vente_confirmee" && entry.status === "disponible") return total + entry.amount;
    if (entry.type === "retrait_reserve" || entry.type === "retrait_paye" || entry.type === "remboursement") return total - Math.abs(entry.amount);
    if (entry.type === "retrait_echoue_recredite") return total + Math.abs(entry.amount);
    return total;
  }, 0);
}

export async function recordConfirmedSale(input: {
  creatorId: string;
  amount: number;
  grossAmount: number;
  providerFee: number;
  platformFee: number;
  currency: string;
  invoiceId: string;
}) {
  const now = new Date();
  const entry: LedgerEntry = {
    creatorId: input.creatorId,
    amount: input.amount,
    grossAmount: input.grossAmount,
    providerFee: input.providerFee,
    platformFee: input.platformFee,
    currency: input.currency,
    type: "vente_confirmee",
    status: "en_attente",
    createdAt: now.toISOString(),
    availableAt: new Date(now.getTime() + HOLD_PERIOD_MS).toISOString(),
    referenceInvoiceId: input.invoiceId,
  };
  await runTransaction(db, async (transaction) => {
    const ref = doc(collection(db, "ledger_entries"));
    transaction.set(ref, entry);
  });
  return entry;
}

export async function requestCreatorWithdrawal(input: {
  creatorId: string;
  amount: number;
  currency: string;
  destinationType: PayoutDestination;
  destinationDetails: string;
  kycStatus: "verified" | "pending" | "rejected" | "not_required";
  idempotencyKey: string;
}) {
  if (!input.idempotencyKey) throw new Error("IDEMPOTENCY_KEY_REQUIRED");
  if (!Number.isFinite(input.amount) || input.amount <= 0) throw new Error("INVALID_WITHDRAWAL_AMOUNT");

  const payoutRef = doc(db, "payouts", input.idempotencyKey);
  const treasuryRef = doc(db, "treasury_accounts", "mansa");
  const accountRef = doc(db, "creator_accounts", input.creatorId);

  return runTransaction(db, async (transaction) => {
    const [existingPayout, account, treasury] = await Promise.all([
      transaction.get(payoutRef),
      transaction.get(accountRef),
      transaction.get(treasuryRef),
    ]);
    if (existingPayout.exists()) return existingPayout.data() as PayoutRequest;

    const accountData = account.exists() ? account.data() : {};
    const effectiveKyc = accountData.kycStatus || input.kycStatus;
    if (effectiveKyc !== "verified") throw new Error("KYC_NOT_VERIFIED");

    // This materialized balance is the atomic reservation invariant. Every
    // settlement/recredit operation updates it in the same Firestore transaction
    // that appends its immutable ledger entry; the ledger remains the audit source.
    const availableBalance = Number(accountData.availableBalance || 0);
    if (input.amount > availableBalance) throw new Error("INSUFFICIENT_AVAILABLE_BALANCE");

    const treasuryBalance = Number(treasury.exists() ? treasury.data().bankAvailableBalance || 0 : 0);
    const payout: PayoutRequest = {
      id: input.idempotencyKey,
      idempotencyKey: input.idempotencyKey,
      creatorId: input.creatorId,
      amount: input.amount,
      currency: input.currency,
      destinationType: input.destinationType,
      destinationDetails: input.destinationDetails,
      status: input.destinationType === "bank" && treasuryBalance < input.amount ? "en_attente_tresorerie" : "requested",
      createdAt: new Date().toISOString(),
    };
    transaction.set(payoutRef, payout);

    if (payout.status === "en_attente_tresorerie") return payout;

    const reserveRef = doc(collection(db, "ledger_entries"));
    transaction.set(reserveRef, {
      creatorId: input.creatorId,
      amount: input.amount,
      type: "retrait_reserve",
      status: "reserve",
      createdAt: payout.createdAt,
      referencePayoutId: payout.id,
    } satisfies LedgerEntry);
    transaction.set(accountRef, { availableBalance: availableBalance - input.amount, updatedAt: new Date().toISOString() }, { merge: true });
    transaction.update(payoutRef, { ledgerReserveEntryId: reserveRef.id });
    return { ...payout, ledgerReserveEntryId: reserveRef.id };
  });
}

export async function markWithdrawalCompleted(input: { payoutId: string; transferReference: string }) {
  if (!input.transferReference.trim()) throw new Error("TRANSFER_REFERENCE_REQUIRED");
  const payoutRef = doc(db, "payouts", input.payoutId);
  return runTransaction(db, async (transaction) => {
    const payoutSnap = await transaction.get(payoutRef);
    if (!payoutSnap.exists()) throw new Error("PAYOUT_NOT_FOUND");
    const payout = payoutSnap.data() as PayoutRequest;
    if (payout.status === "completed") return payout;
    if (payout.status !== "requested" && payout.status !== "processing") throw new Error("PAYOUT_NOT_PROCESSABLE");
    transaction.update(payoutRef, { status: "completed", transferReference: input.transferReference, processedAt: new Date().toISOString() });
    const paidRef = doc(collection(db, "ledger_entries"));
    transaction.set(paidRef, { creatorId: payout.creatorId, amount: payout.amount, type: "retrait_paye", status: "reserve", createdAt: new Date().toISOString(), referencePayoutId: payout.id } satisfies LedgerEntry);
    return { ...payout, status: "completed" as const, transferReference: input.transferReference };
  });
}

export async function markWithdrawalFailed(input: { payoutId: string; reason: string }) {
  const payoutRef = doc(db, "payouts", input.payoutId);
  return runTransaction(db, async (transaction) => {
    const payoutSnap = await transaction.get(payoutRef);
    if (!payoutSnap.exists()) throw new Error("PAYOUT_NOT_FOUND");
    const payout = payoutSnap.data() as PayoutRequest;
    const accountRef = doc(db, "creator_accounts", payout.creatorId);
    const accountSnap = await transaction.get(accountRef);
    if (payout.status === "failed") return payout;
    if (payout.status === "completed") throw new Error("COMPLETED_PAYOUT_CANNOT_FAIL");
    transaction.update(payoutRef, { status: "failed", failureReason: input.reason, processedAt: new Date().toISOString() });
    const recreditRef = doc(collection(db, "ledger_entries"));
    transaction.set(recreditRef, { creatorId: payout.creatorId, amount: payout.amount, type: "retrait_echoue_recredite", status: "disponible", createdAt: new Date().toISOString(), referencePayoutId: payout.id } satisfies LedgerEntry);
    transaction.set(accountRef, { availableBalance: Number(accountSnap.data()?.availableBalance || 0) + payout.amount, updatedAt: new Date().toISOString() }, { merge: true });
    return { ...payout, status: "failed" as const, failureReason: input.reason };
  });
}

export async function getCreatorAvailableBalance(creatorId: string) {
  const snapshot = await getDocs(query(collection(db, "ledger_entries"), where("creatorId", "==", creatorId)));
  return availableFromEntries(snapshot.docs.map((item) => item.data() as LedgerEntry));
}

// Limite de trésorerie : Wave/KPay ne financent pas directement un virement bancaire.
// Mansa doit d'abord transférer manuellement les fonds vers sa banque d'entreprise.
export async function updateMansaBankTreasury(bankAvailableBalance: number) {
  if (!Number.isFinite(bankAvailableBalance) || bankAvailableBalance < 0) throw new Error("INVALID_TREASURY_BALANCE");
  await runTransaction(db, async (transaction) => {
    transaction.set(doc(db, "treasury_accounts", "mansa"), { bankAvailableBalance, updatedAt: new Date().toISOString() }, { merge: true });
  });
}
