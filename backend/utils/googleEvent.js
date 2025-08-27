// utils/googleEvent.js
const { google } = require("googleapis");

const deleteGoogleCalendarEvent = async (host, eventId) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      access_token: host.google.accessToken,
      refresh_token: host.google.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const calendarId = host.google.calendarId || "primary";

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    console.log("🗑️ تم حذف الحدث من Google Calendar");
  } catch (error) {
    console.error("❌ فشل حذف الحدث من Google Calendar:", error.message);
  }
};
const createGoogleCalendarEvent = async (host, guestEmail, booking) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oAuth2Client.setCredentials({
      access_token: user.google.accessToken,
      refresh_token: user.google.refreshToken,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const start = new Date(booking.date);
    const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 دقيقة

    const event = {
      summary: `موعد بين ${booking.hostName} و ${booking.guestName}`,
      description: `نوع الحجز: ${booking.type}`,
      start: {
        dateTime: start.toISOString(),
        timeZone: "Africa/Cairo",
      },
      end: {
        dateTime: end.toISOString(),
        timeZone: "Africa/Cairo",
      },
      attendees: guestEmail ? [{ email: guestEmail }] : [],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 10 },  // تنبيه popup قبل 10 دقائق
          { method: "email", minutes: 30 },  // تنبيه بالإيميل قبل 30 دقيقة
        ],
      },
    };

    const calendarId = host.google.calendarId || "primary";

    const response = await calendar.events.insert({
      calendarId,
      resource: event,
      sendUpdates: "all",
    });

    console.log("✅ تم إنشاء الحدث في Google Calendar");
    return response.data.id;
  } catch (error) {
    console.error("❌ فشل إنشاء الحدث على Google Calendar:", error.message);
    return null;
  }
};


module.exports = { deleteGoogleCalendarEvent,createGoogleCalendarEvent };
