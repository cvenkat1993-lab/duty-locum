"use client";

// ============================================================
// FILE: src/components/SpecialtyQuiz.tsx
// NEW FILE — create this
//
// Full-screen quiz modal with:
//  - 5 questions one at a time
//  - 5-minute countdown timer
//  - Tab/window-blur auto-fail
//  - 50 attempt lifetime limit
//  - Pass = 4/5 correct
//  - Writes result to Firestore on pass
// ============================================================

import { useState, useEffect, useRef, useCallback } from "react";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getQuizQuestions, QuizQuestion } from "@/data/quizQuestions";

const TOTAL_QUESTIONS = 5;
const PASS_MARK = 4;
const QUIZ_DURATION_SECONDS = 5 * 60; // 5 minutes
const MAX_ATTEMPTS = 50;

type QuizState = "idle" | "running" | "passed" | "failed" | "terminated" | "locked";

interface Props {
  user: any;
  department: string;
  currentAttempts: number;           // loaded by parent from Firestore
  onVerified: () => void;            // called when user passes — parent refreshes profile
  onClose: () => void;
}

export default function SpecialtyQuiz({
  user,
  department,
  currentAttempts,
  onVerified,
  onClose,
}: Props) {
  const [quizState, setQuizState] = useState<QuizState>(
    currentAttempts >= MAX_ATTEMPTS ? "locked" : "idle"
  );
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL_QUESTIONS).fill(null));
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [saving, setSaving] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const attemptsRef = useRef(currentAttempts);

  // ── Start quiz ────────────────────────────────────────────
  const startQuiz = useCallback(() => {
    const qs = getQuizQuestions(department);
    if (!qs) {
      alert("No questions available for this department yet. Please contact support.");
      return;
    }
    setQuestions(qs);
    setCurrentQ(0);
    setSelectedOption(null);
    setAnswers(Array(TOTAL_QUESTIONS).fill(null));
    setTimeLeft(QUIZ_DURATION_SECONDS);
    setScore(0);
    setTerminationReason("");
    setQuizState("running");
  }, [department]);

  // ── Timer countdown ───────────────────────────────────────
  useEffect(() => {
    if (quizState !== "running") {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizState]);

  // ── Tab / window blur detection ───────────────────────────
  useEffect(() => {
    if (quizState !== "running") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        terminateQuiz("You navigated away from the page.");
      }
    };

    const handleBlur = () => {
      terminateQuiz("The quiz window lost focus.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [quizState]);

  // ── Terminate (tab switch / blur) ─────────────────────────
  const terminateQuiz = useCallback(async (reason: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTerminationReason(reason);
    setQuizState("terminated");
    await logAttempt();
  }, []);

  // ── Time up ───────────────────────────────────────────────
  const handleTimeUp = useCallback(() => {
    submitQuiz(answers);
  }, [answers]);

  // ── Log attempt to Firestore ──────────────────────────────
  const logAttempt = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        quizAttempts: increment(1),
      });
      attemptsRef.current += 1;
    } catch (e) {
      console.error("Failed to log quiz attempt:", e);
    }
  };

  // ── Navigate between questions ────────────────────────────
  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    const updated = [...answers];
    updated[currentQ] = optionIndex;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentQ < TOTAL_QUESTIONS - 1) {
      setCurrentQ((q) => q + 1);
      setSelectedOption(answers[currentQ + 1]);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1);
      setSelectedOption(answers[currentQ - 1]);
    }
  };

  // ── Submit quiz ───────────────────────────────────────────
  const submitQuiz = useCallback(async (finalAnswers: (number | null)[]) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const correct = questions.reduce((count, q, i) => {
      return finalAnswers[i] === q.correctIndex ? count + 1 : count;
    }, 0);

    setScore(correct);
    setSaving(true);

    try {
      if (correct >= PASS_MARK) {
        // Pass — write verified status + increment attempts
        await updateDoc(doc(db, "users", user.uid), {
          specialtyVerified: true,
          verifiedDepartment: department,
          quizAttempts: increment(1),
          quizPassedAt: new Date(),
        });
        setQuizState("passed");
        onVerified();
      } else {
        // Fail — just log the attempt
        await logAttempt();
        setQuizState("failed");
      }
    } catch (e) {
      console.error("Error saving quiz result:", e);
    } finally {
      setSaving(false);
    }
  }, [questions, department, user, onVerified]);

  const handleSubmit = () => {
    submitQuiz(answers);
  };

  // ── Helpers ───────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const answeredCount = answers.filter((a) => a !== null).length;
  const attemptsLeft = MAX_ATTEMPTS - attemptsRef.current;
  const timerColor = timeLeft <= 60 ? "#d32f2f" : timeLeft <= 120 ? "#f57c00" : "#2e7d32";

  // ══════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════
  return (
    // Full-screen overlay — blocks everything behind it
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.75)",
      zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "white",
        borderRadius: 16,
        width: "100%", maxWidth: 640,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>

        {/* ── LOCKED ──────────────────────────────────────── */}
        {quizState === "locked" && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h2 style={{ marginBottom: 12 }}>Quiz Locked</h2>
            <p style={{ color: "#555", lineHeight: 1.6 }}>
              You have used all attempts for the{" "}
              <strong>{department}</strong> specialty verification quiz.
              Please mail support to unlock your account.
            </p>
            <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 24 }}>
              Close
            </button>
          </div>
        )}

        {/* ── IDLE (pre-quiz instructions) ────────────────── */}
        {quizState === "idle" && (
          <div style={{ padding: 40 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, marginBottom: 4 }}>Specialty Verification Quiz</h2>
                <p style={{ margin: 0, color: "#666", fontSize: 14 }}>{department}</p>
              </div>
              <button
                onClick={onClose}
                style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#999" }}
              >
                ×
              </button>
            </div>

            <div style={{ background: "#f0f7ff", borderRadius: 10, padding: 20, marginBottom: 24 }}>
              <h4 style={{ margin: "0 0 12px 0" }}>📋 Before you begin</h4>
              <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 2, color: "#333", fontSize: 14 }}>
                <li><strong>5 questions</strong> from {department}</li>
                <li>You need <strong>4 out of 5 correct</strong> to pass</li>
                <li><strong>5-minute timer</strong> starts when you click Begin</li>
                <li>Do <strong>not</strong> switch tabs or minimize the window — the quiz will be auto-terminated and the attempt counted</li>
                {/*<li>You have <strong>{attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining</strong> (out of {MAX_ATTEMPTS})</li>*/}
              </ul>
            </div>

            <div style={{ background: "#fff8e1", borderRadius: 10, padding: 16, marginBottom: 28, fontSize: 13, color: "#7a5300" }}>
              ⚠️ Verification is required to save your profile and apply for jobs.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={startQuiz} className="btn btn-primary" style={{ flex: 2 }}>
                Begin Quiz →
              </button>
            </div>
          </div>
        )}

        {/* ── RUNNING ─────────────────────────────────────── */}
        {quizState === "running" && questions.length > 0 && (
          <div style={{ padding: 32 }}>
            {/* Header bar */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 24, paddingBottom: 16,
              borderBottom: "1px solid #eee",
            }}>
              <div style={{ fontSize: 13, color: "#666" }}>
                Question <strong>{currentQ + 1}</strong> of {TOTAL_QUESTIONS}
              </div>
              {/* Timer */}
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontWeight: 700, fontSize: 18,
                color: timerColor,
                background: timeLeft <= 60 ? "#ffebee" : "#f5f5f5",
                padding: "6px 14px", borderRadius: 8,
                transition: "color 0.3s, background 0.3s",
              }}>
                ⏱ {formatTime(timeLeft)}
              </div>
              <div style={{ fontSize: 13, color: "#666" }}>
                {answeredCount}/{TOTAL_QUESTIONS} answered
              </div>
            </div>

            {/* Progress dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 24, justifyContent: "center" }}>
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentQ(i); setSelectedOption(answers[i]); }}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", border: "2px solid",
                    borderColor: i === currentQ ? "var(--primary)" : answers[i] !== null ? "#4caf50" : "#ddd",
                    background: i === currentQ ? "var(--primary)" : answers[i] !== null ? "#e8f5e9" : "white",
                    color: i === currentQ ? "white" : "#333",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question */}
            <div style={{
              background: "#f9f9f9", borderRadius: 10,
              padding: "20px 24px", marginBottom: 20,
              fontSize: 16, lineHeight: 1.6, fontWeight: 500, color: "#1a1a1a",
            }}>
              {currentQ + 1}. {questions[currentQ].question}
            </div>

            {/* Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {questions[currentQ].options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(idx)}
                    style={{
                      padding: "14px 18px", borderRadius: 10,
                      border: `2px solid ${isSelected ? "var(--primary)" : "#e0e0e0"}`,
                      background: isSelected ? "#e8f0fe" : "white",
                      textAlign: "left", cursor: "pointer",
                      fontSize: 14, color: "#222",
                      fontWeight: isSelected ? 600 : 400,
                      transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 12,
                    }}
                  >
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${isSelected ? "var(--primary)" : "#ccc"}`,
                      background: isSelected ? "var(--primary)" : "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, color: isSelected ? "white" : "#999", fontWeight: 700,
                    }}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={handlePrev}
                disabled={currentQ === 0}
                className="btn btn-secondary"
                style={{ opacity: currentQ === 0 ? 0.4 : 1 }}
              >
                ← Prev
              </button>

              {currentQ < TOTAL_QUESTIONS - 1 ? (
                <button onClick={handleNext} className="btn btn-primary" style={{ flex: 1 }}>
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving || answeredCount < TOTAL_QUESTIONS}
                  className="btn btn-success"
                  style={{
                    flex: 1,
                    opacity: answeredCount < TOTAL_QUESTIONS ? 0.5 : 1,
                  }}
                >
                  {saving ? "Submitting..." : `Submit Quiz (${answeredCount}/${TOTAL_QUESTIONS} answered)`}
                </button>
              )}
            </div>

            {answeredCount < TOTAL_QUESTIONS && currentQ === TOTAL_QUESTIONS - 1 && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#f57c00", marginTop: 10 }}>
                ⚠️ Please answer all questions before submitting
              </p>
            )}
          </div>
        )}

        {/* ── PASSED ──────────────────────────────────────── */}
        {quizState === "passed" && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
            <h2 style={{ color: "#2e7d32", marginBottom: 8 }}>Specialty Verified!</h2>
            <p style={{ color: "#555", fontSize: 16, marginBottom: 4 }}>
              You scored <strong>{score} out of {TOTAL_QUESTIONS}</strong>
            </p>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 28 }}>
              Your <strong>{department}</strong> specialty is now verified.
              You can save your profile and apply for jobs.
            </p>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#e8f5e9", border: "1px solid #a5d6a7",
              borderRadius: 24, padding: "8px 20px",
              color: "#2e7d32", fontWeight: 600, fontSize: 14,
              marginBottom: 28,
            }}>
              ✓ Verified — {department}
            </div>
            <br />
            <button onClick={onClose} className="btn btn-primary">
              Continue to Profile →
            </button>
          </div>
        )}

        {/* ── FAILED ──────────────────────────────────────── */}
        {quizState === "failed" && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
            <h2 style={{ marginBottom: 8 }}>Not Quite</h2>
            <p style={{ color: "#555", fontSize: 16, marginBottom: 4 }}>
              You scored <strong>{score} out of {TOTAL_QUESTIONS}</strong>
            </p>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
              You need {PASS_MARK}/5 to pass. 
              {/* You have{" "}
              <strong>{MAX_ATTEMPTS - attemptsRef.current} attempt{MAX_ATTEMPTS - attemptsRef.current !== 1 ? "s" : ""} remaining</strong>.*/}
            </p>

            {MAX_ATTEMPTS - attemptsRef.current > 0 ? (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                <button onClick={onClose} className="btn btn-secondary">
                  Close
                </button>
                <button onClick={startQuiz} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: "#d32f2f", fontWeight: 600, marginTop: 16 }}>
                  You have used all attempts. Please contact support.
                </p>
                <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 16 }}>
                  Close
                </button>
              </>
            )}
          </div>
        )}

        {/* ── TERMINATED (tab switch) ──────────────────────── */}
        {quizState === "terminated" && (
          <div style={{ padding: 40, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⛔</div>
            <h2 style={{ color: "#d32f2f", marginBottom: 8 }}>Quiz Terminated</h2>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 4 }}>
              {terminationReason}
            </p>
            <p style={{ color: "#555", fontSize: 14, marginBottom: 8 }}>
              This counts as one attempt. 
              {/* You have{" "}
              <strong>{MAX_ATTEMPTS - attemptsRef.current} attempt{MAX_ATTEMPTS - attemptsRef.current !== 1 ? "s" : ""} remaining</strong>. */}
            </p>

            {MAX_ATTEMPTS - attemptsRef.current > 0 ? (
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 24 }}>
                <button onClick={onClose} className="btn btn-secondary">
                  Close
                </button>
                <button onClick={startQuiz} className="btn btn-primary">
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <p style={{ color: "#d32f2f", fontWeight: 600, marginTop: 16 }}>
                  You have used all attempts. Please contact support.
                </p>
                <button onClick={onClose} className="btn btn-secondary" style={{ marginTop: 16 }}>
                  Close
                </button>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
