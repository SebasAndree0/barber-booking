"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Booking = {
  id: string;
  barber_id: string;
  service_id: string;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  start_time: string;
  end_time: string;
  status: string;
  cancelled_at?: string | null;
};

function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function cleanName(s: string) {
  return (s || "").trim().replace(/\s+/g, " ");
}

// ✅ FIX: calcular YYYY-MM-DD en zona horaria Chile (evita que se corra al día siguiente por UTC)
function dayInChileYYYYMMDD(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const da = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}-${m}-${da}`;
}

function fmtDateCL(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function isPast(isoStart: string) {
  return new Date(isoStart).getTime() <= Date.now();
}

function safeTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(e) || e <= s) return fmtTime(startIso);
  return `${fmtTime(startIso)} – ${fmtTime(endIso)}`;
}

function normalizeStatus(status: string) {
  const up = (status || "").toUpperCase();
  if (up === "CANCELLED") return { label: "CANCELADA", className: "text-rose-200" };
  if (up === "CONFIRMED") return { label: "CONFIRMADA", className: "text-emerald-200" };
  if (up === "PENDING") return { label: "PENDIENTE", className: "text-amber-200" };
  if (up === "ACTIVE") return { label: "ACTIVA", className: "text-emerald-200" };
  return { label: up || "—", className: "text-white/70" };
}

export default function MyBookingsClient() {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const sp = useSearchParams();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const fullName = useMemo(() => cleanName(`${firstName} ${lastName}`), [firstName, lastName]);

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // ✅ Pro: ocultar pasadas por defecto
  const [showPast, setShowPast] = useState(false);

  // ✅ Pro: “ocultar de mi vista” (localStorage)
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const canSearch = useMemo(() => {
    return cleanName(firstName).length >= 2 && cleanName(lastName).length >= 2;
  }, [firstName, lastName]);

  // cargar hiddenIds
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("osb_hidden_bookings") || "[]";
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) setHiddenIds(new Set(arr.map(String)));
    } catch {}
  }, []);

  function persistHidden(next: Set<string>) {
    setHiddenIds(next);
    try {
      window.localStorage.setItem("osb_hidden_bookings", JSON.stringify(Array.from(next)));
    } catch {}
  }

  function pickBestClientName(list: Booking[]) {
    const counts = new Map<string, number>();
    for (const b of list) {
      const n = cleanName(b.client_name || "");
      if (!n) continue;
      counts.set(n, (counts.get(n) || 0) + 1);
    }
    let best = "";
    let bestN = 0;
    for (const [name, n] of counts.entries()) {
      if (n > bestN) {
        best = name;
        bestN = n;
      }
    }
    return best;
  }

  async function loadBookings(name?: string) {
    setErr(null);

    const nameToUse = cleanName(name ?? fullName);

    if (!base) {
      setErr("Falta NEXT_PUBLIC_API_URL en apps/web/.env.local (ej: http://127.0.0.1:8001/api/v1)");
      return;
    }

    if (nameToUse.length < 4 || !nameToUse.includes(" ")) {
      setErr("Ingresa Nombre y Apellido (ambos).");
      return;
    }

    setLoading(true);
    try {
      // guardamos para autocompletar después
      try {
        window.localStorage.setItem("osb_client_name", nameToUse);
      } catch {}

      // ✅ NUEVO endpoint: /bookings/my?name=...
      const r = await fetch(apiUrl(`/bookings/my?name=${encodeURIComponent(nameToUse)}`), {
        cache: "no-store",
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      const list = Array.isArray(j) ? (j as Booking[]) : [];

      // upcoming arriba, past abajo
      const upcoming = list
        .filter((b) => !isPast(b.start_time))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      const past = list
        .filter((b) => isPast(b.start_time))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      const sorted = [...upcoming, ...past];

      setItems(sorted);

      const best = pickBestClientName(sorted);
      if (best) {
        // si la API devuelve reservas, usamos el nombre real guardado
        const parts = best.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
    } catch (e: any) {
      setItems([]);
      setErr(e?.message || "No se pudieron cargar tus reservas.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ 1) cargar name desde querystring o localStorage
  useEffect(() => {
    const qName = cleanName(sp.get("name") || "");
    const qAuto = cleanName(sp.get("autosearch") || "");

    const saved = cleanName(window.localStorage.getItem("osb_client_name") || "");
    const finalName = qName || saved;

    if (finalName) {
      const parts = finalName.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }

    // ✅ 2) si viene autosearch=1, buscar altiro
    if (finalName && qAuto === "1") {
      loadBookings(finalName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  async function cancelBooking(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;

    const nameToUse = cleanName(fullName);
    if (nameToUse.length < 4 || !nameToUse.includes(" ")) {
      setErr("Para cancelar, ingresa tu Nombre y Apellido (los mismos de la reserva).");
      return;
    }

    setErr(null);
    try {
      // ✅ NUEVO: cancel por name
      const r = await fetch(
        apiUrl(`/bookings/${encodeURIComponent(id)}/cancel?name=${encodeURIComponent(nameToUse)}`),
        { method: "POST" }
      );
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      await loadBookings();
    } catch (e: any) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("no autorizado") || msg.includes("forbidden") || msg.includes("403")) {
        setErr("No autorizado: ese nombre no corresponde a esta reserva.");
      } else if (msg.includes("pasada")) {
        setErr("Esa reserva ya pasó, por eso no se puede cancelar.");
      } else if (msg.includes("anticipación") || msg.includes("minutos")) {
        setErr("Esa reserva está muy encima. Para cancelar, debe ser con anticipación.");
      } else {
        setErr(e?.message || "No se pudo cancelar la reserva.");
      }
    }
  }

  function buildEditHref(b: Booking) {
    const qs = new URLSearchParams();

    qs.set("mode", "reschedule");
    qs.set("booking_id", b.id);

    if (b.service_id) qs.set("service_id", b.service_id);
    if (b.barber_id) qs.set("barber_id", b.barber_id);

    if (b.start_time) {
      qs.set("start_time", b.start_time);
      qs.set("day", dayInChileYYYYMMDD(b.start_time));
    }

    // ✅ ya no usamos email
    if (cleanName(fullName)) qs.set("name", cleanName(fullName));
    else if (b.client_name) qs.set("name", cleanName(b.client_name));

    return `/booking?${qs.toString()}`;
  }

  const waLink =
    "https://wa.me/56929429715?text=" +
    encodeURIComponent("Hola! Tengo una duda sobre mi reserva en OsoBarber 🙌");

  const visibleItems = useMemo(() => {
    const list = items.filter((b) => !hiddenIds.has(b.id));
    if (showPast) return list;
    return list.filter((b) => !isPast(b.start_time));
  }, [items, hiddenIds, showPast]);

  const totalUpcoming = useMemo(
    () => items.filter((b) => !hiddenIds.has(b.id) && !isPast(b.start_time)).length,
    [items, hiddenIds]
  );

  const totalPast = useMemo(
    () => items.filter((b) => !hiddenIds.has(b.id) && isPast(b.start_time)).length,
    [items, hiddenIds]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">Mis reservas</div>
            <div className="text-xs text-white/60">Consulta y cancela tus horas con tu Nombre + Apellido</div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/booking"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              ← Reservar
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Inicio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Buscar</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="grid gap-2">
              <label className="text-sm text-white/70">Nombre</label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ej: Sebastián"
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Apellido</label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Ej: Brenet"
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
              />
              <div className="text-xs text-white/50">Usamos tu nombre para encontrar tus reservas.</div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Acción</label>
              <button
                type="button"
                onClick={() => loadBookings()}
                disabled={loading || !canSearch}
                className="h-11 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Buscando…" : "Ver mis reservas"}
              </button>
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
              {err}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              ¿Dudas? WhatsApp →
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold">Lista</div>
              <div className="text-xs text-white/60">
                {fullName ? `Cliente: ${fullName}` : "Cliente"}
                {items.length ? ` • ${items.length} reservas` : ""}
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-white/70">
                  Próximas: {totalUpcoming}
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-white/70">
                  Pasadas: {totalPast}
                </span>
              </div>
            </div>

            <div className="grid gap-2 justify-items-end">
              <button
                type="button"
                onClick={() => loadBookings()}
                disabled={loading || !canSearch}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
              >
                Refrescar
              </button>

              <button
                type="button"
                onClick={() => setShowPast((v) => !v)}
                className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                {showPast ? "Ocultar pasadas" : "Ver pasadas"}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {!loading && !err && visibleItems.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                {showPast
                  ? "No hay reservas para mostrar."
                  : "No tienes reservas futuras. (Activa “Ver pasadas” si quieres)"}
              </div>
            ) : (
              visibleItems.map((b) => {
                const cancelled = (b.status || "").toUpperCase() === "CANCELLED";
                const past = isPast(b.start_time);
                const status = normalizeStatus(b.status);

                const dateLabel = fmtDateCL(b.start_time);
                const timeLabel = safeTimeRange(b.start_time, b.end_time);

                return (
                  <div key={b.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">
                          {dateLabel} • {timeLabel}
                        </div>

                        <div className="mt-1 text-sm text-white/60">
                          Estado: <span className={status.className}>{status.label}</span>
                          {past && !cancelled ? <span className="ml-2 text-xs text-white/40">(pasada)</span> : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Link
                          href={buildEditHref(b)}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                          title="Reagendar con mismo servicio/día/hora"
                        >
                          Reagendar
                        </Link>

                        {cancelled ? (
                          <button
                            type="button"
                            disabled
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/50 opacity-60 cursor-not-allowed"
                          >
                            Cancelada
                          </button>
                        ) : past ? (
                          <button
                            type="button"
                            onClick={() => {
                              const next = new Set(hiddenIds);
                              next.add(b.id);
                              persistHidden(next);
                            }}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                            title="Oculta esta reserva solo en tu vista"
                          >
                            Ocultar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => cancelBooking(b.id)}
                            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-white/40 break-all">ID: {b.id}</div>
                    {b.cancelled_at ? (
                      <div className="mt-1 text-xs text-white/40">
                        Cancelada: {new Date(b.cancelled_at).toLocaleString("es-CL")}
                      </div>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>

          {hiddenIds.size > 0 ? (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/60">
              <span>Ocultas: {hiddenIds.size}</span>
              <button
                type="button"
                onClick={() => persistHidden(new Set())}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
              >
                Mostrar todo otra vez
              </button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
