// ============================================================
// FILE: src/app/doctor-jobs-in/[city]/page.tsx
// NEW FILE — create this
//
// Pillar 5: Location landing pages.
// Each city gets its own SEO-optimised URL, e.g.:
//   /doctor-jobs-in/chennai
//   /doctor-jobs-in/mumbai
//   /doctor-jobs-in/bangalore
//
// The page server-fetches jobs for that city's pincode range,
// renders them as static HTML, and includes JSON-LD schema.
// ============================================================

import { adminDb } from "@/lib/firebase-admin";
import { buildJobSchema } from "@/lib/schema";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import MapPinButton from "@/components/MapPinButton";

// ── City configuration ──────────────────────────────────────
// Add more cities here as your platform grows.
// pincodePrefix: first 3 digits shared by that city's pincodes.
// lat/lng: city centre, used to display in content.
// ────────────────────────────────────────────────────────────
const CITIES: Record<string, {
  name: string;
  state: string;
  pincodePrefix: string[];
  description: string;
  lat: number;
  lng: number;
}> = {
  chennai: {
    name: "Chennai",
    state: "Tamil Nadu",
    pincodePrefix: ["600"],
    description:
      "Chennai is one of India's largest healthcare hubs, home to major hospitals like Apollo, Fortis, MIOT, and Government General Hospital. The city has a high demand for doctors across specialties including cardiology, oncology, orthopaedics, and general medicine.",
    lat: 13.0827,
    lng: 80.2707,
  },
  mumbai: {
    name: "Mumbai",
    state: "Maharashtra",
    pincodePrefix: ["400"],
    description:
      "Mumbai is India's financial capital and a major medical centre with world-class hospitals including Lilavati, Kokilaben, Hinduja, and Tata Memorial. The city offers opportunities across all medical specialties with highly competitive compensation.",
    lat: 19.076,
    lng: 72.8777,
  },
  bangalore: {
    name: "Bangalore",
    state: "Karnataka",
    pincodePrefix: ["560"],
    description:
      "Bangalore is a fast-growing healthcare market with leading institutions like Manipal, Narayana Health, St. John's, and Sakra. The city has strong demand for specialists in neurology, oncology, and paediatrics alongside general medicine roles.",
    lat: 12.9716,
    lng: 77.5946,
  },
  hyderabad: {
    name: "Hyderabad",
    state: "Telangana",
    pincodePrefix: ["500"],
    description:
      "Hyderabad is a rapidly expanding medical hub with hospitals like Care, Yashoda, KIMS, and AIG. The city has growing demand for doctors in gastroenterology, cardiology, and oncology as the healthcare sector expands.",
    lat: 17.385,
    lng: 78.4867,
  },
  delhi: {
    name: "Delhi",
    state: "Delhi NCR",
    pincodePrefix: ["110"],
    description:
      "Delhi NCR is India's largest medical job market with institutions including AIIMS, Medanta, Max Healthcare, and Fortis. The region offers opportunities across all specialties and career levels, from fresh MBBS graduates to senior consultants.",
    lat: 28.6139,
    lng: 77.209,
  },
  pune: {
    name: "Pune",
    state: "Maharashtra",
    pincodePrefix: ["411"],
    description:
      "Pune has a growing healthcare sector with hospitals like Ruby Hall Clinic, Jehangir, Sahyadri, and KEM. The city has demand for doctors in general medicine, surgery, and paediatrics as the population expands rapidly.",
    lat: 18.5204,
    lng: 73.8567,
  },
  kolkata: {
    name: "Kolkata",
    state: "West Bengal",
    pincodePrefix: ["700"],
    description:
      "Kolkata is a major healthcare centre in eastern India with hospitals like AMRI, Fortis, Apollo Gleneagles, and SSKM. The city offers opportunities in both private and government sectors across all medical disciplines.",
    lat: 22.5726,
    lng: 88.3639,
  },
  ahmedabad: {
    name: "Ahmedabad",
    state: "Gujarat",
    pincodePrefix: ["380"],
    description:
      "Ahmedabad has a strong healthcare ecosystem with hospitals like Sterling, HCG, Apollo, and Civil Hospital. The city has growing demand for specialist doctors and general practitioners across private and corporate hospitals.",
    lat: 23.0225,
    lng: 72.5714,
  },
  coimbatore: {
    name: "Coimbatore",
    state: "Tamil Nadu",
    pincodePrefix: ["641"],
    description:
      "Coimbatore is an emerging healthcare hub in Tamil Nadu with hospitals like PSG, KG, GKNM, and Kovai Medical Centre. The city has demand for doctors in general surgery, orthopaedics, and internal medicine.",
    lat: 11.0168,
    lng: 76.9558,
  },
  kochi: {
    name: "Kochi",
    state: "Kerala",
    pincodePrefix: ["682"],
    description:
      "Kochi is Kerala's major commercial and medical hub with hospitals like Aster Medcity, Amrita, Lakeshore, and Medical Trust. The city offers excellent opportunities for doctors seeking positions in a state known for its high healthcare standards.",
    lat: 9.9312,
    lng: 76.2673,
  },
};

// Force server-side rendering at request time — never pre-rendered at build time
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ city: string }>;
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const cityData = CITIES[city.toLowerCase()];

  if (!cityData) return { title: "Duty Locum - Doctor Jobs" };

  return {
    title: `Duty Locum - Doctor Jobs in ${cityData.name} | ${cityData.state} Medical Jobs`,
    description: `Find Duty Locum - Doctor Jobs in ${cityData.name}, ${cityData.state}. Browse full-time, part-time, locum, and contract positions at hospitals and clinics in ${cityData.name}. Apply directly — no placement fees.`,
    openGraph: {
      title: `Duty Locum - Doctor Jobs in ${cityData.name} — ${cityData.state}`,
      description: `Browse medical job openings in ${cityData.name}. Hospitals, clinics, and nursing homes hiring doctors now.`,
    },
  };
}

export default async function CityJobsPage({ params }: Props) {
  const { city } = await params;
  const cityData = CITIES[city.toLowerCase()];

  if (!cityData) notFound();

  // Fetch all jobs, then filter by pincode prefix in memory.
  // (Firestore doesn't support prefix queries on strings without extra indexes.)
  const snapshot = await adminDb
    .collection("jobs")
    .orderBy("createdAt", "desc")
    .get();

  const allJobs: any[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt
        ? { _seconds: data.createdAt._seconds }
        : null,
      requiredDate:
        data.requiredDate && typeof data.requiredDate !== "string"
          ? { _seconds: data.requiredDate._seconds }
          : data.requiredDate ?? null,
      hospGeo: data.hospGeo
        ? {
            lat: data.hospGeo._latitude  ?? data.hospGeo.latitude  ?? data.hospGeo.lat  ?? 0,
            lng: data.hospGeo._longitude ?? data.hospGeo.longitude ?? data.hospGeo.lng ?? 0,
          }
        : null,
    };
  });

  const cityJobs = allJobs.filter((job) =>
    cityData.pincodePrefix.some((prefix) =>
      job.pincode?.toString().startsWith(prefix)
    )
  );

  // Other cities for internal linking (Pillar 4 / GEO)
  const otherCities = Object.entries(CITIES)
    .filter(([slug]) => slug !== city.toLowerCase())
    .slice(0, 6);

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Duty Locum - Doctor Jobs in ${cityData.name}`,
    description: `Medical job listings in ${cityData.name}, ${cityData.state}`,
    numberOfItems: cityJobs.length,
    itemListElement: cityJobs.slice(0, 10).map((job, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: buildJobSchema(job),
    })),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <style>{`
        @media (min-width: 768px) {
          .city-page-grid { grid-template-columns: minmax(0,1fr) 300px !important; gap: 32px !important; }
        }
        .city-sidebar { display: none; }
        @media (min-width: 768px) {
          .city-sidebar { display: flex; }
        }
        .city-mobile-stats { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        @media (min-width: 768px) {
          .city-mobile-stats { display: none; }
        }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <Header />

      <div className="container" style={{ paddingTop: 32, paddingBottom: 60, maxWidth: 900 }}>

        {/* ── Mobile stats strip — visible only on mobile ── */}
        <div className="city-mobile-stats">
          <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
            <strong>{cityJobs.length}</strong> <span style={{ color: "#555" }}>open</span>
          </div>
          <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
            <strong>{cityJobs.filter((j: any) => j.workType === "Full-time").length}</strong> <span style={{ color: "#555" }}>full-time</span>
          </div>
          <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
            <strong>{cityJobs.filter((j: any) => j.workType === "Locum" || j.workType === "Part-time").length}</strong> <span style={{ color: "#555" }}>locum/part</span>
          </div>
        </div>

        {/* ── Hero ── */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 13, color: "#888", marginBottom: 8 }}>
            <a href="/" style={{ color: "#888", textDecoration: "none" }}>Home</a>
            {" › "}
            <a href="/browse-jobs" style={{ color: "#888", textDecoration: "none" }}>Browse Jobs</a>
            {" › "}
            Doctor Jobs in {cityData.name}
          </p>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>
            Doctor Jobs in {cityData.name}
          </h1>
          <p style={{ fontSize: 16, color: "#555", marginBottom: 0 }}>
            {cityJobs.length} open position{cityJobs.length !== 1 ? "s" : ""} at hospitals
            and clinics in {cityData.name}, {cityData.state}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 24 }} className="city-page-grid">

          {/* ── Main Content ── */}
          <div>

            {/* About this city's job market — GEO content */}
            <div className="card" style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, marginBottom: 12 }}>
                Medical Jobs in {cityData.name}
              </h2>
              <p style={{ lineHeight: 1.7, color: "#444" }}>
                {cityData.description}
              </p>
              <p style={{ lineHeight: 1.7, color: "#444", marginTop: 12 }}>
                Duty Locum lists full-time, part-time, locum, and contract positions
                at hospitals, clinics, and nursing homes in {cityData.name}. Doctors can
                apply directly — no placement agencies, no fees. Hospitals post vacancies
                and receive applications with complete candidate profiles including
                education, specialty, and experience.
              </p>
              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/browse-jobs" className="btn btn-primary">
                  Browse All Jobs
                </a>
                <a href="/post-job" className="btn btn-secondary">
                  Post a Job in {cityData.name}
                </a>
              </div>
            </div>

            {/* Job listings */}
            {cityJobs.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 48 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
                <h3>No jobs currently listed in {cityData.name}</h3>
                <p style={{ color: "#666", marginBottom: 20 }}>
                  New jobs are posted daily. Browse all India listings or check back soon.
                </p>
                <a href="/browse-jobs" className="btn btn-primary">
                  Browse All Jobs Across India
                </a>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: 20, marginBottom: 16 }}>
                  Current Openings in {cityData.name}
                </h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {cityJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`/jobs/${job.id}`}
                      style={{ textDecoration: "none", color: "inherit" }}
                    >
                      <div
                        className="card"
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          transition: "border-color 0.15s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: "0 0 4px 0", fontSize: 16, fontWeight: 600 }}>
                              {job.title}
                            </h3>
                            <p style={{ margin: "0 0 8px 0", fontSize: 14, color: "#555", display: "flex", alignItems: "center", gap: 6 }}>
                              {job.hospitalName}
                              <MapPinButton job={job} />
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px", fontSize: 13, color: "#666" }}>
                              {job.department && <span>🔬 {job.department}</span>}
                              <span>📍 {job.pincode}</span>
                              {job.payscale && (
                                <span style={{ fontWeight: 500, color: "#333" }}>💰 {job.payscale}</span>
                              )}
                            </div>
                          </div>
                          {job.workType && (
                            <span
                              className={`badge badge-${job.workType === "Locum" ? "warning" : "info"}`}
                              style={{ fontSize: 11, flexShrink: 0 }}
                            >
                              {job.workType}
                            </span>
                          )}
                        </div>
                        {job.remarks && (
                          <p style={{
                            margin: "10px 0 0 0",
                            fontSize: 13,
                            color: "#666",
                            lineHeight: 1.5,
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}>
                            {job.remarks}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                <div style={{ marginTop: 24, textAlign: "center" }}>
                  <a href="/browse-jobs" className="btn btn-secondary">
                    View All Jobs Across India →
                  </a>
                </div>
              </div>
            )}

            {/* GEO content — what AI crawlers answer from */}
            <div className="card" style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 20, marginBottom: 16 }}>
                About Duty Locum - Doctor Jobs in {cityData.name}
              </h2>

              <h3 style={{ fontSize: 16, marginBottom: 8 }}>
                What types of Duty Locum - Doctor Jobs are available in {cityData.name}?
              </h3>
              <p style={{ lineHeight: 1.7, color: "#444", marginBottom: 16 }}>
                Hospitals and clinics in {cityData.name} hire doctors for full-time
                permanent positions, part-time roles, locum duties (short-term or daily
                cover), contract positions, and visiting consultant arrangements. Roles
                span all departments including general medicine, surgery, paediatrics,
                gynaecology, orthopaedics, cardiology, neurology, emergency medicine,
                radiology, pathology, and more.
              </p>

              <h3 style={{ fontSize: 16, marginBottom: 8 }}>
                How do I apply for Duty Locum - Doctor Jobs in {cityData.name}?
              </h3>
              <p style={{ lineHeight: 1.7, color: "#444", marginBottom: 16 }}>
                Create a free account on Duty Locum - Doctor Jobs, complete your doctor profile with
                your education, specialty, and experience, then apply directly to any
                listing in {cityData.name} with one click. There are no placement fees.
                When a hospital accepts your application, their phone number and email
                are shared with you directly.
              </p>

              <h3 style={{ fontSize: 16, marginBottom: 8 }}>
                Can hospitals in {cityData.name} post jobs here?
              </h3>
              <p style={{ lineHeight: 1.7, color: "#444" }}>
                Yes. Hospitals, clinics, nursing homes, and diagnostic centres in{" "}
                {cityData.name} can post job openings directly on Duty Locum - Doctor Jobs. Use the
                Post a Job or Post Locum Duty options. Your hospital location and pincode
                are auto-detected. Applications arrive with complete doctor profiles
                including qualifications and current institution.
              </p>
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="city-sidebar" style={{ flexDirection: "column", gap: 20 }}>

            {/* Quick stats */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Jobs in {cityData.name}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#666" }}>Open positions</span>
                  <strong>{cityJobs.length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#666" }}>Full-time</span>
                  <strong>{cityJobs.filter(j => j.workType === "Full-time").length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#666" }}>Locum / Part-time</span>
                  <strong>{cityJobs.filter(j => j.workType === "Locum" || j.workType === "Part-time").length}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#666" }}>Contract</span>
                  <strong>{cityJobs.filter(j => j.workType === "Contract").length}</strong>
                </div>
              </div>
              <a
                href="/browse-jobs"
                className="btn btn-primary"
                style={{ display: "block", textAlign: "center", marginTop: 16, textDecoration: "none" }}
              >
                Browse All
              </a>
            </div>

            {/* Other cities — internal linking */}
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Jobs in Other Cities</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {otherCities.map(([slug, data]) => (
                  <a
                    key={slug}
                    href={`/doctor-jobs-in/${slug}`}
                    style={{
                      fontSize: 14,
                      color: "var(--primary)",
                      textDecoration: "none",
                      padding: "6px 0",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    Doctor Jobs in {data.name} →
                  </a>
                ))}
              </div>
            </div>

            {/* CTA for recruiters */}
            <div className="card" style={{ background: "#f0f7ff", border: "1px solid #d0e7ff" }}>
              <h3 style={{ fontSize: 15, marginBottom: 8 }}>Hiring in {cityData.name}?</h3>
              <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 16 }}>
                Post a job or locum duty and receive applications from qualified doctors
                in {cityData.name} directly.
              </p>
              <a
                href="/post-job"
                className="btn btn-primary"
                style={{ display: "block", textAlign: "center", textDecoration: "none", fontSize: 13 }}
              >
                Post a Job
              </a>
              <a
                href="/post-locum"
                className="btn btn-secondary"
                style={{ display: "block", textAlign: "center", marginTop: 8, textDecoration: "none", fontSize: 13 }}
              >
                Post Locum Duty
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
