export interface BlogPost {
  /** Must match the folder name under app/blog/ exactly, e.g. "app/blog/my-post/page.tsx" -> slug: "my-post" */
  slug: string;
  title: string;
  /** 1-2 sentence teaser shown on the blog index card */
  excerpt: string;
  /** Path under /public (e.g. "/blog-images/my-post.jpg") or a full https:// image URL */
  thumbnail: string;
  /** Display date, e.g. "2 August 2026" */
  date: string;
  author?: string;
  tag?: string;
}

// ─────────────────────────────────────────────────────────────
// Add a new entry here every time you publish a new blog post.
// Newest post first — the list is shown in this exact order on
// /blog and is also what "Next Blog" cycles through at the
// bottom of each post.
// ─────────────────────────────────────────────────────────────
export const blogPosts: BlogPost[] = [
  {
    slug: "how-to-find-locum-doctor-jobs-in-india",
    title: "How to Find Locum Doctor Jobs in India: A Practical Guide",
    excerpt:
      "Locum work can be a great way to earn extra income, explore new cities, or transition between full-time roles. Here's how to actually find good locum opportunities.",
    thumbnail: "/blog-images/locum-guide.png",
    date: "1 August 2026",
    author: "Duty Locum Team",
    tag: "Career Tips",
  },
  {
    slug: "5-mistakes-hospitals-make-when-hiring-doctors",
    title: "5 Mistakes Hospitals Make When Hiring Doctors (and How to Avoid Them)",
    excerpt:
      "From vague job postings to slow response times, small mistakes in the hiring process can cost hospitals their best candidates. Here's what to fix first.",
    thumbnail: "/blog-images/hiring-mistakes.png",
    date: "25 July 2026",
    author: "Duty Locum Team",
    tag: "For Hospitals",
  },
];
