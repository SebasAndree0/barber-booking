import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function loginAction(formData: FormData) {
  "use server";

  const pass = String(formData.get("password") || "");
  const adminPass = process.env.ADMIN_PASSWORD || "";
  const cookieName = process.env.ADMIN_COOKIE_NAME || "osobarber_admin";

  if (!adminPass) throw new Error("Falta ADMIN_PASSWORD en web/.env.local");
  if (pass !== adminPass) return;

  const cookieStore = await cookies();
  cookieStore.set(cookieName, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/admin");
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
        <h1 className="text-2xl font-extrabold">Admin</h1>
        <p className="mt-2 text-white/70">Acceso solo para el dueño.</p>

        <form action={loginAction} className="mt-6 grid gap-3">
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            required
            className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 outline-none focus:border-white/25"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-white text-black font-semibold px-4 py-3 hover:bg-white/90 transition"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
