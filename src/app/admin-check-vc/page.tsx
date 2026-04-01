"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Fetch admin credentials from Firestore
      const adminDocRef = doc(db, "admin", "credentials");
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        setError("Admin credentials not configured. Please contact support.");
        setLoading(false);
        return;
      }

      const adminData = adminDoc.data();

      // Check credentials
      if (username === adminData.username && password === adminData.password) {
        // Store admin session
        sessionStorage.setItem("adminAuth", "true");
        sessionStorage.setItem("adminUsername", username);
        
        // Redirect to dashboard
        router.push("/admin-check-vc/dashboard");
      } else {
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: 40,
          }}
        >
          🔐
        </div>

        <h1 style={{ marginBottom: 8 }}>Admin Portal</h1>
        <p className="text-muted" style={{ marginBottom: 32 }}>
          Enter credentials to access dashboard
        </p>

        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-full"
            style={{ marginTop: 16, fontSize: 16, padding: "14px 20px" }}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Signing in...
              </>
            ) : (
              "🔓 Sign In"
            )}
          </button>
        </form>

        <p className="text-small text-muted" style={{ marginTop: 24 }}>
          Authorized access only
        </p>
      </div>
    </div>
  );
}
