// src/lib/schema.ts  ← NEW FILE
export function buildJobSchema(job: any) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.remarks || `${job.title} position at ${job.hospitalName}. ${job.department ? `Department: ${job.department}.` : ""} ${job.workType} role.`,
    "datePosted": job.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    "validThrough": job.requiredDate || undefined,
    "employmentType": mapWorkType(job.workType),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.hospitalName,
      "sameAs": `https://dutylocum.in/browse-jobs`,
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "postalCode": job.pincode,
        "addressCountry": "IN",
      },
      ...(job.hospGeo && {
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": job.hospGeo.lat,
          "longitude": job.hospGeo.lng,
        }
      }),
    },
    ...(job.payscale && {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "description": job.payscale,
          "unitText": "MONTH",
        },
      },
    }),
    "identifier": {
      "@type": "PropertyValue",
      "name": "Doctor Jobs",
      "value": job.id,
    },
    "directApply": true,
  };
}

// Google's accepted employment type values
function mapWorkType(workType: string): string {
  const map: Record<string, string> = {
    "Full-time": "FULL_TIME",
    "Part-time": "PART_TIME",
    "Contract": "CONTRACTOR",
    "Locum": "TEMPORARY",
    "Visiting": "OTHER",
  };
  return map[workType] || "OTHER";
}