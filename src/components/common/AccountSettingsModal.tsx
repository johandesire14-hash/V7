import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Link2,
  ShieldCheck,
  Bookmark,
  Bell,
  CreditCard,
  Folder,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  DollarSign,
  MapPin,
  Store,
  Users,
  Copy,
  Check,
  LogOut,
  Smartphone,
  Plus,
  ExternalLink,
  Trash2,
  Key,
  Globe,
  Receipt,
  Download,
  LifeBuoy,
  Loader2,
} from "lucide-react";
import { getUserProfile, updateUserProfile } from "../../services/dbService";
import { CustomerPurchasesView } from "../dashboard/CustomerPurchasesView";
import { useModalDismiss } from "../../hooks/useModalDismiss";

export type AccountSettingsTab =
  | "profil"
  | "invitations"
  | "comptes_connectes"
  | "securite"
  | "commandes"
  | "notifications"
  | "paiements"
  | "portefeuille"
  | "verifications"
  | "resolution";

interface AccountSettingsModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  lang?: "fr" | "en";
  user: {
    uid?: string;
    name: string;
    email: string;
    avatarInitials?: string;
    handle?: string;
  };
  onLogout?: () => void;
  initialTab?: AccountSettingsTab;
  isModal?: boolean;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen = true,
  onClose,
  lang = "fr",
  user,
  onLogout,
  initialTab = "profil",
  isModal = true,
}) => {
  const userId = user?.uid || "user_default";
  const [activeTab, setActiveTab] = useState<AccountSettingsTab>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Profil Form State
  const [username, setUsername] = useState(
    user.handle || (user.email ? user.email.split("@")[0] : "johandesire16")
  );
  const [bio, setBio] = useState("");
  const [birthDate, setBirthDate] = useState("");
  
  // Toggles for "Plus de détails"
  const [showTotalEarned, setShowTotalEarned] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showOwnedBusinesses, setShowOwnedBusinesses] = useState(true);
  const [showJoinedWhops, setShowJoinedWhops] = useState(true);

  // Status & loaders
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Other tabs state
  const [copiedLink, setCopiedLink] = useState(false);

  // Connected accounts
  const [discordConnected, setDiscordConnected] = useState(true);
  const [telegramConnected, setTelegramConnected] = useState(true);
  const [googleConnected, setGoogleConnected] = useState(true);
  const [xConnected, setXConnected] = useState(false);

  // Load existing profile from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const loadProfile = async () => {
      if (!userId) return;
      setIsLoadingProfile(true);
      try {
        const profile = await getUserProfile(userId);
        if (profile && isMounted) {
          if (profile.handle) setUsername(profile.handle.replace(/^@/, ""));
          if (profile.bio !== undefined) setBio(profile.bio);
          if (profile.birthDate !== undefined) setBirthDate(profile.birthDate);
          if (profile.showTotalEarned !== undefined) setShowTotalEarned(profile.showTotalEarned);
          if (profile.showLocation !== undefined) setShowLocation(profile.showLocation);
          if (profile.showOwnedBusinesses !== undefined) {
            setShowOwnedBusinesses(profile.showOwnedBusinesses);
          } else if (profile.showOwnedWhops !== undefined) {
            setShowOwnedBusinesses(profile.showOwnedWhops);
          }
          if (profile.showJoinedWhops !== undefined) setShowJoinedWhops(profile.showJoinedWhops);
        }
      } catch (err: any) {
        console.error("Failed to load user profile from Firestore:", err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (isModal && !isOpen) return null;

  const handleCopyProfileLink = () => {
    const link = `https://mansa.app/@${username}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateUserProfile(userId, {
        handle: username.trim().startsWith("@") ? username.trim() : `@${username.trim()}`,
        bio: bio.trim(),
        birthDate: birthDate.trim(),
        showTotalEarned,
        showLocation,
        showOwnedBusinesses,
        showOwnedWhops: showOwnedBusinesses,
        showJoinedWhops,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      console.error("Error saving user profile:", err);
      setSaveError(err.message || "Erreur lors de la sauvegarde du profil.");
    } finally {
      setIsSaving(false);
    }
  };

  interface NavItem {
    id: AccountSettingsTab;
    label: string;
    fullLabel?: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  const navItems: NavItem[] = [
    { id: "profil", label: "Profil", icon: User },
    { id: "invitations", label: "Invitations", icon: Mail },
    { id: "comptes_connectes", label: "Comptes connectés", icon: Link2 },
    { id: "securite", label: "Sécurité du compte", icon: ShieldCheck },
    { id: "commandes", label: "Commandes & Achats", fullLabel: "Mes Commandes et Achats", icon: Bookmark },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "paiements", label: "Méthodes de paie...", fullLabel: "Méthodes de paiement", icon: CreditCard },
    { id: "portefeuille", label: "Portefeuille", icon: Folder },
    { id: "verifications", label: "Vérifications", icon: CheckCircle2 },
    { id: "resolution", label: "Centre de résolution", icon: AlertCircle },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.fullLabel && item.fullLabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const containerContent = (
    <div
      className={`w-full ${
        isModal
          ? "max-w-5xl bg-[#111216] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[680px] max-h-[92vh]"
          : "w-full bg-[#111216] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[620px]"
      }`}
    >
      {/* MOBILE TOP TAB BAR (< md) */}
      <div className="md:hidden w-full shrink-0 bg-[#0e0f12] border-b border-white/[0.08] p-3 space-y-2 select-none">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white tracking-tight">
            Paramètres du compte
          </h2>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Horizontal scrollable pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AccountSettingsTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-[#00D26A] text-black shadow-md font-bold"
                    : "bg-[#181a20] text-zinc-300 hover:bg-[#22252c] hover:text-white border border-white/5"
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? "text-black" : "text-zinc-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DESKTOP LEFT SIDEBAR (>= md) */}
      <aside className="hidden md:flex md:w-64 shrink-0 bg-[#0e0f12] border-r border-white/[0.08] flex-col justify-between p-3.5 select-none">
        <div className="space-y-3">
          {/* Title */}
          <div className="px-2 pt-1 pb-0.5">
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Paramètres du compte
            </h2>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 size-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Paramètres de recherche"
              className="w-full rounded-xl bg-[#16181d] border border-white/[0.06] pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Navigation links */}
          <nav className="space-y-0.5 mt-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as AccountSettingsTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                    isActive
                      ? "bg-[#252830] text-white font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon className={`size-4 ${isActive ? "text-white" : "text-zinc-400"}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Se déconnecter (Logout) Button */}
        <div className="pt-3 mt-auto border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl bg-[#331414] hover:bg-[#421a1a] text-red-400 border border-red-900/30 text-xs font-semibold text-center transition-colors cursor-pointer"
          >
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL */}
      <main className="flex-1 bg-[#111216] flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white capitalize">
              {activeTab === "profil" && "Profil"}
              {activeTab === "invitations" && "Invitations"}
              {activeTab === "comptes_connectes" && "Comptes connectés"}
              {activeTab === "securite" && "Sécurité du compte"}
              {activeTab === "commandes" && "Mes Commandes & Achats"}
              {activeTab === "notifications" && "Notifications"}
              {activeTab === "paiements" && "Méthodes de paiement"}
              {activeTab === "portefeuille" && "Portefeuille"}
              {activeTab === "verifications" && "Vérifications"}
              {activeTab === "resolution" && "Centre de résolution"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Copy public profile URL button */}
            <button
              onClick={handleCopyProfileLink}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer relative"
              title="Copier le lien public de votre profil"
            >
              {copiedLink ? <Check className="size-4 text-[#00D26A]" /> : <Link2 className="size-4" />}
              {copiedLink && (
                <span className="absolute -bottom-7 right-0 text-[10px] bg-zinc-900 border border-white/10 text-emerald-400 px-2 py-0.5 rounded shadow-lg whitespace-nowrap">
                  Lien copié !
                </span>
              )}
            </button>

            {/* Close modal X button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Fermer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Body Content (Scrollable) */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">

          {/* ================================================================= */}
          {/* 1. TAB: PROFIL */}
          {/* ================================================================= */}
          {activeTab === "profil" && (
            <div className="space-y-5">
              
              {/* Notifications / Alerts */}
              {saveSuccess && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs font-semibold text-emerald-400 animate-in fade-in">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>Votre profil a été enregistré avec succès</span>
                </div>
              )}

              {saveError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-semibold text-red-400">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {isLoadingProfile ? (
                <div className="py-8 text-center text-xs text-zinc-400 flex flex-col items-center gap-2">
                  <Loader2 className="size-5 animate-spin text-[#0055ff]" />
                  <span>Chargement du profil...</span>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {/* Field: Nom d'utilisateur */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Nom d'utilisateur
                    </span>
                    <div className="flex items-center rounded-lg bg-[#191b22] border border-white/[0.08] px-3 py-1.5 text-xs text-white font-mono">
                      <span className="text-zinc-400">@</span>
                      <input
                        type="text"
                        value={username.replace(/^@/, "")}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-transparent text-xs text-white outline-none pl-0.5 font-mono w-36 sm:w-44"
                      />
                    </div>
                  </div>

                  {/* Field: Bio */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-white">
                      Bio
                    </label>
                    <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-3">
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Parlez de votre parcours ou de vos communautés..."
                        rows={3}
                        className="w-full bg-transparent text-xs text-white placeholder-zinc-600 outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Field: Date de naissance */}
                  <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">
                      Date de naissance
                    </span>
                    <div className="flex items-center rounded-lg bg-[#191b22] border border-white/[0.08] px-3 py-1.5 text-xs text-zinc-300 font-mono">
                      <input
                        type="text"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        placeholder="jj / mm / aaaa"
                        className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none text-center w-28 font-mono"
                      />
                    </div>
                  </div>

                  {/* Section: Plus de détails */}
                  <div className="space-y-2 pt-1">
                    <h3 className="text-xs font-bold text-white">
                      Plus de détails
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Choisissez ce qui apparaît sur votre profil et d'autres surfaces de découverte.
                    </p>

                    {/* Switch list items */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#14161b] divide-y divide-white/[0.06] overflow-hidden">
                      
                      {/* 1. Total gagné */}
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1d2027] text-zinc-300">
                            <DollarSign className="size-4" />
                          </div>
                          <span className="text-xs font-semibold text-white">
                            Total gagné
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowTotalEarned(!showTotalEarned)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                            showTotalEarned ? "bg-[#0055ff]" : "bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              showTotalEarned ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* 2. Emplacement */}
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1d2027] text-zinc-300">
                            <MapPin className="size-4" />
                          </div>
                          <span className="text-xs font-semibold text-white">
                            Emplacement géographique
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowLocation(!showLocation)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                            showLocation ? "bg-[#0055ff]" : "bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              showLocation ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* 3. Boutiques possédées */}
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1d2027] text-zinc-300">
                            <Store className="size-4" />
                          </div>
                          <span className="text-xs font-semibold text-white">
                            Espaces / Boutiques possédés
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowOwnedBusinesses(!showOwnedBusinesses)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                            showOwnedBusinesses ? "bg-[#0055ff]" : "bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              showOwnedBusinesses ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* 4. Communautés rejointes */}
                      <div className="flex items-center justify-between p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-[#1d2027] text-zinc-300">
                            <Users className="size-4" />
                          </div>
                          <span className="text-xs font-semibold text-white">
                            Communautés rejointes
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowJoinedWhops(!showJoinedWhops)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                            showJoinedWhops ? "bg-[#0055ff]" : "bg-zinc-700"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              showJoinedWhops ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Save Button for Profile */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0055ff] hover:bg-[#0047d6] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="size-3.5 animate-spin" />
                          <span>Enregistrement en cours...</span>
                        </>
                      ) : (
                        <span>Enregistrer les modifications</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

          {/* ================================================================= */}
          {/* 2. TAB: INVITATIONS */}
          {/* ================================================================= */}
          {activeTab === "invitations" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white">Inviter des membres & co-créateurs</h4>
                    <p className="text-zinc-400 text-[11px]">Partagez votre lien d'invitation personnel pour débloquer des commissions.</p>
                  </div>
                  <button
                    onClick={handleCopyProfileLink}
                    className="px-3 py-1.5 rounded-lg bg-[#0055ff] hover:bg-blue-600 text-white font-medium text-xs cursor-pointer"
                  >
                    Générer un lien
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-6 text-center text-xs text-zinc-500">
                Aucune invitation en attente pour le moment.
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 3. TAB: COMPTES CONNECTÉS */}
          {/* ================================================================= */}
          {activeTab === "comptes_connectes" && (
            <div className="space-y-3">
              {[
                { name: "Discord", desc: "Synchronisation des rôles et accès aux serveurs VIP", connected: discordConnected, toggle: () => setDiscordConnected(!discordConnected), icon: Users, color: "text-[#5865F2]" },
                { name: "Telegram", desc: "Livraison des canaux secrets et alertes de vente", connected: telegramConnected, toggle: () => setTelegramConnected(!telegramConnected), icon: Smartphone, color: "text-[#229ED9]" },
                { name: "Google", desc: "Authentification rapide et synchronisation Drive", connected: googleConnected, toggle: () => setGoogleConnected(!googleConnected), icon: Globe, color: "text-red-400" },
                { name: "X (Twitter)", desc: "Partage automatique et badges créateur", connected: xConnected, toggle: () => setXConnected(!xConnected), icon: Link2, color: "text-zinc-300" },
              ].map((acc) => (
                <div key={acc.name} className="rounded-xl border border-white/[0.08] bg-[#14161b] p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-[#1e2027] ${acc.color}`}>
                      <acc.icon className="size-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-white text-xs block">{acc.name}</span>
                      <span className="text-[11px] text-zinc-400">{acc.desc}</span>
                    </div>
                  </div>
                  <button
                    onClick={acc.toggle}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      acc.connected
                        ? "border border-red-500/30 text-red-400 hover:bg-red-500/10"
                        : "bg-[#0055ff] text-white hover:bg-blue-600"
                    }`}
                  >
                    {acc.connected ? "Déconnecter" : "Connecter"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ================================================================= */}
          {/* 4. TAB: SÉCURITÉ DU COMPTE */}
          {/* ================================================================= */}
          {activeTab === "securite" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 space-y-3">
                <h4 className="font-semibold text-white">Mot de passe & Clés d'accès</h4>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="font-medium text-zinc-200 block">Mot de passe de connexion</span>
                    <span className="text-[11px] text-zinc-500">Protégé par Firebase Auth</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg border border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 cursor-pointer font-medium">
                    Modifier
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 space-y-3">
                <h4 className="font-semibold text-white">Authentification à deux facteurs (2FA)</h4>
                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                  <div>
                    <span className="font-medium text-zinc-200 block">Code OTP / Authenticator</span>
                    <span className="text-[11px] text-emerald-400">Actif sur votre compte</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 bg-emerald-500/10 cursor-pointer font-medium">
                    Configuré
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 5. TAB: COMMANDES & ACHATS */}
          {/* ================================================================= */}
          {activeTab === "commandes" && (
            <div className="space-y-4">
              <CustomerPurchasesView lang={lang} isEmbeddedInSettings={true} />
            </div>
          )}

          {/* ================================================================= */}
          {/* 6. TAB: NOTIFICATIONS */}
          {/* ================================================================= */}
          {activeTab === "notifications" && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Alertes de ventes instantanées</span>
                  <span className="text-[11px] text-zinc-400">Recevez un ping à chaque nouveau paiement Wave ou Mobile Money.</span>
                </div>
                <button className="h-6 w-11 rounded-full bg-[#0055ff] p-0.5 relative inline-flex cursor-pointer">
                  <span className="size-5 rounded-full bg-white translate-x-5 transition-transform" />
                </button>
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">Rapports hebdomadaires de revenus</span>
                  <span className="text-[11px] text-zinc-400">Récapitulatif chaque lundi matin par email.</span>
                </div>
                <button className="h-6 w-11 rounded-full bg-[#0055ff] p-0.5 relative inline-flex cursor-pointer">
                  <span className="size-5 rounded-full bg-white translate-x-5 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 7. TAB: MÉTHODES DE PAIEMENT */}
          {/* ================================================================= */}
          {activeTab === "paiements" && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white block">Wave Mobile Money CI</span>
                    <span className="text-[11px] text-zinc-400">•• 44 • Par défaut</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Actif</span>
              </div>

              <button className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 text-zinc-400 hover:text-white flex items-center justify-center gap-2 cursor-pointer">
                <Plus className="size-3.5" />
                <span>Ajouter une méthode de paiement</span>
              </button>
            </div>
          )}

          {/* ================================================================= */}
          {/* 8. TAB: PORTEFEUILLE */}
          {/* ================================================================= */}
          {activeTab === "portefeuille" && (
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-white/[0.08] bg-gradient-to-br from-[#14161b] to-[#1a1e28] p-5">
                <span className="text-zinc-400 text-[11px] block mb-1">Solde disponible au retrait</span>
                <div className="text-2xl font-black text-white font-mono mb-3">
                  485 000 FCFA <span className="text-xs text-zinc-400 font-sans">($795.00)</span>
                </div>
                <button className="px-4 py-2 rounded-xl bg-[#00D26A] text-black font-bold text-xs cursor-pointer hover:bg-emerald-400 transition-colors">
                  Demander un virement Wave
                </button>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 9. TAB: VÉRIFICATIONS */}
          {/* ================================================================= */}
          {activeTab === "verifications" && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400" />
                  <div>
                    <span className="font-semibold text-white block">Statut du Compte & Conformité</span>
                    <span className="text-[11px] text-zinc-400">Identité KYC validée avec succès.</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Actif</span>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* 10. TAB: CENTRE DE RÉSOLUTION */}
          {/* ================================================================= */}
          {activeTab === "resolution" && (
            <div className="rounded-xl border border-white/[0.08] bg-[#14161b] p-6 text-center text-xs space-y-2">
              <LifeBuoy className="size-8 text-zinc-500 mx-auto" />
              <h4 className="font-bold text-white">Centre de Résolution & Litiges</h4>
              <p className="text-zinc-400 text-[11px] max-w-sm mx-auto">
                Tous vos comptes et transactions sont sains. Aucun litige ou demande de remboursement ouverte.
              </p>
            </div>
          )}

        </div>

      </main>
    </div>
  );

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen: isModal && isOpen && !!onClose,
    onClose: onClose || (() => {}),
    closeOnEscape: true,
  });

  if (isModal) {
    if (!isOpen) return null;
    return (
      <div
        {...overlayProps}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200 cursor-pointer"
      >
        <div {...contentProps} className="w-full flex items-center justify-center cursor-default">
          {containerContent}
        </div>
      </div>
    );
  }

  return <div className="max-w-4xl mx-auto">{containerContent}</div>;
};
