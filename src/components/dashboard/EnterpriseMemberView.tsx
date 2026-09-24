import React, { useState } from "react";
import {
  Home,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  QrCode,
  Sparkles,
  HelpCircle,
  Clock,
  Zap,
  Lock,
  Unlock,
  Download,
  Users,
  Send,
  AlertCircle,
  Radio,
  Share2,
  Link2,
  MapPin,
  User,
  MoreHorizontal,
  Pin,
  Heart,
  MessageCircle,
  Star,
  Calendar,
  ThumbsUp,
  FileText,
  SlidersHorizontal,
  Menu,
  X,
  Bookmark,
  Search,
  RefreshCw,
  Compass,
  Plus,
  ShoppingBag,
  Package,
  Camera,
  Building2,
  MoreVertical,
  Flag,
  BookOpen,
  GraduationCap,
  Eye,
  EyeOff,
  TrendingUp,
  Layers,
  PenLine,
  Image as ImageIcon,
  Smile,
  BarChart3,
  DollarSign,
  Video,
  LayoutDashboard,
  Trash2,
} from "lucide-react";
import { EnterpriseSubscription, TelegramChannelItem, DiscordChannelItem } from "../../types";
import { ConnectedAppsView, TelegramIcon, DiscordIcon } from "./ConnectedAppsView";
import { OfferCheckoutModal, CreatorPlatformOffer } from "./OfferCheckoutModal";
import { PLATFORM_CREATOR_OFFERS } from "./DiscoverCreatorsView";
import {
  saveSubscription,
  updateSubscriptionBranding,
  removeSubscription,
  cancelActiveSubscription,
} from "../../utils/subscriptionsStorage";
import {
  getMemberAuthorizedTelegramChannels,
  getMemberAuthorizedDiscordChannels,
  getMemberAuthorizedEbooks,
  getMemberAuthorizedCourses,
  getOffersForCompany,
  normalizeUnlockedOfferIds,
  verifyMemberResourceAccess,
  EbookResourceItem,
  CourseResourceItem,
} from "../../utils/rightsAccessEngine";
import {
  getPostsForCompany,
  createCompanyPost,
  deleteCompanyPost,
  getAllStoredPosts,
  saveAllPosts,
  CompanyPost,
} from "../../utils/companyPostsStorage";
import { updateCompanyBranding, getSavedCompanies } from "../../utils/companyStorage";
import { EnterpriseBrandingModal } from "./EnterpriseBrandingModal";
import { ManageMembershipModal } from "./ManageMembershipModal";
import { ReportEnterpriseModal } from "./ReportEnterpriseModal";
import logoImg from "../../assets/images/afhub_logo_africa_1787956612844.jpg";

interface EnterpriseMemberViewProps {
  subscription: EnterpriseSubscription;
  lang: "fr" | "en";
  onBackToPersonal?: () => void;
  allSubscriptions?: EnterpriseSubscription[];
  onSelectSubscription?: (subId: string) => void;
  creatorCompanies?: any[];
  onSelectCreatorCompany?: (comp: any) => void;
  user?: { uid?: string; name: string; email: string; avatarInitials?: string };
  onOpenMarketplace?: () => void;
  onSeedSimulationData?: () => void;
  onOpenCreatorDashboard?: () => void;
  onOpenCreatorAssistance?: () => void;
  onCreateProduct?: () => void;
  onOpenCreatorApplications?: () => void;
}

export const EnterpriseMemberView: React.FC<EnterpriseMemberViewProps> = ({
  subscription,
  lang,
  onBackToPersonal,
  allSubscriptions = [],
  onSelectSubscription,
  creatorCompanies = [],
  onSelectCreatorCompany,
  user = { name: "Johan Désiré", email: "johan@afhub.app", avatarInitials: "JD" },
  onOpenMarketplace,
  onSeedSimulationData,
  onOpenCreatorDashboard,
  onOpenCreatorAssistance,
  onCreateProduct,
  onOpenCreatorApplications,
}) => {
  // Navigation inside the enterprise hub - defaults to "accueil" for company home view
  const [activeTab, setActiveTab] = useState<"accueil" | "support" | "applications" | "telegram" | "discord">("accueil");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dynamic access state based on user's active apps & subscriptions
  const [currentIncludedApps, setCurrentIncludedApps] = useState<string[]>(
    subscription.includedApps || ["dashboard", "support"]
  );

  const isInitiallyPaid = subscription.hasPaidOffer !== undefined
    ? Boolean(subscription.hasPaidOffer)
    : (subscription.includedApps || []).some((a) =>
        ["telegram", "discord", "cours", "vip"].some((kw) => a.toLowerCase().includes(kw))
      );

  const [hasPaidOffer, setHasPaidOffer] = useState<boolean>(isInitiallyPaid);
  const [unlockedProductIds, setUnlockedProductIds] = useState<string[]>(
    subscription.unlockedProductIds || []
  );

  React.useEffect(() => {
    setCurrentIncludedApps(subscription.includedApps || ["dashboard", "support"]);
    const isPaid = subscription.hasPaidOffer !== undefined
      ? Boolean(subscription.hasPaidOffer)
      : (subscription.includedApps || []).some((a) =>
          ["telegram", "discord", "cours", "vip"].some((kw) => a.toLowerCase().includes(kw))
        );
    setHasPaidOffer(isPaid);
    setUnlockedProductIds(subscription.unlockedProductIds || []);
  }, [subscription.id, subscription.includedApps, subscription.hasPaidOffer, subscription.unlockedProductIds]);

  const [checkoutModalOffer, setCheckoutModalOffer] = useState<CreatorPlatformOffer | null>(null);

  // Enterprise branding state (Banner & Profile Photo customization)
  const [currentSub, setCurrentSub] = useState<EnterpriseSubscription>(subscription);
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [isPostComposerOpen, setIsPostComposerOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedMemberProductId, setSelectedMemberProductId] = useState<string | null>(
    subscription.productId || null
  );

  React.useEffect(() => {
    setCurrentSub(subscription);
  }, [subscription]);

  const companyId = currentSub.companyId || currentSub.id;

  // Chaque entreprise possède son propre état de navigation et de vérification.
  // Un changement d'entreprise ne doit jamais conserver Telegram, Discord ou un QR/code de l'entreprise précédente.
  React.useEffect(() => {
    setActiveTab("accueil");
    setCompanyTab("accueil");
    setTelegramFlowStep("channels_list");
    setDiscordFlowStep("channels_list");
    setCheckoutModalOffer(null);
    setPreviewMode("admin");
    setIsPreviewMenuOpen(false);
    setIsPostComposerOpen(false);
    setSelectedMemberProductId(subscription.productId || null);
  }, [companyId, subscription.productId]);

  // Identifiants réels des offres débloquées par ce membre
  const memberUnlockedOfferIds = React.useMemo(() => {
    return normalizeUnlockedOfferIds(currentSub);
  }, [currentSub]);

  const scopedMemberUnlockedOfferIds = React.useMemo(() => {
    if (!selectedMemberProductId) return memberUnlockedOfferIds;
    return memberUnlockedOfferIds.filter(
      (offerId) => offerId.toLowerCase() === selectedMemberProductId.toLowerCase()
    );
  }, [memberUnlockedOfferIds, selectedMemberProductId]);

  // Ressources strictement autorisées pour ce membre et cette entreprise
  const authorizedTelegramChannels = React.useMemo(() => {
    return getMemberAuthorizedTelegramChannels(companyId, scopedMemberUnlockedOfferIds);
  }, [companyId, scopedMemberUnlockedOfferIds]);

  const authorizedDiscordChannels = React.useMemo(() => {
    return getMemberAuthorizedDiscordChannels(companyId, scopedMemberUnlockedOfferIds);
  }, [companyId, scopedMemberUnlockedOfferIds]);

  const authorizedEbooks = React.useMemo(() => {
    return getMemberAuthorizedEbooks(companyId, scopedMemberUnlockedOfferIds);
  }, [companyId, scopedMemberUnlockedOfferIds]);

  const authorizedCourses = React.useMemo(() => {
    return getMemberAuthorizedCourses(companyId, scopedMemberUnlockedOfferIds);
  }, [companyId, scopedMemberUnlockedOfferIds]);

  // Vérification d'accès stricte : débloqué uniquement si l'offre achetée accorde la ressource précise
  const hasTelegramAccess = authorizedTelegramChannels.length > 0;
  const hasDiscordAccess = authorizedDiscordChannels.length > 0;
  const isTelegramUnlocked = authorizedTelegramChannels.length > 0;
  const isDiscordUnlocked = authorizedDiscordChannels.length > 0;
  const isEbookUnlocked = authorizedEbooks.length > 0;
  const isCourseUnlocked = authorizedCourses.length > 0;
  
  // Company internal tabs: "Accueil" (default & active with blue underline indicator), "Produits", "Avis"
  const [companyTab, setCompanyTab] = useState<"accueil" | "produits" | "avis">("accueil");

  // Security Check: ONLY the true creator owner of this company can modify its branding, post news, and manage apps
  const isCompanyOwner = React.useMemo(() => {
    // 1. Direct owner check if ownerId or creatorEmail is attached to subscription
    const subOwnerId = (currentSub as any).ownerId;
    const subCreatorEmail = (currentSub as any).creatorEmail;
    if (user) {
      if (subOwnerId && (subOwnerId === (user as any).uid || subOwnerId === user.email)) {
        return true;
      }
      if (subCreatorEmail && subCreatorEmail === user.email) {
        return true;
      }
    }
    // 2. Check if current companyId exists in the user's creator companies list
    if (creatorCompanies && creatorCompanies.length > 0) {
      return creatorCompanies.some(
        (c: any) =>
          c &&
          (c.id === currentSub.companyId ||
            c.id === currentSub.id ||
            (c.name &&
              currentSub.companyName &&
              c.name.trim().toLowerCase() === currentSub.companyName.trim().toLowerCase()))
      );
    }
    return false;
  }, [
    creatorCompanies,
    currentSub.companyId,
    currentSub.id,
    currentSub.companyName,
    (currentSub as any).ownerId,
    (currentSub as any).creatorEmail,
    user,
  ]);

  // Publications / Actualités propres à cette entreprise (isolées strictement par entreprise)
  const [postsRefreshTrigger, setPostsRefreshTrigger] = useState(0);
  const companyPosts = React.useMemo<CompanyPost[]>(() => {
    const compId = currentSub.companyId || currentSub.id;
    return getPostsForCompany(compId, currentSub.companyName);
  }, [currentSub.companyId, currentSub.id, currentSub.companyName, postsRefreshTrigger]);

  React.useEffect(() => {
    const handlePostsUpdated = () => {
      setPostsRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener("mansa_company_posts_updated", handlePostsUpdated);
    window.addEventListener("storage", handlePostsUpdated);
    return () => {
      window.removeEventListener("mansa_company_posts_updated", handlePostsUpdated);
      window.removeEventListener("storage", handlePostsUpdated);
    };
  }, []);

  // Formulaire d'annonce pour le créateur
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostPinned, setNewPostPinned] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    const compId = currentSub.companyId || currentSub.id;
    createCompanyPost(compId, currentSub.companyName, {
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      authorName: currentSub.companyName,
      pinned: newPostPinned,
      category: "Actualité",
    });
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostPinned(false);
    setIsPostComposerOpen(false);
  };

  const handlePublishPost = () => {
    if (!postText.trim()) return;
    const compId = currentSub.companyId || currentSub.id;
    createCompanyPost(compId, currentSub.companyName, {
      title: "Actualité officielle",
      content: postText.trim(),
      authorName: currentSub.companyName,
      pinned: false,
      category: "Actualité",
    });
    setPostText("");
    setIsPostComposerOpen(false);
  };

  const handleDeletePost = (postId: string) => {
    const compId = currentSub.companyId || currentSub.id;
    deleteCompanyPost(postId, compId);
  };

  // Likes des posts par utilisateur
  const [likedPostsMap, setLikedPostsMap] = useState<Record<string, boolean>>(() => {
    try {
      const userKey = user?.uid || user?.email || "default";
      const raw = localStorage.getItem(`mansa_liked_posts_${userKey}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const handleToggleLike = (post: CompanyPost) => {
    const userKey = user?.uid || user?.email || "default";
    const currentlyLiked = !likedPostsMap[post.id];
    const nextMap = { ...likedPostsMap, [post.id]: currentlyLiked };
    setLikedPostsMap(nextMap);
    try {
      localStorage.setItem(`mansa_liked_posts_${userKey}`, JSON.stringify(nextMap));
    } catch {}

    const all = getAllStoredPosts();
    const target = all.find((p) => p.id === post.id);
    if (target) {
      target.likesCount = Math.max(0, (target.likesCount || 0) + (currentlyLiked ? 1 : -1));
      saveAllPosts(all);
    }
  };

  // Commentaires des posts par utilisateur
  const [expandedCommentsMap, setExpandedCommentsMap] = useState<Record<string, boolean>>({});
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});
  const [postCommentsMap, setPostCommentsMap] = useState<Record<string, Array<{ author: string; text: string; time: string }>>>(() => {
    try {
      const raw = localStorage.getItem("mansa_post_comments_storage");
      return raw ? JSON.parse(raw) : {
        "post-pinned": [
          { author: "Membre Actif", text: "Merci pour la mise à jour, c'est très clair.", time: "Il y a 20 min" },
          { author: currentSub.companyName, text: "Merci pour votre retour. Nous restons disponibles.", time: "Il y a 12 min" },
        ],
        "post-cadre-1": [
          { author: "Membre Actif", text: "Merci pour ce point de marché détaillé !", time: "Il y a 30 min" },
        ],
      };
    } catch {
      return {};
    }
  });

  const handleAddComment = (postId: string) => {
    const text = (commentInputMap[postId] || "").trim();
    if (!text) return;
    const authorName = user?.name || "Membre";
    const newComment = { author: authorName, text, time: "À l'instant" };
    const currentList = postCommentsMap[postId] || [];
    const nextList = [...currentList, newComment];
    const nextMap = { ...postCommentsMap, [postId]: nextList };
    setPostCommentsMap(nextMap);
    setCommentInputMap((prev) => ({ ...prev, [postId]: "" }));
    try {
      localStorage.setItem("mansa_post_comments_storage", JSON.stringify(nextMap));
    } catch {}

    const all = getAllStoredPosts();
    const target = all.find((p) => p.id === postId);
    if (target) {
      target.commentsCount = (target.commentsCount || 0) + 1;
      saveAllPosts(all);
    }
  };

  // Listen to external branding updates
  React.useEffect(() => {
    const handleBrandingChange = (e: any) => {
      const detail = e.detail;
      if (detail && (detail.companyId === currentSub.companyId || detail.id === currentSub.companyId)) {
        setCurrentSub((prev) => ({
          ...prev,
          companyName: detail.companyName || detail.name || prev.companyName,
          companyBanner: detail.companyBanner || prev.companyBanner,
          companyLogo: detail.companyLogo || prev.companyLogo,
        }));
      }
    };
    window.addEventListener("mansa_subscription_updated", handleBrandingChange);
    window.addEventListener("mansa_company_branding_changed", handleBrandingChange);
    return () => {
      window.removeEventListener("mansa_subscription_updated", handleBrandingChange);
      window.removeEventListener("mansa_company_branding_changed", handleBrandingChange);
    };
  }, [currentSub.companyId]);

  // Synchronize creator live replies from AssistanceView to member chat
  React.useEffect(() => {
    const handleCreatorReply = (e: any) => {
      const detail = e.detail;
      if (
        detail &&
        (detail.companyId === currentSub.companyId || detail.companyId === currentSub.id) &&
        (detail.text || detail.message)
      ) {
        setSupportChatList((prev) => [
          ...prev,
          {
            id: `msg-creator-reply-${Date.now()}`,
            sender: "creator",
            text: detail.text || detail.message,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    };
    window.addEventListener("mansa_creator_assistance_replied", handleCreatorReply);
    return () => {
      window.removeEventListener("mansa_creator_assistance_replied", handleCreatorReply);
    };
  }, [currentSub.companyId, currentSub.id]);

  const handleSaveBranding = (branding: {
    name: string;
    description: string;
    companyBanner: string;
    companyLogo: string;
  }) => {
    // Strict ownership verification: block non-creators
    if (!isCompanyOwner) {
      console.warn("Opération interdite : Seul le créateur propriétaire peut modifier son entreprise.");
      return;
    }

    const userKey = user?.email || "default";
    updateSubscriptionBranding(userKey, currentSub.companyId, {
      companyName: branding.name,
      companyBanner: branding.companyBanner,
      companyLogo: branding.companyLogo,
    });
    updateCompanyBranding(userKey, currentSub.companyId, {
      name: branding.name,
      description: branding.description,
      companyBanner: branding.companyBanner,
      companyLogo: branding.companyLogo,
    });
    setCurrentSub((prev) => ({
      ...prev,
      companyName: branding.name,
      companyBanner: branding.companyBanner,
      companyLogo: branding.companyLogo,
    }));
  };

  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Post likes and interaction states for newsfeed
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({
    "post-pinned": false,
    "post-2": false,
    "post-3": false,
  });
  const [likesCounts, setLikesCounts] = useState<Record<string, number>>({
    "post-pinned": 64,
    "post-2": 42,
    "post-3": 38,
  });
  const [copiedProfileShare, setCopiedProfileShare] = useState(false);
  const [isJoinedLocally, setIsJoinedLocally] = useState<boolean | null>(null);
  const [optionsDropdownOpen, setOptionsDropdownOpen] = useState(false);
  const [isManageMembershipModalOpen, setIsManageMembershipModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copiedLinkToast, setCopiedLinkToast] = useState(false);
  const [expandedCommentPosts, setExpandedCommentPosts] = useState<Record<string, boolean>>({});
  const [isEbookModalOpen, setIsEbookModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const optionsMenuRef = React.useRef<HTMLDivElement>(null);

  const commentReplies: Record<string, Array<{ author: string; text: string; time: string }>> = {
    "post-pinned": [
      { author: "Membre Premium", text: "Merci pour la mise à jour, c'est très clair.", time: "Il y a 20 min" },
      { author: currentSub.companyName, text: "Merci pour votre retour. Nous restons disponibles.", time: "Il y a 12 min" },
    ],
    "post-2": [
      { author: "Aïcha", text: "La synchronisation est-elle déjà active pour tous les membres ?", time: "Il y a 1 h" },
      { author: currentSub.companyName, text: "Oui, le déploiement est terminé.", time: "Il y a 45 min" },
    ],
    "post-3": [
      { author: "Membre Premium", text: "Le fichier est bien téléchargé, merci.", time: "Il y a 2 h" },
      { author: currentSub.companyName, text: "Parfait, bonne lecture !", time: "Il y a 1 h" },
    ],
  };

  const renderCommentReplies = (postId: string) => {
    if (!expandedCommentPosts[postId]) return null;
    if (!hasPaidOffer && !isCompanyOwner) {
      return (
        <div className="mt-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-[11px] text-amber-300">
          Les réponses sont disponibles après l'achat d'un produit.
        </div>
      );
    }
    return (
      <div className="mt-2 space-y-2 rounded-xl border border-white/5 bg-black/10 p-3">
        {commentReplies[postId].map((reply, index) => (
          <div key={`${postId}-reply-${index}`} className="border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-white">{reply.author}</span>
              <span className="text-[10px] text-zinc-500">{reply.time}</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">{reply.text}</p>
          </div>
        ))}
      </div>
    );
  };

  // Click outside listener for menu ⋮
  React.useEffect(() => {
    if (!optionsDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(e.target as Node)) {
        setOptionsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [optionsDropdownOpen]);

  // Handler: Cancel active subscription while remaining a member of the enterprise
  const handleCancelActiveSubscription = () => {
    const userKey = user?.email || "default";
    cancelActiveSubscription(userKey, currentSub.id);
    setHasPaidOffer(false);
    setCurrentIncludedApps(["dashboard", "support"]);
    setUnlockedProductIds([]);
    setCurrentSub((prev) => ({
      ...prev,
      hasPaidOffer: false,
      status: "canceled",
      productName: "Adhésion Simple (Gratuit)",
      priceDisplay: "0 FCFA",
      includedApps: ["dashboard", "support"],
      unlockedProductIds: [],
    }));
  };

  // Check whether the user has joined this enterprise
  const isEnterpriseJoined = React.useMemo(() => {
    if (isJoinedLocally !== null) return isJoinedLocally;
    if (currentSub.hasJoined === false || currentSub.isCommunityPreview) return false;
    const userKey = user?.uid || user?.email || "default";
    try {
      const leftKey = `mansa_left_enterprises_${userKey}`;
      const leftList: string[] = JSON.parse(localStorage.getItem(leftKey) || "[]");
      const compId = currentSub.companyId || currentSub.id;
      if (leftList.includes(currentSub.id) || leftList.includes(compId)) {
        return false;
      }
    } catch {}
    const exists = allSubscriptions.some(
      (s) => (s.id === currentSub.id || s.companyId === currentSub.companyId || s.companyId === currentSub.id) && s.hasJoined !== false
    );
    if (!exists && (currentSub.isCommunityPreview || currentSub.id.startsWith("preview-"))) {
      return false;
    }
    return exists || currentSub.hasJoined === true || currentSub.status === "active";
  }, [currentSub, allSubscriptions, user, isJoinedLocally]);

  // Handler: Join enterprise
  const handleJoinEnterprise = () => {
    const userKey = user?.uid || user?.email || "default";
    const compId = currentSub.companyId || currentSub.id;

    try {
      const leftKey = `mansa_left_enterprises_${userKey}`;
      const leftList: string[] = JSON.parse(localStorage.getItem(leftKey) || "[]");
      const filtered = leftList.filter((id) => id !== currentSub.id && id !== compId);
      localStorage.setItem(leftKey, JSON.stringify(filtered));
    } catch {}

    const joinedSub: EnterpriseSubscription = {
      ...currentSub,
      id: currentSub.id.replace(/^preview-/, ""),
      companyId: compId,
      hasJoined: true,
      isCommunityPreview: false,
      status: "active",
      subscribedAt: "Aujourd'hui",
    };

    saveSubscription(userKey, joinedSub);
    saveSubscription("default", joinedSub);

    setIsJoinedLocally(true);
    setCurrentSub(joinedSub);

    window.dispatchEvent(
      new CustomEvent("mansa_community_joined", {
        detail: { subId: joinedSub.id, companyId: compId },
      })
    );
    window.dispatchEvent(
      new CustomEvent("mansa_subscription_updated", {
        detail: joinedSub,
      })
    );
  };

  // Handler: Leave the enterprise completely
  const handleLeaveEnterprise = () => {
    const userKey = user?.uid || user?.email || "default";
    const compId = currentSub.companyId || currentSub.id;

    removeSubscription(userKey, currentSub.id);
    if (currentSub.companyId) {
      removeSubscription(userKey, currentSub.companyId);
    }
    removeSubscription("default", currentSub.id);
    if (currentSub.companyId) {
      removeSubscription("default", currentSub.companyId);
    }

    setIsJoinedLocally(false);
    setCurrentSub((prev) => ({ ...prev, hasJoined: false }));

    window.dispatchEvent(
      new CustomEvent("mansa_community_left", {
        detail: { subId: currentSub.id, companyId: compId },
      })
    );
    window.dispatchEvent(
      new CustomEvent("mansa_subscription_updated", {
        detail: { removedId: currentSub.id, companyId: compId },
      })
    );

    if (onBackToPersonal) {
      onBackToPersonal();
    }
  };

  // Synchronize dynamic products updates
  const [productsRefreshTrigger, setProductsRefreshTrigger] = useState(0);
  React.useEffect(() => {
    const handleProductsUpdated = () => {
      setProductsRefreshTrigger((prev) => prev + 1);
    };
    window.addEventListener("mansa_products_updated", handleProductsUpdated);
    window.addEventListener("storage", handleProductsUpdated);
    return () => {
      window.removeEventListener("mansa_products_updated", handleProductsUpdated);
      window.removeEventListener("storage", handleProductsUpdated);
    };
  }, []);

  // 1. Offres réelles de l'entreprise : récupérées depuis rightsAccessEngine / PLATFORM_CREATOR_OFFERS
  const enterpriseOffers = React.useMemo<CreatorPlatformOffer[]>(() => {
    const compId = currentSub.companyId || currentSub.id;
    const configured = getOffersForCompany(compId);
    if (configured.length > 0) {
      return configured;
    }
    const registered = PLATFORM_CREATOR_OFFERS.filter(
      (o) =>
        o.companyId === compId ||
        o.companyId === currentSub.id ||
        (o.companyName && currentSub.companyName && o.companyName.toLowerCase() === currentSub.companyName.toLowerCase())
    );
    if (registered.length > 0) {
      return registered;
    }
    return [];
  }, [currentSub.companyId, currentSub.id, currentSub.companyName, productsRefreshTrigger]);

  // Telegram et Discord sont des apps : elles ne doivent être présentes que si au moins un produit existe pour cette entreprise et inclut l'application
  const hasTelegramApp = React.useMemo(() => {
    if (enterpriseOffers.length === 0) return false;
    return enterpriseOffers.some(
      (offer) =>
        offer.includedApps?.some((a) => a.toLowerCase().includes("telegram")) ||
        offer.title.toLowerCase().includes("telegram")
    );
  }, [enterpriseOffers]);

  const hasDiscordApp = React.useMemo(() => {
    if (enterpriseOffers.length === 0) return false;
    return enterpriseOffers.some(
      (offer) =>
        offer.includedApps?.some((a) => a.toLowerCase().includes("discord")) ||
        offer.title.toLowerCase().includes("discord")
    );
  }, [enterpriseOffers]);

  // Redirection automatique si onglet non autorisé
  React.useEffect(() => {
    if (activeTab === "telegram" && !hasTelegramApp) {
      setActiveTab("accueil");
    }
    if (activeTab === "discord" && !hasDiscordApp) {
      setActiveTab("accueil");
    }
    if (activeTab === "applications" && !isCompanyOwner) {
      setActiveTab("accueil");
    }
  }, [activeTab, hasTelegramApp, hasDiscordApp, isCompanyOwner]);

  type PreviewMode = "admin" | "public" | "hidden" | `product:${string}`;
  const [previewMode, setPreviewMode] = useState<PreviewMode>("admin");
  const [isPreviewMenuOpen, setIsPreviewMenuOpen] = useState(false);
  const selectedPreviewOfferId = previewMode.startsWith("product:")
    ? previewMode.slice("product:".length)
    : null;
  const selectedPreviewOffer = selectedPreviewOfferId
    ? enterpriseOffers.find((offer) => offer.id === selectedPreviewOfferId)
    : undefined;

  type CreatorAppId = "telegram" | "discord" | "courses" | "files";
  const [creatorAppStep, setCreatorAppStep] = useState<"closed" | "choose" | "link" | "content">("closed");
  const [selectedCreatorApp, setSelectedCreatorApp] = useState<CreatorAppId | null>(null);
  const [linkedCreatorProductIds, setLinkedCreatorProductIds] = useState<string[]>([]);
  const [creatorCourseName, setCreatorCourseName] = useState("");
  const [creatorCourseDescription, setCreatorCourseDescription] = useState("");
  const [creatorCourseCoverFileName, setCreatorCourseCoverFileName] = useState("");
  const [creatorYoutubeUrl, setCreatorYoutubeUrl] = useState("");
  const [creatorVideoFileName, setCreatorVideoFileName] = useState("");
  const [creatorAttachmentFileName, setCreatorAttachmentFileName] = useState("");
  const [creatorChapterNames, setCreatorChapterNames] = useState<string[]>(["Introduction"]);
  const [creatorChapterContents, setCreatorChapterContents] = useState<string[]>([""]);
  const [creatorNewChapterName, setCreatorNewChapterName] = useState("");
  const [creatorFileName, setCreatorFileName] = useState("");
  const [creatorCourses, setCreatorCourses] = useState<Array<{
    id: string;
    productIds: string[];
    title: string;
    description: string;
    coverFileName?: string;
    youtubeUrl?: string;
    videoFileName?: string;
    attachmentFileName?: string;
    chapters: string[];
    chapterContents?: string[];
    updatedAt: string;
  }>>([]);
  const [editingCreatorCourseId, setEditingCreatorCourseId] = useState<string | null>(null);
  const [courseCreationStep, setCourseCreationStep] = useState<"library" | "details" | "content">("library");

  const creatorAppMeta: Record<CreatorAppId, { title: string; description: string; icon: string }> = {
    telegram: { title: "Telegram", description: "Canal ou groupe Telegram lié à un ou plusieurs produits.", icon: "✈️" },
    discord: { title: "Discord", description: "Serveur Discord et accès membres par produit.", icon: "🎮" },
    courses: { title: "Cours & vidéos", description: "Cours, coaching et formations avec chapitres.", icon: "🎓" },
    files: { title: "Fichier", description: "Fichiers, téléchargements instantanés et e-books.", icon: "📁" },
  };

  const openCreatorAppWorkflow = () => {
    setSelectedCreatorApp(null);
    setLinkedCreatorProductIds(selectedPreviewOfferId ? [selectedPreviewOfferId] : []);
    setCreatorAppStep("choose");
  };

  const chooseCreatorApp = (appId: CreatorAppId) => {
    setSelectedCreatorApp(appId);
    setCreatorAppStep("link");
  };

  const continueCreatorAppContent = () => {
    if (!selectedCreatorApp || linkedCreatorProductIds.length === 0) return;
    if (selectedCreatorApp === "telegram" || selectedCreatorApp === "discord") {
      const linksKey = `mansa_creator_app_links_${companyId}`;
      const savedLinks = JSON.parse(localStorage.getItem(linksKey) || "[]");
      const nextLink = { appId: selectedCreatorApp, productIds: linkedCreatorProductIds, updatedAt: new Date().toISOString() };
      const withoutCurrent = Array.isArray(savedLinks) ? savedLinks.filter((item: { appId?: string }) => item.appId !== selectedCreatorApp) : [];
      localStorage.setItem(linksKey, JSON.stringify([...withoutCurrent, nextLink]));
      setCreatorAppStep("closed");
      if (selectedCreatorApp === "telegram") {
        setActiveTab("telegram");
        setTelegramFlowStep("channels_list");
      } else {
        setActiveTab("discord");
        setDiscordFlowStep("channels_list");
      }
      return;
    }
    if (selectedCreatorApp === "courses") {
      const saved = JSON.parse(localStorage.getItem(`mansa_creator_courses_${companyId}`) || "[]");
      setCreatorCourses(Array.isArray(saved) ? saved : []);
      setEditingCreatorCourseId(null);
      setCourseCreationStep("library");
    }
    setCreatorAppStep("content");
  };

  const startNewCreatorCourse = () => {
    setEditingCreatorCourseId("new");
    setCourseCreationStep("details");
    setCreatorCourseName("");
    setCreatorCourseDescription("");
    setCreatorCourseCoverFileName("");
    setCreatorYoutubeUrl("");
    setCreatorVideoFileName("");
    setCreatorAttachmentFileName("");
    setCreatorChapterNames(["Introduction"]);
    setCreatorChapterContents([""]);
    setCreatorNewChapterName("");
  };

  const editCreatorCourse = (course: (typeof creatorCourses)[number]) => {
    setEditingCreatorCourseId(course.id);
    setLinkedCreatorProductIds(course.productIds);
    setCreatorCourseName(course.title);
    setCreatorCourseDescription(course.description);
    setCreatorCourseCoverFileName(course.coverFileName || "");
    setCreatorYoutubeUrl(course.youtubeUrl || "");
    setCreatorVideoFileName(course.videoFileName || "");
    setCreatorAttachmentFileName(course.attachmentFileName || "");
    setCreatorChapterNames(course.chapters.length > 0 ? course.chapters : ["Introduction"]);
    setCreatorChapterContents(course.chapterContents?.length === course.chapters.length ? course.chapterContents : course.chapters.map(() => ""));
    setCourseCreationStep("details");
  };

  const continueCourseDetails = () => {
    if (!creatorCourseName.trim() || !creatorCourseDescription.trim()) return;
    setCourseCreationStep("content");
  };

  const finishCreatorAppWorkflow = () => {
    if (!selectedCreatorApp) return;
    if (selectedCreatorApp === "courses") {
      if (!creatorCourseName.trim()) return;
      const course = {
        id: editingCreatorCourseId && editingCreatorCourseId !== "new" ? editingCreatorCourseId : `course-${Date.now()}`,
        productIds: linkedCreatorProductIds,
        title: creatorCourseName.trim(),
        description: creatorCourseDescription.trim(),
        coverFileName: creatorCourseCoverFileName,
        youtubeUrl: creatorYoutubeUrl.trim(),
        videoFileName: creatorVideoFileName,
        attachmentFileName: creatorAttachmentFileName,
        chapters: creatorChapterNames.filter(Boolean),
        chapterContents: creatorChapterNames.map((_, index) => creatorChapterContents[index] || ""),
        updatedAt: new Date().toISOString(),
      };
      const nextCourses = [...creatorCourses.filter((item) => item.id !== course.id), course];
      setCreatorCourses(nextCourses);
      localStorage.setItem(`mansa_creator_courses_${companyId}`, JSON.stringify(nextCourses));
      setEditingCreatorCourseId(null);
      setCourseCreationStep("library");
      return;
    }
    const storageKey = `mansa_creator_apps_${companyId}`;
    const currentApps = JSON.parse(localStorage.getItem(storageKey) || "[]");
    const nextApp = {
      appId: selectedCreatorApp,
      productIds: linkedCreatorProductIds,
      title: creatorFileName,
      description: creatorCourseDescription,
      chapters: creatorChapterNames,
      updatedAt: new Date().toISOString(),
    };
    const withoutCurrent = Array.isArray(currentApps)
      ? currentApps.filter((app: { appId?: string }) => app.appId !== selectedCreatorApp)
      : [];
    localStorage.setItem(storageKey, JSON.stringify([...withoutCurrent, nextApp]));
    setCreatorAppStep("closed");
    setSelectedCreatorApp(null);
  };

  // Le mode compact est automatique sur les écrans étroits et complet sur desktop.
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 1023px)").matches : false
  );

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const handleViewportChange = (event: MediaQueryListEvent) => setIsCompact(event.matches);

    setIsCompact(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);
    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  // Helper pour récupérer l'offre réelle correspondante
  const getOfferForFeature = (featureKey: string): CreatorPlatformOffer => {
    const matched = enterpriseOffers.find(
      (o) =>
        o.includedApps?.some((a) => a.toLowerCase().includes(featureKey)) ||
        o.type === featureKey ||
        o.title.toLowerCase().includes(featureKey)
    );
    if (matched) return matched;
    return enterpriseOffers[0] || {
      id: `offer-${featureKey}-${currentSub.companyId || currentSub.id}`,
      title: `Offre ${currentSub.companyName}`,
      companyId: currentSub.companyId || currentSub.id,
      companyName: currentSub.companyName,
      companyInitials: currentSub.companyInitials,
      category: "membership",
      type: "membership",
      priceDisplay: currentSub.priceDisplay || "19 000 FCFA / mois",
      priceAmount: 19000,
      currency: "XOF",
      pricingType: "paid",
      billingCycle: "monthly",
      description: `Accédez aux services officiels proposés par ${currentSub.companyName}.`,
      imageUrl: currentSub.companyBanner || "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
      includedApps: ["dashboard", "support", featureKey],
    };
  };

  // Construction STRICTE des fonctionnalités réelles de l'entreprise (UNIQUEMENT ce qui existe dans ses offres réelles)
  const ecosystemFeatures = React.useMemo(() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      icon: React.ReactNode;
      isAccessible: boolean;
      featureKey: string;
      productName: string;
      matchingOffer?: CreatorPlatformOffer;
      authorizedCount?: number;
    }> = [];

    // 3. E-book (uniquement si configuré pour l'entreprise)
    const ebOffer = enterpriseOffers.find((o) =>
      Boolean(
        (o.ebooks && o.ebooks.length > 0) ||
        o.type === "ebook" ||
        o.includedApps?.some((a) => ["ebook", "guide", "pdf", "livre"].some((k) => a.toLowerCase().includes(k))) ||
        o.title.toLowerCase().includes("ebook")
      )
    );
    if (ebOffer || (currentSub.ebooks && currentSub.ebooks.length > 0)) {
      items.push({
        id: "ebook",
        title: "E-book",
        description: "Guides stratégiques téléchargeables, règles méthodologiques et fiches mémo.",
        icon: <BookOpen className="size-4 text-emerald-400" />,
        isAccessible: isEbookUnlocked,
        featureKey: "ebook",
        productName: authorizedEbooks[0]?.title || ebOffer?.title || "Pack E-books & Guides",
        matchingOffer: ebOffer || getOfferForFeature("ebook"),
        authorizedCount: authorizedEbooks.length,
      });
    }

    // 4. Formation (uniquement si configurée pour l'entreprise)
    const coOffer = enterpriseOffers.find((o) =>
      Boolean(
        (o.courses && o.courses.length > 0) ||
        o.type === "course" ||
        o.includedApps?.some((a) => ["cours", "formation", "masterclass", "course"].some((k) => a.toLowerCase().includes(k))) ||
        o.title.toLowerCase().includes("formation")
      )
    );
    if (coOffer || (currentSub.courses && currentSub.courses.length > 0)) {
      items.push({
        id: "course",
        title: "Formation",
        description: "Cursus vidéo complets pas à pas, replays exclusifs et études de cas pratiques.",
        icon: <GraduationCap className="size-4 text-indigo-400" />,
        isAccessible: isCourseUnlocked,
        featureKey: "course",
        productName: authorizedCourses[0]?.title || coOffer?.title || "Formation Vidéo",
        matchingOffer: coOffer || getOfferForFeature("course"),
        authorizedCount: authorizedCourses.length,
      });
    }

    return items;
  }, [
    enterpriseOffers,
    currentSub,
    isTelegramUnlocked,
    isDiscordUnlocked,
    isEbookUnlocked,
    isCourseUnlocked,
    authorizedTelegramChannels,
    authorizedDiscordChannels,
    authorizedEbooks,
    authorizedCourses,
  ]);

  const visibleEcosystemFeatures = React.useMemo(() => {
    if (!isCompanyOwner || previewMode === "admin" || previewMode === "public") {
      return ecosystemFeatures;
    }
    if (previewMode === "hidden") return [];
    if (!selectedPreviewOffer) return ecosystemFeatures;

    return ecosystemFeatures.filter((feature) => {
      if (feature.matchingOffer?.id === selectedPreviewOffer.id) return true;
      if (selectedPreviewOffer.includedApps?.some((app) => app.toLowerCase().includes(feature.featureKey))) return true;
      if (feature.featureKey === "ebook" && (selectedPreviewOffer.ebooks?.length || 0) > 0) return true;
      if (feature.featureKey === "course" && (selectedPreviewOffer.courses?.length || 0) > 0) return true;
      if (feature.featureKey === "resource" && (selectedPreviewOffer.customResources?.length || 0) > 0) return true;
      return false;
    });
  }, [ecosystemFeatures, isCompanyOwner, previewMode, selectedPreviewOffer]);

  const handleEcosystemFeatureClick = (
    feat: (typeof ecosystemFeatures)[0],
    isMobile: boolean = false
  ) => {
    if (isMobile) setIsMobileSidebarOpen(false);

    if (feat.isAccessible) {
      if (feat.id === "telegram") {
        setActiveTab("telegram");
        setTelegramFlowStep("channels_list");
      } else if (feat.id === "discord") {
        setActiveTab("discord");
        setDiscordFlowStep("channels_list");
      } else if (feat.id === "ebook") {
        setIsEbookModalOpen(true);
      } else if (feat.id === "course") {
        setIsCourseModalOpen(true);
      }
    } else {
      // Fonctionnalité non achetée : 🔒 Verrouillé
      // Redirection immédiate vers la page produit / offre correspondante avec ouverture du checkout
      setActiveTab("accueil");
      setCompanyTab("produits");
      const offer = feat.matchingOffer || getOfferForFeature(feat.featureKey);
      setCheckoutModalOffer(offer);
    }
  };
  
  // Telegram multi-step access architecture
  // Step 1: Channels list with Top Header & Central Content Card
  // Step 2: Claim access & QR Code
  // Step 3: Verified Gateway & Join channel
  const [telegramFlowStep, setTelegramFlowStep] = useState<"channels_list" | "claim_qr" | "telegram_gateway">("channels_list");
  
  // Discord multi-step access architecture
  const [discordFlowStep, setDiscordFlowStep] = useState<"channels_list" | "claim_qr" | "discord_gateway">("channels_list");

  // Canaux Telegram STRICTEMENT autorisés pour ce membre selon son offre achetée
  const channelsList: TelegramChannelItem[] = authorizedTelegramChannels;

  // Serveurs / Salons Discord STRICTEMENT autorisés pour ce membre selon son offre achetée
  const discordChannelsList: DiscordChannelItem[] = authorizedDiscordChannels;

  // Canaux Telegram d'autres offres de la même entreprise (non débloqués par ce membre)
  const otherCompanyTelegramChannels = React.useMemo(() => {
    const allChannels: Array<{ channel: TelegramChannelItem; requiredOffer: CreatorPlatformOffer }> = [];
    enterpriseOffers.forEach((offer) => {
      if (!memberUnlockedOfferIds.includes(offer.id)) {
        (offer.telegramChannels || []).forEach((ch) => {
          if (!channelsList.some((c) => c.id === ch.id)) {
            allChannels.push({ channel: ch, requiredOffer: offer });
          }
        });
      }
    });
    return allChannels;
  }, [enterpriseOffers, memberUnlockedOfferIds, channelsList]);

  // Serveurs / Salons Discord d'autres offres de la même entreprise (non débloqués par ce membre)
  const otherCompanyDiscordChannels = React.useMemo(() => {
    const allChannels: Array<{ channel: DiscordChannelItem; requiredOffer: CreatorPlatformOffer }> = [];
    enterpriseOffers.forEach((offer) => {
      if (!memberUnlockedOfferIds.includes(offer.id)) {
        (offer.discordChannels || []).forEach((ch) => {
          if (!discordChannelsList.some((c) => c.id === ch.id)) {
            allChannels.push({ channel: ch, requiredOffer: offer });
          }
        });
      }
    });
    return allChannels;
  }, [enterpriseOffers, memberUnlockedOfferIds, discordChannelsList]);

  // E-books d'autres offres de la même entreprise (non débloqués par ce membre)
  const otherCompanyEbooks = React.useMemo(() => {
    const list: Array<{ ebook: EbookResourceItem; requiredOffer: CreatorPlatformOffer }> = [];
    enterpriseOffers.forEach((offer) => {
      if (!memberUnlockedOfferIds.includes(offer.id)) {
        (offer.ebooks || []).forEach((eb) => {
          if (!authorizedEbooks.some((e) => e.id === eb.id)) {
            list.push({ ebook: eb, requiredOffer: offer });
          }
        });
      }
    });
    return list;
  }, [enterpriseOffers, memberUnlockedOfferIds, authorizedEbooks]);

  // Formations d'autres offres de la même entreprise (non débloquées par ce membre)
  const otherCompanyCourses = React.useMemo(() => {
    const list: Array<{ course: CourseResourceItem; requiredOffer: CreatorPlatformOffer }> = [];
    enterpriseOffers.forEach((offer) => {
      if (!memberUnlockedOfferIds.includes(offer.id)) {
        (offer.courses || []).forEach((co) => {
          if (!authorizedCourses.some((c) => c.id === co.id)) {
            list.push({ course: co, requiredOffer: offer });
          }
        });
      }
    });
    return list;
  }, [enterpriseOffers, memberUnlockedOfferIds, authorizedCourses]);

  const [ebookDownloadToast, setEbookDownloadToast] = useState<string | null>(null);
  const [courseAccessToast, setCourseAccessToast] = useState<string | null>(null);

  const handleDownloadEbook = async (ebook: EbookResourceItem) => {
    try {
      const res = await fetch("/api/ebooks/request-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          ebookId: ebook.id,
          unlockedOfferIds: scopedMemberUnlockedOfferIds,
          userEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        setEbookDownloadToast(`Téléchargement autorisé : ${ebook.title}`);
        setTimeout(() => setEbookDownloadToast(null), 3500);
      } else {
        setAccessDeniedToast(
          data.error ||
            `Accès refusé. Vous devez posséder l'offre associée pour télécharger cet e-book.`
        );
        setTimeout(() => setAccessDeniedToast(null), 4000);
      }
    } catch {
      setEbookDownloadToast(`Téléchargement de ${ebook.title} démarré.`);
      setTimeout(() => setEbookDownloadToast(null), 3500);
    }
  };

  const handleAccessCourse = async (course: CourseResourceItem) => {
    try {
      const res = await fetch("/api/courses/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          courseId: course.id,
          unlockedOfferIds: scopedMemberUnlockedOfferIds,
          userEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.authorized) {
        setCourseAccessToast(`Module débloqué : ${course.title}`);
        setTimeout(() => setCourseAccessToast(null), 3500);
      } else {
        setAccessDeniedToast(
          data.error ||
            `Accès refusé. Vous devez posséder l'offre associée pour suivre cette formation.`
        );
        setTimeout(() => setAccessDeniedToast(null), 4000);
      }
    } catch {
      setCourseAccessToast(`Accès validé : ${course.title}`);
      setTimeout(() => setCourseAccessToast(null), 3500);
    }
  };

  const [selectedChannel, setSelectedChannel] = useState<TelegramChannelItem | null>(() => {
    return authorizedTelegramChannels[0] || null;
  });
  const [selectedDiscordChannel, setSelectedDiscordChannel] = useState<DiscordChannelItem | null>(() => {
    return authorizedDiscordChannels[0] || null;
  });

  React.useEffect(() => {
    if (!selectedChannel && authorizedTelegramChannels.length > 0) {
      setSelectedChannel(authorizedTelegramChannels[0]);
    } else if (selectedChannel && !authorizedTelegramChannels.some((c) => c.id === selectedChannel.id)) {
      setSelectedChannel(authorizedTelegramChannels[0] || null);
    }
  }, [authorizedTelegramChannels]);

  React.useEffect(() => {
    if (!selectedDiscordChannel && authorizedDiscordChannels.length > 0) {
      setSelectedDiscordChannel(authorizedDiscordChannels[0]);
    } else if (selectedDiscordChannel && !authorizedDiscordChannels.some((c) => c.id === selectedDiscordChannel.id)) {
      setSelectedDiscordChannel(authorizedDiscordChannels[0] || null);
    }
  }, [authorizedDiscordChannels]);

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedShareToast, setCopiedShareToast] = useState(false);
  const [activeMembersTooltip, setActiveMembersTooltip] = useState(false);
  const [activeNotifTooltip, setActiveNotifTooltip] = useState(false);

  const [copiedDiscordLink, setCopiedDiscordLink] = useState(false);
  const [copiedDiscordShareToast, setCopiedDiscordShareToast] = useState(false);
  const [activeDiscordMembersTooltip, setActiveDiscordMembersTooltip] = useState(false);
  const [activeDiscordNotifTooltip, setActiveDiscordNotifTooltip] = useState(false);

  const [claimToast, setClaimToast] = useState(false);
  const [discordClaimToast, setDiscordClaimToast] = useState(false);
  const [accessDeniedToast, setAccessDeniedToast] = useState<string | null>(null);

  const [supportMessage, setSupportMessage] = useState("");
  const [supportChatList, setSupportChatList] = useState<Array<{
    id: string;
    sender: "user" | "creator";
    text: string;
    time: string;
  }>>([
    {
      id: "msg-1",
      sender: "creator",
      text: `Bienvenue dans l'espace membre officiel de ${subscription.companyName} ! Votre abonnement est actif. Si vous avez besoin d'aide pour vos accès Telegram, Discord ou vos services inclus, écrivez-nous ici.`,
      time: "10:15",
    },
  ]);

  const handleSelectChannelToClaim = (channel: TelegramChannelItem) => {
    setSelectedChannel(channel);
    setTelegramFlowStep("claim_qr");
  };

  const handleProceedToGateway = () => {
    setTelegramFlowStep("telegram_gateway");
  };

  const handleCopyLink = () => {
    if (selectedChannel?.inviteLink) {
      navigator.clipboard.writeText(selectedChannel.inviteLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShareToast(true);
    setTimeout(() => setCopiedShareToast(false), 2500);
  };

  const handleOpenTelegram = async () => {
    if (selectedChannel) {
      await handleClaimTelegramInvite(selectedChannel);
    }
  };

  const handleClaimTelegramInvite = async (channel?: TelegramChannelItem) => {
    const target = channel || selectedChannel;
    if (!target) return;

    // Validation stricte côté serveur et locale
    try {
      const resp = await fetch("/api/telegram/request-channel-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          channelId: target.id,
          unlockedOfferIds: scopedMemberUnlockedOfferIds,
          userEmail: user?.email,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.authorized) {
        setAccessDeniedToast(data.error || "Accès non autorisé : ce canal Telegram requiert l'offre correspondante.");
        setTimeout(() => setAccessDeniedToast(null), 5000);
        return;
      }
      const verifiedUrl = data.inviteLink || target.inviteLink;
      if (verifiedUrl) {
        window.open(verifiedUrl, "_blank", "noopener,noreferrer");
        setClaimToast(true);
        setTimeout(() => setClaimToast(false), 3500);
      }
    } catch {
      // Fallback local avec le moteur de droits d'accès
      const localCheck = verifyMemberResourceAccess({
        companyId,
        unlockedOfferIds: scopedMemberUnlockedOfferIds,
        resourceType: "telegram",
        resourceId: target.id,
      });
      if (localCheck.isAuthorized && target.inviteLink) {
        window.open(target.inviteLink, "_blank", "noopener,noreferrer");
        setClaimToast(true);
        setTimeout(() => setClaimToast(false), 3500);
      } else {
        setAccessDeniedToast("Accès refusé pour ce canal Telegram.");
        setTimeout(() => setAccessDeniedToast(null), 5000);
      }
    }
  };

  // Discord Handlers
  const handleSelectDiscordToClaim = (channel: DiscordChannelItem) => {
    setSelectedDiscordChannel(channel);
    setDiscordFlowStep("claim_qr");
  };

  const handleProceedToDiscordGateway = () => {
    setDiscordFlowStep("discord_gateway");
  };

  const handleCopyDiscordLink = () => {
    if (selectedDiscordChannel?.inviteLink) {
      navigator.clipboard.writeText(selectedDiscordChannel.inviteLink);
      setCopiedDiscordLink(true);
      setTimeout(() => setCopiedDiscordLink(false), 2500);
    }
  };

  const handleCopyDiscordShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedDiscordShareToast(true);
    setTimeout(() => setCopiedDiscordShareToast(false), 2500);
  };

  const handleOpenDiscord = async () => {
    if (selectedDiscordChannel) {
      await handleClaimDiscordInvite(selectedDiscordChannel);
    }
  };

  const handleClaimDiscordInvite = async (channel?: DiscordChannelItem) => {
    const target = channel || selectedDiscordChannel;
    if (!target) return;

    try {
      const resp = await fetch("/api/discord/request-server-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          channelId: target.id,
          unlockedOfferIds: scopedMemberUnlockedOfferIds,
          userEmail: user?.email,
        }),
      });
      const data = await resp.json();
      if (!resp.ok || !data.authorized) {
        setAccessDeniedToast(data.error || "Accès non autorisé : ce serveur Discord requiert l'offre correspondante.");
        setTimeout(() => setAccessDeniedToast(null), 5000);
        return;
      }
      const verifiedUrl = data.inviteLink || target.inviteLink;
      if (verifiedUrl) {
        window.open(verifiedUrl, "_blank", "noopener,noreferrer");
        setDiscordClaimToast(true);
        setTimeout(() => setDiscordClaimToast(false), 3500);
      }
    } catch {
      const localCheck = verifyMemberResourceAccess({
        companyId,
        unlockedOfferIds: scopedMemberUnlockedOfferIds,
        resourceType: "discord",
        resourceId: target.id,
      });
      if (localCheck.isAuthorized && target.inviteLink) {
        window.open(target.inviteLink, "_blank", "noopener,noreferrer");
        setDiscordClaimToast(true);
        setTimeout(() => setDiscordClaimToast(false), 3500);
      } else {
        setAccessDeniedToast("Accès refusé pour ce serveur Discord.");
        setTimeout(() => setAccessDeniedToast(null), 5000);
      }
    }
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    const textToSend = supportMessage.trim();
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "user" as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setSupportChatList((prev) => [...prev, newMsg]);
    setSupportMessage("");

    // Broadcast to creator's Assistance page
    window.dispatchEvent(
      new CustomEvent("mansa_member_assistance_sent", {
        detail: {
          companyId: subscription.companyId || subscription.id,
          memberName: user?.name || "Membre",
          memberEmail: user?.email || "membre@mansa.app",
          message: textToSend,
        },
      })
    );

    // Auto-reply acknowledgment from support if configured by creator
    setTimeout(() => {
      const compId = currentSub.companyId || currentSub.id || subscription.companyId || subscription.id;
      const userKey = user?.email || "default";
      const allCompanies = getSavedCompanies(userKey);
      const comp =
        allCompanies.find(
          (c) =>
            c.id === compId ||
            (c.name &&
              currentSub.companyName &&
              c.name.toLowerCase() === currentSub.companyName.toLowerCase())
        ) || allCompanies.find((c) => c.id === "comp-cadre-financier");

      const autoReplyEnabled = comp?.supportAutoReplyEnabled ?? true;
      if (!autoReplyEnabled) return;

      const rawMsg =
        comp?.supportAutoReplyMessage ||
        `Message bien reçu. L'équipe d'assistance de ${currentSub.companyName} est notifiée et vous répondra dans les plus brefs délais.`;

      const personalizedMsg = rawMsg
        .replace(/\{nom\}/gi, user?.name || "Membre")
        .replace(/\{entreprise\}/gi, currentSub.companyName);

      setSupportChatList((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: "creator",
          text: personalizedMsg,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  };

  const totalChannels = channelsList.length;

  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col h-full w-full">
      <div className="p-3.5 space-y-4 flex-1 overflow-y-auto">
        {/* Top Mini Card of Enterprise matching screenshot */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#14161b] border border-white/5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative size-9 rounded-xl bg-gradient-to-br from-indigo-950 via-purple-900 to-black border border-white/15 flex items-center justify-center text-xs font-black text-white shrink-0 overflow-hidden shadow-inner">
              {subscription.companyLogo ? (
                <img src={subscription.companyLogo} alt={subscription.companyName} className="size-full object-cover" />
              ) : (
                <span>{subscription.companyInitials || subscription.companyName.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white truncate tracking-tight">{subscription.companyName}</h2>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-medium">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>en ligne</span>
              </div>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              title="Fermer le menu"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {isCompanyOwner && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPreviewMenuOpen((open) => !open)}
              className="w-full flex items-center justify-between rounded-xl border border-white/10 bg-[#14161b] px-3.5 py-2.5 text-left hover:border-white/20 transition-colors"
              aria-expanded={isPreviewMenuOpen}
              aria-haspopup="menu"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Aperçu en tant que</div>
                <div className="mt-1 flex items-center gap-2 text-xs font-semibold text-white truncate">
                  {previewMode === "admin" && <Eye className="size-3.5 text-blue-400 shrink-0" />}
                  {previewMode === "public" && <Users className="size-3.5 text-emerald-400 shrink-0" />}
                  {previewMode === "hidden" && <EyeOff className="size-3.5 text-zinc-400 shrink-0" />}
                  {previewMode.startsWith("product:") && <Package className="size-3.5 text-amber-400 shrink-0" />}
                  <span className="truncate">
                    {previewMode === "admin"
                      ? "Administrateur"
                      : previewMode === "public"
                      ? "Public"
                      : previewMode === "hidden"
                      ? "Masqué"
                      : selectedPreviewOffer?.title || "Produit"}
                  </span>
                </div>
              </div>
              <ChevronDown className={`size-4 text-zinc-400 transition-transform ${isPreviewMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {isPreviewMenuOpen && (
              <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#17191e] p-1.5 shadow-2xl">
                <button
                  type="button"
                  onClick={() => { setPreviewMode("admin"); setIsPreviewMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${previewMode === "admin" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                >
                  <Eye className="size-3.5 text-blue-400" /> Administrateur
                </button>
                <button
                  type="button"
                  onClick={() => { setPreviewMode("public"); setIsPreviewMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${previewMode === "public" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                >
                  <Users className="size-3.5 text-emerald-400" /> Public
                </button>
                <button
                  type="button"
                  onClick={() => { setPreviewMode("hidden"); setIsPreviewMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${previewMode === "hidden" ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                >
                  <EyeOff className="size-3.5 text-zinc-400" /> Masqué
                </button>

                <div className="my-1.5 border-t border-white/10 pt-1.5">
                  <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Produits</div>
                  {enterpriseOffers.length === 0 ? (
                    <div className="px-2.5 py-2 text-[11px] text-zinc-500">Aucun produit créé</div>
                  ) : (
                    enterpriseOffers.map((offer) => (
                      <button
                        type="button"
                        key={offer.id}
                        onClick={() => { setPreviewMode(`product:${offer.id}`); setIsPreviewMenuOpen(false); }}
                        className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-xs text-left transition-colors ${selectedPreviewOfferId === offer.id ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5"}`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <Package className="size-3.5 shrink-0 text-amber-400" />
                          <span className="truncate">{offer.title}</span>
                        </span>
                        <span className="shrink-0 text-[10px] text-zinc-500">{offer.subscribersCount || "0"}</span>
                      </button>
                    ))
                  )}
                  <button
                    type="button"
                    onClick={() => { setIsPreviewMenuOpen(false); onCreateProduct?.(); }}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-white/10 px-2.5 pt-2 text-xs text-zinc-300 hover:text-white"
                  >
                    <Plus className="size-3.5" /> Nouveau produit
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!isCompanyOwner && (
          <div className="rounded-xl border border-white/10 bg-[#14161b] p-1.5">
            <button
              type="button"
              onClick={() => setIsPreviewMenuOpen((open) => !open)}
              className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-white hover:bg-white/5 transition-colors"
              aria-expanded={isPreviewMenuOpen}
              aria-haspopup="menu"
            >
              <span className="flex items-center gap-2">
                <Package className="size-3.5 text-amber-400" />
                Produits
              </span>
              <ChevronDown className={`size-3.5 text-zinc-400 transition-transform ${isPreviewMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {isPreviewMenuOpen && (
              <div className="mt-1 border-t border-white/10 pt-1">
                {enterpriseOffers.length === 0 ? (
                  <div className="px-2.5 py-2 text-[11px] text-zinc-500">Aucun produit disponible</div>
                ) : (
                  enterpriseOffers.map((offer) => (
                    <button
                      type="button"
                      key={offer.id}
                      onClick={() => {
                        const hasProductAccess = memberUnlockedOfferIds.some(
                          (offerId) => offerId.toLowerCase() === offer.id.toLowerCase()
                        );
                        if (hasProductAccess) {
                          setSelectedMemberProductId(offer.id);
                          setCompanyTab("accueil");
                          setActiveTab("accueil");
                        } else {
                          setCompanyTab("produits");
                          setActiveTab("accueil");
                          setCheckoutModalOffer(offer);
                        }
                        setIsPreviewMenuOpen(false);
                        if (isMobile) setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${selectedMemberProductId === offer.id ? "bg-white/10 text-white" : "text-zinc-300 hover:bg-white/5 hover:text-white"}`}
                    >
                      <span className="truncate">{offer.title}</span>
                      <span className="shrink-0 text-[10px] text-zinc-500">{offer.subscribersCount || "0"}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation Items (En haut) : Accueil, Assistance, etc. */}
        <nav className="space-y-1 text-xs font-medium">
          {/* Tableau de bord : visible uniquement pour le créateur propriétaire */}
          {isCompanyOwner && (
            <button
              onClick={() => {
                if (onOpenCreatorDashboard) {
                  onOpenCreatorDashboard();
                } else {
                  setActiveTab("accueil");
                  setCompanyTab("accueil");
                }
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard className="size-4 text-blue-400" />
              <span>Tableau de bord</span>
            </button>
          )}

          {/* Accueil */}
          <button
            onClick={() => {
              setActiveTab("accueil");
              setCompanyTab("accueil");
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "accueil" && companyTab === "accueil"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <Home className="size-4 text-zinc-300" />
            <span>Accueil</span>
          </button>

          {/* Assistance : Ouvre l'assistance créateur si créateur, sinon l'espace support membre */}
          <button
            onClick={() => {
              if (isCompanyOwner && onOpenCreatorAssistance) {
                onOpenCreatorAssistance();
              } else {
                setActiveTab("support");
              }
              if (isMobile) setIsMobileSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
              activeTab === "support"
                ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
            }`}
          >
            <MessageSquare className="size-4 text-zinc-300" />
            <span>Assistance</span>
          </button>

          {/* Ajouter une application : UNIQUEMENT pour le créateur */}
          {isCompanyOwner && (
            <button
              onClick={() => {
                if (onOpenCreatorApplications) {
                  onOpenCreatorApplications();
                } else {
                  setActiveTab("applications");
                }
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                activeTab === "applications"
                  ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <Plus className="size-4 text-blue-400" />
              <span className={activeTab === "applications" ? "text-white font-bold" : "text-zinc-300"}>Ajouter une application</span>
            </button>
          )}

          {/* Telegram : UNIQUEMENT si au moins un produit lié existe */}
          {hasTelegramApp && (
            <button
              onClick={() => {
                setActiveTab("telegram");
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                activeTab === "telegram"
                  ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <TelegramIcon className="size-4" />
              <span className={activeTab === "telegram" ? "text-white font-bold" : "text-zinc-300"}>Telegram</span>
            </button>
          )}

          {/* Discord : UNIQUEMENT si au moins un produit lié existe */}
          {hasDiscordApp && (
            <button
              onClick={() => {
                setActiveTab("discord");
                if (isMobile) setIsMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] ${
                activeTab === "discord"
                  ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              <DiscordIcon className="size-4" />
              <span className={activeTab === "discord" ? "text-white font-bold" : "text-zinc-300"}>Discord</span>
            </button>
          )}
        </nav>

        {/* Section inférieure : Produits et fonctionnalités réels de l’entreprise */}
        {visibleEcosystemFeatures.length > 0 && (
          <div className="pt-3 border-t border-white/[0.08] space-y-1.5">
            <div className="px-3 pb-1 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Produits & Fonctionnalités
              </span>
              <span className="text-[10px] font-mono text-zinc-500">
                {visibleEcosystemFeatures.filter((f) => f.isAccessible).length}/
                {visibleEcosystemFeatures.length}
              </span>
            </div>

            <div className="space-y-1">
              {visibleEcosystemFeatures.map((item) => {
                const isAccessible = item.isAccessible;
                const isCurrentActive =
                  (item.id === "telegram" && activeTab === "telegram") ||
                  (item.id === "discord" && activeTab === "discord");

                return (
                  <button
                    key={item.id}
                    onClick={() => handleEcosystemFeatureClick(item, isMobile)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer min-h-[44px] text-left group ${
                      isCurrentActive
                        ? "bg-[#181a20] text-white font-semibold border border-white/10 shadow-sm"
                        : isAccessible
                        ? "text-zinc-300 hover:bg-white/5 hover:text-white"
                        : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                    }`}
                    title={
                      isAccessible
                        ? `Accéder à ${item.title}`
                        : `Débloquer ${item.title} (Accéder à l'offre)`
                    }
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-4 shrink-0 flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="truncate text-xs font-medium group-hover:text-white">
                        {item.title}
                      </span>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isAccessible ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                          <span>🔓 Accessible</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 whitespace-nowrap">
                          <Lock className="size-2.5 shrink-0" />
                          <span>Verrouillé</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isMobile && onBackToPersonal && (
          <div className="pt-2 border-t border-white/5">
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onBackToPersonal();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer min-h-[44px]"
            >
              <ChevronLeft className="size-4 text-zinc-400" />
              <span>Mon Espace Personnel</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Deduplicated list of member companies for the left rail
  const railItems = React.useMemo(() => {
    const rawList = (allSubscriptions || []).filter((s) => s.hasJoined !== false);
    const userKey = user?.uid || user?.email || "default";
    let leftIds: string[] = [];
    try {
      const leftRaw = localStorage.getItem(`mansa_left_enterprises_${userKey}`);
      if (leftRaw) leftIds = JSON.parse(leftRaw);
    } catch {}

    const seen = new Set<string>();
    const unique: any[] = [];
    for (const item of rawList) {
      if (!item) continue;
      const key = item.id || (item as any).companyId;
      if (key && !seen.has(key) && !leftIds.includes(item.id) && !leftIds.includes((item as any).companyId)) {
        seen.add(key);
        unique.push(item);
      }
    }
    return unique;
  }, [allSubscriptions, user]);

  return (
    <div className="flex h-full w-full flex-1 overflow-hidden relative select-none bg-[#08090b] text-[#eeeeee] font-sans antialiased">
      {/* 1. LEFTMOST RAIL: Enterprise Squares ("les cases entreprise sur le cote comme sur l'image") */}
      <div className="w-[72px] shrink-0 bg-[#08090a] border-r border-white/5 flex flex-col items-center py-3 gap-2 overflow-y-auto no-scrollbar select-none z-10">
          
          {/* 1. Return to Personal Workspace */}
          {onBackToPersonal && (
            <div className="relative group flex items-center justify-center w-full px-2">
              <button
                onClick={onBackToPersonal}
                className="size-11 rounded-2xl bg-[#16171b] hover:bg-white/10 hover:text-white text-zinc-400 border border-white/10 flex items-center justify-center transition-all cursor-pointer"
                title="Espace Personnel"
              >
                <User className="size-5" />
              </button>
              <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                Espace Personnel
              </div>
            </div>
          )}

          {/* DÉMARCATION 1 : MES ENTREPRISES (CRÉATEUR) */}
          <div className="w-full flex flex-col items-center gap-1.5 pt-1">
            <span
              className="text-[9px] font-black uppercase tracking-wider text-emerald-400/90 px-1 select-none flex items-center gap-0.5 cursor-default"
              title="Mes Entreprises (Créateur)"
            >
              👑
            </span>

            {/* Owned creator companies */}
            {(creatorCompanies.length > 0 ? creatorCompanies : [
              { id: "comp-cadre-financier", name: "Cadre financier", logoInitials: "FF", colorGradient: "from-emerald-950 via-slate-900 to-black" }
            ]).map((comp: any) => {
              const isOwnerActive = subscription.companyId === comp.id || subscription.id === comp.id;
              return (
                <div key={comp.id} className="relative group flex items-center justify-center w-full px-2">
                  {isOwnerActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400/50" />
                  )}

                  <button
                    onClick={() => {
                      if (onSelectCreatorCompany) {
                        onSelectCreatorCompany(comp);
                      } else if (onSelectSubscription) {
                        onSelectSubscription(comp.id);
                      }
                    }}
                    className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden select-none ${
                      isOwnerActive
                        ? "ring-2 ring-emerald-400 scale-105 shadow-lg shadow-emerald-500/20"
                        : "border border-white/10 hover:border-emerald-400/50 hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                    title={`Mon Entreprise : ${comp.name}`}
                  >
                    <div
                      className={`size-full bg-gradient-to-br ${
                        comp.colorGradient || "from-emerald-950 via-slate-900 to-black"
                      } flex items-center justify-center text-[10px] font-black text-white font-mono`}
                    >
                      <span>{comp.logoInitials || comp.name.substring(0, 2).toUpperCase()}</span>
                    </div>
                  </button>

                  <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                    👑 Créateur : {comp.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* SÉPARATEUR VISUEL CLAIR (DÉMARCATION) */}
          <div className="w-8 h-px bg-white/15 my-1.5 shrink-0 flex items-center justify-center relative">
            <span className="absolute bg-[#08090a] px-1 text-[8px] text-zinc-500 font-mono">•••</span>
          </div>

          {/* DÉMARCATION 2 : ENTREPRISES MEMBRE (ADHÉSIONS) */}
          <div className="w-full flex flex-col items-center gap-1.5 flex-1">
            <span
              className="text-[9px] font-black uppercase tracking-wider text-blue-400/90 px-1 select-none flex items-center gap-0.5 cursor-default"
              title="Entreprises Membre (Adhésions)"
            >
              🛡️
            </span>

            {/* Member companies */}
            {railItems.map((item: any, idx: number) => {
              const isActive = item.id === subscription.id || item.companyId === subscription.companyId || (idx === 0 && !railItems.some(c => c.id === subscription.id && c !== item));
              return (
                <div key={`rail-${item.id || item.companyId || idx}-${idx}`} className="relative group flex items-center justify-center w-full px-2">
                  {/* Left vertical indicator pill */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-blue-500 rounded-r-full shadow-sm shadow-blue-500/50" />
                  )}

                  <button
                    onClick={() => {
                      if (onSelectSubscription) {
                        onSelectSubscription(item.id);
                      }
                    }}
                    className={`size-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative overflow-hidden select-none ${
                      isActive
                        ? "ring-2 ring-blue-500 scale-105 shadow-lg shadow-blue-500/20"
                        : "border border-white/10 hover:border-blue-400/50 hover:scale-105 opacity-85 hover:opacity-100"
                    }`}
                    title={`Espace Membre : ${item.companyName || item.name}`}
                  >
                    {item.companyLogo || item.logo ? (
                      <img src={item.companyLogo || item.logo} alt={item.companyName || item.name} className="size-full object-cover" />
                    ) : item.type === "whop_yellow" ? (
                      <div className="size-full bg-[#D8FF3F] text-black font-black text-lg flex items-center justify-center">W</div>
                    ) : item.type === "green_stripes" ? (
                      <div className="size-full bg-[#0b1712] border border-emerald-500/30 text-emerald-400 flex flex-col items-center justify-center gap-0.5">
                        <span className="w-5 h-1 bg-emerald-400 rounded-full" />
                        <span className="w-3.5 h-1 bg-emerald-400/70 rounded-full" />
                      </div>
                    ) : item.type === "purple_shield" ? (
                      <div className="size-full bg-[#13111f] border border-purple-500/30 text-purple-400 flex items-center justify-center">
                        <ShieldCheck className="size-5" />
                      </div>
                    ) : (
                      <div
                        className={`size-full bg-gradient-to-br ${
                          item.companyGradient || "from-blue-950 via-indigo-950 to-black"
                        } flex items-center justify-center text-[10px] font-black text-white font-mono`}
                      >
                        <span>{item.companyInitials || item.initials || (item.companyName || item.name || "EM").substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                  </button>

                  {/* Tooltip on hover */}
                  <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
                    🛡️ Membre : {item.companyName || item.name}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plus button to discover more */}
          <div className="relative group flex items-center justify-center w-full px-2 pt-2 border-t border-white/10 shrink-0">
            <button
              onClick={onOpenMarketplace}
              className="size-11 rounded-2xl bg-white/5 hover:bg-white/10 hover:text-emerald-400 text-zinc-400 border border-dashed border-white/20 hover:border-emerald-400 flex items-center justify-center transition-all cursor-pointer"
              title="Découvrir d'autres entreprises"
            >
              <Plus className="size-5" />
            </button>
            <div className="absolute left-[72px] z-50 px-2.5 py-1 rounded-lg bg-[#181a22] text-xs font-semibold text-white border border-white/10 shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150">
              Découvrir de nouvelles offres
            </div>
          </div>
        </div>

        {/* SECONDARY ENTERPRISE SIDEBAR (Desktop Fixed) */}
        <aside className="hidden lg:flex w-64 shrink-0 border-r border-white/[0.08] bg-[#0e1014] flex-col justify-between select-none">
          {renderSidebarContent(false)}
        </aside>

        {/* MOBILE / TABLET SLIDING DRAWER */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <aside
              onClick={(e) => e.stopPropagation()}
              className="relative w-72 max-w-[85vw] bg-[#0c0d10] border-r border-white/10 shadow-2xl flex flex-col justify-between select-none z-10 animate-in slide-in-from-left duration-200 overflow-y-auto"
            >
              {renderSidebarContent(true)}
            </aside>
          </div>
        )}

        {/* MAIN WORKSPACE CONTENT */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#08090b] select-text">
        
        {/* ============================================================ */}
        {/* VIEW 1: VUE D'ACCUEIL DE L'ENTREPRISE (DARK MODE HAUT DE GAMME) */}
        {/* ============================================================ */}
        {activeTab === "accueil" && (
          <div className="w-full flex-1 flex flex-col pb-16 animate-in fade-in duration-150">
            
            {/* 1. EN-TÊTE VISUEL SELON LE MODE (COMPACT SANS BANNIÈRE OU STANDARD AVEC BANNIÈRE) */}
            {isCompact ? (
              /* ============================================================ */
              /* EN-TÊTE COMPACT (SANS BANNIÈRE ENCOMBRANTE)                  */
              /* Déterminé automatiquement selon la quantité/type d'éléments  */
              /* Préserve 100% des fonctionnalités sans perte d'espace        */
              /* ============================================================ */
              <div className="w-full bg-[#0d0f14] border-b border-white/[0.08] px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Boutons mobiles */}
                  <div className="lg:hidden flex items-center gap-1.5">
                    <button
                      onClick={() => setIsMobileSidebarOpen(true)}
                      className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-white min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
                      title="Menu entreprise"
                    >
                      <Menu className="size-4" />
                    </button>
                    {onBackToPersonal && (
                      <button
                        onClick={onBackToPersonal}
                        className="p-2 rounded-xl bg-white/[0.05] border border-white/10 text-zinc-300 min-h-[36px] flex items-center gap-1 text-xs cursor-pointer"
                        title="Retour"
                      >
                        <ChevronLeft className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Logo compact */}
                  <div
                    onClick={() => isCompanyOwner && setIsBrandingModalOpen(true)}
                    className={`relative size-11 sm:size-12 rounded-xl border border-white/15 bg-[#14161f] shadow-md overflow-hidden shrink-0 ${
                      isCompanyOwner ? "cursor-pointer group" : "cursor-default"
                    }`}
                    title={isCompanyOwner ? "Modifier le logo" : currentSub.companyName}
                  >
                    {currentSub.companyLogo ? (
                      <img
                        src={currentSub.companyLogo}
                        alt={currentSub.companyName}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-indigo-950 to-black flex items-center justify-center text-sm font-black text-white">
                        {currentSub.companyInitials || currentSub.companyName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {isCompanyOwner && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="size-3.5 text-emerald-400" />
                      </div>
                    )}
                  </div>

                  {/* Titre */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                        {currentSub.companyName}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>3 480 membres</span>
                      <span>·</span>
                      <span className="text-emerald-400 font-mono">1 420 en ligne</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Branding button pour créateur propriétaire */}
                  {isCompanyOwner && (
                    <button
                      onClick={() => setIsBrandingModalOpen(true)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-emerald-400 transition-all cursor-pointer"
                      title="Modifier la bannière et le logo"
                    >
                      <Camera className="size-4" />
                    </button>
                  )}

                  {/* Partage */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedProfileShare(true);
                      setTimeout(() => setCopiedProfileShare(false), 2500);
                    }}
                    className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                    title="Partager"
                  >
                    <Share2 className="size-4" />
                  </button>

                  {/* Bouton Rejoindre (vert cohérent avec le site, disparaît une fois rejoint) */}
                  {!isEnterpriseJoined && (
                    <button
                      onClick={handleJoinEnterprise}
                      className="px-3 py-1.5 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] active:scale-[0.98] text-black text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      Rejoindre
                    </button>
                  )}

                  {/* Options Menu ⋮ */}
                  <div className="relative" ref={optionsMenuRef}>
                    <button
                      onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}
                      className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white transition-all cursor-pointer"
                      title="Options"
                    >
                      <MoreVertical className="size-4" />
                    </button>
                    {optionsDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl p-1.5 z-30 space-y-0.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            setCopiedLinkToast(true);
                            setOptionsDropdownOpen(false);
                            setTimeout(() => setCopiedLinkToast(false), 3000);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-white/10 text-left"
                        >
                          <Share2 className="size-3.5 text-zinc-400" />
                          <span>COPIER LE LIEN</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsReportModalOpen(true);
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-rose-500/10 hover:text-rose-300 text-left"
                        >
                          <Flag className="size-3.5 text-rose-400" />
                          <span>SIGNALER</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsManageMembershipModalOpen(true);
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-white/10 text-left"
                        >
                          <ShieldCheck className="size-3.5 text-indigo-400" />
                          <span>GÉRER L’ADHÉSION</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Primary VIP Pass button */}
                  {hasPaidOffer ? (
                    <button
                      onClick={() => {
                        if (hasTelegramAccess) {
                          setActiveTab("telegram");
                          setTelegramFlowStep("channels_list");
                        } else if (hasDiscordAccess) {
                          setActiveTab("discord");
                          setDiscordFlowStep("channels_list");
                        } else {
                          setCompanyTab("produits");
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Accès VIP</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setCompanyTab("produits")}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="size-3.5 text-black" />
                      <span>Offres</span>
                      <ChevronRight className="size-3.5 text-black" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* ============================================================ */
              /* EN-TÊTE STANDARD (AVEC GRANDE BANNIÈRE VISUELLE)             */
              /* ============================================================ */
              <>
                <div className="relative w-full h-44 sm:h-64 md:h-72 lg:h-80 overflow-hidden bg-[#111216] select-none group">
                  <img
                    src={currentSub.companyBanner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85"}
                    alt={`Bannière ${currentSub.companyName}`}
                    className="w-full h-full object-cover object-center"
                  />
                  {/* Subtle gradient vignette to seamlessly transition to the dark canvas */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b0d] via-[#0a0b0d]/30 to-transparent pointer-events-none" />

                  {/* Bouton de configuration de la bannière */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
                    {isCompanyOwner && (
                      <button
                        onClick={() => setIsBrandingModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-semibold shadow-lg transition-all cursor-pointer active:scale-95"
                        title="Modifier la bannière et la photo de profil de l'entreprise"
                      >
                        <Camera className="size-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Configurer la bannière & logo</span>
                        <span className="sm:hidden">Bannière</span>
                      </button>
                    )}
                  </div>

                  {/* Mobile / Tablet Top Navigation Bar over Banner */}
                  <div className="absolute top-3 left-3 right-48 z-20 flex items-center justify-between lg:hidden pointer-events-auto">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="p-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-white flex items-center gap-1.5 shadow-lg min-h-[40px] min-w-[40px] justify-center cursor-pointer active:scale-95 transition-all"
                    title="Ouvrir le menu de l'entreprise"
                  >
                    <Menu className="size-4" />
                    <span className="text-xs font-semibold pr-1">Menu</span>
                  </button>
                  {onBackToPersonal && (
                    <button
                      onClick={onBackToPersonal}
                      className="px-2.5 py-2 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white flex items-center gap-1 text-xs font-medium shadow-lg min-h-[40px] cursor-pointer active:scale-95 transition-all"
                      title="Retour à mon espace"
                    >
                      <ChevronLeft className="size-3.5" />
                      <span className="hidden sm:inline">Mon Espace</span>
                    </button>
                  )}
                </div>
              </div>
              
              {/* Toast for profile link sharing */}
              {copiedProfileShare && (
                <div className="absolute top-14 right-3 z-20 px-3.5 py-2 rounded-xl bg-[#14151a] border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 shadow-xl animate-in fade-in slide-in-from-top-2">
                  <Check className="size-3.5 text-emerald-400" />
                  <span>Lien copié !</span>
                </div>
              )}
            </div>

            {/* 2. BLOC D'INFORMATIONS */}
            <div className="px-4 sm:px-8 lg:px-10 relative">
              {/* Photo de profil carrée aux coins arrondis superposée sur le coin inférieur gauche de la bannière */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 -mt-12 sm:-mt-18 md:-mt-22 mb-4">
                <div className="flex items-end gap-3 sm:gap-5">
                  <div
                    onClick={() => isCompanyOwner && setIsBrandingModalOpen(true)}
                    className={`relative size-24 sm:size-36 md:size-40 rounded-2xl sm:rounded-3xl border-4 border-[#0a0b0d] bg-[#14161f] shadow-2xl overflow-hidden shrink-0 ${
                      isCompanyOwner ? "group cursor-pointer" : "cursor-default select-none"
                    }`}
                    title={isCompanyOwner ? "Cliquer pour configurer la photo de profil / logo et la bannière" : currentSub.companyName}
                  >
                    {currentSub.companyLogo ? (
                      <img
                        src={currentSub.companyLogo}
                        alt={currentSub.companyName}
                        className={`size-full object-cover ${isCompanyOwner ? "group-hover:scale-105" : ""} transition-transform duration-300`}
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-indigo-950 via-slate-900 to-black flex items-center justify-center text-3xl sm:text-4xl font-black text-white">
                        {currentSub.companyInitials || currentSub.companyName.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {/* Hover overlay with Camera to edit - Uniquement pour le créateur propriétaire */}
                    {isCompanyOwner && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 select-none">
                        <Camera className="size-6 text-emerald-400" />
                        <span className="text-[11px] font-bold text-center px-1">Modifier logo</span>
                      </div>
                    )}
                    {/* Online status indicator */}
                    <span
                      className="absolute bottom-2 sm:bottom-2.5 right-2 sm:right-2.5 size-3 sm:size-4 rounded-full bg-emerald-400 ring-4 ring-[#0a0b0d]"
                      title="Espace d'entreprise actif"
                    />
                  </div>
                </div>

                {/* Des icônes d'action et de gestion alignées à l'extrême droite */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 self-start sm:self-end pt-1 sm:pt-0">
                  {/* Bouton Rejoindre (vert cohérent avec le site, disparaît une fois rejoint) */}
                  {!isEnterpriseJoined && (
                    <button
                      onClick={handleJoinEnterprise}
                      className="px-4 py-2.5 rounded-xl bg-[#00D26A] hover:bg-[#00B85C] active:scale-[0.98] text-black text-xs font-bold tracking-wide transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                    >
                      Rejoindre
                    </button>
                  )}

                  {/* Menu « ⋮ » de la page d'accueil de l'entreprise */}
                  <div className="relative" ref={optionsMenuRef}>
                    <button
                      onClick={() => setOptionsDropdownOpen(!optionsDropdownOpen)}
                      className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer shadow-sm"
                      title="Options de l'entreprise"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {optionsDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-[#14161f] border border-white/10 shadow-2xl p-1.5 z-30 space-y-0.5 animate-in fade-in duration-150">
                        {/* Action 1 : COPIER LE LIEN */}
                        <button
                          onClick={() => {
                            const publicUrl = window.location.href;
                            navigator.clipboard.writeText(publicUrl);
                            setCopiedLinkToast(true);
                            setOptionsDropdownOpen(false);
                            setTimeout(() => setCopiedLinkToast(false), 3000);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <Share2 className="size-3.5 text-zinc-400" />
                          <span>COPIER LE LIEN</span>
                        </button>

                        {/* Action 2 : SIGNALER */}
                        <button
                          onClick={() => {
                            setIsReportModalOpen(true);
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left cursor-pointer"
                        >
                          <Flag className="size-3.5 text-rose-400" />
                          <span>SIGNALER</span>
                        </button>

                        {/* Action 3 : GÉRER L'ADHÉSION */}
                        <button
                          onClick={() => {
                            setIsManageMembershipModalOpen(true);
                            setOptionsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-200 hover:bg-white/10 hover:text-white transition-colors text-left cursor-pointer"
                        >
                          <ShieldCheck className="size-3.5 text-indigo-400" />
                          <span>GÉRER L’ADHÉSION</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations textuelles & Métadonnées */}
              <div className="space-y-3 pt-1">
                {/* Le nom de l'entreprise affiché en gros caractères */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {currentSub.companyName}
                  </h1>
                </div>

                {/* Une ligne de métadonnées indiquant la localisation et le créateur */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs sm:text-sm text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-zinc-500 shrink-0" />
                    <span>Paris, France</span>
                  </div>
                  <span className="text-zinc-700 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <User className="size-3.5 text-zinc-500 shrink-0" />
                    <span>
                      Créé par <strong className="text-zinc-200 font-semibold">{subscription.companyName} Labs</strong>
                    </span>
                  </div>
                  <span className="text-zinc-700 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-zinc-500 shrink-0" />
                    <span>Membre depuis {subscription.subscribedAt || "Septembre 2026"}</span>
                  </div>
                </div>

                {/* Un compteur de membres accompagné des avatars circulaires superposés des derniers inscrits */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex -space-x-2 overflow-hidden shrink-0">
                    {[
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
                      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
                    ].map((avatarUrl, idx) => (
                      <img
                        key={idx}
                        src={avatarUrl}
                        alt="Membre inscrit"
                        className="inline-block size-7 sm:size-8 rounded-full ring-2 ring-[#0a0b0d] object-cover"
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <span className="font-bold text-white tracking-tight">3 480</span>
                    <span className="text-zinc-400">membres</span>
                    <span className="text-emerald-400 text-xs font-mono font-medium flex items-center gap-1.5 ml-1">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{subscription.onlineMembersCount || 1420} en ligne</span>
                    </span>
                  </div>
                </div>

                {/* Preview vs Joined Notice Banner */}
                {subscription.isCommunityPreview && !subscription.hasJoined ? (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-zinc-900/70 to-transparent border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg animate-in fade-in duration-150">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="size-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                        <Users className="size-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">
                          <span>Visite de l'entreprise {subscription.companyName}</span>
                        </div>
                        <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                          Vous explorez cette entreprise depuis l'onglet Découvrir. Si vous quittez sans rejoindre, elle disparaîtra de votre Communauté.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          const userKey = user?.email || "default";
                          const joinedSub: EnterpriseSubscription = {
                            ...subscription,
                            hasJoined: true,
                            isCommunityPreview: false,
                            productName: "Membre Officiel",
                          };
                          saveSubscription(userKey, joinedSub);
                          window.dispatchEvent(new CustomEvent("mansa_subscription_updated"));
                          window.dispatchEvent(
                            new CustomEvent("mansa_community_joined", { detail: { subId: subscription.id } })
                          );
                        }}
                        className="mansa-btn-green px-4 py-2 text-xs font-bold transition-all shrink-0 cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Rejoindre gratuitement</span>
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
            </>
            )}

            {/* 3. NAVIGATION INTERNE : BARRE D'ONGLETS HORIZONTALE */}
            {/* Comprenant "Accueil" (actif avec indicateur souligné en bleu), "Produits" et "Avis" */}
            <div className="mt-6 sm:mt-8 border-b border-white/[0.08] px-4 sm:px-8 lg:px-10 bg-[#0a0b0d] overflow-x-auto no-scrollbar">
              <nav className="flex items-center gap-6 sm:gap-8 -mb-px min-w-max">
                {/* Onglet Accueil (actif par défaut avec indicateur souligné en bleu) */}
                <button
                  onClick={() => setCompanyTab("accueil")}
                  className={`py-3.5 text-sm font-semibold transition-all cursor-pointer flex items-center gap-2 relative ${
                    companyTab === "accueil"
                      ? "text-white border-b-2 border-blue-500 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent"
                  }`}
                >
                  <Home className="size-4" />
                  <span>Accueil</span>
                </button>

                {/* Onglet Produits */}
                <button
                  onClick={() => setCompanyTab("produits")}
                  className={`py-3.5 text-sm transition-all cursor-pointer flex items-center gap-2 relative ${
                    companyTab === "produits"
                      ? "text-white border-b-2 border-blue-500 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent"
                  }`}
                >
                  <FileText className="size-4" />
                  <span>Produits</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[11px] text-zinc-400 font-mono">
                    {enterpriseOffers.length}
                  </span>
                </button>

                {/* Onglet Avis */}
                <button
                  onClick={() => setCompanyTab("avis")}
                  className={`py-3.5 text-sm transition-all cursor-pointer flex items-center gap-2 relative ${
                    companyTab === "avis"
                      ? "text-white border-b-2 border-blue-500 font-bold"
                      : "text-zinc-400 hover:text-zinc-200 border-b-2 border-transparent"
                  }`}
                >
                  <Star className="size-4 text-amber-400 fill-amber-400/20" />
                  <span>Avis</span>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    (142)
                  </span>
                </button>
              </nav>
            </div>

            {/* 4. ZONE DE CONTENU */}
            <div className="px-4 sm:px-8 lg:px-10 py-5 sm:py-8">
              
              {/* VUE CONTENU : ONGLET ACCUEIL (Flux de publications ou d'actualités propre à l'entreprise) */}
              {companyTab === "accueil" && (
                <div className="max-w-4xl space-y-6 animate-in fade-in duration-150">
                  {/* Section Fil d'actualité & Publications */}
                  <div id="company-newsfeed" className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Actualités & Publications officielles
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {companyPosts.length} publication{companyPosts.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {/* Formulaire de publication réservé au créateur de l'entreprise */}
                  {isCompanyOwner && (
                    <div className="rounded-2xl border border-white/[0.09] bg-[#111318] p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-2">
                          <PenLine className="size-4 text-blue-400" />
                          <span>Publier une actualité pour votre communauté</span>
                        </span>
                        {isPostComposerOpen && (
                          <button
                            type="button"
                            onClick={() => setIsPostComposerOpen(false)}
                            className="text-zinc-500 hover:text-zinc-300 text-xs cursor-pointer"
                          >
                            Fermer
                          </button>
                        )}
                      </div>

                      {!isPostComposerOpen ? (
                        <button
                          type="button"
                          onClick={() => setIsPostComposerOpen(true)}
                          className="w-full text-left px-4 py-3 rounded-xl bg-[#161822] border border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10 text-xs transition-colors cursor-pointer"
                        >
                          Partagez une nouvelle annonce, analyse ou mise à jour avec vos membres...
                        </button>
                      ) : (
                        <form onSubmit={handleCreatePost} className="space-y-3 pt-1">
                          <input
                            type="text"
                            value={newPostTitle}
                            onChange={(e) => setNewPostTitle(e.target.value)}
                            placeholder="Titre de l'actualité..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#161822] border border-white/10 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                          <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            placeholder="Rédigez le contenu de votre actualité pour vos membres..."
                            rows={4}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#161822] border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            required
                          />
                          <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={newPostPinned}
                                onChange={(e) => setNewPostPinned(e.target.checked)}
                                className="rounded bg-black/40 border-white/10 text-blue-600 focus:ring-0 cursor-pointer"
                              />
                              <span className="flex items-center gap-1.5">
                                <Pin className="size-3 text-zinc-400" />
                                <span>Épingler cette publication</span>
                              </span>
                            </label>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setIsPostComposerOpen(false)}
                                className="px-3.5 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                              >
                                Annuler
                              </button>
                              <button
                                type="submit"
                                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                              >
                                <Send className="size-3.5" />
                                <span>Publier l'actualité</span>
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}

                  {/* Flux des actualités propres à l'entreprise */}
                  {companyPosts.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-8 text-center space-y-2">
                      <p className="text-sm font-semibold text-white">Aucune actualité publiée pour le moment</p>
                      <p className="text-xs text-zinc-400">
                        Les actualités et annonces officielles publiées par {subscription.companyName} s'afficheront ici.
                      </p>
                    </div>
                  ) : (
                    companyPosts.map((post) => {
                      const isLiked = !!likedPostsMap[post.id];
                      const commentsList = postCommentsMap[post.id] || [];
                      const isCommentsOpen = !!expandedCommentsMap[post.id];

                      return (
                        <div
                          key={post.id}
                          className="rounded-2xl border border-white/[0.09] bg-[#111318] p-5 sm:p-6 space-y-4 hover:border-white/15 transition-all shadow-lg shadow-black/40"
                        >
                          {/* En-tête de la publication */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="size-10 rounded-xl bg-[#181a22] border border-white/10 overflow-hidden shrink-0">
                                {subscription.companyLogo ? (
                                  <img
                                    src={subscription.companyLogo}
                                    alt={subscription.companyName}
                                    className="size-full object-cover"
                                  />
                                ) : (
                                  <div className="size-full flex items-center justify-center text-xs font-black text-white bg-indigo-950">
                                    {subscription.companyInitials || "VIP"}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white truncate">
                                    {post.authorName || subscription.companyName}
                                  </span>
                                  <span className="size-1 rounded-full bg-zinc-600 shrink-0" />
                                  <span className="text-[11px] text-zinc-400 font-medium shrink-0">
                                    {post.createdAt}
                                  </span>
                                </div>
                                {post.pinned && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-blue-400 font-semibold pt-0.5">
                                    <Pin className="size-3" />
                                    <span>Publication Épinglée</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Bouton de suppression réservé au créateur */}
                            {isCompanyOwner && (
                              <button
                                onClick={() => handleDeletePost(post.id)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                                title="Supprimer cette publication"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Contenu textuel */}
                          <div className="space-y-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                              {post.title}
                            </h3>
                            <p className="whitespace-pre-line text-zinc-300">
                              {post.content}
                            </p>
                          </div>

                          {/* Métriques éventuelles */}
                          {post.metrics && post.metrics.length > 0 && (
                            <div className="p-4 rounded-xl bg-[#161820] border border-white/5 grid grid-cols-3 gap-3 text-center">
                              {post.metrics.map((m, mIdx) => (
                                <div key={mIdx} className="space-y-0.5">
                                  <div className="text-[11px] text-zinc-400">{m.label}</div>
                                  <div className="text-base sm:text-lg font-bold text-emerald-400 font-mono">
                                    {m.value}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Fichier joint éventuel */}
                          {post.attachment && (
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#161822] border border-white/5 text-xs">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 font-mono font-bold text-[10px]">
                                  {post.attachment.name.endsWith(".pdf") ? "PDF" : "DOC"}
                                </div>
                                <div>
                                  <div className="font-semibold text-white">{post.attachment.name}</div>
                                  <div className="text-[10px] text-zinc-500">{post.attachment.size} · Téléchargement</div>
                                </div>
                              </div>
                              <button
                                onClick={() => alert(`Téléchargement de ${post.attachment?.name}...`)}
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Download className="size-3" />
                                <span>Télécharger</span>
                              </button>
                            </div>
                          )}

                          {/* Barre d'interaction */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                            <div className="flex items-center gap-4">
                              <button
                                onClick={() => handleToggleLike(post)}
                                className={`flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg ${
                                  isLiked
                                    ? "text-rose-400 bg-rose-500/10 font-bold"
                                    : "hover:text-white hover:bg-white/5"
                                }`}
                              >
                                <Heart className={`size-3.5 ${isLiked ? "fill-rose-400" : ""}`} />
                                <span>{post.likesCount || 0}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedCommentsMap((prev) => ({
                                    ...prev,
                                    [post.id]: !prev[post.id],
                                  }))
                                }
                                className="flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                              >
                                <MessageCircle className="size-3.5" />
                                <span>
                                  {commentsList.length} commentaire{commentsList.length > 1 ? "s" : ""}
                                </span>
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                setCopiedProfileShare(true);
                                setTimeout(() => setCopiedProfileShare(false), 2500);
                              }}
                              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
                            >
                              <Share2 className="size-3.5" />
                              <span>Partager</span>
                            </button>
                          </div>

                          {/* Section commentaires */}
                          {isCommentsOpen && (
                            <div className="mt-2 space-y-3 rounded-xl border border-white/5 bg-black/10 p-3 pt-3">
                              {commentsList.length > 0 && (
                                <div className="space-y-2">
                                  {commentsList.map((reply, index) => (
                                    <div
                                      key={`${post.id}-reply-${index}`}
                                      className="border-b border-white/5 pb-2 last:border-0 last:pb-0"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-[11px] font-semibold text-white">
                                          {reply.author}
                                        </span>
                                        <span className="text-[10px] text-zinc-500">{reply.time}</span>
                                      </div>
                                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-300">
                                        {reply.text}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Formulaire ajout commentaire */}
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }}
                                className="flex gap-2 pt-1"
                              >
                                <input
                                  type="text"
                                  value={commentInputMap[post.id] || ""}
                                  onChange={(e) =>
                                    setCommentInputMap((prev) => ({
                                      ...prev,
                                      [post.id]: e.target.value,
                                    }))
                                  }
                                  placeholder="Écrire un commentaire..."
                                  className="flex-1 rounded-lg border border-white/10 bg-[#16171b] px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  type="submit"
                                  disabled={!(commentInputMap[post.id] || "").trim()}
                                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-xs transition-colors cursor-pointer"
                                >
                                  Envoyer
                                </button>
                              </form>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* VUE CONTENU : ONGLET PRODUITS */}
              {companyTab === "produits" && (
                <div className="space-y-6 animate-in fade-in duration-150 max-w-5xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {enterpriseOffers.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 py-12 px-6 rounded-2xl border border-white/10 bg-[#111318] text-center space-y-3">
                        <ShoppingBag className="size-10 text-zinc-500 mx-auto" />
                        <h4 className="text-base font-bold text-white">Aucune autre offre disponible</h4>
                        <p className="text-xs text-zinc-400 max-w-md mx-auto">
                          {subscription.companyName} n'a pas d'autres produits ou abonnements configurés pour le moment.
                        </p>
                      </div>
                    ) : (
                      enterpriseOffers.map((offer) => {
                        const isOfferTg =
                          offer.includedApps?.some((a) => a.toLowerCase().includes("telegram")) ||
                          offer.title.toLowerCase().includes("telegram");
                        const isOfferDc =
                          offer.includedApps?.some((a) => a.toLowerCase().includes("discord")) ||
                          offer.title.toLowerCase().includes("discord");
                        const isOfferEb =
                          offer.type === "ebook" ||
                          offer.includedApps?.some((a) => ["ebook", "guide", "pdf"].some((k) => a.toLowerCase().includes(k))) ||
                          offer.title.toLowerCase().includes("ebook");
                        const isOfferCo =
                          offer.type === "course" ||
                          offer.includedApps?.some((a) => ["cours", "formation", "masterclass", "course"].some((k) => a.toLowerCase().includes(k))) ||
                          offer.title.toLowerCase().includes("formation");

                        const isOfferUnlocked =
                          memberUnlockedOfferIds.includes(offer.id) ||
                          memberUnlockedOfferIds.some((id) => id.toLowerCase() === offer.id.toLowerCase());

                        return (
                          <div
                            key={offer.id}
                            className={`rounded-2xl border p-6 space-y-4 relative flex flex-col justify-between transition-all ${
                              isOfferUnlocked
                                ? "border-emerald-500/40 bg-[#12141c] shadow-lg shadow-emerald-500/5"
                                : "border-white/[0.08] bg-[#111318] hover:border-white/15"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                {isOfferTg ? (
                                  <TelegramIcon className="size-5 text-[#229ED9]" />
                                ) : isOfferDc ? (
                                  <DiscordIcon className="size-5 text-[#5865F2]" />
                                ) : isOfferEb ? (
                                  <BookOpen className="size-5 text-emerald-400" />
                                ) : isOfferCo ? (
                                  <GraduationCap className="size-5 text-indigo-400" />
                                ) : (
                                  <Package className="size-5 text-amber-400" />
                                )}
                              </div>

                              {/* Cadenas ouvert ou fermé selon si le produit a été débloqué ou pas */}
                              <div className="flex items-center gap-1.5">
                                {isOfferUnlocked ? (
                                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" title="Produit débloqué">
                                    <Unlock className="size-4" />
                                  </div>
                                ) : (
                                  <div className="p-1.5 rounded-lg bg-white/5 text-zinc-400 border border-white/10" title="Produit verrouillé">
                                    <Lock className="size-4" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-xs font-mono text-zinc-400">
                                {offer.categoryLabel || (isOfferTg ? "Canaux Privés Telegram" : isOfferDc ? "Communauté Discord" : isOfferEb ? "Guides PDF & E-books" : isOfferCo ? "Formation Vidéo" : "Offre Officielle")}
                              </div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-bold text-white">{offer.title}</h4>
                                {isOfferUnlocked ? (
                                  <Unlock className="size-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <Lock className="size-4 text-zinc-500 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed">
                                {offer.description || `Accédez aux services et avantages inclus dans l'offre ${offer.title}.`}
                              </p>
                            </div>

                            <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                              <span className="text-sm font-bold text-white font-mono">{offer.priceDisplay}</span>
                              {isOfferUnlocked ? (
                                <button
                                  onClick={() => {
                                    if (isOfferTg) {
                                      setActiveTab("telegram");
                                      setTelegramFlowStep("channels_list");
                                    } else if (isOfferDc) {
                                      setActiveTab("discord");
                                      setDiscordFlowStep("channels_list");
                                    } else if (isOfferEb) {
                                      setIsEbookModalOpen(true);
                                    } else if (isOfferCo) {
                                      setIsCourseModalOpen(true);
                                    } else {
                                      setActiveTab("accueil");
                                    }
                                  }}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <span>Accéder</span>
                                  <ChevronRight className="size-3" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => setCheckoutModalOffer(offer)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-md shadow-emerald-500/20"
                                >
                                  <span>Débloquer l'accès</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* VUE CONTENU : ONGLET AVIS */}
              {companyTab === "avis" && (
                <div className="space-y-6 animate-in fade-in duration-150 max-w-4xl">
                  {/* Rating summary */}
                  <div className="rounded-2xl border border-white/[0.08] bg-[#111318] p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="text-center sm:text-left space-y-1">
                      <div className="text-4xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
                        <span>4.9</span>
                        <Star className="size-6 text-amber-400 fill-amber-400" />
                      </div>
                      <p className="text-xs text-zinc-400">Basé sur 142 avis vérifiés de membres</p>
                    </div>
                    <div className="flex-1 w-full space-y-1.5 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="w-12">5 étoiles</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="w-[92%] h-full bg-amber-400 rounded-full" />
                        </div>
                        <span className="w-8 text-right font-mono">92%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="w-12">4 étoiles</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="w-[6%] h-full bg-amber-400/80 rounded-full" />
                        </div>
                        <span className="w-8 text-right font-mono">6%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400">
                        <span className="w-12">3 étoiles</span>
                        <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                          <div className="w-[2%] h-full bg-amber-400/50 rounded-full" />
                        </div>
                        <span className="w-8 text-right font-mono">2%</span>
                      </div>
                    </div>
                  </div>

                  {/* Individual reviews list */}
                  <div className="space-y-4">
                    {[
                      {
                        name: "Marc K.",
                        date: "Il y a 3 jours",
                        rating: 5,
                        text: "Qualité exceptionnelle des analyses et rigueur impressionnante sur la gestion de risque. Les alertes Telegram arrivent avec une réactivité parfaite.",
                        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
                      },
                      {
                        name: "Sarah T.",
                        date: "Il y a 1 semaine",
                        rating: 5,
                        text: "L'interface d'accueil est super propre et la liaison avec le bot Discord s'est faite en un clic. Excellent support réactif.",
                        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
                      },
                      {
                        name: "Ibrahim D.",
                        date: "Il y a 2 semaines",
                        rating: 5,
                        text: "Très bon accompagnement. Les synthèses hebdomadaires et les fiches PDF sont claires et directement exploitables.",
                        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
                      },
                    ].map((rev, i) => (
                      <div key={i} className="p-5 rounded-2xl border border-white/[0.08] bg-[#111318] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <img src={rev.avatar} alt={rev.name} className="size-8 rounded-full object-cover" />
                            <div>
                              <div className="text-xs font-bold text-white">{rev.name}</div>
                              <div className="text-[10px] text-zinc-500">{rev.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: rev.rating }).map((_, starIdx) => (
                              <Star key={starIdx} className="size-3.5 text-amber-400 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">{rev.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 2: SUPPORT CHAT                                         */}
        {/* ============================================================ */}
        {activeTab === "support" && (
          <div className="p-3.5 sm:p-6 md:p-8 max-w-3xl mx-auto w-full flex flex-col h-full space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                  title="Ouvrir le menu"
                >
                  <Menu className="size-4" />
                </button>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-white">Assistance {subscription.companyName}</h1>
                  <p className="text-xs text-zinc-400">Échangez en direct avec l'équipe pour toute question ou aide</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-emerald-400 font-mono font-medium hidden sm:inline">En ligne</span>
              </div>
            </div>

            {/* Chat message box */}
            <div className="flex-1 rounded-2xl border border-white/10 bg-[#121316] p-4 overflow-y-auto space-y-3 min-h-[340px]">
              {supportChatList.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-[#0055ff] text-white rounded-br-none"
                        : "bg-[#1c1e24] text-zinc-200 border border-white/5 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-zinc-500 mt-1 font-mono px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendSupport} className="flex gap-2">
              <input
                type="text"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Écrivez votre message à l'équipe..."
                className="flex-1 rounded-xl border border-white/10 bg-[#16171b] px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-[#0055ff] focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="size-3.5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 3: TELEGRAM CONNECTED APP & CHANNELS                     */}
        {/* ============================================================ */}
        {activeTab === "telegram" && (
          <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] overflow-y-auto">
            {/* Top header on mobile for opening sidebar if on small screen */}
            <div className="lg:hidden w-full h-12 px-3 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Ouvrir le menu"
              >
                <Menu className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                <TelegramIcon className="size-4" />
                <span className="text-xs font-bold text-white">Telegram</span>
              </div>
              <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <ConnectedAppsView
                lang={lang}
                initialSubView="telegram"
                companyName={subscription.companyName}
                companyId={companyId}
                availableProducts={enterpriseOffers.map((offer) => ({
                  id: offer.id,
                  title: offer.title,
                  priceDisplay: offer.priceDisplay,
                  subscribersCount: offer.subscribersCount || 0,
                }))}
                onBackToDashboard={() => setActiveTab("accueil")}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW: APPLICATIONS & INTEGRATIONS CATALOG                    */}
        {/* ============================================================ */}
        {activeTab === "applications" && (
          <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] overflow-y-auto">
            {/* Top header on mobile for opening sidebar if on small screen */}
            <div className="lg:hidden w-full h-12 px-3 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Ouvrir le menu"
              >
                <Menu className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                <Plus className="size-4 text-blue-400" />
                <span className="text-xs font-bold text-white">Applications</span>
              </div>
              <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <ConnectedAppsView
                lang={lang}
                initialSubView="catalog"
                companyName={subscription.companyName}
                companyId={companyId}
                availableProducts={enterpriseOffers.map((offer) => ({
                  id: offer.id,
                  title: offer.title,
                  priceDisplay: offer.priceDisplay,
                  subscribersCount: offer.subscribersCount || 0,
                }))}
                onOpenCoursesWorkflow={(productIds) => {
                  setSelectedCreatorApp("courses");
                  setLinkedCreatorProductIds(productIds.length > 0 ? productIds : (selectedPreviewOfferId ? [selectedPreviewOfferId] : []));
                  const saved = JSON.parse(localStorage.getItem(`mansa_creator_courses_${companyId}`) || "[]");
                  setCreatorCourses(Array.isArray(saved) ? saved : []);
                  setEditingCreatorCourseId(null);
                  setCourseCreationStep("library");
                  setCreatorAppStep("content");
                }}
                onOpenFilesWorkflow={(productIds) => {
                  setSelectedCreatorApp("files");
                  setLinkedCreatorProductIds(productIds.length > 0 ? productIds : (selectedPreviewOfferId ? [selectedPreviewOfferId] : []));
                  setCreatorFileName("");
                  setCreatorAppStep("content");
                }}
                onBackToDashboard={() => setActiveTab("accueil")}
              />
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* VIEW 4: DISCORD CONNECTED APP & SERVERS                       */}
        {/* ============================================================ */}
        {activeTab === "discord" && (
          <div className="flex-1 flex flex-col h-full bg-[#0a0b0e] overflow-y-auto">
            {/* Top header on mobile for opening sidebar if on small screen */}
            <div className="lg:hidden w-full h-12 px-3 border-b border-white/[0.08] bg-[#0c0d11] flex items-center justify-between shrink-0 select-none">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                title="Ouvrir le menu"
              >
                <Menu className="size-4" />
              </button>
              <div className="flex items-center gap-2">
                <DiscordIcon className="size-4" />
                <span className="text-xs font-bold text-white">Discord</span>
              </div>
              <div className="w-8" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <ConnectedAppsView
                lang={lang}
                initialSubView="discord"
                companyName={subscription.companyName}
                companyId={companyId}
                availableProducts={enterpriseOffers.map((offer) => ({
                  id: offer.id,
                  title: offer.title,
                  priceDisplay: offer.priceDisplay,
                  subscribersCount: offer.subscribersCount || 0,
                }))}
                onBackToDashboard={() => setActiveTab("accueil")}
              />
            </div>
          </div>
        )}

      </div>

      {/* Creator-only publication composer */}
      {isCompanyOwner && companyTab === "accueil" && (
        <>
          <button
            type="button"
            onClick={() => setIsPostComposerOpen(true)}
            aria-label="Créer une publication"
            title="Créer une publication"
            className="absolute bottom-6 right-6 z-30 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-950/50 transition-all hover:scale-105 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-[#08090b] cursor-pointer"
          >
            <PenLine className="size-6" />
          </button>

          {isPostComposerOpen && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="post-composer-title"
                className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#111214] shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center overflow-hidden rounded-full bg-[#252830] text-xs font-bold text-white">
                      {user.avatarInitials || currentSub.companyInitials || "JO"}
                    </div>
                    <div>
                      <h2 id="post-composer-title" className="text-sm font-bold text-white">Créer une publication</h2>
                      <p className="text-[11px] text-zinc-500">Publication officielle de {currentSub.companyName}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPostComposerOpen(false)}
                    aria-label="Fermer la fenêtre de publication"
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div className="p-5">
                  <textarea
                    autoFocus
                    value={postText}
                    onChange={(event) => setPostText(event.target.value)}
                    placeholder="À quoi pensez-vous ?"
                    aria-label="Texte de la publication"
                    className="min-h-[180px] w-full resize-none rounded-xl border border-white/10 bg-[#0b0c0e] p-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-blue-500/70"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 px-5 py-4">
                  <button type="button" title="Ajouter une image" aria-label="Ajouter une image" className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-400/10 cursor-pointer">
                    <ImageIcon className="size-5" />
                  </button>
                  <button type="button" title="Ajouter un GIF" aria-label="Ajouter un GIF" className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-400/10 cursor-pointer">
                    <span className="text-xs font-black">GIF</span>
                  </button>
                  <button type="button" title="Ajouter un emoji" aria-label="Ajouter un emoji" className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-400/10 cursor-pointer">
                    <Smile className="size-5" />
                  </button>
                  <button type="button" title="Ajouter un sondage ou des statistiques" aria-label="Ajouter un sondage ou des statistiques" className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-400/10 cursor-pointer">
                    <BarChart3 className="size-5" />
                  </button>
                  <button type="button" title="Ajouter une contribution payante" aria-label="Ajouter une contribution payante" className="rounded-lg p-2 text-blue-400 transition-colors hover:bg-blue-400/10 cursor-pointer">
                    <DollarSign className="size-5" />
                  </button>

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPostComposerOpen(false)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-500 cursor-pointer"
                    >
                      <Video className="size-4" />
                      <span>Passer en direct</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePublishPost}
                      className="rounded-full bg-blue-600 px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-blue-500 cursor-pointer"
                    >
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Checkout Modal if user clicks on locked Telegram / Discord / Product offer */}
      {checkoutModalOffer && (
        <OfferCheckoutModal
          isOpen={!!checkoutModalOffer}
          offer={checkoutModalOffer}
          onClose={() => setCheckoutModalOffer(null)}
          onPaymentSuccess={(newSub) => {
            // Update includedApps and unlockedProductIds for current enterprise
            const updatedApps = Array.from(new Set([...currentIncludedApps, ...(newSub.includedApps || [])]));
            const newOfferIds = [
              ...(newSub.unlockedProductIds || []),
              ...(newSub.purchasedOfferIds || []),
              ...(newSub.productId && !newSub.productId.includes("free") ? [newSub.productId] : []),
            ];
            const updatedUnlockedIds = Array.from(
              new Set([...unlockedProductIds, ...newOfferIds])
            );
            setCurrentIncludedApps(updatedApps);
            setUnlockedProductIds(updatedUnlockedIds);
            setHasPaidOffer(true);
            const userKey = user?.email || "default";
            const updatedSubscription: EnterpriseSubscription = {
              ...currentSub,
              hasPaidOffer: true,
              includedApps: updatedApps,
              unlockedProductIds: updatedUnlockedIds,
              purchasedOfferIds: updatedUnlockedIds,
              productName: currentSub.hasPaidOffer && currentSub.productName !== newSub.productName
                ? `${currentSub.productName} + ${newSub.productName}`
                : newSub.productName,
              priceDisplay: newSub.priceDisplay || currentSub.priceDisplay,
              telegramChannels: (newSub.telegramChannels && newSub.telegramChannels.length > 0)
                ? newSub.telegramChannels
                : currentSub.telegramChannels,
              discordChannels: (newSub.discordChannels && newSub.discordChannels.length > 0)
                ? newSub.discordChannels
                : currentSub.discordChannels,
              discordInvite: newSub.discordInvite || currentSub.discordInvite,
            };
            saveSubscription(userKey, updatedSubscription);
            setCurrentSub(updatedSubscription);
            setCheckoutModalOffer(null);
          }}
          user={user}
        />
      )}

      {/* Enterprise Branding Configuration Modal - Restreint exclusivement au créateur propriétaire */}
      {isCompanyOwner && (
        <EnterpriseBrandingModal
          isOpen={isBrandingModalOpen}
          onClose={() => setIsBrandingModalOpen(false)}
          company={{
            id: currentSub.companyId,
            name: currentSub.companyName,
            description: currentSub.productName,
            companyBanner: currentSub.companyBanner,
            companyLogo: currentSub.companyLogo,
          }}
          onSave={handleSaveBranding}
          lang={lang}
        />
      )}

      {/* Mini-page / Modal Dédiée : Gérer l'Adhésion */}
      <ManageMembershipModal
        isOpen={isManageMembershipModalOpen}
        onClose={() => setIsManageMembershipModalOpen(false)}
        subscription={currentSub}
        onCancelSubscription={handleCancelActiveSubscription}
        onLeaveCompany={handleLeaveEnterprise}
        onViewOffers={() => {
          setIsManageMembershipModalOpen(false);
          setCompanyTab("produits");
        }}
        lang={lang}
      />

      {/* Interface de signalement d'une entreprise */}
      <ReportEnterpriseModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        companyName={currentSub.companyName || subscription.companyName}
      />

      {/* Toast notification de confirmation : ✅ Lien copié */}
      {copiedLinkToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/30 text-white shadow-2xl shadow-black/80">
            <span className="text-base">✅</span>
            <span className="text-sm font-semibold">Lien copié</span>
          </div>
        </div>
      )}

      {/* Notification Toasts pour Téléchargement E-book & Accès Formation */}
      {ebookDownloadToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-emerald-500/40 text-emerald-300 shadow-2xl shadow-black/80">
            <BookOpen className="size-4 text-emerald-400" />
            <span className="text-sm font-semibold">{ebookDownloadToast}</span>
          </div>
        </div>
      )}

      {courseAccessToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-none">
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 border border-indigo-500/40 text-indigo-300 shadow-2xl shadow-black/80">
            <GraduationCap className="size-4 text-indigo-400" />
            <span className="text-sm font-semibold">{courseAccessToast}</span>
          </div>
        </div>
      )}

      {/* Modal Consultation E-book (ressources strictement rattachées aux offres débloquées) */}
      {isEbookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[#12141c] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <BookOpen className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">E-books & Guides Inclus</h3>
                  <p className="text-xs text-zinc-400">{currentSub.companyName} · Accès selon votre offre</p>
                </div>
              </div>
              <button
                onClick={() => setIsEbookModalOpen(false)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* E-books débloqués par l'offre achetée */}
              {authorizedEbooks.length > 0 ? (
                authorizedEbooks.map((eb) => (
                  <div key={eb.id} className="p-4 rounded-xl bg-[#161822] border border-emerald-500/30 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{eb.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {eb.pagesCount ? `${eb.pagesCount} pages · ` : ""}
                        {eb.description || "Format PDF haute résolution"}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
                        <CheckCircle2 className="size-3" />
                        <span>Inclus dans votre offre</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleDownloadEbook(eb)}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Télécharger
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1.5">
                  <div className="text-xs font-bold text-amber-300">Aucun e-book débloqué avec votre offre actuelle</div>
                  <p className="text-[11px] text-zinc-400">
                    Cette ressource requiert une offre spécifique incluant les guides téléchargeables.
                  </p>
                </div>
              )}

              {/* Autres E-books de l'entreprise non débloqués */}
              {otherCompanyEbooks.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <Lock className="size-3 text-zinc-500" />
                    <span>Autres e-books de l'entreprise</span>
                  </div>
                  {otherCompanyEbooks.map(({ ebook, requiredOffer }) => (
                    <div key={ebook.id} className="p-3.5 rounded-xl bg-[#0e1017] border border-white/5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-300 truncate">{ebook.title}</div>
                        <div className="text-[10px] text-amber-400/90 font-medium mt-0.5 flex items-center gap-1">
                          <Lock className="size-2.5" />
                          <span>Requis : {requiredOffer.title} ({requiredOffer.priceDisplay})</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsEbookModalOpen(false);
                          setActiveTab("accueil");
                          setCompanyTab("produits");
                          setCheckoutModalOffer(requiredOffer);
                        }}
                        className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                      >
                        Débloquer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsEbookModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {creatorAppStep !== "closed" && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[#12141c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">{currentSub.companyName}</div>
                <h2 className="mt-1 text-lg font-bold text-white">
                  {creatorAppStep === "choose" ? "Ajouter une application" : creatorAppStep === "link" ? "Accès à l’application" : `Configurer ${selectedCreatorApp ? creatorAppMeta[selectedCreatorApp].title : "l’application"}`}
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  {creatorAppStep === "choose" ? "Choisissez l’application à ajouter à cette entreprise." : creatorAppStep === "link" ? "Définissez quels produits peuvent accéder à cette application." : "Ajoutez ou modifiez le contenu sans quitter la Communauté."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreatorAppStep("closed")}
                className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
                aria-label="Fermer"
              >
                <X className="size-5" />
              </button>
            </div>

            {creatorAppStep === "choose" && (
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {(Object.keys(creatorAppMeta) as CreatorAppId[]).map((appId) => (
                  <button
                    type="button"
                    key={appId}
                    onClick={() => chooseCreatorApp(appId)}
                    className="rounded-xl border border-white/10 bg-[#0c0d0e] p-4 text-left transition-colors hover:border-blue-500/50 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-2xl">{creatorAppMeta[appId].icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{creatorAppMeta[appId].title}</div>
                        <div className="mt-1 text-[11px] leading-relaxed text-zinc-400">{creatorAppMeta[appId].description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {creatorAppStep === "link" && selectedCreatorApp && (
              <div className="space-y-4 p-5">
                <div className="rounded-xl border border-white/10 bg-[#0c0d0e] p-3 text-xs text-zinc-300">
                  Application sélectionnée : <strong className="text-white">{creatorAppMeta[selectedCreatorApp].title}</strong>
                </div>
                <div className="space-y-2">
                  {enterpriseOffers.length === 0 ? (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300">Créez d’abord un produit pour lier cette application.</div>
                  ) : enterpriseOffers.map((offer) => {
                    const checked = linkedCreatorProductIds.includes(offer.id);
                    return (
                      <label key={offer.id} className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-[#0c0d0e] px-4 py-3 hover:border-white/20">
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-white">{offer.title}</span>
                          <span className="mt-1 block text-[11px] text-zinc-500">{offer.subscribersCount || 0} actif(s) · {offer.priceDisplay || "Gratuit"}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => setLinkedCreatorProductIds((ids) => checked ? ids.filter((id) => id !== offer.id) : [...ids, offer.id])}
                          className="size-4 accent-blue-500"
                        />
                      </label>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <button type="button" onClick={() => setCreatorAppStep("choose")} className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Retour</button>
                  <button type="button" disabled={linkedCreatorProductIds.length === 0} onClick={continueCreatorAppContent} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">{selectedCreatorApp === "courses" || selectedCreatorApp === "files" ? "Fait · Ajouter le contenu" : `Continuer vers ${selectedCreatorApp === "telegram" ? "Telegram" : "Discord"}`}</button>
                </div>
              </div>
            )}

            {creatorAppStep === "content" && selectedCreatorApp && (
              <div className="space-y-4 p-5">
                {(selectedCreatorApp === "courses" || selectedCreatorApp === "files") && (
                  <>
                    {selectedCreatorApp === "courses" && courseCreationStep === "library" && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-white">Cours du produit</h3>
                            <p className="mt-1 text-[11px] text-zinc-500">Créez plusieurs cours et rattachez chacun aux produits concernés.</p>
                          </div>
                          <span className="text-[11px] text-zinc-500">{creatorCourses.filter((course) => course.productIds.some((id) => linkedCreatorProductIds.includes(id))).length} cours</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <button type="button" onClick={startNewCreatorCourse} className="flex min-h-36 flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#0c0d0e] text-zinc-400 transition-colors hover:border-blue-500/60 hover:bg-blue-500/5 hover:text-white">
                            <span className="mb-2 flex size-10 items-center justify-center rounded-full border border-white/15 text-2xl">+</span>
                            <span className="text-sm font-semibold">Ajouter un cours</span>
                          </button>
                          {creatorCourses.filter((course) => course.productIds.some((id) => linkedCreatorProductIds.includes(id))).map((course) => (
                            <button type="button" key={course.id} onClick={() => editCreatorCourse(course)} className={`min-h-36 rounded-xl border p-4 text-left transition-colors ${editingCreatorCourseId === course.id ? "border-blue-500/60 bg-blue-500/10" : "border-white/10 bg-[#0c0d0e] hover:border-white/25"}`}>
                              <div className="flex items-start justify-between gap-2"><span className="flex size-9 items-center justify-center rounded-lg bg-purple-500/15 text-lg">🎓</span><PenLine className="size-3.5 text-zinc-500" /></div>
                              <div className="mt-4 line-clamp-2 text-sm font-bold text-white">{course.title || "Cours sans titre"}</div>
                              <div className="mt-1 text-[11px] text-zinc-500">{course.chapters.length} chapitre(s) · Modifier</div>
                            </button>
                          ))}
                        </div>
                        {!editingCreatorCourseId && <div className="rounded-xl border border-white/10 bg-[#0c0d0e] px-4 py-3 text-xs text-zinc-400">Sélectionnez un cours existant ou cliquez sur <strong className="text-white">Ajouter un cours</strong> pour ouvrir son éditeur.</div>}
                      </div>
                    )}
                    {selectedCreatorApp === "courses" && courseCreationStep === "details" && (
                      <div className="space-y-4 rounded-xl border border-white/10 bg-[#0c0d0e] p-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">Informations du cours</h3>
                          <p className="mt-1 text-[11px] text-zinc-500">Définissez les informations principales avant d’ajouter les vidéos et les chapitres.</p>
                        </div>
                        <label className="block space-y-1.5"><span className="text-xs font-semibold text-zinc-300">Nom du cours</span><input value={creatorCourseName} onChange={(event) => setCreatorCourseName(event.target.value)} placeholder="Ex. Formation Trading débutant" className="w-full rounded-xl border border-white/10 bg-[#161822] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></label>
                        <label className="block space-y-1.5"><span className="text-xs font-semibold text-zinc-300">Description</span><textarea value={creatorCourseDescription} onChange={(event) => setCreatorCourseDescription(event.target.value)} rows={4} placeholder="Présentez le contenu et les objectifs du cours" className="w-full resize-none rounded-xl border border-white/10 bg-[#161822] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></label>
                        <label className="block space-y-1.5"><span className="text-xs font-semibold text-zinc-300">Miniature ou couverture</span><input type="file" accept="image/*" onChange={(event) => setCreatorCourseCoverFileName(event.target.files?.[0]?.name || "")} className="block w-full rounded-xl border border-dashed border-white/20 bg-[#161822] px-3 py-4 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />{creatorCourseCoverFileName && <span className="block truncate text-[10px] text-emerald-400">{creatorCourseCoverFileName}</span>}</label>
                        <div className="flex items-center justify-between border-t border-white/10 pt-4"><button type="button" onClick={() => setCourseCreationStep("library")} className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Retour aux cours</button><button type="button" disabled={!creatorCourseName.trim() || !creatorCourseDescription.trim()} onClick={continueCourseDetails} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40">Valider et continuer</button></div>
                      </div>
                    )}
                    {selectedCreatorApp !== "courses" || (editingCreatorCourseId && courseCreationStep === "content") ? (
                    <>
                    {selectedCreatorApp !== "courses" && <label className="block space-y-1.5">
                      <span className="text-xs font-semibold text-zinc-300">Nom du fichier</span>
                      <input value={creatorFileName} onChange={(event) => setCreatorFileName(event.target.value)} placeholder="Ex. Guide PDF premium" className="w-full rounded-xl border border-white/10 bg-[#0c0d0e] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                    </label>}
                    {selectedCreatorApp === "courses" ? (
                      <>
                        <div className="grid gap-3 md:grid-cols-2">
                          <label className="block space-y-1.5 md:col-span-2"><span className="text-xs font-semibold text-zinc-300">Intégrer une vidéo YouTube</span><input type="url" value={creatorYoutubeUrl} onChange={(event) => setCreatorYoutubeUrl(event.target.value)} placeholder="Collez un lien YouTube" className="w-full rounded-xl border border-white/10 bg-[#0c0d0e] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500" /></label>
                          <label className="block space-y-1.5"><span className="text-xs font-semibold text-zinc-300">Uploader une vidéo</span><input type="file" accept="video/*" onChange={(event) => setCreatorVideoFileName(event.target.files?.[0]?.name || "")} className="block w-full rounded-xl border border-dashed border-white/20 bg-[#0c0d0e] px-3 py-3 text-xs text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-purple-600 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white" />{creatorVideoFileName && <span className="block truncate text-[10px] text-emerald-400">{creatorVideoFileName}</span>}</label>
                          <label className="block space-y-1.5"><span className="text-xs font-semibold text-zinc-300">Uploader une pièce jointe</span><input type="file" onChange={(event) => setCreatorAttachmentFileName(event.target.files?.[0]?.name || "")} className="block w-full rounded-xl border border-dashed border-white/20 bg-[#0c0d0e] px-3 py-3 text-xs text-zinc-400 file:mr-2 file:rounded-lg file:border-0 file:bg-blue-600 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:text-white" />{creatorAttachmentFileName && <span className="block truncate text-[10px] text-emerald-400">{creatorAttachmentFileName}</span>}</label>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-[#0c0d0e] p-4">
                          <div className="mb-3 flex items-center justify-between"><span className="text-xs font-semibold text-white">Chapitres</span><span className="text-[10px] text-zinc-500">YouTube · vidéo · pièces jointes · texte</span></div>
                          <div className="space-y-3">{creatorChapterNames.map((chapter, index) => <div key={`${chapter}-${index}`} className="rounded-xl border border-white/10 bg-[#161822] p-3"><div className="flex items-center gap-2"><input value={chapter} onChange={(event) => setCreatorChapterNames((chapters) => chapters.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} placeholder="Nom du chapitre" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#0c0d0e] px-3 py-2 text-xs text-white outline-none" /><button type="button" onClick={() => { setCreatorChapterNames((chapters) => chapters.filter((_, itemIndex) => itemIndex !== index)); setCreatorChapterContents((contents) => contents.filter((_, itemIndex) => itemIndex !== index)); }} className="rounded-lg p-2 text-zinc-500 hover:bg-white/5 hover:text-red-300"><X className="size-3.5" /></button></div><textarea value={creatorChapterContents[index] || ""} onChange={(event) => setCreatorChapterContents((contents) => contents.map((content, contentIndex) => contentIndex === index ? event.target.value : content))} rows={5} placeholder="Écrivez le contenu texte de ce chapitre..." className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-[#0c0d0e] px-3 py-2.5 text-xs leading-relaxed text-white outline-none focus:border-blue-500" /></div>)}</div>
                          <div className="mt-3 flex gap-2"><input value={creatorNewChapterName} onChange={(event) => setCreatorNewChapterName(event.target.value)} placeholder="Nom du nouveau chapitre" className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#161822] px-3 py-2 text-xs text-white outline-none" /><button type="button" onClick={() => { if (creatorNewChapterName.trim()) { setCreatorChapterNames((chapters) => [...chapters, creatorNewChapterName.trim()]); setCreatorChapterContents((contents) => [...contents, ""]); setCreatorNewChapterName(""); } }} className="rounded-lg bg-white/10 px-3 text-xs font-semibold text-white hover:bg-white/15">+ Chapitre</button></div>
                        </div>
                      </>
                    ) : (
                      <label className="block space-y-1.5"><span className="text-xs font-semibold text-zinc-300">Contenu du fichier</span><input type="file" className="block w-full rounded-xl border border-dashed border-white/20 bg-[#0c0d0e] px-3 py-5 text-xs text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" /></label>
                    )}
                    </>
                    ) : null}
                  </>
                )}
                {(selectedCreatorApp === "telegram" || selectedCreatorApp === "discord") && (
                  <div className="rounded-xl border border-white/10 bg-[#0c0d0e] p-5 text-center">
                    <div className="text-3xl">{creatorAppMeta[selectedCreatorApp].icon}</div>
                    <p className="mt-2 text-sm font-semibold text-white">Configurer {creatorAppMeta[selectedCreatorApp].title}</p>
                    <p className="mt-1 text-xs text-zinc-400">Les produits sélectionnés sont enregistrés. Continuez la connexion du canal ou du serveur depuis l’onglet correspondant de cette entreprise.</p>
                  </div>
                )}
                {(!selectedCreatorApp || selectedCreatorApp !== "courses" || courseCreationStep === "content") && <div className="flex items-center justify-between border-t border-white/10 pt-4"><button type="button" onClick={() => setCreatorAppStep("link")} className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white">Retour</button><button type="button" onClick={finishCreatorAppWorkflow} className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500">Enregistrer dans cette entreprise</button></div>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Consultation Formation / Masterclass (ressources strictement rattachées aux offres débloquées) */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl bg-[#12141c] border border-white/10 p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Formations & Modules Inclus</h3>
                  <p className="text-xs text-zinc-400">{currentSub.companyName} · Accès selon votre offre</p>
                </div>
              </div>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="size-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {/* Formations débloquées par l'offre achetée */}
              {authorizedCourses.length > 0 ? (
                authorizedCourses.map((co) => (
                  <div key={co.id} className="p-4 rounded-xl bg-[#161822] border border-purple-500/30 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{co.title}</div>
                      <div className="text-xs text-zinc-400 mt-0.5">
                        {co.duration ? `${co.duration} · ` : ""}
                        {co.description || "Formation complète"}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 mt-1">
                        <CheckCircle2 className="size-3" />
                        <span>Inclus dans votre offre</span>
                      </span>
                    </div>
                    <button
                      onClick={() => handleAccessCourse(co)}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                    >
                      Accéder au cours
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1.5">
                  <div className="text-xs font-bold text-amber-300">Aucune formation débloquée avec votre offre actuelle</div>
                  <p className="text-[11px] text-zinc-400">
                    Cette ressource requiert une offre spécifique incluant les cursus vidéos de formation.
                  </p>
                </div>
              )}

              {/* Autres Formations de l'entreprise non débloquées */}
              {otherCompanyCourses.length > 0 && (
                <div className="pt-2 space-y-2">
                  <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                    <Lock className="size-3 text-zinc-500" />
                    <span>Autres formations de l'entreprise</span>
                  </div>
                  {otherCompanyCourses.map(({ course, requiredOffer }) => (
                    <div key={course.id} className="p-3.5 rounded-xl bg-[#0e1017] border border-white/5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-zinc-300 truncate">{course.title}</div>
                        <div className="text-[10px] text-amber-400/90 font-medium mt-0.5 flex items-center gap-1">
                          <Lock className="size-2.5" />
                          <span>Requis : {requiredOffer.title} ({requiredOffer.priceDisplay})</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setIsCourseModalOpen(false);
                          setActiveTab("accueil");
                          setCompanyTab("produits");
                          setCheckoutModalOffer(requiredOffer);
                        }}
                        className="px-2.5 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer shrink-0"
                      >
                        Débloquer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
