import crypto from "crypto";
import cron from "node-cron";

export interface MansaSubscription {
  id: string;
  customerName: string;
  customerPhone: string;
  platform: "discord" | "telegram" | "mobile_money";
  platformUserId: string; // Discord User ID or Telegram User ID
  planName: string;
  amountXOF: number;
  paymentMethod: string;
  status: "active" | "expired" | "cancelled" | "pending";
  createdAt: string;
  expiresAt: string;
  lastInviteLink?: string;
  roleGranted?: string;
  customer_email?: string;
  customerEmail?: string;
  offer_id?: string;
  offerId?: string;
}

export interface WebhookLog {
  id: string;
  timestamp: string;
  eventType: string;
  platform: "discord" | "telegram";
  userId: string;
  status: string;
  signatureVerified: boolean;
  rawPayload: any;
  result: "success" | "error" | "simulated";
  message: string;
}

export interface MansaConfig {
  kpayWebhookSecret: string;
  discordBotToken: string;
  discordGuildId: string;
  telegramBotToken: string;
  telegramChatId: string;
}

// Configuration (issue uniquement des variables d'environnement)
export const mansaConfig: MansaConfig = {
  kpayWebhookSecret: process.env.KPAY_WEBHOOK_SECRET || "",
  discordBotToken: process.env.DISCORD_BOT_TOKEN || "",
  discordGuildId: process.env.DISCORD_GUILD_ID || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",
};

// Base de données en mémoire des abonnements (démarre vide)
export const subscriptionsDb: MansaSubscription[] = [];

export const webhookLogs: WebhookLog[] = [];

export function addWebhookLog(log: Omit<WebhookLog, "id" | "timestamp">): WebhookLog {
  const newLog: WebhookLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    timestamp: new Date().toISOString(),
    ...log,
  };
  webhookLogs.unshift(newLog);
  if (webhookLogs.length > 50) {
    webhookLogs.pop();
  }
  return newLog;
}

/**
 * Calcule la signature HMAC SHA-256 pour valider ou simuler un webhook KPAY
 */
export function computeKpayHmac(payload: string | object, secret: string): string {
  const data = typeof payload === "string" ? payload : JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * DISCORD: Attribue un rôle VIP à un utilisateur Discord
 */
export async function grantDiscordAccess(
  discordUserId: string,
  roleName: string,
  guildId: string = mansaConfig.discordGuildId
): Promise<{ success: boolean; mode: "live" | "simulated"; message: string }> {
  if (mansaConfig.discordBotToken && mansaConfig.discordBotToken.length > 15) {
    try {
      // 1. Récupérer les rôles du serveur via le service Discord
      const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: { Authorization: `Bot ${mansaConfig.discordBotToken}` },
      });
      if (!rolesRes.ok) {
        throw new Error(`Erreur Discord Roles: ${rolesRes.statusText}`);
      }
      const roles: any[] = await rolesRes.json();
      const targetRole = roles.find(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      );

      if (!targetRole) {
        throw new Error(`Rôle '${roleName}' introuvable sur le serveur Discord.`);
      }

      // 2. Attribuer le rôle au membre
      const assignRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${targetRole.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bot ${mansaConfig.discordBotToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!assignRes.ok) {
        throw new Error(`Impossible d'assigner le rôle: ${assignRes.statusText}`);
      }

      return {
        success: true,
        mode: "live",
        message: `Rôle '${roleName}' attribué avec succès à l'utilisateur Discord #${discordUserId} (Direct Live).`,
      };
    } catch (err: any) {
      console.error("[Discord Live Error]", err);
      // Fallback avec trace claire
      return {
        success: false,
        mode: "live",
        message: `Erreur Discord: ${err.message}`,
      };
    }
  }

  // Mode Simulation (Sans token configuré)
  return {
    success: true,
    mode: "simulated",
    message: `[SIMULATION] Rôle Discord '${roleName}' attribué à l'ID utilisateur ${discordUserId}. (Pour activer le mode réel, configurez DISCORD_BOT_TOKEN).`,
  };
}

/**
 * DISCORD: Retire un rôle VIP à un utilisateur Discord
 */
export async function revokeDiscordAccess(
  discordUserId: string,
  roleName: string,
  guildId: string = mansaConfig.discordGuildId
): Promise<{ success: boolean; mode: "live" | "simulated"; message: string }> {
  if (mansaConfig.discordBotToken && mansaConfig.discordBotToken.length > 15) {
    try {
      const rolesRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers: { Authorization: `Bot ${mansaConfig.discordBotToken}` },
      });
      const roles: any[] = await rolesRes.json();
      const targetRole = roles.find(
        (r) => r.name.toLowerCase() === roleName.toLowerCase()
      );

      if (!targetRole) {
        return { success: false, mode: "live", message: `Rôle '${roleName}' non trouvé.` };
      }

      const removeRes = await fetch(
        `https://discord.com/api/v10/guilds/${guildId}/members/${discordUserId}/roles/${targetRole.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bot ${mansaConfig.discordBotToken}` },
        }
      );

      if (!removeRes.ok) {
        throw new Error(`Erreur suppression rôle: ${removeRes.statusText}`);
      }

      return {
        success: true,
        mode: "live",
        message: `Rôle '${roleName}' retiré à l'utilisateur Discord #${discordUserId}.`,
      };
    } catch (err: any) {
      return { success: false, mode: "live", message: `Erreur Discord: ${err.message}` };
    }
  }

  return {
    success: true,
    mode: "simulated",
    message: `[SIMULATION] Rôle Discord '${roleName}' retiré à l'utilisateur #${discordUserId}.`,
  };
}

/**
 * TELEGRAM: Crée un lien d'invitation à usage unique et limité dans le temps
 */
export async function createTelegramInviteLink(
  chatId: string = mansaConfig.telegramChatId,
  expireHours: number = 24
): Promise<{ success: boolean; inviteLink: string; mode: "live" | "simulated"; message: string }> {
  if (mansaConfig.telegramBotToken && mansaConfig.telegramBotToken.length > 15) {
    try {
      const expireDate = Math.floor(Date.now() / 1000) + expireHours * 3600;
      const res = await fetch(
        `https://api.telegram.org/bot${mansaConfig.telegramBotToken}/createChatInviteLink`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            member_limit: 1, // Usage unique
            expire_date: expireDate,
            name: `Mansa VIP - ${new Date().toISOString().slice(0, 10)}`,
          }),
        }
      );

      const data: any = await res.json();
      if (!data.ok) {
        throw new Error(data.description || "Erreur service Telegram");
      }

      return {
        success: true,
        inviteLink: data.result.invite_link,
        mode: "live",
        message: "Lien d'invitation Telegram à usage unique généré avec succès.",
      };
    } catch (err: any) {
      console.error("[Telegram Live Error]", err);
      // Fallback
    }
  }

  // Génération d'un lien simulé unique
  const randomSlug = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  const simulatedLink = `https://t.me/+MansaVIP_${randomSlug}`;

  return {
    success: true,
    inviteLink: simulatedLink,
    mode: "simulated",
    message: `[SIMULATION] Lien unique généré (expire dans ${expireHours}h, 1 usage): ${simulatedLink}`,
  };
}

/**
 * TELEGRAM: Exclut un membre (banChatMember puis unbanChatMember immédiat)
 */
export async function revokeTelegramAccess(
  telegramUserId: string | number,
  chatId: string = mansaConfig.telegramChatId
): Promise<{ success: boolean; mode: "live" | "simulated"; message: string }> {
  if (mansaConfig.telegramBotToken && mansaConfig.telegramBotToken.length > 15) {
    try {
      // 1. Bannir pour expulser
      const banRes = await fetch(
        `https://api.telegram.org/bot${mansaConfig.telegramBotToken}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: Number(telegramUserId),
          }),
        }
      );
      const banData: any = await banRes.json();
      if (!banData.ok) {
        throw new Error(banData.description || "Erreur ban Telegram");
      }

      // 2. Débannir immédiatement
      await fetch(
        `https://api.telegram.org/bot${mansaConfig.telegramBotToken}/unbanChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: Number(telegramUserId),
            only_if_banned: true,
          }),
        }
      );

      return {
        success: true,
        mode: "live",
        message: `Membre Telegram #${telegramUserId} expulsé et débloqué pour réabonnement futur.`,
      };
    } catch (err: any) {
      return { success: false, mode: "live", message: `Erreur Telegram: ${err.message}` };
    }
  }

  return {
    success: true,
    mode: "simulated",
    message: `[SIMULATION] Membre Telegram #${telegramUserId} expulsé du groupe privé (ban + unban immédiat).`,
  };
}

/**
 * CRON JOB: Scanne et révoque les accès pour tous les abonnements expirés
 */
export async function runExpirationScan(): Promise<{
  scannedCount: number;
  revokedCount: number;
  details: string[];
}> {
  const now = new Date();
  const details: string[] = [];
  let revokedCount = 0;

  for (const sub of subscriptionsDb) {
    const expiresAtDate = new Date(sub.expiresAt);
    if (sub.status === "active" && expiresAtDate <= now) {
      // Abonnement expiré !
      sub.status = "expired";
      revokedCount++;

      if (sub.platform === "discord") {
        const res = await revokeDiscordAccess(sub.platformUserId, sub.roleGranted || sub.planName);
        details.push(`[Discord] ${sub.customerName} (${sub.platformUserId}) : Rôle révoqué -> ${res.message}`);
      } else if (sub.platform === "telegram") {
        const res = await revokeTelegramAccess(sub.platformUserId);
        details.push(`[Telegram] ${sub.customerName} (${sub.platformUserId}) : Expulsé du groupe -> ${res.message}`);
      }
    }
  }

  // Log de l'opération
  addWebhookLog({
    eventType: "cron_daily_expiration_scan",
    platform: "discord",
    userId: "SYSTEM_CRON",
    status: "completed",
    signatureVerified: true,
    rawPayload: { scanned: subscriptionsDb.length, revoked: revokedCount },
    result: "success",
    message: `Scan quotidien terminé: ${revokedCount} abonnements expirés révoqués automatiquement.`,
  });

  return {
    scannedCount: subscriptionsDb.length,
    revokedCount,
    details,
  };
}

// Initialisation du cron quotidien (exécute à 02:00 chaque jour)
export function initMansaCron() {
  cron.schedule("0 2 * * *", async () => {
    console.log("[Mansa CRON] Démarrage du scan automatique de 02:00 AM...");
    await runExpirationScan();
  });
  console.log("[Mansa CRON] Tâche planifiée activée (tous les jours à 02:00 AM)");
}
