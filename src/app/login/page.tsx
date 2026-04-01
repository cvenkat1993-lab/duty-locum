"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, provider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import Header from "@/components/Header";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("Login successful:", result.user.email);
      router.push("/");
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
      if (
        error.code === 'auth/cancelled-popup-request' ||
        error.code === 'auth/popup-closed-by-user'
      ) {
        return;
      }
      
      if (error.code === 'auth/popup-blocked') {
        alert("Pop-up blocked! Please allow pop-ups for this site.");
        return;
      }
      
      alert("Login failed: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{
          width: 80,
          height: 80,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 24px",
          fontSize: 40,
        }}>
          🏥
        </div>

        <h1 style={{ marginBottom: 8 }}>Doctor Jobs</h1>
        <p className="text-muted" style={{ marginBottom: 32 }}>
          Sign in to post jobs or apply to opportunities
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="btn btn-primary btn-full"
          style={{ fontSize: 16, padding: "14px 20px" }}
        >
          {isLoading ? (
            <>
              <div className="spinner"></div>
              Signing in...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 18 18" style={{ fill: "currentColor" }}>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path d="M9.003 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"/>
                <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.96H.957C.347 6.175 0 7.55 0 9.002c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                <path d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.002 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"/>
              </svg>
              Sign in with Google
            </>
          )}
        </button>

        <p className="text-small text-muted" style={{ marginTop: 24 }}>
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
    </>
  );
}
