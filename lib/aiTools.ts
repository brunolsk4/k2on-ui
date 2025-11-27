// Catálogo unificado de ferramentas somente leitura para o Assistente Inteligente.
// Cada tool possui integração, nome, inputSchema e hasSideEffect=false.

export type AiIntegration = "meta";

export interface AiTool {
  integration: AiIntegration;
  name: string;
  inputSchema: Record<string, unknown>;
  hasSideEffect: false;
}

export const aiToolsCatalog: AiTool[] = [
  // Meta Ads — somente tools suportadas no MCP
  { integration: "meta", name: "meta_getCampaigns", inputSchema: { type: "object", properties: { adAccountId: { type: "string" }, pageId: { type: "string" }, date_range: { type: "object", properties: { since: { type: "string" }, until: { type: "string" } }, additionalProperties: false }, fields: { type: "array", items: { type: "string" } }, limit: { type: "number" } }, additionalProperties: false }, hasSideEffect: false },
  { integration: "meta", name: "meta_insights", inputSchema: { type: "object", properties: { adAccountId: { type: "string" }, pageId: { type: "string" }, level: { enum: ["campaign", "adset", "ad"] }, metrics: { type: "array", items: { type: "string" } }, date_range: { type: "object", properties: { since: { type: "string" }, until: { type: "string" } }, required: ["since", "until"], additionalProperties: false }, filters: { type: "object" } }, required: ["level", "metrics", "date_range"], additionalProperties: false }, hasSideEffect: false },
  { integration: "meta", name: "meta_getSpend", inputSchema: { type: "object", properties: { adAccountId: { type: "string" }, pageId: { type: "string" } }, additionalProperties: false }, hasSideEffect: false },
  { integration: "meta", name: "meta_getCampaignSpend", inputSchema: { type: "object", properties: { adAccountId: { type: "string" }, preset: { type: "string" }, since: { type: "string" }, until: { type: "string" } }, additionalProperties: false }, hasSideEffect: false },
  { integration: "meta", name: "meta_getSpendPeriod", inputSchema: { type: "object", properties: { adAccountId: { type: "string" }, pageId: { type: "string" }, since: { type: "string" }, until: { type: "string" } }, required: ["since", "until"], additionalProperties: false }, hasSideEffect: false },
  { integration: "meta", name: "meta_getSummary", inputSchema: { type: "object", properties: { adAccountId: { type: "string" }, pageId: { type: "string" }, since: { type: "string" }, until: { type: "string" } }, additionalProperties: false }, hasSideEffect: false },
];

export function getToolsByIntegration(integration: AiIntegration) {
  return aiToolsCatalog.filter((tool) => tool.integration === integration);
}
