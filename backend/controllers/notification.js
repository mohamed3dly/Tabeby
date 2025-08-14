const Notification = require("../models/notification");

// إنشاء إشعار جديد (دالة داخلية)
exports.createNotification = async (userId, type, title, message) => {
  try {
    await Notification.create({ userId, type, title, message });
  } catch (err) {
    console.error("❌ Notification creation error:", err);
  }
};

// جلب كل إشعارات مستخدم
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

// تعليم إشعار كمقروء
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId }, // يتأكد إن الإشعار بتاع نفس المستخدم
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Marked as read", notification });
  } catch (err) {
    console.error("❌ Error updating notification:", err);
    res.status(500).json({ message: "Error updating notification" });
  }
};
