// ============================================================
// FILE: src/components/PostedByBadge.tsx
// NEW FILE — shared badge shown on job cards
// ============================================================

interface Props {
  label?: string;
  size?: "sm" | "md";
}

const DOCTOR_COLOR = { bg: "#e8f4fd", border: "#90caf9", text: "#1565c0" };
const OTHER_COLOR  = { bg: "#f3e8fd", border: "#ce93d8", text: "#6a1b9a" };

export default function PostedByBadge({ label = "Doctor", size = "sm" }: Props) {
  const isDoctor = label === "Doctor";
  const colors = isDoctor ? DOCTOR_COLOR : OTHER_COLOR;
  const fontSize = size === "sm" ? 11 : 13;
  const text = isDoctor ? "Posted by Doctor" : "Posted by Non-Doctor";

  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: colors.bg, border: `1px solid ${colors.border}`,
      borderRadius: 20, padding: size === "sm" ? "2px 10px" : "4px 12px",
      fontSize, color: colors.text, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {text}
    </span>
  );
}
