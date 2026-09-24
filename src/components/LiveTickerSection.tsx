import React, { useState } from "react";
import { Zap, Sparkles, Inbox } from "lucide-react";
import { LiveTransaction } from "../types";

interface LiveTickerProps {
  onOpenStudio?: () => void;
  onOpenAiBuilder?: (prompt?: string) => void;
  lang: "fr" | "en";
}

interface AfricanLiveTransaction extends LiveTransaction {
  countryFlag?: string;
  paymentSource?: string;
}

export const LiveTickerSection: React.FC<LiveTickerProps> = ({ onOpenAiBuilder, lang }) => {
  const [transactions] = useState<AfricanLiveTransaction[]>([]);

  return (
    <section className="w-full border-y border-white/[0.08] bg-[#07080a] py-14">
      <div className="mx-auto max-w-[1240px] px-6 sm:px-10">
        
        {/* Ticker Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00D26A] uppercase tracking-wider mb-1.5 font-bold">
              <span className="size-2 rounded-full bg-[#00D26A] animate-pulse" />
              <span>Flux de transactions en direct</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                Paiements Mobile Money & Cartes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenAiBuilder && onOpenAiBuilder()}
              className="afhub-btn-green px-5 py-2.5 text-xs font-bold cursor-pointer bg-[#00D26A] hover:bg-[#10E47A] text-black rounded-xl transition-all shadow-md flex items-center gap-1.5"
            >
              <Sparkles className="size-3.5" />
              <span>Créer mon produit</span>
            </button>
          </div>
        </div>

        {/* Live Transactions Feed */}
        {transactions.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/[0.06] bg-[#101114] p-8 text-center flex flex-col items-center justify-center">
            <div className="size-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-zinc-500 mb-3">
              <Inbox className="size-6 text-zinc-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Aucune transaction enregistrée pour le moment
            </h3>
            <p className="text-xs text-zinc-400 max-w-md">
              Les transactions de vos clients apparaîtront ici en temps réel dès vos premières ventes.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101114] p-4 transition-all duration-200 hover:border-[#00D26A]/40 hover:bg-[#13161c]"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 mb-2">
                  <span>{tx.timestamp}</span>
                  {tx.buyerLocation && (
                    <span className="flex items-center gap-1.5 text-zinc-300 font-medium truncate max-w-[120px]">
                      {tx.buyerLocation}
                    </span>
                  )}
                </div>

                <div className="font-bold text-white text-sm line-clamp-1 mb-1">
                  {tx.productName}
                </div>

                {tx.paymentSource && (
                  <div className="text-[11px] text-zinc-400 font-mono mb-2">
                    Via <span className="text-emerald-400 font-semibold">{tx.paymentSource}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2.5 border-t border-white/[0.06]">
                  <span className="text-xs text-zinc-400">
                    Créateur : <strong className="text-zinc-200">{tx.creatorName}</strong>
                  </span>
                  <span className="font-mono text-sm font-bold text-[#00D26A]">
                    +{tx.amount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
