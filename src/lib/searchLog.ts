import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export interface SearchLogInput {
  /** What kind of search this was, based on which field the user used */
  searchType: "area" | "hospital" | "unknown";
  /** The raw text the user typed / selected (pincode, area name, or hospital name) */
  queryText: string;
  lat?: number;
  lng?: number;
  /** How many jobs matched this search, useful for spotting "dead" locations */
  resultsCount: number;
  /** Firebase uid if the person is logged in, otherwise null (anonymous visitor) */
  userId?: string | null;
}

/**
 * Logs a homepage search to Firestore (collection: "searchLogs").
 * Fire-and-forget — never throws, never blocks the UI, and failures
 * are only logged to console so a logging issue can never break search.
 */
export async function logSearch(input: SearchLogInput): Promise<void> {
  try {
    await addDoc(collection(db, "searchLogs"), {
      searchType: input.searchType,
      queryText: input.queryText || "",
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      resultsCount: input.resultsCount,
      userId: input.userId || null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log search:", error);
  }
}
