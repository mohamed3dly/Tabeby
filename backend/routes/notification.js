const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware, notificationController.getUserNotifications);
router.put("/:id/read", authMiddleware, notificationController.markAsRead);

module.exports = router;