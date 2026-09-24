import { Telegraf } from "telegraf";
import { getTelegramConfig } from "./telegramConfig.js";

export interface TelegramChannelMeta {
  chatId: string | number;
  title: string;
  type: "channel" | "group" | "supergroup" | "private";
  username?: string;
  memberCount: number;
  testInviteLink?: string;
  verifiedAt: string;
}

export interface VerificationCodeEntry {
  code: string;
  creatorId?: string;
  createdAt: number;
  expiresAt: number;
  status: "pending" | "verified" | "consumed";
  channelInfo?: TelegramChannelMeta;
}

// Registre en mémoire des codes de vérification
class TelegramVerificationRegistry {
  private codes = new Map<string, VerificationCodeEntry>();
  private connectedChannels = new Map<string, TelegramChannelMeta>();

  /**
   * Génère un code aléatoire à 6 caractères sans caractères ambigus (0, O, 1, I)
   */
  generateCode(creatorId?: string): VerificationCodeEntry {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
    let code = "";
    
    // Génération d'un code unique non existant
    do {
      code = "";
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.codes.has(code) && (this.codes.get(code)!.status === "pending"));

    const now = Date.now();
    const entry: VerificationCodeEntry = {
      code,
      creatorId,
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000, // Valide 15 minutes
      status: "pending",
    };

    this.codes.set(code, entry);
    console.log(`🔑 [Telegram Service] Nouveau code généré : ${code} (créateur: ${creatorId || "anonyme"})`);
    return entry;
  }

  /**
   * Vérifie l'état d'un code de vérification
   */
  getCode(code: string): VerificationCodeEntry | undefined {
    const upper = code.trim().toUpperCase();
    return this.codes.get(upper);
  }

  /**
   * Marque un code comme vérifié avec les données réelles du canal Telegram
   */
  verifyCode(code: string, channelInfo: TelegramChannelMeta): boolean {
    const upper = code.trim().toUpperCase();
    const entry = this.codes.get(upper);
    
    if (!entry) {
      // Si le code a été généré côté client ou avant redémarrage, on crée une entrée à la volée
      const now = Date.now();
      const newEntry: VerificationCodeEntry = {
        code: upper,
        createdAt: now,
        expiresAt: now + 15 * 60 * 1000,
        status: "verified",
        channelInfo,
      };
      this.codes.set(upper, newEntry);
      this.connectedChannels.set(String(channelInfo.chatId), channelInfo);
      console.log(`✅ [Telegram Service] Code ${upper} validé à la volée pour le canal "${channelInfo.title}" (${channelInfo.chatId})`);
      return true;
    }

    if (entry.status === "consumed") {
      console.warn(`⚠️ [Telegram Service] Le code ${upper} a déjà été consommé.`);
      return false;
    }

    entry.status = "verified";
    entry.channelInfo = channelInfo;
    this.connectedChannels.set(String(channelInfo.chatId), channelInfo);
    
    console.log(`✅ [Telegram Service] Code ${upper} VERIFIÉ avec succès pour "${channelInfo.title}" (${channelInfo.chatId})`);
    return true;
  }

  /**
   * Consomme le code pour éviter qu'il ne soit réutilisé
   */
  consumeCode(code: string): VerificationCodeEntry | null {
    const upper = code.trim().toUpperCase();
    const entry = this.codes.get(upper);
    if (!entry) return null;

    entry.status = "consumed";
    return entry;
  }

  /**
   * Retourne tous les canaux actuellement synchronisés
   */
  getAllConnectedChannels(): TelegramChannelMeta[] {
    return Array.from(this.connectedChannels.values());
  }
}

export const telegramRegistry = new TelegramVerificationRegistry();

/**
 * Instance du Bot Telegram
 */
let botInstance: Telegraf | null = null;

export function initTelegramBot(): Telegraf {
  if (botInstance) {
    return botInstance;
  }

  const config = getTelegramConfig();
  const bot = new Telegraf(config.token);

  // 1. Logger tous les événements
  bot.use(async (ctx, next) => {
    const updateType = ctx.updateType;
    const chat = ctx.chat;
    const from = ctx.from;

    if (chat) {
      const chatId = chat.id;
      const chatType = chat.type;
      const chatTitle = "title" in chat ? chat.title : `@${from?.username || from?.first_name || "utilisateur"}`;
      
      let messageText = "[Média ou Action]";
      if (ctx.message && "text" in ctx.message) {
        messageText = ctx.message.text;
      } else if (ctx.channelPost && "text" in ctx.channelPost) {
        messageText = ctx.channelPost.text;
      }

      console.log(`📩 [Telegram] ${chatType} (${chatId}) | ${chatTitle} : "${messageText}"`);
    }

    return next();
  });

  // Fonction utilitaire pour traiter un code reçu dans un canal ou groupe
  const handlePotentialCode = async (ctx: any, text: string) => {
    // Nettoyer le texte
    const cleanText = text.trim();
    
    // Extraire un éventuel code à 6 caractères (ex: "QFWWOC", "/verify QFWWOC", "Voici mon code ABC123")
    const match = cleanText.match(/\b([A-Z0-9]{6})\b/i);
    if (!match) return false;

    const extractedCode = match[1].toUpperCase();
    const chat = ctx.chat;
    if (!chat) return false;

    const chatId = chat.id;
    const chatType = chat.type as "channel" | "group" | "supergroup" | "private";
    const chatTitle = "title" in chat ? chat.title : `@${ctx.from?.username || "Canal Telegram"}`;

    console.log(`🔍 [Telegram Bot] Code détecté : "${extractedCode}" dans le chat ${chatTitle} (${chatId})`);

    // Obtenir le nombre de membres
    let memberCount = 1;
    try {
      if (ctx.telegram.getChatMemberCount) {
        memberCount = await ctx.telegram.getChatMemberCount(chatId);
      } else if (ctx.telegram.getChatMembersCount) {
        memberCount = await (ctx.telegram as any).getChatMembersCount(chatId);
      }
    } catch (e: any) {
      console.warn("Impossible de récupérer le nombre de membres:", e.message);
    }

    // Tester la création d'un lien d'invitation pour valider les droits administrateurs
    let testInviteLink = "";
    try {
      const invite = await ctx.telegram.createChatInviteLink(chatId, {
        member_limit: 1,
        name: "Liaison Mansa",
      });
      testInviteLink = invite.invite_link;
    } catch (e: any) {
      console.warn("Info: Impossible de créer un lien test (permissions limitées ?) :", e.message);
    }

    const channelMeta: TelegramChannelMeta = {
      chatId,
      title: chatTitle,
      type: chatType,
      username: "username" in chat ? chat.username : undefined,
      memberCount,
      testInviteLink,
      verifiedAt: new Date().toISOString(),
    };

    // Valider le code dans le registre
    const success = telegramRegistry.verifyCode(extractedCode, channelMeta);

    if (success) {
      const confirmationText = 
        `✅ **Canal synchronisé avec succès !**\n\n` +
        `📛 **Nom :** ${chatTitle}\n` +
        `🆔 **ID :** \`${chatId}\`\n` +
        `👥 **Membres :** ${memberCount}\n` +
        `🔑 **Code vérifié :** \`${extractedCode}\`\n\n` +
        `👉 Retournez sur votre tableau de bord Mansa : les informations de votre canal ont été transmises pour finaliser votre produit.`;

      try {
        if (chatType === "channel") {
          await ctx.telegram.sendMessage(chatId, confirmationText, { parse_mode: "Markdown" });
        } else {
          await ctx.reply(confirmationText, { parse_mode: "Markdown" });
        }
      } catch (err: any) {
        // Fallback sans markdown en cas d'erreur de parsing
        if (chatType === "channel") {
          await ctx.telegram.sendMessage(chatId, `✅ Canal "${chatTitle}" synchronisé avec succès pour Mansa (Code: ${extractedCode}) ! Retournez sur votre tableau de bord.`);
        } else {
          await ctx.reply(`✅ Groupe "${chatTitle}" synchronisé avec succès pour Mansa (Code: ${extractedCode}) ! Retournez sur votre tableau de bord.`);
        }
      }
      return true;
    }

    return false;
  };

  // 2. Écoute des posts de canaux (channel_post)
  bot.on("channel_post", async (ctx) => {
    try {
      const text = ctx.channelPost && "text" in ctx.channelPost ? ctx.channelPost.text : "";
      if (!text) return;

      await handlePotentialCode(ctx, text);
    } catch (err: any) {
      console.error("Erreur channel_post:", err.message);
    }
  });

  // 3. Écoute des messages dans les groupes et en privé
  bot.on("text", async (ctx, next) => {
    try {
      const text = ctx.message.text;
      const handled = await handlePotentialCode(ctx, text);
      if (handled) return;
    } catch (err: any) {
      console.error("Erreur text handler:", err.message);
    }
    return next();
  });

  // 4. Commande /start
  bot.start(async (ctx) => {
    await ctx.reply(
      "👋 Bienvenue sur le Bot Mansa !\n\n" +
      "Pour connecter un canal ou un groupe à votre boutique Mansa :\n" +
      "1. Ajoutez ce bot comme **Administrateur** de votre canal/groupe.\n" +
      "2. Envoyez dans votre canal le code de vérification fourni sur votre tableau de bord Mansa."
    );
  });

  // 6. Gestion globale des erreurs
  bot.catch((err, ctx) => {
    console.error(`❌ Erreur Telegraf (${ctx.updateType}) :`, err);
  });

  botInstance = bot;
  return bot;
}

/**
 * Démarre le polling du bot
 */
export async function startTelegramBotPolling(): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN.trim() === "") {
    console.log("ℹ️ [Telegram Polling] TELEGRAM_BOT_TOKEN non configuré. Mode simulation actif.");
    return;
  }
  try {
    const bot = initTelegramBot();
    console.log("🤖 Démarrage du bot Telegram en mode Polling...");
    
    bot.launch({
      dropPendingUpdates: true,
    }).catch((err: any) => {
      console.warn("⚠️ [Telegram Polling] Erreur de connexion ou arrêt du bot :", err.message);
    });

    console.log("✅ Bot Telegram opérationnel et connecté !");

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error: any) {
    console.error("⚠️ Erreur démarrage bot Telegram :", error.message);
  }
}
