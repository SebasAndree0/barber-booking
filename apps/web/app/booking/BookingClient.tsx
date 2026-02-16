"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookingForm from "../components/BookingForm";

type Barber = { id: string; name: string };
type Service = { id: string; name: string; duration_minutes: number };

function todayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
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

export default function BookingClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const baseRaw = process.env.NEXT_PUBLIC_API_URL || "";
  const base = useMemo(() => baseRaw.replace(/\/+$/, ""), [baseRaw]);

  const qpServiceId = searchParams.get("service_id") || "";
  const qpBarberId = searchParams.get("barber_id") || "";
  const qpDay = searchParams.get("day") || "";
  const qpMode = (searchParams.get("mode") || "").toLowerCase();
  const qpBookingId = searchParams.get("booking_id") || "";
  const qpStartTime = searchParams.get("start_time") || "";

  const qpFirstName = (searchParams.get("first_name") || "").trim();
  const qpLastName = (searchParams.get("last_name") || "").trim();
  const qpName = (searchParams.get("name") || "").trim();

  const prefillName = useMemo(() => {
    const full = `${qpFirstName} ${qpLastName}`.trim();
    return (full || qpName || "").trim() || undefined;
  }, [qpFirstName, qpLastName, qpName]);

  const rebook = qpMode === "reschedule" && !!qpBookingId;

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [day, setDay] = useState<string>(isValidDay(qpDay) ? qpDay : todayYYYYMMDD());

  const [successOpen, setSuccessOpen] = useState(false);
  const [successKind, setSuccessKind] = useState<"created" | "rescheduled">("created");

  useEffect(() => {
    const next = isValidDay(qpDay) ? qpDay : "";
    if (next) setDay(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qpDay]);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);

      try {
        if (!base) {
          throw new Error(
            "Falta NEXT_PUBLIC_API_URL en apps/web/.env.local (ej: http://127.0.0.1:8001/api/v1)"
          );
        }

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

        if (qpBarberId && b.some((x) => x.id === qpBarberId)) {
          setSelectedBarberId(qpBarberId);
        } else {
          setSelectedBarberId((prev) => prev || b[0]?.id || "");
        }
      } catch (e: any) {
        if (!alive) return;
        const msg =
          e?.name === "AbortError"
            ? `Timeout: el API no respondió. Revisa NEXT_PUBLIC_API_URL=${base}`
            : e?.message || "Error cargando datos";
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
  }, [base, qpBarberId]);

  const headerTitle = useMemo(() => (rebook ? "Reagendar tu hora" : "Reserva tu hora"), [rebook]);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="text-2xl font-semibold">{headerTitle}</h1>
        <p className="mt-1 text-sm text-white/70">Elige barbero, servicio, día y horario disponible.</p>
        <p className="mt-2 text-xs text-white/50">
          Horarios: Lun–Vie 19:00–22:00 • Sáb 10:00–22:00 • Dom 10:00–21:00
        </p>
      </div>

      {err && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-white/70">Cargando…</div>
      ) : (
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
      )}

      {successOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 px-6">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-950 p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">✅ Listo</div>
                <div className="mt-1 text-sm text-white/70">
                  {successKind === "rescheduled"
                    ? "Tu reserva fue actualizada. ✅"
                    : "Reserva(s) creada(s). ¡Nos vemos en OsoBarber!"}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setSuccessOpen(false);
                  router.push(successKind === "rescheduled" ? "/my-bookings" : "/");
                }}
                className="rounded-2xl bg-white px-5 py-3 font-semibold text-black hover:bg-white/90 transition"
              >
                {successKind === "rescheduled" ? "Volver a mis reservas" : "Volver al inicio"}
              </button>

              <button
                type="button"
                onClick={() => setSuccessOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 hover:bg-white/10 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
