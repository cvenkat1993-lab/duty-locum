import type { Metadata } from "next";
import BlogPostLayout from "@/components/BlogPostLayout";

const SLUG = "5-mistakes-hospitals-make-when-hiring-doctors";

export const metadata: Metadata = {
  title: "5 Mistakes Hospitals Make When Hiring Doctors | Duty Locum",
  description:
    "From vague job postings to slow response times, small mistakes in the hiring process can cost hospitals their best candidates. Here's what to fix first.",
};

export default function BlogPost() {
  return (
    <BlogPostLayout
      slug={SLUG}
      title="5 Mistakes Hospitals Make When Hiring Doctors (and How to Avoid Them)"
      heroImage="/blog-images/hiring-mistakes.png"
      heroImageAlt="Hospital HR team reviewing candidate applications"
      date="25 July 2026"
      author="Duty Locum Team"
    >
      <p>
        Hiring doctors is a very different process from most other recruitment — candidates are in
        high demand, timelines are often tight, and a slow or unclear process can quietly cost a
        hospital its best applicants. Here are five common mistakes, and simple ways to fix each
        one.
      </p>

      <h2>1. Vague job descriptions</h2>
      <p>
        A posting that just says "Doctor needed" without specifying department, shift pattern,
        seniority level, or compensation range gets far fewer quality applications. Doctors filter
        aggressively when browsing listings — the more specific your posting, the more likely it is
        to reach candidates who are actually a fit.
      </p>

      <h2>2. Slow response times</h2>
      <p>
        Good candidates, especially for locum and short-term roles, are often considering multiple
        opportunities at once. Taking several days to review an application or schedule an
        interview means you risk losing strong candidates to a faster-moving hospital or clinic.
      </p>

      <h2>3. Not verifying availability before extending an offer</h2>
      <p>
        Reaching out to confirm actual availability early in the process — rather than after
        finalizing a decision — saves time on both sides and avoids the frustration of an offer
        that doesn't match the doctor's schedule.
      </p>

      <h2>4. Overlooking specialty-specific screening</h2>
      <p>
        A generic hiring process treats every application the same way, regardless of specialty.
        Department-specific screening — even a short, relevant set of questions — helps hospitals
        quickly identify candidates whose actual experience matches what the role requires.
      </p>

      <h2>5. Inconsistent communication after applying</h2>
      <p>
        Candidates who apply and hear nothing back — not even a rejection — are less likely to
        apply to that hospital again, and may share that experience with colleagues. Even a brief
        status update goes a long way toward building a hospital's reputation among doctors.
      </p>

      <p>
        Post a job on Duty Locum and reach doctors across India who are actively searching by
        specialty, department, and location.
      </p>
    </BlogPostLayout>
  );
}
