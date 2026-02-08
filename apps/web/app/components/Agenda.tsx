"use client";

import React, { useEffect, useMemo, useState } from "react";

type Booking = {
  id: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function waLink(phoneRaw: string, text: string) {
  const phone = (phoneRaw || "").replace(/[^\d]/g, "");
  const msg = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${msg}`;
}

export default function Agenda({
  base,
  barberId,
  refreshKey = 0,
  day,
  onDayChange,
}: {
  base?: string;
  barberId: string;
  refreshKey?: number;
  day: string;
  onDayChange: (day: string) => void;
}) {
  // ✅ UNA sola verdad: debe incluir /api/v1 (ej: http://127.0.0.1:8001/api/v1)
  const apiBase = base || process.env.NEXT_PUBLIC_API_URL || "";

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const url = useMemo(() => {
    if (!barberId) return null;
    if (!apiBase) return null;

    // ✅ NO agregues /api/v1 aquí
    return `${apiBase}/bookings?barber_id=${encodeURIComponent(barberId)}&day=${encodeURIComponent(
      day
    )}`;
  }, [apiBase, barberId, day]);

  useEffect(() => {
    if (!barberId) return;
    if (!apiBase) {
      setErr(
        "Falta NEXT_PUBLIC_API_URL en apps/web/.env.local (ej: http://127.0.0.1:8001/api/v1)"
      );
      return;
    }
    if (!url) return;

    setLoading(true);
    setErr(null);

    fetch(url, { cache: "no-store" })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
        return (Array.isArray(j) ? j : []) as Booking[];
      })
      .then((list) => {
        const sorted = [...list].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        setItems(sorted);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, [url, refreshKey, barberId, apiBase]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Agenda del día</h3>
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-white/70">
            {items.length} reservas
          </span>
        </div>

        <input
          type="date"
          value={day}
          onChange={(e) => onDayChange(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none"
        />
      </div>

      {!barberId && (
        <p className="mt-3 text-sm text-white/70">Elige un barbero para ver su agenda.</p>
      )}

      {loading && <p className="mt-3 text-sm text-white/70">Cargando…</p>}
      {err && <p className="mt-3 text-sm text-rose-200">Error: {err}</p>}

      {!loading && !err && barberId && (
        <div className="mt-4 grid gap-3">
          {items.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
              Sin reservas para este día.
            </div>
          ) : (
            items.map((b) => {
              const start = formatTime(b.start_time);
              const end = formatTime(b.end_time);

              const msg = `Hola ${b.client_name} 👋 Te confirmo tu reserva en OsoBarber para el ${day} a las ${start}.`;
              const href = waLink(b.client_phone, msg);

              return (
                <div key={b.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{b.client_name}</div>
                      <div className="mt-1 text-sm text-white/60">{b.client_phone}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white/70">
                        {start} – {end}
                      </div>

                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                        title="Abrir WhatsApp"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-white/40 break-all">ID: {b.id}</div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
