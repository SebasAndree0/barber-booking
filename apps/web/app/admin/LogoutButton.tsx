"use client";

export default function LogoutButton() {
  return (
    <button
      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 transition"
      onClick={async () => {
        await fetch("/admin/logout", { method: "POST" });
        window.location.href = "/admin/login";
      }}
    >
      Salir
    </button>
  );
}
