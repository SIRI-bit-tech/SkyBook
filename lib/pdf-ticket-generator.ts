import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateQRCodeBuffer } from './qr-generator';
import { PopulatedBooking } from '@/types/global';

export async function generateTicketPDF(booking: PopulatedBooking): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Colors
  const primaryColor = rgb(0.02, 0.47, 0.78); // Sky blue
  const darkColor = rgb(0.1, 0.1, 0.1);
  const lightGray = rgb(0.9, 0.9, 0.9);
  
  // Header background
  page.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: primaryColor,
  });
  
  // Logo/Title
  page.drawText('SKYBOOK', {
    x: 50,
    y: height - 60,
    size: 32,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  
  page.drawText('E-TICKET', {
    x: 50,
    y: height - 90,
    size: 16,
    font: font,
    color: rgb(1, 1, 1),
  });
  
  // Booking Reference (top right)
  page.drawText('Booking Reference', {
    x: width - 200,
    y: height - 50,
    size: 10,
    font: font,
    color: rgb(1, 1, 1),
  });
  
  page.drawText(booking.bookingReference, {
    x: width - 200,
    y: height - 70,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });
  
  // Flight Information Section
  let yPosition = height - 160;
  
  page.drawText('FLIGHT INFORMATION', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: darkColor,
  });
  
  yPosition -= 30;
  
  // Flight details
  const flight = booking.flight;
  const departureDate = new Date(flight.departure.time);
  const arrivalDate = new Date(flight.arrival.time);
  
  // Departure
  page.drawRectangle({
    x: 50,
    y: yPosition - 80,
    width: 220,
    height: 80,
    color: lightGray,
    borderColor: primaryColor,
    borderWidth: 1,
  });
  
  page.drawText('DEPARTURE', {
    x: 60,
    y: yPosition - 20,
    size: 10,
    font: fontBold,
    color: darkColor,
  });
  
  page.drawText(flight.departure.airport, {
    x: 60,
    y: yPosition - 40,
    size: 16,
    font: fontBold,
    color: primaryColor,
  });
  
  page.drawText(departureDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }), {
    x: 60,
    y: yPosition - 58,
    size: 9,
    font: font,
    color: darkColor,
  });
  
  page.drawText(departureDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }), {
    x: 60,
    y: yPosition - 72,
    size: 12,
    font: fontBold,
    color: darkColor,
  });
  
  // Arrow
  page.drawText('→', {
    x: 290,
    y: yPosition - 45,
    size: 24,
    font: fontBold,
    color: primaryColor,
  });
  
  // Arrival
  page.drawRectangle({
    x: 325,
    y: yPosition - 80,
    width: 220,
    height: 80,
    color: lightGray,
    borderColor: primaryColor,
    borderWidth: 1,
  });
  
  page.drawText('ARRIVAL', {
    x: 335,
    y: yPosition - 20,
    size: 10,
    font: fontBold,
    color: darkColor,
  });
  
  page.drawText(flight.arrival.airport, {
    x: 335,
    y: yPosition - 40,
    size: 16,
    font: fontBold,
    color: primaryColor,
  });
  
  page.drawText(arrivalDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }), {
    x: 335,
    y: yPosition - 58,
    size: 9,
    font: font,
    color: darkColor,
  });
  
  page.drawText(arrivalDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }), {
    x: 335,
    y: yPosition - 72,
    size: 12,
    font: fontBold,
    color: darkColor,
  });
  
  yPosition -= 110;
  
  // Flight Number and Duration
  page.drawText(`Flight: ${flight.flightNumber}`, {
    x: 50,
    y: yPosition,
    size: 11,
    font: fontBold,
    color: darkColor,
  });
  
  const durationHours = Math.floor(flight.duration / 60);
  const durationMinutes = flight.duration % 60;
  page.drawText(`Duration: ${durationHours}h ${durationMinutes}m`, {
    x: 200,
    y: yPosition,
    size: 11,
    font: font,
    color: darkColor,
  });
  
  yPosition -= 40;
  
  // Passenger Information
  page.drawText('PASSENGER INFORMATION', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: darkColor,
  });
  
  yPosition -= 25;
  
  booking.passengers.forEach((passenger, index) => {
    page.drawText(`${index + 1}. ${passenger.firstName} ${passenger.lastName}`, {
      x: 60,
      y: yPosition,
      size: 11,
      font: font,
      color: darkColor,
    });
    
    page.drawText(`Seat: ${booking.seats[index] || 'N/A'}`, {
      x: 300,
      y: yPosition,
      size: 11,
      font: font,
      color: darkColor,
    });
    
    yPosition -= 20;
  });
  
  yPosition -= 20;
  
  // Booking Details
  page.drawText('BOOKING DETAILS', {
    x: 50,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: darkColor,
  });
  
  yPosition -= 25;
  
  page.drawText(`Status: ${booking.status.toUpperCase()}`, {
    x: 60,
    y: yPosition,
    size: 11,
    font: font,
    color: darkColor,
  });
  
  page.drawText(`Total Price: $${booking.totalPrice.toFixed(2)}`, {
    x: 300,
    y: yPosition,
    size: 11,
    font: fontBold,
    color: darkColor,
  });
  
  yPosition -= 25;
  
  page.drawText(`Booked: ${new Date(booking.createdAt!).toLocaleDateString()}`, {
    x: 60,
    y: yPosition,
    size: 10,
    font: font,
    color: darkColor,
  });
  
  // QR Code
  const qrBuffer = await generateQRCodeBuffer(booking.bookingReference, booking._id!);
  const qrImage = await pdfDoc.embedPng(qrBuffer);
  
  page.drawImage(qrImage, {
    x: width - 180,
    y: 100,
    width: 130,
    height: 130,
  });
  
  page.drawText('Scan for verification', {
    x: width - 170,
    y: 80,
    size: 9,
    font: font,
    color: darkColor,
  });
  
  // Footer
  page.drawText('Please arrive at the airport at least 2 hours before departure.', {
    x: 50,
    y: 60,
    size: 9,
    font: font,
    color: darkColor,
  });
  
  page.drawText('This is your official e-ticket. Please keep it for your records.', {
    x: 50,
    y: 45,
    size: 9,
    font: font,
    color: darkColor,
  });
  
  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: 50,
    y: 25,
    size: 8,
    font: font,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
