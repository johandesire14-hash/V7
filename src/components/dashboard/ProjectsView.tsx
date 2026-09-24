import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Users,
  Copy,
  Check,
  Edit3,
  Trash2,
  Layers,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Box,
  Share2,
  Zap,
  Globe,
  Tag,
  ShieldCheck,
  X,
  FileText,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import { BusinessProject } from "../../types";
import { CurrencyCode, formatCurrency, convertFromUSD } from "../../utils/currency";
import { ConfirmActionModal } from "../common/ConfirmActionModal";
import { ModalOverlay } from "../common/ModalOverlay";

interface ProjectsViewProps {
  lang?: "fr" | "en";
  currentCurrency?: CurrencyCode | string;
  onOpenProductStudio?: () => void;
  onOpenAiBuilder?: (prompt?: string, category?: string) => void;
  projects: BusinessProject[];
  onUpdateProject: (project: BusinessProject) => void;
  onDeleteProject: (projectId: string) => void;
  onAddProject: (project: BusinessProject) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  lang = "fr",
  currentCurrency = "USD",
  onOpenProductStudio,
  onOpenAiBuilder,
  projects,
  onUpdateProject,
  onDeleteProject,
  onAddProject,
}) => {
  const activeCurrency: CurrencyCode = (currentCurrency as CurrencyCode) || "USD";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick edit modal state
  const [editingProject, setEditingProject] = useState<BusinessProject | null>(null);
  const [quickEditForm, setQuickEditForm] = useState<Partial<BusinessProject>>({});
  const [projectToDelete, setProjectToDelete] = useState<BusinessProject | null>(null);

  // New Project Modal
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState<Partial<BusinessProject>>({
    name: "",
    tagline: "",
    category: "community",
    pricingAmount: 29,
    pricingModel: "subscription",
    targetAudience: "Créateurs et passionnés",
    status: "active",
    features: ["Accès Discord & Telegram", "Ressources exclusives", "Support direct"],
    techStack: ["Mansa Checkout", "Discord Sync", "Telegram Webhook"],
    estimatedMonthlyRevenue: 1450,
    affiliateCommissionRate: 30,
    membersCount: 0,
    conversionRate: "5.0%",
    apps: ["Discord VIP", "Telegram VIP", "Mansa Checkout"],
  });

  // Filtered projects
  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.targetAudience.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || proj.category.toLowerCase() === selectedCategory.toLowerCase();

    const matchesStatus =
      selectedStatus === "all" || proj.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjectsCount = projects.filter((p) => p.status === "active").length;
  const totalEstimatedMRR = projects.reduce((acc, p) => acc + (p.status === "active" ? p.estimatedMonthlyRevenue : 0), 0);
  const totalMembers = projects.reduce((acc, p) => acc + p.membersCount, 0);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard?.writeText?.(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenQuickEdit = (proj: BusinessProject) => {
    setEditingProject(proj);
    setQuickEditForm({ ...proj });
  };

  const handleSaveQuickEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const updated: BusinessProject = {
      ...editingProject,
      ...quickEditForm,
      updatedAt: new Date().toISOString().split("T")[0],
    };

    onUpdateProject(updated);
    setEditingProject(null);
  };

  const handleQuickStatusToggle = (proj: BusinessProject, newStatus: "active" | "draft" | "paused") => {
    onUpdateProject({
      ...proj,
      status: newStatus,
      updatedAt: new Date().toISOString().split("T")[0],
    });
  };

  const handleDuplicate = (proj: BusinessProject) => {
    const duplicated: BusinessProject = {
      ...proj,
      id: "proj-" + Date.now(),
      name: `${proj.name} (Copie)`,
      status: "draft",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      storeUrl: `mansa.app/${proj.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-copie`,
    };
    onAddProject(duplicated);
  };

  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectForm.name?.trim()) return;

    const newProj: BusinessProject = {
      id: "proj-" + Date.now(),
      name: newProjectForm.name.trim(),
      tagline: newProjectForm.tagline?.trim() || "Communauté privée et accompagnement exclusif pour nos membres.",
      category: newProjectForm.category || "community",
      pricingAmount: Number(newProjectForm.pricingAmount) || 29,
      pricingModel: newProjectForm.pricingModel || "subscription",
      currency: currentCurrency,
      targetAudience: newProjectForm.targetAudience || "Membres et passionnés",
      status: newProjectForm.status || "active",
      features: newProjectForm.features || ["Accès Discord & Telegram", "Ressources hebdomadaires"],
      techStack: newProjectForm.techStack || ["Mansa Checkout", "Discord Sync"],
      estimatedMonthlyRevenue: Number(newProjectForm.pricingAmount) * 20,
      affiliateCommissionRate: Number(newProjectForm.affiliateCommissionRate) || 30,
      membersCount: 0,
      conversionRate: "5.0%",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      apps: newProjectForm.apps || ["Discord VIP", "Mansa Checkout"],
      storeUrl: `mansa.app/${newProjectForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    };

    onAddProject(newProj);
    setIsCreatingProject(false);
    setNewProjectForm({
      name: "",
      tagline: "",
      category: "community",
      pricingAmount: 29,
      pricingModel: "subscription",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header with Stats & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500 font-mono">
              {totalProjects} {totalProjects > 1 ? "projets enregistrés" : "projet enregistré"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {lang === "fr" ? "Mes Projets & Communautés" : "My Projects & Communities"}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            {lang === "fr"
              ? "Gérez vos abonnements, serveurs Discord/Telegram, tunnels de vente et offres numériques en un seul endroit."
              : "Manage your subscriptions, Discord/Telegram communities, sales funnels, and digital offers in one place."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenProductStudio && (
            <button
              onClick={onOpenProductStudio}
              className="mansa-btn-dark px-4 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2 border border-white/15 hover:border-[#00D26A]/50"
            >
              <Sliders className="size-4 text-[#00D26A]" />
              <span>Studio Produit</span>
            </button>
          )}

          <button
            onClick={() => setIsCreatingProject(true)}
            className="mansa-btn-green px-5 py-2.5 text-xs font-bold cursor-pointer flex items-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
          >
            <Plus className="size-4" />
            <span>Nouveau Projet</span>
          </button>
        </div>
      </div>

      {/* 2. Overview Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Projects */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121316] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Total des Projets</span>
            <Box className="size-4 text-[#00D26A]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalProjects}</div>
          <div className="text-[11px] text-zinc-500 font-medium">
            <span className="text-[#00D26A] font-bold">{activeProjectsCount} actifs</span> en production
          </div>
        </div>

        {/* Estimated MRR */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121316] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">MRR Estimé</span>
            <TrendingUp className="size-4 text-[#00D26A]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatCurrency(totalEstimatedMRR, activeCurrency, { compact: true })}
          </div>
          <div className="text-[11px] text-[#00D26A] font-medium">
            +18.4% ce mois
          </div>
        </div>

        {/* Total Members */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121316] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Membres Cumulés</span>
            <Users className="size-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalMembers.toLocaleString()}
          </div>
          <div className="text-[11px] text-zinc-400">
            Discord & Telegram VIP
          </div>
        </div>

        {/* Average Conversion */}
        <div className="p-4 rounded-2xl border border-white/10 bg-[#121316] space-y-1">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span className="font-medium">Taux Moyen de Conversion</span>
            <Zap className="size-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">6.8%</div>
          <div className="text-[11px] text-zinc-400">
            Checkout optimisé 0-friction
          </div>
        </div>

      </div>

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl border border-white/[0.08] bg-[#101114]">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 size-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "fr"
                ? "Rechercher par nom, thématique, audience..."
                : "Search by name, category, audience..."
            }
            className="w-full rounded-xl border border-white/10 bg-[#16181f] pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#00D26A] outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#16181f] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#00D26A] cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            <option value="community">Communautés VIP</option>
            <option value="trading">Trading & Signaux</option>
            <option value="software">SaaS & Logiciels</option>
            <option value="courses">Formations & Vidéos</option>
            <option value="ecommerce">E-Commerce</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#16181f] px-3 py-2 text-xs text-zinc-300 outline-none focus:border-[#00D26A] cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs (En ligne)</option>
            <option value="draft">Brouillons</option>
            <option value="paused">En pause</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#16181f] p-0.5 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-[#252830] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Grille
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-[#252830] text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              Tableau
            </button>
          </div>

        </div>
      </div>

      {/* 4. Projects Listing (Grid / Table) */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-white/[0.08] bg-[#101114] p-8 space-y-4">
          <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-400">
            <Box className="size-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Aucun projet trouvé</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Aucun projet ne correspond à vos critères de recherche. Créez un nouveau projet ou réinitialisez les filtres.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
              className="mansa-btn-dark px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
            <button
              onClick={() => setIsCreatingProject(true)}
              className="mansa-btn-green px-4 py-2 text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>Créer un projet</span>
            </button>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => {
            const isCopied = copiedId === proj.id;
            const priceFormatted = formatCurrency(proj.pricingAmount, activeCurrency);
            const mrrFormatted = formatCurrency(proj.estimatedMonthlyRevenue, activeCurrency, { compact: true });

            return (
              <div
                key={proj.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#101114] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-[#00D26A]/40 hover:bg-[#14161b] shadow-xl"
              >
                <div>
                  
                  {/* Card Header: Category & Status Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase">
                      {proj.category}
                    </span>
                  </div>

                  {/* Project Name & Tagline */}
                  <h3 className="text-base font-bold text-white group-hover:text-[#00D26A] transition-colors line-clamp-1">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed font-light">
                    {proj.tagline}
                  </p>

                  {/* Pricing and Revenue Highlights */}
                  <div className="mt-4 grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#16181f] border border-white/5 text-xs">
                    <div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">Tarif</div>
                      <div className="text-sm font-black text-white font-mono">
                        {priceFormatted}
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {proj.pricingModel === "subscription" ? "/m" : " unique"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 font-mono uppercase">MRR / Revenu</div>
                      <div className="text-sm font-black text-[#00D26A] font-mono">{mrrFormatted}</div>
                    </div>
                  </div>

                  {/* Apps / Integrations tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {proj.apps.slice(0, 3).map((app, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] text-zinc-400 font-mono"
                      >
                        {app}
                      </span>
                    ))}
                    {proj.apps.length > 3 && (
                      <span className="text-[10px] text-zinc-500 font-mono">+{proj.apps.length - 3}</span>
                    )}
                  </div>

                </div>

                {/* Card Footer: Quick Actions */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  
                  {/* Copy Link button */}
                  <button
                    onClick={() => handleCopyLink(`https://${proj.storeUrl}`, proj.id)}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Copier le lien direct du projet"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3.5 text-[#00D26A]" />
                        <span className="text-[#00D26A] font-semibold text-[11px]">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        <span className="text-[11px]">Lien</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    
                    {/* Status Toggle Quick Button */}
                    <button
                      onClick={() =>
                        handleQuickStatusToggle(
                          proj,
                          proj.status === "active" ? "paused" : "active"
                        )
                      }
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title={proj.status === "active" ? "Mettre en pause" : "Activer"}
                    >
                      {proj.status === "active" ? (
                        <PauseCircle className="size-4 text-amber-400" />
                      ) : (
                        <PlayCircle className="size-4 text-[#00D26A]" />
                      )}
                    </button>

                    {/* Quick Edit */}
                    <button
                      onClick={() => handleOpenQuickEdit(proj)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Modifier les détails"
                    >
                      <Edit3 className="size-4" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setProjectToDelete(proj)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="Supprimer ce projet"
                    >
                      <Trash2 className="size-4" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-white/[0.08] bg-[#101114] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="border-b border-white/[0.08] bg-[#14161d] text-[11px] font-mono uppercase text-zinc-400">
                <tr>
                  <th className="p-4 font-bold">Nom du Projet</th>
                  <th className="p-4 font-bold">Catégorie</th>
                  <th className="p-4 font-bold">Prix</th>
                  <th className="p-4 font-bold">Membres</th>
                  <th className="p-4 font-bold">MRR Estimé</th>
                  <th className="p-4 font-bold">Statut</th>
                  <th className="p-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredProjects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white">{proj.name}</div>
                      <div className="text-[11px] text-zinc-500 line-clamp-1">{proj.tagline}</div>
                    </td>
                    <td className="p-4 font-mono text-zinc-400 uppercase">{proj.category}</td>
                    <td className="p-4 font-mono font-bold text-white">
                      {formatCurrency(proj.pricingAmount, activeCurrency)}
                    </td>
                    <td className="p-4 font-mono">{proj.membersCount}</td>
                    <td className="p-4 font-mono font-bold text-[#00D26A]">
                      {formatCurrency(proj.estimatedMonthlyRevenue, activeCurrency)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          proj.status === "active"
                            ? "text-[#00D26A]"
                            : proj.status === "paused"
                            ? "text-amber-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {proj.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenQuickEdit(proj)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5"
                        >
                          <Edit3 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => setProjectToDelete(proj)}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                          title="Supprimer ce projet"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK EDIT MODAL */}
      <ModalOverlay
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        contentClassName="max-w-xl mx-auto"
      >
        {editingProject && (
          <div className="w-full rounded-3xl border border-white/10 bg-[#121316] p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#00D26A] font-bold">Édition Rapide</span>
                <h3 className="text-lg font-bold text-white">{editingProject.name}</h3>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickEdit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Nom du projet</label>
                <input
                  type="text"
                  value={quickEditForm.name || ""}
                  onChange={(e) => setQuickEditForm({ ...quickEditForm, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Description / Tagline</label>
                <textarea
                  value={quickEditForm.tagline || ""}
                  onChange={(e) => setQuickEditForm({ ...quickEditForm, tagline: e.target.value })}
                  rows={2}
                  className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Prix ($)</label>
                  <input
                    type="number"
                    value={quickEditForm.pricingAmount || ""}
                    onChange={(e) =>
                      setQuickEditForm({ ...quickEditForm, pricingAmount: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Statut</label>
                  <select
                    value={quickEditForm.status || "active"}
                    onChange={(e) =>
                      setQuickEditForm({
                        ...quickEditForm,
                        status: e.target.value as "active" | "draft" | "paused",
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3 py-2 text-xs text-white outline-none focus:border-[#00D26A] cursor-pointer"
                  >
                    <option value="active">Actif</option>
                    <option value="draft">Brouillon</option>
                    <option value="paused">En pause</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="mansa-btn-green px-5 py-2 text-xs font-bold cursor-pointer"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalOverlay>

      {/* CREATE NEW PROJECT MODAL */}
      <ModalOverlay
        isOpen={isCreatingProject}
        onClose={() => setIsCreatingProject(false)}
        contentClassName="max-w-xl mx-auto"
      >
        <div className="w-full rounded-3xl border border-white/10 bg-[#121316] p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#00D26A] font-bold">Nouveau Projet</span>
              <h3 className="text-lg font-bold text-white">Créer une offre ou communauté</h3>
            </div>
            <button
              onClick={() => setIsCreatingProject(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <form onSubmit={handleCreateNewProject} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Nom du projet *</label>
              <input
                type="text"
                value={newProjectForm.name || ""}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                placeholder="ex. Club Privé Passion Design"
                className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Description courte</label>
              <textarea
                value={newProjectForm.tagline || ""}
                onChange={(e) => setNewProjectForm({ ...newProjectForm, tagline: e.target.value })}
                rows={2}
                placeholder="Ce que vos membres vont recevoir..."
                className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Catégorie</label>
                <select
                  value={newProjectForm.category || "community"}
                  onChange={(e) => setNewProjectForm({ ...newProjectForm, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3 py-2 text-xs text-white outline-none focus:border-[#00D26A] cursor-pointer"
                >
                  <option value="community">Communauté VIP</option>
                  <option value="software">Logiciel & SaaS</option>
                  <option value="courses">Formation Vidéo</option>
                  <option value="digital">Fichiers & Templates</option>
                  <option value="trading">Analyses & Signaux</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Prix mensuel (€ / $)</label>
                <input
                  type="number"
                  value={newProjectForm.pricingAmount || ""}
                  onChange={(e) =>
                    setNewProjectForm({ ...newProjectForm, pricingAmount: Number(e.target.value) })
                  }
                  placeholder="29"
                  className="w-full rounded-xl border border-white/10 bg-[#181a20] px-3.5 py-2 text-xs text-white outline-none focus:border-[#00D26A]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="mansa-btn-green px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Créer le projet
              </button>
            </div>
          </form>
        </div>
      </ModalOverlay>

      {/* CONFIRM PROJECT DELETION MODAL */}
      {projectToDelete && (
        <ConfirmActionModal
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          onConfirm={() => {
            onDeleteProject(projectToDelete.id);
            setProjectToDelete(null);
          }}
          title={lang === "fr" ? "Supprimer ce projet ?" : "Delete this project?"}
          description={
            lang === "fr"
              ? `Êtes-vous certain de vouloir supprimer le projet "${projectToDelete.name}" ? Cette action est irréversible et effacera l'ensemble de ses automatisations.`
              : `Are you sure you want to delete the project "${projectToDelete.name}"? This action is irreversible.`
          }
          itemName={projectToDelete.name}
          itemType={lang === "fr" ? "Projet Mansa" : "Mansa Project"}
          itemDetails={[
            { label: "Catégorie", value: projectToDelete.category },
            { label: "Membres actifs", value: String(projectToDelete.membersCount) },
            { label: "Revenu MRR", value: formatCurrency(projectToDelete.estimatedMonthlyRevenue, activeCurrency) },
          ]}
          consequences={[
            lang === "fr"
              ? "Les liens publics associés deviendront inaccessibles."
              : "Associated public links will become unreachable.",
            lang === "fr"
              ? "La configuration et les tunnels d'intégration seront supprimés."
              : "Configuration and integration funnels will be deleted.",
          ]}
          confirmButtonText={lang === "fr" ? "Supprimer le projet" : "Delete Project"}
          cancelButtonText={lang === "fr" ? "Annuler" : "Cancel"}
          variant="danger"
          lang={lang}
        />
      )}

    </div>
  );
};
