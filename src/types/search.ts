export interface SearchFilters {
  lat?: number;
  lng?: number;
  hospitalName?: string;
  /** Human-readable text for area/pincode searches (e.g. "T Nagar, Chennai, Tamil Nadu 600017") */
  areaText?: string;
}
