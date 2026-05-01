"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);  // About/How dropdown
  const [isMobileInfoOpen, setIsMobileInfoOpen] = useState(false); // Mobile subsection
  const [isMobile, setIsMobile] = useState(true);
  const [mounted, setMounted] = useState(false);
  const infoMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    checkMobile();
    setMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsInfoMenuOpen(false);
  }, [pathname]);

  // Close info dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (infoMenuRef.current && !infoMenuRef.current.contains(e.target as Node)) {
        setIsInfoMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const handleLogout = async () => {
    await signOut(auth);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const navLinkStyle = {
    textDecoration: "none",
    color: "var(--foreground)",
    fontSize: 14,
  };

  const mobileLinkStyle = {
    display: "block",
    padding: "16px 20px",
    textDecoration: "none",
    color: "var(--foreground)",
    fontSize: 16,
    borderBottom: "1px solid var(--border)",
  };

  const mobileSubLinkStyle = {
    display: "block",
    padding: "14px 20px 14px 40px",
    textDecoration: "none",
    color: "var(--foreground)",
    fontSize: 15,
    borderBottom: "1px solid var(--border)",
    background: "#fafafa",
  };

  return (
    <>
      <header style={{
        background: "white",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>

            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "var(--foreground)" }}>
              <span style={{ fontSize: 28 }}>🏥</span>
              <span style={{ fontWeight: 700, fontSize: 18 }} className="hide-mobile">Duty Locum - Doctor Jobs</span>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <Link href="/browse-jobs" style={navLinkStyle}>Browse Jobs</Link>

                {/* ── About dropdown ── */}
                <div ref={infoMenuRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setIsInfoMenuOpen(!isInfoMenuOpen)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4,
                      fontSize: 14, color: "var(--foreground)", padding: 0,
                    }}
                  >
                    About
                    <span style={{ fontSize: 10, marginTop: 1 }}>{isInfoMenuOpen ? "▲" : "▼"}</span>
                  </button>

                  {isInfoMenuOpen && (
                    <div style={{
                      position: "absolute", top: "calc(100% + 12px)", left: "50%",
                      transform: "translateX(-50%)",
                      background: "white", border: "1px solid var(--border)",
                      borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                      minWidth: 180, zIndex: 1100, overflow: "hidden",
                    }}>
                      <Link
                        href="/about"
                        onClick={() => setIsInfoMenuOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "14px 18px", textDecoration: "none",
                          color: "var(--foreground)", fontSize: 14,
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ fontSize: 16 }}>ℹ️</span>
                        <div>
                          <div style={{ fontWeight: 500 }}>About Us</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Our mission &amp; story</div>
                        </div>
                      </Link>
                      <Link
                        href="/how-it-works"
                        onClick={() => setIsInfoMenuOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "14px 18px", textDecoration: "none",
                          color: "var(--foreground)", fontSize: 14,
                          borderBottom: "1px solid var(--border)",
                        }}
                      >
                        <span style={{ fontSize: 16 }}>❓</span>
                        <div>
                          <div style={{ fontWeight: 500 }}>How It Works</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>For doctors &amp; hospitals</div>
                        </div>
                      </Link>
                      <Link
                        href="/feedback"
                        onClick={() => setIsInfoMenuOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "14px 18px", textDecoration: "none",
                          color: "var(--foreground)", fontSize: 14,
                        }}
                      >
                        <span style={{ fontSize: 16 }}>💬</span>
                        <div>
                          <div style={{ fontWeight: 500 }}>Feedback</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>Share your thoughts</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div style={{ position: "relative" }}>
                  {user ? (
                    <>
                      <button
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 8,
                          padding: "8px 12px", borderRadius: 8, fontSize: 14,
                        }}
                      >
                        <span style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: "var(--primary)", color: "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontWeight: 600,
                        }}>
                          {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                        <span>{user.displayName?.split(" ")[0] || "Account"}</span>
                        <span style={{ fontSize: 12 }}>▼</span>
                      </button>

                      {isProfileMenuOpen && (
                        <>
                          <div style={{ position: "fixed", inset: 0, zIndex: 999 }} onClick={() => setIsProfileMenuOpen(false)} />
                          <div style={{
                            position: "absolute", top: "100%", right: 0, marginTop: 8,
                            background: "white", border: "1px solid var(--border)",
                            borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            minWidth: 200, zIndex: 1000,
                          }}>
                            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.displayName}</p>
                              <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--muted)" }}>{user.email}</p>
                            </div>
                            {[
                              { href: "/profile", label: "👤 My Profile" },
                              { href: "/recruiter-dashboard", label: "💼 My Jobs Posted" },
                              { href: "/applied-jobs", label: "📋 My Applications" },
                            ].map(({ href, label }) => (
                              <Link key={href} href={href} onClick={() => setIsProfileMenuOpen(false)}
                                style={{ display: "block", padding: "12px 16px", textDecoration: "none", color: "var(--foreground)", fontSize: 14 }}>
                                {label}
                              </Link>
                            ))}
                            <div style={{ borderTop: "1px solid var(--border)" }}>
                              <button onClick={handleLogout} style={{
                                width: "100%", padding: "12px 16px", background: "none", border: "none",
                                textAlign: "left", cursor: "pointer", fontSize: 14, color: "var(--danger)",
                              }}>
                                🚪 Logout
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <Link href="/login" className="btn btn-primary">Login</Link>
                  )}
                </div>

                <Link href="/post-job" className="btn btn-success">Post a Job</Link>
                <Link href="/post-locum" className="btn btn-secondary">Post Locum Duty</Link>
              </nav>
            )}

            {/* Mobile menu toggle */}
            {isMobile && (
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", padding: 8 }}>
                ☰
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {isMobile && isMobileMenuOpen && (
        <>
          <div onClick={closeMobileMenu} style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1998,
          }} />

          <div style={{
            position: "fixed", top: 0, right: 0, bottom: 0,
            width: "80%", maxWidth: 320, background: "white",
            zIndex: 1999, overflowY: "auto", boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
          }}>
            <div style={{
              padding: 16, borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <h3 style={{ margin: 0 }}>Menu</h3>
              <button onClick={closeMobileMenu} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer" }}>×</button>
            </div>

            <nav style={{ padding: "8px 0" }}>
              <Link href="/browse-jobs" onClick={closeMobileMenu} style={mobileLinkStyle}>🔍 Browse Jobs</Link>

              {/* User section */}
              {user ? (
                <>
                  <div style={{ padding: "16px 20px", background: "#f5f5f5", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{
                        width: 40, height: 40, borderRadius: "50%", background: "var(--primary)",
                        color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600,
                      }}>
                        {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </span>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{user.displayName}</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "var(--muted)" }}>{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile" onClick={closeMobileMenu} style={{ ...mobileLinkStyle, paddingLeft: 40, fontSize: 14 }}>👤 My Profile</Link>
                  <Link href="/recruiter-dashboard" onClick={closeMobileMenu} style={{ ...mobileLinkStyle, paddingLeft: 40, fontSize: 14 }}>💼 My Jobs Posted</Link>
                  <Link href="/applied-jobs" onClick={closeMobileMenu} style={{ ...mobileLinkStyle, paddingLeft: 40, fontSize: 14 }}>📋 My Applications</Link>
                  <button onClick={handleLogout} style={{
                    width: "100%", padding: "16px 20px 16px 40px", background: "none", border: "none",
                    borderBottom: "1px solid var(--border)", textAlign: "left",
                    cursor: "pointer", fontSize: 14, color: "var(--danger)",
                  }}>🚪 Logout</button>
                </>
              ) : (
                <Link href="/login" onClick={closeMobileMenu} style={mobileLinkStyle}>🔐 Login</Link>
              )}

              <Link href="/post-job" onClick={closeMobileMenu} style={mobileLinkStyle}>💼 Post a Job</Link>
              <Link href="/post-locum" onClick={closeMobileMenu} style={mobileLinkStyle}>🩺 Post Locum Duty</Link>

              {/* ── About section with expand/collapse ── */}
              <button
                onClick={() => setIsMobileInfoOpen(!isMobileInfoOpen)}
                style={{
                  width: "100%", padding: "16px 20px", background: "none", border: "none",
                  borderBottom: "1px solid var(--border)", textAlign: "left",
                  cursor: "pointer", fontSize: 16, color: "var(--foreground)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}
              >
                <span>ℹ️ About</span>
                <span style={{ fontSize: 12 }}>{isMobileInfoOpen ? "▲" : "▼"}</span>
              </button>

              {isMobileInfoOpen && (
                <>
                  <Link href="/about" onClick={closeMobileMenu} style={mobileSubLinkStyle}>
                    ℹ️ About Us
                  </Link>
                  <Link href="/how-it-works" onClick={closeMobileMenu} style={mobileSubLinkStyle}>
                    ❓ How It Works
                  </Link>
                  <Link href="/feedback" onClick={closeMobileMenu} style={mobileSubLinkStyle}>
                    💬 Feedback
                  </Link>
                </>
              )}


            </nav>
          </div>
        </>
      )}
    </>
  );
}
