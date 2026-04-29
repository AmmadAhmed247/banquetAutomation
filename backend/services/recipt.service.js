/**
 * Darbar Banquet A & B — Receipt Canvas Renderer
 * Usage:
 *   const canvas = document.getElementById('receipt');
 *   drawDarbarReceipt(canvas, {
 *     rNo: '730',
 *     date: '01/06/2025',
 *     clientName: 'Ali Ahmed',
 *     resident: 'North Nazimabad, Karachi',
 *     telephone: '0300-1234567',
 *     reservedFor: 'Hall A',
 *     day: 'Monday',
 *     function: 'Wedding',
 *     noOfGuest: '350',
 *     lumpSum: 'Rs. 850,000',
 *     advance: 'Rs. 300,000',
 *     balance: 'Rs. 550,000',
 *   });
 */

export function drawDarbarReceipt(canvas, data = {}) {
  const ctx = canvas.getContext('2d');
  const W = 794;   // A4 width  @ 96dpi
  const H = 1050;  // A4 height @ 96dpi

  canvas.width  = W;
  canvas.height = H;

  // ── Helpers ──────────────────────────────────────────────────────────────
  const line  = (x1, y1, x2, y2, color = '#1a237e', w = 1) => {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth   = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.restore();
  };

  const text = (str, x, y, { size = 13, weight = 'normal', color = '#111', align = 'left', font = 'Arial' } = {}) => {
    ctx.save();
    ctx.font      = `${weight} ${size}px ${font}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(str, x, y);
    ctx.restore();
  };

  const fieldLine = (label, value, lx, ly, lineEndX, valueOffset = 0) => {
    text(label, lx, ly, { size: 13, weight: 'bold' });
    line(lx + valueOffset, ly + 4, lineEndX, ly + 4);
    if (value) text(value, lx + valueOffset + 6, ly, { size: 13 });
  };

  // ── Background ────────────────────────────────────────────────────────────
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // Outer border
  ctx.strokeStyle = '#1a237e';
  ctx.lineWidth   = 2.5;
  ctx.strokeRect(18, 18, W - 36, H - 36);

  // ── Watermark / decorative fan ───────────────────────────────────────────
  drawFan(ctx, W / 2, 480, 260);

  // ── Logo / Header ─────────────────────────────────────────────────────────
  drawFanLogo(ctx, W / 2, 62, 38);

  text('DARBAR BANQUET', W / 2, 118, { size: 38, weight: 'bold', color: '#c0392b', align: 'center', font: 'Arial' });
  text('A & B', W / 2, 150, { size: 24, weight: 'bold', color: '#1a237e', align: 'center', font: 'Arial' });

  // ── R.No + Tel ────────────────────────────────────────────────────────────
  text('R.No.', 42, 186, { size: 13, weight: 'bold' });
  line(82, 190, 190, 190);
  text(data.rNo || '', 90, 186, { size: 14, weight: 'bold' });
  text('Tel:021-36641326, 021-36641327', W / 2 + 20, 186, { size: 12, color: '#c0392b', weight: 'bold' });

  // ── Date ──────────────────────────────────────────────────────────────────
  text('Date :', 42, 220, { size: 13, weight: 'bold' });
  line(82, 224, 260, 224);
  if (data.date) text(data.date, 90, 220, { size: 13 });

  // ── Received from ─────────────────────────────────────────────────────────
  text('RECEIVED with thanks from Mr.', 42, 258, { size: 13, weight: 'bold' });
  line(292, 262, W - 42, 262);
  if (data.clientName) text(data.clientName, 298, 258, { size: 13 });

  // ── Resident of ───────────────────────────────────────────────────────────
  text('Resident of', 42, 294, { size: 13, weight: 'bold' });
  line(130, 298, W - 42, 298);
  if (data.resident) text(data.resident, 136, 294, { size: 13 });

  // ── Telephone ─────────────────────────────────────────────────────────────
  line(42, 332, 290, 332);
  text('Telephone#.', 296, 328, { size: 13, weight: 'bold' });
  line(390, 332, W - 42, 332);
  if (data.telephone) text(data.telephone, 396, 328, { size: 13 });

  // ── Has been reserved for / Day ───────────────────────────────────────────
  text('has been reserved for', 42, 372, { size: 13, weight: 'bold' });
  line(200, 376, 480, 376);
  if (data.reservedFor) text(data.reservedFor, 206, 372, { size: 13 });
  text('Day', 490, 372, { size: 13, weight: 'bold' });
  line(518, 376, W - 42, 376);
  if (data.day) text(data.day, 524, 372, { size: 13 });

  // ── Function / No. of Guest ───────────────────────────────────────────────
  text('Function', 42, 412, { size: 13, weight: 'bold' });
  line(106, 416, 390, 416);
  if (data.function) text(data.function, 112, 412, { size: 13 });
  text('No. Of Guest', 396, 412, { size: 13, weight: 'bold' });
  line(494, 416, W - 42, 416);
  if (data.noOfGuest) text(data.noOfGuest, 500, 412, { size: 13 });

  // ── Lump Sum / Manager ────────────────────────────────────────────────────
  text('Lump Sum', 42, 460, { size: 13, weight: 'bold' });
  line(120, 464, 480, 464);
  if (data.lumpSum) text(data.lumpSum, 126, 460, { size: 13 });
  text('Manager', W - 130, 460, { size: 13, weight: 'bold' });
  line(W - 200, 476, W - 42, 476);

  // ── Advance ───────────────────────────────────────────────────────────────
  text('Advance', 42, 500, { size: 13, weight: 'bold' });
  line(106, 504, 300, 504);
  if (data.advance) text(data.advance, 112, 500, { size: 13 });

  // ── Balance ───────────────────────────────────────────────────────────────
  text('Balance', 42, 538, { size: 13, weight: 'bold' });
  line(100, 542, 300, 542);
  if (data.balance) text(data.balance, 106, 538, { size: 13 });

  // ── Terms & Conditions ────────────────────────────────────────────────────
  const tcY = 572;
  // Red pill background
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
  text('Terms & Conditions', W / 2, tcY + 19, { size: 13, weight: 'bold', color: '#fff', align: 'center' });

  // TC bullet points
  const bullet = '#c0392b';
  const tcItems = [
    'Advance non refundable. Balance must be paid within 48 hours prior your event.',
    'Cold drinks are strictly not allowed from outside. All drinks are available at company price\n@ Rs.1200 per crate chilled on counter. NESTLE / AQUAFINA water bottle for Rs.150 per table with service.',
    'Fresh flower stage is not included in your booking amount.',
    'Premises should be vacated before 12 a.m.',
    'No musical function is allowed without concerned authorities permission.',
    'Car parking at your own risk.',
    'Management will not be responsible for loss of any kind of property.',
  ];

  let tcLineY = tcY + 44;
  tcItems.forEach(item => {
    // Orange bullet circle
    ctx.save();
    ctx.fillStyle = bullet;
    ctx.beginPath();
    ctx.arc(50, tcLineY - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Handle multi-line items
    const lines = item.split('\n');
    lines.forEach((l, i) => {
      text(l, 62, tcLineY + i * 17, { size: 11, color: '#111' });
    });
    tcLineY += lines.length > 1 ? 38 : 22;
  });

  // Signature of Party
  text('Signature of Party', W - 180, tcLineY - 4, { size: 12, weight: 'bold', color: '#c0392b' });
  line(W - 190, tcLineY + 2, W - 42, tcLineY + 2, '#c0392b', 1.5);

  // "I have read & agreed..."
  text('I have read & agreed to the above terms & conditions.', 62, tcLineY + 16, { size: 11, color: '#111' });

  // Bottom red separator line
  line(28, tcLineY + 28, W - 28, tcLineY + 28, '#c0392b', 1.5);

  // ── Footer Address ────────────────────────────────────────────────────────
  const footY = tcLineY + 52;
  text('D-16, Block "N" Near Sakhi Hassan,', W / 2, footY, { size: 13, weight: 'bold', color: '#111', align: 'center' });
  text('North Nazimabad, Karachi.', W / 2, footY + 20, { size: 13, weight: 'bold', color: '#111', align: 'center' });
}

// ── Internal: decorative fan watermark ───────────────────────────────────────
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

// ── Internal: small fan logo at top ──────────────────────────────────────────
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