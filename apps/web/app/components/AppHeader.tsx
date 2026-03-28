"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

/* ---------------- Icons ---------------- */

function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconClose(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconTicket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 8h10a2 2 0 0 1 2 2v1a1.5 1.5 0 0 0 0 3v1a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-1a1.5 1.5 0 0 0 0-3v-1a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M12 9.5v1.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 13.3v1.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconCalendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 5v2M17 5v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M6 8h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path d="M7 12h10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- Helpers ---------------- */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type Nav = { key: string; label: string; hash: string };

/* ---------------- Component ---------------- */

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const timer = useRef<number | null>(null);
  const [hint, setHint] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  const isHome = pathname === "/";

  const NAV: Nav[] = useMemo(
    () => [
      { key: "servicios", label: "Servicios", hash: "#servicios" },
      { key: "galeria", label: "Galería", hash: "#galeria" },
      { key: "opiniones", label: "Opiniones", hash: "#opiniones" },
      { key: "ubicacion", label: "Ubicación", hash: "#ubicacion" },
    ],
    []
  );

  // Home: #... | otras páginas: /#...
  const to = (hash: string) => (isHome ? hash : `/${hash}`);

  function startPress() {
    setHint(true);
    timer.current = window.setTimeout(() => {
      router.push("/admin/login");
    }, 2500);
  }

  function endPress() {
    setHint(false);
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        router.push("/admin/login");
      }
      if (e.key === "Escape") setMobileOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Header elevation on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll spy (solo en Home)
  useEffect(() => {
    if (!isHome) return;

    const ids = NAV.map((n) => n.key);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      {
        root: null,
        rootMargin: "-25% 0px -60% 0px",
        threshold: [0.05, 0.12, 0.2, 0.35, 0.5],
      }
    );

    els.forEach((el) => obs.observe(el));

    const currentHash = window.location.hash?.replace("#", "");
    if (currentHash) setActiveSection(currentHash);

    return () => obs.disconnect();
  }, [isHome, NAV]);

  function handleHashClick(hash: string) {
    if (!isHome) return;

    const id = hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", hash);
    setActiveSection(id);
  }

  return (
    <header
      className={cx(
        "sticky top-0 z-50",
        "backdrop-blur-md",
        scrolled ? "bg-black/75 border-b border-white/10" : "bg-black/45 border-b border-white/5"
      )}
    >
      {/* glow line */}
      <div
        className={cx(
          "pointer-events-none absolute inset-x-0 top-0 h-[1px]",
          "bg-gradient-to-r from-transparent via-amber-300/30 to-transparent",
          scrolled ? "opacity-100" : "opacity-60"
        )}
      />
      {/* bottom subtle glow */}
      <div
        className={cx(
          "pointer-events-none absolute inset-x-0 -bottom-px h-px",
          "bg-gradient-to-r from-transparent via-white/10 to-transparent"
        )}
      />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Brand + Admin Hidden */}
        <Link href="/" className="flex items-center gap-3">
          <div
            className={cx(
              "relative h-10 w-[152px] rounded-2xl overflow-hidden select-none",
              "border border-white/10 bg-white/5",
              "shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
            )}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            title="Mantén presionado 2.5s para Admin"
          >
            {/* padding real para el SVG */}
            <div className="relative h-full w-full p-1.5">
              <Image
                src="/brand/oso-barber.svg"
                alt="Oso Barber"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* micro shine */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />

            {hint && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-lg border border-white/10 bg-black/80 px-2 py-1 text-[10px] text-white/80 whitespace-nowrap">
                Mantén para Admin
              </div>
            )}
          </div>

          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-[0.18em]"></div>
            <div className="text-[11px] text-white/55"></div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = isHome && activeSection === n.key;
            return (
              <Link
                key={n.key}
                href={to(n.hash)}
                onClick={(e) => {
                  if (isHome) {
                    e.preventDefault();
                    handleHashClick(n.hash);
                  }
                }}
                className={cx(
                  "relative rounded-2xl px-3 py-2 text-sm transition",
                  active
                    ? "text-white bg-white/[0.08] border border-white/10"
                    : "text-white/75 hover:text-white hover:bg-white/[0.06]"
                )}
              >
                {n.label}
                <span
                  className={cx(
                    "pointer-events-none absolute -bottom-[7px] left-1/2 -translate-x-1/2 h-1 w-10 rounded-full",
                    active ? "bg-amber-300/70 shadow-[0_0_18px_rgba(245,158,11,0.25)]" : "opacity-0"
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-white/85 hover:bg-white/10 transition"
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
          </button>

          {/* Microcopy + Mis reservas (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <div className="hidden lg:block text-[11px] text-white/45 mr-1">¿Ya tienes reserva?</div>

            <Link
              href="/my-bookings"
              className={cx(
                "inline-flex items-center gap-2 rounded-2xl",
                "border border-white/10 bg-white/[0.05]",
                "px-3 py-2 text-sm font-semibold text-white/85",
                "hover:bg-white/10 transition"
              )}
              title="Ver / administrar mis reservas"
            >
              <IconTicket className="h-4 w-4 text-white/75" />
              Mis reservas
            </Link>
          </div>

          {/* CTA principal */}
          <Link
            href="/booking"
            className={cx(
              "inline-flex items-center justify-center gap-2 rounded-2xl",
              "bg-amber-300 px-4 py-2.5 text-sm font-extrabold text-black",
              "hover:bg-amber-200 transition",
              "shadow-[0_12px_30px_rgba(245,158,11,0.18)]"
            )}
            title="Agendar una hora"
          >
            <IconCalendar className="h-4 w-4" />
            Agendar
          </Link>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/85 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-6 py-4 grid gap-3">
            {/* Actions first (pro) */}
            <div className="grid gap-2">
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-extrabold text-black hover:bg-amber-200 transition"
              >
                <IconCalendar className="h-5 w-5" />
                Agendar ahora
              </Link>

              <Link
                href="/my-bookings"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                <IconTicket className="h-5 w-5 text-white/80" />
                Mis reservas
              </Link>

              <div className="text-xs text-white/45">
                Si ya agendaste, revisa o reagenda en <b className="text-white/70">Mis reservas</b>.
              </div>
            </div>

            <div className="mt-1 h-px w-full bg-white/10" />

            {/* Nav items */}
            <div className="grid gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.key}
                  href={to(n.hash)}
                  onClick={(e) => {
                    setMobileOpen(false);
                    if (isHome) {
                      e.preventDefault();
                      handleHashClick(n.hash);
                    }
                  }}
                  className={cx(
                    "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    isHome && activeSection === n.key
                      ? "text-white bg-white/[0.08] border border-white/10"
                      : "text-white/80 bg-white/[0.03] border border-white/10 hover:bg-white/[0.07]"
                  )}
                >
                  {n.label}
                </Link>
              ))}
            </div>

            <div className="pt-2 text-xs text-white/45">Tip: mantén presionado el logo 2.5s para Admin</div>
          </div>
        </div>
      )}
    </header>
  );
}
