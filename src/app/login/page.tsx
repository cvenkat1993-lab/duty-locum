import { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | Doctor Jobs — Sign In to Apply or Post Jobs",
  description:
    "Sign in to Doctor Jobs with your Google account. Doctors can apply for jobs; hospitals and recruiters can post vacancies and manage applications.",
};

export default function LoginPage() {
  return <LoginClient />;
}
