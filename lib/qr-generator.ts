import QRCode from 'qrcode';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET || 'default-key-change-in-production';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypt booking data for QR code
 */
export function encryptBookingData(bookingReference: string, bookingId: string): string {
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const data = JSON.stringify({
    ref: bookingReference,
    id: bookingId,
    timestamp: Date.now(),
  });
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt QR code data
 */
export function decryptBookingData(encryptedData: string): { ref: string; id: string; timestamp: number } | null {
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const [ivHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !encrypted) {
      return null;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('QR decryption error:', error);
    return null;
  }
}

/**
 * Generate QR code as data URL
 */
export async function generateQRCode(bookingReference: string, bookingId: string): Promise<string> {
  const encryptedData = encryptBookingData(bookingReference, bookingId);
  const qrData = `${process.env.NEXT_PUBLIC_APP_URL}/verify-ticket?data=${encodeURIComponent(encryptedData)}`;
  
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
  
  return qrCodeDataUrl;
}

/**
 * Generate QR code as buffer for PDF embedding
 */
export async function generateQRCodeBuffer(bookingReference: string, bookingId: string): Promise<Buffer> {
  const encryptedData = encryptBookingData(bookingReference, bookingId);
  const qrData = `${process.env.NEXT_PUBLIC_APP_URL}/verify-ticket?data=${encodeURIComponent(encryptedData)}`;
  
  const buffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
  });
  
  return buffer;
}
