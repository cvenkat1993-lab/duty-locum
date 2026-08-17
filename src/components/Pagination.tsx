"use client";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isMobile = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: isMobile ? 8 : 12,
        marginTop: 24,
        flexWrap: "wrap",
      }}
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn btn-secondary"
        style={{
          opacity: currentPage === 1 ? 0.5 : 1,
          fontSize: isMobile ? 13 : 14,
          padding: isMobile ? "6px 12px" : "8px 16px",
        }}
      >
        {isMobile ? "←" : "← Previous"}
      </button>

      <div style={{ display: "flex", gap: 6 }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
          if (
            page === 1 ||
            page === totalPages ||
            (page >= currentPage - 1 && page <= currentPage + 1)
          ) {
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`btn ${page === currentPage ? "btn-primary" : "btn-secondary"}`}
                style={{
                  minWidth: isMobile ? 32 : 36,
                  fontSize: isMobile ? 13 : 14,
                  padding: isMobile ? "6px 8px" : "8px 12px",
                }}
              >
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return (
              <span key={page} style={{ padding: "6px 4px", color: "#999" }}>
                ...
              </span>
            );
          }
          return null;
        })}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn btn-secondary"
        style={{
          opacity: currentPage === totalPages ? 0.5 : 1,
          fontSize: isMobile ? 13 : 14,
          padding: isMobile ? "6px 12px" : "8px 16px",
        }}
      >
        {isMobile ? "→" : "Next →"}
      </button>
    </div>
  );
}
