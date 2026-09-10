const { getAllPackages } = require("../services/package.service");
const {
  sendMessage,
  sendMediaMessage,
  sendReceiptTemplate,
  sendZeappPromoTemplate,
  sleep
} = require("./meta.service.");
const { generateCalendarImage } = require("../services/calender.service");
const { generateReceipt } = require("./recipt.service");
const { getUserByPhone, isWithinWindow } = require("./session.service");
const { waitForDeliveryStatus } = require("./messageStatus.service");

const PRICING = {
  1: [ // January
    { start: 1, end: 10, price: 350000 },
    { start: 11, end: 31, price: 240000 },
  ],
  2: [ // February
    { start: 1, end: 28, price: 140000 },
  ],
  3: [ // March (only 13-31 specified)
    { start: 13, end: 31, price: 240000 },
  ],
  4: [ // April
    { start: 1, end: 30, price: 240000 },
  ],
  5: [ // May
    { start: 1, end: 16, price: 150000 },
    { start: 17, end: 31, price: 250000 },
  ],
  6: [ // June
    { start: 1, end: 10, price: 250000 },
    { start: 11, end: 30, price: 160000 },
  ],
  7: [ // July
    { start: 1, end: 31, priceMin: 200000, priceMax: 250000 },
  ],
  8: [ // August
    { start: 1, end: 31, priceMin: 200000, priceMax: 250000 },
  ],
  9: [ // September
    { start: 1, end: 30, priceMin: 200000, priceMax: 250000 },
  ],
  10: [ // October
    { start: 1, end: 31, priceMin: 200000, priceMax: 250000 },
  ],
  11: [ // November
    { start: 1, end: 30, priceMin: 200000, priceMax: 250000 },
  ],
  12: [ // December
    { start: 1, end: 19, price: 250000 },
    { start: 20, end: 31, price: 350000 },
  ],
};

const monthNames = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function formatRangeLine(r) {
  const dateLabel = r.start === r.end ? `${r.start}` : `${r.start}–${r.end}`;

  if (r.priceMin != null && r.priceMax != null) {
    return `• ${dateLabel}: Starting from Rs. ${r.priceMin.toLocaleString("en-PK")}/-`;
  }
  return `• ${dateLabel}: Starting From Rs. ${r.price.toLocaleString("en-PK")}/- onwards`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function getMonthPriceMessage(month) {
  const ranges = PRICING[month];
  const monthName = capitalize(monthNames[month - 1]);

  if (!ranges || ranges.length === 0) {
    return `💰 *Pricing for ${monthName}*\nPlease contact us for pricing details for this month.`;
  }

  const lines = ranges.map(formatRangeLine);
  return [`💰 *Pricing for ${monthName}*`, ...lines].join("\n");
}

async function getHelpMessage() {
  return `
Darbar Banquet Assistant Menu
Welcome to Darbar Banquet! Please review our available commands below to get started:

CALENDAR — View our real-time availability and open dates

GALLERY — Browse photos of our stunning venue setups

SUPPORT — Connect directly with a human representative

HELP — Display this interactive menu
  `;
}

async function getPackagesMessage() {
  const packages = await getAllPackages();

  const list = packages.map(p =>
    `*${p.name}* — ${p.price}\n${p.description || ""}`
  ).join("\n\n");

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

  console.log(`[RECEIPT-FLOW] Receipt sent, messageId=${result.messageId}`);

  if (result.messageId) {
    const waitResult = await waitForDeliveryStatus(result.messageId, {
      targetStatuses: ["delivered", "read"],
      timeoutMs: 8000,
    });
    console.log(`[RECEIPT-FLOW] Wait result:`, waitResult);
  } else {
    console.warn("[RECEIPT-FLOW] No messageId returned, falling back to sleep");
    await sleep(2000);
  }

  const promoResult = await sendZeappPromoTemplate(phone);

  if (!promoResult.success) {
    console.warn("Zeapp promo template delivery failed:", promoResult.message);
  }

  return { success: true, fileName, mediaUrl, promoResult };
}

async function getCalendarMessage(phone, hall, year, month) {
  try {
    const { url } = await generateCalendarImage(year, month, hall);
    const priceMessage = getMonthPriceMessage(month);

    const caption = [
      `Here is ${hall}'s availability!`,
      "",
      `${hall === "Hall B" ? "🔴 Red" : "🔵 Blue"} = Booked \n⚪ White = Available`,
      "",
      priceMessage,
    ].join("\n");

    await sendMediaMessage(phone, caption, url);
    await sleep(10000);
    return await sendMessage(phone, `Type *HELP* to show the menu or *SWITCH* to change halls.`);
  } catch (error) {
    console.log("An Error Occurred: ", error);
  }
}

function getGalleryMessage() {
  return `View our gallery here:\nhttps://your-website.com/gallery

      Or follow us on Instagram:\nhttps://instagram.com/your-handle`;
}

async function SendMessageToUser(phone, message) {
  try {
    const result = await sendMessage(phone, message);

    if (!result) {
      return {
        success: false,
        message: "Message Not Sent!"
      };
    }

    return result;
  } catch (error) {
    console.log("An Error Occurred While Sending Message (Service): ", error);
  }
}

function getAllPricingMessage() {
  const lines = ["💰 *Darbar Banquet — Full Year Pricing*", ""];

  for (let month = 1; month <= 12; month++) {
    const ranges = PRICING[month];
    const monthName = capitalize(monthNames[month - 1]);

    if (!ranges || ranges.length === 0) {
      lines.push(`*${monthName}*`);
      lines.push(`Please contact us for pricing details.`);
      lines.push("");
      continue;
    }

    lines.push(`*${monthName}*`);
    ranges.forEach((r) => lines.push(formatRangeLine(r)));
    lines.push("");
  }

  return lines.join("\n").trim();
}

module.exports = {
  getHelpMessage,
  getPackagesMessage,
  getGalleryMessage,
  SendMessageToUser,
  getCalendarMessage,
  getReceiptMessage,
  getMonthPriceMessage,
  getAllPricingMessage
};