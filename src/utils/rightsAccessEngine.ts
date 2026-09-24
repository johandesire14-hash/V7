import {
  CreatorPlatformOffer,
  TelegramChannelItem,
  DiscordChannelItem,
  EbookResourceItem,
  CourseResourceItem,
  PrivateResourceItem,
  EnterpriseSubscription,
} from "../types";

export type { EbookResourceItem, CourseResourceItem, PrivateResourceItem };

/**
 * CATALOGUE CENTRAL DES OFFRES ET DES RESSOURCES/AVANTAGES RATTACHÉS
 * Chaque créateur/entreprise peut avoir plusieurs offres distinctes.
 * Chaque offre possède ses PROPRES canaux Telegram, salons Discord, E-books, formations, etc.
 * Un membre qui achète une offre n'obtient JAMAIS automatiquement accès aux autres ressources de l'entreprise.
 */
export const PLATFORM_OFFERS_CATALOG: CreatorPlatformOffer[] = [
  // ==========================================
  // 1. MONEY LIFE (comp-money-life)
  // Deux offres bien distinctes avec des Telegram distincts :
  // - Offre Paris Sportifs -> Telegram inclus = Telegram Paris Sportifs
  // - Offre Trading -> Telegram inclus = Telegram Trading
  // ==========================================
  {
    id: "offer-money-life-paris-sportifs",
    title: "Money Life · Paris Sportifs",
    companyId: "comp-money-life",
    companyName: "Money Life",
    companyInitials: "ML",
    companyGradient: "from-blue-600 via-indigo-900 to-black",
    category: "betting",
    categoryLabel: "Paris Sportifs & Pronostics",
    type: "membership",
    priceDisplay: "19 € / mois",
    priceAmount: 19,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Accès exclusif au canal privé Telegram de pronostics sportifs, combinés analysés et gestion de capital Money Life.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Ousmane Diallo",
    includedApps: ["telegram", "dashboard", "support"],
    subscribersCount: "3 840 membres",
    rating: 4.96,
    reviewsCount: 312,
    telegramChannels: [
      {
        id: "tg-ml-paris-sportifs",
        name: "Telegram Paris Sportifs · Money Life",
        inviteLink: "https://t.me/+MoneyLifeParisSportifsVIP",
        tag: "Paris Sportifs",
        quote: "Pronostics sportifs haute espérance de gain, value bets et bilans certifiés.",
        description: "Canal privé Telegram officiel des pronostics et analyses sportives Money Life.",
        subscribersCount: 3840,
      },
    ],
    discordChannels: [],
  },
  {
    id: "offer-money-life-trading",
    title: "Money Life · Trading Pro",
    companyId: "comp-money-life",
    companyName: "Money Life",
    companyInitials: "ML",
    companyGradient: "from-amber-600 via-yellow-700 to-black",
    category: "trading",
    categoryLabel: "Trading & Scalping",
    type: "membership",
    priceDisplay: "29 € / mois",
    priceAmount: 29,
    currency: "EUR",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Accès exclusif aux signaux en temps réel sur les devises et l'or (XAUUSD), sessions scalping et salon Discord Élite.",
    imageUrl: "https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Ousmane Diallo",
    includedApps: ["telegram", "discord", "dashboard", "support"],
    subscribersCount: "2 950 membres",
    rating: 4.94,
    reviewsCount: 260,
    telegramChannels: [
      {
        id: "tg-ml-trading",
        name: "Telegram Trading · Money Life",
        inviteLink: "https://t.me/+MoneyLifeTradingVIP",
        tag: "Trading & Scalping",
        quote: "Signaux scalping en temps réel, analyses XAUUSD et plans de trading quotidiens.",
        description: "Canal privé Telegram officiel réservé aux signaux et analyses Trading Money Life.",
        subscribersCount: 2950,
      },
    ],
    discordChannels: [
      {
        id: "dc-ml-trading",
        name: "Money Life Discord Trading HQ",
        inviteLink: "https://discord.gg/money-life-trading",
        tag: "Discord Trading",
        description: "Salons vocaux pendant les sessions de Londres et New York, entraide traders.",
        subscribersCount: 2400,
        role: "Trader Pro VIP",
      },
    ],
  },

  // ==========================================
  // 2. CADRE FINANCIER (comp-cadre-financier)
  // - Offre Signaux VIP & Salons (Telegram + Discord)
  // - Offre Masterclass & Formation Vidéo (Formations + E-book)
  // ==========================================
  {
    id: "offer-cadre-financier",
    title: "Financial Framework Pro & VIP Discord",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    companyInitials: "CF",
    companyGradient: "from-[#0d2818] via-[#051f10] to-[#010a04]",
    category: "trading",
    categoryLabel: "Finance Institutionnelle",
    type: "membership",
    priceDisplay: "19 000 FCFA / mois",
    priceAmount: 19000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Méthodologie institutionnelle, analyses graphiques de pointe et accès direct aux salons Telegram et Discord.",
    imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Marc-Antoine R.",
    includedApps: ["telegram", "discord", "dashboard", "support"],
    subscribersCount: "3 480 membres",
    rating: 4.98,
    reviewsCount: 384,
    telegramChannels: [
      {
        id: "tg-ff-vip",
        name: "Cadre financier · Signaux & Setups",
        inviteLink: "https://t.me/+FinancialFrameworkVIP",
        tag: "Signaux",
        quote: "Analyses de marchés, graphiques institutionnels et alertes scalping.",
        description: "Alertes quotidiennes et setups haute probabilité.",
        subscribersCount: 1840,
      },
      {
        id: "tg-ff-chat",
        name: "Cadre financier · Salon Membres",
        inviteLink: "https://t.me/+FinancialFrameworkLounge",
        tag: "Chat",
        quote: "Échanges en direct entre traders de la communauté.",
        description: "Discussions et partages d'analyses.",
        subscribersCount: 920,
      },
    ],
    discordChannels: [
      {
        id: "dc-ff-main",
        name: "Serveur Discord Cadre Financier",
        inviteLink: "https://discord.gg/financial-framework",
        tag: "Serveur Discord",
        description: "Rejoignez la communauté exclusive Financial Framework sur Discord avec salons vocaux.",
        subscribersCount: 3400,
        role: "Cadre Financier VIP",
      },
    ],
  },
  {
    id: "offer-cadre-financier-formation",
    title: "Cadre financier · Masterclass Finance & E-book",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    companyInitials: "CF",
    companyGradient: "from-emerald-900 via-teal-950 to-black",
    category: "course",
    categoryLabel: "Formation & Stratégie",
    type: "course",
    priceDisplay: "35 000 FCFA",
    priceAmount: 35000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "one_time",
    description: "Cursus vidéo complet et manuel de référence pour maîtriser le positionnement des banques et fonds institutionnels.",
    imageUrl: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Marc-Antoine R.",
    includedApps: ["cours", "formation", "ebook", "dashboard", "support"],
    subscribersCount: "740 étudiants",
    rating: 4.99,
    reviewsCount: 195,
    courses: [
      {
        id: "co-cf-mastery",
        title: "Masterclass Trading & Liquidité Institutionnelle",
        description: "16 modules vidéo haute définition sur les order blocks, sessions d'Asie, Londres et New York.",
        modulesCount: 16,
        duration: "22 heures",
        accessUrl: "/courses/cadre-financier-masterclass",
        associatedOfferId: "offer-cadre-financier-formation",
        associatedOfferTitle: "Cadre financier · Masterclass Finance & E-book",
      },
    ],
    ebooks: [
      {
        id: "eb-cf-guide",
        title: "Le Guide Méthodologique Cadre Financier (PDF)",
        description: "Fiches récapitulatives prêtes à imprimer pour valider vos setups avant chaque entrée.",
        pagesCount: 148,
        downloadUrl: "/downloads/cadre-financier-guide.pdf",
        associatedOfferId: "offer-cadre-financier-formation",
        associatedOfferTitle: "Cadre financier · Masterclass Finance & E-book",
      },
    ],
  },

  // ==========================================
  // 3. VICTORY ODDS (comp-victory / comp-victory-odds)
  // ==========================================
  {
    id: "offer-victory-odds-vip",
    title: "Victory Odds · Club Privé Pronostics VIP",
    companyId: "comp-victory-odds",
    companyName: "Victory Odds",
    companyInitials: "VO",
    companyGradient: "from-emerald-600 via-teal-900 to-black",
    category: "betting",
    categoryLabel: "Sport & Pronostics",
    type: "membership",
    priceDisplay: "15 000 FCFA / mois",
    priceAmount: 15000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Analyses de cotes européennes et africaines, alertes buteurs et combinés sécurisés.",
    imageUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Moussa Sissoko",
    includedApps: ["telegram", "discord", "dashboard", "support"],
    subscribersCount: "3 890 membres",
    rating: 4.88,
    reviewsCount: 310,
    telegramChannels: [
      {
        id: "tg-vo-vip",
        name: "Victory Odds · Pronostics Foot & Tennis VIP",
        inviteLink: "https://t.me/+VictoryOddsVIP",
        tag: "Picks VIP",
        quote: "Pronostics rigoureusement audités pour une rentabilité long terme.",
        description: "Canal privé Telegram officiel de Victory Odds.",
        subscribersCount: 3890,
      },
    ],
    discordChannels: [
      {
        id: "dc-vo-main",
        name: "Victory Odds Discord Match Hub",
        inviteLink: "https://discord.gg/victory-odds",
        tag: "Match Hub",
        description: "Salons d'échange pendant les matchs en direct.",
        subscribersCount: 3100,
        role: "VIP Bettor",
      },
    ],
  },

  // ==========================================
  // 4. FOREX ELITE AFRICA (comp-fce-africa)
  // ==========================================
  {
    id: "offer-fce-africa-signals",
    title: "Forex Elite · Signaux VIP Gold & FX",
    companyId: "comp-fce-africa",
    companyName: "Forex Elite Africa",
    companyInitials: "FE",
    companyGradient: "from-amber-600 via-yellow-700 to-black",
    category: "trading",
    categoryLabel: "Forex & Scalping",
    type: "membership",
    priceDisplay: "25 000 FCFA / mois",
    priceAmount: 25000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Signaux haute précision avec points d'entrée, stop-loss et multi-take profits.",
    imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Kofi Mensah",
    includedApps: ["telegram", "discord", "dashboard", "support"],
    subscribersCount: "3 200 membres",
    rating: 4.90,
    reviewsCount: 215,
    telegramChannels: [
      {
        id: "tg-fce-vip",
        name: "Forex Elite · Signaux VIP Gold & FX",
        inviteLink: "https://t.me/+MansaForexEliteVIP",
        tag: "Signaux VIP",
        quote: "Signaux haute précision avec points d'entrée, stop-loss et multi-take profits.",
        description: "Alertes instantanées sur XAUUSD, EURUSD et indices boursiers.",
        subscribersCount: 3200,
      },
    ],
    discordChannels: [
      {
        id: "dc-fce-main",
        name: "Forex Elite Trading HQ",
        inviteLink: "https://discord.gg/forex-elite-africa",
        tag: "Live Trading HQ",
        description: "Serveur officiel avec vocaux en direct durant les sessions de Londres et New York.",
        subscribersCount: 2800,
        role: "Trader VIP",
      },
    ],
  },

  // ==========================================
  // 5. DEVKREATIV LAB SAAS (comp-devkreativ)
  // ==========================================
  {
    id: "offer-devkreativ-bots",
    title: "DevKreativ · Mansa Bot Automation & Webhooks",
    companyId: "comp-devkreativ",
    companyName: "DevKreativ Lab SaaS",
    companyInitials: "DK",
    companyGradient: "from-blue-600 via-indigo-900 to-black",
    category: "software",
    categoryLabel: "SaaS & Code",
    type: "membership",
    priceDisplay: "19 000 FCFA / mois",
    priceAmount: 19000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Accès aux scripts de synchronisation Wave / MTN, documentation SDK et salon technique.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Sarah Benali",
    includedApps: ["telegram", "discord", "dashboard", "support"],
    subscribersCount: "4 200 membres",
    rating: 4.88,
    reviewsCount: 196,
    telegramChannels: [
      {
        id: "tg-dk-releases",
        name: "DevKreativ · Bot Updates & Patches",
        inviteLink: "https://t.me/+DevKreativUpdates",
        tag: "Mises à Jour",
        quote: "Changelogs, nouvelles fonctionnalités API et scripts NoCode.",
        description: "Canal privé Telegram officiel des mises à jour développeurs.",
        subscribersCount: 950,
      },
    ],
    discordChannels: [
      {
        id: "dc-dk-main",
        name: "DevKreativ SaaS Hub",
        inviteLink: "https://discord.gg/devkreativ-lab",
        tag: "Dev Community",
        description: "Entraide développeurs, snippets de code et intégrations Wave / MTN.",
        subscribersCount: 880,
        role: "Licensed Developer",
      },
    ],
  },

  // ==========================================
  // 6. E-COMMERCE MASTERY (comp-ecommerce-mastery)
  // ==========================================
  {
    id: "offer-ecommerce-mastery",
    title: "Académie Dropshipping & Import Chine",
    companyId: "comp-ecommerce-mastery",
    companyName: "E-Commerce Mastery UEMOA",
    companyInitials: "EM",
    companyGradient: "from-purple-600 via-pink-900 to-black",
    category: "ecommerce",
    categoryLabel: "E-Commerce & Import",
    type: "membership",
    priceDisplay: "45 000 FCFA (À vie)",
    priceAmount: 45000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "one_time",
    description: "Accès à la base de contacts fournisseurs vérifiés en Chine et salons d'entraide e-commerce.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Mamadou Sow",
    includedApps: ["telegram", "discord", "ebook", "dashboard", "support"],
    subscribersCount: "8 900 membres",
    rating: 4.98,
    reviewsCount: 428,
    telegramChannels: [
      {
        id: "tg-em-contacts",
        name: "E-Commerce · Contacts Fournisseurs Vérifiés",
        inviteLink: "https://t.me/+EcommerceMasteryContacts",
        tag: "Sourcing",
        quote: "Adresses, agents d'expédition maritime/aérien et usines testées.",
        description: "Canal privé Telegram de mise en relation directe avec les usines chinoises.",
        subscribersCount: 1620,
      },
    ],
    discordChannels: [
      {
        id: "dc-em-main",
        name: "E-Commerce Afrique HQ",
        inviteLink: "https://discord.gg/ecommerce-afrique-hq",
        tag: "Entrepreneurs",
        description: "Audits de boutiques, retours d'expérience et partenariats logistiques.",
        subscribersCount: 1450,
        role: "Mastery Elite",
      },
    ],
    ebooks: [
      {
        id: "eb-em-contacts",
        title: "Annuaire des 80+ Usines et Transitaires Agréés Chine-Afrique (PDF)",
        description: "Contacts directs WhatsApp et WeChat des agents certifiés sans intermédiaire.",
        pagesCount: 142,
        downloadUrl: "/downloads/ecommerce-contacts.pdf",
        associatedOfferId: "offer-ecommerce-mastery",
        associatedOfferTitle: "Académie Dropshipping & Import Chine",
      },
    ],
  },

  // ==========================================
  // 7. BS SYNDICATE (comp-bs-syndicate)
  // ==========================================
  {
    id: "offer-bs-syndicate-pass",
    title: "BS Syndicate · Pass VIP Crypto & DeFi",
    companyId: "comp-bs-syndicate",
    companyName: "BS Syndicate Crypto",
    companyInitials: "BS",
    companyGradient: "from-stone-800 via-neutral-900 to-black",
    category: "crypto",
    categoryLabel: "Crypto & Web3",
    type: "membership",
    priceDisplay: "22 000 FCFA / mois",
    priceAmount: 22000,
    currency: "XOF",
    pricingType: "paid",
    billingCycle: "monthly",
    description: "Veille exclusive DeFi, nœuds validateurs et salons vocaux privés.",
    imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80",
    creatorName: "Alexandre K.",
    includedApps: ["discord", "telegram", "dashboard", "support"],
    subscribersCount: "1 400 membres",
    rating: 4.92,
    reviewsCount: 168,
    telegramChannels: [
      {
        id: "tg-bs-alpha",
        name: "BS Syndicate · Alertes Airdrops & Alpha",
        inviteLink: "https://t.me/+BSSyndicateAlpha",
        tag: "Alpha DeFi",
        quote: "Détection précoce des airdrops et opportunités de yield farming.",
        description: "Canal privé Telegram d'alertes alpha DeFi.",
        subscribersCount: 1100,
      },
    ],
    discordChannels: [
      {
        id: "dc-bs-main",
        name: "BS Syndicate Discord HQ",
        inviteLink: "https://discord.gg/bs-syndicate",
        tag: "BS HQ",
        description: "Veille DeFi, nodes et airdrops.",
        subscribersCount: 1400,
        role: "Syndicate Member",
      },
    ],
  },
];

/**
 * Normalise les IDs d'offres débloquées/achetées depuis un objet EnterpriseSubscription
 */
export function normalizeUnlockedOfferIds(
  sub?: Partial<EnterpriseSubscription> | null
): string[] {
  if (!sub) return [];
  const set = new Set<string>();

  if (Array.isArray(sub.unlockedProductIds)) {
    sub.unlockedProductIds.forEach((id) => {
      if (id && typeof id === "string") set.add(id);
    });
  }

  if (Array.isArray(sub.purchasedOfferIds)) {
    sub.purchasedOfferIds.forEach((id) => {
      if (id && typeof id === "string") set.add(id);
    });
  }

  if (sub.productId && typeof sub.productId === "string" && !sub.productId.includes("free")) {
    set.add(sub.productId);
  }

  return Array.from(set);
}

/**
 * Convertit un projet ou produit créé dynamiquement en CreatorPlatformOffer
 */
export function convertProjectToPlatformOffer(
  project: any,
  fallbackCompanyId?: string,
  fallbackCompanyName?: string
): CreatorPlatformOffer {
  const rawApps = Array.isArray(project.apps)
    ? project.apps
    : Array.isArray(project.includedApps)
    ? project.includedApps
    : [];
  const apps = rawApps.length > 0 ? rawApps : ["dashboard", "support"];

  const currencyCode = project.currency || "XOF";
  const currencySymbol =
    currencyCode === "EUR" ? "€" : currencyCode === "USD" ? "$" : currencyCode;
  const isOneTime =
    project.pricingModel === "one_time" || project.billingCycle === "one_time";
  const billingText = isOneTime ? " (À vie)" : " / mois";
  const priceNum = Number(project.pricingAmount ?? project.priceAmount ?? 0);
  const priceDisplay = `${priceNum} ${currencySymbol}${billingText}`;

  const cId = project.companyId || fallbackCompanyId || "comp-cadre-financier";
  const cName = project.companyName || fallbackCompanyName || "Cadre financier";
  const prodTitle = project.name || project.title || "Offre Mansa";

  return {
    id: project.id,
    title: prodTitle,
    companyId: cId,
    companyName: cName,
    category: project.category || "membership",
    categoryLabel:
      project.categoryLabel ||
      (apps.includes("telegram")
        ? "Canaux Privés Telegram"
        : apps.includes("courses")
        ? "Formation Vidéo"
        : apps.includes("ebook")
        ? "E-book & Guides"
        : "Produit Digital"),
    type:
      project.productType ||
      (apps.includes("courses")
        ? "course"
        : apps.includes("ebook")
        ? "ebook"
        : "membership"),
    priceDisplay,
    priceAmount: priceNum,
    currency: currencyCode,
    pricingType: priceNum === 0 ? "free" : "paid",
    billingCycle: isOneTime ? "one_time" : "monthly",
    description:
      project.tagline ||
      project.description ||
      `Accédez à l'ensemble des modules et ressources incluses avec ${prodTitle}.`,
    imageUrl:
      project.coverImage ||
      project.imageUrl ||
      "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80",
    creatorName: project.creatorName || cName,
    includedApps: apps,
    subscribersCount: `${project.membersCount || project.activeUsers || 142} membres`,
    rating: 4.98,
    reviewsCount: 142,
    telegramChannels:
      project.telegramChannels ||
      (apps.some((a: string) => a.toLowerCase().includes("telegram"))
        ? [
            {
              id: `tg-${project.id}`,
              name: `Telegram VIP · ${prodTitle}`,
              inviteLink: `https://t.me/+${prodTitle.replace(/[^a-zA-Z0-9]/g, "")}VIP`,
              tag: "Telegram VIP",
              description: `Canal privé Telegram officiel avec alertes et signaux exclusifs pour ${prodTitle}.`,
              subscribersCount: project.membersCount || 142,
            },
          ]
        : []),
    discordChannels:
      project.discordChannels ||
      (apps.some((a: string) => a.toLowerCase().includes("discord"))
        ? [
            {
              id: `dc-${project.id}`,
              name: `Discord VIP · ${prodTitle}`,
              inviteLink: `https://discord.gg/${prodTitle.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-")}`,
              tag: "Discord VIP",
              description: `Salons privés Discord officiels avec accès instantané pour ${prodTitle}.`,
              subscribersCount: project.membersCount || 98,
              role: "Membre VIP",
            },
          ]
        : []),
    ebooks:
      project.ebooks ||
      (apps.some((a: string) =>
        ["ebook", "guide", "pdf", "files"].some((k) => a.toLowerCase().includes(k))
      )
        ? [
            {
              id: `eb-${project.id}`,
              title: `Guide & Fichiers · ${prodTitle}`,
              description: `Documents téléchargeables et ressources d'application pour ${prodTitle}.`,
              pagesCount: project.ebookDetails?.pageCount || 85,
              downloadUrl: `/downloads/${project.id}.pdf`,
              associatedOfferId: project.id,
              associatedOfferTitle: prodTitle,
            },
          ]
        : []),
    courses:
      project.courses ||
      (apps.some((a: string) =>
        ["course", "courses", "formation", "masterclass"].some((k) =>
          a.toLowerCase().includes(k)
        )
      )
        ? [
            {
              id: `co-${project.id}`,
              title: `Formation Vidéo · ${prodTitle}`,
              description: `Masterclass complète et modules de formation pas-à-pas pour ${prodTitle}.`,
              modulesCount: project.courseModules?.length || 8,
              duration: "4h 45m",
              accessUrl: `/courses/${project.id}`,
              associatedOfferId: project.id,
              associatedOfferTitle: prodTitle,
            },
          ]
        : []),
    faqs: project.faqs || [
      {
        q: `Comment débloquer les accès de l'offre ${prodTitle} ?`,
        a: "Vos privilèges sont activés automatiquement dès la validation de votre paiement par carte ou Mobile Money (Wave, MTN, Orange Money).",
      },
      {
        q: "L'accès aux canaux et ressources est-il garanti ?",
        a: "Oui, tous les liens d'invitation et espaces privés sont disponibles directement dans votre espace membre.",
      },
    ],
    pricingOptions: project.pricingOptions || [
      {
        id: "default-plan",
        name: isOneTime ? "Paiement Unique & À vie" : "Abonnement Mensuel",
        price: priceNum,
        billing: isOneTime ? "paiement unique" : "mois",
      },
    ],
  };
}

/**
 * Récupère toutes les offres configurées pour une entreprise donnée
 * (Offres statiques de catalogue + Produits créés dynamiquement)
 */
export function getOffersForCompany(companyId: string): CreatorPlatformOffer[] {
  if (!companyId) return [];
  const normalized = companyId.trim().toLowerCase();
  
  // 1. Offres du catalogue de base
  const staticOffers = PLATFORM_OFFERS_CATALOG.filter(
    (o) =>
      o.companyId.toLowerCase() === normalized ||
      (normalized.startsWith("comp-") && o.companyId.toLowerCase() === normalized) ||
      o.companyName.toLowerCase() === normalized
  );

  // 2. Produits créés dynamiquement depuis le stockage local
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("mansa_saved_products_cache") : null;
    if (raw) {
      const parsed: any[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const dynamicOffers: CreatorPlatformOffer[] = parsed
          .filter((p) => {
            if (!p || !p.id) return false;
            const pCompId = (p.companyId || "").trim().toLowerCase();
            const pCompName = (p.companyName || "").trim().toLowerCase();
            if (pCompId === normalized || pCompName === normalized) return true;
            // Si le produit n'a pas d'entreprise explicitement fixée et qu'on consulte l'entreprise par défaut
            if (!pCompId && (normalized === "comp-cadre-financier" || normalized.includes("cadre"))) return true;
            return false;
          })
          .map((p) => convertProjectToPlatformOffer(p, companyId));

        const existingIds = new Set(staticOffers.map((o) => o.id));
        for (const dyn of dynamicOffers) {
          if (!existingIds.has(dyn.id)) {
            staticOffers.push(dyn);
            existingIds.add(dyn.id);
          }
        }
      }
    }
  } catch (err) {
    console.warn("Notice: getOffersForCompany reading dynamic products:", err);
  }

  return staticOffers;
}

/**
 * Récupère une offre par son ID
 */
export function getOfferById(offerId: string): CreatorPlatformOffer | undefined {
  if (!offerId) return undefined;
  const staticFound = PLATFORM_OFFERS_CATALOG.find((o) => o.id === offerId);
  if (staticFound) return staticFound;

  // Chercher dans les produits créés dynamiquement
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem("mansa_saved_products_cache") : null;
    if (raw) {
      const parsed: any[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const dynamicProd = parsed.find((p) => p && p.id === offerId);
        if (dynamicProd) {
          return convertProjectToPlatformOffer(dynamicProd);
        }
      }
    }
  } catch (err) {
    console.warn("Notice: getOfferById reading dynamic product:", err);
  }

  return undefined;
}

/**
 * Récupère STRICTEMENT les offres que le membre possède pour cette entreprise
 */
export function getMemberAuthorizedOffers(
  companyId: string,
  unlockedOfferIds: string[]
): CreatorPlatformOffer[] {
  const companyOffers = getOffersForCompany(companyId);
  const normalizedUnlocked = new Set(unlockedOfferIds.map((id) => id.trim().toLowerCase()));

  return companyOffers.filter((o) => normalizedUnlocked.has(o.id.toLowerCase()));
}

/**
 * Récupère STRICTEMENT les canaux Telegram auxquels le membre a droit selon les offres qu'il a achetées.
 * S'il possède Offre Money Life (Paris Sportifs), il n'aura QUE Telegram Paris Sportifs.
 * S'il possède Offre Trading, il n'aura QUE Telegram Trading.
 */
export function getMemberAuthorizedTelegramChannels(
  companyId: string,
  unlockedOfferIds: string[]
): TelegramChannelItem[] {
  const authorizedOffers = getMemberAuthorizedOffers(companyId, unlockedOfferIds);
  const channels: TelegramChannelItem[] = [];
  const seen = new Set<string>();

  for (const offer of authorizedOffers) {
    if (offer.telegramChannels && Array.isArray(offer.telegramChannels)) {
      for (const ch of offer.telegramChannels) {
        if (!seen.has(ch.id)) {
          seen.add(ch.id);
          channels.push({
            ...ch,
            tag: ch.tag || offer.title,
          });
        }
      }
    }
  }

  return channels;
}

/**
 * Récupère STRICTEMENT les serveurs/salons Discord auxquels le membre a droit selon les offres achetées
 */
export function getMemberAuthorizedDiscordChannels(
  companyId: string,
  unlockedOfferIds: string[]
): DiscordChannelItem[] {
  const authorizedOffers = getMemberAuthorizedOffers(companyId, unlockedOfferIds);
  const channels: DiscordChannelItem[] = [];
  const seen = new Set<string>();

  for (const offer of authorizedOffers) {
    if (offer.discordChannels && Array.isArray(offer.discordChannels)) {
      for (const ch of offer.discordChannels) {
        if (!seen.has(ch.id)) {
          seen.add(ch.id);
          channels.push(ch);
        }
      }
    }
  }

  return channels;
}

/**
 * Récupère STRICTEMENT les E-books auxquels le membre a droit selon les offres achetées
 */
export function getMemberAuthorizedEbooks(
  companyId: string,
  unlockedOfferIds: string[]
): EbookResourceItem[] {
  const authorizedOffers = getMemberAuthorizedOffers(companyId, unlockedOfferIds);
  const ebooks: EbookResourceItem[] = [];
  const seen = new Set<string>();

  for (const offer of authorizedOffers) {
    if (offer.ebooks && Array.isArray(offer.ebooks)) {
      for (const eb of offer.ebooks) {
        if (!seen.has(eb.id)) {
          seen.add(eb.id);
          ebooks.push(eb);
        }
      }
    }
  }

  return ebooks;
}

/**
 * Récupère STRICTEMENT les Formations / Cours auxquels le membre a droit selon les offres achetées
 */
export function getMemberAuthorizedCourses(
  companyId: string,
  unlockedOfferIds: string[]
): CourseResourceItem[] {
  const authorizedOffers = getMemberAuthorizedOffers(companyId, unlockedOfferIds);
  const courses: CourseResourceItem[] = [];
  const seen = new Set<string>();

  for (const offer of authorizedOffers) {
    if (offer.courses && Array.isArray(offer.courses)) {
      for (const co of offer.courses) {
        if (!seen.has(co.id)) {
          seen.add(co.id);
          courses.push(co);
        }
      }
    }
  }

  return courses;
}

/**
 * Vérification universelle et stricte des droits d'accès à une ressource précise
 * Répond à la question : « Est-ce que cet utilisateur possède cette offre précise, et est-ce que cette offre lui donne accès à cette ressource précise ? »
 */
export function verifyMemberResourceAccess(params: {
  companyId: string;
  unlockedOfferIds: string[];
  resourceType:
    | "telegram"
    | "discord"
    | "ebook"
    | "course"
    | "service"
    | "document"
    | "resource"
    | "group"
    | "channel"
    | string;
  resourceId: string;
}): {
  isAuthorized: boolean;
  resource?: any;
  grantedByOffer?: CreatorPlatformOffer;
  requiredOffer?: CreatorPlatformOffer;
  error?: string;
} {
  const { companyId, unlockedOfferIds, resourceType, resourceId } = params;
  const companyOffers = getOffersForCompany(companyId);

  // Trouver quelle offre précise de l'entreprise contient cette ressource
  let targetOffer: CreatorPlatformOffer | undefined = undefined;
  let targetResource: any = undefined;

  for (const offer of companyOffers) {
    if (resourceType === "telegram" && offer.telegramChannels) {
      const found = offer.telegramChannels.find((c) => c.id === resourceId || c.inviteLink === resourceId);
      if (found) {
        targetOffer = offer;
        targetResource = found;
        break;
      }
    } else if (resourceType === "discord" && offer.discordChannels) {
      const found = offer.discordChannels.find((c) => c.id === resourceId || c.inviteLink === resourceId);
      if (found) {
        targetOffer = offer;
        targetResource = found;
        break;
      }
    } else if (resourceType === "ebook" && offer.ebooks) {
      const found = offer.ebooks.find((e) => e.id === resourceId || e.downloadUrl === resourceId);
      if (found) {
        targetOffer = offer;
        targetResource = found;
        break;
      }
    } else if (resourceType === "course" && offer.courses) {
      const found = offer.courses.find((c) => c.id === resourceId || c.accessUrl === resourceId);
      if (found) {
        targetOffer = offer;
        targetResource = found;
        break;
      }
    } else if (
      (resourceType === "service" ||
        resourceType === "document" ||
        resourceType === "resource" ||
        resourceType === "group" ||
        resourceType === "channel") &&
      offer.customResources
    ) {
      const found = offer.customResources.find(
        (r) => r.id === resourceId || (r.url && r.url === resourceId)
      );
      if (found) {
        targetOffer = offer;
        targetResource = found;
        break;
      }
    }
  }

  // Si la ressource n'appartient à aucune offre connue de l'entreprise
  if (!targetOffer || !targetResource) {
    return {
      isAuthorized: false,
      error: `Ressource non trouvée ou non configurée pour l'entreprise '${companyId}'.`,
    };
  }

  // Vérifier si le membre possède STRICTEMENT l'offre associée à cette ressource
  const memberUnlockedSet = new Set(unlockedOfferIds.map((id) => id.trim().toLowerCase()));
  const hasOffer = memberUnlockedSet.has(targetOffer.id.toLowerCase());

  if (hasOffer) {
    return {
      isAuthorized: true,
      resource: targetResource,
      grantedByOffer: targetOffer,
    };
  } else {
    return {
      isAuthorized: false,
      requiredOffer: targetOffer,
      error: `Accès refusé. Cette ressource est exclusivement réservée à l'offre '${targetOffer.title}'. Vous devez souscrire à cette offre pour y accéder.`,
    };
  }
}

/**
 * Récupère STRICTEMENT les ressources personnalisées / services / documents auxquels le membre a droit
 */
export function getMemberAuthorizedCustomResources(
  companyId: string,
  unlockedOfferIds: string[]
): PrivateResourceItem[] {
  const authorizedOffers = getMemberAuthorizedOffers(companyId, unlockedOfferIds);
  const resources: PrivateResourceItem[] = [];
  const seen = new Set<string>();

  for (const offer of authorizedOffers) {
    if (offer.customResources && Array.isArray(offer.customResources)) {
      for (const res of offer.customResources) {
        if (!seen.has(res.id)) {
          seen.add(res.id);
          resources.push(res);
        }
      }
    }
  }

  return resources;
}
