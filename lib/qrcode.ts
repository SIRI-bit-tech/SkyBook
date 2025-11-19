import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function encryptBookingData(bookingRef: string, passengerName: string, flightNumber: string): string {
  // Simple encryption for QR code (in production, use proper encryption)
  const data = JSON.stringify({ bookingRef, passengerName, flightNumber, timestamp: Date.now() });
  return Buffer.from(data).toString('base64');
}

export function decryptBookingData(encryptedData: string): any {
  try {
    const data = Buffer.from(encryptedData, 'base64').toString('utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}
