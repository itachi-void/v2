export const monthlyData = [
  { month: "Jan", collections: 4200, revenue: 8400, recycled: 3900, efficiency: 92 },
  { month: "Feb", collections: 4800, revenue: 9600, recycled: 4500, efficiency: 94 },
  { month: "Mar", collections: 5200, revenue: 10400, recycled: 4900, efficiency: 94 },
  { month: "Apr", collections: 5800, revenue: 11600, recycled: 5500, efficiency: 95 },
  { month: "May", collections: 6200, revenue: 12400, recycled: 5900, efficiency: 95 },
  { month: "Jun", collections: 6800, revenue: 13600, recycled: 6500, efficiency: 96 },
  { month: "Jul", collections: 7200, revenue: 14400, recycled: 6900, efficiency: 96 },
  { month: "Aug", collections: 7600, revenue: 15200, recycled: 7300, efficiency: 96 },
  { month: "Sep", collections: 8100, revenue: 16200, recycled: 7800, efficiency: 96 },
  { month: "Oct", collections: 8500, revenue: 17000, recycled: 8200, efficiency: 97 },
  { month: "Nov", collections: 9200, revenue: 18400, recycled: 8900, efficiency: 97 },
  { month: "Dec", collections: 9800, revenue: 19600, recycled: 9500, efficiency: 97 },
];

export const predictiveData = [
  ...monthlyData.slice(6),
  { month: "Jan (F)", collections: 10200, revenue: 20400, recycled: 9800, efficiency: 97, isForecast: true },
  { month: "Feb (F)", collections: 10800, revenue: 21600, recycled: 10400, efficiency: 98, isForecast: true },
  { month: "Mar (F)", collections: 11500, revenue: 23000, recycled: 11100, efficiency: 98, isForecast: true },
];

export const categoryData = [
  { name: "Plastic", value: 35, color: "#10b981" },
  { name: "Glass", value: 25, color: "#14b8a6" },
  { name: "Metal", value: 20, color: "#f59e0b" },
  { name: "Paper", value: 15, color: "#84cc16" },
  { name: "Other", value: 5, color: "#94a3b8" },
];

export const performanceData = [
  { category: "Collection", score: 95 },
  { category: "Processing", score: 88 },
  { category: "Distribution", score: 92 },
  { category: "Quality", score: 90 },
  { category: "Efficiency", score: 94 },
  { category: "Sustainability", score: 96 },
];

export const regionData = [
  { region: "North", bottles: 2400, centers: 8, drivers: 24 },
  { region: "South", bottles: 2100, centers: 6, drivers: 18 },
  { region: "East", bottles: 2800, centers: 10, drivers: 30 },
  { region: "West", bottles: 2200, centers: 7, drivers: 21 },
  { region: "Central", bottles: 3100, centers: 12, drivers: 36 },
];

export const topDrivers = [
  { id: 1, name: "Ahmed Hassan", collections: 1240, revenue: 2480, rating: 4.9, badge: "gold" },
  { id: 2, name: "Mohamed Ali", collections: 1180, revenue: 2360, rating: 4.8, badge: "gold" },
  { id: 3, name: "Sara Ahmed", collections: 1120, revenue: 2240, rating: 4.7, badge: "silver" },
  { id: 4, name: "Omar Khaled", collections: 1050, revenue: 2100, rating: 4.7, badge: "silver" },
  { id: 5, name: "Fatima Said", collections: 980, revenue: 1960, rating: 4.6, badge: "bronze" },
];

export const badgeColor: Record<string, string> = {
  gold: "from-amber-300 to-amber-500",
  silver: "from-slate-300 to-slate-500",
  bronze: "from-orange-400 to-orange-600",
};

export type TimeRange = "week" | "month" | "quarter" | "year";

export const rangeMonths: Record<TimeRange, number> = {
  week: 1,
  month: 1,
  quarter: 3,
  year: 12,
};
