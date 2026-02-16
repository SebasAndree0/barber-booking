"use client";

import React from "react";
import Link from "next/link";

export default function AdminHome() {
  async function handleLogout() {
    await fetch("/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">OsoBarber</div>
            <div className="text-xs text-white/60">Admin</div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              ← Volver a reservas
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/barbers"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-semibold">Barberos</div>
            <div className="mt-1 text-sm text-white/60">Crear / editar / borrar</div>
          </Link>

          <Link
            href="/admin/services"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-semibold">Servicios</div>
            <div className="mt-1 text-sm text-white/60">Crear / editar / borrar</div>
          </Link>

          <Link
            href="/admin/bookings"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-semibold">Reservas</div>
            <div className="mt-1 text-sm text-white/60">Crear / editar / borrar</div>
          </Link>
        </div>

        {/* ✅ Eliminado: "Siguiente paso" */}
      </main>
    </div>
  );
}
