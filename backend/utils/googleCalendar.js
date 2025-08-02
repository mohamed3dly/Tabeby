const { google } = require("googleapis");
const User = require("../models/user");

// إنشاء حدث على Google Calendar
const createCalendarEvent = async (userId, bookingData) => {
  // جيب التوكنات من الـ user
  const user = await User.findById(userId);
  if (!user || !user.google || !user.google.accessToken)
    throw new Error("Google account not connected");

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({
    access_token: user.google.accessToken,
    refresh_token: user.google.refreshToken,
  });

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  // إعداد الحدث
  const event = {
    summary: `موعد مع ${bookingData.with}`,
    description: bookingData.description || "",
    start: {
      dateTime: bookingData.startTime, // ISO string
      timeZone: "Africa/Cairo",
    },
    end: {
      dateTime: bookingData.endTime,
      timeZone: "Africa/Cairo",
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return response.data;
};

module.exports = { createCalendarEvent };
