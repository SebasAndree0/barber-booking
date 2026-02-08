"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Service = { id: string; name: string; duration_minutes: number };

export default function AdminServices() {
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  const [items, setItems] = useState<Service[]>([]);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState<number>(30);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function load() {
    if (!base) {
      throw new Error(
        "Falta NEXT_PUBLIC_API_URL en apps/web/.env.local (ej: http://127.0.0.1:8001/api/v1)"
      );
    }

    const r = await fetch(`${base}/services`, { cache: "no-store" });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
    setItems(Array.isArray(j) ? (j as Service[]) : []);
  }

  useEffect(() => {
    load().catch((e) => setMsg({ type: "err", text: e.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (name.trim().length < 2) {
      setMsg({ type: "err", text: "Nombre muy corto (mín 2 letras)" });
      return;
    }
    if (!Number.isFinite(duration) || duration < 5 || duration > 240) {
      setMsg({ type: "err", text: "Duración inválida (5–240 min)" });
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`${base}/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ name: name.trim(), duration_minutes: duration }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      setName("");
      setDuration(30);
      await load();
      setMsg({ type: "ok", text: "Servicio creado ✅" });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">Admin • Servicios</div>
            <div className="text-xs text-white/60">Crear y listar</div>
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
        <form onSubmit={onCreate} className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Crear servicio</div>
          <p className="mt-1 text-sm text-white/60">Nombre + duración en minutos.</p>

          {msg && (
            <div
              className={[
                "mt-4 rounded-xl border p-3 text-sm",
                msg.type === "ok"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-200",
              ].join(" ")}
            >
              {msg.text}
            </div>
          )}

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_140px]">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corte"
              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
            />

            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              max={240}
              step={5}
              className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
            />

            <button
              disabled={loading}
              className="h-11 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Lista de servicios</div>

          <div className="mt-4 grid gap-2">
            {items.length === 0 ? (
              <div className="text-sm text-white/60">Sin servicios</div>
            ) : (
              items.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-white/60">{s.duration_minutes} min</div>
                  </div>
                  <div className="text-xs text-white/40 break-all">{s.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
