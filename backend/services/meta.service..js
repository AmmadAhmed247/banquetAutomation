// services/meta.service.js
const axios = require("axios");

function parseIncoming(req) {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) return null; 

    return {
        phone: message.from, 
        body: message.text?.body?.trim() || "",
        name: contact?.profile?.name || null,
        messageId: message.id
    };
}

function normalizePakistaniNumber(phone) {
    // strip anything that isn't a digit
    let digits = String(phone).replace(/\D/g, "");

    // strip leading 0 (local format: 03XXXXXXXXX)
    if (digits.startsWith("0")) {
        digits = digits.slice(1);
    }

    // strip 92 if someone already added it, so we don't double it up
    if (digits.startsWith("92")) {
        digits = digits.slice(2);
    }

    // now digits should be 10 digits like 3XXXXXXXXX
    return `92${digits}`;
}

async function sendMessage(to, message) {
    to = normalizePakistaniNumber(to);
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "text",
                text: { body: message }
            },
            { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.log("Error sending Meta message:", error.response?.data || error.message);
        return { success: false, message: error.response?.data || error.message };
    }
}

async function sendMediaMessage(to, body, mediaUrl) {
    to = normalizePakistaniNumber(to);
    try {
        const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "image",
                image: { link: mediaUrl, caption: body }
            },
            { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.log("Error sending Meta media message:", error.response?.data || error.message);
        return { success: false, message: error.response?.data || error.message };
    }
}

async function sendReceiptTemplate(phone, mediaUrl, { clientName, functionName, date }) {
  const to = normalizePakistaniNumber(phone); // replaces the old whatsapp:+ strip logic
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.phoneID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "receipt2",
          language: { code: "en" },
          components: [
            { type: "header", parameters: [{ type: "image", image: { link: mediaUrl } }] },
            {
              type: "body",
              parameters: [
                { type: "text", text: clientName },
                { type: "text", text: functionName },
                { type: "text", text: date }
              ]
            }
          ]
        }
      },
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    console.log("Error sending receipt template:", error.response?.data || error.message);
    return { success: false, message: error.response?.data || error.message };
  }
}

async function sendBookingReminder(to, languageCode, clientName, eventName, eventDate, venue) {
    to = normalizePakistaniNumber(to);
    try {
        const res = await axios.post(
            `https://graph.facebook.com/v20.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: "booking_reminder_v1",
                    language: { code: languageCode },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: String(clientName) },
                                { type: "text", text: String(eventName) },
                                { type: "text", text: String(eventDate) },
                                { type: "text", text: String(venue) }
                            ]
                        }
                    ]
                }
            },
            { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
        );
        return { success: true, data: res.data };
    } catch (error) {
        console.error("Booking Reminder Error:", JSON.stringify(error.response?.data, null, 2));
        return { success: false, error: error.response?.data || error.message };
    }
}

async function sendAdvanceReminder(to, languageCode, clientName, eventName, remainingBalance) {
    to = normalizePakistaniNumber(to);
    try {
        const res = await axios.post(
            `https://graph.facebook.com/v20.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: "advance_due_v1",
                    language: { code: languageCode },
                    components: [
                        {
                            type: "body",
                            parameters: [
                                { type: "text", text: String(clientName) },
                                { type: "text", text: String(eventName) },
                                { type: "text", text: String(remainingBalance) }
                            ]
                        }
                    ]
                }
            },
            { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
        );
        return { success: true, data: res.data };
    } catch (error) {
        console.error("Advance Reminder Error:", JSON.stringify(error.response?.data, null, 2));
        return { success: false, error: error.response?.data || error.message };
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    parseIncoming,
    normalizePakistaniNumber, 
    sendBookingReminder,
    sendAdvanceReminder,
    sendMessage,
    sendMediaMessage,
    sendReceiptTemplate,
    sleep
};