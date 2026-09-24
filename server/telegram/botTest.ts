import { Telegraf } from "telegraf";
import { getTelegramConfig } from "./telegramConfig.js";

/**
 * Initialisation de l'instance Telegraf avec gestion des erreurs
 */
let botInstance: Telegraf | null = null;

export function initTelegramBot(): Telegraf {
  if (botInstance) {
    return botInstance;
  }

  // 1. Récupération du token depuis les variables d'environnement
  const config = getTelegramConfig();
  const bot = new Telegraf(config.token);

  // 2. Middleware / Écouteur global pour logger tous les messages reçus
  bot.use(async (ctx, next) => {
    const updateType = ctx.updateType;
    const chat = ctx.chat;
    const from = ctx.from;

    if (chat) {
      const chatId = chat.id;
      const chatType = chat.type; // 'private' | 'group' | 'supergroup' | 'channel'
      const chatTitle = "title" in chat ? chat.title : `@${from?.username || from?.first_name || "utilisateur"}`;
      
      // Extraction du texte du message ou de la légende (caption)
      let messageText = "[Autre type de mise à jour]";
      if (ctx.message && "text" in ctx.message) {
        messageText = ctx.message.text;
      } else if (ctx.channelPost && "text" in ctx.channelPost) {
        messageText = ctx.channelPost.text;
      }

      console.log("--------------------------------------------------");
      console.log(`📩 [Telegram Update - ${updateType}]`);
      console.log(`🆔 Chat ID   : ${chatId}`);
      console.log(`🏷️ Type Chat : ${chatType}`);
      console.log(`📛 Nom/Titre : ${chatTitle}`);
      console.log(`👤 Expéditeur: ${from ? `${from.first_name} (@${from.username || "N/A"})` : "Post de Canal"}`);
      console.log(`💬 Message   : ${messageText}`);
      console.log("--------------------------------------------------");
    }

    return next();
  });

  // 3b. Gestion des posts de Canal (Telegram envoie channel_post pour les canaux, pas message)
  bot.on("channel_post", async (ctx) => {
    try {
      const text = ctx.channelPost && "text" in ctx.channelPost ? ctx.channelPost.text.trim() : "";
      const chatId = ctx.chat.id;

      console.log(`📢 [Canal Post reçu] Chat: ${chatId}, Texte: "${text}"`);

      // Détection des codes de validation (ex: code de 6 caractères majuscules/chiffres)
      if (/^[A-Z0-9]{6}$/i.test(text)) {
        await ctx.telegram.sendMessage(
          chatId,
          `✅ Code "${text}" reçu ! Nous configurons votre canal actuellement. Veuillez patienter quelques secondes pendant la mise à jour de votre tableau de bord.`
        );
      }
    } catch (err: any) {
      console.error("Erreur traitement channel_post :", err.message);
    }
  });

  // 3c. Gestion des messages texte dans les groupes (même sans / si privacy désactivée ou code unique)
  bot.on("text", async (ctx, next) => {
    try {
      const text = ctx.message.text.trim();
      const chatId = ctx.chat.id;

      // Si c'est un code à 6 caractères dans un groupe
      if (/^[A-Z0-9]{6}$/i.test(text)) {
        console.log(`🔑 Code de liaison reçu dans le groupe ${chatId} : ${text}`);
        await ctx.reply(
          `✅ Code "${text}" reçu ! Nous configurons votre groupe actuellement. Veuillez patienter quelques secondes pendant la mise à jour de votre tableau de bord.`
        );
      }
    } catch (err: any) {
      console.error("Erreur traitement message textuel :", err.message);
    }
    return next();
  });

  // 4. Commande de démarrage /start
  bot.start(async (ctx) => {
    await ctx.reply(
      "👋 Bienvenue sur le Bot d'automatisation Mansa !"
    );
  });

  // 5. Gestion des erreurs globale pour éviter les crashs inattendus
  bot.catch((err, ctx) => {
    console.error(`❌ Erreur Telegraf rencontrée pour la mise à jour ${ctx.updateType} :`, err);
  });

  botInstance = bot;
  return bot;
}

/**
 * Fonction pour lancer le polling de manière asynchrone et propre
 */
export async function startTelegramBotPolling(): Promise<void> {
  try {
    const bot = initTelegramBot();
    
    console.log("🤖 Démarrage du bot Telegram en mode Polling (getUpdates)...");
    
    // bot.launch() démarre le polling long
    bot.launch({
      dropPendingUpdates: true, // Ignore les anciens messages reçus pendant que le bot était hors-ligne
    });

    console.log("✅ Bot Telegram prêt et à l'écoute des messages !");

    // Gestion de l'arrêt propre (graceful shutdown)
    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));
  } catch (error: any) {
    console.error("⚠️ Impossible de démarrer le bot Telegram :", error.message);
  }
}
