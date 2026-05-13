const client = require("../config/twilio");

const SERVICE_SID = process.env.TWILIO_CONVERSATION_SERVICE_SID;

async function createOrGetConversation(phone, userName) {
  const existing = await client
    .conversations.v1
    .services(SERVICE_SID)
    .conversations
    .list();

  const found = existing.find(c => c.friendlyName === phone);
  if (found) return found;

  const conversation = await client
    .conversations.v1
    .services(SERVICE_SID)
    .conversations
    .create({ friendlyName: phone });

  // Add WhatsApp user as participant
  await client
    .conversations.v1
    .services(SERVICE_SID)
    .conversations(conversation.sid)
    .participants
    .create({
      "messagingBinding.address": phone,
      "messagingBinding.proxyAddress": process.env.TWILIO_WHATSAPP_NUMBER,
    });

  return conversation;
}

async function addAdminToConversation(conversationSid) {
  try {
    await client
      .conversations.v1
      .services(SERVICE_SID)
      .conversations(conversationSid)
      .participants
      .create({
        "messagingBinding.address": `whatsapp:${process.env.ADMIN_PHONE}`,
        "messagingBinding.proxyAddress": process.env.TWILIO_WHATSAPP_NUMBER,
      });
  } catch (error) {
    if (error.code === 50416) {
      console.log("Admin already in conversation, skipping...");
      return;
    }
    throw error; 
  }
}

module.exports = { createOrGetConversation, addAdminToConversation };