"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  DayPicker,
  UI,
  DayFlag,
  SelectionState,
  type ChevronProps,
} from "react-day-picker";

function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

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

function fmtCL(date: Date) {
  return new Intl.DateTimeFormat("es-CL", {
    timeZone: "America/Santiago",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function parseYMDToSafeDate(ymd: string) {
  // mediodía para evitar corrimientos por zona horaria
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
  const d = new Date(`${ymd}T12:00:00`);
  return Number.isFinite(d.getTime()) ? d : null;
}

function IconCalendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M7 3v3M17 3v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.5 8.2h15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M6.5 5.8h11A2.5 2.5 0 0 1 20 8.3v11.2A2.5 2.5 0 0 1 17.5 22h-11A2.5 2.5 0 0 1 4 19.5V8.3A2.5 2.5 0 0 1 6.5 5.8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
  if (orientation === "left") {
    return <IconChevronLeft className={cx(base, className)} />;
  }
  if (orientation === "right") {
    return <IconChevronRight className={cx(base, className)} />;
  }

  // Para dropdowns (up/down), rotamos el chevron derecho
  const rot =
    orientation === "up" ? "-rotate-90" : orientation === "down" ? "rotate-90" : "";
  return <IconChevronRight className={cx(base, className, rot)} />;
}

export default function DatePickerPro({
  value,
  onChange,
  minToday = true,
  className = "",
}: {
  value: string; // YYYY-MM-DD
  onChange: (ymd: string) => void;
  minToday?: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);

  const todayChileYMD = useMemo(() => chileYMDFromDate(new Date()), []);
  const selected = useMemo(() => parseYMDToSafeDate(value), [value]);

  // cerrar al click afuera + ESC
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      const el = wrapRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = selected ? fmtCL(selected) : "Selecciona fecha";

  return (
    <div ref={wrapRef} className={cx("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4",
          "text-left text-sm text-white/90",
          "hover:bg-white/10 transition",
          "flex items-center justify-between gap-3"
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className="font-semibold">{label}</span>
        <span className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] p-2 text-white/70">
          <IconCalendar className="h-5 w-5" />
        </span>
      </button>

      {open ? (
        <div
          className={cx(
            "absolute z-[80] mt-3 w-[320px] max-w-[92vw]",
            "rounded-3xl border border-white/10 bg-zinc-950/95 backdrop-blur",
            "shadow-[0_30px_120px_rgba(0,0,0,0.65)] p-4"
          )}
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs uppercase tracking-[0.22em] text-white/50">
              Seleccionar día
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
            >
              Cerrar
            </button>
          </div>

          <DayPicker
            mode="single"
            selected={selected ?? undefined}
            onSelect={(d) => {
              if (!d) return;
              const ymd = chileYMDFromDate(d);
              if (minToday && ymd < todayChileYMD) return;
              onChange(ymd);
              setOpen(false);
            }}
            disabled={
              minToday ? (d) => chileYMDFromDate(d) < todayChileYMD : undefined
            }
            weekStartsOn={1}
            showOutsideDays
            classNames={{
              [UI.Months]: "flex flex-col",
              [UI.Month]: "space-y-3",

              [UI.MonthCaption]: "flex items-center justify-between px-1",
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

              [UI.MonthGrid]: "w-full border-collapse",
              [UI.Weekdays]: "flex",
              [UI.Weekday]:
                "w-10 text-center text-[11px] font-semibold text-white/50",
              [UI.Weeks]: "mt-1",
              [UI.Week]: "mt-1 flex",

              // Celda del día (aplica flags/selection aquí)
              [UI.Day]: "w-10 h-10 text-center p-0 group rounded-2xl text-white/85",
              // Botón del día
              [UI.DayButton]: cx(
                "h-10 w-10 rounded-2xl text-sm font-semibold text-inherit",
                "transition focus:outline-none",
                "group-hover:bg-white/10"
              ),

              // Flags (v9)
              [DayFlag.today]:
                "border border-amber-300/35 bg-amber-300/10 text-amber-200",
              [DayFlag.outside]: "text-white/25",
              [DayFlag.disabled]: "text-white/25 line-through opacity-70",

              // Selección (v9)
              [SelectionState.selected]: "bg-amber-300 text-black",
            }}
            components={{
              Chevron: DayPickerChevron,
            }}
          />

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(todayChileYMD);
                setOpen(false);
              }}
              className="flex-1 rounded-2xl bg-amber-300 px-4 py-2.5 text-sm font-extrabold text-black hover:bg-amber-200 transition"
            >
              Hoy
            </button>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
            >
              Listo
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
