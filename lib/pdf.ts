import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { Flight, Booking, Passenger } from '@/types/global';

export async function generateTicketPDF(
  booking: any,
  flight: any,
  passengers: any[],
  qrCodeUrl: string
): Promise<Buffer> {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([850, 600]);
    const { width, height } = page.getSize();

    // Header background
    page.drawRectangle({
      x: 0,
      y: height - 100,
      width,
      height: 100,
      color: rgb(15 / 255, 23 / 255, 42 / 255),
    });

    // Title
    page.drawText('SkyBook E-Ticket', {
      x: 50,
      y: height - 60,
      size: 28,
      color: rgb(14 / 255, 165 / 255, 233 / 255),
      font: undefined,
    });

    // Booking reference
    page.drawText(`Booking Reference: ${booking.bookingReference}`, {
      x: 50,
      y: height - 120,
      size: 14,
      color: rgb(0, 0, 0),
    });

    // Flight information
    const departureTime = new Date(flight.departure.time).toLocaleString();
    const arrivalTime = new Date(flight.arrival.time).toLocaleString();

    page.drawText(`Flight: ${flight.flightNumber}`, {
      x: 50,
      y: height - 160,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Departure: ${departureTime}`, {
      x: 50,
      y: height - 190,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Arrival: ${arrivalTime}`, {
      x: 50,
      y: height - 220,
      size: 12,
      color: rgb(0, 0, 0),
    });

    page.drawText(`Seats: ${booking.seats.join(', ')}`, {
      x: 50,
      y: height - 250,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Passengers
    page.drawText('Passengers:', {
      x: 50,
      y: height - 290,
      size: 12,
      color: rgb(0, 0, 0),
      font: undefined,
    });

    let passengerY = height - 320;
    passengers.forEach((passenger, index) => {
      page.drawText(`${index + 1}. ${passenger.firstName} ${passenger.lastName}`, {
        x: 70,
        y: passengerY,
        size: 11,
        color: rgb(0, 0, 0),
      });
      passengerY -= 25;
    });

    // QR Code
    page.drawText('Scan this QR code at check-in:', {
      x: width - 300,
      y: height - 200,
      size: 10,
      color: rgb(0, 0, 0),
    });

    // In a real implementation, you would embed the QR code image here
    page.drawRectangle({
      x: width - 280,
      y: height - 380,
      width: 200,
      height: 150,
      color: rgb(200 / 255, 200 / 255, 200 / 255),
    });

    // Footer
    page.drawText('For more information visit www.skybook.com', {
      x: 50,
      y: 20,
      size: 10,
      color: rgb(100 / 255, 116 / 255, 139 / 255),
    });

    const pdfBuffer = await pdfDoc.save();
    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate ticket PDF');
  }
}
