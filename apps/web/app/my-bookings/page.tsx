import { Suspense } from "react";
import MyBookingsClient from "./MyBookingsClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <MyBookingsClient />
    </Suspense>
  );
}
