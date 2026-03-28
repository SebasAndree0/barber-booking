import { Suspense } from "react";
import BookingClient from "./BookingClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white/70">Cargando…</div>}>
      <BookingClient />
    </Suspense>
  );
}
