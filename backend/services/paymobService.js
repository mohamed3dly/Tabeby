const axios = require("axios");

// 1. إنشاء Order عند Paymob
exports.createPaymobOrder = async (token, amount) => {
  const response = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
    auth_token: token,
    delivery_needed: false,
    amount_cents: amount * 100,
    currency: "EGP",
    items: [],
  });
  return response.data.id;
};

// 2. توليد Payment Key
exports.generatePaymentKey = async (token, orderId, amount, billingData, integrationId) => {
  const response = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
    auth_token: token,
    amount_cents: amount * 100,
    expiration: 3600,
    order_id: orderId,
    billing_data: billingData,
    currency: "EGP",
    integration_id: integrationId,
  });

  return response.data.token;
};
