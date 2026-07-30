import Header from "@/components/Header";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

/**
 * Shared layout for static/legal pages (Privacy Policy, Terms & Conditions,
 * and any future pages like Refund Policy, About, etc.)
 *
 * - Header is rendered here (already includes the mobile hamburger menu).
 * - Footer is NOT rendered here — it's already global via app/layout.tsx,
 *   so it will appear automatically on every page including this one.
 * - Just pass a `title` and put your content as children.
 */
export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ maxWidth: 820, paddingTop: 40, paddingBottom: 60 }}>
        <div className="card" style={{ padding: "32px 36px", lineHeight: 1.7 }}>
          {/* ---------- TITLE PLACEHOLDER ---------- */}
          <h1 style={{ marginBottom: 4 }}>{title}</h1>

          {lastUpdated && (
            <p className="text-muted text-small" style={{ marginBottom: 28 }}>
              Last updated: {lastUpdated}
            </p>
          )}

          {/* ---------- CONTENT PLACEHOLDER ---------- */}
          {children}
        </div>
      </div>
    </div>
  );
}
