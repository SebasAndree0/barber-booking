import { Suspense } from "react";
import MyBookingsClient from "./MyBookingsClient";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const name = typeof searchParams?.name === "string" ? searchParams.name : "";
  const autosearch = typeof searchParams?.autosearch === "string" ? searchParams.autosearch : "";

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <MyBookingsClient initialName={name} initialAutosearch={autosearch} />
    </Suspense>
  );
}
