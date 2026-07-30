import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        marginTop: "auto",
        padding: "15px 0",
        background: "#fafafa",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          textAlign: "center",
        }}
      >
        <Link href="/terms" className="text-muted text-small" style={{ textDecoration: "none" }}>
          Terms &amp; Conditions
        </Link>
        <span className="text-muted text-small">|</span>
        <Link href="/privacy-policy" className="text-muted text-small" style={{ textDecoration: "none" }}>
          Privacy Policy
        </Link>
        <span className="text-muted text-small">|</span>
        <span className="text-muted text-small">
          &copy; {2026} Duty Locum. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
