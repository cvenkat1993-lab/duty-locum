"use client";

import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 900 }}>
        <div className="card">
          <h1 style={{ marginBottom: 24 }}>About Us</h1>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Our Mission</h2>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            We are dedicated to connecting talented medical professionals with healthcare institutions across India. 
            Our platform simplifies the job search process for doctors while helping hospitals find the right candidates quickly and efficiently.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Who We Are</h2>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Doctor Jobs is a specialized recruitment platform built specifically for the Indian healthcare sector. 
            We understand the unique challenges faced by both medical professionals seeking opportunities and 
            healthcare institutions looking to hire qualified doctors.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>What We Offer</h2>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Our platform provides a comprehensive solution for medical recruitment, including:
          </p>
          <ul style={{ lineHeight: 1.8, color: "#333", marginTop: 12 }}>
            <li>Direct connection between doctors and hospitals</li>
            <li>Verified job listings from reputable healthcare institutions</li>
            <li>Easy application process with profile management</li>
            <li>Locum and permanent position opportunities</li>
            <li>Location-based job search across India</li>
            <li>Secure and private communication</li>
          </ul>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Our Commitment</h2>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            We are committed to maintaining the highest standards of professionalism, privacy, and transparency. 
            Your personal information is protected, and we ensure that all opportunities listed on our platform 
            are from legitimate healthcare providers.
          </p>

          <h2 style={{ marginTop: 32, marginBottom: 16 }}>Contact Us</h2>
          <p style={{ lineHeight: 1.6, color: "#333" }}>
            Have questions or feedback? We'd love to hear from you. Please visit our{" "}
            <a href="/feedback" style={{ color: "var(--primary)", textDecoration: "underline" }}>
              Feedback
            </a>{" "}
            page to get in touch.
          </p>
        </div>
      </div>
    </div>
  );
}
