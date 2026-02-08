"use client";

import Link from "next/link";
import React from "react";

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8.5 3h7A5.5 5.5 0 0 1 21 8.5v7A5.5 5.5 0 0 1 15.5 21h-7A5.5 5.5 0 0 1 3 15.5v-7A5.5 5.5 0 0 1 8.5 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 16.2A4.2 4.2 0 1 0 12 7.8a4.2 4.2 0 0 0 0 8.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M17.2 7.2h.01"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconTikTok(props: React.SVGProps<SVGSVGElement>) {
  // Ícono simple estilo “nota musical” (no el logo exacto)
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14 3v11.2a3.8 3.8 0 1 1-2-3.36V7.2c2.2 2.2 4.4 3 7 3V7.7c-1.9 0-3.6-.7-5-2.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 11.7A8 8 0 1 1 11.7 4a8 8 0 0 1 8.3 7.7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M7.5 19.5 8.6 17a7.9 7.9 0 0 0 3.1.6 7.8 7.8 0 0 0 7.8-7.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.2 9.2c-.3.5-.3 1.2.1 1.9.6 1 1.8 2.3 3 2.9.7.4 1.4.4 1.9.1l.7-.5c.3-.2.8-.2 1.1 0l1 .7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <div className="grid gap-10">
      {/* HERO */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur">
        <div className="grid gap-8 md:grid-cols-[1.1fr_.9fr] md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs text-white/70">
              San Bernardo • Reserva online
            </div>

            <h1 className="mt-4 text-3xl md:text-5xl font-semibold leading-tight">
              Cortes limpios, barba precisa y atención de primera.
            </h1>

            <p className="mt-4 text-sm md:text-base text-white/70 max-w-xl">
              Agenda tu hora en segundos. Elige barbero, servicio y horario disponible.
              Llega directo a tu turno.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
              >
                Reservar ahora
              </Link>

              <a
                href="#servicios"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Ver cortes
              </a>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-semibold">Rápido</div>
                <div className="mt-1 text-xs text-white/60">Elige hora y listo</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-semibold">Ordenado</div>
                <div className="mt-1 text-xs text-white/60">Slots reales disponibles</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="text-sm font-semibold">Pro</div>
                <div className="mt-1 text-xs text-white/60">Agenda por barbero</div>
              </div>
            </div>
          </div>

          {/* PANEL derecho */}
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="text-lg font-semibold">Información</div>

            <div className="mt-4 grid gap-3 text-sm text-white/70">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Dirección</div>
                <div className="mt-1">Magdalena Petit 15241, San Bernardo</div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Horario</div>
                <div className="mt-1">
                  Lun–Vie 19:00–22:00 • Sáb–Dom 10:00–23:00
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Contacto</div>
                <div className="mt-1">WhatsApp: +56 9 2942 9715</div>

                {/* Botones pro */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href="https://wa.me/56929429715"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
                  >
                    <IconWhatsApp className="h-4 w-4" />
                    WhatsApp
                  </a>

                  <a
                    href="https://www.instagram.com/osobarberr_?igsh=bG9uaGxzYnkxOXF0"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    <IconInstagram className="h-4 w-4" />
                    Instagram
                  </a>

                  <a
                    href="https://www.tiktok.com/@oso.barber.cl"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    <IconTikTok className="h-4 w-4" />
                    TikTok
                  </a>
                </div>
              </div>
            </div>

            <Link
              href="/booking"
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
            >
              Reservar ahora
            </Link>
          </div>
        </div>
      </section>

      {/* SECCIÓN: por qué elegir */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Cortes & estilos",
            desc: "Clásico, fade, degradado y asesoría rápida según tu cara.",
          },
          {
            title: "Barba & perfilado",
            desc: "Barba ordenada, perfilada y con acabado prolijo.",
          },
          {
            title: "Agenda inteligente",
            desc: "Horarios disponibles reales por barbero y servicio.",
          },
        ].map((x) => (
          <div
            key={x.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
          >
            <div className="text-lg font-semibold">{x.title}</div>
            <div className="mt-2 text-sm text-white/70">{x.desc}</div>
            <div className="mt-5">
              <Link
                href="/booking"
                className="text-sm font-semibold text-white/80 hover:text-white underline underline-offset-4"
              >
                Reservar →
              </Link>
            </div>
          </div>
        ))}
      </section>

      {/* QUIÉNES SOMOS */}
      <section
        id="quienes-somos"
        className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold">Quiénes somos</h2>
            <p className="mt-4 text-sm md:text-base text-white/70">
              OsoBarber nace en San Bernardo con una idea simple: cortes limpios, barba precisa
              y atención de primera. Acá reservas tu hora, llegas a tu turno y te atiendes como corresponde.
            </p>
            <p className="mt-3 text-sm md:text-base text-white/70">
              Buscamos que salgas con un look pro, sin esperas, con buena vibra y un servicio ordenado.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="text-lg font-semibold">OsoBarber • San Bernardo</div>
            <div className="mt-3 text-sm text-white/70">
              Magdalena Petit 15241 <br />
              WhatsApp: +56 9 2942 9715
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href="/booking"
                className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
              >
                Reservar
              </Link>
              <a
                href="#ubicacion"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Ver ubicación
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CORTES (Carrusel simple) */}
      <section id="servicios" className="grid gap-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Cortes</h2>
          <Link
            href="/booking"
            className="text-sm font-semibold text-white/80 hover:text-white underline underline-offset-4"
          >
            Reservar →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { title: "Corte clásico", desc: "Limpio y elegante para el día a día." },
            { title: "Fade / Degradado", desc: "Transición perfecta, acabado prolijo." },
            { title: "Corte + ceja", desc: "Servicio completo, rápido y pro." },
            { title: "Barba & perfilado", desc: "Diseño y alineado preciso." },
          ].map((s) => (
            <div
              key={s.title}
              className="min-w-[280px] rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
            >
              <div className="text-lg font-semibold">{s.title}</div>
              <div className="mt-2 text-sm text-white/70">{s.desc}</div>
              <div className="mt-5">
                <Link
                  href="/booking"
                  className="text-sm font-semibold text-white/80 hover:text-white underline underline-offset-4"
                >
                  Reservar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* UBICACIÓN */}
      <section id="ubicacion" className="grid gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">Ubicación</h2>
          <p className="mt-2 text-sm md:text-base text-white/70">
            Magdalena Petit 15241, San Bernardo
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <iframe
            src="https://www.google.com/maps?q=Magdalena%20Petit%2015241%20San%20Bernardo&output=embed"
            width="100%"
            height="380"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* CONTACTO */}
      <section
        id="contacto"
        className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 backdrop-blur"
      >
        <h2 className="text-2xl md:text-3xl font-semibold">Contacto</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="font-semibold">Dirección</div>
            <div className="mt-2 text-sm text-white/70">
              Magdalena Petit 15241, San Bernardo
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="font-semibold">Horario</div>
            <div className="mt-2 text-sm text-white/70">
              Lun–Vie 19:00–22:00 <br />
              Sáb–Dom 10:00–23:00<br />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="font-semibold">Redes & WhatsApp</div>
            <div className="mt-2 text-sm text-white/70">
              WhatsApp: +56 9 2942 9715
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href="https://wa.me/56929429715"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
              >
                <IconWhatsApp className="h-4 w-4" />
                WhatsApp
              </a>

              <a
                href="https://www.instagram.com/osobarberr_?igsh=bG9uaGxzYnkxOXF0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                <IconInstagram className="h-4 w-4" />
                Instagram
              </a>

              <a
                href="https://www.tiktok.com/@oso.barber.cl"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                <IconTikTok className="h-4 w-4" />
                TikTok
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
