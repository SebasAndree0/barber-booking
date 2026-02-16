import { Suspense } from "react";
import dynamicImport from "next/dynamic";

export const dynamic = "force-dynamic";

const MyBookingsClient = dynamicImport(() => import("./MyBookingsClient"), {
  ssr: false,
});

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
