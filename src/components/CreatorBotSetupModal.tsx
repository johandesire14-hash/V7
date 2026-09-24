import React, { useState, useEffect } from "react";
import {
  Bot,
  Send,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Copy,
  ChevronRight,
  Info,
  Layers,
  ArrowUpRight,
  Zap,
  HelpCircle,
  Key,
  Lock,
  RefreshCw,
  X,
  Check,
} from "lucide-react";
import {
  getStoredTelegramChannels,
  TelegramChannelItem,
  addStoredTelegramChannel,
} from "../utils/telegramStorage";
import { useModalDismiss } from "../hooks/useModalDismiss";

export interface CreatorCommunityConfig {
  discordEnabled: boolean;
  discordServerId: string;
  discordServerName: string;
  discordRoleName: string;
  telegramEnabled: boolean;
  telegramChannelId: string;
  telegramChannelName: string;
}

interface CreatorBotSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: Partial<CreatorCommunityConfig>;
  onSaveConfig: (config: CreatorCommunityConfig) => void;
  productName?: string;
  initialTab?: "discord" | "telegram";
  platformMode?: "discord" | "telegram" | "both";
}

export const CreatorBotSetupModal: React.FC<CreatorBotSetupModalProps> = ({
  isOpen,
  onClose,
  initialConfig,
  onSaveConfig,
  productName = "Abonnement VIP",
  initialTab = "telegram",
  platformMode,
}) => {
  const effectiveMode = platformMode || (initialTab ? initialTab : "both");
  const [activeTab, setActiveTab] = useState<"discord" | "telegram">(
    effectiveMode === "discord" ? "discord" : "telegram"
  );
  const [copiedDiscordLink, setCopiedDiscordLink] = useState(false);
  const [copiedTelegramName, setCopiedTelegramName] = useState(false);
  const [copiedDynamicCode, setCopiedDynamicCode] = useState(false);

  // Sync tab when opening with a specific platform or initialTab
  useEffect(() => {
    if (isOpen) {
      if (platformMode === "discord" || initialTab === "discord") {
        setActiveTab("discord");
      } else if (platformMode === "telegram" || initialTab === "telegram") {
        setActiveTab("telegram");
      }
    }
  }, [isOpen, platformMode, initialTab]);

  // Creator settings
  const [discordEnabled, setDiscordEnabled] = useState(initialConfig?.discordEnabled ?? true);
  const [discordServerId, setDiscordServerId] = useState(initialConfig?.discordServerId || "");
  const [discordServerName, setDiscordServerName] = useState(initialConfig?.discordServerName || "");
  const [discordRoleName, setDiscordRoleName] = useState(initialConfig?.discordRoleName || "Membre VIP");

  const [telegramEnabled, setTelegramEnabled] = useState(initialConfig?.telegramEnabled ?? true);
  const [telegramChannelId, setTelegramChannelId] = useState(initialConfig?.telegramChannelId || "");
  const [telegramChannelName, setTelegramChannelName] = useState(initialConfig?.telegramChannelName || "VICTORY ODDS 🤑🔥");

  // Dynamic code for telegram
  const [dynamicCode, setDynamicCode] = useState<string>("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [channels, setChannels] = useState<TelegramChannelItem[]>([]);
  const [verifiedToast, setVerifiedToast] = useState<string | null>(null);

  // Bot constants
  const BOT_CLIENT_ID = "1541825533090861056";
  const DISCORD_BOT_INVITE_URL = `https://discord.com/oauth2/authorize?client_id=${BOT_CLIENT_ID}&scope=bot&permissions=268435456`;
  const TELEGRAM_BOT_USERNAME = "@MansaAccess_Bot";

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredTelegramChannels();
      setChannels(stored);
      fetchDynamicCode();
    }
  }, [isOpen]);

  const fetchDynamicCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch("/api/telegram/generate-code");
      const data = await res.json();
      if (data && data.code) {
        setDynamicCode(data.code);
      } else {
        const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
        let fb = "";
        for (let i = 0; i < 6; i++) fb += chars.charAt(Math.floor(Math.random() * chars.length));
        setDynamicCode(fb);
      }
    } catch (e) {
      const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let fb = "";
      for (let i = 0; i < 6; i++) fb += chars.charAt(Math.floor(Math.random() * chars.length));
      setDynamicCode(fb);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Polling for live verification
  useEffect(() => {
    if (!isOpen || activeTab !== "telegram" || !dynamicCode) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/telegram/check-verification?code=${dynamicCode}`);
        const data = await res.json();
        if (data && data.status === "verified" && data.channelInfo) {
          const info = data.channelInfo;
          const newChan: TelegramChannelItem = {
            id: "tg-" + (info.chatId || Date.now()),
            name: info.title || "Canal Telegram VIP",
            type: info.type === "channel" ? "channel" : "group",
            memberCount: info.memberCount || 1,
            isIncluded: true,
            linkedDate: "À l'instant",
            botStatus: "admin",
          };

          const updated = addStoredTelegramChannel(newChan);
          setChannels(updated);
          setTelegramChannelName(newChan.name);
          setTelegramChannelId(newChan.id);
          setVerifiedToast(`🎉 Canal "${newChan.name}" lié avec succès !`);
        }
      } catch (err) {}
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, activeTab, dynamicCode]);

  const handleCopyDiscordInvite = () => {
    navigator.clipboard.writeText(DISCORD_BOT_INVITE_URL);
    setCopiedDiscordLink(true);
    setTimeout(() => setCopiedDiscordLink(false), 2000);
  };

  const handleCopyTelegramBotName = () => {
    navigator.clipboard.writeText(TELEGRAM_BOT_USERNAME);
    setCopiedTelegramName(true);
    setTimeout(() => setCopiedTelegramName(false), 2000);
  };

  const handleCopyCode = () => {
    if (!dynamicCode) return;
    navigator.clipboard.writeText(dynamicCode);
    setCopiedDynamicCode(true);
    setTimeout(() => setCopiedDynamicCode(false), 2000);
  };

  const handleSave = () => {
    onSaveConfig({
      discordEnabled,
      discordServerId,
      discordServerName: discordServerName || "Serveur Discord",
      discordRoleName: discordRoleName || "Membre VIP",
      telegramEnabled,
      telegramChannelId,
      telegramChannelName: telegramChannelName || "Canal VIP Telegram",
    });
    onClose();
  };

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEscape: true,
  });

  if (!isOpen) return null;

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        {...contentProps}
        className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0c0d10] text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141a]">
          <div className="flex items-center gap-3">
            {effectiveMode === "telegram" ? (
              <div className="size-10 rounded-2xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center">
                <Send className="size-5" />
              </div>
            ) : effectiveMode === "discord" ? (
              <div className="size-10 rounded-2xl bg-[#5865F2]/20 text-[#5865F2] flex items-center justify-center">
                <Bot className="size-5" />
              </div>
            ) : (
              <div className="size-10 rounded-2xl bg-[#0055ff]/15 text-[#0055ff] flex items-center justify-center">
                <Zap className="size-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {effectiveMode === "telegram"
                    ? "Connexion Automatique Telegram"
                    : effectiveMode === "discord"
                    ? "Connexion Automatique Discord"
                    : "Connexion Automatique Telegram & Discord"}
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                {effectiveMode === "telegram"
                  ? "Vos acheteurs reçoivent automatiquement leur invitation unique après paiement Mobile Money / CB."
                  : effectiveMode === "discord"
                  ? "Vos acheteurs reçoivent automatiquement leurs rôles VIP sur votre serveur Discord après paiement."
                  : "Vos acheteurs reçoivent automatiquement leurs invitations uniques après paiement Mobile Money / CB."}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Platform Switcher Tabs (Only shown if mode is "both") */}
        {effectiveMode === "both" && (
          <div className="flex border-b border-white/10 bg-[#101217] px-6">
            <button
              type="button"
              onClick={() => setActiveTab("telegram")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "telegram"
                  ? "border-[#229ED9] text-white bg-white/[0.03]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Send className="size-4 text-[#229ED9]" />
              <span>Telegram (Canal & Groupe)</span>
              {telegramEnabled && <span className="size-1.5 rounded-full bg-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("discord")}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "discord"
                  ? "border-[#5865F2] text-white bg-white/[0.03]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Bot className="size-4 text-[#5865F2]" />
              <span>Discord (Serveur & Rôles)</span>
              {discordEnabled && <span className="size-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {verifiedToast && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{verifiedToast}</span>
            </div>
          )}

          {/* TAB 1: TELEGRAM SETUP (Primary focus) */}
          {activeTab === "telegram" && (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="font-bold text-white text-xs block">Activer la synchronisation Telegram</span>
                  <span className="text-[11px] text-zinc-400">
                    Génère un lien d'invitation privé unique par paiement pour "{productName}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    telegramEnabled ? "bg-[#229ED9]" : "bg-[#252830]"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                      telegramEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {telegramEnabled && (
                <div className="space-y-4">
                  
                  {/* SCHÉMA SIMPLE 3 ÉTAPES */}
                  <div className="rounded-2xl border border-[#229ED9]/30 bg-[#0d1720] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="font-bold text-white text-xs flex items-center gap-2">
                        <Send className="size-3.5 text-[#229ED9]" />
                        <span>Schéma simple en 3 étapes pour lier votre canal :</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">100% Automatique</span>
                    </div>

                    {/* Étape 1 */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="size-5 rounded-full bg-[#229ED9] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        1
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-white text-[11px]">
                          Ajoutez <code className="text-[#229ED9] font-bold">@MansaAccess_Bot</code> comme Administrateur
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          Sur votre canal ou groupe Telegram, ajoutez notre bot avec la permission d'inviter via des liens.
                        </p>
                        <button
                          type="button"
                          onClick={handleCopyTelegramBotName}
                          className="text-[10px] text-[#229ED9] hover:underline font-semibold cursor-pointer flex items-center gap-1"
                        >
                          {copiedTelegramName ? <Check className="size-3" /> : <Copy className="size-3" />}
                          <span>{copiedTelegramName ? "Nom du bot copié !" : "Copier @MansaAccess_Bot"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Étape 2 */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/[0.03]">
                      <span className="size-5 rounded-full bg-[#0055ff] text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        2
                      </span>
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-white text-[11px]">
                          Envoyez votre code unique dans le chat du canal
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/10 max-w-xs">
                          <code className="font-mono font-extrabold text-white text-xs tracking-widest px-1">
                            {dynamicCode || "..."}
                          </code>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={fetchDynamicCode}
                              disabled={isGeneratingCode}
                              className="p-1 text-zinc-400 hover:text-white"
                              title="Nouveau code"
                            >
                              <RefreshCw className={`size-3 ${isGeneratingCode ? "animate-spin" : ""}`} />
                            </button>
                            <button
                              type="button"
                              onClick={handleCopyCode}
                              className="text-[10px] text-white bg-[#0055ff] px-2 py-0.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                            >
                              {copiedDynamicCode ? <Check className="size-3" /> : <Copy className="size-3" />}
                              <span>{copiedDynamicCode ? "Copié !" : "Copier"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Étape 3 */}
                    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="size-5 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        3
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-emerald-300 text-[11px]">
                          Le bot vous répond et valide la connexion en direct !
                        </div>
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          Votre canal apparaîtra automatiquement sélectionné ci-dessous.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* SÉLECTION DU CANAL LIÉ À CETTE OFFRE */}
                  <div className="space-y-2">
                    <label className="block text-[11px] font-bold text-white">
                      Canal Telegram sélectionné pour cette offre :
                    </label>

                    <div className="grid grid-cols-1 gap-1.5">
                      {channels.map((chan) => {
                        const isSelected = telegramChannelName === chan.name;
                        return (
                          <button
                            key={`creator-bot-tg-${chan.id}`}
                            type="button"
                            onClick={() => {
                              setTelegramChannelName(chan.name);
                              setTelegramChannelId(chan.id);
                            }}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#229ED9] bg-[#229ED9]/15 text-white"
                                : "border-white/10 bg-[#12141a] text-zinc-400 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Send className="size-3.5 text-[#229ED9]" />
                              <span className="font-bold text-xs text-white">{chan.name}</span>
                              <span className="text-[10px] text-zinc-500">({chan.memberCount} membres)</span>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-[#229ED9] flex items-center gap-1">
                                <Check className="size-3" />
                                <span>Lié à l'offre</span>
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 2: DISCORD SETUP */}
          {activeTab === "discord" && (
            <div className="space-y-5">
              
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div>
                  <span className="font-bold text-white text-xs block">Activer la synchronisation Discord</span>
                  <span className="text-[11px] text-zinc-400">
                    Attribue automatiquement le rôle VIP aux acheteurs de "{productName}"
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDiscordEnabled(!discordEnabled)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    discordEnabled ? "bg-[#5865F2]" : "bg-[#252830]"
                  }`}
                >
                  <span
                    className={`inline-block size-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                      discordEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {discordEnabled && (
                <div className="space-y-4 pt-1">
                  
                  {/* Step 1: Invite Bot */}
                  <div className="p-4 rounded-xl bg-[#171922] border border-[#5865F2]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="size-5 rounded-full bg-[#5865F2] text-white font-bold flex items-center justify-center text-[10px]">
                          1
                        </span>
                        <span className="font-bold text-white">Invitez le Bot Mansa sur votre serveur Discord</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">1 clic</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={DISCORD_BOT_INVITE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Bot className="size-4" />
                        <span>Inviter le Bot Mansa sur mon serveur Discord</span>
                        <ExternalLink className="size-3" />
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyDiscordInvite}
                        className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold cursor-pointer"
                      >
                        {copiedDiscordLink ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Role config */}
                  <div className="p-4 rounded-xl bg-[#16181f] border border-white/10 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="size-5 rounded-full bg-zinc-700 text-white font-bold flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span className="font-bold text-white">Rôle Discord à attribuer</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          Nom du rôle VIP sur votre Discord
                        </label>
                        <input
                          type="text"
                          value={discordRoleName}
                          onChange={(e) => setDiscordRoleName(e.target.value)}
                          placeholder="ex. Membre VIP, Trader Pro"
                          className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-2 text-xs text-white placeholder-zinc-500 outline-none focus:border-[#5865F2]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                          ID Serveur (Optionnel)
                        </label>
                        <input
                          type="text"
                          value={discordServerId}
                          onChange={(e) => setDiscordServerId(e.target.value)}
                          placeholder="ex. 1541827769003151382"
                          className="w-full rounded-xl border border-white/10 bg-[#101114] px-3 py-2 text-xs text-white font-mono placeholder-zinc-500 outline-none focus:border-[#5865F2]"
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/10 bg-[#12141a] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Sécurisé avec validation KPAY Mobile Money automatique</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5 ${
                effectiveMode === "telegram"
                  ? "bg-[#229ED9] hover:bg-[#1c8ec4]"
                  : effectiveMode === "discord"
                  ? "bg-[#5865F2] hover:bg-[#4752c4]"
                  : "bg-[#0055ff] hover:bg-[#0047d6]"
              }`}
            >
              <Check className="size-4" />
              <span>
                {effectiveMode === "telegram"
                  ? "Enregistrer la liaison Telegram"
                  : effectiveMode === "discord"
                  ? "Enregistrer la liaison Discord"
                  : "Enregistrer la liaison"}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

