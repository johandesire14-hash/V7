import React, { useState } from "react";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "Comment fonctionne l'automatisation Telegram et Discord ?",
    answer:
      "Dès qu'un client paie (par Mobile Money ou Carte Bancaire), notre bot génère un lien d'invitation sécurisé à usage unique ou lui attribue automatiquement le rôle VIP. En cas d'annulation ou non-renouvellement, l'accès est automatiquement révoqué.",
  },
  {
    id: "faq-2",
    question: "Quels sont les moyens de paiement acceptés pour mes clients ?",
    answer:
      "Vos clients peuvent régler via Wave, Orange Money, MTN MoMo, Moov Money, Airtel Money ainsi que par Carte Bancaire (Visa, Mastercard), Apple Pay et Google Pay.",
  },
  {
    id: "faq-3",
    question: "Quand et comment reçois-je mes gains ?",
    answer:
      "Vos fonds sont transférables directement sur votre compte Mobile Money ou compte bancaire. Aucun délai arbitraire de blocage.",
  },
  {
    id: "faq-4",
    question: "Puis-je vendre aussi des formations ou des fichiers ?",
    answer:
      "Absolument. Vous pouvez héberger vos vidéos de formation, e-books PDF, modèles Notion ou logiciels avec téléchargement sécurisé et illimité pour vos acheteurs.",
  },
];

interface FaqSectionProps {
  lang?: "fr" | "en";
  onOpenStudio?: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  lang = "fr",
  onOpenStudio,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(["faq-1"]);

  const toggleAccordion = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section id="faq" className="w-full bg-[#090a0f] py-16 px-6 sm:px-10 border-t border-white/[0.04]">
      <div className="mx-auto max-w-[760px] space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Questions fréquentes
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Tout ce que vous devez savoir pour lancer vos produits et encaisser sans friction.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((faq) => {
            const isOpen = openIds.includes(faq.id);
            return (
              <div
                key={faq.id}
                className="rounded-2xl border border-white/[0.06] bg-[#12141a]/80 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer gap-4 hover:bg-white/[0.02] transition-colors"
                >
                  <span className="text-sm font-bold text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`size-4 text-zinc-500 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-emerald-400" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Action prompt */}
        <div className="text-center pt-2">
          <button
            onClick={() => onOpenStudio && onOpenStudio()}
            className="text-xs sm:text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Prêt à créer votre première boutique ?</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

