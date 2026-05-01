import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | Duty Locum - Doctor Jobs — Sign In to Apply or Post Jobs",
  description:
    "Sign in to Duty Locum - Doctor Jobs with your Google account. Doctors can apply for jobs; hospitals and recruiters can post vacancies and manage applications.",
};

export default function LoginPage() {
  return <LoginClient />;
}
