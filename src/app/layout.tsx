import type { Metadata } from "next";
import "./globals.css";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

export const metadata: Metadata = {
  title: "Doctor Jobs",
  description: "Search doctor jobs nearby",
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
