import React, { useState } from "react";
import { CreditCard, Wallet, MessageSquare, Key, Copy, Check, Terminal, ExternalLink, ShieldCheck, Zap } from "lucide-react";
import { EmbedComponentTab } from "../types";

interface EmbedComponentsStudioProps {
  lang: "fr" | "en";
}

export const EmbedComponentsStudio: React.FC<EmbedComponentsStudioProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<"checkout" | "wallet" | "chat" | "licenses">("checkout");
  const [copiedCode, setCopiedCode] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const TABS: EmbedComponentTab[] = [
    {
      id: "checkout",
      name: "Mansa Checkout",
      description: "Tunnel de paiement ultra-rapide avec Apple Pay, Google Pay, Cartes & Crypto.",
      codeSnippet: `import { MansaCheckout } from "@mansa/sdk-react";

export function PurchaseButton() {
  return (
    <MansaCheckout
      planId="plan_vip_mastermind_98"
      theme="dark"
      onSuccess={(charge) => {
        console.log("Client actif:", charge.userId);
      }}
    />
  );
}`,
    },
    {
      id: "wallet",
      name: "Portefeuille Créateur",
      description: "Retraits automatiques vers compte bancaire, Stripe, PayPal ou USDC.",
      codeSnippet: `import { MansaWallet } from "@mansa/sdk-react";

export function PayoutHub() {
  return (
    <MansaWallet
      creatorId="usr_apex_academy"
      payoutSchedule="instant"
      currency="EUR"
    />
  );
}`,
    },
    {
      id: "chat",
      name: "Chat Intégré",
      description: "Messagerie privée et salons de discussion directement dans votre interface.",
      codeSnippet: `import { MansaChatRoom } from "@mansa/sdk-react";

export function CommunityFeed() {
  return (
    <MansaChatRoom
      channelId="chan_pro_signals"
      roleGated={["vip_tier"]}
    />
  );
}`,
    },
    {
      id: "licenses",
      name: "Clés de Licence",
      description: "Validation et activation de licences pour logiciels, scripts Python & bots.",
      codeSnippet: `// Server-side activation check (Express / Next.js)
import { Mansa } from "@mansa/sdk";

export async function validateLicense(key: string) {
  const license = await Mansa.licenses.verify({
    key,
    productId: "prod_indicator_v4"
  });
  return license.valid;
}`,
    },
  ];

  const currentTab = TABS.find((t) => t.id === activeTab) || TABS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentTab.codeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSimulatePay = () => {
    setIsProcessingPayment(true);
    setPaymentSuccess(false);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 3500);
    }, 1200);
  };

  return (
    <section className="w-full border-t border-white/[0.08] bg-[#07080a] py-20">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto pb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#FA4616] block mb-2">
            Mansa SDK & Composants
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Intégrez Mansa dans votre propre site
          </h2>
          <p className="mt-3 text-sm text-zinc-400 font-light">
            Installez nos composants React ou le SDK Mansa en 2 lignes de code et commencez à encaisser.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
          {TABS.map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#FA4616] text-white shadow-[0_4px_0_0_#C4350F]"
                    : "border border-white/10 bg-[#121316] text-zinc-400 hover:text-white hover:border-white/20"
                }`}
              >
                {tab.id === "checkout" && <CreditCard className="size-3.5" />}
                {tab.id === "wallet" && <Wallet className="size-3.5" />}
                {tab.id === "chat" && <MessageSquare className="size-3.5" />}
                {tab.id === "licenses" && <Key className="size-3.5" />}
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Workspace: Code on Left / Live Preview on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Code Box */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border border-white/10 bg-[#101114] p-6 shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                  <Terminal className="size-3.5 text-[#FA4616]" />
                  <span>SDK Component Integration</span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-mono text-zinc-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copiedCode ? "Copié !" : "Copier"}</span>
                </button>
              </div>

              <pre className="font-mono text-xs text-zinc-300 overflow-x-auto p-3 rounded-lg bg-[#07080a] border border-white/5 leading-relaxed">
                <code>{currentTab.codeSnippet}</code>
              </pre>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>{currentTab.description}</span>
              <a
                href="https://docs.mansa.app"
                target="_blank"
                rel="noreferrer"
                className="text-[#FA4616] hover:underline flex items-center gap-1 font-semibold"
              >
                Docs <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          {/* Right: Live Interactive Component Preview */}
          <div className="lg:col-span-6 flex flex-col justify-center rounded-2xl border border-white/10 bg-[#101114] p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-mono uppercase text-[#FA4616] font-bold">
                Aperçu en direct du widget
              </span>
            </div>

            {/* Sub-widget dynamic renders */}
            {activeTab === "checkout" && (
              <div className="rounded-xl border border-white/10 bg-[#16181f] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">AlphaTrading Master Plan</h4>
                    <p className="text-xs text-zinc-400">Accès illimité + Alertes instantanées</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-white">$149</span>
                    <span className="text-[10px] text-zinc-400 block">/mois</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-zinc-300">
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-[#FA4616]" />
                    <span>Algorithme TradingView v5 inclus</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="size-3.5 text-[#FA4616]" />
                    <span>Rôle Discord VIP instantané</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSimulatePay}
                    disabled={isProcessingPayment}
                    className="mansa-btn-orange w-full py-3 text-sm cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <span className="flex items-center gap-2">
                        <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Paiement sécurisé en cours...
                      </span>
                    ) : paymentSuccess ? (
                      <span className="flex items-center gap-2 text-white">
                        <Check className="size-4" /> Accès accordé ! Clé activée
                      </span>
                    ) : (
                      <span>Payer $149.00 avec Apple Pay</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "wallet" && (
              <div className="rounded-xl border border-white/10 bg-[#16181f] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Solde disponible</span>
                </div>
                <div className="text-3xl font-extrabold font-mono text-white">$14,290.45</div>
                <div className="flex gap-2">
                  <button className="mansa-btn-orange flex-1 py-2.5 text-xs cursor-pointer">
                    Transférer vers Banque
                  </button>
                  <button className="mansa-btn-dark flex-1 py-2.5 text-xs cursor-pointer text-zinc-300">
                    Retirer en USDC (0% frais)
                  </button>
                </div>
              </div>
            )}

            {activeTab === "chat" && (
              <div className="rounded-xl border border-white/10 bg-[#16181f] p-4 space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-white">#general-alpha-signals</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="bg-[#121316] p-2.5 rounded-lg border border-white/5">
                    <span className="font-bold text-[#FA4616] mr-2">Alex_Trader:</span>
                    <span className="text-zinc-300">Target $72k touchée sur BTC ! 🚀</span>
                  </div>
                  <div className="bg-[#121316] p-2.5 rounded-lg border border-white/5">
                    <span className="font-bold text-zinc-400 mr-2">Bot_Mansa:</span>
                    <span className="text-zinc-300">Nouveau membre @Julien a rejoint le salon VIP.</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "licenses" && (
              <div className="rounded-xl border border-white/10 bg-[#16181f] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-zinc-400">Clé de licence active</span>
                </div>
                <div className="p-3 rounded-lg bg-[#0c0d10] border border-white/10 font-mono text-xs text-white">
                  MANSA-PRO-9842-8711-XF89
                </div>
                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  Verrouillé sur HWID #A8F2-990B
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};
