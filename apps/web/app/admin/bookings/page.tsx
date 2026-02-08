"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Barber = { id: string; name: string };

type Booking = {
  id: string;
  client_name: string;
  client_phone: string;
  start_time: string;
  end_time: string;
};

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

export default function AdminBookings() {
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [barberId, setBarberId] = useState<string>("");
  const [day, setDay] = useState<string>(todayYYYYMMDD());

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // cargar barberos
  useEffect(() => {
    let alive = true;

    async function loadBarbers() {
      if (!base) {
        throw new Error(
          "Falta NEXT_PUBLIC_API_URL en apps/web/.env.local (ej: http://127.0.0.1:8001/api/v1)"
        );
      }

      const r = await fetch(`${base}/barbers`, { cache: "no-store" });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      const list = Array.isArray(j) ? (j as Barber[]) : [];
      if (!alive) return;

      setBarbers(list);
      setBarberId((prev) => prev || list[0]?.id || "");
    }

    loadBarbers().catch((e) => {
      if (!alive) return;
      setErr(e.message);
    });

    return () => {
      alive = false;
    };
  }, [base]);

  const url = useMemo(() => {
    if (!base || !barberId) return null;
    return `${base}/bookings?barber_id=${encodeURIComponent(barberId)}&day=${encodeURIComponent(day)}`;
  }, [base, barberId, day]);

  async function loadBookings() {
    if (!url) return;
    setLoading(true);
    setErr(null);

    try {
      const r = await fetch(url, { cache: "no-store" });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      const list = Array.isArray(j) ? (j as Booking[]) : [];
      const sorted = [...list].sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      setItems(sorted);
    } catch (e: any) {
      setErr(e?.message || "Error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // cargar bookings al cambiar barber/día
  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">Admin • Reservas</div>
            <div className="text-xs text-white/60">Filtrar por barbero y día</div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              ← Admin
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            >
              Reservas
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 grid gap-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Filtros</div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
              <label className="text-sm text-white/70">Día</label>
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
                onClick={loadBookings}
                disabled={loading || !url}
                className="h-11 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Cargando..." : "Refrescar"}
              </button>
            </div>
          </div>

          {err && <div className="mt-4 text-sm text-rose-200">Error: {err}</div>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Lista</div>
            <div className="text-sm text-white/60">
              {loading ? "Cargando…" : `${items.length} reservas`}
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {!loading && !err && items.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                Sin reservas para este filtro.
              </div>
            ) : (
              items.map((b) => (
                <div key={b.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{b.client_name}</div>
                    <div className="text-sm text-white/70">
                      {fmtTime(b.start_time)} – {fmtTime(b.end_time)}
                    </div>
                  </div>

                  <div className="mt-1 text-sm text-white/60">{b.client_phone}</div>
                  <div className="mt-2 text-xs text-white/40 break-all">ID: {b.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
