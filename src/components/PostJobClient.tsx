"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";

export default function PostJobClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const hospitalInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    hospitalName: "",
    hospitalType: "Hospital",
    pincode: "",
    department: "",
    workType: "",
    payscale: "",
    contact: user?.email || "",
    contactNo: "",
    remarks: "",
    requiredDate: "",
    hospGeo: { lat: 0, lng: 0 },
    postedByLabel: "",
  });

  // Load user profile to get contact details
  useEffect(() => {
    if (!user) return;
    
    const loadUserProfile = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData(prev => ({
          ...prev,
          contact: userData.email || user.email || "",
          contactNo: userData.phoneNumber || "",
          postedByLabel: userData.postedByLabel || "Doctor",
        }));
      }
    };
    
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    console.log("Checking Google Maps API...");
    console.log("window.google exists:", !!window.google);
    console.log("hospitalInputRef.current exists:", !!hospitalInputRef.current);
    
    if (!window.google) {
      console.log("Google Maps not loaded yet, waiting...");
      return;
    }

    if (!hospitalInputRef.current) {
      console.log("Input ref not ready yet, waiting...");
      return;
    }

    console.log("Initializing autocomplete...");

    const autocomplete = new google.maps.places.Autocomplete(
      hospitalInputRef.current,
      {
        fields: ["name", "formatted_address", "geometry", "place_id", "types", "address_components"],
        types: ["hospital", "doctor", "health"], // Restrict to medical establishments
        componentRestrictions: { country: "in" },
      }
    );

    console.log("Autocomplete initialized successfully");

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      console.log("Place selected:", place);

      if (!place.geometry || !place.geometry.location) {
        alert("Please select a valid hospital from the dropdown");
        return;
      }

      // Check if it's a medical establishment
      const isMedical = place.types?.some((type) =>
        ["hospital", "doctor", "health", "clinic", "dentist", "pharmacy", "physiotherapist"].includes(type)
      );

      if (!isMedical) {
        alert("Please select a hospital, clinic, or medical establishment from the dropdown");
        return;
      }

      // Extract pincode from address components
      let pincode = "";
      if (place.address_components) {
        const postalCode = place.address_components.find((component) =>
          component.types.includes("postal_code")
        );
        if (postalCode) {
          pincode = postalCode.long_name;
        }
      }

      // Extract location to maintain type narrowing
      const location = place.geometry.location;

      // Update the input value
      if (hospitalInputRef.current) {
        hospitalInputRef.current.value = place.name || "";
      }

      setFormData((prev) => ({
        ...prev,
        hospitalName: place.name || "",
        pincode: pincode, // Auto-populate pincode
        hospGeo: {
          lat: location.lat(),
          lng: location.lng(),
        },
      }));

      // Show success message if pincode was found
      if (pincode) {
        console.log("✓ Pincode auto-filled:", pincode);
      } else {
        alert("Could not auto-detect pincode. Please enter it manually.");
      }
    });
  }, [loading, user]); // Add dependencies so it re-runs when user loads

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to post a job");
      return;
    }

    if (!formData.hospitalName || !formData.title || !formData.pincode) {
      alert("Please fill all required fields");
      return;
    }

    if (!formData.hospGeo.lat || !formData.hospGeo.lng) {
      alert("Please select a hospital from the dropdown");
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        recruiterId: user.uid,
        recruiterEmail: user.email,
        createdAt: serverTimestamp(),
      });

      alert("✓ Job posted successfully!");
      router.push("/recruiter-dashboard");
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="card">
            <div className="alert alert-info">
              <strong>Required fields</strong> are marked with{" "}
              <span style={{ color: "var(--danger)" }}>*</span>
            </div>

            {/* Job Title */}
            <div className="form-group">
              <label className="form-label form-label-required">Job Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Start typing to select or enter custom title..."
                list="job-titles"
                required
              />
              <datalist id="job-titles">
                <option value="Medical Intern" />
                <option value="House Surgeon" />
                <option value="Junior Resident (JR)" />
                <option value="Medical Officer (MO)" />
                <option value="Casualty Medical Officer (CMO)" />
                <option value="Duty Doctor" />
                <option value="Postgraduate Resident (PG Resident)" />
                <option value="Senior Resident (SR)" />
                <option value="Specialist Doctor" />
                <option value="Consultant" />
                <option value="Junior Consultant" />
                <option value="Senior Consultant" />
                <option value="Lead Consultant" />
                <option value="Specialist Grade" />
                <option value="Unit Head" />
                <option value="Head of Department (HOD)" />
                <option value="Medical Superintendent" />
                <option value="Deputy Medical Superintendent" />
              </datalist>
              <small className="form-help">Type to search or enter a custom title</small>
            </div>

            {/* Hospital Name */}
            <div className="form-group">
              <label className="form-label form-label-required">Hospital Name</label>
              <input
                ref={hospitalInputRef}
                type="text"
                defaultValue={formData.hospitalName}
                placeholder="Start typing to search hospitals..."
                className="pac-target-input"
                required
              />
              <small className="form-help">Select from dropdown to set location automatically</small>
              {formData.hospitalName && (
                <small className="form-help" style={{ color: "green", display: "block", marginTop: 4 }}>
                  ✓ Selected: {formData.hospitalName}
                </small>
              )}
            </div>

            {/* Two columns */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Hospital Type</label>
                <select
                  value={formData.hospitalType}
                  onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                >
                  <option value="Hospital">Hospital</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Nursing Home">Nursing Home</option>
                  <option value="Medical Center">Medical Center</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  readOnly
                  placeholder="Auto-filled from hospital selection"
                  style={{ 
                    background: "#f5f5f5", 
                    cursor: "not-allowed",
                    color: formData.pincode ? "var(--foreground)" : "#999"
                  }}
                  pattern="[0-9]{6}"
                  required
                />
                <small className="form-help">
                  {formData.pincode 
                    ? `✓ Auto-detected: ${formData.pincode}` 
                    : "Will be auto-filled when you select a hospital"}
                </small>
              </div>
            </div>

            {/* Two columns */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Start typing to select or enter custom department..."
                  list="departments"
                />
                <datalist id="departments">
                  <option value="General Medicine (Internal Medicine)" />
                  <option value="Pediatrics" />
                  <option value="Dermatology (Skin & VD)" />
                  <option value="Psychiatry" />
                  <option value="Respiratory Medicine (Pulmonology)" />
                  <option value="Neurology" />
                  <option value="Cardiology" />
                  <option value="Gastroenterology" />
                  <option value="Nephrology" />
                  <option value="Endocrinology" />
                  <option value="Rheumatology" />
                  <option value="Geriatric Medicine" />
                  <option value="Infectious Diseases" />
                  <option value="General Surgery" />
                  <option value="Orthopedics" />
                  <option value="Obstetrics & Gynecology (OBG)" />
                  <option value="Ophthalmology (Eye)" />
                  <option value="ENT (Otorhinolaryngology)" />
                  <option value="Urology" />
                  <option value="Neurosurgery" />
                  <option value="Cardiothoracic & Vascular Surgery (CTVS)" />
                  <option value="Plastic Surgery" />
                  <option value="Pediatric Surgery" />
                  <option value="Surgical Gastroenterology" />
                  <option value="Oncosurgery (Surgical Oncology)" />
                  <option value="Interventional Cardiology" />
                  <option value="Clinical Hematology" />
                  <option value="Medical Oncology" />
                  <option value="Radiation Oncology" />
                  <option value="Neonatology" />
                  <option value="Critical Care Medicine" />
                  <option value="Hepatology" />
                  <option value="Reproductive Medicine" />
                  <option value="Pain Medicine" />
                  <option value="Pathology" />
                  <option value="Microbiology" />
                  <option value="Biochemistry" />
                  <option value="Radiology" />
                  <option value="Nuclear Medicine" />
                  <option value="Blood / Transfusion Medicine" />
                  <option value="Emergency Medicine" />
                  <option value="Trauma Care" />
                  <option value="Intensive Care Unit (ICU)" />
                  <option value="Neonatal ICU (NICU)" />
                  <option value="Pediatric ICU (PICU)" />
                  <option value="Anesthesiology" />
                  <option value="Physiotherapy" />
                  <option value="Occupational Therapy" />
                  <option value="Speech Therapy" />
                  <option value="Dietetics & Nutrition" />
                  <option value="Clinical Pharmacology" />
                  <option value="Oral Medicine" />
                  <option value="Oral Surgery" />
                  <option value="Orthodontics" />
                  <option value="Periodontics" />
                  <option value="Prosthodontics" />
                  <option value="Pedodontics" />
                  <option value="Community Medicine" />
                  <option value="Public Health" />
                  <option value="Epidemiology" />
                  <option value="Family Medicine" />
                  <option value="Occupational Health" />
                </datalist>
                <small className="form-help">Type to search or enter a custom department</small>
              </div>

              <div className="form-group">
                <label className="form-label">Work Type</label>
                <select
                  value={formData.workType}
                  onChange={(e) => setFormData({ ...formData, workType: e.target.value })}
                >
                  <option value="">Select work type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Locum">Locum</option>
                  <option value="Visiting">Visiting</option>
                </select>
              </div>
            </div>

            {/* Payscale */}
            <div className="form-group">
              <label className="form-label">Payscale</label>
              <input
                type="text"
                value={formData.payscale}
                onChange={(e) => setFormData({ ...formData, payscale: e.target.value })}
                placeholder="e.g., 80,000 - 1,20,000 per month"
              />
            </div>

            {/* Two columns */}
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label form-label-required">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact}
                  readOnly
                  style={{ 
                    background: "#f5f5f5", 
                    cursor: "not-allowed",
                    color: "var(--foreground)"
                  }}
                  required
                />
                <small className="form-help">From your profile</small>
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contactNo}
                  readOnly
                  placeholder={formData.contactNo ? "" : "Please update in your profile"}
                  style={{ 
                    background: "#f5f5f5", 
                    cursor: "not-allowed",
                    color: formData.contactNo ? "var(--foreground)" : "#d32f2f"
                  }}
                  pattern="[0-9]{10}"
                  required
                />
                <small className="form-help" style={{ color: formData.contactNo ? "inherit" : "#d32f2f" }}>
                  {formData.contactNo 
                    ? "From your profile" 
                    : "⚠️ Update your phone in profile first"}
                </small>
              </div>
            </div>

            {/* Required Date */}
            <div className="form-group">
              <label className="form-label">Required By Date</label>
              <input
                type="date"
                value={formData.requiredDate}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
              />
            </div>

            {/* Remarks */}
            <div className="form-group">
              <label className="form-label">Additional Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any additional information about the position..."
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {saving ? (
                  <>
                    <div className="spinner"></div>
                    Posting...
                  </>
                ) : (
                  "📝 Post Job"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
