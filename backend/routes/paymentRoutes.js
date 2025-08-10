const express = require("express");
const router = express.Router();
const { initiatePaymobPayment, paymobWebhook  } = require("../controllers/payment");

router.post("/paymob", initiatePaymobPayment);
router.post("/paymob/webhook", paymobWebhook);

module.exports = router;
