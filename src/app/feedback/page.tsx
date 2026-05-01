import { Metadata } from "next";
import FeedbackClient from "./FeedbackClient";

export const metadata: Metadata = {
  title: "Feedback | Duty Locum - Doctor Jobs",
  description:
    "Share your feedback, suggestions, or report issues with the Duty Locum - Doctor Jobs platform. We review all feedback within 48 hours.",
};

export default function FeedbackPage() {
  return <FeedbackClient />;
}
