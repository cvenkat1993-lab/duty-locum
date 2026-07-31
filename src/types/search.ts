export interface RegionBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SearchFilters {
  lat?: number;
  lng?: number;
  hospitalName?: string;
  /** Human-readable text for area/pincode searches (e.g. "T Nagar, Chennai, Tamil Nadu 600017") */
  areaText?: string;
  /**
   * Bounding box of the searched place (city/state/country), when available.
   * Used so broad searches like "Tamil Nadu" or "India" match jobs anywhere
   * inside that region, not just within a fixed radius of its centroid.
   */
  bounds?: RegionBounds;
}
