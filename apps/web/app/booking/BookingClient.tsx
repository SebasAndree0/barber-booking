"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import BookingForm from "../components/BookingForm";

/* ---------------- Types ---------------- */

type Barber = { id: string; name: string };
type Service = { id: string; name: string; duration_minutes: number };

/* ---------------- Utils ---------------- */

function todayYYYYMMDDChile() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const d = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}-${m}-${d}`;
}

function isValidDay(s: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test((s || "").trim());
}

async function fetchWithTimeout(url: string, ms = 8000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { cache: "no-store", signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

function cleanName(s: string) {
  return (s || "").trim().replace(/\s+/g, " ");
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------- Icons ---------------- */

function IconSpark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2l1.2 4.2L17.5 7.5l-4.3 1.3L12 13l-1.2-4.2L6.5 7.5l4.3-1.3L12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M19 12l.8 2.8 2.2.7-2.2.7L19 19l-.8-2.8-2.2-.7 2.2-.7L19 12Z"
        fill="currentColor"
        opacity="0.6"
      />
    </svg>
  );
}

function IconWarn(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M12 3 2.8 20h18.4L12 3Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 9v5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 17.4h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconCheck(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M6 6l12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------- UI ---------------- */

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
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5",
        "text-[11px] font-semibold tracking-wide text-white/75",
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
        "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition",
        className
      )}
    >
      {children}
    </button>
  );
}

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-white/10", className)} />;
}

/* ---------------- Page ---------------- */

export default function BookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ evita hydration mismatch: solo render “real” cuando está montado
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ✅ fallback a rewrite local si no tienes env
  const baseRaw = (process.env.NEXT_PUBLIC_API_URL || "").trim();
  const base = useMemo(() => (baseRaw ? baseRaw.replace(/\/+$/, "") : "/api/v1"), [baseRaw]);

  // Query params
  const qpServiceId = searchParams.get("service_id") || "";
  const qpBarberId = searchParams.get("barber_id") || "";
  const qpDay = searchParams.get("day") || "";
  const qpMode = (searchParams.get("mode") || "").toLowerCase();
  const qpBookingId = searchParams.get("booking_id") || "";
  const qpStartTime = searchParams.get("start_time") || "";

  const qpFirstName = cleanName(searchParams.get("first_name") || "");
  const qpLastName = cleanName(searchParams.get("last_name") || "");
  const qpName = cleanName(searchParams.get("name") || "");

  const prefillName = useMemo(() => {
    const full = cleanName(`${qpFirstName} ${qpLastName}`);
    return (full || qpName || "").trim() || undefined;
  }, [qpFirstName, qpLastName, qpName]);

  const rebook = qpMode === "reschedule" && !!qpBookingId;

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  // ✅ importante: NO calculamos “hoy” en render inicial
  const [day, setDay] = useState<string>(isValidDay(qpDay) ? qpDay : "");

  const [successOpen, setSuccessOpen] = useState(false);
  const [successKind, setSuccessKind] = useState<"created" | "rescheduled">("created");

  // set day desde query o hoy (solo cliente)
  useEffect(() => {
    const next = isValidDay(qpDay) ? qpDay : "";
    setDay(next || todayYYYYMMDDChile());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qpDay, mounted]);

  // load data
  useEffect(() => {
    if (!mounted) return;

    let alive = true;
    async function load() {
      setLoading(true);
      setErr(null);

      try {
        const [bRes, sRes] = await Promise.all([
          fetchWithTimeout(`${base}/barbers`, 8000),
          fetchWithTimeout(`${base}/services`, 8000),
        ]);

        const bJson = await bRes.json().catch(() => null);
        const sJson = await sRes.json().catch(() => null);

        if (!bRes.ok) throw new Error(bJson?.detail || `Error /barbers ${bRes.status}`);
        if (!sRes.ok) throw new Error(sJson?.detail || `Error /services ${sRes.status}`);

        const b = Array.isArray(bJson) ? (bJson as Barber[]) : [];
        const s = Array.isArray(sJson) ? (sJson as Service[]) : [];

        if (!alive) return;

        setBarbers(b);
        setServices(s);

        if (qpBarberId && b.some((x) => x.id === qpBarberId)) setSelectedBarberId(qpBarberId);
        else setSelectedBarberId((prev) => prev || b[0]?.id || "");
      } catch (e: any) {
        if (!alive) return;
        const msg =
          e?.name === "AbortError" ? `Timeout: el API no respondió.` : e?.message || "Error cargando datos";
        setErr(msg);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [base, qpBarberId, mounted]);

  const headerTitle = useMemo(() => (rebook ? "Reagendar tu hora" : "Reserva tu hora"), [rebook]);

  const selectedServiceLabel = useMemo(() => {
    if (!qpServiceId) return null;
    const s = services.find((x) => x.id === qpServiceId);
    return s?.name || null;
  }, [qpServiceId, services]);

  const selectedBarberLabel = useMemo(() => {
    if (!selectedBarberId) return null;
    const b = barbers.find((x) => x.id === selectedBarberId);
    return b?.name || null;
  }, [selectedBarberId, barbers]);

  // ✅ skeleton estable SSR/CSR (evita hydration mismatch)
  if (!mounted) {
    return (
      <div className="grid gap-6 py-10">
        <Card className="p-8">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-3 h-4 w-96" />
          <div className="mt-5 flex gap-2">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-7 w-28" />
          </div>
        </Card>
        <Card className="p-8">
          <Skeleton className="h-10 w-72" />
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full md:col-span-2" />
          </div>
          <div className="mt-6 grid gap-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-10 py-10">
      {/* HERO */}
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
                  Reserva online
                </Pill>
                <Pill>San Bernardo</Pill>
                {rebook ? (
                  <Pill className="text-amber-200/90">
                    <IconSpark className="h-4 w-4" />
                    Reagendar
                  </Pill>
                ) : null}
              </div>

              <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.02]">
                {headerTitle}.{" "}
                <span className="text-amber-200/95">{rebook ? "Actualiza en segundos." : "Sin filas."}</span>
              </h1>

              <p className="mt-3 text-sm md:text-base text-white/65 max-w-2xl leading-relaxed">
                Elige barbero, servicio, día y horario disponible.{" "}
                <b className="text-white/85">Rápido, limpio y sin vueltas.</b>
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/65">
                  Horarios: Lun–Vie 19:00–22:00 • Sáb 10:00–22:00 • Dom 10:00–21:00
                </span>
                {selectedServiceLabel ? (
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/70">
                    Servicio: <b className="text-white/80">{selectedServiceLabel}</b>
                  </span>
                ) : null}
                {selectedBarberLabel ? (
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/70">
                    Barbero: <b className="text-white/80">{selectedBarberLabel}</b>
                  </span>
                ) : null}
                {prefillName ? (
                  <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-white/70">
                    Cliente: <b className="text-white/80">{prefillName}</b>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-6 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Volver al inicio
              </Link>

              <Link
                href="/my-bookings"
                className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-6 py-3 font-extrabold text-black hover:bg-amber-200 transition shadow-[0_18px_60px_rgba(245,158,11,0.16)]"
              >
                Ver mis reservas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {err ? (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-300/20 bg-rose-300/10 text-rose-200">
              <IconWarn className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="text-lg font-semibold text-white/90">No pudimos cargar datos</div>
              <div className="mt-1 text-sm text-white/70 break-words">{err}</div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-amber-300 text-black font-extrabold hover:bg-amber-200"
                >
                  Reintentar
                </Button>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/[0.06] px-6 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
                >
                  Ir al inicio
                </Link>
              </div>
            </div>
          </div>
        </Card>
      ) : null}

      {/* CONTENT */}
      {loading ? (
        <div className="grid gap-4">
          <Card className="p-8">
            <Skeleton className="h-6 w-72" />
            <Skeleton className="mt-3 h-4 w-[520px]" />
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full md:col-span-2" />
            </div>
            <div className="mt-6 grid gap-3">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </Card>
          <div className="text-sm text-white/55">Cargando barberos y servicios…</div>
        </div>
      ) : !err ? (
        <Card className="p-6 md:p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-white/45">OSOBARBER</div>
              <div className="mt-2 text-2xl font-semibold tracking-tight text-white/90">
                {rebook ? "Reagendar" : "Agendar"} <span className="text-amber-200/95">en segundos</span>
              </div>
              <div className="mt-2 text-sm text-white/65">
                Si ya tienes una reserva, revisa en{" "}
                <Link href="/my-bookings" className="text-white/80 underline underline-offset-4 hover:text-white">
                  Mis reservas
                </Link>
                .
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => router.push("/my-bookings")}
                className="border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10"
              >
                Mis reservas
              </Button>

              <Button
                type="button"
                onClick={() => router.push("/")}
                className="border border-white/12 bg-black/35 text-white/85 hover:bg-white/10"
              >
                Inicio
              </Button>
            </div>
          </div>

          <BookingForm
            barbers={barbers}
            services={services}
            selectedBarberId={selectedBarberId}
            onSelectBarberId={setSelectedBarberId}
            day={day}
            onDayChange={setDay}
            preselectedServiceId={qpServiceId}
            preselectedStartTime={qpStartTime || undefined}
            rebook={rebook}
            rebookBookingId={qpBookingId || undefined}
            prefillName={prefillName}
            onCreated={() => {
              setSuccessKind(rebook ? "rescheduled" : "created");
              setSuccessOpen(true);
            }}
          />
        </Card>
      ) : null}

      {/* SUCCESS MODAL */}
      {successOpen ? (
        <div className="fixed inset-0 z-[200] grid place-items-center bg-black/75 px-6" onClick={() => setSuccessOpen(false)}>
          <div
            className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300 text-black shadow-[0_18px_60px_rgba(245,158,11,0.16)]">
                  <IconCheck className="h-7 w-7" />
                </div>

                <div>
                  <div className="text-lg font-semibold text-white">Listo</div>
                  <div className="mt-1 text-sm text-white/70">
                    {successKind === "rescheduled"
                      ? "Tu reserva fue actualizada. ✅"
                      : "Reserva creada. ¡Nos vemos en OsoBarber!"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10 transition"
                aria-label="Cerrar"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              <Button
                type="button"
                onClick={() => {
                  setSuccessOpen(false);
                  router.push(successKind === "rescheduled" ? "/my-bookings" : "/");
                }}
                className="bg-amber-300 text-black font-extrabold hover:bg-amber-200"
              >
                {successKind === "rescheduled" ? "Volver a mis reservas" : "Volver al inicio"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  setSuccessOpen(false);
                  router.push("/my-bookings");
                }}
                className="border border-white/12 bg-white/[0.06] text-white/90 hover:bg-white/10"
              >
                Ver mis reservas
              </Button>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-xs text-white/55">
              Tip: Si necesitas reagendar después, entra a <b className="text-white/70">Mis reservas</b>.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
