const { getReceiptMessage } = require("../services/message.service")


async function SendReceiptMessage(req, res) {
  try {
    const {
      rNo,
      date,
      clientName,
      resident,
      whatsapp,
      phone,
      reservedFor,
      day,
      functionName,
      noOfGuests,
      lumpSum,
      advance,
      balance,
    } = req.body;

    const fields = [
      rNo,
      date,
      clientName,
      resident,
      whatsapp,
      phone,
      reservedFor,
      day,
      functionName,
      noOfGuests,
      lumpSum,
      advance,
      balance,
    ];

    if (fields.some((f) => f === undefined || f === null || f === "")) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const formattedWhatsapp = whatsapp.startsWith("whatsapp:")
      ? whatsapp
      : `whatsapp:+${whatsapp.replace(/\D/g, "").replace(/^0/, "92")}`;

    const receipt = await getReceiptMessage(formattedWhatsapp, {
      rNo,
      date,
      clientName,
      resident,
      whatsapp: formattedWhatsapp,
      phone,
      reservedFor,
      day,
      functionName,
      noOfGuests,
      lumpSum,
      advance,
      balance,
    });
    if (!receipt.success) {
      return res.status(502).json({
        success: false,
        message: "Failed to send WhatsApp message",
        error: receipt.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Receipt Sent Successfully",
      receipt,
    });
  } catch (error) {
    console.log("Error Occurred:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

module.exports = {
  SendReceiptMessage,
};