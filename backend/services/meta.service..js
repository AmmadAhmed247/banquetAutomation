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



async function sendMessage(to, message) {
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
    try {
       
        const response = await axios.post(
            `https://graph.facebook.com/v22.0/${process.env.phoneID}/messages`,
            {
                messaging_product: "whatsapp",
                to,
                type: "image", 
                image: {
                    link: mediaUrl,
                    caption: body
                }
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
  const to = phone.replace("whatsapp:+", "").replace("whatsapp:", "");
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


module.exports = {
    parseIncoming,
    sendMessage,
    sendMediaMessage,
    sendReceiptTemplate
};