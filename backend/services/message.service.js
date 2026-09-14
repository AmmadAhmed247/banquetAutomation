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
  "Hall A": {
    1: [ // January
      { start: 1, end: 10, price: 350000 },
      { start: 11, end: 31, price: 240000 },
    ],
    2: [{ start: 1, end: 28, price: 140000 }], // February
    3: [{ start: 13, end: 31, price: 240000 }], // March
    4: [{ start: 1, end: 30, price: 240000 }], // April
    5: [ // May
      { start: 1, end: 16, price: 150000 },
      { start: 17, end: 31, price: 250000 },
    ],
    6: [ // June
      { start: 1, end: 10, price: 250000 },
      { start: 11, end: 30, price: 160000 },
    ],
    7: [{ start: 1, end: 31, priceMin: 200000, priceMax: 250000 }],  // July (estimated)
    8: [{ start: 1, end: 31, priceMin: 200000, priceMax: 250000 }],  // August (estimated)
    9: [{ start: 1, end: 30, priceMin: 200000, priceMax: 250000 }],  // September (estimated)
    10: [{ start: 1, end: 31, priceMin: 200000, priceMax: 250000 }], // October (estimated)
    11: [{ start: 1, end: 30, priceMin: 200000, priceMax: 250000 }], // November (estimated)
    12: [ // December
      { start: 1, end: 19, price: 250000 },
      { start: 20, end: 31, price: 350000 },
    ],
  },

  "Hall B": {
    1: [ // January
      { start: 1, end: 10, price: 350000 },
      { start: 11, end: 31, price: 65000 },
    ],
    2: [{ start: 1, end: 28, price: 50000 }], // February
    3: [{ start: 13, end: 31, price: 60000 }], // March
    4: [{ start: 1, end: 30, price: 60000 }], // April
    5: [ // May
      { start: 1, end: 16, price: 50000 },
      { start: 17, end: 31, price: 75000 },
    ],
    6: [ // June
      { start: 1, end: 10, price: 65000 },
      { start: 11, end: 30, price: 50000 },
    ],
    7: [{ start: 1, end: 31, priceMin: 35000, priceMax: 50000 }],  // July (estimated)
    8: [{ start: 1, end: 31, priceMin: 35000, priceMax: 50000 }],  // August (estimated)
    9: [{ start: 1, end: 30, price: 35000 }],  // September
    10: [{ start: 1, end: 31, price: 50000 }], // October
    11: [{ start: 1, end: 30, price: 60000 }], // November
    12: [ // December
      { start: 1, end: 19, price: 60000 },
      { start: 20, end: 31, price: 70000 },
    ],
  },
};

const monthNames = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

function formatRangeLine(r) {
  if (r.priceMin != null && r.priceMax != null) {
    return `- Starting from Rs. ${r.priceMin.toLocaleString("en-PK")}/- onwards`;
  }
  return `- Starting from Rs. ${r.price.toLocaleString("en-PK")}/- onwards`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


function getMonthPriceMessage(hall, month) {
  const ranges = PRICING[hall]?.[month];
  const monthName = capitalize(monthNames[month - 1]);

  if (!ranges || ranges.length === 0) {
    return (
      `💰 *Pricing for ${monthName} (${hall})*\n` +
      `Please contact us for pricing details for this month.\n\n` +
      `Type *MENU* to return to the main menu.`
    );
  }

  const allPrices = ranges.map((r) => (r.priceMin != null ? r.priceMin : r.price));
  const lowestPrice = Math.min(...allPrices);

  return (
    `*Pricing for ${monthName} (${hall})*\n` +
    `- Starting from Rs. ${lowestPrice.toLocaleString("en-PK")}/- onwards\n\n` +
    `Type *MENU* to return to the main menu.`
  );
}

function parseMonthYearInput(input) {
  const cleaned = input.trim().toLowerCase();
  const parts = cleaned.split(/\s+/);

  let monthNum = null;
  let yearNum = null;

  for (const part of parts) {
    const asNumber = parseInt(part, 10);

    if (!isNaN(asNumber)) {
      if (asNumber >= 1 && asNumber <= 12 && monthNum === null && parts.length === 1) {
        monthNum = asNumber;
      } else if (asNumber >= 1900 && asNumber <= 2100) {
        yearNum = asNumber;
      }
    } else {
      const idx = monthNames.indexOf(part);
      if (idx !== -1) monthNum = idx + 1;
    }
  }

  return { monthNum, yearNum };
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
    const priceMessage = getMonthPriceMessage(hall, month);

    const caption = [
      `Here is ${hall}'s availability!`,
      "",
      `${hall === "Hall B" ? "🔴 Red" : "🔵 Blue"} = Booked \n⚪ White = Available`,
      "",
      priceMessage,
    ].join("\n");

    await sendMediaMessage(phone, caption, url);
    await sleep(10000);
    return
  } catch (error) {
    console.log("An Error Occurred: ", error);
    return sendMessage(phone, "Please choose a valid option.");
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

module.exports = {
  getHelpMessage,
  getGalleryMessage,
  SendMessageToUser,
  getCalendarMessage,
  getReceiptMessage,
  getMonthPriceMessage,
  parseMonthYearInput
};