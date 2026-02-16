"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

function NavItem({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-xl px-3 py-2 text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
    >
      {children}
    </Link>
  );
}

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();

  const timer = useRef<number | null>(null);
  const [hint, setHint] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
        router.push("/admin/login");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  // Si estás en Home, usamos secciones (#...), si estás en otra página, te manda al home + hash
  const to = (hash: string) => (pathname === "/" ? hash : `/${hash}`);

  // Cierra menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Brand + Admin Hidden */}
        <Link href="/" className="flex items-center gap-3">
          <div
            className="relative h-10 w-10 rounded-2xl border border-white/10 bg-white/5 overflow-hidden select-none"
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
          >
            <Image
              src="/logo-oso.png"
              alt="OsoBarber"
              fill
              className="object-cover"
              priority
            />

            {hint && (
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 rounded-lg border border-white/10 bg-black/70 px-2 py-1 text-[10px] text-white/80 whitespace-nowrap">
                Mantén para Admin
              </div>
            )}
          </div>

          <div className="leading-tight">
            <div className="text-base font-semibold">OsoBarber</div>
            <div className="text-xs text-white/60">San Bernardo</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          <NavItem href={to("#quienes-somos")}>Quiénes somos</NavItem>
          <NavItem href={to("#servicios")}>Servicios</NavItem>
          <NavItem href={to("#ubicacion")}>Ubicación</NavItem>
          <NavItem href={to("#contacto")}>Contacto</NavItem>
          <NavItem href="/my-bookings">Mis reservas</NavItem>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10"
            aria-label="Abrir menú"
          >
            {mobileOpen ? "✕" : "☰"}
          </button>

          <Link
            href="/booking"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
          >
            Reservar ahora
          </Link>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-black/70 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-3 grid gap-1">
            <NavItem href={to("#quienes-somos")} onClick={() => setMobileOpen(false)}>
              Quiénes somos
            </NavItem>
            <NavItem href={to("#servicios")} onClick={() => setMobileOpen(false)}>
              Cortes
            </NavItem>
            <NavItem href={to("#ubicacion")} onClick={() => setMobileOpen(false)}>
              Ubicación
            </NavItem>
            <NavItem href={to("#contacto")} onClick={() => setMobileOpen(false)}>
              Contacto
            </NavItem>
            <NavItem href="/my-bookings" onClick={() => setMobileOpen(false)}>
              Mis reservas
            </NavItem>

            <div className="pt-2">
              <Link
                href="/booking"
                onClick={() => setMobileOpen(false)}
                className="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
              >
                Reservar ahora
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
