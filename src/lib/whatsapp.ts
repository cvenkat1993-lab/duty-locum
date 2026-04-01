/**
 * WhatsApp Messaging Utilities
 * 
 * SETUP REQUIRED:
 * 1. Sign up for WhatsApp Business API (https://business.whatsapp.com/)
 * 2. Get your API credentials
 * 3. Add to .env.local:
 *    WHATSAPP_API_URL=your_api_url
 *    WHATSAPP_API_TOKEN=your_token
 *    WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
 */

interface WhatsAppMessageParams {
  to: string; // Phone number with country code (e.g., "919876543210")
  message: string;
}

/**
 * Send WhatsApp message using WhatsApp Business API
 * This requires a backend endpoint or serverless function
 */
export async function sendWhatsAppMessage({ to, message }: WhatsAppMessageParams): Promise<boolean> {
  try {
    // Option 1: Using WhatsApp Business API (requires backend)
    // Uncomment when you have WhatsApp Business API set up
    
    /*
    const response = await fetch('/api/send-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
    
    return response.ok;
    */

    // Option 2: Using a third-party service (Twilio, MessageBird, etc.)
    // Example with Twilio WhatsApp
    
    /*
    const response = await fetch('/api/twilio-whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message }),
    });
    
    return response.ok;
    */

    console.log('WhatsApp message would be sent to:', to);
    console.log('Message:', message);
    
    // For now, log only (actual sending requires API setup)
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return false;
  }
}

/**
 * Generate WhatsApp deep link for manual messaging
 * This works immediately without API setup
 */
export function getWhatsAppLink(phoneNumber: string, message: string): string {
  // Remove any non-digit characters
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  
  // Add country code if not present (assuming India +91)
  const fullPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  
  // Encode message for URL
  const encodedMessage = encodeURIComponent(message);
  
  // Use wa.me link (works on all devices)
  return `https://wa.me/${fullPhone}?text=${encodedMessage}`;
}

/**
 * Generate SMS deep link
 */
export function getSMSLink(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  // SMS protocol works on both iOS and Android
  return `sms:${cleanPhone}?body=${encodedMessage}`;
}

/**
 * Format job acceptance WhatsApp message for applicant
 */
export function formatAcceptanceMessage(
  applicantName: string,
  jobTitle: string,
  hospitalName: string,
  recruiterName: string,
  recruiterPhone: string,
  appliedJobsLink: string
): string {
  return `Dear Dr. ${applicantName},

Good news! Your application for the position of *${jobTitle}* at *${hospitalName}* has been ACCEPTED! 🎉

Next Steps:
Please connect with Dr. ${recruiterName} to proceed ahead.
Contact: ${recruiterPhone}

View your application: ${appliedJobsLink}

Best regards,
Doctor Jobs Team`;
}

/**
 * Format thank you message from applicant to recruiter
 */
export function formatThankYouMessage(
  recruiterName: string,
  applicantName: string,
  jobTitle: string
): string {
  return `Dear Dr. ${recruiterName},

Thank you for accepting my application for the ${jobTitle} position. I would like to discuss the details further. 

Would it be possible to speak today or tomorrow at your convenience?

Regards,
Dr. ${applicantName}`;
}

/**
 * Send acceptance notification via WhatsApp
 * Call this when recruiter accepts an application
 */
export async function notifyApplicantOfAcceptance(
  applicantPhone: string,
  applicantName: string,
  jobTitle: string,
  hospitalName: string,
  recruiterName: string,
  recruiterPhone: string
): Promise<boolean> {
  const appliedJobsLink = `${window.location.origin}/applied-jobs`;
  
  const message = formatAcceptanceMessage(
    applicantName,
    jobTitle,
    hospitalName,
    recruiterName,
    recruiterPhone,
    appliedJobsLink
  );
  
  return await sendWhatsAppMessage({
    to: applicantPhone,
    message,
  });
}
