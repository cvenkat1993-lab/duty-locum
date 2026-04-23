"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import SpecialtyQuiz from "@/components/SpecialtyQuiz";

interface DoctorProfile {
  name: string;
  email: string;
  education: string;
  currentJobTitle: string;
  currentInstitution: string;
  department: string;
  experience: string;
  phoneNumber: string;
}

export default function UserProfileTab({ user }: { user: any }) {
  const institutionInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [profile, setProfile] = useState<DoctorProfile>({
    name: user?.displayName || "",
    email: user?.email || "",
    education: "",
    currentJobTitle: "",
    currentInstitution: "",
    department: "",
    experience: "",
    phoneNumber: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Quiz state
  const [specialtyVerified, setSpecialtyVerified] = useState(false);
  const [verifiedDepartment, setVerifiedDepartment] = useState("");
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (!window.google || !institutionInputRef.current || loading) return;

    const autocomplete = new google.maps.places.Autocomplete(
      institutionInputRef.current,
      {
        fields: ["name", "formatted_address", "geometry", "place_id", "types"],
        types: ["hospital", "doctor", "health"],
        componentRestrictions: { country: "in" },
      }
    );

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.name) {
        if (institutionInputRef.current) {
          institutionInputRef.current.value = place.name;
        }
        setProfile((prev) => ({ ...prev, currentInstitution: place.name || "" }));
      }
    });
  }, [loading]);

  const loadProfile = async () => {
    if (!user) return;
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || user.displayName || "",
          email: data.email || user.email || "",
          education: data.education || "",
          currentJobTitle: data.currentJobTitle || data.currentTitle || "",
          currentInstitution: data.currentInstitution || "",
          department: data.department || "",
          experience: data.experience || "",
          phoneNumber: data.phoneNumber || "",
        });
        setSpecialtyVerified(data.specialtyVerified || false);
        setVerifiedDepartment(data.verifiedDepartment || "");
        setQuizAttempts(data.quizAttempts || 0);
        if (
          data.name && data.education && data.currentJobTitle &&
          data.currentInstitution && data.department && data.phoneNumber
        ) {
          setIsSaved(true);
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setProfile((prev) => ({ ...prev, department: value }));
    if (specialtyVerified && value !== verifiedDepartment) {
      setSpecialtyVerified(false);
      setVerifiedDepartment("");
    }
  };

  const handleVerified = () => {
    setSpecialtyVerified(true);
    setVerifiedDepartment(profile.department);
  };

  const handleSave = async () => {
    if (!user) return;

    if (
      !profile.name || !profile.education || !profile.currentJobTitle ||
      !profile.currentInstitution || !profile.department || !profile.phoneNumber
    ) {
      alert("Please fill all required fields (marked with *)");
      return;
    }

    if (!specialtyVerified) {
      alert("Please verify your specialty by taking the quiz before saving your profile.");
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        uid: user.uid,
        specialtyVerified: true,
        verifiedDepartment,
        updatedAt: new Date(),
      });
      setIsSaved(true);
      alert("✓ Profile saved successfully! Redirecting to homepage...");
      setTimeout(() => router.push("/"), 1000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ padding: 40 }}>
        <div className="spinner-large"></div>
      </div>
    );
  }

  const canTakeQuiz = profile.department.trim().length > 0;
  const needsReverification = isSaved && profile.department !== verifiedDepartment;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>

      {showQuiz && (
        <SpecialtyQuiz
          user={user}
          department={profile.department}
          currentAttempts={quizAttempts}
          onVerified={handleVerified}
          onClose={() => {
            setShowQuiz(false);
            getDoc(doc(db, "users", user.uid)).then((snap) => {
              if (snap.exists()) setQuizAttempts(snap.data().quizAttempts || 0);
            });
          }}
        />
      )}

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>Doctor Profile</h3>
          <p className="text-muted text-small" style={{ marginTop: 8 }}>
            Complete your profile to apply for jobs
          </p>
        </div>

        <div className="alert alert-warning">
          <strong>Required fields</strong> are marked with{" "}
          <span style={{ color: "var(--danger)" }}>*</span>
        </div>

        {/* Name */}
        <div className="form-group">
          <label className="form-label form-label-required">Full Name</label>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            placeholder="Dr. John Doe"
            disabled={isSaved}
            style={isSaved ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
          {isSaved && <small className="form-help" style={{ color: "green" }}>✓ Locked after save</small>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled
            style={{ background: "#f5f5f5", cursor: "not-allowed" }}
          />
          <small className="form-help">Email cannot be changed</small>
        </div>

        {/* Education */}
        <div className="form-group">
          <label className="form-label form-label-required">Education Qualification</label>
          <input
            type="text"
            value={profile.education}
            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
            placeholder="e.g., MBBS, MD (Medicine), MS (Surgery), DNB"
          />
          <small className="form-help">Your highest medical qualification</small>
        </div>

        {/* Current Job Title */}
        <div className="form-group">
          <label className="form-label form-label-required">Current Job Title</label>
          <input
            type="text"
            value={profile.currentJobTitle}
            onChange={(e) => setProfile({ ...profile, currentJobTitle: e.target.value })}
            placeholder="Start typing to select or enter custom title..."
            list="job-titles"
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

        {/* Current Institution */}
        <div className="form-group">
          <label className="form-label form-label-required">Current Institution</label>
          <input
            ref={institutionInputRef}
            type="text"
            defaultValue={profile.currentInstitution}
            placeholder="Start typing to search hospitals..."
            className="pac-target-input"
          />
          {profile.currentInstitution && (
            <small className="form-help" style={{ color: "green", display: "block", marginTop: 4 }}>
              ✓ Selected: {profile.currentInstitution}
            </small>
          )}
          <small className="form-help">Hospital/Medical College where you currently work or study</small>
        </div>

        {/* Department/Specialty + Verification */}
        <div className="form-group">
          <label className="form-label form-label-required">Department/Specialty</label>
          <input
            type="text"
            value={profile.department}
            onChange={(e) => handleDepartmentChange(e.target.value)}
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

          {/* Verification status */}
          <div style={{ marginTop: 12 }}>
            {specialtyVerified && profile.department === verifiedDepartment ? (
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#e8f5e9", border: "1px solid #a5d6a7",
                borderRadius: 24, padding: "6px 16px",
                color: "#2e7d32", fontWeight: 600, fontSize: 13,
              }}>
                ✓ Specialty Verified
              </div>
            ) : canTakeQuiz ? (
              <div>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#fff8e1", border: "1px solid #ffe082",
                  borderRadius: 8, padding: "8px 14px",
                  color: "#7a5300", fontSize: 13, marginBottom: 10,
                }}>
                  ⚠️ Specialty verification required to save profile
                  {needsReverification && " — department changed, please re-verify"}
                </div>
                <br />
                <button
                  type="button"
                  onClick={() => setShowQuiz(true)}
                  className="btn btn-primary"
                  style={{ fontSize: 13 }}
                >
                  🧪 Take Specialty Verification Quiz
                  {quizAttempts > 0 
                  }
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Experience */}
        <div className="form-group">
          <label className="form-label">Years of Experience</label>
          <input
            type="text"
            placeholder="e.g., 2 years, Fresher"
            value={profile.experience}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          />
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label className="form-label form-label-required">Phone Number</label>
          <input
            type="tel"
            placeholder="10-digit mobile number"
            value={profile.phoneNumber}
            onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
            disabled={isSaved}
            style={isSaved ? { background: "#f5f5f5", cursor: "not-allowed" } : {}}
          />
          {isSaved && <small className="form-help" style={{ color: "green" }}>✓ Locked after save</small>}
        </div>

        {/* Save button */}
        {!specialtyVerified && profile.department && (
          <div className="alert alert-warning" style={{ marginTop: 8 }}>
            Complete specialty verification above before saving.
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || !specialtyVerified}
          className="btn btn-primary btn-mobile-full"
          style={{
            marginTop: 16,
            opacity: !specialtyVerified ? 0.5 : 1,
            cursor: !specialtyVerified ? "not-allowed" : "pointer",
          }}
        >
          {saving ? (
            <>
              <div className="spinner"></div>
              Saving...
            </>
          ) : isSaved ? (
            "💾 Update Profile"
          ) : (
            "💾 Save Profile"
          )}
        </button>

        {isSaved && (
          <p className="text-small text-muted" style={{ marginTop: 12, textAlign: "center" }}>
            Name, Email, and Phone are locked. Update other fields as needed.
          </p>
        )}
      </div>
    </div>
  );
}
