import QRCode from 'qrcode';
import crypto from 'crypto';

// Validate encryption key is configured - fail fast if missing
const RAW_ENCRYPTION_KEY = process.env.QR_ENCRYPTION_KEY || process.env.BETTER_AUTH_SECRET;
if (!RAW_ENCRYPTION_KEY) {
  throw new Error('QR_ENCRYPTION_KEY or BETTER_AUTH_SECRET must be set for secure ticket generation');
}

const ALGORITHM = 'aes-256-cbc';
// Derive key once at module load for better performance and security
const KEY = crypto.scryptSync(RAW_ENCRYPTION_KEY, 'salt', 32);

/**
 * Encrypt booking data for QR code
 */
export function encryptBookingData(bookingReference: string, bookingId: string): string {
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
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
    const [ivHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !encrypted) {
      return null;
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    
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
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  if (!APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL must be set to generate QR codes');
  }

  const encryptedData = encryptBookingData(bookingReference, bookingId);
  const qrData = `${APP_URL}/verify-ticket?data=${encodeURIComponent(encryptedData)}`;
  
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
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
  if (!APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL must be set to generate QR codes');
  }

  const encryptedData = encryptBookingData(bookingReference, bookingId);
  const qrData = `${APP_URL}/verify-ticket?data=${encodeURIComponent(encryptedData)}`;
  
  const buffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
  });
  
  return buffer;
}
