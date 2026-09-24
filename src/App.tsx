import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { LiveTickerSection } from "./components/LiveTickerSection";
import { BuildNextCarousel } from "./components/BuildNextCarousel";
import { MarketplaceSection } from "./components/MarketplaceSection";
import { SocialProofSection } from "./components/SocialProofSection";
import { FaqSection } from "./components/FaqSection";
import { Footer } from "./components/Footer";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { ProductCreationStudio, CreatedProductData } from "./components/ProductCreationStudio";
import { CategoryCardItem, MarketplaceItem, BusinessProject } from "./types";
import { Star, X, Check, ArrowRight, LayoutDashboard, Globe } from "lucide-react";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  detectUserLocationAndCurrency,
  getStoredCurrency,
  setStoredCurrency,
  formatCurrency,
  convertBetweenCurrencies,
} from "./utils/currency";
import { useAuth } from "./context/AuthContext";
import { saveProductToFirestore } from "./services/dbService";
import { ModalOverlay } from "./components/common/ModalOverlay";

export default function App() {
  const { user: authUser, profile, logout, signInAsDemo, loading: authLoading } = useAuth();
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [currentView, setCurrentView] = useState<"landing" | "login" | "dashboard">("landing");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  // User detected location and currency
  const initialAppCurrency = getStoredCurrency();
  const [userLocationInfo, setUserLocationInfo] = useState<{
    country: string;
    currency: CurrencyCode;
    currencySymbol: string;
  }>({
    country: "France",
    currency: initialAppCurrency,
    currencySymbol: SUPPORTED_CURRENCIES[initialAppCurrency]?.symbol || "$",
  });

  // State for Product Creation Studio modal
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioInitialCategory, setStudioInitialCategory] = useState<string | undefined>(undefined);
  const [selectedMarketplaceProduct, setSelectedMarketplaceProduct] = useState<MarketplaceItem | null>(null);

  // Global currency sync & location detection on mount
  useEffect(() => {
    const loc = detectUserLocationAndCurrency();
    const stored = getStoredCurrency();
    const activeCurr = stored || loc.currency;
    setUserLocationInfo({
      country: loc.countryName,
      currency: activeCurr,
      currencySymbol: SUPPORTED_CURRENCIES[activeCurr]?.symbol || "$",
    });

    const handleStorageCurrency = (e: any) => {
      const newCurr = (e.detail?.currency as CurrencyCode) || getStoredCurrency();
      if (newCurr && SUPPORTED_CURRENCIES[newCurr]) {
        setUserLocationInfo((prev) => ({
          ...prev,
          currency: newCurr,
          currencySymbol: SUPPORTED_CURRENCIES[newCurr]?.symbol || "$",
        }));
      }
    };

    window.addEventListener("mansa_currency_changed", handleStorageCurrency);
    return () => {
      window.removeEventListener("mansa_currency_changed", handleStorageCurrency);
    };
  }, []);

  const handleGlobalCurrencyChange = (newCurrency: CurrencyCode) => {
    setStoredCurrency(newCurrency);
    setUserLocationInfo((prev) => ({
      ...prev,
      currency: newCurrency,
      currencySymbol: SUPPORTED_CURRENCIES[newCurrency]?.symbol || "$",
    }));
  };

  // Sync current user with Firebase profile
  const currentUser = authUser && profile ? {
    uid: profile.uid,
    name: profile.displayName || authUser.displayName || "Créateur Mansa",
    email: profile.email || authUser.email || "",
    avatarInitials: profile.avatarInitials || "MA",
  } : null;

  const handleOpenStudio = (category?: string) => {
    // La landing reste publique, mais le studio et les actions métier nécessitent un compte.
    if (!currentUser) {
      setAuthMode("signup");
      setCurrentView("login");
      return;
    }

    setStudioInitialCategory(category);
    setIsStudioOpen(true);
  };

  const handleSaveProductFromStudio = async (product: CreatedProductData) => {
    const creatorId = profile?.uid || authUser?.uid || "user-temp";
    const creatorEmail = profile?.email || authUser?.email || "createur@mansa.af";
    const creatorName = profile?.displayName || authUser?.displayName || "Créateur Mansa";

    // Save directly to Firestore database with correct synchronized currency
    await saveProductToFirestore(creatorId, creatorEmail, creatorName, {
      id: product.id,
      name: product.name,
      description: product.description,
      category: "community",
      priceAmount: product.priceAmount,
      pricingType: product.pricingType,
      billingCycle: product.billingCycle,
      currency: product.currency || userLocationInfo.currency || "USD",
      includedApps: product.includedApps || ["Chat VIP", "Mansa Checkout"],
      affiliateRate: product.affiliateRate || 25,
      productUrl: product.productUrl,
      coverImage: product.imageUrl,
    });

    setIsStudioOpen(false);

    // Auto navigate to dashboard if on landing
    if (currentView !== "dashboard") {
      setCurrentView("dashboard");
    }
  };

  const handleSelectCategory = (cat: CategoryCardItem) => {
    handleOpenStudio(cat.categoryKey);
  };

  const handleOpenMarketplace = () => {
    if (currentView !== "landing") setCurrentView("landing");
    setTimeout(() => {
      const el = document.getElementById("marketplace");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const handleOpenDocs = () => {
    window.open("https://docs.mansa.app", "_blank");
  };

  const handleOpenDemo = async () => {
    if (!currentUser) {
      await signInAsDemo("Johan Démo", "demo.createur@mansa.app");
    }
    setCurrentView("dashboard");
  };

  const handleLoginSuccess = () => {
    setCurrentView("dashboard");
  };

  const handleLogout = async () => {
    await logout();
    setCurrentView("landing");
  };

  // Loading state while Firebase auth checks:
  // The landing page is completely public and renders immediately without blocking on auth network checks.
  // We only show the full loading screen if the user is explicitly navigating to their private dashboard.
  if (authLoading && currentView === "dashboard") {
    return (
      <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center space-y-4">
        <div className="size-12 rounded-2xl bg-[#12141a] border border-white/10 flex items-center justify-center shadow-sm">
          <div className="size-5 rounded-full border-2 border-[#3DDC84] border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-[#B6B5B0]">Mansa · Initialisation sécurisée...</p>
      </div>
    );
  }

  // L’authentification est ouverte depuis la landing, jamais imposée à l’arrivée.
  if (currentView === "login" && !currentUser) {
    return (
      <LoginPage
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
        onBackToLanding={() => setCurrentView("landing")}
        lang={lang}
      />
    );
  }

  // Le dashboard et ses fonctionnalités restent réservés aux utilisateurs connectés.
  if (currentView === "dashboard" && currentUser) {
    return (
      <>
        <UserDashboard
          user={currentUser}
          onLogout={handleLogout}
          onOpenProductStudio={() => handleOpenStudio()}
          lang={lang}
        />

        {/* Global Product Creation Studio Modal accessible from Dashboard */}
        {isStudioOpen && (
          <ProductCreationStudio
            isOpen={isStudioOpen}
            activeCurrency={userLocationInfo.currency}
            onCurrencyChange={handleGlobalCurrencyChange}
            lang={lang}
            onClose={() => setIsStudioOpen(false)}
            onSaveProduct={handleSaveProductFromStudio}
          />
        )}
      </>
    );
  }

  // Tous les visiteurs arrivent d’abord sur la landing page publique.
  return (
    <div id="home" className="min-h-screen bg-[#000000] text-white flex flex-col font-sans selection:bg-[#00D26A]/30 selection:text-white">
      {/* Top Banner if user is logged in */}
      {currentUser && (
        <div className="bg-[#12141a] border-b border-white/10 text-zinc-300 px-4 py-2 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#00D26A] animate-pulse" />
            <span className="text-zinc-400">Connecté en tant que <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})</span>
          </div>
          <button
            onClick={() => setCurrentView("dashboard")}
            className="text-[#00D26A] hover:text-[#00E575] transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Tableau de Bord afhub &rarr;</span>
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        onOpenStudio={() => handleOpenStudio()}
        onOpenMarketplace={handleOpenMarketplace}
        onOpenDocs={handleOpenDocs}
        onOpenDemo={handleOpenDemo}
        onOpenLogin={() => {
          if (currentUser) {
            setCurrentView("dashboard");
          } else {
            setAuthMode("login");
            setCurrentView("login");
          }
        }}
        lang={lang}
        setLang={setLang}
        currency={userLocationInfo.currency}
        onCurrencyChange={handleGlobalCurrencyChange}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        {/* 1. Hero Section */}
        <HeroSection
          onOpenStudio={() => handleOpenStudio()}
          lang={lang}
        />

        {/* 2. Ready to Deploy Blueprints */}
        <BuildNextCarousel
          onSelectCategory={handleSelectCategory}
          onOpenStudio={() => handleOpenStudio()}
          lang={lang}
        />

        {/* 3. Marketplace Explorer */}
        <MarketplaceSection
          onSelectProduct={(item) => setSelectedMarketplaceProduct(item)}
          onOpenStudio={() => handleOpenStudio()}
          lang={lang}
        />

        {/* 4. Social Proof Testimonials */}
        <SocialProofSection
          lang={lang}
        />

        {/* 5. Dynamic FAQ Section */}
        <FaqSection
          onOpenStudio={() => handleOpenStudio()}
          lang={lang}
        />

        {/* 6. Footer */}
        <Footer
          onOpenStudio={() => handleOpenStudio()}
          lang={lang}
        />
      </main>

      {/* Product Creation Studio Modal */}
      {isStudioOpen && (
        <ProductCreationStudio
          isOpen={isStudioOpen}
          activeCurrency={userLocationInfo.currency}
          onCurrencyChange={handleGlobalCurrencyChange}
          lang={lang}
          onClose={() => setIsStudioOpen(false)}
          onSaveProduct={handleSaveProductFromStudio}
        />
      )}

      {/* Product Detail Modal from Marketplace */}
      {selectedMarketplaceProduct && (
        <ModalOverlay
          isOpen={!!selectedMarketplaceProduct}
          onClose={() => setSelectedMarketplaceProduct(null)}
          contentClassName="max-w-[460px] mx-auto"
        >
          <div className="relative w-full rounded-2xl border border-white/10 bg-[#151515] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMarketplaceProduct.creatorAvatar}
                  alt={selectedMarketplaceProduct.creator}
                  className="size-10 rounded-full border border-white/10 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white font-heading">{selectedMarketplaceProduct.title}</h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#B6B5B0]">Par {selectedMarketplaceProduct.creator}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMarketplaceProduct(null)}
                className="text-[#B6B5B0] hover:text-white cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-[#B6B5B0] font-light leading-relaxed">
              {selectedMarketplaceProduct.description}
            </p>

            <div className="rounded-xl border border-white/10 bg-[#000000] p-4 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#B6B5B0] block">
                  Abonnement / Accès
                </span>
                <span className="text-2xl font-bold font-mono text-white">
                  {selectedMarketplaceProduct.priceMonthly}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-amber-400 font-bold bg-amber-400/10 px-2.5 py-1 rounded-md">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{selectedMarketplaceProduct.rating}</span>
                <span className="text-[#B6B5B0] font-normal">({selectedMarketplaceProduct.reviewsCount})</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#B6B5B0] font-light">
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-[#3DDC84] shrink-0" />
                <span>Accès instantané aux canaux et contenus</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="size-3.5 text-[#3DDC84] shrink-0" />
                <span>Paiement sécurisé par Mobile Money & Carte</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedMarketplaceProduct(null)}
                className="flex-1 py-2.5 rounded-full border border-white/10 text-[#B6B5B0] hover:text-white hover:bg-white/5 text-xs font-semibold cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setSelectedMarketplaceProduct(null);
                  handleOpenStudio(selectedMarketplaceProduct.category);
                }}
                className="mansa-btn-green flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer font-bold"
              >
                <span>Créer une offre similaire</span>
                <ArrowRight className="size-3" />
              </button>
            </div>
          </div>
        </ModalOverlay>
      )}
    </div>
  );
}
