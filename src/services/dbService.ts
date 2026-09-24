import {
  db,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from "./firebase";
import { BusinessProject, LiveEvent, MarketplaceItem } from "../types";
import { safeStorage } from "../utils/storage";

export interface FirestoreUserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarInitials: string;
  photoURL?: string;
  country?: string;
  currency?: string;
  handle?: string;
  bio?: string;
  birthDate?: string;
  showTotalEarned?: boolean;
  showLocation?: boolean;
  showOwnedBusinesses?: boolean;
  showOwnedWhops?: boolean;
  showJoinedWhops?: boolean;
  // Enterprise / Store settings
  storeName?: string;
  storeTagline?: string;
  supportEmail?: string;
  storeCurrency?: string;
  companyBanner?: string;
  companyLogo?: string;
  storeBanner?: string;
  storeLogo?: string;
  payoutMethod?: "wave" | "orange_momo" | "bank_uemoa" | "bank_cemac" | "crypto";
  momoNumber?: string;
  momoName?: string;
  bankName?: string;
  bankIbanRib?: string;
  bankAccountHolder?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreWorkforceMember {
  id: string;
  creatorId: string;
  name: string;
  role: string;
  rate: string;
  avatar: string;
  status: "active" | "standby";
  tasksCompleted: number;
  rating: number;
  createdAt: string;
}

export interface FirestorePartnerDeal {
  id: string;
  creatorId: string;
  partnerName: string;
  partnerLogo: string;
  partnerHandle: string;
  type: "co_branding" | "cross_promo" | "sponsor" | "tech_integration";
  typeLabel: string;
  description: string;
  contactEmail?: string;
  status: "active" | "pending" | "proposed";
  value: string;
  reach: string;
  startDate: string;
  createdAt: string;
}

export interface FirestoreProduct {
  id: string;
  creatorId: string;
  creatorEmail: string;
  creatorName: string;
  name: string;
  tagline?: string;
  description?: string;
  category: string;
  productType?: string;
  pricingAmount: number;
  pricingModel: "subscription" | "one_time" | "annual" | "free_upsell";
  currency: string;
  targetAudience?: string;
  status: "active" | "draft" | "paused";
  features: string[];
  techStack: string[];
  estimatedMonthlyRevenue?: number;
  affiliateCommissionRate: number;
  membersCount: number;
  conversionRate?: string;
  apps: string[];
  storeUrl: string;
  coverImage?: string;
  companyId?: string;
  companyName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreTransaction {
  id: string;
  creatorId: string;
  buyerName: string;
  buyerEmail: string;
  buyerLocation: string;
  productName: string;
  productId: string;
  amount: string;
  amountNumber: number;
  currency: string;
  paymentMethod: string;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  timestamp?: any;
  customerName?: string;
  customerEmail?: string;
  companyId?: string;
  companyName?: string;
  storeName?: string;
  type?: "sale" | "affiliate" | "other" | "transfer" | "ad_spend";
}

export interface FirestoreCustomer {
  id: string;
  creatorId: string;
  name: string;
  email: string;
  country?: string;
  countryName?: string;
  countryFlag?: string;
  phone?: string;
  productName: string;
  productId?: string;
  amountSpent?: string;
  totalSpent?: number;
  totalSpentFormatted?: string;
  currency?: string;
  status: "active" | "cancelled" | "past_due" | "trial";
  joinedAt?: string;
  joinedDate?: string;
  discordUsername?: string;
}

export interface FirestoreCommunityMessage {
  id: string;
  creatorId: string;
  buyerName: string;
  buyerEmail: string;
  productName: string;
  text: string;
  sender: "buyer" | "creator" | "system";
  createdAt: string;
  time: string;
}

// Helper for local caching
const LOCAL_PRODUCTS_KEY = "mansa_saved_products_cache";
const LOCAL_TRANSACTIONS_KEY = "mansa_saved_transactions_cache";
const LOCAL_CUSTOMERS_KEY = "mansa_saved_customers_cache";
const LOCAL_WORKFORCE_KEY = "mansa_saved_workforce_cache";
const LOCAL_PARTNERS_KEY = "mansa_saved_partners_cache";
const LOCAL_FAVORITES_KEY = "mansa_saved_favorites_cache";
const LOCAL_USER_PROFILE_KEY = "mansa_saved_user_profile_cache_";

function getLocalItems<T>(key: string): T[] {
  try {
    let raw = safeStorage.getItem(key);
    // Backward compatibility fallback for legacy afhub keys
    if (!raw && key.startsWith("mansa_")) {
      const legacyKey = key.replace("mansa_", "afhub_");
      raw = safeStorage.getItem(legacyKey);
      if (raw) {
        safeStorage.setItem(key, raw);
      }
    }
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalItems<T>(key: string, items: T[]) {
  try {
    safeStorage.setItem(key, JSON.stringify(items));
  } catch (e) {
    console.error("Local storage save error:", e);
  }
}

// ----------------- USER PROFILE & ENTERPRISE SETTINGS -----------------
export function isCreatorPayoutConfigured(profile?: Partial<FirestoreUserProfile> | null): boolean {
  if (!profile) return false;
  if (!profile.payoutMethod) return false;
  if (profile.payoutMethod === "wave" || profile.payoutMethod === "orange_momo") {
    return Boolean(profile.momoNumber && profile.momoNumber.trim().length >= 6);
  }
  if (profile.payoutMethod === "bank_uemoa" || profile.payoutMethod === "bank_cemac") {
    return Boolean(profile.bankIbanRib && profile.bankIbanRib.trim().length >= 6);
  }
  if (profile.payoutMethod === "crypto") {
    return true;
  }
  return false;
}

export async function getUserProfile(uid: string): Promise<FirestoreUserProfile | null> {
  if (!uid) return null;
  try {
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data() as FirestoreUserProfile;
      safeStorage.setItem(`${LOCAL_USER_PROFILE_KEY}${uid}`, JSON.stringify(data));
      return data;
    }
    const cached = safeStorage.getItem(`${LOCAL_USER_PROFILE_KEY}${uid}`);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    console.warn("Firestore getUserProfile fallback to cache:", err);
    const cached = safeStorage.getItem(`${LOCAL_USER_PROFILE_KEY}${uid}`);
    return cached ? JSON.parse(cached) : null;
  }
}

export async function updateUserProfile(
  uid: string,
  data: Partial<FirestoreUserProfile>
): Promise<FirestoreUserProfile> {
  if (!uid) throw new Error("User ID is required for profile update");

  const userRef = doc(db, "users", uid);
  const now = new Date().toISOString();

  const payload: Record<string, any> = {
    ...data,
    updatedAt: now,
  };

  // Strip undefined values to avoid Firestore errors
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  await setDoc(userRef, payload, { merge: true });

  // Update local cache
  const updatedSnap = await getDoc(userRef);
  const updatedData = updatedSnap.exists() ? (updatedSnap.data() as FirestoreUserProfile) : { uid, ...payload } as FirestoreUserProfile;
  safeStorage.setItem(`${LOCAL_USER_PROFILE_KEY}${uid}`, JSON.stringify(updatedData));
  
  return updatedData;
}

export async function syncUserProfile(user: {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}): Promise<FirestoreUserProfile> {
  const initials =
    (user.displayName
      ? user.displayName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : user.email?.slice(0, 2).toUpperCase()) || "MA";

  try {
    const userRef = doc(db, "users", user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as FirestoreUserProfile;
      const merged: FirestoreUserProfile = {
        ...data,
        uid: user.uid,
        email: user.email || data.email || "",
        displayName: user.displayName || data.displayName || "Créateur Mansa",
        avatarInitials: data.avatarInitials || initials,
        photoURL: user.photoURL || data.photoURL,
        country: data.country || "Côte d'Ivoire",
        currency: data.currency || "XOF",
      };
      safeStorage.setItem(`${LOCAL_USER_PROFILE_KEY}${user.uid}`, JSON.stringify(merged));
      return merged;
    }

    const newProfile: FirestoreUserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Créateur Mansa",
      avatarInitials: initials,
      photoURL: user.photoURL || undefined,
      country: "Côte d'Ivoire",
      currency: "XOF",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setDoc(userRef, newProfile);
    safeStorage.setItem(`${LOCAL_USER_PROFILE_KEY}${user.uid}`, JSON.stringify(newProfile));
    return newProfile;
  } catch (err) {
    console.warn("Firestore sync fallback to local:", err);
    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || user.email?.split("@")[0] || "Créateur Mansa",
      avatarInitials: initials,
      photoURL: user.photoURL || undefined,
      country: "Côte d'Ivoire",
      currency: "XOF",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
}

// ----------------- PRODUCTS (REAL FIRESTORE & CACHE) -----------------
export async function getCreatorProducts(creatorId: string): Promise<BusinessProject[]> {
  const localList = getLocalItems<BusinessProject>(LOCAL_PRODUCTS_KEY).filter(
    (p) => !p.id.startsWith("remote-") || p.id.includes(creatorId)
  );

  try {
    const q = query(collection(db, "products"), where("creatorId", "==", creatorId));
    const querySnapshot = await getDocs(q);
    const products: BusinessProject[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreProduct;
      products.push({
        id: docSnap.id,
        name: data.name,
        tagline: data.tagline || data.description || "",
        category: data.category || "community",
        pricingAmount: data.pricingAmount || 0,
        pricingModel: data.pricingModel || "subscription",
        currency: data.currency || "XOF",
        targetAudience: data.targetAudience || "Membres & Clients",
        status: data.status || "active",
        features: data.features || [],
        techStack: data.techStack || ["Mansa Mobile Money", "Paiement Instantané"],
        estimatedMonthlyRevenue: data.estimatedMonthlyRevenue || (data.pricingAmount || 0) * (data.membersCount || 0),
        affiliateCommissionRate: data.affiliateCommissionRate || 30,
        membersCount: data.membersCount || 0,
        conversionRate: data.conversionRate || "0%",
        createdAt: data.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: data.updatedAt || new Date().toISOString().split("T")[0],
        apps: data.apps || [],
        storeUrl: data.storeUrl || `mansa.af/p/${docSnap.id}`,
      });
    });

    // Merge and deduplicate by id
    const combined = [...products];
    for (const item of localList) {
      if (!combined.some((c) => c.id === item.id)) {
        combined.unshift(item);
      }
    }
    return combined;
  } catch (error) {
    console.warn("Error fetching products, returning local cache:", error);
    return localList;
  }
}

export function subscribeToCreatorProducts(
  creatorId: string,
  callback: (products: BusinessProject[]) => void
) {
  // Emit initial local products right away
  const initialLocal = getLocalItems<BusinessProject>(LOCAL_PRODUCTS_KEY);
  callback(initialLocal);

  try {
    const q = query(collection(db, "products"), where("creatorId", "==", creatorId));
    return onSnapshot(
      q,
      (querySnapshot) => {
        const remoteProducts: BusinessProject[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data() as FirestoreProduct;
          remoteProducts.push({
            id: docSnap.id,
            name: data.name,
            tagline: data.tagline || data.description || "",
            category: data.category || "community",
            pricingAmount: data.pricingAmount || 0,
            pricingModel: data.pricingModel || "subscription",
            currency: data.currency || "XOF",
            targetAudience: data.targetAudience || "Membres & Clients",
            status: data.status || "active",
            features: data.features || [],
            techStack: data.techStack || ["Mansa Mobile Money", "Paiement Instantané"],
            estimatedMonthlyRevenue: data.estimatedMonthlyRevenue || (data.pricingAmount || 0) * (data.membersCount || 0),
            affiliateCommissionRate: data.affiliateCommissionRate || 30,
            membersCount: data.membersCount || 0,
            conversionRate: data.conversionRate || "0%",
            createdAt: data.createdAt || new Date().toISOString().split("T")[0],
            updatedAt: data.updatedAt || new Date().toISOString().split("T")[0],
            apps: data.apps || [],
            storeUrl: data.storeUrl || `mansa.af/p/${docSnap.id}`,
          });
        });

        const currentLocal = getLocalItems<BusinessProject>(LOCAL_PRODUCTS_KEY);
        const combined = [...remoteProducts];
        for (const item of currentLocal) {
          if (!combined.some((c) => c.id === item.id)) {
            combined.unshift(item);
          }
        }
        callback(combined);
      },
      (err) => {
        console.warn("Products snapshot error, using local items:", err);
        callback(getLocalItems<BusinessProject>(LOCAL_PRODUCTS_KEY));
      }
    );
  } catch (e) {
    console.warn("Failed to attach products snapshot, relying on local cache:", e);
    return () => {};
  }
}

export async function saveProductToFirestore(
  creatorId: string,
  creatorEmail: string,
  creatorName: string,
  productData: {
    id?: string;
    name: string;
    description?: string;
    category?: string;
    priceAmount: number;
    pricingType?: "free" | "paid";
    billingCycle?: string;
    currency: string;
    includedApps: string[];
    affiliateRate?: number;
    productUrl?: string;
    coverImage?: string;
    companyId?: string;
    companyName?: string;
  }
): Promise<string> {
  const productId = productData.id && !productData.id.startsWith("proj-temp-")
    ? productData.id
    : "prod-" + Math.random().toString(36).substring(2, 9);

  const newProject: BusinessProject = {
    id: productId,
    name: productData.name,
    tagline: productData.description || "Offre digitale exclusive",
    category: (productData.category as any) || "community",
    pricingAmount: productData.priceAmount,
    pricingModel: productData.billingCycle === "one_time" ? "one_time" : "subscription",
    currency: productData.currency || "XOF",
    targetAudience: "Abonnés et Acheteurs",
    status: "active",
    features: [
      `Applications : ${productData.includedApps.join(", ") || "Accès Privé"}`,
      "Paiement Mobile Money (Wave, Orange, MTN, Moov) & Carte",
      "Délivrance instantanée 24/7",
    ],
    techStack: ["Mansa Engine v2", "Mobile Money Multi-Gateway"],
    estimatedMonthlyRevenue: 0,
    affiliateCommissionRate: productData.affiliateRate || 25,
    membersCount: 0,
    conversionRate: "0%",
    apps: productData.includedApps,
    storeUrl: productData.productUrl || `mansa.af/p/${productId}`,
    companyId: productData.companyId || "",
    companyName: productData.companyName || "",
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: new Date().toISOString().split("T")[0],
  };

  // 1. Instantly update local cache
  const localList = getLocalItems<BusinessProject>(LOCAL_PRODUCTS_KEY);
  const existingIdx = localList.findIndex((p) => p.id === productId);
  if (existingIdx >= 0) {
    localList[existingIdx] = newProject;
  } else {
    localList.unshift(newProject);
  }
  saveLocalItems(LOCAL_PRODUCTS_KEY, localList);

  // 2. Persist to Firestore
  try {
    const docRef = doc(db, "products", productId);
    const payload: FirestoreProduct = {
      id: productId,
      creatorId,
      creatorEmail,
      creatorName,
      name: productData.name,
      tagline: productData.description || "",
      description: productData.description || "",
      category: productData.category || "community",
      pricingAmount: productData.priceAmount,
      pricingModel: productData.billingCycle === "one_time" ? "one_time" : "subscription",
      currency: productData.currency || "XOF",
      targetAudience: "Abonnés et Acheteurs",
      status: "active",
      features: newProject.features,
      techStack: newProject.techStack,
      estimatedMonthlyRevenue: 0,
      affiliateCommissionRate: productData.affiliateRate || 25,
      membersCount: 0,
      conversionRate: "0%",
      apps: productData.includedApps,
      storeUrl: productData.productUrl || `mansa.af/p/${productId}`,
      coverImage: productData.coverImage,
      companyId: productData.companyId || "",
      companyName: productData.companyName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (err) {
    console.warn("Firestore save warning (persisted locally):", err);
  }

  return productId;
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  const localList = getLocalItems<BusinessProject>(LOCAL_PRODUCTS_KEY).filter((p) => p.id !== productId);
  saveLocalItems(LOCAL_PRODUCTS_KEY, localList);
  try {
    await deleteDoc(doc(db, "products", productId));
  } catch (err) {
    console.warn("Firestore delete warning (removed locally):", err);
  }
}

// ----------------- TRANSACTIONS (REAL FIRESTORE & CACHE) -----------------
export async function getCreatorTransactions(creatorId: string): Promise<FirestoreTransaction[]> {
  const localList = getLocalItems<FirestoreTransaction>(LOCAL_TRANSACTIONS_KEY);
  try {
    const q = query(
      collection(db, "transactions"),
      where("creatorId", "==", creatorId),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    const list: FirestoreTransaction[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
    
    const combined = [...list];
    for (const t of localList) {
      if (!combined.some((c) => c.id === t.id)) {
        combined.unshift(t);
      }
    }
    return combined;
  } catch (error) {
    return localList;
  }
}

export function subscribeToCreatorTransactions(
  creatorId: string,
  callback: (transactions: FirestoreTransaction[]) => void
) {
  const localList = getLocalItems<FirestoreTransaction>(LOCAL_TRANSACTIONS_KEY);
  callback(localList);

  try {
    const q = query(
      collection(db, "transactions"),
      where("creatorId", "==", creatorId),
      limit(50)
    );
    return onSnapshot(
      q,
      (snap) => {
        const list: FirestoreTransaction[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        const currentLocal = getLocalItems<FirestoreTransaction>(LOCAL_TRANSACTIONS_KEY);
        const combined = [...list];
        for (const t of currentLocal) {
          if (!combined.some((c) => c.id === t.id)) {
            combined.unshift(t);
          }
        }
        callback(combined);
      },
      (err) => {
        console.warn("Transactions listener warning, using local cache:", err);
        callback(getLocalItems<FirestoreTransaction>(LOCAL_TRANSACTIONS_KEY));
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function createRealTransaction(
  creatorId: string,
  data: {
    buyerName: string;
    buyerEmail: string;
    buyerLocation: string;
    productName: string;
    productId: string;
    amount: string;
    amountNumber: number;
    currency: string;
    paymentMethod: string;
  }
): Promise<string> {
  const txId = "tx-" + Math.random().toString(36).substring(2, 9);
  const txObj: FirestoreTransaction = {
    id: txId,
    creatorId,
    ...data,
    status: "completed",
    createdAt: new Date().toISOString(),
  };

  // 1. Update local cache
  const localList = getLocalItems<FirestoreTransaction>(LOCAL_TRANSACTIONS_KEY);
  localList.unshift(txObj);
  saveLocalItems(LOCAL_TRANSACTIONS_KEY, localList);

  // 2. Also register customer locally
  const custId = "cust-" + Math.random().toString(36).substring(2, 9);
  const custObj: FirestoreCustomer = {
    id: custId,
    creatorId,
    name: data.buyerName,
    email: data.buyerEmail,
    country: data.buyerLocation,
    countryName: data.buyerLocation,
    countryFlag: data.buyerLocation?.includes("Sénégal") ? "🇸🇳" : "🇨🇮",
    productName: data.productName,
    productId: data.productId,
    amountSpent: data.amount,
    totalSpent: data.amountNumber,
    totalSpentFormatted: data.amount,
    currency: data.currency,
    status: "active",
    joinedAt: new Date().toISOString().split("T")[0],
    joinedDate: new Date().toLocaleDateString("fr-FR"),
  };
  const custs = getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY);
  custs.unshift(custObj);
  saveLocalItems(LOCAL_CUSTOMERS_KEY, custs);

  // 3. Persist to Firestore
  try {
    await addDoc(collection(db, "transactions"), txObj);
    await addDoc(collection(db, "customers"), custObj);
  } catch (err) {
    console.warn("Firestore transaction save warning (persisted locally):", err);
  }

  return txId;
}

// ----------------- CUSTOMERS (REAL FIRESTORE & CACHE) -----------------
export async function getCreatorCustomers(creatorId: string): Promise<FirestoreCustomer[]> {
  const localList = getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY);
  try {
    const q = query(collection(db, "customers"), where("creatorId", "==", creatorId), limit(100));
    const snap = await getDocs(q);
    const list: FirestoreCustomer[] = [];
    snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
    const combined = [...list];
    for (const c of localList) {
      if (!combined.some((item) => item.id === c.id)) {
        combined.unshift(c);
      }
    }
    return combined;
  } catch (error) {
    return localList;
  }
}

export function subscribeToCreatorCustomers(
  creatorId: string,
  callback: (customers: FirestoreCustomer[]) => void
) {
  const localList = getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY);
  callback(localList);

  try {
    const q = query(collection(db, "customers"), where("creatorId", "==", creatorId), limit(100));
    return onSnapshot(
      q,
      (snap) => {
        const list: FirestoreCustomer[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        const currentLocal = getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY);
        const combined = [...list];
        for (const c of currentLocal) {
          if (!combined.some((item) => item.id === c.id)) {
            combined.unshift(c);
          }
        }
        callback(combined);
      },
      (err) => {
        console.warn("Customers listener warning, using local cache:", err);
        callback(getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY));
      }
    );
  } catch (e) {
    return () => {};
  }
}

export async function createRealCustomer(
  creatorId: string,
  data: {
    name: string;
    email: string;
    productName: string;
    productId?: string;
    totalSpent?: number;
    totalSpentFormatted?: string;
    countryFlag?: string;
    countryName?: string;
    status?: "active" | "cancelled" | "trial" | "past_due";
  }
): Promise<string> {
  const custId = "cust-" + Math.random().toString(36).substring(2, 9);
  const custObj: FirestoreCustomer = {
    id: custId,
    creatorId,
    name: data.name,
    email: data.email,
    productName: data.productName,
    productId: data.productId || "",
    totalSpent: data.totalSpent || 0,
    totalSpentFormatted: data.totalSpentFormatted || "0 FCFA",
    countryFlag: data.countryFlag || "🇨🇮",
    countryName: data.countryName || "Côte d'Ivoire",
    country: data.countryName || "Côte d'Ivoire",
    status: data.status || "active",
    joinedAt: new Date().toISOString().split("T")[0],
    joinedDate: new Date().toLocaleDateString("fr-FR"),
  };

  const localList = getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY);
  localList.unshift(custObj);
  saveLocalItems(LOCAL_CUSTOMERS_KEY, localList);

  try {
    await addDoc(collection(db, "customers"), custObj);
  } catch (err) {
    console.warn("Firestore customer save warning (persisted locally):", err);
  }

  return custId;
}

export async function deleteCustomerFromFirestore(customerId: string): Promise<void> {
  const localList = getLocalItems<FirestoreCustomer>(LOCAL_CUSTOMERS_KEY).filter((c) => c.id !== customerId);
  saveLocalItems(LOCAL_CUSTOMERS_KEY, localList);
  try {
    await deleteDoc(doc(db, "customers", customerId));
  } catch (err) {
    console.warn("Firestore delete warning (removed locally):", err);
  }
}

// ----------------- PUBLIC PRODUCTS / MARKETPLACE (REAL FIRESTORE) -----------------
export async function getPublicProducts(): Promise<BusinessProject[]> {
  try {
    const q = query(collection(db, "products"), where("status", "==", "active"), limit(20));
    const querySnapshot = await getDocs(q);
    const products: BusinessProject[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreProduct;
      products.push({
        id: docSnap.id,
        name: data.name,
        tagline: data.tagline || data.description || "",
        category: data.category || "community",
        pricingAmount: data.pricingAmount || 0,
        pricingModel: data.pricingModel || "subscription",
        currency: data.currency || "XOF",
        targetAudience: data.targetAudience || "Membres & Clients",
        status: data.status || "active",
        features: data.features || [],
        techStack: data.techStack || ["Mansa Mobile Money"],
        estimatedMonthlyRevenue: data.estimatedMonthlyRevenue || 0,
        affiliateCommissionRate: data.affiliateCommissionRate || 20,
        membersCount: data.membersCount || 0,
        conversionRate: data.conversionRate || "0%",
        createdAt: data.createdAt || new Date().toISOString().split("T")[0],
        updatedAt: data.updatedAt || new Date().toISOString().split("T")[0],
        apps: data.apps || [],
        storeUrl: data.storeUrl || `mansa.af/p/${docSnap.id}`,
      });
    });

    return products;
  } catch (error) {
    console.error("Error fetching public products:", error);
    return [];
  }
}

// ----------------- WORKFORCE & TEAM (REAL FIRESTORE & CACHE) -----------------
export async function getCreatorWorkforce(creatorId: string): Promise<FirestoreWorkforceMember[]> {
  if (!creatorId) return [];
  const localList = getLocalItems<FirestoreWorkforceMember>(LOCAL_WORKFORCE_KEY).filter(
    (w) => w.creatorId === creatorId
  );

  try {
    const q = query(collection(db, "workforce"), where("creatorId", "==", creatorId));
    const querySnapshot = await getDocs(q);
    const members: FirestoreWorkforceMember[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestoreWorkforceMember;
      members.push({
        ...data,
        id: docSnap.id,
      });
    });

    if (members.length > 0) {
      saveLocalItems(LOCAL_WORKFORCE_KEY, members);
      return members;
    }
    return localList;
  } catch (err) {
    console.warn("Firestore getCreatorWorkforce fallback to cache:", err);
    return localList;
  }
}

export async function saveWorkforceMemberToFirestore(
  creatorId: string,
  memberData: Omit<FirestoreWorkforceMember, "id" | "creatorId" | "createdAt"> & { id?: string }
): Promise<string> {
  const memberId = memberData.id || `worker-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const memberObj: FirestoreWorkforceMember = {
    id: memberId,
    creatorId,
    name: memberData.name,
    role: memberData.role,
    rate: memberData.rate,
    avatar: memberData.avatar || memberData.name.slice(0, 2).toUpperCase(),
    status: memberData.status || "active",
    tasksCompleted: memberData.tasksCompleted || 0,
    rating: memberData.rating || 5.0,
    createdAt: now,
  };

  // Update local cache
  const localList = getLocalItems<FirestoreWorkforceMember>(LOCAL_WORKFORCE_KEY);
  const existingIdx = localList.findIndex((w) => w.id === memberId);
  if (existingIdx >= 0) {
    localList[existingIdx] = memberObj;
  } else {
    localList.unshift(memberObj);
  }
  saveLocalItems(LOCAL_WORKFORCE_KEY, localList);

  // Real Firestore write
  try {
    const docRef = doc(db, "workforce", memberId);
    await setDoc(docRef, memberObj);
  } catch (err) {
    console.warn("Firestore saveWorkforceMember warning (persisted locally):", err);
  }

  return memberId;
}

export async function deleteWorkforceMemberFromFirestore(memberId: string): Promise<void> {
  const localList = getLocalItems<FirestoreWorkforceMember>(LOCAL_WORKFORCE_KEY).filter((w) => w.id !== memberId);
  saveLocalItems(LOCAL_WORKFORCE_KEY, localList);

  try {
    await deleteDoc(doc(db, "workforce", memberId));
  } catch (err) {
    console.warn("Firestore deleteWorkforceMember warning:", err);
  }
}

// ----------------- PARTNERS & B2B DEALS (REAL FIRESTORE & CACHE) -----------------
export async function getCreatorPartners(creatorId: string): Promise<FirestorePartnerDeal[]> {
  if (!creatorId) return [];
  const localList = getLocalItems<FirestorePartnerDeal>(LOCAL_PARTNERS_KEY).filter(
    (d) => d.creatorId === creatorId
  );

  try {
    const q = query(collection(db, "partners"), where("creatorId", "==", creatorId));
    const querySnapshot = await getDocs(q);
    const deals: FirestorePartnerDeal[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as FirestorePartnerDeal;
      deals.push({
        ...data,
        id: docSnap.id,
      });
    });

    if (deals.length > 0) {
      saveLocalItems(LOCAL_PARTNERS_KEY, deals);
      return deals;
    }
    return localList;
  } catch (err) {
    console.warn("Firestore getCreatorPartners fallback to cache:", err);
    return localList;
  }
}

export async function savePartnerDealToFirestore(
  creatorId: string,
  dealData: Omit<FirestorePartnerDeal, "id" | "creatorId" | "createdAt"> & { id?: string }
): Promise<string> {
  const dealId = dealData.id || `deal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const dealObj: FirestorePartnerDeal = {
    id: dealId,
    creatorId,
    partnerName: dealData.partnerName,
    partnerLogo: dealData.partnerLogo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    partnerHandle: dealData.partnerHandle || `@${dealData.partnerName.toLowerCase().replace(/\s+/g, "_")}`,
    type: dealData.type,
    typeLabel: dealData.typeLabel,
    description: dealData.description,
    contactEmail: dealData.contactEmail,
    status: dealData.status || "proposed",
    value: dealData.value || "En négociation",
    reach: dealData.reach || "Portée estimée 10k+",
    startDate: dealData.startDate || "Aujourd'hui",
    createdAt: now,
  };

  // Update local cache
  const localList = getLocalItems<FirestorePartnerDeal>(LOCAL_PARTNERS_KEY);
  const existingIdx = localList.findIndex((d) => d.id === dealId);
  if (existingIdx >= 0) {
    localList[existingIdx] = dealObj;
  } else {
    localList.unshift(dealObj);
  }
  saveLocalItems(LOCAL_PARTNERS_KEY, localList);

  // Real Firestore write
  try {
    const docRef = doc(db, "partners", dealId);
    await setDoc(docRef, dealObj);
  } catch (err) {
    console.warn("Firestore savePartnerDeal warning (persisted locally):", err);
  }

  return dealId;
}

export async function deletePartnerDealFromFirestore(dealId: string): Promise<void> {
  const localList = getLocalItems<FirestorePartnerDeal>(LOCAL_PARTNERS_KEY).filter((d) => d.id !== dealId);
  saveLocalItems(LOCAL_PARTNERS_KEY, localList);

  try {
    await deleteDoc(doc(db, "partners", dealId));
  } catch (err) {
    console.warn("Firestore deletePartnerDeal warning:", err);
  }
}

// ----------------- DEMO DATA SIMULATION (REAL FIRESTORE & CACHE) -----------------
export interface SeedResult {
  productsCount: number;
  transactionsCount: number;
  customersCount: number;
  workforceCount: number;
  partnersCount: number;
  totalRevenue: number;
}

export async function seedRealisticDemoData(
  creatorId: string,
  creatorEmail: string = "createur@mansa.af",
  creatorName: string = "Créateur Mansa"
): Promise<SeedResult> {
  const now = new Date();

  // 1. Five high-performing realistic products associated with specific creator companies
  const demoProducts: BusinessProject[] = [
    {
      id: "prod-forex-elite",
      name: "Club VIP Forex & Crypto Afrique",
      tagline: "Signaux quotidiens, analyses macro-économiques & canal Telegram VIP privé",
      category: "trading",
      pricingAmount: 25000,
      pricingModel: "subscription",
      currency: "XOF",
      targetAudience: "Traders et investisseurs d'Afrique francophone",
      status: "active",
      companyId: "comp-cadre-financier",
      companyName: "Cadre financier",
      features: [
        "Canal privé Telegram VIP accessible en continu",
        "3 à 5 signaux de trading Forex/Gold vérifiés par jour",
        "Live Zoom de coaching chaque dimanche à 20h GMT",
        "Délivrance de pass instantané après paiement Mobile Money",
      ],
      techStack: ["Mansa Engine v2", "Wave / Orange Money Bot", "Telegram VIP Gatekeeper"],
      estimatedMonthlyRevenue: 3550000,
      affiliateCommissionRate: 25,
      membersCount: 142,
      conversionRate: "4.8%",
      apps: ["Telegram VIP", "Live Coaching", "Mansa Checkout"],
      storeUrl: "mansa.af/p/forex-elite-afrique",
      coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString().split("T")[0],
      updatedAt: now.toISOString().split("T")[0],
    },
    {
      id: "prod-ecommerce-mastery",
      name: "Masterclass E-Commerce & Logistique UEMOA",
      tagline: "Formation complète, sourcing fournisseurs locaux et automatisation TikTok Ads",
      category: "courses",
      pricingAmount: 45000,
      pricingModel: "one_time",
      currency: "XOF",
      targetAudience: "Porteurs de projets et e-commerçants locaux",
      status: "active",
      companyId: "comp-mansa-ventures",
      companyName: "Mansa Capital Ventures",
      features: [
        "+12 heures de cours vidéo pas-à-pas en streaming",
        "Carnet d'adresses de 80 fournisseurs locaux vérifiés (Abidjan, Dakar, Douala)",
        "Modèles de fiches produits & scripts publicitaires qui convertissent",
        "Mises à jour annuelles et groupe WhatsApp réservé",
      ],
      techStack: ["Mansa Video Stream", "Wave / MTN Multi-Gateway", "PDF Watermarking"],
      estimatedMonthlyRevenue: 4005000,
      affiliateCommissionRate: 30,
      membersCount: 89,
      conversionRate: "5.2%",
      apps: ["Formations Vidéo", "Ressources & Fournisseurs", "Accès Membre"],
      storeUrl: "mansa.af/p/ecommerce-mastery-uemoa",
      coverImage: "https://images.unsplash.com/photo-1556742049-0a67e5572293?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date(now.getTime() - 40 * 86400000).toISOString().split("T")[0],
      updatedAt: now.toISOString().split("T")[0],
    },
    {
      id: "prod-canva-templates",
      name: "Pack 500+ Templates Canva & Publicités TikTok",
      tagline: "Bannières, carrousels Instagram & vidéos publicitaires prêtes à l'emploi",
      category: "software",
      pricingAmount: 10000,
      pricingModel: "one_time",
      currency: "XOF",
      targetAudience: "Créateurs de contenu, agences et commerçants",
      status: "active",
      companyId: "comp-studio-dakar",
      companyName: "Studio Digital Dakar",
      features: [
        "+500 modèles Canva modifiables en 1 clic",
        "Bannières produits & bannières promotions Mobile Money",
        "Animations TikTok / Reels prédécoupées",
        "Licence commerciale illimitée",
      ],
      techStack: ["Mansa Cloud Delivery", "Canva Direct Import"],
      estimatedMonthlyRevenue: 3100000,
      affiliateCommissionRate: 40,
      membersCount: 310,
      conversionRate: "7.1%",
      apps: ["Téléchargement Immédiat", "Mise à jour à vie"],
      storeUrl: "mansa.af/p/canva-pack-afrique",
      coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date(now.getTime() - 35 * 86400000).toISOString().split("T")[0],
      updatedAt: now.toISOString().split("T")[0],
    },
    {
      id: "prod-nocode-ia",
      name: "Académie No-Code & IA pour Créateurs",
      tagline: "Créez des applications rentables et automatisez vos ventes avec Gemini & Make",
      category: "community",
      pricingAmount: 35000,
      pricingModel: "subscription",
      currency: "XOF",
      targetAudience: "Développeurs No-Code, freelances et créateurs",
      status: "active",
      companyId: "comp-mansa-ventures",
      companyName: "Mansa Capital Ventures",
      features: [
        "Salon Discord VIP et entraide quotidienne entre membres",
        "Blueprints Make & n8n pour automatiser les webhooks Mobile Money",
        "Bibliothèque de prompts Gemini spécialisés business",
        "Webinaire bimensuel en direct avec des experts",
      ],
      techStack: ["Mansa Automation Engine", "Discord VIP Gatekeeper", "Gemini API"],
      estimatedMonthlyRevenue: 2590000,
      affiliateCommissionRate: 20,
      membersCount: 74,
      conversionRate: "3.9%",
      apps: ["Discord VIP", "Formations NoCode", "Webhooks Bot"],
      storeUrl: "mansa.af/p/nocode-ia-academy",
      coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date(now.getTime() - 25 * 86400000).toISOString().split("T")[0],
      updatedAt: now.toISOString().split("T")[0],
    },
    {
      id: "prod-growth-ebook",
      name: "Ebook Growth Hacking Mobile Money 2026",
      tagline: "Les stratégies secrètes pour multiplier vos ventes digitales en Afrique francophone",
      category: "courses",
      pricingAmount: 15000,
      pricingModel: "one_time",
      currency: "XOF",
      targetAudience: "Infopreneurs et solopreneurs africains",
      status: "active",
      companyId: "comp-cadre-financier",
      companyName: "Cadre financier",
      features: [
        "Guide PDF complet de 180 pages illustrées",
        "Funnels de vente WhatsApp Business prêts à copier",
        "Études de cas réelles de boutiques à +10M FCFA/mois",
        "Checklist opérationnelle de lancement en 7 jours",
      ],
      techStack: ["Mansa Vault PDF", "Mobile Money Multi-Gateway"],
      estimatedMonthlyRevenue: 2700000,
      affiliateCommissionRate: 35,
      membersCount: 180,
      conversionRate: "6.4%",
      apps: ["E-book PDF", "Templates Notions"],
      storeUrl: "mansa.af/p/growth-hacking-mobile-money",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString().split("T")[0],
      updatedAt: now.toISOString().split("T")[0],
    },
  ];

  // 2. Twenty-four realistic transactions distributed over 30 days
  const txDefs = [
    { daysAgo: 0, hoursAgo: 1, buyerName: "Amadou Diallo", buyerEmail: "amadou.diallo@gmail.com", buyerLocation: "Abidjan, Côte d'Ivoire", prodIndex: 0, method: "Wave CI" },
    { daysAgo: 0, hoursAgo: 4, buyerName: "Fatou Sow", buyerEmail: "fatou.sow@orange.sn", buyerLocation: "Dakar, Sénégal", prodIndex: 1, method: "Orange Money SN" },
    { daysAgo: 1, hoursAgo: 2, buyerName: "Koffi Kouamé", buyerEmail: "koffi.k@yahoo.fr", buyerLocation: "Yamoussoukro, Côte d'Ivoire", prodIndex: 2, method: "MTN MoMo CI" },
    { daysAgo: 1, hoursAgo: 6, buyerName: "Amina Ndiaye", buyerEmail: "amina.ndiaye@gmail.com", buyerLocation: "Saint-Louis, Sénégal", prodIndex: 3, method: "Wave SN" },
    { daysAgo: 2, hoursAgo: 3, buyerName: "Cedric Kamga", buyerEmail: "c.kamga@outlook.com", buyerLocation: "Douala, Cameroun", prodIndex: 4, method: "Orange Money CM" },
    { daysAgo: 3, hoursAgo: 5, buyerName: "Jean-Marc Tano", buyerEmail: "jm.tano@gmail.com", buyerLocation: "Abidjan, Côte d'Ivoire", prodIndex: 0, method: "Wave CI" },
    { daysAgo: 4, hoursAgo: 2, buyerName: "Mariam Traoré", buyerEmail: "mariam.traore@africamail.com", buyerLocation: "Bamako, Mali", prodIndex: 2, method: "Orange Money ML" },
    { daysAgo: 5, hoursAgo: 8, buyerName: "Ibrahim Touré", buyerEmail: "i.toure@gmail.com", buyerLocation: "Cotonou, Bénin", prodIndex: 1, method: "MTN MoMo BJ" },
    { daysAgo: 6, hoursAgo: 4, buyerName: "Estelle Bationo", buyerEmail: "estelle.b@yahoo.fr", buyerLocation: "Ouagadougou, Burkina Faso", prodIndex: 4, method: "Orange Money BF" },
    { daysAgo: 7, hoursAgo: 7, buyerName: "Yannick Ndong", buyerEmail: "yannick.ndong@gmail.com", buyerLocation: "Libreville, Gabon", prodIndex: 0, method: "Airtel GA" },
    { daysAgo: 9, hoursAgo: 1, buyerName: "Sarah Benjelloun", buyerEmail: "sarah.benjelloun@gmail.com", buyerLocation: "Casablanca, Maroc", prodIndex: 3, method: "Carte Bancaire Visa" },
    { daysAgo: 11, hoursAgo: 3, buyerName: "David Mensah", buyerEmail: "david.mensah@ghanapost.com", buyerLocation: "Accra, Ghana", prodIndex: 2, method: "MTN Mobile Money GH" },
    { daysAgo: 12, hoursAgo: 9, buyerName: "Fatoumata Bamba", buyerEmail: "fatou.bamba@ci-net.com", buyerLocation: "Bouaké, Côte d'Ivoire", prodIndex: 0, method: "Moov Money CI" },
    { daysAgo: 14, hoursAgo: 2, buyerName: "Kevin Diallo", buyerEmail: "kevin.diallo@diaspora.fr", buyerLocation: "Paris, France", prodIndex: 1, method: "Carte Bancaire Mastercard" },
    { daysAgo: 15, hoursAgo: 5, buyerName: "Aïcha Koné", buyerEmail: "aicha.kone@gmail.com", buyerLocation: "San Pedro, Côte d'Ivoire", prodIndex: 4, method: "Wave CI" },
    { daysAgo: 17, hoursAgo: 4, buyerName: "Moussa Cissé", buyerEmail: "moussa.cisse@free.sn", buyerLocation: "Dakar, Sénégal", prodIndex: 2, method: "Free Money SN" },
    { daysAgo: 19, hoursAgo: 7, buyerName: "Christian Mbarga", buyerEmail: "christian.mbarga@yahoo.cm", buyerLocation: "Yaoundé, Cameroun", prodIndex: 0, method: "MTN MoMo CM" },
    { daysAgo: 21, hoursAgo: 3, buyerName: "Ousmane Diarra", buyerEmail: "ousmane.diarra@gmail.com", buyerLocation: "Thiès, Sénégal", prodIndex: 3, method: "Wave SN" },
    { daysAgo: 23, hoursAgo: 6, buyerName: "Boris Agbodjan", buyerEmail: "boris.agbodjan@togo.tg", buyerLocation: "Lomé, Togo", prodIndex: 2, method: "T-Money TG" },
    { daysAgo: 24, hoursAgo: 4, buyerName: "Diane Kouassi", buyerEmail: "diane.kouassi@gmail.com", buyerLocation: "Korhogo, Côte d'Ivoire", prodIndex: 1, method: "Orange Money CI" },
    { daysAgo: 26, hoursAgo: 8, buyerName: "Marc-André Dupont", buyerEmail: "m.dupont@canada.ca", buyerLocation: "Montréal, Canada", prodIndex: 0, method: "Carte Bancaire" },
    { daysAgo: 27, hoursAgo: 5, buyerName: "Samuel Eto'o Jr", buyerEmail: "samuel.etoo@football.cm", buyerLocation: "Douala, Cameroun", prodIndex: 4, method: "Orange Money CM" },
    { daysAgo: 28, hoursAgo: 2, buyerName: "Bintou Camara", buyerEmail: "bintou.camara@gmail.com", buyerLocation: "Conakry, Guinée", prodIndex: 2, method: "Orange Money GN" },
    { daysAgo: 29, hoursAgo: 6, buyerName: "Landry Zongo", buyerEmail: "landry.zongo@faso.bf", buyerLocation: "Ouagadougou, Burkina Faso", prodIndex: 0, method: "Wave BF" },
  ];

  const demoTransactions: FirestoreTransaction[] = [];
  const demoCustomers: FirestoreCustomer[] = [];
  let totalRev = 0;

  txDefs.forEach((def, index) => {
    const prod = demoProducts[def.prodIndex];
    const txDate = new Date(now.getTime() - (def.daysAgo * 86400000 + def.hoursAgo * 3600000));
    const txId = `tx-demo-${index + 1}`;
    const custId = `cust-demo-${index + 1}`;

    const tx: FirestoreTransaction = {
      id: txId,
      creatorId,
      buyerName: def.buyerName,
      buyerEmail: def.buyerEmail,
      buyerLocation: def.buyerLocation,
      productName: prod.name,
      productId: prod.id,
      companyId: prod.companyId,
      companyName: prod.companyName,
      storeName: prod.companyName,
      type: "sale",
      amount: `${prod.pricingAmount.toLocaleString("fr-FR")} FCFA`,
      amountNumber: prod.pricingAmount,
      currency: "XOF",
      paymentMethod: def.method,
      status: "completed",
      createdAt: txDate.toISOString(),
      customerName: def.buyerName,
      customerEmail: def.buyerEmail,
    };

    demoTransactions.push(tx);
    totalRev += prod.pricingAmount;

    // Customer record
    const flag = def.buyerLocation.includes("Côte d'Ivoire")
      ? "🇨🇮"
      : def.buyerLocation.includes("Sénégal")
      ? "🇸🇳"
      : def.buyerLocation.includes("Cameroun")
      ? "🇨🇲"
      : def.buyerLocation.includes("Bénin")
      ? "🇧🇯"
      : def.buyerLocation.includes("Mali")
      ? "🇲🇱"
      : def.buyerLocation.includes("Burkina Faso")
      ? "🇧🇫"
      : def.buyerLocation.includes("Gabon")
      ? "🇬🇦"
      : def.buyerLocation.includes("Maroc")
      ? "🇲🇦"
      : def.buyerLocation.includes("Ghana")
      ? "🇬🇭"
      : def.buyerLocation.includes("Togo")
      ? "🇹🇬"
      : def.buyerLocation.includes("France")
      ? "🇫🇷"
      : def.buyerLocation.includes("Canada")
      ? "🇨🇦"
      : "🌍";

    const customerCountry = def.buyerLocation.split(",")[1]?.trim() || def.buyerLocation;

    demoCustomers.push({
      id: custId,
      creatorId,
      name: def.buyerName,
      email: def.buyerEmail,
      country: customerCountry,
      countryName: customerCountry,
      countryFlag: flag,
      productName: prod.name,
      productId: prod.id,
      amountSpent: `${prod.pricingAmount.toLocaleString("fr-FR")} FCFA`,
      totalSpent: prod.pricingAmount,
      totalSpentFormatted: `${prod.pricingAmount.toLocaleString("fr-FR")} FCFA`,
      currency: "XOF",
      status: index === 3 ? "trial" : index === 8 ? "cancelled" : "active",
      joinedAt: txDate.toISOString().split("T")[0],
      joinedDate: txDate.toLocaleDateString("fr-FR"),
      discordUsername: `${def.buyerName.toLowerCase().replace(/\s+/g, "_")}#${1000 + index}`,
    });
  });

  // Explicit Affiliate and Other Personal Revenues (for Global Personal Balance)
  const affiliateTx1: FirestoreTransaction = {
    id: "tx-aff-1",
    creatorId,
    buyerName: "Koffi Serge",
    buyerEmail: "koffi.serge@gmail.com",
    buyerLocation: "Abidjan, Côte d'Ivoire",
    productName: "Commission Affiliation · Nexus Scalper VIP",
    productId: "aff-prod-nexus",
    type: "affiliate",
    amount: "75 000 FCFA",
    amountNumber: 75000,
    currency: "XOF",
    paymentMethod: "Wave CI",
    status: "completed",
    createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    customerName: "Koffi Serge",
    customerEmail: "koffi.serge@gmail.com",
  };
  const affiliateTx2: FirestoreTransaction = {
    id: "tx-aff-2",
    creatorId,
    buyerName: "Ousmane Diallo",
    buyerEmail: "ousmane.d@yahoo.fr",
    buyerLocation: "Dakar, Sénégal",
    productName: "Commission Affiliation · Bot Telegram Alpha",
    productId: "aff-prod-alpha-bot",
    type: "affiliate",
    amount: "45 000 FCFA",
    amountNumber: 45000,
    currency: "XOF",
    paymentMethod: "Orange Money SN",
    status: "completed",
    createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
    customerName: "Ousmane Diallo",
    customerEmail: "ousmane.d@yahoo.fr",
  };
  const otherPlatformTx: FirestoreTransaction = {
    id: "tx-other-1",
    creatorId,
    buyerName: "Mansa Partner Fund",
    buyerEmail: "rewards@mansa.af",
    buyerLocation: "Paris, France",
    productName: "Bonus Performance Mansa Créateur",
    productId: "mansa-bonus-q1",
    type: "other",
    amount: "150 000 FCFA",
    amountNumber: 150000,
    currency: "XOF",
    paymentMethod: "Virement Direct",
    status: "completed",
    createdAt: new Date(now.getTime() - 7 * 86400000).toISOString(),
    customerName: "Mansa Partner Fund",
    customerEmail: "rewards@mansa.af",
  };
  demoTransactions.push(affiliateTx1, affiliateTx2, otherPlatformTx);
  totalRev += 75000 + 45000 + 150000;

  // 3. Realistic workforce team members
  const demoWorkforce: FirestoreWorkforceMember[] = [
    {
      id: "worker-demo-1",
      creatorId,
      name: "Kader Diop",
      role: "Modérateur Communauté VIP (Telegram & Discord)",
      rate: "350 $/mois",
      avatar: "KD",
      status: "active",
      tasksCompleted: 142,
      rating: 4.9,
      createdAt: new Date(now.getTime() - 60 * 86400000).toISOString(),
    },
    {
      id: "worker-demo-2",
      creatorId,
      name: "Aïcha Sanogo",
      role: "Rédactrice Contenus & Email Marketing",
      rate: "450 $/mois",
      avatar: "AS",
      status: "active",
      tasksCompleted: 88,
      rating: 5.0,
      createdAt: new Date(now.getTime() - 45 * 86400000).toISOString(),
    },
    {
      id: "worker-demo-3",
      creatorId,
      name: "Patrick Mbia",
      role: "Développeur Automatisation Webhooks Mansa",
      rate: "600 $/mois",
      avatar: "PM",
      status: "active",
      tasksCompleted: 64,
      rating: 4.8,
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
    {
      id: "worker-demo-4",
      creatorId,
      name: "Séphora Koffi",
      role: "Support Client & Réclamations Mobile Money",
      rate: "300 $/mois",
      avatar: "SK",
      status: "active",
      tasksCompleted: 210,
      rating: 4.9,
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
  ];

  // 4. Realistic B2B Partner deals
  const demoPartners: FirestorePartnerDeal[] = [
    {
      id: "deal-demo-1",
      creatorId,
      partnerName: "Wave Digital Finance",
      partnerLogo: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
      partnerHandle: "@wave_africa",
      type: "tech_integration",
      typeLabel: "Intégration Passerelle",
      description: "Partenariat officiel pour flux Mobile Money directs Wave CI & Wave SN avec 0% de frais sur les transferts créateurs.",
      contactEmail: "partners@wave.com",
      status: "active",
      value: "500 000+ créateurs",
      reach: "Portée UEMOA 15M+",
      startDate: "15 Jan 2026",
      createdAt: new Date(now.getTime() - 50 * 86400000).toISOString(),
    },
    {
      id: "deal-demo-2",
      creatorId,
      partnerName: "Orange Money Afrique",
      partnerLogo: "https://images.unsplash.com/photo-1579389083048-4e43abf16b20?w=100&auto=format&fit=crop&q=80",
      partnerHandle: "@orange_money_officiel",
      type: "co_branding",
      typeLabel: "Co-Branding & API",
      description: "Mise en avant sur le portail Orange Fab et activation des notifications push de facturation instantanée.",
      contactEmail: "partnerships@orange.com",
      status: "active",
      value: "1 200 000 clients",
      reach: "Côte d'Ivoire & Sénégal",
      startDate: "01 Fév 2026",
      createdAt: new Date(now.getTime() - 40 * 86400000).toISOString(),
    },
    {
      id: "deal-demo-3",
      creatorId,
      partnerName: "Canal+ Créateurs Afrique",
      partnerLogo: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=100&auto=format&fit=crop&q=80",
      partnerHandle: "@canalplus_creators",
      type: "sponsor",
      typeLabel: "Sponsor Médias",
      description: "Programme de bourses et d'amplification audiovisuelle pour les 10 meilleurs infopreneurs Mansa.",
      contactEmail: "creators@canalplus-afrique.com",
      status: "pending",
      value: "Bourse 5 000 000 FCFA",
      reach: "250 000 spectateurs",
      startDate: "Mars 2026",
      createdAt: new Date(now.getTime() - 20 * 86400000).toISOString(),
    },
    {
      id: "deal-demo-4",
      creatorId,
      partnerName: "Techstars Africa Alumni",
      partnerLogo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&auto=format&fit=crop&q=80",
      partnerHandle: "@techstars_africa",
      type: "cross_promo",
      typeLabel: "Cross-Promotion",
      description: "Échange de visibilité dans la newsletter Techstars et accès préférentiel aux événements d'investissement.",
      contactEmail: "alumni@techstars.com",
      status: "active",
      value: "Réseau 80k fondateurs",
      reach: "Afrique & Diaspora",
      startDate: "10 Jan 2026",
      createdAt: new Date(now.getTime() - 30 * 86400000).toISOString(),
    },
  ];

  // 1. Instantly save all into local cache
  saveLocalItems(LOCAL_PRODUCTS_KEY, demoProducts);
  saveLocalItems(LOCAL_TRANSACTIONS_KEY, demoTransactions);
  saveLocalItems(LOCAL_CUSTOMERS_KEY, demoCustomers);
  saveLocalItems(LOCAL_WORKFORCE_KEY, demoWorkforce);
  saveLocalItems(LOCAL_PARTNERS_KEY, demoPartners);

  // 2. Persist asynchronously in Firestore database
  try {
    const productPromises = demoProducts.map((p) => {
      const docRef = doc(db, "products", p.id);
      const payload: FirestoreProduct = {
        id: p.id,
        creatorId,
        creatorEmail,
        creatorName,
        name: p.name,
        tagline: p.tagline,
        description: p.tagline,
        category: p.category,
        pricingAmount: p.pricingAmount,
        pricingModel: p.pricingModel,
        currency: p.currency,
        targetAudience: p.targetAudience,
        status: p.status,
        features: p.features,
        techStack: p.techStack,
        estimatedMonthlyRevenue: p.estimatedMonthlyRevenue,
        affiliateCommissionRate: p.affiliateCommissionRate,
        membersCount: p.membersCount,
        conversionRate: p.conversionRate,
        apps: p.apps,
        storeUrl: p.storeUrl,
        coverImage: p.coverImage,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
      return setDoc(docRef, payload, { merge: true });
    });

    const txPromises = demoTransactions.map((tx) => {
      const docRef = doc(db, "transactions", tx.id);
      return setDoc(docRef, tx, { merge: true });
    });

    const custPromises = demoCustomers.map((cust) => {
      const docRef = doc(db, "customers", cust.id);
      return setDoc(docRef, cust, { merge: true });
    });

    const workerPromises = demoWorkforce.map((w) => {
      const docRef = doc(db, "workforce", w.id);
      return setDoc(docRef, w, { merge: true });
    });

    const partnerPromises = demoPartners.map((d) => {
      const docRef = doc(db, "partners", d.id);
      return setDoc(docRef, d, { merge: true });
    });

    await Promise.allSettled([
      ...productPromises,
      ...txPromises,
      ...custPromises,
      ...workerPromises,
      ...partnerPromises,
    ]);
  } catch (err) {
    console.warn("Firestore seed background write notice:", err);
  }

  // Trigger UI notification event
  try {
    window.dispatchEvent(
      new CustomEvent("mansa:demo-data-seeded", {
        detail: {
          products: demoProducts.length,
          transactions: demoTransactions.length,
          customers: demoCustomers.length,
          totalRevenue: totalRev,
        },
      })
    );
  } catch (e) {}

  return {
    productsCount: demoProducts.length,
    transactionsCount: demoTransactions.length,
    customersCount: demoCustomers.length,
    workforceCount: demoWorkforce.length,
    partnersCount: demoPartners.length,
    totalRevenue: totalRev,
  };
}

export async function clearRealisticDemoData(creatorId: string): Promise<void> {
  saveLocalItems(LOCAL_PRODUCTS_KEY, []);
  saveLocalItems(LOCAL_TRANSACTIONS_KEY, []);
  saveLocalItems(LOCAL_CUSTOMERS_KEY, []);
  saveLocalItems(LOCAL_WORKFORCE_KEY, []);
  saveLocalItems(LOCAL_PARTNERS_KEY, []);

  try {
    window.dispatchEvent(new CustomEvent("mansa:demo-data-cleared"));
  } catch (e) {}
}

