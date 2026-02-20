"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  DayPicker,
  UI,
  DayFlag,
  SelectionState,
  type ChevronProps,
} from "react-day-picker";
import "react-day-picker/dist/style.css";

type Barber = { id: string; name: string };
type Service = { id: string; name: string; duration_minutes: number };

type Slot = { start_time: string; end_time: string; available: boolean };

type Props = {
  barbers: Barber[];
  services: Service[];
  selectedBarberId: string;
  onSelectBarberId: (id: string) => void;

  day: string; // YYYY-MM-DD
  onDayChange: (day: string) => void;

  preselectedServiceId?: string;

  preselectedStartTime?: string;
  rebook?: boolean;
  rebookBookingId?: string;

  prefillName?: string;

  onCreated?: () => void;
};

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function formatTime(isoOrLocal: string) {
  const d = new Date(isoOrLocal);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function apiUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function sortIsoTimes(a: string, b: string) {
  return new Date(a).getTime() - new Date(b).getTime();
}

function isPastSlot(startIso: string) {
  return new Date(startIso).getTime() <= Date.now();
}

function sameInstant(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return new Date(a).getTime() === new Date(b).getTime();
}

function splitName(full?: string) {
  const s = (full || "").trim().replace(/\s+/g, " ");
  if (!s) return { first: "", last: "" };
  const parts = s.split(" ");
  if (parts.length === 1) return { first: parts[0], last: "" };
  const first = parts[0];
  const last = parts.slice(1).join(" ");
  return { first, last };
}

// ✅ FECHA CHILE
function chileYMDFromDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const d = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}-${m}-${d}`;
}

function parseYMDToSafeDate(ymd: string) {
  // mediodía para evitar corrimientos por zona horaria
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const d = new Date(`${ymd}T12:00:00`);
  return Number.isFinite(d.getTime()) ? d : null;
}

// Chevron icons
function IconChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14.5 6.5 9.5 12l5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M9.5 6.5 14.5 12l-5 5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function DayPickerChevron({ orientation, className }: ChevronProps) {
  const base = "h-5 w-5";
  if (orientation === "left")
    return <IconChevronLeft className={cx(base, className)} />;
  if (orientation === "right")
    return <IconChevronRight className={cx(base, className)} />;
  const rot =
    orientation === "up"
      ? "-rotate-90"
      : orientation === "down"
      ? "rotate-90"
      : "";
  return <IconChevronRight className={cx(base, className, rot)} />;
}

type Person = {
  id: string;
  firstName: string;
  lastName: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function BookingForm({
  barbers,
  services,
  selectedBarberId,
  onSelectBarberId,
  day,
  onDayChange,
  preselectedServiceId,
  preselectedStartTime,
  rebook,
  rebookBookingId,
  prefillName,
  onCreated,
}: Props) {
  const [serviceId, setServiceId] = useState<string>("");

  // Titular
  const seed = useMemo(() => splitName(prefillName), [prefillName]);
  const [owner, setOwner] = useState<Person>({
    id: "owner",
    firstName: seed.first,
    lastName: seed.last,
  });

  // Acompañantes
  const [companions, setCompanions] = useState<Person[]>([]);

  // selección actual
  const [timeByPerson, setTimeByPerson] = useState<Record<string, string>>({});

  // TU HORA (estado real)
  const [currentStartTime, setCurrentStartTime] = useState<string | null>(
    rebook ? preselectedStartTime ?? null : null
  );

  // éxito suave
  const [inlineSuccess, setInlineSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (rebook) setCurrentStartTime(preselectedStartTime ?? null);
    else setCurrentStartTime(null);
  }, [rebook, preselectedStartTime, rebookBookingId]);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0);

  const BUSINESS_WA_DISPLAY = "+569 2942 9715";

  // ✅ calendario inline ancho y centrado
  const [calendarOpen, setCalendarOpen] = useState(false);
  const todayChileYMD = useMemo(() => chileYMDFromDate(new Date()), []);
  const selectedDate = useMemo(() => parseYMDToSafeDate(day), [day]);

  // service default
  useEffect(() => {
    if (serviceId) return;
    if (services.length === 0) return;

    if (
      preselectedServiceId &&
      services.some((s) => s.id === preselectedServiceId)
    ) {
      setServiceId(preselectedServiceId);
      return;
    }

    setServiceId(services[0]!.id);
  }, [services, serviceId, preselectedServiceId]);

  // reset selection when filters change
  useEffect(() => {
    setTimeByPerson({});
    setError(null);
    setInlineSuccess(null);
  }, [selectedBarberId, serviceId, day]);

  const availableCount = useMemo(
    () => slots.filter((s) => s.available && !isPastSlot(s.start_time)).length,
    [slots]
  );

  const people = useMemo(() => [owner, ...companions], [owner, companions]);

  const totalSelected = useMemo(
    () => Object.keys(timeByPerson).length,
    [timeByPerson]
  );

  const selectedTimesSorted = useMemo(
    () => Object.values(timeByPerson).sort(sortIsoTimes),
    [timeByPerson]
  );

  // load slots
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!selectedBarberId || !day || !serviceId) {
        if (alive) setSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSlotsError(null);

      try {
        const url = apiUrl(
          `/slots?barber_id=${encodeURIComponent(
            selectedBarberId
          )}&service_id=${encodeURIComponent(
            serviceId
          )}&day=${encodeURIComponent(day)}&include_unavailable=true`
        );

        const r = await fetch(url, { cache: "no-store" });
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

        const list = Array.isArray(j) ? (j as Slot[]) : [];
        if (!alive) return;
        setSlots(list);
      } catch (e: any) {
        if (!alive) return;
        setSlots([]);
        setSlotsError(e?.message || "No se pudieron cargar los horarios.");
      } finally {
        if (!alive) return;
        setLoadingSlots(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [selectedBarberId, serviceId, day, slotsRefreshKey]);

  function fullName(p: Person) {
    return `${p.firstName.trim()} ${p.lastName.trim()}`.trim();
  }

  function hasFullName(p: Person) {
    return p.firstName.trim().length >= 2 && p.lastName.trim().length >= 2;
  }

  function nextPersonNeedingTime(): Person | null {
    for (const p of people) {
      if (!timeByPerson[p.id]) return p;
    }
    return null;
  }

  function ownerOfTime(startIso: string): Person | null {
    const entry = Object.entries(timeByPerson).find(([, t]) => t === startIso);
    if (!entry) return null;
    const pid = entry[0];
    return people.find((p) => p.id === pid) || null;
  }

  function clearTimeForPerson(personId: string) {
    setTimeByPerson((prev) => {
      const copy = { ...prev };
      delete copy[personId];
      return copy;
    });
  }

  function toggleAssignTime(startIso: string) {
    setError(null);
    setInlineSuccess(null);

    const currentOwner = ownerOfTime(startIso);
    if (currentOwner) {
      clearTimeForPerson(currentOwner.id);
      return;
    }

    if (rebook) {
      if (!hasFullName(owner)) {
        setError("Para seleccionar hora, ingresa Nombre y Apellido del titular.");
        return;
      }
      setTimeByPerson({ owner: startIso });
      return;
    }

    const next = nextPersonNeedingTime();
    if (!next) {
      setError(
        "Ya asignaste horas a todos. Si quieres otra, agrega otro acompañante o desmarca una hora."
      );
      return;
    }

    if (!hasFullName(next)) {
      // ✅ ya no debería pasar porque bloqueamos, pero queda de respaldo
      setError(
        `Para seleccionar hora, completa Nombre y Apellido de: ${
          next.id === "owner" ? "Titular" : "Acompañante"
        }`
      );
      return;
    }

    setTimeByPerson((prev) => ({ ...prev, [next.id]: startIso }));
  }

  async function releaseCurrentBooking() {
    setError(null);
    setInlineSuccess(null);

    if (!rebook || !rebookBookingId) return;

    if (!hasFullName(owner)) {
      setError("Para soltar tu hora, ingresa Nombre y Apellido del titular.");
      return;
    }

    const ok = window.confirm(
      "¿Soltar (cancelar) tu hora actual? Esa hora quedará disponible para otros."
    );
    if (!ok) return;

    try {
      const name = fullName(owner);

      const r = await fetch(
        apiUrl(
          `/bookings/${encodeURIComponent(
            rebookBookingId
          )}/cancel?name=${encodeURIComponent(name)}`
        ),
        { method: "POST" }
      );

      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      setCurrentStartTime(null);
      setSlotsRefreshKey((k) => k + 1);
      setTimeByPerson({});
      setInlineSuccess("✅ Hora soltada.");
      window.setTimeout(() => setInlineSuccess(null), 2500);
    } catch (e: any) {
      setError(e?.message || "No se pudo soltar la hora.");
    }
  }

  function addCompanion() {
    setError(null);
    setInlineSuccess(null);

    if (companions.length >= 3) {
      setError("Máximo 3 acompañantes por ahora.");
      return;
    }
    setCompanions((prev) => [
      ...prev,
      { id: uid(), firstName: "", lastName: "" },
    ]);
  }

  function removeCompanion(id: string) {
    setError(null);
    setInlineSuccess(null);

    clearTimeForPerson(id);
    setCompanions((prev) => prev.filter((x) => x.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInlineSuccess(null);

    if (!selectedBarberId) return setError("Selecciona un barbero.");
    if (!serviceId) return setError("Selecciona un servicio.");
    if (!day) return setError("Selecciona un día.");

    if (!hasFullName(owner))
      return setError("Nombre y Apellido del titular son obligatorios.");

    for (const c of companions) {
      if (!hasFullName(c))
        return setError("Completa Nombre y Apellido de todos los acompañantes.");
    }

    const requiredCount = rebook ? 1 : people.length;
    if (Object.keys(timeByPerson).length < requiredCount) {
      if (rebook) return setError("Selecciona 1 hora.");
      return setError(
        "Debes asignar una hora a cada persona (Titular y acompañantes)."
      );
    }

    for (const pid of Object.keys(timeByPerson)) {
      const st = timeByPerson[pid];
      const picked = slots.find((s) => s.start_time === st);
      const isCurrent = !!rebook && sameInstant(st, currentStartTime);

      if (picked && !picked.available && !isCurrent)
        return setError("Hay una hora seleccionada que ya está ocupada.");
      if (isPastSlot(st) && !isCurrent)
        return setError("Esa hora ya pasó. Elige otra.");
    }

    setLoadingCreate(true);
    try {
      if (rebook && rebookBookingId) {
        const only = timeByPerson["owner"];
        if (!only) throw new Error("Selecciona 1 hora.");

        const name = fullName(owner);

        const r = await fetch(
          apiUrl(
            `/bookings/${encodeURIComponent(
              rebookBookingId
            )}?name=${encodeURIComponent(
              name
            )}&new_start_time=${encodeURIComponent(only)}`
          ),
          { method: "PATCH" }
        );

        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

        setCurrentStartTime(only);
        setTimeByPerson({});
        setSlotsRefreshKey((k) => k + 1);

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("start_time", only);
          window.history.replaceState(null, "", url.toString());
        }

        setInlineSuccess(`✅ Hora actualizada a ${formatTime(only)}.`);
        window.setTimeout(() => setInlineSuccess(null), 2500);
        return;
      }

      // crear normal
      const personsToCreate = people.map((p) => ({
        person: p,
        start_time: timeByPerson[p.id],
      }));

      for (const row of personsToCreate) {
        const nm = fullName(row.person);

        const payload: any = {
          barber_id: selectedBarberId,
          service_id: serviceId,
          client_name: nm,
          client_phone: null,
          start_time: row.start_time,
        };

        const r = await fetch(apiUrl(`/bookings`), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);
      }

      setTimeByPerson({});
      setSlotsRefreshKey((k) => k + 1);

      onCreated?.();

      setOwner({ id: "owner", firstName: "", lastName: "" });
      setCompanions([]);
    } catch (e: any) {
      setError(
        typeof e?.message === "string"
          ? e.message
          : "No se pudo crear la reserva."
      );
    } finally {
      setLoadingCreate(false);
    }
  }

  const slotEmptyText = useMemo(() => {
    if (!selectedBarberId || !serviceId || !day)
      return "Elige barbero, servicio y día para ver horas.";
    if (loadingSlots) return "Cargando horarios…";
    if (slotsError) return `Error: ${slotsError}`;
    if (slots.length === 0) return "No hay horas configuradas para ese día.";
    if (availableCount === 0) return "No hay horas disponibles para ese día.";
    return "";
  }, [
    selectedBarberId,
    serviceId,
    day,
    loadingSlots,
    slotsError,
    slots.length,
    availableCount,
  ]);

  function renderPersonRow(p: Person, isOwner: boolean) {
    const assigned = timeByPerson[p.id];
    const label = isOwner ? "Titular" : "Acompañante";

    return (
      <div
        key={p.id}
        className="rounded-2xl border border-white/10 bg-black/30 p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-white">{label}</div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm text-white/70">Nombre</label>
                <input
                  value={p.firstName}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isOwner)
                      setOwner((prev) => ({ ...prev, firstName: v }));
                    else
                      setCompanions((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, firstName: v } : x
                        )
                      );
                  }}
                  placeholder="Ej: Waldo"
                  className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm text-white/70">Apellido</label>
                <input
                  value={p.lastName}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (isOwner)
                      setOwner((prev) => ({ ...prev, lastName: v }));
                    else
                      setCompanions((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, lastName: v } : x
                        )
                      );
                  }}
                  placeholder="Ej: Ramírez"
                  className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-white/60">Hora:</span>
              {assigned ? (
                <span className="rounded-xl border border-white/10 bg-white/5 px-2 py-1 text-white">
                  {formatTime(assigned)}
                </span>
              ) : (
                <span className="text-white/50">Sin asignar</span>
              )}

              {assigned ? (
                <button
                  type="button"
                  onClick={() => clearTimeForPerson(p.id)}
                  className="ml-auto rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  Quitar hora
                </button>
              ) : null}
            </div>
          </div>

          {!isOwner ? (
            <button
              type="button"
              onClick={() => removeCompanion(p.id)}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-100 hover:bg-red-500/20"
              title="Quitar acompañante"
            >
              Quitar
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // ✅ habilitar horas SOLO cuando el siguiente tenga nombre completo
  const nextNeed = rebook ? owner : nextPersonNeedingTime();
  const needName = !!nextNeed && !hasFullName(nextNeed);
  const needLabel = nextNeed?.id === "owner" ? "Titular" : "Acompañante";

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-xl font-semibold">
        {rebook ? "Reagendar hora" : "Reservar hora"}
      </h2>
      <p className="mt-1 text-sm text-white/60">
        {rebook
          ? "Completa tus datos y elige una nueva hora."
          : "Titular + acompañantes. Asigna una hora a cada persona."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm text-white/70">Barbero</label>
          <select
            value={selectedBarberId}
            onChange={(e) => onSelectBarberId(e.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
          >
            {barbers.length === 0 ? (
              <option value="">(sin barberos)</option>
            ) : (
              barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Servicio</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
          >
            {services.length === 0 ? (
              <option value="">(sin servicios)</option>
            ) : (
              services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* ✅ PERSONAS PRIMERO */}
        <div className="grid gap-3">
          {renderPersonRow(owner, true)}
          {!rebook ? companions.map((c) => renderPersonRow(c, false)) : null}

          {!rebook ? (
            <button
              type="button"
              onClick={addCompanion}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
            >
              + Agregar acompañante
            </button>
          ) : null}
        </div>

        {/* ✅ DÍA + HORARIOS */}
        <div className="mt-1 rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Día y horarios</div>
              <div className="text-xs text-white/60">
                {day ? day : "Elige un día para ver horas"}{" "}
                {loadingSlots
                  ? "• cargando…"
                  : slots.length
                  ? `• ${availableCount} disponibles`
                  : ""}
              </div>
              {!rebook ? (
                <div className="mt-1 text-xs text-white/50">
                  Asigna horas en orden: <b>Titular</b> → Acompañantes.
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setCalendarOpen((v) => !v)}
              className="h-10 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white/80 hover:border-white/25 hover:bg-white/10 transition"
              aria-expanded={calendarOpen}
            >
              {calendarOpen ? "Cerrar" : "Elegir día"}
            </button>
          </div>

          {calendarOpen ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-zinc-950/60 backdrop-blur p-4">
              {/* ✅ ANCHO + CENTRADO */}
              <div className="mx-auto w-full max-w-3xl">
                <div className="flex justify-center">
                  <DayPicker
                    mode="single"
                    selected={selectedDate ?? undefined}
                    onSelect={(d) => {
                      if (!d) return;
                      const ymd = chileYMDFromDate(d);
                      if (!rebook && ymd < todayChileYMD) return;
                      onDayChange(ymd);
                      setCalendarOpen(false);
                    }}
                    disabled={
                      !rebook
                        ? (d) => chileYMDFromDate(d) < todayChileYMD
                        : undefined
                    }
                    weekStartsOn={1}
                    showOutsideDays
                    className="w-full"
                    classNames={{
                      [UI.Months]: "w-full flex flex-col items-center",
                      [UI.Month]: "w-full space-y-3",

                      [UI.MonthCaption]:
                        "w-full flex items-center justify-between px-1",
                      [UI.CaptionLabel]: "text-sm font-extrabold text-white/90",

                      [UI.Nav]: "flex items-center gap-2",
                      [UI.PreviousMonthButton]: cx(
                        "h-9 w-9 rounded-2xl border border-white/10 bg-white/[0.06]",
                        "text-white/80 hover:bg-white/10 transition inline-flex items-center justify-center"
                      ),
                      [UI.NextMonthButton]: cx(
                        "h-9 w-9 rounded-2xl border border-white/10 bg-white/[0.06]",
                        "text-white/80 hover:bg-white/10 transition inline-flex items-center justify-center"
                      ),

                      [UI.MonthGrid]:
                        "mx-auto w-full max-w-[560px] border-collapse",
                      [UI.Weekdays]: "flex justify-center",
                      [UI.Weekday]:
                        "w-12 text-center text-[11px] font-semibold text-white/50",
                      [UI.Weeks]: "mt-1",
                      [UI.Week]: "mt-1 flex justify-center",

                      [UI.Day]:
                        "w-12 h-12 text-center p-0 group rounded-2xl text-white/85",
                      [UI.DayButton]: cx(
                        "h-12 w-12 rounded-2xl text-sm font-semibold text-inherit",
                        "transition focus:outline-none",
                        "group-hover:bg-white/10"
                      ),

                      [DayFlag.today]:
                        "border border-amber-300/35 bg-amber-300/10 text-amber-200",
                      [DayFlag.outside]: "text-white/25",
                      [DayFlag.disabled]:
                        "text-white/25 line-through opacity-70",

                      [SelectionState.selected]: "bg-amber-300 text-black",
                    }}
                    components={{ Chevron: DayPickerChevron }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onDayChange(todayChileYMD);
                      setCalendarOpen(false);
                    }}
                    className="h-12 rounded-2xl bg-amber-300 px-4 text-sm font-extrabold text-black hover:bg-amber-200 transition"
                  >
                    Hoy
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(false)}
                    className="h-12 rounded-2xl border border-white/12 bg-white/[0.06] px-4 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
                  >
                    Listo
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* ✅ mensaje guía */}
          {needName ? (
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">
              Primero completa <b>Nombre y Apellido</b> de: <b>{needLabel}</b>, y
              después eliges la hora.
            </div>
          ) : null}

          <div className="mt-4">
            {slotEmptyText ? (
              <div className="text-sm text-white/60">{slotEmptyText}</div>
            ) : (
              <>
                {selectedTimesSorted.length > 0 ? (
                  <div className="mb-2 text-xs text-white/60 text-right">
                    Seleccionadas: {totalSelected}/{rebook ? 1 : people.length}
                  </div>
                ) : null}

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => {
                    const start = s.start_time;

                    const isCurrent =
                      !!rebook && sameInstant(start, currentStartTime);

                    const assignedToSomeone = !!ownerOfTime(start);

                    const disabledByAvailability =
                      (!s.available || isPastSlot(start)) && !isCurrent;

                    const disabledByName = needName && !assignedToSomeone;

                    const disabled =
                      (disabledByAvailability || disabledByName) && !isCurrent;

                    return (
                      <button
                        key={start}
                        type="button"
                        disabled={disabled}
                        onClick={() => {
                          if (disabled) return;

                          if (isCurrent) return releaseCurrentBooking();

                          if (assignedToSomeone) {
                            const who = ownerOfTime(start);
                            if (who) clearTimeForPerson(who.id);
                            return;
                          }

                          toggleAssignTime(start);
                        }}
                        className={[
                          "h-10 rounded-2xl border px-2 text-sm font-semibold transition",
                          assignedToSomeone
                            ? "border-white/40 bg-white text-black"
                            : isCurrent
                            ? "border-amber-300/60 bg-amber-300/10 text-amber-100 hover:bg-amber-300/15"
                            : disabled
                            ? "border-white/5 bg-white/5 text-white/30 line-through cursor-not-allowed"
                            : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white",
                        ].join(" ")}
                        title={
                          disabledByName
                            ? "Completa Nombre y Apellido primero"
                            : isCurrent
                            ? "Tu hora actual (click para soltarla)"
                            : disabledByAvailability
                            ? "No disponible"
                            : start
                        }
                      >
                        {isCurrent
                          ? `${formatTime(start)} • TU HORA`
                          : formatTime(start)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="text-xs text-white/60">
          WhatsApp: <span className="text-white/80">{BUSINESS_WA_DISPLAY}</span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {inlineSuccess ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {inlineSuccess}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loadingCreate}
          className="mt-2 h-12 rounded-2xl bg-white text-black font-semibold transition hover:bg-white/90 disabled:opacity-60"
        >
          {loadingCreate
            ? "Guardando…"
            : rebook
            ? "Confirmar cambio"
            : `Reservar (${people.length})`}
        </button>

        <div className="text-xs text-white/50">
          Tip: ocupadas aparecen tachadas. Horas pasadas también quedan bloqueadas.
          {!rebook ? " Si una hora ya está asignada, haz click para quitarla." : ""}
        </div>
      </form>
    </section>
  );
}
