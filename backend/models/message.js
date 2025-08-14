const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: [true, "Chat ID is required"],
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Sender is required"],
    index: true
  },
  text: {
    type: String,
    required: [true, "Message text is required"],
    trim: true,
    minlength: [1, "Message cannot be empty"],
    maxlength: [1000, "Message is too long"]
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Message", messageSchema);
