import type { Metadata } from "next";
import "./globals.css";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

export const metadata: Metadata = {
  title: {
    default: "Doctor Jobs — Find Doctor Jobs in India",
    template: "%s | Doctor Jobs",
  },
  description:
    "India's dedicated platform for doctor job search. Find full-time, part-time, locum, and contract positions at hospitals and clinics. Hospitals can post jobs and hire directly.",
  keywords: [
    "doctor jobs India",
    "medical jobs India",
    "hospital jobs",
    "locum doctor",
    "MBBS jobs",
    "MD jobs",
    "doctor recruitment India",
    "physician jobs India",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Doctor Jobs",
    title: "Doctor Jobs — Find Doctor Jobs in India",
    description:
      "India's dedicated platform for doctor job search. Find full-time, part-time, locum, and contract positions at hospitals and clinics across India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: "Inter, sans-serif" }}>
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
