// const { google } = require("googleapis");
// const User = require("../models/user");


// // إنشاء حدث على Google Calendar
// const createCalendarEvent = async (userId, bookingData) => {
//   // جيب التوكنات من الـ user
//   const user = await User.findById(userId);
//   if (!user || !user.google || !user.google.accessToken)
//     throw new Error("Google account not connected");

//   const oAuth2Client = new google.auth.OAuth2(
//     process.env.GOOGLE_CLIENT_ID,
//     process.env.GOOGLE_CLIENT_SECRET
//   );

//   oAuth2Client.setCredentials({
//     access_token: user.google.accessToken,
//     refresh_token: user.google.refreshToken,
//   });

//   const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

//   // إعداد الحدث
//   const event = {
//     summary: `موعد مع ${bookingData.with}`,
//     description: bookingData.description || "",
//     start: {
//       dateTime: bookingData.startTime, // ISO string
//       timeZone: "Africa/Cairo",
//     },
//     end: {
//       dateTime: bookingData.endTime,
//       timeZone: "Africa/Cairo",
//     },
//   };

//   const response = await calendar.events.insert({
//     calendarId: "primary",
//     resource: event,
//   });

//   return response.data;
// };

// module.exports = { createCalendarEvent };
// utils/googleCalendar.js
const { google } = require("googleapis");
const User = require("../models/user");

// ✅ التحقق من تفرّغ المستخدم


async function isUserAvailable(userId, googleData, startTime, endTime) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    oauth2Client.setCredentials({
      access_token: googleData.accessToken,
      refresh_token: googleData.refreshToken,
    });

    // 🔑 جرّب تجديد التوكن
    const newToken = await oauth2Client.getAccessToken();
    if (newToken?.token) {
      googleData.accessToken = newToken.token;

      // ✅ مفيش داعي تستخدم user هنا، كفاية updateOne
      await User.updateOne(
        { _id: userId },
        { "google.accessToken": newToken.token }
      );
    }

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        timeZone: "Africa/Cairo",
        items: [{ id: "primary" }],
      },
    });

    const busyTimes = response.data.calendars.primary.busy;
    return busyTimes.length === 0;
  } catch (error) {
    console.error("❌ Error checking availability:", error);
    throw error;
  }
}



// ✅ إنشاء حدث على Google Calendar
const createCalendarEvent = async (userId, bookingData) => {
  console.log("🗓️ [GOOGLE] Creating Event with:", {
  summary: `موعد مع ${bookingData.with}`,
  start: bookingData.startTime,
  end: bookingData.endTime
});

  const user = await User.findById(userId);
  if (!user || !user.google?.accessToken)
    throw new Error("Google account not connected");

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oAuth2Client.setCredentials({
  access_token: user.google.accessToken,
  refresh_token: user.google.refreshToken, // هنا بيتجدد تلقائي
});

  const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

  const event = {
    summary: `موعد مع ${bookingData.with}`,
    description: bookingData.description || "",
    start: {
      dateTime: bookingData.startTime,
      timeZone: "Africa/Cairo",
    },
    end: {
      dateTime: bookingData.endTime,
      timeZone: "Africa/Cairo",
    },
    attendees: bookingData.guestEmail
      ? [{ email: bookingData.guestEmail }]
      : [],
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  return response.data.id; // eventId
};

module.exports = { isUserAvailable, createCalendarEvent };
