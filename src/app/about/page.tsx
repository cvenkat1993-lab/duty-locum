// Server Component — no "use client"
// Pillar 4: Rich factual prose for AI search (GEO).
// AI crawlers like ChatGPT, Claude, Perplexity read this to answer
// queries like "what is Doctor Jobs" or "where can I find locum doctor jobs in India".

import { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "About Us | Duty Locum - Doctor Jobs — Connecting Doctors with Hospitals in India",
  description:
    "Duty Locum - Doctor Jobs is India's dedicated medical recruitment platform connecting doctors with hospitals, clinics, and nursing homes. Free for doctors. No placement fees. Apply directly.",
  openGraph: {
    title: "About Duty Locum Doctor Jobs - Doctor Jobs — India's Medical Recruitment Platform",
    description:
      "We connect doctors with hospitals across India. Find full-time, part-time, and locum opportunities or post jobs for your healthcare institution.",
  },
};

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 900 }}>
        <div className="card">
          <h1 style={{ marginBottom: 8 }}>About Duty Locum - Doctor Jobs</h1>
          <p style={{ color: "#666", fontSize: 16, marginBottom: 32 }}>
            India's dedicated platform for medical recruitment — connecting doctors directly
            with hospitals, clinics, and nursing homes across India.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>What is Duty Locum - Doctor Jobs?</h2>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            Duty Locum - Doctor Jobs is a free online platform that connects medical professionals with
            healthcare institutions across India. Doctors can search and apply for full-time,
            part-time, locum, contract, and visiting positions at hospitals, clinics, nursing
            homes, and diagnostic centres. Hospitals and recruiters can post vacancies and
            receive applications directly — with no placement agency or middleman involved.
          </p>
          <p style={{ lineHeight: 1.7, color: "#333", marginTop: 12 }}>
            The platform was built specifically for the Indian healthcare sector, where finding
            qualified doctors quickly is a recurring challenge for institutions, and where
            doctors — especially those at early career stages — often lack a direct and
            transparent channel to find suitable opportunities.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Our Mission</h2>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            Our mission is to make medical hiring in India simple, transparent, and direct.
            We remove placement fees, cut out intermediaries, and give both doctors and
            hospitals a straightforward way to connect. Every job listing on Duty Locum
            includes the hospital name, department, work type, and location — so doctors
            can make informed decisions before they apply.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Who Uses Duty Locum - Doctor Jobs?</h2>

          <h3 style={{ fontSize: 17, marginBottom: 10, marginTop: 20 }}>Doctors and Medical Professionals</h3>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            Doctors at every stage of their career use Duty Locum to find opportunities.
            Fresh MBBS graduates looking for house surgeon or internship positions, junior
            residents seeking their first independent posting, postgraduate students searching
            for senior resident or SR roles, and experienced consultants or specialists looking
            to move institutions or take on part-time or locum work alongside their primary job.
          </p>
          <p style={{ lineHeight: 1.7, color: "#333", marginTop: 10 }}>
            Doctors create a profile once — with their education, current job title, specialty,
            institution, and phone number — and then apply to any job with a single click.
            Phone numbers are only shared with recruiters after an application is accepted,
            protecting doctor privacy.
          </p>

          <h3 style={{ fontSize: 17, marginBottom: 10, marginTop: 20 }}>Hospitals, Clinics, and Recruiters</h3>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            Hospitals, clinics, nursing homes, and diagnostic centres use Duty Locum - Doctor Jobs to post
            vacancies and find doctors quickly. Recruiters post a job with the role title,
            department, work type, payscale, and required date. The hospital location and
            pincode are auto-detected from Google Places. Applications arrive with the
            candidate's complete profile — qualification, current role, institution, specialty,
            and experience — so recruiters can shortlist without any back-and-forth.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>What Makes Duty Locum - Doctor Jobs Different?</h2>
          <ul style={{ lineHeight: 1.9, color: "#333", paddingLeft: 20 }}>
            <li>
              <strong>No placement fees.</strong> Doctors apply for free. Hospitals post for free.
              There are no subscription plans or commissions.
            </li>
            <li>
              <strong>Direct hiring.</strong> Doctors and hospitals connect directly — no agency
              in the middle taking a cut or slowing down the process.
            </li>
            <li>
              <strong>Privacy by design.</strong> A doctor's phone number is only revealed to a
              recruiter after the application is explicitly accepted — preventing spam and
              unsolicited calls.
            </li>
            <li>
              <strong>Location-first search.</strong> Doctors can search for jobs within 10 km
              of any location in India using the map-based search, or browse by pincode and city.
            </li>
            <li>
              <strong>Locum and permanent listings side by side.</strong> Both short-term locum
              duties and permanent positions are listed together, giving doctors flexible options.
            </li>
            <li>
              <strong>Complete applicant profiles.</strong> Recruiters see full candidate details
              — education, specialty, current institution, and experience — before deciding to
              accept, so they are not hiring blindly.
            </li>
          </ul>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Cities and Coverage</h2>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            Duty Locum lists medical positions across India. Current job listings are available
            in Chennai, Mumbai, Bangalore, Hyderabad, Delhi NCR, Pune, Kolkata, Ahmedabad,
            Coimbatore, Kochi, and many other cities and towns. The platform is available
            nationwide — any hospital in any city can post a job, and any doctor in India
            can apply.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
            {["Chennai", "Mumbai", "Bangalore", "Hyderabad", "Delhi", "Pune", "Kolkata", "Ahmedabad", "Coimbatore", "Kochi"].map((city) => (
              <a
                key={city}
                href={`/doctor-jobs-in/${city.toLowerCase()}`}
                style={{
                  padding: "6px 14px",
                  background: "#f0f7ff",
                  border: "1px solid #d0e7ff",
                  borderRadius: 20,
                  fontSize: 13,
                  color: "var(--primary)",
                  textDecoration: "none",
                }}
              >
                {city}
              </a>
            ))}
          </div>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Our Commitment</h2>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            We are committed to maintaining professionalism, privacy, and transparency on the
            platform. All job listings are posted by registered users. Doctor profiles are only
            shared with recruiters when an application is submitted. We do not sell user data
            or contact details to third parties.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Contact Us</h2>
          <p style={{ lineHeight: 1.7, color: "#333" }}>
            Have questions, suggestions, or want to report an issue? Visit our{" "}
            <a href="/feedback" style={{ color: "var(--primary)", textDecoration: "underline" }}>
              Feedback
            </a>{" "}
            page. We review all messages within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
}
