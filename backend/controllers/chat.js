const Chat = require("../models/chat");
const Message = require("../models/message");
const { createNotification } = require("../controllers/notification");

// إرسال رسالة
const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const senderId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const message = await Message.create({
      chatId,
      sender: senderId,
      text
    });

    // تحديد من هو المستلم
    const receiverId = senderId === chat.userId.toString() ? chat.adminId : chat.userId;

    // إنشاء إشعار للمستلم
    await createNotification(
      receiverId,
      "message",
      "New Message",
      "You've received a new message"
    );

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: "Error sending message", error: err.message });
  }
};

// جلب كل الرسائل في محادثة
const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const messages = await Message.find({ chatId }).populate("sender", "fullName role");
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages", error: err.message });
  }
};

// إنشاء محادثة (لو مش موجودة)
const createChat = async (req, res) => {
  try {
    const { adminId } = req.body;
    const userId = req.user.id;

    // هل المحادثة موجودة؟
    let chat = await Chat.findOne({ userId, adminId });

    if (!chat) {
      chat = await Chat.create({ userId, adminId });
    }

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: "Error creating chat", error: err.message });
  }
};

// جلب كل الشاتات الخاصة بمستخدم
const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({ $or: [{ userId }, { adminId: userId }] })
      .populate("userId", "fullName")
      .populate("adminId", "fullName");

    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Error fetching chats", error: err.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  createChat,
  getUserChats
};
