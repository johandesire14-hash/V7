import React, { useState, useEffect } from "react";
import {
  Send,
  CheckCircle2,
  Copy,
  Check,
  RefreshCw,
  X,
  Bot,
  Layers,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  PlusCircle,
  ExternalLink,
} from "lucide-react";
import { CreatedProductData } from "../ProductCreationStudio";
import {
  TelegramChannelItem,
  getStoredTelegramChannels,
  addStoredTelegramChannel,
} from "../../utils/telegramStorage";
import { useModalDismiss } from "../../hooks/useModalDismiss";

interface ProductTelegramLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: CreatedProductData | null;
  onSaveProductTelegram: (productId: string, channelName: string, channelId?: string) => void;
}

export const ProductTelegramLinkModal: React.FC<ProductTelegramLinkModalProps> = ({
  isOpen,
  onClose,
  product,
  onSaveProductTelegram,
}) => {
  const [channels, setChannels] = useState<TelegramChannelItem[]>([]);
  const [selectedChannelName, setSelectedChannelName] = useState<string>("");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [isConnectingNew, setIsConnectingNew] = useState(false);

  // Dynamic code generation state
  const [dynamicCode, setDynamicCode] = useState<string>("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isCopiedBot, setIsCopiedBot] = useState(false);
  const [isPollingVerification, setIsPollingVerification] = useState(false);
  const [newlyVerifiedChannel, setNewlyVerifiedChannel] = useState<TelegramChannelItem | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const BOT_USERNAME = "@MansaAccess_Bot";

  // Load channels when modal opens
  useEffect(() => {
    if (isOpen && product) {
      const stored = getStoredTelegramChannels();
      setChannels(stored);

      const currentChan =
        product.communityConfig?.telegramChannelName ||
        (product.includedApps.includes("Telegram") ? "VICTORY ODDS 🤑🔥" : "");

      setSelectedChannelName(currentChan);
      const found = stored.find((c) => c.name === currentChan);
      if (found) {
        setSelectedChannelId(found.id);
      }
      setIsConnectingNew(false);
      setNewlyVerifiedChannel(null);
      setSuccessToast(null);
    }
  }, [isOpen, product]);

  // Fetch dynamic code
  const fetchNewCode = async () => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch("/api/telegram/generate-code");
      const data = await res.json();
      if (data && data.code) {
        setDynamicCode(data.code);
      } else {
        const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
        let fallback = "";
        for (let i = 0; i < 6; i++) fallback += chars.charAt(Math.floor(Math.random() * chars.length));
        setDynamicCode(fallback);
      }
    } catch (e) {
      const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
      let fallback = "";
      for (let i = 0; i < 6; i++) fallback += chars.charAt(Math.floor(Math.random() * chars.length));
      setDynamicCode(fallback);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  useEffect(() => {
    if (isConnectingNew && !dynamicCode) {
      fetchNewCode();
    }
  }, [isConnectingNew, dynamicCode]);

  // Polling for live verification when connecting new channel
  useEffect(() => {
    if (!isConnectingNew || !dynamicCode || newlyVerifiedChannel) return;

    setIsPollingVerification(true);
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
          setNewlyVerifiedChannel(newChan);
          setSelectedChannelName(newChan.name);
          setSelectedChannelId(newChan.id);
          setIsConnectingNew(false);
          setSuccessToast(`🎉 Canal "${newChan.name}" vérifié et lié avec succès !`);
        }
      } catch (err) {}
    }, 1500);

    return () => {
      clearInterval(interval);
      setIsPollingVerification(false);
    };
  }, [isConnectingNew, dynamicCode, newlyVerifiedChannel]);

  const handleCopyCode = () => {
    if (!dynamicCode) return;
    navigator.clipboard?.writeText?.(dynamicCode);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  const handleCopyBotUsername = () => {
    navigator.clipboard?.writeText?.(BOT_USERNAME);
    setIsCopiedBot(true);
    setTimeout(() => setIsCopiedBot(false), 2000);
  };

  const handleSave = () => {
    if (!product) return;
    if (!selectedChannelName) {
      alert("Veuillez sélectionner un canal Telegram pour cette offre.");
      return;
    }
    onSaveProductTelegram(product.id, selectedChannelName, selectedChannelId);
    onClose();
  };

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen: isOpen && !!product,
    onClose,
    closeOnEscape: true,
  });

  if (!isOpen || !product) return null;

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 cursor-pointer"
    >
      <div
        {...contentProps}
        className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0c0d10] text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] cursor-default"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#12141a]">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-[#229ED9]/20 text-[#229ED9] flex items-center justify-center font-bold">
              <Send className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Canal Telegram lié au produit</h3>
              </div>
              <p className="text-xs text-zinc-400">
                Offre : <strong className="text-zinc-200">{product.name}</strong> ({product.priceDisplay})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Toast de succès */}
          {successToast && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Current Linked Status Card */}
          <div className="rounded-2xl border border-white/10 bg-[#14161f] p-4 space-y-3">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
              Canal actuellement configuré pour cette offre
            </span>

            {selectedChannelName ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#0a0b0e] border border-emerald-500/30">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-[#229ED9]/15 text-[#229ED9] flex items-center justify-center font-bold">
                    <Send className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{selectedChannelName}</span>
                      <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">
                        ✓ Actif
                      </span>
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      Les acheteurs reçoivent un lien d'invitation unique 1-clic après paiement
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                Aucun canal Telegram n'est encore lié à cette offre. Choisissez-en un ci-dessous.
              </div>
            )}
          </div>

          {/* SECTION : CHANGER DE CANAL (Sélecteur rapide 1-clic) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">
                Choisir un autre canal connecté pour ce produit :
              </span>
              <button
                type="button"
                onClick={() => setIsConnectingNew(!isConnectingNew)}
                className="text-[11px] text-[#229ED9] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="size-3.5" />
                <span>{isConnectingNew ? "Masquer l'assistant" : "+ Connecter un nouveau canal"}</span>
              </button>
            </div>

            {/* List of existing connected channels */}
            <div className="grid grid-cols-1 gap-2">
              {channels.map((chan) => {
                const isSelected = selectedChannelName === chan.name;
                return (
                  <button
                    key={`modal-chan-${chan.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedChannelName(chan.name);
                      setSelectedChannelId(chan.id);
                      setIsConnectingNew(false);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#229ED9] bg-[#229ED9]/10 text-white shadow-md"
                        : "border-white/10 bg-[#12141a] text-zinc-300 hover:border-white/20 hover:bg-[#161822]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`size-7 rounded-lg flex items-center justify-center ${isSelected ? "bg-[#229ED9] text-white" : "bg-white/5 text-zinc-400"}`}>
                        <Send className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-2">
                          <span>{chan.name}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            ({chan.memberCount} membres)
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500">
                          {chan.type === "channel" ? "Canal Telegram" : "Groupe"} · Bot Admin
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="text-[11px] font-bold text-[#229ED9] flex items-center gap-1">
                          <Check className="size-3.5" />
                          <span>Sélectionné</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 hover:text-zinc-300">
                          Lier à cette offre
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================================================================= */}
          {/* SCHÉMA SIMPLE 3 ÉTAPES POUR CONNECTER UN NOUVEAU CANAL            */}
          {/* ================================================================= */}
          {isConnectingNew && (
            <div className="rounded-2xl border border-[#229ED9]/40 bg-[#0d1720] p-5 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-[#229ED9] animate-pulse" />
                  <h4 className="text-xs font-bold text-white">
                    Schéma simple : Connecter un nouveau canal en 3 étapes
                  </h4>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">Rapide & Automatique</span>
              </div>

              {/* ÉTAPE 1 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="size-6 rounded-full bg-[#229ED9] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="font-bold text-white text-xs">
                    Ajoutez notre Bot comme Administrateur
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Dans votre canal Telegram, allez dans <em>Administrateurs &gt; Ajouter un admin</em> et recherchez :
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10">
                    <code className="font-mono font-bold text-[#229ED9] text-xs">{BOT_USERNAME}</code>
                    <button
                      type="button"
                      onClick={handleCopyBotUsername}
                      className="text-[11px] text-zinc-300 hover:text-white px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 font-semibold cursor-pointer flex items-center gap-1"
                    >
                      {isCopiedBot ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{isCopiedBot ? "Copié !" : "Copier"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ÉTAPE 2 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="size-6 rounded-full bg-[#0055ff] text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="font-bold text-white text-xs">
                    Envoyez votre code unique dans le canal
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Postez ce code directement dans le chat de votre canal Telegram :
                  </p>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-mono">Code :</span>
                      <code className="font-mono font-extrabold text-white text-sm tracking-widest">
                        {dynamicCode || "..."}
                      </code>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={fetchNewCode}
                        disabled={isGeneratingCode}
                        className="p-1 rounded bg-white/5 text-zinc-400 hover:text-white cursor-pointer"
                        title="Nouveau code"
                      >
                        <RefreshCw className={`size-3 ${isGeneratingCode ? "animate-spin" : ""}`} />
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="text-[11px] text-white bg-[#0055ff] hover:bg-[#0047d6] px-2.5 py-0.5 rounded font-semibold cursor-pointer flex items-center gap-1"
                      >
                        {isCopiedCode ? <Check className="size-3" /> : <Copy className="size-3" />}
                        <span>{isCopiedCode ? "Copié !" : "Copier le code"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ÉTAPE 3 */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="size-6 rounded-full bg-emerald-500 text-black font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-emerald-300 text-xs">
                    Le Bot vous répond & synchronise le canal
                  </div>
                  <p className="text-[11px] text-zinc-300">
                    Le bot confirme la réception instantanément dans le canal. Votre canal apparaîtra aussitôt sélectionné ci-dessus !
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 pt-1 font-mono">
                    <RefreshCw className="size-3 animate-spin text-[#229ED9]" />
                    <span>En attente de réception du code par @MansaAccess_Bot...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#12141a] flex items-center justify-between">
          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-400" />
            <span>Changement instantané sans interruption pour vos clients</span>
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
              className="px-5 py-2 rounded-xl bg-[#229ED9] hover:bg-[#1c8ec4] text-xs font-bold text-white transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="size-4" />
              <span>Enregistrer le canal lié</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
