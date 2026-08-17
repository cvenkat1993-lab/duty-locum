"use client";

import { useState } from "react";
import Header from "@/components/Header";
import BlogCard from "@/components/BlogCard";
import Pagination from "@/components/Pagination";
import { blogPosts } from "@/data/blogPosts";

const POSTS_PER_PAGE = 9;

export default function BlogIndexClient() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const startIdx = (currentPage - 1) * POSTS_PER_PAGE;
  const postsForPage = blogPosts.slice(startIdx, startIdx + POSTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <h1 style={{ marginBottom: 8 }}>Duty Locum Blog</h1>
          <p className="text-muted">
            Career tips for doctors, hiring insights for hospitals, and updates from the platform.
          </p>
        </div>

        {blogPosts.length === 0 ? (
          <p className="text-muted text-center">No blog posts published yet — check back soon.</p>
        ) : (
          <>
            <div className="grid-3">
              {postsForPage.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
