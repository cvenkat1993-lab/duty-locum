import { Timestamp } from "firebase/firestore";

export interface Job {
  /** Firestore document ID */
  id: string;

  /** Job basics */
  title: string;
  department?: string;
  workType: "Full-time" | "Part-time" | "Contract" | "Locum";

  /** Hospital details */
  hospitalName: string;
  hospitalType: "Hospital" | "Clinic" | "Nursing Home" | "Diagnostic Center" | "Other";
  pincode: string;

  /** Geo location (from Google Places) */
  hospGeo?: {
    lat: number;
    lng: number;
  };

  /** Hiring & contact */
  payscale?: string;
  contact?: string;      // email
  contactNo: string;

  /** Additional info */
  remarks?: string;

  /** When doctor is required */
  requiredDate?: string | Timestamp;

  /** Audit */
  recruiterId?: string;
  recruiterEmail?: string;
  createdAt?: Timestamp;
}
