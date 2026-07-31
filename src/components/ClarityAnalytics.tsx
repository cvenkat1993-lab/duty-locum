"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

// Any route starting with this prefix is treated as the admin panel
// and will NOT get Microsoft Clarity tracking.
const EXCLUDED_PATH_PREFIXES = ["/admin-check-vc"];

// Set NEXT_PUBLIC_CLARITY_PROJECT_ID in your .env.local, or replace the
// fallback string below directly with your Clarity project ID.
const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "YOUR_CLARITY_PROJECT_ID";

export default function ClarityAnalytics() {
  const pathname = usePathname() || "";

  const isExcluded = EXCLUDED_PATH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isExcluded) {
    return null;
  }

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`
        (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
      `}
    </Script>
  );
}
