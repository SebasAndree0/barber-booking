"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_clp?: number | null;
  description?: string | null;
};

export default function ServiciosPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        // 🔥 SIEMPRE RELATIVO (pasa por rewrite)
        const r = await fetch("/api/v1/services", { cache: "no-store" });
        const j = await r.json().catch(() => null);

        if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

        const list = Array.isArray(j) ? (j as Service[]) : [];
        if (!alive) return;
        setItems(list);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Failed to fetch");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const subtitle = useMemo(() => {
    if (loading) return "Cargando…";
    if (err) return `Error: ${err}`;
    return `${items.length} servicio(s) disponibles`;
  }, [loading, err, items.length]);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Servicios</h1>
        <p className="mt-2 text-sm text-white/70">{subtitle}</p>
      </div>

      {err && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {err}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((s) => (
          <div
            key={s.id}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="text-lg font-semibold">{s.name}</div>
            <div className="mt-2 text-sm text-white/70">
              Duración: {s.duration_minutes} min
            </div>

            {typeof s.price_clp === "number" && (
              <div className="mt-2 text-sm text-white/80">
                Precio: {Intl.NumberFormat("es-CL").format(s.price_clp)} CLP
              </div>
            )}

            {s.description && (
              <div className="mt-3 text-sm text-white/70">{s.description}</div>
            )}

            <Link
              href={`/booking?service_id=${encodeURIComponent(s.id)}`}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-white/90"
            >
              Reservar este servicio
            </Link>
          </div>
        ))}
      </div>

      {!loading && !err && items.length === 0 && (
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
          Aún no hay servicios creados. Créalo en{" "}
          <Link className="underline" href="/admin/services">
            Admin → Servicios
          </Link>
          .
        </div>
      )}
    </div>
  );
}
