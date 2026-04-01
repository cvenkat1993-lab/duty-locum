import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: /api/send-whatsapp
 * 
 * SETUP REQUIRED:
 * 1. Sign up for WhatsApp Business API
 * 2. Add credentials to .env.local:
 *    WHATSAPP_API_URL=https://graph.facebook.com/v18.0
 *    WHATSAPP_API_TOKEN=your_permanent_token
 *    WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
 * 
 * Alternative services:
 * - Twilio: https://www.twilio.com/whatsapp
 * - MessageBird: https://www.messagebird.com/whatsapp
 * - 360Dialog: https://www.360dialog.com/
 */

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    // Check if WhatsApp API is configured
    const apiUrl = process.env.WHATSAPP_API_URL;
    const apiToken = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!apiUrl || !apiToken || !phoneNumberId) {
      console.log('WhatsApp API not configured. Message would be sent to:', to);
      console.log('Message:', message);
      
      return NextResponse.json({
        success: true,
        message: 'WhatsApp API not configured (test mode)',
      });
    }

    // Send WhatsApp message using Meta WhatsApp Business API
    const response = await fetch(
      `${apiUrl}/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', data);
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
    });

  } catch (error: any) {
    console.error('Error in send-whatsapp API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Example using Twilio WhatsApp API
 * 
 * Install: npm install twilio
 * 
 * Add to .env.local:
 * TWILIO_ACCOUNT_SID=your_account_sid
 * TWILIO_AUTH_TOKEN=your_auth_token
 * TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
 */

/*
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { to, message } = await request.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!accountSid || !authToken || !from) {
      return NextResponse.json(
        { error: 'Twilio not configured' },
        { status: 500 }
      );
    }

    const client = twilio(accountSid, authToken);

    const twilioMessage = await client.messages.create({
      from: from,
      to: `whatsapp:+${to}`,
      body: message,
    });

    return NextResponse.json({
      success: true,
      messageId: twilioMessage.sid,
    });

  } catch (error: any) {
    console.error('Twilio error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
*/
