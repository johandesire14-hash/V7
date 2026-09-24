import React, { useState } from "react";
import { ArrowLeft, Mail, Lock, User, AlertCircle, ArrowRight, Sparkles } from "lucide-react";
import { AfhubLogo } from "./AfhubLogo";
import { useAuth } from "../context/AuthContext";

interface LoginPageProps {
  onLoginSuccess: (userData?: { name: string; email: string; avatarInitials: string }) => void;
  onBackToLanding?: () => void;
  lang: "fr" | "en";
  initialMode?: "login" | "signup";
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding,
  lang,
  initialMode = "signup",
}) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemo, error, clearError } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    try {
      setLocalError(null);
      clearError();
      setIsSubmitting(true);
      await signInAsDemo("Johan Démo", "demo.createur@mansa.app");
      onLoginSuccess();
    } catch (err: any) {
      console.error("Demo login failed", err);
      setLocalError(err.message || "Échec de l'accès démo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLocalError(null);
      clearError();
      setIsSubmitting(true);
      await signInWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error("Google Auth failed", err);
      setLocalError(err.message || "Échec de la connexion avec Google.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError("Veuillez remplir tous les champs.");
      return;
    }

    try {
      setLocalError(null);
      clearError();
      setIsSubmitting(true);

      if (mode === "signup") {
        await signUpWithEmail(email, password, name.trim() || undefined);
      } else {
        await signInWithEmail(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      setLocalError(err.message || "Erreur d'authentification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000000] text-[#F1F1F1] flex flex-col items-center justify-center px-4 py-12 selection:bg-[#3DDC84]/30 selection:text-[#3DDC84]">
      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 sm:top-8 sm:left-10 flex items-center gap-2 text-xs font-semibold text-[#B6B5B0] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="size-4" />
        <span>Retour à l'accueil</span>
      </button>

      <div className="relative z-10 w-full max-w-[420px] space-y-6">
        {/* Mansa Logo & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <AfhubLogo size="xl" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
            {mode === "login"
              ? "Connexion à Mansa"
              : "Créer votre compte Mansa"}
          </h1>
          <p className="mt-1 text-xs text-[#B6B5B0]">
            {mode === "login"
              ? "Gérez vos produits digitaux et vos revenus Mobile Money en direct"
              : "Rejoignez la communauté de créateurs et monétisez en quelques clics"}
          </p>
        </div>

        {/* Tab switch between Login & Signup */}
        <div className="flex rounded-xl bg-[#151515] p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setLocalError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === "login"
                ? "bg-[#3DDC84] text-black font-bold shadow-sm"
                : "text-[#B6B5B0] hover:text-white"
            }`}
          >
            Se connecter
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setLocalError(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              mode === "signup"
                ? "bg-[#3DDC84] text-black font-bold shadow-sm"
                : "text-[#B6B5B0] hover:text-white"
            }`}
          >
            Créer un compte
          </button>
        </div>

        {/* 1-Click Instant Demo Exploration Card */}
        <div className="rounded-2xl border border-[#3DDC84]/30 bg-gradient-to-br from-[#121c15] to-[#151515] p-4.5 shadow-xl">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-[#3DDC84]/20 border border-[#3DDC84]/40 flex items-center justify-center text-[#3DDC84]">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">
                  Explorer en mode Démo (1-clic)
                </h3>
                <p className="text-[11px] text-[#B6B5B0]">
                  Accès instantané complet pour tester & créer
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="mansa-btn-green w-full py-2.5 text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Lancer la session Démo & Explorer</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* Login Box */}
        <div className="rounded-2xl border border-white/10 bg-[#151515] p-6 sm:p-7 shadow-2xl space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#B6B5B0] text-center">
            Ou connectez votre compte réel
          </div>

          {/* Error notice */}
          {(localError || error) && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* 1. Google One-Tap Real Authentication */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/15 bg-[#000000] hover:bg-white/[0.06] hover:border-[#3DDC84]/50 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm group"
          >
            <svg className="size-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.2 0 15s.7 5.4 1.9 7.8l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 15.9C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>
              {isSubmitting
                ? "Connexion en cours..."
                : mode === "login"
                ? "Continuer avec Google"
                : "S'inscrire avec Google"}
            </span>
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="w-full border-t border-white/10" />
            <span className="absolute bg-[#151515] px-3 text-[10px] font-mono uppercase text-[#B6B5B0]">
              ou par email et mot de passe
            </span>
          </div>

          {/* Email & Password Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#B6B5B0] uppercase tracking-wider mb-1">
                  Votre nom ou pseudo
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 size-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Johan Desire"
                    className="w-full rounded-xl border border-white/10 bg-[#000000] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#3DDC84] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#B6B5B0] uppercase tracking-wider mb-1">
                Adresse email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 size-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@exemple.com"
                  className="w-full rounded-xl border border-white/10 bg-[#000000] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#3DDC84] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-[#B6B5B0] uppercase tracking-wider">
                  Mot de passe
                </label>
                {mode === "login" && (
                  <span className="text-[10px] text-[#B6B5B0] hover:text-[#3DDC84] cursor-pointer">
                    Mot de passe oublié ?
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 size-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-[#000000] pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#3DDC84] outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mansa-btn-green w-full py-3 text-xs font-bold cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="size-3.5 rounded-full border-2 border-black border-t-transparent animate-spin" />
                  <span>Chargement...</span>
                </span>
              ) : (
                <>
                  <span>
                    {mode === "login"
                      ? "Se connecter"
                      : "Créer mon compte Mansa"}
                  </span>
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-[#B6B5B0] leading-relaxed">
          En vous connectant à Mansa, vous acceptez nos{" "}
          <a href="#" className="underline hover:text-white">Conditions Générales</a> et notre{" "}
          <a href="#" className="underline hover:text-white">Politique de Confidentialité</a>.
        </div>
      </div>
    </div>
  );
};
