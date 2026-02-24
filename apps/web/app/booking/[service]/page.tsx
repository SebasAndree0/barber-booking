// apps/web/app/booking/[service]/page.tsx

import { redirect, notFound } from "next/navigation";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_clp?: number | null;
};

function apiUrl(path: string) {
  // ✅ misma idea que el resto de tu app:
  // si existe NEXT_PUBLIC_API_URL úsala; si no, /api/v1 (rewrites same-origin)
  const envBase = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const base = envBase ? envBase : "/api/v1";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function norm(s: string) {
  return (s || "").trim().toLowerCase();
}

/**
 * ✅ Slug -> nombres aceptados (para calzar aunque el backend tenga variantes)
 * Ajusta aquí si tus nombres exactos en /services son distintos.
 */
const SLUG_TO_NAMES: Record<string, string[]> = {
  corte: ["corte"],
  "corte-ceja": ["corte + ceja", "corte ceja"],
  "corte-barba": ["corte + barba", "corte barba"],
  "corte-ceja-barba": [
    "corte + ceja + barba",
    "corte ceja barba",
    "corte + barba + ceja",
  ],
};

export default async function BookingServicePage({
  params,
}: {
  params: { service: string };
}) {
  const slug = norm(params.service);
  const wanted = SLUG_TO_NAMES[slug];

  // slug no reconocido -> 404
  if (!wanted) {
    notFound();
  }

  // trae servicios reales desde la API
  const r = await fetch(apiUrl("/services"), { cache: "no-store" });
  const j = await r.json().catch(() => null);

  if (!r.ok || !Array.isArray(j)) {
    notFound();
  }

  const services = j as Service[];

  // encuentra el servicio por nombre (tolerante)
  const match =
    services.find((s) => wanted.some((w) => norm(s.name) === norm(w))) || null;

  // si el backend no lo tiene, NO 404: manda a booking sin selección (evita “falla”)
  if (!match) {
    redirect("/booking");
  }

  // ✅ redirección final: aquí sí funciona el autoselect del BookingForm
  redirect(`/booking?service_id=${encodeURIComponent(match.id)}`);
}