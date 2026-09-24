import { EnterpriseSubscription } from "../types";
import {
  getMemberAuthorizedTelegramChannels,
  getMemberAuthorizedDiscordChannels,
  getMemberAuthorizedEbooks,
  getMemberAuthorizedCourses,
  getMemberAuthorizedOffers,
} from "./rightsAccessEngine";

const SUBSCRIPTIONS_STORAGE_KEY_PREFIX = "mansa_enterprise_subscriptions_";

export const DEFAULT_DEMO_SUBSCRIPTIONS: EnterpriseSubscription[] = [
  {
    id: "sub-money-life",
    companyId: "comp-money-life",
    companyName: "Money Life",
    companyInitials: "ML",
    companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-amber-600 via-yellow-700 to-black",
    productName: "Adhésion Membre Simple",
    productId: "offer-money-life-free",
    priceDisplay: "0 € Gratuit",
    status: "active",
    subscribedAt: "Aujourd'hui",
    onlineMembersCount: 5420,
    unreadCount: 0,
    includedApps: ["dashboard", "support"],
    unlockedProductIds: [],
    hasPaidOffer: false,
    telegramChannels: [],
    discordChannels: [],
    discordServerName: "Money Life Discord HQ",
    discordInvite: "",
    supportChannels: {
      telegramSupport: "@MoneyLifeSupportBot",
      email: "support@moneylife.afhub.app",
    },
  },
  {
    id: "sub-cadre-financier",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    companyInitials: "FF",
    companyGradient: "from-[#0d2818] via-[#051f10] to-[#010a04]",
    productName: "Financial Framework Pro & VIP Discord",
    priceDisplay: "19 000 FCFA / mois",
    status: "active",
    subscribedAt: "Aujourd'hui",
    onlineMembersCount: 1,
    unreadCount: 0,
    includedApps: ["Discord VIP", "Telegram Pro", "Formations Trading", "dashboard", "support", "telegram", "discord"],
    unlockedProductIds: ["offer-cadre-financier"],
    hasPaidOffer: true,
    telegramChannels: [
      {
        id: "tg-ff-vip",
        name: "Cadre financier · Signaux & Setups",
        subscribersCount: 1840,
        tag: "Signaux",
        quote: "Analyses de marchés, graphiques institutionnels et alertes scalping.",
        description: "Alertes quotidiennes et setups haute probabilité.",
        inviteLink: "https://t.me/+FinancialFrameworkVIP",
      },
      {
        id: "tg-ff-chat",
        name: "Cadre financier · Salon Membres",
        subscribersCount: 920,
        tag: "Chat",
        quote: "Échanges en direct entre traders de la communauté.",
        description: "Discussions et partages d'analyses.",
        inviteLink: "https://t.me/+FinancialFrameworkLounge",
      },
    ],
    discordChannels: [
      {
        id: "dc-ff-main",
        name: "Discorde",
        subscribersCount: 3400,
        tag: "Serveur Discord",
        description: "Rejoignez la communauté exclusive Financial Framework sur Discord.",
        inviteLink: "https://discord.gg/financial-framework",
        role: "Cadre Financier VIP",
      },
    ],
    discordServerName: "Financial Framework",
    discordInvite: "https://discord.gg/financial-framework",
    supportChannels: {
      telegramSupport: "@FinancialFrameworkSupport",
      email: "support@financialframework.com",
    },
  },
  {
    id: "sub-gs-trading",
    companyId: "comp-gs-trading",
    companyName: "GS Global Scalping",
    companyInitials: "GS",
    companyGradient: "from-zinc-800 via-neutral-900 to-black",
    productName: "GS Scalping Alpha Club",
    priceDisplay: "20 000 FCFA / mois",
    status: "active",
    subscribedAt: "Hier",
    onlineMembersCount: 520,
    unreadCount: 0,
    includedApps: ["Discord VIP", "Telegram Bot"],
    telegramChannels: [],
    discordChannels: [
      {
        id: "dc-gs-main",
        name: "Discorde",
        subscribersCount: 1980,
        tag: "GS Discord",
        description: "Sessions live New York et Londres.",
        inviteLink: "https://discord.gg/gs-trading",
        role: "GS Member",
      },
    ],
    discordServerName: "GS Global Trading",
    discordInvite: "https://discord.gg/gs-trading",
  },
  {
    id: "sub-bs-syndicate",
    companyId: "comp-bs-syndicate",
    companyName: "BS Syndicate",
    companyInitials: "BS",
    companyGradient: "from-stone-800 via-neutral-900 to-black",
    productName: "Blockchain & DeFi Syndicate",
    priceDisplay: "22 000 FCFA / mois",
    status: "active",
    subscribedAt: "Il y a 2 jours",
    onlineMembersCount: 310,
    unreadCount: 0,
    includedApps: ["Discord VIP"],
    telegramChannels: [],
    discordChannels: [
      {
        id: "dc-bs-main",
        name: "Discorde",
        subscribersCount: 1400,
        tag: "BS HQ",
        description: "Veille DeFi, nodes et airdrops.",
        inviteLink: "https://discord.gg/bs-syndicate",
        role: "Syndicate Member",
      },
    ],
    discordServerName: "BS Syndicate",
    discordInvite: "https://discord.gg/bs-syndicate",
  },
  {
    id: "sub-profitic",
    companyId: "comp-profitic",
    companyName: "Profitic Pro",
    companyInitials: "P",
    companyGradient: "from-purple-900 via-indigo-950 to-black",
    productName: "Profitic Indicator & Scripts",
    priceDisplay: "30 000 FCFA / mois",
    status: "active",
    subscribedAt: "Il y a 3 jours",
    onlineMembersCount: 840,
    unreadCount: 0,
    includedApps: ["Discord VIP", "Indicateur TradingView"],
    telegramChannels: [],
    discordChannels: [
      {
        id: "dc-p-main",
        name: "Discorde",
        subscribersCount: 2200,
        tag: "Profitic Hub",
        description: "Support indicateurs et alertes algorithmiques.",
        inviteLink: "https://discord.gg/profitic-pro",
        role: "Profitic VIP",
      },
    ],
    discordServerName: "Profitic Community",
    discordInvite: "https://discord.gg/profitic-pro",
  },
  {
    id: "sub-victory-odds",
    companyId: "comp-victory-odds",
    companyName: "Victory Odds",
    companyInitials: "VO",
    companyGradient: "from-amber-900 via-yellow-950 to-black",
    productName: "Victory Odds VIP Club",
    priceDisplay: "15 000 FCFA / mois",
    status: "active",
    subscribedAt: "Il y a 4 jours",
    onlineMembersCount: 1620,
    unreadCount: 0,
    includedApps: ["Telegram VIP", "Discord VIP"],
    telegramChannels: [],
    discordChannels: [
      {
        id: "dc-vo-main",
        name: "Discorde",
        subscribersCount: 3100,
        tag: "Victory HQ",
        description: "Pronostics et analyses sportives de pointe.",
        inviteLink: "https://discord.gg/victory-odds",
        role: "VIP Bettor",
      },
    ],
    discordServerName: "Victory Odds Pro",
    discordInvite: "https://discord.gg/victory-odds",
  },
  {
    id: "sub-alpha-bets",
    companyId: "comp-alpha-bets",
    companyName: "Alpha Bets Club Pro",
    companyInitials: "AB",
    companyLogo: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-emerald-600 via-teal-800 to-black",
    productName: "Algorithmes Data & Pronostics IA",
    priceDisplay: "15 000 FCFA / mois",
    status: "active",
    subscribedAt: "Hier",
    onlineMembersCount: 2150,
    unreadCount: 99,
    includedApps: ["Telegram VIP", "Discord Bot Data", "Calculateur Bankroll"],
    telegramChannels: [
      {
        id: "tg-ab-safe",
        name: "Alpha Bets · Pronostics Safe 1.80+",
        subscribersCount: 4200,
        tag: "Picks Validés",
        description: "Sélection mathématique quotidienne des cotes à forte espérance de gain.",
        inviteLink: "https://t.me/+AlphaBetsPicksSafe",
      },
      {
        id: "tg-ab-live",
        name: "Alpha Bets · Live In-Play Alertes",
        subscribersCount: 2900,
        tag: "Live Data",
        description: "Alertes automatiques dès qu'une opportunité en direct est détectée.",
        inviteLink: "https://t.me/+AlphaBetsLivePicks",
      },
    ],
    discordChannels: [
      {
        id: "dc-ab-main",
        name: "Discorde",
        subscribersCount: 3100,
        tag: "Data HQ",
        description: "Salons statistiques, bots de cotes et gestion de bankroll certifiée.",
        inviteLink: "https://discord.gg/alpha-bets-pro",
        role: "VIP Data Bettor",
      },
    ],
    discordServerName: "Alpha Bets Community HQ",
    discordInvite: "https://discord.gg/alpha-bets-pro",
    supportChannels: {
      telegramSupport: "@AlphaBetsHelpBot",
      email: "support@alphabets.mansa.af",
    },
  },
  {
    id: "sub-devkreativ",
    companyId: "comp-devkreativ",
    companyName: "DevKreativ Lab SaaS",
    companyInitials: "DK",
    companyLogo: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-blue-600 via-indigo-900 to-black",
    productName: "Mansa Bot Automation & Webhooks",
    priceDisplay: "19 000 FCFA / mois",
    status: "active",
    subscribedAt: "Il y a 3 jours",
    onlineMembersCount: 420,
    unreadCount: 0,
    includedApps: ["Bot WhatsApp Auto", "API Webhook", "Documentation SDK"],
    telegramChannels: [
      {
        id: "tg-dk-releases",
        name: "DevKreativ · Bot Updates & Patches",
        subscribersCount: 950,
        tag: "Mises à Jour",
        description: "Changelogs, nouvelles fonctionnalités API et scripts NoCode.",
        inviteLink: "https://t.me/+DevKreativUpdates",
      },
    ],
    discordChannels: [
      {
        id: "dc-dk-main",
        name: "DevKreativ SaaS Hub",
        subscribersCount: 880,
        tag: "Dev Community",
        description: "Entraide développeurs, snippets de code et intégrations Wave / MTN.",
        inviteLink: "https://discord.gg/devkreativ-lab",
        role: "Licensed Developer",
      },
    ],
    discordServerName: "DevKreativ SaaS Hub",
    discordInvite: "https://discord.gg/devkreativ-lab",
    supportChannels: {
      telegramSupport: "@DevKreativSupportBot",
      email: "dev@devkreativ.mansa.af",
    },
  },
  {
    id: "sub-ecommerce-mastery",
    companyId: "comp-ecommerce-mastery",
    companyName: "E-Commerce Mastery UEMOA",
    companyInitials: "EM",
    companyLogo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-purple-600 via-pink-900 to-black",
    productName: "Académie Dropshipping & Import Chine",
    priceDisplay: "45 000 FCFA (Accès Illimité)",
    status: "active",
    subscribedAt: "Il y a 5 jours",
    onlineMembersCount: 890,
    unreadCount: 6,
    includedApps: ["Base Fournisseurs (+80)", "Vidéos Pas-à-Pas", "Groupe Privé"],
    telegramChannels: [
      {
        id: "tg-em-contacts",
        name: "E-Commerce · Contacts Fournisseurs Vérifiés",
        subscribersCount: 1620,
        tag: "Sourcing",
        description: "Adresses, agents d'expédition maritime/aérien et usines testées.",
        inviteLink: "https://t.me/+EcommerceMasteryContacts",
      },
    ],
    discordChannels: [
      {
        id: "dc-em-main",
        name: "E-Commerce Afrique HQ",
        subscribersCount: 1450,
        tag: "Entrepreneurs",
        description: "Audits de boutiques, retours d'expérience et partenariats logistiques.",
        inviteLink: "https://discord.gg/ecommerce-afrique-hq",
        role: "Mastery Elite",
      },
    ],
    discordServerName: "E-Commerce Afrique HQ",
    discordInvite: "https://discord.gg/ecommerce-afrique-hq",
    supportChannels: {
      email: "contact@sarahdiallo.mansa.af",
    },
  },
  {
    id: "sub-fce-africa",
    companyId: "comp-fce-africa",
    companyName: "Forex Elite Africa",
    companyInitials: "FE",
    companyLogo: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-amber-600 via-yellow-700 to-black",
    productName: "VIP Signals & Daily Scalping",
    priceDisplay: "25 000 FCFA / mois",
    status: "active",
    subscribedAt: "Il y a 1 semaine",
    onlineMembersCount: 1420,
    unreadCount: 3,
    includedApps: ["Telegram VIP", "Discord Live Trading", "Coaching Hebdo"],
    telegramChannels: [
      {
        id: "tg-fce-vip",
        name: "Forex Elite · Signaux VIP Gold & FX",
        subscribersCount: 3200,
        tag: "Signaux VIP",
        quote: "Signaux haute précision avec points d'entrée, stop-loss et multi-take profits.",
        description: "Alertes instantanées sur XAUUSD, EURUSD et indices boursiers.",
        inviteLink: "https://t.me/+MansaForexEliteVIP",
      },
    ],
    discordChannels: [
      {
        id: "dc-fce-main",
        name: "Discorde",
        subscribersCount: 2800,
        tag: "Official HQ",
        description: "Serveur officiel avec vocaux en direct durant les sessions de Londres et New York.",
        inviteLink: "https://discord.gg/forex-elite-africa",
        role: "Trader VIP",
      },
    ],
    discordServerName: "Forex Elite Trading HQ",
    discordInvite: "https://discord.gg/forex-elite-africa",
    supportChannels: {
      telegramSupport: "@MansaForexVIPSupport",
      email: "vip@forexelite.mansa.af",
    },
  },
  {
    id: "sub-diaspora-invest",
    companyId: "comp-diaspora-invest",
    companyName: "Diaspora Invest Immo",
    companyInitials: "DI",
    companyLogo: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
    companyGradient: "from-amber-700 via-orange-900 to-black",
    productName: "Club Foncier ACD & Syndicat Privé",
    priceDisplay: "30 000 FCFA / mois",
    status: "active",
    subscribedAt: "Il y a 1 semaine",
    onlineMembersCount: 610,
    unreadCount: 0,
    includedApps: ["Dossiers Notariés", "Visites 3D", "Lounge Membres"],
    telegramChannels: [
      {
        id: "tg-di-opportunites",
        name: "Diaspora Invest · Opportunités Certifiées ACD",
        subscribersCount: 890,
        tag: "Opportunités Immo",
        description: "Lots fonciers audités avec titres de propriété vérifiés par notaire.",
        inviteLink: "https://t.me/+DiasporaInvestDeals",
      },
    ],
    discordChannels: [],
    discordServerName: "Diaspora Invest VIP Syndicate",
    discordInvite: "https://discord.gg/diaspora-invest-immo",
    supportChannels: {
      email: "immo@diasporainvest.mansa.af",
    },
  },
];

export function deduplicateSubscriptions(subs: EnterpriseSubscription[]): EnterpriseSubscription[] {
  if (!Array.isArray(subs)) return [];
  const seen = new Set<string>();
  const result: EnterpriseSubscription[] = [];
  for (const sub of subs) {
    if (!sub) continue;
    const key = sub.id || sub.companyId;
    if (key && !seen.has(key)) {
      seen.add(key);
      result.push(sub);
    }
  }
  return result;
}

export function getSavedSubscriptions(userKey: string): EnterpriseSubscription[] {
  if (typeof window === "undefined") return deduplicateSubscriptions(DEFAULT_DEMO_SUBSCRIPTIONS);
  try {
    const raw = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey);
    const wasSeeded = localStorage.getItem(`mansa_subscriptions_seeded_${userKey}`);

    let leftIds: string[] = [];
    try {
      const leftRaw = localStorage.getItem(`mansa_left_enterprises_${userKey}`);
      if (leftRaw) leftIds = JSON.parse(leftRaw);
    } catch {}

    if (!raw) {
      if (wasSeeded === "true" || leftIds.length > 0) {
        return [];
      }
      // Auto-populate default subscriptions on very first initialization
      localStorage.setItem(`mansa_subscriptions_seeded_${userKey}`, "true");
      const initial = deduplicateSubscriptions(DEFAULT_DEMO_SUBSCRIPTIONS).filter(
        (sub) => !leftIds.includes(sub.id) && !leftIds.includes(sub.companyId)
      );
      localStorage.setItem(
        SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey,
        JSON.stringify(initial)
      );
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any left enterprises
      const filtered = parsed.filter(
        (sub) => !leftIds.includes(sub.id) && !leftIds.includes(sub.companyId)
      );
      const deduped = deduplicateSubscriptions(filtered);
      if (deduped.length !== parsed.length) {
        localStorage.setItem(
          SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey,
          JSON.stringify(deduped)
        );
      }
      return deduped;
    }
    return [];
  } catch (err) {
    console.error("Error loading subscriptions from localStorage:", err);
    return [];
  }
}

export function seedEnterpriseSubscriptions(userKey: string): EnterpriseSubscription[] {
  if (typeof window === "undefined") return DEFAULT_DEMO_SUBSCRIPTIONS;
  try {
    localStorage.setItem(
      SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey,
      JSON.stringify(DEFAULT_DEMO_SUBSCRIPTIONS)
    );
    window.dispatchEvent(new CustomEvent("mansa_subscription_updated", { detail: DEFAULT_DEMO_SUBSCRIPTIONS }));
  } catch (e) {
    console.error("Error seeding enterprise subscriptions:", e);
  }
  return DEFAULT_DEMO_SUBSCRIPTIONS;
}

export function saveSubscription(
  userKey: string,
  newSub: EnterpriseSubscription
): EnterpriseSubscription[] {
  const current = getSavedSubscriptions(userKey);
  const existsIndex = current.findIndex((s) => s.id === newSub.id || s.companyId === newSub.companyId);
  let updated: EnterpriseSubscription[];

  if (existsIndex >= 0) {
    const prev = current[existsIndex];
    const compId = newSub.companyId || prev.companyId;

    const mergedUnlockedProducts = Array.from(
      new Set([
        ...(prev.unlockedProductIds || []),
        ...(newSub.unlockedProductIds || []),
        ...(newSub.purchasedOfferIds || []),
      ])
    );

    // Calcul STRICT des ressources autorisées basé UNIQUEMENT sur les offres achetées
    const authorizedTelegram = getMemberAuthorizedTelegramChannels(compId, mergedUnlockedProducts);
    const authorizedDiscord = getMemberAuthorizedDiscordChannels(compId, mergedUnlockedProducts);
    const authorizedEbooks = getMemberAuthorizedEbooks(compId, mergedUnlockedProducts);
    const authorizedCourses = getMemberAuthorizedCourses(compId, mergedUnlockedProducts);

    // Dérivation stricte des fonctionnalités actives
    const authorizedOffers = getMemberAuthorizedOffers(compId, mergedUnlockedProducts);
    const derivedAppsSet = new Set<string>(["dashboard", "support"]);
    authorizedOffers.forEach((o) => {
      if (Array.isArray(o.includedApps)) {
        o.includedApps.forEach((a) => derivedAppsSet.add(a));
      }
    });

    const isPaid = mergedUnlockedProducts.length > 0 || Boolean(prev.hasPaidOffer || newSub.hasPaidOffer);

    const merged: EnterpriseSubscription = {
      ...prev,
      ...newSub,
      id: prev.id,
      companyId: compId,
      productName: newSub.hasPaidOffer
        ? (prev.hasPaidOffer && prev.productName !== newSub.productName
            ? `${prev.productName} + ${newSub.productName}`
            : newSub.productName)
        : prev.productName,
      priceDisplay: newSub.hasPaidOffer ? newSub.priceDisplay : prev.priceDisplay,
      hasPaidOffer: isPaid,
      includedApps: Array.from(derivedAppsSet),
      unlockedProductIds: mergedUnlockedProducts,
      purchasedOfferIds: mergedUnlockedProducts,
      telegramChannels: authorizedTelegram,
      discordChannels: authorizedDiscord,
      ebooks: authorizedEbooks,
      courses: authorizedCourses,
      discordInvite: authorizedDiscord[0]?.inviteLink || newSub.discordInvite || prev.discordInvite,
    };

    updated = [...current];
    updated[existsIndex] = merged;
  } else {
    const compId = newSub.companyId;
    const initialUnlocked = Array.from(
      new Set([...(newSub.unlockedProductIds || []), ...(newSub.purchasedOfferIds || [])])
    );
    const authorizedTelegram = getMemberAuthorizedTelegramChannels(compId, initialUnlocked);
    const authorizedDiscord = getMemberAuthorizedDiscordChannels(compId, initialUnlocked);
    const authorizedEbooks = getMemberAuthorizedEbooks(compId, initialUnlocked);
    const authorizedCourses = getMemberAuthorizedCourses(compId, initialUnlocked);

    const authorizedOffers = getMemberAuthorizedOffers(compId, initialUnlocked);
    const derivedAppsSet = new Set<string>(["dashboard", "support"]);
    authorizedOffers.forEach((o) => {
      if (Array.isArray(o.includedApps)) {
        o.includedApps.forEach((a) => derivedAppsSet.add(a));
      }
    });

    const populatedSub: EnterpriseSubscription = {
      ...newSub,
      unlockedProductIds: initialUnlocked,
      purchasedOfferIds: initialUnlocked,
      includedApps: Array.from(derivedAppsSet),
      telegramChannels: authorizedTelegram,
      discordChannels: authorizedDiscord,
      ebooks: authorizedEbooks,
      courses: authorizedCourses,
      hasPaidOffer: initialUnlocked.length > 0 || Boolean(newSub.hasPaidOffer),
    };

    updated = [populatedSub, ...current];
  }

  // If user is saving/rejoining, remove from left list
  try {
    const leftKey = `mansa_left_enterprises_${userKey}`;
    const leftRaw = localStorage.getItem(leftKey);
    if (leftRaw) {
      const leftIds: string[] = JSON.parse(leftRaw);
      const filtered = leftIds.filter((id) => id !== newSub.id && id !== newSub.companyId);
      localStorage.setItem(leftKey, JSON.stringify(filtered));
    }
  } catch {}

  if (typeof window !== "undefined") {
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_subscription_updated", { detail: newSub }));
  }
  return updated;
}

export function removeSubscription(
  userKey: string,
  targetId: string
): EnterpriseSubscription[] {
  // Track in left enterprises list
  try {
    const leftKey = `mansa_left_enterprises_${userKey}`;
    const leftRaw = localStorage.getItem(leftKey);
    const leftIds: string[] = leftRaw ? JSON.parse(leftRaw) : [];
    if (!leftIds.includes(targetId)) {
      leftIds.push(targetId);
      localStorage.setItem(leftKey, JSON.stringify(leftIds));
    }
  } catch {}

  const current = getSavedSubscriptions(userKey);
  const updated = current.filter((sub) => sub.id !== targetId && sub.companyId !== targetId);

  if (typeof window !== "undefined") {
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_subscription_updated", { detail: { removedId: targetId } }));
  }
  return updated;
}

export function cancelActiveSubscription(
  userKey: string,
  targetId: string
): EnterpriseSubscription[] {
  const current = getSavedSubscriptions(userKey);
  const updated = current.map((sub) => {
    if (sub.id === targetId || sub.companyId === targetId) {
      return {
        ...sub,
        hasPaidOffer: false,
        status: "canceled" as const,
        productName: "Adhésion Simple (Gratuit)",
        priceDisplay: "0 FCFA",
        includedApps: ["dashboard", "support"],
        unlockedProductIds: [],
        purchasedOfferIds: [],
        telegramChannels: [],
        discordChannels: [],
        ebooks: [],
        courses: [],
        customResources: [],
      };
    }
    return sub;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_subscription_updated", { detail: { cancelledId: targetId } }));
  }
  return updated;
}

export function updateSubscriptionBranding(
  userKey: string,
  targetId: string,
  branding: {
    companyBanner?: string;
    companyLogo?: string;
    companyName?: string;
  }
): EnterpriseSubscription[] {
  const current = getSavedSubscriptions(userKey);
  const updated = current.map((sub) => {
    if (sub.id === targetId || sub.companyId === targetId) {
      return {
        ...sub,
        companyName: branding.companyName || sub.companyName,
        companyLogo: branding.companyLogo || sub.companyLogo,
        companyBanner: branding.companyBanner || sub.companyBanner,
      };
    }
    return sub;
  });

  if (typeof window !== "undefined") {
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY_PREFIX + userKey, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_subscription_updated", { detail: branding }));
  }
  return updated;
}


