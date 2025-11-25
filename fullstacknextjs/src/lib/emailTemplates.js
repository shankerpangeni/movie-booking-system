/**
 * Email Template for Booking Confirmation
 * Horizontal Cinema Ticket Design - Looks like a real movie ticket!
 */

export const generateBookingEmailTemplate = (bookingData) => {
    const {
        bookingReference,
        userName,
        movieTitle,
        moviePoster,
        hallName,
        screenName,
        showtime,
        seats,
        totalPrice,
        qrCodeCid, // Changed from qrCodeDataUrl to CID reference
    } = bookingData;

    const seatsList = seats.map(seat => seat.seatName).join(', ');
    const formattedDate = new Date(showtime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    const formattedTime = new Date(showtime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Movie Ticket - ${bookingReference}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #f1f5f9;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                
                <!-- Email Header with Logo -->
                <table width="700" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                    <tr>
                        <td align="center" style="padding: 20px;">
                            <!-- Cinema Logo -->
                            <div style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 15px 40px; border-radius: 12px; margin-bottom: 10px;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 3px; text-transform: uppercase;">
                                    🎬 CINEMA
                                </h1>
                            </div>
                            <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 14px; letter-spacing: 2px; text-transform: uppercase;">
                                Your Ticket is Ready
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Main Ticket Container - Horizontal Layout -->
                <table width="700" cellpadding="0" cellspacing="0" style="background: #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5); border: 2px solid #334155;">
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <!-- Left Section: Movie Info & Details -->
                                    <td width="480" style="padding: 30px; vertical-align: top; border-right: 3px dashed #475569;">
                                        
                                        <!-- Movie Poster & Title -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                            <tr>
                                                <td width="80" style="padding-right: 15px; vertical-align: top;">
                                                    <img src="${moviePoster}" alt="${movieTitle}" style="width: 80px; height: 120px; border-radius: 8px; object-fit: cover; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);">
                                                </td>
                                                <td style="vertical-align: middle;">
                                                    <h2 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                                                        ${movieTitle}
                                                    </h2>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Ticket Details Grid -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <!-- Date & Time -->
                                                <td width="50%" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        📅 Date
                                                    </p>
                                                    <p style="margin: 0; color: #f1f5f9; font-size: 16px; font-weight: 700;">
                                                        ${formattedDate}
                                                    </p>
                                                </td>
                                                <!-- Time -->
                                                <td width="50%" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        🕐 Time
                                                    </p>
                                                    <p style="margin: 0; color: #f1f5f9; font-size: 16px; font-weight: 700;">
                                                        ${formattedTime}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <!-- Hall -->
                                                <td width="50%" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        🏛️ Hall
                                                    </p>
                                                    <p style="margin: 0; color: #f1f5f9; font-size: 16px; font-weight: 700;">
                                                        ${hallName}
                                                    </p>
                                                </td>
                                                <!-- Screen -->
                                                <td width="50%" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        📺 Screen
                                                    </p>
                                                    <p style="margin: 0; color: #f1f5f9; font-size: 16px; font-weight: 700;">
                                                        ${screenName}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <!-- Seats -->
                                                <td colspan="2" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        🎫 Seats
                                                    </p>
                                                    <p style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: 2px; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 12px 20px; border-radius: 8px; display: inline-block;">
                                                        ${seatsList}
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <!-- Customer Name -->
                                                <td width="50%" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        👤 Name
                                                    </p>
                                                    <p style="margin: 0; color: #f1f5f9; font-size: 14px; font-weight: 600;">
                                                        ${userName}
                                                    </p>
                                                </td>
                                                <!-- Total Price -->
                                                <td width="50%" style="padding: 12px 0; vertical-align: top;">
                                                    <p style="margin: 0 0 5px 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                        💰 Total
                                                    </p>
                                                    <p style="margin: 0; color: #10b981; font-size: 24px; font-weight: 900;">
                                                        $${totalPrice.toFixed(2)}
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- Booking Reference -->
                                        <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #334155;">
                                            <p style="margin: 0 0 5px 0; color: #64748b; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                                                Booking Reference
                                            </p>
                                            <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: 3px; font-family: 'Courier New', monospace;">
                                                ${bookingReference}
                                            </p>
                                        </div>

                                    </td>

                                    <!-- Right Section: QR Code -->
                                    <td width="220" style="padding: 30px; text-align: center; vertical-align: middle; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);">
                                        <p style="margin: 0 0 15px 0; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">
                                            Scan to Enter
                                        </p>
                                        <div style="background: #ffffff; display: inline-block; padding: 15px; border-radius: 12px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
                                            <img src="cid:${qrCodeCid}" alt="Ticket QR Code" style="width: 150px; height: 150px; display: block;">
                                        </div>
                                        <p style="margin: 15px 0 0 0; color: #64748b; font-size: 10px; line-height: 1.4;">
                                            Show this code<br>at the entrance
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>

                <!-- Important Notice -->
                <table width="700" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                        <td style="background: #1e293b; padding: 20px; border-radius: 12px; border-left: 4px solid #dc2626;">
                            <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 14px; font-weight: 700;">
                                ⚠️ Important Information
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                                • Please arrive 15 minutes before showtime<br>
                                • Present this QR code at the entrance<br>
                                • Tickets are non-refundable and non-transferable<br>
                                • Outside food and beverages are not permitted
                            </p>
                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table width="700" cellpadding="0" cellspacing="0" style="margin-top: 30px;">
                    <tr>
                        <td style="text-align: center; padding: 20px;">
                            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                                Thank you for choosing our cinema! 🍿
                            </p>
                            <p style="margin: 0; color: #64748b; font-size: 11px; line-height: 1.6;">
                                Need help? Contact us at support@cinema.com<br>
                                This is an automated email. Please do not reply.<br>
                                © ${new Date().getFullYear()} Cinema Booking System. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
};
