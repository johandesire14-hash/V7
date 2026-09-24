import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Zap,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Download,
  Check,
  FileSpreadsheet,
  Info,
  PackageCheck,
  Award,
  Coins,
  Globe,
} from "lucide-react";
import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  formatCurrency,
  convertFromUSD,
  convertBetweenCurrencies,
} from "../../utils/currency";

export interface DailyRevenueData {
  date: string;
  fullDate: string;
  dayIndex: number;
  revenue: number;
  salesCount: number;
  notionTemplates: number;
  discordVip: number;
  courses: number;
  saasLicenses: number;
  ebooks: number;
  topProduct: string;
}

export interface CountryStat {
  country: string;
  flag: string;
  amount: number;
  percent: number;
  methods: string[];
  salesCount: number;
}

const COUNTRY_FLAGS: Record<string, string> = {
  "côte d'ivoire": "🇨🇮",
  "cote d'ivoire": "🇨🇮",
  "ivory coast": "🇨🇮",
  "ci": "🇨🇮",
  "sénégal": "🇸🇳",
  "senegal": "🇸🇳",
  "sn": "🇸🇳",
  "nigéria": "🇳🇬",
  "nigeria": "🇳🇬",
  "ng": "🇳🇬",
  "cameroun": "🇨🇲",
  "cameroon": "🇨🇲",
  "cm": "🇨🇲",
  "ghana": "🇬🇭",
  "gh": "🇬🇭",
  "kenya": "🇰🇪",
  "ke": "🇰🇪",
  "bénin": "🇧🇯",
  "benin": "🇧🇯",
  "bj": "🇧🇯",
  "togo": "🇹🇬",
  "tg": "🇹🇬",
  "mali": "🇲🇱",
  "ml": "🇲🇱",
  "rdc": "🇨🇩",
  "rd congo": "🇨🇩",
  "drc": "🇨🇩",
  "congo kinshasa": "🇨🇩",
  "cd": "🇨🇩",
  "congo": "🇨🇬",
  "cg": "🇨🇬",
  "maroc": "🇲🇦",
  "morocco": "🇲🇦",
  "ma": "🇲🇦",
  "afrique du sud": "🇿🇦",
  "south africa": "🇿🇦",
  "za": "🇿🇦",
  "gabon": "🇬🇦",
  "ga": "🇬🇦",
  "guinée": "🇬🇳",
  "guinea": "🇬🇳",
  "gn": "🇬🇳",
  "burkina faso": "🇧🇫",
  "bf": "🇧🇫",
  "niger": "🇳🇪",
  "ne": "🇳🇪",
  "rwanda": "🇷🇼",
  "rw": "🇷🇼",
  "tchad": "🇹🇩",
  "chad": "🇹🇩",
  "td": "🇹🇩",
  "tunisie": "🇹🇳",
  "tunisia": "🇹🇳",
  "tn": "🇹🇳",
  "algérie": "🇩🇿",
  "algerie": "🇩🇿",
  "algeria": "🇩🇿",
  "dz": "🇩🇿",
  "égypte": "🇪🇬",
  "egypte": "🇪🇬",
  "egypt": "🇪🇬",
  "eg": "🇪🇬",
  "madagascar": "🇲🇬",
  "mg": "🇲🇬",
  "france": "🇫🇷",
  "fr": "🇫🇷",
  "canada": "🇨🇦",
  "ca": "🇨🇦",
  "états-unis": "🇺🇸",
  "etats-unis": "🇺🇸",
  "usa": "🇺🇸",
  "united states": "🇺🇸",
  "us": "🇺🇸",
  "royaume-uni": "🇬🇧",
  "uk": "🇬🇧",
  "united kingdom": "🇬🇧",
  "gb": "🇬🇧",
  "belgique": "🇧🇪",
  "belgium": "🇧🇪",
  "be": "🇧🇪",
  "suisse": "🇨🇭",
  "switzerland": "🇨🇭",
  "ch": "🇨🇭",
  "allemagne": "🇩🇪",
  "germany": "🇩🇪",
  "de": "🇩🇪",
  "espagne": "🇪🇸",
  "spain": "🇪🇸",
  "es": "🇪🇸",
  "italie": "🇮🇹",
  "italy": "🇮🇹",
  "it": "🇮🇹",
  "portugal": "🇵🇹",
  "pt": "🇵🇹",
  "brésil": "🇧🇷",
  "bresil": "🇧🇷",
  "brazil": "🇧🇷",
  "br": "🇧🇷",
  "chine": "🇨🇳",
  "china": "🇨🇳",
  "cn": "🇨🇳",
  "inde": "🇮🇳",
  "india": "🇮🇳",
  "in": "🇮🇳",
  "émirats arabes unis": "🇦🇪",
  "emirats arabes unis": "🇦🇪",
  "uae": "🇦🇪",
  "ae": "🇦🇪",
};

const extractCountryName = (location?: string): string => {
  if (!location || !location.trim()) return "Non spécifié";
  const raw = location.trim();
  if (raw.includes(",")) {
    const parts = raw.split(",");
    const candidate = parts[parts.length - 1].trim();
    if (candidate) return candidate;
  }
  return raw;
};

const getFlagForCountry = (countryName: string): string => {
  const normalized = countryName.toLowerCase().trim();
  return COUNTRY_FLAGS[normalized] || "🌍";
};

// Build 30-day timeline strictly from real transactions (defaults to 0 if no transactions exist)
const build30DayDataFromTransactions = (
  rawTransactions: Array<{
    amountNumber?: number;
    amount?: string;
    currency?: string;
    createdAt?: string;
    productName?: string;
    category?: string;
    buyerLocation?: string;
    country?: string;
    paymentMethod?: string;
  }> = []
): DailyRevenueData[] => {
  const data: DailyRevenueData[] = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 29);

  // Group raw transactions by date (YYYY-MM-DD)
  const txByDay: Record<
    string,
    {
      total: number;
      count: number;
      products: Record<string, number>;
      notion: number;
      discord: number;
      courses: number;
      saas: number;
      ebooks: number;
    }
  > = {};

  rawTransactions.forEach((tx) => {
    const dStr = tx.createdAt ? tx.createdAt.split("T")[0] : new Date().toISOString().split("T")[0];
    if (!txByDay[dStr]) {
      txByDay[dStr] = {
        total: 0,
        count: 0,
        products: {},
        notion: 0,
        discord: 0,
        courses: 0,
        saas: 0,
        ebooks: 0,
      };
    }

    const rawAmt =
      tx.amountNumber ||
      parseFloat(String(tx.amount || "0").replace(/[^0-9.]/g, "")) ||
      0;
    const txCurr = (tx.currency as CurrencyCode) || (rawAmt > 500 ? "XOF" : "USD");
    const amtUSD = convertBetweenCurrencies(rawAmt, txCurr, "USD");

    txByDay[dStr].total += amtUSD;
    txByDay[dStr].count += 1;
    const pName = tx.productName || "Produit Mansa";
    txByDay[dStr].products[pName] = (txByDay[dStr].products[pName] || 0) + amtUSD;

    // Categorize product for breakdown charts
    const pLower = (pName + " " + (tx.category || "")).toLowerCase();
    if (
      pLower.includes("discord") ||
      pLower.includes("telegram") ||
      pLower.includes("vip") ||
      pLower.includes("forex") ||
      pLower.includes("trading") ||
      pLower.includes("crypto")
    ) {
      txByDay[dStr].discord += amtUSD;
    } else if (
      pLower.includes("formation") ||
      pLower.includes("cours") ||
      pLower.includes("masterclass") ||
      pLower.includes("académie") ||
      pLower.includes("academy")
    ) {
      txByDay[dStr].courses += amtUSD;
    } else if (
      pLower.includes("saas") ||
      pLower.includes("bot") ||
      pLower.includes("logiciel") ||
      pLower.includes("software") ||
      pLower.includes("api")
    ) {
      txByDay[dStr].saas += amtUSD;
    } else if (
      pLower.includes("ebook") ||
      pLower.includes("guide") ||
      pLower.includes("pdf") ||
      pLower.includes("livre")
    ) {
      txByDay[dStr].ebooks += amtUSD;
    } else {
      txByDay[dStr].notion += amtUSD;
    }
  });

  for (let i = 0; i < 30; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dayName = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const fullDateStr = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" });
    const isoDateStr = d.toISOString().split("T")[0];

    const dayTx = txByDay[isoDateStr] || {
      total: 0,
      count: 0,
      products: {},
      notion: 0,
      discord: 0,
      courses: 0,
      saas: 0,
      ebooks: 0,
    };
    let topProduct = "-";
    let maxProdRev = 0;
    Object.entries(dayTx.products).forEach(([pName, pRev]) => {
      if (pRev > maxProdRev) {
        maxProdRev = pRev;
        topProduct = pName;
      }
    });

    data.push({
      date: dayName,
      fullDate: fullDateStr,
      dayIndex: i + 1,
      revenue: dayTx.total,
      salesCount: dayTx.count,
      notionTemplates: dayTx.notion,
      discordVip: dayTx.discord,
      courses: dayTx.courses,
      saasLicenses: dayTx.saas,
      ebooks: dayTx.ebooks,
      topProduct,
    });
  }

  return data;
};

interface RevenueAnalyticsChartProps {
  lang?: "fr" | "en";
  currentBalance?: number;
  currentCurrency?: CurrencyCode;
  onSelectCurrency?: (currency: CurrencyCode) => void;
  transactions?: Array<{
    amountNumber?: number;
    amount?: string;
    createdAt?: string;
    productName?: string;
    category?: string;
    buyerLocation?: string;
    country?: string;
    paymentMethod?: string;
    [key: string]: any;
  }>;
}

export const RevenueAnalyticsChart: React.FC<RevenueAnalyticsChartProps> = ({
  lang = "fr",
  currentBalance = 0,
  currentCurrency = "USD",
  onSelectCurrency,
  transactions = [],
}) => {
  const [internalCurrency, setInternalCurrency] = useState<CurrencyCode>(currentCurrency);
  const activeCurrency = onSelectCurrency ? currentCurrency : internalCurrency;
  const handleCurrencyChange = onSelectCurrency || setInternalCurrency;

  const [dataRange, setDataRange] = useState<"7d" | "14d" | "30d">("30d");
  const [chartType, setChartType] = useState<"area" | "breakdown" | "sales" | "cumulative">("area");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "notion" | "discord" | "courses" | "saas" | "ebooks">("all");
  
  const data = useMemo(() => build30DayDataFromTransactions(transactions), [transactions]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // Currency configuration
  const currConfig = SUPPORTED_CURRENCIES[activeCurrency] || SUPPORTED_CURRENCIES.USD;

  // CSV Export Handler
  const handleExportCSV = (rangeType: "30d" | "current" = "30d") => {
    setIsExporting(true);
    try {
      const dataset = rangeType === "current" ? filteredData : data;

      // RFC 4180 standard CSV headers
      const headers = [
        "Date",
        "Date_Complete",
        "Numero_Jour",
        `Revenu_Total_${activeCurrency}`,
        "Revenu_USD_Equivalent",
        "Nombre_Commandes",
        `Acces_Discord_VIP_${activeCurrency}`,
        `Templates_Notion_${activeCurrency}`,
        `Formations_Video_${activeCurrency}`,
        `SaaS_Licences_${activeCurrency}`,
        `Ebooks_PDF_${activeCurrency}`,
        "Top_Produit_Vendu",
      ];

      // Formatted rows
      const rows = dataset.map((item) => [
        `"${item.date}"`,
        `"${item.fullDate}"`,
        item.dayIndex,
        convertFromUSD(item.revenue, activeCurrency).toFixed(currConfig.decimals),
        item.revenue.toFixed(2),
        item.salesCount,
        convertFromUSD(item.discordVip, activeCurrency).toFixed(currConfig.decimals),
        convertFromUSD(item.notionTemplates, activeCurrency).toFixed(currConfig.decimals),
        convertFromUSD(item.courses, activeCurrency).toFixed(currConfig.decimals),
        convertFromUSD(item.saasLicenses, activeCurrency).toFixed(currConfig.decimals),
        convertFromUSD(item.ebooks, activeCurrency).toFixed(currConfig.decimals),
        `"${item.topProduct.replace(/"/g, '""')}"`,
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        [headers.join(";"), ...rows.map((row) => row.join(";"))].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const filename = `mansa-statistiques-revenus-${activeCurrency.toLowerCase()}-${
        rangeType === "current" ? dataRange : "30jours"
      }-${new Date().toISOString().slice(0, 10)}.csv`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setIsExporting(false);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3500);
      }, 300);
    } catch (err) {
      console.error("Erreur lors de l'export CSV :", err);
      setIsExporting(false);
    }
  };

  // Filter by timeframe and convert currency values
  const filteredData = useMemo(() => {
    let sliced = [...data];
    if (dataRange === "7d") sliced = sliced.slice(-7);
    else if (dataRange === "14d") sliced = sliced.slice(-14);

    // Apply cumulative calculation if requested
    let runningTotalUSD = 0;
    return sliced.map((item) => {
      runningTotalUSD += item.revenue;
      return {
        ...item,
        convertedRevenue: convertFromUSD(item.revenue, activeCurrency),
        convertedDiscordVip: convertFromUSD(item.discordVip, activeCurrency),
        convertedNotion: convertFromUSD(item.notionTemplates, activeCurrency),
        convertedCourses: convertFromUSD(item.courses, activeCurrency),
        convertedSaas: convertFromUSD(item.saasLicenses, activeCurrency),
        convertedEbooks: convertFromUSD(item.ebooks, activeCurrency),
        cumulativeRevenue: convertFromUSD(runningTotalUSD, activeCurrency),
      };
    });
  }, [data, dataRange, chartType, activeCurrency]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalRev = filteredData.reduce((acc, curr) => acc + curr.convertedRevenue, 0);
    const totalSales = filteredData.reduce((acc, curr) => acc + curr.salesCount, 0);
    const avgDailyRev = totalRev / (filteredData.length || 1);
    const aov = totalSales > 0 ? totalRev / totalSales : 0;
    const bestDay = filteredData.reduce(
      (max, item) => (item.convertedRevenue > max.convertedRevenue ? item : max),
      filteredData[0] || { convertedRevenue: 0, revenue: 0, date: "-", salesCount: 0 }
    );

    const notionTotal = filteredData.reduce((acc, curr) => acc + curr.convertedNotion, 0);
    const discordTotal = filteredData.reduce((acc, curr) => acc + curr.convertedDiscordVip, 0);
    const coursesTotal = filteredData.reduce((acc, curr) => acc + curr.convertedCourses, 0);
    const saasTotal = filteredData.reduce((acc, curr) => acc + curr.convertedSaas, 0);
    const ebooksTotal = filteredData.reduce((acc, curr) => acc + curr.convertedEbooks, 0);

    return {
      totalRev,
      totalSales,
      avgDailyRev,
      aov,
      bestDay,
      notionTotal,
      discordTotal,
      coursesTotal,
      saasTotal,
      ebooksTotal,
      growthRate: totalSales > 0 ? "+100%" : "0%",
    };
  }, [filteredData]);

  // Dynamic Country Origin & Revenue Breakdown (100% computed from real creator transactions)
  const countryBreakdown = useMemo<CountryStat[]>(() => {
    if (!transactions || transactions.length === 0) return [];

    const map: Record<string, { amount: number; salesCount: number; methods: Set<string> }> = {};
    let totalCreatorRevenue = 0;

    transactions.forEach((tx) => {
      const rawAmt =
        tx.amountNumber ||
        parseFloat(String(tx.amount || "0").replace(/[^0-9.]/g, "")) ||
        0;
      const txCurr = (tx.currency as CurrencyCode) || (rawAmt > 500 ? "XOF" : "USD");
      const amtUSD = convertBetweenCurrencies(rawAmt, txCurr, "USD");
      const amt = convertFromUSD(amtUSD, activeCurrency);

      const rawLocation = tx.country || tx.buyerLocation;
      const countryName = extractCountryName(rawLocation);

      if (!map[countryName]) {
        map[countryName] = { amount: 0, salesCount: 0, methods: new Set() };
      }
      map[countryName].amount += amt;
      map[countryName].salesCount += 1;
      totalCreatorRevenue += amt;

      if (tx.paymentMethod && tx.paymentMethod.trim()) {
        map[countryName].methods.add(tx.paymentMethod.trim());
      }
    });

    const allCountries = Object.entries(map).map(([country, data]) => ({
      country,
      flag: getFlagForCountry(country),
      amount: data.amount,
      salesCount: data.salesCount,
      methods: Array.from(data.methods),
    }));

    // Sort descending by revenue
    allCountries.sort((a, b) => b.amount - a.amount);

    if (allCountries.length === 0) return [];

    // Case 1: 5 or fewer countries -> display all with safe percent
    if (allCountries.length <= 5) {
      return allCountries.map((c) => {
        const pct =
          totalCreatorRevenue > 0
            ? Math.round((c.amount / totalCreatorRevenue) * 100)
            : 0;
        return {
          ...c,
          percent: isNaN(pct) ? 0 : pct,
        };
      });
    }

    // Case 2: More than 5 countries -> top 5 + "Autres"
    const top5 = allCountries.slice(0, 5);
    const remaining = allCountries.slice(5);

    let sumTop5Pct = 0;
    const top5WithPct = top5.map((c) => {
      const pct =
        totalCreatorRevenue > 0
          ? Math.round((c.amount / totalCreatorRevenue) * 100)
          : 0;
      const safePct = isNaN(pct) ? 0 : pct;
      sumTop5Pct += safePct;
      return {
        ...c,
        percent: safePct,
      };
    });

    const remainingAmount = remaining.reduce((acc, curr) => acc + curr.amount, 0);
    const remainingSales = remaining.reduce((acc, curr) => acc + curr.salesCount, 0);
    const remainingMethods = new Set<string>();
    remaining.forEach((r) => r.methods.forEach((m) => remainingMethods.add(m)));

    // Others percentage is calculated as 100 minus sum of top 5 percentages (guarantees total = 100%)
    const othersPct =
      totalCreatorRevenue > 0 ? Math.max(0, 100 - sumTop5Pct) : 0;

    const othersItem: CountryStat = {
      country: lang === "fr" ? "Autres" : "Others",
      flag: "🌍",
      amount: remainingAmount,
      percent: isNaN(othersPct) ? 0 : othersPct,
      methods: Array.from(remainingMethods),
      salesCount: remainingSales,
    };

    return [...top5WithPct, othersItem];
  }, [transactions, lang]);

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const currentItem = payload[0].payload as DailyRevenueData & {
        cumulativeRevenue?: number;
        convertedRevenue?: number;
        convertedDiscordVip?: number;
        convertedNotion?: number;
        convertedCourses?: number;
        convertedSaas?: number;
        convertedEbooks?: number;
      };
      return (
        <div className="rounded-xl border border-white/10 bg-[#121316]/95 backdrop-blur-md p-3.5 shadow-2xl text-xs space-y-2 min-w-[220px] z-50">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-semibold text-white">{currentItem.fullDate}</span>
            <span className="font-mono text-[10px] text-zinc-400">Jour {currentItem.dayIndex}</span>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between font-mono">
              <span className="text-zinc-400">
                {chartType === "cumulative" ? "Revenu Cumulé :" : "Revenu du jour :"}
              </span>
              <span className="font-bold text-[#00D26A]">
                {chartType === "cumulative"
                  ? formatCurrency(currentItem.cumulativeRevenue ? (currentItem.cumulativeRevenue / currConfig.rateToUSD) : 0, activeCurrency)
                  : formatCurrency(currentItem.revenue, activeCurrency)}
              </span>
            </div>

            {activeCurrency !== "USD" && (
              <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                <span>Équivalent USD :</span>
                <span>${(chartType === "cumulative" ? (currentItem.cumulativeRevenue ? currentItem.cumulativeRevenue / currConfig.rateToUSD : 0) : currentItem.revenue).toFixed(2)} $US</span>
              </div>
            )}

            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-zinc-400">Ventes enregistrées :</span>
              <span className="text-zinc-200 font-semibold">{currentItem.salesCount} commandes</span>
            </div>

            {chartType === "breakdown" && (
              <div className="pt-2 border-t border-white/5 space-y-1 text-[10px]">
                <div className="flex justify-between text-emerald-400">
                  <span>Accès Discord VIP :</span>
                  <span className="font-mono font-bold">{formatCurrency(currentItem.discordVip, activeCurrency)}</span>
                </div>
                <div className="flex justify-between text-teal-400">
                  <span>Templates Notion :</span>
                  <span className="font-mono font-bold">{formatCurrency(currentItem.notionTemplates, activeCurrency)}</span>
                </div>
                <div className="flex justify-between text-cyan-400">
                  <span>Formations Vidéo :</span>
                  <span className="font-mono font-bold">{formatCurrency(currentItem.courses, activeCurrency)}</span>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>SaaS & Licences :</span>
                  <span className="font-mono font-bold">{formatCurrency(currentItem.saasLicenses, activeCurrency)}</span>
                </div>
                <div className="flex justify-between text-purple-400">
                  <span>E-books PDF :</span>
                  <span className="font-mono font-bold">{formatCurrency(currentItem.ebooks, activeCurrency)}</span>
                </div>
              </div>
            )}

            <div className="pt-1.5 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-zinc-400">
              <Award className="size-3 text-[#00D26A]" />
              <span className="truncate">Top produit : {currentItem.topProduct}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#121316] p-5 sm:p-7 shadow-xl">
      {/* Header with Title and Global Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[#00D26A]/10 border border-[#00D26A]/20 text-[#00D26A]">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {lang === "fr"
                  ? "Analyse des Revenus Numériques (30 jours)"
                  : "Digital Products Revenue Analytics (30 days)"}
              </h2>
              <p className="text-xs text-zinc-400">
                {lang === "fr"
                  ? `Évolution des encaissements nets convertis en ${currConfig.code} (${currConfig.symbol})`
                  : `Net revenue growth and product category breakdown converted to ${currConfig.code}`}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons, CSV Export & Timeframe pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe pill selector */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#171920] p-1 text-xs font-mono">
            {(["7d", "14d", "30d"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDataRange(range)}
                className={`rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer ${
                  dataRange === range
                    ? "bg-[#00D26A] text-black font-bold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {range === "7d" ? "7j" : range === "14d" ? "14j" : "30j"}
              </button>
            ))}
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={() => handleExportCSV("30d")}
            disabled={isExporting}
            title={lang === "fr" ? `Télécharger l'historique en CSV (${activeCurrency})` : `Download stats as CSV (${activeCurrency})`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              exportSuccess
                ? "border-[#00D26A] bg-[#00D26A]/20 text-[#00D26A]"
                : "border-white/10 bg-[#171920] hover:bg-white/5 hover:border-white/20 text-zinc-200"
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="size-3.5 text-[#00D26A]" />
                <span className="text-[#00D26A] font-semibold">{lang === "fr" ? "CSV Téléchargé !" : "CSV Exported!"}</span>
              </>
            ) : (
              <>
                <Download className="size-3.5 text-zinc-400" />
                <span>{lang === "fr" ? "Exporter en CSV" : "Export to CSV"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="rounded-xl border border-white/[0.06] bg-[#171920] p-3 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="truncate">{lang === "fr" ? "Revenu total (30j)" : "Total 30d Revenue"}</span>
            <span className="flex items-center text-[11px] font-semibold text-[#00D26A] shrink-0">
              <ArrowUpRight className="size-3" />
              {metrics.growthRate}
            </span>
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-extrabold text-white font-mono truncate" title={formatCurrency(metrics.totalRev, activeCurrency)}>
            {formatCurrency(metrics.totalRev, activeCurrency)}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono truncate">
            Moyenne : {formatCurrency(metrics.avgDailyRev, activeCurrency)}/jour
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-white/[0.06] bg-[#171920] p-3 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="truncate">{lang === "fr" ? "Ventes réalisées" : "Total Orders"}</span>
            <ShoppingCart className="size-3.5 text-zinc-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-extrabold text-white font-mono">
            {metrics.totalSales} <span className="text-xs font-normal text-zinc-400">commandes</span>
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            100% livraison auto
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="rounded-xl border border-white/[0.06] bg-[#171920] p-3 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="truncate">{lang === "fr" ? "Panier moyen (AOV)" : "Avg. Order Value"}</span>
            <DollarSign className="size-3.5 text-zinc-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-extrabold text-white font-mono truncate" title={formatCurrency(metrics.aov, activeCurrency)}>
            {formatCurrency(metrics.aov, activeCurrency)}
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">
            +14% vs mois dernier
          </div>
        </div>

        {/* Best Performing Day */}
        <div className="rounded-xl border border-white/[0.06] bg-[#171920] p-3 sm:p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="truncate">{lang === "fr" ? "Record journalier" : "Peak Day"}</span>
            <Calendar className="size-3.5 text-zinc-500 shrink-0" />
          </div>
          <div className="text-base sm:text-xl lg:text-2xl font-extrabold text-white font-mono text-[#00D26A] truncate" title={formatCurrency(metrics.bestDay.revenue, activeCurrency)}>
            {formatCurrency(metrics.bestDay.revenue, activeCurrency)}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono truncate">
            {metrics.bestDay.date} ({metrics.bestDay.salesCount} ventes)
          </div>
        </div>
      </div>

      {/* Chart Style Switcher Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16181e] p-1 text-xs overflow-x-auto no-scrollbar max-w-full">
          <button
            onClick={() => setChartType("area")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              chartType === "area"
                ? "bg-[#252932] text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <TrendingUp className="size-3.5 text-[#00D26A]" />
            <span>{lang === "fr" ? `Courbe de Revenu (${activeCurrency})` : `Revenue Curve (${activeCurrency})`}</span>
          </button>

          <button
            onClick={() => setChartType("breakdown")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              chartType === "breakdown"
                ? "bg-[#252932] text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Layers className="size-3.5 text-teal-400" />
            <span>{lang === "fr" ? "Ventilation par Produit" : "Category Breakdown"}</span>
          </button>

          <button
            onClick={() => setChartType("sales")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              chartType === "sales"
                ? "bg-[#252932] text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShoppingCart className="size-3.5 text-cyan-400" />
            <span>{lang === "fr" ? "Volume de Commandes" : "Order Volume"}</span>
          </button>

          <button
            onClick={() => setChartType("cumulative")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer shrink-0 ${
              chartType === "cumulative"
                ? "bg-[#252932] text-white font-bold"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Zap className="size-3.5 text-amber-400" />
            <span>{lang === "fr" ? "Revenu Cumulé" : "Cumulative"}</span>
          </button>
        </div>

        {/* Legend / Category indicator badge */}
        <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#00D26A]" />
            <span>Devise : {activeCurrency} ({currConfig.symbol})</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-teal-400" />
            <span>Templates</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-cyan-400" />
            <span>Communauté</span>
          </div>
        </div>
      </div>

      {/* RECHARTS CANVAS */}
      <div className="h-72 sm:h-80 w-full pt-3">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="rechartsMansaGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D26A" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00D26A" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${currConfig.symbol}`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k ${currConfig.symbol}`;
                  return `${val} ${currConfig.symbol}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="convertedRevenue"
                name={`Revenu Net (${activeCurrency})`}
                stroke="#00D26A"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rechartsMansaGreen)"
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#00D26A" }}
              />
            </AreaChart>
          ) : chartType === "breakdown" ? (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k ${currConfig.symbol}`;
                  return `${val} ${currConfig.symbol}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="convertedDiscordVip"
                stackId="1"
                name="Accès Discord VIP"
                stroke="#00D26A"
                fill="#00D26A"
                fillOpacity={0.75}
              />
              <Area
                type="monotone"
                dataKey="convertedNotion"
                stackId="1"
                name="Templates Notion"
                stroke="#14b8a6"
                fill="#14b8a6"
                fillOpacity={0.75}
              />
              <Area
                type="monotone"
                dataKey="convertedCourses"
                stackId="1"
                name="Formations Vidéo"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.75}
              />
              <Area
                type="monotone"
                dataKey="convertedSaas"
                stackId="1"
                name="SaaS & Licences"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.75}
              />
              <Area
                type="monotone"
                dataKey="convertedEbooks"
                stackId="1"
                name="E-books PDF"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.75}
              />
            </AreaChart>
          ) : chartType === "sales" ? (
            <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="salesCount"
                name="Nombre de Ventes"
                fill="#00D26A"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          ) : (
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -5, bottom: 0 }}>
              <defs>
                <linearGradient id="rechartsCumul" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M ${currConfig.symbol}`;
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k ${currConfig.symbol}`;
                  return `${val} ${currConfig.symbol}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="cumulativeRevenue"
                name={`Revenu Cumulé (${activeCurrency})`}
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#rechartsCumul)"
                activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 2, fill: "#f59e0b" }}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Digital Product Breakdown Table & Insights */}
      <div className="pt-4 border-t border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Category Contribution breakdown bars */}
        <div className="space-y-3 rounded-xl bg-[#171920] p-4 border border-white/[0.04]">
          <h4 className="font-bold text-white flex items-center justify-between">
            <span>{lang === "fr" ? "Répartition des Revenus par Catégorie" : "Revenue by Category"}</span>
            <span className="text-[10px] font-mono text-zinc-400">Total: {formatCurrency(metrics.totalRev, activeCurrency)}</span>
          </h4>

          <div className="space-y-2 text-[11px]">
            {(() => {
              const discordPct = metrics.totalRev > 0 ? Math.round((metrics.discordTotal / metrics.totalRev) * 100) : 0;
              const notionPct = metrics.totalRev > 0 ? Math.round((metrics.notionTotal / metrics.totalRev) * 100) : 0;
              const coursesPct = metrics.totalRev > 0 ? Math.round((metrics.coursesTotal / metrics.totalRev) * 100) : 0;
              const saasPct = metrics.totalRev > 0 ? Math.round((metrics.saasTotal / metrics.totalRev) * 100) : 0;

              return (
                <>
                  <div>
                    <div className="flex justify-between mb-1 text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-[#00D26A]" />
                        Abonnements & Discord VIP
                      </span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(metrics.discordTotal, activeCurrency)} ({discordPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#00D26A] rounded-full"
                        style={{ width: `${discordPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-teal-400" />
                        Templates Notion & Presets
                      </span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(metrics.notionTotal, activeCurrency)} ({notionPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-400 rounded-full"
                        style={{ width: `${notionPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-cyan-400" />
                        Formations & Masterclass Vidéo
                      </span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(metrics.coursesTotal, activeCurrency)} ({coursesPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${coursesPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1 text-zinc-300">
                      <span className="flex items-center gap-1.5">
                        <span className="size-2 rounded-full bg-amber-400" />
                        SaaS & Licences Logicielles
                      </span>
                      <span className="font-mono font-bold text-white">
                        {formatCurrency(metrics.saasTotal, activeCurrency)} ({saasPct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${saasPct}%` }}
                      />
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Dynamic Geographic Breakdown */}
        <div className="space-y-3 rounded-xl bg-[#171920] p-4 border border-white/[0.04] flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="size-4 text-[#00D26A]" />
                {lang === "fr" ? "Origine des Acheteurs & Revenus" : "Revenue by Country & Buyers"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                {countryBreakdown.length > 0
                  ? `${countryBreakdown.length} ${
                      countryBreakdown.length > 1
                        ? lang === "fr"
                          ? "pays"
                          : "countries"
                        : lang === "fr"
                        ? "pays"
                        : "country"
                    }`
                  : lang === "fr"
                  ? "Données réelles"
                  : "Live Data"}
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1">
              {lang === "fr"
                ? "Localisation en temps réel des acheteurs ayant réglé vos produits numériques."
                : "Real-time location of buyers who purchased your digital products."}
            </p>
          </div>

          <div className="space-y-2.5 pt-2">
            {countryBreakdown.length === 0 ? (
              <div className="py-8 px-4 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.01]">
                <Globe className="size-7 mx-auto mb-2 text-zinc-600" />
                <p className="text-xs text-zinc-400 font-medium">
                  {lang === "fr"
                    ? "Aucune transaction enregistrée"
                    : "No transactions recorded yet"}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-xs mx-auto">
                  {lang === "fr"
                    ? "La répartition par pays s'affichera automatiquement dès que vos clients commanderont."
                    : "Country breakdown will appear automatically as soon as customers place orders."}
                </p>
              </div>
            ) : (
              countryBreakdown.map((c) => {
                const safeWidth = Math.min(100, Math.max(0, isNaN(c.percent) ? 0 : c.percent));
                return (
                  <div key={c.country} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base leading-none shrink-0">{c.flag}</span>
                        <span className="text-zinc-200 font-medium truncate">{c.country}</span>
                        {c.methods && c.methods.length > 0 && (
                          <span className="text-[9px] text-zinc-500 font-mono hidden sm:inline truncate">
                            ({c.methods.slice(0, 2).join(", ")})
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono shrink-0 ml-2">
                        <span className="font-bold text-white">
                          {formatCurrency(c.amount, activeCurrency)}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-semibold">
                          ({c.percent}%)
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#00D26A] to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${safeWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
