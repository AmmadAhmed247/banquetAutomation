const { getAllPackages } = require("../services/package.service");
const { sendMessage, sendMediaMessage } = require("../services/twillo.service");
const { generateCalendarImage } = require("../services/calender.service");
const { generateReceipt } = require("./recipt.service");


async function getHelpMessage() {
  return `Available commands:\n\nCALENDAR - View availability\nPACKAGES - View our packages\nGALLERY - View our gallery\nBOOK: Date | Event | Package - Create a booking\nSUPPORT - Talk to a human\nHELP - Show this menu`;
}

async function getPackagesMessage() {
  const packages = await getAllPackages()

  const list = packages.map(p =>
    `*${p.name}* — ${p.price}\n${p.description || ""}`
  ).join("\n\n")

  return `Our packages:\n\n${list}\n\nTo book, send:\nBOOK: Date | Event | Package`;

}

async function getReceiptMessage(phone, data) {
  const { fileName } = generateReceipt(data);

  console.log("Receipt generated:", fileName);

  const mediaUrl = `${process.env.BASE_URL}/public/${fileName}`;

  await sendMediaMessage(
    phone,
    "Here is your booking receipt!",
    mediaUrl
  );

  return {
    success: true,
    fileName,
  };
}

async function getCalendarMessage(phone) {
  try {
    const now = new Date();
  await generateCalendarImage(now.getFullYear(), now.getMonth() + 1);

  await sendMediaMessage(
    phone,
    "Here is our availability for this month!\n\n🔴 Red = Booked\n⚪ White = Available\n",
    `${process.env.BASE_URL}/public/calendar.png`
  );
  } catch (error) {
    console.log("An Error Occured: ", error)
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