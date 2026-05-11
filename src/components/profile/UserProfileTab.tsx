"use client";

import { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import SpecialtyQuiz from "@/components/SpecialtyQuiz";

const NON_DOCTOR_TITLES = [
  "Admin", "HR Manager", "Recruiter", "Talent Acquisition",
  "Hospital Administrator", "Agency Owner", "Hospital Management", "Operations Manager",
];

const DOCTOR_TITLES = [
  "Medical Intern", "House Surgeon", "Junior Resident (JR)", "Medical Officer (MO)",
  "Casualty Medical Officer (CMO)", "Duty Doctor", "Postgraduate Resident (PG Resident)",
  "Senior Resident (SR)", "Specialist Doctor", "Consultant", "Junior Consultant",
  "Senior Consultant", "Lead Consultant", "Head of Department (HOD)", "Medical Superintendent",
];

export default function UserProfileTab({ user }: { user: any }) {
  const institutionInputRef = useRef<HTMLInputElement | null>(null);

  // Callback ref — fires when the input mounts
  // Retries until google.maps.places is available
  const setInstitutionRef = (el: HTMLInputElement | null) => {
    institutionInputRef.current = el;
    if (!el) return;

    const attachAutocomplete = () => {
      if (!window.google?.maps?.places) {
        setTimeout(attachAutocomplete, 300);
        return;
      }
      const autocomplete = new google.maps.places.Autocomplete(el, {
        fields: ["name"],
        types: userType === "non-doctor" ? ["establishment"] : ["hospital"],
        componentRestrictions: { country: "in" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.name) {
          el.value = place.name;
          setProfile(prev => ({ ...prev, currentInstitution: place.name! }));
        }
      });
    };

    attachAutocomplete();
  };
  const router = useRouter();

  // User type — locked after first save
  const [userType, setUserType] = useState<"doctor" | "non-doctor" | "">("");
  const [nonDoctorRole, setNonDoctorRole] = useState("");
  const [userTypeLocked, setUserTypeLocked] = useState(false);

  const [profile, setProfile] = useState({
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

  // Quiz state (doctors only)
  const [specialtyVerified, setSpecialtyVerified] = useState(false);
  const [verifiedDepartment, setVerifiedDepartment] = useState("");
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => { if (user) loadProfile(); }, [user]);

  // Autocomplete handled by setInstitutionRef callback ref above

  // Re-attach autocomplete when userType changes (types differ per role)
  useEffect(() => {
    if (!userType || !institutionInputRef.current) return;
    const el = institutionInputRef.current;

    const attachAutocomplete = () => {
      if (!window.google?.maps?.places) {
        setTimeout(attachAutocomplete, 300);
        return;
      }
      const autocomplete = new google.maps.places.Autocomplete(el, {
        fields: ["name"],
        types: userType === "non-doctor" ? ["establishment"] : ["hospital"],
        componentRestrictions: { country: "in" },
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place?.name) {
          el.value = place.name;
          setProfile(prev => ({ ...prev, currentInstitution: place.name! }));
        }
      });
    };

    attachAutocomplete();
  }, [userType]);

  const loadProfile = async () => {
    try {
      const docSnap = await getDoc(doc(db, "users", user.uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          name: data.name || user.displayName || "",
          email: data.email || user.email || "",
          education: data.education || "",
          currentJobTitle: data.currentJobTitle || "",
          currentInstitution: data.currentInstitution || "",
          department: data.department || "",
          experience: data.experience || "",
          phoneNumber: data.phoneNumber || "",
        });
        if (data.userType) {
          setUserType(data.userType);
          setNonDoctorRole(data.nonDoctorRole || "");
          setUserTypeLocked(true);
        }
        setSpecialtyVerified(data.specialtyVerified || false);
        setVerifiedDepartment(data.verifiedDepartment || "");
        setQuizAttempts(data.quizAttempts || 0);
        // isSaved: doctor needs dept, non-doctor doesn't
        const baseReady = data.name && data.currentJobTitle && data.currentInstitution && data.phoneNumber;
        const doctorReady = data.userType === "doctor" ? (data.education && data.department) : true;
        if (baseReady && doctorReady && data.userType) setIsSaved(true);
      }
    } catch (e) {
      console.error("Error loading profile:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (value: string) => {
    setProfile(prev => ({ ...prev, department: value }));
    if (specialtyVerified && value !== verifiedDepartment) {
      setSpecialtyVerified(false);
      setVerifiedDepartment("");
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!userType) { alert("Please select whether you are a Doctor or Non-Doctor."); return; }

    const baseFields = !profile.name || !profile.currentJobTitle || !profile.currentInstitution || !profile.phoneNumber;
    if (baseFields) { alert("Please fill all required fields (marked with *)"); return; }

    if (userType === "doctor") {
      if (!profile.education || !profile.department) { alert("Please fill Education and Department fields."); return; }
      if (!specialtyVerified) { alert("Please verify your specialty by taking the quiz before saving."); return; }
    }


    setSaving(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        ...profile,
        uid: user.uid,
        userType,
        nonDoctorRole: userType === "non-doctor" ? nonDoctorRole : "",
        postedByLabel: userType === "doctor" ? "Doctor" : nonDoctorRole || "Non-Doctor",
        specialtyVerified: userType === "doctor" ? true : false,
        verifiedDepartment: userType === "doctor" ? verifiedDepartment : "",
        updatedAt: new Date(),
      });
      setIsSaved(true);
      setUserTypeLocked(true);
      alert("✓ Profile saved successfully!");
      setTimeout(() => router.push("/"), 1000);
    } catch (e) {
      console.error("Error saving profile:", e);
      alert("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex-center" style={{ padding: 40 }}><div className="spinner-large"></div></div>;

  const isDoctor = userType === "doctor";
  const isNonDoctor = userType === "non-doctor";
  const canSave = isDoctor ? specialtyVerified : isNonDoctor;
  const canTakeQuiz = isDoctor && profile.department.trim().length > 0;

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>

      {showQuiz && (
        <SpecialtyQuiz
          user={user}
          department={profile.department}
          currentAttempts={quizAttempts}
          onVerified={() => { setSpecialtyVerified(true); setVerifiedDepartment(profile.department); }}
          onClose={() => {
            setShowQuiz(false);
            getDoc(doc(db, "users", user.uid)).then(snap => {
              if (snap.exists()) setQuizAttempts(snap.data().quizAttempts || 0);
            });
          }}
        />
      )}

      <div className="card">
        <div className="card-header">
          <h3 style={{ margin: 0 }}>My Profile</h3>
          <p className="text-muted text-small" style={{ marginTop: 8 }}>Complete your profile to post or apply for jobs</p>
        </div>

        {/* ── User Type Selector ── */}
        <div className="form-group">
          <label className="form-label form-label-required">I am a</label>
          <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
            {(["doctor", "non-doctor"] as const).map(type => {
              const label = type === "doctor" ? "🩺 Doctor" : "👤 Admin / HR / Recruiter / Agency";
              const selected = userType === type;
              return (
                <button
                  key={type}
                  type="button"
                  disabled={userTypeLocked}
                  onClick={() => !userTypeLocked && setUserType(type)}
                  style={{
                    flex: 1, padding: "14px 12px", borderRadius: 10, cursor: userTypeLocked ? "not-allowed" : "pointer",
                    border: `2px solid ${selected ? "var(--primary)" : "#e0e0e0"}`,
                    background: selected ? "#e8f0fe" : userTypeLocked ? "#f5f5f5" : "white",
                    fontWeight: selected ? 700 : 400, fontSize: 14,
                    color: selected ? "var(--primary)" : "#444",
                    transition: "all 0.15s",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {userTypeLocked && <small className="form-help" style={{ color: "green" }}>✓ Locked after save</small>}
        </div>

        {/* ── Non-doctor role picker ── */}

        {userType && <>
          <div className="alert alert-warning">
            <strong>Required fields</strong> are marked with <span style={{ color: "var(--danger)" }}>*</span>
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label form-label-required">Full Name</label>
            <input type="text" value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              placeholder="Full Name" disabled={isSaved}
              style={isSaved ? { background: "#f5f5f5", cursor: "not-allowed" } : {}} />
            {isSaved && <small className="form-help" style={{ color: "green" }}>✓ Locked after save</small>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={profile.email} disabled style={{ background: "#f5f5f5", cursor: "not-allowed" }} />
            <small className="form-help">Email cannot be changed</small>
          </div>

          {/* Education — doctors only */}
          {isDoctor && (
            <div className="form-group">
              <label className="form-label form-label-required">Education Qualification</label>
              <input type="text" value={profile.education}
                onChange={e => setProfile({ ...profile, education: e.target.value })}
                placeholder="e.g., MBBS, MD, MS, DNB" />
            </div>
          )}

          {/* Current Job Title */}
          <div className="form-group">
            <label className="form-label form-label-required">Current Job Title</label>
            <input type="text" value={profile.currentJobTitle}
              onChange={e => setProfile({ ...profile, currentJobTitle: e.target.value })}
              placeholder="Start typing..." list="job-titles" />
            <datalist id="job-titles">
              {(isDoctor ? DOCTOR_TITLES : NON_DOCTOR_TITLES).map(t => <option key={t} value={t} />)}
            </datalist>
          </div>

          {/* Current Institution */}
          <div className="form-group">
            <label className="form-label form-label-required">Current Institution</label>
            <input ref={setInstitutionRef} type="text" defaultValue={profile.currentInstitution}
              placeholder="Start typing to search hospitals..." className="pac-target-input" />
            {profile.currentInstitution && (
              <small className="form-help" style={{ color: "green" }}>✓ Selected: {profile.currentInstitution}</small>
            )}
          </div>

          {/* Department + Quiz — doctors only */}
          {isDoctor && (
            <div className="form-group">
              <label className="form-label form-label-required">Department / Specialty</label>
              <input type="text" value={profile.department}
                onChange={e => handleDepartmentChange(e.target.value)}
                placeholder="Start typing..." list="departments" />
              <datalist id="departments">
                {["General Medicine (Internal Medicine)","Pediatrics","Dermatology (Skin & VD)","Psychiatry","Respiratory Medicine (Pulmonology)","Neurology","Cardiology","Gastroenterology","Nephrology","Endocrinology","Rheumatology","Geriatric Medicine","Infectious Diseases","General Surgery","Orthopedics","Obstetrics & Gynecology (OBG)","Ophthalmology (Eye)","ENT (Otorhinolaryngology)","Urology","Neurosurgery","Cardiothoracic & Vascular Surgery (CTVS)","Plastic Surgery","Pediatric Surgery","Surgical Gastroenterology","Oncosurgery (Surgical Oncology)","Interventional Cardiology","Clinical Hematology","Medical Oncology","Radiation Oncology","Neonatology","Critical Care Medicine","Hepatology","Reproductive Medicine","Pain Medicine","Pathology","Microbiology","Biochemistry","Radiology","Nuclear Medicine","Blood / Transfusion Medicine","Emergency Medicine","Trauma Care","Intensive Care Unit (ICU)","Neonatal ICU (NICU)","Pediatric ICU (PICU)","Anesthesiology","Physiotherapy","Occupational Therapy","Speech Therapy","Dietetics & Nutrition","Community Medicine","Public Health","Family Medicine"].map(d => <option key={d} value={d} />)}
              </datalist>

              <div style={{ marginTop: 12 }}>
                {specialtyVerified && profile.department === verifiedDepartment ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#e8f5e9", border: "1px solid #a5d6a7", borderRadius: 24, padding: "6px 16px", color: "#2e7d32", fontWeight: 600, fontSize: 13 }}>
                    ✓ Specialty Verified
                  </div>
                ) : canTakeQuiz ? (
                  <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 8, padding: "8px 14px", color: "#7a5300", fontSize: 13, marginBottom: 10 }}>
                      ⚠️ Specialty verification required to save profile
                    </div>
                    <br />
                    <button type="button" onClick={() => setShowQuiz(true)} className="btn btn-primary" style={{ fontSize: 13 }}>
                      🧪 Take Specialty Verification Quiz
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Experience */}
          <div className="form-group">
            <label className="form-label">Years of Experience</label>
            <input type="text" placeholder="e.g., 2 years, Fresher"
              value={profile.experience} onChange={e => setProfile({ ...profile, experience: e.target.value })} />
          </div>

          {/* Phone */}
          <div className="form-group">
            <label className="form-label form-label-required">Phone Number</label>
            <input type="tel" placeholder="10-digit mobile number" value={profile.phoneNumber}
              onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })}
              disabled={isSaved} style={isSaved ? { background: "#f5f5f5", cursor: "not-allowed" } : {}} />
            {isSaved && <small className="form-help" style={{ color: "green" }}>✓ Locked after save</small>}
          </div>

          {isDoctor && !specialtyVerified && profile.department && (
            <div className="alert alert-warning" style={{ marginTop: 8 }}>
              Complete specialty verification above before saving.
            </div>
          )}

          <button onClick={handleSave} disabled={saving || !canSave}
            className="btn btn-primary btn-mobile-full"
            style={{ marginTop: 16, opacity: !canSave ? 0.5 : 1, cursor: !canSave ? "not-allowed" : "pointer" }}>
            {saving ? <><div className="spinner"></div>Saving...</> : isSaved ? "💾 Update Profile" : "💾 Save Profile"}
          </button>

          {isSaved && (
            <p className="text-small text-muted" style={{ marginTop: 12, textAlign: "center" }}>
              Name, Email, Phone and User Type are locked after save.
            </p>
          )}
        </>}
      </div>
    </div>
  );
}
