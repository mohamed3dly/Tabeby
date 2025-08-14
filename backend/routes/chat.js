const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const chatController = require("../controllers/chat");

router.post("/create", authMiddleware, chatController.createChat);
router.get("/", authMiddleware, chatController.getUserChats);
router.post("/send", authMiddleware, chatController.sendMessage);
router.get("/:chatId/messages", authMiddleware, chatController.getMessages);


module.exports = router;