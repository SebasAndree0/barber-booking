// C:\osobarber\barber-booking\apps\web\app\page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

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
      <path d="M17.2 7.2h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function IconTikTok(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M20 11.7A8 8 0 1 1 11.7 4a8 8 0 0 1 8.3 7.7Z" stroke="currentColor" strokeWidth="1.6" />
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

function clp(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

type PriceItem = {
  title: string;
  desc: string;
  promo: number;
  normal?: number;
  badge?: string;
  href: string;
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[11px] font-semibold text-white/70">
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/5 backdrop-blur ${className}`}>{children}</div>;
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm md:text-base text-white/70">{subtitle}</p> : null}
      </div>
    </div>
  );
}

export default function Home() {
  const BUSINESS = useMemo(
    () => ({
      phoneDisplay: "+56 9 2942 9715",
      waNumber: "56929429715",
      address: "Magdalena Petit 15241, San Bernardo",
      ig: "https://www.instagram.com/osobarberr_?igsh=bG9uaGxzYnkxOXF0",
      tt: "https://www.tiktok.com/@oso.barber.cl",
      mapsEmbed: "https://www.google.com/maps?q=Magdalena%20Petit%2015241%20San%20Bernardo&output=embed",
    }),
    []
  );

  const waLink =
    "https://wa.me/" +
    BUSINESS.waNumber +
    "?text=" +
    encodeURIComponent("Hola! Quiero agendar una hora en OsoBarber 🙌");

  // ✅ UUID reales desde tu API
  const SERVICE = {
    corte: "11111111-1111-1111-1111-111111111111",
    corteCeja: "11111111-1111-1111-1111-111111111112",
    corteBarba: "11111111-1111-1111-1111-111111111113",
    corteCejaBarba: "11111111-1111-1111-1111-111111111114",
  };

  const SERVICES_AND_PRICES: PriceItem[] = [
    { title: "Corte", desc: "Corte moderno o clásico, prolijo y rápido.", promo: 7000, href: `/booking?service_id=${SERVICE.corte}` },
    { title: "Corte + ceja", desc: "Corte + perfilado de cejas.", promo: 7000, normal: 8000, badge: "Promo", href: `/booking?service_id=${SERVICE.corteCeja}` },
    { title: "Corte + barba", desc: "Corte + perfilado de barba.", promo: 9000, href: `/booking?service_id=${SERVICE.corteBarba}` },
    { title: "Corte + ceja + barba", desc: "Servicio completo.", promo: 9000, normal: 10000, badge: "Promo", href: `/booking?service_id=${SERVICE.corteCejaBarba}` },
  ];

  // ✅ Fotos (ponlas en /public/oso/)
  const GALLERY = useMemo(
    () => [
      { src: "/oso/g1.jpg", alt: "OsoBarber — interior" },
      { src: "/oso/g2.jpg", alt: "OsoBarber — estación de corte" },
      { src: "/oso/g3.jpg", alt: "OsoBarber — barber tools" },
      { src: "/oso/g4.jpg", alt: "OsoBarber — detalles" },
      { src: "/oso/g5.jpg", alt: "OsoBarber — ambiente" },
      { src: "/oso/g6.jpg", alt: "OsoBarber — barbería" },
    ],
    []
  );

  const [lightbox, setLightbox] = useState<number | null>(null);

  // cerrar lightbox con ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight" && lightbox !== null) setLightbox((i) => (i === null ? null : (i + 1) % GALLERY.length));
      if (e.key === "ArrowLeft" && lightbox !== null) setLightbox((i) => (i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, GALLERY.length]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
      {/* Top bar (empresa) */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <Image
                src="/logo-oso.png"
                alt="OsoBarber"
                fill
                sizes="36px"
                className="object-contain p-1.5"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">OsoBarber</div>
              <div className="text-xs text-white/60">Reserva online • San Bernardo</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            <a href="#servicios" className="rounded-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
              Servicios
            </a>
            <a href="#galeria" className="rounded-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
              Galería
            </a>
            <a href="#ubicacion" className="rounded-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
              Ubicación
            </a>
            <a href="#faq" className="rounded-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 transition">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/my-bookings"
              className="hidden sm:inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
            >
              Mis reservas
            </Link>

            <Link
              href="/booking"
              className="inline-flex rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
            >
              Agendar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 grid gap-10">
        {/* HERO con foto */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
          <div className="absolute inset-0">
            <Image
              src="/oso/hero.jpg"
              alt="OsoBarber"
              fill
              sizes="(max-width: 768px) 100vw, 1200px"
              className="object-cover opacity-35"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/55 to-black/85" />
          </div>

          <div className="relative p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-[1.15fr_.85fr] md:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>Reserva online</Badge>
                  <Badge>Horarios reales</Badge>
                  <Badge>San Bernardo</Badge>
                </div>

                <h1 className="mt-4 text-3xl md:text-5xl font-semibold leading-tight">
                  Tu corte, tu hora, sin filas.
                </h1>

                <p className="mt-4 text-sm md:text-base text-white/70 max-w-xl leading-relaxed">
                  Selecciona servicio y horario disponible. Confirmas y listo.
                  Después lo gestionas en “Mis reservas” con tu <b>Nombre + Apellido</b>.
                </p>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/booking"
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition"
                  >
                    Agendar ahora
                  </Link>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    Hablar por WhatsApp
                  </a>

                  <a
                    href="#servicios"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black/30 px-6 py-3 font-semibold text-white/80 hover:bg-white/10 transition"
                  >
                    Ver precios
                  </a>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-semibold">Disponibilidad real</div>
                    <div className="mt-1 text-xs text-white/60">Ocupado / libre al tiro</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-semibold">Reagenda fácil</div>
                    <div className="mt-1 text-xs text-white/60">Cambias la hora sin drama</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                    <div className="text-sm font-semibold">Atención pro</div>
                    <div className="mt-1 text-xs text-white/60">Orden, puntualidad y calidad</div>
                  </div>
                </div>
              </div>

              {/* Caja info pro */}
              <Card className="p-6 bg-black/35">
                <div className="text-lg font-semibold">Información</div>
                <div className="mt-4 grid gap-3 text-sm text-white/75">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">Dirección</div>
                    <div className="mt-1">{BUSINESS.address}</div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">Horario</div>
                    <div className="mt-1">
                      Lun–Vie 19:00–22:00 <br />
                      Sábado 10:00–22:00 <br />
                      Domingo 10:00–21:00
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="font-semibold text-white">Contacto</div>
                    <div className="mt-1">WhatsApp: {BUSINESS.phoneDisplay}</div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
                      >
                        <IconWhatsApp className="h-4 w-4" />
                        WhatsApp
                      </a>

                      <a
                        href={BUSINESS.ig}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                      >
                        <IconInstagram className="h-4 w-4" />
                        Instagram
                      </a>

                      <a
                        href={BUSINESS.tt}
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

                <div className="mt-5 grid gap-2">
                  <Link
                    href="/booking"
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
                  >
                    Agendar
                  </Link>

                  <Link
                    href="/my-bookings"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    Mis reservas
                  </Link>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* SERVICIOS */}
        <section id="servicios" className="grid gap-4">
          <SectionHead title="Servicios y precios" subtitle="Selecciona un servicio y agenda directo." />

          <div className="grid gap-4 md:grid-cols-2">
            {SERVICES_AND_PRICES.map((s) => (
              <Card key={s.title} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{s.title}</div>
                      {s.badge ? <Badge>{s.badge}</Badge> : null}
                    </div>
                    <div className="mt-2 text-sm text-white/70">{s.desc}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-semibold">{clp(s.promo)}</div>
                    {typeof s.normal === "number" ? (
                      <div className="text-xs text-white/45 line-through">{clp(s.normal)}</div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={s.href}
                    className="inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
                  >
                    Agendar este servicio
                  </Link>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    Consultar por WhatsApp
                  </a>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-xs text-white/50">
            * Precios sujetos a promociones vigentes.
          </div>
        </section>

        {/* GALERÍA (nivel empresa) */}
        <section id="galeria" className="grid gap-4">
          <SectionHead title="Galería" subtitle="Fotos reales del local para que se vea serio y pro." />

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {GALLERY.map((img, idx) => (
              <button
                key={img.src}
                type="button"
                onClick={() => setLightbox(idx)}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                title="Ver foto"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/0 opacity-70" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="text-left text-xs font-semibold text-white/90">{img.alt}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Lightbox */}
          {lightbox !== null ? (
            <div className="fixed inset-0 z-[200] bg-black/85 p-6 grid place-items-center" onClick={() => setLightbox(null)}>
              <div className="w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-white/70">
                    {lightbox + 1} / {GALLERY.length}
                  </div>
                  <button
                    type="button"
                    onClick={() => setLightbox(null)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={GALLERY[lightbox].src}
                      alt={GALLERY[lightbox].alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 900px"
                      className="object-contain"
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setLightbox((i) => (i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    ← Anterior
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightbox((i) => (i === null ? null : (i + 1) % GALLERY.length))}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* BARBERO / TEAM (más marca) */}
        <section className="grid gap-4">
          <SectionHead title="Tu barbero" subtitle="Atención consistente, estilo limpio, detalle pro." />

          <div className="grid gap-4 md:grid-cols-[.9fr_1.1fr]">
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  <Image
                    src="/oso/fernando.jpg"
                    alt="Barbero"
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div>
                  <div className="text-lg font-semibold">Fernando</div>
                  <div className="text-sm text-white/70">Corte • Barba • Detalle</div>
                </div>
              </div>

              <div className="mt-4 text-sm text-white/70 leading-relaxed">
                En OsoBarber la idea es simple: <b>puntualidad</b>, <b>prolijidad</b> y <b>estilo</b>.
                Agenda tu hora y llegas directo.
              </div>

              <div className="mt-5 flex gap-2">
                <Badge>Precisión</Badge>
                <Badge>Prolijo</Badge>
                <Badge>Sin filas</Badge>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-semibold">Cómo atendemos</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm font-semibold">1) Llegas</div>
                  <div className="mt-1 text-xs text-white/60">A tu hora, sin esperar</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm font-semibold">2) Te atienden</div>
                  <div className="mt-1 text-xs text-white/60">Detalle y prolijidad</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                  <div className="text-sm font-semibold">3) Te vas listo</div>
                  <div className="mt-1 text-xs text-white/60">Corte limpio y orden</div>
                </div>
              </div>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 font-semibold text-black hover:bg-white/90 transition"
                >
                  Agendar ahora
                </Link>

                <Link
                  href="/my-bookings"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  Mis reservas
                </Link>
              </div>
            </Card>
          </div>
        </section>

        {/* UBICACIÓN */}
        <section id="ubicacion" className="grid gap-4">
          <SectionHead title="Ubicación" subtitle={BUSINESS.address} />

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <iframe
              title="Mapa OsoBarber"
              src={BUSINESS.mapsEmbed}
              width="100%"
              height="380"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="grid gap-4">
          <SectionHead title="Preguntas frecuentes" subtitle="Esto también sube mucho el nivel “empresa”." />

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="font-semibold">¿Cómo veo o cancelo mi reserva?</div>
              <div className="mt-2 text-sm text-white/70">
                Entra a <b>Mis reservas</b> y busca con tu <b>Nombre + Apellido</b>.
              </div>
            </Card>

            <Card className="p-6">
              <div className="font-semibold">¿Puedo cambiar la hora?</div>
              <div className="mt-2 text-sm text-white/70">
                Sí. En <b>Mis reservas</b> puedes reagendar a un horario disponible.
              </div>
            </Card>

            <Card className="p-6">
              <div className="font-semibold">¿Consultas rápidas?</div>
              <div className="mt-2 text-sm text-white/70">
                WhatsApp directo y te respondemos.
              </div>
            </Card>

            <Card className="p-6">
              <div className="font-semibold">¿Qué pasa si llego tarde?</div>
              <div className="mt-2 text-sm text-white/70">
                Ideal llegar a la hora. Si te atrasas, avisa por WhatsApp para coordinar.
              </div>
            </Card>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-white/10 pt-8 pb-10 text-sm text-white/60 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>OsoBarber • San Bernardo</div>
          <div className="flex flex-wrap gap-4">
            <Link className="hover:text-white/80" href="/booking">
              Reservar
            </Link>
            <Link className="hover:text-white/80" href="/my-bookings">
              Mis reservas
            </Link>
            <a className="hover:text-white/80" href={waLink} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
          </div>
        </footer>
      </main>

      {/* Botón flotante WhatsApp (ultra pro) */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-[150] inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-xl hover:bg-white/90 transition"
        title="Hablar por WhatsApp"
      >
        <IconWhatsApp className="h-5 w-5" />
        WhatsApp
      </a>
    </div>
  );
}
