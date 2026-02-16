"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Barber = { id: string; name: string };

type Booking = {
  id: string;
  client_name: string;
  client_phone: string;
  start_time: string; // ISO
  end_time: string;   // ISO
};

type RangeMode = "day" | "week" | "month";

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function isoToHHMM(iso: string) {
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function dayAndHHMMToISO(day: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  const d = new Date(day + "T00:00:00");
  d.setHours(h || 0, m || 0, 0, 0);
  return d.toISOString();
}

function yyyymmdd(date: Date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function startOfWeekMonday(dayStr: string) {
  const d = new Date(dayStr + "T12:00:00");
  const jsDay = d.getDay(); // 0=Dom..6=Sab
  const diffToMonday = (jsDay + 6) % 7; // Lun->0 ... Dom->6
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function endOfWeekSunday(fromMonday: Date) {
  const d = new Date(fromMonday);
  d.setDate(d.getDate() + 6);
  return d;
}

function startOfMonth(dayStr: string) {
  const d = new Date(dayStr + "T12:00:00");
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0);
}

function endOfMonth(dayStr: string) {
  const d = new Date(dayStr + "T12:00:00");
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 12, 0, 0);
}

function enumerateDaysInclusive(startDay: string, endDay: string) {
  const out: string[] = [];
  const cur = new Date(startDay + "T12:00:00");
  const end = new Date(endDay + "T12:00:00");
  while (cur.getTime() <= end.getTime()) {
    out.push(yyyymmdd(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

async function fetchJson<T>(url: string) {
  const r = await fetch(url, { cache: "no-store" });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
  return j as T;
}

export default function AdminBookings() {
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberId, setBarberId] = useState<string>("");
  const [day, setDay] = useState<string>(todayYYYYMMDD());
  const [rangeMode, setRangeMode] = useState<RangeMode>("day");

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // edición
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eStart, setEStart] = useState("09:00");
  const [eEnd, setEEnd] = useState("09:30");

  function startEdit(b: Booking) {
    setMsg(null);
    setErr(null);
    setEditingId(b.id);
    setEName(b.client_name || "");
    setEPhone(b.client_phone || "");
    setEStart(isoToHHMM(b.start_time));
    setEEnd(isoToHHMM(b.end_time));
  }

  function cancelEdit() {
    setEditingId(null);
  }

  const canLoad = !!base && !!barberId && !!day;

  const range = useMemo(() => {
    if (!day) return null;

    if (rangeMode === "day") {
      return { start: day, end: day, label: day };
    }

    if (rangeMode === "week") {
      const s = startOfWeekMonday(day);
      const e = endOfWeekSunday(s);
      const start = yyyymmdd(s);
      const end = yyyymmdd(e);
      return { start, end, label: `${start} → ${end}` };
    }

    const s = startOfMonth(day);
    const e = endOfMonth(day);
    const start = yyyymmdd(s);
    const end = yyyymmdd(e);
    return { start, end, label: `${start} → ${end}` };
  }, [day, rangeMode]);

  // cargar barberos
  useEffect(() => {
    let alive = true;

    async function loadBarbers() {
      if (!base) {
        throw new Error(
          "Falta NEXT_PUBLIC_API_URL en apps/web/.env.local (ej: http://127.0.0.1:8001/api/v1)"
        );
      }

      const j = await fetchJson<any>(`${base}/barbers`);
      const list = Array.isArray(j) ? (j as Barber[]) : [];
      if (!alive) return;

      setBarbers(list);
      setBarberId((prev) => prev || list[0]?.id || "");
    }

    loadBarbers().catch((e) => {
      if (!alive) return;
      setErr(e?.message || "Error cargando barberos");
    });

    return () => {
      alive = false;
    };
  }, [base]);

  async function loadBookings(showMsg = false) {
    if (!canLoad || !range) return;

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      // ✅ Día: 1 llamada
      if (rangeMode === "day") {
        const url = `${base}/bookings?barber_id=${encodeURIComponent(barberId)}&day=${encodeURIComponent(
          range.start
        )}`;
        const j = await fetchJson<any>(url);
        const list = Array.isArray(j) ? (j as Booking[]) : [];
        const sorted = [...list].sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        setItems(sorted);
        if (showMsg) setMsg("Lista actualizada ✅");
        return;
      }

      // ✅ Semana/Mes: N llamadas con day=YYYY-MM-DD
      const days = enumerateDaysInclusive(range.start, range.end);

      const CONCURRENCY = 6;
      const all: Booking[] = [];

      for (let i = 0; i < days.length; i += CONCURRENCY) {
        const chunk = days.slice(i, i + CONCURRENCY);

        const chunkResults = await Promise.all(
          chunk.map(async (d) => {
            const url = `${base}/bookings?barber_id=${encodeURIComponent(barberId)}&day=${encodeURIComponent(d)}`;
            const j = await fetchJson<any>(url);
            return Array.isArray(j) ? (j as Booking[]) : [];
          })
        );

        for (const arr of chunkResults) all.push(...arr);
      }

      const map = new Map<string, Booking>();
      for (const b of all) map.set(b.id, b);

      const merged = Array.from(map.values());
      const sorted = merged.sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setItems(sorted);

      if (showMsg) setMsg(`Lista actualizada ✅ (${days.length} día(s))`);
    } catch (e: any) {
      setErr(e?.message || "Error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [barberId, day, rangeMode, base]);

  async function onDelete(id: string) {
    setMsg(null);
    setErr(null);

    if (!confirm("¿Seguro que quieres borrar esta reserva?")) return;

    setLoading(true);
    try {
      const r = await fetch(`${base}/bookings/${id}`, {
        method: "DELETE",
        headers: { accept: "application/json" },
      });

      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      if (editingId === id) cancelEdit();
      await loadBookings();
      setMsg("Reserva borrada ✅");
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  async function onSaveEdit(id: string) {
    setMsg(null);
    setErr(null);

    if (!eName.trim()) return setErr("Falta nombre");
    if (!ePhone.trim()) return setErr("Falta teléfono");
    if (!eStart || !eEnd) return setErr("Faltan horas");

    const startISO = dayAndHHMMToISO(day, eStart);
    const endISO = dayAndHHMMToISO(day, eEnd);

    if (new Date(endISO).getTime() <= new Date(startISO).getTime()) {
      return setErr("La hora fin debe ser mayor a la hora inicio");
    }

    setLoading(true);
    try {
      const r = await fetch(`${base}/bookings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          client_name: eName.trim(),
          client_phone: ePhone.trim(),
          start_time: startISO,
          end_time: endISO,
        }),
      });

      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      cancelEdit();
      await loadBookings();
      setMsg("Reserva actualizada ✅");
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">Admin • Reservas</div>
            <div className="text-xs text-white/60">
              Filtrar por barbero y{" "}
              {rangeMode === "day" ? "día" : rangeMode === "week" ? "semana" : "mes"}
              {range && rangeMode !== "day" ? ` • ${range.label}` : ""}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadBookings(true)}
              disabled={loading || !canLoad}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              Refrescar
            </button>

            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              ← Admin
            </Link>

            {/* ✅ Salir -> /admin/login */}
            <Link
              href="/admin/login"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Salir
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 grid gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Filtros</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            <div className="grid gap-2">
              <label className="text-sm text-white/70">Barbero</label>
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
              >
                {barbers.length === 0 ? (
                  <option value="">(sin barberos)</option>
                ) : (
                  barbers.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Rango</label>
              <select
                value={rangeMode}
                onChange={(e) => setRangeMode(e.target.value as RangeMode)}
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
              >
                <option value="day">Día</option>
                <option value="week">Semana</option>
                <option value="month">Mes</option>
              </select>
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">{rangeMode === "day" ? "Día" : "Referencia"}</label>
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm text-white/70">Acciones</label>
              <button
                type="button"
                onClick={() => loadBookings(true)}
                disabled={loading || !canLoad}
                className="h-11 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Cargando..." : "Refrescar"}
              </button>
            </div>
          </div>

          {(err || msg) && (
            <div className="mt-4 text-sm">
              {err && <div className="text-rose-200">Error: {err}</div>}
              {!err && msg && <div className="text-white/70">{msg}</div>}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Lista</div>
            <div className="text-sm text-white/60">{loading ? "Cargando…" : `${items.length} reservas`}</div>
          </div>

          <div className="mt-4 grid gap-3">
            {!loading && !err && items.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                Sin reservas para este filtro.
              </div>
            ) : (
              items.map((b) => {
                const isEditing = editingId === b.id;

                return (
                  <div key={b.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <div className="grid gap-3">
                            <input
                              value={eName}
                              onChange={(e) => setEName(e.target.value)}
                              placeholder="Nombre cliente"
                              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
                            />
                            <input
                              value={ePhone}
                              onChange={(e) => setEPhone(e.target.value)}
                              placeholder="Teléfono"
                              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
                            />
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="grid gap-1">
                                <label className="text-xs text-white/60">Inicio</label>
                                <input
                                  type="time"
                                  value={eStart}
                                  onChange={(e) => setEStart(e.target.value)}
                                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
                                />
                              </div>
                              <div className="grid gap-1">
                                <label className="text-xs text-white/60">Fin</label>
                                <input
                                  type="time"
                                  value={eEnd}
                                  onChange={(e) => setEEnd(e.target.value)}
                                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <div className="font-semibold">{b.client_name}</div>
                              <div className="text-sm text-white/70">
                                {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                              </div>
                            </div>

                            <div className="mt-1 text-sm text-white/60">{b.client_phone}</div>
                            <div className="mt-2 text-xs text-white/40 break-all">ID: {b.id}</div>
                          </>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => onSaveEdit(b.id)}
                              disabled={loading}
                              className="h-10 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
                            >
                              Guardar
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={loading}
                              className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-white/80 hover:bg-white/10 disabled:opacity-60"
                            >
                              Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(b)}
                              disabled={loading}
                              className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-white/80 hover:bg-white/10 disabled:opacity-60"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => onDelete(b.id)}
                              disabled={loading}
                              className="h-10 rounded-xl border border-red-500/30 bg-red-500/10 px-4 text-red-100 hover:bg-red-500/20 disabled:opacity-60"
                            >
                              Borrar
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
