"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";

export default function PostLocumClient() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hospitalInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    hospitalName: "",
    hospitalType: "Hospital",
    pincode: "",
    department: "",
    workType: "Locum", // Always Locum
    payscale: "5000", // Default slider value
    contact: user?.email || "",
    contactNo: "",
    remarks: "",
    requiredDate: "",
    hospGeo: { lat: 0, lng: 0 },
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
        }));
      }
    };
    
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Setup Google Places Autocomplete
  useEffect(() => {
    if (!window.google || !hospitalInputRef.current || loading) return;

    const autocomplete = new google.maps.places.Autocomplete(
      hospitalInputRef.current,
      {
        fields: ["name", "formatted_address", "geometry", "place_id", "types", "address_components"],
        types: ["hospital", "doctor", "health"],
        componentRestrictions: { country: "in" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();

      if (!place.geometry || !place.geometry.location) {
        alert("Please select a valid hospital from the dropdown");
        return;
      }

      const isMedical = place.types?.some((type) =>
        ["hospital", "doctor", "health", "clinic", "dentist", "pharmacy", "physiotherapist"].includes(type)
      );

      if (!isMedical) {
        alert("Please select a hospital, clinic, or medical establishment from the dropdown");
        return;
      }

      // Extract pincode
      let pincode = "";
      if (place.address_components) {
        const postalCode = place.address_components.find((component) =>
          component.types.includes("postal_code")
        );
        if (postalCode) {
          pincode = postalCode.long_name;
        }
      }

      const location = place.geometry.location;

      if (hospitalInputRef.current) {
        hospitalInputRef.current.value = place.name || "";
      }

      setFormData((prev) => ({
        ...prev,
        hospitalName: place.name || "",
        pincode: pincode,
        hospGeo: {
          lat: location.lat(),
          lng: location.lng(),
        },
      }));

      if (pincode) {
        console.log("✓ Pincode auto-filled:", pincode);
      } else {
        alert("Could not auto-detect pincode. Please enter it manually.");
      }
    });
  }, [loading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please login to post a locum duty");
      return;
    }

    if (!formData.hospitalName || !formData.pincode || !formData.title) {
      alert("Please fill all required fields");
      return;
    }

    if (!formData.contactNo) {
      alert("Please update your phone number in your profile first");
      return;
    }

    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        payscale: `₹${formData.payscale} per duty`, // Format pay
        workType: "Locum", // Ensure it's always Locum
        recruiterId: user.uid,
        recruiterEmail: user.email,
        createdAt: serverTimestamp(),
      });

      alert("✓ Locum duty posted successfully!");
      router.push("/recruiter-dashboard");
    } catch (error) {
      console.error("Error posting locum duty:", error);
      alert("Failed to post locum duty. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 20, paddingBottom: 40 }}>
        <form onSubmit={handleSubmit} style={{ maxWidth: 800, margin: "0 auto" }}>
          <div className="card">
            <h2 style={{ marginBottom: 8 }}>Post Locum Duty</h2>
            <p className="text-muted" style={{ marginBottom: 24 }}>
              Post temporary duty requirements for immediate coverage
            </p>

            <div className="alert alert-info">
              <strong>Required fields</strong> are marked with{" "}
              <span style={{ color: "var(--danger)" }}>*</span>
            </div>

            {/* Job Title */}
            <div className="form-group">
              <label className="form-label form-label-required">Duty Title</label>
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

            {/* Department */}
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
                <option value="Emergency Medicine" />
                <option value="General Surgery" />
                <option value="Orthopedics" />
                <option value="Obstetrics & Gynecology (OBG)" />
                <option value="Anesthesiology" />
                <option value="Cardiology" />
                <option value="Critical Care Medicine" />
              </datalist>
              <small className="form-help">Type to search or enter a custom department</small>
            </div>

            {/* Pay Per Duty - Slider */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Pay Per Duty: ₹{parseInt(formData.payscale).toLocaleString("en-IN")}
              </label>
              <input
                type="range"
                min="1000"
                max="25000"
                step="1000"
                value={formData.payscale}
                onChange={(e) => setFormData({ ...formData, payscale: e.target.value })}
                style={{
                  width: "100%",
                  height: 8,
                  borderRadius: 5,
                  outline: "none",
                  marginTop: 12,
                }}
              />
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                fontSize: 12, 
                color: "#666",
                marginTop: 8 
              }}>
                <span>₹1,000</span>
                <span>₹13,000</span>
                <span>₹25,000</span>
              </div>
              <small className="form-help">Slide to set pay amount per duty shift</small>
            </div>

            {/* Contact Details - Frozen */}
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
              <label className="form-label">Duty Date Required</label>
              <input
                type="date"
                value={formData.requiredDate}
                onChange={(e) => setFormData({ ...formData, requiredDate: e.target.value })}
              />
              <small className="form-help">When do you need the doctor for this duty?</small>
            </div>

            {/* Additional Remarks */}
            <div className="form-group">
              <label className="form-label">Additional Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Duty timings, special requirements, immediate joiner preference, etc."
                rows={4}
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="btn btn-success btn-mobile-full" style={{ marginTop: 16 }}>
              🩺 Post Locum Duty
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
