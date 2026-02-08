"use client";

import React, { useEffect, useMemo, useState } from "react";

type Barber = { id: string; name: string };
type Service = { id: string; name: string; duration_minutes: number };

type Props = {
  barbers: Barber[];
  services: Service[];
  selectedBarberId: string;
  onSelectBarberId: (id: string) => void;

  day: string;
  onDayChange: (day: string) => void;

  preselectedServiceId?: string;
  onCreated?: () => void;
};

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

function waLink(phoneRaw: string, text: string) {
  const phone = (phoneRaw || "").replace(/[^\d]/g, "");
  const msg = encodeURIComponent(text);
  return `https://wa.me/${phone}?text=${msg}`;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function BookingForm({
  barbers,
  services,
  selectedBarberId,
  onSelectBarberId,
  day,
  onDayChange,
  preselectedServiceId,
  onCreated,
}: Props) {
  const [serviceId, setServiceId] = useState<string>("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [slotsRefreshKey, setSlotsRefreshKey] = useState(0);

  // ✅ Duración fija (1 hora) para TODO (solo para calcular disponibilidad)
  const serviceMinutes = 60;

  // Contacto OsoBarber (se muestra al cliente)
  const BUSINESS_EMAIL = "osobarberr@gmail.com";
  const BUSINESS_WA_DISPLAY = "+569 2942 9715";

  // set service default
  useEffect(() => {
    if (serviceId) return;
    if (services.length === 0) return;

    if (preselectedServiceId && services.some((s) => s.id === preselectedServiceId)) {
      setServiceId(preselectedServiceId);
      return;
    }

    setServiceId(services[0]!.id);
  }, [services, serviceId, preselectedServiceId]);

  // reset slot when filters change
  useEffect(() => {
    setSelectedSlot("");
  }, [selectedBarberId, serviceId, day]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === serviceId) || null;
  }, [services, serviceId]);

  const selectedBarber = useMemo(() => {
    return barbers.find((b) => b.id === selectedBarberId) || null;
  }, [barbers, selectedBarberId]);

  // load availability slots
  useEffect(() => {
    let alive = true;

    async function run() {
      if (!selectedBarberId || !day) {
        if (alive) setSlots([]);
        return;
      }

      setLoadingSlots(true);
      setSlotsError(null);

      try {
        const url = apiUrl(
          `/availability?barber_id=${encodeURIComponent(selectedBarberId)}&day=${encodeURIComponent(
            day
          )}&service_minutes=${encodeURIComponent(String(serviceMinutes))}`
        );

        const r = await fetch(url, { cache: "no-store" });
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

        const list = Array.isArray(j?.slots) ? (j.slots as string[]) : [];
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
  }, [selectedBarberId, day, serviceMinutes, slotsRefreshKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedBarberId) return setError("Selecciona un barbero.");
    if (!serviceId) return setError("Selecciona un servicio.");
    if (!day) return setError("Selecciona un día.");
    if (!selectedSlot) return setError("Selecciona un horario disponible.");
    if (clientName.trim().length < 2) return setError("Nombre muy corto.");

    const phoneDigits = clientPhone.trim().replace(/[^\d]/g, "");
    const phoneOk = phoneDigits.length >= 8;
    const emailOk = isValidEmail(clientEmail);

    if (!phoneOk && !emailOk) {
      return setError("Ingresa WhatsApp o correo (uno de los dos).");
    }

    setLoadingCreate(true);
    try {
      const payload = {
        barber_id: selectedBarberId,
        service_id: serviceId,
        client_name: clientName.trim(),
        client_phone: phoneOk ? clientPhone.trim() : null,
        client_email: emailOk ? clientEmail.trim() : null,
        start_time: selectedSlot,
      };

      const r = await fetch(apiUrl(`/bookings`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await r.json().catch(() => null);
      if (!r.ok) throw new Error(j?.detail || `Error ${r.status}`);

      // ✅ Mensaje de confirmación (por ahora: se abre WhatsApp del cliente si dejó teléfono)
      // (NOTA: envío automático real se hace en backend, después lo hacemos)
      const barberName = selectedBarber?.name || "OsoBarber";
      const serviceName = selectedService?.name || "servicio";
      const hhmm = formatTime(selectedSlot);

      const msg = `Hola ${clientName.trim()} 👋\n\nGracias por agendar con OsoBarber. Tu reserva quedó confirmada ✅\n\n• Servicio: ${serviceName}\n• Barbero: ${barberName}\n• Día: ${day}\n• Hora: ${hhmm}\n\nSi necesitas cambiar la hora, escríbenos:\n📧 ${BUSINESS_EMAIL}\n📱 ${BUSINESS_WA_DISPLAY}\n\nOsoBarber • San Bernardo`;

      // Limpia inputs
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setSelectedSlot("");

      setSlotsRefreshKey((k) => k + 1);
      onCreated?.();

      // Si el cliente puso WhatsApp, abrimos wa.me con el mensaje listo (1 click)
      if (phoneOk) {
        window.open(waLink(clientPhone, msg), "_blank", "noopener,noreferrer");
      } else {
        // Si solo puso correo, mostramos mensaje en pantalla (por ahora)
        // (luego el backend enviará el email automático)
        alert("Reserva creada ✅\n\nTe llegará un correo de confirmación (lo activamos en backend en el siguiente paso).");
      }
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la reserva.");
    } finally {
      setLoadingCreate(false);
    }
  }

  const slotEmptyText = useMemo(() => {
    if (!selectedBarberId || !serviceId || !day) return "Elige barbero, servicio y día para ver horas.";
    if (loadingSlots) return "Cargando horarios…";
    if (slotsError) return `Error: ${slotsError}`;
    if (slots.length === 0) return "No hay horas disponibles para ese día.";
    return "";
  }, [selectedBarberId, serviceId, day, loadingSlots, slotsError, slots.length]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <h2 className="text-xl font-semibold">Reservar hora</h2>
      <p className="mt-1 text-sm text-white/60">
        Elige barbero, servicio, día y luego una hora disponible.
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

          {/* Duración oculta a propósito */}
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Día</label>
          <input
            type="date"
            value={day}
            onChange={(e) => onDayChange(e.target.value)}
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
          />
        </div>

        <div className="mt-1 rounded-3xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Horas disponibles</div>
              <div className="text-xs text-white/60">
                {day} {loadingSlots ? "• cargando…" : slots.length ? `• ${slots.length} slots` : ""}
              </div>
            </div>

            {selectedSlot ? (
              <div className="text-xs text-white/60">
                Seleccionado:{" "}
                <span className="rounded-xl border border-white/10 bg-white/5 px-2.5 py-1 text-white">
                  {formatTime(selectedSlot)}
                </span>
              </div>
            ) : null}
          </div>

          {slotEmptyText ? (
            <div className="mt-3 text-sm text-white/60">{slotEmptyText}</div>
          ) : (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((start) => {
                const active = selectedSlot === start;
                return (
                  <button
                    key={start}
                    type="button"
                    onClick={() => setSelectedSlot(start)}
                    className={[
                      "h-10 rounded-2xl border px-2 text-sm font-semibold transition",
                      active
                        ? "border-white/40 bg-white text-black"
                        : "border-white/10 bg-white/5 text-white/80 hover:border-white/25 hover:bg-white/10 hover:text-white",
                    ].join(" ")}
                    title={start}
                  >
                    {formatTime(start)}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">Nombre</label>
          <input
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Ej: Sebastián"
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">
            WhatsApp (opcional) <span className="text-white/40">— deja esto o correo</span>
          </label>
          <input
            value={clientPhone}
            onChange={(e) => setClientPhone(e.target.value)}
            placeholder="Ej: +569 1234 5678"
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-white/70">
            Correo (opcional) <span className="text-white/40">— deja esto o WhatsApp</span>
          </label>
          <input
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
            placeholder="Ej: cliente@gmail.com"
            className="h-11 rounded-2xl border border-white/10 bg-black/40 px-3 text-white outline-none focus:border-white/30"
          />
        </div>

        <div className="text-xs text-white/50">
          Si necesitas ayuda, escríbenos:{" "}
          <span className="text-white/70">{BUSINESS_EMAIL}</span> •{" "}
          <span className="text-white/70">{BUSINESS_WA_DISPLAY}</span>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loadingCreate}
          className="mt-2 h-12 rounded-2xl bg-white text-black font-semibold transition hover:bg-white/90 disabled:opacity-60"
        >
          {loadingCreate ? "Reservando…" : "Reservar"}
        </button>

        <div className="text-xs text-white/50">
          Después de reservar: si el cliente dejó WhatsApp, se abre el mensaje listo para enviar. (En el siguiente paso lo
          dejamos automático desde backend.)
        </div>
      </form>
    </section>
  );
}
