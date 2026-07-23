const { getAllPackages } = require("../services/package.service");
const { sendMessage, sendMediaMessage, sendReceiptTemplate } = require("./meta.service.");
const { generateCalendarImage } = require("../services/calender.service");
const { generateReceipt } = require("./recipt.service");
const { getUserByPhone, isWithinWindow } = require("./session.service");



async function getHelpMessage() {
  return `
    🏛️ Darbar Banquet Assistant Menu
Welcome to Darbar Banquet! Please review our available commands below to get started:

📅 CALENDAR — View our real-time availability and open dates

📸 GALLERY — Browse photos of our stunning venue setups

🎧 SUPPORT — Connect directly with a human representative

❓ HELP — Display this interactive menu
  `;
}

async function getPackagesMessage() {
  const packages = await getAllPackages()

  const list = packages.map(p =>
    `*${p.name}* — ${p.price}\n${p.description || ""}`
  ).join("\n\n")

  return `Our packages:\n\n${list}\n\nTo book, send:\nBOOK: Date | Event | Package`;

}

async function getReceiptMessage(phone, data) {
  const { fileName, url } = await generateReceipt(data); 
  const mediaUrl = url;  

  const u = await getUserByPhone(phone);
  const withinWindow = isWithinWindow(u?.last_inbound_at);

  let result;
  if (withinWindow) {
    result = await sendMediaMessage(phone, "Here is your booking receipt!", mediaUrl);
  } else {
    result = await sendReceiptTemplate(phone, mediaUrl, {
      clientName: data.clientName,
      functionName: data.functionName,
      date: data.date,
    });
  }

  if (!result.success) {
    console.error("Receipt delivery failed:", result.message);
    return { success: false, fileName, error: result.message };
  }

  return { success: true, fileName, mediaUrl };
}


async function getCalendarMessage(phone, hall, year, month) {
  try {
    const { url } = await generateCalendarImage(year, month, hall);
    await sendMediaMessage(
      phone,
      `Here is ${hall}'s availability!\n\n${hall === "Hall B" ? "🔵 Blue" : "🔴 Red"} = Booked\n⚪ White = Available`,
      url 
    );
  } catch (error) {
    console.log("An Error Occurred: ", error);
  }
}


function getGalleryMessage() {
  return `View our gallery here:\nhttps://your-website.com/gallery

      Or follow us on Instagram:\nhttps://instagram.com/your-handle`
}

async function SendMessageToUser(phone, message) {
  try {
    const result = await sendMessage(phone, message)

    if (!result) {
      return {
        success: false,
        message: "Message Not Sent!"
      }
    }

    return result
  } catch (error) {
    console.log("An Error Occured While Sending Message (Service): ", error)
  }
}

module.exports = {
  getHelpMessage,
  getPackagesMessage,
  getGalleryMessage,
  SendMessageToUser,
  getCalendarMessage,
  getReceiptMessage
}