import React, { useState, useEffect } from "react";
import {
  X,
  Monitor,
  Smartphone,
  Users,
  Upload,
  Image as ImageIcon,
  Plus,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  GraduationCap,
  FileText,
  Send,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  Settings as SettingsIcon,
  Download,
  FolderArchive,
  BookOpen,
  ArrowRight,
  Lock,
  MessageCircle,
  FileCheck,
  ExternalLink,
  Bot,
  Star,
  Zap,
  Globe,
  Share2,
  Music,
} from "lucide-react";
import { CreatorBotSetupModal, CreatorCommunityConfig } from "./CreatorBotSetupModal";
import { DiscordIcon, TelegramIcon } from "./common/Icons";
import { ConfirmActionModal } from "./common/ConfirmActionModal";
import { ModalOverlay } from "./common/ModalOverlay";
import { AudioPreview30sPlayer } from "./common/AudioPreview30sPlayer";
import { CurrencySelector } from "./dashboard/CurrencySelector";
import {
  getStoredTelegramChannels,
  TelegramChannelItem,
} from "../utils/telegramStorage";
import { getSavedCompanies } from "../utils/companyStorage";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  detectUserLocationAndCurrency,
  getStoredCurrency,
  setStoredCurrency,
  convertBetweenCurrencies,
  formatConvertedNumericPrice,
  formatCurrency,
} from "../utils/currency";

export type ProductTypeCategory = "digital" | "course" | "ebook" | "membership";

export interface DigitalFileAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  isFreePreview?: boolean;
  downloadUrl?: string;
  isAudio?: boolean;
  audioPreviewSeconds?: number;
}

export interface CourseModuleItem {
  id: string;
  title: string;
  duration: string;
}

export interface PricingOption {
  id: string;
  name: string;
  price: number;
  currency: CurrencyCode;
  billing: "monthly" | "yearly" | "one_time" | "free";
  subscribersCount: number;
}

export interface FaqItem {
  id: string;
  q: string;
  a: string;
}

export interface CreatedProductData {
  id: string;
  productType: ProductTypeCategory;
  name: string;
  priceDisplay: string;
  priceAmount: number;
  currency: CurrencyCode;
  pricingType: "free" | "paid";
  billingCycle: "one_time" | "monthly" | "yearly";
  visibility: "Visible" | "Caché";
  discoverStatus: string;
  includedApps: string[];
  conversionRate: string;
  totalRevenue: string;
  activeUsers: number;
  imageUrl?: string;
  bannerUrl?: string;
  title: string;
  description: string;
  storeName?: string;
  companyId?: string;
  companyName?: string;
  productUrl: string;
  affiliateRate: number;
  ctaText: string;
  pricingOptions?: PricingOption[];
  faqs?: FaqItem[];
  digitalFiles?: DigitalFileAttachment[];
  courseModules?: CourseModuleItem[];
  ebookDetails?: {
    format: string;
    pageCount: number;
    previewExcerpt: string;
  };
  communityConfig?: CreatorCommunityConfig;
}

interface ProductCreationStudioProps {
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (product: CreatedProductData) => void;
  onSaveProduct?: (product: CreatedProductData) => void;
  onDelete?: (productId: string) => void;
  initialData?: Partial<CreatedProductData>;
  lang?: "fr" | "en";
  activeCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  companyName?: string;
}

const STOCK_PHOTOS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80",
];

export const ProductCreationStudio: React.FC<ProductCreationStudioProps> = ({
  onClose,
  onSave,
  onSaveProduct,
  onDelete,
  initialData,
  lang = "fr",
  activeCurrency,
  onCurrencyChange,
  companyName,
}) => {
  const handleSave = onSave || onSaveProduct || (() => {});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Nom de l'entreprise créatrice (non modifiable)
  const defaultSavedCompany = typeof window !== "undefined" ? getSavedCompanies()[0]?.name : "";
  const effectiveCompanyName =
    companyName ||
    initialData?.storeName ||
    defaultSavedCompany ||
    "Cadre financier";

  // Synchronized currency: inherited from active dashboard selection, initialData or persisted stored currency
  const initialCurrency: CurrencyCode =
    initialData?.currency || activeCurrency || getStoredCurrency();
  const [currentCurrency, setCurrentCurrency] = useState<CurrencyCode>(initialCurrency);

  // Stepper state: 'type_selection' or 'customize'
  const [studioStep, setStudioStep] = useState<"type_selection" | "customize">(
    initialData ? "customize" : "type_selection"
  );

  // 4 Core Product Sections
  const [productType, setProductType] = useState<ProductTypeCategory>(
    (initialData?.productType as ProductTypeCategory) || "membership"
  );

  // View mode switcher: desktop / mobile / member
  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "member">("mobile");

  // Preview write / preview tab state for description editor
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  // Parité mobile / bureau : bascule fluide entre formulaire et aperçu sans perte d'état
  const [mobileStudioTab, setMobileStudioTab] = useState<"editor" | "preview">("editor");

  // Single Synchronized Source of Truth for Offer Name & Title
  const [productName, setProductName] = useState(
    initialData?.name ||
      initialData?.title ||
      (productType === "membership"
        ? "Accès Club VIP Scalping"
        : productType === "digital"
        ? "Pack Templates & Ressources Digitales"
        : productType === "course"
        ? "Masterclass Pro & Cursus Vidéo"
        : "E-book : Guide Ultime du Créateur")
  );

  // Store/Enterprise Name (Locked to effective company name)
  const [storeName, setStoreName] = useState(effectiveCompanyName);

  useEffect(() => {
    if (effectiveCompanyName) {
      setStoreName(effectiveCompanyName);
    }
  }, [effectiveCompanyName]);

  // Product Description (fully synchronized between left form and right preview)
  const [productDescription, setProductDescription] = useState(
    initialData?.description ||
      (productType === "membership"
        ? "Rejoins le cercle privé : accès au Discord VIP + Telegram exclusif, ressources et fiches pratiques partagées chaque semaine, accompagnement et communauté active pour progresser ensemble."
        : productType === "digital"
        ? "Téléchargez immédiatement l'ensemble des fichiers sources, templates et outils numériques prêts à l'emploi dès la confirmation de votre commande."
        : productType === "course"
        ? "Accédez à un cursus complet de modules vidéo pas-à-pas avec exercices pratiques, fiches récapitulatives et mises à jour continues."
        : "Un livre numérique complet aux formats PDF haute qualité et ePub, optimisé pour liseuses (Kindle, Kobo), tablettes, smartphones et ordinateurs.")
  );

  // Tags
  const [tags, setTags] = useState<string[]>(
    productType === "membership"
      ? ["vip", "communauté", "discord", "telegram"]
      : productType === "digital"
      ? ["fichier", "téléchargement", "templates"]
      : productType === "course"
      ? ["formation", "vidéo", "cours"]
      : ["ebook", "guide", "pdf", "epub"]
  );
  const [tagInput, setTagInput] = useState("");
  const [collectShipping, setCollectShipping] = useState(false);

  // Base USD template prices
  const defaultBasePriceUSD =
    productType === "membership" ? 29 : productType === "ebook" ? 19 : productType === "course" ? 49 : 39;

  // Initial computed price amount converted to active currency
  const getInitialPriceAmount = (): string => {
    if (initialData?.priceAmount !== undefined) {
      if (initialData.currency && initialData.currency !== initialCurrency) {
        return formatConvertedNumericPrice(initialData.priceAmount, initialData.currency, initialCurrency);
      }
      return initialData.priceAmount.toString();
    }
    return formatConvertedNumericPrice(defaultBasePriceUSD, "USD", initialCurrency);
  };

  // Pricing state
  const [pricingType, setPricingType] = useState<"free" | "paid">(initialData?.pricingType || "paid");
  const [priceAmount, setPriceAmount] = useState<string>(getInitialPriceAmount());
  const [billingCycle, setBillingCycle] = useState<"one_time" | "monthly" | "yearly">(
    initialData?.billingCycle || (productType === "membership" ? "monthly" : "one_time")
  );

  // Multiple Pricing Options
  const initialNumericPrice = parseFloat(priceAmount) || 0;
  const initialCurrencyConfig = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;
  const [pricingOptions, setPricingOptions] = useState<PricingOption[]>(
    initialData?.pricingOptions || [
      {
        id: "plan-1",
        name: `${initialNumericPrice} ${initialCurrencyConfig.symbol} ${productType === "membership" ? "par mois" : "paiement unique"}`,
        price: initialNumericPrice,
        currency: currentCurrency,
        billing: productType === "membership" ? "monthly" : "one_time",
        subscribersCount: 0,
      },
    ]
  );
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-1");
  const [isAddingPricingOption, setIsAddingPricingOption] = useState(false);
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionPrice, setNewOptionPrice] = useState(
    formatConvertedNumericPrice(49, "USD", initialCurrency)
  );
  const [newOptionBilling, setNewOptionBilling] = useState<"monthly" | "yearly" | "one_time">("monthly");

  // Currency switcher with automatic conversion of configured prices and plans
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    if (newCurrency === currentCurrency) return;
    const oldCurrency = currentCurrency;

    // Convert main price
    const numericPrice = parseFloat(priceAmount);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      const convertedStr = formatConvertedNumericPrice(numericPrice, oldCurrency, newCurrency);
      setPriceAmount(convertedStr);
    }

    // Convert newOptionPrice
    const numericNewOpt = parseFloat(newOptionPrice);
    if (!isNaN(numericNewOpt) && numericNewOpt > 0) {
      const convertedOptStr = formatConvertedNumericPrice(numericNewOpt, oldCurrency, newCurrency);
      setNewOptionPrice(convertedOptStr);
    }

    // Convert existing pricing options
    const newConfig = SUPPORTED_CURRENCIES[newCurrency] || SUPPORTED_CURRENCIES.USD;
    setPricingOptions((prev) =>
      prev.map((opt) => {
        const convertedOptPrice = convertBetweenCurrencies(opt.price, oldCurrency, newCurrency);
        const roundedOptPrice =
          newConfig.decimals === 0
            ? Math.round(convertedOptPrice)
            : Math.round(convertedOptPrice * 100) / 100;
        return {
          ...opt,
          currency: newCurrency,
          price: roundedOptPrice,
          name: `${roundedOptPrice} ${newConfig.symbol} ${
            opt.billing === "monthly"
              ? "par mois"
              : opt.billing === "yearly"
              ? "par an"
              : opt.billing === "free"
              ? "(Accès gratuit)"
              : "paiement unique"
          }`,
        };
      })
    );

    setCurrentCurrency(newCurrency);
    setStoredCurrency(newCurrency);
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
  };

  // Keep plan-1 synced when main price, billing, or currency changes
  useEffect(() => {
    const numericPrice = parseFloat(priceAmount) || 0;
    const currencyConfig = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;
    const symbol = currencyConfig.symbol;
    const billingText =
      pricingType === "free"
        ? "Gratuit (Accès libre)"
        : billingCycle === "monthly"
        ? `${numericPrice} ${symbol} par mois`
        : billingCycle === "yearly"
        ? `${numericPrice} ${symbol} par an`
        : `${numericPrice} ${symbol} paiement unique`;

    setPricingOptions((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: "plan-1",
            name: billingText,
            price: numericPrice,
            currency: currentCurrency,
            billing: pricingType === "free" ? "free" : billingCycle,
            subscribersCount: 0,
          },
        ];
      }
      return prev.map((p, idx) =>
        idx === 0
          ? {
              ...p,
              name: billingText,
              price: numericPrice,
              currency: currentCurrency,
              billing: pricingType === "free" ? "free" : billingCycle,
            }
          : p
      );
    });
  }, [priceAmount, billingCycle, pricingType, currentCurrency]);

  // Digital files & E-book upload documents (Only default for ebook and digital type, empty for membership/course)
  const [digitalFiles, setDigitalFiles] = useState<DigitalFileAttachment[]>(
    initialData?.digitalFiles || (
      productType === "ebook"
        ? [
            {
              id: "file-ebook-1",
              name: "Guide_Ultime_Complet_2026.pdf",
              size: "18.4 MB",
              type: "application/pdf",
              isFreePreview: false,
            },
          ]
        : productType === "digital"
        ? [
            {
              id: "file-zip-1",
              name: "Pack_Ressources_Digitales_2026.zip",
              size: "42.8 MB",
              type: "archive/zip",
              isFreePreview: false,
            },
          ]
        : []
    )
  );
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Course modules
  const [courseModules, setCourseModules] = useState<CourseModuleItem[]>(
    initialData?.courseModules || [
      { id: "mod-1", title: "Module 1 : Fondations et prise en main", duration: "18 min" },
      { id: "mod-2", title: "Module 2 : Méthodologies avancées", duration: "34 min" },
      { id: "mod-3", title: "Module 3 : Cas concrets & Mise en pratique", duration: "25 min" },
    ]
  );

  // Ebook details
  const [pageCount, setPageCount] = useState(initialData?.ebookDetails?.pageCount || 96);
  const [ebookFormat, setEbookFormat] = useState(initialData?.ebookDetails?.format || "PDF & ePub");

  // 6 Official Valid Mansa Apps
  const VALID_MANSA_APPS = [
    "Espace Membre",
    "Discord",
    "Telegram",
    "Téléchargement instantané",
    "Fichiers & Documents",
    "Lecteur E-book interactif",
  ];

  // Helper to render official app icon
  const renderAppIcon = (appName: string, sizeClass = "size-3.5") => {
    switch (appName) {
      case "Discord":
      case "Communauté VIP Discord":
        return <DiscordIcon className={`${sizeClass} shrink-0`} />;
      case "Telegram":
      case "Canal privé Telegram":
        return <TelegramIcon className={`${sizeClass} shrink-0`} />;
      case "Téléchargement instantané":
        return <Zap className={`${sizeClass} text-amber-400 shrink-0`} />;
      case "Fichiers & Documents":
        return <FileText className={`${sizeClass} text-emerald-400 shrink-0`} />;
      case "Lecteur E-book interactif":
        return <BookOpen className={`${sizeClass} text-cyan-400 shrink-0`} />;
      case "Espace Membre":
        return <ShieldCheck className={`${sizeClass} text-purple-400 shrink-0`} />;
      default:
        return <CheckCircle2 className={`${sizeClass} text-[#3DDC84] shrink-0`} />;
    }
  };

  const sanitizeApps = (apps?: string[]): string[] => {
    if (!apps || apps.length === 0) return [];
    return apps.filter((a) => VALID_MANSA_APPS.includes(a));
  };

  // Règle stricte : Les étiquettes ou options ne doivent jamais être présélectionnées par défaut.
  // L'utilisateur doit obligatoirement faire un choix explicite.
  const [selectedApps, setSelectedApps] = useState<string[]>(() => {
    return initialData?.includedApps ? sanitizeApps(initialData.includedApps) : [];
  });

  // CTA Text
  const [ctaButtonText, setCtaButtonText] = useState(
    initialData?.ctaText ||
      (productType === "membership"
        ? "Rejoindre maintenant"
        : productType === "digital"
        ? "Télécharger maintenant"
        : productType === "course"
        ? "Accéder à la formation"
        : "Acheter l'e-book")
  );

  const [customUrl, setCustomUrl] = useState(
    initialData?.productUrl ||
      `mansa.app/mon-espace/${productName.toLowerCase().replace(/[^a-z0-9]/g, "-") || "mon-produit"}`
  );
  const [enableAffiliate, setEnableAffiliate] = useState(true);
  const [affiliateRate, setAffiliateRate] = useState(initialData?.affiliateRate || 30);
  const [storefrontVisible, setStorefrontVisible] = useState(true);
  const [isProductSettingsOpen, setIsProductSettingsOpen] = useState(false);
  const [isListedOnDiscover, setIsListedOnDiscover] = useState(true);

  // Images
  const [productImage, setProductImage] = useState<string | null>(
    initialData?.imageUrl || null
  );
  const [bannerImage, setBannerImage] = useState<string | null>(initialData?.bannerUrl || null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // FAQs (Fully editable from the preview & form)
  const [faqs, setFaqs] = useState<FaqItem[]>(
    initialData?.faqs || [
      {
        id: "faq-1",
        q: "Comment puis-je accéder à mon contenu après l'achat ?",
        a: "Dès la confirmation du paiement, vous recevez un accès immédiat avec invitations automatiques Discord & Telegram et vos fichiers sécurisés.",
      },
      {
        id: "faq-2",
        q: "Quels sont les moyens de paiement acceptés ?",
        a: "Cartes bancaires (Visa, Mastercard), Apple Pay, Google Pay ainsi que Mobile Money (Orange Money, Wave, MTN, Moov) selon votre pays.",
      },
    ]
  );
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-1");
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  // Configuration Bot & Communauté : aucune fausse présélection par défaut
  const [communityConfig, setCommunityConfig] = useState<CreatorCommunityConfig>(
    initialData?.communityConfig || {
      discordEnabled: false,
      discordServerId: "",
      discordServerName: "",
      discordRoleName: "",
      telegramEnabled: false,
      telegramChannelId: "",
      telegramChannelName: "",
    }
  );
  const [isBotSetupModalOpen, setIsBotSetupModalOpen] = useState(false);
  const [botModalTab, setBotModalTab] = useState<"discord" | "telegram">("telegram");

  // Handle product category switch
  const handleSelectProductType = (type: ProductTypeCategory) => {
    setProductType(type);
    // Pas de pré-sélection arbitraire d'applications lors du changement de type

    if (type === "digital") {
      const name = "Pack Templates & Ressources Digitales";
      setProductName(name);
      setProductDescription(
        "Téléchargez immédiatement tous les fichiers sources, templates et outils numériques prêts à l'emploi dès la confirmation de votre commande."
      );
      setBillingCycle("one_time");
      setCtaButtonText("Télécharger maintenant");
      setDigitalFiles([
        {
          id: "file-zip-1",
          name: "Templates_Pack_Pro_2026.zip",
          size: "34.5 MB",
          type: "archive/zip",
        },
      ]);
    } else if (type === "course") {
      const name = "Masterclass Pro & Cursus Vidéo";
      setProductName(name);
      setProductDescription(
        "Accédez à l'ensemble des modules de cours vidéo, exercices pratiques et suivi de progression pas-à-pas."
      );
      setBillingCycle("one_time");
      setCtaButtonText("Accéder à la formation");
      setDigitalFiles([]);
    } else if (type === "ebook") {
      const name = "E-book : Guide Pratique & Stratégies";
      setProductName(name);
      setProductDescription(
        "Un livre numérique complet aux formats PDF et ePub optimisé pour liseuse (Kindle, Kobo), tablette, smartphone et ordinateur."
      );
      setBillingCycle("one_time");
      setCtaButtonText("Acheter l'e-book");
      setDigitalFiles([
        {
          id: "file-ebook-pdf",
          name: "Guide_Pratique_Complet_2026.pdf",
          size: "16.8 MB",
          type: "application/pdf",
          isFreePreview: false,
        },
        {
          id: "file-ebook-epub",
          name: "Guide_Pratique_Version_ePub.epub",
          size: "8.2 MB",
          type: "application/epub+zip",
          isFreePreview: false,
        },
      ]);
    } else if (type === "membership") {
      const name = "Accès Club VIP Scalping";
      setProductName(name);
      setProductDescription(
        "Rejoins le cercle privé : accès au Discord VIP + Telegram exclusif, analyses régulières, méthode concrète, et communauté active pour échanger et progresser ensemble."
      );
      setBillingCycle("monthly");
      setCtaButtonText("Rejoindre maintenant");
      setDigitalFiles([]);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Upload file handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingFile(true);

    const newUploaded: DigitalFileAttachment[] = Array.from(files).map((f: File, i: number) => {
      const isAudio = f.type.startsWith("audio/") || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(f.name);
      return {
        id: "file-" + Date.now() + "-" + i,
        name: f.name,
        size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
        type: f.type || "application/octet-stream",
        isFreePreview: false,
        isAudio,
        audioPreviewSeconds: isAudio ? 30 : undefined,
      };
    });

    setTimeout(() => {
      setDigitalFiles((prev) => [...prev, ...newUploaded]);
      setIsUploadingFile(false);
    }, 400);
  };

  const handleAddAudioSample = () => {
    const sampleAudio: DigitalFileAttachment = {
      id: "audio-" + Date.now(),
      name: "Afrobeat_Lagos_Summer_Hit_Prod_Master.mp3",
      size: "9.4 MB",
      type: "audio/mpeg",
      isFreePreview: false,
      isAudio: true,
      audioPreviewSeconds: 30,
    };
    setDigitalFiles((prev) => [...prev, sampleAudio]);
  };

  const handleRemoveFile = (fileId: string) => {
    setDigitalFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Toggle App in membership
  const handleToggleApp = (appName: string) => {
    if (selectedApps.includes(appName)) {
      setSelectedApps(selectedApps.filter((a) => a !== appName));
    } else {
      setSelectedApps([...selectedApps, appName]);
    }
  };

  // FAQ Handlers
  const handleAddFaq = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newFaqQ.trim()) return;
    const newFaq: FaqItem = {
      id: "faq-" + Date.now(),
      q: newFaqQ.trim(),
      a: newFaqA.trim() || "Consultez notre support pour toute question.",
    };
    setFaqs([...faqs, newFaq]);
    setExpandedFaqId(newFaq.id);
    setNewFaqQ("");
    setNewFaqA("");
    setIsAddingFaq(false);
  };

  const handleRemoveFaq = (id: string) => {
    setFaqs(faqs.filter((f) => f.id !== id));
  };

  // Add pricing option
  const handleAddPricingOption = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(newOptionPrice) || 0;
    const currencyConfig = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;
    const symbol = currencyConfig.symbol;
    const name =
      newOptionName.trim() ||
      (newOptionBilling === "monthly"
        ? `${numeric} ${symbol} par mois`
        : newOptionBilling === "yearly"
        ? `${numeric} ${symbol} par an`
        : `${numeric} ${symbol} paiement unique`);

    const newOpt: PricingOption = {
      id: "plan-" + Date.now(),
      name,
      price: numeric,
      currency: currentCurrency,
      billing: newOptionBilling,
      subscribersCount: 0,
    };
    setPricingOptions([...pricingOptions, newOpt]);
    setSelectedPlanId(newOpt.id);
    setIsAddingPricingOption(false);
    setNewOptionName("");
  };

  // Final Submit
  const handleFinalSubmit = () => {
    const numericPrice = pricingType === "free" ? 0 : parseFloat(priceAmount) || 0;
    const currencyConfig = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;
    const symbol = currencyConfig.symbol;

    const formattedPrice =
      pricingType === "free"
        ? `0 ${symbol} gratuit`
        : billingCycle === "monthly"
        ? `${numericPrice} ${symbol} / mois`
        : billingCycle === "yearly"
        ? `${numericPrice} ${symbol} / an`
        : `${numericPrice} ${symbol} paiement unique`;

    const newProduct: CreatedProductData = {
      id: initialData?.id || "prod-" + Date.now(),
      productType,
      name: productName,
      title: productName,
      description: productDescription,
      storeName: effectiveCompanyName,
      priceDisplay: formattedPrice,
      priceAmount: numericPrice,
      currency: currentCurrency,
      pricingType,
      billingCycle,
      visibility: storefrontVisible ? "Visible" : "Caché",
      discoverStatus: isListedOnDiscover ? "Répertorié sur Discover" : "Non répertorié",
      includedApps: selectedApps,
      conversionRate: "-",
      totalRevenue: `0 ${symbol}`,
      activeUsers: 0,
      imageUrl: productImage || undefined,
      bannerUrl: bannerImage || undefined,
      productUrl: customUrl,
      affiliateRate: enableAffiliate ? affiliateRate : 0,
      ctaText: ctaButtonText,
      pricingOptions,
      faqs,
      digitalFiles: digitalFiles.length > 0 ? digitalFiles : undefined,
      courseModules: productType === "course" ? courseModules : undefined,
      ebookDetails:
        productType === "ebook"
          ? {
              format: ebookFormat,
              pageCount,
              previewExcerpt: "Aperçu de 10 pages inclus",
            }
          : undefined,
      communityConfig: communityConfig,
    };

    handleSave(newProduct);
  };

  // =========================================================================
  // STEP 1: PRODUCT FORMAT SELECTION
  // =========================================================================
  if (studioStep === "type_selection") {
    return (
      <ModalOverlay
        isOpen={true}
        onClose={onClose}
        contentClassName="max-w-3xl mx-auto"
      >
        <div className="relative w-full rounded-3xl border border-white/10 bg-[#0f1013] p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00D26A]">
                Création de Produit & Communauté
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Quel type d'offre souhaitez-vous créer ?
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. ADHÉSION & COMMUNAUTÉ */}
            <div
              onClick={() => handleSelectProductType("membership")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                productType === "membership"
                  ? "border-[#00D26A] bg-[#00D26A]/10"
                  : "border-white/10 bg-[#16181f] hover:border-white/20"
              }`}
            >
              <div className="space-y-3">
                <div className="size-11 rounded-xl bg-[#00D26A]/20 text-[#00D26A] flex items-center justify-center border border-[#00D26A]/30">
                  <Users className="size-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Adhésion & Communauté</span>
                    {productType === "membership" && <span className="text-[#00D26A]">✓</span>}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Créez votre club privé, communauté Discord/Telegram avec gestion d'abonnements et accès récurrents.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-[#00D26A] font-semibold flex items-center gap-1.5">
                <MessageCircle className="size-3.5" />
                <span>Discord VIP & Telegram automatisés</span>
              </div>
            </div>

            {/* 2. E-BOOK / GUIDE (UPLOAD DE FICHIERS / DOCUMENTS) */}
            <div
              onClick={() => handleSelectProductType("ebook")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                productType === "ebook"
                  ? "border-[#00D26A] bg-[#00D26A]/10"
                  : "border-white/10 bg-[#16181f] hover:border-white/20"
              }`}
            >
              <div className="space-y-3">
                <div className="size-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <BookOpen className="size-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>E-book / Guide</span>
                    {productType === "ebook" && <span className="text-[#00D26A]">✓</span>}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Publiez un guide, livre ou document (PDF, ePub) avec upload de fichier, extrait gratuit ou paiement.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span>Upload PDF/ePub & Téléchargement sécurisé</span>
              </div>
            </div>

            {/* 3. PRODUIT NUMÉRIQUE / FICHIERS */}
            <div
              onClick={() => handleSelectProductType("digital")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                productType === "digital"
                  ? "border-[#00D26A] bg-[#00D26A]/10"
                  : "border-white/10 bg-[#16181f] hover:border-white/20"
              }`}
            >
              <div className="space-y-3">
                <div className="size-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                  <FolderArchive className="size-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Fichiers & Ressources</span>
                    {productType === "digital" && <span className="text-[#00D26A]">✓</span>}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Vendez des templates, presets, logiciels, archives ZIP ou documents avec livraison immédiate post-achat.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-blue-400 font-semibold flex items-center gap-1.5">
                <Download className="size-3.5" />
                <span>Téléchargement instantané multi-fichiers</span>
              </div>
            </div>

            {/* 4. COURS OU FORMATION */}
            <div
              onClick={() => handleSelectProductType("course")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                productType === "course"
                  ? "border-[#00D26A] bg-[#00D26A]/10"
                  : "border-white/10 bg-[#16181f] hover:border-white/20"
              }`}
            >
              <div className="space-y-3">
                <div className="size-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                  <GraduationCap className="size-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center justify-between">
                    <span>Cours & Formations</span>
                    {productType === "course" && <span className="text-[#00D26A]">✓</span>}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Hébergez vos modules vidéo, chapitres, exercices et ressources d'apprentissage.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-purple-400 font-semibold flex items-center gap-1.5">
                <Layers className="size-3.5" />
                <span>Espace membre & vidéos sécurisées</span>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-end pt-4">
            <button
              onClick={() => setStudioStep("customize")}
              className="mansa-btn-green px-8 py-3.5 text-sm font-bold cursor-pointer flex items-center gap-2"
            >
              <span>Suivant : Configurer & Prévisualiser</span>
              <ArrowRight className="size-4" />
            </button>
          </div>

        </div>
      </ModalOverlay>
    );
  }

  // =========================================================================
  // STEP 2: STUDIO CUSTOMIZATION WITH FULL PREVIEW AND INLINE CONTROLS
  // =========================================================================
  const currencyConfig = SUPPORTED_CURRENCIES[currentCurrency] || SUPPORTED_CURRENCIES.USD;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#0b0c0e] text-[#eeeeee] font-sans antialiased overflow-hidden selection:bg-[#00D26A]/30 selection:text-[#00D26A]">
      
      {/* 1. TOP HEADER BAR */}
      <header className="flex h-14 w-full shrink-0 items-center justify-between border-b border-white/[0.08] bg-[#0f1013] px-4 sm:px-6">
        
        {/* Left: Close & Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fermer"
          >
            <X className="size-5" />
          </button>
          <span className="text-sm font-bold text-white">Modifier le produit</span>
        </div>

        {/* Center: Device Switcher */}
        <div className="flex items-center rounded-xl border border-white/10 bg-[#17181c] p-1 text-xs">
          <button
            onClick={() => setViewMode("desktop")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
              viewMode === "desktop"
                ? "bg-[#252830] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Monitor className={`size-3.5 ${viewMode === "desktop" ? "text-[#00D26A]" : "text-zinc-400"}`} />
            <span>Bureau</span>
          </button>

          <button
            onClick={() => setViewMode("mobile")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
              viewMode === "mobile"
                ? "bg-[#252830] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Smartphone className={`size-3.5 ${viewMode === "mobile" ? "text-[#00D26A]" : "text-zinc-400"}`} />
            <span>Mobile</span>
          </button>

          <button
            onClick={() => setViewMode("member")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
              viewMode === "member"
                ? "bg-[#252830] text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Users className="size-3.5 text-zinc-400" />
            <span>Vue membre</span>
          </button>
        </div>

        {/* Right: Currency Indicator & Save Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
            <span className="hidden sm:inline text-zinc-400 font-mono text-[11px]">Devise :</span>
            <CurrencySelector
              currentCurrency={currentCurrency}
              onSelectCurrency={(newCurr) => handleCurrencyChange(newCurr)}
              variant="pill"
              lang="fr"
            />
          </div>

          <button
            onClick={handleFinalSubmit}
            className="mansa-btn-green text-xs px-4 py-2 font-bold cursor-pointer flex items-center gap-1.5 shadow-lg"
          >
            <Check className="size-3.5" />
            <span>Enregistrer le produit</span>
          </button>
        </div>
      </header>

      {/* Mobile Parity Bar: Switch between Form Editor and Live Preview seamlessly */}
      <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-[#121316] border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0c0d10] border border-white/10 w-full">
          <button
            type="button"
            onClick={() => setMobileStudioTab("editor")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileStudioTab === "editor"
                ? "bg-[#00D26A] text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <FileText className="size-3.5" />
            <span>Formulaire complet</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileStudioTab("preview")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mobileStudioTab === "preview"
                ? "bg-[#00D26A] text-black shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Monitor className="size-3.5" />
            <span>Aperçu en direct</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN SPLIT WORKSPACE: LEFT FORM & RIGHT INTERACTIVE PREVIEW */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: EDIT PRODUCT DETAILS                                         */}
        {/* ========================================================================= */}
        <div className={`${mobileStudioTab === "editor" ? "flex" : "hidden sm:flex"} w-full sm:w-[420px] md:w-[460px] shrink-0 border-r border-white/[0.08] bg-[#0c0d10] flex-col justify-between overflow-y-auto p-5 space-y-6`}>
          
          <div className="space-y-6">
            
            {/* SECTION: DÉTAILS DU PRODUIT */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white">Détails</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Le nom que les acheteurs voient sur votre page produit.
                </p>
              </div>

              {/* Nom de l'offre */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    {lang === "fr" ? "Nom de l'offre" : "Offer name"} <span className="text-[#00D26A]">*</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">{productName.length} / 80</span>
                </div>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  maxLength={80}
                  placeholder={lang === "fr" ? "ex. Accès Club VIP Scalping, Formation Pro..." : "e.g. VIP Scalping Club Access..."}
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00D26A] transition-colors"
                  required
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-zinc-300">
                    Description du produit
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">{productDescription.length} caractères</span>
                </div>
                <textarea
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  rows={4}
                  placeholder="Expliquez ce qui est inclus dans cette offre..."
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] p-3 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00D26A] leading-relaxed resize-none"
                />
              </div>

              {/* Étiquettes */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <label className="text-[11px] font-semibold text-zinc-300">Étiquettes</label>
                    <HelpCircle className="size-3 text-zinc-500" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{tags.length} / 20</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-[#16181f] p-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-md bg-[#252832] px-2 py-0.5 text-[10px] font-mono text-zinc-300"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-red-400 cursor-pointer ml-0.5"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Tapez une étiquette et tapez Entrée"
                    className="flex-1 min-w-[140px] bg-transparent text-xs text-white placeholder-zinc-500 outline-none py-1 px-1"
                  />
                </div>
              </div>

            </div>

            {/* ========================================================================= */}
            {/* SECTION D'UPLOAD DE FICHIERS / DOCUMENTS (POUR E-BOOK, GUIDE & DIGITALS) */}
            {/* ========================================================================= */}
            {(selectedApps.includes("Fichiers & Documents") ||
              selectedApps.includes("Téléchargement instantané") ||
              productType === "ebook" ||
              productType === "digital" ||
              digitalFiles.length > 0) && (
              <div className="space-y-4 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Upload className="size-4 text-[#00D26A]" />
                      <span>Fichiers & Documents à Télécharger</span>
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {productType === "ebook"
                        ? "Uploadez votre e-book ou guide (PDF, ePub) téléchargeable après achat ou en accès gratuit."
                        : "Uploadez les fichiers numériques, guides ou documents inclus dans cette offre."}
                    </p>
                  </div>
                </div>

                {/* Upload Zone */}
                <div className="rounded-2xl border-2 border-dashed border-white/15 bg-[#14161f] p-4 text-center hover:border-[#00D26A]/50 transition-colors space-y-3">
                  <input
                    type="file"
                    id="file-upload-input"
                    multiple
                    accept=".pdf,.epub,.mobi,.zip,.rar,.docx,.xlsx,.mp4,.mp3,.wav,.ogg,.flac,.m4a,.png,.jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="flex flex-col items-center justify-center cursor-pointer space-y-2"
                  >
                    <div className="size-10 rounded-full bg-[#00D26A]/10 text-[#00D26A] flex items-center justify-center border border-[#00D26A]/20">
                      <Upload className="size-5" />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block">
                        Cliquez pour uploader ou glissez vos fichiers
                      </span>
                      <span className="text-[10px] text-zinc-400 block font-mono">
                        Musique (MP3, WAV avec écoute 30s), PDF, ePub, ZIP, Vidéo (jusqu'à 2 Go)
                      </span>
                    </div>
                    <span className="mansa-btn-green text-[11px] px-3.5 py-1 font-bold rounded-lg mt-1">
                      Parcourir les fichiers
                    </span>
                  </label>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleAddAudioSample}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00D26A]/10 hover:bg-[#00D26A]/20 text-[#00D26A] text-xs font-bold border border-[#00D26A]/30 cursor-pointer transition-all"
                    >
                      <Music className="size-3.5" />
                      <span>+ Ajouter un Beat / Fichier Prod (Extrait 30s)</span>
                    </button>
                  </div>
                </div>

                {/* E-book specific metadata */}
                {productType === "ebook" && (
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#161820] border border-white/10">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold">Nombre de pages</label>
                      <input
                        type="number"
                        value={pageCount}
                        onChange={(e) => setPageCount(parseInt(e.target.value) || 0)}
                        className="w-full rounded-lg bg-[#0f1014] border border-white/10 px-2.5 py-1.5 text-xs text-white outline-none focus:border-[#00D26A]"
                        placeholder="96"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-semibold">Format du guide</label>
                      <select
                        value={ebookFormat}
                        onChange={(e) => setEbookFormat(e.target.value)}
                        className="w-full rounded-lg bg-[#0f1014] border border-white/10 px-2 py-1.5 text-xs text-white outline-none cursor-pointer"
                      >
                        <option value="PDF & ePub">PDF & ePub</option>
                        <option value="PDF haute définition">PDF HD</option>
                        <option value="Kindle & ePub">Kindle & ePub</option>
                        <option value="Audio + PDF">Audiobook + PDF</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* List of uploaded files */}
                {digitalFiles.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-semibold text-zinc-300 block">
                      Fichiers rattachés ({digitalFiles.length}) :
                    </span>
                    {digitalFiles.map((file) => {
                      const isAudioFile = file.isAudio || /\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name);
                      return (
                        <div
                          key={file.id}
                          className={`p-3 rounded-xl border text-xs space-y-2 transition-all ${
                            isAudioFile
                              ? "bg-[#141822] border-[#00D26A]/30 shadow-sm"
                              : "bg-[#161820] border-white/10"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isAudioFile
                                    ? "bg-[#00D26A]/15 text-[#00D26A] border-[#00D26A]/30"
                                    : file.name.endsWith(".pdf")
                                    ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                                    : file.name.endsWith(".epub")
                                    ? "bg-purple-400/10 text-purple-400 border-purple-400/20"
                                    : "bg-blue-400/10 text-blue-400 border-blue-400/20"
                                }`}
                              >
                                {isAudioFile ? (
                                  <Music className="size-4" />
                                ) : file.name.endsWith(".pdf") ? (
                                  <FileText className="size-4" />
                                ) : file.name.endsWith(".epub") ? (
                                  <BookOpen className="size-4" />
                                ) : (
                                  <FolderArchive className="size-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <span className="font-semibold text-white truncate block text-[11px] max-w-[200px]">
                                  {file.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  {file.size} {isAudioFile && "• Extrait de 30s"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                  isAudioFile
                                    ? "bg-[#00D26A]/20 text-[#00D26A] border-[#00D26A]/30"
                                    : "bg-[#00D26A]/10 text-[#00D26A] border-[#00D26A]/20"
                                }`}
                              >
                                {isAudioFile ? "Extrait 30s actif" : "Prêt au téléchargement"}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(file.id)}
                                className="text-zinc-500 hover:text-red-400 cursor-pointer p-1 rounded hover:bg-white/5"
                                title="Supprimer le fichier"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* 30s Audio Player for audio files */}
                          {isAudioFile && (
                            <div className="pt-1">
                              <AudioPreview30sPlayer
                                title={file.name}
                                artist={storeName || "Créateur"}
                                variant="compact"
                                maxSeconds={file.audioPreviewSeconds || 30}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Apps checklist / selector */}
            <div className="space-y-2.5 pt-4 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-200 block">
                    Fonctionnalités additionnelles à inclure dans ce produit :
                  </span>
                  <span className="text-[10px] text-[#B6B5B0]">
                    {selectedApps.length} sélectionnée{selectedApps.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Telegram",
                    "Discord",
                    "Téléchargement instantané",
                    "Fichiers & Documents",
                    "Lecteur E-book interactif",
                    "Espace Membre",
                  ].map((app) => {
                    const isSelected = selectedApps.includes(app);
                    return (
                      <button
                        key={app}
                        type="button"
                        onClick={() => handleToggleApp(app)}
                        className={`text-xs p-2.5 rounded-xl border font-medium transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                          isSelected
                            ? "bg-[#3DDC84]/15 border-[#3DDC84] text-white"
                            : "bg-[#151515] border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {renderAppIcon(app, "size-4")}
                          <span className="truncate">{app}</span>
                        </div>
                        <div
                          className={`size-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#3DDC84] border-[#3DDC84] text-black"
                              : "border-zinc-600 bg-black/40 text-transparent"
                          }`}
                        >
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            {/* SECTION: TARIFICATION */}
            <div className="space-y-4 pt-3 border-t border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-white">Tarification</h3>
                <p className="text-[11px] text-[#B6B5B0] mt-0.5">
                  Choisissez comment les gens accèdent à ce produit.
                </p>
              </div>

              {/* Free vs Paid switch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPricingType("free")}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    pricingType === "free"
                      ? "border-[#3DDC84] bg-[#3DDC84]/15 text-white"
                      : "border-white/10 bg-[#151515] text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <span>Accès gratuit</span>
                  </span>
                  <span
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      pricingType === "free"
                        ? "border-[#3DDC84] bg-[#3DDC84]"
                        : "border-zinc-600"
                    }`}
                  >
                    {pricingType === "free" && <span className="size-1.5 rounded-full bg-black" />}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPricingType("paid")}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    pricingType === "paid"
                      ? "border-[#3DDC84] bg-[#3DDC84]/15 text-white"
                      : "border-white/10 bg-[#151515] text-zinc-400 hover:border-white/20"
                  }`}
                >
                  <span className="text-xs font-semibold flex items-center gap-2">
                    <span className="text-base">💲</span>
                    <span>Accès payant</span>
                  </span>
                  <span
                    className={`size-4 rounded-full border flex items-center justify-center ${
                      pricingType === "paid"
                        ? "border-[#3DDC84] bg-[#3DDC84]"
                        : "border-zinc-600"
                    }`}
                  >
                    {pricingType === "paid" && <span className="size-1.5 rounded-full bg-black" />}
                  </span>
                </button>
              </div>

              {/* Price configuration */}
              {pricingType === "paid" && (
                <div className="space-y-3 p-3.5 rounded-xl bg-[#151515] border border-white/10">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Fixed attached prefix to prevent overlapping characters like FCF20 */}
                    <div className="flex items-center rounded-xl border border-white/10 bg-[#000000] focus-within:border-[#3DDC84] overflow-hidden flex-1 transition-colors">
                      <span className="px-3.5 py-2.5 text-xs font-mono font-bold text-[#B6B5B0] bg-white/[0.04] border-r border-white/10 select-none whitespace-nowrap flex items-center justify-center shrink-0">
                        {currencyConfig.symbol}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={priceAmount}
                        onChange={(e) => setPriceAmount(e.target.value)}
                        placeholder="20"
                        className="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-white outline-none placeholder:text-zinc-600"
                      />
                    </div>

                    <select
                      value={billingCycle}
                      onChange={(e) => setBillingCycle(e.target.value as any)}
                      className="rounded-xl border border-white/10 bg-[#000000] px-3.5 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#3DDC84] cursor-pointer hover:border-white/20 transition-colors shrink-0"
                    >
                      <option value="monthly">par mois</option>
                      <option value="yearly">par an</option>
                      <option value="one_time">paiement unique</option>
                    </select>
                  </div>
                </div>
              )}

              {/* List of active pricing options */}
              <div className="space-y-2">
                {pricingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedPlanId(opt.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedPlanId === opt.id
                        ? "border-[#3DDC84] bg-[#3DDC84]/10 text-white"
                        : "border-white/10 bg-[#151515] text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{opt.name}</span>
                      <span className="text-[10px] text-[#B6B5B0] font-mono">👤 {opt.subscribersCount}</span>
                    </div>
                    <span className="text-[#B6B5B0]">›</span>
                  </div>
                ))}

                {/* Add new pricing option button */}
                {!isAddingPricingOption ? (
                  <button
                    type="button"
                    onClick={() => setIsAddingPricingOption(true)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-white/15 bg-white/5 hover:bg-white/10 hover:border-[#3DDC84]/40 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="size-3.5 text-[#3DDC84]" />
                    <span>+ Nouvelle option de tarification</span>
                  </button>
                ) : (
                  <form onSubmit={handleAddPricingOption} className="p-3 rounded-xl bg-[#151515] border border-white/10 space-y-2.5">
                    <input
                      type="text"
                      value={newOptionName}
                      onChange={(e) => setNewOptionName(e.target.value)}
                      placeholder="Nom de l'option (ex: Accès Annuel VIP)"
                      className="w-full rounded-xl border border-white/10 bg-[#000000] px-3 py-2 text-xs text-white outline-none focus:border-[#3DDC84]"
                    />
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex items-center rounded-xl border border-white/10 bg-[#000000] focus-within:border-[#3DDC84] overflow-hidden flex-1">
                        <span className="px-3 py-2 text-xs font-mono font-bold text-[#B6B5B0] bg-white/[0.04] border-r border-white/10 select-none whitespace-nowrap">
                          {currencyConfig.symbol}
                        </span>
                        <input
                          type="number"
                          step="any"
                          value={newOptionPrice}
                          onChange={(e) => setNewOptionPrice(e.target.value)}
                          placeholder="Prix"
                          className="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-white outline-none"
                        />
                      </div>
                      <select
                        value={newOptionBilling}
                        onChange={(e) => setNewOptionBilling(e.target.value as any)}
                        className="rounded-xl border border-white/10 bg-[#000000] px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-[#3DDC84] shrink-0"
                      >
                        <option value="monthly">par mois</option>
                        <option value="yearly">par an</option>
                        <option value="one_time">une fois</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsAddingPricingOption(false)}
                        className="px-3 py-1.5 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="mansa-btn-green px-4 py-1.5 text-xs font-bold cursor-pointer"
                      >
                        Ajouter l'option
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* SECTION: FAQ BUILDER */}
            <div className="space-y-4 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Questions fréquemment posées (FAQ)</h3>
                  <p className="text-[11px] text-zinc-400">Rassurez vos clients avec des réponses claires.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingFaq(true)}
                  className="text-xs text-[#00D26A] font-semibold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="space-y-2">
                {faqs.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-[#161820] border border-white/10 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{f.q}</span>
                      <button
                        onClick={() => handleRemoveFaq(f.id)}
                        className="text-zinc-500 hover:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{f.a}</p>
                  </div>
                ))}

                {isAddingFaq && (
                  <form onSubmit={handleAddFaq} className="p-3 rounded-xl bg-[#181a22] border border-[#00D26A]/40 space-y-2.5">
                    <input
                      type="text"
                      value={newFaqQ}
                      onChange={(e) => setNewFaqQ(e.target.value)}
                      placeholder="Question (ex: Comment recevoir mes accès ?)"
                      className="w-full rounded-lg border border-white/10 bg-[#101116] px-3 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                      autoFocus
                    />
                    <textarea
                      value={newFaqA}
                      onChange={(e) => setNewFaqA(e.target.value)}
                      rows={2}
                      placeholder="Réponse détaillée..."
                      className="w-full rounded-lg border border-white/10 bg-[#101116] px-3 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingFaq(false)}
                        className="px-3 py-1 text-xs text-zinc-400 hover:text-white cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="mansa-btn-green px-3 py-1 text-xs font-bold cursor-pointer"
                      >
                        Enregistrer FAQ
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* SECTION: PARAMÈTRES AVANCÉS */}
            <div className="space-y-4 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsProductSettingsOpen(!isProductSettingsOpen)}
                className="w-full flex items-center justify-between text-left cursor-pointer"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Paramètres avancés</h3>
                  <p className="text-[11px] text-zinc-400">Bouton d'achat, affiliation, visibilité Discover.</p>
                </div>
                {isProductSettingsOpen ? <ChevronUp className="size-4 text-zinc-400" /> : <ChevronDown className="size-4 text-zinc-400" />}
              </button>

              {isProductSettingsOpen && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-zinc-300">Texte du bouton d'action</label>
                    <input
                      type="text"
                      value={ctaButtonText}
                      onChange={(e) => setCtaButtonText(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#16181f] px-3 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-zinc-300 font-medium">Répertorier sur Discover</span>
                    <button
                      type="button"
                      onClick={() => setIsListedOnDiscover(!isListedOnDiscover)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        isListedOnDiscover ? "bg-[#00D26A]" : "bg-[#252830]"
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition ${
                          isListedOnDiscover ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-zinc-300 font-medium">Programme d'affiliation (30%)</span>
                    <button
                      type="button"
                      onClick={() => setEnableAffiliate(!enableAffiliate)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                        enableAffiliate ? "bg-[#00D26A]" : "bg-[#252830]"
                      }`}
                    >
                      <span
                        className={`inline-block size-4 transform rounded-full bg-white transition ${
                          enableAffiliate ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Sticky Bottom Save Button & Actions */}
          <div className="pt-4 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="mansa-btn-green w-full py-3.5 text-sm font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="size-4" />
              <span>Enregistrer le produit</span>
            </button>

            {initialData?.id && onDelete && (
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>{lang === "fr" ? "Supprimer définitivement ce produit" : "Permanently delete this product"}</span>
              </button>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (MOBILE / DESKTOP / MEMBER)       */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden bg-[#07080a] p-4 sm:p-8 pb-36 flex flex-col items-center justify-start">
          
          {/* ======================================================================= */}
          {/* 1. MOBILE PREVIEW FRAME (EXACT MATCH REQUESTED BY USER - NEVER CHANGED) */}
          {/* ======================================================================= */}
          {viewMode === "mobile" && (
            <div className="w-full max-w-[420px] rounded-[36px] border-[6px] border-[#1f2128] bg-[#0c0d10] p-4 sm:p-5 shadow-2xl space-y-5 my-2 sm:my-4 shrink-0">
              
              {/* Top enterprise bar: icon + Enterprise Name + Paramètres */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-[#00D26A]/20 text-[#00D26A] flex items-center justify-center font-bold text-xs border border-[#00D26A]/30">
                    {productType === "ebook" ? "📖" : productType === "membership" ? "👑" : "📈"}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm" title="Entreprise créatrice (non modifiable)">
                      {effectiveCompanyName}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsProductSettingsOpen(!isProductSettingsOpen)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  <SettingsIcon className="size-3.5" />
                  <span>Paramètres</span>
                </button>
              </div>

              {/* Media Card: Video / Photo upload box */}
              <div className="relative rounded-2xl border border-white/10 bg-[#14151a] overflow-hidden group">
                {productImage ? (
                  <div className="relative h-56 w-full">
                    <img src={productImage} alt="Product" className="size-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => setIsStockModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-white/20 text-xs font-semibold text-white hover:bg-white/30 backdrop-blur-sm cursor-pointer"
                      >
                        Changer
                      </button>
                      <button
                        onClick={() => setProductImage(null)}
                        className="p-1.5 rounded-lg bg-red-500 text-white cursor-pointer"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center space-y-2.5">
                    <div className="size-10 rounded-full bg-[#1e2028] flex items-center justify-center text-zinc-400">
                      <ImageIcon className="size-5 text-[#00D26A]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">
                        Ajoutez votre première vidéo ou photo de produit
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-light">
                        Cela devrait illustrer quelque chose à propos du produit.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <label className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold cursor-pointer">
                        <Upload className="size-3" />
                        <span>Télécharger</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setProductImage(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsStockModalOpen(true)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/10 bg-[#1c1e26] hover:bg-[#252834] text-xs font-semibold text-zinc-300 cursor-pointer"
                      >
                        <ImageIcon className="size-3" />
                        <span>Photos de stock gratuites</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Offer Title (Directly Editable & Synced with left form!) */}
              <div className="space-y-1">
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Nom de l'offre..."
                  className="w-full bg-transparent text-lg sm:text-xl font-black text-white outline-none border-b border-transparent focus:border-[#00D26A] pb-1 hover:border-white/20 transition-colors"
                  title="Modifier le nom de l'offre"
                />

                {/* Price Display */}
                <div className="text-sm font-bold text-white font-mono">
                  {pricingType === "free"
                    ? "Gratuit"
                    : `${priceAmount} ${currencyConfig.symbol} / ${billingCycle === "monthly" ? "mois" : billingCycle === "yearly" ? "an" : "paiement unique"}`}
                </div>
              </div>

              {/* Pricing Options Selector (Interactive) */}
              <div className="space-y-2">
                {pricingOptions.map((opt) => (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedPlanId(opt.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                      selectedPlanId === opt.id
                        ? "border-[#00D26A] bg-[#16221c] text-white shadow-sm"
                        : "border-white/10 bg-[#14161d] text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span>{opt.name}</span>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-[11px] font-mono">👤 {opt.subscribersCount}</span>
                      <span className="text-zinc-500 font-bold">›</span>
                    </div>
                  </div>
                ))}

                {/* Add pricing option inside preview */}
                <button
                  type="button"
                  onClick={() => setIsAddingPricingOption(true)}
                  className="w-full py-2.5 rounded-2xl border border-dashed border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="size-3.5 text-[#00D26A]" />
                  <span>+ Nouvelle option de tarification</span>
                </button>
              </div>

              {/* Big CTA Button (e.g. Rejoindre maintenant) */}
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full py-3.5 rounded-2xl bg-[#0066FF] hover:bg-[#0055EE] text-white font-extrabold text-sm shadow-xl transition-all cursor-pointer"
              >
                {ctaButtonText || "Rejoindre maintenant"}
              </button>

              {digitalFiles.length > 0 &&
                (selectedApps.includes("Fichiers & Documents") ||
                  selectedApps.includes("Téléchargement instantané") ||
                  productType === "ebook" ||
                  productType === "digital") && (
                <div className="p-3.5 rounded-2xl bg-[#14161d] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Download className="size-3.5 text-[#00D26A]" />
                      <span>Fichiers inclus ({digitalFiles.length})</span>
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">Téléchargement immédiat</span>
                  </div>
                  <div className="space-y-1.5">
                    {digitalFiles.map((file) => {
                      const isAudioFile = file.isAudio || /\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name);
                      return (
                        <div key={file.id} className="p-2.5 rounded-xl bg-[#1c1e28] text-[11px] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="truncate max-w-[180px] text-zinc-200 font-medium flex items-center gap-1.5">
                              {isAudioFile ? <Music className="size-3 text-[#00D26A]" /> : <span>📄</span>}
                              {file.name}
                            </span>
                            <span className="text-zinc-400 font-mono text-[10px]">{file.size}</span>
                          </div>
                          {isAudioFile && (
                            <AudioPreview30sPlayer
                              title={file.name}
                              artist={storeName || "Créateur"}
                              variant="compact"
                              maxSeconds={file.audioPreviewSeconds || 30}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description Block with [Écrire] / [Aperçu] tabs */}
              <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-300">À propos du produit</span>
                  <div className="flex items-center rounded-lg bg-[#181a22] border border-white/10 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setDescTab("write")}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-all ${
                        descTab === "write" ? "bg-[#282b36] text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Écrire
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab("preview")}
                      className={`px-2 py-0.5 rounded font-semibold cursor-pointer transition-all ${
                        descTab === "preview" ? "bg-[#282b36] text-white" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Aperçu
                    </button>
                  </div>
                </div>

                {descTab === "write" ? (
                  <textarea
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    rows={4}
                    placeholder="Écrivez la description détaillée de votre offre..."
                    className="w-full rounded-2xl border border-white/10 bg-[#14161d] p-3 text-xs text-zinc-200 placeholder-zinc-500 outline-none focus:border-[#00D26A] leading-relaxed resize-none"
                  />
                ) : (
                  <div className="p-3.5 rounded-2xl border border-white/10 bg-[#14161d] text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                    {productDescription || "Aucune description fournie pour le moment."}
                  </div>
                )}
              </div>

              {/* Questions fréquemment posées (FAQ Section inside Preview) */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">Questions fréquemment posées</h4>
                </div>

                <div className="space-y-2">
                  {faqs.map((faq) => {
                    const isExpanded = expandedFaqId === faq.id;
                    return (
                      <div
                        key={faq.id}
                        className="rounded-2xl border border-white/10 bg-[#14161d] p-3 space-y-1.5 transition-all"
                      >
                        <div
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="flex items-center justify-between cursor-pointer text-xs font-semibold text-white"
                        >
                          <span>{faq.q}</span>
                          <span className="text-zinc-500 font-bold text-sm">{isExpanded ? "−" : "+"}</span>
                        </div>
                        {isExpanded && (
                          <div className="text-[11px] text-zinc-400 pt-1 border-t border-white/5 leading-relaxed font-light">
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Add FAQ inside preview */}
                  <button
                    type="button"
                    onClick={() => setIsAddingFaq(true)}
                    className="w-full py-3 rounded-2xl border border-white/10 bg-[#14161d] hover:bg-[#1c1e28] text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-between px-4"
                  >
                    <span>Ajouter FAQ</span>
                    <Plus className="size-4 text-zinc-400" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* 2. TRUE DESKTOP PREVIEW LAYOUT (FIXED: WIDE STOREFRONT WITH SIDEBAR)   */}
          {/* ======================================================================= */}
          {viewMode === "desktop" && (
            <div className="w-full max-w-5xl rounded-2xl border border-white/15 bg-[#0e1015] shadow-2xl overflow-hidden my-2 sm:my-6 shrink-0 animate-in fade-in duration-200">
              
              {/* Desktop Store Top Bar */}
              <div className="bg-[#14161d] border-b border-white/10 px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-[#00D26A]/20 text-[#00D26A] flex items-center justify-center font-bold text-sm border border-[#00D26A]/30">
                    {productType === "ebook" ? "📖" : productType === "membership" ? "👑" : "📈"}
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">{effectiveCompanyName}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Entreprise créatrice</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-1 font-mono text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded">
                    <Star className="size-3 fill-amber-400" />
                    <span>4.9 / 5.0 (184 avis)</span>
                  </div>
                  <button className="flex items-center gap-1 hover:text-white px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <Share2 className="size-3.5" />
                    <span>Partager</span>
                  </button>
                </div>
              </div>

              {/* Desktop 2-Column Storefront */}
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT MAIN CONTENT (8 COLS) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Hero Media Showcase */}
                  <div className="relative rounded-2xl border border-white/10 bg-[#151720] overflow-hidden group">
                    {productImage ? (
                      <div className="relative h-72 w-full">
                        <img src={productImage} alt="Product" className="size-full object-cover" />
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-[#00D26A] flex items-center gap-1 border border-white/10">
                          <Zap className="size-3" />
                          <span>Accès instantané 24/7</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-10 text-center space-y-3">
                        <div className="size-12 rounded-full bg-[#1e2028] flex items-center justify-center text-zinc-400">
                          <ImageIcon className="size-6 text-[#00D26A]" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white">
                            Visuel principal de votre produit
                          </h4>
                          <p className="text-xs text-zinc-400 font-light">
                            Uploadez une image percutante ou choisissez une photo gratuite.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsStockModalOpen(true)}
                          className="mansa-btn-green text-xs px-4 py-2 font-bold cursor-pointer"
                        >
                          Choisir une image de stock
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Title & Headline */}
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                      {productName}
                    </h1>
                  </div>

                  {/* Uploaded Files Section (for E-books and digital items) */}
                  {digitalFiles.length > 0 &&
                    (selectedApps.includes("Fichiers & Documents") ||
                      selectedApps.includes("Téléchargement instantané") ||
                      productType === "ebook" ||
                      productType === "digital") && (
                    <div className="p-5 rounded-2xl bg-[#14161f] border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Download className="size-4 text-[#00D26A]" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                            Documents et Fichiers à Télécharger
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono text-[#00D26A] bg-[#00D26A]/10 px-2 py-0.5 rounded">
                          {digitalFiles.length} fichier(s) prêt(s)
                        </span>
                      </div>

                      <div className="space-y-2">
                        {digitalFiles.map((file) => {
                          const isAudioFile = file.isAudio || /\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name);
                          return (
                            <div
                              key={file.id}
                              className="p-3 rounded-xl bg-[#1a1d27] border border-white/5 text-xs space-y-2.5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  {isAudioFile ? (
                                    <div className="size-7 rounded-lg bg-[#00D26A]/10 text-[#00D26A] flex items-center justify-center border border-[#00D26A]/20">
                                      <Music className="size-3.5" />
                                    </div>
                                  ) : (
                                    <FileCheck className="size-4 text-[#00D26A]" />
                                  )}
                                  <div>
                                    <span className="font-bold text-white block">{file.name}</span>
                                    <span className="text-[10px] text-zinc-400 font-mono">
                                      {file.size} {isAudioFile ? "· Écoute 30s disponible" : "· Accès sécurisé"}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-[11px] font-bold text-[#00D26A]">
                                  {isAudioFile ? "Extrait 30s" : "Téléchargement instantané"}
                                </span>
                              </div>
                              {isAudioFile && (
                                <AudioPreview30sPlayer
                                  title={file.name}
                                  artist={storeName || "Créateur"}
                                  variant="full"
                                  maxSeconds={file.audioPreviewSeconds || 30}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Full Product Description */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      À propos de cette offre
                    </h3>
                    <div className="p-5 rounded-2xl bg-[#14161f] border border-white/10 text-xs text-zinc-300 leading-relaxed font-light whitespace-pre-wrap">
                      {productDescription || "Description détaillée de l'offre."}
                    </div>
                  </div>

                  {/* FAQ Accordion */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Questions fréquemment posées
                    </h3>
                    <div className="space-y-2">
                      {faqs.map((faq) => {
                        const isExpanded = expandedFaqId === faq.id;
                        return (
                          <div
                            key={faq.id}
                            className="rounded-2xl border border-white/10 bg-[#14161f] p-4 space-y-2 transition-all"
                          >
                            <div
                              onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                              className="flex items-center justify-between cursor-pointer text-xs font-bold text-white"
                            >
                              <span>{faq.q}</span>
                              <span className="text-[#00D26A] font-bold">{isExpanded ? "−" : "+"}</span>
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

                {/* RIGHT STICKY SIDEBAR (5 COLS) - CHECKOUT & PRICING CARD */}
                <div className="lg:col-span-5 space-y-5">
                  <div className="sticky top-4 rounded-3xl border border-white/15 bg-[#14161f] p-6 shadow-2xl space-y-5">
                    
                    {/* Price Header */}
                    <div className="space-y-1 pb-3 border-b border-white/10">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 block">
                        {pricingType === "free" ? "Accès Libre" : "Tarif Officiel"}
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-white font-mono">
                          {pricingType === "free"
                            ? "0 € Gratuit"
                            : `${priceAmount} ${currencyConfig.symbol}`}
                        </span>
                        {pricingType === "paid" && (
                          <span className="text-xs text-zinc-400 font-mono">
                            / {billingCycle === "monthly" ? "mois" : billingCycle === "yearly" ? "an" : "paiement unique"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Plan Options Selector */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-300 block">
                        Choisissez votre formule :
                      </label>
                      {pricingOptions.map((opt) => (
                        <div
                          key={opt.id}
                          onClick={() => setSelectedPlanId(opt.id)}
                          className={`p-3.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                            selectedPlanId === opt.id
                              ? "border-[#00D26A] bg-[#00D26A]/10 text-white shadow-md"
                              : "border-white/10 bg-[#1b1e2a] text-zinc-300 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`size-3 rounded-full border flex items-center justify-center ${
                              selectedPlanId === opt.id ? "border-[#00D26A] bg-[#00D26A]" : "border-zinc-500"
                            }`}>
                              {selectedPlanId === opt.id && <span className="size-1 rounded-full bg-black" />}
                            </span>
                            <span>{opt.name}</span>
                          </div>
                          <span className="font-mono font-bold text-white">
                            {opt.price} {currencyConfig.symbol}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Main CTA Button */}
                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      className="w-full py-4 rounded-2xl bg-[#0066FF] hover:bg-[#0055EE] text-white font-black text-base shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>{ctaButtonText || "Rejoindre maintenant"}</span>
                      <ArrowRight className="size-4" />
                    </button>

                    {/* Security & Features Checklist */}
                    <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="size-4 text-[#00D26A] shrink-0" />
                        <span>Paiement sécurisé par carte & Mobile Money</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="size-4 text-[#00D26A] shrink-0" />
                        <span>Livraison automatique et accès immédiat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Lock className="size-4 text-[#00D26A] shrink-0" />
                        <span>Annulation en 1-clic sans engagement</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ======================================================================= */}
          {/* 3. MEMBER VIEW: HOW BUYERS SEE CONTENT AFTER PURCHASE                   */}
          {/* ======================================================================= */}
          {viewMode === "member" && (
            <div className="w-full max-w-2xl rounded-3xl border border-[#00D26A]/30 bg-[#0c120f] p-6 sm:p-8 space-y-6 shadow-2xl my-2 sm:my-6 shrink-0 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-[#00D26A]/20 text-[#00D26A] flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase text-[#00D26A] font-bold block">
                      Membre Actif · Accès Débloqué
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-white">{productName}</h3>
                  </div>
                </div>
                <span className="text-xs text-zinc-400 font-mono">Statut : Validé</span>
              </div>

              {/* Community accesses */}
              {(productType === "membership" || selectedApps.some(a => a.includes("Discord") || a.includes("Telegram"))) && (
                <div className="p-5 rounded-2xl bg-[#121c17] border border-[#00D26A]/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <MessageCircle className="size-4 text-[#00D26A]" />
                    <span>Vos accès communautaires débloqués</span>
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#17251e] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <DiscordIcon className="size-4 shrink-0" />
                        <span className="font-semibold text-white">Serveur VIP Discord</span>
                      </div>
                      <button className="mansa-btn-green px-3 py-1 text-xs font-bold cursor-pointer">
                        Rejoindre le Discord
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#17251e] border border-white/5 text-xs">
                      <div className="flex items-center gap-2">
                        <TelegramIcon className="size-4 shrink-0" />
                        <span className="font-semibold text-white">Canal d'alertes Telegram</span>
                      </div>
                      <button className="mansa-btn-green px-3 py-1 text-xs font-bold cursor-pointer">
                        Ouvrir Telegram
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Digital files downloads */}
              {digitalFiles.length > 0 && (
                <div className="p-5 rounded-2xl bg-[#121c17] border border-[#00D26A]/30 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <Download className="size-4 text-[#00D26A]" />
                    <span>Téléchargements immédiats de vos documents</span>
                  </h4>
                  {digitalFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-[#17251e] text-xs">
                      <div className="flex items-center gap-2">
                        <FolderArchive className="size-4 text-[#00D26A]" />
                        <span className="font-semibold text-white">{file.name}</span>
                      </div>
                      <button className="mansa-btn-green px-3 py-1 text-xs font-bold cursor-pointer">
                        Télécharger ({file.size})
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-4 rounded-xl bg-white/5 text-xs text-zinc-300">
                <span className="font-bold text-white block mb-1">Description et instructions :</span>
                {productDescription}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* STOCK PHOTOS MODAL */}
      <ModalOverlay
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        contentClassName="max-w-xl mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white">Sélectionner une photo de stock</h3>
            <button
              onClick={() => setIsStockModalOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
            {STOCK_PHOTOS.map((url, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setProductImage(url);
                  setBannerImage(url);
                  setIsStockModalOpen(false);
                }}
                className="relative h-28 rounded-xl overflow-hidden border border-white/10 hover:border-[#00D26A] cursor-pointer group transition-all"
              >
                <img src={url} alt="Stock" className="size-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white">
                  Choisir
                </div>
              </div>
            ))}
          </div>
        </div>
      </ModalOverlay>

      {/* CREATOR BOT SETUP MODAL */}
      <CreatorBotSetupModal
        isOpen={isBotSetupModalOpen}
        onClose={() => setIsBotSetupModalOpen(false)}
        initialConfig={communityConfig}
        onSaveConfig={(newConfig) => setCommunityConfig(newConfig)}
        productName={productName}
        initialTab={botModalTab}
        platformMode={botModalTab}
      />

      {/* CONFIRM PRODUCT DELETION MODAL */}
      {isDeleteModalOpen && initialData?.id && onDelete && (
        <ConfirmActionModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            onDelete(initialData.id!);
            setIsDeleteModalOpen(false);
            onClose();
          }}
          title={lang === "fr" ? "Supprimer définitivement ce produit ?" : "Permanently delete this product?"}
          description={
            lang === "fr"
              ? `Êtes-vous certain de vouloir supprimer le produit "${productName || initialData.name}" ? Toutes ses automatisations et pages de vente associées cesseront immédiatement de fonctionner.`
              : `Are you sure you want to delete "${productName || initialData.name}"?`
          }
          itemName={productName || initialData.name || "Produit"}
          itemType={lang === "fr" ? "Produit créateur" : "Creator Product"}
          itemDetails={[
            { label: "Nom du produit", value: productName || initialData.name || "Sans titre" },
            { label: "Tarif configuré", value: `${priceAmount} ${SUPPORTED_CURRENCIES[currentCurrency]?.symbol || "€"}` },
          ]}
          confirmButtonText={lang === "fr" ? "Supprimer le produit" : "Delete Product"}
          cancelButtonText={lang === "fr" ? "Annuler" : "Cancel"}
          variant="danger"
          lang={lang}
        />
      )}

    </div>
  );
};
