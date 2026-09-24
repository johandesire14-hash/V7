import React, { useState } from "react";
import {
  Code2,
  Key,
  Webhook,
  Terminal,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
  Plus,
  Zap,
  ExternalLink,
  ShieldCheck,
  X,
  Play,
  Trash2,
} from "lucide-react";
import { ConfirmActionModal } from "../common/ConfirmActionModal";
import { ModalOverlay } from "../common/ModalOverlay";

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  status: "active" | "failing";
  lastDelivery: string;
  successRate: string;
}

const INITIAL_WEBHOOKS: WebhookEndpoint[] = [
  {
    id: "wh-1",
    url: "https://api.victoryodds.com/webhooks/mansa",
    events: ["membership.created", "payment.succeeded", "membership.cancelled"],
    status: "active",
    lastDelivery: "Il y a 4 min (200 OK)",
    successRate: "99.9%",
  },
  {
    id: "wh-2",
    url: "https://discord-bot.victoryodds.com/auth/sync",
    events: ["membership.created", "membership.cancelled"],
    status: "active",
    lastDelivery: "Il y a 12 min (200 OK)",
    successRate: "100%",
  },
];

interface DeveloperPortalViewProps {
  lang?: "fr" | "en";
}

export const DeveloperPortalView: React.FC<DeveloperPortalViewProps> = ({
  lang = "fr",
}) => {
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);
  const [testKeyRevealed, setTestKeyRevealed] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<"node" | "python" | "curl">("node");
  const [webhooks, setWebhooks] = useState<WebhookEndpoint[]>(INITIAL_WEBHOOKS);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookEndpoint | null>(null);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);

  const liveApiKey = "mansa_live_8f99a34bc9884e11a2d4889efc01289";
  const testApiKey = "mansa_test_9011b22ff8110a33c1d999eaa023912";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard?.writeText?.(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSendTestWebhook = () => {
    setTestWebhookStatus("sending");
    setTimeout(() => {
      setTestWebhookStatus("success");
      setTimeout(() => setTestWebhookStatus(null), 3000);
    }, 1200);
  };

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    const newWh: WebhookEndpoint = {
      id: "wh-" + Date.now(),
      url: newWebhookUrl.trim(),
      events: ["payment.succeeded", "membership.created"],
      status: "active",
      lastDelivery: "Prêt (en attente d'événements)",
      successRate: "100%",
    };
    setWebhooks([...webhooks, newWh]);
    setIsAddWebhookOpen(false);
    setNewWebhookUrl("");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              {"</>"} Portail Développeur & SDK
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {lang === "fr"
              ? "Gérez vos clés secrètes d'authentification, configurez vos Webhooks temps réel et intégrez le SDK Mansa dans votre infrastructure."
              : "Manage secret keys, setup real-time webhook endpoints, and integrate the Mansa SDK into your stack."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSendTestWebhook}
            disabled={testWebhookStatus === "sending"}
            className="flex items-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 text-xs font-semibold transition-all cursor-pointer"
          >
            {testWebhookStatus === "sending" ? (
              <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : testWebhookStatus === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-400" />
            ) : (
              <Zap className="size-4 text-amber-400" />
            )}
            <span>
              {testWebhookStatus === "sending"
                ? "Envoi du ping..."
                : testWebhookStatus === "success"
                ? "Ping 200 OK Reçu !"
                : "Simuler un Webhook"}
            </span>
          </button>

          <button
            onClick={() => setIsAddWebhookOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="size-4" />
            <span>{lang === "fr" ? "Ajouter un Endpoint" : "Add Webhook"}</span>
          </button>
        </div>
      </div>

      {/* Mansa Bot Automation Callout */}
      <div className="rounded-2xl border border-[#FA4616]/30 bg-gradient-to-r from-[#FA4616]/10 via-[#121316] to-[#0c0d10] p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#FA4616]/20 border border-[#FA4616]/40 text-[#FA4616]">
            <Zap className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono">Hub d'Automatisation Mansa (KPAY, Discord & Telegram)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Endpoint Actif : /webhook/subscription-status
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Gérez l'attribution automatique des rôles Discord et liens d'invitation Telegram à usage unique selon les paiements Mobile Money.
            </p>
          </div>
        </div>
      </div>

      {/* Mansa Authentication Keys Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Key className="size-4 text-[#0055ff]" />
            <h3 className="text-sm font-bold text-white">Clés Secrètes d'Authentification Mansa</h3>
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">Bearer Token Auth</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Production Key */}
          <div className="rounded-xl border border-white/10 bg-[#121316] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Clé Live Production</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Droits d'écriture complets</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#16181f] border border-white/5 px-3 py-2">
              <input
                type={apiKeyRevealed ? "text" : "password"}
                readOnly
                value={liveApiKey}
                className="flex-1 bg-transparent font-mono text-xs text-emerald-400 outline-none"
              />
              <button
                onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
                className="text-zinc-400 hover:text-white p-1"
                title={apiKeyRevealed ? "Masquer" : "Afficher"}
              >
                {apiKeyRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              <button
                onClick={() => handleCopy(liveApiKey, "live_key")}
                className="text-xs text-zinc-400 hover:text-white p-1"
                title="Copier la clé"
              >
                {copiedText === "live_key" ? (
                  <span className="text-emerald-400 text-[10px] font-bold">Copié !</span>
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Sandbox Test Key */}
          <div className="rounded-xl border border-white/10 bg-[#121316] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-amber-400" />
                <span>Clé Sandbox Test</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Pour environnement de dev</span>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[#16181f] border border-white/5 px-3 py-2">
              <input
                type={testKeyRevealed ? "text" : "password"}
                readOnly
                value={testApiKey}
                className="flex-1 bg-transparent font-mono text-xs text-amber-400 outline-none"
              />
              <button
                onClick={() => setTestKeyRevealed(!testKeyRevealed)}
                className="text-zinc-400 hover:text-white p-1"
              >
                {testKeyRevealed ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
              <button
                onClick={() => handleCopy(testApiKey, "test_key")}
                className="text-xs text-zinc-400 hover:text-white p-1"
              >
                {copiedText === "test_key" ? (
                  <span className="text-emerald-400 text-[10px] font-bold">Copié !</span>
                ) : (
                  <Copy className="size-3.5" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Webhooks Section */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Webhook className="size-4 text-[#0055ff]" />
            <h3 className="text-sm font-bold text-white">Endpoints Webhooks Configurés</h3>
          </div>
          <button
            onClick={() => setIsAddWebhookOpen(true)}
            className="text-xs text-[#0055ff] hover:underline font-semibold cursor-pointer"
          >
            + Ajouter un endpoint
          </button>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {webhooks.map((wh) => (
            <div
              key={wh.id}
              className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-white/[0.02] px-2 rounded-xl transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-white">{wh.url}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {wh.events.map((ev) => (
                    <span
                      key={ev}
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/5 font-mono text-[10px] text-zinc-400"
                    >
                      {ev}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="text-[11px]">{wh.lastDelivery}</span>
                <span className="text-emerald-400 font-bold">{wh.successRate} succès</span>
                <button
                  onClick={() => alert(`Test du webhook ${wh.url} exécuté avec succès (200 OK)`)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 hover:text-white cursor-pointer font-sans"
                >
                  Tester
                </button>
                <button
                  onClick={() => setWebhookToDelete(wh)}
                  className="p-1.5 rounded-lg border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors"
                  title="Supprimer ce webhook"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Snippets & SDK Docs */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal className="size-4 text-[#0055ff]" />
            <h3 className="text-sm font-bold text-white">SDK & Intégration Rapide</h3>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-[#121316] border border-white/10 p-1">
            <button
              onClick={() => setActiveCodeTab("node")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                activeCodeTab === "node" ? "bg-[#0055ff] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Node.js / TS
            </button>
            <button
              onClick={() => setActiveCodeTab("python")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                activeCodeTab === "python" ? "bg-[#0055ff] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setActiveCodeTab("curl")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                activeCodeTab === "curl" ? "bg-[#0055ff] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              cURL
            </button>
          </div>
        </div>

        {/* Code block */}
        <div className="relative rounded-xl border border-white/10 bg-[#121316] p-4 overflow-x-auto">
          <button
            onClick={() => {
              const code =
                activeCodeTab === "node"
                  ? `import { MansaSDK } from "@mansa-sdk/core";\n\nconst mansa = new MansaSDK({\n  secretKey: process.env.MANSA_SECRET_KEY,\n});\n\n// Vérifier l'accès d'un utilisateur\nconst membership = await mansa.memberships.retrieve("mem_12345");\nconsole.log(membership.valid); // true`
                  : activeCodeTab === "python"
                  ? `import mansa\n\nclient = mansa.Client(secret_key="mansa_live_...")\n\n# Récupérer les abonnements actifs\nmembers = client.memberships.list(product_id="prod_victory_odds")\nprint(f"Total membres actifs: {len(members)}")`
                  : `curl -X GET https://gateway.mansa.app/v2/memberships \\\n  -H "Authorization: Bearer ${liveApiKey}" \\\n  -H "Content-Type: application/json"`;
              handleCopy(code, "code");
            }}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            {copiedText === "code" ? (
              <span className="text-emerald-400 font-bold">Copié !</span>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copier le snippet</span>
              </>
            )}
          </button>

          <pre className="font-mono text-xs text-zinc-300 leading-relaxed">
            {activeCodeTab === "node" && (
              <code>
                <span className="text-purple-400">import</span> {"{ MansaSDK }"} <span className="text-purple-400">from</span> <span className="text-emerald-300">"@mansa-sdk/core"</span>;{"\n\n"}
                <span className="text-blue-400">const</span> mansa = <span className="text-purple-400">new</span> <span className="text-yellow-300">MansaSDK</span>({`{\n  secretKey: process.env.MANSA_SECRET_KEY,\n}`});{"\n\n"}
                <span className="text-zinc-500">// 1. Valider l'accès d'un utilisateur en temps réel</span>{"\n"}
                <span className="text-blue-400">const</span> membership = <span className="text-purple-400">await</span> mansa.memberships.<span className="text-yellow-300">retrieve</span>(<span className="text-emerald-300">"mem_99412"</span>);{"\n"}
                console.<span className="text-yellow-300">log</span>(membership.valid); <span className="text-zinc-500">// true</span>
              </code>
            )}

            {activeCodeTab === "python" && (
              <code>
                <span className="text-purple-400">import</span> mansa{"\n\n"}
                client = mansa.<span className="text-yellow-300">Client</span>(secret_key=<span className="text-emerald-300">"mansa_live_..."</span>){"\n\n"}
                <span className="text-zinc-500"># Récupérer les abonnements actifs</span>{"\n"}
                members = client.memberships.<span className="text-yellow-300">list</span>(product_id=<span className="text-emerald-300">"prod_victory_odds"</span>){"\n"}
                <span className="text-yellow-300">print</span>(f<span className="text-emerald-300">"Total membres actifs: {'{len(members)}'}"</span>)
              </code>
            )}

            {activeCodeTab === "curl" && (
              <code>
                curl -X GET https://gateway.mansa.app/v2/memberships \{"\n"}
                {"  "}-H <span className="text-emerald-300">"Authorization: Bearer {liveApiKey}"</span> \{"\n"}
                {"  "}-H <span className="text-emerald-300">"Content-Type: application/json"</span>
              </code>
            )}
          </pre>
        </div>

      </div>

      {/* ADD WEBHOOK MODAL */}
      <ModalOverlay
        isOpen={isAddWebhookOpen}
        onClose={() => setIsAddWebhookOpen(false)}
        contentClassName="max-w-md mx-auto"
      >
        <div className="w-full rounded-2xl border border-white/10 bg-[#121316] p-6 shadow-2xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Webhook className="size-5 text-[#0055ff]" />
              <h3 className="text-base font-bold text-white">Ajouter un Endpoint Webhook</h3>
            </div>
            <button
              onClick={() => setIsAddWebhookOpen(false)}
              className="text-zinc-400 hover:text-white cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <form onSubmit={handleAddWebhook} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">URL HTTPS du Webhook</label>
              <input
                type="url"
                value={newWebhookUrl}
                onChange={(e) => setNewWebhookUrl(e.target.value)}
                placeholder="https://votre-domaine.com/api/webhooks"
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 font-mono text-white outline-none focus:border-[#0055ff]"
                required
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Événements souscrits</label>
              <div className="space-y-1.5">
                {["payment.succeeded", "membership.created", "membership.cancelled", "dispute.created"].map((ev) => (
                  <label key={ev} className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-[#0055ff]" />
                    <span className="font-mono">{ev}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddWebhookOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] text-white text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Enregistrer l'endpoint
              </button>
            </div>
          </form>

        </div>
      </ModalOverlay>

      {/* CONFIRM WEBHOOK DELETION MODAL */}
      {webhookToDelete && (
        <ConfirmActionModal
          isOpen={!!webhookToDelete}
          onClose={() => setWebhookToDelete(null)}
          onConfirm={() => {
            setWebhooks((prev) => prev.filter((w) => w.id !== webhookToDelete.id));
            setWebhookToDelete(null);
          }}
          title={lang === "fr" ? "Supprimer cet endpoint webhook ?" : "Delete this webhook endpoint?"}
          description={
            lang === "fr"
              ? `Êtes-vous certain de vouloir supprimer le webhook vers "${webhookToDelete.url}" ? Votre serveur ne recevra plus les notifications d'événements afhub.`
              : `Are you sure you want to delete the webhook "${webhookToDelete.url}"?`
          }
          itemName={webhookToDelete.url}
          itemType={lang === "fr" ? "Endpoint Webhook" : "Webhook Endpoint"}
          itemDetails={[
            { label: "Événements rattachés", value: `${webhookToDelete.events.length} événements` },
            { label: "Taux de succès", value: webhookToDelete.successRate },
          ]}
          consequences={[
            lang === "fr"
              ? "Les requêtes HTTP POST pour les nouveaux paiements et accès cesseront immédiatement."
              : "HTTP POST requests for new payments and memberships will stop immediately.",
            lang === "fr"
              ? "Les logs de livraison antérieurs seront archivés."
              : "Past delivery logs will be archived.",
          ]}
          confirmButtonText={lang === "fr" ? "Supprimer le webhook" : "Delete Webhook"}
          cancelButtonText={lang === "fr" ? "Annuler" : "Cancel"}
          variant="danger"
          lang={lang}
        />
      )}

    </div>
  );
};
