import crypto from "crypto";

export type InvoiceStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "wave" | "kpay" | "stripe";

export interface Invoice {
  paymentId: string;
  invoiceNumber: string;
  createdAt: string;
  status: InvoiceStatus;
  customerUid: string;
  customerEmail: string;
  offerId: string;
  offerName: string;
  offerType: string;
  companyId: string;
  creatorId: string;
  grossAmount: number;
  currency: string;
  providerFee: number;
  platformFee: number;
  creatorNetAmount: number;
  paymentProvider: PaymentProvider;
  operatorId?: string;
  countryCode?: string;
  phoneNumber?: string;
  providerTransactionId?: string;
  confirmedAt?: string;
  expiresAt?: string;
  refundId?: string | null;
}

export interface Refund {
  refundId: string;
  paymentId: string;
  amount: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
  status: "pending" | "completed";
}

const invoices = new Map<string, Invoice>();
const refunds = new Map<string, Refund>();
let invoiceSequence = 0;

const MANSA_PLATFORM_FEE_RATE = Math.min(
  0.05,
  Math.max(0, Number(process.env.MANSA_PLATFORM_FEE_RATE || 0.03)),
);

// KPay rates supplied for the launch markets. The provider webhook remains
// authoritative in production; these rates are only the test-mode estimate.
const KPAY_PAYMENT_RATES: Record<string, number> = {
  "BJ:mtn": 0.042,
  "BJ:moov": 0.04,
  "CM:mtn": 0.02,
  "CM:orange": 0.02,
  "CI:mtn": 0.02,
  "CI:orange": 0.03,
  "CD:vodacom": 0.03,
  "CD:airtel": 0.04,
  "CD:orange": 0.04,
  "GA:airtel": 0.03,
  "CG:airtel": 0.05,
  "CG:mtn": 0.05,
  "RW:airtel": 0.03,
  "RW:mtn": 0.04,
  "SN:free": 0.03,
  "SN:orange": 0.03,
  "SL:orange": 0.04,
  "UG:airtel": 0.035,
  "UG:mtn": 0.04,
  "ZM:airtel": 0.03,
  "ZM:mtn": 0.03,
  "ZM:zamtel": 0.03,
};

export function estimateProviderFee(input: {
  provider: PaymentProvider;
  grossAmount: number;
  countryCode?: string;
  operatorId?: string;
}) {
  if (input.provider === "wave") return Math.round(input.grossAmount * 0.01);
  if (input.provider === "stripe") return Math.round(input.grossAmount * 0.029);
  const rate = KPAY_PAYMENT_RATES[`${input.countryCode || ""}:${input.operatorId || ""}`] || 0;
  return Math.round(input.grossAmount * rate);
}

function nextPaymentId() {
  return `PAY-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function nextInvoiceNumber() {
  invoiceSequence += 1;
  return `INV-${new Date().getFullYear()}-${String(invoiceSequence).padStart(5, "0")}`;
}

export function createInvoice(input: Omit<Invoice, "paymentId" | "invoiceNumber" | "createdAt" | "status" | "providerFee" | "platformFee" | "creatorNetAmount" | "refundId">) {
  if (!input.customerUid) throw new Error("AUTHENTICATED_USER_REQUIRED");
  if (!input.offerId || !input.companyId || !input.creatorId) throw new Error("OFFER_OWNERSHIP_REQUIRED");
  if (!Number.isFinite(input.grossAmount) || input.grossAmount <= 0) throw new Error("INVALID_AMOUNT");

  const invoice: Invoice = {
    ...input,
    paymentId: nextPaymentId(),
    invoiceNumber: nextInvoiceNumber(),
    createdAt: new Date().toISOString(),
    status: "pending",
    providerFee: 0,
    platformFee: 0,
    creatorNetAmount: 0,
    refundId: null,
  };
  invoices.set(invoice.paymentId, invoice);
  return invoice;
}

export function getInvoice(paymentId: string) {
  return invoices.get(paymentId);
}

export function listInvoices() {
  return Array.from(invoices.values());
}

export function confirmInvoice(paymentId: string, providerTransactionId: string, amount: number, providerFee = 0) {
  const invoice = invoices.get(paymentId);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (invoice.status === "paid" || invoice.status === "refunded") return invoice;
  if (invoice.status !== "pending") throw new Error("INVOICE_NOT_PAYABLE");
  if (Math.round(amount) !== Math.round(invoice.grossAmount)) throw new Error("AMOUNT_MISMATCH");

  const estimatedProviderFee = estimateProviderFee({
    provider: invoice.paymentProvider,
    grossAmount: invoice.grossAmount,
    countryCode: invoice.countryCode,
    operatorId: invoice.operatorId,
  });
  invoice.providerFee = Math.max(0, Math.round(providerFee || estimatedProviderFee));
  const platformFee = Math.round(invoice.grossAmount * MANSA_PLATFORM_FEE_RATE);
  invoice.platformFee = platformFee;
  invoice.creatorNetAmount = Math.max(0, invoice.grossAmount - invoice.providerFee - platformFee);
  invoice.providerTransactionId = providerTransactionId;
  invoice.confirmedAt = new Date().toISOString();
  invoice.status = "paid";
  invoices.set(paymentId, invoice);
  return invoice;
}

export function failInvoice(paymentId: string) {
  const invoice = invoices.get(paymentId);
  if (!invoice || invoice.status !== "pending") return invoice;
  invoice.status = "failed";
  invoices.set(paymentId, invoice);
  return invoice;
}

export function createRefund(paymentId: string, amount: number, reason: string, approvedBy: string) {
  const invoice = invoices.get(paymentId);
  if (!invoice) throw new Error("INVOICE_NOT_FOUND");
  if (invoice.status !== "paid") throw new Error("INVOICE_NOT_REFUNDABLE");
  if (amount <= 0 || amount > invoice.grossAmount) throw new Error("INVALID_REFUND_AMOUNT");

  const refund: Refund = {
    refundId: `REF-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`,
    paymentId,
    amount,
    reason,
    approvedBy,
    createdAt: new Date().toISOString(),
    status: "completed",
  };
  refunds.set(refund.refundId, refund);
  invoice.status = "refunded";
  invoice.refundId = refund.refundId;
  invoices.set(paymentId, invoice);
  return refund;
}

export function reconcilePendingInvoices(maxAgeMinutes = 24 * 60) {
  const threshold = Date.now() - maxAgeMinutes * 60 * 1000;
  let failed = 0;
  for (const invoice of invoices.values()) {
    if (invoice.status === "pending" && new Date(invoice.createdAt).getTime() < threshold) {
      failInvoice(invoice.paymentId);
      failed += 1;
    }
  }
  return { checked: invoices.size, failed };
}

export function verifyProviderSignature(rawBody: string, signature: string | undefined, secret: string | undefined) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function getRefund(refundId: string) {
  return refunds.get(refundId);
}
