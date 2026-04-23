const { getAllPackages } = require("../services/package.service")

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

module.exports = {
    getHelpMessage,
    getPackagesMessage,
    getGellaryMessage
}