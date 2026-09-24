import React from "react";

export type BusinessCategory =
  | "trading"
  | "software"
  | "community"
  | "courses"
  | "reselling"
  | "fitness"
  | "Agency"
  | "Gaming"
  | "Service"
  | "Community"
  | "Shopping"
  | "SaaS"
  | "Marketplace"
  | "Events"
  | "Media"
  | "Trading";

export interface PricingTier {
  name: string;
  price: string;
  interval: string;
  features: string[];
  popular?: boolean;
}

export interface GeneratedBusinessPlan {
  businessName: string;
  tagline: string;
  category: string;
  recommendedPricing: string;
  targetAudience: string;
  features: string[];
  techStack: string[];
  estimatedMonthlyRevenue: string;
}

export interface BusinessProject {
  id: string;
  name: string;
  tagline: string;
  category: string;
  pricingAmount: number;
  pricingModel: "subscription" | "one_time" | "annual" | "free_upsell";
  currency: string;
  targetAudience: string;
  status: "active" | "draft" | "paused";
  features: string[];
  techStack: string[];
  estimatedMonthlyRevenue: number;
  affiliateCommissionRate: number;
  membersCount: number;
  conversionRate: string;
  createdAt: string;
  updatedAt: string;
  apps: string[];
  storeUrl: string;
  coverImage?: string;
  companyId?: string;
  companyName?: string;
}

export interface LiveEvent {
  id: string;
  type: "transfer" | "sale" | "ad_spend" | "member_joined";
  amount?: string;
  text: string;
  meta: string;
  timestamp: string;
  iconType: "mailbox" | "cash_register" | "videocamera" | "piggybank";
}

export interface LiveTransaction {
  id: string;
  timestamp: string;
  amount: string;
  currency: string;
  productName: string;
  category: string;
  buyerLocation: string;
  creatorName: string;
}

export interface CategoryCardItem {
  id: string;
  categoryKey: string;
  title: string;
  titleFr?: string;
  subtitle?: string;
  description?: string;
  image?: string;
  gradient?: string;
  pricingPreview?: string;
  samplePrompt: string;
  icon?: React.ComponentType<{ className?: string }>;
  colorGradient?: string;
}

export interface Company {
  id: string;
  name: string; // Nom de l'entreprise
  description: string; // Description de la vitrine
  acceptedPayments: string[]; // Moyens de paiement acceptés (Wave, Orange Money, MTN MoMo, Carte bancaire, etc.)
  primaryCurrency: string; // Devise Principale de l'entreprise (XOF, EUR, USD, etc.)
  logoInitials?: string;
  colorGradient?: string;
  supportEmail?: string;
  supportAutoReplyEnabled?: boolean;
  supportAutoReplyMessage?: string;
  companyBanner?: string; // Bannière personnalisée de l'entreprise
  companyLogo?: string; // Photo de profil / Logo de l'entreprise
  createdAt: string;
  updatedAt?: string;
  payoutMethod?: string;
  momoNumber?: string;
  momoName?: string;
  bankName?: string;
  bankIbanRib?: string;
  bankAccountHolder?: string;
}

export interface EmbedComponentTab {
  id: string;
  name: string;
  description: string;
  codeSnippet: string;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  category: BusinessCategory | string;
  rating: number;
  reviewsCount: number;
  priceMonthly: string;
  description: string;
  tags: string[];
  bannerColor?: string;
  monthlySalesEstimate?: string;
  verified?: boolean;
  memberCount?: number;
  storeUrl?: string;
  countryCode?: string;
}

export interface TelegramChannelItem {
  id: string;
  name: string;
  subscribersCount?: number;
  quote?: string;
  description?: string;
  inviteLink?: string;
  instagramUrl?: string;
  avatarUrl?: string;
  tag?: string;
}

export interface DiscordChannelItem {
  id: string;
  name: string;
  subscribersCount?: number;
  description?: string;
  inviteLink?: string;
  avatarUrl?: string;
  tag?: string;
  role?: string;
}

export interface EbookResourceItem {
  id: string;
  title: string;
  description?: string;
  downloadUrl?: string;
  fileSize?: string;
  pagesCount?: number;
  coverImage?: string;
  associatedOfferId?: string;
  associatedOfferTitle?: string;
}

export interface CourseResourceItem {
  id: string;
  title: string;
  description?: string;
  modulesCount?: number;
  duration?: string;
  accessUrl?: string;
  associatedOfferId?: string;
  associatedOfferTitle?: string;
}

export interface PrivateResourceItem {
  id: string;
  name: string;
  type: "service" | "document" | "group" | "channel" | "link";
  description?: string;
  url?: string;
  associatedOfferId?: string;
  associatedOfferTitle?: string;
}

export interface CreatorPlatformOffer {
  id: string;
  title: string;
  companyId: string;
  creatorId?: string;
  companyName: string;
  companyInitials?: string;
  companyLogo?: string;
  companyGradient?: string;
  category: string;
  categoryLabel?: string;
  type?: "membership" | "digital" | "course" | "ebook";
  priceDisplay: string;
  priceAmount: number;
  currency: string;
  pricingType: "free" | "paid";
  billingCycle: "monthly" | "yearly" | "one_time";
  description?: string;
  imageUrl?: string;
  creatorName?: string;
  includedApps: string[];
  subscribersCount?: string;
  rating?: number;
  reviewsCount?: number;
  // Ressources et privilèges précis rattachés EXCLUSIVEMENT à cette offre :
  telegramChannels?: TelegramChannelItem[];
  discordChannels?: DiscordChannelItem[];
  discordInvite?: string;
  ebooks?: EbookResourceItem[];
  courses?: CourseResourceItem[];
  customResources?: PrivateResourceItem[];
  faqs?: { q: string; a: string }[];
  pricingOptions?: {
    id: string;
    name: string;
    price: number;
    billing: string;
  }[];
}

export interface EnterpriseSubscription {
  id: string;
  companyId: string;
  companyName: string;
  companyInitials?: string;
  companyLogo?: string;
  companyBanner?: string;
  companyGradient?: string;
  productName: string;
  productId?: string;
  priceDisplay: string;
  status: "active" | "trial" | "canceled";
  subscribedAt: string;
  onlineMembersCount?: number;
  includedApps: string[];
  unlockedProductIds?: string[];
  purchasedOfferIds?: string[]; // IDs des offres précisément achetées par le membre
  hasPaidOffer?: boolean;
  telegramChannels: TelegramChannelItem[];
  discordChannels?: DiscordChannelItem[];
  discordServerName?: string;
  discordInvite?: string;
  ebooks?: EbookResourceItem[];
  courses?: CourseResourceItem[];
  customResources?: PrivateResourceItem[];
  supportChannels?: {
    telegramSupport?: string;
    email?: string;
  };
  unreadCount?: number;
  isCommunityPreview?: boolean;
  hasJoined?: boolean;
  creatorName?: string;
  description?: string;
  rating?: number;
  reviewsCount?: number;
  subscribersCount?: string;
}

// ==========================================
// 💰 CRÉATEUR SYSTÈME FINANCIER & RETRAITS
// ==========================================

export type PayoutMethodType =
  | "wave"
  | "orange_money"
  | "mtn_momo"
  | "moov_money"
  | "bank_uemoa"
  | "bank_cemac"
  | "bank_sepa"
  | "crypto_usdt"
  | "paypal";

export interface PayoutMethodConfig {
  id: string;
  type: PayoutMethodType;
  label: string;
  accountHolder: string;
  accountIdentifier: string; // Ex: Numéro de téléphone, IBAN ou adresse wallet
  bankName?: string;
  swiftCode?: string;
  network?: string; // Ex: "TRC-20", "ERC-20"
  country?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: string;
}

export type WithdrawalStatus = "pending" | "processing" | "completed" | "rejected";

export interface WithdrawalRequest {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  payoutMethodId: string;
  payoutMethodType: PayoutMethodType;
  payoutMethodLabel: string;
  destinationDetails: string;
  accountHolder: string;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  referenceNumber: string;
  rejectionReason?: string;
}

export interface CreatorFinancialBalance {
  totalGrossVolume: number;
  totalPlatformFees: number;
  totalNetRevenue: number;
  pendingBalance: number; // Montants en attente (période de compensation 48h)
  availableBalance: number; // Montants disponibles au retrait immédiat
  reserveBalance: number; // Montants temporairement en réserve (ex: 5% rolling reserve)
  totalWithdrawn: number; // Total des retraits déjà versés
  currency: string;
}

export type KycVerificationStatus = "not_required" | "pending" | "verified" | "rejected";

export interface KycVerificationInfo {
  status: KycVerificationStatus;
  documentType?: "cni" | "passport" | "business_reg";
  documentNumber?: string;
  submittedAt?: string;
  verifiedAt?: string;
  notes?: string;
}
