// utils/googleAvailability.js
const { google } = require('googleapis');

const isUserAvailable = async (googleTokens, startTime, endTime) => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: googleTokens.accessToken,
      refresh_token: googleTokens.refreshToken,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const res = await calendar.freebusy.query({
      requestBody: {
        timeMin: new Date(startTime).toISOString(),
        timeMax: new Date(endTime).toISOString(),
        timeZone: 'Africa/Cairo',
        items: [{ id: 'primary' }]
      }
    });

    const busySlots = res.data.calendars.primary.busy;

    return busySlots.length === 0; // لو مفيش تعارض → يبقى متاح
  } catch (error) {
    console.error('❌ Error checking Google Calendar availability:', error);
    return false; // في حالة خطأ نعتبره غير متاح
  }
};

module.exports = { isUserAvailable };
