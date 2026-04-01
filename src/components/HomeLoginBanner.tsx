"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, fetchJobs } from "@/lib/firebase";
import GoogleLoginButton from "./GoogleLoginButton";

export default function HomeLoginBanner() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
    });
  }, []);

  return (
    <div
      style={{
        padding: 16,
        marginBottom: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      {loggedIn ? (
        <p style={{ color: "green" }}>
          ✅ You are logged in. Apply faster with saved details.
        </p>
      ) : (
        <>
          <p style={{ color: "#555" }}>
            🔒 Login to apply for jobs & view contact details
          </p>
          <GoogleLoginButton loggedIn={false} />
        </>
      )}
    </div>
  );
}
