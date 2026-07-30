import Header from "@/components/Header";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

/**
 * Shared layout for static/legal pages (Privacy Policy, Terms & Conditions,
 * and any future pages like Refund Policy, About, etc.)
 *
 * - Header is rendered here (already includes the mobile hamburger menu).
 * - Footer is NOT rendered here — it's already global via app/layout.tsx,
 *   so it will appear automatically on every page including this one.
 * - Just pass a `title` and put your content as children.
 */
export default function LegalPageLayout({
  title,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <Header />

      <div className="container" style={{ maxWidth: 820, paddingTop: 40, paddingBottom: 60 }}>
        <div className="card" style={{ padding: "32px 36px", lineHeight: 1.7 }}>
          {"DUTYLOCUM TERMS & CONDITIONS"}
          <h1 style={{ marginBottom: 4 }}>{title}</h1>

          {lastUpdated && (
            <p className="text-muted text-small" style={{ marginBottom: 28 }}>
              Last updated: {lastUpdated}
            </p>
          )}

          {`Effective Date: [ 01-05-2026]

Last Updated: [01-08-2026]

"1. Introduction"

Welcome to DutyLocum.in ("DutyLocum", "Platform", "Website", "Application", "we", "our", or "us").

These Terms and Conditions ("Terms") govern your access to and use of the DutyLocum website, mobile application, APIs, communication channels, and all related services provided through the platform.

DutyLocum is an online healthcare staffing marketplace that facilitates connections between healthcare establishments and qualified healthcare professionals for locum, temporary, contractual, part-time, full-time, emergency, and other employment opportunities.

By creating an account, browsing the Platform, posting opportunities, applying for jobs, uploading documents, or otherwise using the Platform, you agree to be legally bound by these Terms.

If you do not agree with these Terms, you must discontinue use of the Platform immediately.

2. About DutyLocum

DutyLocum is a technology platform that enables healthcare institutions and healthcare professionals to discover and connect with each other.

The Platform may facilitate:

Locum doctor hiring
Permanent recruitment
Temporary staffing
Emergency duty coverage
Shift-based assignments
Specialist consultations
Hospital recruitment
Healthcare networking
Communication between employers and healthcare professionals

DutyLocum acts solely as an intermediary technology service.

DutyLocum is not:

an employer,
an employment agency,
a recruitment consultant,
a staffing contractor,
a healthcare provider,
a hospital,
a clinic,
a nursing home,
or a medical practitioner.

DutyLocum does not become a party to any employment, contractual, consulting, professional, or commercial relationship entered into between users of the Platform.

3. Definitions

For the purposes of these Terms:

Platform means DutyLocum.in, its mobile applications, APIs, software, databases, communication systems, and related services.

Healthcare Professional means any doctor, dentist, specialist, consultant, surgeon, resident, medical officer, nurse, physiotherapist, psychologist, pharmacist, allied healthcare professional, or other registered medical practitioner using the Platform.

Employer includes hospitals, clinics, nursing homes, diagnostic centres, laboratories, medical colleges, healthcare companies, NGOs, government institutions, corporate healthcare providers, or any authorized recruiter.

User means any individual or organization accessing the Platform.

Content means any text, images, videos, certificates, resumes, profile information, job listings, comments, messages, reviews, ratings, documents, logos, trademarks, or other information uploaded or displayed on the Platform.

Job Listing means any employment opportunity, locum assignment, consultancy, temporary duty, shift requirement, or recruitment advertisement posted on the Platform.

Personal Data means any information relating to an identified or identifiable individual as defined under applicable law.

4. Acceptance of Terms

By using DutyLocum, you acknowledge that:

You have read these Terms.
You understand these Terms.
You agree to comply with these Terms.
You are legally capable of entering into a binding agreement.
You agree to our Privacy Policy and any other applicable policies published on the Platform.

If you are using the Platform on behalf of an organization, you represent and warrant that you have authority to bind that organization to these Terms.

5. Eligibility

To use DutyLocum, you must:

be at least 18 years of age;
possess the legal capacity to enter into contracts;
provide accurate and complete information;
not be prohibited by applicable law from using the Platform.

Healthcare professionals must additionally possess all registrations, licenses, and qualifications required under applicable law for the services they intend to provide.

6. User Registration

Certain features require registration.

You may register using:

Mobile Number
Email Address
Google Sign-In
Other authentication methods made available by DutyLocum

You agree that all information submitted during registration is accurate, current, and complete.

You are responsible for updating your profile whenever your information changes.

7. Account Security

You are solely responsible for:

maintaining the confidentiality of your login credentials;
safeguarding your account;
all activities conducted through your account;
immediately notifying DutyLocum of unauthorized access or suspected security breaches.

DutyLocum shall not be liable for any loss arising from unauthorized use of your account resulting from your failure to maintain adequate security.

8. Healthcare Professional Accounts

Healthcare professionals may create profiles containing:

Name
Qualification
Medical Registration Number
Medical Council Registration
Experience
Specialization
Current Employment
Languages Spoken
Skills
Certifications
Resume
Availability
Preferred Locations
Consultation Charges (if applicable)
Profile Photograph
Professional Biography

Users are responsible for ensuring that all information provided is truthful, complete, and current.

Providing false or misleading professional information may result in suspension or permanent removal from the Platform.

9. Employer Accounts

Healthcare institutions may create employer profiles to recruit healthcare professionals.

Employers may include:

Hospitals
Clinics
Nursing Homes
Medical Colleges
Diagnostic Centres
Laboratories
Corporate Hospitals
Healthcare Startups
Government Institutions
NGOs
Recruitment Agencies (where permitted)

Employers represent that they are authorized to recruit for the positions they advertise.

10. Verification

DutyLocum may, at its discretion, verify:

Mobile Number
Email Address
Medical Registration Number
Identity Documents
Hospital Information
GST Details
Business Registration
Professional Certificates
Government-issued IDs
Organization Authorization

Verification by DutyLocum does not constitute a guarantee of authenticity, competence, licensing, employment eligibility, or legal compliance.

Healthcare institutions remain solely responsible for independently verifying the qualifications, licenses, registrations, and credentials of any healthcare professional before engagement.

Similarly, healthcare professionals are responsible for verifying the legitimacy of employers before accepting any opportunity.

11. User Responsibilities

Users agree to:

provide accurate information;
comply with applicable laws and professional regulations;
maintain professional conduct;
respect other users;
refrain from posting misleading information;
maintain confidentiality where required;
promptly update inaccurate information.

Users shall not impersonate another individual or organization.

12. Medical Registration Responsibility

DutyLocum may display medical registration details supplied by users.

However:

DutyLocum does not certify that a registration is valid.
DutyLocum does not continuously monitor license status.
DutyLocum does not guarantee active registration.

Healthcare professionals remain solely responsible for maintaining valid licenses and registrations.

Healthcare establishments remain solely responsible for verifying those credentials before appointment or engagement.

13. Nature of the Platform

DutyLocum is an online technology platform that facilitates interactions between healthcare establishments seeking healthcare professionals and healthcare professionals seeking employment or professional engagements.

The Platform enables Users to:

Create professional profiles;
Search and apply for employment opportunities;
Post locum, contractual, temporary, permanent, emergency, or shift-based job opportunities;
Communicate with other users through features made available by the Platform;
Upload documents and credentials;
Receive notifications regarding opportunities and account activity.

DutyLocum does not participate in employment negotiations, salary discussions, contractual arrangements, or professional decisions between Users. Any agreement entered into between Users is solely between those Users.

14. Job Listings

Employers may publish job listings for genuine healthcare opportunities, including but not limited to:

Locum assignments;
Permanent employment;
Part-time engagements;
Full-time employment;
Emergency duty coverage;
On-call assignments;
Visiting consultant opportunities;
Telemedicine opportunities (where legally permissible);
Academic positions;
Research assignments.

Each job listing should include, where applicable:

Organization name;
Position title;
Specialization required;
Qualification requirements;
Registration requirements;
Location;
Working hours;
Duration;
Compensation or remuneration (if disclosed);
Contact information through the Platform;
Additional eligibility criteria.

DutyLocum reserves the right to edit, reject, suspend, or remove any listing that violates these Terms or applicable law.

15. Employer Responsibilities

Employers using the Platform agree that they shall:

Publish only genuine employment opportunities;
Provide accurate and complete information;
Clearly describe qualifications and responsibilities;
Comply with all applicable labour, healthcare, and professional laws;
Verify professional registrations before engagement;
Conduct independent background verification where appropriate;
Honour employment commitments made to healthcare professionals;
Maintain confidentiality of applicant information;
Use applicant information only for legitimate recruitment purposes.

Employers shall not:

Publish fake vacancies;
Collect personal information for unauthorized purposes;
Demand unlawful payments from applicants;
Misrepresent salary, benefits, or working conditions;
Use misleading or deceptive recruitment practices;
Discriminate in violation of applicable law.

DutyLocum may suspend or terminate Employer accounts that engage in fraudulent or unethical recruitment practices.

16. Healthcare Professional Responsibilities

Healthcare professionals agree that they shall:

Provide truthful professional information;
Maintain valid professional registrations and licenses;
Upload authentic qualifications and certifications;
Attend scheduled interviews or duties where accepted;
Conduct themselves professionally while interacting with employers;
Maintain patient confidentiality and professional ethics;
Comply with applicable medical laws and regulations.

Healthcare professionals shall not:

Misrepresent qualifications;
Upload forged certificates;
Impersonate another professional;
Apply using false identities;
Mislead employers regarding availability;
Engage in fraudulent practices.

DutyLocum may remove profiles containing false professional information without prior notice.

17. Verification of Credentials

DutyLocum may request verification of professional credentials at any time.

Verification may include:

Medical Council Registration;
National Medical Commission (NMC) registration;
State Medical Council registration acknowledge that verification performed by DutyLocum is limited in scope and does not constitute certification;
Nursing Council registration;
Dental Council registration;
Allied Health registrations;
Government-issued identity documents;
Educational qualifications;
Employment history;
Hospital verification.

Users acknowledge that verification performed by DutyLocum is limited in scope and does not constitute certification, endorsement, or guarantee of professional competence.

18. Applications and Recruitment Process

Healthcare professionals may apply to job opportunities using features available on the Platform.

Submitting an application does not guarantee:

Selection;
Interview;
Employment;
Assignment;
Compensation;
Future opportunities.

Employers retain sole discretion regarding recruitment decisions.

DutyLocum shall not be liable for decisions made by employers during recruitment.

19. Communication Between Users

The Platform may provide messaging, chat, email, SMS, push notifications, telephone masking, or other communication features.

Users agree that communications conducted through the Platform shall remain:

Professional;
Respectful;
Lawful;
Relevant to employment or healthcare opportunities.

DutyLocum may monitor, store, or review communications where permitted by law for:

Fraud prevention;
Security;
Customer support;
Legal compliance;
Abuse investigations.

DutyLocum does not routinely review every communication exchanged between Users.

20. Professional Conduct

Users shall conduct themselves professionally at all times.

Users shall not:

Harass another user;
Use abusive language;
Threaten violence;
Discriminate on the basis of religion, caste, race, ethnicity, gender, disability, age, marital status, sexual orientation, or other protected characteristics;
Engage in sexual harassment;
Intimidate other users;
Publish defamatory content.

Violation of this section may result in immediate suspension or permanent removal.

21. User-Generated Content

Users retain ownership of content they upload, including:

Profile information;
Resumes;
Certificates;
Images;
Educational records;
Job descriptions;
Hospital information;
Reviews;
Comments;
Messages.

By uploading content, Users grant DutyLocum a worldwide, non-exclusive, royalty-free, revocable license to:

Host;
Store; not use automated software, bots, scripts, artificial intelligence systems, crawlers, or similar technologies
Display;
Process;
Reproduce;
Modify for formatting purposes;
Distribute;
Publish within the Platform.

This license exists solely for operating and improving the Platform.

Users warrant that they possess all necessary rights to upload such content.

22. Prohibited Content

Users shall not upload content that:

Is false or misleading;
Contains forged certificates;
Violates intellectual property rights;
Promotes unlawful activities;
Contains malware or malicious code;
Contains obscene or offensive material;
Promotes hate speech;
Violates patient confidentiality;
Contains confidential hospital information without authorization;
Contains another person's personal information without consent.

DutyLocum may remove prohibited content without notice.

23. Reviews and Ratings

The Platform may allow reviews, ratings, recommendations, endorsements, or feedback.

Users agree that reviews shall:

Be truthful;
Be based on genuine experiences;
Avoid defamatory statements;
Avoid abusive language;
Not disclose confidential information.

DutyLocum reserves the right to moderate, edit, or remove reviews that violate these Terms.

24. Intellectual Property

All intellectual property relating to the Platform, including but not limited to:

Software;
Source code;
Databases;
Logos;
Trademarks;
Service marks;
Designs;
User interfaces;
Graphics;
Documentation;
Platform architecture;
Features;
Algorithms;
Branding;
Domain names;

is owned by or licensed to DutyLocum and protected under applicable intellectual property laws.

Except as expressly permitted, Users shall not:

Copy;
Modify;
Reverse engineer;
Redistribute;
Commercially exploit;
Sell;
License;
Republish;
Create derivative works from the Platform.
25. Acceptable Use Policy

Users shall not:

Attempt unauthorized access to the Platform;
Interfere with Platform security;
Circumvent authentication mechanisms;
Scrape or harvest user data;
Use automated bots without written permission;
Reverse engineer APIs;
Launch denial-of-service attacks;
Upload malicious software;
Introduce viruses;
Attempt to access restricted databases;
Interfere with other Users' accounts.

DutyLocum reserves the right to investigate and report unlawful activities to appropriate authorities.

26. Artificial Intelligence and Automated Systems

Users shall not use automated software, bots, scripts, artificial intelligence systems, crawlers, or similar technologies to:

Automatically create accounts;
Scrape job listings;
Harvest user information;
Generate fake applications;
Manipulate search rankings;
Circumvent security measures.

DutyLocum may deploy automated systems to detect fraud, spam, fake accounts, or misuse of the Platform.

27. Fraud Prevention

DutyLocum may investigate suspected fraud, including:

Fake hospitals;
Fake doctor profiles;
Identity theft;
Forged documents;
Duplicate accounts;
Payment fraud;
Credential fraud;
Misrepresentation.

DutyLocum reserves the right to suspend accounts while investigations are ongoing.

Where legally required, DutyLocum may cooperate with law enforcement agencies and regulatory authorities.

28. Platform Availability

DutyLocum strives to provide uninterrupted access but does not guarantee that the Platform will always be:

Available;
Error-free;
Secure;
Free from interruptions;
Compatible with every device.

Scheduled maintenance, technical failures, internet disruptions, third-party outages, or force majeure events may affect availability.

DutyLocum shall not be liable for losses arising from temporary unavailability of the Platform.

Excellent. We'll now complete the Terms & Conditions with the legal protections typically found in enterprise platforms while tailoring them for a healthcare staffing marketplace.

29. Subscription Plans and Paid Services

DutyLocum may offer free and paid services to healthcare professionals, employers, or other users. Paid services may include premium memberships, featured job postings, highlighted profiles, recruitment packages, advertising opportunities, verification services, or other value-added features.

The scope, pricing, duration, and features of any paid service shall be displayed on the Platform at the time of purchase.

DutyLocum reserves the right to introduce, modify, discontinue, or replace any subscription plan or paid feature at its discretion.

30. Payments

Where applicable, payments made through the Platform shall be processed using authorized third-party payment service providers.

Users agree that:

All payment information provided must be accurate and authorized.
Applicable taxes, duties, levies, or government charges shall be borne by the User unless otherwise stated.
DutyLocum does not store complete debit card, credit card, UPI PIN, or banking credentials on its own servers unless specifically disclosed.
Payment processing is subject to the terms and conditions of the respective payment gateway or banking institution.

DutyLocum shall not be responsible for payment failures caused by banks, payment gateways, internet outages, or other third-party systems.

31. Refunds and Cancellations

Unless otherwise specified:

Subscription fees are generally non-refundable once the subscribed service has commenced.
Charges for featured listings or promotional services are non-refundable after publication.
Refund requests arising from duplicate payments, technical errors attributable to DutyLocum, or other exceptional circumstances may be considered at DutyLocum's sole discretion.
Where a refund is approved, it will ordinarily be processed through the original payment method within a reasonable period, subject to the timelines of the payment provider.

Separate Refund and Cancellation Policies published by DutyLocum, if any, shall form part of these Terms.

32. Taxes

Users are responsible for complying with all applicable tax laws.

Healthcare professionals and employers shall be responsible for reporting, withholding, collecting, or remitting any taxes applicable to payments arising from engagements arranged through the Platform.

DutyLocum does not provide tax advice.

33. Third-Party Services

The Platform may integrate or interact with third-party services, including but not limited to:

Google Sign-In
Google Maps
Google Firebase
Google Analytics
Google Play Services
Apple App Store Services
SMS providers
Email service providers
Payment gateways
Cloud hosting providers
Video conferencing services
Calendar integrations
Notification services

Such services are governed by their own terms and privacy policies.

DutyLocum is not responsible for the availability, security, accuracy, or performance of third-party services.

34. Google APIs and Google User Data

Where Users choose to sign in or interact with Google services, DutyLocum may access certain information as authorized by the User.

Depending on the features used, this may include:

Name
Email address
Profile photograph
Google account identifier
Calendar information (if separately authorized)
Location information (if separately authorized)

DutyLocum will use Google user data only for the purposes for which authorization has been granted by the User.

DutyLocum will not sell Google user data to third parties.

Google user data will not be used for unrelated advertising, profiling, or any purpose prohibited by applicable Google API policies.

Users may revoke Google permissions through their Google Account settings or by disconnecting their Google account from DutyLocum.

35. Mobile Application Permissions

The DutyLocum mobile application may request certain device permissions to enable functionality.

These permissions may include:

Camera (for profile photographs and document capture)
Photo library and storage (for uploading resumes and certificates)
Notifications (for job alerts and account updates)
Location (to display nearby opportunities, where enabled by the User)
Contacts (only if a specific feature requires it and the User grants permission)
Calendar (to add interviews or duty schedules where authorized)
Microphone (for voice or video features, if available)

Permissions may be granted or withdrawn through the device settings. Some features may not function as intended if required permissions are denied.

36. Electronic Communications

By creating an account or using the Platform, Users consent to receive electronic communications from DutyLocum, including:

Account notifications
Verification messages
Security alerts
Job recommendations
Application updates
System announcements
Promotional communications (where permitted)

Users may opt out of promotional communications where such an option is provided. Certain transactional or security-related communications cannot be disabled.

37. Confidentiality

Users may obtain confidential information through the Platform, including recruitment information, business details, contact information, or professional records.

Users agree not to disclose, reproduce, or misuse confidential information except as necessary for legitimate recruitment or professional purposes and in compliance with applicable law.

38. Disclaimer Regarding Employment

DutyLocum is not a party to any employment, consultancy, or contractual relationship between Users.

DutyLocum does not guarantee:

Employment;
Selection;
Interviews;
Candidate availability;
Salary levels;
Working conditions;
Continuity of assignments;
Employer performance;
Candidate performance.

All employment decisions are made solely by the relevant Users.

39. Disclaimer Regarding Medical Services

DutyLocum does not provide medical diagnosis, treatment, clinical advice, or healthcare services.

DutyLocum is not responsible for:

Patient care;
Clinical decisions;
Professional negligence;
Medical malpractice;
Prescription practices;
Hospital administration;
Treatment outcomes;
Surgical procedures;
Clinical errors.

Healthcare professionals remain solely responsible for their professional conduct and compliance with applicable medical laws and ethical standards.

Healthcare establishments remain responsible for patient safety, credential verification, supervision, and statutory compliance.

40. No Warranty

The Platform is provided on an "as is" and "as available" basis.

To the fullest extent permitted by law, DutyLocum disclaims all warranties, whether express, implied, statutory, or otherwise, including warranties relating to:

Merchantability;
Fitness for a particular purpose;
Accuracy of information;
Availability;
Security;
Non-infringement;
Continuous operation;
Error-free performance.

Users access and use the Platform at their own risk.

41. Limitation of Liability

To the maximum extent permitted by applicable law, DutyLocum, its directors, officers, employees, affiliates, agents, licensors, and service providers shall not be liable for any direct, indirect, incidental, consequential, exemplary, punitive, or special damages arising out of or relating to:

Use or inability to use the Platform;
Employment decisions;
Recruitment outcomes;
Loss of employment opportunities;
Loss of income;
Professional disputes;
Salary disputes;
Contractual disputes;
Clinical incidents;
Patient claims;
Technical failures;
Data loss;
Unauthorized access;
Service interruptions.

Where liability cannot be excluded by law, DutyLocum's aggregate liability shall not exceed the total amount paid by the User to DutyLocum for the specific service giving rise to the claim during the twelve (12) months immediately preceding the event.

42. Indemnification

Users agree to indemnify, defend, and hold harmless DutyLocum and its affiliates, directors, officers, employees, agents, and licensors from and against any claims, actions, proceedings, liabilities, losses, damages, costs, and expenses (including reasonable legal fees) arising from:

Violation of these Terms;
Breach of applicable law;
Misrepresentation;
Infringement of intellectual property rights;
Upload of unlawful content;
Professional misconduct;
Medical negligence;
Fraudulent activity;
Employment disputes involving the User.
43. Suspension and Termination

DutyLocum reserves the right to suspend, restrict, or terminate any account without prior notice where it reasonably believes that the User has:

Violated these Terms;
Uploaded false or fraudulent information;
Misused the Platform;
Engaged in unlawful conduct;
Compromised Platform security;
Violated the rights of other Users.

Termination of an account does not affect obligations that by their nature survive termination, including obligations relating to confidentiality, intellectual property, indemnity, limitation of liability, and dispute resolution.

44. Force Majeure

DutyLocum shall not be liable for any failure or delay in performance resulting from events beyond its reasonable control, including natural disasters, epidemics, pandemics, government actions, strikes, internet failures, cyberattacks, power outages, war, civil unrest, or failures of third-party service providers.

45. Changes to the Platform

DutyLocum may modify, suspend, discontinue, or replace any feature, functionality, or service at any time without prior notice.

Nothing in these Terms obligates DutyLocum to continue providing any particular feature indefinitely.

46. Amendments to These Terms

DutyLocum may revise these Terms from time to time.

Material changes will be communicated through appropriate means, such as publication on the Platform or electronic notification.

Continued use of the Platform after revised Terms become effective constitutes acceptance of those revised Terms.

47. Governing Law

These Terms shall be governed by and construed in accordance with the laws of the Republic of India, without regard to conflict of law principles.

48. Dispute Resolution

The parties shall endeavor to resolve disputes amicably through discussions.

If a dispute cannot be resolved amicably within a reasonable period, it shall be subject to the exclusive jurisdiction of the competent courts located in Hyderabad, Telangana, India, unless otherwise required by applicable law.

49. Grievance Redressal

Users may submit complaints relating to the Platform, privacy, content, or these Terms through the contact details published on the Platform.

DutyLocum shall acknowledge and address grievances in accordance with applicable law.

Grievance Officer

Name: Venkat
Designation: Grievance Officer
Email: cvenkat1993@gmail.com

50. Contact Information

For questions regarding these Terms, users may contact:

DutyLocum

Email: cvenkat1993@gmail.com
Website: https://dutylocum.in

51. Entire Agreement

These Terms, together with the Privacy Policy and any additional policies expressly incorporated by reference, constitute the entire agreement between the User and DutyLocum regarding use of the Platform and supersede all prior understandings relating to the subject matter.

52. Severability

If any provision of these Terms is held to be invalid or unenforceable by a court of competent jurisdiction, the remaining provisions shall remain in full force and effect.

53. Waiver

Failure by DutyLocum to enforce any provision of these Terms shall not constitute a waiver of that provision or of any other provision.

End of Terms & Conditions`
}
          {children}
        </div>
      </div>
    </div>
  );
}
