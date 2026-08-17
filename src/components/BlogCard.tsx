import Link from "next/link";
import { BlogPost } from "@/data/blogPosts";

export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card"
      style={{
        display: "block",
        textDecoration: "none",
        color: "inherit",
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          background: "#f0f0f0",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.thumbnail}
          alt={post.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: 20 }}>
        {post.tag && (
          <span
            className="badge"
            style={{ background: "#e3f2fd", color: "var(--primary)", marginBottom: 10 }}
          >
            {post.tag}
          </span>
        )}

        <h3 style={{ marginTop: 10, marginBottom: 8, lineHeight: 1.35 }}>{post.title}</h3>

        <p className="text-muted text-small" style={{ marginBottom: 12 }}>
          {post.excerpt}
        </p>

        <p className="text-muted text-small" style={{ margin: 0 }}>
          {post.date}
          {post.author ? ` · ${post.author}` : ""}
        </p>
      </div>
    </Link>
  );
}
