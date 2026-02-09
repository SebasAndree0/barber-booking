"use client";

import React, { useEffect, useMemo, useState } from "react";

type Booking = {
  id: string;
  client_name: string;
  client_phone: string | null;
  client_email?: string | null;
  start_time: string;
  end_time: string;
  status?: "CONFIRMED" | "PENDING" | "CANCELLED" | string;
  cancelled_at?: string | null;
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

  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const url = useMemo(() => {
    if (!barberId) return null;
    if (!apiBase) return null;

    const q = new URLSearchParams();
    q.set("barber_id", barberId);
    q.set("day", day);
    if (showCancelled) q.set("include_cancelled", "true");

    return `${apiBase}/bookings?${q.toString()}`;
  }, [apiBase, barberId, day, showCancelled]);

  function load() {
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
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, refreshKey, barberId, apiBase]);

  async function cancelBooking(id: string) {
    if (!apiBase) return;

    // confirm simple
    const ok = window.confirm("¿Cancelar esta reserva? (No se borra, queda como CANCELLED)");
    if (!ok) return;

    setCancelingId(id);
    setErr(null);
    try {
      const r = await fetch(`${apiBase}/bookings/${encodeURIComponent(id)}/cancel`, {
        method: "POST",
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      // refresca lista
      load();
    } catch (e: any) {
      setErr(e?.message || "No se pudo cancelar.");
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">Agenda del día</h3>
          <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-xs text-white/70">
            {items.length} reservas
          </span>

          <label className="ml-2 inline-flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={showCancelled}
              onChange={(e) => setShowCancelled(e.target.checked)}
            />
            Ver canceladas
          </label>
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

              const cancelled = (b.status || "").toUpperCase() === "CANCELLED";

              const msg = `Hola ${b.client_name} 👋 Te confirmo tu reserva en OsoBarber para el ${day} a las ${start}.`;
              const href = b.client_phone ? waLink(b.client_phone, msg) : null;

              return (
                <div
                  key={b.id}
                  className={[
                    "rounded-xl border bg-black/30 p-4",
                    cancelled ? "border-white/5 opacity-60" : "border-white/10",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className={["font-semibold", cancelled ? "line-through" : ""].join(" ")}>
                          {b.client_name}
                        </div>

                        {cancelled ? (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                            CANCELLED
                          </span>
                        ) : (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
                            {b.status || "CONFIRMED"}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 text-sm text-white/60">
                        {b.client_phone || b.client_email || "(sin contacto)"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-white/70">
                        {start} – {end}
                      </div>

                      <div className="mt-2 flex items-center justify-end gap-2">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                            title="Abrir WhatsApp"
                          >
                            WhatsApp
                          </a>
                        ) : null}

                        <button
                          type="button"
                          disabled={cancelled || cancelingId === b.id}
                          onClick={() => cancelBooking(b.id)}
                          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-100 hover:bg-rose-500/15 disabled:opacity-50"
                          title={cancelled ? "Ya está cancelada" : "Cancelar reserva"}
                        >
                          {cancelingId === b.id ? "Cancelando…" : "Cancelar"}
                        </button>
                      </div>
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
