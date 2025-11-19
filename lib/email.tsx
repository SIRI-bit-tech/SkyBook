// Email service integration (Resend/SendGrid)
export async function sendTicketEmail(
  email: string,
  bookingRef: string,
  passengerName: string,
  ticketPdfUrl: string,
  qrCodeUrl: string
) {
  try {
    // Use Resend or SendGrid to send email
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'bookings@skybook.com',
        to: email,
        subject: `Your Flight Ticket - Booking ${bookingRef}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Flight Confirmed!</h2>
            <p>Hello ${passengerName},</p>
            <p>Your flight booking is confirmed. Your e-ticket is attached below.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Booking Reference:</strong> ${bookingRef}</p>
              <img src="${qrCodeUrl}" alt="QR Code" style="width: 200px; height: 200px;" />
            </div>
            <p>
              <a href="${ticketPdfUrl}" style="background: #0EA5E9; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none;">
                Download E-Ticket
              </a>
            </p>
            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Please arrive 2-3 hours before departure. Have a great flight!
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }

    return await response.json();
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
