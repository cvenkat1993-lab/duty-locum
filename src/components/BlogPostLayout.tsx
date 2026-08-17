import Link from "next/link";
import Header from "@/components/Header";
import { blogPosts } from "@/data/blogPosts";

export interface BlogReference {
  label: string;
  url: string;
}

interface BlogPostLayoutProps {
  /** Must exactly match this post's `slug` in data/blogPosts.ts */
  slug: string;
  title: string;
  heroImage: string;
  heroImageAlt?: string;
  date: string;
  author?: string;
  /** Main body content — use <h2>/<h3> for subheads, <p> for paragraphs */
  children: React.ReactNode;
  /** Optional "References" section rendered at the bottom, before Next Blog */
  references?: BlogReference[];
}

export default function BlogPostLayout({
  slug,
  title,
  heroImage,
  heroImageAlt,
  date,
  author,
  children,
  references,
}: BlogPostLayoutProps) {
  const currentIndex = blogPosts.findIndex((p) => p.slug === slug);
  const nextPost =
    currentIndex !== -1 ? blogPosts[(currentIndex + 1) % blogPosts.length] : undefined;

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ maxWidth: 820, paddingTop: 40, paddingBottom: 60 }}>
        {/* ---------- Back to blog ---------- */}
        <Link
          href="/blog"
          className="text-muted text-small"
          style={{ textDecoration: "none", display: "inline-block", marginBottom: 20 }}
        >
          ← Back to Blog
        </Link>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {/* ---------- TITLE PLACEHOLDER ---------- */}
          <div style={{ padding: "32px 36px 0 36px" }}>
            <h1 style={{ marginBottom: 8 }}>{title}</h1>
            <p className="text-muted text-small" style={{ marginBottom: 24 }}>
              {date}
              {author ? ` · ${author}` : ""}
            </p>
          </div>

          {/* ---------- HERO IMAGE (single image) ---------- */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={heroImageAlt || title}
            style={{ width: "100%", maxHeight: 420, objectFit: "cover", display: "block" }}
          />

          {/* ---------- CONTENT PLACEHOLDER ---------- */}
          <div className="blog-content" style={{ padding: "32px 36px", lineHeight: 1.7 }}>
            {children}

            {/* ---------- REFERENCE LINKS ---------- */}
            {references && references.length > 0 && (
              <div style={{ marginTop: 36, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
                <h3 style={{ marginBottom: 12 }}>References</h3>
                <ul>
                  {references.map((ref) => (
                    <li key={ref.url}>
                      <a href={ref.url} target="_blank" rel="noopener noreferrer">
                        {ref.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ---------- NEXT BLOG ---------- */}
        {nextPost && (
          <Link
            href={`/blog/${nextPost.slug}`}
            className="card"
            style={{
              display: "block",
              textDecoration: "none",
              color: "inherit",
              marginTop: 24,
              padding: 20,
            }}
          >
            <p className="text-muted text-small" style={{ marginBottom: 6 }}>
              Next Blog →
            </p>
            <h3 style={{ margin: 0 }}>{nextPost.title}</h3>
          </Link>
        )}
      </div>
    </div>
  );
}
