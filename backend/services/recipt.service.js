const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");
const { uploadBuffer } = require("../utils/uploadToImagekit");

function drawFan(ctx, cx, cy, r) {
  const colors = ['rgba(198,40,40,0.10)', 'rgba(26,35,126,0.09)', 'rgba(230,200,180,0.12)'];
  const petals = 7;
  for (let i = 0; i < petals; i++) {
    const angle = (Math.PI / (petals - 1)) * i - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.ellipse(0, -r / 2, r * 0.13, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawFanLogo(ctx, cx, cy, r) {
  const petalColors = ['#c0392b', '#c0392b', '#c0392b', '#1a237e', '#1a237e', '#1a237e', '#9e9e9e'];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI / (count - 1)) * i - Math.PI / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.fillStyle = petalColors[i];
    ctx.beginPath();
    ctx.ellipse(0, -r / 2, r * 0.18, r * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const cleanPhone = (phone = "") => {
  let cleaned = phone.replace("whatsapp:", "").replace(/\s+/g, "").replace(/-/g, "").trim();
  if (cleaned.startsWith("+92")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("92") && cleaned.length === 12) {
    cleaned = "0" + cleaned.slice(2);
  }
  return cleaned;
};

async function generateReceipt(data = {}) {
  const W = 794;
  const H = 890;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  const line = (x1, y1, x2, y2, color = '#1a237e', w = 1) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const text = (str, x, y, { size = 14, weight = 'normal', color = '#111', align = 'left', font = 'Arial' } = {}) => {
    ctx.save();
    ctx.font = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  };

  const centeredText = (str, x1, x2, y, opts = {}) => {
    const midX = (x1 + x2) / 2;
    text(str, midX, y, { ...opts, align: 'center' });
  };

  // Background
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = '#1a237e';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // Watermark
  drawFan(ctx, W / 2, 450, 260);

  // Logo / Header
  drawFanLogo(ctx, W / 2, 62, 38);
  text('DARBAR BANQUET', W / 2, 118, { size: 41, weight: 'bold', color: '#c0392b', align: 'center', font: 'Arial' });

  // R.No
  text('R.No.', 42, 186, { size: 14, weight: 'bold' });
  line(82, 190, 190, 190);
  centeredText(data.rNo || '', 82, 190, 186, { size: 15, weight: 'bold' });

  // Date
  text('Date :', 42, 220, { size: 14, weight: 'bold' });
  line(82, 224, 260, 224);
  if (data.date) centeredText(data.date, 82, 260, 220, { size: 14 });

  // Received from
  text('RECEIVED with thanks from Mr.', 42, 258, { size: 14, weight: 'bold' });
  line(292, 262, W - 42, 262);
  if (data.clientName) centeredText(data.clientName, 292, W - 42, 258, { size: 14 });

  // Resident of
  text('Resident of', 42, 294, { size: 14, weight: 'bold' });
  line(130, 298, W - 42, 298);
  if (data.resident) centeredText(data.resident, 130, W - 42, 294, { size: 14 });

  // WhatsApp & Phone
  text('WhatsApp.', 42, 328, { size: 14, weight: 'bold' });
  line(128, 332, 370, 332);
  const whatsappNum = data.whatsapp || "03002319171";
  centeredText(cleanPhone(whatsappNum), 128, 370, 328, { size: 14 });
  
  text('Phone.', 390, 328, { size: 14, weight: 'bold' });
  line(448, 332, W - 42, 332);
  const phoneNum = data.phone || "03008928058";
  centeredText(cleanPhone(phoneNum), 448, W - 42, 328, { size: 14 });

  // Reserved for Date / Day (Mapping fallback for both reservedFor and reservationDate)
  text('has been reserved for', 42, 372, { size: 14, weight: 'bold' });
  line(200, 376, 435, 376);
  const reservationDate = data.reservationDate || data.reservedFor;
  if (reservationDate) centeredText(reservationDate, 200, 435, 372, { size: 14 });
  text('Day', 445, 372, { size: 14, weight: 'bold' });
  line(475, 376, W - 42, 376);
  if (data.day) centeredText(data.day, 475, W - 42, 372, { size: 14 });

  // Function / No. of Guest
  text('Function', 42, 412, { size: 14, weight: 'bold' });
  line(106, 416, 390, 416);
  if (data.functionName) centeredText(data.functionName, 106, 390, 412, { size: 14 });
  text('No. Of Guest', 396, 412, { size: 14, weight: 'bold' });
  line(494, 416, W - 42, 416);
  if (data.noOfGuests) centeredText(data.noOfGuests, 494, W - 42, 412, { size: 14 });

  // Standardized Payment Lines Layout (Lump Sum, Advance, Balance)
  const payStartX = 120;
  const payEndX = 350;

  // Lump Sum
  text('Lump Sum', 42, 460, { size: 14, weight: 'bold' });
  line(payStartX, 464, payEndX, 464);
  if (data.lumpSum) centeredText(data.lumpSum, payStartX, payEndX, 460, { size: 14 });

  // Advance
  text('Advance', 42, 500, { size: 14, weight: 'bold' });
  line(payStartX, 504, payEndX, 504);
  if (data.advance) centeredText(data.advance, payStartX, payEndX, 500, { size: 14 });

  // Balance & Manager Block
  const rowY = 538;
  
  // Balance Row
  text('Balance', 42, rowY, { size: 14, weight: 'bold' });
  line(payStartX, rowY + 4, payEndX, rowY + 4);
  if (data.balance) centeredText(data.balance, payStartX, payEndX, rowY, { size: 14 });

  // Manager Signature Line and Label
  const lineY = rowY + 4;
  line(W - 200, lineY, W - 42, lineY);
  text('Manager', W - 121, rowY + 22, { size: 15, weight: 'bold', align: 'center' });

  try {
    const signaturePath = path.join(__dirname, "../assets/manager-signature.png");
    const signatureImg = await loadImage(signaturePath);
    const sigW = 140;
    const sigH = sigW * (signatureImg.height / signatureImg.width);
    const sigY = lineY - sigH + 16; 
    const sigX = W - 200 + ((W - 42 - (W - 200)) - sigW) / 2;
    ctx.drawImage(signatureImg, sigX, sigY, sigW, sigH);
  } catch (err) {
    console.error("Could not load manager signature:", err.message);
  }

  // Terms & Conditions
  const tcY = 578;
  ctx.save();
  ctx.fillStyle = '#c0392b';
  const pillW = 220, pillH = 28, pillX = (W - pillW) / 2, pillR = 14;
  ctx.beginPath();
  ctx.moveTo(pillX + pillR, tcY);
  ctx.lineTo(pillX + pillW - pillR, tcY);
  ctx.arcTo(pillX + pillW, tcY, pillX + pillW, tcY + pillR, pillR);
  ctx.lineTo(pillX + pillW, tcY + pillH - pillR);
  ctx.arcTo(pillX + pillW, tcY + pillH, pillX + pillW - pillR, tcY + pillH, pillR);
  ctx.lineTo(pillX + pillR, tcY + pillH);
  ctx.arcTo(pillX, tcY + pillH, pillX, tcY + pillH - pillR, pillR);
  ctx.lineTo(pillX, tcY + pillR);
  ctx.arcTo(pillX, tcY, pillX + pillR, tcY, pillR);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  text('Terms & Conditions', W / 2, tcY + 19, { size: 14, weight: 'bold', color: '#fff', align: 'center' });

  const tcItems = [
    'Advance non refundable. Balance must be paid within 48 hours prior your event.',
    'Cold drinks are strictly not allowed from outside. All drinks are available at company price\n@ Rs.1500 per crate chilled on counter. NESTLE / AQUAFINA water bottle for Rs.150 per table with service.',
    'Fresh flower stage is not included in your booking amount.',
    'Premises should be vacated before 12 a.m.',
    'No musical function is allowed without concerned authorities permission.',
    'Car parking at your own risk.',
    'Management will not be responsible for loss of any kind of property.',
  ];

  let tcLineY = tcY + 44;
  tcItems.forEach(item => {
    ctx.save();
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.arc(50, tcLineY - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const lines = item.split('\n');
    lines.forEach((l, i) => {
      text(l, 62, tcLineY + i * 17, { size: 12, color: '#111' });
    });
    tcLineY += lines.length > 1 ? 38 : 22;
  });

  // Agreement note
  text('I have read & agreed to the above terms & conditions.', 62, tcLineY + 14, { size: 12, color: '#111' });
  line(28, tcLineY + 24, W - 28, tcLineY + 24, '#c0392b', 1.5);

  // Footer (Split layout with vertical dividing line in the middle)
  const footY = tcLineY + 40;
  const midX = W / 2;

  // Vertical Divider Line in the middle of the footer
  line(midX, footY - 12, midX, footY + 36, '#c0392b', 1.5);

  // Left Side: Address
  text('D-16, Block "N" Near Sakhi Hassan,', 45, footY, { size: 12, weight: 'bold', color: '#111', align: 'left' });
  text('North Nazimabad, Karachi.', 45, footY + 18, { size: 12, weight: 'bold', color: '#111', align: 'left'	});

  // Right Side: Contact Numbers with Heading
  text('Contact Numbers:', midX + 25, footY - 2, { size: 12, weight: 'bold', color: '#c0392b', align: 'left' });
  text(`WhatsApp: 03002319171`, midX + 25, footY + 16, { size: 11, weight: 'bold', color: '#111', align: 'left' });
  text(`Phone: 03008928058`, midX + 25, footY + 31, { size: 11, weight: 'bold', color: '#111', align: 'left' });

  // Save to public folder
  const fileName = `receipt-${Date.now()}.png`;
  const buffer = canvas.toBuffer("image/png");
  const uploaded = await uploadBuffer(buffer, fileName, "/receipts");

  return { fileName, url: uploaded.url, fileId: uploaded.fileId };
}

module.exports = { generateReceipt };
