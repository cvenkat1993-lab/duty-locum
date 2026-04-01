// Unified Firebase configuration and utilities
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, getDocs, query, orderBy, where, doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Job } from "@/types/job";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyC-nwl74zL5YMUddmvIA68mgWXBSiD06sw",
  authDomain: "doctor-jobs-web.firebaseapp.com",
  projectId: "doctor-jobs-web",
  storageBucket: "doctor-jobs-web.firebasestorage.app",
  messagingSenderId: "1080257383924",
  appId: "1:1080257383924:web:5519732a4b81bdee957da1",
  measurementId: "G-9JB35L2R3G"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account'
});
export const db = getFirestore(app);

// ===== JOB OPERATIONS =====

/**
 * Fetch all jobs (sorted by newest first)
 */
export async function fetchJobs(): Promise<Job[]> {
  // ✅ Keep orderBy here - simple query, no composite index needed
  const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Job));
}

/**
 * Fetch jobs posted by a specific recruiter
 */
export async function fetchJobsByRecruiter(recruiterId: string): Promise<Job[]> {
  const q = query(
    collection(db, "jobs"),
    where("recruiterId", "==", recruiterId)
    // ⚠️ Removed orderBy temporarily - add back after index created
    // orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  
  const jobs = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Job));

  // Sort in memory instead (temporary)
  return jobs.sort((a, b) => {
    const aTime = a.createdAt?.toMillis?.() || 0;
    const bTime = b.createdAt?.toMillis?.() || 0;
    return bTime - aTime;
  });
}

/**
 * Get a single job by ID
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  const jobRef = doc(db, "jobs", jobId);
  const jobSnap = await getDoc(jobRef);
  
  if (!jobSnap.exists()) return null;
  
  return {
    id: jobSnap.id,
    ...jobSnap.data(),
  } as Job;
}

// ===== APPLICATION OPERATIONS =====

export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantEducation?: string;
  applicantInstitution?: string;
  applicantDepartment?: string;
  applicantTitle?: string;
  applicantExperience?: string;
  recruiterId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}

/**
 * Apply for a job (with duplicate protection)
 */
export async function applyForJob(jobId: string, userId: string, recruiterId: string): Promise<{ success: boolean; message: string }> {
  const applicationId = `${jobId}_${userId}`;
  const appRef = doc(db, "jobApplications", applicationId);

  // Check if already applied
  const existing = await getDoc(appRef);
  if (existing.exists()) {
    return { success: false, message: "You have already applied to this job" };
  }

  // ✅ Fetch user profile
  const userDoc = await getDoc(doc(db, "users", userId));
  const userData = userDoc.data();

  // Create application with user details
  await setDoc(appRef, {
    jobId,
    applicantId: userId,
    recruiterId,
    status: "pending",
    createdAt: serverTimestamp(),
    // ✅ Store applicant details with ALL profile fields
    applicantName: userData?.name || "Unknown",
    applicantEmail: userData?.email || "",
    applicantPhone: userData?.phoneNumber || "",
    applicantEducation: userData?.education || "", // ✅ Added education
    applicantJobTitle: userData?.currentJobTitle || "", // ✅ Using new field name
    applicantInstitution: userData?.currentInstitution || "",
    applicantDepartment: userData?.department || "",
    applicantExperience: userData?.experience || "",
  });

  return { success: true, message: "Application submitted successfully" };
}


/**
 * Fetch all applications for a specific applicant
 */
export async function fetchApplicationsByApplicant(applicantId: string): Promise<Application[]> {
  const q = query(
    collection(db, "jobApplications"),
    where("applicantId", "==", applicantId)
    // ⚠️ No orderBy - add after index created if needed
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Application));
}

/**
 * Fetch all applications for jobs posted by a recruiter
 */
export async function fetchApplicationsByRecruiter(recruiterId: string): Promise<Application[]> {
  const q = query(
    collection(db, "jobApplications"),
    where("recruiterId", "==", recruiterId)
    // ⚠️ No orderBy - add after index created if needed
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Application));
}

/**
 * Update application status (accept/reject)
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected"
): Promise<void> {
  const appRef = doc(db, "jobApplications", applicationId);
  await updateDoc(appRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Get applications for a specific job
 */
export async function fetchApplicationsByJob(jobId: string): Promise<Application[]> {
  const q = query(
    collection(db, "jobApplications"),
    where("jobId", "==", jobId)
    // ⚠️ Removed orderBy temporarily - add back after index created
    // orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  } as Application));
}