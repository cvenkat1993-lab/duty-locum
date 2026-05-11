// ============================================================
// FILE: src/lib/saveUserOnLogin.ts
// NEW FILE
// Called right after signInWithPopup succeeds everywhere.
// Writes basic data to Firestore only if no record exists yet.
// ============================================================

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function saveUserOnLogin(user: {
  uid: string;
  displayName: string | null;
  email: string | null;
}) {
  try {
    const userRef = doc(db, "users", user.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName || "",
        email: user.email || "",
        profileComplete: false,
        createdAt: serverTimestamp(),
      });
    }
  } catch (e) {
    // Non-blocking — profile save on login is best-effort
    console.warn("saveUserOnLogin failed:", e);
  }
}
