"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // Default to mobile to avoid flash
  const [mounted, setMounted] = useState(false);

  // Handle mounting and mobile detection
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Close menu if resizing to desktop
      if (!mobile && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    // Initial check
    checkMobile();
    setMounted(true);
    
    // Add resize listener
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobileMenuOpen]);

  // Close mobile menu when pathname changes (route navigation)
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
    setIsProfileMenuOpen(false);
  }, [pathname]);

  // Prevent flash during SSR
  if (!mounted) {
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          background: "white",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: 64,
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                color: "var(--foreground)",
              }}
            >
              <span style={{ fontSize: 28 }}>🏥</span>
              <span style={{ fontWeight: 700, fontSize: 18 }} className="hide-mobile">
                Doctor Jobs
              </span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Link href="/" style={{ textDecoration: "none", color: "var(--foreground)" }}>
                  Home
                </Link>
                <Link href="/browse-jobs" style={{ textDecoration: "none", color: "var(--foreground)" }}>
                  Browse Jobs
                </Link>
                <Link href="/about" style={{ textDecoration: "none", color: "var(--foreground)" }}>
                  About Us
                </Link>
                <Link href="/how-it-works" style={{ textDecoration: "none", color: "var(--foreground)" }}>
                  How It Works
                </Link>
                <Link href="/feedback" style={{ textDecoration: "none", color: "var(--foreground)" }}>
                  Feedback
                </Link>

                {/* Login/Profile Dropdown */}
                <div style={{ position: "relative" }}>
                  {user ? (
                    <>
                      <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "8px 12px",
                          borderRadius: 8,
                          fontSize: 14,
                        }}
                      >
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "var(--primary)",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 600,
                          }}
                        >
                          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                        <span>{user.displayName?.split(" ")[0] || "Account"}</span>
                        <span style={{ fontSize: 12 }}>▼</span>
                      </button>

                      {isProfileMenuOpen && (
                        <>
                          <div
                            style={{
                              position: "fixed",
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 999,
                            }}
                            onClick={() => setIsProfileMenuOpen(false)}
                          />
                          <div
                            style={{
                              position: "absolute",
                              top: "100%",
                              right: 0,
                              marginTop: 8,
                              background: "white",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              minWidth: 200,
                              zIndex: 1000,
                            }}
                          >
                            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.displayName}</p>
                              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--muted)" }}>
                                {user.email}
                              </p>
                            </div>
                            <Link
                              href="/profile"
                              onClick={() => setIsProfileMenuOpen(false)}
                              style={{
                                display: "block",
                                padding: "12px 16px",
                                textDecoration: "none",
                                color: "var(--foreground)",
                                fontSize: 14,
                              }}
                            >
                              👤 My Profile
                            </Link>
                            <Link
                              href="/recruiter-dashboard"
                              onClick={() => setIsProfileMenuOpen(false)}
                              style={{
                                display: "block",
                                padding: "12px 16px",
                                textDecoration: "none",
                                color: "var(--foreground)",
                                fontSize: 14,
                              }}
                            >
                              💼 My Jobs Posted
                            </Link>
                            <Link
                              href="/applied-jobs"
                              onClick={() => setIsProfileMenuOpen(false)}
                              style={{
                                display: "block",
                                padding: "12px 16px",
                                textDecoration: "none",
                                color: "var(--foreground)",
                                fontSize: 14,
                              }}
                            >
                              📋 My Applications
                            </Link>
                            <div style={{ borderTop: "1px solid var(--border)" }}>
                              <button
                                onClick={handleLogout}
                                style={{
                                  width: "100%",
                                  padding: "12px 16px",
                                  background: "none",
                                  border: "none",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  color: "var(--danger)",
                                }}
                              >
                                🚪 Logout
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <Link href="/login" className="btn btn-primary">
                      Login
                    </Link>
                  )}
                </div>

                {/* Post Job Buttons */}
                <Link href="/post-job" className="btn btn-success">
                  Post a Job
                </Link>
                <Link href="/post-locum" className="btn btn-secondary">
                  Post Locum Duty
                </Link>
              </nav>
            )}

            {/* Mobile Menu Toggle */}
            {isMobile && (
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 8,
                }}
              >
                ☰
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={closeMobileMenu}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 1998,
            }}
          />

          {/* Sidebar */}
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              bottom: 0,
              width: "80%",
              maxWidth: 320,
              background: "white",
              zIndex: 1999,
              overflowY: "auto",
              boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
            }}
          >
            {/* Close Button */}
            <div
              style={{
                padding: 16,
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 style={{ margin: 0 }}>Menu</h3>
              <button
                onClick={closeMobileMenu}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Menu Items */}
            <nav style={{ padding: "8px 0" }}>
              <Link
                href="/"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                🏠 Home
              </Link>

              <Link
                href="/browse-jobs"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                🔍 Browse Jobs
              </Link>

              {/* Login/Profile Section */}
              {user ? (
                <>
                  <div
                    style={{
                      padding: "16px 20px",
                      background: "#f5f5f5",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <span
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: "var(--primary)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 600,
                        }}
                      >
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.displayName}</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={closeMobileMenu}
                    style={{
                      display: "block",
                      padding: "16px 20px 16px 40px",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      fontSize: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    👤 My Profile
                  </Link>
                  <Link
                    href="/recruiter-dashboard"
                    onClick={closeMobileMenu}
                    style={{
                      display: "block",
                      padding: "16px 20px 16px 40px",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      fontSize: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    💼 My Jobs Posted
                  </Link>
                  <Link
                    href="/applied-jobs"
                    onClick={closeMobileMenu}
                    style={{
                      display: "block",
                      padding: "16px 20px 16px 40px",
                      textDecoration: "none",
                      color: "var(--foreground)",
                      fontSize: 14,
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    📋 My Applications
                  </Link>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "16px 20px 16px 40px",
                      background: "none",
                      border: "none",
                      borderBottom: "1px solid var(--border)",
                      textAlign: "left",
                      cursor: "pointer",
                      fontSize: 14,
                      color: "var(--danger)",
                    }}
                  >
                    🚪 Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  style={{
                    display: "block",
                    padding: "16px 20px",
                    textDecoration: "none",
                    color: "var(--foreground)",
                    fontSize: 16,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  🔐 Login
                </Link>
              )}

              <Link
                href="/post-job"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                💼 Post a Job
              </Link>

              <Link
                href="/post-locum"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                🩺 Post Locum Duty
              </Link>

              <Link
                href="/about"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                ℹ️ About Us
              </Link>

              <Link
                href="/how-it-works"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                ❓ How It Works
              </Link>

              <Link
                href="/feedback"
                onClick={closeMobileMenu}
                style={{
                  display: "block",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "var(--foreground)",
                  fontSize: 16,
                  borderBottom: "1px solid var(--border)",
                }}
              >
                💬 Feedback
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
