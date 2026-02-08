"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Barber = { id: string; name: string };

export default function AdminBarbers() {
  const base = useMemo(() => process.env.NEXT_PUBLIC_API_URL ?? "", []);
  const [items, setItems] = useState<Barber[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);

    if (!base) {
      throw new Error(
        "Falta NEXT_PUBLIC_API_URL. Crea apps/web/.env.local y pon: NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api/v1"
      );
    }

    const r = await fetch(`${base}/barbers`, { cache: "no-store" });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
    setItems(Array.isArray(j) ? (j as Barber[]) : []);
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!base) return setMsg("Falta NEXT_PUBLIC_API_URL en apps/web/.env.local");
    if (name.trim().length < 2) return setMsg("Nombre muy corto");

    setLoading(true);
    try {
      const r = await fetch(`${base}/barbers`, {
        method: "POST",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
      setName("");
      await load();
      setMsg("Barbero creado ✅");
    } catch (e: any) {
      setMsg(e?.message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">Admin • Barberos</div>
            <div className="text-xs text-white/60">Crear y listar</div>
          </div>
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            ← Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8 grid gap-6">
        <form onSubmit={onCreate} className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Crear barbero</div>

          <div className="mt-4 flex gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan"
              className="h-11 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
            />
            <button
              disabled={loading}
              className="h-11 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
            >
              {loading ? "Creando..." : "Crear"}
            </button>
          </div>

          {msg && <div className="mt-3 text-sm text-white/70">{msg}</div>}
        </form>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-lg font-semibold">Lista</div>
          <div className="mt-4 grid gap-2">
            {items.length === 0 ? (
              <div className="text-sm text-white/60">Sin barberos</div>
            ) : (
              items.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                >
                  <div className="font-semibold">{b.name}</div>
                  <div className="text-xs text-white/40 break-all">{b.id}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
