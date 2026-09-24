import React, { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Check,
  Copy,
  RefreshCw,
  Trash2,
  ChevronLeft,
  Video,
  ExternalLink,
  ShieldCheck,
  Users,
  MessageSquare,
  Sparkles,
  Layers,
  ArrowRight,
  HelpCircle,
  Bell,
  Link as LinkIcon,
  CheckCircle2,
  X,
  Bot,
  Zap,
  Info,
  Radio,
  Share2,
  Send,
  Smartphone,
  Eye,
  Server,
} from "lucide-react";
import { CustomerPurchasesView } from "./CustomerPurchasesView";
import { ModalOverlay } from "../common/ModalOverlay";

// Telegram Logo SVG (Exact match to screenshot)
export const TelegramIcon: React.FC<{ className?: string }> = ({ className = "size-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#229ED9" />
    <path
      d="M5.4 11.9l11.6-4.6c.5-.2 1 .2.8.7l-2 9.5c-.1.6-.7.8-1.2.5l-3.3-2.5-1.6 1.5c-.2.2-.4.3-.7.3l.2-3.4 6.2-5.6c.3-.3-.1-.4-.4-.2L8.2 13.5l-2.8-.9c-.6-.2-.6-.7 0-.7z"
      fill="#ffffff"
    />
  </svg>
);

// Discord Logo SVG (Exact match to screenshot)
export const DiscordIcon: React.FC<{ className?: string }> = ({ className = "size-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#5865F2" />
    <path
      d="M16.5 7.5c-1-.5-2.1-.8-3.2-.9-.1.3-.3.6-.4.9-1.2-.2-2.4-.2-3.6 0-.1-.3-.3-.6-.4-.9-1.1.1-2.2.4-3.2.9-1.9 2.9-2.4 5.7-2.1 8.5 1.3 1 2.6 1.6 3.9 1.9.3-.4.6-.9.8-1.4-.5-.2-.9-.4-1.3-.7.1-.1.2-.2.3-.2 2.5 1.2 5.2 1.2 7.7 0 .1.1.2.2.3.2-.4.3-.8.5-1.3.7.2.5.5 1 .8 1.4 1.3-.3 2.6-.9 3.9-1.9.4-3.3-.6-6.1-2.2-8.5zm-6.7 6.4c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6zm4.4 0c-.8 0-1.4-.7-1.4-1.6s.6-1.6 1.4-1.6 1.4.7 1.4 1.6-.6 1.6-1.4 1.6z"
      fill="#ffffff"
    />
  </svg>
);

export interface TelegramChannelItem {
  id: string;
  name: string;
  type: "channel" | "group";
  memberCount: number;
  isIncluded: boolean;
  linkedDate: string;
  botStatus: "admin" | "member" | "pending";
}

export interface DiscordServerItem {
  id: string;
  name: string;
  iconUrl?: string;
  memberCount: number;
  isIncluded: boolean;
  rolesManaged: string[];
  botStatus: "installed" | "pending";
}

export interface ConnectedAppProductItem {
  id: string;
  title: string;
  priceDisplay?: string;
  subscribersCount?: string | number;
  category?: string;
}

export interface BusinessEntityItem {
  id: string;
  name: string;
  avatarUrl?: string;
  activeUsersCount: number;
}

interface ConnectedAppsViewProps {
  lang: "fr" | "en";
  initialSubView?: "catalog" | "telegram" | "discord" | "telegram_wizard" | "fan_purchases";
  onBackToDashboard?: () => void;
  availableProducts?: ConnectedAppProductItem[];
  companyName?: string;
  companyId?: string;
  onOpenCoursesWorkflow?: (productIds: string[]) => void;
  onOpenFilesWorkflow?: (productIds: string[]) => void;
}

export const ConnectedAppsView: React.FC<ConnectedAppsViewProps> = ({
  lang,
  initialSubView = "catalog",
  onBackToDashboard,
  availableProducts,
  companyName,
  companyId,
  onOpenCoursesWorkflow,
  onOpenFilesWorkflow,
}) => {
  // Current view state: 'catalog' | 'telegram' | 'telegram_wizard' | 'discord' | 'fan_purchases'
  const [subView, setSubView] = useState<"catalog" | "telegram" | "telegram_wizard" | "discord" | "fan_purchases">(
    initialSubView
  );

  // Search in Available Channels
  const [channelSearchQuery, setChannelSearchQuery] = useState("");

  // Telegram Verification Wizard Code (Dynamic Backend Driven)
  const [verifyCode, setVerifyCode] = useState("");
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isWaitingForBot, setIsWaitingForBot] = useState(true);
  const [isVerifiedLive, setIsVerifiedLive] = useState(false);
  const [verifiedChannelMeta, setVerifiedChannelMeta] = useState<any | null>(null);
  const [verificationSuccessToast, setVerificationSuccessToast] = useState<string | null>(null);

  // Live Telegram Simulation Chat State
  const [chatChannelName, setChatChannelName] = useState("VICTORY ODDS 🤑🔥");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Tutorial Video Modal
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Modal State for installing / linking app to a product
  const [selectedAppToInstall, setSelectedAppToInstall] = useState<{
    id: "discord" | "telegram" | "courses" | "files";
    title: string;
    description: string;
    installationsCount: number;
    icon: React.ReactNode;
  } | null>(null);

  // Selected product IDs when linking an application
  const [selectedProductIdsToLink, setSelectedProductIdsToLink] = useState<string[]>([]);

  // Currently active linked product (for display in telegram / discord views)
  const [activeLinkedProduct, setActiveLinkedProduct] = useState<ConnectedAppProductItem | null>(null);

  // Effective products list (passed from enterprise offers or fallback)
  const effectiveProductsList = useMemo<ConnectedAppProductItem[]>(() => {
    if (availableProducts && availableProducts.length > 0) {
      return availableProducts;
    }
    if (companyId) {
      try {
        const storedOffers = localStorage.getItem(`mansa_creator_offers_${companyId}`);
        if (storedOffers) {
          const parsed = JSON.parse(storedOffers);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((o: any) => ({
              id: o.id,
              title: o.title,
              priceDisplay: o.priceDisplay || "Inclus",
              subscribersCount: o.subscribersCount || 0,
            }));
          }
        }
      } catch {}
    }
    return [
      { id: "prod-vip", title: "Pass VIP & Accès Membre", priceDisplay: "29 € / mois", subscribersCount: 142 },
      { id: "prod-standard", title: "Accès Communauté Standard", priceDisplay: "Gratuit", subscribersCount: 380 },
    ];
  }, [availableProducts, companyId]);

  // Telegram Connected Channels list (Persisted in localStorage with deduplication)
  const [telegramChannels, setTelegramChannels] = useState<TelegramChannelItem[]>(() => {
    const saved = localStorage.getItem("business_telegram_channels");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Deduplicate by ID and name
          const seen = new Set<string>();
          const deduped: TelegramChannelItem[] = [];
          for (const item of parsed) {
            const key = item.id || item.name;
            if (key && !seen.has(key)) {
              seen.add(key);
              deduped.push({
                ...item,
                id: item.id || `tg-${Math.random().toString(36).substr(2, 9)}`,
              });
            }
          }
          return deduped;
        }
      } catch {}
    }
    return [];
  });

  // Available Telegram Channels (Detected or available to be added, excluding already connected ones)
  const [availableChannels, setAvailableChannels] = useState<TelegramChannelItem[]>([]);

  // Discord Servers List (Persisted in localStorage)
  const [discordServers, setDiscordServers] = useState<DiscordServerItem[]>(() => {
    try {
      const saved = localStorage.getItem("business_discord_servers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return [];
  });

  // Available Discord Servers (Detected or available to be linked)
  const [availableDiscordServers, setAvailableDiscordServers] = useState<DiscordServerItem[]>([]);
  const [discordSearchQuery, setDiscordSearchQuery] = useState("");

  // Modals state for Discord
  const [isAddDiscordModalOpen, setIsAddDiscordModalOpen] = useState(false);
  const [newDiscordServerName, setNewDiscordServerName] = useState("");
  const [newDiscordRoleName, setNewDiscordRoleName] = useState("");
  const [isManageRolesModalOpen, setIsManageRolesModalOpen] = useState(false);
  const [selectedServerForRoles, setSelectedServerForRoles] = useState<DiscordServerItem | null>(null);
  const [newRoleInput, setNewRoleInput] = useState("");

  // Sync Telegram Channels to LocalStorage
  useEffect(() => {
    localStorage.setItem("business_telegram_channels", JSON.stringify(telegramChannels));
  }, [telegramChannels]);

  // Sync Discord Servers to LocalStorage
  useEffect(() => {
    localStorage.setItem("business_discord_servers", JSON.stringify(discordServers));
  }, [discordServers]);

  // Récupération initiale ou rafraîchissement d'un vrai code dynamique unique
  const fetchNewDynamicCode = async () => {
    setIsRefetching(true);
    setIsVerifiedLive(false);
    setIsWaitingForBot(true);
    setVerifiedChannelMeta(null);

    try {
      const res = await fetch("/api/telegram/generate-code");
      const data = await res.json();
      if (data && data.code) {
        setVerifyCode(data.code);
      } else {
        // Fallback local aléatoire
        const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
        let fallback = "";
        for (let i = 0; i < 6; i++) fallback += chars.charAt(Math.floor(Math.random() * chars.length));
        setVerifyCode(fallback);
      }
    } catch (err) {
      console.warn("Erreur fetch code:", err);
      const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let fallback = "";
      for (let i = 0; i < 6; i++) fallback += chars.charAt(Math.floor(Math.random() * chars.length));
      setVerifyCode(fallback);
    } finally {
      setIsRefetching(false);
    }
  };

  // Chargement du premier code lors de l'ouverture du wizard
  useEffect(() => {
    if (subView === "telegram_wizard" && !verifyCode) {
      fetchNewDynamicCode();
    }
  }, [subView, verifyCode]);

  // Polling en direct : Vérifie toutes les 1.5s si le bot a reçu le code dans Telegram
  useEffect(() => {
    if (subView !== "telegram_wizard" || !verifyCode || isVerifiedLive) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/check-verification?code=${verifyCode}`);
        const data = await res.json();

        if (data && data.status === "verified" && data.channelInfo) {
          const info = data.channelInfo;
          setVerifiedChannelMeta(info);
          setIsVerifiedLive(true);
          setIsWaitingForBot(false);

          // Ajouter automatiquement ce canal vérifié dans la liste des canaux
          const newChan: TelegramChannelItem = {
            id: "tg-" + (info.chatId || Date.now()),
            name: info.title || "Canal Telegram VIP",
            type: info.type === "channel" ? "channel" : "group",
            memberCount: info.memberCount || 1,
            isIncluded: true,
            linkedDate: "À l'instant",
            botStatus: "admin",
          };

          setTelegramChannels((prev) => [
            newChan,
            ...prev.filter((c) => c.name !== newChan.name && c.id !== newChan.id),
          ]);

          setVerificationSuccessToast(
            `🎉 Canal "${info.title}" vérifié et synchronisé avec succès !`
          );

          // Consommer le code sur le serveur et pré-générer le code suivant
          fetch("/api/telegram/consume-code", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: verifyCode }),
          }).catch(() => {});
        }
      } catch (err) {
        // Polling silencieux
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [subView, verifyCode, isVerifiedLive]);

  const generateNewCode = () => {
    fetchNewDynamicCode();
  };

  const handleCopyCode = () => {
    if (!verifyCode) return;
    navigator.clipboard?.writeText?.(verifyCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Add channel to included list
  const handleAddChannelToIncluded = (channel: TelegramChannelItem) => {
    setTelegramChannels((prev) => {
      const filtered = prev.filter((c) => c.id !== channel.id && c.name !== channel.name);
      return [...filtered, { ...channel, isIncluded: true }];
    });
    setAvailableChannels((prev) => prev.filter((c) => c.id !== channel.id && c.name !== channel.name));
    setVerificationSuccessToast(`Canal "${channel.name}" ajouté avec succès à vos offres !`);
    setTimeout(() => setVerificationSuccessToast(null), 3500);
  };

  // Remove channel from included list
  const handleRemoveChannel = (channelId: string) => {
    const item = telegramChannels.find((c) => c.id === channelId);
    if (!item) return;
    setTelegramChannels((prev) => prev.filter((c) => c.id !== channelId));
    setAvailableChannels((prev) => {
      const filtered = prev.filter((c) => c.id !== channelId && c.name !== item.name);
      return [...filtered, { ...item, isIncluded: false }];
    });
    setVerificationSuccessToast(`Canal "${item.name}" retiré.`);
    setTimeout(() => setVerificationSuccessToast(null), 2500);
  };

  // Add Discord server to included list
  const handleAddDiscordServerToIncluded = (server: DiscordServerItem) => {
    setDiscordServers((prev) => {
      const filtered = prev.filter((s) => s.id !== server.id && s.name !== server.name);
      return [...filtered, { ...server, isIncluded: true }];
    });
    setAvailableDiscordServers((prev) => prev.filter((s) => s.id !== server.id && s.name !== server.name));
    setVerificationSuccessToast(`Serveur "${server.name}" ajouté avec succès à vos offres !`);
    setTimeout(() => setVerificationSuccessToast(null), 3500);
  };

  // Remove Discord server from included list
  const handleRemoveDiscordServer = (serverId: string) => {
    const item = discordServers.find((s) => s.id === serverId);
    if (!item) return;
    setDiscordServers((prev) => prev.filter((s) => s.id !== serverId));
    setAvailableDiscordServers((prev) => {
      const filtered = prev.filter((s) => s.id !== serverId && s.name !== item.name);
      return [...filtered, { ...item, isIncluded: false }];
    });
    setVerificationSuccessToast(`Serveur "${item.name}" retiré.`);
    setTimeout(() => setVerificationSuccessToast(null), 2500);
  };

  // Create and connect a new Discord server
  const handleCreateAndConnectServer = (e: React.FormEvent) => {
    e.preventDefault();
    const srvName = newDiscordServerName.trim();
    if (!srvName) return;

    const initialRole = newDiscordRoleName.trim() || "Membre VIP";
    const newServer: DiscordServerItem = {
      id: "disc-" + Date.now(),
      name: srvName,
      memberCount: Math.floor(Math.random() * 150) + 50,
      isIncluded: true,
      rolesManaged: [initialRole],
      botStatus: "installed",
    };

    setDiscordServers((prev) => [
      ...prev.filter((s) => s.name.toLowerCase() !== srvName.toLowerCase()),
      newServer,
    ]);

    setNewDiscordServerName("");
    setNewDiscordRoleName("");
    setIsAddDiscordModalOpen(false);

    setVerificationSuccessToast(`Serveur Discord "${srvName}" connecté avec succès !`);
    setTimeout(() => setVerificationSuccessToast(null), 3500);
  };

  // Add role to selected server
  const handleAddRoleToSelectedServer = () => {
    const role = newRoleInput.trim();
    if (!role || !selectedServerForRoles) return;

    setDiscordServers((prev) =>
      prev.map((s) =>
        s.id === selectedServerForRoles.id && !s.rolesManaged.includes(role)
          ? { ...s, rolesManaged: [...s.rolesManaged, role] }
          : s
      )
    );

    setSelectedServerForRoles((prev) =>
      prev && !prev.rolesManaged.includes(role)
        ? { ...prev, rolesManaged: [...prev.rolesManaged, role] }
        : prev
    );

    setNewRoleInput("");
  };

  // Remove role from selected server
  const handleRemoveRoleFromSelectedServer = (roleToRemove: string) => {
    if (!selectedServerForRoles) return;

    setDiscordServers((prev) =>
      prev.map((s) =>
        s.id === selectedServerForRoles.id
          ? { ...s, rolesManaged: s.rolesManaged.filter((r) => r !== roleToRemove) }
          : s
      )
    );

    setSelectedServerForRoles((prev) =>
      prev
        ? { ...prev, rolesManaged: prev.rolesManaged.filter((r) => r !== roleToRemove) }
        : prev
    );
  };

  // Open Install Modal for an App (e.g. Discord, Telegram, Courses, Files)
  const handleOpenInstallModal = (appId: "discord" | "telegram" | "courses" | "files") => {
    // Pre-select first product if available
    if (effectiveProductsList.length > 0) {
      setSelectedProductIdsToLink([effectiveProductsList[0].id]);
    } else {
      setSelectedProductIdsToLink(["default-product"]);
    }

    if (appId === "discord") {
      setSelectedAppToInstall({
        id: "discord",
        title: "Discord",
        description: "Vendez l'accès à votre serveur Discord avec gestion automatique des rôles VIP.",
        installationsCount: 2037,
        icon: <DiscordIcon className="size-10" />,
      });
    } else if (appId === "telegram") {
      setSelectedAppToInstall({
        id: "telegram",
        title: "Telegram",
        description: "Vendez l'accès à vos canaux et groupes Telegram avec liens d'invitation automatiques.",
        installationsCount: 1845,
        icon: <TelegramIcon className="size-10" />,
      });
    } else if (appId === "courses") {
      setSelectedAppToInstall({
        id: "courses",
        title: "Cours & Vidéos",
        description: "Organisez et monétisez vos formations vidéos protégées avec suivi des élèves.",
        installationsCount: 920,
        icon: <span className="text-3xl">🎓</span>,
      });
    } else {
      setSelectedAppToInstall({
        id: "files",
        title: "Fichiers",
        description: "Distribuez des documents, ebooks PDF et logiciels en téléchargement sécurisé.",
        installationsCount: 1410,
        icon: <span className="text-3xl">📁</span>,
      });
    }
  };

  // When clicking "Confirmer" to link the application to the selected products
  const handleConfirmLinkToProducts = () => {
    if (!selectedAppToInstall || selectedProductIdsToLink.length === 0) return;
    const app = selectedAppToInstall;

    const matchedProduct = effectiveProductsList.find((p) => selectedProductIdsToLink.includes(p.id)) || {
      id: selectedProductIdsToLink[0],
      title: "Produit sélectionné",
    };
    setActiveLinkedProduct(matchedProduct);

    // Save association to localStorage
    const linksKey = companyId ? `mansa_creator_app_links_${companyId}` : "mansa_creator_app_links";
    try {
      const saved = JSON.parse(localStorage.getItem(linksKey) || "[]");
      const next = {
        appId: app.id,
        productIds: selectedProductIdsToLink,
        updatedAt: new Date().toISOString(),
      };
      const withoutApp = Array.isArray(saved) ? saved.filter((i: any) => i.appId !== app.id) : [];
      localStorage.setItem(linksKey, JSON.stringify([...withoutApp, next]));
    } catch {}

    setSelectedAppToInstall(null);

    if (app.id === "telegram") {
      setSubView("telegram");
      setVerificationSuccessToast(
        `Application Telegram liée à "${matchedProduct.title}". Choisissez ou connectez ci-dessous le canal/groupe à associer.`
      );
      setTimeout(() => setVerificationSuccessToast(null), 4500);
    } else if (app.id === "discord") {
      setSubView("discord");
      setVerificationSuccessToast(
        `Application Discord liée à "${matchedProduct.title}". Choisissez ou connectez ci-dessous le serveur Discord à associer.`
      );
      setTimeout(() => setVerificationSuccessToast(null), 4500);
    } else if (app.id === "courses") {
      if (onOpenCoursesWorkflow) {
        onOpenCoursesWorkflow(selectedProductIdsToLink);
      } else {
        setVerificationSuccessToast(`Module Cours & Formations configuré pour "${matchedProduct.title}".`);
        setTimeout(() => setVerificationSuccessToast(null), 3500);
      }
    } else if (app.id === "files") {
      if (onOpenFilesWorkflow) {
        onOpenFilesWorkflow(selectedProductIdsToLink);
      } else {
        setVerificationSuccessToast(`Module Fichiers configuré pour "${matchedProduct.title}".`);
        setTimeout(() => setVerificationSuccessToast(null), 3500);
      }
    }
  };

  // Simulate Posting Code in Live Telegram Channel (Calls live API as well)
  const handleSendTelegramCodeInChat = async (codeToSend?: string) => {
    const code = (codeToSend || typedMessage.trim() || verifyCode).toUpperCase();
    if (!code) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Add user's message
    setChatMessages((prev) => [
      ...prev,
      { sender: "user", text: code, time: timeNow },
    ]);
    setTypedMessage("");
    setIsBotTyping(true);

    // Call backend simulation API
    try {
      await fetch("/api/telegram/simulate-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          channelTitle: chatChannelName,
          memberCount: 1890,
        }),
      });
    } catch (e) {
      console.warn("Simulation API call failed", e);
    }

    // Bot automatic reply in French (Exact requirement)
    setTimeout(() => {
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `✅ Code "${code}" reçu ! Nous configurons votre canal "${chatChannelName}" actuellement. Veuillez patienter quelques secondes pendant la mise à jour de votre tableau de bord.`,
          time: botTime,
        },
      ]);
      setIsBotTyping(false);
    }, 900);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 select-none text-zinc-200">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {verificationSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-[#121316] p-4 text-xs font-semibold text-emerald-400 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span>{verificationSuccessToast}</span>
          <button onClick={() => setVerificationSuccessToast(null)} className="text-zinc-500 hover:text-white ml-2">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FAN / CUSTOMER PURCHASES VIEW ("Vos achats")                              */}
      {/* ========================================================================= */}
      {subView === "fan_purchases" && (
        <CustomerPurchasesView lang={lang} />
      )}

      {/* ========================================================================= */}
      {/* 1. VIEW: APP CATALOG / DIRECTORY ("Ajouter une application")             */}
      {/* ========================================================================= */}
      {subView === "catalog" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
                <Layers className="size-7 text-[#0055ff]" />
                <span>Applications & Intégrations</span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Installez des applications sur vos business pour connecter vos canaux Telegram, serveurs Discord et cours vidéo.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubView("telegram")}
                className="flex items-center gap-2 rounded-xl bg-[#229ED9]/15 hover:bg-[#229ED9]/25 border border-[#229ED9]/30 text-[#229ED9] px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <TelegramIcon className="size-4" />
                <span>Gérer Telegram ({telegramChannels.length})</span>
              </button>

              <button
                onClick={() => setSubView("discord")}
                className="flex items-center gap-2 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 border border-[#5865F2]/30 text-[#8c97f8] px-3.5 py-2 text-xs font-bold transition-all cursor-pointer"
              >
                <DiscordIcon className="size-4" />
                <span>Gérer Discord ({discordServers.length})</span>
              </button>
            </div>
          </div>

          {/* Connected Apps Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Telegram App Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 flex flex-col justify-between space-y-4 hover:border-[#229ED9]/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TelegramIcon className="size-10" />
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#229ED9] transition-colors">
                        Telegram
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>↓ 1845 installations</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="size-3" /> Bot Admin Actif
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                    Officiel Mansa
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Automatisez l'accès à vos canaux et groupes Telegram payants grâce aux liens d'invitation à usage unique générés après paiement.
                </p>

                <div className="rounded-xl bg-[#14161c] p-3 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Canaux actifs liés :</span>
                    <span className="font-mono font-bold text-white">{telegramChannels.length} canaux</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Bot officiel :</span>
                    <code className="text-[#229ED9] font-mono">@afhub_bot</code>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenInstallModal("telegram")}
                  className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Installer sur un business</span>
                </button>

                <button
                  onClick={() => setSubView("telegram")}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 cursor-pointer"
                >
                  Paramètres
                </button>
              </div>
            </div>

            {/* Discord App Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 flex flex-col justify-between space-y-4 hover:border-[#5865F2]/40 transition-all group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <DiscordIcon className="size-10" />
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#8c97f8] transition-colors">
                        Discord
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span>↓ 2037 installations</span>
                        <span>•</span>
                        <span className="text-[#8c97f8] font-semibold">Gestion des rôles</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-300 font-mono">
                    Officiel Mansa
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Vendez l'accès à vos serveurs Discord avec gestion automatique des rôles VIP et révocation instantanée en cas de désabonnement.
                </p>

                <div className="rounded-xl bg-[#14161c] p-3 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Serveurs synchronisés :</span>
                    <span className="font-mono font-bold text-white">{discordServers.length} serveurs</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-zinc-400">Mécanisme :</span>
                    <span className="text-zinc-300">Liaison de compte + Claim Access</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleOpenInstallModal("discord")}
                  className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="size-3.5" />
                  <span>Installer sur un business</span>
                </button>

                <button
                  onClick={() => setSubView("discord")}
                  className="px-3.5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 cursor-pointer"
                >
                  Paramètres
                </button>
              </div>
            </div>

          </div>

          {/* More Available Apps in the Marketplace */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Autres applications disponibles à installer
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Courses App */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0c0d0e] p-4 flex flex-col justify-between space-y-3 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 font-bold">
                    🎓
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Cours & Formations</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                      Module e-learning vidéo avec chapitres et suivi de progression des membres.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenInstallModal("courses")}
                  className="w-full py-1.5 rounded-lg border border-white/10 bg-[#16181f] hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                >
                  + Installer sur un business
                </button>
              </div>

              {/* Files / Downloads */}
              <div className="rounded-xl border border-white/[0.06] bg-[#0c0d0e] p-4 flex flex-col justify-between space-y-3 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="size-9 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 shrink-0 font-bold">
                    📁
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Fichiers & Téléchargements</h4>
                    <p className="text-[11px] text-zinc-400 leading-snug mt-0.5">
                      Distribuez des fichiers PDF, templates, logiciels et archives protégés.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleOpenInstallModal("files")}
                  className="w-full py-1.5 rounded-lg border border-white/10 bg-[#16181f] hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
                >
                  + Installer sur un business
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW: TELEGRAM CHANNELS MANAGEMENT                                    */}
      {/* ========================================================================= */}
      {subView === "telegram" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Bar: "< Retour aux applications" (Sans logo dupliqué) */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <button
              onClick={() => {
                if (onBackToDashboard && initialSubView === "telegram") {
                  onBackToDashboard();
                } else {
                  setSubView("catalog");
                }
              }}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 group-hover:text-white">
                <ChevronLeft className="size-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">
                {onBackToDashboard && initialSubView === "telegram" ? "Retour à l'accueil" : "Retour aux applications"}
              </span>
            </button>
          </div>

          {/* Banner if linked from a product */}
          {activeLinkedProduct && (
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-xs text-zinc-300 flex items-center justify-between">
              <span>Liaison en cours pour le produit : <strong className="text-white">{activeLinkedProduct.title}</strong></span>
              <span className="text-[11px] text-blue-400 font-semibold">Choisissez ou ajoutez le canal/groupe à associer</span>
            </div>
          )}

          {/* Title Row with Large Logo (Le SEUL logo Telegram de la page), Title & "+ Ajouter un canal / groupe" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <TelegramIcon className="size-8 sm:size-9" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Telegram
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gestion des canaux et groupes connectés via le bot de vérification.
                </p>
              </div>
            </div>

            {/* + Ajouter un canal / groupe Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubView("telegram_wizard")}
                className="flex items-center gap-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Ajouter un canal / groupe</span>
              </button>
            </div>
          </div>

          {/* Section 1: "Canaux inclus dans Telegram" */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white">
              Canaux inclus dans Telegram
            </h3>

            {telegramChannels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-[#0c0d0e] p-8 text-center space-y-3">
                <p className="text-xs text-zinc-400">
                  Aucun canal n'est inclus pour le moment. Ajoutez votre premier canal Telegram ci-dessous.
                </p>
                <button
                  onClick={() => setSubView("telegram_wizard")}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#229ED9] text-white text-xs font-bold hover:bg-[#1c8ec4] cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  <span>Connecter un canal</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {telegramChannels.map((channel, idx) => (
                  <div
                    key={`connected-tg-${channel.id || idx}`}
                    className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-[#0c0d0e] px-4 py-3.5 hover:border-white/15 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-8 rounded-lg bg-[#229ED9]/10 border border-[#229ED9]/20 flex items-center justify-center text-[#229ED9] shrink-0">
                        <Radio className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white truncate block">
                          {channel.name}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="font-mono">{channel.memberCount} membres</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="size-3" /> Bot Admin Actif
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveChannel(channel.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-transparent hover:bg-red-500/10 text-red-400 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: "Canaux disponibles" */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Canaux disponibles
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {availableChannels.length} disponibles
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-zinc-500" />
              <input
                type="text"
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                placeholder="Rechercher un canal..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0d0e] pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              {availableChannels.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-[#0c0d0e] p-4 text-center text-xs text-zinc-500">
                  Tous les canaux disponibles sont déjà connectés.
                </div>
              ) : (
                availableChannels.map((chan, idx) => (
                  <div
                    key={`available-tg-${chan.id || idx}`}
                    className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-[#0c0d0e] px-4 py-3 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-[#229ED9]/10 flex items-center justify-center text-[#229ED9]">
                        <Radio className="size-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">
                          {chan.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {chan.memberCount} membres · Bot prêt
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddChannelToIncluded(chan)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#16181f] hover:bg-[#222530] text-zinc-200 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="size-3.5 text-zinc-400" />
                      <span>Ajouter le canal</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VIEW: TELEGRAM WIZARD / VERIFICATION WITH BOT SIMULATOR                */}
      {/* ========================================================================= */}
      {subView === "telegram_wizard" && (
        <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <button
              onClick={() => setSubView("telegram")}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 group-hover:text-white">
                <ChevronLeft className="size-5" />
              </div>
              <span className="text-base font-bold text-white">Vérification Telegram</span>
            </button>

            <span className="text-xs text-zinc-400 font-mono flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Bot officiel : <strong className="text-white">@MansaAccess_Bot</strong>
            </span>
          </div>

          {/* Step 1: Add Mansa Bot to your Telegram (Exact match to Screenshot 1) */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-5">
            
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
              <h3 className="text-base font-bold text-white">
                Étape 1 : Ajoutez le Bot Mansa à votre Canal ou Groupe
              </h3>

              <button
                onClick={() => setIsTutorialOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#16181f] hover:bg-[#222530] text-zinc-300 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Video className="size-3.5 text-zinc-400" />
                <span>Voir le tutoriel vidéo</span>
              </button>
            </div>

            {/* Sub-row: Group */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Groupe Telegram</div>
              <div className="text-xs text-zinc-400">
                Pour un groupe, ajoutez <code className="text-[#229ED9]">@MansaAccess_Bot</code> comme membre ou administrateur.
              </div>
            </div>

            <div className="border-t border-white/[0.04] pt-3" />

            {/* Sub-row: Channel */}
            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Canal Telegram (Recommandé)</div>
              <div className="text-xs text-zinc-400">
                Pour un canal, ajoutez <code className="text-[#229ED9]">@MansaAccess_Bot</code> comme <strong>Administrateur du Canal</strong> avec le droit d'ajouter des membres via liens d'invitation.
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#14161c] border border-white/5 p-3 text-xs">
              <div className="flex items-center gap-2">
                <Bot className="size-4 text-[#229ED9]" />
                <span className="text-zinc-400">Pseudo du Bot Administrateur :</span>
                <code className="font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded border border-white/10">
                  @MansaAccess_Bot
                </code>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.("@MansaAccess_Bot");
                  alert("Nom du bot copié : @MansaAccess_Bot");
                }}
                className="text-xs text-[#229ED9] hover:underline cursor-pointer font-semibold"
              >
                Copier le pseudo
              </button>
            </div>

          </div>

          {/* Step 2: Verify with dynamic unique code */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-5">
            
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                Étape 2 : Vérification dynamique en temps réel
              </h3>
              <span className="text-[11px] text-zinc-400 font-mono bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                Génération dynamique par créateur
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-white">Envoyez ce code dans votre canal</div>
              <div className="text-xs text-zinc-400">
                Collez ce code unique directement dans votre canal ou groupe Telegram où le bot est administrateur. Le bot détectera le code automatiquement et transmettra les détails du canal au site.
              </div>
            </div>

            {/* Code Box + Refetch + Copy Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#0055ff]/40 bg-[#0055ff]/10 px-5 py-2.5 font-mono text-xl font-extrabold text-white tracking-[0.25em] min-w-[160px] text-center select-all shadow-inner">
                  {verifyCode || "..."}
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Usage unique</span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={generateNewCode}
                  disabled={isRefetching}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16181f] hover:bg-[#222530] text-zinc-300 hover:text-white px-3.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                  title="Régénérer un nouveau code"
                >
                  <RefreshCw className={`size-3.5 ${isRefetching ? "animate-spin text-[#229ED9]" : "text-zinc-400"}`} />
                  <span>Nouveau Code</span>
                </button>

                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  {isCopiedCode ? (
                    <>
                      <Check className="size-3.5" />
                      <span>Code Copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copier le Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Polling Status or Verified Confirmation */}
            <div className="pt-2 border-t border-white/[0.04]">
              {isVerifiedLive ? (
                <div className="space-y-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                      <CheckCircle2 className="size-4" />
                      <span>Canal détecté et lié en direct par @MansaAccess_Bot !</span>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                      Statut : Prêt pour la vente
                    </span>
                  </div>

                  {verifiedChannelMeta && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-black/40 p-3 rounded-lg border border-emerald-500/20 text-xs font-sans text-zinc-300">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Nom du Canal :</span>
                        <strong className="text-white">{verifiedChannelMeta.title}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">Membres :</span>
                        <strong className="text-white">{verifiedChannelMeta.memberCount || 1} membres</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-zinc-500 block">ID Telegram :</span>
                        <code className="text-zinc-400 text-[11px] font-mono">{verifiedChannelMeta.chatId}</code>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={fetchNewDynamicCode}
                      className="text-xs text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      + Connecter un autre canal avec un nouveau code
                    </button>
                    <button
                      onClick={() => setSubView("telegram")}
                      className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs cursor-pointer shadow-lg transition-all"
                    >
                      Poursuivre la configuration du produit ›
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="size-3.5 animate-spin text-[#229ED9]" />
                    <span>En attente de réception du code par le Bot Telegram en temps réel...</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Polling actif</span>
                </div>
              )}
            </div>

          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setSubView("telegram")}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              ← Retour aux canaux Telegram
            </button>

            {isVerifiedLive && (
              <button
                onClick={() => setSubView("telegram")}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs cursor-pointer shadow-lg transition-all"
              >
                Poursuivre la configuration du produit
              </button>
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VIEW: DISCORD SERVERS MANAGEMENT                                      */}
      {/* ========================================================================= */}
      {subView === "discord" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Top Bar: "< Retour aux applications" (Sans logo dupliqué) */}
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <button
              onClick={() => {
                if (onBackToDashboard && initialSubView === "discord") {
                  onBackToDashboard();
                } else {
                  setSubView("catalog");
                }
              }}
              className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors cursor-pointer group"
            >
              <div className="p-1 rounded-lg hover:bg-white/5 text-zinc-400 group-hover:text-white">
                <ChevronLeft className="size-5" />
              </div>
              <span className="text-sm font-semibold text-zinc-300 group-hover:text-white">
                {onBackToDashboard && initialSubView === "discord" ? "Retour à l'accueil" : "Retour aux applications"}
              </span>
            </button>
          </div>

          {/* Banner if linked from a product */}
          {activeLinkedProduct && (
            <div className="rounded-xl border border-[#5865F2]/20 bg-[#5865F2]/5 px-4 py-3 text-xs text-zinc-300 flex items-center justify-between">
              <span>Liaison en cours pour le produit : <strong className="text-white">{activeLinkedProduct.title}</strong></span>
              <span className="text-[11px] text-[#8c97f8] font-semibold">Choisissez ou ajoutez le serveur Discord à associer</span>
            </div>
          )}

          {/* Title Row with Large Logo (Le SEUL logo Discord de la page), Title & "+ Ajouter un serveur" Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-3">
              <DiscordIcon className="size-8 sm:size-9" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Discord
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Gestion des serveurs et synchronisation automatique des rôles VIP via le bot Discord.
                </p>
              </div>
            </div>

            {/* + Ajouter un serveur Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddDiscordModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Ajouter un serveur</span>
              </button>
            </div>
          </div>

          {/* Section 1: "Serveurs inclus dans Discord" */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white">
              Serveurs inclus dans Discord
            </h3>

            {discordServers.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-8 text-center space-y-4">
                <p className="text-xs text-zinc-400">
                  Aucun serveur n'est inclus pour le moment. Ajoutez votre premier serveur Discord ci-dessous.
                </p>
                <button
                  onClick={() => setIsAddDiscordModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>Connecter un serveur</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {discordServers.map((server) => (
                  <div
                    key={server.id}
                    className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-9 rounded-lg bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center text-[#5865F2] shrink-0">
                        <Server className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 truncate">
                          <span className="truncate">{server.name}</span>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                            Connecté
                          </span>
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 flex-wrap">
                          <span className="font-mono">{server.memberCount} membres</span>
                          <span>·</span>
                          <span>Rôles synchronisés :</span>
                          {server.rolesManaged.map((r, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#5865F2]/20 text-[#8c97f8] border border-[#5865F2]/30"
                            >
                              @{r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedServerForRoles(server);
                          setIsManageRolesModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg border border-white/10 bg-[#16181f] hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        Gérer les rôles
                      </button>
                      <button
                        onClick={() => handleRemoveDiscordServer(server.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-transparent hover:bg-red-500/10 text-red-400 px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: "Serveurs disponibles" */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                Serveurs disponibles
              </h3>
              <span className="text-xs text-zinc-500 font-mono">
                {availableDiscordServers.filter((s) => s.name.toLowerCase().includes(discordSearchQuery.toLowerCase())).length} disponibles
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
              <input
                type="text"
                value={discordSearchQuery}
                onChange={(e) => setDiscordSearchQuery(e.target.value)}
                placeholder="Rechercher un serveur..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0d0e] pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/20 transition-all"
              />
            </div>

            {availableDiscordServers.filter((s) => s.name.toLowerCase().includes(discordSearchQuery.toLowerCase())).length === 0 ? (
              <div className="rounded-xl border border-white/[0.06] bg-[#0c0d0e]/60 p-4 text-center">
                <p className="text-xs text-zinc-500">
                  {discordSearchQuery ? "Aucun serveur ne correspond à votre recherche." : "Tous vos serveurs Discord disponibles sont déjà connectés."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableDiscordServers
                  .filter((s) => s.name.toLowerCase().includes(discordSearchQuery.toLowerCase()))
                  .map((srv) => (
                    <div
                      key={srv.id}
                      className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-3 flex items-center justify-between hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-[#5865F2]/10 flex items-center justify-center text-[#5865F2]">
                          <Server className="size-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            {srv.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            {srv.memberCount} membres
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddDiscordServerToIncluded(srv)}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#16181f] hover:bg-[#222530] text-zinc-200 hover:text-white px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Plus className="size-3.5 text-zinc-400" />
                        <span>Ajouter le serveur</span>
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Instructions de configuration Discord */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-5 space-y-4">
            <h4 className="text-sm font-bold text-white">Instructions de configuration Discord</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded-xl bg-[#14161c] p-4 border border-white/5 space-y-2">
                <span className="font-bold text-white block">1. Inviter le bot</span>
                <p className="text-zinc-400">
                  Ajoutez le bot officiel Mansa à votre serveur Discord avec les permissions « Gérer les rôles » et « Créer une invitation ».
                </p>
                <button
                  onClick={() => {
                    window.open("https://discord.com/api/oauth2/authorize", "_blank");
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  <ExternalLink className="size-3" />
                  <span>Inviter le bot Discord</span>
                </button>
              </div>

              <div className="rounded-xl bg-[#14161c] p-4 border border-white/5 space-y-2">
                <span className="font-bold text-white block">2. Hiérarchie des rôles</span>
                <p className="text-zinc-400">
                  Dans les paramètres de votre serveur Discord, placez le rôle du bot au-dessus des rôles VIP que vous souhaitez qu'il attribue automatiquement.
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Modal: Connecter un serveur Discord */}
      <ModalOverlay
        isOpen={isAddDiscordModalOpen}
        onClose={() => setIsAddDiscordModalOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <h3 className="text-base font-bold text-white">
              Connecter un serveur Discord
            </h3>
            <button
              onClick={() => setIsAddDiscordModalOpen(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleCreateAndConnectServer} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Nom du serveur Discord
              </label>
              <input
                type="text"
                required
                value={newDiscordServerName}
                onChange={(e) => setNewDiscordServerName(e.target.value)}
                placeholder="ex. MON SERVEUR VIP 🚀"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0d0e] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#5865F2] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Rôle VIP principal à synchroniser
              </label>
              <input
                type="text"
                value={newDiscordRoleName}
                onChange={(e) => setNewDiscordRoleName(e.target.value)}
                placeholder="ex. Membre VIP"
                className="w-full rounded-xl border border-white/[0.08] bg-[#0c0d0e] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#5865F2] transition-colors"
              />
              <p className="text-[11px] text-zinc-500 mt-1">
                Le bot officiel attribuera automatiquement ce rôle aux clients dès confirmation de leur commande.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsAddDiscordModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!newDiscordServerName.trim()}
                className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Connecter le serveur
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

      {/* Modal: Gérer les rôles */}
      <ModalOverlay
        isOpen={isManageRolesModalOpen && !!selectedServerForRoles}
        onClose={() => {
          setIsManageRolesModalOpen(false);
          setSelectedServerForRoles(null);
        }}
        contentClassName="max-w-md mx-auto"
      >
        {selectedServerForRoles && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">
                  Gérer les rôles Discord
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5 font-mono">
                  {selectedServerForRoles.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsManageRolesModalOpen(false);
                  setSelectedServerForRoles(null);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-zinc-300">
                Rôles synchronisés actuellement
              </label>
              {selectedServerForRoles.rolesManaged.length === 0 ? (
                <p className="text-xs text-zinc-500 italic">Aucun rôle configuré pour ce serveur.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedServerForRoles.rolesManaged.map((role, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-[#5865F2]/20 text-[#8c97f8] border border-[#5865F2]/30"
                    >
                      <span>@{role}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRoleFromSelectedServer(role)}
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <label className="block text-xs font-semibold text-zinc-300">
                Ajouter un rôle
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRoleToSelectedServer();
                    }
                  }}
                  placeholder="ex. VIP Gold, Accès Pro..."
                  className="flex-1 rounded-xl border border-white/[0.08] bg-[#0c0d0e] px-3.5 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#5865F2] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddRoleToSelectedServer}
                  disabled={!newRoleInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  Ajouter
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsManageRolesModalOpen(false);
                  setSelectedServerForRoles(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-xs font-bold text-white transition-all shadow-md cursor-pointer"
              >
                Terminer
              </button>
            </div>
          </div>
        )}
      </ModalOverlay>

      {/* ========================================================================= */}
      {/* 5. MODAL: "Lier l'application à un produit"                                */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={!!selectedAppToInstall}
        onClose={() => setSelectedAppToInstall(null)}
        contentClassName="max-w-lg mx-auto"
      >
        {selectedAppToInstall && (
          <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-5">
            
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Lier {selectedAppToInstall.title} à un produit
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Sélectionnez le ou les produits avec lesquels lier cette application.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppToInstall(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* App Header Box */}
            <div className="rounded-xl border border-white/[0.08] bg-[#0c0d0e] p-4 space-y-2">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-[#161822] flex items-center justify-center text-white shrink-0">
                  {selectedAppToInstall.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {selectedAppToInstall.title}
                  </h3>
                  <div className="text-[11px] text-zinc-400 font-mono">
                    {selectedAppToInstall.installationsCount} installations
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {selectedAppToInstall.description}
              </p>
            </div>

            {/* Products Selection List */}
            <div className="space-y-2.5">
              <div className="text-xs font-semibold text-zinc-300">
                Avec quel produit voulez-vous lier cette application ?
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {effectiveProductsList.map((prod) => {
                  const isChecked = selectedProductIdsToLink.includes(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                        isChecked
                          ? "border-blue-500/60 bg-blue-500/10 text-white"
                          : "border-white/10 bg-[#0c0d0e] text-zinc-300 hover:border-white/20"
                      }`}
                    >
                      <div className="min-w-0 flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setSelectedProductIdsToLink((prev) =>
                              isChecked
                                ? prev.filter((id) => id !== prod.id)
                                : [...prev, prod.id]
                            );
                          }}
                          className="size-4 accent-[#0055ff] rounded"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate text-white">
                            {prod.title}
                          </span>
                          <span className="text-[11px] text-zinc-400 block">
                            {prod.priceDisplay || "Inclus"} {prod.subscribersCount !== undefined ? `· ${prod.subscribersCount} actif(s)` : ""}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setSelectedAppToInstall(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={selectedProductIdsToLink.length === 0}
                onClick={handleConfirmLinkToProducts}
                className="px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {selectedAppToInstall.id === "telegram"
                  ? "Continuer vers Telegram"
                  : selectedAppToInstall.id === "discord"
                  ? "Continuer vers Discord"
                  : "Confirmer et continuer"}
              </button>
            </div>

          </div>
        )}
      </ModalOverlay>

      {/* ========================================================================= */}
      {/* 6. MODAL: TUTORIAL VIDEO                                                 */}
      {/* ========================================================================= */}
      <ModalOverlay
        isOpen={isTutorialOpen}
        onClose={() => setIsTutorialOpen(false)}
        contentClassName="max-w-lg mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <TelegramIcon className="size-5" />
              <h3 className="text-sm font-bold text-white">Tutoriel : Connecter votre Telegram</h3>
            </div>
            <button
              onClick={() => setIsTutorialOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="rounded-xl bg-black/60 border border-white/10 p-6 text-center space-y-3">
            <div className="size-12 rounded-full bg-[#229ED9]/20 border border-[#229ED9]/40 flex items-center justify-center text-[#229ED9] mx-auto">
              <Video className="size-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">Guide Vidéo & Étapes Express</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                1. Ouvrez Telegram et allez dans les paramètres de votre Canal ou Groupe.
                <br />
                2. Ajoutez <strong>@afhub_bot</strong> en tant qu'Administrateur.
                <br />
                3. Envoyez le code de vérification dans le canal.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setIsTutorialOpen(false)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </ModalOverlay>

    </div>
  );
};
