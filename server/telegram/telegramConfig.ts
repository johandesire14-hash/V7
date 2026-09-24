import dotenv from "dotenv";

// Charger les variables d'environnement depuis le fichier .env
dotenv.config();

/**
 * Interface de configuration pour le bot Telegram
 */
export interface TelegramBotConfig {
  token: string;
  defaultChatId?: string;
}

/**
 * Fonction de récupération sécurisée de la configuration du Bot.
 * Utilise l'initialisation paresseuse (lazy initialization) pour éviter
 * de faire crasher le serveur au démarrage si le token n'est pas encore défini.
 */
export function getTelegramConfig(): TelegramBotConfig {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token || token.trim() === "") {
    throw new Error(
      "❌ ERREUR : La variable d'environnement 'TELEGRAM_BOT_TOKEN' est manquante ou vide dans votre fichier .env !"
    );
  }

  return {
    token: token.trim(),
    defaultChatId: process.env.TELEGRAM_CHAT_ID?.trim(),
  };
}
