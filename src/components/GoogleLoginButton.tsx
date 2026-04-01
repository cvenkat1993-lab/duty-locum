"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/lib/firebase";  // ✅ Use shared provider
import { signInWithPopup } from "firebase/auth";

export default function GoogleLoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const login = async () => {
    // Prevent multiple clicks
    if (isLoading) {
      console.log("Login already in progress...");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider);  // ✅ Use shared provider
      console.log("Login successful:", result.user.email);
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
      // ✅ Silently handle user-cancelled actions
      if (
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        console.log("User cancelled login");
        return;  // Don't show error
      }
      
      // Show error for actual problems
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={login}
      disabled={isLoading}
      style={{
        padding: "12px 24px",
        background: isLoading ? "#ccc" : "#4285F4",
        color: "white",
        border: "none",
        borderRadius: 5,
        cursor: isLoading ? "not-allowed" : "pointer",
        fontSize: 16,
        fontWeight: 500,
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: isLoading ? 0.6 : 1,
        transition: "all 0.2s",
      }}
    >
      {isLoading ? (
        <>
          <div
            style={{
              width: 18,
              height: 18,
              border: "3px solid white",
              borderTop: "3px solid transparent",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#fff" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#fff" d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"/>
            <path fill="#fff" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
            <path fill="#fff" d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"/>
          </svg>
          <span>Sign in with Google</span>
        </>
      )}
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
