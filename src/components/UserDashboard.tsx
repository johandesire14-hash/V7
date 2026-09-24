import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Compass,
  Sparkles,
  MessageSquare,
  Bell,
  Home,
  Building2,
  Handshake,
  Share2,
  LayoutGrid,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Plus,
  User,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  DollarSign,
  Zap,
  LogOut,
  X,
  Check,
  PanelLeftClose,
  Sliders,
  Send,
  Video,
  ExternalLink,
  Copy,
  Package,
  Tag,
  Eye,
  MoreVertical,
  Layers,
  Globe,
  Users as UsersIcon,
  Megaphone,
  Briefcase,
  Code,
  Download,
  Upload,
  GraduationCap,
  FileText,
  HelpCircle,
  Link,
  CheckCircle2,
  Bot,
  BookOpen,
  RefreshCw,
  Trash2,
  ShoppingBag,
  Heart,
  Menu,
  AlertTriangle,
  Headphones,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { safeStorage } from "../utils/storage";
import { ProductCreationStudio, CreatedProductData, ProductTypeCategory } from "./ProductCreationStudio";
import { AfhubLogo } from "./AfhubLogo";
import { ConfirmActionModal } from "./common/ConfirmActionModal";
import {
  Skeleton,
  DashboardMetricsSkeleton,
  DashboardProductsSkeleton,
  DashboardPulseSkeleton,
  DashboardChartSkeleton,
} from "./common/Skeleton";
import { PaymentsView } from "./dashboard/PaymentsView";
import { CustomersView } from "./dashboard/CustomersView";
import { WebsitesView } from "./dashboard/WebsitesView";
import { AffiliatesView } from "./dashboard/AffiliatesView";
import { DiscoverCreatorsView } from "./dashboard/DiscoverCreatorsView";
import { AssistanceView } from "./dashboard/AssistanceView";
import { ProductTelegramLinkModal } from "./dashboard/ProductTelegramLinkModal";
import { SettingsView } from "./dashboard/SettingsView";
import { WorkforceView } from "./dashboard/WorkforceView";
import { PartnersView } from "./dashboard/PartnersView";
import { AccountSettingsModal } from "./common/AccountSettingsModal";
import { ConnectedAppsView, TelegramIcon, DiscordIcon } from "./dashboard/ConnectedAppsView";
import { RevenueAnalyticsChart } from "./dashboard/RevenueAnalyticsChart";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  convertFromUSD,
  convertBetweenCurrencies,
  getStoredCurrency,
  setStoredCurrency,
} from "../utils/currency";
import { CurrencySelector } from "./dashboard/CurrencySelector";
import { GuidedTour, OnboardingData } from "./dashboard/GuidedTour";
import { BusinessProject, Company, EnterpriseSubscription } from "../types";
import { CompanyOnboardingModal } from "./CompanyOnboardingModal";
import { getSavedCompanies, saveCompany, seedUserCompanies } from "../utils/companyStorage";
import { EnterpriseMemberView } from "./dashboard/EnterpriseMemberView";
import { ContextualLocationPrompt } from "./common/ContextualLocationPrompt";
import { getSavedSubscriptions, seedEnterpriseSubscriptions } from "../utils/subscriptionsStorage";
import { seedCustomerPurchases } from "./dashboard/CustomerPurchasesView";
import { CURATED_MARKETPLACE_PRODUCTS } from "../data/marketplaceData";
import {
  subscribeToCreatorProducts,
  saveProductToFirestore,
  deleteProductFromFirestore,
  subscribeToCreatorTransactions,
  subscribeToCreatorCustomers,
  createRealTransaction,
  seedRealisticDemoData,
  clearRealisticDemoData,
  FirestoreTransaction,
  FirestoreCustomer,
} from "../services/dbService";
import { isCreatorPayoutConfigured } from "../utils/payoutConfig";

interface UserDashboardProps {
  user: {
    uid?: string;
    name: string;
    email: string;
    avatarInitials: string;
  };
  onLogout: () => void;
  onOpenProductStudio?: () => void;
  onOpenAiBuilder?: (prompt?: string, category?: string) => void;
  lang: "fr" | "en";
}

interface PulseEvent {
  id: string;
  type: "ad_spend" | "sale";
  amount: string;
  categoryName?: string;
  location: string;
  countryFlag: string;
  source: string;
  timeAgo: string;
}

const getCountryFlagFromLocation = (location: string): string => {
  if (location.includes("Côte d'Ivoire") || location.includes("Abidjan") || location.includes("CI")) return "🇨🇮";
  if (location.includes("Sénégal") || location.includes("Dakar") || location.includes("SN")) return "🇸🇳";
  if (location.includes("Nigéria") || location.includes("Lagos") || location.includes("NG") || location.includes("Nigeria")) return "🇳🇬";
  if (location.includes("Cameroun") || location.includes("Douala") || location.includes("Yaoundé") || location.includes("CM")) return "🇨🇲";
  if (location.includes("Ghana") || location.includes("Accra") || location.includes("GH")) return "🇬🇭";
  if (location.includes("Kenya") || location.includes("Nairobi") || location.includes("KE")) return "🇰🇪";
  if (location.includes("Bénin") || location.includes("Cotonou") || location.includes("BJ")) return "🇧🇯";
  if (location.includes("Togo") || location.includes("Lomé") || location.includes("TG")) return "🇹🇬";
  if (location.includes("Mali") || location.includes("Bamako") || location.includes("ML")) return "🇲🇱";
  if (location.includes("RDC") || location.includes("Kinshasa") || location.includes("CD")) return "🇨🇩";
  if (location.includes("Maroc") || location.includes("Casablanca") || location.includes("MA")) return "🇲🇦";
  if (location.includes("Afrique du Sud") || location.includes("Johannesburg") || location.includes("ZA")) return "🇿🇦";
  if (location.includes("France") || location.includes("Paris") || location.includes("FR")) return "🇫🇷";
  if (location.includes("Canada") || location.includes("Montréal") || location.includes("CA")) return "🇨🇦";
  return "🌍";
};

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  onLogout,
  onOpenAiBuilder,
  lang,
}) => {
  const [activeNav, setActiveNav] = useState<
    | "accueil"
    | "communaute"
    | "produits"
    | "paiements"
    | "clients"
    | "assistance"
    | "applications"
    | "telegram_app"
    | "discord_app"
    | "affilies"
    | "messages"
    | "decouvrir"
    | "parametres"
    | "parametres_compte"
    | "parametres_boutique"
    | "parametres_entreprise"
    | "workforce"
    | "main_doeuvre"
    | "equipe"
    | "partenaires"
    | "partners"
  >("accueil");

  const [selectedCommunitySubId, setSelectedCommunitySubId] = useState<string | null>(null);
  const [previewCommunitySubId, setPreviewCommunitySubId] = useState<string | null>(null);

  const { profile } = useAuth();

  // State for AI Projects / Businesses backed by real Firestore database
  const [projects, setProjects] = useState<BusinessProject[]>([]);
  const [productsList, setProductsList] = useState<CreatedProductData[]>([]);
  const [realTransactions, setRealTransactions] = useState<FirestoreTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0.0);
  const [pulseEvents, setPulseEvents] = useState<PulseEvent[]>([]);
  const [pulseFeedOffset, setPulseFeedOffset] = useState(0);
  const previousPulseIdsRef = useRef<string[]>([]);
  const [isLoadingFirestore, setIsLoadingFirestore] = useState<boolean>(true);
  const [currency, setCurrency] = useState<CurrencyCode>(getStoredCurrency());

  // Listen to external currency change events across the application
  useEffect(() => {
    const handleStorageCurrencyChange = (e: any) => {
      const newCurr = e.detail?.currency || getStoredCurrency();
      if (newCurr && SUPPORTED_CURRENCIES[newCurr as CurrencyCode]) {
        setCurrency(newCurr as CurrencyCode);
      }
    };
    window.addEventListener("mansa_currency_changed", handleStorageCurrencyChange);
    return () => {
      window.removeEventListener("mansa_currency_changed", handleStorageCurrencyChange);
    };
  }, []);

  // Creator Payout Configuration status: un produit ne peut pas être visible si le créateur n'a pas configuré le mode de paiement
  const [payoutConfigured, setPayoutConfigured] = useState<boolean>(() =>
    isCreatorPayoutConfigured(profile)
  );

  useEffect(() => {
    setPayoutConfigured(isCreatorPayoutConfigured(profile));
    const handlePayoutChange = () => {
      setPayoutConfigured(isCreatorPayoutConfigured(profile));
    };
    window.addEventListener("mansa_payout_config_changed", handlePayoutChange);
    return () => window.removeEventListener("mansa_payout_config_changed", handlePayoutChange);
  }, [profile]);

  // Dynamic Companies State (Saved locally / initialized empty)
  const [companies, setCompanies] = useState<Company[]>(() => {
    const userKey = user.uid || user.email || "default";
    return getSavedCompanies(userKey);
  });

  // Subscribed Enterprises State (Member / Fan Experience: e.g. victory_odds, BS, GS)
  const [memberSubscriptions, setMemberSubscriptions] = useState<EnterpriseSubscription[]>(() => {
    const userKey = user.uid || user.email || "default";
    return getSavedSubscriptions(userKey);
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>("personnel");
  const [isCompanyOnboardingOpen, setIsCompanyOnboardingOpen] = useState(false);

  const activeCompany = companies.find((c) => c.id === activeWorkspaceId) || null;
  const isCreatorCompanySelected = Boolean(activeCompany);

  // A member workspace is strictly when viewing an external community subscription (as client/fan),
  // NEVER when viewing one's own creator company or personal workspace.
  const activeSubscription = !isCreatorCompanySelected && activeWorkspaceId !== "personnel"
    ? memberSubscriptions.find((s) => s.id === activeWorkspaceId || s.companyId === activeWorkspaceId) || null
    : null;

  const isMemberWorkspace = Boolean(activeSubscription);

  // Sync member subscriptions on new subscription or when leaving an enterprise
  useEffect(() => {
    const handleSubUpdated = () => {
      const userKey = user.uid || user.email || "default";
      setMemberSubscriptions(getSavedSubscriptions(userKey));
    };
    const handleCommunityLeft = (e: any) => {
      const leftSubId = e.detail?.subId;
      const leftCompanyId = e.detail?.companyId;
      const userKey = user.uid || user.email || "default";
      const updated = getSavedSubscriptions(userKey);
      setMemberSubscriptions(updated);
      if (selectedCommunitySubId === leftSubId || selectedCommunitySubId === leftCompanyId) {
        setSelectedCommunitySubId(updated[0]?.id || null);
      }
      if (activeWorkspaceId === leftSubId || activeWorkspaceId === leftCompanyId) {
        setActiveWorkspaceId("personnel");
        setActiveNav("communaute");
      }
    };
    window.addEventListener("mansa_subscription_updated", handleSubUpdated);
    window.addEventListener("mansa_community_left", handleCommunityLeft);
    return () => {
      window.removeEventListener("mansa_subscription_updated", handleSubUpdated);
      window.removeEventListener("mansa_community_left", handleCommunityLeft);
    };
  }, [user, selectedCommunitySubId, activeWorkspaceId]);

  useEffect(() => {
    const handleCommunityJoined = (e: any) => {
      const joinedId = e.detail?.subId;
      if (joinedId && previewCommunitySubId === joinedId) {
        setPreviewCommunitySubId(null);
      }
    };
    window.addEventListener("mansa_community_joined", handleCommunityJoined);
    return () => window.removeEventListener("mansa_community_joined", handleCommunityJoined);
  }, [previewCommunitySubId]);

  const handleVisitEnterpriseFromDiscover = (enterprise: any) => {
    const compId = enterprise.companyId || enterprise.id;
    const compName = enterprise.companyName || "Entreprise";

    // Clean up any previously unjoined preview sub
    if (previewCommunitySubId) {
      setMemberSubscriptions((prev) => {
        const target = prev.find((s) => s.id === previewCommunitySubId);
        if (target && !target.hasJoined) {
          return prev.filter((s) => s.id !== previewCommunitySubId);
        }
        return prev;
      });
    }

    // Check if user is already a member
    const existing = memberSubscriptions.find((s) => s.id === compId || s.companyId === compId);
    if (existing) {
      setSelectedCommunitySubId(existing.id);
      setActiveWorkspaceId("personnel");
      switchTab("communaute");
      return;
    }

    const previewSub: EnterpriseSubscription = {
      id: `preview-${compId}`,
      companyId: compId,
      companyName: compName,
      companyLogo: enterprise.companyLogo || "",
      companyBanner: enterprise.bannerUrl || enterprise.companyBanner || "",
      companyInitials: enterprise.companyInitials || compName.slice(0, 2).toUpperCase(),
      companyGradient: enterprise.accentColor || "from-[#12141c] to-black",
      productName: "Accès Visiteur",
      priceDisplay: enterprise.startingPrice || "Gratuit",
      status: "active",
      subscribedAt: "Aujourd'hui",
      hasPaidOffer: false,
      isCommunityPreview: true,
      hasJoined: false,
      creatorName: enterprise.creatorName || "Créateur Mansa",
      description: enterprise.description || "",
      rating: enterprise.rating || 4.9,
      reviewsCount: enterprise.reviewsCount || 120,
      subscribersCount: enterprise.subscribersCount || "1 000 membres",
      includedApps: ["dashboard", "support"],
      telegramChannels: [
        {
          id: `tg-${compId}`,
          name: `${compName} · Annonces Officielles`,
          subscribersCount: enterprise.membersNumber || 1200,
          tag: "Canal Public",
          description: "Informations officielles de la communauté.",
          inviteLink: "https://t.me/joinchat/official",
        },
      ],
    };

    setMemberSubscriptions((prev) => {
      const filtered = prev.filter((s) => s.id !== previewSub.id);
      return [previewSub, ...filtered];
    });
    setPreviewCommunitySubId(previewSub.id);
    setSelectedCommunitySubId(previewSub.id);
    setActiveWorkspaceId("personnel");
    switchTab("communaute");
  };

  const handleCompanyCreated = (newComp: Omit<Company, "id" | "createdAt">) => {
    const userKey = user.uid || user.email || "default";
    const { companies: updated, created } = saveCompany(userKey, newComp);
    setCompanies(updated);
    setActiveWorkspaceId(created.id);
  };

  // Firestore real-time subscriptions for products & transactions
  useEffect(() => {
    const creatorKey = user.uid || user.email || "creator-default";
    
    // Subscribe to creator products in Firestore
    const unsubProducts = subscribeToCreatorProducts(creatorKey, (dbProjects) => {
      setProjects(dbProjects);
      setProductsList(
        dbProjects.map((p) => {
          const billingSuffix =
            p.pricingModel === "subscription"
              ? " / mois"
              : p.pricingModel === "annual"
              ? " / an"
              : "";
          const pCurrency = (p.currency as CurrencyCode) || "USD";
          const revenueNumber = (p.pricingAmount || 0) * (p.membersCount || 0);

          return {
            id: p.id,
            productType: (((p as any).type === "course" || (p as any).type === "ebook" || (p as any).type === "membership" ? (p as any).type : "digital") as ProductTypeCategory),
            name: p.name,
            priceDisplay: `${p.pricingAmount} ${pCurrency}${billingSuffix}`,
            priceAmount: p.pricingAmount,
            currency: pCurrency,
            pricingType: p.pricingAmount > 0 ? "paid" : "free",
            billingCycle: p.pricingModel === "one_time" ? "one_time" : "monthly",
            visibility: p.status === "paused" ? "Caché" : p.status === "draft" ? "Caché" : "Visible",
            discoverStatus: "Répertorié sur Mansa",
            includedApps: p.apps && p.apps.length > 0 ? p.apps : ["Communauté VIP Mansa"],
            conversionRate: p.conversionRate || "0%",
            totalRevenue: `${revenueNumber} ${pCurrency}`,
            activeUsers: p.membersCount || 0,
            imageUrl: p.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            title: p.name,
            description: p.tagline || "",
            productUrl: p.storeUrl || `mansa.af/p/${p.id}`,
            affiliateRate: p.affiliateCommissionRate || 25,
            ctaText: "Rejoindre",
            companyId: p.companyId || "",
            companyName: p.companyName || "",
          };
        })
      );
      setIsLoadingFirestore(false);
    });

    // Subscribe to creator transactions in Firestore
    const unsubTx = subscribeToCreatorTransactions(creatorKey, (txs) => {
      setRealTransactions(txs);
      const sum = txs.reduce((acc, t) => acc + (t.amountNumber || 0), 0);
      setBalance(sum);

      const events: PulseEvent[] = txs.slice(0, 10).map((t) => ({
        id: t.id,
        type: "sale",
        amount: t.amount,
        categoryName: t.productName,
        location: t.buyerLocation || "Abidjan, Côte d'Ivoire",
        countryFlag: getCountryFlagFromLocation(t.buyerLocation || ""),
        source: t.paymentMethod || "Mobile Money",
        timeAgo: "en direct",
      }));
      setPulseEvents(events);
    });

    return () => {
      unsubProducts();
      unsubTx();
    };
  }, [user.uid, user.email]);

  // Context-aware transactions & balance:
  // - Lorsque l'utilisateur est dans une entreprise précise : correspond UNIQUEMENT aux revenus générés avec cette entreprise.
  // - Affichage : « Solde total — [Nom de l'entreprise] »
  // - Lorsque l'utilisateur passe en mode Personnel : solde global sur toute la plateforme (toutes entreprises, affiliation, autres revenus).
  // - Affichage : « Solde total — Personnel »
  // - Strictement jamais de mélange entre le solde d'une entreprise et le solde personnel global.
  const isCompanyContext = activeWorkspaceId !== "personnel" && !!activeCompany;
  const contextTransactions = useMemo(() => {
    if (!isCompanyContext || !activeCompany) {
      // Mode Personnel : ensemble complet des revenus de la plateforme
      return realTransactions;
    }
    // Mode Entreprise : exclusion stricte des affiliations et des autres entreprises
    return realTransactions.filter((t) => {
      if (t.type === "affiliate" || t.type === "other") return false;
      const matchCompId = t.companyId === activeWorkspaceId;
      const matchCompName = activeCompany?.name && (
        (t.companyName && t.companyName.toLowerCase() === activeCompany.name.toLowerCase()) ||
        (t.storeName && t.storeName.toLowerCase() === activeCompany.name.toLowerCase())
      );
      return matchCompId || matchCompName;
    });
  }, [realTransactions, isCompanyContext, activeWorkspaceId, activeCompany]);

  const activeBalance = useMemo(() => {
    return contextTransactions.reduce((acc, t) => acc + (t.amountNumber || 0), 0);
  }, [contextTransactions]);

  // Filtrage des produits selon le contexte actif
  const contextProducts = useMemo(() => {
    if (!isCompanyContext || !activeCompany) {
      return productsList;
    }
    return productsList.filter((p) => {
      const matchCompId = p.companyId === activeWorkspaceId;
      const matchCompName = activeCompany?.name && (
        (p.companyName && p.companyName.toLowerCase() === activeCompany.name.toLowerCase()) ||
        (p.storeName && p.storeName.toLowerCase() === activeCompany.name.toLowerCase())
      );
      return matchCompId || matchCompName;
    });
  }, [productsList, isCompanyContext, activeWorkspaceId, activeCompany]);

  // Telegram et Discord sont des apps : elles ne doivent être présentes que si au moins un produit existe et leur est associé
  const companyHasTelegram = useMemo(() => {
    if (contextProducts.length === 0) return false;
    return contextProducts.some((p) =>
      (p.includedApps || []).some((a) => a.toLowerCase().includes("telegram")) ||
      (p.name && p.name.toLowerCase().includes("telegram")) ||
      (p.title && p.title.toLowerCase().includes("telegram"))
    );
  }, [contextProducts]);

  const companyHasDiscord = useMemo(() => {
    if (contextProducts.length === 0) return false;
    return contextProducts.some((p) =>
      (p.includedApps || []).some((a) => a.toLowerCase().includes("discord")) ||
      (p.name && p.name.toLowerCase().includes("discord")) ||
      (p.title && p.title.toLowerCase().includes("discord"))
    );
  }, [contextProducts]);

  // Décomposition détaillée pour le Mode Personnel
  const personalBreakdown = useMemo(() => {
    let companiesRevenue = 0;
    let affiliateRevenue = 0;
    let otherRevenue = 0;

    realTransactions.forEach((t) => {
      const amount = t.amountNumber || 0;
      if (t.type === "affiliate") {
        affiliateRevenue += amount;
      } else if (t.type === "other") {
        otherRevenue += amount;
      } else {
        companiesRevenue += amount;
      }
    });

    return {
      companies: companiesRevenue,
      affiliates: affiliateRevenue,
      other: otherRevenue,
      total: companiesRevenue + affiliateRevenue + otherRevenue,
    };
  }, [realTransactions]);

  const formattedActiveBalance = useMemo(() => {
    const usdRate = SUPPORTED_CURRENCIES[currency]?.rateToUSD || 1;
    const usdEquivalent = activeBalance / (usdRate > 0 ? usdRate : 1);
    return new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdEquivalent);
  }, [activeBalance, currency]);

  const handleAddProject = async (newProj: BusinessProject) => {
    const creatorKey = user.uid || user.email || "creator-default";
    await saveProductToFirestore(creatorKey, user.email, user.name, {
      id: newProj.id,
      name: newProj.name,
      description: newProj.tagline,
      category: newProj.category,
      priceAmount: newProj.pricingAmount,
      pricingType: newProj.pricingAmount > 0 ? "paid" : "free",
      billingCycle: newProj.pricingModel === "one_time" ? "one_time" : "monthly",
      currency: newProj.currency,
      includedApps: newProj.apps,
      affiliateRate: newProj.affiliateCommissionRate,
      productUrl: newProj.storeUrl,
    });
  };

  const handleUpdateProject = async (updated: BusinessProject) => {
    const creatorKey = user.uid || user.email || "creator-default";
    await saveProductToFirestore(creatorKey, user.email, user.name, {
      id: updated.id,
      name: updated.name,
      description: updated.tagline,
      category: updated.category,
      priceAmount: updated.pricingAmount,
      pricingType: updated.pricingAmount > 0 ? "paid" : "free",
      billingCycle: updated.pricingModel === "one_time" ? "one_time" : "monthly",
      currency: updated.currency,
      includedApps: updated.apps,
      affiliateRate: updated.affiliateCommissionRate,
      productUrl: updated.storeUrl,
    });
  };

  const handleDeleteProject = async (projId: string) => {
    await deleteProductFromFirestore(projId);
  };

  // State for Product Creation Studio modal
  const [isProductStudioOpen, setIsProductStudioOpen] = useState(false);
  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CreatedProductData | null>(null);
  const [productToDelete, setProductToDelete] = useState<CreatedProductData | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<BusinessProject | null>(null);
  const [selectedProductFilter, setSelectedProductFilter] = useState<"all" | "visible" | "hidden">("visible");
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [copyFeedbackId, setCopyFeedbackId] = useState<string | null>(null);
  const [telegramLinkModalProduct, setTelegramLinkModalProduct] = useState<CreatedProductData | null>(null);
  const [isTelegramLinkModalOpen, setIsTelegramLinkModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [accountSettingsInitialTab, setAccountSettingsInitialTab] = useState<"profil" | "securite" | "commandes" | "notifications">("profil");
  const [selectedTimeframe, setSelectedTimeframe] = useState<"24h" | "7j" | "30j" | "1an" | "tout">("30j");
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: number;
    sender: string;
    avatar: string;
    text: string;
    time: string;
    isMe: boolean;
  }>>([]);
  const [newChatInput, setNewChatInput] = useState("");
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isGuidedTourOpen, setIsGuidedTourOpen] = useState(false);
  const [isSeedingData, setIsSeedingData] = useState(false);
  const [seedToastMessage, setSeedToastMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-seed realistic demo data on first load if workspace is completely empty
  useEffect(() => {
    const creatorKey = user.uid || user.email || "creator-default";
    const userKey = user.uid || user.email || "default";
    const hasSeeded = safeStorage.getItem(`mansa_auto_seeded_${creatorKey}`);
    if (!hasSeeded) {
      safeStorage.setItem(`mansa_auto_seeded_${creatorKey}`, "true");
      seedRealisticDemoData(
        creatorKey,
        user.email || "createur@mansa.af",
        user.name || "Créateur Mansa"
      ).catch((e) => console.warn("Auto-seed demo notice:", e));
      const subs = seedEnterpriseSubscriptions(userKey);
      setMemberSubscriptions(subs);
      seedCustomerPurchases();
      const comps = seedUserCompanies(userKey);
      setCompanies(comps);
    }
  }, [user.uid, user.email, user.name]);

  const handleSeedSimulationData = async () => {
    setIsSeedingData(true);
    try {
      const creatorKey = user.uid || user.email || "creator-default";
      const userKey = user.uid || user.email || "default";
      const res = await seedRealisticDemoData(
        creatorKey,
        user.email || "createur@mansa.af",
        user.name || "Créateur Mansa"
      );
      const subs = seedEnterpriseSubscriptions(userKey);
      setMemberSubscriptions(subs);
      seedCustomerPurchases();
      const comps = seedUserCompanies(userKey);
      setCompanies(comps);
      setSeedToastMessage(
        lang === "fr"
          ? `Simulation globale réussie : 5 abonnements entreprises actifs débloqués (Forex Elite, Alpha Bets, DevKreativ...), vos achats & accès VIP connectés, ${res.productsCount} produits, ${res.transactionsCount} transactions (${res.totalRevenue.toLocaleString("fr-FR")} FCFA) et ${res.customersCount} clients !`
          : `Full simulation successful: 5 active enterprise subscriptions unlocked, VIP purchases connected, ${res.productsCount} products, ${res.transactionsCount} transactions and ${res.customersCount} clients!`
      );
      setTimeout(() => setSeedToastMessage(null), 8000);
    } catch (err) {
      console.error("Error seeding demo data:", err);
    } finally {
      setIsSeedingData(false);
    }
  };

  // Auto-trigger guided tour for new creators on first connection
  useEffect(() => {
    const tourKey = `mansa_tour_completed_${user.uid || "guest"}`;
    const isCompleted = safeStorage.getItem(tourKey);
    if (!isCompleted) {
      const timer = setTimeout(() => {
        setIsGuidedTourOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user.uid]);

  // Tab change with skeleton loading transition
  const switchTab = (tab: typeof activeNav) => {
    setIsMobileSidebarOpen(false);

    // If leaving community without having joined the preview enterprise:
    // "si on la rejoint pas et qu'on quitte la page de l'entreprise elle disparait de 'communauté'"
    if (previewCommunitySubId && tab !== "communaute") {
      setMemberSubscriptions((prev) => {
        const target = prev.find((s) => s.id === previewCommunitySubId);
        if (target && !target.hasJoined) {
          return prev.filter((s) => s.id !== previewCommunitySubId);
        }
        return prev;
      });
      setPreviewCommunitySubId(null);
    }

    if (tab === activeNav) return;
    setIsTabLoading(true);
    setActiveNav(tab);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 380);
  };

  const handleRefreshData = () => {
    setIsTabLoading(true);
    setTimeout(() => {
      setIsTabLoading(false);
    }, 500);
  };

  // Sync real-time African pulse feed strictly from real Firestore transactions
  useEffect(() => {
    const previousIds = previousPulseIdsRef.current;
    const currentIds = realTransactions.map((tx) => tx.id);
    const hasNewTransaction = previousIds.length > 0 && currentIds.some((id) => !previousIds.includes(id));

    if (hasNewTransaction) {
      setPulseFeedOffset(-76);
      const frame = window.requestAnimationFrame(() => setPulseFeedOffset(0));
      previousPulseIdsRef.current = currentIds;
      return () => window.cancelAnimationFrame(frame);
    }

    previousPulseIdsRef.current = currentIds;
  }, [realTransactions]);

  useEffect(() => {
    if (realTransactions && realTransactions.length > 0) {
      const mappedPulse: PulseEvent[] = realTransactions.slice(0, 8).map((tx) => ({
        id: tx.id,
        type: "sale",
        amount: tx.amount,
        categoryName: tx.productName,
        location: tx.buyerLocation || "Afrique",
        countryFlag: getCountryFlagFromLocation(tx.buyerLocation || ""),
        source: tx.paymentMethod || "Mobile Money",
        timeAgo: "Récent",
      }));
      setPulseEvents(mappedPulse);
    } else {
      setPulseEvents([]);
    }
  }, [realTransactions]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: user.name,
        avatar: "",
        text: newChatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isMe: true,
      },
    ]);
    setNewChatInput("");
  };

  const formattedBalance = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(balance);

  // Selected Enterprise Subscription when inside an enterprise workspace
  const selectedSubscription: EnterpriseSubscription =
    activeSubscription ||
    (activeCompany
      ? {
          id: activeCompany.id,
          companyId: activeCompany.id,
          companyName: activeCompany.name,
          companyBanner: activeCompany.companyBanner,
          companyLogo: activeCompany.companyLogo,
          companyInitials: activeCompany.logoInitials || activeCompany.name.substring(0, 2).toUpperCase(),
          productName: activeCompany.description || "Pass Membre Officiel",
          priceDisplay: "Gratuit / Inclus",
          status: "active",
          subscribedAt: "Aujourd'hui",
          includedApps: ["dashboard", "support"],
          telegramChannels: [],
          discordChannels: [],
        }
      : {
          id: activeWorkspaceId,
          companyId: activeWorkspaceId,
          companyName: "Cadre financier",
          companyBanner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85",
          companyLogo: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
          companyInitials: "FF",
          productName: "Financial Framework Pro & VIP Discord",
          priceDisplay: "19 100 € /mois",
          status: "active",
          subscribedAt: "Aujourd'hui",
          includedApps: ["dashboard", "telegram", "discord", "support"],
          telegramChannels: [
            {
              id: "tg-1",
              name: "Cadre Financier VIP Signals",
              subscribersCount: 3400,
              tag: "Signaux",
              quote: "Signaux de trading scalping en direct et analyses quotidiennes",
            },
            {
              id: "tg-2",
              name: "Trading Desk & Scalping Live",
              subscribersCount: 1200,
              tag: "Trading Desk",
              quote: "Salon d'entraide et questions directes aux traders du desk",
            },
          ],
          discordChannels: [
            {
              id: "dc-1",
              name: "Cadre Financier Official Discord",
              subscribersCount: 4800,
            },
          ],
        });

  const currentCommunitySub: EnterpriseSubscription | null =
    activeSubscription ||
    (selectedCommunitySubId
      ? memberSubscriptions.find((s) => s.id === selectedCommunitySubId || s.companyId === selectedCommunitySubId)
      : null) ||
    memberSubscriptions[0] ||
    null;

  return (
    <div className="flex h-screen w-full flex-col bg-[#0f1012] text-[#eeeeee] font-sans antialiased overflow-hidden selection:bg-[#FA4616]/30 selection:text-[#FA4616]">
      
      {/* 1. TOP HEADER BAR (Fully Responsive) */}
      <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0c0d0e] px-2.5 sm:px-6 gap-2 select-none">
        
        {/* Left: Mobile hamburger drawer trigger + afhub Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/10 transition-colors cursor-pointer shrink-0 min-h-[38px] min-w-[38px] flex items-center justify-center"
            title="Ouvrir le menu de navigation"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-4" />
          </button>

          <div className="flex items-center cursor-pointer shrink-0" onClick={() => switchTab("accueil")}>
            <AfhubLogo size="sm" />
          </div>
        </div>

        {/* Center: Search Bar with ⌘K - tablet & desktop only */}
        <div className="hidden sm:block flex-1 max-w-xs md:max-w-md mx-2 sm:mx-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between rounded-lg border border-white/10 bg-[#16171a] px-2.5 sm:px-3 py-1.5 text-xs text-zinc-400 hover:border-white/20 hover:text-zinc-200 transition-all cursor-pointer min-h-[36px]"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <Search className="size-3.5 text-zinc-500 shrink-0" />
              <span className="truncate">{lang === "fr" ? "Rechercher..." : "Search..."}</span>
            </div>
            <kbd className="hidden md:flex items-center gap-0.5 rounded border border-white/10 bg-[#212328] px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 shrink-0">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Spacer for mobile to push right icons to the edge */}
        <div className="sm:hidden flex-1" />

        {/* Right Navigation Icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Quick Create Product Button - ONLY in creator enterprise workspace */}
          {isCreatorCompanySelected && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductStudioOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-900/30 min-h-[36px]"
              title={lang === "fr" ? "Créer un nouveau produit ou service" : "Create new product or service"}
            >
              <Plus className="size-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">{lang === "fr" ? "Créer un produit" : "Create product"}</span>
            </button>
          )}

          {/* Mobile Search Button (Quick icon-only tap) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="sm:hidden p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={lang === "fr" ? "Rechercher" : "Search"}
          >
            <Search className="size-4" />
          </button>

          {/* Data Simulation Trigger Button */}
          <button
            onClick={handleSeedSimulationData}
            disabled={isSeedingData}
            className="hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg border border-[#00D26A]/40 bg-[#00D26A]/10 hover:bg-[#00D26A]/20 text-[#00D26A] text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50 min-h-[36px]"
            title={lang === "fr" ? "Simuler des données réalistes (produits, ventes Wave/OM, abonnements)" : "Simulate realistic data"}
          >
            <Zap className={`size-3.5 ${isSeedingData ? "animate-spin text-amber-400" : ""}`} />
            <span className="hidden lg:inline">
              {isSeedingData
                ? (lang === "fr" ? "Simulation..." : "Simulating...")
                : (lang === "fr" ? "Simuler données" : "Simulate Data")}
            </span>
          </button>

          {/* Guided Tour Trigger Button */}
          <button
            onClick={() => {
              setActiveNav("accueil");
              setIsGuidedTourOpen(true);
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-[#16171b] hover:border-[#00D26A]/50 hover:bg-[#00D26A]/10 text-zinc-300 hover:text-[#00D26A] text-xs font-semibold transition-all cursor-pointer shadow-sm min-h-[36px]"
            title={lang === "fr" ? "Lancer la visite guidée du tableau de bord" : "Start dashboard guided tour"}
          >
            <Sparkles className="size-3.5 text-[#00D26A]" />
            <span>{lang === "fr" ? "Visite" : "Tour"}</span>
          </button>

          {/* Global Currency Selector in Top Header */}
          <CurrencySelector
            currentCurrency={currency}
            onSelectCurrency={setCurrency}
            lang={lang}
            variant="header"
          />

          {/* Refresh Data with Skeleton simulator */}
          <button
            onClick={handleRefreshData}
            className="hidden sm:flex p-1.5 text-zinc-400 hover:text-[#00D26A] transition-colors cursor-pointer rounded-lg hover:bg-white/5 min-h-[36px] min-w-[36px] items-center justify-center"
            title={lang === "fr" ? "Actualiser les données" : "Refresh data"}
          >
            <RefreshCw className={`size-4 ${isTabLoading ? "animate-spin text-[#00D26A]" : ""}`} />
          </button>

          <button
            onClick={() => switchTab("decouvrir")}
            className="hidden sm:flex p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5 min-h-[36px] min-w-[36px] items-center justify-center"
            title="Explorer"
          >
            <Compass className="size-4" />
          </button>

          <button
            onClick={() => switchTab("messages")}
            className="relative p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5 min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Messages"
          >
            <MessageSquare className="size-4" />
          </button>

          <button
            className="hidden sm:flex p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/5 min-h-[36px] min-w-[36px] items-center justify-center"
            title="Notifications"
          >
            <Bell className="size-4" />
          </button>

          {/* User Avatar Circle (JO) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex size-8 items-center justify-center rounded-full bg-[#32363e] text-xs font-bold text-white hover:bg-[#3f444e] transition-colors cursor-pointer border border-white/10"
            >
              {user.avatarInitials || "JO"}
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-[#16171b] p-2 shadow-2xl z-50 space-y-1">
                <div className="px-3 py-2 border-b border-white/10">
                  <div className="text-xs font-bold text-white">{user.name}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{user.email}</div>
                </div>

                <button
                  onClick={() => {
                    setAccountSettingsInitialTab("profil");
                    setIsAccountSettingsModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <User className="size-3.5 text-[#00D26A]" />
                  <span>{lang === "fr" ? "Paramètres du compte" : "Account Settings"}</span>
                </button>

                <button
                  onClick={() => {
                    setAccountSettingsInitialTab("commandes");
                    setIsAccountSettingsModalOpen(true);
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="size-3.5 text-emerald-400" />
                    <span>{lang === "fr" ? "Commandes & Achats" : "Orders & Purchases"}</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    VIP
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav("produits");
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Package className="size-3.5 text-[#00D26A]" />
                    <span>{lang === "fr" ? "Mes Produits & Boutique" : "Products & Store"}</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/5">
                    {productsList.length}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setActiveNav("parametres_boutique");
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/5 hover:text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Building2 className="size-3.5 text-blue-400" />
                  <span>{lang === "fr" ? "Paramètres de la boutique" : "Store Settings"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    handleSeedSimulationData();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors cursor-pointer font-medium"
                >
                  <Zap className="size-3.5 text-amber-400" />
                  <span>{lang === "fr" ? "Simuler données & abonnements" : "Simulate data & subscriptions"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    setActiveNav("accueil");
                    setIsGuidedTourOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#00D26A] hover:bg-[#00D26A]/10 rounded-lg transition-colors cursor-pointer font-medium"
                >
                  <Sparkles className="size-3.5 text-[#00D26A]" />
                  <span>{lang === "fr" ? "Relancer la visite guidée" : "Restart Guided Tour"}</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                  <span>{lang === "fr" ? "Se déconnecter" : "Log out"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. BODY CONTENT: ENTERPRISE MEMBER WORKSPACE OR CREATOR DASHBOARD */}
      {(isMemberWorkspace || activeNav === "communaute") && currentCommunitySub ? (
        <div className="flex flex-1 overflow-hidden relative">
          <EnterpriseMemberView
            subscription={currentCommunitySub}
            lang={lang}
            onBackToPersonal={() => {
              if (previewCommunitySubId) {
                setMemberSubscriptions((prev) => {
                  const target = prev.find((s) => s.id === previewCommunitySubId);
                  if (target && !target.hasJoined) {
                    return prev.filter((s) => s.id !== previewCommunitySubId);
                  }
                  return prev;
                });
                setPreviewCommunitySubId(null);
              }
              const userKey = user.uid || user.email || "default";
              const updated = getSavedSubscriptions(userKey);
              setMemberSubscriptions(updated);
              if (updated.length > 0) {
                setSelectedCommunitySubId(updated[0].id);
              } else {
                setSelectedCommunitySubId(null);
              }
              setActiveWorkspaceId("personnel");
              setActiveNav("communaute");
            }}
            allSubscriptions={memberSubscriptions}
            onSelectSubscription={(subId) => {
              if (previewCommunitySubId && previewCommunitySubId !== subId) {
                setMemberSubscriptions((prev) => {
                  const target = prev.find((s) => s.id === previewCommunitySubId);
                  if (target && !target.hasJoined) {
                    return prev.filter((s) => s.id !== previewCommunitySubId);
                  }
                  return prev;
                });
                setPreviewCommunitySubId(null);
              }
              const found = memberSubscriptions.find((s) => s.id === subId || s.companyId === subId);
              if (found) {
                setSelectedCommunitySubId(found.id);
              }
            }}
            creatorCompanies={companies}
            onSelectCreatorCompany={(comp) => {
              setActiveWorkspaceId(comp.id);
              setActiveNav("accueil");
            }}
            user={user}
            onOpenMarketplace={() => {
              setActiveWorkspaceId("personnel");
              setActiveNav("decouvrir");
            }}
            onOpenCreatorDashboard={() => {
              const creatorCompany = companies.find(
                (company) => company.id === currentCommunitySub.companyId || company.id === currentCommunitySub.id
              );
              if (creatorCompany) {
                setActiveWorkspaceId(creatorCompany.id);
              }
              setActiveNav("accueil");
            }}
            onOpenCreatorAssistance={() => {
              const creatorCompany = companies.find(
                (company) => company.id === currentCommunitySub.companyId || company.id === currentCommunitySub.id
              );
              if (creatorCompany) {
                setActiveWorkspaceId(creatorCompany.id);
              }
              setActiveNav("assistance");
            }}
            onCreateProduct={() => {
              setEditingProduct(null);
              setIsProductStudioOpen(true);
            }}
            onOpenCreatorApplications={() => {
              const creatorCompany = companies.find(
                (company) => company.id === currentCommunitySub.companyId || company.id === currentCommunitySub.id
              );
              if (creatorCompany) {
                setActiveWorkspaceId(creatorCompany.id);
              }
              setActiveNav("applications");
            }}
            onSeedSimulationData={handleSeedSimulationData}
          />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden relative">
        
          {/* LEFT SIDEBAR (Desktop: fixed, Mobile/Tablet: hidden) */}
          <aside className="hidden lg:flex w-56 xl:w-60 shrink-0 border-r border-white/[0.07] bg-[#0c0d0e] flex-col justify-between p-3 select-none">
          
          <div className="space-y-4">
            {/* Top Workspace Icons Switcher: Bonhomme Gris (Personnel) + Entreprises du créateur UNIQUEMENT */}
            <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar">
              {/* Personal Workspace button */}
              <button
                onClick={() => {
                  setActiveWorkspaceId("personnel");
                  if (activeNav === "communaute") {
                    setActiveNav("accueil");
                  }
                }}
                className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                  activeWorkspaceId === "personnel"
                    ? "bg-[#16171b] border-2 border-white text-white shadow-sm ring-1 ring-[#0055ff]"
                    : "bg-[#16171b] border border-white/10 text-zinc-400 hover:text-white"
                }`}
                title={lang === "fr" ? "Espace Personnel" : "Personal Workspace"}
              >
                <User className="size-4" />
              </button>

              <div className="h-5 w-px bg-white/10 shrink-0 mx-0.5" />

              {/* Dynamic User-Created Companies (Owner / Creator) UNIQUEMENT */}
              {companies.map((comp, cIdx) => {
                const isActive = activeWorkspaceId === comp.id;
                return (
                  <button
                    key={`desk-comp-${comp.id || cIdx}-${cIdx}`}
                    onClick={() => {
                      setActiveWorkspaceId(comp.id);
                      if (activeNav === "decouvrir" || activeNav === "communaute") {
                        setActiveNav("accueil");
                      }
                    }}
                    className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-all cursor-pointer ${
                      isActive
                        ? "border-2 border-white/90 shadow-sm ring-1 ring-[#00D26A]"
                        : "border border-white/10 hover:border-white/30"
                    }`}
                    title={`Mon Entreprise : ${comp.name}`}
                  >
                    <div
                      className={`size-full bg-gradient-to-br ${
                        comp.colorGradient || "from-indigo-900 via-purple-900 to-black"
                      } flex items-center justify-center text-[10px] font-black text-white font-mono`}
                    >
                      <span>{comp.logoInitials || "EN"}</span>
                    </div>
                  </button>
                );
              })}

              {/* Add Company (+) button -> Opens Company Onboarding Modal */}
              <button
                onClick={() => setIsCompanyOnboardingOpen(true)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 bg-transparent text-zinc-400 hover:border-[#00D26A] hover:text-[#00D26A] hover:bg-[#00D26A]/5 transition-all cursor-pointer"
                title={lang === "fr" ? "Créer une nouvelle entreprise" : "Create new enterprise"}
              >
                <Plus className="size-4" />
              </button>
            </div>

            {/* Nav Menu */}
            <div>
              <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 truncate flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="truncate text-white font-semibold">
                    {activeSubscription ? `Membre : ${activeSubscription.companyName}` : activeCompany ? activeCompany.name : (lang === "fr" ? "Espace Personnel" : "Personal")}
                  </span>
                </div>
                {activeSubscription && (
                  <button
                    onClick={() => setActiveWorkspaceId("personnel")}
                    className="text-[10px] text-zinc-500 hover:text-white"
                  >
                    Quitter
                  </button>
                )}
              </div>

              {activeWorkspaceId === "personnel" ? (
                /* MENU WORKSPACE PERSONNEL */
                <nav id="tour-sidebar-navigation" className="mt-1 space-y-0.5 text-xs font-medium">
                  {/* Accueil */}
                  <button
                    onClick={() => switchTab("accueil")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "accueil"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Home className="size-4 text-zinc-300" />
                    <span>{lang === "fr" ? "Accueil" : "Home"}</span>
                  </button>

                  {/* Communauté */}
                  <button
                    onClick={() => switchTab("communaute")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "communaute"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <UsersIcon className="size-4 text-[#00D26A]" />
                      <span>{lang === "fr" ? "Communauté" : "Community"}</span>
                    </div>
                    {memberSubscriptions.length > 0 && (
                      <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                        {memberSubscriptions.length}
                      </span>
                    )}
                  </button>

                  {/* Assistance */}
                  <button
                    onClick={() => switchTab("assistance")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "assistance"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Headphones className="size-4 text-emerald-400" />
                    <span>{lang === "fr" ? "Assistance" : "Assistance"}</span>
                  </button>

                  {/* Découvrir */}
                  <button
                    onClick={() => switchTab("decouvrir")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "decouvrir"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Compass className="size-4 text-zinc-300" />
                    <span>{lang === "fr" ? "Découvrir" : "Discover"}</span>
                  </button>

                  {/* Affiliés */}
                  <button
                    onClick={() => switchTab("affilies")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "affilies"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Share2 className="size-4 text-[#0055ff]" />
                      <span className={activeNav === "affilies" ? "text-white" : "text-zinc-200 font-semibold"}>
                        {lang === "fr" ? "Affiliés" : "Affiliates"}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0055ff]/20 text-[#6699ff]">
                      Rejoindre
                    </span>
                  </button>
                </nav>
              ) : (
                /* MENU ENTREPRISE */
                <nav className="mt-1 space-y-0.5 text-xs font-medium">
                  {/* Accueil */}
                  <button
                    onClick={() => switchTab("accueil")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "accueil"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Home className="size-4 text-zinc-300" />
                    <span>{lang === "fr" ? "Accueil" : "Home"}</span>
                  </button>

                  {/* Produits */}
                  <button
                    onClick={() => switchTab("produits")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "produits"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="size-4 text-zinc-300" />
                      <span>{lang === "fr" ? "Produits" : "Products"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/5">
                      {productsList.length}
                    </span>
                  </button>

                  {/* Paiements */}
                  <button
                    onClick={() => switchTab("paiements")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "paiements"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <CreditCard className="size-4 text-zinc-300" />
                    <span>{lang === "fr" ? "Paiement" : "Payments"}</span>
                  </button>

                  {/* Clients */}
                  <button
                    onClick={() => switchTab("clients")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "clients"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <UsersIcon className="size-4 text-zinc-300" />
                    <span>{lang === "fr" ? "Clients" : "Customers"}</span>
                  </button>

                  {/* Assistance (Chat avec les membres) */}
                  <button
                    onClick={() => switchTab("assistance")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "assistance"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Headphones className="size-4 text-emerald-400" />
                    <span>{lang === "fr" ? "Assistance" : "Assistance"}</span>
                  </button>

                  {/* SECTION: Applications */}
                  <div className="pt-3 pb-1">
                    <div className="px-3">
                      <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                        Applications
                      </span>
                    </div>
                  </div>

                  {/* Bouton: + Ajouter une application */}
                  <button
                    onClick={() => switchTab("applications")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer ${
                      activeNav === "applications"
                        ? "bg-[#0055ff]/20 border border-[#0055ff]/40 text-white font-bold shadow-sm"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Plus className="size-4 text-[#0055ff]" />
                      <span className="font-semibold text-white">
                        {lang === "fr" ? "Ajouter application" : "Add Application"}
                      </span>
                    </div>
                  </button>

                  {/* Telegram App (présente uniquement si un produit lié existe) */}
                  {companyHasTelegram && (
                    <button
                      onClick={() => switchTab("telegram_app")}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        activeNav === "telegram_app"
                          ? "bg-[#22252c] text-white font-semibold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <TelegramIcon className="size-4" />
                      <span className={activeNav === "telegram_app" ? "text-white font-bold" : "text-zinc-300"}>Telegram</span>
                    </button>
                  )}

                  {/* Discord App (présente uniquement si un produit lié existe) */}
                  {companyHasDiscord && (
                    <button
                      onClick={() => switchTab("discord_app")}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                        activeNav === "discord_app"
                          ? "bg-[#22252c] text-white font-semibold"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      <DiscordIcon className="size-4" />
                      <span className={activeNav === "discord_app" ? "text-white font-bold" : "text-zinc-300"}>Discord</span>
                    </button>
                  )}

                  {/* SECTION: Développer */}
                  <div className="pt-3 pb-1">
                    <span className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                      Développer
                    </span>
                  </div>

                  {/* Affiliés */}
                  <button
                    onClick={() => switchTab("affilies")}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      activeNav === "affilies"
                        ? "bg-[#22252c] text-white font-semibold"
                        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                    }`}
                  >
                    <Share2 className="size-4 text-zinc-300" />
                    <span>{lang === "fr" ? "Affiliés (Vendeur)" : "Affiliates (Seller)"}</span>
                  </button>

                </nav>
              )}
            </div>
          </div>

          {/* Bottom Settings Switchers */}
          <div className="border-t border-white/[0.07] pt-2 space-y-1">
            {/* Paramètres Entreprise */}
            <button
              onClick={() => switchTab("parametres_entreprise")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "parametres_entreprise" || activeNav === "parametres_boutique"
                  ? "bg-[#22252c] text-[#00D26A] font-bold"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="size-4 text-emerald-400" />
                <span>{lang === "fr" ? "Paramètres Entreprise" : "Enterprise Settings"}</span>
              </div>
            </button>

            {/* Paramètres Compte */}
            <button
              onClick={() => switchTab("parametres_compte")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeNav === "parametres_compte"
                  ? "bg-[#22252c] text-[#00D26A] font-bold"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <User className="size-4 text-blue-400" />
                <span>{lang === "fr" ? "Paramètres Compte" : "Account Settings"}</span>
              </div>
            </button>
          </div>

        </aside>

        {/* Mobile / Tablet Left Navigation Sliding Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside
              onClick={(e) => e.stopPropagation()}
              className="relative w-72 max-w-[85vw] bg-[#0c0d0e] border-r border-white/10 shadow-2xl flex flex-col justify-between p-3 select-none z-10 animate-in slide-in-from-left duration-200 overflow-y-auto"
            >
              <div className="space-y-4">
                {/* Mobile Drawer Header with Close Button */}
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <AfhubLogo size="sm" />
                    <span className="text-xs font-bold text-zinc-300">Navigation</span>
                  </div>
                  <button
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                    title="Fermer le menu"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Workspace Switcher Dock */}
                <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar">
                  <button
                    onClick={() => {
                      setActiveWorkspaceId("personnel");
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl transition-all cursor-pointer ${
                      activeWorkspaceId === "personnel"
                        ? "bg-[#16171b] border-2 border-white text-white shadow-sm ring-1 ring-[#0055ff]"
                        : "bg-[#16171b] border border-white/10 text-zinc-400 hover:text-white"
                    }`}
                    title={lang === "fr" ? "Espace Personnel" : "Personal Workspace"}
                  >
                    <User className="size-4" />
                  </button>

                  <div className="h-5 w-px bg-white/10 shrink-0 mx-0.5" />

                  {/* Dynamic User-Created Companies (Owner / Creator) UNIQUEMENT */}
                  {companies.map((comp, cIdx) => {
                    const isActive = activeWorkspaceId === comp.id;
                    return (
                      <button
                        key={`mob-comp-${comp.id || cIdx}-${cIdx}`}
                        onClick={() => {
                          setActiveWorkspaceId(comp.id);
                          if (activeNav === "decouvrir" || activeNav === "communaute") {
                            setActiveNav("accueil");
                          }
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`relative flex size-9 shrink-0 items-center justify-center rounded-xl overflow-hidden transition-all cursor-pointer ${
                          isActive
                            ? "border-2 border-white/90 shadow-sm ring-1 ring-[#00D26A]"
                            : "border border-white/10 hover:border-white/30"
                        }`}
                        title={`Mon Entreprise : ${comp.name}`}
                      >
                        <div
                          className={`size-full bg-gradient-to-br ${
                            comp.colorGradient || "from-indigo-900 via-purple-900 to-black"
                          } flex items-center justify-center text-[10px] font-black text-white font-mono`}
                        >
                          <span>{comp.logoInitials || "EN"}</span>
                        </div>
                      </button>
                    );
                  })}

                  <button
                    onClick={() => {
                      setIsCompanyOnboardingOpen(true);
                      setIsMobileSidebarOpen(false);
                    }}
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-white/20 bg-transparent text-zinc-400 hover:border-[#00D26A] hover:text-[#00D26A] transition-all cursor-pointer"
                    title={lang === "fr" ? "Créer une nouvelle entreprise" : "Create new enterprise"}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                {/* Nav Menu */}
                <div>
                  <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 truncate flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate text-white font-semibold">
                        {activeSubscription ? `Membre : ${activeSubscription.companyName}` : activeCompany ? activeCompany.name : (lang === "fr" ? "Espace Personnel" : "Personal")}
                      </span>
                    </div>
                  </div>

                  {activeWorkspaceId === "personnel" ? (
                    <nav className="mt-1 space-y-1 text-xs font-medium">
                      {/* Accueil */}
                      <button
                        onClick={() => switchTab("accueil")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "accueil"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <Home className="size-4 text-zinc-300" />
                        <span>{lang === "fr" ? "Accueil" : "Home"}</span>
                      </button>

                      {/* Communauté */}
                      <button
                        onClick={() => switchTab("communaute")}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "communaute"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <UsersIcon className="size-4 text-[#00D26A]" />
                          <span>{lang === "fr" ? "Communauté" : "Community"}</span>
                        </div>
                        {memberSubscriptions.length > 0 && (
                          <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 font-bold">
                            {memberSubscriptions.length}
                          </span>
                        )}
                      </button>

                      {/* Assistance */}
                      <button
                        onClick={() => switchTab("assistance")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "assistance"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <Headphones className="size-4 text-emerald-400" />
                        <span>{lang === "fr" ? "Assistance" : "Assistance"}</span>
                      </button>

                      {/* Découvrir */}
                      <button
                        onClick={() => switchTab("decouvrir")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "decouvrir"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <Compass className="size-4 text-zinc-300" />
                        <span>{lang === "fr" ? "Découvrir" : "Discover"}</span>
                      </button>

                      {/* Affiliés */}
                      <button
                        onClick={() => switchTab("affilies")}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "affilies"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Share2 className="size-4 text-[#0055ff]" />
                          <span className={activeNav === "affilies" ? "text-white" : "text-zinc-200 font-semibold"}>
                            {lang === "fr" ? "Affiliés" : "Affiliates"}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#0055ff]/20 text-[#6699ff]">
                          Rejoindre
                        </span>
                      </button>
                    </nav>
                  ) : (
                    <nav className="mt-1 space-y-1 text-xs font-medium">
                      <button
                        onClick={() => switchTab("accueil")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "accueil"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <Home className="size-4 text-zinc-300" />
                        <span>{lang === "fr" ? "Accueil" : "Home"}</span>
                      </button>

                      <button
                        onClick={() => switchTab("produits")}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "produits"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Package className="size-4 text-zinc-300" />
                          <span>{lang === "fr" ? "Produits" : "Products"}</span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 px-1.5 py-0.5 rounded bg-white/5">
                          {productsList.length}
                        </span>
                      </button>

                      <button
                        onClick={() => switchTab("paiements")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "paiements"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <CreditCard className="size-4 text-zinc-300" />
                        <span>{lang === "fr" ? "Paiement" : "Payments"}</span>
                      </button>

                      <button
                        onClick={() => switchTab("clients")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "clients"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <UsersIcon className="size-4 text-zinc-300" />
                        <span>{lang === "fr" ? "Clients" : "Customers"}</span>
                      </button>

                      {/* Assistance */}
                      <button
                        onClick={() => switchTab("assistance")}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                          activeNav === "assistance"
                            ? "bg-[#22252c] text-white font-semibold"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                        }`}
                      >
                        <Headphones className="size-4 text-emerald-400" />
                        <span>{lang === "fr" ? "Assistance" : "Assistance"}</span>
                      </button>

                      <div className="pt-2 pb-1">
                        <span className="px-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">
                          Applications
                        </span>
                      </div>

                      <button
                        onClick={() => switchTab("applications")}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all cursor-pointer min-h-[44px] ${
                          activeNav === "applications"
                            ? "bg-[#0055ff]/20 border border-[#0055ff]/40 text-white font-bold shadow-sm"
                            : "text-zinc-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Plus className="size-4 text-[#0055ff]" />
                          <span className="font-semibold text-white">
                            {lang === "fr" ? "Ajouter application" : "Add Application"}
                          </span>
                        </div>
                      </button>

                      {/* Telegram App (présente uniquement si un produit lié existe) */}
                      {companyHasTelegram && (
                        <button
                          onClick={() => switchTab("telegram_app")}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                            activeNav === "telegram_app"
                              ? "bg-[#22252c] text-white font-semibold"
                              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                          }`}
                        >
                          <TelegramIcon className="size-4" />
                          <span className={activeNav === "telegram_app" ? "text-white font-bold" : "text-zinc-300"}>Telegram</span>
                        </button>
                      )}

                      {/* Discord App (présente uniquement si un produit lié existe) */}
                      {companyHasDiscord && (
                        <button
                          onClick={() => switchTab("discord_app")}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                            activeNav === "discord_app"
                              ? "bg-[#22252c] text-white font-semibold"
                              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                          }`}
                        >
                          <DiscordIcon className="size-4" />
                          <span className={activeNav === "discord_app" ? "text-white font-bold" : "text-zinc-300"}>Discord</span>
                        </button>
                      )}
                    </nav>
                  )}
                </div>
              </div>

              {/* Mobile Drawer Bottom Settings & Simulation Actions */}
              <div className="border-t border-white/[0.07] pt-3 mt-4 space-y-2 shrink-0">
                {/* Data Simulation in Mobile Drawer */}
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    handleSeedSimulationData();
                  }}
                  disabled={isSeedingData}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#00D26A]/40 bg-[#00D26A]/10 hover:bg-[#00D26A]/20 text-[#00D26A] text-xs font-bold transition-all min-h-[44px] cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Zap className={`size-4 ${isSeedingData ? "animate-spin text-amber-400" : "text-[#00D26A]"}`} />
                    <span>
                      {isSeedingData
                        ? (lang === "fr" ? "Simulation en cours..." : "Simulating...")
                        : (lang === "fr" ? "Simuler données réalistes" : "Simulate realistic data")}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#00D26A]/20 font-mono">
                    Démo
                  </span>
                </button>

                {/* Guided Tour in Mobile Drawer */}
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setActiveNav("accueil");
                    setIsGuidedTourOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer min-h-[40px]"
                >
                  <Sparkles className="size-4 text-[#00D26A]" />
                  <span>{lang === "fr" ? "Lancer la visite guidée" : "Start Guided Tour"}</span>
                </button>

                <button
                  onClick={() => switchTab("parametres_entreprise")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[44px] ${
                    activeNav === "parametres_entreprise" || activeNav === "parametres_boutique"
                      ? "bg-[#22252c] text-[#00D26A] font-bold"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="size-4 text-emerald-400" />
                    <span>{lang === "fr" ? "Paramètres Entreprise" : "Enterprise Settings"}</span>
                  </div>
                </button>

                <button
                  onClick={() => switchTab("parametres_compte")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer min-h-[44px] ${
                    activeNav === "parametres_compte"
                      ? "bg-[#22252c] text-[#00D26A] font-bold"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <User className="size-4 text-blue-400" />
                    <span>{lang === "fr" ? "Paramètres Compte" : "Account Settings"}</span>
                  </div>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* 3. MAIN CENTER WORKSPACE */}
        <main className="flex-1 overflow-y-auto bg-[#0f1012] p-6 lg:p-8">
            
          {/* VIEW: COMMUNAUTÉ (EMPTY STATE LORSQUE L'UTILISATEUR A QUITTÉ LES ENTREPRISES) */}
          {activeNav === "communaute" && !currentCommunitySub && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 max-w-md mx-auto">
              <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                <UsersIcon className="size-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Aucune entreprise rejointe</h3>
                <p className="text-xs text-zinc-400">
                  Vous ne faites partie d'aucune communauté d'entreprise pour le moment.
                </p>
              </div>
              <button
                onClick={() => switchTab("decouvrir")}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Explorer les entreprises
              </button>
            </div>
          )}

          {/* VIEW: ACCUEIL (Exact layout of screenshot) */}
          {activeNav === "accueil" && (
            isTabLoading ? (
              <div className="space-y-6 max-w-[1400px]">
                <DashboardMetricsSkeleton />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8">
                    <DashboardChartSkeleton />
                  </div>
                  <div className="lg:col-span-4">
                    <DashboardPulseSkeleton />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 max-w-[1400px]">
                {/* Empty State / Simulation Banner */}
                {projects.length === 0 && !isLoadingFirestore && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#00D26A]/30 bg-gradient-to-r from-[#00D26A]/10 via-[#16171b] to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#00D26A]/20 text-[#00D26A]">
                        <Zap className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">
                          {lang === "fr" ? "Espace de démonstration vide ? Remplissez-le en 1 clic !" : "Empty demo workspace? Fill it in 1 click!"}
                        </h4>
                        <p className="text-xs text-zinc-400">
                          {lang === "fr"
                            ? "Générez 5 produits numériques africains, 24 transactions Mobile Money (Wave, Orange Money) réparties sur 30 jours, 16 clients et des partenaires B2B."
                            : "Generate 5 African digital products, 24 Mobile Money transactions across 30 days, 16 clients and B2B partner deals."}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleSeedSimulationData}
                      disabled={isSeedingData}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#00D26A] text-black font-semibold text-xs hover:bg-[#00b85c] transition-all cursor-pointer shrink-0 shadow-md disabled:opacity-50"
                    >
                      <Zap className="size-3.5" />
                      <span>
                        {isSeedingData
                          ? (lang === "fr" ? "Génération en cours..." : "Generating...")
                          : (lang === "fr" ? "Simuler les données maintenant" : "Simulate Data Now")}
                      </span>
                    </button>
                  </div>
                )}

                {/* Demande de localisation contextuelle */}
                <ContextualLocationPrompt currentCurrency={currency} className="mb-4" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Main Balance + Graph Block (lg:col-span-8) */}
                                    <div className="lg:col-span-8 space-y-6">
                    <div id="tour-balance-chart" className="space-y-6">
                  {/* Solde Total Header (Contextuel selon l'entreprise ou le profil personnel) */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-semibold text-zinc-300">
                        <span>
                          {isCompanyContext
                            ? `Solde total — ${activeCompany?.name}`
                            : "Solde total — Personnel"}
                        </span>
                      </div>
                      <div id="tour-currency-selector" className="flex items-center gap-1.5">
                        <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                          {lang === "fr" ? "Affichage :" : "Display:"}
                        </span>
                        <CurrencySelector
                          currentCurrency={currency}
                          onSelectCurrency={setCurrency}
                          lang={lang}
                          variant="pill"
                        />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-3">
                      <div className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white font-mono break-all sm:break-normal">
                        {formatCurrency(activeBalance, currency)}
                      </div>
                    </div>
                  </div>

                  {/* Minimalist Line Chart with Wavy Curve and Baseline (Matching Screenshot) */}
                  <div className="relative rounded-2xl border border-white/[0.06] bg-[#121316] p-6 pt-10 overflow-hidden">
                    
                    {/* Timeframe pill selector */}
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-lg border border-white/5 bg-[#181a1f] p-1 text-[11px] font-mono">
                      {(["24h", "7j", "30j", "1an", "tout"] as const).map((tf) => (
                        <button
                          key={tf}
                          onClick={() => setSelectedTimeframe(tf)}
                          className={`rounded px-2 py-0.5 transition-all cursor-pointer ${
                            selectedTimeframe === tf
                              ? "bg-[#252830] text-white font-bold"
                              : "text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {tf}
                        </button>
                      ))}
                    </div>

                    {/* SVG Wavy Graph */}
                    <div className="h-64 sm:h-72 w-full pt-4">
                      <svg className="h-full w-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#00D26A" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#00D26A" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Filled area */}
                        <path
                          d="M 0,140 Q 60,115 120,135 T 240,110 T 360,95 T 480,80 T 600,85 L 600,190 L 0,190 Z"
                          fill="url(#balanceGradient)"
                        />

                        {/* Main wavy stroke line */}
                        <path
                          d="M 0,140 Q 60,115 120,135 T 240,110 T 360,95 T 480,80 T 600,85"
                          fill="none"
                          stroke="#00D26A"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Dotted horizontal baseline */}
                        <line
                          x1="0"
                          y1="170"
                          x2="600"
                          y2="170"
                          stroke="rgba(255,255,255,0.12)"
                          strokeDasharray="4 4"
                          strokeWidth="1"
                        />
                      </svg>
                    </div>

                  </div>
                </div>

              </div>
            {/* Right Column: Soldes & Pouls (lg:col-span-4, Matching Screenshot) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 1. Soldes Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#121316] p-5">
                <h3 className="text-sm font-bold text-white mb-3">
                  {lang === "fr" ? "Soldes" : "Balances"}
                </h3>

                <div
                  onClick={() => switchTab("paiements")}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#32363e] text-xs font-bold text-white border border-white/10">
                      {user.avatarInitials || "JO"}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {activeCompany ? activeCompany.name : "Personnel"}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{user.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-zinc-200">
                    <span>{formatCurrency(activeBalance, currency)}</span>
                    <ChevronRight className="size-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>

                  {/* 2. Pouls Live Stream Card (Exact match to screenshot) */}
                  <div id="tour-pulse-feed" className="rounded-2xl border border-white/[0.08] bg-[#121316] p-5 space-y-3">
                    
                    {/* Pouls header with green dot */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          {lang === "fr" ? "Pouls" : "Pulse"}
                        </h3>
                        <span className="size-2 rounded-full bg-[#00D26A] animate-pulse" />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">Réseau en direct</span>
                    </div>

                    {/* Live feed list with African Country Flags */}
                    <div className="h-[460px] overflow-hidden pr-1">
                      {pulseEvents.length === 0 ? (
                        <div className="py-12 px-3 text-center space-y-2.5">
                          <div className="size-9 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                            <Zap className="size-4 text-zinc-500" />
                          </div>
                          <p className="text-xs font-semibold text-zinc-300">
                            {lang === "fr" ? "En attente d'activité" : "Waiting for activity"}
                          </p>
                          <p className="text-[11px] text-zinc-500 leading-relaxed max-w-[200px] mx-auto">
                            {lang === "fr"
                              ? "Vos ventes Wave, Orange Money et virements s'afficheront ici en direct."
                              : "Your live sales and mobile money payouts will stream here."}
                          </p>
                        </div>
                      ) : (
                        <div
                          className="pulse-feed-track space-y-2.5"
                          style={{ transform: `translateY(${pulseFeedOffset}px)` }}
                        >
                          {pulseEvents.map((evt) => (
                          <div
                            key={evt.id}
                            className="flex items-start gap-3 text-xs text-zinc-300 leading-snug p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.05] hover:border-white/[0.08] transition-all"
                          >

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <div className="text-zinc-200 truncate">
                                  {evt.type === "ad_spend" ? (
                                    <>
                                      <span>Campagne Ads : </span>
                                      <strong className="text-[#00D26A] font-mono font-bold">{evt.amount}</strong>
                                    </>
                                  ) : (
                                    <>
                                      <span>Vente : </span>
                                      <strong className="text-[#00D26A] font-mono font-bold">{evt.amount}</strong>
                                    </>
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-zinc-500 shrink-0">{evt.timeAgo}</span>
                              </div>

                              <div className="text-[10px] font-mono text-zinc-400 mt-1 flex items-center gap-1.5 flex-wrap">
                                <span className="text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                  {evt.source}
                                </span>
                                <span className="text-zinc-500">·</span>
                                <span className="text-zinc-300 truncate">{evt.location}</span>
                              </div>
                            </div>
                          </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              </div>

              {/* RECHARTS DATA VISUALIZATION: 30-DAY DIGITAL REVENUE EVOLUTION */}
              <div id="tour-revenue-analytics">
                <RevenueAnalyticsChart
                  lang={lang}
                  currentBalance={activeBalance}
                  currentCurrency={currency}
                  onSelectCurrency={setCurrency}
                  transactions={contextTransactions}
                />
              </div>

            </div>
          )
        )}

          {/* VIEW: PRODUITS (Matching exact UI of Image 1) */}
          {activeNav === "produits" && (
            <div className="max-w-7xl mx-auto space-y-5">
              
              {/* Header: Title, Visibility Filter Pill, and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="space-y-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Produits
                  </h1>

                  {/* Filter Pill: Visibility: Visible +1 x */}
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center gap-1.5 rounded-lg bg-[#0055ff]/15 border border-[#0055ff]/40 px-3 py-1 text-xs font-semibold text-[#6699ff]">
                      <span>Visibility: Visible +1</span>
                      <button
                        onClick={() => setSelectedProductFilter(selectedProductFilter === "visible" ? "all" : "visible")}
                        className="hover:text-white ml-0.5 cursor-pointer"
                        title="Effacer le filtre"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                {/* Top Right Action Buttons: + Créer un produit, Exporter, Settings */}
                <div className="flex items-center gap-2.5">
                  {isCreatorCompanySelected && (
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        setIsProductStudioOpen(true);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Plus className="size-4" />
                      <span>Créer un produit</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const jsonStr = JSON.stringify(productsList, null, 2);
                      const blob = new Blob([jsonStr], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "mansa-produits.json";
                      a.click();
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16181f] hover:bg-[#1f222b] px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <Upload className="size-3.5 rotate-180" />
                    <span>Exporter</span>
                  </button>

                  <button
                    onClick={() => setActiveNav("parametres")}
                    className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-[#16181f] hover:bg-[#1f222b] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Paramètres des produits"
                  >
                    <Settings className="size-4" />
                  </button>
                </div>

              </div>

              {/* INFORMATION RETRAIT & VENTES: Un créateur peut publier et vendre sans moyen de retrait. Les fonds restent sur son solde */}
              {!payoutConfigured && (
                <div className="rounded-2xl border border-sky-500/30 bg-gradient-to-r from-sky-950/30 via-[#0a121a] to-[#0c0d0e] p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg mb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="size-10 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        <span>Ventes & Produits actifs · Retrait non configuré</span>
                      </h4>
                      <p className="text-xs text-zinc-300 mt-1 max-w-2xl leading-relaxed">
                        Vos {productsList.length} produit{productsList.length > 1 ? "s sont" : " est"} en vente et peu{productsList.length > 1 ? "vent" : "t"} être acheté{productsList.length > 1 ? "s" : ""} par vos clients. L'argent net de vos ventes est crédité en toute sécurité sur votre solde créateur. Renseignez votre moyen de retrait (Wave, Orange Money, MTN MoMo, RIB ou Crypto) quand vous souhaitez demander vos versements.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveNav("paiements")}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-all shrink-0 flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <ArrowUpRight className="size-4" />
                    <span>Configurer le retrait</span>
                  </button>
                </div>
              )}

              {/* Products Table matching screenshot */}
              <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0c0d0e] overflow-hidden shadow-sm">
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs border-collapse">
                    
                    {/* Header Row */}
                    <thead>
                      <tr className="border-b border-white/[0.08] text-[11px] font-medium text-zinc-400">
                        <th className="py-3.5 px-4 font-normal">Nom</th>
                        <th className="py-3.5 px-4 font-normal">Prix</th>
                        <th className="py-3.5 px-4 font-normal">Visibilité</th>
                        <th className="py-3.5 px-4 font-normal">Statut de la découverte</th>
                        <th className="py-3.5 px-4 font-normal">Applications incluses</th>
                        <th className="py-3.5 px-4 font-normal">Conversion de paiement</th>
                        <th className="py-3.5 px-4 font-normal">Revenu total</th>
                        <th className="py-3.5 px-4 font-normal">
                          <div className="flex items-center gap-1 cursor-pointer hover:text-zinc-200">
                            <span>Utilisateurs actifs</span>
                            <span>↓</span>
                          </div>
                        </th>
                        <th className="py-3.5 px-4 text-right font-normal"></th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-white/[0.04]">
                      {productsList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="py-16 px-4 text-center">
                            <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-4">
                              <div className="size-12 rounded-2xl bg-[#151515] border border-white/10 flex items-center justify-center text-[#3DDC84]">
                                <Package className="size-6" />
                              </div>
                              <div className="space-y-1">
                                <h3 className="text-base font-bold text-white font-heading">
                                  {lang === "fr" ? "Aucun produit dans votre base de données" : "No products in database"}
                                </h3>
                                <p className="text-xs text-[#B6B5B0] leading-relaxed">
                                  {lang === "fr"
                                    ? "Votre catalogue est actuellement vide. Créez votre première offre ou importez un template pour commencer à vendre."
                                    : "Your catalog is empty. Create your first product to start selling."}
                                </p>
                              </div>
                              {isCreatorCompanySelected ? (
                                <button
                                  onClick={() => {
                                    setEditingProduct(null);
                                    setIsProductStudioOpen(true);
                                  }}
                                  className="mansa-btn-green px-5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer"
                                >
                                  <Plus className="size-3.5" />
                                  <span>{lang === "fr" ? "+ Créer un produit" : "+ Create Product"}</span>
                                </button>
                              ) : (
                                <div className="flex flex-col items-center gap-2 pt-1">
                                  <p className="text-[11px] text-amber-400 font-medium">
                                    {lang === "fr"
                                      ? "La création de produit s'effectue au sein de vos entreprises."
                                      : "Product creation is only available within your companies."}
                                  </p>
                                  {companies.length > 0 ? (
                                    <button
                                      onClick={() => {
                                        setActiveWorkspaceId(companies[0].id);
                                        setActiveNav("produits");
                                      }}
                                      className="mansa-btn-green px-4 py-1.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                                    >
                                      <span>{lang === "fr" ? `Accéder à ${companies[0].name}` : `Go to ${companies[0].name}`}</span>
                                      <ArrowRight className="size-3" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setIsCompanyOnboardingOpen(true)}
                                      className="mansa-btn-green px-4 py-1.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                                    >
                                      <Plus className="size-3" />
                                      <span>{lang === "fr" ? "Créer une entreprise" : "Create a company"}</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        productsList.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          {/* Nom */}
                          <td className="py-4 px-4 font-bold text-white whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span>{product.name}</span>
                              </div>
                              {product.communityConfig?.telegramChannelName ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTelegramLinkModalProduct(product);
                                    setIsTelegramLinkModalOpen(true);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#229ED9]/15 border border-[#229ED9]/30 text-[#229ED9] text-[10px] font-semibold hover:bg-[#229ED9]/25 transition-all w-fit cursor-pointer group/tg"
                                  title="Cliquer pour voir ou changer le canal Telegram lié"
                                >
                                  <TelegramIcon className="size-3" />
                                  <span>{product.communityConfig.telegramChannelName}</span>
                                  <span className="text-[9px] text-zinc-400 group-hover/tg:text-white underline ml-0.5">Changer</span>
                                </button>
                              ) : null}
                            </div>
                          </td>

                          {/* Prix (dynamically converted to selected main currency) */}
                          <td className="py-4 px-4 text-zinc-200 font-mono font-medium whitespace-nowrap">
                            {(() => {
                              if (product.pricingType === "free" || !product.priceAmount) {
                                return "Gratuit";
                              }
                              const origCurr = (product.currency as CurrencyCode) || "USD";
                              const converted = convertBetweenCurrencies(product.priceAmount, origCurr, currency);
                              const currConf = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
                              const formattedVal =
                                currConf.decimals === 0
                                  ? Math.round(converted).toLocaleString("fr-FR")
                                  : (Math.round(converted * 100) / 100).toLocaleString("fr-FR", {
                                      minimumFractionDigits: currConf.decimals,
                                      maximumFractionDigits: currConf.decimals,
                                    });
                              const billingSuffix =
                                product.billingCycle === "monthly"
                                  ? " / mois"
                                  : product.billingCycle === "yearly"
                                  ? " / an"
                                  : "";
                              return `${formattedVal} ${currConf.symbol}${billingSuffix}`;
                            })()}
                          </td>

                          {/* Visibilité: Un créateur vend et publie librement même sans moyen de retrait configuré */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>{product.visibility || "Actif & En vente"}</span>
                            </span>
                          </td>

                          {/* Statut de la découverte */}
                          <td className="py-4 px-4 text-zinc-400 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Globe className="size-3.5 text-zinc-400 shrink-0" />
                              <span className="text-zinc-300">
                                {product.discoverStatus || "Public"}
                              </span>
                            </div>
                          </td>

                          {/* Applications incluses (Dynamic icons matching exact selected apps) */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-zinc-500">—</span>
                          </td>

                          {/* Conversion de paiement */}
                          <td className="py-4 px-4 text-zinc-400 font-mono whitespace-nowrap">
                            {product.conversionRate}
                          </td>

                          {/* Revenu total (dynamically converted to selected main currency) */}
                          <td className="py-4 px-4 text-emerald-400 font-mono font-semibold whitespace-nowrap">
                            {(() => {
                              const origCurr = (product.currency as CurrencyCode) || "USD";
                              const rawRev = (product.priceAmount || 0) * (product.activeUsers || 0);
                              const convertedRev = convertBetweenCurrencies(rawRev, origCurr, currency);
                              const currConf = SUPPORTED_CURRENCIES[currency] || SUPPORTED_CURRENCIES.USD;
                              const formattedVal =
                                currConf.decimals === 0
                                  ? Math.round(convertedRev).toLocaleString("fr-FR")
                                  : (Math.round(convertedRev * 100) / 100).toLocaleString("fr-FR", {
                                      minimumFractionDigits: currConf.decimals,
                                      maximumFractionDigits: currConf.decimals,
                                    });
                              return `${formattedVal} ${currConf.symbol}`;
                            })()}
                          </td>

                          {/* Utilisateurs actifs */}
                          <td className="py-4 px-4 font-mono font-semibold text-zinc-300 whitespace-nowrap">
                            {product.activeUsers}
                          </td>

                          {/* Actions: Link icon & 3-dots */}
                          <td className="py-4 px-4 text-right whitespace-nowrap relative">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* Copy Link Button */}
                              <button
                                onClick={() => {
                                  navigator.clipboard?.writeText?.(`https://${product.productUrl}`);
                                  setCopyFeedbackId(product.id);
                                  setTimeout(() => setCopyFeedbackId(null), 2000);
                                }}
                                className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer relative"
                                title="Copier le lien du produit"
                              >
                                {copyFeedbackId === product.id ? (
                                  <Check className="size-4 text-emerald-400" />
                                ) : (
                                  <Link className="size-4" />
                                )}
                              </button>

                              {/* Three-dots Menu */}
                              <div className="relative">
                                <button
                                  onClick={() => setActiveActionMenuId(activeActionMenuId === product.id ? null : product.id)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                                >
                                  <MoreVertical className="size-4" />
                                </button>

                                {activeActionMenuId === product.id && (
                                  <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-white/10 bg-[#16181f] p-1.5 shadow-2xl text-left text-xs space-y-0.5">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(product);
                                        setIsProductStudioOpen(true);
                                        setActiveActionMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white cursor-pointer"
                                    >
                                      <Sparkles className="size-3.5 text-[#0055ff]" />
                                      <span>Modifier le produit</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        const duplicate = {
                                          ...product,
                                          id: "prod-" + Date.now(),
                                          name: product.name + " (Copie)",
                                        };
                                        setProductsList([...productsList, duplicate]);
                                        setActiveActionMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white cursor-pointer"
                                    >
                                      <Layers className="size-3.5 text-zinc-400" />
                                      <span>Dupliquer</span>
                                    </button>

                                    <div className="border-t border-white/5 my-1" />

                                    <button
                                      onClick={() => {
                                        setProductToDelete(product);
                                        setActiveActionMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                                    >
                                      <Trash2 className="size-3.5" />
                                      <span>Supprimer</span>
                                    </button>
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>
                        </tr>
                        ))
                      )}
                    </tbody>

                  </table>
                </div>

                {/* Bottom Pagination matching screenshot 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-white/[0.08] text-xs text-zinc-400">
                  
                  <div>
                    <span>1-{productsList.length} de {productsList.length} résultats</span>
                  </div>

                  {/* Page Controls */}
                  <div className="flex items-center gap-4 text-xs">
                    <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">«</button>
                    <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">‹</button>
                    <span className="font-semibold text-white">Page 1 sur 1</span>
                    <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">›</button>
                    <button className="text-zinc-500 hover:text-white transition-colors cursor-pointer">»</button>
                  </div>

                  {/* Lignes par page */}
                  <div className="flex items-center gap-2">
                    <span>Lignes par page</span>
                    <div className="flex items-center gap-1 rounded bg-[#16181f] border border-white/10 px-2 py-0.5 text-white font-mono">
                      <span>20</span>
                      <ChevronDown className="size-3 text-zinc-400" />
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* VIEW: MESSAGES */}
          {activeNav === "messages" && (
            isTabLoading ? (
              <div className="max-w-3xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-[#121316] overflow-hidden flex flex-col h-[calc(100vh-140px)]">
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#16171b]">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full bg-[#00D26A]" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Centre de Messagerie & Clients</h3>
                      <p className="text-[11px] text-zinc-400">Canal direct avec vos acheteurs et l'équipe Victory Roos</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 ${msg.isMe ? "flex-row-reverse" : ""}`}
                    >
                      <div className="size-8 rounded-full bg-[#272932] border border-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                        {msg.isMe ? user.avatarInitials : msg.sender[0]}
                      </div>
                      <div
                        className={`max-w-md rounded-xl p-3 text-xs leading-relaxed ${
                          msg.isMe
                            ? "bg-[#00D26A] text-black font-semibold"
                            : "bg-[#1a1c22] border border-white/10 text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75">
                          <span className="font-semibold">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p>{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-[#16171b] flex gap-2">
                  <input
                    type="text"
                    value={newChatInput}
                    onChange={(e) => setNewChatInput(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="flex-1 rounded-xl border border-white/10 bg-[#121316] px-4 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                  />
                  <button type="submit" className="mansa-btn-green px-4 py-2 text-xs cursor-pointer">
                    <Send className="size-3.5" />
                  </button>
                </form>
              </div>
            )
          )}

          {/* VIEW: PAIEMENTS */}
          {activeNav === "paiements" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <PaymentsView
                lang={lang}
                currency={currency}
                activeWorkspaceId={activeWorkspaceId}
                activeCompanyName={activeCompany?.name}
              />
            )
          )}

          {/* VIEW: CLIENTS */}
          {activeNav === "clients" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <CustomersView lang={lang} />
            )
          )}

          {/* VIEW: ASSISTANCE (Chat & Support Membres) */}
          {activeNav === "assistance" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <AssistanceView
                lang={lang}
                activeCompany={activeCompany}
                companies={companies}
                onNavigateToClients={() => switchTab("clients")}
              />
            )
          )}

          {/* VIEW: AFFILIÉS */}
          {activeNav === "affilies" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <AffiliatesView
                lang={lang}
                userRefName={user.name || "johan"}
                isPersonalWorkspace={activeWorkspaceId === "personnel"}
                currency={currency}
              />
            )
          )}

          {/* VIEW: APPLICATIONS & INTÉGRATIONS CATALOG */}
          {activeNav === "applications" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <ConnectedAppsView
                lang={lang}
                initialSubView="catalog"
                availableProducts={productsList.map((p) => ({
                  id: p.id,
                  title: p.title || p.name,
                  priceDisplay: p.priceDisplay || formatCurrency(p.priceAmount, currency),
                  subscribersCount: p.activeUsers || 0,
                }))}
              />
            )
          )}

          {/* VIEW: TELEGRAM CONNECTED APP & CHANNELS */}
          {activeNav === "telegram_app" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <ConnectedAppsView
                lang={lang}
                initialSubView="telegram"
                availableProducts={productsList.map((p) => ({
                  id: p.id,
                  title: p.title || p.name,
                  priceDisplay: p.priceDisplay || formatCurrency(p.priceAmount, currency),
                  subscribersCount: p.activeUsers || 0,
                }))}
              />
            )
          )}

          {/* VIEW: DISCORD CONNECTED APP & SERVERS */}
          {activeNav === "discord_app" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <ConnectedAppsView
                lang={lang}
                initialSubView="discord"
                availableProducts={productsList.map((p) => ({
                  id: p.id,
                  title: p.title || p.name,
                  priceDisplay: p.priceDisplay || formatCurrency(p.priceAmount, currency),
                  subscribersCount: p.activeUsers || 0,
                }))}
              />
            )
          )}

          {/* VIEW: DÉCOUVRIR LES AUTRES CRÉATEURS */}
          {activeNav === "decouvrir" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <DiscoverCreatorsView
                lang={lang}
                user={user}
                onNavigateToEnterprise={handleVisitEnterpriseFromDiscover}
              />
            )
          )}

          {/* VIEW: PARAMÈTRES DU COMPTE */}
          {activeNav === "parametres_compte" && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <SettingsView
                lang={lang}
                user={user}
                onLogout={onLogout}
                initialTab="account"
                activeCompanyId={activeCompany?.id}
                activeCompanyName={activeCompany?.name}
              />
            )
          )}

          {/* VIEW: PARAMÈTRES DE L'ENTREPRISE */}
          {(activeNav === "parametres_entreprise" || activeNav === "parametres_boutique" || activeNav === "parametres") && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <SettingsView
                lang={lang}
                user={user}
                onLogout={onLogout}
                initialTab="store"
                activeCompanyId={activeCompany?.id}
                activeCompanyName={activeCompany?.name}
              />
            )
          )}

          {/* VIEW: MAIN D'OEUVRE & EQUIPE */}
          {(activeNav === "workforce" || activeNav === "main_doeuvre" || activeNav === "equipe") && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <WorkforceView lang={lang} user={user} />
            )
          )}

          {/* VIEW: PARTENAIRES & COLLABORATIONS */}
          {(activeNav === "partenaires" || activeNav === "partners") && (
            isTabLoading ? (
              <div className="max-w-7xl mx-auto space-y-5">
                <DashboardProductsSkeleton />
              </div>
            ) : (
              <PartnersView lang={lang} user={user} />
            )
          )}

        </main>

      </div>
      )}

      {/* SEARCH MODAL (⌘K) */}
      {isSearchOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsSearchOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md pt-20 p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121316] shadow-2xl overflow-hidden cursor-default"
          >
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <Search className="size-4 text-[#00D26A]" />
              <input
                type="text"
                autoFocus
                placeholder="Rechercher dans votre espace Mansa (Commandes, Clients, Produits)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white flex items-center justify-center min-w-[32px] min-h-[32px] cursor-pointer"
                aria-label="Fermer"
              >
                <X className="size-4 sm:hidden" />
                <span className="hidden sm:inline text-xs font-mono text-zinc-500">ESC</span>
              </button>
            </div>

            <div className="p-3 text-xs text-zinc-400 space-y-1">
              <div
                onClick={() => {
                  switchTab("accueil");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>Tableau de bord & Soldes</span>
                <span className="font-mono text-[10px] text-zinc-500">Vue principale</span>
              </div>
              <div
                onClick={() => {
                  switchTab("accueil");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>📈 Analyse des Revenus (Recharts 30j)</span>
                <span className="font-mono text-[10px] text-[#00D26A]">Analytics</span>
              </div>
              <div
                onClick={() => {
                  switchTab("accueil");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>📥 Exporter les statistiques de revenus en CSV (30j)</span>
                <span className="font-mono text-[10px] text-[#00D26A]">Export CSV</span>
              </div>
              <div
                onClick={() => {
                  switchTab("produits");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-[#00D26A]" />
                  <span>Mes Projets & Entreprises IA</span>
                </span>
                <span className="font-mono text-[10px] text-[#00D26A] font-semibold">{projects.length} projets</span>
              </div>
              <div
                onClick={() => {
                  switchTab("produits");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>Produits & Offres numériques</span>
                <span className="font-mono text-[10px] text-emerald-400">{productsList.length} actifs</span>
              </div>
              <div
                onClick={() => {
                  switchTab("paiements");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>Paiements & Trésorerie</span>
                <span className="font-mono text-[10px] text-zinc-500">Transactions</span>
              </div>
              <div
                onClick={() => {
                  switchTab("clients");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>Membres & Abonnements</span>
                <span className="font-mono text-[10px] text-zinc-500">Gestion</span>
              </div>
              <div
                onClick={() => {
                  switchTab("assistance");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span>Assistance (Chat avec les membres)</span>
                <span className="font-mono text-[10px] text-emerald-400">Direct</span>
              </div>
              <div
                onClick={() => {
                  switchTab("applications");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Plus className="size-3.5 text-[#0055ff]" />
                  <span>+ Ajouter une application (Telegram, Discord, Cours, Fichiers...)</span>
                </span>
                <span className="font-mono text-[10px] text-[#0055ff]">App Store</span>
              </div>
              <div
                onClick={() => {
                  switchTab("telegram_app");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <TelegramIcon className="size-3.5" />
                  <span>Telegram : Canaux, Groupes & Bot de Vérification</span>
                </span>
                <span className="font-mono text-[10px] text-[#229ED9]">Telegram App</span>
              </div>
              <div
                onClick={() => {
                  switchTab("discord_app");
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <DiscordIcon className="size-3.5" />
                  <span>Discord : Serveurs & Gestion des Rôles VIP</span>
                </span>
                <span className="font-mono text-[10px] text-[#8c97f8]">Discord App</span>
              </div>
              <div
                onClick={() => {
                  setAccountSettingsInitialTab("commandes");
                  setIsAccountSettingsModalOpen(true);
                  setIsSearchOpen(false);
                }}
                className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="size-3.5 text-emerald-400" />
                  <span>Mes Commandes & Achats (Fichiers, beats, accès VIP)</span>
                </span>
                <span className="font-mono text-[10px] text-emerald-400">Paramètres</span>
              </div>
              {isCreatorCompanySelected && (
                <div
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductStudioOpen(true);
                    setIsSearchOpen(false);
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 hover:text-white cursor-pointer flex items-center justify-between"
                >
                  <span>Créer un nouveau produit</span>
                  <span className="font-mono text-[10px] text-emerald-400">Studio Mansa</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT CREATION STUDIO MODAL */}
      {isProductStudioOpen && (
        <ProductCreationStudio
          companyName={activeCompany ? activeCompany.name : (companies[0]?.name || "Cadre financier")}
          initialData={editingProduct || undefined}
          activeCurrency={currency}
          onCurrencyChange={(newCurr) => {
            setCurrency(newCurr);
            setStoredCurrency(newCurr);
          }}
          onClose={() => {
            setIsProductStudioOpen(false);
            setEditingProduct(null);
          }}
          onSave={async (newProduct) => {
            const creatorKey = user.uid || user.email || "creator-default";
            await saveProductToFirestore(creatorKey, user.email, user.name, {
              id: editingProduct ? editingProduct.id : newProduct.id,
              name: newProduct.name,
              description: newProduct.description,
              category: "community",
              priceAmount: newProduct.priceAmount,
              pricingType: newProduct.pricingType,
              billingCycle: newProduct.billingCycle,
              currency: newProduct.currency || currency || "USD",
              includedApps: newProduct.includedApps,
              affiliateRate: newProduct.affiliateRate || 25,
              productUrl: newProduct.productUrl,
              coverImage: newProduct.imageUrl,
            });
            setIsProductStudioOpen(false);
            setEditingProduct(null);
            setActiveNav("produits");
          }}
          onDelete={async (productId) => {
            await deleteProductFromFirestore(productId);
            setIsProductStudioOpen(false);
            setEditingProduct(null);
          }}
          lang={lang}
        />
      )}

      {/* GUIDED TOUR FOR NEW CREATORS */}
      <GuidedTour
        isOpen={isGuidedTourOpen}
        onClose={() => setIsGuidedTourOpen(false)}
        onSelectTab={(tab) => switchTab(tab as typeof activeNav)}
        lang={lang}
        onCompleteTour={() => {
          safeStorage.setItem("mansa_creator_tour_completed", "true");
        }}
        onOnboardingComplete={(data: OnboardingData) => {
          setCurrency(data.currency);
        }}
      />

      {/* CONFIRM PRODUCT DELETION MODAL */}
      {productToDelete && (
        <ConfirmActionModal
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={async () => {
            if (productToDelete.id) {
              await deleteProductFromFirestore(productToDelete.id);
            }
            setProductToDelete(null);
          }}
          title={lang === "fr" ? "Supprimer définitivement ce produit ?" : "Permanently delete this product?"}
          description={
            lang === "fr"
              ? "Êtes-vous certain de vouloir supprimer cette offre ? Cette action est irréversible et supprimera le produit de votre catalogue."
              : "Are you sure you want to delete this product? This action is irreversible and will remove the product from your catalog."
          }
          itemName={productToDelete.name}
          itemType={lang === "fr" ? "Produit Mansa" : "Mansa Product"}
          itemDetails={[
            { label: "Tarif", value: productToDelete.priceDisplay },
            { label: "Visibilité", value: productToDelete.visibility },
            { label: "Utilisateurs actifs", value: String(productToDelete.activeUsers) },
            { label: "URL de vente", value: productToDelete.productUrl },
          ]}
          consequences={[
            lang === "fr"
              ? "La vitrine de vente Mansa et le lien de paiement public cesseront de fonctionner."
              : "The Mansa storefront and public payment link will stop working immediately.",
            lang === "fr"
              ? "Les automatisations de synchronisation Discord / Telegram ne distribueront plus de nouveaux rôles."
              : "Discord / Telegram bot sync will no longer distribute new roles.",
            lang === "fr"
              ? "L'historique comptable des paiements passés reste archivé en toute sécurité."
              : "Past payment accounting history remains securely archived.",
          ]}
          confirmButtonText={lang === "fr" ? "Supprimer le produit" : "Delete Product"}
          cancelButtonText={lang === "fr" ? "Annuler" : "Cancel"}
          variant="danger"
          lang={lang}
        />
      )}

      {/* CONFIRM PROJECT DELETION MODAL */}
      {projectToDelete && (
        <ConfirmActionModal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={async () => {
            if (projectToDelete.id) {
              await deleteProductFromFirestore(projectToDelete.id);
            }
            setProjectToDelete(null);
          }}
          title={lang === "fr" ? "Supprimer ce projet de boutique ?" : "Delete this store project?"}
          description={
            lang === "fr"
              ? `Êtes-vous sûr de vouloir supprimer définitivement le projet "${projectToDelete.name}" ? Toutes ses données associées seront effacées.`
              : `Are you sure you want to permanently delete the project "${projectToDelete.name}"? All associated data will be removed.`
          }
          itemName={projectToDelete.name}
          itemType={lang === "fr" ? "Projet Mansa" : "Mansa Project"}
          itemDetails={[
            { label: "Catégorie", value: projectToDelete.category },
            { label: "Statut", value: projectToDelete.status },
            { label: "Membres", value: String(projectToDelete.membersCount) },
          ]}
          confirmButtonText={lang === "fr" ? "Supprimer le projet" : "Delete Project"}
          cancelButtonText={lang === "fr" ? "Annuler" : "Cancel"}
          variant="danger"
          lang={lang}
        />
      )}

      {/* PRODUCT TELEGRAM LINK & CHANGE MODAL */}
      {isTelegramLinkModalOpen && telegramLinkModalProduct && (
        <ProductTelegramLinkModal
          isOpen={isTelegramLinkModalOpen}
          onClose={() => {
            setIsTelegramLinkModalOpen(false);
            setTelegramLinkModalProduct(null);
          }}
          product={telegramLinkModalProduct}
          onSaveProductTelegram={(productId, channelName, channelId) => {
            setProductsList((prev) =>
              prev.map((p) =>
                p.id === productId
                  ? {
                      ...p,
                      communityConfig: {
                        ...(p.communityConfig || {
                          discordEnabled: false,
                          discordServerId: "",
                          discordServerName: "",
                          discordRoleName: "",
                        }),
                        telegramEnabled: true,
                        telegramChannelName: channelName,
                        telegramChannelId: channelId,
                      },
                    }
                  : p
              )
            );
            setIsTelegramLinkModalOpen(false);
            setTelegramLinkModalProduct(null);
          }}
        />
      )}

      {/* ACCOUNT SETTINGS MODAL */}
      {isAccountSettingsModalOpen && (
        <AccountSettingsModal
          isOpen={isAccountSettingsModalOpen}
          onClose={() => setIsAccountSettingsModalOpen(false)}
          user={user}
          onLogout={onLogout}
          lang={lang}
          initialTab={accountSettingsInitialTab}
        />
      )}

      {/* NEW COMPANY ONBOARDING MODAL */}
      {isCompanyOnboardingOpen && (
        <CompanyOnboardingModal
          isOpen={isCompanyOnboardingOpen}
          onClose={() => setIsCompanyOnboardingOpen(false)}
          onCompanyCreated={handleCompanyCreated}
          lang={lang}
        />
      )}

      {/* Toast Notification for Data Simulation */}
      {seedToastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#00D26A]/50 bg-[#16171b] px-4 py-3 text-sm text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#00D26A]/20 text-[#00D26A]">
            <CheckCircle2 className="size-4" />
          </div>
          <div className="text-xs font-medium text-zinc-200">{seedToastMessage}</div>
          <button
            onClick={() => setSeedToastMessage(null)}
            className="text-zinc-500 hover:text-white ml-2 cursor-pointer"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
