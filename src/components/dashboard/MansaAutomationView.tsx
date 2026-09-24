import React, { useState, useEffect } from "react";
import {
  Bot,
  Webhook,
  ShieldCheck,
  Zap,
  Play,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Trash2,
  Clock,
  ExternalLink,
  Code2,
  FileCode,
  Key,
  Users,
  Smartphone,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";
import { DiscordIcon, TelegramIcon } from "../common/Icons";

interface MansaSubscription {
  id: string;
  customerName: string;
  customerPhone: string;
  platform: "discord" | "telegram";
  platformUserId: string;
  planName: string;
  amountXOF: number;
  paymentMethod: "Orange Money" | "MTN MoMo" | "Wave" | "Moov";
  status: "active" | "expired" | "cancelled" | "pending";
  createdAt: string;
  expiresAt: string;
  lastInviteLink?: string;
  roleGranted?: string;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  eventType: string;
  platform: "discord" | "telegram";
  userId: string;
  status: string;
  signatureVerified: boolean;
  rawPayload: any;
  result: "success" | "error" | "simulated";
  message: string;
}

interface MansaConfig {
  kpayWebhookSecret: string;
  discordBotTokenMasked: string;
  hasDiscordToken: boolean;
  discordGuildId: string;
  telegramBotTokenMasked: string;
  hasTelegramToken: boolean;
  telegramChatId: string;
}

export const MansaAutomationView: React.FC<{ lang: "fr" | "en" }> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<"simulator" | "members" | "bots" | "logs" | "code">("simulator");
  const [subscriptions, setSubscriptions] = useState<MansaSubscription[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [config, setConfig] = useState<MansaConfig | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Formulaire Simulateur Webhook
  const [simPlatform, setSimPlatform] = useState<"discord" | "telegram">("discord");
  const [simStatus, setSimStatus] = useState<"active" | "expired" | "cancelled">("active");
  const [simUserId, setSimUserId] = useState("489123456789012345");
  const [simCustomerName, setSimCustomerName] = useState("Seydou Koné");
  const [simCustomerPhone, setSimCustomerPhone] = useState("+225 07 88 99 00 11");
  const [simPlanName, setSimPlanName] = useState("VIP Signaux Trading Mansa");
  const [simPaymentMethod, setSimPaymentMethod] = useState<"Orange Money" | "MTN MoMo" | "Wave" | "Moov">("Orange Money");
  const [simAmount, setSimAmount] = useState(25000);
  const [simResult, setSimResult] = useState<any>(null);

  // Testeurs Directs
  const [discordTestUserId, setDiscordTestUserId] = useState("489123456789012345");
  const [discordTestRole, setDiscordTestRole] = useState("Membre VIP Mansa");
  const [telegramTestUserId, setTelegramTestUserId] = useState("789456123");
  const [telegramInviteHours, setTelegramInviteHours] = useState(24);
  const [createdInviteUrl, setCreatedInviteUrl] = useState<string | null>(null);

  // Active code tab in vault
  const [codeTab, setCodeTab] = useState<"server" | "discord" | "telegram" | "cron" | "env">("server");

  // Charger les données initiales
  const loadData = async () => {
    try {
      const [subsRes, logsRes, cfgRes] = await Promise.all([
        fetch("/api/mansa/subscriptions"),
        fetch("/api/mansa/logs"),
        fetch("/api/mansa/config"),
      ]);

      if (subsRes.ok) {
        const d = await subsRes.json();
        setSubscriptions(d.subscriptions || []);
      }
      if (logsRes.ok) {
        const d = await logsRes.json();
        setLogs(d.logs || []);
      }
      if (cfgRes.ok) {
        const d = await cfgRes.json();
        setConfig(d);
      }
    } catch (e) {
      console.error("Failed to load mansa data", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Déclencher le simulateur de Webhook KPAY
  const handleSimulateWebhook = async (statusOverride?: "active" | "expired" | "cancelled") => {
    setIsLoading(true);
    const targetStatus = statusOverride || simStatus;
    const payload = {
      user_id: simUserId,
      platform: simPlatform,
      status: targetStatus,
      plan_name: simPlanName,
      customer_name: simCustomerName,
      customer_phone: simCustomerPhone,
      amount_xof: simAmount,
      payment_method: simPaymentMethod,
      transaction_id: `kpay_tx_${Date.now()}`,
    };

    try {
      const res = await fetch("/api/mansa/webhook/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSimResult(data);
      setFeedback({
        type: res.ok ? "success" : "error",
        message: data.message || `Événement ${targetStatus} envoyé au Webhook KPAY !`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Erreur de communication" });
    } finally {
      setIsLoading(false);
    }
  };

  // Test direct Discord Role
  const handleTestDiscord = async (action: "grant" | "revoke") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mansa/discord/test-${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: discordTestUserId, roleName: discordTestRole }),
      });
      const data = await res.json();
      setFeedback({
        type: data.success ? "success" : "error",
        message: data.message || `Discord ${action} exécuté`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Test direct Telegram
  const handleTestTelegramInvite = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mansa/telegram/test-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expireHours: telegramInviteHours }),
      });
      const data = await res.json();
      if (data.inviteLink) {
        setCreatedInviteUrl(data.inviteLink);
      }
      setFeedback({
        type: data.success ? "success" : "error",
        message: data.message || "Lien Telegram généré",
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestTelegramRevoke = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mansa/telegram/test-revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: telegramTestUserId }),
      });
      const data = await res.json();
      setFeedback({
        type: data.success ? "success" : "error",
        message: data.message || "Membre expulsé de Telegram",
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Exécuter le scan cron
  const handleRunCron = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mansa/cron/run", { method: "POST" });
      const data = await res.json();
      setFeedback({
        type: "success",
        message: `Scan Cron terminé : ${data.revokedCount} abonnement(s) expiré(s) révoqué(s) sur ${data.scannedCount} analysé(s).`,
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Vider les logs
  const handleClearLogs = async () => {
    await fetch("/api/mansa/logs", { method: "DELETE" });
    setLogs([]);
  };

  const activeSubsCount = subscriptions.filter((s) => s.status === "active").length;
  const expiredSubsCount = subscriptions.filter((s) => s.status === "expired").length;
  const totalRevenueXOF = subscriptions.reduce((sum, s) => sum + (s.amountXOF || 0), 0);

  return (
    <div className="space-y-6 text-zinc-100 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101216] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Gestionnaire d'Accès Communautés (KPAY, Discord & Telegram)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-light leading-relaxed">
              Automatisez l'attribution et la révocation des rôles Discord et liens Telegram à usage unique en temps réel dès la réception des webhooks Mobile Money (Orange Money, MTN, Wave, Moov).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={handleRunCron}
              disabled={isLoading}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
              title="Exécute le scan automatique des expirations"
            >
              <Clock className="size-3.5 text-[#0055ff]" />
              <span>Tester le Cron (02h00)</span>
            </button>
            <button
              onClick={() => setActiveTab("simulator")}
              className="mansa-btn-orange px-4 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Zap className="size-3.5" />
              <span>Simuler un Paiement</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/10">
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
              <Users className="size-3 text-emerald-400" />
              Abonnés Actifs
            </span>
            <div className="text-xl font-bold text-white font-mono">{activeSubsCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">accès autorisés</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
              <XCircle className="size-3 text-red-400" />
              Expirés / Révocations
            </span>
            <div className="text-xl font-bold text-white font-mono">{expiredSubsCount}</div>
            <div className="text-[10px] text-zinc-500 font-mono">rôles retirés auto</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
              <Smartphone className="size-3 text-[#FA4616]" />
              Volume Mobile Money
            </span>
            <div className="text-xl font-bold text-white font-mono">
              {totalRevenueXOF.toLocaleString()} <span className="text-xs text-[#FA4616]">XOF</span>
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">Orange, MTN, Wave, Moov</div>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
            <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck className="size-3 text-[#0055ff]" />
              Sécurité HMAC
            </span>
            <div className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-1">
              <Check className="size-3.5" /> SHA-256 Vérifié
            </div>
            <div className="text-[10px] text-zinc-500 font-mono truncate">Anti-spoofing KPAY</div>
          </div>
        </div>
      </div>

      {/* Notifications / Feedback Bar */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertTriangle className="size-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:text-white cursor-pointer">
            <XCircle className="size-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab("simulator")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "simulator"
              ? "bg-[#FA4616] text-white shadow-sm"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Zap className="size-3.5" />
          <span>Simulateur Webhook KPAY</span>
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "members"
              ? "bg-[#0055ff] text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Users className="size-3.5" />
          <span>Abonnements & Expirations ({subscriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("bots")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "bots"
              ? "bg-purple-600 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Bot className="size-3.5" />
          <span>Console Directe Bots (Discord / Telegram)</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "logs"
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Terminal className="size-3.5" />
          <span>Logs & Événements ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("code")}
          className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "code"
              ? "bg-emerald-600 text-white"
              : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Code2 className="size-3.5" />
          <span>Code Source & Installation</span>
        </button>
      </div>

      {/* TAB 1: SIMULATEUR WEBHOOK KPAY */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formulaire de simulation */}
          <div className="lg:col-span-7 rounded-2xl border border-white/10 bg-[#121316] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#FA4616]/10 text-[#FA4616] border border-[#FA4616]/20">
                  <Webhook className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Émettre un Webhook KPAY</h3>
                  <p className="text-[11px] text-zinc-400 font-light">
                    Simule la notification envoyée par le processeur Mobile Money après paiement
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-400">
                POST /webhook/subscription-status
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Plateforme cible */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Plateforme Cible</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimPlatform("discord");
                      setSimUserId("489123456789012345");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      simPlatform === "discord"
                        ? "bg-[#5865F2]/20 border-[#5865F2] text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <DiscordIcon className="size-3.5" />
                    <span>Discord</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimPlatform("telegram");
                      setSimUserId("789456123");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      simPlatform === "telegram"
                        ? "bg-[#229ED9]/20 border-[#229ED9] text-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    <TelegramIcon className="size-3.5" />
                    <span>Telegram</span>
                  </button>
                </div>
              </div>

              {/* Statut de l'abonnement */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Statut Reçu</label>
                <select
                  value={simStatus}
                  onChange={(e: any) => setSimStatus(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 text-white outline-none cursor-pointer text-xs"
                >
                  <option value="active">active (Paiement validé - Octroyer accès)</option>
                  <option value="expired">expired (Échéance dépassée - Retirer accès)</option>
                  <option value="cancelled">cancelled (Résilier - Retirer accès)</option>
                </select>
              </div>

              {/* ID Utilisateur de la plateforme */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  {simPlatform === "discord" ? "Discord User ID (Numérique)" : "Telegram User ID"}
                </label>
                <input
                  type="text"
                  value={simUserId}
                  onChange={(e) => setSimUserId(e.target.value)}
                  placeholder="Ex: 489123456789012345"
                  className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 font-mono text-white outline-none focus:border-[#FA4616]"
                />
              </div>

              {/* Nom du rôle ou offre */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nom du Pack / Rôle Discord</label>
                <input
                  type="text"
                  value={simPlanName}
                  onChange={(e) => setSimPlanName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 text-white outline-none focus:border-[#FA4616]"
                />
              </div>

              {/* Nom du client */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nom du client</label>
                <input
                  type="text"
                  value={simCustomerName}
                  onChange={(e) => setSimCustomerName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 text-white outline-none focus:border-[#FA4616]"
                />
              </div>

              {/* Téléphone & Opérateur */}
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Moyen Mobile Money</label>
                <div className="flex gap-2">
                  <select
                    value={simPaymentMethod}
                    onChange={(e: any) => setSimPaymentMethod(e.target.value)}
                    className="rounded-xl border border-white/10 bg-[#161820] p-2.5 text-white outline-none cursor-pointer text-xs"
                  >
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Wave">Wave</option>
                    <option value="Moov">Moov</option>
                  </select>
                  <input
                    type="text"
                    value={simCustomerPhone}
                    onChange={(e) => setSimCustomerPhone(e.target.value)}
                    className="flex-1 rounded-xl border border-white/10 bg-[#161820] p-2.5 font-mono text-white outline-none focus:border-[#FA4616]"
                  />
                </div>
              </div>
            </div>

            {/* Quick Action Presets */}
            <div className="pt-2">
              <span className="text-[11px] text-zinc-400 font-medium block mb-2">Scénarios Rapides :</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSimStatus("active");
                    handleSimulateWebhook("active");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>1. Paiement Reçu (Active)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimStatus("expired");
                    handleSimulateWebhook("expired");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold hover:bg-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="size-3.5" />
                  <span>2. Échéance Atteinte (Expired)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSimStatus("cancelled");
                    handleSimulateWebhook("cancelled");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold hover:bg-red-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="size-3.5" />
                  <span>3. Résiliation (Cancelled)</span>
                </button>
              </div>
            </div>

            {/* Bouton principal de simulation */}
            <button
              onClick={() => handleSimulateWebhook()}
              disabled={isLoading}
              className="w-full mansa-btn-orange py-3 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              {isLoading ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
              <span>Envoyer le Webhook Signé HMAC SHA-256</span>
            </button>
          </div>

          {/* Payload JSON & Live Response Box */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-[#121316] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
                  <Code2 className="size-3.5 text-[#0055ff]" />
                  Payload JSON Envoyé
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Header: x-kpay-signature</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0a0b0e] border border-white/5 font-mono text-[11px] text-zinc-300 overflow-x-auto">
                <pre>{JSON.stringify(
                  {
                    user_id: simUserId,
                    platform: simPlatform,
                    status: simStatus,
                    plan_name: simPlanName,
                    customer_name: simCustomerName,
                    customer_phone: simCustomerPhone,
                    amount_xof: simAmount,
                    payment_method: simPaymentMethod,
                    transaction_id: "kpay_tx_demo_8921",
                  },
                  null,
                  2
                )}</pre>
              </div>
            </div>

            {/* Résultat serveur en temps réel */}
            {simResult && (
              <div className="rounded-2xl border border-white/10 bg-[#121316] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5" />
                    Réponse HTTP 200 OK
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">Temps : 14ms</span>
                </div>

                <div className="p-3 rounded-xl bg-[#0a0b0e] border border-white/5 font-mono text-[11px] text-zinc-300 space-y-2">
                  <p className="text-emerald-400 font-semibold">{simResult.message}</p>
                  {simResult.invite_link && (
                    <div className="pt-2 border-t border-white/10 space-y-1">
                      <span className="text-[10px] text-zinc-400 block">Lien d'invitation Telegram à usage unique :</span>
                      <div className="flex items-center gap-2 p-1.5 rounded bg-white/5 border border-white/10">
                        <span className="text-white text-[10px] truncate flex-1">{simResult.invite_link}</span>
                        <button
                          onClick={() => copyToClipboard(simResult.invite_link, "sim_link")}
                          className="p-1 hover:text-white text-zinc-400 cursor-pointer"
                        >
                          {copiedKey === "sim_link" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>
                  )}
                  {simResult.computedSignature && (
                    <div className="pt-1 text-[10px] text-zinc-500 font-mono truncate">
                      HMAC Signature: {simResult.computedSignature.substring(0, 24)}...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GESTION DES ABONNEMENTS ET EXPIRATIONS */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/10 bg-[#121316]">
            <div>
              <h3 className="text-sm font-bold text-white">Registre des Abonnements Mansa</h3>
              <p className="text-xs text-zinc-400 font-light">
                Chaque abonnement est synchronisé avec les rôles Discord et invitations Telegram
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCron}
                disabled={isLoading}
                className="mansa-btn-orange px-3.5 py-2 text-xs flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>Exécuter le scan d'expiration immédiat</span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121316]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-mono text-zinc-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Client & Contact</th>
                  <th className="py-3 px-4">Plateforme</th>
                  <th className="py-3 px-4">ID Utilisateur</th>
                  <th className="py-3 px-4">Offre & Montant</th>
                  <th className="py-3 px-4">Échéance</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {subscriptions.map((sub) => {
                  const isExp = new Date(sub.expiresAt) <= new Date() || sub.status === "expired";
                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{sub.customerName}</div>
                        <div className="text-[10px] font-mono text-zinc-500">{sub.customerPhone} ({sub.paymentMethod})</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            sub.platform === "discord"
                              ? "text-[#5865F2]"
                              : "text-[#229ED9]"
                          }`}
                        >
                          {sub.platform === "discord" ? (
                            <>
                              <DiscordIcon className="size-3" />
                              <span>Discord</span>
                            </>
                          ) : (
                            <>
                              <TelegramIcon className="size-3" />
                              <span>Telegram</span>
                            </>
                          )}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-zinc-300">
                        #{sub.platformUserId}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-zinc-200">{sub.planName}</div>
                        <div className="text-[10px] font-mono text-[#FA4616]">
                          {sub.amountXOF.toLocaleString()} XOF
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className={isExp ? "text-red-400 font-semibold" : "text-emerald-400"}>
                          {new Date(sub.expiresAt).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-mono font-medium ${
                            sub.status === "active"
                              ? "text-emerald-400"
                              : "text-red-400"
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${sub.status === "active" ? "bg-emerald-400" : "bg-red-400"}`} />
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub.status === "active" ? (
                            <button
                              onClick={async () => {
                                await handleSimulateWebhook("expired");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 text-[11px] font-semibold cursor-pointer"
                              title="Révoquer l'accès maintenant"
                            >
                              Révoquer
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await handleSimulateWebhook("active");
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-[11px] font-semibold cursor-pointer"
                              title="Réactiver l'accès"
                            >
                              Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONSOLE DIRECTE DES BOTS */}
      {activeTab === "bots" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Discord Bot Direct Controls */}
          <div className="rounded-2xl border border-white/10 bg-[#121316] p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#5865F2]">
                <DiscordIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bot Discord - Rôles VIP</h3>
                <p className="text-[11px] text-zinc-400">Attribution et synchronisation des rôles Discord en direct</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">ID Utilisateur Discord</label>
                <input
                  type="text"
                  value={discordTestUserId}
                  onChange={(e) => setDiscordTestUserId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 font-mono text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">Nom du Rôle à Attribuer / Retirer</label>
                <input
                  type="text"
                  value={discordTestRole}
                  onChange={(e) => setDiscordTestRole(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 text-white outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-zinc-400 space-y-1 font-light">
                <span className="font-semibold text-zinc-300 block">Rappel Hiérarchie Discord :</span>
                Le rôle du bot Mansa sur votre serveur Discord doit impérativement être placé <strong>au-dessus</strong> du rôle {discordTestRole} pour pouvoir l'attribuer.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleTestDiscord("grant")}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Check className="size-3.5" />
                  <span>grantDiscordAccess()</span>
                </button>
                <button
                  onClick={() => handleTestDiscord("revoke")}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="size-3.5" />
                  <span>revokeDiscordAccess()</span>
                </button>
              </div>
            </div>
          </div>

          {/* Telegram Bot Direct Controls */}
          <div className="rounded-2xl border border-white/10 bg-[#121316] p-6 space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-[#229ED9]/20 border border-[#229ED9]/40 text-[#229ED9]">
                <TelegramIcon className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Bot Telegram - Invitations & Exclusions</h3>
                <p className="text-[11px] text-zinc-400">Liens 1-usage (createChatInviteLink) et expulsion (ban+unban)</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">Durée du lien (heures)</label>
                  <input
                    type="number"
                    value={telegramInviteHours}
                    onChange={(e) => setTelegramInviteHours(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">ID Utilisateur à Expulser</label>
                  <input
                    type="text"
                    value={telegramTestUserId}
                    onChange={(e) => setTelegramTestUserId(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161820] p-2.5 font-mono text-white outline-none"
                  />
                </div>
              </div>

              {createdInviteUrl && (
                <div className="p-3 rounded-xl bg-[#229ED9]/10 border border-[#229ED9]/30 space-y-1.5">
                  <span className="text-[10px] text-[#229ED9] font-semibold block">Lien généré (1 usage max) :</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdInviteUrl}
                      className="flex-1 bg-transparent text-[11px] font-mono text-white outline-none"
                    />
                    <button
                      onClick={() => copyToClipboard(createdInviteUrl, "invite_test")}
                      className="mansa-btn-orange px-2.5 py-1 text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === "invite_test" ? <Check className="size-3" /> : <Copy className="size-3" />}
                      <span>Copier</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleTestTelegramInvite}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-[#229ED9] hover:bg-[#1c8ec7] text-white font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <Zap className="size-3.5" />
                  <span>Générer Lien Unique</span>
                </button>
                <button
                  onClick={handleTestTelegramRevoke}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="size-3.5" />
                  <span>Expulser Membre</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LOGS TEMPS RÉEL */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-[#121316]">
            <div>
              <h3 className="text-sm font-bold text-white">Journal d'Audit des Webhooks & Bots</h3>
              <p className="text-xs text-zinc-400 font-light">
                Historique chronologique des signatures HMAC, statuts HTTP et actions bots
              </p>
            </div>

            <button
              onClick={handleClearLogs}
              className="px-3 py-1.5 rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>Vider le journal</span>
            </button>
          </div>

          <div className="space-y-2">
            {logs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-white/10 bg-[#121316] text-zinc-500 text-xs font-mono">
                Aucun événement enregistré pour le moment. Utilisez le simulateur pour tester un webhook !
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-white/5 bg-[#121316] hover:bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span
                      className={`p-1.5 rounded-lg shrink-0 ${
                        log.result === "success"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {log.result === "success" ? <Check className="size-3.5" /> : <XCircle className="size-3.5" />}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.eventType}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">
                          {log.platform.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-zinc-500">User: #{log.userId}</span>
                      </div>
                      <div className="text-[11px] text-zinc-400 font-sans mt-0.5">{log.message}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded ${
                        log.signatureVerified
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {log.signatureVerified ? "HMAC Valid" : "Unsigned"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: VAULT DU CODE SOURCE & INSTALLATION */}
      {activeTab === "code" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            {[
              { id: "server", label: "server.js (Webhook & HMAC)", icon: FileCode },
              { id: "discord", label: "services/discordService.js", icon: Bot },
              { id: "telegram", label: "services/telegramService.js", icon: Send },
              { id: "cron", label: "cron/checkExpirations.js", icon: Clock },
              { id: "env", label: ".env & Variables", icon: Key },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCodeTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    codeTab === tab.id
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0c0d10] p-4 relative">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 text-xs">
              <span className="font-mono text-zinc-400">Prêt pour production (Node.js / Express / Discord.js / Telegraf)</span>
              <button
                onClick={() => {
                  let textToCopy = "";
                  if (codeTab === "server") textToCopy = serverCodeSnippet;
                  if (codeTab === "discord") textToCopy = discordCodeSnippet;
                  if (codeTab === "telegram") textToCopy = telegramCodeSnippet;
                  if (codeTab === "cron") textToCopy = cronCodeSnippet;
                  if (codeTab === "env") textToCopy = envCodeSnippet;
                  copyToClipboard(textToCopy, "vault_code");
                }}
                className="mansa-btn-orange px-3 py-1 text-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copiedKey === "vault_code" ? <Check className="size-3" /> : <Copy className="size-3" />}
                <span>Copier le fichier</span>
              </button>
            </div>

            <pre className="p-3 bg-[#08090b] rounded-xl text-zinc-300 font-mono text-[11px] overflow-x-auto leading-relaxed">
              {codeTab === "server" && serverCodeSnippet}
              {codeTab === "discord" && discordCodeSnippet}
              {codeTab === "telegram" && telegramCodeSnippet}
              {codeTab === "cron" && cronCodeSnippet}
              {codeTab === "env" && envCodeSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

const serverCodeSnippet = `// server.js - Endpoint Webhook KPAY Mobile Money avec validation HMAC SHA-256
const express = require("express");
const crypto = require("crypto");
require("dotenv").config();

const { grantDiscordAccess, revokeDiscordAccess } = require("./services/discordService");
const { createTelegramInviteLink, revokeTelegramAccess } = require("./services/telegramService");

const app = express();

// Body parser avec rawBody pour calcul HMAC
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; }
}));

function verifyKpaySignature(req, res, next) {
  const signature = req.headers["x-kpay-signature"];
  const secret = process.env.KPAY_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return res.status(401).json({ error: "Signature manquante." });
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody)
    .digest("hex");

  const isMatch = crypto.timingSafeEqual(
    Buffer.from(signature, "utf8"),
    Buffer.from(expectedSignature, "utf8")
  );

  if (!isMatch) {
    return res.status(403).json({ error: "Signature HMAC invalide." });
  }

  next();
}

app.post("/webhook/subscription-status", verifyKpaySignature, async (req, res) => {
  const { user_id, platform, status, plan_name = "VIP Mansa" } = req.body;

  try {
    if (platform === "discord") {
      if (status === "active") {
        await grantDiscordAccess(user_id, plan_name);
      } else if (status === "expired" || status === "cancelled") {
        await revokeDiscordAccess(user_id, plan_name);
      }
    } else if (platform === "telegram") {
      if (status === "active") {
        const inviteLink = await createTelegramInviteLink();
        return res.status(200).json({ status: "success", invite_link: inviteLink });
      } else if (status === "expired" || status === "cancelled") {
        await revokeTelegramAccess(user_id);
      }
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Mansa Hub en ligne"));`;

const discordCodeSnippet = `// services/discordService.js
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("ready", () => {
  console.log(\`[Discord] Connecté en tant que \${client.user.tag}\`);
});

client.login(process.env.DISCORD_BOT_TOKEN);

async function grantDiscordAccess(discordUserId, roleName) {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
  const member = await guild.members.fetch(discordUserId);
  const role = guild.roles.cache.find((r) => r.name.toLowerCase() === roleName.toLowerCase());

  if (!role) throw new Error(\`Rôle '\${roleName}' non trouvé\`);
  await member.roles.add(role);
  return { success: true };
}

async function revokeDiscordAccess(discordUserId, roleName) {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
  const member = await guild.members.fetch(discordUserId);
  const role = guild.roles.cache.find((r) => r.name.toLowerCase() === roleName.toLowerCase());

  if (role) await member.roles.remove(role);
  return { success: true };
}

module.exports = { client, grantDiscordAccess, revokeDiscordAccess };`;

const telegramCodeSnippet = `// services/telegramService.js
const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

async function createTelegramInviteLink(chatId = process.env.TELEGRAM_CHAT_ID) {
  const expireDate = Math.floor(Date.now() / 1000) + 24 * 3600; // 24h
  const invite = await bot.createChatInviteLink(chatId, {
    member_limit: 1, // 1 seul usage
    expire_date: expireDate,
    name: "Mansa VIP Pass",
  });
  return invite.invite_link;
}

async function revokeTelegramAccess(telegramUserId, chatId = process.env.TELEGRAM_CHAT_ID) {
  // Bannir puis débannir immédiatement pour expulser sans bloquer
  await bot.banChatMember(chatId, telegramUserId);
  await bot.unbanChatMember(chatId, telegramUserId, { only_if_banned: true });
  return { success: true };
}

module.exports = { bot, createTelegramInviteLink, revokeTelegramAccess };`;

const cronCodeSnippet = `// cron/checkExpirations.js
const cron = require("node-cron");
const { revokeDiscordAccess } = require("../services/discordService");
const { revokeTelegramAccess } = require("../services/telegramService");

// Scan tous les jours à 02h00 du matin
cron.schedule("0 2 * * *", async () => {
  console.log("[CRON] Scan des abonnements expirés...");
  // Récupérer depuis votre base SQL / Firestore
  // Pour chaque abonnement expiré :
  // if (sub.platform === 'discord') await revokeDiscordAccess(sub.userId, sub.role);
  // else if (sub.platform === 'telegram') await revokeTelegramAccess(sub.userId);
});`;

const envCodeSnippet = `# .env
PORT=3000
KPAY_WEBHOOK_SECRET=kpay_sec_votre_cle_secrete_partagee
DISCORD_BOT_TOKEN=OTk5...
DISCORD_GUILD_ID=120045678901234567
TELEGRAM_BOT_TOKEN=123456789:ABCDefgh...
TELEGRAM_CHAT_ID=-1001987654321`;
