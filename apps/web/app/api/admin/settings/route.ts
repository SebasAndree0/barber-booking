import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL; // http://127.0.0.1:8001/api/v1
const ADMIN_KEY = process.env.ADMIN_API_KEY;

export async function GET() {
  if (!API_BASE) return NextResponse.json({ detail: "NEXT_PUBLIC_API_URL missing" }, { status: 500 });

  const r = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
  const j = await r.json().catch(() => null);
  return NextResponse.json(j, { status: r.status });
}

export async function PATCH(req: Request) {
  if (!API_BASE) return NextResponse.json({ detail: "NEXT_PUBLIC_API_URL missing" }, { status: 500 });
  if (!ADMIN_KEY) return NextResponse.json({ detail: "ADMIN_API_KEY missing" }, { status: 500 });

  const body = await req.json().catch(() => ({}));

  const r = await fetch(`${API_BASE}/settings`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": ADMIN_KEY,
    },
    body: JSON.stringify(body),
  });

  const j = await r.json().catch(() => null);
  return NextResponse.json(j, { status: r.status });
}
