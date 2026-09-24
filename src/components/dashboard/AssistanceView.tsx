import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Send,
  Search,
  User,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Phone,
  Mail,
  Shield,
  Star,
  Sparkles,
  Paperclip,
  Smile,
  ArrowLeft,
  MoreVertical,
  CheckCheck,
  Check,
  ExternalLink,
  X,
  RefreshCw,
  Users,
  Zap,
  Building2,
  ChevronDown,
  Bot,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Company } from "../../types";
import { updateCompanyAutoReply, getSavedCompanies } from "../../utils/companyStorage";

export interface AssistanceMessage {
  id: string;
  sender: "user" | "creator";
  senderName?: string;
  text: string;
  time: string;
  timestamp: number;
  status?: "sent" | "delivered" | "read";
}

export interface MemberConversation {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberAvatar: string;
  memberCountryFlag: string;
  memberCountryName: string;
  productName: string;
  companyId: string;
  companyName: string;
  status: "open" | "waiting" | "resolved";
  isVip: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  lastTimestamp: number;
  messages: AssistanceMessage[];
}

interface AssistanceViewProps {
  lang?: "fr" | "en";
  activeCompany?: Company | null;
  companies?: Company[];
  onNavigateToClients?: () => void;
}

// Initial realistic conversations with enterprise members
const DEFAULT_CONVERSATIONS: MemberConversation[] = [
  {
    id: "conv-1",
    memberId: "mem-1",
    memberName: "Ibrahim Diallo",
    memberEmail: "ibrahim.diallo@gmail.com",
    memberAvatar: "ID",
    memberCountryFlag: "🇸🇳",
    memberCountryName: "Sénégal",
    productName: "Pass VIP Signaux Telegram",
    companyId: "comp-victory",
    companyName: "Victory Odds",
    status: "open",
    isVip: true,
    unreadCount: 1,
    lastMessage: "Bonjour, j'ai validé mon paiement Wave mais je n'arrive pas à ouvrir le lien du bot Telegram. Pouvez-vous m'aider ?",
    lastMessageTime: "14:32",
    lastTimestamp: Date.now() - 1000 * 60 * 15,
    messages: [
      {
        id: "m-1",
        sender: "user",
        senderName: "Ibrahim Diallo",
        text: "Bonjour l'équipe ! Je viens de rejoindre la communauté et j'ai pris le Pass VIP Signaux Telegram.",
        time: "14:28",
        timestamp: Date.now() - 1000 * 60 * 20,
        status: "read",
      },
      {
        id: "m-2",
        sender: "creator",
        senderName: "Support Victory Odds",
        text: "Bonjour Ibrahim ! Bienvenue parmi nous. Félicitations pour votre adhésion. Avez-vous reçu le SMS de confirmation Wave ?",
        time: "14:30",
        timestamp: Date.now() - 1000 * 60 * 18,
        status: "read",
      },
      {
        id: "m-3",
        sender: "user",
        senderName: "Ibrahim Diallo",
        text: "Bonjour, j'ai validé mon paiement Wave mais je n'arrive pas à ouvrir le lien du bot Telegram. Pouvez-vous m'aider ?",
        time: "14:32",
        timestamp: Date.now() - 1000 * 60 * 15,
        status: "read",
      },
    ],
  },
  {
    id: "conv-2",
    memberId: "mem-2",
    memberName: "Awa Traoré",
    memberEmail: "awa.traore@yahoo.fr",
    memberAvatar: "AT",
    memberCountryFlag: "🇨🇮",
    memberCountryName: "Côte d'Ivoire",
    productName: "Masterclass Scalping Pro",
    companyId: "comp-victory",
    companyName: "Victory Odds",
    status: "waiting",
    isVip: true,
    unreadCount: 0,
    lastMessage: "Votre accès au salon Discord privé a été débloqué avec succès. Bon visionnage de la masterclass !",
    lastMessageTime: "11:05",
    lastTimestamp: Date.now() - 1000 * 60 * 180,
    messages: [
      {
        id: "m-201",
        sender: "user",
        senderName: "Awa Traoré",
        text: "Bonjour, est-ce que les sessions en direct sont enregistrées et disponibles en replay ?",
        time: "10:45",
        timestamp: Date.now() - 1000 * 60 * 200,
        status: "read",
      },
      {
        id: "m-202",
        sender: "creator",
        senderName: "Support Victory Odds",
        text: "Bonjour Awa, oui absolument ! Toutes les sessions de scalping sont enregistrées et postées sous 2 heures.",
        time: "11:00",
        timestamp: Date.now() - 1000 * 60 * 185,
        status: "read",
      },
      {
        id: "m-203",
        sender: "creator",
        senderName: "Support Victory Odds",
        text: "Votre accès au salon Discord privé a été débloqué avec succès. Bon visionnage de la masterclass !",
        time: "11:05",
        timestamp: Date.now() - 1000 * 60 * 180,
        status: "read",
      },
    ],
  },
  {
    id: "conv-3",
    memberId: "mem-3",
    memberName: "Kofi Mensah",
    memberEmail: "kofi.mensah@finances.gh",
    memberAvatar: "KM",
    memberCountryFlag: "🇬🇭",
    memberCountryName: "Ghana",
    productName: "Membre Communauté",
    companyId: "comp-victory",
    companyName: "Victory Odds",
    status: "open",
    isVip: false,
    unreadCount: 2,
    lastMessage: "Hello! Can I pay using MTN Mobile Money from Accra? Thanks.",
    lastMessageTime: "Hier",
    lastTimestamp: Date.now() - 1000 * 60 * 60 * 22,
    messages: [
      {
        id: "m-301",
        sender: "user",
        senderName: "Kofi Mensah",
        text: "Hello! I saw your trading results on Mansa Discover. Looks impressive!",
        time: "Hier 16:10",
        timestamp: Date.now() - 1000 * 60 * 60 * 24,
        status: "read",
      },
      {
        id: "m-302",
        sender: "user",
        senderName: "Kofi Mensah",
        text: "Can I pay using MTN Mobile Money from Accra? Thanks.",
        time: "Hier 16:12",
        timestamp: Date.now() - 1000 * 60 * 60 * 22,
        status: "read",
      },
    ],
  },
  {
    id: "conv-4",
    memberId: "mem-4",
    memberName: "Moussa Koné",
    memberEmail: "moussa.kone@gmail.com",
    memberAvatar: "MK",
    memberCountryFlag: "🇲🇱",
    memberCountryName: "Mali",
    productName: "Pack VIP Annuel",
    companyId: "comp-victory",
    companyName: "Victory Odds",
    status: "resolved",
    isVip: true,
    unreadCount: 0,
    lastMessage: "Merci pour votre aide rapide, tout fonctionne parfaitement !",
    lastMessageTime: "2j",
    lastTimestamp: Date.now() - 1000 * 60 * 60 * 48,
    messages: [
      {
        id: "m-401",
        sender: "user",
        senderName: "Moussa Koné",
        text: "J'avais une question sur la reconduction automatique de l'abonnement.",
        time: "Il y a 2j",
        timestamp: Date.now() - 1000 * 60 * 60 * 50,
        status: "read",
      },
      {
        id: "m-402",
        sender: "creator",
        senderName: "Support",
        text: "Bonjour Moussa, aucun prélèvement n'est automatique sans votre accord exprès chaque mois.",
        time: "Il y a 2j",
        timestamp: Date.now() - 1000 * 60 * 60 * 49,
        status: "read",
      },
      {
        id: "m-403",
        sender: "user",
        senderName: "Moussa Koné",
        text: "Merci pour votre aide rapide, tout fonctionne parfaitement !",
        time: "Il y a 2j",
        timestamp: Date.now() - 1000 * 60 * 60 * 48,
        status: "read",
      },
    ],
  },
];

export const AssistanceView: React.FC<AssistanceViewProps> = ({
  lang = "fr",
  activeCompany,
  companies = [],
  onNavigateToClients,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<MemberConversation[]>(() => {
    try {
      const saved = localStorage.getItem("mansa_creator_assistance_conversations");
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_CONVERSATIONS;
  });

  const [selectedConvId, setSelectedConvId] = useState<string>(
    DEFAULT_CONVERSATIONS[0]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "open" | "waiting" | "resolved" | "vip">("all");
  const [replyInput, setReplyInput] = useState("");
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberFirstMessage, setNewMemberFirstMessage] = useState("");
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-reply configuration state
  const [isAutoReplyModalOpen, setIsAutoReplyModalOpen] = useState(false);
  const [autoReplyCompanyId, setAutoReplyCompanyId] = useState<string>(
    activeCompany?.id || companies[0]?.id || "comp-cadre-financier"
  );
  const [autoReplyEnabled, setAutoReplyEnabled] = useState<boolean>(true);
  const [autoReplyMessage, setAutoReplyMessage] = useState<string>("");

  // Sync auto-reply settings when active company changes
  useEffect(() => {
    const targetId = activeCompany?.id || companies[0]?.id || "comp-cadre-financier";
    setAutoReplyCompanyId(targetId);
    const userKey = user?.email || "default";
    const all = getSavedCompanies(userKey);
    const comp = all.find((c) => c.id === targetId) || activeCompany;
    if (comp) {
      setAutoReplyEnabled(comp.supportAutoReplyEnabled ?? true);
      setAutoReplyMessage(
        comp.supportAutoReplyMessage ||
          "Bonjour ! Merci d'avoir contacté notre équipe. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais."
      );
    }
  }, [activeCompany, companies, user]);

  const handleSelectAutoReplyCompany = (id: string) => {
    setAutoReplyCompanyId(id);
    const userKey = user?.email || "default";
    const all = getSavedCompanies(userKey);
    const comp = all.find((c) => c.id === id);
    if (comp) {
      setAutoReplyEnabled(comp.supportAutoReplyEnabled ?? true);
      setAutoReplyMessage(
        comp.supportAutoReplyMessage ||
          "Bonjour ! Merci d'avoir contacté notre équipe. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais."
      );
    }
  };

  const handleSaveAutoReply = (e: React.FormEvent) => {
    e.preventDefault();
    const userKey = user?.email || "default";
    updateCompanyAutoReply(userKey, autoReplyCompanyId, {
      enabled: autoReplyEnabled,
      message: autoReplyMessage.trim(),
    });
    showToast(lang === "fr" ? "Message automatique enregistré" : "Auto-reply saved");
    setIsAutoReplyModalOpen(false);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("mansa_creator_assistance_conversations", JSON.stringify(conversations));
    } catch {
      // ignore
    }
  }, [conversations]);

  // Synchronize with member view Assistance chat if activeCompany matches
  useEffect(() => {
    const handleSyncFromMember = (e: any) => {
      const detail = e.detail;
      if (detail && detail.companyId && detail.message) {
        const userKey = user?.email || "default";
        const allComps = getSavedCompanies(userKey);
        const comp = allComps.find(
          (c) => c.id === detail.companyId || (activeCompany && activeCompany.id === detail.companyId)
        ) || activeCompany;

        setConversations((prev) => {
          const convIndex = prev.findIndex(
            (c) => c.companyId === detail.companyId || c.memberEmail === detail.memberEmail
          );
          if (convIndex >= 0) {
            const updated = [...prev];
            const target = { ...updated[convIndex] };
            const now = Date.now();
            const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            const newMsg: AssistanceMessage = {
              id: `m-sync-${now}`,
              sender: "user",
              senderName: detail.memberName || target.memberName,
              text: detail.message,
              time: nowTime,
              timestamp: now,
              status: "sent",
            };

            const autoEnabled = comp?.supportAutoReplyEnabled ?? true;
            const autoMsgText = comp?.supportAutoReplyMessage
              ? comp.supportAutoReplyMessage
                  .replace(/\{nom\}/gi, detail.memberName || target.memberName)
                  .replace(/\{entreprise\}/gi, comp.name || target.companyName)
              : `Message bien reçu. L'équipe d'assistance de ${comp?.name || target.companyName} est notifiée et vous répondra dans les plus brefs délais.`;

            const replies: AssistanceMessage[] = [newMsg];
            if (autoEnabled) {
              replies.push({
                id: `m-autoreply-${now + 1}`,
                sender: "creator",
                senderName: `${comp?.name || target.companyName} (Auto)`,
                text: autoMsgText,
                time: nowTime,
                timestamp: now + 1,
                status: "delivered",
              });
            }

            target.messages = [...target.messages, ...replies];
            target.lastMessage = autoEnabled ? autoMsgText : detail.message;
            target.lastMessageTime = nowTime;
            target.lastTimestamp = now + (autoEnabled ? 1 : 0);
            target.unreadCount = (target.unreadCount || 0) + 1;
            target.status = "open";
            updated[convIndex] = target;
            return updated;
          }
          return prev;
        });
      }
    };

    window.addEventListener("mansa_member_assistance_sent", handleSyncFromMember);
    return () => {
      window.removeEventListener("mansa_member_assistance_sent", handleSyncFromMember);
    };
  }, [activeCompany, user]);

  const selectedConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConversation?.messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = conv.memberName.toLowerCase().includes(q);
      const matchEmail = conv.memberEmail.toLowerCase().includes(q);
      const matchMsg = conv.messages.some((m) => m.text.toLowerCase().includes(q));
      if (!matchName && !matchEmail && !matchMsg) return false;
    }
    if (filterStatus === "open") return conv.status === "open";
    if (filterStatus === "waiting") return conv.status === "waiting";
    if (filterStatus === "resolved") return conv.status === "resolved";
    if (filterStatus === "vip") return conv.isVip;
    return true;
  });

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!replyInput.trim() || !selectedConversation) return;

    const textToSend = replyInput.trim();
    const newMsg: AssistanceMessage = {
      id: `m-creator-${Date.now()}`,
      sender: "creator",
      senderName: activeCompany?.name || "Support",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timestamp: Date.now(),
      status: "delivered",
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMsg],
            lastMessage: textToSend,
            lastMessageTime: newMsg.time,
            lastTimestamp: Date.now(),
            status: "waiting", // creator replied, waiting on member
            unreadCount: 0,
          };
        }
        return conv;
      })
    );

    setReplyInput("");

    // Broadcast event for member view if applicable
    window.dispatchEvent(
      new CustomEvent("mansa_creator_assistance_replied", {
        detail: {
          companyId: selectedConversation.companyId,
          memberId: selectedConversation.memberId,
          text: textToSend,
        },
      })
    );

    // Simulate member reply after a short delay if in testing
    if (selectedConversation.status === "open") {
      setTimeout(() => {
        const simulatedReplies = [
          "Super, merci infiniment pour votre réactivité !",
          "Parfait, j'ai cliqué sur le lien et j'ai bien rejoint le canal Telegram.",
          "C'est noté, je vous remercie pour l'explication claire.",
          "Génial, tout fonctionne à merveille ! Merci beaucoup pour votre aide.",
        ];
        const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === selectedConversation.id) {
              const replyMsg: AssistanceMessage = {
                id: `m-member-${Date.now()}`,
                sender: "user",
                senderName: conv.memberName,
                text: randomReply,
                time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                timestamp: Date.now(),
                status: "sent",
              };
              return {
                ...conv,
                messages: [...conv.messages, replyMsg],
                lastMessage: randomReply,
                lastMessageTime: replyMsg.time,
                lastTimestamp: Date.now(),
                unreadCount: conv.unreadCount + 1,
              };
            }
            return conv;
          })
        );
        showToast(`Nouveau message de ${selectedConversation.memberName}`);
      }, 2400);
    }
  };

  const handleQuickTemplate = (templateText: string) => {
    setReplyInput(templateText);
  };

  const handleToggleResolved = () => {
    if (!selectedConversation) return;
    const newStatus = selectedConversation.status === "resolved" ? "open" : "resolved";
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation.id ? { ...c, status: newStatus } : c))
    );
    showToast(newStatus === "resolved" ? "Conversation marquée comme résolue" : "Conversation réouverte");
  };

  const handleCreateNewConversation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberFirstMessage.trim()) return;

    const initials = newMemberName
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const newConv: MemberConversation = {
      id: `conv-${Date.now()}`,
      memberId: `mem-${Date.now()}`,
      memberName: newMemberName.trim(),
      memberEmail: newMemberEmail.trim() || `${newMemberName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
      memberAvatar: initials || "MB",
      memberCountryFlag: "🌍",
      memberCountryName: "Afrique",
      productName: "Discussion Directe",
      companyId: activeCompany?.id || "comp-default",
      companyName: activeCompany?.name || "Entreprise",
      status: "waiting",
      isVip: false,
      unreadCount: 0,
      lastMessage: newMemberFirstMessage.trim(),
      lastMessageTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      lastTimestamp: Date.now(),
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: "creator",
          senderName: activeCompany?.name || "Support",
          text: newMemberFirstMessage.trim(),
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now(),
          status: "delivered",
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedConvId(newConv.id);
    setIsNewChatModalOpen(false);
    setNewMemberName("");
    setNewMemberEmail("");
    setNewMemberFirstMessage("");
    showToast(`Conversation démarrée avec ${newConv.memberName}`);
  };

  // Quick responses templates
  const QUICK_TEMPLATES = [
    "👋 Bonjour ! Comment puis-je vous aider aujourd'hui ?",
    "🔗 Voici votre lien d'accès direct au canal Telegram VIP : https://t.me/joinchat/vip-mansa",
    "💳 Votre paiement Mobile Money a bien été validé.",
    "✅ Votre accès a été débloqué avec succès ! Bienvenue.",
    "🙏 Merci pour votre confiance ! N'hésitez pas si vous avez d'autres questions.",
  ];

  return (
    <div className="space-y-4 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl bg-[#00D26A] text-black px-4 py-2.5 text-xs font-bold shadow-xl animate-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Title & Stats */}
      <div className="rounded-2xl border border-white/10 bg-[#121316] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[#00D26A] shadow-inner">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  {lang === "fr" ? "Assistance Membres" : "Member Support"}
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === "fr"
                  ? "Communiquez en direct avec les membres de votre entreprise, répondez à leurs questions et résolvez leurs demandes."
                  : "Chat live with your community members, answer inquiries and provide support."}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {activeCompany && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-zinc-300">
                <Building2 className="size-3.5 text-emerald-400" />
                <span className="font-semibold text-white">{activeCompany.name}</span>
              </div>
            )}

            <button
              onClick={() => setIsAutoReplyModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-2 cursor-pointer transition-all"
              title="Configurer la réponse automatique"
            >
              <Bot className="size-3.5 text-blue-400" />
              <span>{lang === "fr" ? "Message automatique" : "Auto-reply"}</span>
            </button>

            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="mansa-btn-green px-3.5 py-2 text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="size-3.5" />
              <span>{lang === "fr" ? "Écrire à un membre" : "Message member"}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/[0.06]">
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-zinc-400 block font-medium">Conversations actives</span>
            <span className="text-base font-black text-white font-mono mt-0.5 block">
              {conversations.length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-zinc-400 block font-medium">Demandes en attente</span>
            <span className="text-base font-black text-amber-400 font-mono mt-0.5 block">
              {conversations.filter((c) => c.status === "open").length}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-zinc-400 block font-medium">Temps de réponse moyen</span>
            <span className="text-base font-black text-emerald-400 font-mono mt-0.5 block">
              ~ 4 min
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
            <span className="text-[11px] text-zinc-400 block font-medium">Taux de résolution</span>
            <span className="text-base font-black text-[#0055ff] font-mono mt-0.5 block">
              98.2%
            </span>
          </div>
        </div>
      </div>

      {/* Main Dual-Pane Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[680px]">
        {/* LEFT COLUMN: Conversations List (lg:col-span-4 or 5) */}
        <div
          className={`lg:col-span-4 rounded-2xl border border-white/10 bg-[#121316] flex flex-col overflow-hidden h-full ${
            isMobileChatOpen ? "hidden lg:flex" : "flex"
          }`}
        >
          {/* Top Search & Filters */}
          <div className="p-3.5 border-b border-white/[0.08] space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Rechercher un membre ou message..." : "Search member or message..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {[
                { id: "all", label: "Tous" },
                { id: "open", label: "En attente" },
                { id: "vip", label: "VIP" },
                { id: "resolved", label: "Résolus" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    filterStatus === tab.id
                      ? "bg-white/15 text-white shadow-sm"
                      : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Users className="size-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-semibold text-zinc-300">Aucune conversation trouvée</p>
                <p className="text-[11px] text-zinc-500">
                  {searchQuery ? "Modifiez votre recherche" : "Les messages de vos membres s'afficheront ici."}
                </p>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setIsMobileChatOpen(true);
                      // Clear unread count on open
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/[0.07] border-l-4 border-l-[#00D26A]"
                        : "hover:bg-white/[0.03] border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Avatar & Flag */}
                    <div className="relative shrink-0">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                        {conv.memberAvatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-xs leading-none select-none">
                        {conv.memberCountryFlag}
                      </span>
                    </div>

                    {/* Member Details & Last message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-xs font-bold text-white truncate">
                            {conv.memberName}
                          </span>
                          {conv.isVip && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              VIP
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] text-zinc-400 truncate leading-relaxed">
                          {conv.lastMessage}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-zinc-500 truncate max-w-[140px]">
                          {conv.productName}
                        </span>
                        {conv.status === "resolved" ? (
                          <span className="text-[9px] text-zinc-500 flex items-center gap-0.5">
                            <CheckCheck className="size-3 text-zinc-500" />
                            <span>Résolu</span>
                          </span>
                        ) : conv.status === "open" ? (
                          <span className="text-[9px] text-amber-400 font-semibold flex items-center gap-0.5">
                            <span className="size-1.5 rounded-full bg-amber-400" />
                            <span>En attente</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-blue-400 flex items-center gap-0.5">
                            <span className="size-1.5 rounded-full bg-blue-400" />
                            <span>Répondu</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Panel (lg:col-span-8 or 7) */}
        <div
          className={`lg:col-span-8 rounded-2xl border border-white/10 bg-[#121316] flex flex-col overflow-hidden h-full ${
            !isMobileChatOpen ? "hidden lg:flex" : "flex"
          }`}
        >
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-white/[0.08] flex items-center justify-between bg-[#16181f]/60">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileChatOpen(false)}
                    className="lg:hidden p-1.5 rounded-xl bg-white/5 text-zinc-400 hover:text-white"
                  >
                    <ArrowLeft className="size-4" />
                  </button>

                  <div className="relative">
                    <div className="size-10 rounded-xl bg-gradient-to-br from-emerald-950 via-zinc-800 to-black border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                      {selectedConversation.memberAvatar}
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-xs leading-none">
                      {selectedConversation.memberCountryFlag}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-white">
                        {selectedConversation.memberName}
                      </h2>
                      {selectedConversation.isVip && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Membre VIP
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>{selectedConversation.memberEmail}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{selectedConversation.productName}</span>
                    </div>
                  </div>
                </div>

                {/* Right Header Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleResolved}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      selectedConversation.status === "resolved"
                        ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    }`}
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span className="hidden sm:inline">
                      {selectedConversation.status === "resolved" ? "Réouvrir" : "Marquer résolu"}
                    </span>
                  </button>

                  {onNavigateToClients && (
                    <button
                      onClick={onNavigateToClients}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Voir la fiche client"
                    >
                      <ExternalLink className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0d0e11]/70">
                {/* Date separator */}
                <div className="flex items-center justify-center my-2">
                  <span className="text-[10px] font-mono text-zinc-500">
                    Aujourd'hui • Assistance Officielle
                  </span>
                </div>

                {selectedConversation.messages.map((msg) => {
                  const isCreator = msg.sender === "creator";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isCreator ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                        {!isCreator && (
                          <div className="size-6 rounded-lg bg-zinc-800 border border-white/10 text-[10px] font-bold text-zinc-300 flex items-center justify-center shrink-0 mb-1">
                            {selectedConversation.memberAvatar}
                          </div>
                        )}

                        <div>
                          <div
                            className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                              isCreator
                                ? "bg-[#00D26A] text-black font-medium rounded-br-xs"
                                : "bg-[#1a1c23] text-zinc-200 border border-white/10 rounded-bl-xs"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          </div>
                          <div
                            className={`flex items-center gap-1.5 mt-1 text-[10px] text-zinc-500 font-mono ${
                              isCreator ? "justify-end" : "justify-start"
                            }`}
                          >
                            <span>{msg.time}</span>
                            {isCreator && (
                              <CheckCheck className="size-3 text-emerald-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Reply Templates */}
              <div className="px-3 sm:px-4 py-2 bg-[#121316] border-t border-white/[0.05] overflow-x-auto no-scrollbar flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                  <Zap className="size-3 text-emerald-400" />
                  <span>Réponses :</span>
                </span>
                {QUICK_TEMPLATES.map((tpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickTemplate(tpl)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 whitespace-nowrap transition-colors cursor-pointer truncate max-w-[200px]"
                    title={tpl}
                  >
                    {tpl}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 sm:p-4 border-t border-white/[0.08] bg-[#16181f] flex items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={`Répondre à ${selectedConversation.memberName}...`}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#101115] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!replyInput.trim()}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${
                    replyInput.trim()
                      ? "mansa-btn-green cursor-pointer"
                      : "bg-white/10 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  <Send className="size-3.5" />
                  <span className="hidden sm:inline">Envoyer</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-500">
                <MessageSquare className="size-7" />
              </div>
              <h3 className="text-sm font-bold text-white">Sélectionnez une conversation</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Choisissez un membre dans la liste de gauche pour lire ses messages et lui apporter une assistance en direct.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Chat with a Member */}
      {isNewChatModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNewChatModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121316] p-5 shadow-2xl space-y-4 cursor-default animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-[#00D26A]" />
                <h3 className="text-sm font-bold text-white">Écrire à un membre</h3>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewConversation} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                  Nom du membre / client
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Babacar Ndiaye"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                  Email du membre (optionnel)
                </label>
                <input
                  type="email"
                  placeholder="Ex: babacar@gmail.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                  Message initial
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Bonjour Babacar, nous avons bien reçu votre demande concernant l'accès au groupe VIP..."
                  value={newMemberFirstMessage}
                  onChange={(e) => setNewMemberFirstMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="mansa-btn-green px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                >
                  <Send className="size-3.5" />
                  <span>Démarrer la discussion</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configuration du message automatique d'assistance */}
      {isAutoReplyModalOpen && (
        <div
          onClick={() => setIsAutoReplyModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121316] p-5 shadow-2xl space-y-4 cursor-default animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Bot className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {lang === "fr" ? "Message automatique d'assistance" : "Support Auto-Reply"}
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    {lang === "fr"
                      ? "Envoyé immédiatement dès qu'un membre écrit au support."
                      : "Sent instantly when a member contacts support."}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAutoReplyModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAutoReply} className="space-y-4">
              {/* Choix de l'entreprise si plusieurs entreprises */}
              {companies.length > 1 && (
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 block mb-1">
                    Entreprise concernée
                  </label>
                  <select
                    value={autoReplyCompanyId}
                    onChange={(e) => handleSelectAutoReplyCompany(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white focus:border-[#00D26A] focus:outline-none"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Activation / Désactivation */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Activer la réponse automatique
                  </span>
                  <span className="text-[11px] text-zinc-400 block">
                    Répond instantanément à toute nouvelle sollicitation membre
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoReplyEnabled}
                  onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoReplyEnabled ? "bg-[#00D26A]" : "bg-zinc-700"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out ${
                      autoReplyEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Modèles rapides */}
              <div>
                <label className="text-[11px] font-bold text-zinc-300 block mb-1.5">
                  Modèles de messages rapides
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setAutoReplyMessage(
                        "Bonjour {nom} ! Merci d'avoir contacté notre équipe. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-medium border border-white/5 transition-colors cursor-pointer"
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAutoReplyMessage(
                        "Bonjour {nom} ! Votre demande auprès de {entreprise} a bien été enregistrée. Un conseiller prend en charge votre message en priorité."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-medium border border-white/5 transition-colors cursor-pointer"
                  >
                    Support VIP
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAutoReplyMessage(
                        "Bonjour {nom} ! Notre équipe d'assistance a bien reçu votre message. Délai de réponse estimé : moins de 15 minutes."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[11px] font-medium border border-white/5 transition-colors cursor-pointer"
                  >
                    Délai express
                  </button>
                </div>
              </div>

              {/* Zone de texte personnalisable */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-zinc-300">
                    Contenu du message automatique
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAutoReplyMessage((prev) => `${prev} {nom}`)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 hover:text-white font-mono"
                      title="Insérer le nom du membre"
                    >
                      + {"{nom}"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAutoReplyMessage((prev) => `${prev} {entreprise}`)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 hover:text-white font-mono"
                      title="Insérer le nom de l'entreprise"
                    >
                      + {"{entreprise}"}
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  required={autoReplyEnabled}
                  value={autoReplyMessage}
                  onChange={(e) => setAutoReplyMessage(e.target.value)}
                  placeholder="Écrivez le message que vos membres recevront automatiquement..."
                  className="w-full px-3 py-2.5 rounded-xl bg-[#16181f] border border-white/10 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Aperçu en direct */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                  Aperçu reçu par le membre
                </span>
                <div className="rounded-lg bg-[#1a1d26] border border-white/5 p-2.5 text-xs text-zinc-200 leading-relaxed font-light">
                  {autoReplyMessage
                    ? autoReplyMessage
                        .replace(/\{nom\}/gi, "Ibrahim Diallo")
                        .replace(
                          /\{entreprise\}/gi,
                          companies.find((c) => c.id === autoReplyCompanyId)?.name ||
                            activeCompany?.name ||
                            "Cadre financier"
                        )
                    : "Aucun message configuré"}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAutoReplyModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="mansa-btn-green px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="size-3.5" />
                  <span>Enregistrer le message</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
