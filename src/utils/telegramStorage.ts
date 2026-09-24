export interface TelegramChannelItem {
  id: string;
  name: string;
  type: "channel" | "group";
  memberCount: number;
  isIncluded: boolean;
  linkedDate: string;
  botStatus: "admin" | "member" | "pending";
}

const STORAGE_KEY = "mansa_telegram_channels";
const LEGACY_STORAGE_KEY = "whop_telegram_channels";

export const DEFAULT_TELEGRAM_CHANNELS: TelegramChannelItem[] = [
  {
    id: "tg-1",
    name: "VICTORY ODDS 🤑🔥",
    type: "channel",
    memberCount: 1450,
    isIncluded: true,
    linkedDate: "Aujourd'hui, 14:32",
    botStatus: "admin",
  },
  {
    id: "tg-2",
    name: "VIP TRADING AFRIQUE 📈",
    type: "channel",
    memberCount: 2350,
    isIncluded: true,
    linkedDate: "Hier, 10:15",
    botStatus: "admin",
  },
  {
    id: "tg-3",
    name: "BETSPORT EXCLUSIF",
    type: "channel",
    memberCount: 840,
    isIncluded: true,
    linkedDate: "Connecté",
    botStatus: "admin",
  },
];

export function getStoredTelegramChannels(): TelegramChannelItem[] {
  if (typeof window === "undefined") return DEFAULT_TELEGRAM_CHANNELS;
  let saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    saved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      localStorage.setItem(STORAGE_KEY, saved);
    }
  }
  if (!saved) return DEFAULT_TELEGRAM_CHANNELS;
  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const seen = new Set<string>();
      const deduped: TelegramChannelItem[] = [];
      for (const item of parsed) {
        const key = item.id || item.name;
        if (key && !seen.has(key)) {
          seen.add(key);
          deduped.push(item);
        }
      }
      return deduped;
    }
  } catch (e) {
    console.warn("Failed to parse stored telegram channels", e);
  }
  return DEFAULT_TELEGRAM_CHANNELS;
}

export function saveStoredTelegramChannels(channels: TelegramChannelItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
}

export function addStoredTelegramChannel(channel: TelegramChannelItem): TelegramChannelItem[] {
  const current = getStoredTelegramChannels();
  const filtered = current.filter((c) => c.id !== channel.id && c.name !== channel.name);
  const updated = [channel, ...filtered];
  saveStoredTelegramChannels(updated);
  return updated;
}
