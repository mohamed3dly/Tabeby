// const axios = require("axios");

// // 1. إنشاء Order عند Paymob
// exports.createPaymobOrder = async (token, amount, merchantOrderId) => {
//   const response = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
//     auth_token: token,
//     delivery_needed: false,
//     amount_cents: amount * 100,
//     currency: "EGP",
//     items: [],
//     merchant_order_id: merchantOrderId, // 👈 مهم تربطيه بالـ Booking
//   });
//   return response.data.id;
// };
// // 2. توليد Payment Key
// exports.generatePaymentKey = async (token, orderId, amount, billingData, integrationId) => {
//   const response = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
//     auth_token: token,
//     amount_cents: amount * 100,
//     expiration: 3600,
//     order_id: orderId,
//     billing_data: billingData,
//     currency: "EGP",
//     integration_id: integrationId,
//   });

//   return response.data.token;
// };
const axios = require("axios");
const crypto = require("crypto");

exports.createPaymobOrder = async (token, amount, merchantOrderId) => {
  const response = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
    auth_token: token,
    delivery_needed: false,
    amount_cents: amount * 100,
    currency: "EGP",
    items: [],
    merchant_order_id: merchantOrderId, // 👈 مهم تربطيه بالـ Booking
  });
  return response.data.id;
};

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

exports.verifyHmac = (data, hmacSecret) => {
  const keys = [
    "amount_cents","created_at","currency","error_occured","has_parent_transaction",
    "id","integration_id","is_3d_secure","is_auth","is_capture","is_refunded",
    "is_standalone_payment","is_voided","order.id","owner","pending",
    "source_data.pan","source_data.sub_type","source_data.type","success"
  ];

  const concatStr = keys.map(k => {
    const [a,b] = k.split(".");
    return b ? data?.[a]?.[b] || "" : data?.[a] || "";
  }).join("");

  return crypto.createHmac("sha512", hmacSecret).update(concatStr).digest("hex");
};
