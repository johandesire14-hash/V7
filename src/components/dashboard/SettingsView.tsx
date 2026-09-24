import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Building2,
  User,
  Image as ImageIcon,
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Eye,
} from "lucide-react";
import { AccountSettingsModal } from "../common/AccountSettingsModal";
import { getUserProfile, updateUserProfile, isCreatorPayoutConfigured } from "../../services/dbService";
import { getSavedCompanies, updateCompanyBranding } from "../../utils/companyStorage";
import { updateSubscriptionBranding } from "../../utils/subscriptionsStorage";
import { CurrencySelector } from "./CurrencySelector";
import { CurrencyCode } from "../../utils/currency";

interface SettingsViewProps {
  lang?: "fr" | "en";
  user: {
    uid?: string;
    name: string;
    email: string;
    avatarInitials?: string;
    handle?: string;
  };
  onLogout?: () => void;
  initialTab?: "account" | "store";
  activeCompanyId?: string;
  activeCompanyName?: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang = "fr",
  user,
  onLogout,
  initialTab = "account",
  activeCompanyId,
  activeCompanyName,
}) => {
  const [activeTab, setActiveTab] = useState<"account" | "store">(initialTab);

  // Check if we are configuring a specific enterprise or the personal profile
  const isCompanyContext = !!activeCompanyId && activeCompanyId !== "personnel";

  // Enterprise Settings State
  const defaultCompanyName = user.name ? `${user.name.toLowerCase().replace(/\s+/g, "_")}` : "mon_entreprise";
  const [storeName, setStoreName] = useState(defaultCompanyName);
  const [storeTagline, setStoreTagline] = useState("Vente de produits digitaux, formations & accès VIP");
  const [supportEmail, setSupportEmail] = useState(user.email || "support@mansa.app");
  const [storeCurrency, setStoreCurrency] = useState("XOF");
  const [payoutMethod, setPayoutMethod] = useState<"wave" | "orange_momo" | "bank_uemoa" | "bank_cemac" | "crypto">("wave");
  
  // Enterprise Banner & Profile Photo State
  const [companyBanner, setCompanyBanner] = useState<string>(
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85"
  );
  const [companyLogo, setCompanyLogo] = useState<string>(
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
  );

  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement | null>(null);

  // Mobile Money Details
  const [momoNumber, setMomoNumber] = useState("+225 07 00 00 00 00");
  const [momoName, setMomoName] = useState(user.name || "Compte Mobile Money");
  
  // African Bank Account Details
  const [bankName, setBankName] = useState("Ecobank Côte d'Ivoire / UEMOA");
  const [bankIbanRib, setBankIbanRib] = useState("CI059 01001 12345678901 45");
  const [bankAccountHolder, setBankAccountHolder] = useState(`${user.name.toUpperCase()} ENTREPRISE`);

  // Loading & Feedback States
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Load existing profile or company settings on mount / change
  useEffect(() => {
    let isMounted = true;
    const loadSettings = async () => {
      setIsLoadingProfile(true);
      try {
        const userKey = user.uid || user.email || "default";

        if (isCompanyContext && activeCompanyId) {
          // STRICT ENTERPRISE ISOLATION:
          // Read from specific company settings first
          const isolatedRaw = localStorage.getItem(`mansa_company_settings_${activeCompanyId}`);
          let isolated = isolatedRaw ? JSON.parse(isolatedRaw) : null;

          // If not in isolated cache, search in user companies
          const userCompanies = getSavedCompanies(userKey);
          const comp = userCompanies.find((c) => c.id === activeCompanyId);

          const target = isolated || comp;
          if (target && isMounted) {
            setStoreName(target.name || activeCompanyName || "Mon Entreprise");
            setStoreTagline(target.description || "");
            setSupportEmail(target.supportEmail || user.email || "");
            if (target.primaryCurrency) setStoreCurrency(target.primaryCurrency);
            if (target.payoutMethod) setPayoutMethod(target.payoutMethod);
            if (target.momoNumber) setMomoNumber(target.momoNumber);
            if (target.momoName) setMomoName(target.momoName);
            if (target.bankName) setBankName(target.bankName);
            if (target.bankIbanRib) setBankIbanRib(target.bankIbanRib);
            if (target.bankAccountHolder) setBankAccountHolder(target.bankAccountHolder);
            if (target.companyBanner) setCompanyBanner(target.companyBanner);
            if (target.companyLogo) setCompanyLogo(target.companyLogo);
          } else if (isMounted) {
            setStoreName(activeCompanyName || "Mon Entreprise");
          }
        } else {
          // Personal profile settings
          if (user.uid) {
            const profile = await getUserProfile(user.uid);
            if (profile && isMounted) {
              if (profile.storeName) setStoreName(profile.storeName);
              if (profile.storeTagline) setStoreTagline(profile.storeTagline);
              if (profile.supportEmail) setSupportEmail(profile.supportEmail);
              if (profile.storeCurrency) setStoreCurrency(profile.storeCurrency);
              if (profile.payoutMethod) setPayoutMethod(profile.payoutMethod);
              if (profile.momoNumber) setMomoNumber(profile.momoNumber);
              if (profile.momoName) setMomoName(profile.momoName);
              if (profile.bankName) setBankName(profile.bankName);
              if (profile.bankIbanRib) setBankIbanRib(profile.bankIbanRib);
              if (profile.bankAccountHolder) setBankAccountHolder(profile.bankAccountHolder);
              if (profile.companyBanner || profile.storeBanner) {
                setCompanyBanner(profile.companyBanner || profile.storeBanner || "");
              }
              if (profile.companyLogo || profile.storeLogo) {
                setCompanyLogo(profile.companyLogo || profile.storeLogo || "");
              }
            }
          }
        }
      } catch (err: any) {
        console.warn("Failed to load settings:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadSettings();
    return () => {
      isMounted = false;
    };
  }, [user.uid, user.email, activeCompanyId, isCompanyContext, activeCompanyName]);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCompanyBanner(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCompanyLogo(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setSaveError(null);
    setSavedSuccess(false);

    try {
      const userKey = user.uid || user.email || "default";

      if (isCompanyContext && activeCompanyId) {
        // STRICT ENTERPRISE ISOLATION:
        // Save EXCLUSIVELY for this enterprise ID.
        // It does NOT modify any other company, nor does it overwrite the personal profile!
        const companySettings = {
          id: activeCompanyId,
          name: storeName.trim(),
          description: storeTagline.trim(),
          supportEmail: supportEmail.trim(),
          primaryCurrency: storeCurrency,
          companyBanner: companyBanner.trim(),
          companyLogo: companyLogo.trim(),
          payoutMethod,
          momoNumber: momoNumber.trim(),
          momoName: momoName.trim(),
          bankName,
          bankIbanRib: bankIbanRib.trim(),
          bankAccountHolder: bankAccountHolder.trim(),
        };

        localStorage.setItem(
          `mansa_company_settings_${activeCompanyId}`,
          JSON.stringify(companySettings)
        );

        const currentCompanies = getSavedCompanies(userKey);
        const updatedCompanies = currentCompanies.map((c) => {
          if (c.id === activeCompanyId) {
            return {
              ...c,
              ...companySettings,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        });
        localStorage.setItem(`mansa_companies_${userKey}`, JSON.stringify(updatedCompanies));

        updateCompanyBranding(userKey, activeCompanyId, {
          name: storeName.trim(),
          description: storeTagline.trim(),
          companyBanner: companyBanner.trim(),
          companyLogo: companyLogo.trim(),
        });
        updateSubscriptionBranding(userKey, activeCompanyId, {
          companyName: storeName.trim(),
          companyBanner: companyBanner.trim(),
          companyLogo: companyLogo.trim(),
        });

        window.dispatchEvent(
          new CustomEvent("mansa_companies_updated", { detail: updatedCompanies })
        );
        window.dispatchEvent(
          new CustomEvent("mansa_company_branding_changed", {
            detail: { companyId: activeCompanyId, branding: companySettings },
          })
        );
      } else {
        // Personal profile save
        if (!user.uid) {
          setSaveError("Identifiant utilisateur manquant. Veuillez vous reconnecter.");
          setIsSaving(false);
          return;
        }

        const updatedProfile = await updateUserProfile(user.uid, {
          storeName: storeName.trim(),
          storeTagline: storeTagline.trim(),
          supportEmail: supportEmail.trim(),
          storeCurrency,
          companyBanner: companyBanner.trim(),
          storeBanner: companyBanner.trim(),
          companyLogo: companyLogo.trim(),
          storeLogo: companyLogo.trim(),
          payoutMethod,
          momoNumber: momoNumber.trim(),
          momoName: momoName.trim(),
          bankName,
          bankIbanRib: bankIbanRib.trim(),
          bankAccountHolder: bankAccountHolder.trim(),
        });

        window.dispatchEvent(
          new CustomEvent("mansa_profile_updated", {
            detail: updatedProfile,
          })
        );
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: any) {
      console.error("Enterprise settings save error:", err);
      setSaveError(err.message || "Erreur lors de l'enregistrement des paramètres.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header with Settings Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {activeTab === "store"
                ? isCompanyContext
                  ? `Paramètres de l'Entreprise — ${storeName || activeCompanyName}`
                  : lang === "fr"
                  ? "Paramètres de l'Entreprise"
                  : "Enterprise Settings"
                : lang === "fr"
                ? "Paramètres du Compte"
                : "Account Settings"}
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            {activeTab === "store"
              ? "Configurez l'identité de votre entreprise, les devises et vos coordonnées de virements bancaires & Mobile Money."
              : "Gérez votre profil public Mansa, votre bio, votre identifiant et vos préférences d'affichage."}
          </p>
        </div>

        {/* Dual Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#121316] border border-white/10 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "account"
                ? "bg-[#00D26A] text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <User className="size-3.5" />
            <span>{lang === "fr" ? "Profil & Compte" : "Profile & Account"}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("store")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "store"
                ? "bg-[#00D26A] text-black shadow-md"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Building2 className="size-3.5" />
            <span>{lang === "fr" ? "Entreprise" : "Enterprise"}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: PARAMÈTRES DU COMPTE & PROFIL (EXACT REPRODUCTION) */}
      {/* ========================================================================= */}
      {activeTab === "account" ? (
        <AccountSettingsModal
          isModal={false}
          user={user}
          onLogout={onLogout}
          lang={lang}
          initialTab="profil"
        />
      ) : (
        /* ========================================================================= */
        /* MODE 2: PARAMÈTRES DE L'ENTREPRISE MANSA */
        /* ========================================================================= */
        <form onSubmit={handleSave} className="space-y-6">
          {isLoadingProfile && (
            <div className="flex items-center gap-2 text-xs text-zinc-400 p-2">
              <Loader2 className="size-3.5 animate-spin text-[#00D26A]" />
              <span>Chargement des paramètres...</span>
            </div>
          )}

          {savedSuccess && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 text-xs font-semibold text-emerald-400 shadow-md animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>Les paramètres de votre entreprise ont été enregistrés avec succès !</span>
            </div>
          )}

          {saveError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs font-semibold text-red-400 shadow-md animate-in fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* 1. Identity & Branding */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Building2 className="size-4 text-[#00D26A]" />
              <h3 className="text-sm font-bold text-white">Identité de l'Entreprise & Vitrine</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Nom de l'entreprise</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Nom de l'entreprise"
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#00D26A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Email du support client</label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#00D26A]"
                  required
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Description de la vitrine & Slogan</label>
                <input
                  type="text"
                  value={storeTagline}
                  onChange={(e) => setStoreTagline(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#00D26A]"
                />
              </div>
            </div>
          </div>

          {/* 2. Visual Branding: Bannière et Photo de profil de l'entreprise */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Camera className="size-4 text-[#00D26A]" />
                <h3 className="text-sm font-bold text-white">Bannière & Photo de Profil de l'Entreprise</h3>
              </div>
            </div>

            {/* LIVE PREVIEW COMPOSITE (Banner + Overlayed Profile Photo) */}
            <div className="space-y-2">
              <label className="block text-xs text-zinc-300 font-semibold">
                Aperçu en direct de votre marque
              </label>
              <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 bg-[#14161f] shadow-inner group">
                <img
                  src={companyBanner || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85"}
                  alt="Aperçu de la bannière"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

                {/* Profile Photo Overlaid */}
                <div className="absolute bottom-3 left-4 flex items-end gap-3 z-10">
                  <div className="relative size-16 sm:size-20 rounded-2xl border-2 border-black bg-[#121316] shadow-xl overflow-hidden shrink-0">
                    <img
                      src={companyLogo || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"}
                      alt="Aperçu du logo"
                      className="size-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
                  </div>
                  <div className="text-white drop-shadow-md pb-0.5">
                    <h4 className="text-sm font-bold tracking-tight">{storeName || "Mon Entreprise"}</h4>
                    <p className="text-[11px] text-zinc-300 line-clamp-1">{storeTagline || "Slogan ou description de l'entreprise"}</p>
                  </div>
                </div>

                <div className="absolute top-2.5 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 text-[10px] text-zinc-300 font-mono">
                  Aperçu temps réel
                </div>
              </div>
            </div>

            {/* BANNER CONFIGURATION */}
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Bannière de l'entreprise (1800 x 600 recommandé)</span>
                </div>
                {/* Upload Trigger Button */}
                <div>
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="size-3" />
                    <span>Téléverser une image</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets for Banner */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  Ou choisir une bannière premium prédéfinie :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      label: "Trading & Finance",
                      url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1800&q=85",
                    },
                    {
                      label: "Émeraude Prestige",
                      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85",
                    },
                    {
                      label: "Cyber Studio",
                      url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1800&q=85",
                    },
                    {
                      label: "Minimaliste Dark",
                      url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1800&q=85",
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCompanyBanner(preset.url)}
                      className={`relative h-12 rounded-lg overflow-hidden border transition-all text-left p-1.5 cursor-pointer ${
                        companyBanner === preset.url
                          ? "border-[#00D26A] ring-1 ring-[#00D26A]"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="absolute inset-0 size-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 hover:bg-black/40 transition-colors" />
                      <span className="relative z-10 text-[10px] font-bold text-white drop-shadow block line-clamp-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* PROFILE PHOTO / LOGO CONFIGURATION */}
            <div className="p-4 rounded-xl bg-[#14151a] border border-white/5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <User className="size-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">Photo de profil / Logo de l'entreprise</span>
                </div>
                {/* Upload Trigger Button */}
                <div>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="size-3" />
                    <span>Téléverser une photo</span>
                  </button>
                </div>
              </div>

              {/* Quick Presets for Logo */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">
                  Ou choisir un logo/avatar prédéfini :
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      label: "Portrait Dirigeant",
                      url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
                    },
                    {
                      label: "Monogramme Abstrait",
                      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=300&q=80",
                    },
                    {
                      label: "Tech Venture",
                      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
                    },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setCompanyLogo(preset.url)}
                      className={`flex items-center gap-2 p-1.5 rounded-lg border transition-all text-left cursor-pointer bg-[#0d0e12] ${
                        companyLogo === preset.url
                          ? "border-[#00D26A] bg-[#00D26A]/10"
                          : "border-white/10 hover:border-white/30"
                      }`}
                    >
                      <img src={preset.url} alt={preset.label} className="size-8 rounded-lg object-cover shrink-0" />
                      <span className="text-[10px] font-semibold text-zinc-200 line-clamp-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. African Banking & Mobile Money Payouts */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Moyens de Paiement Acceptés & Virements Mobile Money</h3>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-relaxed">
              <strong>Condition obligatoire :</strong> Conformément à la politique Mansa, vos produits ne peuvent être marqués comme <strong>Visibles</strong> par les acheteurs tant que vous n'avez pas renseigné vos coordonnées de versement ci-dessous pour encaisser vos gains.
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-zinc-300 font-semibold">Mode de versement principal de vos gains</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "wave", title: "Wave Mobile Money (CI / SN)", desc: "Transfert instantané gratuit 0% frais", flag: "🇨🇮 🇸🇳" },
                  { id: "orange_momo", title: "Orange Money / MTN MoMo", desc: "Versement direct sur votre portefeuille", flag: "🇨🇲 🇧🇯 🇬🇳" },
                  { id: "bank_uemoa", title: "Virement Bancaire (RIB / IBAN)", desc: "Ecobank, Coris, UBA, SGCI, NSIA...", flag: "🌍 UEMOA" },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setPayoutMethod(m.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      payoutMethod === m.id
                        ? "border-[#00D26A] bg-[#00D26A]/10 text-white"
                        : "border-white/10 bg-[#121316] text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold block text-xs">{m.title}</span>
                      <span>{m.flag}</span>
                    </div>
                    <span className="text-[10px] opacity-75 block">{m.desc}</span>
                  </div>
                ))}
              </div>

              {/* Mobile Money Details fields */}
              {(payoutMethod === "wave" || payoutMethod === "orange_momo") && (
                <div className="mt-3 p-4 rounded-xl bg-[#16181f] border border-white/5 space-y-3">
                  <h4 className="font-bold text-white text-xs">Coordonnées du Portefeuille Mobile Money :</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Numéro Mobile Money de retrait</label>
                      <input
                        type="text"
                        value={momoNumber}
                        onChange={(e) => setMomoNumber(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#101114] p-2 text-white font-mono text-xs outline-none focus:border-[#00D26A]"
                        placeholder="+225 07 00 00 00 00"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Nom du titulaire du compte</label>
                      <input
                        type="text"
                        value={momoName}
                        onChange={(e) => setMomoName(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#101114] p-2 text-white text-xs outline-none focus:border-[#00D26A]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Account Details fields */}
              {payoutMethod === "bank_uemoa" && (
                <div className="mt-3 p-4 rounded-xl bg-[#16181f] border border-white/5 space-y-3">
                  <h4 className="font-bold text-white text-xs">Coordonnées Bancaires Africaines (RIB / IBAN) :</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Banque partenaire</label>
                      <select
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#101114] p-2 text-white text-xs outline-none cursor-pointer"
                      >
                        <option>Ecobank (UEMOA / CEMAC)</option>
                        <option>Coris Bank International</option>
                        <option>Société Générale (SGCI / SGS)</option>
                        <option>United Bank for Africa (UBA)</option>
                        <option>NSIA Banque</option>
                        <option>Bank of Africa (BOA)</option>
                        <option>Attijariwafa Bank</option>
                        <option>Rawbank (RDC)</option>
                        <option>Zenith Bank / GTBank (Nigeria)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">Titulaire du compte bancaire</label>
                      <input
                        type="text"
                        value={bankAccountHolder}
                        onChange={(e) => setBankAccountHolder(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#101114] p-2 text-white text-xs outline-none focus:border-[#00D26A]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-zinc-400 mb-1">Numéro RIB / IBAN</label>
                      <input
                        type="text"
                        value={bankIbanRib}
                        onChange={(e) => setBankIbanRib(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-[#101114] p-2 text-white font-mono text-xs outline-none focus:border-[#00D26A]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 3. African Currencies & Pricing */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e] p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/5">
              <Globe className="size-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Devise Principale de l'Entreprise</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-semibold mb-2">Devise par défaut de vos produits</label>
                <div className="flex items-center gap-3">
                  <CurrencySelector
                    currentCurrency={storeCurrency as CurrencyCode}
                    onSelectCurrency={(c) => setStoreCurrency(c)}
                    variant="pill"
                    lang={lang}
                  />
                  <span className="text-[11px] text-zinc-400 font-mono">
                    ({storeCurrency})
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1">Conversion automatique en direct</label>
                <div className="p-2.5 rounded-xl bg-[#16181f] border border-white/5 text-zinc-300 flex items-center justify-between">
                  <span>Multi-devises Mansa</span>
                  <span className="text-emerald-400 font-bold font-mono">Actif pour tous les pays</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer transition-colors"
            >
              <LogOut className="size-3.5" />
              <span>Se déconnecter</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#00D26A] hover:bg-[#10E47A] disabled:opacity-50 disabled:cursor-not-allowed text-black px-6 py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};

