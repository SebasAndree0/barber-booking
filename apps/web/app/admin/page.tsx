"use client";

import React from "react";
import Link from "next/link";

export default function AdminHome() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-lg font-semibold">OsoBarber</div>
            <div className="text-xs text-white/60">Admin</div>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ← Volver a reservas
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <Link
            href="/admin/barbers"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Barberos</div>
            <div className="mt-1 text-sm text-white/60">Crear / editar / borrar</div>
          </Link>

          <Link
            href="/admin/services"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Servicios</div>
            <div className="mt-1 text-sm text-white/60">Duración y nombres</div>
          </Link>

          <Link
            href="/admin/bookings"
            className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10"
          >
            <div className="text-lg font-semibold">Reservas</div>
            <div className="mt-1 text-sm text-white/60">Ver por día / barbero</div>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/70">
          <div className="font-semibold text-white">Siguiente paso</div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Hacer Barberos (lista + crear)</li>
            <li>Hacer Servicios (lista + crear)</li>
            <li>Hacer Reservas (filtro por día + barbero)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
