export interface CompanyPost {
  id: string;
  companyId: string;
  companyName?: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  timestamp: number;
  pinned?: boolean;
  likesCount: number;
  commentsCount: number;
  category?: string;
  metrics?: Array<{ label: string; value: string }>;
  attachment?: {
    name: string;
    size: string;
    type: string;
  };
}

const STORAGE_KEY = "mansa_company_newsfeed_posts";

const DEFAULT_CADRE_POSTS: CompanyPost[] = [
  {
    id: "post-cadre-1",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    title: "🎯 Point de Marché Hebdomadaire & Alertes Algorithmiques",
    content:
      "Bienvenue à tous les membres de la communauté Cadre financier ! Les analyses techniques détaillées et les ordres protégés sont en ligne dans vos canaux respectifs. Rappel essentiel : respectez rigoureusement votre gestion du risque.",
    authorName: "Cadre financier Labs",
    createdAt: "Il y a 2h",
    timestamp: Date.now() - 7200000,
    pinned: true,
    likesCount: 64,
    commentsCount: 18,
    category: "Annonce Officielle",
  },
  {
    id: "post-cadre-2",
    companyId: "comp-cadre-financier",
    companyName: "Cadre financier",
    title: "⚡ Déploiement des Bots Telegram & Discord v2.4",
    content:
      "La latence d'envoi de nos alertes instantanées est désormais réduite sous la barre des 250ms. Tous les canaux et accès ont été synchronisés avec succès.",
    authorName: "Cadre financier Labs",
    createdAt: "Il y a 6h",
    timestamp: Date.now() - 21600000,
    pinned: false,
    likesCount: 42,
    commentsCount: 9,
    category: "Mise à jour technique",
  },
];

export function getAllStoredPosts(): CompanyPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CADRE_POSTS));
      return DEFAULT_CADRE_POSTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return DEFAULT_CADRE_POSTS;
  } catch {
    return DEFAULT_CADRE_POSTS;
  }
}

export function saveAllPosts(posts: CompanyPost[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent("mansa_company_posts_updated"));
  } catch (err) {
    console.error("Erreur sauvegarde actualités :", err);
  }
}

export function getPostsForCompany(companyId: string, companyName?: string): CompanyPost[] {
  const all = getAllStoredPosts();
  const normalizedId = (companyId || "").trim().toLowerCase();
  const normalizedName = (companyName || "").trim().toLowerCase();

  const filtered = all.filter((p) => {
    const pId = (p.companyId || "").trim().toLowerCase();
    const pName = (p.companyName || "").trim().toLowerCase();
    return pId === normalizedId || (normalizedName && pName && pName === normalizedName);
  });

  if (filtered.length === 0 && (normalizedId || normalizedName)) {
    // Si c'est Cadre financier, on réinjecte ses posts initiaux
    if (normalizedId.includes("cadre") || normalizedName.includes("cadre")) {
      const cadrePosts = DEFAULT_CADRE_POSTS;
      saveAllPosts([...all, ...cadrePosts]);
      return cadrePosts;
    }

    // Pour toute nouvelle entreprise, on crée un post d'accueil exclusif à CETTE entreprise
    const initialWelcomePost: CompanyPost = {
      id: `post-welcome-${companyId}-${Date.now()}`,
      companyId: companyId,
      companyName: companyName,
      title: `Bienvenue dans la communauté de ${companyName || "notre entreprise"}`,
      content: `Bienvenue dans l'espace officiel de ${companyName || "notre entreprise"}. Retrouvez ici toutes les actualités exclusives, annonces officielles et ressources publiées par l'équipe.`,
      authorName: companyName || "Créateur",
      createdAt: "Récemment",
      timestamp: Date.now(),
      pinned: true,
      likesCount: 1,
      commentsCount: 0,
      category: "Bienvenue",
    };
    const updated = [initialWelcomePost, ...all];
    saveAllPosts(updated);
    return [initialWelcomePost];
  }

  return filtered.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.timestamp - a.timestamp;
  });
}

export function createCompanyPost(
  companyId: string,
  companyName: string,
  data: {
    title: string;
    content: string;
    authorName: string;
    pinned?: boolean;
    category?: string;
  }
): CompanyPost {
  const all = getAllStoredPosts();
  const newPost: CompanyPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    companyId,
    companyName,
    title: data.title.trim(),
    content: data.content.trim(),
    authorName: data.authorName || companyName,
    createdAt: "À l'instant",
    timestamp: Date.now(),
    pinned: Boolean(data.pinned),
    likesCount: 0,
    commentsCount: 0,
    category: data.category || "Annonce",
  };

  const updated = [newPost, ...all];
  saveAllPosts(updated);
  return newPost;
}

export function deleteCompanyPost(postId: string, companyId: string): void {
  const all = getAllStoredPosts();
  const normalizedId = (companyId || "").trim().toLowerCase();
  const updated = all.filter(
    (p) => !(p.id === postId && (p.companyId.trim().toLowerCase() === normalizedId))
  );
  saveAllPosts(updated);
}
