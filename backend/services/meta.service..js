// services/meta.service.js
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

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
        const messageId = response.data.messages?.[0]?.id;
        return { success: true, data: response.data, messageId };
    } catch (error) {
        console.log("Error sending Meta media message:", error.response?.data || error.message);
        return { success: false, message: error.response?.data || error.message };
    }
}

async function sendReceiptTemplate(phone, mediaUrl, { clientName, functionName, date }) {
  const to = normalizePakistaniNumber(phone);
  try {
    const mediaId = await uploadMediaFromUrl(mediaUrl);
    console.log(`[RECEIPT] Uploaded media, id=${mediaId} at ${Date.now()}`);

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
            { type: "header", parameters: [{ type: "image", image: { id: mediaId } }] },
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

    const messageId = response.data.messages?.[0]?.id;
    console.log(`[RECEIPT] Meta accepted, messageId=${messageId} at ${Date.now()}`);

    return { success: true, data: response.data, messageId };
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

async function sendVoiceCallFollowup(to, languageCode = "en") {
    to = normalizePakistaniNumber(to);
    try {
        const res = await axios.post(
            `https://graph.facebook.com/v20.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: "voice_call_followup_v1",
                    language: { code: languageCode },
                    components: []
                }
            },
            { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
        );
        return { success: true, data: res.data };
    } catch (error) {
        console.error("Voice Call Followup Error:", JSON.stringify(error.response?.data, null, 2));
        return { success: false, error: error.response?.data || error.message };
    }
}
async function uploadMedia(filePath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));
  form.append("messaging_product", "whatsapp");
  form.append("type", "image/jpeg"); // fixed: was "image/jpg" which is not a valid MIME type

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${process.env.phoneID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.id;
}
async function uploadMediaFromUrl(remoteUrl, mimeType = "image/jpeg") {
  const imageResponse = await axios.get(remoteUrl, { responseType: "stream" });

  const contentType = imageResponse.headers["content-type"];
  if (!contentType || !contentType.startsWith("image/")) {
    throw new Error(`Expected image, got content-type: ${contentType}`);
  }

  const form = new FormData();
  form.append("file", imageResponse.data, { filename: "receipt.jpg" });
  form.append("messaging_product", "whatsapp");
  form.append("type", mimeType);

  const response = await axios.post(
    `https://graph.facebook.com/v22.0/${process.env.phoneID}/media`,
    form,
    {
      headers: {
        Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        ...form.getHeaders(),
      },
    }
  );

  return response.data.id;
}

let cachedPromoMediaId = null;
let cachedAt = null;
const MEDIA_ID_TTL_MS = 1000 * 60 * 60 * 24; 

async function getPromoMediaId() {
  const isStale = !cachedPromoMediaId || (Date.now() - cachedAt) > MEDIA_ID_TTL_MS;
  if (isStale) {
    cachedPromoMediaId = await uploadMedia("./assets/promo.jpg");
    cachedAt = Date.now();
  }
  return cachedPromoMediaId;
}

async function sendZeappPromoTemplate(phone) {
  const to = normalizePakistaniNumber(phone);
  try {
    const mediaId = await getPromoMediaId();

    const response = await axios.post(
      `https://graph.facebook.com/v22.0/${process.env.phoneID}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: "zeapp",
          language: { code: "en" },
          components: [
            {
              type: "header",
              parameters: [{ type: "image", image: { id: mediaId } }],
            },
          ],
        },
      },
      { headers: { Authorization: `Bearer ${process.env.ACCESS_TOKEN}` } }
    );

    return { success: true, data: response.data };
  } catch (error) {
    console.log("Error sending Zeapp promo template:", error.response?.data || error.message);

    // If the cached media_id ever goes stale on Meta's side, clear it so next call re-uploads
    if (error.response?.data?.error?.code === 100) {
      cachedPromoMediaId = null;
    }

    return { success: false, message: error.response?.data || error.message };
  }
}
async function sendCashflowSummaryTemplate(to, imageUrl, languageCode = "en") {
    to = typeof normalizePakistaniNumber === "function" ? normalizePakistaniNumber(to) : to.replace(/\D/g, "");

    try {
        const res = await axios.post(
            `https://graph.facebook.com/v20.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: {
                    name: "cashflow",
                    language: { code: languageCode },
                    components: [
                        {
                            type: "header",
                            parameters: [
                                {
                                    type: "image",
                                    image: {
                                        link: imageUrl
                                    }
                                }
                            ]
                        }
                    ]
                }
            },
            { 
                headers: { 
                    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
                    "Content-Type": "application/json"
                } 
            }
        );

        return { success: true, data: res.data };
    } catch (error) {
        console.error("Cashflow Summary Template Error:", JSON.stringify(error.response?.data, null, 2));
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
    sendVoiceCallFollowup,
    sleep,
    sendZeappPromoTemplate,
    sendCashflowSummaryTemplate
};