"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Settings = {
  address: string;
  whatsapp: string;
  instagram_url: string;
  tiktok_url: string;
  hours_week: string;
  hours_sat: string;
  hours_sun: string;
  google_maps_embed_url: string;
};

export default function AdminSettings() {
  const [data, setData] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function load() {
    setMsg(null);
    const r = await fetch("/api/admin/settings", { cache: "no-store" });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
    setData(j as Settings);
  }

  useEffect(() => {
    load().catch((e) => setMsg(e.message));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
      setData(j as Settings);
      setMsg("Guardado ✅");
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
            <div className="text-lg font-semibold">Admin • Configuración</div>
            <div className="text-xs text-white/60">Dirección, horarios, redes, mapa</div>
          </div>
          <Link href="/admin" className="text-sm text-white/70 hover:text-white">
            ← Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!data ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm text-white/70">{msg || "Cargando..."}</div>
          </div>
        ) : (
          <form onSubmit={save} className="grid gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold">Contacto</div>

              <div className="mt-4 grid gap-3">
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.address}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                  placeholder="Dirección"
                />
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.whatsapp}
                  onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
                  placeholder="WhatsApp"
                />
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.instagram_url}
                  onChange={(e) => setData({ ...data, instagram_url: e.target.value })}
                  placeholder="Instagram URL"
                />
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.tiktok_url}
                  onChange={(e) => setData({ ...data, tiktok_url: e.target.value })}
                  placeholder="TikTok URL"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold">Horario</div>
              <div className="mt-4 grid gap-3">
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.hours_week}
                  onChange={(e) => setData({ ...data, hours_week: e.target.value })}
                />
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.hours_sat}
                  onChange={(e) => setData({ ...data, hours_sat: e.target.value })}
                />
                <input
                  className="h-11 rounded-xl border border-white/10 bg-black/30 px-3 outline-none"
                  value={data.hours_sun}
                  onChange={(e) => setData({ ...data, hours_sun: e.target.value })}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-lg font-semibold">Google Maps</div>
              <div className="mt-2 text-sm text-white/60">
                Pega solo el <span className="text-white/80">src</span> del iframe (embed).
              </div>

              <textarea
                className="mt-4 min-h-[110px] w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none"
                value={data.google_maps_embed_url}
                onChange={(e) => setData({ ...data, google_maps_embed_url: e.target.value })}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={loading}
                className="h-11 rounded-xl bg-white px-4 font-semibold text-black disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
              {msg && <div className="text-sm text-white/70">{msg}</div>}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
