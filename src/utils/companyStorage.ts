import { Company } from "../types";
import { db, doc, setDoc, deleteDoc } from "../services/firebase";

const COMPANIES_STORAGE_PREFIX = "mansa_companies_";
const LEGACY_COMPANIES_STORAGE_PREFIX = "afhub_companies_";

export const DEFAULT_DEMO_COMPANIES: Company[] = [
  {
    id: "comp-cadre-financier",
    name: "Cadre financier",
    description: "Académie de trading, signaux VIP scalping et écosystème e-commerce Mansa.",
    acceptedPayments: ["wave", "orange_money", "mtn_momo", "card"],
    primaryCurrency: "XOF",
    logoInitials: "FF",
    colorGradient: "from-emerald-950 via-slate-900 to-black",
    supportEmail: "contact@cadrefinancier.com",
    supportAutoReplyEnabled: true,
    supportAutoReplyMessage: "Bonjour ! Merci d'avoir contacté l'assistance de Cadre financier. Notre équipe a bien reçu votre demande et vous répondra dans les plus brefs délais.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "comp-mansa-ventures",
    name: "Mansa Capital Ventures",
    description: "Holding digitale & incubateur de créateurs africains à forte croissance.",
    acceptedPayments: ["wave", "orange_money", "mtn_momo", "card"],
    primaryCurrency: "XOF",
    logoInitials: "MV",
    colorGradient: "from-emerald-600 via-teal-700 to-black",
    supportEmail: "contact@mansaventures.af",
    supportAutoReplyEnabled: true,
    supportAutoReplyMessage: "Bonjour ! Bienvenue chez Mansa Capital Ventures. Nous prenons en charge votre demande immédiatement.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "comp-studio-dakar",
    name: "Studio Digital Dakar",
    description: "Production de contenus, formations immersives et médias Web3 Afrique.",
    acceptedPayments: ["wave", "orange_money", "card"],
    primaryCurrency: "XOF",
    logoInitials: "SD",
    colorGradient: "from-blue-600 via-indigo-800 to-black",
    supportEmail: "hello@studiodakar.sn",
    supportAutoReplyEnabled: true,
    supportAutoReplyMessage: "Bonjour ! L'équipe Studio Digital Dakar a bien reçu votre message. Un responsable vous répondra très rapidement.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getSavedCompanies(userKey: string = "default"): Company[] {
  try {
    let raw = localStorage.getItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`);
    if (!raw) {
      // Check legacy key and migrate if present
      raw = localStorage.getItem(`${LEGACY_COMPANIES_STORAGE_PREFIX}${userKey}`);
      if (raw) {
        localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, raw);
      }
    }
    if (!raw) {
      localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(DEFAULT_DEMO_COMPANIES));
      return DEFAULT_DEMO_COMPANIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure default companies (like Cadre financier) are present if missing
      const hasCadre = parsed.some((c: Company) => c.id === "comp-cadre-financier");
      if (!hasCadre) {
        parsed.unshift(DEFAULT_DEMO_COMPANIES[0]);
        localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(parsed));
      }
      return parsed;
    }
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(DEFAULT_DEMO_COMPANIES));
    return DEFAULT_DEMO_COMPANIES;
  } catch (err) {
    console.error("Error reading companies from storage:", err);
    return DEFAULT_DEMO_COMPANIES;
  }
}

export function seedUserCompanies(userKey: string = "default"): Company[] {
  try {
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(DEFAULT_DEMO_COMPANIES));
  } catch (err) {
    console.error("Error seeding companies to storage:", err);
  }
  return DEFAULT_DEMO_COMPANIES;
}

export function saveCompany(userKey: string = "default", newCompany: Omit<Company, "id" | "createdAt"> & { id?: string }): { companies: Company[]; created: Company } {
  const current = getSavedCompanies(userKey);
  const initials = newCompany.logoInitials || (newCompany.name
    ? newCompany.name
        .trim()
        .split(/\s+/)
        .map((w) => w[0]?.toUpperCase() || "")
        .slice(0, 2)
        .join("") || "EN"
    : "EN");

  const gradients = [
    "from-emerald-600 via-teal-700 to-black",
    "from-blue-600 via-indigo-800 to-black",
    "from-purple-600 via-pink-800 to-black",
    "from-amber-600 via-orange-800 to-black",
    "from-rose-600 via-red-800 to-black",
    "from-cyan-600 via-blue-800 to-black",
  ];
  const chosenGradient = newCompany.colorGradient || gradients[current.length % gradients.length];

  const fullCompany: Company = {
    id: newCompany.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: newCompany.name.trim(),
    description: newCompany.description.trim(),
    acceptedPayments: newCompany.acceptedPayments && newCompany.acceptedPayments.length > 0
      ? newCompany.acceptedPayments
      : ["wave", "orange_money", "mtn_momo", "card"],
    primaryCurrency: newCompany.primaryCurrency || "XOF",
    logoInitials: initials,
    colorGradient: chosenGradient,
    supportEmail: newCompany.supportEmail || "",
    supportAutoReplyEnabled: newCompany.supportAutoReplyEnabled ?? true,
    supportAutoReplyMessage: newCompany.supportAutoReplyMessage || "Bonjour ! Merci d'avoir contacté notre équipe. Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.",
    companyBanner: newCompany.companyBanner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85",
    companyLogo: newCompany.companyLogo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated = [fullCompany, ...current.filter((c) => c.id !== fullCompany.id)];
  try {
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_companies_updated", { detail: updated }));
  } catch (err) {
    console.error("Error saving company to storage:", err);
  }

  // Synchronisation sécurisée dans Firestore
  try {
    setDoc(doc(db, "companies", fullCompany.id), fullCompany).catch((err) =>
      console.warn("Notice: Firestore company save:", err)
    );
  } catch (e) {}

  return { companies: updated, created: fullCompany };
}

export function updateCompany(userKey: string = "default", updatedCompany: Company): Company[] {
  const current = getSavedCompanies(userKey);
  const updated = current.map((c) => (c.id === updatedCompany.id ? { ...updatedCompany, updatedAt: new Date().toISOString() } : c));
  try {
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_companies_updated", { detail: updated }));
  } catch (err) {
    console.error("Error updating company in storage:", err);
  }

  // Synchronisation sécurisée dans Firestore
  try {
    setDoc(doc(db, "companies", updatedCompany.id), {
      ...updatedCompany,
      updatedAt: new Date().toISOString(),
    }).catch((err) => console.warn("Notice: Firestore company update:", err));
  } catch (e) {}

  return updated;
}

export function updateCompanyAutoReply(
  userKey: string = "default",
  companyId: string,
  config: {
    enabled: boolean;
    message: string;
  }
): { companies: Company[]; updatedCompany: Company | null } {
  const current = getSavedCompanies(userKey);
  let updatedCompany: Company | null = null;
  const updated = current.map((c) => {
    if (c.id === companyId) {
      updatedCompany = {
        ...c,
        supportAutoReplyEnabled: config.enabled,
        supportAutoReplyMessage: config.message,
        updatedAt: new Date().toISOString(),
      };
      return updatedCompany;
    }
    return c;
  });

  try {
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_companies_updated", { detail: updated }));
    window.dispatchEvent(
      new CustomEvent("mansa_autoreply_updated", {
        detail: { companyId, enabled: config.enabled, message: config.message },
      })
    );
  } catch (err) {
    console.error("Error updating company auto-reply in storage:", err);
  }

  if (updatedCompany) {
    try {
      setDoc(doc(db, "companies", companyId), updatedCompany, { merge: true }).catch((err) =>
        console.warn("Notice: Firestore company auto-reply update:", err)
      );
    } catch (e) {}
  }

  return { companies: updated, updatedCompany };
}

export function updateCompanyBranding(
  userKey: string = "default",
  companyId: string,
  branding: {
    companyBanner?: string;
    companyLogo?: string;
    name?: string;
    description?: string;
  }
): { companies: Company[]; updatedCompany: Company | null } {
  const current = getSavedCompanies(userKey);
  let updatedItem: Company | null = null;
  const updated = current.map((c) => {
    if (c.id === companyId) {
      updatedItem = {
        ...c,
        ...branding,
        updatedAt: new Date().toISOString(),
      };
      return updatedItem;
    }
    return c;
  });

  try {
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("mansa_companies_updated", { detail: updated }));
    window.dispatchEvent(new CustomEvent("mansa_company_branding_changed", { detail: { companyId, branding } }));
  } catch (err) {
    console.error("Error updating company branding:", err);
  }

  return { companies: updated, updatedCompany: updatedItem };
}

export function deleteCompany(userKey: string = "default", companyId: string): Company[] {
  const current = getSavedCompanies(userKey);
  const updated = current.filter((c) => c.id !== companyId);
  try {
    localStorage.setItem(`${COMPANIES_STORAGE_PREFIX}${userKey}`, JSON.stringify(updated));
  } catch (err) {
    console.error("Error deleting company from storage:", err);
  }

  // Suppression synchronisée dans Firestore
  try {
    deleteDoc(doc(db, "companies", companyId)).catch((err) =>
      console.warn("Notice: Firestore company delete:", err)
    );
  } catch (e) {}

  return updated;
}
