import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import { generateBookingEmailTemplate } from './emailTemplates';

/**
 * Email Service for sending booking confirmations
 * Uses Nodemailer with Gmail SMTP
 */

// Create reusable transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });
};

/**
 * Generate QR Code as Data URL
 * @param {string} data - Data to encode in QR code
 * @returns {Promise<string>} - QR code as data URL
 */
const generateQRCode = async (data) => {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(data, {
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
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

/**
 * Send booking confirmation email
 * @param {Object} bookingDetails - Booking information
 * @returns {Promise<Object>} - Email sending result
 */
export const sendBookingConfirmationEmail = async (bookingDetails) => {
    try {
        const {
            userEmail,
            userName,
            bookingReference,
            movieTitle,
            moviePoster,
            hallName,
            screenName,
            showtime,
            seats,
            totalPrice,
        } = bookingDetails;

        // Generate QR Code with booking reference and basic info
        const qrData = JSON.stringify({
            ref: bookingReference,
            movie: movieTitle,
            showtime: new Date(showtime).toISOString(),
            seats: seats.map(s => s.seatName).join(', '),
        });

        // Generate QR code as buffer instead of data URL
        const qrCodeBuffer = await QRCode.toBuffer(qrData, {
            errorCorrectionLevel: 'H',
            type: 'png',
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        });

        // Prepare email template data with CID reference
        const emailData = {
            bookingReference,
            userName,
            movieTitle,
            moviePoster,
            hallName,
            screenName,
            showtime,
            seats,
            totalPrice,
            qrCodeCid: 'qrcode@booking', // CID reference for embedded image
        };

        // Generate HTML email
        const htmlContent = generateBookingEmailTemplate(emailData);

        // Create transporter
        const transporter = createTransporter();

        // Email options with embedded QR code
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Movie Booking System" <noreply@moviebooking.com>',
            to: userEmail,
            subject: `🎬 Your Ticket - ${movieTitle} | ${bookingReference}`,
            html: htmlContent,
            attachments: [
                {
                    filename: 'qrcode.png',
                    content: qrCodeBuffer,
                    cid: 'qrcode@booking', // Same as referenced in HTML
                }
            ]
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ Booking confirmation email sent successfully:', {
            messageId: info.messageId,
            to: userEmail,
            bookingReference,
        });

        return {
            success: true,
            messageId: info.messageId,
            message: 'Email sent successfully',
        };
    } catch (error) {
        console.error('❌ Error sending booking confirmation email:', error);

        // Don't throw error - we don't want email failure to break the booking
        return {
            success: false,
            error: error.message,
            message: 'Failed to send email',
        };
    }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} - True if configuration is valid
 */
export const verifyEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration verified successfully');
        return true;
    } catch (error) {
        console.error('❌ Email configuration verification failed:', error.message);
        return false;
    }
};
