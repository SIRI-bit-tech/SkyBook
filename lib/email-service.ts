import { Resend } from 'resend';
import { PopulatedBooking } from '@/types/global';

// Validate RESEND_API_KEY is configured
const resendApiKey = process.env.RESEND_API_KEY?.trim();
if (!resendApiKey) {
  throw new Error('RESEND_API_KEY is required but not configured in environment variables');
}

const resend = new Resend(resendApiKey);

interface SendTicketEmailParams {
  booking: PopulatedBooking;
  pdfBuffer: Buffer;
  qrCodeDataUrl: string;
}

export async function sendTicketEmail({ booking, pdfBuffer, qrCodeDataUrl }: SendTicketEmailParams) {
  // Collect all unique, non-empty passenger emails
  const recipientEmails = Array.from(
    new Set(
      booking.passengers
        .map(p => p.email?.trim())
        .filter((email): email is string => !!email)
    )
  );

  // Fallback to booking user email if no passenger emails found
  if (recipientEmails.length === 0) {
    const userEmail = booking.user.email?.trim();
    if (userEmail) {
      recipientEmails.push(userEmail);
    } else {
      return { success: false, error: 'No valid passenger emails found' };
    }
  }

  const flight = booking.flight;
  const departureDate = new Date(flight.departure.time);
  const arrivalDate = new Date(flight.arrival.time);
  
  // Use first passenger for greeting, or user name as fallback
  const primaryPassenger = booking.passengers[0] || {
    firstName: booking.user.firstName,
    lastName: booking.user.lastName,
  };
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 32px;
          }
          .content {
            background: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-top: none;
          }
          .booking-ref {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
            border: 2px solid #0284c7;
          }
          .booking-ref-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 5px;
          }
          .booking-ref-value {
            font-size: 24px;
            font-weight: bold;
            color: #0284c7;
          }
          .flight-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .flight-route {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 20px 0;
          }
          .airport {
            flex: 1;
            text-align: center;
          }
          .airport-code {
            font-size: 24px;
            font-weight: bold;
            color: #0284c7;
          }
          .airport-time {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
          }
          .arrow {
            font-size: 24px;
            color: #0284c7;
            margin: 0 20px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .info-label {
            color: #64748b;
            font-size: 14px;
          }
          .info-value {
            font-weight: bold;
            color: #1e293b;
          }
          .qr-section {
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: white;
            border-radius: 8px;
          }
          .qr-code {
            max-width: 200px;
            margin: 20px auto;
          }
          .important-info {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            padding: 20px;
            color: #64748b;
            font-size: 12px;
          }
          .button {
            display: inline-block;
            background: #0284c7;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✈️ SKYBOOK</h1>
          <p>Your E-Ticket is Ready!</p>
        </div>
        
        <div class="content">
          <p>Dear ${primaryPassenger.firstName} ${primaryPassenger.lastName},</p>
          
          <p>Thank you for booking with SkyBook! Your flight has been confirmed and your e-ticket is attached to this email.</p>
          
          <div class="booking-ref">
            <div class="booking-ref-label">Booking Reference</div>
            <div class="booking-ref-value">${booking.bookingReference}</div>
          </div>
          
          <div class="flight-info">
            <h2 style="margin-top: 0; color: #1e293b;">Flight Details</h2>
            
            <div class="flight-route">
              <div class="airport">
                <div class="airport-code">${flight.departure.airport}</div>
                <div class="airport-time">
                  ${departureDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}<br>
                  ${departureDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div class="arrow">→</div>
              
              <div class="airport">
                <div class="airport-code">${flight.arrival.airport}</div>
                <div class="airport-time">
                  ${arrivalDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}<br>
                  ${arrivalDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
            
            <div class="info-row">
              <span class="info-label">Flight Number</span>
              <span class="info-value">${flight.flightNumber}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Passenger(s)</span>
              <span class="info-value">${booking.passengers.map(p => `${p.firstName} ${p.lastName}`).join(', ')}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">Seat(s)</span>
              <span class="info-value">${booking.seats.join(', ')}</span>
            </div>
            
            <div class="info-row" style="border-bottom: none;">
              <span class="info-label">Status</span>
              <span class="info-value" style="color: #10b981;">${booking.status.toUpperCase()}</span>
            </div>
          </div>
          
          <div class="qr-section">
            <h3 style="margin-top: 0; color: #1e293b;">Your Boarding Pass QR Code</h3>
            <p style="color: #64748b; font-size: 14px;">Show this QR code at the airport for check-in</p>
            <img src="${qrCodeDataUrl}" alt="QR Code" class="qr-code" />
          </div>
          
          <div class="important-info">
            <strong>⚠️ Important Information:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please arrive at the airport at least 2 hours before departure</li>
              <li>Check-in opens 24 hours before departure</li>
              <li>Ensure your passport is valid for at least 6 months</li>
              <li>Review baggage restrictions before packing</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation?bookingId=${booking._id}" class="button">
              View Booking Details
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>© ${new Date().getFullYear()} SkyBook. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #0284c7;">Visit Website</a> | 
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact" style="color: #0284c7;">Contact Support</a>
          </p>
        </div>
      </body>
    </html>
  `;
  
  try {
    const result = await resend.emails.send({
      from: process.env.SMTP_FROM_EMAIL || 'SkyBook <noreply@skybook.com>',
      to: recipientEmails,
      subject: `Your SkyBook E-Ticket - ${booking.bookingReference}`,
      html: emailHtml,
      attachments: [
        {
          filename: `ticket-${booking.bookingReference}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
    
    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}
