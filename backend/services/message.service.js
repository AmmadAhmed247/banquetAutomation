const { getAllPackages } = require("../services/package.service");
const { sendMessage } = require("./twillo.service");

async function getHelpMessage() {
  return `Available commands:

BOOK: Date | Event | Package
  → Create a booking

PACKAGES
  → View all available packages

GALLERY
  → View our photo gallery

HELP
  → Show this menu`;
}

async function getPackagesMessage() {
  const packages = await getAllPackages()

  const list = packages.map(p =>
    `*${p.name}* — ${p.price}\n${p.description || ""}`
  ).join("\n\n")

  return `Our packages:\n\n${list}\n\nTo book, send:\nBOOK: Date | Event | Package`;

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
  SendMessageToUser
}