import { Suspense } from "react";
import MyBookingsClient from "./MyBookingsClient";

export default function Page({
  searchParams,
}: {
  searchParams?: { name?: string; autosearch?: string };
}) {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <MyBookingsClient
        initialName={searchParams?.name}
        initialAutosearch={searchParams?.autosearch}
      />
    </Suspense>
  );
}
