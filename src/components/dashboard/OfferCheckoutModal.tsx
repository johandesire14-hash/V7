import React, { useState } from "react";
import {
  X,
  Star,
  Share2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Lock,
  Check,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Smartphone,
  CreditCard,
  MessageSquare,
  Users,
  UserPlus,
  GraduationCap,
  BookOpen,
  FileText,
  Headphones,
  Sparkles,
  LayoutDashboard,
  FileCheck,
} from "lucide-react";
import { TelegramIcon, DiscordIcon } from "../common/Icons";
import {
  EnterpriseSubscription,
  TelegramChannelItem,
  DiscordChannelItem,
  CreatorPlatformOffer,
} from "../../types";
import { MobileMoneyPaymentForm } from "../payment/MobileMoneyPaymentForm";
import { PhoneValidationResult } from "../../utils/phoneValidationRules";
import { useModalDismiss } from "../../hooks/useModalDismiss";
import { createRealTransaction } from "../../services/dbService";
import { recordConfirmedSale } from "../../services/creatorPayoutLedger";

export type { CreatorPlatformOffer };

interface OfferCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: CreatorPlatformOffer | null;
  user?: {
    uid?: string;
    name?: string;
    email?: string;
    avatarInitials?: string;
  };
  onPaymentSuccess: (newSubscription: EnterpriseSubscription) => void;
  isCompanyOwner?: boolean;
  isAlreadyPurchased?: boolean;
  onAccessContent?: (offer: CreatorPlatformOffer) => void;
}

export const OfferCheckoutModal: React.FC<OfferCheckoutModalProps> = ({
  isOpen,
  onClose,
  offer,
  user,
  onPaymentSuccess,
  isCompanyOwner = false,
  isAlreadyPurchased = false,
  onAccessContent,
}) => {
  if (!isOpen || !offer) return null;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    offer.pricingOptions && offer.pricingOptions.length > 0
      ? offer.pricingOptions[0].id
      : "monthly"
  );
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mobile_money">("mobile_money");
  const [mobileMoneyValidation, setMobileMoneyValidation] = useState<PhoneValidationResult | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>(user?.email || "client@mansa.app");
  const customerName = user?.name || (user as any)?.displayName || "Client";
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);
  const [createdSubscription, setCreatedSubscription] = useState<EnterpriseSubscription | null>(null);

  const defaultFaqs = offer.faqs && offer.faqs.length > 0
    ? offer.faqs
    : [
        {
          q: "Comment fonctionne l'accès après le paiement ?",
          a: "Votre accès à l'entreprise est débloqué instantanément. Vos applications et fichiers inclus sont disponibles dans votre espace membre.",
        },
        {
          q: "Ai-je accès à toutes les options de l'entreprise ?",
          a: "En débloquant cette offre, vous avez accès à l'accueil, au support client et à toutes les applications incluses dans la formule choisie.",
        },
        {
          q: "Puis-je résilier à tout moment ?",
          a: "Oui, la gestion s'effectue en 1 clic depuis votre espace membre dans Mansa. Aucun engagement de durée, vous gardez l'accès jusqu'à la fin de la période facturée.",
        },
      ];

  const pricingPlans = offer.pricingOptions && offer.pricingOptions.length > 0
    ? offer.pricingOptions
    : [
        {
          id: "monthly",
          name: "Abonnement Mensuel",
          price: offer.priceAmount,
          billing: "par mois",
        },
        {
          id: "yearly",
          name: "Annuel (-20% de réduction)",
          price: Math.round(offer.priceAmount * 12 * 0.8),
          billing: "par an",
        },
      ];

  const currentPlan = pricingPlans.find((p) => p.id === selectedPlanId) || pricingPlans[0];

  // Resolve all apps strictly to the 4 official Mansa Apps: Telegram, Discord, Fichiers, Cours & formations
  const resolvedApps = React.useMemo<string[]>(() => {
    const list: string[] = [];
    if (offer.includedApps && offer.includedApps.length > 0) {
      for (const app of offer.includedApps) {
        const lower = app.toLowerCase();
        if (lower.includes("telegram")) list.push("Telegram");
        else if (lower.includes("discord")) list.push("Discord");
        else if (lower.includes("cours") || lower.includes("course") || lower.includes("formation")) list.push("Cours & formations");
        else if (lower.includes("fichier") || lower.includes("file") || lower.includes("ebook") || lower.includes("téléchargement")) list.push("Fichiers");
      }
    }
    if (offer.telegramChannels && offer.telegramChannels.length > 0 && !list.includes("Telegram")) {
      list.push("Telegram");
    }
    if (offer.discordChannels && offer.discordChannels.length > 0 && !list.includes("Discord")) {
      list.push("Discord");
    }
    if (((offer.courses && offer.courses.length > 0) || ((offer as any).courseModules && (offer as any).courseModules.length > 0)) && !list.includes("Cours & formations")) {
      list.push("Cours & formations");
    }
    if (((offer.ebooks && offer.ebooks.length > 0) || ((offer as any).digitalFiles && (offer as any).digitalFiles.length > 0)) && !list.includes("Fichiers")) {
      list.push("Fichiers");
    }
    return Array.from(new Set(list));
  }, [offer]);
  const storefrontApps = resolvedApps.filter((app) => !/(cours|course|formation)/i.test(app));

  const getAppDetail = (appKey: string) => {
    const key = appKey.toLowerCase();
    if (key.includes("telegram")) {
      return {
        title: "Telegram",
        description:
          offer.telegramChannels?.[0]?.description ||
          "Alertes privées, signaux et canal de diffusion officiel réservé aux membres.",
        badge: "Telegram",
        icon: <TelegramIcon className="size-5 text-[#229ED9]" />,
      };
    }
    if (key.includes("discord")) {
      return {
        title: "Discord",
        description:
          offer.discordChannels?.[0]?.description ||
          "Salons textuels et vocaux VIP avec attribution automatique des rôles.",
        badge: "Discord",
        icon: <DiscordIcon className="size-5 text-[#5865F2]" />,
      };
    }
    if (key.includes("cours") || key.includes("course") || key.includes("formation")) {
      return {
        title: "Cours & Formations vidéo",
        description:
          offer.courses?.[0]?.description ||
          "Accès complet au cursus vidéo interactif et fiches d'exercices pratiques.",
        badge: "Formation",
        icon: <GraduationCap className="size-5 text-indigo-400" />,
      };
    }
    return {
      title: "Fichiers & Documents",
      description: "Templates, fichiers téléchargeables et guides immédiatement disponibles.",
      badge: "Fichiers",
      icon: <FileText className="size-5 text-emerald-400" />,
    };
  };

  const isMobileMoneyValid =
    paymentMethod === "mobile_money" ? Boolean(mobileMoneyValidation?.isValid) : true;

  const isPayButtonDisabled =
    isProcessing || (offer.pricingType === "paid" && !isCompanyOwner && !isMobileMoneyValid);

  const handleProcessPayment = async () => {
    setPaymentError(null);
    setIsProcessing(true);

    // The owner sees the same payment page, but the final action is free and
    // must never create an invoice or record a sale.
    if (offer.pricingType === "paid" && !isCompanyOwner) {
      if (paymentMethod === "mobile_money" && !mobileMoneyValidation?.isValid) {
        setIsProcessing(false);
        setPaymentError("Veuillez renseigner un numéro Mobile Money valide avant de continuer.");
        return;
      }

      if (!user?.uid) {
        setIsProcessing(false);
        setPaymentError("Connectez-vous à votre compte Mansa avant de payer.");
        return;
      }

      try {
        const paymentProvider = paymentMethod === "mobile_money" && mobileMoneyValidation?.operatorId.toLowerCase().includes("wave") ? "wave" : "kpay";
        const invoiceResponse = await fetch("/api/payment/invoices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerUid: user.uid,
            customerEmail,
            offerId: offer.id,
            offerName: offer.title,
            offerType: offer.type || "membership",
            companyId: offer.companyId,
            creatorId: offer.creatorId || offer.companyId,
            grossAmount: currentPlan.price,
            currency: offer.currency || "XAF",
            paymentProvider,
            operatorId: mobileMoneyValidation?.operatorId,
            countryCode: mobileMoneyValidation?.countryCode,
            phoneNumber: mobileMoneyValidation?.normalizedNumber,
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          }),
        });
        const invoiceData = await invoiceResponse.json();
        if (!invoiceResponse.ok || !invoiceData.success) {
          setIsProcessing(false);
          setPaymentError(invoiceData.error || "Impossible de créer la facture.");
          return;
        }

        // Mode test : simule uniquement la confirmation du prestataire.
        // En production, cette étape sera remplacée par le webhook Wave/KPay.
        const confirmationResponse = await fetch(`/api/payment/invoices/${invoiceData.invoice.paymentId}/test-confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: currentPlan.price, providerFee: 0 }),
        });
        const confirmationData = await confirmationResponse.json();
        if (!confirmationResponse.ok || !confirmationData.success) {
          setIsProcessing(false);
          setPaymentError(confirmationData.error || "Le paiement est en attente de confirmation.");
          return;
        }
        await recordConfirmedSale({
          creatorId: offer.creatorId || offer.companyId,
          amount: confirmationData.invoice.creatorNetAmount,
          grossAmount: confirmationData.invoice.grossAmount,
          providerFee: confirmationData.invoice.providerFee,
          platformFee: confirmationData.invoice.platformFee,
          currency: confirmationData.invoice.currency,
          invoiceId: invoiceData.invoice.paymentId,
        });
      } catch (err: any) {
        setIsProcessing(false);
        setPaymentError("Impossible de créer ou confirmer la facture. Réessayez.");
        return;
      }
    }

    setTimeout(() => {
      // Determine what apps are unlocked with this purchase
      const baseApps = ["dashboard", "support"];
      const offerApps = offer.includedApps || [];
      const combinedApps = Array.from(new Set([...baseApps, ...offerApps]));

      // Create new enterprise subscription
      const newSub: EnterpriseSubscription = {
        id: `sub-${offer.companyId}-${Date.now()}`,
        companyId: offer.companyId,
        companyName: offer.companyName,
        companyInitials:
          offer.companyInitials ||
          offer.companyName.substring(0, 2).toUpperCase(),
        companyLogo: offer.companyLogo,
        companyGradient:
          offer.companyGradient || "from-[#0d2818] via-[#051f10] to-[#010a04]",
        productName: offer.title,
        productId: offer.id,
        priceDisplay: offer.priceDisplay,
        status: "active",
        subscribedAt: "À l'instant",
        onlineMembersCount: 142,
        unreadCount: 0,
        includedApps: combinedApps,
        unlockedProductIds: [offer.id],
        purchasedOfferIds: [offer.id],
        hasPaidOffer: offer.pricingType !== "free",
        telegramChannels: offer.telegramChannels || [],
        discordChannels: offer.discordChannels || [],
        ebooks: offer.ebooks || [],
        courses: offer.courses || [],
        customResources: offer.customResources || [],
        discordServerName: `${offer.companyName} Discord HQ`,
        discordInvite: offer.discordInvite || (offer.discordChannels?.[0]?.inviteLink || ""),
        supportChannels: {
          telegramSupport: "@SupportEquipeAfhub",
          email: `support@${offer.companyId}.afhub.app`,
        },
      };

      setCreatedSubscription(newSub);
      setIsProcessing(false);
      setIsCompleted(true);

      // Enregistrement systématique de la vente rattachée au compte financier du créateur
      if (!isCompanyOwner && offer.pricingType !== "free" && currentPlan.price > 0) {
        const creatorKey = offer.companyId || user?.uid || user?.email || "creator-default";
        createRealTransaction(creatorKey, {
          buyerName: customerName,
          buyerEmail: customerEmail,
          buyerLocation: mobileMoneyValidation?.countryName || "Afrique de l'Ouest",
          productName: offer.title,
          productId: offer.id,
          amount: `${currentPlan.price.toLocaleString("fr-FR")} ${offer.currency || "XAF"}`,
          amountNumber: currentPlan.price,
          currency: offer.currency || "XAF",
          paymentMethod:
            paymentMethod === "mobile_money"
              ? `${mobileMoneyValidation?.operatorName || "Mobile Money"} (${mobileMoneyValidation?.dialCode || ""})`
              : "Carte Bancaire (Stripe/Visa)",
        }).catch((err) => console.warn("Could not log sale transaction:", err));
      }
    }, 1200);
  };

  const handleJoinCompanyFree = () => {
    setIsProcessing(true);
    setTimeout(() => {
      // User joins company without paying for this offer:
      // STRICT SCOPE: Only "dashboard" (accueil) & "support" (chat support).
      // Offers, Telegram VIP, Discord VIP remain locked!
      const freeSub: EnterpriseSubscription = {
        id: `sub-${offer.companyId}-${Date.now()}`,
        companyId: offer.companyId,
        companyName: offer.companyName,
        companyInitials:
          offer.companyInitials ||
          offer.companyName.substring(0, 2).toUpperCase(),
        companyLogo: offer.companyLogo,
        companyGradient:
          offer.companyGradient || "from-[#0d2818] via-[#051f10] to-[#010a04]",
        productName: "Adhésion Membre (Sans offre payante)",
        productId: `free-member-${offer.companyId}`,
        priceDisplay: "0 € Gratuit",
        status: "active",
        subscribedAt: "À l'instant",
        onlineMembersCount: 142,
        unreadCount: 0,
        includedApps: ["dashboard", "support"], // STRICT: ONLY dashboard & support
        unlockedProductIds: [], // NO paid offer unlocked
        hasPaidOffer: false,
        telegramChannels: [],
        discordChannels: [],
        discordServerName: `${offer.companyName} Discord HQ`,
        discordInvite: "",
        supportChannels: {
          telegramSupport: "@SupportEquipeAfhub",
          email: `support@${offer.companyId}.afhub.app`,
        },
      };

      setCreatedSubscription(freeSub);
      setIsProcessing(false);
      setIsCompleted(true);
    }, 600);
  };

  const handleFinalConfirm = () => {
    if (createdSubscription) {
      onPaymentSuccess(createdSubscription);
      onClose();
    }
  };

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen: true,
    onClose,
    closeOnEscape: true,
    lockScroll: true,
    disabled: isProcessing,
  });

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        {...contentProps}
        className="relative w-full max-w-[510px] rounded-2xl border border-white/15 bg-[#101012] shadow-2xl overflow-hidden my-auto text-white cursor-default"
      >
        
        {/* TOP BAR: Matches Creator Storefront Preview */}
        <div className="bg-[#14161d] border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-800 text-white flex items-center justify-center font-black text-sm border border-emerald-400/30 shadow-sm overflow-hidden shrink-0">
                {offer.companyLogo ? (
                  <img src={offer.companyLogo} alt={offer.companyName} className="size-full object-cover" />
                ) : (
                  <span>{offer.companyInitials || offer.companyName.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="block truncate text-xs font-semibold text-zinc-300">{offer.companyName}</span>
                <span className="block truncate text-sm font-bold text-white">{offer.title}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-zinc-400">
            <div className="hidden sm:flex items-center gap-1 font-mono text-amber-400 font-bold bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-lg">
              <Star className="size-3 fill-amber-400" />
              <span>{offer.rating || 4.9} / 5.0 ({offer.reviewsCount || 184} avis)</span>
            </div>

            <button
              onClick={() => {
                navigator.clipboard?.writeText?.(window.location.href);
              }}
              className="flex items-center gap-1 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5 text-xs"
              title="Partager cette offre"
            >
              <Share2 className="size-3.5" />
              <span className="hidden sm:inline">Partager</span>
            </button>

            <button
              onClick={onClose}
              className="size-8 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
              title="Fermer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* COMPLETED SUCCESS SCREEN */}
        {isCompleted && createdSubscription ? (
          <div className="p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 animate-in zoom-in-95 duration-200">
            <div className="size-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl">
              <CheckCircle2 className="size-10 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {createdSubscription.hasPaidOffer ? "Paiement validé avec succès !" : `Bienvenue chez ${offer.companyName} !`}
              </h2>
              {createdSubscription.hasPaidOffer && paymentMethod === "mobile_money" && mobileMoneyValidation && (
                <div className="flex items-center justify-center gap-2 text-emerald-300 text-xs font-mono">
                  <span>{mobileMoneyValidation.flag}</span>
                  <span>{mobileMoneyValidation.operatorName}</span>
                  <span>·</span>
                  <span>{mobileMoneyValidation.fullInternationalNumber}</span>
                </div>
              )}
              <p className="text-sm text-zinc-300 leading-relaxed">
                {createdSubscription.hasPaidOffer ? (
                  <span>
                    Vous avez rejoint l'entreprise <strong className="text-emerald-400 font-semibold">{offer.companyName}</strong> avec votre offre débloquée : <strong className="text-white">{createdSubscription.productName}</strong>.
                  </span>
                ) : (
                  <span>
                    Vous avez rejoint l'entreprise <strong className="text-emerald-400 font-semibold">{offer.companyName}</strong> en tant que membre officiel simple (sans offre payante).
                  </span>
                )}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#14161f] border border-white/10 text-left space-y-3">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
                <span>Vos privilèges attribués :</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Actif immédiatement</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                  <Check className="size-4 shrink-0" />
                  <span>Accès illimité à la communauté et l'espace officiel de l'entreprise</span>
                </div>
                <div className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                  <Check className="size-4 shrink-0" />
                  <span>Chat direct avec le support & réponses d'assistance</span>
                </div>
                {resolvedApps
                  .filter((appKey) => !["dashboard", "support", "community"].includes(appKey.toLowerCase()))
                  .map((appKey) => {
                    const item = getAppDetail(appKey);
                    return (
                      <div key={appKey} className="flex items-center gap-2.5 text-emerald-400 font-semibold">
                        <Check className="size-4 shrink-0" />
                        <span>{item.title} débloqué avec succès</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            <button
              onClick={handleFinalConfirm}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Accéder à l'Espace Entreprise ({offer.companyName})</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        ) : (
          /* 2-COLUMN STOREFRONT & CHECKOUT (EXACT REPLICA OF CREATOR PREVIEW) */
          <div className="max-h-[88vh] overflow-y-auto p-4 sm:p-5">
            
            {/* LEFT MAIN CONTENT (7 COLS) */}
            <div className="hidden">
              
              {/* Hero Media Showcase */}
              <div className="relative rounded-2xl border border-white/10 bg-[#151720] overflow-hidden group">
                <div className="relative h-64 sm:h-72 w-full">
                  <img
                    src={offer.imageUrl}
                    alt={offer.title}
                    className="size-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-emerald-400 flex items-center gap-1.5 border border-white/10 shadow-lg">
                    <Zap className="size-3.5" />
                    <span>Accès instantané 24/7</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-mono text-zinc-300 border border-white/10">
                    {offer.subscribersCount || "142 membres actifs"}
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {offer.title}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
                  {offer.description}
                </p>
              </div>

              {/* Applications liées */}
              {storefrontApps.length > 0 && (
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="size-3.5 text-emerald-400" />
                    <span>Applications liées</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {storefrontApps.map((appKey) => {
                      const item = getAppDetail(appKey);
                      return (
                        <div
                          key={appKey}
                          className="rounded-2xl border border-white/10 bg-[#14161f] p-3.5 flex items-start gap-3 transition-colors hover:border-white/20"
                        >
                          <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                            {item.icon}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 shrink-0">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Documents & Fichiers si présents */}
              {((offer.ebooks && offer.ebooks.length > 0) || ((offer as any).digitalFiles && (offer as any).digitalFiles.length > 0)) && (
                <div className="p-4 sm:p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-emerald-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Fichiers inclus ({((offer as any).digitalFiles?.length || offer.ebooks?.length || 1)})
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Téléchargement immédiat
                    </span>
                  </div>

                  <div className="space-y-2">
                    {((offer as any).digitalFiles || offer.ebooks || []).map((file: any, idx: number) => (
                      <div
                        key={file.id || idx}
                        className="p-3 rounded-xl bg-[#1a1d27] border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileCheck className="size-4 text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-white block truncate">{file.title || file.name}</span>
                            <span className="text-[10px] text-zinc-400 font-mono">{file.size || (file.pagesCount ? `${file.pagesCount} pages` : "Téléchargement immédiat")}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-400">Prêt</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Section Accordion */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Questions fréquemment posées
                </h4>
                <div className="space-y-2">
                  {defaultFaqs.map((faq, idx) => {
                    const isExpanded = expandedFaqIndex === idx;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-white/10 bg-[#14161d] p-3.5 space-y-1.5 transition-all"
                      >
                        <div
                          onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                          className="flex items-center justify-between cursor-pointer text-xs font-bold text-white"
                        >
                          <span>{faq.q}</span>
                          <span className="text-emerald-400 font-bold text-base">
                            {isExpanded ? "−" : "+"}
                          </span>
                        </div>
                        {isExpanded && (
                          <p className="text-xs text-zinc-400 pt-2 border-t border-white/5 leading-relaxed font-light">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT STICKY CHECKOUT & PRICING CARD (5 COLS) */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#10131b] p-4 shadow-xl space-y-5">
                
                {offer.imageUrl && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                    <img
                      src={offer.imageUrl}
                      alt={offer.title}
                      className="w-full aspect-[16/7] object-cover"
                    />
                  </div>
                )}
                <h2 className="text-base font-bold text-white leading-snug">{offer.title}</h2>

                {/* Price Header */}
                <div className="space-y-1 pb-3 border-b border-white/10">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                    {offer.pricingType === "free" ? "Accès Libre" : "Tarif Officiel"}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white font-mono">
                      {offer.pricingType === "free"
                        ? "0 € Gratuit"
                        : `${currentPlan.price} ${offer.currency === "EUR" ? "€" : offer.currency}`}
                    </span>
                    {offer.pricingType === "paid" && (
                      <span className="text-xs text-zinc-400 font-mono">
                        / {currentPlan.billing}
                      </span>
                    )}
                  </div>
                </div>

                {/* Plan Options Selector */}
                {offer.pricingType === "paid" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-300 block">
                      Choisissez votre formule :
                    </label>
                    {pricingPlans.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedPlanId(opt.id)}
                        className={`p-3 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                          selectedPlanId === opt.id
                            ? "border-emerald-400 bg-emerald-500/10 text-white shadow-md"
                            : "border-white/10 bg-[#1b1e2a] text-zinc-300 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`size-3.5 rounded-full border flex items-center justify-center ${
                            selectedPlanId === opt.id ? "border-emerald-400 bg-emerald-400" : "border-zinc-500"
                          }`}>
                            {selectedPlanId === opt.id && <span className="size-1 rounded-full bg-black" />}
                          </span>
                          <span>{opt.name}</span>
                        </div>
                        <span className="font-mono font-bold text-white">
                          {opt.price} {offer.currency === "EUR" ? "€" : offer.currency}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Buyer Information & Action Handling based on status */}
                {isAlreadyPurchased ? (
                  <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                    <div className="size-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-white">Offre déjà débloquée</h3>
                      <p className="text-xs text-zinc-300 leading-relaxed">
                        Vous avez déjà accès à cette offre et à tous ses privilèges. Aucun nouveau paiement n'est nécessaire.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onAccessContent) {
                          onAccessContent(offer);
                          onClose();
                        } else {
                          onClose();
                        }
                      }}
                      className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Accéder au contenu</span>
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl border border-white/10 bg-[#10131b] p-4 space-y-4">
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="text-[11px] font-semibold text-zinc-300 block mb-1">
                          Votre adresse email pour la confirmation :
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#1b1e2a] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-emerald-400"
                          placeholder="nom@exemple.com"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    {offer.pricingType === "paid" && (
                      <div className="space-y-2 pt-1">
                        <label className="text-[11px] font-bold text-zinc-300 block">
                          Mode de paiement sécurisé :
                        </label>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentMethod("card")}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              paymentMethod === "card"
                                ? "border-emerald-400 bg-emerald-500/15 text-white"
                                : "border-white/10 bg-[#1b1e2a] text-zinc-400 hover:text-white"
                            }`}
                          >
                            <CreditCard className="size-3.5 text-emerald-400" />
                            <span>Carte bancaire</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPaymentMethod("mobile_money")}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              paymentMethod === "mobile_money"
                                ? "border-amber-400 bg-amber-400/15 text-white"
                                : "border-white/10 bg-[#1b1e2a] text-zinc-400 hover:text-white"
                            }`}
                          >
                            <Smartphone className="size-3.5 text-amber-400" />
                            <span>Mobile Money</span>
                          </button>
                        </div>

                        {paymentMethod === "mobile_money" && (
                          <MobileMoneyPaymentForm
                            currency={offer.currency || "XAF"}
                            onValidationChange={setMobileMoneyValidation}
                            defaultDialCode="+242"
                          />
                        )}

                        {paymentError && (
                          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                            <AlertCircle className="size-4 text-red-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold text-white">Échec du paiement</p>
                              <p className="text-[11px] text-red-200/90 leading-tight">{paymentError}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Main CTA Button */}
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        disabled={isPayButtonDisabled}
                        onClick={handleProcessPayment}
                        className={`w-full py-4 rounded-2xl font-black text-base shadow-xl transition-all flex items-center justify-center gap-2 ${
                          isPayButtonDisabled
                            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5 opacity-60"
                            : "bg-[#0066FF] hover:bg-[#0055EE] text-white cursor-pointer shadow-blue-500/20"
                        }`}
                      >
                        {isProcessing ? (
                          <div className="flex items-center gap-2">
                            <span className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            <span>Validation sécurisée...</span>
                          </div>
                        ) : (
                          <>
                            <span>
                              {offer.pricingType === "free"
                                ? "Rejoindre gratuitement"
                                : `Payer ${currentPlan.price} ${offer.currency === "EUR" ? "€" : offer.currency}`}
                            </span>
                            <ArrowRight className="size-4" />
                          </>
                        )}
                      </button>

                      {offer.pricingType === "paid" &&
                        paymentMethod === "mobile_money" &&
                        !mobileMoneyValidation?.isValid && (
                          <p className="text-center text-[10px] text-zinc-400 flex items-center justify-center gap-1.5 pt-0.5">
                            <Lock className="size-3 text-amber-400/80" />
                            <span>Saisissez un numéro Mobile Money valide pour activer le paiement</span>
                          </p>
                        )}
                    </div>
                    </div>
                  </>
                )}
                {/* Security Checklist */}
                <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-emerald-400 shrink-0" />
                    <span>Paiement sécurisé par carte & Mobile Money</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-emerald-400 shrink-0" />
                    <span>Livraison automatique et accès immédiat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Lock className="size-4 text-emerald-400 shrink-0" />
                    <span>Annulation en 1-clic sans engagement</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
