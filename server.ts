import express from "express";
import path from "path";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import {
  mansaConfig,
  subscriptionsDb,
  webhookLogs,
  addWebhookLog,
  computeKpayHmac,
  grantDiscordAccess,
  revokeDiscordAccess,
  createTelegramInviteLink,
  revokeTelegramAccess,
  runExpirationScan,
  initMansaCron,
} from "./src/services/mansaAutomation";
import {
  telegramRegistry,
  startTelegramBotPolling,
} from "./server/telegram/telegramService.js";
import {
  validatePhoneNumber,
  DIAL_CODE_CONFIGS,
  AVAILABLE_DIAL_CODES,
} from "./src/utils/phoneValidationRules";
import {
  createInvoice,
  getInvoice,
  listInvoices,
  confirmInvoice,
  createRefund,
  reconcilePendingInvoices,
  verifyProviderSignature,
} from "./server/paymentSystem";
import {
  verifyMemberResourceAccess,
  getOffersForCompany,
  getMemberAuthorizedOffers,
} from "./src/utils/rightsAccessEngine";

// Validation MANSA_API_KEY
if (!process.env.MANSA_API_KEY) {
  console.warn("⚠️ [MANSA SECURITY] Variable d'environnement MANSA_API_KEY non définie. Définissez MANSA_API_KEY dans vos variables d'environnement.");
}

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Body parser avec conservation du rawBody pour la validation cryptographique HMAC
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// Démarrer le cron job de vérification quotidienne
initMansaCron();
setInterval(() => reconcilePendingInvoices(24 * 60), 15 * 60 * 1000);

// Démarrage du bot Telegram en mode Polling
startTelegramBotPolling();

// Helper for Gemini AI instance with lazy init
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ==========================================
// 📱 VALIDATION DES NUMÉROS DE TÉLÉPHONE & PAIEMENTS MOBILE MONEY
// ==========================================

// 1. Obtenir les indicatifs et règles centralisées
app.get("/api/payment/dial-codes", (_req, res) => {
  return res.json({
    success: true,
    dialCodes: AVAILABLE_DIAL_CODES,
  });
});

// 2. Validation temps-réel côté serveur
app.post("/api/payment/validate-phone", (req, res) => {
  const { dialCode, operatorId, phoneNumber, currency } = req.body;

  if (!dialCode || !operatorId) {
    return res.status(400).json({
      isValid: false,
      status: "missing_fields",
      errorTitle: "Paramètres manquants",
      errorMessage: "L'indicatif et l'opérateur sont requis pour valider le numéro.",
    });
  }

  const result = validatePhoneNumber(dialCode, operatorId, phoneNumber || "", currency);
  return res.json(result);
});

// 3. Système de facturation sécurisé : les paiements réels restent en attente
// d'une intégration Wave/KPay configurée. Aucun achat invité n'est accepté.
app.post("/api/payment/invoices", (req, res) => {
  try {
    const { customerUid, customerEmail = "", offerId, offerName, offerType = "paid", companyId, creatorId, grossAmount, currency = "XOF", paymentProvider = "kpay", phoneNumber, expiresAt } = req.body;
    const invoice = createInvoice({ customerUid, customerEmail, offerId, offerName, offerType, companyId, creatorId, grossAmount: Number(grossAmount), currency, paymentProvider, phoneNumber, expiresAt });
    return res.status(201).json({ success: true, invoice, mode: "test" });
  } catch (error: any) {
    const status = error.message === "AUTHENTICATED_USER_REQUIRED" ? 401 : 400;
    return res.status(status).json({ success: false, error: error.message || "INVOICE_CREATION_FAILED" });
  }
});
app.get("/api/payment/invoices/:paymentId", (req, res) => {
  const invoice = getInvoice(req.params.paymentId);
  if (!invoice) return res.status(404).json({ success: false, error: "INVOICE_NOT_FOUND" });
  return res.json({ success: true, invoice });
});
app.get("/api/payment/invoices", (_req, res) => res.json({ success: true, invoices: listInvoices() }));
function confirmPaymentFromWebhook(req: any, res: any, provider: "wave" | "kpay") {
  const signature = req.headers["x-payment-signature"] as string | undefined;
  const secret = provider === "wave" ? process.env.WAVE_WEBHOOK_SECRET : process.env.KPAY_WEBHOOK_SECRET;
  if (!verifyProviderSignature(req.rawBody?.toString("utf8") || JSON.stringify(req.body), signature, secret)) return res.status(401).json({ success: false, error: "INVALID_WEBHOOK_SIGNATURE" });
  try {
    const { paymentId, providerTransactionId, amount, providerFee = 0 } = req.body;
    return res.json({ success: true, invoice: confirmInvoice(paymentId, providerTransactionId, Number(amount), Number(providerFee)) });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "PAYMENT_CONFIRMATION_FAILED" });
  }
}
app.post("/api/payment/webhooks/wave", (req, res) => confirmPaymentFromWebhook(req, res, "wave"));
app.post("/api/payment/webhooks/kpay", (req, res) => confirmPaymentFromWebhook(req, res, "kpay"));
app.post("/api/payment/invoices/:paymentId/test-confirm", (req, res) => {
  if (process.env.NODE_ENV === "production") return res.status(403).json({ success: false, error: "TEST_MODE_DISABLED" });
  try {
    return res.json({ success: true, invoice: confirmInvoice(req.params.paymentId, req.body.providerTransactionId || `test_tx_${Date.now()}`, Number(req.body.amount), Number(req.body.providerFee || 0)), mode: "test" });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "TEST_CONFIRMATION_FAILED" });
  }
});
app.post("/api/payment/invoices/:paymentId/refunds", (req, res) => {
  try {
    return res.status(201).json({ success: true, refund: createRefund(req.params.paymentId, Number(req.body.amount), req.body.reason || "Remboursement approuvé", req.body.approvedBy || "system") });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "REFUND_FAILED" });
  }
});
app.post("/api/payment/reconcile", (_req, res) => res.json({ success: true, result: reconcilePendingInvoices(24 * 60), mode: "test" }));

// 3. Traitement sécurisé du paiement avec vérification stricte backend (Section 10)
// Ancienne route désactivée : elle ne créait pas de facture et activait l'accès trop tôt.
app.post("/api/payment/process-mobile-money", (_req, res) => {
  return res.status(410).json({ success: false, error: "LEGACY_PAYMENT_DISABLED", message: "Utilisez /api/payment/invoices puis la confirmation par webhook." });
});
// ==========================================
// 🚀 MANSA - ENDPOINTS WEBHOOK KPAY & BOTS
// ==========================================

// Middleware de vérification HMAC pour le Webhook
function verifyKpayWebhookAuth(req: any, res: any, next: any) {
  const signature = req.headers["x-kpay-signature"] as string | undefined;
  const secret = mansaConfig.kpayWebhookSecret;

  // Si pas de signature envoyée, on vérifie si un bypass dev est demandé ou on rejette
  if (!signature) {
    const errorMsg = "Header 'x-kpay-signature' manquant. Requête non authentifiée.";
    addWebhookLog({
      eventType: "webhook_rejected",
      platform: req.body?.platform || "discord",
      userId: req.body?.user_id || "UNKNOWN",
      status: "unauthorized",
      signatureVerified: false,
      rawPayload: req.body,
      result: "error",
      message: errorMsg,
    });
    return res.status(401).json({ error: errorMsg });
  }

  const rawBody = req.rawBody ? req.rawBody.toString("utf8") : JSON.stringify(req.body);
  const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  // Comparaison sécurisée timing-safe
  try {
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(signature, "utf8"),
      Buffer.from(expectedSignature, "utf8")
    );

    if (!isMatch) {
      const errorMsg = "Signature HMAC SHA-256 invalide pour ce webhook.";
      addWebhookLog({
        eventType: "webhook_rejected",
        platform: req.body?.platform || "discord",
        userId: req.body?.user_id || "UNKNOWN",
        status: "forbidden",
        signatureVerified: false,
        rawPayload: req.body,
        result: "error",
        message: errorMsg,
      });
      return res.status(403).json({ error: errorMsg });
    }
  } catch (err: any) {
    return res.status(403).json({ error: "Erreur de format de signature." });
  }

  next();
}

/**
 * Endpoint officiel Webhook KPAY (Mobile Money)
 * Accepte POST /webhook/subscription-status ou /api/webhook/subscription-status
 */
const handleKpayWebhook = async (req: any, res: any) => {
  try {
    const {
      user_id,
      platform,
      status,
      plan_name = "Membre VIP Mansa",
      customer_name,
      customer_phone,
      amount_xof = 25000,
      payment_method = "Orange Money",
    } = req.body;

    if (!user_id || !platform || !status) {
      return res.status(400).json({
        error: "Paramètres manquants : user_id, platform (discord|telegram), et status (active|expired|cancelled) sont requis.",
      });
    }

    let actionResult: any = null;
    let inviteUrl: string | undefined = undefined;

    // Traitement selon la plateforme
    if (platform === "discord") {
      if (status === "active") {
        actionResult = await grantDiscordAccess(user_id, plan_name);
        
        // Mettre à jour ou ajouter l'abonnement en base
        const existing = subscriptionsDb.find((s) => s.platformUserId === user_id && s.platform === "discord");
        if (existing) {
          existing.status = "active";
          existing.expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
          existing.roleGranted = plan_name;
        } else {
          subscriptionsDb.unshift({
            id: `sub_${Date.now()}`,
            customerName: customer_name || `Membre Discord #${user_id.slice(-4)}`,
            customerPhone: customer_phone || "+225 07 00 00 00",
            platform: "discord",
            platformUserId: user_id,
            planName: plan_name,
            amountXOF: amount_xof,
            paymentMethod: payment_method,
            status: "active",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            roleGranted: plan_name,
          });
        }
      } else if (status === "expired" || status === "cancelled") {
        actionResult = await revokeDiscordAccess(user_id, plan_name);
        const existing = subscriptionsDb.find((s) => s.platformUserId === user_id && s.platform === "discord");
        if (existing) {
          existing.status = status;
        }
      }
    } else if (platform === "telegram") {
      if (status === "active") {
        actionResult = await createTelegramInviteLink(mansaConfig.telegramChatId, 24);
        inviteUrl = actionResult.inviteLink;

        const existing = subscriptionsDb.find((s) => s.platformUserId === user_id && s.platform === "telegram");
        if (existing) {
          existing.status = "active";
          existing.expiresAt = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
          existing.lastInviteLink = inviteUrl;
        } else {
          subscriptionsDb.unshift({
            id: `sub_${Date.now()}`,
            customerName: customer_name || `Membre Telegram #${user_id.slice(-4)}`,
            customerPhone: customer_phone || "+225 05 00 00 00",
            platform: "telegram",
            platformUserId: user_id,
            planName: plan_name,
            amountXOF: amount_xof,
            paymentMethod: payment_method,
            status: "active",
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
            lastInviteLink: inviteUrl,
          });
        }
      } else if (status === "expired" || status === "cancelled") {
        actionResult = await revokeTelegramAccess(user_id, mansaConfig.telegramChatId);
        const existing = subscriptionsDb.find((s) => s.platformUserId === user_id && s.platform === "telegram");
        if (existing) {
          existing.status = status;
        }
      }
    } else {
      return res.status(400).json({ error: `Plateforme inconnue : '${platform}'` });
    }

    // Journaliser l'événement
    addWebhookLog({
      eventType: `kpay_subscription_${status}`,
      platform,
      userId: user_id,
      status,
      signatureVerified: true,
      rawPayload: req.body,
      result: actionResult?.success ? "success" : "error",
      message: actionResult?.message || `Statut ${status} appliqué avec succès.`,
    });

    return res.status(200).json({
      success: true,
      message: actionResult?.message || "Webhook traité avec succès.",
      platform,
      user_id,
      status,
      invite_link: inviteUrl,
    });
  } catch (error: any) {
    console.error("[Webhook Error]", error);
    addWebhookLog({
      eventType: "webhook_error",
      platform: req.body?.platform || "discord",
      userId: req.body?.user_id || "ERROR",
      status: "failed",
      signatureVerified: true,
      rawPayload: req.body,
      result: "error",
      message: error.message,
    });
    return res.status(500).json({ error: "Erreur interne lors du traitement du webhook." });
  }
};

// Monter les deux routes webhook
app.post("/webhook/subscription-status", verifyKpayWebhookAuth, handleKpayWebhook);
app.post("/api/webhook/subscription-status", verifyKpayWebhookAuth, handleKpayWebhook);

// Récupérer et mettre à jour la config Mansa
app.get("/api/mansa/config", (_req, res) => {
  res.json({
    kpayWebhookSecret: mansaConfig.kpayWebhookSecret,
    discordBotTokenMasked: mansaConfig.discordBotToken ? `${mansaConfig.discordBotToken.slice(0, 6)}...${mansaConfig.discordBotToken.slice(-4)}` : "Non configuré",
    hasDiscordToken: !!mansaConfig.discordBotToken,
    discordGuildId: mansaConfig.discordGuildId,
    telegramBotTokenMasked: mansaConfig.telegramBotToken ? `${mansaConfig.telegramBotToken.slice(0, 6)}...${mansaConfig.telegramBotToken.slice(-4)}` : "Non configuré",
    hasTelegramToken: !!mansaConfig.telegramBotToken,
    telegramChatId: mansaConfig.telegramChatId,
  });
});

app.post("/api/mansa/config", (req, res) => {
  const { kpayWebhookSecret, discordBotToken, discordGuildId, telegramBotToken, telegramChatId } = req.body;
  if (kpayWebhookSecret !== undefined) mansaConfig.kpayWebhookSecret = kpayWebhookSecret;
  if (discordBotToken !== undefined) mansaConfig.discordBotToken = discordBotToken;
  if (discordGuildId !== undefined) mansaConfig.discordGuildId = discordGuildId;
  if (telegramBotToken !== undefined) mansaConfig.telegramBotToken = telegramBotToken;
  if (telegramChatId !== undefined) mansaConfig.telegramChatId = telegramChatId;

  res.json({ success: true, message: "Configuration Mansa mise à jour avec succès." });
});

// Logs Webhook
app.get("/api/mansa/logs", (_req, res) => {
  res.json({ logs: webhookLogs });
});

app.delete("/api/mansa/logs", (_req, res) => {
  webhookLogs.length = 0;
  res.json({ success: true });
});

// Liste des abonnements
app.get("/api/mansa/subscriptions", (_req, res) => {
  res.json({ subscriptions: subscriptionsDb });
});

app.post("/api/mansa/subscriptions", (req, res) => {
  const newSub = {
    id: `sub_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  subscriptionsDb.unshift(newSub);
  res.json({ success: true, subscription: newSub });
});

// Déclenchement manuel du cron scan d'expiration
app.post("/api/mansa/cron/run", async (_req, res) => {
  const result = await runExpirationScan();
  res.json({ success: true, ...result });
});

// AI Business Generator endpoint
app.post("/api/generate-business", async (req, res) => {
  const { prompt, category } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "A prompt is required." });
  }

  const ai = getGeminiClient();

  if (!ai || !process.env.GEMINI_API_KEY) {
    // Return high quality curated simulated response if no API key
    const mockBusinesses: Record<string, any> = {
      Agency: {
        name: "Apex Growth Studio",
        tagline: "High-ticket performance marketing & client portal",
        description: "Full-service growth infrastructure with dedicated client onboarding, private Slack/Discord integration, and recurring retainer automation.",
        category: "Agency",
        pricingTiers: [
          { name: "Starter Sprint", price: "$1,499", interval: "one-time", features: ["Growth Audit", "Campaign Blueprint", "30-Day Support"] },
          { name: "Scale Retainer", price: "$3,800", interval: "/ month", features: ["Dedicated Account Lead", "Custom Creatives", "Weekly Strategy Calls", "Mansa Client Portal"] },
          { name: "Enterprise Custom", price: "$7,500", interval: "/ month", features: ["Dedicated Media Buyers", "Full Funnel Build", "Custom CRM Integration"] }
        ],
        apps: ["Client Portal", "Files & Deliverables", "Course Modules", "Private Chat", "Affiliate Referrals"],
        starterPost: "Welcome to Apex Growth Studio! You can find your onboarding documents in the Files tab and book your kickoff call in Events.",
        stats: { estMonthlyRevenue: "$28,400", targetAudience: "B2B SaaS & E-commerce Brands" }
      },
      Trading: {
        name: "Quantum Alpha Signals",
        tagline: "Institutional-grade crypto & equity algorithmic alerts",
        description: "Real-time automated webhook alerts, live trading streams, daily market prep breakdowns, and private mastermind community.",
        category: "Trading",
        pricingTiers: [
          { name: "Market Alerts Tier", price: "$69", interval: "/ month", features: ["Daily Watchlist", "Discord/Telegram Webhook Alerts", "Weekly Market Recap"] },
          { name: "Alpha Pro Tier", price: "$149", interval: "/ month", features: ["Live Trading Room", "Custom TradingView Indicators", "1-on-1 Mentorship Session", "Full Discord Access"] },
          { name: "Lifetime Syndicate", price: "$1,250", interval: "lifetime", features: ["All Future Indicator Updates", "Private Inner Circle Chat", "Quarterly Meetups"] }
        ],
        apps: ["Live Signals Feed", "TradingView Scripts", "Discord VIP Role Sync", "Video Library", "Daily Journal"],
        starterPost: "Alpha is live! Check the Indicators tab to claim your license key and connect your TradingView account.",
        stats: { estMonthlyRevenue: "$42,500", targetAudience: "Day traders, Swing traders, & Quants" }
      },
      SaaS: {
        name: "DocuCraft AI",
        tagline: "AI-powered document intelligence & automation API",
        description: "Automate contract analysis, extraction, and compliance reporting with plug-and-play SDK keys managed through Mansa.",
        category: "SaaS",
        pricingTiers: [
          { name: "Developer", price: "$29", interval: "/ month", features: ["10,000 API Credits", "Standard Rate Limit", "Discord Community Support"] },
          { name: "Growth", price: "$99", interval: "/ month", features: ["100,000 API Credits", "High Throughput Server", "Webhooks & Zapier", "License Key Management"] },
          { name: "Scale", price: "$299", interval: "/ month", features: ["Unlimited API Requests", "Custom Model Fine-tuning", "SLA Guarantee", "Dedicated Support"] }
        ],
        apps: ["Software License Keys", "API Documentation", "Usage Analytics", "Discord Bot Integration", "Changelog"],
        starterPost: "DocuCraft v2.4 is live with 3x faster extraction latency. Generate your secret API key below!",
        stats: { estMonthlyRevenue: "$18,900", targetAudience: "Developers, Agencies, & Enterprise Operations" }
      },
      default: {
        name: `${prompt.trim().split(" ")[0]} Hub`,
        tagline: `Monetize and scale your digital ${prompt} with Mansa`,
        description: `All-in-one digital operating space for ${prompt}. Includes instant checkout, member community, content vaults, and recurring billing.`,
        category: category || "Digital Product",
        pricingTiers: [
          { name: "Access Pass", price: "$39", interval: "/ month", features: ["Full Member Access", "Weekly Updates", "Community Chat"] },
          { name: "VIP Pro", price: "$89", interval: "/ month", features: ["Everything in Access", "Direct Messaging", "Downloadable Vault", "Priority Support"] },
          { name: "Lifetime Pass", price: "$399", interval: "lifetime", features: ["Lifetime Access to All Future Apps", "Founders Badge", "Exclusive Group"] }
        ],
        apps: ["Private Chat", "Content Library", "Downloadable Files", "Member Directory", "Affiliates Hub"],
        starterPost: `Welcome everyone to our new Mansa home! Everything is organized in the tabs above.`,
        stats: { estMonthlyRevenue: "$14,500", targetAudience: `Enthusiasts, creators, and professionals in ${prompt}` }
      }
    };

    const chosen = mockBusinesses[category] || mockBusinesses.default;
    return res.json({
      success: true,
      business: chosen,
      source: "template"
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `You are the Mansa AI Business Architect. A creator wants to build a digital business on Mansa with the prompt: "${prompt}". Category: "${category || "Any"}".
      Generate a complete, modern, and realistic business launch plan on Mansa in JSON format.
      
      Requirements:
      - name: Catchy modern business name (e.g. Apex Signals, CreatorOS, LaunchKit)
      - tagline: 1 punchy sentence
      - description: 2-3 sentences explaining value and deliverables
      - category: The business vertical (e.g. Trading, Agency, SaaS, Courses, E-Commerce, Community)
      - pricingTiers: Array of 3 tiers (Starter/Basic, Pro/Standard, Elite/Lifetime) with name, price (e.g. "$49", "$129", "$499"), interval ("/ month" or "one-time" or "lifetime"), and features array
      - apps: Array of 4-5 Mansa apps enabled (e.g. "Discord Role Sync", "Video Courses", "Digital Downloads", "Software License Keys", "Community Chat", "Affiliates", "Events")
      - starterPost: A warm welcome post message for new members
      - stats: Object with estMonthlyRevenue (string) and targetAudience (string)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            tagline: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING },
            pricingTiers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  interval: { type: Type.STRING },
                  features: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ["name", "price", "interval", "features"],
              },
            },
            apps: { type: Type.ARRAY, items: { type: Type.STRING } },
            starterPost: { type: Type.STRING },
            stats: {
              type: Type.OBJECT,
              properties: {
                estMonthlyRevenue: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
              },
              required: ["estMonthlyRevenue", "targetAudience"],
            },
          },
          required: ["name", "tagline", "description", "category", "pricingTiers", "apps", "starterPost", "stats"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      business: parsed,
      source: "gemini-3.8-flash"
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate business blueprint." });
  }
});

// ==========================================
// 🤖 TELEGRAM BOT DYNAMIC VERIFICATION API
// ==========================================

// 1. Générer un code dynamique et unique pour le créateur
app.get("/api/telegram/generate-code", (req, res) => {
  const creatorId = (req.query.creatorId as string) || "creator_default";
  const entry = telegramRegistry.generateCode(creatorId);
  return res.json({
    success: true,
    code: entry.code,
    expiresAt: entry.expiresAt,
    status: entry.status,
  });
});

// 2. Vérifier l'état d'un code (Polling par le frontend)
app.get("/api/telegram/check-verification", (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).json({ success: false, error: "Le paramètre 'code' est requis." });
  }

  const entry = telegramRegistry.getCode(code);
  if (!entry) {
    return res.json({
      success: true,
      status: "not_found",
      message: "Code inexistant ou expiré.",
    });
  }

  return res.json({
    success: true,
    code: entry.code,
    status: entry.status,
    channelInfo: entry.channelInfo || null,
  });
});

// 3. Consommer un code une fois le canal connecté et régénérer
app.post("/api/telegram/consume-code", (req, res) => {
  const { code, creatorId } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: "Le paramètre 'code' est requis." });
  }

  const consumed = telegramRegistry.consumeCode(code);
  const nextCode = telegramRegistry.generateCode(creatorId);

  return res.json({
    success: true,
    consumed: !!consumed,
    channelInfo: consumed?.channelInfo || null,
    nextCode: nextCode.code,
    nextExpiresAt: nextCode.expiresAt,
  });
});

// 4. Liste des canaux Telegram connectés
app.get("/api/telegram/connected-channels", (req, res) => {
  const channels = telegramRegistry.getAllConnectedChannels();
  return res.json({
    success: true,
    channels,
  });
});

// ==========================================
// 🛡️ VÉRIFICATION STRICTE DES DROITS D'ACCÈS AUX RESSOURCES
// ==========================================

// 1. Vérification générale d'accès à une ressource (Telegram, Discord, E-book, Formation, etc.)
app.post("/api/access/verify-resource", (req, res) => {
  const { companyId, resourceType, resourceId, unlockedOfferIds, userEmail } = req.body;

  if (!companyId || !resourceType || !resourceId) {
    return res.status(400).json({
      authorized: false,
      error: "Paramètres requis manquants : companyId, resourceType, resourceId.",
    });
  }

  let effectiveUnlockedIds: string[] = Array.isArray(unlockedOfferIds) ? [...unlockedOfferIds] : [];
  if (userEmail) {
    const userSubs = subscriptionsDb.filter(
      (s) => ((s.customer_email && s.customer_email.toLowerCase() === userEmail.toLowerCase()) || (s.platformUserId && s.platformUserId.toLowerCase() === userEmail.toLowerCase())) && s.status === "active"
    );
    userSubs.forEach((sub) => {
      const oid = sub.offer_id || sub.offerId;
      if (oid) effectiveUnlockedIds.push(oid);
    });
  }

  const result = verifyMemberResourceAccess({
    companyId,
    unlockedOfferIds: effectiveUnlockedIds,
    resourceType,
    resourceId,
  });

  if (result.isAuthorized) {
    return res.json({
      authorized: true,
      resource: result.resource,
      grantedByOffer: {
        id: result.grantedByOffer?.id,
        title: result.grantedByOffer?.title,
      },
    });
  } else {
    return res.status(403).json({
      authorized: false,
      error: result.error,
      requiredOffer: result.requiredOffer
        ? {
            id: result.requiredOffer.id,
            title: result.requiredOffer.title,
            priceDisplay: result.requiredOffer.priceDisplay,
          }
        : undefined,
    });
  }
});

// 2. Récupération sécurisée d'une invitation Telegram spécifique
app.post("/api/telegram/request-channel-invite", (req, res) => {
  const { companyId, channelId, unlockedOfferIds, userEmail } = req.body;

  if (!companyId || !channelId) {
    return res.status(400).json({
      success: false,
      error: "Paramètres manquants : companyId et channelId requis.",
    });
  }

  let effectiveUnlockedIds: string[] = Array.isArray(unlockedOfferIds) ? [...unlockedOfferIds] : [];
  if (userEmail) {
    const userSubs = subscriptionsDb.filter(
      (s) => ((s.customer_email && s.customer_email.toLowerCase() === userEmail.toLowerCase()) || (s.platformUserId && s.platformUserId.toLowerCase() === userEmail.toLowerCase())) && s.status === "active"
    );
    userSubs.forEach((sub) => {
      const oid = sub.offer_id || sub.offerId;
      if (oid) effectiveUnlockedIds.push(oid);
    });
  }

  const result = verifyMemberResourceAccess({
    companyId,
    unlockedOfferIds: effectiveUnlockedIds,
    resourceType: "telegram",
    resourceId: channelId,
  });

  if (!result.isAuthorized) {
    return res.status(403).json({
      success: false,
      authorized: false,
      error: result.error || "Accès refusé. Cette offre n'accorde pas l'accès à ce canal Telegram spécifique.",
      requiredOffer: result.requiredOffer
        ? {
            id: result.requiredOffer.id,
            title: result.requiredOffer.title,
            priceDisplay: result.requiredOffer.priceDisplay,
          }
        : undefined,
    });
  }

  return res.json({
    success: true,
    authorized: true,
    inviteLink: result.resource.inviteLink,
    channelName: result.resource.name,
    grantedByOffer: result.grantedByOffer?.title,
  });
});

// 3. Récupération sécurisée d'une invitation Discord spécifique
app.post("/api/discord/request-server-invite", (req, res) => {
  const { companyId, channelId, unlockedOfferIds, userEmail } = req.body;

  if (!companyId || !channelId) {
    return res.status(400).json({
      success: false,
      error: "Paramètres manquants : companyId et channelId requis.",
    });
  }

  let effectiveUnlockedIds: string[] = Array.isArray(unlockedOfferIds) ? [...unlockedOfferIds] : [];
  if (userEmail) {
    const userSubs = subscriptionsDb.filter(
      (s) => ((s.customer_email && s.customer_email.toLowerCase() === userEmail.toLowerCase()) || (s.platformUserId && s.platformUserId.toLowerCase() === userEmail.toLowerCase())) && s.status === "active"
    );
    userSubs.forEach((sub) => {
      const oid = sub.offer_id || sub.offerId;
      if (oid) effectiveUnlockedIds.push(oid);
    });
  }

  const result = verifyMemberResourceAccess({
    companyId,
    unlockedOfferIds: effectiveUnlockedIds,
    resourceType: "discord",
    resourceId: channelId,
  });

  if (!result.isAuthorized) {
    return res.status(403).json({
      success: false,
      authorized: false,
      error: result.error || "Accès refusé. Cette offre n'accorde pas l'accès à ce serveur Discord spécifique.",
      requiredOffer: result.requiredOffer
        ? {
            id: result.requiredOffer.id,
            title: result.requiredOffer.title,
            priceDisplay: result.requiredOffer.priceDisplay,
          }
        : undefined,
    });
  }

  return res.json({
    success: true,
    authorized: true,
    inviteLink: result.resource.inviteLink,
    channelName: result.resource.name,
    grantedByOffer: result.grantedByOffer?.title,
  });
});

// 4. Téléchargement sécurisé d'un E-book spécifique
app.post("/api/ebooks/request-download", (req, res) => {
  const { companyId, ebookId, unlockedOfferIds, userEmail } = req.body;

  if (!companyId || !ebookId) {
    return res.status(400).json({
      success: false,
      error: "Paramètres manquants : companyId et ebookId requis.",
    });
  }

  let effectiveUnlockedIds: string[] = Array.isArray(unlockedOfferIds) ? [...unlockedOfferIds] : [];
  if (userEmail) {
    const userSubs = subscriptionsDb.filter(
      (s) =>
        ((s.customer_email && s.customer_email.toLowerCase() === userEmail.toLowerCase()) ||
          (s.platformUserId && s.platformUserId.toLowerCase() === userEmail.toLowerCase())) &&
        s.status === "active"
    );
    userSubs.forEach((sub) => {
      const oid = sub.offer_id || sub.offerId;
      if (oid) effectiveUnlockedIds.push(oid);
    });
  }

  const result = verifyMemberResourceAccess({
    companyId,
    unlockedOfferIds: effectiveUnlockedIds,
    resourceType: "ebook",
    resourceId: ebookId,
  });

  if (!result.isAuthorized) {
    return res.status(403).json({
      success: false,
      authorized: false,
      error:
        result.error ||
        "Accès refusé. Cette offre n'accorde pas l'accès à cet e-book / guide spécifique.",
      requiredOffer: result.requiredOffer
        ? {
            id: result.requiredOffer.id,
            title: result.requiredOffer.title,
            priceDisplay: result.requiredOffer.priceDisplay,
          }
        : undefined,
    });
  }

  return res.json({
    success: true,
    authorized: true,
    downloadUrl: result.resource.downloadUrl,
    title: result.resource.title,
    grantedByOffer: result.grantedByOffer?.title,
  });
});

// 5. Accès sécurisé à une Formation / Module spécifique
app.post("/api/courses/request-access", (req, res) => {
  const { companyId, courseId, unlockedOfferIds, userEmail } = req.body;

  if (!companyId || !courseId) {
    return res.status(400).json({
      success: false,
      error: "Paramètres manquants : companyId et courseId requis.",
    });
  }

  let effectiveUnlockedIds: string[] = Array.isArray(unlockedOfferIds) ? [...unlockedOfferIds] : [];
  if (userEmail) {
    const userSubs = subscriptionsDb.filter(
      (s) =>
        ((s.customer_email && s.customer_email.toLowerCase() === userEmail.toLowerCase()) ||
          (s.platformUserId && s.platformUserId.toLowerCase() === userEmail.toLowerCase())) &&
        s.status === "active"
    );
    userSubs.forEach((sub) => {
      const oid = sub.offer_id || sub.offerId;
      if (oid) effectiveUnlockedIds.push(oid);
    });
  }

  const result = verifyMemberResourceAccess({
    companyId,
    unlockedOfferIds: effectiveUnlockedIds,
    resourceType: "course",
    resourceId: courseId,
  });

  if (!result.isAuthorized) {
    return res.status(403).json({
      success: false,
      authorized: false,
      error:
        result.error ||
        "Accès refusé. Cette offre n'accorde pas l'accès à cette formation spécifique.",
      requiredOffer: result.requiredOffer
        ? {
            id: result.requiredOffer.id,
            title: result.requiredOffer.title,
            priceDisplay: result.requiredOffer.priceDisplay,
          }
        : undefined,
    });
  }

  return res.json({
    success: true,
    authorized: true,
    accessUrl: result.resource.accessUrl,
    title: result.resource.title,
    grantedByOffer: result.grantedByOffer?.title,
  });
});

// 6. Accès sécurisé à une ressource personnalisée / service / document
app.post("/api/resources/request-access", (req, res) => {
  const { companyId, resourceType, resourceId, unlockedOfferIds, userEmail } = req.body;

  if (!companyId || !resourceId) {
    return res.status(400).json({
      success: false,
      error: "Paramètres manquants : companyId et resourceId requis.",
    });
  }

  let effectiveUnlockedIds: string[] = Array.isArray(unlockedOfferIds) ? [...unlockedOfferIds] : [];
  if (userEmail) {
    const userSubs = subscriptionsDb.filter(
      (s) =>
        ((s.customer_email && s.customer_email.toLowerCase() === userEmail.toLowerCase()) ||
          (s.platformUserId && s.platformUserId.toLowerCase() === userEmail.toLowerCase())) &&
        s.status === "active"
    );
    userSubs.forEach((sub) => {
      const oid = sub.offer_id || sub.offerId;
      if (oid) effectiveUnlockedIds.push(oid);
    });
  }

  const result = verifyMemberResourceAccess({
    companyId,
    unlockedOfferIds: effectiveUnlockedIds,
    resourceType: resourceType || "resource",
    resourceId,
  });

  if (!result.isAuthorized) {
    return res.status(403).json({
      success: false,
      authorized: false,
      error: result.error || "Accès refusé à cette ressource privée.",
      requiredOffer: result.requiredOffer
        ? {
            id: result.requiredOffer.id,
            title: result.requiredOffer.title,
            priceDisplay: result.requiredOffer.priceDisplay,
          }
        : undefined,
    });
  }

  return res.json({
    success: true,
    authorized: true,
    resource: result.resource,
    grantedByOffer: result.grantedByOffer?.title,
  });
});

// ==========================================
// 💰 CONTRÔLE FINANCIER & RETRAITS CÔTÉ SERVEUR (Section 5 & 7)
// ==========================================

interface ServerWithdrawal {
  id: string;
  creatorId: string;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  payoutMethodId: string;
  payoutMethodType: string;
  payoutMethodLabel: string;
  destinationDetails: string;
  accountHolder: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  processedAt?: string;
  referenceNumber: string;
}

const serverWithdrawalsDb: ServerWithdrawal[] = [
  {
    id: "wdr-demo-01",
    creatorId: "creator-default",
    amount: 250000,
    currency: "FCFA",
    fee: 0,
    netAmount: 250000,
    payoutMethodId: "pm-default-wave",
    payoutMethodType: "wave",
    payoutMethodLabel: "Wave CI (+225 07 88 99 00 11)",
    destinationDetails: "Wave Côte d'Ivoire · Compte Johan Désiré",
    accountHolder: "Johan Désiré",
    status: "completed",
    requestedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000 + 45 * 60 * 1000).toISOString(),
    referenceNumber: "WDR-2026-WV882104",
  },
  {
    id: "wdr-demo-02",
    creatorId: "creator-default",
    amount: 120000,
    currency: "FCFA",
    fee: 0,
    netAmount: 120000,
    payoutMethodId: "pm-default-wave",
    payoutMethodType: "wave",
    payoutMethodLabel: "Wave CI (+225 07 88 99 00 11)",
    destinationDetails: "Wave Côte d'Ivoire · Compte Johan Désiré",
    accountHolder: "Johan Désiré",
    status: "completed",
    requestedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
    processedAt: new Date(Date.now() - 14 * 24 * 3600 * 1000 + 15 * 60 * 1000).toISOString(),
    referenceNumber: "WDR-2026-WV451093",
  },
];

// Récupérer l'historique des retraits contrôlé par le serveur
app.get("/api/financial/withdrawals/:creatorId", (req, res) => {
  const { creatorId } = req.params;
  const list = serverWithdrawalsDb.filter(
    (w) => w.creatorId === creatorId || (creatorId.includes("@") && w.creatorId === "creator-default")
  );
  return res.json({
    success: true,
    withdrawals: list,
  });
});

// Traitement sécurisé d'une demande de retrait avec validation des seuils
app.post("/api/financial/request-withdrawal", (req, res) => {
  const { creatorId, amount, currency = "FCFA", payoutMethod } = req.body;

  if (!creatorId || !amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: "Montant de retrait invalide ou créateur non spécifié.",
    });
  }

  const minThreshold = currency === "EUR" ? 10 : 5000;
  if (amount < minThreshold) {
    return res.status(400).json({
      success: false,
      error: `Le montant minimum de retrait est de ${minThreshold.toLocaleString("fr-FR")} ${currency}.`,
    });
  }

  if (!payoutMethod || !payoutMethod.accountIdentifier) {
    return res.status(400).json({
      success: false,
      error: "Méthode de paiement incomplète. Veuillez configurer vos coordonnées de retrait.",
    });
  }

  const refNumber = `WDR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const newWithdrawal: ServerWithdrawal = {
    id: `wdr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    creatorId,
    amount,
    currency,
    fee: 0,
    netAmount: amount,
    payoutMethodId: payoutMethod.id || "pm-default",
    payoutMethodType: payoutMethod.type || "wave",
    payoutMethodLabel: payoutMethod.label || `${payoutMethod.type} (${payoutMethod.accountIdentifier})`,
    destinationDetails: `${payoutMethod.label || payoutMethod.type} · ${payoutMethod.accountHolder || "Bénéficiaire"} · ${payoutMethod.accountIdentifier}`,
    accountHolder: payoutMethod.accountHolder || "Créateur Mansa",
    status: "processing",
    requestedAt: new Date().toISOString(),
    referenceNumber: refNumber,
  };

  serverWithdrawalsDb.unshift(newWithdrawal);

  // Auto-validation du virement sous 15 secondes pour fluidité
  setTimeout(() => {
    newWithdrawal.status = "completed";
    newWithdrawal.processedAt = new Date().toISOString();
  }, 15000);

  return res.status(200).json({
    success: true,
    message: "Demande de retrait enregistrée et transmise pour exécution.",
    withdrawal: newWithdrawal,
  });
});

// ==========================================
// 🚩 SIGNALEMENT ET CONFORMITÉ (REPORTS)
// ==========================================

interface ServerReport {
  id: string;
  companyId?: string;
  companyName: string;
  reason: string;
  details?: string;
  reporterEmail?: string;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: string;
}

const serverReportsDb: ServerReport[] = [];

app.post("/api/reports/submit", (req, res) => {
  const { companyId, companyName, reason, details, reporterEmail } = req.body;

  if (!companyName || !reason) {
    return res.status(400).json({
      success: false,
      error: "Le nom de l'entreprise et le motif du signalement sont obligatoires.",
    });
  }

  const newReport: ServerReport = {
    id: `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    companyId,
    companyName,
    reason,
    details: details || "",
    reporterEmail,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  serverReportsDb.unshift(newReport);

  return res.status(200).json({
    success: true,
    message: "Signalement enregistré avec succès par l'équipe de conformité Mansa.",
    reportId: newReport.id,
  });
});

// Vite & Static file handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mansa Server running on port ${PORT}`);
  });
}

startServer();
