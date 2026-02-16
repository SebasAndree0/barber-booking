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

  // edición inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  function setError(e: any) {
    setMsg(e?.message || "Error");
  }

  async function load(showMsg = false) {
    setMsg(null);

    if (!base) {
      throw new Error(
        "Falta NEXT_PUBLIC_API_URL. En apps/web/.env.local pon: NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api/v1"
      );
    }

    const r = await fetch(`${base}/barbers`, { cache: "no-store" });
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

    setItems(Array.isArray(j) ? (j as Barber[]) : []);
    if (showMsg) setMsg("Lista actualizada ✅");
  }

  useEffect(() => {
    load().catch(setError);
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
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(b: Barber) {
    setMsg(null);
    setEditingId(b.id);
    setEditingName(b.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEdit(id: string) {
    setMsg(null);

    const newName = editingName.trim();
    if (newName.length < 2) return setMsg("Nombre muy corto");

    setLoading(true);
    try {
      // ⚠️ Ajusta a PATCH si tu API lo usa, pero probamos PUT primero
      const r = await fetch(`${base}/barbers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      cancelEdit();
      await load();
      setMsg("Barbero actualizado ✅");
    } catch (e: any) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(id: string) {
    setMsg(null);

    if (!confirm("¿Seguro que quieres borrar este barbero?")) return;

    setLoading(true);
    try {
      const r = await fetch(`${base}/barbers/${id}`, {
        method: "DELETE",
        headers: { accept: "application/json" },
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      // si estabas editando ese mismo, resetea
      if (editingId === id) cancelEdit();

      await load();
      setMsg("Barbero borrado ✅");
    } catch (e: any) {
      setError(e);
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
            <div className="text-xs text-white/60">Crear / editar / borrar</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => load(true).catch(setError)}
              disabled={loading}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 disabled:opacity-60"
            >
              Refrescar
            </button>

            <Link href="/admin" className="text-sm text-white/70 hover:text-white">
              ← Admin
            </Link>
          </div>
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
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">Lista</div>
            <div className="text-sm text-white/60">{items.length} barberos</div>
          </div>

          <div className="mt-4 grid gap-2">
            {items.length === 0 ? (
              <div className="text-sm text-white/60">{loading ? "Cargando..." : "Sin barberos"}</div>
            ) : (
              items.map((b) => {
                const isEditing = editingId === b.id;

                return (
                  <div
                    key={b.id}
                    className="rounded-xl border border-white/10 bg-black/30 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {isEditing ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-white outline-none"
                          />
                        ) : (
                          <div className="font-semibold">{b.name}</div>
                        )}
                        <div className="mt-1 text-xs text-white/40 break-all">{b.id}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(b.id)}
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
