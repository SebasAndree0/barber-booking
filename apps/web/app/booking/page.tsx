"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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

function BookingInner() {
  const searchParams = useSearchParams();
  const preselectedServiceId = searchParams.get("service_id") || "";

  // ✅ Debe incluir /api/v1 (ej: http://127.0.0.1:8001/api/v1)
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedBarberId, setSelectedBarberId] = useState<string>("");
  const [day, setDay] = useState<string>(todayYYYYMMDD());

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
          fetch(`${base}/barbers`, { cache: "no-store" }),
          fetch(`${base}/services`, { cache: "no-store" }),
        ]);

        const bJson = await bRes.json().catch(() => null);
        const sJson = await sRes.json().catch(() => null);

        if (!bRes.ok) throw new Error(bJson?.detail || `Error ${bRes.status}`);
        if (!sRes.ok) throw new Error(sJson?.detail || `Error ${sRes.status}`);

        const b = Array.isArray(bJson) ? (bJson as Barber[]) : [];
        const s = Array.isArray(sJson) ? (sJson as Service[]) : [];

        if (!alive) return;

        setBarbers(b);
        setServices(s);

        // default barber
        setSelectedBarberId((prev) => prev || b[0]?.id || "");
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "Error cargando datos");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [base]);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <h1 className="text-2xl font-semibold">Reserva tu hora</h1>
        <p className="mt-1 text-sm text-white/70">
          Elige barbero, servicio, día y horario disponible.
        </p>
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
          preselectedServiceId={preselectedServiceId}
          onCreated={() => {}}
        />
      )}
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-white/70">Cargando…</div>}>
      <BookingInner />
    </Suspense>
  );
}
