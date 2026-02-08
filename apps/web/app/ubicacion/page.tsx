// apps/web/app/ubicacion/page.tsx
type FeaturedReview = {
  name: string;
  rating: number; // 1-5
  text: string;
};

type Settings = {
  google_maps_embed_url?: string | null;
  instagram_url?: string | null;
  tiktok_url?: string | null;
  whatsapp?: string | null;
  address?: string | null;

  // ✅ reseñas manuales
  featured_reviews?: FeaturedReview[] | null;
  featured_rating?: number | null; // ej 5.0
  featured_reviews_count?: number | null; // ej 3
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  "http://127.0.0.1:8001";

async function getSettings(): Promise<Settings> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/settings`, { cache: "no-store" });
    if (!res.ok) return {};
    return res.json();
  } catch {
    return {};
  }
}

const FALLBACK_EMBED =
  "https://www.google.com/maps?q=-33.6008121,-70.6761009&z=18&output=embed";

const FALLBACK_OPEN_MAPS =
  "https://www.google.com/maps/place/Oso+Barber/@-33.6008121,-70.6761009,18z/data=!4m6!3m5!1s0x9662d9c324f4f041:0x7b96537f050448bc!8m2!3d-33.6008098!4d-70.6759579!16s%2Fg%2F11yy_v317y?entry=ttu";

export default async function UbicacionPage() {
  const s = await getSettings();

  const embed = s.google_maps_embed_url?.trim() || FALLBACK_EMBED;
  const address = s.address?.trim() || "Magdalena Petit 15241, San Bernardo";

  // ✅ Instagram correcto (tu link)
  const ig =
    s.instagram_url?.trim() ||
    "https://www.instagram.com/osobarberr_?igsh=bG9uaGxzYnkxOXF0";

  const tt = s.tiktok_url?.trim() || "https://tiktok.com/@oso.barber.cl";

  const rating = s.featured_rating ?? 5.0;
  const total = s.featured_reviews_count ?? (s.featured_reviews?.length ?? 0);
  const reviews = (s.featured_reviews ?? []).slice(0, 3);

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
        Ubicación — OsoBarber
      </h1>

      <p style={{ opacity: 0.85, marginBottom: 16 }}>{address}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* MAPA */}
        <section
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <iframe
            title="Google Maps OsoBarber"
            src={embed}
            width="100%"
            height="520"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            style={{ border: 0, display: "block" }}
            allowFullScreen
          />
        </section>

        {/* INFO + RESEÑAS */}
        <aside
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 14,
            padding: 16,
            background: "rgba(255,255,255,0.04)",
            minHeight: 520,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: "#fff" }}>
            Reseñas y redes
          </h2>

          <p style={{ opacity: 0.85, marginBottom: 14, color: "#fff" }}>
            Revisa la ubicación y las reseñas (esto sube la confianza y la conversión).
          </p>

          {/* BOTONES */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a
              href={FALLBACK_OPEN_MAPS}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.28)",
                textAlign: "center",
                fontWeight: 800,
                textDecoration: "none",
                color: "#fff",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              Abrir en Google Maps
            </a>

            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                textAlign: "center",
                fontWeight: 800,
                textDecoration: "none",
                color: "#fff",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              Instagram
            </a>

            <a
              href={tt}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                textAlign: "center",
                fontWeight: 800,
                textDecoration: "none",
                color: "#fff",
                background: "rgba(255,255,255,0.04)",
              }}
            >
              TikTok
            </a>
          </div>

          {/* RESEÑAS MANUALES */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontWeight: 900, marginBottom: 10, color: "#fff" }}>
              ⭐ {rating.toFixed(1)} ({total} reseñas)
            </div>

            {reviews.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reviews.map((rv, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      padding: 12,
                      background: "rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 6, color: "#fff" }}>
                      {rv.name} — ⭐ {rv.rating}
                    </div>
                    <div style={{ opacity: 0.9, lineHeight: 1.4, color: "#fff" }}>
                      {rv.text}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, opacity: 0.85, color: "#fff" }}>
                Aún no hay reseñas destacadas. Agrégalas por settings (PATCH) y se verán aquí.
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
