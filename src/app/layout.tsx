import type { Metadata } from "next";
import "./globals.css";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
      default: "Duty Locum - Doctor Jobs — Find Doctor Jobs in India",
          template: "%s | Duty Locum - Doctor Jobs",
            },
              description:
                  "India's dedicated platform for doctor job search. Find full-time, part-time, locum, and contract positions at hospitals and clinics. Hospitals can post jobs and hire directly.",
                    keywords: [
                        "doctor jobs India",
                            "medical jobs India",
                                "hospital jobs",
                                    "Duty Locum",
                                        "locum doctor",
                                            "MBBS jobs",
                                                "MD jobs",
                                                    "doctor recruitment India",
                                                        "physician jobs India",
                                                          ],
                                                            openGraph: {
                                                                type: "website",
                                                                    locale: "en_IN",
                                                                        siteName: "Duty Locum - Doctor Jobs",
                                                                            title: "Duty Locum — Find Doctor Jobs in India",
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

                                                                                                                                                                                    {/* Google Analytics */}
                                                                                                                                                                                            <Script
                                                                                                                                                                                                      src="https://www.googletagmanager.com/gtag/js?id=G-9JB35L2R3G"
                                                                                                                                                                                                                strategy="afterInteractive"
                                                                                                                                                                                                                        />

                                                                                                                                                                                                                                <Script id="google-analytics" strategy="afterInteractive">
                                                                                                                                                                                                                                          {`
                                                                                                                                                                                                                                                      window.dataLayer = window.dataLayer || [];
                                                                                                                                                                                                                                                                  function gtag(){dataLayer.push(arguments);}
                                                                                                                                                                                                                                                                              gtag('js', new Date());
                                                                                                                                                                                                                                                                                          gtag('config', 'G-9JB35L2R3G');
                                                                                                                                                                                                                                                                                                    `}
                                                                                                                                                                                                                                                                                                            </Script>
                                                                                                                                                                                                                                                                                                                  </head>

                                                                                                                                                                                                                                                                                                                        <body style={{ fontFamily: "Inter, sans-serif" }}>
                                                                                                                                                                                                                                                                                                                                <GoogleMapsProvider>
                                                                                                                                                                                                                                                                                                                                          {children}
                                                                                                                                                                                                                                                                                                                                                  </GoogleMapsProvider>
                                                                                                                                                                                                                                                                                                                                                        </body>
                                                                                                                                                                                                                                                                                                                                                            </html>
                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                              }