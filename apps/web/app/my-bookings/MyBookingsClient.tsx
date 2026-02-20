"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Booking = {
  id: string;
  barber_id: string;
  service_id: string;
  client_name: string;
  client_phone?: string | null;
  client_email?: string | null;
  start_time: string;
  end_time: string;
  status: string;
  cancelled_at?: string | null;
};

type Props = {
  initialName?: string;
  initialAutosearch?: string;
};

/* ---------------- API ----------------
   ✅ Mejor: si NO hay NEXT_PUBLIC_API_URL, usamos el rewrite /api/v1
*/
function apiUrl(path: string) {
  const envBase = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const base = envBase ? envBase : "/api/v1";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/* ---------------- Utils ---------------- */

function cleanName(s: string) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function fmtDateCL(iso: string) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

function fmtTimeCL(iso: string) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

function isPast(isoStart: string) {
  return new Date(isoStart).getTime() <= Date.now();
}

function safeTimeRange(startIso: string, endIso: string) {
  const s = new Date(startIso).getTime();
  const e = new Date(endIso).getTime();
  if (!Number.isFinite(e) || e <= s) return fmtTimeCL(startIso);
  return `${fmtTimeCL(startIso)} – ${fmtTimeCL(endIso)}`;
}

// ✅ FIX: calcular YYYY-MM-DD en zona horaria Chile (para booking day)
function dayInChileYYYYMMDD(iso: string) {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const da = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}-${m}-${da}`;
}

function normalizeStatus(status: string) {
  const up = (status || "").toUpperCase();

  if (up === "CANCELLED")
    return {
      label: "CANCELADA",
      pill: "border-rose-300/20 bg-rose-300/10 text-rose-200",
    };

  if (up === "CONFIRMED" || up === "ACTIVE")
    return {
      label: up === "CONFIRMED" ? "CONFIRMADA" : "ACTIVA",
      pill: "border-emerald-300/20 bg-emerald-300/10 text-emerald-200",
    };

  if (up === "PENDING")
    return {
      label: "PENDIENTE",
      pill: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    };

  return { label: up || "—", pill: "border-white/10 bg-white/[0.05] text-white/70" };
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------- Icons (pro) ---------------- */

function IconSearch(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M16.5 16.5 21 21"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRefresh(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20 6v6h-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 18v-6h6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 12a8 8 0 0 0-14.7-4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4 12a8 8 0 0 0 14.7 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconEdit(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconX(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconEyeOff(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.6 10.6a2.5 2.5 0 0 0 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.4 6.6C4.5 8 3.2 10 2.6 12c1.5 5 6 8 9.4 8 1.3 0 2.7-.3 4-.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M9 4.7c1-.4 2-.7 3-.7 3.4 0 7.9 3 9.4 8-.4 1.3-1 2.6-2 3.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
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

/* ---------------- UI primitives ---------------- */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur",
        "shadow-[0_20px_70px_rgba(0,0,0,0.35)]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05]",
        "px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/75",
        className
      )}
    >
      {children}
    </span>
  );
}

function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
        className
      )}
    >
      {children}
    </button>
  );
}

function AButton({
  children,
  className = "",
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { className?: string }) {
  return (
    <a
      {...props}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
        className
      )}
    >
      {children}
    </a>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  hint,
  onKeyDown,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm text-white/75">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cx(
          "h-11 rounded-2xl border border-white/10 bg-black/35 px-3 text-white outline-none",
          "focus:border-amber-300/40 focus:ring-2 focus:ring-amber-300/10"
        )}
      />
      {hint ? <div className="text-xs text-white/45">{hint}</div> : null}
    </div>
  );
}

/* ---------------- Component ---------------- */

export default function MyBookingsClient({ initialName, initialAutosearch }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const fullName = useMemo(() => cleanName(`${firstName} ${lastName}`), [firstName, lastName]);

  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [showPast, setShowPast] = useState(false);

  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const canSearch = useMemo(() => {
    return cleanName(firstName).length >= 2 && cleanName(lastName).length >= 2;
  }, [firstName, lastName]);

  // ✅ Puedes mapear nombres de servicio si quieres (si coinciden con tus UUID reales)
  const SERVICE_LABELS = useMemo(() => {
    const map = new Map<string, string>();
    map.set("11111111-1111-1111-1111-111111111111", "Corte");
    map.set("11111111-1111-1111-1111-111111111112", "Corte + ceja");
    map.set("11111111-1111-1111-1111-111111111113", "Corte + barba");
    map.set("11111111-1111-1111-1111-111111111114", "Corte + ceja + barba");
    return map;
  }, []);

  // local storage hidden
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("osb_hidden_bookings") || "[]";
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) setHiddenIds(new Set(arr.map(String)));
    } catch {}
  }, []);

  function persistHidden(next: Set<string>) {
    setHiddenIds(next);
    try {
      window.localStorage.setItem("osb_hidden_bookings", JSON.stringify(Array.from(next)));
    } catch {}
  }

  function pickBestClientName(list: Booking[]) {
    const counts = new Map<string, number>();
    for (const b of list) {
      const n = cleanName(b.client_name || "");
      if (!n) continue;
      counts.set(n, (counts.get(n) || 0) + 1);
    }
    let best = "";
    let bestN = 0;
    for (const [name, n] of counts.entries()) {
      if (n > bestN) {
        best = name;
        bestN = n;
      }
    }
    return best;
  }

  async function loadBookings(name?: string) {
    setErr(null);

    const nameToUse = cleanName(name ?? fullName);
    if (nameToUse.length < 4 || !nameToUse.includes(" ")) {
      setErr("Ingresa tu **Nombre y Apellido** (tal como lo pusiste al reservar).");
      return;
    }

    setLoading(true);
    try {
      try {
        window.localStorage.setItem("osb_client_name", nameToUse);
      } catch {}

      const r = await fetch(apiUrl(`/bookings/my?name=${encodeURIComponent(nameToUse)}`), {
        cache: "no-store",
      });
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      const list = Array.isArray(j) ? (j as Booking[]) : [];

      const upcoming = list
        .filter((b) => !isPast(b.start_time))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      const past = list
        .filter((b) => isPast(b.start_time))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

      setItems([...upcoming, ...past]);

      const best = pickBestClientName([...upcoming, ...past]);
      if (best) {
        const parts = best.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }

      if (list.length === 0) {
        setErr("No encontramos reservas con ese nombre. Revisa que esté escrito igual que al agendar.");
      }
    } catch (e: any) {
      setItems([]);
      setErr(e?.message || "No se pudieron cargar tus reservas.");
    } finally {
      setLoading(false);
    }
  }

  // init from querystring / localStorage
  useEffect(() => {
    const qName = cleanName(initialName || "");
    const qAuto = cleanName(initialAutosearch || "");
    const saved = cleanName(window.localStorage.getItem("osb_client_name") || "");
    const finalName = qName || saved;

    if (finalName) {
      const parts = finalName.split(" ");
      setFirstName(parts[0] || "");
      setLastName(parts.slice(1).join(" ") || "");
    }

    if (finalName && qAuto === "1") {
      loadBookings(finalName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialAutosearch]);

  async function cancelBooking(id: string) {
    if (!confirm("¿Cancelar esta reserva?")) return;

    const nameToUse = cleanName(fullName);
    if (nameToUse.length < 4 || !nameToUse.includes(" ")) {
      setErr("Para cancelar, ingresa tu Nombre y Apellido (los mismos de la reserva).");
      return;
    }

    setErr(null);
    try {
      const r = await fetch(
        apiUrl(`/bookings/${encodeURIComponent(id)}/cancel?name=${encodeURIComponent(nameToUse)}`),
        { method: "POST" }
      );
      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
      await loadBookings();
    } catch (e: any) {
      const msg = (e?.message || "").toLowerCase();
      if (msg.includes("no autorizado") || msg.includes("forbidden") || msg.includes("403")) {
        setErr("No autorizado: ese nombre no corresponde a esta reserva.");
      } else if (msg.includes("pasada")) {
        setErr("Esa reserva ya pasó, por eso no se puede cancelar.");
      } else if (msg.includes("anticipación") || msg.includes("minutos")) {
        setErr("Esa reserva está muy encima. Para cancelar debe ser con anticipación.");
      } else {
        setErr(e?.message || "No se pudo cancelar la reserva.");
      }
    }
  }

  function buildEditHref(b: Booking) {
    const qs = new URLSearchParams();
    qs.set("mode", "reschedule");
    qs.set("booking_id", b.id);

    if (b.service_id) qs.set("service_id", b.service_id);
    if (b.barber_id) qs.set("barber_id", b.barber_id);

    if (b.start_time) {
      qs.set("start_time", b.start_time);
      qs.set("day", dayInChileYYYYMMDD(b.start_time));
    }

    if (cleanName(fullName)) qs.set("name", cleanName(fullName));
    else if (b.client_name) qs.set("name", cleanName(b.client_name));

    return `/booking?${qs.toString()}`;
  }

  const waLink =
    "https://wa.me/56929429715?text=" +
    encodeURIComponent("Hola! Tengo una duda sobre mi reserva en OsoBarber 🙌");

  const visibleItems = useMemo(() => {
    const list = items.filter((b) => !hiddenIds.has(b.id));
    if (showPast) return list;
    return list.filter((b) => !isPast(b.start_time));
  }, [items, hiddenIds, showPast]);

  const totalUpcoming = useMemo(
    () => items.filter((b) => !hiddenIds.has(b.id) && !isPast(b.start_time)).length,
    [items, hiddenIds]
  );

  const totalPast = useMemo(
    () => items.filter((b) => !hiddenIds.has(b.id) && isPast(b.start_time)).length,
    [items, hiddenIds]
  );

  const nextUpcoming = useMemo(() => {
    const up = items
      .filter((b) => !hiddenIds.has(b.id) && !isPast(b.start_time) && (b.status || "").toUpperCase() !== "CANCELLED")
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    return up[0] || null;
  }, [items, hiddenIds]);

  function BookingSkeleton() {
    return (
      <div className="rounded-3xl border border-white/10 bg-black/35 p-5 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-2">
            <div className="h-4 w-44 rounded bg-white/10" />
            <div className="h-3 w-28 rounded bg-white/10" />
          </div>
          <div className="h-8 w-28 rounded-2xl bg-white/10" />
        </div>
        <div className="mt-4 h-10 w-full rounded-2xl bg-white/10" />
      </div>
    );
  }

  return (
    <div className="grid gap-10 py-10">
      {/* Top hero */}
      <section className="relative overflow-hidden rounded-[2.6rem] border border-white/10 bg-white/[0.04]">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/60 to-black/90" />
          <div className="absolute inset-0 [background:radial-gradient(60%_55%_at_20%_10%,rgba(245,197,24,0.18),transparent_60%)]" />
          <div className="absolute inset-0 [background:radial-gradient(55%_45%_at_85%_10%,rgba(255,255,255,0.06),transparent_55%)]" />
        </div>

        <div className="relative p-7 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Pill>
                  <span className="h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.35)]" />
                  Mis reservas
                </Pill>
                <Pill className="text-white/65">Buscar • Reagendar • Cancelar</Pill>
              </div>

              <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
                Control total. <span className="text-amber-200/95">Sin llamadas.</span>
              </h1>

              <p className="mt-3 text-sm md:text-base text-white/65 max-w-2xl leading-relaxed">
                Ingresa tu <b className="text-white/90">Nombre + Apellido</b> tal como lo pusiste al agendar.
                Aquí puedes revisar, reagendar o cancelar (si aplica).
              </p>

              {nextUpcoming ? (
                <div className="mt-5 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white/75">
                  <IconClock className="h-5 w-5 text-amber-200" />
                  <span>
                    Próxima: <b className="text-white/90">{fmtDateCL(nextUpcoming.start_time)}</b> •{" "}
                    <b className="text-white/90">{safeTimeRange(nextUpcoming.start_time, nextUpcoming.end_time)}</b>
                  </span>
                  {SERVICE_LABELS.get(nextUpcoming.service_id) ? (
                    <span className="ml-1 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-white/70">
                      {SERVICE_LABELS.get(nextUpcoming.service_id)}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-6 py-3 font-extrabold text-black hover:bg-amber-200 transition shadow-[0_18px_60px_rgba(245,158,11,0.16)]"
              >
                Agendar ahora
              </Link>

              <AButton
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10"
              >
                <IconWhatsApp className="h-5 w-5" />
                WhatsApp
              </AButton>
            </div>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="grid gap-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">OSOBARBER</div>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">Buscar reservas</h2>
            <p className="mt-2 text-sm text-white/60">Mientras más exacto el nombre, más rápido aparece todo.</p>
          </div>

          <div className="hidden md:flex gap-2">
            <Button
              type="button"
              onClick={() => loadBookings()}
              disabled={loading || !canSearch}
              className={cx(
                "border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10",
                "disabled:opacity-60 disabled:hover:bg-white/[0.06]"
              )}
            >
              <IconRefresh className="h-5 w-5" />
              Refrescar
            </Button>

            <Button
              type="button"
              onClick={() => setShowPast((v) => !v)}
              className="border border-white/12 bg-black/35 text-white/85 hover:bg-white/10"
            >
              {showPast ? "Ocultar pasadas" : "Ver pasadas"}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <Input
              label="Nombre"
              value={firstName}
              onChange={setFirstName}
              placeholder="Ej: Sebastián"
            />
            <Input
              label="Apellido"
              value={lastName}
              onChange={setLastName}
              placeholder="Ej: Brenet"
              hint=""
              onKeyDown={(e) => {
                if (e.key === "Enter") loadBookings();
              }}
            />

            <Button
              type="button"
              onClick={() => loadBookings()}
              disabled={loading || !canSearch}
              className={cx(
                "bg-amber-300 text-black font-extrabold hover:bg-amber-200",
                "disabled:opacity-60 disabled:hover:bg-amber-300"
              )}
              title="Buscar mis reservas"
            >
              <IconSearch className="h-5 w-5" />
              {loading ? "Buscando…" : "Ver mis reservas"}
            </Button>
          </div>

          {/* Mobile controls */}
          <div className="mt-4 flex md:hidden flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => loadBookings()}
              disabled={loading || !canSearch}
              className={cx(
                "border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10",
                "disabled:opacity-60 disabled:hover:bg-white/[0.06]"
              )}
            >
              <IconRefresh className="h-5 w-5" />
              Refrescar
            </Button>

            <Button
              type="button"
              onClick={() => setShowPast((v) => !v)}
              className="border border-white/12 bg-black/35 text-white/85 hover:bg-white/10"
            >
              {showPast ? "Ocultar pasadas" : "Ver pasadas"}
            </Button>
          </div>

          {err ? (
            <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
              {err}
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/55">
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Próximas: <b className="text-white/75">{totalUpcoming}</b>
            </span>
            <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
              Pasadas: <b className="text-white/75">{totalPast}</b>
            </span>
            {fullName ? (
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Cliente: <b className="text-white/75">{fullName}</b>
              </span>
            ) : null}
          </div>
        </Card>
      </section>

      {/* List */}
      <section className="grid gap-6">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">OSOBARBER</div>
          <h2 className="mt-2 text-2xl md:text-3xl font-semibold tracking-tight">Tus reservas</h2>
          <p className="mt-2 text-sm text-white/60">
            Reagendar mantiene tu servicio y te lleva directo al calendario.
          </p>
        </div>

        <div className="grid gap-3">
          {loading ? (
            <>
              <BookingSkeleton />
              <BookingSkeleton />
              <BookingSkeleton />
            </>
          ) : !err && visibleItems.length === 0 ? (
            <Card className="p-6">
              <div className="rounded-2xl border border-white/10 bg-black/35 p-6">
                <div className="text-lg font-semibold">No hay reservas para mostrar</div>
                <div className="mt-2 text-sm text-white/65 leading-relaxed">
                  {showPast
                    ? "No encontramos reservas con los filtros actuales."
                    : "No tienes reservas futuras. Si quieres ver el historial, activa “Ver pasadas”."}
                </div>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/booking"
                    className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-6 py-3 font-extrabold text-black hover:bg-amber-200 transition"
                  >
                    Agendar ahora
                  </Link>
                  <AButton
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10"
                  >
                    <IconWhatsApp className="h-5 w-5" />
                    Hablar por WhatsApp
                  </AButton>
                </div>
              </div>
            </Card>
          ) : (
            visibleItems.map((b) => {
              const cancelled = (b.status || "").toUpperCase() === "CANCELLED";
              const past = isPast(b.start_time);
              const status = normalizeStatus(b.status);

              const dateLabel = fmtDateCL(b.start_time);
              const timeLabel = safeTimeRange(b.start_time, b.end_time);

              const serviceLabel = SERVICE_LABELS.get(b.service_id);

              return (
                <Card key={b.id} className="p-5 relative overflow-hidden">
                  {/* accent glow */}
                  <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.16),transparent_60%)] blur-2xl" />

                  <div className="relative flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid gap-2">
                        <div className="text-lg font-semibold tracking-tight">
                          {dateLabel} • {timeLabel}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className={cx("rounded-full border px-3 py-1 font-semibold", status.pill)}>
                            {status.label}
                          </span>

                          {past && !cancelled ? (
                            <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-white/55">
                              Historial
                            </span>
                          ) : null}

                          {serviceLabel ? (
                            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/70">
                              {serviceLabel}
                            </span>
                          ) : null}

                          {b.cancelled_at ? (
                            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/55">
                              Cancelada:{" "}
                              {new Intl.DateTimeFormat("es-CL", {
                                timeZone: "America/Santiago",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }).format(new Date(b.cancelled_at))}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-end">
                        <Link
                          href={buildEditHref(b)}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                          title="Reagendar"
                        >
                          <IconEdit className="h-5 w-5" />
                          Reagendar
                        </Link>

                        {cancelled ? (
                          <Button
                            type="button"
                            disabled
                            className="border border-white/10 bg-white/[0.05] text-white/55 cursor-not-allowed opacity-70"
                          >
                            <IconX className="h-5 w-5" />
                            Cancelada
                          </Button>
                        ) : past ? (
                          <Button
                            type="button"
                            onClick={() => {
                              const next = new Set(hiddenIds);
                              next.add(b.id);
                              persistHidden(next);
                            }}
                            className="border border-white/12 bg-black/35 text-white/85 hover:bg-white/10"
                            title="Oculta esta reserva solo en tu vista"
                          >
                            <IconEyeOff className="h-5 w-5" />
                            Ocultar
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => cancelBooking(b.id)}
                            className="border border-rose-300/25 bg-rose-300/10 text-rose-100 hover:bg-rose-300/15"
                            title="Cancelar reserva"
                          >
                            <IconX className="h-5 w-5" />
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* micro info */}
                    <div className="text-xs text-white/45">
                      Si necesitas ayuda con esta reserva, escríbenos por WhatsApp.
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {hiddenIds.size > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1">
              Ocultas: <b className="text-white/75">{hiddenIds.size}</b>
            </span>
            <Button
              type="button"
              onClick={() => persistHidden(new Set())}
              className="border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10 px-4 py-2"
            >
              Mostrar todo otra vez
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
