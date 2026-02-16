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

export const metadata: Metadata = {
  title: "OsoBarber • San Bernardo",
  description: "Reserva tu hora online en OsoBarber. Cortes, barba y cejas.",
  verification: {
    google: "R4y1S-CSM8bOxPSa3jvNtKZNJgh_crmTBekPw99VYoQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white">
          {/* NAVBAR */}
          <AppHeader />

          {/* CONTENT */}
          <main className="mx-auto w-full max-w-6xl px-6 py-8">{children}</main>

          {/* FOOTER */}
          <footer className="border-t border-white/10">
            <div className="mx-auto grid max-w-6xl gap-6 px-6 py-10 md:grid-cols-3">
              <div>
                <div className="text-base font-semibold">OsoBarber</div>
                <div className="mt-2 text-sm text-white/60">
                  Barbería en San Bernardo. Reserva online y llega directo a tu hora.
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold">Horario</div>
                <ul className="mt-2 space-y-1 text-sm text-white/60">
                  <li>Lun–Vie: 19:00 – 22:00</li>
                  <li>Sábado: 10:00 – 22:00</li>
                  <li>Domingo: 10:00 – 21:00</li>
                </ul>
              </div>

              <div>
                <div className="text-sm font-semibold">Contacto</div>
                <ul className="mt-2 space-y-1 text-sm text-white/60">
                  <li>📍 Magdalena Petit 15241, San Bernardo</li>
                  <li>📞 WhatsApp: +56 9 2942 9715</li>
                  <li className="flex gap-3 pt-2">
                    <a
                      className="text-white/70 hover:text-white underline underline-offset-4"
                      href="https://www.instagram.com/osobarberr_?igsh=bG9uaGxzYnkxOXF0"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Instagram
                    </a>
                    <a
                      className="text-white/70 hover:text-white underline underline-offset-4"
                      href="https://www.tiktok.com/@oso.barber.cl"
                      target="_blank"
                      rel="noreferrer"
                    >
                      TikTok
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 py-4">
              <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-xs text-white/50">
                <span>© {new Date().getFullYear()} OsoBarber</span>
                <span className="text-white/50">Reservas online • San Bernardo</span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
