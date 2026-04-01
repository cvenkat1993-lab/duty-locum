import { Job } from "@/types/job";

export const jobs: Job[] = [
  {
    id: "job1",
    title: "MBBS Doctor",
    hospitalName: "Apollo Hospital",
    hospitalType: "Hospital",
    pincode: "560001",

    department: "General Medicine",
    workType: "Full-time",

    payscale: "₹80,000 – ₹1,20,000",
    contact: "hr@apollohospitals.com",
    contactNo: "9876543210",

    remarks: "Immediate requirement",
    requiredDate: undefined,

    hospGeo: {
      lat: 12.9716,
      lng: 77.5946,
    },
  },
];
