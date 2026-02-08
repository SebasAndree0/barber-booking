"use client";

import Link from "next/link";
import React from "react";

export default function ContactoPage() {
  const phone = "+56929429715";
  const waText = encodeURIComponent("Hola! Quiero reservar hora en OsoBarber 🙌");
  const waLink = `https://wa.me/${phone.replace("+", "")}?text=${waText}`;

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <h1 className="text-2xl font-semibold">Contacto</h1>
        <p className="mt-2 text-sm text-white/70">
          Escríbenos por WhatsApp o ven directo a la barbería.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-sm font-semibold text-white">📍 Dirección</div>
            <div className="mt-2 text-sm text-white/70">
              Magdalena Petit 15241, San Bernardo
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-sm font-semibold text-white">🕒 Horario</div>
            <div className="mt-2 text-sm text-white/70">
              Lun–Vie 10:00–20:00 <br />
              Sáb 10:00–18:00 <br />
              Dom cerrado
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-sm font-semibold text-white">📞 WhatsApp</div>
            <div className="mt-2 text-sm text-white/70">{phone}</div>

            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
            >
              Abrir WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
          >
            Reservar online
          </Link>

          <Link
            href="/servicios"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
          >
            Ver servicios
          </Link>
        </div>
      </div>

      {/* MAPA (placeholder simple) */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="text-lg font-semibold">Ubicación</div>
        <p className="mt-2 text-sm text-white/70">
          (Después lo conectamos con Google Maps embebido).
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-white/60">
          Magdalena Petit 15241, San Bernardo
        </div>
      </div>
    </div>
  );
}
