import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppHeader from "./components/AppHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/* ---------------- Pro icons (SVG) ---------------- */

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8.5 3h7A5.5 5.5 0 0 1 21 8.5v7A5.5 5.5 0 0 1 15.5 21h-7A5.5 5.5 0 0 1 3 15.5v-7A5.5 5.5 0 0 1 8.5 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M12 16.2A4.2 4.2 0 1 0 12 7.8a4.2 4.2 0 0 0 0 8.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M17.2 7.2h.01" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function IconTikTok(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M14 3v11.2a3.8 3.8 0 1 1-2-3.36V7.2c2.2 2.2 4.4 3 7 3V7.7c-1.9 0-3.6-.7-5-2.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 12.2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function IconWhatsApp(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M20 11.7A8 8 0 1 1 11.7 4a8 8 0 0 1 8.3 7.7Z" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.5 19.5 8.6 17a7.9 7.9 0 0 0 3.1.6 7.8 7.8 0 0 0 7.8-7.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M10.2 9.2c-.3.5-.3 1.2.1 1.9.6 1 1.8 2.3 3 2.9.7.4 1.4.4 1.9.1l.7-.5c.3-.2.8-.2 1.1 0l1 .7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPhone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M8.2 3.8h2.2c.6 0 1.1.4 1.2 1l.6 2.4c.1.5-.1 1-.6 1.3l-1 .6c.7 1.4 1.8 2.8 3 4c1.2 1.2 2.6 2.3 4 3l.6-1c.3-.5.8-.7 1.3-.6l2.4.6c.6.1 1 .6 1 1.2v2.2c0 .7-.6 1.3-1.3 1.3C12 21.8 2.2 12 2.2 5.1c0-.7.6-1.3 1.3-1.3h2.2c.6 0 1.1.4 1.2 1l.6 2.4c.1.5-.1 1-.6 1.3l-1 .6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------- Metadata ---------------- */

export const metadata: Metadata = {
  title: "Oso Barber - San Bernardo",
  description: "Reserva tu hora online en OsoBarber. Cortes, barba y cejas.",
  verification: {
    google: "R4y1S-CSM8bOxPSa3jvNtKZNJgh_crmTBekPw99VYoQ",
  },
  icons: {
    icon: "/logo-oso.png",
    shortcut: "/logo-oso.png",
    apple: "/logo-oso.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const YEAR = new Date().getFullYear();

  // ✅ links “pro”
  const address = "Magdalena Petit 15241, San Bernardo";
  const mapsLink = "https://www.google.com/maps?q=Magdalena%20Petit%2015241%20San%20Bernardo";
  const waNumber = "56929429715";
  const waLink =
    "https://wa.me/" + waNumber + "?text=" + encodeURIComponent("Hola! Quiero agendar una hora en OsoBarber 🙌");

  const ig = "https://www.instagram.com/osobarberr_?igsh=bG9uaGxzYnkxOXF0";
  const tt = "https://www.tiktok.com/@oso.barber.cl";

  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Fondo global más premium */}
        <div className="min-h-screen text-white bg-[radial-gradient(70%_60%_at_25%_0%,rgba(245,197,24,0.10),transparent_55%),radial-gradient(55%_45%_at_85%_0%,rgba(255,255,255,0.06),transparent_55%),linear-gradient(to_bottom,#000,rgba(9,9,11,1),#000)]">
          {/* NAVBAR */}
          <AppHeader />

          {/* CONTENT */}
          <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>

          {/* FOOTER PRO */}
          <footer className="relative mt-10 border-t border-white/10">
            {/* brillo sutil */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(60%_140%_at_50%_0%,rgba(245,197,24,0.12),transparent_60%)]" />

            <div className="mx-auto max-w-6xl px-6 py-12">
              <div className="grid gap-8 md:grid-cols-3">
                {/* Brand */}
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[rgba(245,197,24,1)] shadow-[0_0_18px_rgba(245,197,24,0.35)]" />
                    <div className="text-base font-semibold tracking-tight">OsoBarber</div>
                  </div>

                  <p className="text-sm text-white/60 leading-relaxed">
                    Barbería en San Bernardo. Reserva online y llega directo a tu hora.
                  </p>

                  {/* CTA mini */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-extrabold text-black hover:bg-white/90 transition shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
                    >
                      <IconWhatsApp className="h-5 w-5" />
                      WhatsApp
                    </a>
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                    >
                      <IconPin className="h-5 w-5 text-[rgba(245,197,24,0.9)]" />
                      Ver ubicación
                    </a>
                  </div>
                </div>

                {/* Horario */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold tracking-wide text-white/90">Horario</div>
                  <ul className="space-y-1.5 text-sm text-white/60">
                    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span>Lun–Vie</span>
                      <span className="text-white/75 font-semibold">19:00 – 22:00</span>
                    </li>
                    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span>Sábado</span>
                      <span className="text-white/75 font-semibold">10:00 – 22:00</span>
                    </li>
                    <li className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                      <span>Domingo</span>
                      <span className="text-white/75 font-semibold">10:00 – 21:00</span>
                    </li>
                  </ul>
                </div>

                {/* Contacto + Redes */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold tracking-wide text-white/90">Contacto</div>

                  <div className="space-y-2">
                    <a
                      href={mapsLink}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 hover:bg-white/10 transition"
                    >
                      <IconPin className="mt-0.5 h-5 w-5 text-[rgba(245,197,24,0.9)]" />
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-white/45">Dirección</div>
                        <div className="text-sm font-semibold text-white/85 group-hover:text-white transition">
                          {address}
                        </div>
                      </div>
                    </a>

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 hover:bg-white/10 transition"
                    >
                      <IconPhone className="mt-0.5 h-5 w-5 text-[rgba(245,197,24,0.9)]" />
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-white/45">WhatsApp</div>
                        <div className="text-sm font-semibold text-white/85 group-hover:text-white transition">
                          +56 9 2942 9715
                        </div>
                      </div>
                    </a>
                  </div>

                  {/* Redes PRO con iconos */}
                  <div className="pt-2">
                    <div className="text-xs uppercase tracking-[0.22em] text-white/45">Redes</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      <a
                        href={ig}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                        aria-label="Instagram OsoBarber"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/40 border border-white/10 text-[rgba(245,197,24,0.95)] group-hover:text-[rgba(245,197,24,1)] transition">
                          <IconInstagram className="h-5 w-5" />
                        </span>
                        Instagram
                      </a>

                      <a
                        href={tt}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition"
                        aria-label="TikTok OsoBarber"
                      >
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-black/40 border border-white/10 text-[rgba(245,197,24,0.95)] group-hover:text-[rgba(245,197,24,1)] transition">
                          <IconTikTok className="h-5 w-5" />
                        </span>
                        TikTok
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* bottom bar */}
              <div className="mt-10 border-t border-white/10 pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-white/50">
                  <span>© {YEAR} OsoBarber</span>
                  <span className="text-white/50">Reservas online • San Bernardo</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
