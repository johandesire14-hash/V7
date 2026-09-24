import React, { useState, useRef } from "react";
import {
  X,
  Camera,
  Image as ImageIcon,
  User,
  Upload,
  Check,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";
import { useModalDismiss } from "../../hooks/useModalDismiss";

interface EnterpriseBrandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: {
    id: string;
    name: string;
    description?: string;
    companyBanner?: string;
    companyLogo?: string;
  };
  onSave: (branding: {
    name: string;
    description: string;
    companyBanner: string;
    companyLogo: string;
  }) => void;
  lang?: "fr" | "en";
}

const BANNER_PRESETS = [
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
];

const LOGO_PRESETS = [
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
];

export const EnterpriseBrandingModal: React.FC<EnterpriseBrandingModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave,
  lang = "fr",
}) => {
  const [name, setName] = useState(company.name || "");
  const [description, setDescription] = useState(company.description || "");
  const [companyBanner, setCompanyBanner] = useState(
    company.companyBanner ||
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1800&q=85"
  );
  const [companyLogo, setCompanyLogo] = useState(
    company.companyLogo ||
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
  );
  const [isSaved, setIsSaved] = useState(false);

  const bannerFileRef = useRef<HTMLInputElement | null>(null);
  const logoFileRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || company.name,
      description: description.trim(),
      companyBanner: companyBanner.trim(),
      companyLogo: companyLogo.trim(),
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const { overlayProps, contentProps } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEscape: true,
  });

  return (
    <div
      {...overlayProps}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150 cursor-pointer"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md pointer-events-none"
      />

      {/* Modal Dialog */}
      <div
        {...contentProps}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-white/10 bg-[#0c0d10] p-5 sm:p-7 shadow-2xl z-10 space-y-6 cursor-default"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Camera className="size-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {lang === "fr"
                  ? "Personnaliser la Bannière & le Logo"
                  : "Customize Banner & Profile Photo"}
              </h3>
              <p className="text-xs text-zinc-400">
                {lang === "fr"
                  ? "Configurez l'identité visuelle de votre entreprise Mansa."
                  : "Configure your company's visual branding and storefront."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Live Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
            {lang === "fr" ? "Aperçu en temps réel" : "Real-time preview"}
          </span>
          <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-white/10 bg-[#14161f] shadow-inner group">
            <img
              src={companyBanner}
              alt="Bannière"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

            {/* Profile Photo Overlaid */}
            <div className="absolute bottom-3 left-4 flex items-end gap-3 z-10">
              <div className="relative size-16 sm:size-20 rounded-2xl border-2 border-black bg-[#121316] shadow-xl overflow-hidden shrink-0">
                <img
                  src={companyLogo}
                  alt="Logo"
                  className="size-full object-cover"
                />
                <span className="absolute bottom-1 right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-black" />
              </div>
              <div className="text-white drop-shadow-md pb-0.5">
                <h4 className="text-sm font-bold tracking-tight">
                  {name || company.name}
                </h4>
                <p className="text-[11px] text-zinc-300 line-clamp-1">
                  {description || "Holding digitale & communauté privée"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Company Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Nom de l'entreprise
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#00D26A]"
                required
              />
            </div>
            <div>
              <label className="block text-zinc-300 font-semibold mb-1">
                Slogan ou courte description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16181f] p-2.5 text-white outline-none focus:border-[#00D26A]"
              />
            </div>
          </div>

          {/* Banner Setting */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-white/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Bannière de l'entreprise
                </span>
              </div>
              <div>
                <input
                  ref={bannerFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => bannerFileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="size-3" />
                  <span>Téléverser</span>
                </button>
              </div>
            </div>

            <input
              type="url"
              value={companyBanner}
              onChange={(e) => setCompanyBanner(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0e12] p-2.5 text-xs font-mono text-zinc-200 outline-none focus:border-[#00D26A]"
            />

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {BANNER_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setCompanyBanner(preset.url)}
                  className={`relative h-11 rounded-lg overflow-hidden border transition-all text-left p-1 cursor-pointer ${
                    companyBanner === preset.url
                      ? "border-[#00D26A] ring-1 ring-[#00D26A]"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="absolute inset-0 size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 hover:bg-black/30" />
                  <span className="relative z-10 text-[9px] font-bold text-white block line-clamp-1">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Profile Photo / Logo Setting */}
          <div className="p-4 rounded-2xl bg-[#14151a] border border-white/5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <User className="size-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">
                  Photo de profil / Logo de l'entreprise
                </span>
              </div>
              <div>
                <input
                  ref={logoFileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoFileRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Upload className="size-3" />
                  <span>Téléverser</span>
                </button>
              </div>
            </div>

            <input
              type="url"
              value={companyLogo}
              onChange={(e) => setCompanyLogo(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-[#0d0e12] p-2.5 text-xs font-mono text-zinc-200 outline-none focus:border-[#00D26A]"
            />

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LOGO_PRESETS.map((preset) => (
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
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="size-7 rounded-md object-cover shrink-0"
                  />
                  <span className="text-[10px] font-semibold text-zinc-200 line-clamp-1">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#00D26A] hover:bg-[#00c060] text-black text-xs font-bold transition-all shadow-lg shadow-[#00D26A]/20 cursor-pointer flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="size-4 text-black" />
                  <span>Enregistré !</span>
                </>
              ) : (
                <>
                  <Check className="size-4 text-black" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
