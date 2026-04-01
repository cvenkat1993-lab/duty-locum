"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FeedbackPage() {
  const [category, setCategory] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category || !feedback.trim()) {
      alert("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        category,
        feedback: feedback.trim(),
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
      });

      setSubmitted(true);
      setCategory("");
      setFeedback("");

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ paddingTop: 40, paddingBottom: 60, maxWidth: 700 }}>
        <div className="card">
          <h1 style={{ marginBottom: 12 }}>Feedback</h1>
          <p className="text-muted" style={{ marginBottom: 32 }}>
            We'd love to hear from you! Your feedback helps us improve our platform.
          </p>

          {submitted && (
            <div className="alert alert-success" style={{ marginBottom: 24 }}>
              ✓ Thank you for your feedback! We appreciate your input.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label form-label-required">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                <option value="Login">Login</option>
                <option value="Search Jobs">Search Jobs</option>
                <option value="Post Jobs">Post Jobs</option>
                <option value="Application Status">Application Status</option>
                <option value="Suggestions">Suggestions</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Feedback */}
            <div className="form-group">
              <label className="form-label form-label-required">What's on your mind?</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your thoughts, suggestions, or report issues..."
                rows={6}
                style={{
                  width: "100%",
                  padding: 12,
                  fontSize: 16,
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                required
              />
              <small className="form-help">
                Please be as detailed as possible to help us understand your feedback better.
              </small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-mobile-full"
              style={{ marginTop: 16 }}
            >
              {submitting ? (
                <>
                  <div className="spinner"></div>
                  Submitting...
                </>
              ) : (
                "📤 Submit Feedback"
              )}
            </button>
          </form>

          <div style={{ marginTop: 40, padding: 20, background: "#f0f7ff", borderRadius: 8 }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 16 }}>💡 Feedback Guidelines</h3>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8, fontSize: 14 }}>
              <li>Be specific about the issue or suggestion</li>
              <li>Include steps to reproduce if reporting a bug</li>
              <li>Mention which device/browser you're using if relevant</li>
              <li>We review all feedback within 48 hours</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
