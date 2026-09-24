export const AGENTS = [
  { key: "orchestrator", op: "0", name: "Orchestrator" },
  { key: "client_intelligence", op: "1", name: "Client Intelligence" },
  { key: "market_intelligence", op: "2", name: "Market Intelligence" },
  { key: "brand_studio", op: "3", name: "Brand Studio" },
  { key: "market_strategy", op: "4", name: "Market Strategy" },
  { key: "campaign_architect", op: "5", name: "Campaign Architect" },
  { key: "content_studio", op: "6", name: "Content Studio" },
  { key: "video_creative", op: "6B", name: "Video Creative" },
  { key: "campaign_operations", op: "7", name: "Campaign Operations" },
  { key: "account_integration", op: "8", name: "Account & Integration" },
  { key: "campaign_intelligence", op: "9", name: "Campaign Intelligence" },
  { key: "growth_optimization", op: "10", name: "Growth Optimization" },
] as const;

export type AgentKey = (typeof AGENTS)[number]["key"];

export const INTEGRATION_CATALOG = [
  { provider: "meta", label: "Meta (Facebook, Instagram, Threads)" },
  { provider: "linkedin", label: "LinkedIn" },
  { provider: "tiktok", label: "TikTok" },
  { provider: "youtube", label: "YouTube" },
  { provider: "x", label: "X" },
  { provider: "pinterest", label: "Pinterest" },
  { provider: "email", label: "Email service provider" },
  { provider: "google_ads", label: "Google Ads" },
  { provider: "analytics", label: "Analytics" },
] as const;

export const CHANNELS: {
  id: string;
  label: string;
  integration: string;
  aliases: string[];
}[] = [
  { id: "instagram", label: "Instagram", integration: "meta", aliases: ["instagram", "insta", "ig"] },
  { id: "facebook", label: "Facebook", integration: "meta", aliases: ["facebook", "fb"] },
  { id: "linkedin", label: "LinkedIn", integration: "linkedin", aliases: ["linkedin", "linked in"] },
  { id: "tiktok", label: "TikTok", integration: "tiktok", aliases: ["tiktok", "tik tok"] },
  { id: "youtube", label: "YouTube", integration: "youtube", aliases: ["youtube", "you tube"] },
  { id: "x", label: "X", integration: "x", aliases: ["twitter", "x.com"] },
  { id: "threads", label: "Threads", integration: "meta", aliases: ["threads"] },
  { id: "pinterest", label: "Pinterest", integration: "pinterest", aliases: ["pinterest"] },
  { id: "email", label: "Email", integration: "email", aliases: ["email", "newsletter", "emails"] },
  { id: "google_ads", label: "Google Ads", integration: "google_ads", aliases: ["google ads", "adwords", "search ads"] },
  { id: "website", label: "Website", integration: "analytics", aliases: ["website", "landing page", "web page"] },
];

export function agentByKey(key: string) {
  return AGENTS.find((agent) => agent.key === key);
}
