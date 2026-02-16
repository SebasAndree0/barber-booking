export type ServiceSlug = "corte" | "corte-barba" | "corte-ceja" | "corte-ceja-barba";

export type ServicePricing = {
  promo: number;          // precio promo visible
  normal?: number;        // precio normal (tachado) si aplica
  badge?: string;         // ej: "Promo ceja gratis"
};

export const SERVICE_BY_SLUG: Record<ServiceSlug, { id: string; label: string; pricing: ServicePricing }> = {
  // ✅ tus UUID reales
  "corte": {
    id: "11111111-1111-1111-1111-111111111111",
    label: "Corte",
    pricing: { promo: 7000 },
  },
  "corte-barba": {
    id: "11111111-1111-1111-1111-111111111113",
    label: "Corte + barba",
    pricing: { promo: 9000 },
  },
  "corte-ceja": {
    id: "11111111-1111-1111-1111-111111111112",
    label: "Corte + ceja",
    pricing: { promo: 7500, normal: 8000, badge: "Promo ceja" },
  },
  "corte-ceja-barba": {
    id: "11111111-1111-1111-1111-111111111114",
    label: "Corte + ceja + barba",
    pricing: { promo: 9000, normal: 10000, badge: "Promo ceja" },
  },
};

export function formatCLP(n: number) {
  return n.toLocaleString("es-CL");
}
