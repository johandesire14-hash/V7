import React, { useState } from "react";
import {
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Users,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Info,
  Radio,
  Lock,
  Unlock,
  Receipt,
  Mail,
  Smartphone,
  Flame,
  Award,
  Crown,
  Music,
  Download,
  Search,
  FileText,
  Bookmark,
} from "lucide-react";
import { TelegramIcon, DiscordIcon } from "./ConnectedAppsView";
import { AudioPreview30sPlayer } from "../common/AudioPreview30sPlayer";

const STORAGE_KEY = "mansa_customer_purchases";
const LEGACY_STORAGE_KEY = "whop_customer_purchases";

export interface PurchasedProductItem {
  id: string;
  orderNumber?: string;
  name: string;
  sellerName: string;
  sellerAvatar?: string;
  price: string;
  planName: string;
  purchaseDate: string;
  status: "active" | "canceled" | "past_due";
  nextBilling?: string;
  telegramChannelName?: string;
  telegramChannelId?: string;
  discordServerName?: string;
  discordRoleName?: string;
  hasDiscordApp: boolean;
  hasTelegramApp: boolean;
  hasCourseApp: boolean;
  hasFilesApp: boolean;
  hasAudioPreview?: boolean;
  audioTrackName?: string;
}

export const DEFAULT_CUSTOMER_PURCHASES: PurchasedProductItem[] = [
  {
    id: "purch-music",
    orderNumber: "CMD-928471",
    name: "Afrobeat Master Pack · 10 Beats & Stems WAV",
    sellerName: "Afro Beats Studio Dakar",
    sellerAvatar: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
    price: "20 000 FCFA",
    planName: "Licence Commerciale Illimitée",
    purchaseDate: "02 Septembre 2026",
    status: "active",
    nextBilling: "Achat unique définitif",
    telegramChannelName: "Afro Beats VIP Producers Group",
    telegramChannelId: "tg-afrobeats",
    discordServerName: "Afro Beats Studio HQ",
    discordRoleName: "Beatmaker Pro",
    hasDiscordApp: true,
    hasTelegramApp: true,
    hasCourseApp: false,
    hasFilesApp: true,
    hasAudioPreview: true,
    audioTrackName: "Afrobeat_Lagos_Summer_Hit_Master.mp3",
  },
  {
    id: "purch-1",
    name: "Forex Elite Africa · Signaux VIP Gold & Scalping",
    sellerName: "Forex Elite Africa SARL",
    sellerAvatar: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80",
    price: "25 000 FCFA",
    planName: "Abonnement Mensuel VIP",
    purchaseDate: "01 Septembre 2026",
    status: "active",
    nextBilling: "01 Octobre 2026",
    telegramChannelName: "Forex Elite · Signaux VIP Gold (Mansa)",
    telegramChannelId: "tg-fce-vip",
    discordServerName: "Forex Elite Trading HQ",
    discordRoleName: "Trader VIP Pro",
    hasDiscordApp: true,
    hasTelegramApp: true,
    hasCourseApp: true,
    hasFilesApp: true,
  },
  {
    id: "purch-2",
    name: "Alpha Bets Club · Data Analytics & Algorithmes",
    sellerName: "Alpha Bets Club Pro",
    sellerAvatar: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
    price: "15 000 FCFA",
    planName: "Pass Mensuel Prédictions",
    purchaseDate: "30 Août 2026",
    status: "active",
    nextBilling: "30 Septembre 2026",
    telegramChannelName: "Alpha Bets Picks Safe 1.80+",
    telegramChannelId: "tg-ab-safe",
    discordServerName: "Alpha Bets Community Discord",
    discordRoleName: "VIP Data Bettor",
    hasDiscordApp: true,
    hasTelegramApp: true,
    hasCourseApp: false,
    hasFilesApp: true,
  },
  {
    id: "purch-3",
    name: "Masterclass Dropshipping & Import Chine-Afrique",
    sellerName: "Sarah Diallo Studio",
    sellerAvatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    price: "45 000 FCFA",
    planName: "Accès Illimité à Vie",
    purchaseDate: "28 Août 2026",
    status: "active",
    nextBilling: "Accès à vie",
    telegramChannelName: "E-Commerce Sourcing & Fournisseurs",
    telegramChannelId: "tg-em-contacts",
    discordServerName: "E-Commerce Afrique HQ",
    discordRoleName: "Mastery Elite",
    hasDiscordApp: true,
    hasTelegramApp: true,
    hasCourseApp: true,
    hasFilesApp: true,
  },
  {
    id: "purch-4",
    name: "Mansa Automation Bot WhatsApp & Telegram",
    sellerName: "DevKreativ Lab",
    sellerAvatar: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
    price: "19 000 FCFA",
    planName: "Licence Pro SaaS",
    purchaseDate: "25 Août 2026",
    status: "active",
    nextBilling: "25 Septembre 2026",
    telegramChannelName: "DevKreativ Updates & API",
    telegramChannelId: "tg-dk-releases",
    discordServerName: "DevKreativ SaaS Hub",
    discordRoleName: "Licensed Developer",
    hasDiscordApp: true,
    hasTelegramApp: true,
    hasCourseApp: true,
    hasFilesApp: true,
  },
  {
    id: "purch-5",
    name: "Club Foncier & Investissement Immo Diaspora",
    sellerName: "Diaspora Invest Immo",
    sellerAvatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
    price: "30 000 FCFA",
    planName: "Membre Privé Syndicat",
    purchaseDate: "20 Août 2026",
    status: "active",
    nextBilling: "20 Septembre 2026",
    telegramChannelName: "Diaspora Invest Opportunités ACD",
    telegramChannelId: "tg-di-opportunites",
    discordServerName: "Diaspora Invest VIP",
    discordRoleName: "Investisseur Foncier",
    hasDiscordApp: true,
    hasTelegramApp: true,
    hasCourseApp: true,
    hasFilesApp: true,
  },
];

export function seedCustomerPurchases(): PurchasedProductItem[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMER_PURCHASES));
    window.dispatchEvent(new CustomEvent("mansa_purchases_updated", { detail: DEFAULT_CUSTOMER_PURCHASES }));
  }
  return DEFAULT_CUSTOMER_PURCHASES;
}

interface CustomerPurchasesViewProps {
  lang: "fr" | "en";
  onOpenAccountSettings?: () => void;
  isEmbeddedInSettings?: boolean;
}

export const CustomerPurchasesView: React.FC<CustomerPurchasesViewProps> = ({
  lang,
  onOpenAccountSettings,
  isEmbeddedInSettings = false,
}) => {
  // Purchases list (persisted in localStorage or demo state with migration)
  const [purchases, setPurchases] = useState<PurchasedProductItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CUSTOMER_PURCHASES;
    let saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      saved = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (saved) {
        localStorage.setItem(STORAGE_KEY, saved);
      }
    }
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Default fallback to show active simulated purchases
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOMER_PURCHASES));
    return DEFAULT_CUSTOMER_PURCHASES;
  });

  // Listen for purchases updates
  React.useEffect(() => {
    const handleUpdate = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setPurchases(parsed);
            if (parsed.length > 0 && !selectedPurchase) {
              setSelectedPurchase(parsed[0]);
            }
          }
        } catch {}
      }
    };
    window.addEventListener("mansa_purchases_updated", handleUpdate);
    return () => window.removeEventListener("mansa_purchases_updated", handleUpdate);
  }, []);

  const [selectedPurchase, setSelectedPurchase] = useState<PurchasedProductItem | null>(
    purchases.length > 0 ? purchases[0] : null
  );
  const [activeSubApp, setActiveSubApp] = useState<"telegram" | "discord" | "files" | "course" | "audio">(
    purchases.length > 0 && purchases[0].hasAudioPreview ? "audio" : "telegram"
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Discord State
  const [isDiscordLinked, setIsDiscordLinked] = useState(false);
  const [discordUsername, setDiscordUsername] = useState("");
  const [isClaimingDiscord, setIsClaimingDiscord] = useState(false);
  const [hasClaimedDiscord, setHasClaimedDiscord] = useState(false);

  // Telegram State
  const [isGeneratingTgLink, setIsGeneratingTgLink] = useState(false);
  const [generatedTgLink, setGeneratedTgLink] = useState<string | null>(null);
  const [isCopiedTgLink, setIsCopiedTgLink] = useState(false);
  const [hasJoinedTelegram, setHasJoinedTelegram] = useState(false);

  // Handle Claim Discord Access
  const handleClaimDiscord = () => {
    setIsClaimingDiscord(true);
    setTimeout(() => {
      setIsClaimingDiscord(false);
      setHasClaimedDiscord(true);
    }, 1200);
  };

  // Handle Generate One-Time Telegram Link
  const handleGenerateTelegramLink = () => {
    setIsGeneratingTgLink(true);
    const randomHash = Math.random().toString(36).substring(2, 10).toUpperCase();
    setTimeout(() => {
      setIsGeneratingTgLink(false);
      setGeneratedTgLink(`https://t.me/+${randomHash}_mansa_vip`);
    }, 700);
  };

  return (
    <div
      className={`select-none text-zinc-200 animate-in fade-in duration-200 ${
        isEmbeddedInSettings ? "w-full space-y-4" : "max-w-6xl mx-auto space-y-6 pb-12"
      }`}
    >
      {purchases.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-12 text-center space-y-4">
          <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
            <Receipt className="size-7 text-zinc-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Aucune commande enregistrée
            </h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Vous n'avez pas encore passé de commande (adhésion, e-book, musique ou formation). Vos accès et factures apparaîtront ici.
            </p>
          </div>
        </div>
      ) : selectedPurchase && (
        <>
          {/* Top Banner (or Compact Header if embedded in Settings) */}
          {isEmbeddedInSettings ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Mes Commandes & Achats
                  </h3>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Consultez l'historique complet de vos commandes, accès Telegram/Discord, factures et fichiers audio avec extrait de 30s.
                </p>
              </div>

              {/* Search in orders */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2 size-3.5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une commande..."
                  className="w-full rounded-xl bg-[#14161d] border border-white/10 pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#00D26A]"
                />
              </div>
            </div>
          ) : (
            /* Standalone Top Banner: Membership Status & Confirmation */
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-[#121316] to-[#121316] p-5 lg:p-6 shadow-xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex size-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
                      Statut Commandes : Validé & Actif
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Vos Commandes & Accès aux Produits
                  </h1>
                  <p className="text-xs text-zinc-400 max-w-2xl">
                    Vos accès exclusifs (Telegram, Discord, Musique avec extrait de 30s, Contenus digitaux) sont activés et synchronisés automatiquement avec votre compte.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid: Left Purchases Selector, Right Apps Access Hub */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* LEFT COLUMN: List of Purchased Businesses (lg:col-span-4 or 5) */}
            <div className={`${isEmbeddedInSettings ? "lg:col-span-5" : "lg:col-span-4"} space-y-3`}>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Commandes ({purchases.length})
                </h2>
                <span className="text-[10px] font-mono text-zinc-500">
                  Profil client
                </span>
              </div>

              <div className="space-y-2.5">
                {purchases.map((item) => {
                  const isSelected = selectedPurchase?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedPurchase(item);
                        setGeneratedTgLink(null);
                        setHasClaimedDiscord(false);
                        if (item.hasTelegramApp) setActiveSubApp("telegram");
                        else if (item.hasDiscordApp) setActiveSubApp("discord");
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-[#0055ff] bg-[#161822] shadow-sm"
                          : "border-white/[0.06] bg-[#0f1013] hover:border-white/15 hover:bg-[#14151a]"
                      }`}
                    >
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden shadow-inner">
                      {item.sellerAvatar ? (
                        <img src={item.sellerAvatar} alt={item.sellerName} className="size-full object-cover" />
                      ) : (
                        <span>{item.name.charAt(0)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white truncate block">
                          {item.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                          Actif
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5 font-medium">
                        Par @{item.sellerName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-2 font-mono">
                        <span>{item.price}</span>
                        <span>•</span>
                        <span>{item.purchaseDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Helper card */}
          <div className="rounded-2xl border border-white/[0.06] bg-[#0c0d0e] p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 text-zinc-300 font-bold">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span>Garantie de livraison Mansa</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Vos accès sont rattachés à vie ou durant la durée de votre abonnement. Si vous changez de téléphone ou de compte, reconnectez-vous simplement à Mansa.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: App Access Experience (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Selected Business Top Bar */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Business sélectionné :</span>
                <span className="text-xs font-bold text-white font-mono">@{selectedPurchase.sellerName}</span>
              </div>
              <h3 className="text-lg font-extrabold text-white mt-0.5">
                {selectedPurchase.name}
              </h3>
            </div>

            {/* App Nav Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#16181f] border border-white/5 self-start sm:self-auto overflow-x-auto max-w-full">
              {selectedPurchase.hasAudioPreview && (
                <button
                  onClick={() => setActiveSubApp("audio")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubApp === "audio"
                      ? "bg-[#00D26A] text-black shadow-md font-extrabold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Music className="size-3.5" />
                  <span>Extrait Audio (30s)</span>
                </button>
              )}

              {selectedPurchase.hasTelegramApp && (
                <button
                  onClick={() => setActiveSubApp("telegram")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubApp === "telegram"
                      ? "bg-[#229ED9] text-white shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <TelegramIcon className="size-3.5" />
                  <span>Telegram</span>
                </button>
              )}

              {selectedPurchase.hasDiscordApp && (
                <button
                  onClick={() => setActiveSubApp("discord")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubApp === "discord"
                      ? "bg-[#5865F2] text-white shadow-md"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <DiscordIcon className="size-3.5" />
                  <span>Discord</span>
                </button>
              )}

              {selectedPurchase.hasFilesApp && (
                <button
                  onClick={() => setActiveSubApp("files")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeSubApp === "files"
                      ? "bg-white/20 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <span>📁 Fichiers</span>
                </button>
              )}
            </div>
          </div>

          {/* ================================================================= */}
          {/* 0. AUDIO PREVIEW 30s APP (Fichier Prod Écoute 30 Secondes)        */}
          {/* ================================================================= */}
          {activeSubApp === "audio" && selectedPurchase.hasAudioPreview && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#00D26A]/15 border border-[#00D26A]/30 flex items-center justify-center text-[#00D26A]">
                    <Music className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Extrait d'Écoute Musicale (30 Secondes)
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Fichier prod rattaché à votre commande · {selectedPurchase.audioTrackName || selectedPurchase.name}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#00D26A]/15 text-[#00D26A] font-bold">
                  Aperçu 30s
                </span>
              </div>

              <AudioPreview30sPlayer
                title={selectedPurchase.audioTrackName || selectedPurchase.name}
                artist={selectedPurchase.sellerName}
                variant="full"
                maxSeconds={30}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#14161c] border border-white/5 text-xs">
                <div className="space-y-0.5">
                  <span className="font-semibold text-white block">
                    Fichiers Master WAV & MP3 Débloqués
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    Commande validée : accès permanent à vos pistes audio haute fidélité.
                  </span>
                </div>
                <button
                  onClick={() => alert(`Téléchargement du pack audio pour la commande ${selectedPurchase.orderNumber || selectedPurchase.id}`)}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#00D26A] hover:bg-emerald-400 text-black font-extrabold text-xs cursor-pointer shadow-md transition-all"
                >
                  <Download className="size-3.5" />
                  <span>Télécharger Fichier Prod</span>
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 1. TELEGRAM APP FAN FLOW (Lien unique personnel)                   */}
          {/* ================================================================= */}
          {activeSubApp === "telegram" && selectedPurchase.hasTelegramApp && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#229ED9]/15 border border-[#229ED9]/30 flex items-center justify-center text-[#229ED9]">
                    <TelegramIcon className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Accès Canal / Groupe Telegram VIP
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Canal cible : <strong>{selectedPurchase.telegramChannelName || "Canal VIP"}</strong>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#229ED9]/15 text-[#229ED9] font-bold">
                  Lien à usage unique
                </span>
              </div>

              {/* Step by Step instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#14161c] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">1. Générer le lien</span>
                  <p className="text-zinc-400 text-[11px]">
                    Cliquez sur le bouton pour créer votre lien sécurisé.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14161c] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">2. Ouvrir Telegram</span>
                  <p className="text-zinc-400 text-[11px]">
                    L'application Telegram s'ouvre sur votre téléphone ou PC.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14161c] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">3. Rejoindre en 1 clic</span>
                  <p className="text-zinc-400 text-[11px]">
                    Appuyez sur "Rejoindre le groupe" pour accéder aux alertes.
                  </p>
                </div>
              </div>

              {/* Action Box: Join / Generate link */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12141a] p-5 space-y-4">
                
                {!generatedTgLink ? (
                  <div className="text-center py-4 space-y-4">
                    <div className="size-12 rounded-full bg-[#229ED9]/20 border border-[#229ED9]/40 flex items-center justify-center text-[#229ED9] mx-auto">
                      <TelegramIcon className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">
                        Prêt à rejoindre {selectedPurchase.telegramChannelName} ?
                      </h5>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto">
                        Ce lien d'invitation est personnel et protégé par le Bot Mansa. Aucun compte Telegram préalable n'a besoin d'être relié.
                      </p>
                    </div>

                    <button
                      onClick={handleGenerateTelegramLink}
                      disabled={isGeneratingTgLink}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white px-6 py-3 text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingTgLink ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Génération du lien unique...</span>
                        </>
                      ) : (
                        <>
                          <TelegramIcon className="size-4" />
                          <span>Rejoindre le groupe Telegram</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-emerald-400" />
                        <span>Votre lien d'accès personnel a été généré :</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        Expire dans 24h · 1 utilisation
                      </span>
                    </div>

                    {/* Link display bar */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="w-full flex-1 rounded-xl bg-[#0c0d0e] border border-white/10 px-4 py-2.5 font-mono text-xs text-[#229ED9] truncate">
                        {generatedTgLink}
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText?.(generatedTgLink);
                            setIsCopiedTgLink(true);
                            setTimeout(() => setIsCopiedTgLink(false), 2000);
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-[#16181f] hover:bg-white/10 text-white px-3.5 py-2.5 text-xs font-semibold cursor-pointer"
                        >
                          {isCopiedTgLink ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5 text-zinc-400" />}
                          <span>{isCopiedTgLink ? "Copié" : "Copier"}</span>
                        </button>

                        <button
                          onClick={() => {
                            setHasJoinedTelegram(true);
                            window.open(generatedTgLink, "_blank");
                          }}
                          className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#229ED9] hover:bg-[#1b8bc2] text-white px-5 py-2.5 text-xs font-bold cursor-pointer shadow-md"
                        >
                          <span>Ouvrir dans Telegram</span>
                          <ExternalLink className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Warning note */}
                    <div className="rounded-xl bg-[#1a1b22] border border-white/5 p-3 flex items-start gap-2.5 text-[11px] text-zinc-400">
                      <Info className="size-4 text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        Ce lien est à <strong>usage unique</strong>. Si vous quittez le canal par mégarde, vous pouvez cliquer sur <em>"Régénérer un lien d'accès"</em> à tout moment depuis cette page.
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={handleGenerateTelegramLink}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="size-3" />
                        <span>Régénérer un nouveau lien d'accès</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* 2. DISCORD APP FAN FLOW (Liaison compte + Claim Access + Bot Role) */}
          {/* ================================================================= */}
          {activeSubApp === "discord" && selectedPurchase.hasDiscordApp && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2]">
                    <DiscordIcon className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      Accès Serveur Discord & Rôles VIP
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Serveur : <strong>{selectedPurchase.discordServerName}</strong> · Rôle : <strong className="text-[#8c97f8]">@{selectedPurchase.discordRoleName}</strong>
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#5865F2]/15 text-[#8c97f8] font-bold">
                  Attribution Automatique
                </span>
              </div>

              {/* Étapes claires requises pour Discord */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#14161c] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">1. Lier son Discord</span>
                  <p className="text-zinc-400 text-[11px]">
                    Liez votre compte Discord à votre profil Mansa une seule fois.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14161c] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">2. Claim Access</span>
                  <p className="text-zinc-400 text-[11px]">
                    Cliquez sur "Claim Access" ci-dessous pour activer vos permissions.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#14161c] border border-white/5 space-y-1">
                  <span className="font-bold text-white block">3. Rôle attribué</span>
                  <p className="text-zinc-400 text-[11px]">
                    Le bot vous invite et vous accorde le rôle VIP sans lien manuel.
                  </p>
                </div>
              </div>

              {/* Step 1: Discord Account Link Check */}
              <div className="rounded-xl border border-white/[0.08] bg-[#12141a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-[#5865F2]/20 flex items-center justify-center text-[#5865F2]">
                    <DiscordIcon className="size-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Compte Discord connecté
                    </span>
                    {isDiscordLinked ? (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                        <Check className="size-3" /> Connecté en tant que <strong>{discordUsername}</strong>
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-400">
                        Aucun compte Discord lié à votre profil Mansa
                      </span>
                    )}
                  </div>
                </div>

                {isDiscordLinked ? (
                  <button
                    onClick={() => {
                      const newNick = prompt("Modifier le pseudo Discord :", discordUsername);
                      if (newNick) setDiscordUsername(newNick);
                    }}
                    className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 bg-[#16181f] cursor-pointer"
                  >
                    Changer de compte
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsDiscordLinked(true);
                      setDiscordUsername("johan_invest#4291");
                    }}
                    className="px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold cursor-pointer"
                  >
                    Connecter Discord
                  </button>
                )}
              </div>

              {/* Step 2 & 3: Claim Access Button */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#12141a] p-6 text-center space-y-4">
                {hasClaimedDiscord ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="size-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <div className="space-y-1">
                      <h5 className="text-sm font-bold text-white">
                        Accès Discord Débloqué avec Succès !
                      </h5>
                      <p className="text-xs text-zinc-400 max-w-md mx-auto">
                        Le Bot Mansa officiel a synchronisé vos droits sur le serveur <strong>{selectedPurchase.discordServerName}</strong>. Le rôle <span className="text-[#8c97f8] font-bold">@{selectedPurchase.discordRoleName}</span> vous a été attribué.
                      </p>
                    </div>

                    <button
                      onClick={() => window.open("https://discord.com", "_blank")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold cursor-pointer shadow-md"
                    >
                      <DiscordIcon className="size-4" />
                      <span>Ouvrir Discord</span>
                      <ExternalLink className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-white">
                      Réclamer l'accès pour {discordUsername}
                    </h5>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto">
                      En cliquant sur "Claim Access", notre bot Discord vous ajoute instantanément au serveur du créateur et vous applique vos rôles VIP.
                    </p>

                    <button
                      onClick={handleClaimDiscord}
                      disabled={isClaimingDiscord || !isDiscordLinked}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white px-6 py-3 text-xs font-extrabold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isClaimingDiscord ? (
                        <>
                          <RefreshCw className="size-4 animate-spin" />
                          <span>Attribution des rôles en cours...</span>
                        </>
                      ) : (
                        <>
                          <Crown className="size-4 text-amber-300" />
                          <span>Claim Access (Réclamer l'accès)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* 3. FILES APP                                                      */}
          {/* ================================================================= */}
          {activeSubApp === "files" && selectedPurchase.hasFilesApp && (
            <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <h4 className="text-sm font-bold text-white">
                  Fichiers inclus avec votre commande
                </h4>
                <span className="text-[10px] font-mono text-zinc-400">
                  {selectedPurchase.hasAudioPreview ? "3 fichiers disponibles" : "2 fichiers disponibles"}
                </span>
              </div>

              {selectedPurchase.hasAudioPreview && (
                <div className="p-4 rounded-xl bg-[#14161c] border border-[#00D26A]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 rounded-lg bg-[#00D26A]/15 text-[#00D26A] font-mono font-bold text-[10px]">
                        AUDIO
                      </span>
                      <div>
                        <span className="font-semibold text-white block text-xs">
                          {selectedPurchase.audioTrackName || "Afrobeat_Lagos_Master_Track.mp3"}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          Extrait 30s + Master WAV 24-bit (45 Mo)
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Téléchargement de : ${selectedPurchase.audioTrackName || "Audio Master"}`)}
                      className="px-3 py-1.5 rounded-lg bg-[#00D26A] hover:bg-emerald-400 text-black text-xs font-bold cursor-pointer"
                    >
                      Télécharger WAV
                    </button>
                  </div>
                  <AudioPreview30sPlayer
                    title={selectedPurchase.audioTrackName || selectedPurchase.name}
                    artist={selectedPurchase.sellerName}
                    variant="compact"
                    maxSeconds={30}
                  />
                </div>
              )}

              <div className="space-y-2">
                {[
                  { name: "Guide VIP - Stratégies & Licence Commerciale 2026.pdf", size: "4.2 Mo", type: "PDF" },
                  { name: "Facture Officielle & Certificat de Session.pdf", size: "640 Ko", type: "FACTURE" },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#14161c] border border-white/5 text-xs hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="p-2 rounded-lg bg-pink-500/10 text-pink-400 font-mono font-bold text-[10px]">
                        {f.type}
                      </span>
                      <div>
                        <span className="font-semibold text-white block">{f.name}</span>
                        <span className="text-[10px] text-zinc-500">{f.size}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => alert(`Téléchargement de : ${f.name}`)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer"
                    >
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          </div>

        </div>
      </>
    )}

    </div>
  );
};
