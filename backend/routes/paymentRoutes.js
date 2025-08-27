const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const axios = require("axios");

// const { initiatePaymobPayment, paymobWebhook  } = require("../controllers/payment");

// router.post("/paymob", initiatePaymobPayment);
// router.post("/paymob/webhook", paymobWebhook);

// module.exports = router;
const { initiatePayment, handleCallback } = require("../controllers/payment");

router.post("/paymob",authMiddleware, initiatePayment);
router.post("/paymob/webhook",authMiddleware, handleCallback);

router.get("/paymob/test", async (req, res) => {
  try {
    const auth = await axios.post("https://accept.paymob.com/api/auth/tokens", {
      api_key: process.env.PAYMOB_API_KEY,
    });
    console.log("✅ AUTH OK:", auth.data);

    const order = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
      auth_token: auth.data.token,
      delivery_needed: false,
      amount_cents: 5000,
      currency: "EGP",
      merchant_order_id: "test-123",
      items: [],
    });
    console.log("✅ ORDER OK:", order.data);

    const paymentKey = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
      auth_token: auth.data.token,
      amount_cents: 5000,
      expiration: 3600,
      order_id: order.data.id,
      currency: "EGP",
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
      billing_data: {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        phone_number: "01000000000",
        apartment: "NA", floor: "NA", street: "NA", building: "NA",
        city: "Cairo", country: "EG", state: "Cairo",
      },
    });
    console.log("✅ PAYMENT KEY OK:", paymentKey.data);

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey.data.token}`;

    res.json({ iframeUrl });
  } catch (err) {
    console.error("❌ STEP FAILED:", err.response?.status, err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

module.exports = router;
