"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useMemo, useState } from "react";

/* ---------------- Icons (pro) ---------------- */

function IconScissors(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4.5 7.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4.5 16.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 0 0-5 0Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.2 9l10.3 6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.2 15l10.3-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconBeard(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8 8.2c0-2.2 1.8-4 4-4s4 1.8 4 4v2.6c0 4.2-2.6 7.8-8 9c-5.4-1.2-8-4.8-8-9V8.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M9.3 12.3c.8.8 1.7 1.2 2.7 1.2s1.9-.4 2.7-1.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconBrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M3.5 12c2.3-3.2 5.3-4.8 8.5-4.8S18.2 8.8 20.5 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.5 12.3c1.1-1.3 2.6-2 4.5-2s3.4.7 4.5 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 15.6c2.2 0 4-1 5.4-2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 15.6c-2.2 0-4-1-5.4-2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconStar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.3l-5.3 3 1.4-6-4.6-4 6.1-.5L12 4l2.4 5.8 6.1.5-4.6 4 1.4 6L12 17.3z" />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 11.7A8 8 0 1 1 11.7 4a8 8 0 0 1 8.3 7.7Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 19.5 8.6 17a7.9 7.9 0 0 0 3.1.6 7.8 7.8 0 0 0 7.8-7.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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

function IconPlay(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
      <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M5 12h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------- Utils ---------------- */

function clp(n: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(n);
}

type PriceItem = {
  title: string;
  desc: string;
  promo: number;
  normal?: number;
  badge?: string;
  href: string;
  icon: React.ReactNode;
};

type Review = {
  name: string;
  role: string;
  text: string;
  rating: number;
  avatar: string;
};

/* ---------------- Brand mark (Oso) ---------------- */
/** Silueta simple, pro (no caricatura). Solo decoración */
function BearMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 220" className={className} fill="none" aria-hidden="true">
      <path
        d="M68 106c-9-9-14-19-14-31 0-22 18-40 40-40 10 0 19 3 27 9 8-19 28-32 51-32 23 0 43 13 51 32 8-6 17-9 27-9 22 0 40 18 40 40 0 12-5 22-14 31 8 10 12 22 12 35 0 34-28 62-62 62H118c-34 0-62-28-62-62 0-13 4-25 12-35Z"
        className="fill-current"
        opacity="0.12"
      />
      <path
        d="M105 128c0-11 9-20 20-20h10c11 0 20 9 20 20 0 21-16 38-35 38s-35-17-35-38Z"
        className="fill-current"
        opacity="0.16"
      />
    </svg>
  );
}

/* ---------------- UI primitives ---------------- */

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/80">
      {children}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={[
        "rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur",
        "shadow-[0_20px_70px_rgba(0,0,0,0.35)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2">
          <div className="h-px w-10 bg-gradient-to-r from-[rgba(245,197,24,0.70)] to-transparent" />
          <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">OSO BARBER</div>
        </div>

        <h2 className="mt-2 text-2xl md:text-4xl font-semibold tracking-tight">{title}</h2>

        {subtitle ? (
          <p className="mt-3 text-sm md:text-base text-white/65 max-w-2xl leading-relaxed">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- Page ---------------- */

export default function Home() {
  const BUSINESS = useMemo(
    () => ({
      phoneDisplay: "+56 9 2942 9715",
      waNumber: "56929429715",
      address: "Magdalena Petit 15241, San Bernardo",
      mapsEmbed: "https://www.google.com/maps?q=Magdalena%20Petit%2015241%20San%20Bernardo&output=embed",
    }),
    []
  );

  const waLink =
    "https://wa.me/" + BUSINESS.waNumber + "?text=" + encodeURIComponent("Hola! Quiero agendar una hora en OsoBarber 🙌");

  // ✅ UUID reales desde tu API
  const SERVICE = {
    corte: "11111111-1111-1111-1111-111111111111",
    corteCeja: "11111111-1111-1111-1111-111111111112",
    corteBarba: "11111111-1111-1111-1111-111111111113",
    corteCejaBarba: "11111111-1111-1111-1111-111111111114",
  };

  const SERVICES_AND_PRICES: PriceItem[] = [
    {
      title: "Corte",
      desc: "Corte moderno o clásico, terminación limpia y rápida.",
      promo: 7000,
      href: `/booking?service_id=${SERVICE.corte}`,
      icon: <IconScissors className="h-5 w-5" />,
    },
    {
      title: "Corte + ceja",
      desc: "Corte + perfilado preciso de cejas (detalle pro).",
      promo: 7000,
      normal: 8000,
      badge: "Promo",
      href: `/booking?service_id=${SERVICE.corteCeja}`,
      icon: <IconBrow className="h-5 w-5" />,
    },
    {
      title: "Corte + barba",
      desc: "Corte + barba: perfilado y orden completo.",
      promo: 8000,
      normal: 9000,
      badge: "Promo",
      href: `/booking?service_id=${SERVICE.corteBarba}`,
      icon: <IconBeard className="h-5 w-5" />,
    },
    {
      title: "Corte + ceja + barba",
      desc: "Servicio completo para salir listo (full detalle).",
      promo: 8000,
      normal: 10000,
      badge: "Promo",
      href: `/booking?service_id=${SERVICE.corteCejaBarba}`,
      icon: (
        <div className="flex items-center gap-1">
          <IconScissors className="h-5 w-5" />
          <IconBeard className="h-5 w-5" />
        </div>
      ),
    },
  ];

  /**
   * ✅ HERO (se mantiene tal cual, pero con fondo negro)
   */
  const HERO = useMemo(
    () => [
      {
        src: "/osobarberr1.png",
        headline: "Cortes con gran detalle",
        sub: "Cortes limpios, estilo y precisión. Agenda y llegas directo.",
      },
      {
        src: "/osobarberr2.png",
        headline: "Reserva online.",
        sub: "Sin filas. Sin esperar. Tú eliges el horario disponible.",
      },
    ],
    []
  );

  const [heroIndex, setHeroIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setHeroIndex((i) => (i + 1) % HERO.length), 6500);
    return () => window.clearInterval(id);
  }, [HERO.length]);

  // ✅ GALERÍA (TUS FOTOS LOCALES EN /public)
  const GALLERY = useMemo(
    () => [
      { src: "/file_000000000acc720e864b358b61cd2f69.png", alt: "Barbería" },
      { src: "/file_00000000c8e8720ea2e82da49fe9e8c3(1).png", alt: "Máquinas y herramientas" },
      { src: "/file_00000000247071f5b9332a390e65f18d.png", alt: "Luces y silla" },
      { src: "/file_000000003414720ead1ba1ac1401bd8f.png", alt: "Barbería desde afuera" },
      { src: "/Screenshot_20260218_194722_Gallery.jpg", alt: "Barbería desde adentro" },
      { src: "/Picsart_26-02-19_19-13-10-265.jpg", alt: "Entrada" },
    ],
    []
  );

  const REVIEWS: Review[] = [
    {
      name: "Reggaeton Latino",
      role: "Cliente",
      text: "Excelente atención, buenos cortes..",
      rating: 5,
      avatar: "/jalvarez.jpeg",
    },
    {
      name: "Sebastián B",
      role: "Cliente",
      text: "Buena Atención, excelente Barberos.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80",
    },
    {
      name: "Javier M.",
      role: "Cliente",
      text: "Puntualidad real. La web está perfecta para reagendar sin perder tiempo.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80",
    },
  ];

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
    <div className="grid gap-14 py-10">
      {/* HERO PRO (FONDO NEGRO) */}
      <section className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-white/[0.04]">
        <div className="absolute inset-0">
          {/* Fondo negro */}
          <div className="absolute inset-0 bg-black" />

          {/* Brillos suaves */}
          <div className="absolute inset-0 [background:radial-gradient(70%_55%_at_22%_18%,rgba(245,197,24,0.18),transparent_60%)]" />
          <div className="absolute inset-0 [background:radial-gradient(55%_40%_at_85%_10%,rgba(255,255,255,0.07),transparent_55%)]" />

          {/* Grano pro */}
          <div className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22120%22 height=%22120%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />
        </div>

        <div className="relative p-8 md:p-12">
          <div className="grid gap-10 md:grid-cols-[1.2fr_.8fr] md:items-start">
            <div className="relative">
              <BearMark className="hidden md:block absolute -right-28 -top-10 w-[360px] text-[rgba(245,197,24,1)] blur-[0.2px]" />

              <div className="flex flex-wrap items-center gap-2">
                <Pill>
                  <span className="h-2 w-2 rounded-full bg-[rgba(245,197,24,1)] shadow-[0_0_18px_rgba(245,197,24,0.40)]" />
                  Reserva online
                </Pill>
                <Pill>San Bernardo</Pill>
                <Pill>Buena Atención</Pill>
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.02]">
                <span className="text-white">{HERO[heroIndex].headline}</span>{" "}
                <span className="text-[rgba(245,197,24,0.92)]">No esperes más.</span>
              </h1>

              <p className="mt-5 text-sm md:text-base text-white/70 max-w-xl leading-relaxed">
                {HERO[heroIndex].sub} Gestiona todo en <b className="text-white/90">Mis reservas</b>.
              </p>

              <div className="mt-7 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/booking"
                  className="inline-flex items-center justify-center rounded-2xl bg-[rgba(245,197,24,1)] px-6 py-3 font-extrabold text-black hover:brightness-95 transition shadow-[0_18px_60px_rgba(245,197,24,0.16)]"
                >
                  Agendar ahora
                </Link>

                <Link
                  href="/my-bookings"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-6 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  Mis reservas
                </Link>

                <a
                  href="#servicios"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-black/40 px-6 py-3 font-semibold text-white/85 hover:bg-white/10 transition"
                >
                  Ver servicios
                </a>
              </div>

              <div className="mt-9 grid gap-3 sm:grid-cols-3">
                {[
                  { t: "Puntualidad", d: "Llegas a tu hora" },
                  { t: "Detalle", d: "Terminación limpia" },
                  { t: "Reserva simple", d: "En segundos" },
                ].map((x) => (
                  <div
                    key={x.t}
                    className="rounded-2xl border border-white/10 bg-black/50 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
                  >
                    <div className="text-sm font-semibold">{x.t}</div>
                    <div className="mt-1 text-xs text-white/60">{x.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex items-center gap-2">
                {HERO.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setHeroIndex(i)}
                    className={[
                      "h-2.5 rounded-full transition",
                      i === heroIndex
                        ? "w-10 bg-[rgba(245,197,24,1)] shadow-[0_0_18px_rgba(245,197,24,0.35)]"
                        : "w-2.5 bg-white/25 hover:bg-white/40",
                    ].join(" ")}
                    aria-label={`Hero ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <Card className="p-6 bg-black/55">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold tracking-wide text-white/90">Información</div>
                <span className="text-[11px] text-white/60">Reserva online</span>
              </div>

              <div className="mt-4 grid gap-3 text-sm text-white/70">
                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Dirección</div>
                  <div className="mt-1 font-semibold text-white/90">{BUSINESS.address}</div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">Horario</div>
                  <div className="mt-1 text-white/75 leading-relaxed">
                    Lun–Vie 19:00–22:00 <br />
                    Sáb 10:00–22:00 <br />
                    Dom 10:00–21:00
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                  <div className="text-[11px] uppercase tracking-[0.22em] text-white/50">WhatsApp</div>
                  <div className="mt-1 font-semibold text-white/90">{BUSINESS.phoneDisplay}</div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-extrabold text-black hover:bg-white/90 transition"
                  >
                    <IconWhatsApp className="h-5 w-5" />
                    Hablar por WhatsApp
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="grid gap-6 scroll-mt-28">
        <SectionHead title="Servicios" subtitle="Elige tu servicio y agenda directo. Precio claro, sin vueltas." />

        <div className="grid gap-4 md:grid-cols-2">
          {SERVICES_AND_PRICES.map((s) => (
            <Card key={s.title} className="p-6 group relative overflow-hidden">
              <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,197,24,0.18),transparent_60%)] blur-2xl" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl border border-white/10 bg-black/45 p-3 text-[rgba(245,197,24,0.92)] group-hover:text-[rgba(245,197,24,1)] transition">
                    {s.icon}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{s.title}</div>
                      {s.badge ? (
                        <span className="rounded-full border border-[rgba(245,197,24,0.30)] bg-[rgba(245,197,24,0.10)] px-2.5 py-1 text-[11px] font-semibold text-[rgba(245,197,24,0.95)]">
                          {s.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm text-white/65 leading-relaxed">{s.desc}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-extrabold">{clp(s.promo)}</div>
                  {typeof s.normal === "number" ? (
                    <div className="text-xs text-white/45 line-through">{clp(s.normal)}</div>
                  ) : (
                    <div className="text-xs text-white/40">—</div>
                  )}
                </div>
              </div>

              <div className="relative mt-5">
                <Link
                  href={s.href}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[rgba(245,197,24,1)] px-5 py-3 font-extrabold text-black hover:brightness-95 transition"
                >
                  Agendar este servicio
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-xs text-white/45">* Precios sujetos a promociones vigentes.</div>
      </section>

      {/* OPINIONES */}
      <section id="opiniones" className="grid gap-6 scroll-mt-28">
        <SectionHead title="Opiniones" subtitle="Reseñas." />

        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <Card key={r.name} className="p-6">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Image src={r.avatar} alt={r.name} fill sizes="48px" className="object-cover" />
                </div>
                <div className="leading-tight">
                  <div className="font-semibold">{r.name}</div>
                  <div className="text-xs text-white/55">{r.role}</div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-[rgba(245,197,24,1)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} className={i < r.rating ? "h-4 w-4 opacity-100" : "h-4 w-4 opacity-25"} />
                ))}
              </div>

              <p className="mt-4 text-sm text-white/70 leading-relaxed">“{r.text}”</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-2xl bg-[rgba(245,197,24,1)] px-6 py-3 font-extrabold text-black hover:brightness-95 transition"
          >
            Agendar ahora
          </Link>

          <Link
            href="/my-bookings"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-6 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
          >
            Ver mis reservas
          </Link>
        </div>
      </section>

      {/* GALERÍA (TUS FOTOS) */}
      <section id="galeria" className="grid gap-6 scroll-mt-28">
        <SectionHead title="Galería" subtitle="Fotos reales de OsoBarber: local, máquinas y ambiente." />

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {GALLERY.map((img, idx) => (
            <button
              key={img.src + idx}
              type="button"
              onClick={() => setLightbox(idx)}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05]"
              title="Ver foto"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/0 opacity-90" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-left text-xs font-semibold text-white/90">{img.alt}</div>
              </div>
            </button>
          ))}
        </div>

        {lightbox !== null ? (
          <div className="fixed inset-0 z-[200] bg-black/85 p-6 grid place-items-center" onClick={() => setLightbox(null)}>
            <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-white/70">
                  {lightbox + 1} / {GALLERY.length}
                </div>
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1 text-sm text-white/80 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  Cerrar
                </button>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={GALLERY[lightbox].src}
                    alt={GALLERY[lightbox].alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 1000px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="mt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setLightbox((i) => (i === null ? null : (i - 1 + GALLERY.length) % GALLERY.length))}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  ← Anterior
                </button>
                <button
                  type="button"
                  onClick={() => setLightbox((i) => (i === null ? null : (i + 1) % GALLERY.length))}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* UBICACIÓN */}
      <section id="ubicacion" className="grid gap-6 scroll-mt-28">
        <SectionHead title="Ubicación" subtitle={BUSINESS.address} />

        <div className="grid gap-4 lg:grid-cols-1">
          <Card className="overflow-hidden">
            <iframe
              title="Mapa OsoBarber"
              src={BUSINESS.mapsEmbed}
              width="100%"
              height="420"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="grid gap-6 scroll-mt-28">
        <SectionHead title="Preguntas frecuentes" subtitle="Respuestas claras, rápidas." />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="font-semibold">¿Cómo veo o cancelo mi reserva?</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Entra a <b>Mis reservas</b> y busca con tu <b>Nombre + Apellido</b>.
            </div>
          </Card>

          <Card className="p-6">
            <div className="font-semibold">¿Puedo cambiar la hora?</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Sí. En <b>Mis reservas</b> puedes reagendar a un horario disponible.
            </div>
          </Card>

          <Card className="p-6">
            <div className="font-semibold">¿Qué pasa si llego tarde?</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Ideal llegar a la hora. Si te atrasas, avisa por WhatsApp para coordinar.
            </div>
          </Card>

          <Card className="p-6">
            <div className="font-semibold">¿Puedo hacer consultas rápidas?</div>
            <div className="mt-2 text-sm text-white/70 leading-relaxed">
              Sí. Escríbenos por WhatsApp y te respondemos directo.
            </div>
          </Card>
        </div>
      </section>

      {/* WhatsApp flotante (único) */}
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-[150] inline-flex items-center gap-2 rounded-2xl bg-[rgba(245,197,24,1)] px-4 py-3 text-sm font-extrabold text-black shadow-[0_20px_70px_rgba(0,0,0,0.45)] hover:brightness-95 transition"
        title="Hablar por WhatsApp"
      >
        <IconWhatsApp className="h-5 w-5" />
        WhatsApp
      </a>
    </div>
  );
}